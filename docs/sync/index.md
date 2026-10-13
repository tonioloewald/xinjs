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
