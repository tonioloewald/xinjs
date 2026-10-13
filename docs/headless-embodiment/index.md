# Headless Embodiment

<!--{ "parent": "One User Interface", "order": 4, "description": "The inversion: server-side rendering of an MCP — a tosijs app running as its abstract self, vending UI on demand (elementsSSR, live)." }-->

_Part of [One User Interface](/one-user-interface/) — the app as its abstract self, embodiment on demand._

> **Status: one part ships, the rest is design.**
>
> **Shipping (1.8.0):** the level-0 demo below, and the property that makes
> the whole idea plausible — `schematicSVG()` is a pure function over plain
> records, so a map that arrived over a wire can be drawn by a process that
> never rendered the app. `tosijs/state` (DOM-free) means the state layer
> itself already runs headless, in plain node, with no shim.
>
> **Design, not code:** the inversion itself — a headless app vending UI on
> demand, with humans and agents as co-equal session peers. Nothing on this
> page beyond the demo implements that, and no API for it exists. Read it
> as a direction, not a feature list.

The app is the model; the browser is just one embodiment. Below, level 0,
live: a UI **vended as a string**, injected, and wired to live state with one
`bindParts` call — type in the hydrated input:

```js
import { elements, tosi, bindParts } from 'tosijs'

// elementsSSR: the elements proxy's call signature, emitting HTML strings
const VOID = new Set(['input', 'br', 'img', 'hr'])
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const kebab = (s) => s.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())
const elementsSSR = new Proxy(
  {},
  {
    get:
      (_, tag) =>
      (...args) => {
        const attrs = []
        const children = []
        for (const arg of args) {
          if (typeof arg === 'string' || typeof arg === 'number') {
            children.push(esc(arg))
          } else if (arg && arg.__html) {
            children.push(arg.__html)
          } else if (arg && typeof arg === 'object') {
            for (const [k, v] of Object.entries(arg)) {
              attrs.push(` ${kebab(k)}="${esc(v)}"`)
            }
          }
        }
        const t = kebab(tag)
        const html = VOID.has(t)
          ? `<${t}${attrs.join('')}>`
          : `<${t}${attrs.join('')}>${children.join('')}</${t}>`
        return { __html: html, toString: () => html }
      },
  }
)

// 1. VEND — a UI as a string; data-part markers stand where bindings will go
const ssr = elementsSSR
const html = String(
  ssr.div(
    ssr.input({ dataPart: 'name', placeholder: 'type your name' }),
    ssr.div('hello, ', ssr.span({ dataPart: 'greet' }))
  )
)

// show the vended string itself — wrapped, so narrow views stay readable
preview.append(
  elements.pre(html, {
    style: {
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      maxHeight: '8em',
      overflow: 'auto',
      margin: 0,
    },
  })
)

// 2. HYDRATE — inject the markup, then one bindParts call wires it to state
const { vended } = tosi({ vended: { name: 'world' } })
const host = elements.div()
host.innerHTML = html
preview.append(host)
bindParts(host, {
  name: { bindValue: vended.name },
  greet: { textContent: vended.name },
})
```

```test
import { updates } from 'tosijs'

// one sequential story, one test: inline tests within a fence run
// CONCURRENTLY (async test bodies are gathered with Promise.all), so a
// multi-step flow — hydrate, verify, interact, verify — must not be split
// across test() blocks that share state
test('the vended UI hydrates against live state, and the bindings are two-way', async () => {
  await updates()
  const input = preview.querySelector('[data-part="name"]')
  const greet = preview.querySelector('[data-part="greet"]')
  expect(greet.textContent).toBe('world')
  input.value = 'agent'
  input.dispatchEvent(new Event('change', { bubbles: true }))
  await updates()
  expect(greet.textContent).toBe('agent')
})
```

## The inversion: headless embodiment ("server-side rendering of an MCP")

Follow the thesis to its end and the priority flips. If the agent interface is
paths + wiring + actions, then **the DOM was never the application — it was one
projection of it.** So run the projectionless app:

- A tosijs app as a **purely abstract, server-side embodiment**: state, actions,
  bindings-as-declarations, observers — no DOM, no browser. Agents connect to
  it _natively_ (the MCP adapter over the same `describe`/`read`/`write`/
  `observe`/`call` surface). It is an application that happens not to be
  currently visible.
- **On demand, it vends a user interface.** When a human shows up, the same app
  definition materializes HTML (prerender + hydrate) and the human joins the
  session the agent was already in — same state, same wiring, same truth.
  Classic SSR renders markup early and bolts interactivity on later; this runs
  the _application_ continuously and mints markup lazily. SSR for humans;
  native protocol for agents; one source.

This is less speculative than it sounds, because every load-bearing piece has a
precedent in the stack today:

- **DOM-free core** — tosijs#18 (a state-only entry point; DOM globals are
  currently required at import time) is _exactly_ the enabling work. This idea
  is #18's killer app.
- **Vending HTML** — the doc-site system already evaluates components in a
  DOM-shimmed subprocess and emits prerendered, hydrating pages. The machinery
  for "definition → markup on demand" exists; it needs pointing at app state.
