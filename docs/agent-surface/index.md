# The Agent Surface

<!--{ "parent": "One User Interface", "order": 2, "description": "enableAgentInterface(): the protocol-neutral surface, push-and-drain observation, exposure tiers (schema-first), authoring-time declarations, and ComponentMap." }-->

_Part of [One User Interface](/one-user-interface/) — the design of the surface itself._

One line enables the surface; everything else derives. Watch a WebMCP tool
set write itself from an ordinary little app:

## Proof: the tools write themselves (live)

Every existing WebMCP integration authors its tools by hand.
`webmcpTools(agent)` **generates** them: the introspection pair
(`tosi_describe`, `tosi_surface`), the read pair (`tosi_read`,
`tosi_changes`), `tosi_write`, and one _named_ tool per action the registry
already holds. With a WebMCP host present (`document.modelContext` — a
Chrome origin trial as of 2026-08<!-- as-of: 2026-08-21 | WebMCP host
availability + API location -->),
`enableAgentInterface()` registers them **automatically at enable time**
(`agent.webmcp` carries the receipt; `webmcp: false` opts out); without a
host, you see exactly what would register.

**What actually publishes depends on the posture**, because publishing to a
WebMCP host hands the surface to a different principal. A closed (default)
surface publishes only the introspection pair — declaring
`expose: { roots }` (or `expose: 'all'`, or `webmcp: { allowReads: true }`)
is what says "yes, publish a read of this". `tosi_write` needs
`allowWrites`, which is why it appears on this page — see
[Trust](/trust-and-transports/).

```js
import { elements, tosi, enableAgentInterface, webmcpTools } from 'tosijs'

const { mcpDemo } = tosi({
  mcpDemo: {
    notes: ['built the ordinary way'],
    addNote(text) {
      mcpDemo.notes.push(String(text ?? `note ${mcpDemo.notes.length + 1}`))
    },
  },
})
const agent = globalThis.tosiAgent ?? enableAgentInterface({ expose: 'all' })
const { div, h4, ul, button, pre } = elements

// the app: a list and a button — no agent- or MCP-specific code anywhere
preview.append(
  div(
    h4('An ordinary little app'),
    ul(
      { style: { maxHeight: '8em', overflow: 'auto', margin: 0 } },
      ...mcpDemo.notes.listBinding(({ li }, note) => li(note))
    ),
    button('add note', { onClick: 'mcpDemo.addNote' })
  )
)

// no registration call: enableAgentInterface() already registered the set
// if this browser has a WebMCP host — agent.webmcp is the receipt
// height: 100% so maximizing the example gives the tool list the room
const out = pre({
  style: { height: '100%', width: 'auto', overflow: 'auto', margin: 0 },
})
out.append(
  agent.webmcp
    ? `WebMCP host detected — ${agent.webmcp.tools.length} tools auto-registered when the surface was enabled:\n\n`
    : 'No WebMCP host in this browser — the generated set that WOULD register\n(derived from the page, authored by nobody):\n\n'
)
for (const tool of webmcpTools(agent)) {
  out.append(`${tool.name}\n    ${tool.description.slice(0, 72)}…\n`)
}
preview.append(out)
```

```test
import { tosi, enableAgentInterface, webmcpTools, webmcpAdapter } from 'tosijs'

test('the WebMCP tool set derives from the page, and registration round-trips', async () => {
  const agent = globalThis.tosiAgent ?? enableAgentInterface({ expose: 'all' })
  tosi({ mcpFence: { poke() {} } })
  const names = webmcpTools(agent).map((t) => t.name)
  expect(names.includes('tosi_describe')).toBe(true)
  expect(names.includes('tosi_act_mcpFence_poke')).toBe(true) // derived, not authored
  // register against a mock host: every tool lands, unregister reverses
  const registered = []
  const mcp = webmcpAdapter(agent, {
    modelContext: { registerTool: (t) => void registered.push(t.name) },
  })
  expect(mcp.tools.length === registered.length).toBe(true)
})
```

