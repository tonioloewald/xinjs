/*{ "parent": "utilities", "description": "share() synchronizes tosijs state across browser tabs and windows using BroadcastChannel and IndexedDB." }*/
/*#
# share

`share()` synchronizes state across browser tabs and windows. Pass it
boxed proxies from `tosi()` and those paths will be kept in sync via
[`BroadcastChannel`](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) and persisted to
[`IndexedDB`](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).

```
import { tosi, share } from 'tosijs'

const { app } = tosi({
  app: { user: null, settings: { theme: 'light' } }
})

const { restored } = await share(app.user, app.settings)

if (restored.length > 0) {
  // another tab had already stored state — we inherited it
}
```

> `restored` contains the arguments whose values were overwritten from the
> store. Compare by **path**, not by proxy identity — boxed proxies are
> created per access, so `restored.includes(app.user)` is `false` even when
> `app.user` *was* restored. Use `share('app.user')` with string paths, or
> `restored.map(tosiPath)`, if you need to know *which* ones.

The first tab to call `share()` seeds the store. Subsequent tabs
inherit that data, overwriting their `tosi()` defaults. After setup,
changes in any tab propagate to all others in real-time.

## What to share

Share **small, session-level state**: user identity, preferences,
auth tokens, UI mode, active selections, cache-invalidation keys.

Don't share large datasets directly. Instead, share query metadata
(URLs, cache keys, timestamps) and let each tab fetch or cache the
data independently. This keeps the sync layer fast and avoids
hitting `BroadcastChannel` or `IndexedDB` with multi-megabyte writes.

## How it works

- Changes are sent as **deltas** via `BroadcastChannel` — only the
  changed path and its value are transmitted, not the entire root
  object.
- **Persistence** uses `IndexedDB` (async, no size limit). Full
  root-path snapshots are written on a debounced schedule for
  cold-start recovery.

## API

    share(...proxiesOrPaths: (BoxedProxy | string)[]): Promise<{ restored: (BoxedProxy | string)[] }>

- Accepts boxed proxies (from `tosi()`) or string paths
- Returns `{ restored }` — the subset of arguments whose values were
  overwritten from pre-existing stored data
- Idempotent: sharing the same path twice is a no-op
- Throws if an argument is neither a proxy nor a string

To clear shared state (e.g. on logout), set the values to their
empty/default state. The change will propagate to all tabs and
persist.

## Live Demo

Drag the squares around, then click **New Window** to open a second
copy. Drag in either window and watch the other update in real-time.

```html
<div class="draggable" data-key="red"></div>
<div class="draggable" data-key="green"></div>
<div class="draggable" data-key="blue"></div>
<button class="spawn">New Window</button>
```
```css
.preview {
  touch-action: none;
  min-height: 200px;
}

.draggable {
  position: absolute;
  width: 50px;
  height: 50px;
  cursor: move;
  border-radius: 6px;
}

.draggable[data-key="red"]   { background: #f008; }
.draggable[data-key="green"] { background: #0f08; }
.draggable[data-key="blue"]  { background: #00f8; }

.spawn {
  position: absolute;
  bottom: 8px;
  right: 8px;
}
```
```js
import { tosi, share, xin } from 'tosijs'
import { trackDrag } from 'tosijs-ui'

const { squares } = tosi({
  squares: {
    red:   { x: 20,  y: 20 },
    green: { x: 120, y: 20 },
    blue:  { x: 220, y: 20 },
  }
})

await share(squares)

const draggables = [...preview.querySelectorAll('.draggable')]

function render() {
  for (const el of draggables) {
    const key = el.dataset.key
    el.style.left = xin.squares[key].x + 'px'
    el.style.top = xin.squares[key].y + 'px'
  }
}

render()
squares.observe(render)

function dragItem(event) {
  const el = event.target.closest('.draggable')
  if (!el) return
  const key = el.dataset.key
  const start = { ...xin.squares[key] }
  trackDrag(event, (dx, dy, event) => {
    xin.squares[key] = { x: start.x + dx, y: start.y + dy }
    render()
    return event.type === 'mouseup'
  })
}

preview.addEventListener('mousedown', dragItem)
preview.addEventListener('touchstart', dragItem, { passive: true })

preview.querySelector('.spawn').addEventListener('click', () => {
  window.open(location.href)
})
```
*/

import { registry } from './registry'
import { getByPath, setByPath } from './by-path'
import { touch, observe, updates } from './path-listener'
import { tosiPath } from './metadata'
import { debounce } from './throttle'

const CHANNEL_NAME = 'tosijs-share'
const DB_NAME = 'tosijs-share'
const STORE_NAME = 'shared'
const DB_VERSION = 1

interface ShareMessage {
  type: 'tosijs-share'
  path: string
  value: any
  origin: string
}

// Module-level state
const sharedPaths = new Set<string>()
const inboundPaths = new Set<string>()
// Paths whose stored snapshot is being read during share() setup. If a live
// delta arrives (via the channel) while we're awaiting the store read, it is
// fresher than the snapshot — record it so the stale snapshot doesn't clobber
// it on restore.
const restoringPaths = new Set<string>()
const freshDuringRestore = new Set<string>()
const debouncedSaves = new Map<string, () => void>()
let channel: BroadcastChannel | null = null
let origin = ''
let db: IDBDatabase | null = null

