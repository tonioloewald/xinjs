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