The punchline is the table from [Plan & Prior Art](/plan-and-prior-art/) made
runnable: Angular's Signal-Forms-to-tools is the closest anyone else gets, and
it covers forms. Here _every action and every affordance_ is a tool candidate,
because the framework already holds the wiring — tosijs can be the first
framework where the WebMCP tools write themselves.

## The design: a launch toggle, not a framework

Nothing is exposed by default. The programmer flips a switch at launch:

```
import { enableAgentInterface } from 'tosijs'
// `tosijs/agent` is the same file with narrower types — deliberately NOT a
// separate bundle, which would carry its own copy of the state registry and
// describe an empty app

// the DEFAULT (1.9.0): NOTHING is exposed. describe() reports an empty app
// and every verb refuses until a manifest says otherwise.
const agent = enableAgentInterface()

// DEV: everything, read/write/call, deliberately and with a warning
const dev = enableAgentInterface({ expose: 'all' })

// PROD: exactly what you declare. A manifest scopes SIGHT — add write: true
// to let an agent change it; declared actions stay callable either way.
const prod = enableAgentInterface({
  expose: { roots: ['app.cart'], actions: ['app.checkout'], write: true },
})
```

The returned surface (also reachable as a global for injected/extension
contexts) is small and protocol-neutral:

| call                          | does                                                                                                                                                                                                                                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `agent.describe()`            | the app's self-description: state roots, wiring graph (element ↔ path ↔ handlers), actions, contract                                                                                                                                                                                                                           |
| `agent.read(path)`            | serializable value                                                                                                                                                                                                                                                                                                             |
| `agent.write(path, value)`    | through the same validation as any other write                                                                                                                                                                                                                                                                                 |
| `agent.observe(path, cb)`     | push notifications; returns unsubscribe                                                                                                                                                                                                                                                                                        |
| `agent.call(actionPath, …)`   | invoke a declared action (a function in state)                                                                                                                                                                                                                                                                                 |
| `agent.changes(since)`        | turn-based drain: final-value-per-path since your cursor                                                                                                                                                                                                                                                                       |
| `agent.when(path, predicate)` | await a state _condition_ (see push and drain)                                                                                                                                                                                                                                                                                 |
| `agent.log()`                 | the audit trail: every touch — and refusal — since enable                                                                                                                                                                                                                                                                      |
| `agent.webmcp`                | receipt of the auto-registered WebMCP tools (present only when the browser has a model-context host)                                                                                                                                                                                                                           |
| `agent.version`               | **what this surface IS** — `{ surface, tosijs, capabilities[] }`. Ask before assuming: test `capabilities.includes('bounds')` rather than inferring from a version. It rides `describe()` output too, so a serialized map is self-describing wherever it lands ([tosijs#23](https://github.com/tonioloewald/tosijs/issues/23)) |
| `auditAccessibility(map)`     | the lint the map made obvious: anonymous affordances, unnameable actions, missing roles, WCAG contrast, target size, placeholder-as-label. Pure over the description; `auditFlags(report)` turns findings into schematic `flags` so they can be _drawn_                                                                        |

`describe()` is the novel part, and it's assembled from the wiring tosijs
already records — enumerate `BOUND_CLASS`, map each element through
`getElementBindings`, walk the tree probing event wiring, list registry
functions. A sketch of what an agent sees:

```json
{
  "roots": { "app": "object" },
  "wiring": [
    {
      "tag": "input",
      "label": "search products…",
      "value": "milk ⟷ app.filter"
    },
    { "tag": "ul", "list": { "path": "app.items", "idPath": "id" } },
    { "tag": "button", "text": "Add", "on": { "click": "app.addItem" } }
  ],
  "actions": ["app.addItem"]
}
```

Records are deliberately **flat and small**: the semantically visible facts —
tag, label, text, bound props, handlers — sit at the top level; anything
obscure drops one level into `detail`. Bound props carry _value and provenance
in one string_: `"milk ⟷ app.filter"` is the current value, the fact that it's
live, and its address — and the arrow encodes **direction**, `⟷` two-way (a
user-writable affordance) vs `⟵` display-only. A value with no arrow is
static. The tokens are exported (`BOUND_TWO_WAY`, `BOUND_TO_DOM`) for parsers
— **split on the LAST occurrence**: the path is the tail, and the value is
everything before it. (Earlier text here called the tokens "unlikely in real
data" and told parsers to split on the first one. Neither was safe: a value
that merely _contains_ an arrow forged one, so the surface now replaces the
tokens inside harvested values and text with `<->` / `<-`. Last-occurrence
parsing is still the rule, because the arrow the surface adds is always the
last one.)

An agent reading that doesn't need vision, doesn't need to guess selectors, and
doesn't need to forge events. It needs `write('app.filter', 'milk')` and
`call('app.addItem', 'buy milk')` — and the human watching the screen sees the
UI respond, because there is only one interface.

### Observation: push and drain

The subscription channel is the delta nobody else can even feed (see
[Plan & Prior Art](/plan-and-prior-art/):
WebMCP is tools-only, blind between calls; MCP has `resources/subscribe` but no
framework can supply it without hand-wired change events per feature). tosijs's
core competency _is_ change notification, so agents get it for free — and the
payload is the **path**: tiny, semantic, diffable text. The agent decides
whether it cares _before_ spending inference. Compare "something changed,
here's another screenshot."

Agents inherit the exact semantics the UI runs on:

- **Granularity** — exact path, prefix (parent hears children), RegExp, or
  predicate; surgical (`app.cart.total`) or coarse (`app.cart`).
- **Subscribe before the data exists.** Deeply-async-by-default applies to
  agents too: `observe('app.order.confirmation')` _before_ initiating checkout —
  the subscription is the choreography, no wait-then-poll.
- **Settled frames.** Touches are async-batched; observers fire per settling
  round. The agent reasons about coherent states, never mid-transaction — the
  property that keeps the DOM from flickering keeps the agent from acting on
  half-applied state.
- **Multi-actor safety.** Human and agent in one session are notified of each
  other's changes; neither operates on a stale snapshot. Races dissolved by
  architecture, not locking.

And because LLM agents are **turn-based**, the surface offers the same touch
stream two ways:

1. **Streaming push** — `agent.observe(path, cb)` — for resident agents
   (in-page, extension, sync peer) that react continuously.
2. **Cursor drain** — `agent.changes(since)` — everything since the agent's
   last turn, **coalesced to final-value-per-path**: `updates()`' settling
   semantics extended across turns. Wake, receive a compact semantic diff of
   the world, reason once, act.
3. **Predicate await** — `agent.when(path, predicate)` — a promise that
   resolves when the state _satisfies a condition_, not when it merely
   changes. This is the episodic agent's missing middle: an agent that
   triggers an async mutation shouldn't drain-and-hope (the update may not
   have landed) or subscribe raw (every touch is a potential — expensive —
   inference wake-up). `await when('app.order.status', s => s === 'confirmed')`
   names the condition the agent is waiting for; inference spends nothing
   until the world actually reaches it. tosijs observers already accept
   predicates, so this is surface sugar over an existing primitive — and the
   named condition lands in the audit log, so _what the agent was waiting
   for_ is as inspectable as what it did.

These are the audit log and the observation channel revealed as one stream
consumed two ways — push for the vigilant, drain for the episodic — which also
means observation is inherently auditable. (And `changes(since)` exposed _as a
WebMCP tool_ works today within the standard's tools-only constraints — while
doubling as the existence proof that the standard needs a real notification
channel.)

### Exposure tiers (what "or what the programmer explicitly tells it" means)

> **`expose` scopes the MAP as well as the state** (changed in 1.9.0 — it used
> to scope state only, and this callout used to say so). An element earns a
> place in `describe().wiring` by being _declared_: bound to an in-scope path,
> or carrying an in-scope handler. Merely existing in the DOM is not enough, so
> an undeclared link's `href`, an undeclared region's contenteditable text, a
> private component's contract, and any label or heading rendering a value
> `read()` refuses are all **absent** rather than redacted.
>
> The old split — state scoped, map global — is what made four secret leaks
> reachable: the map is assembled to be handed to a model, so "it's only the
> DOM" was never only the DOM. `describe({ scope: el })` remains the DOM knob
> for narrowing to a subtree; `expose` now governs both.
>
> Two more facts worth stating plainly. `enableAgentInterface()` installs
> `globalThis.tosiAgent` unless you pass `global: false` — that global is a
> convenience, never a boundary (any script already on your origin can reach
> your state regardless), but it is worth turning off in a page that hosts
> third-party script. And **`describe()` returns live user- and peer-supplied
> content**: labels, text and values that people typed. Treat it the way you
> treat any tool output — as data, never as instructions. A state library can
> say this; it cannot enforce it.

1. **Off** — never call `enableAgentInterface()`. Zero cost, zero surface.
1. **Closed** (the default) — a bare `enableAgentInterface()` installs the
   surface and exposes _nothing through it_: `describe()` reports an empty
   app, no roots, no wiring, and every verb refuses. Until 1.9.0 this tier
   was "read-only introspection" — everything readable and observable, with
   only `write()` and `call()` refusing — which read as the safest posture
   while being the **widest read posture available**. Four secret leaks were
   found beneath that description, every one reachable only from it; the
   default is now empty. See [Trust & Transports](/trust-and-transports/).
1. **Introspection mode** (`expose: 'all'`) — everything tosijs knows,
   read/write/call, **dev-only and explicitly unstable**. (The name is the
   code's: `describe().exposure` reports `'all'` for this tier, `'manifest'`
   for a declared one, and `'closed'` for the empty default.) For exploration, debugging, agent-assisted development, and
   _discovering what belongs in the schema_. Also a better haltija/Playwright
   substrate than selector-scraping — but nothing durable (tests, agent
   workflows) should script against it, because its shape is whatever the
   app's internals happen to be today.
1. **Manifest mode** (production floor) — only declared roots/actions are
   visible:
   ```
   enableAgentInterface({
     expose: {
       roots: ['app.cart', 'app.filter'],
       actions: ['app.addItem', 'app.checkout'],
       write: true, // omit for scoped reads with no writes
     },
   })
   ```
   **A manifest scopes sight, not reach.** `roots` says what may be _seen_;
   `write: true` is a separate, explicit grant to _change_ it, and declared
   `actions` stay callable either way. This is deliberate: without it the two
   reachable postures were unscoped-read and scoped-read-plus-write, so the
   safest-sounding option was the one that granted the most, and "scoped
   reads, no writes" — the posture a production surface most often wants —
   could not be expressed at all. `describe().writable` reports which you have.
1. **Contracted mode** (the product) — manifest + **tosijs-schema** per root:
   shapes, constraints, computed predicates. Now `write()` validates against
   the contract, `describe()` tells the agent _what's legal_ rather than what
   exists — and since tosijs-schema already embeds serialized predicates,
   **preconditions ride along free**. **The seam is shipped:**
   `expose.contract = { check(path, value, proposal?) → true | Error,
describe() }` — tosijs stays zero-dependency (the core knows a _check_,
   not a schema language); the blessed adapter **ships from tosijs-schema**
   as `agentContract(schemas)` (1.5.0 — its `onError` messages become the
   refusal text, and it fails _closed_: a contracted write without a
   proposal, or a schema keyword `validate` doesn't enforce, is refused,
   not waved through). Refused writes throw the _reason_ and land in the audit log as
   `write rejected: …` notes — a refusal is part of the surface, because
   agents self-correct from reasons, not booleans. **Sub-path writes are
   routed, not bypassed:** core judges a write at or under a contracted
   root as the _whole root it would produce_ (clone + hypothetical apply —
   "route the write, not the schema"), handing the adapter a `proposal`
   `{ root, proposed }`. A word processor contracting `app.docs` therefore
   validates an edit to `app.docs[2].editor.value` as the docs array it
   yields — deep edits can't slip past, replacing an item with an
   incomplete document is caught by `required` at root context, and
   root-level cross-field constraints and `$predicate`s see every edit.
   Adapters never touch path mechanics; core never touches schemas. Free, and crucially **legible**: a bare
   `disabled: app.cart.invalid` tells the agent _that_ an action is gated
   but not _why_ — when the flag is `false` a human infers the reason from
   visual context; an agent hits a causal dead end. A serialized predicate
   is the why: `describe()` can hand over the failing condition itself
   ("cart requires ≥ 3 items"), turning "button disabled" into a
   self-correction plan.

**The tiers are a funnel, not a menu.** An earlier draft of this document led
with "the surface derives for free" and treated declaration as the fallback.
Adversarial review inverted that hierarchy, and the inversion stands: **the
declared, schema-filtered surface is the product; the automatic map is the
discovery tool that makes declaring cheap.** The auto-map is how you find out
what to put in the schema — it should never be what anyone scripts against.
Two reasons, and only one of them is security:

- **Security (asterisked).** Writes add no attack surface in a zero-trust app
  — but **the UI exposes what's _rendered_; the map exposes what's
  _resident_** (caches, prefetch, feature flags). And an undeclared `call()`
  surface is an RPC endpoint with good documentation.
- **Hyrum's law (always applies).** Scripts don't tolerate change the way
  users do: once fifty tests depend on the auto-map's accidental shape, every
  rename is breaking. Version the _schema_; refactor freely behind it.

The resolution costs one boolean: expose both, mark the auto-map explicitly
unstable, and keep everything durable on the schema'd view. A bonus falls out:
the schema **doubles as the agent's tool manifest** — filtered map + typed
affordances is essentially MCP tool definitions generated from application
code, and the same contract can be handed to an agent as a plain context
preamble when no protocol is in play. The infrastructure is
transport-agnostic.

### What running both layers buys: adaptation and diagnosis

Two operational advantages fall out of exposing the schema (the promise) and
the auto-map (the actuality) side by side:

- **The adaptation burden shifts from developer to agent.** The auto-map's
  instability is only a liability for _dumb_ consumers. A hard-coded test
  script breaks when an internal path renames; an LLM agent just re-reads the
  map on its next turn and proceeds. Declared-but-undurable is precisely the
  contract LLMs are good at consuming — the ephemerality of the map is a
  _feature_ for adaptive consumers and a trap only for static ones, which is
  exactly why the durable ones belong on the schema.
- **The diagnostic delta.** An agent that can see both the blueprint and the
  build can _diff them_. An action declared in the schema but reachable from
  no wired element; an input affordance the schema says is writable but whose
  binding is `toDOM`-only; a declared root with no bindings at all — each is
  a structural bug, detected without running anything, by comparing promise
  against actuality. This turns the agent from a blind navigator into a
  structural debugger — a class of introspection that DOM-scraping automation
  cannot express, because it only ever sees the build.

### The contract is a test (shipped: `exerciseContract`)

If a contract carries **example values**, the contract is executable — the
equivalent of tjs-lang's signature tests, one layer up. `exerciseContract(agent)`
reads the declared contract and exercises it **through the real surface**:

- every `examples:` entry (standard JSON Schema keyword) must be _accepted_
  by `write()` **and round-trip** — `read()` must return exactly what was
  written, with faithful (not JSON-normalizing) comparison, so a contract
  whose own spec can't survive the surface (a `Date` in an example, an app
  that mangles writes) is caught, not just values the contract refuses;
