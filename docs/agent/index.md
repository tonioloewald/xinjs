# Agent API reference (EXPERIMENTAL)

`enableAgentInterface()` turns a tosijs app's existing records — the state
registry, the binding wiring, the event handlers — into a described,
path-addressed surface for *non-human users*: AI agents, test harnesses,
automation. Nothing is recorded that tosijs doesn't already know; `describe()`
assembles the picture on demand.

**Nothing is exposed until you say so.** Say what an agent may see, and that
is exactly what it sees:

    import { tosi, enableAgentInterface } from 'tosijs'

    const { app } = tosi({ app: { cart: [], filter: '', addItem() {} } })

    const agent = enableAgentInterface({
      expose: {
        roots: [app.cart, app.filter],
        actions: [app.addItem, app.checkout],
        write: true, // omit for scoped reads with no writes
      },
    })

    agent.describe()          // roots, wiring (elements ↔ paths ↔ handlers), actions
    agent.read(app.filter)    // serializable value
    agent.observe(app.cart, (path) => { ... }) // push; returns un-observe
    agent.changes(cursor)     // turn-based drain: final value per changed path
    await agent.when(app.order.status, (s) => s === 'confirmed') // await a condition
    await agent.settled()     // await quiet — read what it could NOT see, below
    agent.write(app.filter, 'milk') // through the same observers as any write
    agent.call(app.addItem, 'buy milk')           // invoke an action by path
    agent.log()               // the audit trail

**Paths or proxies, everywhere.** Every verb and every manifest entry takes
either — `agent.read(app.filter)` and `agent.read('app.filter')` are the same
call, because the proxy already carries its path. Prefer the proxy: it survives
a rename and it cannot be misspelled. Strings remain fully supported, and are
what you want when the path arrives from outside the program (a tool call, a
config file, a wire message).

**Every record in `describe().wiring` has a `key`.** Refer back to a control by
its key, not its index: the index moves whenever the list changes (a row is
added, a section renders), the key does not. A key lasts while the element
exists *and* stays bound to the same paths. It changes when the element is
replaced. In a virtual list, rows that stay on screen keep their elements
across scrolls; a row that scrolls out is discarded, and one that scrolls in is
cloned fresh from the template (faster than cleaning up and reusing an old
row). So a row's key lasts while it stays on screen. It also
changes if an element is ever re-pointed at different paths, so a key never
follows an element to different data. Keys are opaque (`k1`, `k2`, …): they
say nothing about paths or position.

Anything that is *neither* — a plain object, a raw value read out of the tree —
is **refused**, with `kind: 'path'`. It used to be coerced with `String()`, so
`roots: [app.cart]` declared a root named `"[object Object]"` and every read
then failed as out-of-scope: a broken manifest whose error blamed the reader.
Worse for a scalar, where `String()` yields the *value*, so `read(app.filter)`
quietly read whatever path the filter text happened to spell.

Undeclared state is not redacted, it is **absent**: it never enters the map,
the elements bound to it never appear in `wiring`, and every verb refuses the
path. A manifest scopes **sight**, not reach — `roots` says what may be seen,
`write: true` is a separate grant to change it, and declared `actions` stay
callable either way. `describe().writable` reports which you have.

While developing, one word opens everything:

    const dev = enableAgentInterface({ expose: 'all' }) // and warns that it did

`enableAgentInterface()` with no manifest is legal and **exposes nothing** —
`describe()` reports an empty app and every verb refuses. That is deliberate:
the default used to be read-only over the *entire registry*, which is how four
separate secret leaks became reachable through one unargumented call. Scope is
the control; the redaction described below is defence in depth beneath it.

## `settled()` — what it means, and what it does not

After an action, an agent often needs to know when it is safe to look again.
**If you know what you are waiting for, use `when()`**: it waits for that
exact condition and is right every time. `settled()` is for when you don't.

    const r = await agent.settled({ timeout: 5000, quietMs: 50 })
    // { settled: true, waitedMs: 63, quietMs: 50,
    //   covers: ['state-notifications', 'state-quiet', 'component-renders', 'agent-calls'],
    //   notCovered: ['network', 'timers', 'external-async', 'list-throttle',
    //                'share-sync', 'unbound-dom'] }

**`settled: true` means exactly this:** at the moment it resolved, tosijs had
nothing pending *that it knows about*, and no state this surface can see had
changed for `quietMs`. "Nothing pending" is the four items in `covers`:

