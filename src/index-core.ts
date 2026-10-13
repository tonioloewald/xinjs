/*{"parent": "entry-points", "order": 1, "description": "tosijs/core — the slim entry: everything except the blueprint loader and the multi-window leaves, for consumers who choose minimalism."}*/
/*#
# tosijs/core (slim entry)

The full library minus the parts a bundle can't safely shake for you:

    import { tosi, elements, Component } from 'tosijs/core'

**Not included** (import them from `tosijs`):

| left out | why | get it back |
| --- | --- | --- |
| `<tosi-blueprint>` / `<tosi-loader>`, `makeComponent` | registers custom elements at import — a *markup* contract no import statement protects | `tosijs` |
| `share`, `sync` | BroadcastChannel/IndexedDB and network transports | `tosijs` |
| `hotReload` | dev-time localStorage state persistence | `tosijs` |
| `enableAgentInterface`, `schematicSVG`, `auditAccessibility`, the contract harnesses | the opt-in agent surface (~15 kB gz marginal — README carries the generated figure) | `tosijs` or `tosijs/agent` |

Everything else — state, bindings, elements, components, CSS, Color — is
here, identical to `tosijs`.

> **Why this is opt-in rather than automatic.** Blueprints hydrate from
> *markup* (`<tosi-blueprint tag src>`), so a consumer has no import
> statement for a bundler to protect: shake the registration and the page
> fails **silently** — an unknown element, no error, nothing hydrated, and
> the code that would have warned is the code that got shaken. Inverting
> that (opt in, don't opt out) moves the risk from "anyone who upgrades" to
> "someone who made a choice" — and because slim core is *present*, it can
> speak: in dev it scans for undefined blueprint elements after load and
> tells you exactly what happened.
*/
export * from './index-core-exports'
import { settings } from './settings'

// The dev-mode check the slim entry can afford to make (a shaken build
// cannot): if the page contains blueprint markup this entry cannot hydrate,
// say so, loudly, once — with the fix.
// NB: gated on the ABSENCE of an explicit opt-out, not on settings.debug —
// which defaults to false, so gating on it made this safety net inert (found
// by the 1.8.0-rc.1 review). The check is one querySelectorAll, once.
if (typeof document !== 'undefined') {
  const check = (): void => {
    // read settings INSIDE the check: this module body evaluates at import,
    // before any consumer can set settings.quiet, so gating the `if` on it
    // made the opt-out unusable (rc.1 review round 2)
    if (settings.quiet === true) return
    const orphans = document.querySelectorAll(
      'tosi-blueprint:not(:defined), tosi-loader:not(:defined)'
    )
    if (orphans.length > 0) {
      console.warn(
        `tosijs/core: ${orphans.length} blueprint element(s) on this page will ` +
          'NOT hydrate — the slim entry omits the blueprint loader. Import ' +
          "from 'tosijs' instead.",
        orphans[0]
      )
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', check, { once: true })
  } else {
    setTimeout(check)
  }
}