- every `$counterexamples:` entry (our convention) must be _refused_ — a
  gate that never says no isn't a gate, and the harness proves the no.

State snapshots and restores around each root, and the report is per-trial,
so a lying contract says exactly which claim lied. This is why the
declaration stays true: it isn't a comment, it feeds a harness that breaks
visibly. Future: richer exercise steps as custom properties (`$exercise`)
written in **AJS** — serializable like the schema, executable like a test,
sandboxable like neither `Function` nor `eval` — making the contract file
the entire conformance suite, shippable over the wire.

### Inline contracts: declare where you build, curate at the top

tosijs declares bindings at the moment of element creation, so contracts are
declarable there too — a `contract` prop on any element (stored beside the
binding metadata, never on the DOM):

```js
import { elements, tosi, enableAgentInterface, exerciseContract } from 'tosijs'

const { inlineDemo } = tosi({ inlineDemo: { qty: 5 } })
// READ THE SURFACE INSIDE THE HANDLER, NOT AT LOAD. Every live example on
// this page shares one realm, and the reconfiguring demo below calls
// enableAgentInterface(), which auto-disables the previous surface — and
// since 1.10.0 that REVOKES it. A handle captured here went stale the moment
// someone clicked that button, and every click after threw `revoked`.
const surface = () =>
  globalThis.tosiAgent ?? enableAgentInterface({ expose: 'all' })
surface() // install one now so the page has a dev surface from the start
const { div, label, input, button, pre } = elements

const out = pre({ style: { height: '100%', overflow: 'auto', margin: 0 } })
preview.append(
  div(
    label(
      'quantity ',
      input({
        type: 'number',
        bindValue: inlineDemo.qty,
        // the contract, declared AT the affordance it governs
        contract: {
          type: 'integer',
          description: 'quantity on hand',
          examples: [1, 42],
          $counterexamples: ['lots', 1.5],
        },
      })
    ),
    ' ',
    button('agent tries qty = "lots"', {
      onClick() {
        const agent = surface()
        try {
          agent.write('inlineDemo.qty', 'lots')
        } catch (e) {
          const audit = agent.log().slice(-1)[0]
          out.textContent = `${e.message}\n\naudit: ${JSON.stringify(audit)}`
        }
      },
    }),
    ' ',
    button('exercise it', {
      onClick() {
        const trials = exerciseContract(surface()).trials.filter(
          (t) => t.root === 'inlineDemo.qty'
        )
        out.textContent = JSON.stringify(trials, null, 2)
      },
    })
  ),
  out
)
```

