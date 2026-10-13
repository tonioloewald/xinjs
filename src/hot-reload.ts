/*{"parent": "managing-state", "order": 4, "title": "Hot Reload", "description": "hotReload() picks parts of app state that survive a page refresh. A debugging aid; not tested or intended for production."}*/
/*#
# Hot Reload (hotReload)

`hotReload()` lets you pick parts of your app's state that survive a page
refresh.

> `hotReload` was written as a debugging aid: reload the page while you work and
> keep your place. It may be useful more generally, but it has not been tested
> for production use and is not intended for it.

```
hotReload(test: PathTestFunction = () => true): void
```

Call it after registering your initial state. `test` is called with the name of
each top-level piece of state and returns `true` for the ones to keep; with no
argument, everything is kept.

    import { tosi, hotReload } from 'tosijs'

    const { app, prefs } = tosi({
      app: { draft: '' },
      prefs: { theme: 'system' },
    })

    // keep prefs across reloads, start app fresh each time
    hotReload((name) => name === 'prefs')

The chosen state is saved to
[`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
when it changes, and on the next load the saved values replace the initial ones.
To reset, run `localStorage.removeItem('xin-state')` in the console.

## Why not to use it for anything serious

- **It only keeps what survives `JSON.stringify`.** `localStorage` stores
  strings, so plain data comes back and anything richer does not: an instance
  of a class returns as a bare object, and a `Date`, `Map` or `Set` does not
  return as itself.
- **You choose what is kept because not everything can be.** A restore replaces
  each saved piece of state whole, with what came back from storage, so methods
  on it are gone (functions cannot be stored) and so is any field you have
  added to your code since the save. Use the test function to keep the pieces
  that are plain data (preferences, a draft, the current selection) and leave
  out the ones that carry behaviour. Reset after changing the shape of
  something you keep.
- **There is one save per origin**, under the key `xin-state`. Two apps served
  from the same origin that both call `hotReload` will overwrite each other.
- **`localStorage` is local, not secure, and has arbitrary limits.** The data
  stays on that one browser, anything running on the page can read it, and
  browsers cap how much you can store.

Saving is debounced, so it is at least not pathologically bad: a burst of
changes produces one write.

A production-ready version of this would:

- explicitly serialize and deserialize complex state where appropriate,
- use [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
  to avoid the arbitrary limits and to take the work off the main thread, and
- probably encrypt the data where appropriate, using a secret stored in the
  cloud.

That is not a gap `hotReload` is waiting to fill. We have built exactly that for
a production app, and every one of those choices (what to serialize and how,
what to encrypt, where the secret lives) belonged to that app. It cannot be made
one-size-fits-all, so `tosijs` does not try: build it for your app, on top of
[`observe`](/path-listener/).

We could ship it with a pluggable storage backend and a pluggable
transformation function, but that would leave you writing the two parts that
matter and are easy to get wrong. Storing data securely is not something to do
through a plug-in you did not need to understand.
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