- **Session sync** — `share.ts`/`sync.ts` already move `{path, value}` deltas
  between contexts. A human's late-joining browser is just another sync peer of
  the headless app — as is the agent.
- **Wiring without DOM** — bindings are _declared_ (`bindValue: app.filter`,
  `onClick: 'app.addItem'`); headlessly, the declarations themselves are the
  wiring graph. `describe()` doesn't need elements to exist — elements are what
  the declarations _become_ when a human needs them.

### Mechanics: vending is closer than it looks

Three levels of headlessness, all grounded in existing machinery:

- **Level 0 — `elementsSSR` (no DOM at all).** An elements-shaped proxy whose
  factories emit **HTML strings** instead of nodes is almost trivial — same
  call signatures, same sugar, string concatenation underneath. The two
  apparent hard parts dissolve on inspection:

  1. **Bindings serialize to markers, and the hydration seam already exists:**
     `bindParts(root, bindingMap, dataAttribute = 'part')` (shipped, tested)
     applies ElementProps to elements found by `data-part` markers. So
     `elementsSSR` emits `data-part="searchBox"` where the live version would
     have bound directly, and the client re-wires with one `bindParts` call —
     the binding map itself is isomorphic to the wiring graph `describe()`
     already knows.
  2. **Components don't need server-side rendering at all**, because tosijs
     components _self-hydrate on connection_: their content is built in
     `connectedCallback`, not baked into markup. SSR emits the host tag,
     attributes, and light children — the browser upgrade does the rest. (The
     framework's laziness turns out to be an SSR feature: there is nothing to
     serialize because there is nothing there yet.)
     State travels alongside as a `hotReload`-style serialized overlay. Vending a
     UI = `elementsSSR` markup + state snapshot + hydrate-on-load.

  (Level 0 is the live demo at the top of this page.)

- **Level 1 — a real headless DOM (works today).** The question "is there a
  headless DOM that could actually run tosijs?" is answered by the repo itself:
  **happy-dom already runs tosijs in two production paths** — the entire unit
  suite (bunfig preload) and the doc-site prerender, which _evaluates
  components in a DOM-shimmed subprocess and serializes the result_. That
  pipeline IS level-1 vending, already shipping. jsdom also works (heavier,
  slower, some spec areas better); linkedom is the fast-and-loose option for
  pure generate-markup workloads; a real headless browser (Playwright) remains
  the ground-truth tier. Known happy-dom limits (layout is zero-size,
  interaction timing lies — see #21) don't matter here: the headless embodiment
  serves _state, wiring, and markup_, not pixel behavior.
- **Level 2 — no DOM even loaded (tosijs#18).** The state-only entry point:
  registry, observers, actions, and declared wiring with no DOM globals at
  import. Level 0's string vending bolts onto this; level 1 becomes an
  optional fidelity tier rather than a requirement.

**Honest cost note (as human-facing SSR).** Vending sidesteps the virtual-DOM
diffing engine, but not hydration itself: the client still ships markup, then
runs JavaScript (`bindParts`, component self-hydration) before the page is
_interactive_. That cost is real and inherent to any client-side runtime —
what's different here is its size and shape: no framework re-render to
reconcile against, no serialized component tree to replay — just re-attaching
bindings to markers, roughly proportional to the number of bound elements
rather than to the size of the app. Lighter, not free.

**"Virtual DOM," meaning it this time.** Level 1 deserves its own framing: give
the app a fake `document.body` and the "UI" simply lives there, unrendered.
React's virtual DOM is a throwaway diffing artifact — cheap copies of a tree
whose only purpose is to be discarded. This one is the opposite: it is the
application's _real_ structure, merely not painted. And that matters because
the visual architecture a designer builds for human comprehension — containment,
grouping, ordering, labels — **is an information architecture**, and it serves
the AI consumer and the test engine exactly as it serves the eye. The DOM tree
was the app's ontology all along; pixels were just one way to read it.

And note what falls out **before any AI enters the picture**: the headless
embodiment is an _intermediate, fully testable version of the application_.
Drive the whole app — state, actions, observers, declared wiring — with no
browser, no DOM shim, no flake: `write('app.filter', 'milk')`,
`call('app.addItem', …)`, assert on `read()` and the observation stream. Today
that seam is exactly where testing is weakest: unit DOMs (happy-dom) lie about
interaction timing and Chromium-only lanes lie about other engines — the
segmented saga (tosijs#21) shipped green through both. A headless embodiment
splits the problem correctly: business logic and interaction _semantics_ get
fast, deterministic, DOM-free tests against the real application; real-browser
lanes shrink to testing what they alone can test — the projection. The agent
interface and the test harness turn out to be the same interface, which is the
thesis again: one interface, and a test runner is just one more user.

The endgame framing: **an app is a model plus a set of embodiments.** Browser
DOM for humans present now; prerendered HTML for humans arriving; MCP for
agents; sync peers for other machines; the test harness, which is an agent
that never gets bored — and the **schematic** (see
[The Derived Surface](/derived-surface/)): the wiring drawn as labeled
rectangles, a map view for humans and a token-compressed overview for vision
models. tosijs is the model and the switchboard.