```test
test('inline contract: harvested, aggregated, enforced', async () => {
  const agent = globalThis.tosiAgent ?? enableAgentInterface({ expose: 'all' })
  const d = agent.describe()
  expect(d.contract?.['inlineDemo.qty']?.type).toBe('integer')
  let refused = false
  try {
    agent.write('inlineDemo.qty', 'lots')
  } catch (e) {
    refused = true
  }
  expect(refused).toBe(true)
})
```

The declaration rides the harvest: it appears on the element's wiring record,
aggregates into `describe().contract` under the element's **bound path**, is
enforced by `write()` (the zero-dep type/enum/const subset natively; plug a
full engine with `setContractValidator`), and its `examples` /
`$counterexamples` feed `exerciseContract` — the input _is_ a test case now.

And curation, live — the same input, then **ship day**: one curated contract
at the top supersedes the inline declaration beneath it, and the manifest
narrows the whole surface to the declared root. Watch the bound input update
as the agent's writes land (and fail to update when they're refused):

```js
import { elements, tosi, enableAgentInterface } from 'tosijs'

const { shipDay } = tosi({ shipDay: { qty: 5 } })
const { div, label, input, button, pre } = elements

const out = pre({ style: { height: '100%', overflow: 'auto', margin: 0 } })
const attempt = (agent, path, value) => {
  try {
    agent.write(path, value)
    return `  ✓ ${path} = ${JSON.stringify(value)}`
  } catch (e) {
    return `  ✗ ${JSON.stringify(value)} — ${e.message}`
  }
}

preview.append(
  div(
    label(
      'quantity ',
      input({
        type: 'number',
        bindValue: shipDay.qty,
        // dev-day gate: just a type — inline, beside the binding
        contract: { type: 'integer', description: 'quantity on hand' },
      })
    ),
    ' ',
    button('dev day vs ship day', {
      // the whole story is SYNCHRONOUS: swap in the curated surface, act,
      // and hand the page back its introspection surface — atomically
      onClick() {
        const lines = []
        let agent = enableAgentInterface({ expose: 'all' })
        lines.push(
          `dev (expose: 'all'): ${
            Object.keys(agent.describe().roots).length
          } roots visible`
        )
        lines.push(attempt(agent, 'shipDay.qty', 'lots'))
        lines.push(
          attempt(agent, 'shipDay.qty', 150) + ' ← inline only checks type'
        )
        // ship day: ONE reviewed contract, declared at the top
        agent = enableAgentInterface({
          expose: {
            roots: ['shipDay'],
            write: true,
            contract: {
              check(_path, value, proposal) {
                const qty = proposal?.proposed?.qty ?? value
                return Number.isInteger(qty) && qty >= 1 && qty <= 99
                  ? true
                  : new Error('qty must be an integer from 1 to 99')
              },
              describe: () => ({
                shipDay: {
                  type: 'object',
                  properties: {
                    qty: { type: 'integer', minimum: 1, maximum: 99 },
                  },
                },
              }),
            },
          },
        })
        lines.push(
          `ship (manifest + curated): ${
            Object.keys(agent.describe().roots).length
          } root visible`
        )
        lines.push(
          attempt(agent, 'shipDay.qty', 150) +
            ' ← the curated rule, not the inline one'
        )
        lines.push(attempt(agent, 'shipDay.qty', 7))
        enableAgentInterface({ expose: 'all' }) // hand the page its dev surface back
        out.textContent = lines.join('\n')
      },
    })
  ),
  out
)
```

