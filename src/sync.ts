/*{"parent": "managing-state", "order": 6, "title": "Network Sync", "description": "sync() synchronizes tosijs state across the network in real-time via a pluggable transport (websocket, fetch, or your own)."}*/
/*#
# Network Sync (sync)

`sync()` synchronizes state across the network in real-time. Pass it a
transport, options, and boxed proxies from `tosi()` — local changes are
throttled and sent as batched deltas, and inbound messages from other
clients are applied to the local state automatically.

```
import { tosi, sync } from 'tosijs'

const { game } = tosi({
  game: { players: {}, ball: { x: 0, y: 0 } }
})

const ws = new WebSocket('wss://my-server.example/sync')

const { disconnect } = await sync(
  websocketTransport(ws),
  { throttleInterval: 50 },
  game
)

// Later, to disconnect:
disconnect()
```

## Transport interface

`sync()` is transport-agnostic. You provide an object that satisfies
`SyncTransport`:

    interface SyncTransport {
      send(messages: SyncMessage[]): void
      onReceive(handler: (messages: SyncMessage[]) => void): void
      connect(): Promise<void> | void
      disconnect(): void
    }

`send()` should **throw** if it cannot deliver the batch (e.g. the socket
is not open). `sync()` catches the throw and requeues the deltas for the
next flush, so nothing is lost across a transient disconnect. A transport
whose `send()` silently no-ops when it can't deliver (like the sketch
below, guarding on `readyState`) will drop those deltas instead — prefer
throwing, or buffer inside the transport.

    interface SyncMessage {
      path: string
      value: any
    }

Messages are **batched** — `send()` receives an array of accumulated
deltas flushed at the throttle interval, and `onReceive()` delivers
batches from the server.

## WebSocket transport helper

```
function websocketTransport(ws) {
  let handler = null
  let pingInterval = null

  return {
    connect() {
      return new Promise((resolve, reject) => {
        if (ws.readyState === WebSocket.OPEN) return resolve()
        ws.addEventListener('open', () => resolve(), { once: true })
        ws.addEventListener('error', reject, { once: true })
      })
    },
    send(messages) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(messages))
      }
    },
    onReceive(h) {
      handler = h
      ws.addEventListener('message', (event) => {
        handler(JSON.parse(event.data))
      })
      // Keep alive: send empty batch periodically so the server
      // knows we're still here (see idleTimeout in sync-server.ts)
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send('[]')
      }, 15000)
    },
    disconnect() {
      clearInterval(pingInterval)
      ws.close()
    },
  }
}
```

## Firebase Realtime Database transport

For Firebase, implement `SyncTransport` using `onValue` for inbound
and `update` for outbound. This is a sketch — adapt to your data model:

```
import { ref, onValue, update } from 'firebase/database'

function firebaseTransport(db, rootPath) {
  let handler = null
  let unsubscribe = null

  return {
    connect() {
      const dbRef = ref(db, rootPath)
      unsubscribe = onValue(dbRef, (snapshot) => {
        const data = snapshot.val()
        if (data && handler) {
          // Convert Firebase snapshot to SyncMessage[]
          const messages = Object.entries(data).map(
            ([path, value]) => ({ path, value })
          )
          handler(messages)
        }
      })
    },
    send(messages) {
      const updates = {}
      for (const msg of messages) {
        updates[`${rootPath}/${msg.path}`] = msg.value
      }
      update(ref(db), updates)
    },
    onReceive(h) { handler = h },
    disconnect() { if (unsubscribe) unsubscribe() },
  }
}
```

## Server architecture

The transport carries `SyncMessage[]` arrays. The **server** decides:

- **Broadcasting**: relay deltas to other connected clients
- **Persistence**: store state for snapshot-on-connect
- **Conflict resolution**: last-write-wins, server timestamps, or
  custom logic — `sync()` is conflict-agnostic

For most realistic applications, use a custom socket server as the
single source of truth. See `examples/sync-server.ts` for a minimal
Bun WebSocket relay server.

## API

    sync(
      transport: SyncTransport,
      options: SyncOptions,
      ...proxies: (BoxedProxy | string)[]
    ): Promise<{ disconnect: () => void }>

**SyncOptions:**

- `throttleInterval` — outbound batch interval in ms (default: 100)

The returned `disconnect()` removes all observers and calls
`transport.disconnect()`.
*/

import { registry } from './registry'
import { getByPath, setByPath } from './by-path'
import { touch, observe, unobserve, updates } from './path-listener'
import { tosiPath } from './metadata'
import { throttle } from './throttle'
import type { Listener } from './path-listener'

