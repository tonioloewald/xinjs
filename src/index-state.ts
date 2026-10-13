/*{"parent": "entry-points", "order": 2, "description": "tosijs/state — the DOM-free state layer: observable path-addressed state importable anywhere, including plain Node."}*/
/*#
# tosijs/state (DOM-free)

State that belongs to no framework — and no *environment*. `tosijs/state`
is the observable-state layer with **no DOM globals touched at import**, so
it loads in plain Node, a worker, an SSR pipeline, or a migration script
with no `happy-dom` shim in sight:

    import { tosi, observe, xin } from 'tosijs/state'

    const { app } = tosi({ app: { count: 0 } })
    observe('app.count', (path) => console.log('changed:', path, xin[path]))
    app.count = 1

Everything here is identical to the same export from `tosijs` — this is a
narrower door onto the same house, not a different implementation. Bindings,
components, CSS and the agent surface live behind the main entry (and
`tosijs/core`), because those genuinely need a DOM.

Observers still fire in a DOM-free environment; there is simply nothing
bound for them to update.

> Closes tosijs#18 (raised from react-tosijs, which consumes exclusively
> DOM-free API).
*/
export {
  xin,
  boxed,
  observe,
  unobserve,
  touch,
  updates,
  // return this from an observer callback to retire it (tosijs#45 —
  // it was previously unreachable, so the mechanism silently did nothing)
  OBSERVER_SHOULD_BE_REMOVED,
} from './xin'
export { tosi, tosiUnique, xinProxy, boxedProxy } from './xin-proxy'
// NOT re-exported: getByPath / setByPath / deleteByPath / pathParts / id.
// They were never public from `tosijs`, and publishing them only from HERE
// made the subset claim above false — `import { getByPath } from 'tosijs'` is
// undefined at runtime (round-3 review, M7). Since nothing depends on them
// yet, dropping them is free, and it keeps five new names — including one as
// generic as `id` — out of a surface we are about to freeze. The path API a
// consumer actually wants is the proxy itself: `xin['a.b.c']` reads and
// writes any path, DOM or no DOM. `entries.test.ts` now pins state ⊆ full so
// this cannot drift again.
export {
  xinPath,
  xinValue,
  tosiPath,
  tosiValue,
  tosiSetValue,
  tosiAccessor,
  TOSI_ACCESSOR,
  TAKE_DESCRIPTOR,
} from './metadata'
export { throttle, debounce } from './throttle'
export { MoreMath } from './more-math'
export { settings } from './settings'
export { version } from './version'
export type {
  TosiObject,
  TosiArray,
  TosiScalar,
  TosiValue,
  TosiProxy,
  BoxedProxy,
  BoxedScalar,
  TosiTouchableType,
  TosiBinding,
  ListBindingOptions,
} from './xin-types'
// deprecated xinjs-era spellings, removed in 2.0. Another EXPLICIT list —
// 1.8.0 published these names from `tosijs/state`, so dropping them here would
// break that entry point on a patch release.
export type {
  XinScalar,
  XinValue,
  XinProxy,
  XinTouchableType,
  XinBinding,
} from './xin-types'