```test
import { enableAgentInterface } from 'tosijs'

test('ship day: curation supersedes inline, the manifest narrows the world', () => {
  // fully synchronous on purpose: surface swaps are atomic, so concurrent
  // fence tests never observe the intermediate manifest mode
  const dev = enableAgentInterface({ expose: 'all' })
  const devRoots = Object.keys(dev.describe().roots).length
  const curated = enableAgentInterface({
    expose: {
      roots: ['shipDay'],
      write: true,
      contract: {
        check: (_p, value, proposal) => {
          const qty = proposal?.proposed?.qty ?? value
          return Number.isInteger(qty) && qty >= 1 && qty <= 99
            ? true
            : new Error('qty must be an integer from 1 to 99')
        },
        describe: () => ({ shipDay: { type: 'object' } }),
      },
    },
  })
  expect(Object.keys(curated.describe().roots).length).toBe(1)
  expect(devRoots > 1).toBe(true)
  let refused = false
  try {
    curated.write('shipDay.qty', 150)
  } catch (e) {
    refused = true
  }
  expect(refused).toBe(true)
  curated.write('shipDay.qty', 7) // within the curated rule
  enableAgentInterface({ expose: 'all' }) // restore for the rest of the page
  expect(globalThis.tosiAgent.describe().exposure).toBe('all')
})
```