| `covers` | |
| --- | --- |
| `state-notifications` | every queued observer and binding notification has been delivered (`bind()`'s DOM updates happen there) |
| `state-quiet` | no visible state changed during the last `quietMs` — the window starts when you call, never earlier |
| `component-renders` | no `Component` render is queued |
| `agent-calls` | every promise **returned** by an action started through *this surface's* `call()` has settled |

**It does not mean** that the app is idle, that data has loaded, that a request
has finished, that the screen has painted, or that nothing will change a
millisecond later. tosijs can only vouch for work it queues or starts itself.
Everything else is listed in `notCovered`, on every result, settled or not:

| `notCovered` | why tosijs cannot see it |
| --- | --- |
| `network` | a request in flight is not state until its result is written, which can happen after `settled` resolves |
| `timers` | `setTimeout`, `setInterval` and animation-frame loops outside tosijs |
| `external-async` | async work tosijs did not start — **including work an action starts without returning its promise** |
| `list-throttle` | a `bindList`'s throttled DOM update changes the DOM, not state |
| `share-sync` | `share()` / `sync()` outbound queues |
| `unbound-dom` | DOM changed outside bindings, CSS transitions and animations, paint |
| `out-of-scope-state` | under a manifest only: undeclared state is deliberately not watched, because waiting on it would disclose that it changed |

**Under a manifest, only `state-quiet` is scoped.** `state-notifications` and
`component-renders` are page-wide: tosijs's notification queue and render
queue are shared by the whole page, so a render caused by undeclared state can
delay `settled`, and on a timeout `pending.renders` counts it. That reveals
*that* something rendered, never which path or what value; if that timing is
sensitive for your app, do not expose `settled` to an agent you do not trust.

Each of those is pinned by a test in which `settled` resolves **true while that
work is still pending**, so the limits are part of the contract, not a caveat.
**Pass `notCovered` on** to whatever trusts the answer (a test runner, a model),
rather than turning the result into a bare yes.

Two things make an app easier to settle: return the promise from an async
action (then `agent-calls` covers it), and when you know the end state, wait
for it with `when()` instead. `settled: false` is not an error: it resolves with
`reason: 'timeout'` and a `pending` summary of what was still busy. It rejects
only for bad options or a surface revoked while waiting. While the page is
hidden, animation frames stop, so a queued render keeps it unsettled until the
page is visible again.

## Secrets

> ⚠️ **`data-tosi-secret` is badly named and the name will change.** It marks
> what *this library* must not copy into a description. It is **not a security
> boundary and cannot be one**: everything it covers is ordinary client-side
> DOM, readable with one `querySelector` by any script in your origin, any
> extension, and anyone with devtools — whatever tosijs does.
>
> Worse, **it is an attribute, so it is a signpost.**
> `document.querySelectorAll('[data-tosi-secret]')` hands a reader your own
> curation of which parts of the page you considered sensitive. That judgement
> is work an attacker would otherwise have to do. Nothing here is disclosed
> that was not already reachable — but the marker tells you where to look.
>
> So: **mark as little as possible, and do not reach for it as protection.**
> The actual control is `expose` — what the surface is willing to describe at
> all — and the CLOSED default beneath it. This mechanism is defence in depth
> for the case where a description **leaves the origin** (a model-context host
> receiving `tosi_describe`); against anything running *in* the page it buys
> you nothing. A rename, and a way to declare withholding in code rather than
> in markup, are planned for 1.12.0.

A path bound to a password field, a `cc-*` autocomplete, a hidden CSRF token,
or anything you mark `data-tosi-secret` is withheld — it reads back as the
sentinel `⟨secret⟩` rather than its value:

    <input type="password" data-bind="value=app.login.password">

    agent.read('app.login.password')  // '⟨secret⟩'
    agent.read('app.login')           // { user: 'ada', password: '⟨secret⟩' }

This matters for what you DID expose — an undeclared path is absent, not
redacted, so redaction is what protects a secret sitting *inside* a declared
root (and it is the only thing protecting you under `expose: 'all'`).

**And `describe()` withholds the element's own content, not just its bound
value.** A secret-marked element — or any element inside a
`data-tosi-secret` region — publishes its tag, role, name, bound path and
geometry, but *not* its `href`, `placeholder`, `title`/`alt`-derived name,
`aria-description` or a toggle's `checked` state. A reset-link token lives in
an `href`, not in a bound path, and until 1.10.2 it travelled in cleartext
beside a `text` field that had been correctly withheld. The record carries
`secret: true` so a consumer can tell suppression from absence.

An **`aria-label` survives** — it is authored to be announced, and dropping it
would make every secret control anonymous to assistive tech and to the audit.
Names survive secrecy; content and live state do not.

**Secrecy is a property of the PATH, not of an element.** Marking one control
secret withholds that path everywhere it surfaces — `read`, `describe`,
`changes`, `when` — including from *other* elements bound to the same path,
and from every field beneath it if the path names an object. It is also
one-way for the session: a path that was ever secret stays secret, because the
alternative is a window in which it isn't.

> ⚠️ **The path has to be LEARNED first, and that is where the gap is.**
> tosijs discovers a secret path by finding a secret control and looking for
> the binding that feeds it: on the control, on its immediate parent, through
> a wrapping `<label>`, on its owning `<form>`, or across one shadow boundary.
> **Where the binding sits somewhere else, the path is never learned and the
> value reads back in cleartext.** Known-uncovered as of 1.10.2, each verified
> by execution:
>
> - a **custom element** carrying `data-tosi-secret` inside a bound `<form>`
>   (`el.form` is undefined on custom elements; a form-associated one keeps its
>   owner on `internals.form`, unreachable from outside) — so an explicit
>   marker is currently *weaker* than the heuristic
> - a **shadow component containing a password**, inside a bound `<form>`
> - a **light-DOM container two or more levels up** with no `<form>` between
>
> Tracked as [tosijs#41](https://github.com/tonioloewald/tosijs/issues/41).
>
> **The reliable form is to mark the element that CARRIES THE BINDING, or any
> ancestor of it** — not the control. Discovery works outward from a secret
> control looking for a binding; marking the *binding's* element instead means
> there is nothing to discover.
>
> ⚠️ A previous version of this note said *"marking the control itself, or its
> immediate wrapper, works in all of these"*. **The first half is false in ALL
> THREE shapes above, and it shipped in 1.10.2.** Verified by executing the
> published build: marking the control returns the value in cleartext for the
> custom element, the shadow component *and* the two-levels-up container. The
> marker is only a *hint to discovery*, and discovery is precisely what fails in
> each of these — an explicit marker is weaker than the heuristic, which bullet
> one already said. The "immediate wrapper" half is true only where that
> wrapper happens to BE the bound element, which is the rule above stated in a
> way that holds by accident. **If you marked a control on the strength of the
> old advice, re-check it.**

**What this is for, and what it is not.** It is not a defence against script
running in your page — that code can read the state directly and never asks
the agent surface. It exists because `describe()` output is *designed to
leave the machine*: it is assembled to be handed to a model, and typically an
off-device one. The guarantee is "tosijs will not volunteer your secrets into
that channel", not "your secrets are safe from an attacker with code
execution". Scope is the real control — declare a manifest, and keep
secrets out of the roots you expose.

**Shadow roots are covered (since 1.10.0).** Every secret scan used to be
light-DOM only — `querySelectorAll` and `closest` both stop at a shadow
boundary — while the *write* path deliberately crosses it. So a password
inside a styled `Component` wrote to state normally and was never redacted:
`read`, `changes` and `describe` all returned it in cleartext, against the
guarantee above, for anything using the supported shadow-DOM pattern. Three
things now cross the boundary: the document sweep descends into open shadow
trees, a `[data-tosi-secret]` region marks the paths bound *inside* it (it
previously withheld rendered content while leaving `read()` of the same path
in cleartext — half of what its name promises), and a component that renders
a secret control marks the path bound on its own **host**, which is where such
a binding actually lives. Closed shadow roots stay invisible, correctly:
nothing outside can bind into one either.

> **Matching is by spelling (tosijs#32).** A secret learned as
> `rows[id=r1].pw` is withheld from `read('rows')`, `read('rows[0])`, and
> `read('rows[0].pw')` — descent and index-aliasing are both covered. The
> known gap is narrower: exotic spellings of a *direct* query that no
> canonicalisation resolves. Treat the redaction as defence in depth beneath
> manifest scoping, not as the boundary itself.

> **Scope withholds what tosijs can trace to a path — not text you wrote into
> the page.** Under a manifest, `describe()`'s structural tier maps headings and
> landmarks. A heading **bound** to an undeclared path (or containing such a
> binding) publishes no text, and its record carries `textWithheld: true` so the
> absence reads as withheld rather than empty. An **unbound** heading's text is
> published: it has no path, so there is nothing for scope to check —
> including when the text was interpolated from state at creation time:
>
>     h2(`Reset token: ${app.token.value}`)   // published: a copy, not a binding
>     h2({ bindText: 'app.token' })          // withheld: scope sees the path
>
> This is deliberate. Withholding every unbound heading under a manifest would
> withhold the page's structure, which is most of what makes the map useful.
> To keep authored text out, bind it, or mark the heading `data-tosi-secret` or
> `aria-hidden`. `describe({ structure: false })` is **not** an author control —
> it is the describing caller's option.

One call is the whole story: where the browser provides a WebMCP host
(`document.modelContext`), `enableAgentInterface()` also registers the
generated tool set automatically — `agent.webmcp` is the receipt, and
`webmcp: false` opts out. No host, no-op.

> **🚧 CONTRACTS ARE IN FLUX.** `ComponentMap` / `static contract` /
> `expose.contract` will change shape without a deprecation cycle while the
> layering questions settle (tosijs#29, #30) — how `contract.attributes` and
> `initAttributes` divide the work, and whether an integrator's overlay may
> embellish a component's own declaration rather than replace it. Changes land
> in patch and minor releases and are called out in the CHANGELOG. For stable
> attribute declaration today, use `static initAttributes`; since 1.8.1 it is
> described to agents identically.
>
> **EXPERIMENTAL.** Shapes and names may change. The surface is deliberately
> protocol-neutral — MCP / WebMCP adapters sit on top of it; the WebMCP
> auto-registration is a convenience over that adapter, not a dependency.