/**
 * Pluggable store interface for testing.
 * Default implementation uses IndexedDB. Tests can replace with an in-memory store.
 */
export interface ShareStore {
  get(key: string): Promise<any>
  set(key: string, value: any): Promise<void>
}

let store: ShareStore | null = null

/** Replace the default IndexedDB store (mainly for testing). */
export function setShareStore(s: ShareStore): void {
  store = s
}

// --- IndexedDB helpers ---

function openDB(): Promise<IDBDatabase> {
  if (db != null) return Promise.resolve(db)
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => {
      db = req.result
      resolve(db)
    }
    req.onerror = () => reject(req.error)
  })
}

const idbStore: ShareStore = {
  async get(key: string): Promise<any> {
    const database = await openDB()
    return new Promise((resolve, reject) => {
      const tx = database.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(key)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  },
  async set(key: string, value: any): Promise<void> {
    const database = await openDB()
    return new Promise((resolve, reject) => {
      const tx = database.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put(value, key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },
}

function getStore(): ShareStore {
  return store ?? idbStore
}

// --- Helpers ---

function isShareMessage(data: any): data is ShareMessage {
  return (
    data != null &&
    data.type === 'tosijs-share' &&
    typeof data.path === 'string'
  )
}

function findSharedRoot(changedPath: string): string | undefined {
  for (const shared of sharedPaths) {
    if (changedPath === shared || changedPath.startsWith(shared + '.')) {
      return shared
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
  // a live delta landing while a path's snapshot is still being read is
  // fresher than that snapshot — flag it so restore won't overwrite it
  const root = findSharedRoot(path)
  if (root !== undefined && restoringPaths.has(root)) {
    freshDuringRestore.add(root)
  }
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

function initChannel(): BroadcastChannel {
  if (channel != null) return channel

  origin = crypto.randomUUID()
  channel = new BroadcastChannel(CHANNEL_NAME)

  channel.onmessage = (event: MessageEvent) => {
    const msg = event.data
    if (!isShareMessage(msg)) return
    if (msg.origin === origin) return
    // Check that the message path falls under a shared root
    if (findSharedRoot(msg.path) === undefined) return

    applyInbound(msg.path, msg.value)
  }

  return channel
}

function broadcast(path: string, value: any): void {
  if (channel == null) return
  const msg: ShareMessage = {
    type: 'tosijs-share',
    path,
    value,
    origin,
  }
  channel.postMessage(msg)
}

function schedulePersist(rootPath: string): void {
  if (!debouncedSaves.has(rootPath)) {
    debouncedSaves.set(
      rootPath,
      debounce(() => {
        const current = getByPath(registry, rootPath)
        getStore().set(rootPath, current)
      }, 500)
    )
  }
  debouncedSaves.get(rootPath)!()
}

export async function share(...proxies: any[]): Promise<{ restored: any[] }> {
  // Graceful degradation for SSR/Node
  if (typeof BroadcastChannel === 'undefined') {
    return { restored: [] }
  }

  initChannel()

  const restored: any[] = []
  const s = getStore()

  for (const proxy of proxies) {
    const path = typeof proxy === 'string' ? proxy : tosiPath(proxy)
    if (path === undefined) {
      throw new Error(
        'share() requires boxed proxies or string paths. Got a non-proxy value.'
      )
    }

    // Idempotent — skip if already shared
    if (sharedPaths.has(path)) continue
    // Claim the path immediately (idempotency + so inbound deltas that arrive
    // during the async store read below are recognized as under a shared root)
    sharedPaths.add(path)
    restoringPaths.add(path)

    // Restore from store or seed it
    const stored = await s.get(path)
    const gotFresh = freshDuringRestore.has(path)
    restoringPaths.delete(path)
    freshDuringRestore.delete(path)
    if (stored !== undefined && !gotFresh) {
      // Restore THROUGH applyInbound: it marks the path inbound so the
      // outbound observer (registered just below) treats the restore touch
      // as an echo and does NOT broadcast the stored — possibly up-to-500ms-
      // stale — snapshot back over any live tab's fresher state.
      applyInbound(path, stored)
      restored.push(proxy)
    } else if (stored === undefined) {
      const value = getByPath(registry, path)
      await s.set(path, value)
    }

    // Outbound observer: sync local changes to other tabs
    observe(
      (changedPath: string) =>
        changedPath === path || changedPath.startsWith(path + '.'),
      (changedPath: string) => {
        if (isInbound(changedPath)) return

        const rootPath = findSharedRoot(changedPath)
        if (rootPath === undefined) return

        // Broadcast the delta at the changed path
        const value = getByPath(registry, changedPath)
        broadcast(changedPath, value)

        // Debounced full root-path persist for cold start
        schedulePersist(rootPath)
      }
    )
  }

  return { restored }
}