Declaration is distributed; curation is central. The precedence ladder, most
deliberate wins:

| level             | declared                    | wins when                                                                               |
| ----------------- | --------------------------- | --------------------------------------------------------------------------------------- |
| `expose.contract` | at `enableAgentInterface()` | always — a curated root supersedes ("curates away") every inline declaration beneath it |
| `static contract` | on the component class      | for the component's own value/attributes/parts                                          |
| `contract:` prop  | at the element, inline      | when nothing above covers its bound path                                                |
| harvest           | nowhere — derived           | fills every remaining gap                                                               |

And manifest mode's `roots` filter which inline declarations are visible at
all — you can declare generously and expose narrowly.

### Why declaration wins: intent captured at authoring time

The deep reason schema-first works is _when_ the declaration happens: at
authoring time, while the purpose is still known. Everything expensive in
software archaeology — comprehension, test-writing, drift detection — is
expensive because intent decayed between writing and reading, and everyone
downstream (maintainer, test suite, agent) has to re-infer it from behavior.
Capturing intent while it's free, in a form that's machine-checkable forever
after, is the same trade tjs makes with types.

And the discipline holds for the same reason types beat docstrings: the
declaration isn't a comment — **it's load-bearing**. Comments rot because
nothing breaks when they lie. A declaration that feeds the map, the tests, and
the agent's context breaks visibly when it lies. That's what keeps it true.

