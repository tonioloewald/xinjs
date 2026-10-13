# Cross-Tab State (share)

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