export interface SyncMessage {
  path: string
  value: any
}

export interface SyncTransport {
  /** Send a batch of outbound deltas */
  send(messages: SyncMessage[]): void
  /** Register the handler for inbound message batches */
  onReceive(handler: (messages: SyncMessage[]) => void): void
  /** Open the connection */
  connect(): Promise<void> | void
  /** Close the connection */
  disconnect(): void
}

export interface SyncOptions {
  /** Outbound throttle interval in ms (default: 100) */
  throttleInterval?: number
}

// --- Helpers (same pattern as share.ts) ---

const inboundPaths = new Set<string>()

function findSyncedRoot(
  syncedPaths: Set<string>,
  changedPath: string
): string | undefined {
  for (const synced of syncedPaths) {
    if (changedPath === synced || changedPath.startsWith(synced + '.')) {
      return synced
    }
  }
  return undefined
}

function isInbound(changedPath: string): boolean {
  for (const path of inboundPaths) {
    if (changedPath === path || changedPath.startsWith(path + '.')) {
      return true
    }
  }
  return false
}

function applyInbound(path: string, value: any): void {
  inboundPaths.add(path)
  try {
    setByPath(registry, path, value)
    touch(path)
  } catch (e) {
    // A REFUSED DELTA MUST NOT POISON THE CHANNEL. The path is registered as
    // inbound BEFORE the write so the echo suppressor can recognize it; if
    // the write throws, the cleanup below was never scheduled, so the path
    // stayed in inboundPaths for the life of the page — and isInbound()
    // matches by PREFIX, so every subsequent LOCAL change to that path and
    // its whole subtree was mistaken for an echo and silently never sent.
    // One bad message killed sync for a subtree, permanently and quietly.
    // 1.8.0 made this reachable on purpose: setByPath now REFUSES unsafe path
    // segments, and a peer or server supplies those paths.
    inboundPaths.delete(path)
    console.error(
      `tosijs: refused an inbound delta at "${path}" —`,
      e,
      '(the local state is unchanged and this channel keeps working)'
    )
    return
  }
  updates().then(() => {
    inboundPaths.delete(path)
  })
}

export async function sync(
  transport: SyncTransport,
  options: SyncOptions,
  ...proxies: any[]
): Promise<{ disconnect: () => void }> {
  const syncedPaths = new Set<string>()
  const outboundBatch: SyncMessage[] = []
  const activeListeners: Listener[] = []
  const interval = options.throttleInterval ?? 100

  await transport.connect()

  // Throttled flush of accumulated outbound deltas
  const flushOutbound = throttle(() => {
    if (outboundBatch.length === 0) return
    const batch = outboundBatch.splice(0)
    try {
      transport.send(batch)
    } catch (e) {
      // A throwing send (e.g. a websocket that closed mid-flight) must not
      // silently drop the deltas — the exception is otherwise swallowed by
      // the observer callback's try/catch. Requeue at the FRONT to preserve
      // ordering; the next change (or flush) retries the whole batch.
      outboundBatch.unshift(...batch)
      console.error(
        'sync: transport.send failed; deltas requeued and will retry on the next flush',
        e
      )
    }
  }, interval)

  // Register inbound handler
  transport.onReceive((messages: SyncMessage[]) => {
    for (const msg of messages) {
      if (findSyncedRoot(syncedPaths, msg.path) === undefined) continue
      applyInbound(msg.path, msg.value)
    }
  })

  // Register outbound observers for each proxy/path
  for (const proxy of proxies) {
    const path = typeof proxy === 'string' ? proxy : tosiPath(proxy)
    if (path === undefined) {
      throw new Error(
        'sync() requires boxed proxies or string paths. Got a non-proxy value.'
      )
    }

    syncedPaths.add(path)

    const listener = observe(
      (changedPath: string) =>
        changedPath === path || changedPath.startsWith(path + '.'),
      (changedPath: string) => {
        if (isInbound(changedPath)) return
        if (findSyncedRoot(syncedPaths, changedPath) === undefined) return

        const value = getByPath(registry, changedPath)
        outboundBatch.push({ path: changedPath, value })
        flushOutbound()
      }
    )
    activeListeners.push(listener)
  }

  return {
    disconnect() {
      for (const listener of activeListeners) {
        unobserve(listener)
      }
      activeListeners.length = 0
      syncedPaths.clear()
      outboundBatch.length = 0
      transport.disconnect()
    },
  }
}
