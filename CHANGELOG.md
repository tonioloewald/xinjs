# Changelog

All notable changes to **tosijs** are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For releases before 1.6.0, see the git history (`git log`) and tags.

## [1.11.0] - 2026-09-07

**One implementation of "can I act here" and "is this big enough."**
`auditAccessibility()` and the vendored floorplan renderer drew their verdicts
from two separate copies of the same rules, and the copies had drifted into
contradicting each other on real elements — a divergence this repo had already
written down at `src/audit.ts` rather than fixed, because the fix had to happen
upstream. tosijs-floorplan 0.4.0 exports `isInteractive`, `targetSizeFinding`
and `TARGET_SIZE_DEFAULT` (tosijs-floorplan#4); the local copies are deleted.

Minor, not patch: **`auditAccessibility()` returns different findings for the
same input**, in both directions. Nothing else in the public API moves.

### Changed — audit verdicts, deliberately

Stricter (now flagged, previously clean):

- **An accessible name never sized a box.** The old `target-size` rule exempted
  any `<a>` carrying a name, so an icon-only `<a href aria-label="Buy">` at
  20×20 audited clean. WCAG 2.5.8's inline exception is geometric, and is now
  applied as such: a link is exempt when it has **text** *and* its box is
  **wider than tall** — the shape text layout produces.
- **A square link is not a text link.** A 16×16 `<a>` carrying one glyph was
  exempt under the old text-or-name rule; it flags now.
- **A producer may assert affordance it cannot introspect** (`interactive` /
  `editable`). tosijs never emits these — it reads handlers directly — so this
  only affects foreign maps handed to `auditAccessibility()`.

Looser (now clean, previously flagged):

- **A forged arrow in an IDENTITY field confers nothing.** The old predicate
  scanned *every* string property for the two-way binding glyph, so
  user-controlled text in a `label` or `placeholder` could dress an inert
  `<div>` as a control. The eleven never-bindable fields
  (`tag`/`id`/`part`/`role`/`label`/`placeholder`/`type`/`description`/`href`/
  `ref`/`image`) are no longer scanned. **This narrows the hole; it does not
  close it** — the record shape is open (`[boundProp: string]: unknown`), so a
  forged arrow in `text` or an unrecognised key still counts as evidence.
  tosijs's own `describe()` strips arrows at every harvest, so this is reachable
  only with a FOREIGN map. Filed upstream.
- **An empty `href` is not a destination.** `href != null` counted; `href` must
  now be a non-empty string.

`0×0` records stay exempt. A hidden or unlaid-out element is not a target too
small to hit, and the shared rule (correctly, for a renderer) has no opinion
about that — so `audit.ts` keeps that one condition itself, and says so.

**The five changes are pinned by tests written to fail against the 1.10.1
predicate, and watched doing so** — the existing audit suite went 11/11 green
straight through the adoption, reaching not one changed case. Two of the pins
were themselves no-ops on first writing (their fixtures were cleared by a
*different* clause of the same predicate, so they passed against 1.10.1 too);
a pre-release review caught that, and both were rebuilt around fixtures that
discriminate.

### Added — the shared affordance rules are reachable

`isInteractive`, `targetSizeFinding`, `TARGET_SIZE_DEFAULT` and `schematic()`
now export from `tosijs` and `tosijs/agent`, with the record/result types their
signatures name (`SchematicRecord`, `SchematicDescription`, `SchematicResult`,
`SchematicLegendEntry`). Adopting one implementation is worth little if it
stops at this package's boundary: a downstream wanting the same verdict
`auditAccessibility()` reaches had to re-implement it or install a second,
independently-versioned copy of tosijs-floorplan — which is the duplication
floorplan#4 closed, one level out.

Types ship with the values on purpose. A value whose parameter type cannot be
named is only half-exported, and that is precisely the defect 1.10.1 spent a
release fixing. `src/type-surface.test.ts` now compiles a probe that *calls*
each of them against the built `.d.ts`; removing the exports fails it with
TS2305, watched.

Costs +59 gz on the two EXPERIMENTAL tjs bundles (budget 61_500 → 62_500, in
this commit, with the measurement) and +53/+56 on `module.js`/`main.js`, which
absorbed it inside their existing ceilings.

### Fixed — where a lint and a drawing legitimately differ

Adopting the shared rule wholesale imported **two silences** that are correct
for a renderer and wrong for an audit. Both were caught by the pre-release
review; both are fixed here, and both are also filed upstream because the
better home for them is tosijs-floorplan.

- **A list-bound element that IS the control is audited again**
  ([floorplan#7](https://github.com/tonioloewald/tosijs-floorplan/issues/7)).
  `isGround` makes list-ness decisive, so `select({bindList, bindValue})` — the
  exact shape 1.10.1 shipped a fix to *enable* — was classified as structure
  and went silent on **three** rules, two of them errors. A bare `<ul
  bindList>` is still ground; direct evidence on the element now wins over its
  container role.
- **Producer `flags` no longer silence the audit's own rule**
  ([floorplan#8](https://github.com/tonioloewald/tosijs-floorplan/issues/8)).
  Any flag whose `kind` merely *contains* `"target"` suppressed the finding.
  Right for a drawing, which already painted the flag and must not double-mark;
  wrong for a lint, which never reads `flags` into its findings and so just
  reported nothing. `auditFlags()` emits `kind: 'target-size'`, so the
  documented draw-then-re-audit flow was clearing the very elements it had just
  flagged. Incidentally closes
  [floorplan#12](https://github.com/tonioloewald/tosijs-floorplan/issues/12) —
  a flag with no `kind` used to throw out of `auditAccessibility()`.

Both are a single `auditView()` that **composes** the shared predicate over an
adjusted record — it re-implements nothing, so there is still exactly one
definition of what evidence *is*, and `audit.ts` contains none of it. If
upstream takes #7 and #8 these become no-ops rather than a second opinion. The
`record` on every finding is the original, unadjusted one.

**These two were regressions this release introduced**, which is why the
verdict list above is five and not seven: "a list container is ground" was
never an improvement, and against 1.10.1 it is not even a change — 1.10.1 also
called a bare container non-interactive, so the only records list-ness ever
decided were the ones carrying real evidence.

### Changed — schematic rendering

`src/schematic.ts` is re-vendored from tosijs-floorplan 0.4.0. `href` now draws
as an affordance, and caption text is neutralized at one choke point rather
than on two of the paths that reach it. Upstream reports that maps using none
of the new constructs render byte-identical to 0.3.0; **that is upstream's
measurement, not ours** — this repo has no golden-SVG comparison, and
`src/schematic.test.ts` is untouched against a 267-line vendor change. Tracked
in `TODO.md`.

Note the neutralization is a caption-rendering fix, **not** a fix to what
counts as a binding: a forged arrow in a bindable field still earns the badge
(see the identity-field note above). Full detail in
[tosijs-floorplan's CHANGELOG](https://github.com/tonioloewald/tosijs-floorplan/blob/main/CHANGELOG.md).

## [1.10.1] - 2026-09-06

Public types that were wrong or unreachable, and **silent failures in element
creators**: positional arguments that rendered nothing now render, or say why
they did not. `dist/` and the gzip budgets changed — **+403 to +453 gz** per
shipped bundle (+724/+734 for the two EXPERIMENTAL tjs bundles), measured with
the build's own compressor.

> **Why a patch.** Every behaviour change here fixes a bug rather than adding
> functionality — `div(new Date())` producing an empty `<div>` was not a
> contract anyone relied on, and nobody passing a Date was expecting nothing.
> Warnings are additive, `Map`-as-props is additive, and the type changes are
> corrections. This project's policy makes patch the default even when the
> public API grows, and reserves a minor for a coherent body of new
> functionality — which this is not (`practices/releasing.md`).
>
> The one change that is not purely a fix is `div(false)`, which now renders
> `false` instead of nothing. Checked before calling it safe: **zero**
> occurrences of the `cond && child` shape in tosijs-ui's shipped bundle and
> **zero** in this repo's own docs and examples. If you do rely on a falsy
> positional argument rendering nothing, use `null`/`undefined`, which remain
> the nothing-signal.

### Changed

- **Positional arguments to element creators: values render, `Map` applies,
  mistakes complain.** The contents loop was "Element | Fragment | string |
  number is a child, **anything else is a props bag**" — and the props merge is
  `Object.assign`-shaped, so handed something with no enumerable own properties
  it iterated nothing, *succeeded*, and dropped the argument.

  ```js
  div(new Date())   // was: <div></div>   now: <div>Sun Sep 06 2026 …</div>
  div(10n)          // was: <div></div>   now: <div>10</div>
  div(false)        // was: <div></div>   now: <div>false</div>
  div([a, b])       // was: <div 0="<span>a</span>" 1="…">   now: warns
  new Map([['title','x']])  // was: ignored   now: <div title="x">
  ```

  The rule: an argument that is **not** a props bag but knows how to render
  itself as text (its `toString` is not `Object.prototype`'s) becomes a text
  child. A **`Map` is a props bag** — a cleaner one than an object literal, and
  now allowed though never required. An **array complains** rather than being
  flattened, because guessing would make `div(a)` and `div(...a)` mean the same
  thing and hide the forgotten spread that produced indexed attributes. Anything
  that is neither says so instead of vanishing.

  `null` and `undefined` still render nothing — they are the nothing-signal
  conditional children rely on (`div('a', cond ? b : null, 'c')`), and remain
  silent. A class instance carrying fields is still applied as props.

  This was framed by a review as "silently accepts garbage". It is the
  opposite: the API dispatches on what it is handed, and it was dispatching
  wrongly and saying nothing — silent failure, the class this ecosystem tracks.
  See `../tosijs-coding-practices/practices/model-priors.md` #12.

  `module.js`/`main.js` gzip budgets raised (+264 gz), deliberately and in the
  same commit; most of it is the two warning strings, which are the point.

- **`fragment()` now honours the same contract as every other creator**, in
  `elements`, `svgElements` and `mathML`. It appended every argument raw, so:

  | | before | now |
  | --- | --- | --- |
  | `fragment('a', null, 'b')` | `"anullb"` — the literal string `null` | `"ab"` |
  | `fragment({class:'x'})` | `"[object Object]"` | warns, ignored |
  | `fragment([span('a')])` | the element stringified as text | warns — spread it |
  | `fragment(app.name)` | a dead one-time text node | a **live** bound `<span>` |

- **Component `content` arrays go through the same dispatch as `div()`.**
  Values that previously vanished now render *at their argument position*
  (`content = [10n, span(' each')]` was `" each"`, is `"10 each"`), a nested
  array warns instead of becoming indexed host attributes, and a **single**
  non-array `content` is classified too — `content = someProxy` used to
  **throw** `expect text content or document node`.

  **Two shape changes worth checking against your CSS.** A proxy in `content`
  now produces a bound `<span class="-tosi-data">` where a bare text node used
  to sit, so selectors keyed on `:first-child`/`:nth-child`/`> *` or code
  indexing `childNodes` can shift by one. And **in shadow DOM the value no
  longer appears at all**: bindings are inert there by design, so where a stale
  string used to be painted silently, you now get an empty span *and* a warning
  naming the component and the correct pattern (bind its value from outside and
  implement `render()`). That is deliberate — a wrong value that looks right is
  worse than a visible gap that explains itself — but it is a visible change.

### Fixed

- **Four public types were unreachable from any entry.** `AgentPathRef` and
  `AgentObserveRef` are the declared parameter type of _every_ agent verb and
  of `expose.roots` / `expose.actions`; `ComponentClass` is the declared type
  of `TosiComponentSpec.type` and `TosiPackagedComponent.type`, which 1.10.0's
  own notes point blueprint authors at; `DeclaredAttributes` is named by
  `withAttributes`'s return type. None of them were exported, so a consumer
  could read a type in a signature and be unable to write it — the situation
  [#36](https://github.com/tonioloewald/tosijs/issues/36) set out to end,
  reproduced one layer up. `ComponentAttrs` was already exported and is
  unaffected; the documented `withAttributes` + subclass pattern compiled fine.

  The entry modules use **explicit** export lists rather than `export *`, so a
  type not named there reaches nobody — and the library's own code never
  notices, because it imports from the modules directly. That is the same trap
  that left 22 `Xin*` aliases unreachable for four releases.

- **`withAttributes()` made downstream `.d.ts` emit impossible**
  ([#38](https://github.com/tonioloewald/tosijs/issues/38), reported by
  tosijs-ui adopting 1.10.0). `tsc --noEmit` was clean; `tsc --declaration`
  failed with **TS2742/TS2883** on _every_ migrated class — 34 files in
  tosijs-ui — so the package would have shipped JS with no types for any
  component built this way. The mixin returned an anonymous intersection
  declared in `dist/component.d.ts`, which `exports` does not reach, so
  TypeScript could not write a portable reference. Not fixable downstream: a
  named base const moves the error verbatim, and a `paths` mapping emits an
  import _their_ consumers cannot resolve.

  Fixed by naming the return type — **`WithAttributes<A>`**, exported from
  `tosijs` — and by exporting `DeclaredAttributes`, which the control run
  showed was the piece actually being named in the error. Verified by emitting
  declarations for tosijs-ui's own component shape: it now writes
  `import("tosijs").WithAttributes<{…}>` with no reference to `dist/`
  internals. `dist/` layout stays private.

- **The declared accessor surfaces had drifted from the one the proxy serves.**
  `tosiBinding` and `take` are served at runtime on object *and* scalar
  proxies, and were declared on `TosiAccessor` only — so `proxy.take(…)` and
  `proxy.tosiBinding(…)` did not typecheck on either kind, despite `.take()`
  being the plain-prop binding form the component docs recommend. Fixed on
  `TosiProps` and `BoxedScalarAPI`.

  The cause is structural: **six hand-written surfaces describe one 197-line
  proxy, and nothing kept them in sync.** So the list the `get` trap actually
  consults is now exported as data (`ACCESSOR_PROP_NAMES`, `as const`) and a
  compile-time guard asserts every declared surface covers it —
  `TosiAccessor` in full, and `TosiProps`/`BoxedArrayProps`/`BoxedScalar`
  between them, minus the list methods that are array-only by design. The
  guard found `take` immediately, and the runtime spelling set is separately
  pinned by a test on both proxy kinds, including the three that are
  deliberately *not* spellings (`xinBinding`, `tosiTouch`, `xinTouch`).

- **A bare proxy is a live element child, and `ElementPart` said otherwise.**
  `div(app.name)` renders the value and keeps rendering it as state changes —
  `elements.test.ts` calls it "the most-used site" — but the type admitted only
  `Element | DocumentFragment | ElementProps | string | number`, so the
  idiomatic spelling was a type error for every consumer. Widened to accept
  `BoxedScalar<any> | TosiProps<any>`. **`div()`'s runtime is unchanged** —
  but `fragment()` and component `content` arrays are not; see below.

  **Not `BoxedProxy<any>`** — that spelling was written first and caught by
  review before it shipped. `any` distributes through `BoxedProxy`'s
  conditional and a union containing `any` *is* `any`, so it collapsed
  `ElementPart` to `any` and deleted argument checking on the whole element
  factory: `div(() => {})` began typechecking and
  `button({ onClick: (evt) => … })` broke with `TS7006` because there was no
  signature left to infer from. The type-surface gate could not see it —
  it asserted only that a probe compiles, which is trivially true once
  everything is `any`. It now also asserts what must *not* compile, and that
  `ElementPart` is not `any`.

- **The direct `.observe` on a boxed proxy was typed backwards.**
  `ProxyObserveFunc` declared `(path: string) => void`; the runtime takes a
  **callback** and returns an **unsubscribe function** — the same signature as
  the `.tosi` accessor it delegates to. So the working call
  (`proxy.items.observe(cb)`, which the docs show) was a type error, while the
  call the type prescribed threw `expect callback to be a path or function`.
  Fixed for all four spellings — `observe`, `tosiObserve`, `xinObserve`,
  `[XIN_OBSERVE]` — which are one implementation, and pinned by a test that
  asserts the shape and that unsubscribing works.

  Found by typechecking the test files, which **no lane does**: two of our own
  tests call it correctly and had been reported as errors by a check nobody
  ran. Same family as [#31](https://github.com/tonioloewald/tosijs/issues/31)
  (`bindText`) and [#35](https://github.com/tonioloewald/tosijs/issues/35)
  (`.value` disagreeing between the direct property and the accessor).

### Added

- **A gate for the class**, not the instance (`src/type-surface.test.ts`): it
  compiles a probe against the **built** `.d.ts` with `tsc` and fails, naming
  the type, if any of the public surface cannot be imported. Verified by
  deliberately un-exporting `AgentPathRef` and watching it go red.

  Two earlier versions of this gate were vacuous and are worth recording: the
  first regex-scanned `dist/index.d.ts`, which is a 24-line re-export stub, so
  it compared two nearly-empty sets and passed — including after the type was
  deliberately deleted. The second tried to _use_ each type rather than merely
  import it, which is an arity error on the generic ones. A gate that cannot
  fail is worse than no gate, because it reports safety.

## [1.10.0] - 2026-09-04

**`Component` no longer disables type checking for every component you write** —
and the agent surface stops guessing what you meant by a path.

> Version note: 1.10.0 and 1.10.1 were tagged locally during development and
> never published; those tags are gone. Everything they contained is here.
> **Tags are cut as part of publishing now, not ahead of it** — a tag that
> names nothing on npm is not a release, and tagging a fix for an unpublished
> version just inflates the number.

### Added

- **The agent surface takes proxies, not just path strings.** Every verb
  (`read`, `write`, `observe`, `call`, `when`) and both manifest lists
  (`expose.roots`, `expose.actions`) now accept a tosijs proxy _or_ a string:

  ```js
  const { app } = tosi({ app: { cart: [], checkout() {} } })
  enableAgentInterface({
    expose: { roots: [app.cart], actions: [app.checkout] },
  })
  agent.read(app.cart) // same as agent.read('app.cart')
  ```

  The proxy already knows where it lives, so nothing has to spell it twice, and
  the manifest survives a rename. Strings are unchanged and remain right when
  the path comes from outside the program — a tool call, config, or the wire.

### Fixed

- **A non-path object is now refused instead of coerced.** Passing something
  that is neither a string nor a proxy reached `String()`, and the results were
  silent and wrong in two different ways. `expose: { roots: [app.cart] }`
  declared a root literally named `"[object Object]"`, which matched no path —
  so the _manifest_ was broken while every subsequent `read()` refused with an
  out-of-scope error naming the reader. And for a boxed scalar `String()`
  yields the **value**, so `agent.read(app.filter)` read the path spelled by
  whatever text the filter contained: data-dependent, and indistinguishable
  from a scope bug. Both now throw at the point of the mistake — at
  `enableAgentInterface()` for a manifest entry — carrying
  `tosiRefusal: 'path'` (a new `AgentRefusalKind` member; widen any exhaustive
  switch over it).

  `agent.observe(app.cart, cb)` previously threw
  `path.startsWith is not a function`, which is how this was found.

- **`disable()` now revokes the capability, not just the global** — a
  behaviour change, and the reason to read this entry. It used to tear down
  everything _around_ a surface (observers, pending `when()`s, the WebMCP
  registration, `globalThis.tosiAgent`) and leave the verbs working on the
  handle the caller already held. Since `enableAgentInterface()` auto-disables
  the previous surface, **tightening a posture at runtime left the old, wider
  surface fully usable by anyone holding it** — revocation revoked the
  discovery of the capability, not the capability. Every verb now refuses with
  `tosiRefusal: 'revoked'`; `when()` rejects. `disable()` stays idempotent. If
  you hold a surface across a reconfigure, re-read `globalThis.tosiAgent`.

- **Redaction stays narrow.** The shadow-host rule above climbs exactly ONE
  boundary and considers only value-carrying bindings (`fromDOM`). Written
  unbounded it would walk every host to the top of the page and take every
  binding on each, so a bound app shell containing one password field anywhere
  below marked its whole state root secret and the surface answered
  `⟨secret⟩` to everything — and since secret paths are append-only for the
  session, permanently. Fail-closed, so never a leak: a silent availability
  break of the surface this release exists to harden.

- **Secrets inside shadow roots were not redacted.** Every secret scan used
  `document.querySelectorAll` / `closest`, which stop at a shadow boundary —
  while the _write_ path deliberately crosses it. So a password bound inside a
  styled `Component` (the supported pattern: `shadowStyleSpec`, bound from
  outside with `bindings.value`) wrote to state normally and reached
  `read()`, `changes()` and `describe()` **in cleartext**, against a guarantee
  the docs state unconditionally. Latent since 1.8.0, and untestable by the
  existing suite: ~15 secret tests, zero `attachShadow`. Three things now
  cross the boundary — the document sweep descends into open shadow trees, a
  `[data-tosi-secret]` region marks the paths bound _inside_ it, and a
  component that renders a secret control marks the path bound on its own
  **host**, which is where such a binding actually lives. Covered by unit
  tests and a new Playwright lane (`tests/shadow-secret.pw.ts`), because
  happy-dom is not a trustworthy witness for boundary behaviour.

- **A `[data-tosi-secret]` region did only half its job**, in light DOM as
  well. It withheld the marked element's rendered content, but never marked
  the paths bound to controls _inside_ it, so `read()` of those paths returned
  cleartext. The attribute is plainly a region marker — `contentWithheld` asks
  `closest('[data-tosi-secret]')` — so it now covers its subtree's bindings.

- **A subclass adding `initAttributes` silently dropped the base class's.**
  `_resolveInitAttributes()` ended in a bare `return this.initAttributes` — a
  _static_ lookup, which a subclass's own static shadows entirely — so

      class Base extends withAttributes({ label: 'base' }) {}
      class Sub extends Base { static initAttributes = { extra: 7 } }

  lost `label` from the instance **and** from `observedAttributes`, severing
  reflection in both directions with no error. The contract branch twenty
  lines above already did this merge, and its comment called the omission the
  defect it is; the two branches disagreed about the same question, decided
  only by whether a contract happened to be present. This is the migration
  shape the docs recommend, so it shipped documented and broken in 1.10.0's
  first tag. The whole prototype chain now merges, subclass winning per key.
  Related: `withAttributes` typed its `static initAttributes` as the exact
  literal type, making that same subclass a TS2417 static-side conflict — the
  typing forbade what the docs recommended. The static is now typed wide; the
  instance keeps its precise type.

- **`observe()` no longer INVOKES the action you asked it to watch.** A boxed
  proxy over a function reports `typeof === 'function'`, so
  `agent.observe(app.saveOrder, cb)` classified the action as a filter
  predicate and the path-listener **called it on every settled touch** — no
  scope check, no `call` permission check, and no `call:` entry in the audit
  ledger, so the invocations were invisible. Your callback never fired unless
  the action happened to return truthy. The path is now resolved before the
  argument is classified: a path ref resolves, a genuine pattern does not.

- **`when()` rejects instead of throwing synchronously.** Its guards threw out
  of a promise-returning method, so `agent.when(p, f).catch(handle)` — no
  `await` — got an uncaught exception. The CHANGELOG, the commit message and
  the test all said "rejects"; the test could not tell, because
  `try { await … } catch` catches both.

- **`log()` stays readable after `disable()`**, deliberately, like `version`.
  The natural incident flow is revoke-then-audit, and the ledger is closed
  over, so refusing there left no door at all. A historical record grants no
  capability.

- **The un-observe function returned by `observe()` no longer throws after
  `disable()`.** It still held its listener after `disable()` had unobserved
  and cleared the set, so an app following the documented reconfigure flow
  ("enable auto-disables the previous surface, then the app runs its own
  cleanup") threw on the first `off()` and skipped every teardown line after
  it.

- **`tosijs/debug` and `tosijs/safe` could publish as broken subpaths.**
  `buildSite()` wipes `dist/` on every run — dev server included — and a dev
  run rebuilds only five of seven bundles, so the release checklist's own
  order (build, then browser tests, then publish) deleted them between build
  and publish. A publish from that tree threw `ERR_MODULE_NOT_FOUND` on both.
  Both bundles are tracked in git, and both `bun run build` and
  `prepublishOnly` now refuse when any `package.json` `exports` target is
  missing **or present but untracked** — the first version of those gates used
  `existsSync`, which passed over a commit that no longer contained them. Root cause filed upstream as tosijs-ui#130.

- **`observe()` accepts patterns again, and refuses them honestly.** It has
  always passed its argument straight to the path-listener, which also takes a
  `RegExp` or a predicate — undocumented, but used by the docs' own "redraw on
  any change" examples. That was invisible to the type (`path: string`) and to
  the unit suite, so widening the type for proxies broke every one of them.
  Now typed (`AgentObserveRef`), allowed under `expose: 'all'`, and refused
  under a manifest with an explanation — a pattern cannot be checked against a
  manifest, and it used to fail there with a raw
  `path.startsWith is not a function`.

- **A live doc example threw.** The `this.X` → `dynamic(this).X` rewrite escaped
  the code and edited the `/*# … */` doc block, putting a module-private helper
  into a published ` ```js ` example — so the component reference threw
  `ReferenceError: dynamic is not defined` on the doc site and in the epub, and
  again on every keystroke. The example had declared `value = ''` all along, so
  the line was correct before it was "fixed". Nothing caught it: the Playwright
  lane harvests ` ```test ` fences only.
- **Two comments described a fix that was never written.** They promised these
  members were "declared by interface merging below"; the merge was abandoned
  when `tjs convert` rejected it (tjs-lang#49) and the comments outlived it,
  leaving a `value` JSDoc orphaned above an unrelated private field — so the
  published types documented a tracking `Set` as the component's value.
- Prettier formatting on the files the #36 work touched (`bun run build` does
  not gate on it).

### Changed

- **`Component` no longer declares `value` — declare it in your component.**
  This was true in 1.10.0 and undocumented, which is what made it a defect.
  `value = 0`, `declare value: T` and `get value()` are all legal, and that is
  exactly why the base class cannot pick one: a base property makes
  `get value()` a TS2611, a base accessor makes `value = ''` a TS2610. The
  runtime already required an own `value` descriptor (or a `contract.value`).
  Now documented in Migration.md with the three forms and the one case that
  needs a new line.

### Breaking (types only — no runtime change)

- **`Component`'s `[key: string]: any` index signature is gone**
  ([#36](https://github.com/tonioloewald/tosijs/issues/36)). An index signature
  on a class propagates to every subclass, so this compiled cleanly in _any_
  component:

  ```ts
  class Thing extends Component {
    greet() {
      this.definitelyNotAMethod() // no error
      const n: number = this.alsoNotAThing // no error, and it typed as number
    }
  }
  ```

  It was reported after five methods were lost to a mis-splice: typecheck
  green, 312 tests green, and the failure found by clicking on the page. That
  is the worst shape a type error can have — the tool that exists to catch it
  reports success, so you trust it and look elsewhere.

  **Nothing changes at runtime.** What changes is that `tsc` now tells you the
  truth about your own components.

- **Migration: move `static initAttributes` into the class header.** Attributes
  are now typed from the _value_, so there is no second declaration to keep in
  step — and this is a **move**, not an addition:

  ```ts
  // before — `this.month` was `any`
  export class TosiMonth extends Component<MonthParts> {
    static initAttributes = { month: NaN, year: NaN, selectable: false }
  }

  // after — `this.month` is a number
  export class TosiMonth extends withAttributes({
    month: NaN,
    year: NaN,
    selectable: false,
  })<MonthParts> {}
  ```

  Measured on tosijs-ui: `month.ts` went from **44 errors to 0**. Across the
  project, **413 of 415** errors are this one pattern, at roughly one migration
  per component. The other 2 were a genuine bug the index signature had been
  hiding (`this.elements` — a static reached through an instance).

- **`static initAttributes` is NOT deprecated and is not going away.**
  `withAttributes()` _sets_ it, and it remains the only way to add attributes
  to an **existing** component class (`withAttributes` always extends
  `Component`). The two compose: build a base with `withAttributes`, extend it
  and add more with `static initAttributes`.

- **`TosiComponentSpec.type` / `TosiPackagedComponent.type` are now typed as a
  CLASS** (`ComponentClass<T>`), not as `Component<T>`. They always held a
  constructor; the instance-type declaration was wrong, and invisible because
  the index signature made _any_ object structurally assignable to `Component`
  — so those public fields accepted anything at all.

### Added

- **`withAttributes(attributes)`** — declares a component's attributes as a
  value and types them on `this`. Available as a normal export and through the
  blueprint hydration factory, so blueprints can use it too. Computed
  attributes (`Component.computed()`) are deliberately excluded from the
  declared shape: the class implements those itself, so declaring them twice
  was the bug. A computed setter may call `this.queueRender()` — verified
  non-re-entrant.
- **`ComponentAttrs<T>`** — the declaration-merging alternative, for a class
  you cannot restructure:
  `export interface Widget extends ComponentAttrs<typeof Widget.initAttributes> {}`

### Fixed

- Three separate class/instance confusions inside the library, all masked by
  the index signature: `elementCreator()` and the shadow-style resolver both
  cast the class to the _instance_ type inside static methods, and the two
  spec interfaces above. Every static access through them was wrong.
- Members the library used but never declared — `value`, `_value`,
  `defaultValue`, `handleResize`, `onResize`, `_onResize` — are now reached
  through a named `dynamic()` seam inside the library rather than by every
  subclass paying for an index signature.

  **`Component` therefore no longer declares `value`.** Declare it in your own
  component (`value = 0`, `declare value: T`, or `get value()`) — all three
  shapes are legal, which is precisely why the base class cannot pick one: a
  base property makes `get value()` a TS2611 and a base accessor makes
  `value = ''` a TS2610. The runtime already required this. See Migration.md.

## [1.9.2] - 2026-09-03

### Fixed

- **A held boxed proxy is now a live view of its path, not a snapshot of the
  object it was created over** ([#35](https://github.com/tonioloewald/tosijs/issues/35)).

  ```js
  const store = tosi({ doc: { name: 'empty' } })
  const held = store.doc // captured once, e.g. in a field
  held.tosi.value = { name: 'loaded' } // the write ALWAYS worked
  held.tosi.value.name // was 'empty' forever — now 'loaded'
  ```

  `.value` resolved the path for **scalar** proxies and returned the captured
  target for **object** proxies, so the two halves of one API disagreed. That
  asymmetry is what made it cost an afternoon downstream: it presents as a
  failed _write_, so every hypothesis goes to the writer. `valueOf()`,
  `toJSON()` and therefore `JSON.stringify()` were stale too — the worse half,
  because serialization is implicit and a stale object travels into a fetch
  body with nothing at the call site to suggest it.

### ⚠️ Potentially breaking — a bug fix you may have been relying on

This is a fix, and the suite passed both before and after it. But code written
against the old behaviour can change meaning, so it is called out rather than
buried. Four observable changes, each pinned by a test that fails on 1.9.1:

- **A held proxy to a deleted key now reads `undefined`** instead of the value
  it was created over. `held.value.x` throws where it used to work.
- **An INDEX path names a slot, not an item.** A held `rows[0]` is a live view
  of _index 0_, so after a splice or reorder it reports a **different item**,
  silently. Use the id-path form (`rows[id=x]`) when you mean the item — that
  is what id-paths are for, and it follows the item across a reorder.
- **`valueOf()` / `toJSON()` / `JSON.stringify()` follow the registry**, so
  anything that serialized a held proxy now emits current data.
- **A held proxy no longer retains the object it was created over**, which is a
  behaviour change if you were (accidentally) relying on it to keep a replaced
  graph alive.

If you were depending on a captured proxy as an immutable snapshot, take one
explicitly: `structuredClone(proxy.value)` at capture time.

## [1.9.1] - 2026-09-02

### Changed

- **No `bind*` element-prop shortcut is deprecated any more.** `bindText`,
  `bindEnabled` and `bindDisabled` no longer warn in any form (`bindValue` and
  `bindList` never did).

  1.9.0 narrowed the deprecation to the _proxy_ form, on the rule "deprecated
  iff a plain prop expresses it exactly". The rule is sound and the narrowing
  was right, but it left deprecation-ness depending on the **value** — which
  TypeScript cannot express. So the typings carried no `@deprecated` while the
  runtime still warned: a typings/runtime mismatch introduced while fixing the
  previous one, reported by tosijs-ui against the published 1.9.0.

  Removed rather than re-marked, because the nudge was never worth much:
  `bindText` is barely more writing than `textContent`, and the shortcut is the
  **only** form that binds a path string (`textContent: 'path'` sets literal
  text; `disabled: 'path'` is a non-empty, always-truthy string that
  permanently disables the control). That made it console spam in someone
  else's build for a stylistic preference. The preference now lives in the
  types and the docs, where it costs nobody a log line.

## [1.9.0] - 2026-09-02

**The agent surface exposes nothing until you say so** — and the library stops
warning its own users about API they never wrote.

### Breaking

> **A breaking change in a MINOR, deliberately.** Semver says this wants 2.0,
> and it is not waiting: the agent surface is marked EXPERIMENTAL, shipped in
> 1.8.0 five weeks ago, and the break makes it _less_ permissive — code that
> keeps working keeps working, and code that stops was reading state it never
> declared. Deferring to 2.0 would mean knowingly leaving a default that leaked
> secrets in four distinct ways. **Restoring the old behaviour is one word**
> (`expose: 'all'`), and the surface says so at runtime.
>
> One break is _compile-time_: `describe().exposure`'s union changed, so
> `'read-only'` / `'introspection'` no longer typecheck. Nothing else in
> tosijs — `Component`, `bind`, `tosi`, the element factories — changes.

- **`enableAgentInterface()` with no manifest now exposes NOTHING.** It used to
  mean "read-only over the entire registry": every state root, every value,
  every bound element on the page, published to `globalThis.tosiAgent` and to
  any WebMCP host, on one unargumented call. `describe()` now reports an empty
  app and every verb refuses.

  This is the root-cause fix for four separate secret leaks found across four
  review rounds of 1.8.3. **Every one of them was reachable only in that
  default posture.** Each was patched where it was found — `boundValue`, then
  the list-redaction walk, then the same walk's descent, then `describe()`'s
  live-DOM harvests — which was four symptoms of one permissive default. An
  allowlist would have made all four unreachable.

  Undeclared state is now **absent, not redacted**: it never enters the map,
  the elements bound to it never appear in `wiring`, and reads refuse the path.
  Redaction returns to its honest role — defence in depth for what you _did_
  declare, and the only guard under `expose: 'all'`.

  **To restore the old behaviour, say so**: `expose: 'all'` while developing
  (it warns), or `expose: { roots, actions }` to declare a surface. Nothing
  else changes; the manifest path already did all of this.

- **The closed posture maps nothing — including the DOM.** The first cut of
  this change gated only _state_, and `describe()` still returned wiring
  records for a bare `<a href>` (tokens in query strings), a contenteditable
  (a user's live draft), a self-declaring custom element (its private action
  namespace and attribute defaults) and the entire structural tier — including
  **a heading printing the very secret `read()` refused on the next line**, in
  the posture that logs "nothing is exposed". Of five ways an element could
  become `wired`, only two consulted posture. There is now one gate on the
  walk rather than five conditions to keep in step.
- **A MANIFEST closes the DOM walk too.** The first attempt at the above put
  one gate on the walk keyed to the _closed_ posture — which closed the closed
  posture and left the **manifest** posture, the one this page calls the
  production floor, publishing exactly what `read()` refuses: a token in an
  `<a href>`, a user's live contenteditable text, a private component's
  description and action namespace, and the rendered text of a binding to an
  undeclared path. Under any allowlist an element now earns its place on the
  map by being _declared_ — an in-scope binding or an in-scope handler — never
  by merely existing in the DOM.
- **The harvest guards can see out-of-scope bindings.** `boundPaths` was built
  after the publishing loop's in-scope filter, so an element bound only to
  undeclared paths reached the secrecy guard with an empty list and its text
  was published. Scope-filtering what is _published_ is right; scope-filtering
  what the guards can _see_ is what let it out.
- **`aria-labelledby` / `aria-describedby` cannot launder a secret.** Those
  resolve an id to any node in the document, while every other guard is a
  subtree query — so a heading labelled from a `data-tosi-secret` span
  published it, and an element whose own record was correctly suppressed had
  its content republished as a neighbour's label.
- **`exerciseContract()` no longer reports a false green.** It classified
  "the surface refused before any contract ran" by substring-matching the
  refusal's prose, which coupled a security gate to its own wording. 1.9.0
  rewrote every message: all three substrings became unreachable and the
  refusal that _does_ fire ("is callable, not writable") matched none, so a
  contract of nothing but `$counterexamples` returned `{ passed: 2, failed: 0 }`
  — identical to a validated run, in an API consumers run in their own CI.
  Refusals now carry `err.tosiRefusal`; `isAgentRefusal()` is exported.
- **The structural tier obeys scope, secrecy and `aria-hidden`.** It re-visits
  elements the main walk deliberately rejected — and read their `textContent`
  with none of the main walk's guards, defeating all three independently _in
  every posture, including a correctly-narrowed manifest_. A heading bound to
  an undeclared path published what a manifest refused; a heading containing a
  `data-tosi-secret` descendant laundered the author's own opt-in.
- **`describe().exposure` values renamed**: `'read-only'` → `'closed'`,
  `'introspection'` → `'all'`. The old names described a posture that no longer
  exists — `'read-only'` now reads nothing.

- Internally, every disclosure gate that asked "is there a manifest?" now asks
  "is an allowlist in force?". They were the same question until the default
  became closed, after which the old one would have kept harvesting live
  control values, root names and actions for a caller who exposed nothing.

### Security

- **`describe()` no longer publishes what `read()` refuses.** `boundValue()`
  redacted on a DOM record's own flag and never consulted the PATH, violating
  the invariant the module states out loud. Two shapes leaked, both in the
  **read-only default posture** and both through `tosi_describe` — the one
  WebMCP tool published in _every_ posture, while `tosi_read` sits behind a
  gate precisely because reads are considered too much to publish unasked:
  an element bound to an **ancestor** of a secret serialised the whole subtree,
  and an element bound to the **exact** secret path with a non-value binding
  leaked too (nothing of the value reaches the DOM, so the record's flag is
  false). Pre-existing in 1.8.0–1.8.2.
- **Reading a list no longer hands back the secrets inside it.** Secrets are
  learned from bound controls, and a control in a list template binds through
  one spelling while the redaction walk used another — so `read('rows')`
  returned every secret it contained in cleartext. Every spelling that can name
  a row is now tried: bracket index, dot index, and each registered id-path.
- **`describe()`'s live-DOM harvests no longer publish secrets either.** Three
  harvests read the DOM directly; one gated on secrecy and two gated on
  nothing, so a secret reached the map as `text` or as a contenteditable
  `value` while `read()` refused it — in the read-only default posture. Three
  shapes, and no single signal covers them: an element **bound** to a secret
  path without being a secret control itself (no flag at all), a secret
  `<select>` that redacted its `value` and printed the option text beside it,
  and a contenteditable carrying the author's own `data-tosi-secret`. All three
  now suppress the harvest while keeping `secret: true` on the record, so
  suppression does not read as absence.

- **Differently-spelled paths no longer leak.** `rows[0].pw`, `rows.0.pw` and
  `rows[id=r1].pw` name the same value and had no string relation, so the
  redaction missed all but the spelling the binding used. This was **not** only
  an agent constructing an odd query: tosijs's own id-path synthesis records
  both spellings on an ordinary write, so `changes()` handed them over side by
  side with the agent constructing nothing — and a manifest did not contain it,
  because the aliased path is _inside_ the declared root and declaring the
  manifest is what turns reads on. Now fails closed: an index-spelled path into
  an array that has a registered idPath and a secret beneath it is treated as
  secret, comparing the part after the index so ordinary fields still describe.
- ⚠️ **Narrowed, not closed: [#32](https://github.com/tonioloewald/tosijs/issues/32).**
  The containment above is a conservative rule, not full canonicalisation of a
  queried path. An array with no registered `idPath`, or a spelling the rule
  does not anticipate, can still diverge. Treat the agent surface as a
  disclosure boundary, not a redaction guarantee.

### Performance

- **`read()` over a secret-bearing collection is no longer quadratic.** Every
  node of a read tested secrecy by linearly scanning every known secret path,
  so a page whose _secret count_ grows with its row count read quadratically:
  800 password-bound rows took **686ms**, growing 4.1× per doubling. Now
  **5.0ms** and linear. `extendsPath` is a segment-boundary prefix test, which
  makes the two predicates exact restatements — an ancestor walk for "is this
  secret", a precomputed prefix set for "does this contain a secret" — so the
  guarantee is unchanged; a 54-query differential corpus (29 of them
  redacting, and covering descent beneath a secret, dot/bracket/id spellings,
  and name-prefix siblings) returns byte-identical output before and after.
  The ordinary shape — a few secrets and many rows — was already linear and
  sub-millisecond, and still is.

### Changed

- **The `bind*` deprecation rule now applies uniformly, and depends on the
  VALUE.** A shortcut is deprecated iff a plain prop expresses it _exactly_:
  true for a **proxy** (`{ textContent: proxy }`, `{ disabled: proxy }`), false
  for a **path string**, where `textContent: 'path'` sets literal text and
  `disabled: 'path'` assigns an always-truthy string that permanently disables
  the control. So `bindText` / `bindEnabled` / `bindDisabled` warn only for the
  proxy form; the string form is legitimate and silent. tosijs-ui reached this
  independently for `bindText` — it is the same argument that kept `bindValue`
  and `bindList`, and applying it to only those two was the inconsistency. The
  published `.d.ts` no longer marks the whole prop `@deprecated`, which had
  been striking through correct code in every editor.

### Documentation

- **The exposure ladder is documented consistently.** `agent-surface.md` still
  taught "read-only introspection — what a bare `enableAgentInterface()` gives
  you" _directly beneath_ "Off (default) — nothing", and that contradiction
  shipped in the served site. `src/webmcp.ts`'s doc block still described the
  no-options default as read-only over the whole registry while its own code
  comment twenty lines below said the opposite, and its worked example used a
  posture where every generated tool refuses. Also fixed in
  `one-user-interface.md` and the scaffolder's generated README — which
  `bunx tosijs create` writes onto a user's disk, and which no test read until
  now.
- **`Migration.md` has a 1.9.0 section**, which is the one page whose job is
  announcing breaks.
- **The agent docs now document secrets at all.** The page never mentioned
  redaction, so neither the guarantee nor its limit was discoverable. Adds a
  _Secrets_ section: secrecy is a property of the path (it follows the path to
  every element bound to it and to every field beneath it), it is one-way for
  the session, and — stated plainly — it is **not** a defence against script
  running in your own page, which can read the state directly. It exists
  because `describe()` output is built to leave the machine. Scope remains the
  real control; #32 is called out inline.

### Fixed

- **`bind` composes instead of clobbering.** A container can be list-bound
  _and_ carry its own binding. Previously one order silently dropped the
  caller's binding and the other **destroyed the entire list**, with no error.
  Fixed at both addresses that fold element props — `create()` and
  `Component.hydrate()` — via one shared helper.
- **A `null` row no longer takes the agent surface down.** `read`, `describe`
  and `changes` all threw on a list containing a null element, and `changes`
  threw inside its coalescing loop, killing every subsequent poll.
- **`elements.div(proxy)` no longer warns.** The most idiomatic call form in
  the library emitted a deprecation warning for a key the caller never wrote.
- **`.tosi.listBinding()` no longer warns**, and its default content no longer
  uses a deprecated key.
- **Deprecation messages you can actually type.** Two told users to write props
  keys that do not exist, and following the `bindEnabled` advice literally
  shipped a **permanently disabled button**. They now branch on whether the
  value is a proxy or a path string, and say SPREAD where a spread is meant.

### Changed

- **`bindList` is no longer deprecated, and `.tosi.listBinding()` returns the
  same shape it always did.** `.tosi.listBinding()` is _sugar over_ `bindList`,
  so deprecating the primitive made the recommended API warn its own callers
  from inside itself — and the warning could not even be phrased as a props key
  (_"Use `{ .tosi.listBinding(): ... }`"_), because the suggested replacement is
  a spread, not a prop. That was a category error, and routing around it rather
  than questioning it produced a silent list-destroying `bind` collision and a
  breaking change to a documented public return shape. Both are now moot.

  **The rule, stated so it does not recur: a `bind*` shortcut is deprecated iff
  a plain prop expresses it exactly.** `bindText` → `textContent`,
  `bindDisabled` → `disabled`, `bindEnabled` → `disabled` inverted — all
  deprecated, and none saves more than a few characters. `bindValue` (two-way;
  `value: proxy` is one-way only) and `bindList` (needs a `<template>` sibling
  and options) have no plain-prop equivalent and are **kept**.

- The inline `bind` form now forwards `options` to `bind()`'s fourth argument;
  it silently dropped them before, which is why a list binding could not be
  expressed without the deprecated key.
- `ElementProps.bind` accepts a single inline binding or an array.
- Bundle budgets raised ~1 kB across the board for the above.

## [1.8.2] - 2026-09-01

### Changed

- **All 27 `Xin*` type names are now `Tosi*`, with the old spellings kept as
  `@deprecated` type aliases.** The library is tosijs; these names were
  xinjs-era. The blueprint five were renamed in 1.7.6 — the other **22**
  (`XinStyleRule`, `XinStyleSheet`, `XinStyleMap`, `XinObject`, `XinBinding`,
  `XinProxy`, `XinProps`, `XinEventHandler`, …) were simply missed, and
  untracked, for four releases. They were in the _documented_ API: the
  component reference told you to type a stylesheet as `XinStyleSheet`.

  **Nothing breaks.** The aliases are type-only — no runtime cost, no bundle
  cost, and old and new spellings are assignment-compatible in both directions
  (verified by compiling a consumer against both). They are **scheduled for
  removal in 2.0**, stated in the alias block itself so this does not drift a
  fifth time.

- The `<xin-slot>` runtime tombstone is unaffected and still warns — that is
  markup, not a type, and it keeps misplaced content composing until renamed.

### Fixed

- **The DOM-free gate no longer misdiagnoses an old `node` as a broken bundle.**
  Both copies spawned whatever `node` was on PATH and blamed the _artifact_ for
  any non-zero exit, so on a machine whose default node predates modern ESM it
  reported `dist/state.js requires a DOM` — confident, specific and wrong,
  sending you to debug a shipped bundle instead of your toolchain. They now
  distinguish cannot-run from found-a-problem: below node 20 they skip **out
  loud**, saying the artifact is UNVERIFIED; at 20+ the gate is unchanged and
  still fails closed. Found by running the new shared `release-doctor` Tier 0
  script against tosijs.

## [1.8.1] - 2026-08-30

**The attribute API everyone uses was invisible to agents.** A component
declaring `static initAttributes` — the terse form nearly every component uses,
and until now the only one the component reference documented — appeared in
`describe()` with **no attribute description at all**. The identical component
declaring `contract.attributes` was fully described. So 1.8.0's headline
feature systematically under-described real applications, and the population it
under-described was the majority one.

> **🚧 THE CONTRACT API IS IN FLUX.** `ComponentMap` / `static contract` /
> `expose.contract` will change shape **without a deprecation cycle** while the
> layering questions settle (tosijs#29, #30) — how `contract.attributes` and
> `initAttributes` divide the work, and whether an integrator's overlay may
> _embellish_ a component's own declaration rather than replace it wholesale.
> Changes will land in patch and minor releases and will be called out here.
>
> **Nothing else in `Component` is in flux.** `initAttributes`, `content`,
> `parts`, form association and the rest are stable — and if you want stability
> today, `initAttributes` is the answer: it is stable, terser, and as of this
> release described to agents identically.

### Fixed

- **`describe()` now reports a component's attributes however they were
  declared** (#29). Types are inferred exactly as the attribute machinery
  infers them — from the default, including through a `Component.computed()`
  marker, whose `shape` is the type example. A `contract.attributes` entry
  still wins per key, being the richer statement.

  Deliberately gated on an element already being _wired_, and it never makes
  one wired: declaration remains the announce signal. Every component has
  attributes, so letting them announce would flood the map with every custom
  element on the page.

### Changed

- **`initAttributes` and `contract.attributes` now COMPOSE instead of throwing**
  (#29). `initAttributes` **declares** (name, default, inferred type);
  `contract.attributes` **enriches** (`enum`, `const`, and whatever a
  registered schema engine adds). Declaring both is the intended shape.

  The old rule was wrong twice over: the same two declarations _split across a
  prototype chain_ already merged cleanly — identical intent, opposite
  outcomes, decided only by where you wrote them — and "one source of truth" is
  a property of an attribute **name**, not of a class, so two disjoint
  declarations threw despite creating no ambiguity.

  A contract entry **may now omit `default`** when `initAttributes` supplies
  one, so constraining a single attribute costs one line rather than a rewrite.
  With no default anywhere it still throws, naming the attribute.

- **The "ideally attributes live in the contract" nudge is gone.** Its only
  real force was _"so one declaration feeds … the agents"_ — true only because
  `initAttributes` never reached `describe()`. It does now.

### Documentation

- **`static contract` is documented in the component reference** (#28), which
  previously mentioned `initAttributes` nine times and contracts zero times
  while contracts were documented thoroughly in `agent-surface.md` — a file
  nobody opens to build a component. The two APIs were taught in disjoint
  documents with the relationship stated nowhere, which is how an agent
  building a component discovered the old throw by hitting it. The
  `initAttributes` section now forward-references the contract, so neither can
  be read alone and mistaken for the whole story. `CLAUDE.md` gets the
  conventions bullet four consecutive pre-release reviews asked for.

### Build host

- `tosijs-ui` 1.9.4 → **1.12.0** and the duplicated `watchPaths` array deleted
  (tosijs-ui#49 is fixed: `resolveWatchPaths()` folds `docPaths` in).
- `tjs-lang` 0.10.1 → **0.13.6**. 0.13.0–0.13.5 were unusable — `convert`
  stripped `new` from every class declared in the module being converted, so
  the output threw at _import_ time on a static field initialiser (tjs-lang#37,
  fixed upstream the day it was filed). Caught by the published-bundle smoke
  gate and by nothing else: all unit tests passed under the broken toolchain,
  because they exercise `src/` and the bug was in the emitter.

  Build-host only — no consumer-facing bundle changed as a result.

## [1.8.0] - 2026-08-25

**One source of truth for state, UI, and AI.** An app's affordances — what
exists, what it's bound to, what it does — have always been recorded by tosijs
in order to _run_ the app. 1.8.0 lets you ask for them.

The three release candidates below carry the detail; this is what changed since
**1.7.9**, and what to know before upgrading.

> **Licence: tosijs is Apache-2.0 as of 1.8.0** (BSD-3-Clause through 1.7.x).
> It adds an explicit patent grant and a patent-retaliation clause, cannot be
> combined with **GPLv2-only** code (GPLv3+ is fine), and — the part semver
> cannot express — §4(d) asks **redistributors** to carry the [`NOTICE`](./NOTICE)
> text. Hosting an app you built with it is unaffected.

> **This release deviates from semver, and says so.** A minor is supposed to be
> additive and most of this is. But it also removes `data-ref` (the only
> pre-announced removal), removes `<xin-slot>` markup handling, reduces
> `<xin-blueprint>`/`<xin-loader>` to warning tombstones, and flips two
> behaviours — `on<Event>` member precedence, and what a type-contradicting
> attribute write does — neither of which carried a prior deprecation warning.
> A consumer on `^1.7.9` receives all of it on a routine update. The deprecated
> _exports_ survive as working aliases naming 2.0, so nothing breaks at import;
> the markup path and the two flips are the real exposure.

> **Size, measured rather than claimed.** The agent surface is opt-in and shakes
> away if you never import it — **6.7 kB gzipped** in a real app bundle, 10.6 kB
> with the schematic renderer and the accessibility audit. But 1.8.0 is **not**
> size-neutral: an identical consumer app touching no agent API measured
> **+2.9 kB (+13.7%) against 1.7.9**, because the contract seam, the
> path-segment guard and the binding bookkeeping sit on the ordinary path. If
> that matters more than the features, `tosijs/core` is the smaller door.

### The headline

- **The agent surface** — `enableAgentInterface()` gives
  `describe`/`read`/`write`/`observe`/`call`/`changes`/`when`/`log` over the
  wiring tosijs already records. **Read-only by default**; a manifest scopes
  what may be _seen_, and `write: true` is a separate grant.
  `agent.version` reports shape and capabilities so consumers can ask instead
  of duck-typing.
- **WebMCP auto-registration** where the browser provides a host, with the tool
  set _generated_ from the map rather than hand-written.
- **Contracts at three granularities** — app (`expose.contract`), component
  (`static contract`), and inline (`contract` on an element) — executable as
  tests via `exerciseContract()` / `exerciseComponent()`.
- **An accessibility audit over the same map** (`auditAccessibility`), because
  the records that serve an agent are the records that catch anonymous
  affordances, unnameable actions, contrast and target-size failures.
- **`tosijs/core`** (slim) and **`tosijs/state`** (DOM-free, imports under bare
  node) as new entry points.
- **The scaffolder**: `bunx tosijs create app|component|blueprint`.
- **Computed attributes**: `Component.computed('')` declares an attribute your
  class implements with an ordinary `get`/`set`; tosijs wraps the setter so a
  change always re-renders, and markup reaches it.

### Closed by this release

tosijs **#18** (DOM-free entry), **#22** (`on<Event>` shadowing component
methods), **#23** (agent version/capability marker), **#24** (wrong-typed
attribute writes silently discarded), **#27** (computed/derived attributes).

**Known, still open:** **#26** — an unknown _key_ passed to `elementCreator` is
still absorbed by `ElementProps`' index signature and silently dropped. Note the
boundary, since 1.8.0 fixed its sibling: a wrong-_type_ write to a _declared_
prop is applied and reported (#24); an unknown _key_ is still dropped (#26).
Also open: **#17** (proxy-identity seam — `src/xin.ts` is unchanged in 1.8.0, so
fresh-proxy-per-access still holds), **#16** (semantic-parent accessor),
**#9** (virtual-list resize).

### A note on how this was built

Four adversarial pre-release reviews ran against this release. They found — and
this is the part worth publishing — a **secret-redaction regression in rc.2**
(reverted in rc.3, rc.2 is deprecated on npm), a caching optimisation that
corrupted `HTMLElement.prototype` page-wide, and a hardened build gate that
silently disabled the browser test lane. Every one passed the local test suite.
If you are relying on the agent surface's redaction guarantees, prefer 1.8.0
over any rc.

## [1.8.0-rc.3] - 2026-08-25

**Supersedes 1.8.0-rc.2, which is deprecated.** rc.2 shipped a secret-redaction
regression in the agent surface; if you installed it, upgrade.

### Fixed — security

- **`agent.read()` could return values it had promised to redact.** rc.2 added
  a cache to the secret-path scan, keyed on a binding-generation counter. The
  counter was bumped from three call sites, two of them inside a
  `dataBindings == null` guard — so only an element's **first** binding bumped
  it, and a control that _became_ secret afterwards was never re-learned. Five
  reachable paths returned cleartext where rc.1 returned `⟨secret⟩`:

  1. `type` flipped to `password` after a read (a show/hide toggle)
  2. `data-tosi-secret` added later — the author's explicit opt-in
  3. `autocomplete="cc-…"` set when a payment method is chosen
  4. a **second** `bind()` on an already-mounted element — permanent, because
     no DOM mutation follows to rescue it
  5. same-task append after a detached bind, and `cloneWithBindings()`

  Reachable under every posture, since `read`/`changes`/`when` share the path,
  and `tosi_read` publishes it to a WebMCP host.

  **The cache is reverted, not repaired.** Three of the five are _attribute_
  changes on an element that never re-binds, so no binding-shaped signal can
  observe them; correctness would need a MutationObserver on
  `type`/`autocomplete`/`data-tosi-secret` plus a bump at every binding
  mutation — at which point the ~24% saving is gone. The scan runs on every
  read again, over a selector narrow enough that this costs about 1.3µs.

  No disclosure is known to have occurred: the affected build was tagged `rc`,
  had no published dependents, and this project's own site binds no secret
  controls.

### Fixed

- **The `contractviolation` latch was one-way.** Bad value → event; valid value
  → nothing; the _same_ bad value again → silence, on both the event and the
  console. An app showing a validation banner could never re-show it after the
  user corrected and re-broke the field. The latch now clears on recovery.
- **`detail.repeated` is removed.** rc.2's notes advertised it as the way to
  tell repeats apart; it was hard-coded `false` at the only dispatch site and
  could never have distinguished anything.
- **tosijs#24 now covers every declared attribute type.** rc.2 fixed only
  string-declared attributes while the error message and the release notes
  claimed otherwise: `el.count = false` on a number-declared attribute read
  back `null`, and `el.flag = 'off'` on a boolean-declared one read back
  `true` — a value that inverts its own meaning. Warn-once per tag+attribute,
  so instances 2..N were silent.

### Added

- **Computed attributes.** `Component.computed('')` (or `false`) in
  `initAttributes` declares an attribute the class implements itself with an
  ordinary `get`/`set`. tosijs wraps the setter so a change always re-renders —
  you never call `queueRender()` — and the name joins `observedAttributes`, so
  markup changes re-render too. The argument is a _shape_, not a default:
  markup delivers strings and presence, so those are the two. A getter with no
  setter is a read-only derived attribute.

### Internal

- The internal-link gate had a blind spot over `src/docs/**` — including the
  file whose broken link rc.2 fixed — because it expanded `docPaths`
  differently from the site. It now expands them the same way.
- `bun start` no longer rewrites tracked `README.md`; both generators that
  write into tracked sources share one guard.
- Coverage for `contract-check`'s fail-open warning, and the record correction
  that the `tosijs-ui@1.9.4` pin rested on a peer constraint every 1.9.x
  already carries.

## [1.8.0-rc.2] - 2026-08-24

No API changes from rc.1 — this is the fix-and-gate pass over it. One
behaviour change worth reading if you listened to `contractviolation`, and one
documented claim that turned out to be false.

### Fixed

- **`contractviolation` fired on every binding pass, forever.** The
  `console.error` beside it is warn-once; the event was not. For an object- or
  array-valued contract the upstream identity guard never matches — the proxy
  returns a fresh object per access — so a persistently violating contract
  dispatched a bubbling event on _every_ pass for the life of the page.
  Measured with the fix bypassed: 6 events over 6 passes, still climbing.
  **Now once per element per distinct reason.** That changes what a listener
  counts — distinct violations rather than binding-dispatch frequency — which
  is the number you wanted. The latch clears the moment a VALID value
  arrives, so the event fires on entering a bad state and again on re-entering
  it after recovery — which is what a validation banner needs. The event is
  also now documented and tested, both of which it shipped without.
- **A type-contradicting attribute write now reads back as written**
  (completes tosijs#24). rc.1 applied and reported the write instead of
  silently discarding it, but the setter reflects to the attribute as a
  _string_ and the getter prefers the attribute — so `el.mode = false` on a
  string-declared attribute read back the truthy string `"false"`, which is
  precisely the bug the error message says it does not have. An external
  `setAttribute` still wins, and a correctly-typed write clears the override.
- **A node bound while detached now hydrates when inserted as the root.**
  `getElementsByClassName` is descendants-only, so an element that was itself
  bound was skipped. Affects cached dialogs and re-attached views.
- **`settings.quiet` means something.** It promised to silence "advisory
  warnings and friends" while being honoured at 2 of ~20 sites. Deprecations
  and the `on<Event>` collision advice now honour it; everything that reports
  something _wrong_ deliberately does not, and the docs now enumerate both
  lists.
- Three internal links that 404 on the deployed site (case-sensitive host,
  case-insensitive filesystem — they looked fine locally). One was from the
  README, which is the site's home page.

### Changed

- **The tarball is 5.48 MB → 3.81 MB unpacked** (packed 1.54 → 1.17 MB): the
  source maps for `module.debug.js` and `module.safe.js` are no longer
  published, since both bundles are EXPERIMENTAL and currently inert. The
  other five keep theirs.

### Documentation

- **A size claim was false, not merely stale.** The README said this release
  "tree-shakes to about 1.7.x's size when you don't use it". Measured: an
  identical consumer app importing no agent API went **20,995 → 23,862 bytes
  gzipped, +2.9 kB, +13.7%**. The agent surface genuinely does shake away
  (6.7 kB), but the contract seam, the path-segment guard and the binding
  bookkeeping sit on the ordinary path. The README now says so and points
  minimalists at `tosijs/core`. Size figures are now **generated** by the
  build rather than hand-maintained in four places.

### Internal — gates and de-duplication

Three gates were reporting green without checking anything: a bundle test that
skipped via a silent `return` (during `bun run build`, always), a gzip-budget
"test" that was three string assertions against the build script's source, and
a browser-tier gate asserting only that _something_ ran. All three now fail
when they should — each verified by making it fail.

The published-artifact list existed five times and had drifted (`main.js` was
built, kept and budgeted but never executed); it is now one declaration in
`bin/bundles.ts` that every gate derives from. Same treatment for the
CDN-entry export list, the curation predicate, and the own-`static contract`
lookup that was copy-pasted at six sites.

One performance fix: `agent.write()` no longer scans the document when no
inline contract exists — **roughly 6× faster** on a page with 2,000 bound
elements.

> **On that number.** It is a one-off measurement under happy-dom in a shared
> test process, not a benchmark: there is no benchmark harness in this repo, so
> nothing defends it against drift and it is a ratio rather than a wall-clock
> promise. Your numbers will differ. It is quoted because the shape of the win
> (skip a whole-document scan when nothing can match) is the part that
> generalises.

The second "fix" in this pair — caching the secret-path scan — **was reverted**
before release. It was a security regression: see the 1.8.0-rc.3 entry.

## [1.8.0-rc.1] - 2026-08-17

> Upgrading from 1.7.x? See **[Migration.md](./Migration.md)** — it lists the
> removals, the two behaviour changes that shipped without a prior
> deprecation warning, and the Apache-2.0 relicense.

> **This release deviates from semver, and it should say so.** A minor version
> is supposed to be additive, and most of 1.8.0 is. But it also **removes** > `data-ref` (the only removal that was pre-announced with a version),
> **removes** `<xin-slot>` markup handling, reduces `<xin-blueprint>` and
> `<xin-loader>` to inert warning tombstones, and **flips two behaviours** —
> `on<Event>` member precedence, and what happens on a type-contradicting
> attribute write — neither of which carried a prior deprecation warning. A
> consumer on `^1.7.9` receives all of it on a routine update. The deprecated
> _exports_ (`xinSlot`, `blueprint`, `blueprintLoader`) were restored as
> working aliases naming 2.0, so nothing breaks at import; the markup path and
> the two behaviour flips are the real exposure. We judged one honest note
> better than a 2.0 nobody is ready for — but you are entitled to know which
> promise was bent.

**One source of truth for state, UI, and AI.** An app's affordances — what
exists, what it's bound to, what it does — have always been recorded by
tosijs in order to _run_ the app. 1.8.0 lets you ask for them.

### Added — the agent surface

> **EXPERIMENTAL.** The agent surface, schematic renderer, audit and
> contract harnesses are new public API. What 1.x promises: the _record
> shape_ is a versioned contract (`agent.version.surface` plus an
> enumerable capability list), and we bump it rather than change the shape
> silently. Names and options may still move in a minor.

- **`enableAgentInterface()`** — one call exposes `describe` / `read` /
  `write` / `observe` / `call` / `changes(cursor)` / `when(path, predicate)`
  / `log`, installs `globalThis.tosiAgent`, and (where the browser provides
  `document.modelContext`) **auto-registers a generated WebMCP tool set** —
  verified registering _and executing_ in Chrome Canary 153 (as of
  2026-08<!-- as-of: 2026-08-21 | which Chrome verified WebMCP end-to-end -->).
  Nothing new is
  recorded: `describe()` assembles the picture from the registry, the
  binding metadata, and the handler wiring the framework already had.
  ~11 KB gzipped for the whole surface (agent + WebMCP + schematic +
  audit + contract harnesses), tree-shakeable if you never import it, and
  absent entirely from the `<script>`/CDN build.
- **The map is flat and legible**: one record per wired element, bound props
  as `"value ⟷ path"` (`⟷` two-way, `⟵` display-only), handlers as
  `{click: 'app.doThing'}`, plus geometry (`bounds`), live control state
  (`type`, `checked`, `focused`, `invalid`, `required`, `disabled`),
  resolved ARIA, `href`, `contentEditable`, and a structural tier
  (headings/landmarks/containers).
- **ARIA runs both ways.** `aria-label(ledby)`, `<label>` association,
  `aria-describedby`/`aria-description`, `disabled`/`required` and
  `aria-hidden` flow _into_ the map (the agent reads the page the way
  assistive tech does). Going the other way, a component's contract
  materializes into the **matching** slots: `description` →
  `aria-description`, `role` → `role`. It deliberately does **not** touch
  `aria-label` — a description is not a name, and the name belongs to
  content and the author (an earlier rc did stamp it, which made components
  announce developer prose instead of their own text). Describe a component
  for agents and screen-reader users inherit the description; declare its
  `role` and the accessibility audit's `missing-role` finding is fixed from
  the same declaration.
- **`agent.version`** — `{ surface, tosijs, capabilities[] }` (tosijs#23):
  ask what a surface _is_ instead of duck-typing it. Rides `describe()`
  output, and exposed as the `tosi_surface` WebMCP tool.
- **`auditAccessibility(map)`** — anonymous affordances, unnameable actions,
  missing roles, WCAG contrast, target size, placeholder-as-label. Pure over
  the description; `auditFlags()` turns findings into schematic flags so
  they can be drawn. It skips _loudly_ rather than passing silently whenever
  it cannot measure — computed styles weren't requested, or a background is
  transparent so the effective colour is unknown. Known divergence:
  `target-size` is currently decided twice (here and in the vendored
  renderer) and the two disagree on named icon-links —
  [tosijs-floorplan#4](https://github.com/tonioloewald/tosijs-floorplan/issues/4).

### Security posture — safe by default

Three modes, and the safest is the one you get for free:

| call                                                             | what it grants                                                                                                                                             |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enableAgentInterface()`                                         | **read-only introspection** — `describe`/`read`/`observe`/`changes`/`when`/`log` over everything; `write()` and `call()` refuse and say how to enable them |
| `enableAgentInterface({ expose: { roots, actions, contract } })` | the **production shape**: an allowlist — scoped **reads** and declared calls, nothing outside it visible                                                   |
| `enableAgentInterface({ expose: { roots, write: true } })`       | the same allowlist, plus permission to **change** what it scopes                                                                                           |
| `enableAgentInterface({ expose: 'all' })`                        | everything read/write/call, deliberately, with a warning on every transition into it                                                                       |

**A manifest scopes sight, not reach.** `roots` says what may be seen;
`write: true` is a separate grant to change it. Without that split the only
two reachable postures were unscoped-read and scoped-read-_plus-write_, so
the safest-sounding option granted the most, and "scoped reads, no writes" —
what a production surface usually wants — was inexpressible.
`describe().writable` reports which you have. Declared `actions` stay
callable either way, and a write can no longer land on (or above, or under)
a declared action, so `write('app', {})` can't wipe the action namespace.

Provenance arrows (`⟷`, `⟵`) are **structure, not content**: values and
harvested page text that contain them are neutralized to `<->` / `<-`, so a
string can no longer forge itself a live binding — which the schematic drew
as a real affordance and the audit reported on. Parsers should split on the
**last** occurrence. Secrets are a property of the **path**, not of a DOM
record: a path bound to a password (or hidden, or `autocomplete="cc-*"`, or
`data-tosi-secret`) control redacts in `read`, `changes`, `when` and inside
any ancestor read. And `__proto__`/`constructor`/`prototype` are refused as
path segments at the sink, which covers `agent.write()`, `share()` and
`sync()` at once.

`tosi_write` now requires **explicit `allowWrites: true`** — being in
introspection mode is no longer treated as consent to publish an
unvalidated write endpoint to the browser's tool registry. And
`bunx tosijs create app` scaffolds the allowlist form with a commented line
showing how to widen it while developing.

### Added — contracts, at three granularities

- **App level**: `expose.contract = { check, describe }` — a zero-dependency
  seam (the core knows a _check_, not a schema language). Sub-path writes
  are **routed, not bypassed**: a write under a contracted root is judged as
  the whole root it would produce. Refusals throw the _reason_ and land in
  the audit log. The blessed adapter now ships upstream as
  tosijs-schema's `agentContract()`.
- **Component level**: `static contract` (a `ComponentMap`) unifies contract
  - description + parts map + test fixture. `Component<typeof contract>`
    types `this.parts` from the declared tags — **the declaration is the
    type** — and subsumes `initAttributes`. Blueprints carry it too
    (`TosiComponentSpec.contract`, stamped at hydration).
- **Element level**: a `contract` prop on any element — declared where you
  build, aggregated into `describe().contract` by bound path, enforced on
  agent writes. **Declaration is distributed; curation is central** (a
  top-level contract supersedes everything beneath it).
- **Contracts are tests.** `exerciseContract()` writes every `examples:`
  entry through the real surface (and requires a faithful round-trip),
  refuses every `$counterexamples:` entry; `exerciseComponent()` verifies
  declared parts, methods, value examples, and serializable step tests.

### Added — the map, drawn

- **`schematicSVG(map)` / `rasterizeSVG(svg)`** — the affordance map as an
  SVG at true geometry, with an explicit grammar (bold = wired to act,
  `↔` = editable, `*` = required, red corner = invalid, `✕`/dot = toggle
  state, faded = disabled, faint dotted = structure, white-backed number =
  the record's index). Cramped elements draw bare and point at a legend
  instead of lying. Implementation lives in **tosijs-floorplan**, vendored
  at build time — tosijs keeps zero runtime dependencies.

### Added — scaffolding

- **`bunx tosijs create app|component|blueprint`** (`npx` too). Components
  scaffold in **blueprint form by default** — consumable straight from
  markup, zero-dependency bundles — with `--bare` for a plain class. Every
  template is born with a contract and a declared test, and passes
  `exerciseComponent()` out of the box. Replaces `create-xinjs-blueprint`.

### Added — entry points

- **`tosijs/agent`** — the agent surface, schematic renderer, audit and
  contract harnesses under one import, with a narrower type surface. It
  resolves to the _same file_ as `tosijs`: a separately-bundled agent
  surface carried its own copy of the state registry and described an empty
  app, so there is exactly one runtime copy, always. ESM consumers who never
  import it tree-shake it away.
- **The `<script>`/CDN build omits the agent surface** (~26 KB gz) — an IIFE
  cannot tree-shake, so it must not carry an opt-in feature. Load the ES
  module build if you want the agent surface from a script tag.
- **`tosijs/core`** — the library minus the blueprint loader, `share`/`sync`,
  `hotReload` and the agent surface (~24 KB gz — _smaller than 1.7.9's
  entire library_). Opt-in, because blueprints hydrate from _markup_:
  shaking their registration would fail silently. Slim core warns in dev if
  the page holds blueprint elements it can't hydrate.
- **`tosijs/state`** — the **DOM-free** state layer (~16 KB gz), importable
  in plain Node with no shim. Closes tosijs#18.
- Per-entry **gzip budgets** are asserted by the test suite, so the next
  unplanned kilobyte fails a build instead of shipping.

### Changed

- **Relicensed BSD-3-Clause → Apache-2.0**, adding an explicit patent grant
  and a patent-retaliation clause. (Apache-2.0 is incompatible with
  GPLv2-_only_ projects; GPLv3+ is fine.)
- An `on<Event>`-named component **member** is no longer hijacked by the
  elements factory's event sugar (tosijs#22): on a custom element, when the
  member already **holds a function** and the passed value is a function,
  the creator **assigns the member** instead of attaching a listener — and
  that name then carries no event sugar. A member declared but left
  undefined/null still gets event sugar (give it a function default if you
  want the assignment). Plain-element event sugar is unchanged: the
  platform's own handlers are lowercase (`onclick`), so they never collide
  with the camelCase sugar.
- A proxy event handler (`onClick: app.doThing`) is normalized to its path
  at registration, so it behaves identically to the string form everywhere.

### Fixed

- **A type-contradicting attribute write is no longer silently discarded**
  (tosijs#24): `false` written to an attribute declared `'on' | 'off'` used
  to remove the attribute so the _default_ read back — a feature explicitly
  turned off stayed on. The write now lands as given and reports once.
- Observers no longer require a DOM: the global binding dispatch returns
  early when there is no `document` (the state layer's precondition).

### Deprecated (still working; removed in 2.0)

- **`xinSlot()`, `blueprint()`, `blueprintLoader()`** — these were
  deprecated in 1.7 _without_ a named removal version, so they keep working
  through 1.x and now warn naming **2.0**. They create the modern elements
  (`<tosi-slot>`, `<tosi-blueprint>`, `<tosi-loader>`).

### Removed

- **`data-ref`** — the one deprecation whose 1.7 warning explicitly named
  1.8.0. Use `part="…"` (bare CSS-selector refs still work).
- **`<xin-slot>`** — the element. `xinSlot()` still works (see Deprecated).
- **`<xin-blueprint>` and `<xin-loader>` no longer function**, but the tags
  remain registered for one more cycle as **tombstones**: they render
  nothing and log exactly what to rename. An unregistered custom element is
  inert — no hydration, no error, no output — and a page using blueprint
  _markup_ has no import statement that could fail, so removing the
  registration outright would have been this release's only silent
  breakage. They go for real in 2.0.

### Build

- Every published bundle is **smoke-imported** during the build (loaded,
  with every export asserted defined). A `sideEffects` array — even an
  accurate one — had produced a bundle exporting names whose definitions
  were shaken away, with tests, `tsc` and lint all green; only executing the
  artifact caught it.

## [1.7.9] - 2026-08-07

### Fixed

- **`take()` transforms now work inside list templates (relative paths), and
  cloned rows no longer share a change-detection cache.** The take descriptor
  used to live in a closure that captured the template's `^.` paths forever —
  in a `listBinding` template the transform ran against `xin['^.…']`
  (`undefined`) instead of the row's value — and held ONE `lastInputs` memo
  shared by every cloned row, so the first row's update suppressed its
  siblings' (observed as one row transformed-wrong and the next not updated at
  all). The descriptor is now **data on the binding entry**
  (`DataBinding.take`): row instantiation rewrites its relative paths exactly
  like the entry's own path (both dispatchers — `touchElement` and list
  instantiation — route through a shared `applyDataBinding`), and the memo
  rides the per-element (per-row-cloned) take object. Also fixes one
  descriptor reused across two elements starving the second. Regression
  suite: `src/take-list-binding.test.ts`.

## [1.7.8] - 2026-07-27

### Fixed

- **A cached part that is detached (with no replacement) no longer makes
  `this.parts` throw (tosijs#21).** 1.7.7's self-healing re-validated cached
  parts with `isConnected` and re-resolved stale ones — but when a part had been
  _removed from the tree and not replaced_ (e.g. `<tosi-segmented>`'s optional
  `custom` input: a structural rebuild does `options.textContent = ''` and only
  conditionally re-appends it), the re-resolution found nothing and **threw**
  where 1.7.5 had leniently returned the detached node. That throw fired inside
  change handlers that destructure `this.parts` unconditionally, killing the
  handler _before_ it committed `this.value` — the "stale value, correct DOM"
  symptom on Firefox/WebKit. The cache now returns the previously-resolved
  (detached) node when no replacement exists; self-healing still wins when a
  replacement _is_ present; the throw is reserved for refs that never resolved
  at all. **1.7.7 is deprecated on npm.**
  - Verified against tosijs-ui's real `<tosi-segmented>` Playwright lane:
    Firefox went from 2/2 failing to green; WebKit 4/4; Chromium green.
  - New interaction coverage: unit tests for the detach-then-access pattern and
    the full click → change → `this.value`-commit round-trip, plus a real-browser
    Playwright test (`tests/value-commit.pw.ts`) running the same round-trip in
    every engine the lane covers.

## [1.7.7] - 2026-07-27

### Fixed

- **`this.parts.foo` now resolves your _own_ part — by ownership, not structure
  (tosijs#20).** A component's `[part]` elements are captured from its content
  when it hydrates, _before_ the content is inserted and before any nested
  sub-components hydrate or slot. At that moment the tree is exactly what the
  component built, so every `[part]` is unambiguously its own — regardless of how
  deeply it nests, whether it's projected through a `<tosi-slot>`, or whether a
  sub-component is light- or shadow-DOM. `parts.foo` returns the captured node
  (while it's still in the tree) and falls back to `querySelector` for
  lazily-built parts, static (cloned) content, or a part a `render()` replaced —
  so it never throws where 1.7.5 wouldn't. This supersedes **1.7.6, which is
  deprecated on npm** (its custom-element-boundary attempt broke `parts` for any
  component that lays its parts out inside a sub-component like `<tosi-tabs>`).

### Deprecated

- **`data-ref` as a `parts` fallback.** A fossil from when this was a React-style
  "refs" proxy, predating parts-as-binding. It still resolves (`parts.foo` →
  `[part="foo"]` → `[data-ref="foo"]` → CSS selector) but now warns once, and is
  removed from the documentation. It will be removed entirely in 1.8.0 — use
  `part="…"`.

Everything else from 1.7.6 is retained: the computed-property registration fix,
the `xinValue`/`xinPath`-on-`XinProps` fix (tosijs#19), the `Tosi*` blueprint
types, and the documentation overhaul.

## [1.7.6] - 2026-07-27

### Fixed

- **Light-DOM `parts` no longer reaches into nested components.** For a light-DOM
  component, `this.parts.foo` resolved via an unscoped `querySelector('[part="foo"]')`,
  so a component containing a nested instance (of itself or any component sharing
  `part` names) could get the **nested** component's element instead of its own
  (first pre-order match wins). Part resolution now stops at nested custom-element
  boundaries — a component's parts are the `[part]`/`data-ref` elements between its
  host and any nested custom element. Shadow-DOM components were already correctly
  scoped by the shadow boundary. (tosijs#20)
- **Registering an object with a computed (getter) property no longer crashes.**
  `tosi({ … })`'s set-trap shallow-unwrap loop rewrote every key, throwing
  `TypeError: Attempted to assign to readonly property` on a getter-only property.
  It now only rewrites writable data properties (and never invokes a getter just to
  register state), so computed properties are legal state: they resolve on read and
  see current dependency values.
- **`xinValue`/`xinPath` restored to `XinProps`.** In 1.7 they were dropped from
  `XinProps` but kept on `BoxedScalarAPI`, so `proxy.someObject.xinValue` failed
  `tsc` while `proxy.someScalar.xinValue` didn't — a silent, typecheck-only break
  invisible to `bun build`. Restored in parity (they still work at runtime). Prefer
  `.value` / `.tosi.value` in new code. (tosijs#19)

### Added

- **`TosiBlueprint`, `TosiFactory`, `TosiPackagedComponent`, `TosiComponentSpec`** —
  the canonical blueprint type names, matching the `<tosi-blueprint>` / `<tosi-loader>`
  tags. The `Xin*` spellings remain exported as `@deprecated` type aliases, so
  existing `import { XinBlueprint } from 'tosijs'` keeps compiling. Type-only; no
  runtime change.

### Changed

- Accessor documentation now leads with `.value` / `.tosi.value` (and `.path` /
  `.tosi.path`); the `tosiPath()` / `tosiValue()` functions are presented as the
  programmatic "works on any value / proxy-test" alternative.
- **(dev only)** `editableSources: true` in the site config enables the doc-site's
  in-browser "edit page source" / live-example "save to source" against local files.
- Build host bumped to tosijs-ui 1.7.2 (doc-site builder; not a runtime dependency).

### Documentation

- README sharpened: "Better apps with less code" case, an ecosystem table with
  tosijs at its heart (tosijs-ui, tjs-lang, react-tosijs, ngx-tosijs, tosijs-schema,
  tosijs-product, tosijs-3d), all `xin`-proxy references replaced with `tosi`/`boxed`,
  and the b8rjs → xinjs → tosijs history moved to a dedicated **tosijs history** page.
- New **Angular and tosijs** page (`tosiSignal`, zoneless-first, off-ramp); expanded
  **React and tosijs** page (`useTosi`, `reactWebComponents`).
- Building-Apps note: boxed proxies are minted fresh per access — never key on their
  identity.

## [1.7.5] - 2026-07-23

### Changed

- **The `on<Event>` member-collision warning now suggests a name by intent.**
  When a component defines an `on<Event>`-named member (shadowed by the elements
  factory's event-handler sugar), the warning previously offered only
  `handle<Event>`. It now distinguishes the two real cases: use **`handle<Event>`**
  for a handler function the component invokes (e.g. `handleClick`), or
  **`add<Event>Listener`** for a method that registers listeners for a synthetic
  event the component dispatches (e.g. `addClickListener`). The Component docs
  carry the same guidance. No behavior change — warning text and docs only.

## [1.7.4] - 2026-07-23

### Changed

- **Faster state→DOM dispatch.** The bound-element scans — the global "any state
  changed" observer, the `MutationObserver` that re-discovers inserted elements,
  and the list-binding relative-path refresh — now enumerate with
  `getElementsByClassName` (which gathers from the browser's class-name bucket
  index) instead of `querySelectorAll` (a whole-tree walk). Measured **1.6–2.6×
  faster** in Blink on the global scan, with the gap widening as the DOM grows —
  this is the library's hottest path, so it matters most in exactly the large,
  frequently-updating apps where it was slowest. The result set is identical; the
  scan is still snapshotted to a static array so `toDOM` mutations during dispatch
  can't perturb a live collection.

- **Renamed the data-binding marker class `-xin-data` → `-tosi-data`.** The last
  `xin`-era name in the runtime DOM. **Potentially breaking (unlikely):** if you
  were selecting or styling `.-xin-data` (an undocumented internal), use
  `.-tosi-data` — or better, bind your own class. This marker is required and
  retained (unlike the retired `-xin-event`): data dispatch starts from a _path_
  and must _enumerate_ bound elements, which a WeakMap can't do — the class is the
  DOM's queryable index. `getElementsByClassName` is class-only (there is no
  attribute equivalent), which is why the marker stays a class rather than moving
  to a `data-*` attribute.

### Added

- **`BOUND_CLASS` and `BOUND_SELECTOR` are now exported** from the package root.
  They were internal, so any integration referencing the marker had to hardcode
  the literal — which is the _only_ reason the rename above is breaking. Import
  the constant (`import { BOUND_CLASS } from 'tosijs'`) and your code follows any
  future rename automatically. Use them to _find_ bound elements
  (`document.getElementsByClassName(BOUND_CLASS)`); bind your own class for styling.

## [1.7.3] - 2026-07-23

### Changed

- **`on()` no longer stamps a `-xin-event` marker class onto your elements.**
  Event delegation used to climb the ancestor chain by matching that class with
  `closest()`; it now consults the internal `elementToHandlers` WeakMap directly,
  which is already the authoritative record of which elements have handlers. The
  behavior of `on()` is unchanged — handlers fire exactly as before, including
  across open shadow roots — but `on()`-bound elements are no longer mutated, so
  nothing appears in their `className` and clones no longer carry a stray marker.

  **Potentially breaking (unlikely):** if you were selecting or styling elements
  via `.-xin-event` (an undocumented internal), that class is gone. Bind your own
  class instead. The `-xin-data` marker on _data_-bound elements is retained — a
  `MutationObserver` re-discovers those via `querySelectorAll`, which a WeakMap
  can't provide.

## [1.7.2] - 2026-07-22

### Fixed

- **Custom-property `line-height` lost its `px` suffix** (regression introduced
  in 1.7.0). A declaration like `_lineHeight: 25` emitted `--line-height: 25`
  instead of `--line-height: 25px`. Cause: 1.7.0's `_opacity: 0.5px` fix began
  stripping the `_` prefix before testing the unitless-property list, and
  `line-height` was in that list — so custom-property line-heights matched and
  their `px` was suppressed. Subtle and lethal: the `vars` system uses
  `lineHeight` as a length (`calc(vars.lineHeight + vars.spacing200)`), so the
  missing unit silently broke computed sizes downstream.

  `line-height` is now treated as **dual-mode**: a real declaration
  (`lineHeight: 1.5`) keeps the unitless multiplier idiom; a **custom property**
  (`_lineHeight: 25`) gets `px` per tosijs's bare-number→px convention. Opt out
  with a string — `_lineHeight: '1.5'` → `--line-height: 1.5`. The `_opacity`,
  `_zIndex`, etc. fix from 1.7.0 is preserved (those are always-unitless — a `px`
  value is invalid CSS, so it is suppressed for both real and custom props).

## [1.7.1] - 2026-07-21

Packaging fix and internal cleanup. No API or behavior changes.

### Fixed

- **`CHANGELOG.md` and `llms.txt` are now published to npm.** Both were built
  and committed but omitted from the package `files` allowlist, so they never
  reached installers. `llms.txt` in particular is meant to travel with the
  package for LLM-assisted consumers.

### Changed (internal, no observable effect)

- `on()`'s origin resolution now guards `composedPath()` behind the event's
  `composed` flag before falling back to `event.target` (defensive; same
  result for the events tosijs dispatches).
- Removed a dead `DATEISH` constant from `dom.ts`.
- Extracted the duplicated `__tjs` bootstrap in `configure-tjs-debug.ts` /
  `configure-tjs-safe.ts` into a shared `configure-tjs.ts` helper, and the two
  copy-pasted blueprint-batch loaders into one `settleBlueprints()`.
- Corrected a `list-binding.ts` comment (the null-anchor branch is the
  SVG/MathML namespaced case, not HTML table mode).

### Documentation

- New Building-Apps "Gotchas" note: boxed proxies are minted fresh per access,
  so never key identity/memoization on them — compare on `.tosi.path`/`.value`.
- Added date-family control round-trip test coverage (`dom.test.ts`).

## [1.7.0] - 2026-07-20

The **correctness release** — the outcome of a whole-codebase review (~45 verified
defects, every one of which passed the previous happy-path test suite). No API was
removed or renamed; a handful of fixes are observable behavior changes (below), which
is why this is a minor. Ships with a new multi-engine (Chromium + Firefox) real-browser
CI lane and a comprehensive `Migration.md` "Upgrading to 1.7.0" section.

(Shipped incrementally as `1.7.0-beta.1`/`beta.2`; this is the consolidated stable entry.)

### ⚠️ Behavior changes (observable — the reason this is a minor)

- **`on()` handlers now fire inside open shadow roots.** Composed events cross
  the shadow boundary and the dispatcher resolves the true origin via
  `composedPath()`, continuing delegation up through shadow hosts to light-DOM
  ancestors. Handlers that were silently dead will now run. (Data bindings still
  do not operate inside shadow DOM — by design; a shadow component is bound like
  an `<input>`, via its `value`.)
- **Path matching is now segment-exact.** An observer on `'foo'` no longer hears
  `'foobar'`; `touch('foo')` no longer swallows a later `touch('foobar')`; and a
  bound element no longer re-renders when an unrelated sibling-prefix path (e.g.
  `list[50]` vs `list[5]`) changes. Hierarchical matching (parent hears child,
  child hears parent) is unchanged.
- **`getValue()` returns typed values for typed controls.** `number`/`range`
  inputs return numbers; the date family (`date`, `datetime-local`, `month`,
  `week`) returns `Date` objects (was an ISO string for `type=date`); `time`
  returns ms-since-midnight. Bound numeric state now stays numeric across edits
  instead of silently becoming a string.
- **List updates no longer re-insert every item element** on every change, so
  focus/selection in list inputs and CSS animations survive unrelated updates.
- **`deepClone()` now preserves `Date`, `Map`, and `Set`** (were becoming `{}`
  or shallow) and no longer stack-overflows on circular references.
- **`Component.change` now bubbles and composes** — it was dispatched
  non-bubbling, so an ancestor `addEventListener('change', …)` never heard a
  component's value change (breaking the "bound like a native `<input>`"
  contract). It now behaves like a native input's `change`. (The delegated
  binding was unaffected — it listens in the capture phase.)
- **Reactive `class` bindings replace instead of accumulating** — binding
  `class` to state and changing `'red'` → `'blue'` no longer leaves `"red blue"`.
- **`getValue()` on the date family returns `Date`** (see above) — and named CSS
  colors (`Color.fromCss('red')`) now parse without a DOM.
- **Data-binding sugar inside shadow-DOM content now warns** (once per class /
  session) instead of failing silently.

### Fixed

- **Nested list bindings** — a `bindList` inside another list's item template now
  renders and updates: options pass through to the inner binding, compound
  id-paths no longer double-bracket (`list[[id=x]]`), and `<template>` cloning
  targets `.content` per spec (verified in a real browser).
- **`Component` attribute drain is last-write-wins** — the second of two
  pre-connect property writes is no longer dropped.
- **`initAttributes` accessors survive class-field shadowing** — a leftover
  subclass field of the same name no longer throws a cryptic `TypeError` at
  element creation under modern class-field semantics; the value is adopted, the
  accessor restored, and a once-per-class warning points at the fix.
- **Boxed `.value` assignment respects shadowing** — assigning `.value` on an
  object that has a real `value` property writes the property instead of
  replacing the whole object.
- **`share()`** no longer re-broadcasts its (possibly stale) restored snapshot
  over live tabs, and doesn't clobber a delta that arrives mid-restore.
- **`sync()`** requeues outbound deltas when `transport.send()` throws instead of
  losing them silently.
- **`hotReload()`** restores saved state wholesale (was `Object.assign`, which
  dropped root scalars and left stale array tails) and saves on deep writes.
- **Blueprint loader** — one failing blueprint no longer wedges the loader:
  failures are evicted from the cache (so a retry re-imports) and the loader uses
  `Promise.allSettled`, reporting failures while still firing `allLoaded()`.
- **Events on `cloneNode` copies** of bound elements no longer throw in the
  global dispatchers (and no longer abort ancestor delegation).
- **`parts` honors the documented `data-ref="foo"` lookup** (order is now
  `part=` → `data-ref=` → CSS selector); symbol keys are no longer treated as
  refs, so thenable-probing a `parts` proxy no longer throws.
- **`css-colors.ts` (a complete named-color table, previously dead code) is wired
  into `Color.fromCss`**, so named colors parse with no DOM (SSR/workers/tests
  got transparent black before); consequently `invertLuminance` no longer drops
  named colors.
- **`bind()` no longer mutates the caller's spec**, so one `bindList` spec can
  bind two containers; and **`bind: { value, binding: 'name' }`** (string binding
  name) resolves and renders instead of being a silent no-op.
- **Unitless custom properties no longer get `px`** (`--opacity: 0.5`, not
  `0.5px`); **`Color` alpha hex rounds** (`0.5` → `80`, not `7f`).
- **External `removeAttribute` is observable again** (the in-memory
  `initAttributes` fallback masked it); **`<slot>` fallback children survive** the
  `tosi-slot` rewrite; **`Component.isSlotted`** no longer always-true.
- **Symbol-keyed proxy assignment** stores on the target instead of throwing;
  **`debounce`/`throttle` preserve `this`**; **duplicate list `idPath` values**
  warn once instead of silently collapsing rows.

### Added

- **`Component.hydrated` / `Component.whenHydrated`** (from 1.6.9) and the
  shadow-DOM value doctrine, documented throughout.
- **Experimental `tosijs/debug` and `tosijs/safe` bundles** — the config
  eval-order bug is fixed (they now ship complete per-function `__tjs` runtime
  type metadata and wired config; runtime enforcement arrives with native-TJS
  modules in 2.0). Flagged experimental; the debug bundle announces itself.
  Built with tjs-lang 0.10.1.
- **`StyleSheet()` returns its `<style>` element** (previously nothing), so a
  proxy-backed sheet you create can be removed or updated.
- **Documented observant stylesheets & dynamic theming** — pass a tosi proxy to
  `StyleSheet()` and it regenerates in place on change, **and derived colors from
  the `vars` sugar recompute with it** (a runnable "change the brand color, the
  whole card follows" live example, verified in-browser). The old docs' Caution
  that computed colors "won't be recomputed on theme change" was wrong and is
  corrected.
- **`setModuleLoader()`** (blueprint loader) and **`setShareStore()`** test seams.
- **Multi-engine real-browser CI lane** — `bun run test:browser` runs the inline
  ```test doc fences through Chromium + Firefox via Playwright (behaviors
  happy-dom can't observe: composed-event retargeting, spec-correct `<template>`
  cloning, `getComputedStyle`-resolved derived CSS vars), gated in CI.
  ```

### Changed

- **Packaging:** `types` is now the **first** condition in every `exports` entry
  (TS matches conditions in order, so it could be skipped before), and
  `*.tsbuildinfo` / `dist/bun-plugin` are excluded from the tarball.
- Build host is **tosijs-ui 1.7.0-rc.1**; **tjs-lang 0.10.1**.
- First **GitHub Actions CI** (unit suite + the Playwright browser lane).
- `dist/` bundles regenerated under the current Bun toolchain.

## [1.6.10] - 2026-07-17

### Fixed

- **Stale id-path cache could read — and overwrite — the wrong array item.** The
  id→index map for `list[id=…]` paths merged fresh entries over stale ones, so an item
  removed outside `setByPath` (a proxied `splice`/`pop`, or direct mutation plus
  `touch`) left its old key behind: `getByPath('arr[id=2]')` could return a different
  item, and `setByPath('arr[id=2].v', …)` could silently overwrite it. Maps are now
  rebuilt fresh, so removed ids resolve to `undefined`. Relatedly, deleting a
  nonexistent id no longer removes the _first_ item (`splice(undefined, 1)` coerces to
  `splice(0, 1)`).
- **`await updates()` could hang forever when an observer wrote state.** A write
  inside an observer callback re-arms the update queue mid-drain, which replaced the
  module-level promise resolver: earlier awaiters were orphaned (hung), and the next
  round's promise resolved before its round had run. Each round now resolves exactly
  the promise that belongs to it. The one-`await`-per-settling-round semantics are
  unchanged (and now pinned by a regression test). This also fixes a silent-death mode
  in `share()`/`sync()`, whose inbound echo-suppression cleanup waits on `updates()` —
  an orphaned promise left paths suppressed forever, permanently stopping outbound
  sync for that subtree.
- **A throwing observer _test_ function no longer aborts the whole dispatch batch.**
  It was rethrown after the touched-path queue had already been cleared, silently
  dropping every remaining notification and hanging `updates()`. Now logged and
  skipped, matching how callback exceptions are handled.
- **`throttle()` fired the wrapped function twice per isolated call** — an
  uncancelled trailing timer duplicated every leading-edge call. A lone call now fires
  exactly once; the documented "the last call always goes through" trailing behavior
  for suppressed calls is preserved.

### Changed

- `dist/` bundles regenerated with the current Bun toolchain (smaller minified
  output; deferred from the dev-only tosijs-ui bump so published artifacts wouldn't
  change under a devDependency patch).

## [1.6.9] - 2026-07-15

### Fixed

- **`Component.parts` no longer poisons itself when read before hydration.**
  Content is instantiated on `connectedCallback` (via `hydrate()`), not at
  construction — so on an uninserted element (e.g. one fresh from
  `elementCreator()`) there is no shadow root yet and the `parts` proxy would
  bind to the light-DOM root. Because the proxy was cached, that binding
  persisted for the life of the element: after insertion `parts.host` still
  threw `elementRef "host" does not exist!`, silently, forever. This bricked
  components whose public getters read `parts` before insertion (e.g. reading
  `el.showingDiff` on a detached `<tosi-code>` left CodeMirror unmounted with no
  error). `hydrate()` now discards the cached proxy so the next access rebuilds
  against the correct root. ([#13](https://github.com/tonioloewald/tosijs/issues/13))

### Added

- **`Component.hydrated: boolean` and `Component.whenHydrated: Promise<void>`.**
  A supported way to ask whether an element is hydrated instead of probing
  `parts` (which was itself the thing that poisoned the proxy). Gate
  parts-dependent public getters on `this.hydrated`, or `await this.whenHydrated`
  before doing parts-dependent work on an element that may not be inserted yet.
  Already-hydrated elements resolve immediately.

## [1.6.8] - 2026-07-11

### Added

- **`Component` warns when a subclass defines an `on<Event>`-named member**
  (e.g. `onClick`, `onMousedown`). The elements factory treats `on<Event>` prop
  names as event-handler sugar — `creator({ onClick })` attaches a `click`
  listener rather than assigning the property — so such a member is shadowed and
  can't be set or read via the element creator. The warning (once per class,
  deferred to a microtask so it catches arrow-function class fields) names the
  members and points to the `handle<Event>` convention (e.g. `handleClick`).

### Changed

- **`Component` resize hook renamed `onResize` → `handleResize`.** Component
  callbacks now use the `handle<Event>` convention, because the `on<Event>` prefix
  is reserved for event-handler sugar in the elements factory (and is being
  retired for component callbacks). `onResize` still works but is **deprecated**
  and warns once per class, pointing to `handleResize`.

## [1.6.7] - 2026-07-05

### Fixed

- **`ElementProps.class` type** widened to match the runtime (which has accepted
  arrays and boolean maps since 1.6.5). It was still typed `class?: string`, so
  TypeScript rejected `div({ class: ['a', 'b'] })` and
  `div({ class: { active: isActive } })` — forcing a cast. The new `XinClassSpec`
  type is `string | false | null | Array<string | false | null | undefined> |
Record<string, boolean>` (top-level and array falsy values add no class, matching
  the runtime). Type-only change.

### Changed

- **`static initAttributes` now throws for a boolean attribute defaulting to
  `true`.** HTML boolean attributes are false-by-default (presence = true, absence
  = false), and a reflected boolean attribute cannot default to `true` — the
  element would have to "gain" the attribute during construction (which the
  custom-elements spec forbids), so a `true` default silently read back as `false`.
  Rather than surprise you, this is now a hard error explaining the fix (`{ foo:
false }`, or a string/number attribute or a plain property). A `false` default is
  unchanged.

## [1.6.6] - 2026-07-03

### Fixed

- **Attribute-timing regression** in the constructor `setAttribute` deferral
  (introduced in the 1.6.x line): a value assigned to an `initAttributes`-backed
  property between `createElement` and a _synchronous_ `append` was queued but
  not yet reflected to the DOM when a subclass's `connectedCallback` ran. A
  subclass that read the attribute early (e.g. `getAttribute('url')`, or asset
  loading / `sceneReady` logic before calling `super.connectedCallback()`) saw
  the empty default and never retried. The deferred-attribute drain now runs
  before the subclass's `connectedCallback` body — regardless of whether or when
  it calls `super` — by wrapping `connectedCallback` at registration.
- Element factory `class` property: falsy values (`''`, `null`, `undefined`,
  `false`) now add no class instead of the literal strings `"null"`/
  `"undefined"`/`"false"` (regression from the 1.6.5 `class` rework). Conditional
  expressions like `cond ? 'active' : undefined` and `cond && 'active'` now work
  directly, and falsy array entries are skipped.

## [1.6.5] - 2026-07-02

### Added

- Element factory `class` property now accepts an **array** of class names
  (`{ class: ['card', 'selected'] }`) and a **boolean map**
  (`{ class: { foo: true, bar: false } }`, which adds `foo` and removes `bar`)
  in addition to the existing space-separated string form.

### Fixed

- Passing an empty or all-whitespace `class` (e.g. `{ class: '' }`) no longer
  throws from `classList.add('')`; the empty class is ignored with a console
  warning, and extra whitespace between class names is tolerated.

## [1.6.4] - 2026-06-27

### Fixed

- Narrowed the constructor `setAttribute` mask to `initAttributes`-named
  attributes so it no longer interferes with composition.

## [1.6.3]

### Changed

- Constructor-spec `setAttribute` deferral.
- Doc-site migration: `dev.ts`/`docs.js`/`demo/index.ts` replaced by
  `bin/site.ts` + `tosijs-site.config.ts` using `tosijs-ui/site` (prerendered
  HTML, sitemap, `llms.txt`, ePub).

## [1.6.2]

### Added

- `scrollListItemIntoView` behavior option; coercion tests and docs.

## [1.6.1]

### Added

- Footer rows and template anchoring for list bindings.

### Changed

- Hex color parsing refactor.

## [1.6.0]

### Added

- `itemsPerRow` for virtual grid layouts.
- Pinned row support.