### ComponentMap: one declaration, four consumers

The manifest idea has a component-level counterpart, and it unifies four
things that are today separate (or absent): **the contract** (what `value`,
attributes, and methods are legal), **the description** (what an agent — or a
reader — is told), **the test harness** (the declaration is exercisable), and
**the map of parts to internal elements** (what PartsMap types today). One
`static componentMap`, four consumers — a component that lies about itself
fails tests, not users.

**Shipped:** one word everywhere — the app manifest takes `expose.contract`,
the component declares `static contract`:

    const counterContract = {
      description: 'a counter with a labeled readout and a reset',
      value: { type: 'number', examples: [0, 42] },
      methods: { reset: { description: 'set the count back to zero' } },
      parts: { readout: 'span', increment: 'button' },
      tests: [
        {
          name: 'increment increments and renders',
          steps: [
            { set: { value: 3 } },
            { click: 'increment' },
            { expect: { value: 4, text: { readout: '4' } } },
          ],
        },
      ],
    } as const satisfies ComponentMap

    class Counter extends Component<typeof counterContract> {
      static contract = counterContract
      …
    }

- **The declaration is the type.** `Component<T>` accepts a classic PartsMap
  _or_ `typeof <contract>` in the same slot: with the latter,
  `this.parts.readout` is an `HTMLSpanElement` because the contract said
  `'span'` — parts typing, agent description, and the harness now share one
  source. (Declare the contract `as const` so tags stay literal.)
