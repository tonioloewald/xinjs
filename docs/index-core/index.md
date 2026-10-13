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
