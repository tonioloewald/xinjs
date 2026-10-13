/*{"parent": "managing-state", "order": 4, "title": "Hot Reload", "description": "hotReload() persists matching tosijs state paths to localStorage so application state survives page reloads."}*/
/*#
# Hot Reload (hotReload)

`hotReload()` persists any root-level paths in `xin` that its test function evaluates as true
to [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). It restores them (by overlay) on the
next load, so call it after registering your initial state. Functions are not
persisted. To reset, run `localStorage.clear()` in the console.

```
hotReload(test: PathTestFunction = () => true): void
```
*/
import { settings } from './settings'
import { xin, observe } from './xin'
import { tosiValue } from './metadata'
import {
  TosiObject,
  PathTestFunction,
  ObserverCallbackFunction,
} from './xin-types'
import { debounce } from './throttle'

// TODO reimplement using IndexedDB

export const hotReload = (test: PathTestFunction = () => true): void => {
  const savedState = localStorage.getItem('xin-state')
  if (savedState != null) {
    const state = JSON.parse(savedState)
    for (const key of Object.keys(state).filter(test)) {
      // Wholesale replace, never Object.assign: assigning onto a scalar
      // default (xin[key] === 0) silently dropped the saved value, and
      // merging a saved array over a longer default left stale tail
      // elements (['a'] over ['x','y','z'] => ['a','y','z']). A plain
      // assignment through the proxy restores the saved value exactly.
      xin[key] = state[key]
    }
  }

  const saveState = debounce(() => {
    const obj: TosiObject = {}
    const state = tosiValue(xin)
    for (const key of Object.keys(state).filter(test)) {
      obj[key] = state[key]
    }
    localStorage.setItem('xin-state', JSON.stringify(obj))
    // debug-only: this fires on every debounced save (~every 500ms of
    // interaction) and drowned the release's one-time diagnostics
    if (settings.debug) console.log('tosijs state saved to localStorage')
  }, 500)

  // The observer fires with the FULL changed path (e.g. 'app.user.name'),
  // but `test` judges ROOT keys ('app'). Match on the path's root segment so
  // a deep write still triggers a save — a raw `test(fullPath)` only saved
  // when a root key itself was reassigned.
  // returns boolean | symbol because a PathTestFunction may return
  // OBSERVER_SHOULD_BE_REMOVED, which must be passed through unchanged
  const rootMatches = (changedPath: string): boolean | symbol => {
    const root = changedPath.split(/[.[]/)[0]
    return test(root)
  }

  observe(rootMatches, saveState as ObserverCallbackFunction)
}