- `describe()` harvests it: any wired instance's record carries
  `component: <the contract>` — **own statics only**; statics inherit through
  the prototype chain and a subclass must not silently wear its parent's
  claims.
- `exerciseComponent(el)` executes it: declared parts resolve _inside the
  instance_ (via the saga-hardened parts proxy — ownership-correct, where a
  bare querySelector could false-positive on a nested component's same-named
  part) and match their tags; methods exist; value examples round-trip; and
  **declared `tests` run** — serializable step scripts (`set` / `click` /
  `expect` on value and per-part text), settled through the same
  updates()+rAF discipline as the doc-test lane. Tests are an **array**, not
  a map: execution order must be explicit in a serializable contract (JS
  reorders integer-like keys; other languages' maps promise nothing) — each
  test still snapshot/restores, so independence stays the goal, just never a
  load-bearing assumption.
- **Shipped tests vs. stripped tests:** `contract.tests` deliberately ship —
  they're claims an agent can self-verify wherever the component mounts.
  Dev-only tests belong in tjs `test {}` blocks (erased from bundles); once
  components go native-TJS, the bridge is one line — a test block calling
  `exerciseComponent()`. The steps being pure data is the AJS on-ramp:
  serializable like the schema, executable like a test.

**Both remaining pieces shipped (2026-08-03), by two rules the user set:**

- **`contract.attributes` subsumes `initAttributes`.** Entries carry
  JSON-Schema shapes _with `default`s_; the derived defaults feed the
  existing attribute machinery unchanged. Declaring BOTH on one class
  **throws** (one source of truth); `initAttributes` beside a contract that
  lacks attributes **warns once**, pointing at the ideal; entries without a
  `default` **throw, named** (the machinery infers runtime types from
  defaults). No contract involved → classic behavior, untouched.
- **The value setter enforces the declared `value` contract** — _a contract
  is an opt-in to being held to it; no contract, no check, no cost._ Core
  natively enforces the structural subset (`type` / `enum` / `const` — zero
  dependencies, covers the common case); `setContractValidator()` plugs in
  full-schema validation (the `setPredicateEvaluator` idiom — tosijs-schema's
  `validate` in ~6 lines). Violations throw the reason and leave the value
  untouched. The _general_ runtime-type-drift axis still belongs to tjs 2.0
  (`settings.strictness`) — this enforces what was _declared_, which is
  narrower and already promised.

**Post-hoc lofting (shipped):** `enableAgentInterface({ components:
{ 'legacy-tag': contract } })` patches contracts onto components whose
classes you don't control — a library's widgets, a react-tosijs or
ngx-tosijs legacy app, the doc system itself. A class's own `static
contract` always wins; post-hoc maps fill the gaps. Since the whole surface
attaches from _outside_ the app (a console, a userscript, an extension),
the entire ladder — introspection, manifest, contracts, component maps —
can be lofted onto a running app that never heard of any of this.

**And curation flows back to humans:** a component's `contract.description`
materializes as its `aria-label` when the author didn't write one (explicit
content always wins) — the same declaration that informs agents informs
screen readers. ARIA in, ARIA out: the curb cut runs both directions.

Shadow components stay agent-shaped
(the value is the interface; the internals are private) — the contract is how
a component _says so in a checkable form_.
