# todo

## Deferred from the 1.11.0 round-4 review (BLOCK → cleared)

Report: `reviews/1.11.0-round4-post-b1.md`. All three blockers were inside the
B1 security fix itself and are fixed + pinned. These are the rest.

- [ ] **`auditAccessibility` has no notion of a withheld name.** Withholding
      the `title`/`alt`-derived label makes a secret-marked control emit a
      false `anonymous-affordance` at **error** severity. `src/audit.ts`
      contains zero occurrences of `secret`. The hole PRE-DATES this release
      (text-named and `<label for>`-named controls in a secret region already
      did it); 1.11.0 widens it by one naming source. Fix at class level:
      skip/downgrade `anonymous-affordance` for records carrying
      `secret: true`, or emit a `nameWithheld` marker.
- [ ] **The structural-tier `stripArrows` fix has no test that fails without
      it.** SEC-8 asserts arrow-stripping for a bound `<span>` and a plain
      `<div>` — neither is a heading, so reverting the hunk leaves the suite
      green. Needs an `<h2>` fixture with a forged `BOUND_TWO_WAY` AND mocked
      bounds (the structural tier drops 0×0, and happy-dom returns zero
      geometry — the trap CLAUDE.md documents).
- [ ] **`targetSizeFinding` is public and still throws on `flags:[{label:'x'}]`**
      (floorplan#12). `auditView` mitigated only the private path. Round 3
      reviewed the export's PARITY with the audit; nobody reviewed its
      ROBUSTNESS as a public entry point, which is where "validate at
      boundaries" applies. Mitigating: `kind` is declared required, so a TS
      consumer needs a cast. NOTE — the throw was ALREADY consumer-reachable
      via `schematicSVG` since v1.10.1, so 1.11.0 adds a second door, not the
      first; that correction belongs in UPSTREAM.md too.
- [ ] **`describe()` perf** — round 4 measured +45–55% in real Chromium from
      the per-element subtree scan. The narrowing to element-or-ancestor
      removes the O(subtree) arm (happy-dom: 17.4ms → 16.3ms against a 15.6ms
      baseline), but **this has NOT been re-measured in Chromium**, which is
      where the regression was found and the only environment that counts for
      this question.
- [ ] `schematic()` is public API with no gate that executes it — carried from
      round 3, now also the subject of floorplan#15 (nobody has drawn a
      redacted record).

## Deferred from the 1.11.0 remediation re-review (BLOCK → cleared)

Report: `reviews/1.11.0-preminor-remediation.md`. The blocker (B1, the
`describe()` attribute-harvest leak) is fixed and pinned. These are the rest.

### The one that is still a real defect
- [ ] **M1 (security, verified) — inline-contract validation on `write()` is
      fail-open on DOM presence.** Same call, same posture: mounted → REFUSED
      with a contract violation; after `inp.remove()` → ACCEPTED, and the bad
      value lands. `inlineSchemaFor()` resolves the governing schema by
      scanning `document.getElementsByClassName(BOUND_CLASS)`, so enforcement
      is a function of what is currently RENDERED — and `bindList` recycles
      rows, so a per-row contract binds only while the row is in the viewport.
      SPA route changes and hidden tab panels do the same. Nothing announces
      the downgrade (contrast `warnIfFailsOpen` in `contract-check.ts`).
      Pre-existing; not gating because `describe()` scans the same live set,
      so the map never advertises what `write()` will not enforce.

### Coverage (untested surfaces, not failing tests)
- [ ] `schematic()` became public API in `a253a1e` and **no gate executes it** —
      `schematic.test.ts` never calls it, the type probe only constructs the
      arrow, and the smoke gate asserts `typeof !== 'undefined'`.
- [ ] `src/schematic.test.ts` (487 lines) predates the 0.4.0 vendor bump and
      references none of the new symbols. 267 vendored lines with **no local
      test delta**, including floorplan's `flagColor` prototype-chain security
      fix.
- [ ] No test asserts the RENDERER still honours `flags`/`list`, so nothing
      would catch the deliberate audit/renderer divergence widening.

### Build/doc hygiene
- [ ] **Harden the budget-comment class**: parse the trailing `-> N` out of
      each spec's comment and assert it equals `budget`. The 1.5 kB drift fixed
      last round was caught by human review, and the fix for it introduced a
      126 B drift of its own — corrected by hand again this round. Two rounds
      of hand-fixing is the signal to automate it (~5 lines over `BUNDLES`).
- [ ] **`docs/version.json` stamps its own PARENT commit**, so every build
      dirties it and "clean tree after `bun run build`" is unreachable. Three
      of this diff's commits are that self-chase, and it makes Tier 0's
      artifact-freshness warning permanently noisy — which is how a real
      staleness signal gets ignored. Stamp the build's own commit, or exclude
      the field from the freshness check. (Upstream: tosijs-ui.)
- [ ] `auditView` discards producer `flags` unconditionally — including a DOM
      producer's legitimate WCAG exemption — and says nothing, in a module
      whose stated principle is "an audit must not fail silently". One
      `skipped.push` behind a `seen` guard.

## Deferred from the 1.11.0 pre-minor review (GO_WITH_FOLLOWUPS, 0 blockers)

Report: `reviews/1.11.0-preminor.md`. Both majors are **upstream-gated** —
`src/schematic.ts` is machine-vendored and carries a DO-NOT-EDIT banner — so
each is filed on tosijs-floorplan and needs a local decision here.

### The two majors — FIXED locally, still filed upstream
Both are now handled by `auditView()` in `src/audit.ts`, which composes the
shared predicate over an adjusted record (M1 = floorplan#7, M2 = floorplan#8,
and #12 falls out for free). Pinned by 8 tests, 5 of which fail with
`auditView` neutered to the identity function; the other 3 are controls.
- [ ] Re-check when floorplan #7/#8 land: the local adjustments should become
      no-ops, and `auditView` can shrink to the 0×0 guard (#9) or vanish.

### Coverage the release did not add
- [ ] `src/schematic.test.ts` is **untouched** against a 267-line vendor
      change. Four 0.4.0 behaviours are covered only by upstream tests that do
      not run in our gates — including the `flagColor` prototype-chain fix (a
      security fix with no regression test here). A golden-SVG comparison
      would also settle the "byte-identical to 0.3.0" claim we currently
      repeat rather than measure.
- [ ] `src/entries.test.ts` and `src/type-surface.test.ts` are untouched, so
      no gate observed that the release's headline predicate is reachable from
      no published entry point (see below).
- [ ] The `isInteractive` swap changes **three** rules, and every new test
      asserts only `target-size`. The error-severity deltas
      (`anonymous-affordance`, `missing-role`) are undescribed and unpinned.
- [ ] Pin that a read-only `describe()` produces no "blind map" note
      (floorplan#10).
- [ ] Pin a forged arrow in `text` — that is where the class lands now
      (floorplan#11).

### Cheap, decided, not yet done
- [x] **Re-export the shared predicate.** DONE in `a253a1e`. `src/index-agent.ts` names only
      `schematicSVG`/`rasterizeSVG`/`boundsOf`, so `isInteractive`,
      `targetSizeFinding`, `TARGET_SIZE_DEFAULT`, `schematic()` and
      `SchematicResult` reach no consumer — "one implementation" stops at this
      repo's boundary, and a downstream must re-implement or install a second
      copy of tosijs-floorplan. Already linked in, so ~0 bytes. **A minor is
      the release where this is free.** Mind the explicit-export-list hazard.
- [x] `BOUND_TWO_WAY`/`BOUND_TO_DOM` are now defined **twice** in `src/` — DONE: pinned by a test in `agent.test.ts`. Still two declarations —
      `agent.ts` (what `describe()` emits) and `schematic.ts` (what the audit
      now matches against). Two copies of the exact constant whose duplication
      *was* the mechanism of floorplan#4. One line closes it:
      `expect(agentTwoWay).toBe(schematicTwoWay)`.
- [x] Guard `f?.kind` where the audit reaches producer flags (floorplan#12) —
      DONE via `auditView` (the audit never passes `flags` down), and pinned.
      ⚠️ But the exported `targetSizeFinding` DOES still throw on
      `flags:[{label:'x'}]`, and 1.11.0 makes that reachable from tosijs's
      PUBLIC API — new information for floorplan#12.
- [ ] Print gzip **deltas** in the budget loop. The ceiling tracks growth
      upward by policy, so only a spike larger than the slack can ever fire:
      `module.js` is +6.3% gz over six releases while the ceiling moved four
      times. ~5 lines from data the build already holds (`dist/` is committed,
      so `git show HEAD:dist/<f>` is available). *Re-measure the tag-by-tag
      numbers before acting — the review did not verify them.*
- [x] `src/agent.ts` structural-tier heading harvest missing `stripArrows` —
      DONE, folded into the B1 security commit as the review suggested.
- [ ] `auditAccessibility` computes `isInteractive(w)` and then
      `targetSizeFinding(w, …)` recomputes it; `hasTwoWayBinding` does
      `Object.entries` where 1.10.1 did `Object.values`. Measurable regression
      on the code this diff touched. Probably not worth fixing — decide once.
- [x] Clear the 15 stale `Verdict: BLOCK` stamps in `reviews/` — DONE in `a253a1e` (all resolved,
      never marked `**STATUS: CLEARED**`). Tier 0 warns on every run, which is
      noise that will mask a real one.

## Deferred from the 1.10.1 review rounds (transferred 2026-09-06)

**Filed, and then not transferred, for a whole round.** Round 4 produced 15
follow-up checkboxes and round 5 found that zero had reached this file — the
same failure as the minimum-headroom gate, which two rounds filed and neither
built, and which then recurred. Filing is not tracking.

### Gates whose scope is narrower than their own claim
- [ ] **tosijs#39 — the IIFE exposes no global, and never has.**
      `dist/index.js` is built with no `globalName`, so a `<script src=…>`
      consumer can reach nothing; README.md:29 promises them "the library".
      Found by executing the **published 1.10.1 tarball** during step 8c, which
      is the only lane that could have found it. Confirmed against 1.7.9 and
      1.8.0 too, so it is not a 1.10.1 regression — the blueprint-from-markup
      path (README.md:57) works via side effects alone, which is why it
      survived. **The gate is the point:** the smoke loop defines
      `ASSERT_EXPORTS` and applies it to the `import`/`require` probes only —
      the `load` probe used by the IIFE just checks the file evaluates, so an
      artifact exposing nothing passes by construction. **Fourth instance of
      "a gate that reports safety it has not established" in this repo.**
      Fix `globalName` and the probe together; mutation-verify by removing
      `globalName`.
- [ ] `appendContentToElement` is the **fourth** site of the positional
      contract and was left out of the unification. Currently safe because both
      callers classify first, and its type now says so (`ResolvedContent`) —
      but the contract lives in four places and three share code.
- [ ] `sourceFingerprint()` hashes `src/**/*.ts` + `bin/bundles.ts` +
      `bin/site.ts` + version. Its header implies "everything that determines
      dist/", which also includes `tsconfig.build.json`, the bundler version
      and `tjs-lang`'s. Narrow the claim or widen the input.
- [ ] `FINGERPRINT_PATH` is cwd-relative while the hash is computed from an
      absolute `PROJECT_ROOT` — they agree only when cwd is the repo root.
- [ ] The minimum-headroom gate never measures a real artifact in the
      `bun run build` lane (round 5 major): it runs against tsc stubs there, so
      it is vacuous in exactly the lane that matters. **This is the third
      "gate that does not measure what it claims" in this release.**

### Cheap correctness / hygiene
- [ ] Hoist the per-argument closures in `create()` and make
      `positionalWarning` lazy (~3–4% on the hot path, measured).
- [ ] Decide the export status of `classifyPositional` / `positionalWarning`
      once, for the group — two currently have zero importers.
- [ ] Correct the overclaim at `src/elements.test.ts:698` ("these tests are
      what notices if a fourth site appears" — they do not; see above).
- [ ] Print gzip **deltas** in the budget loop, not just absolutes.
- [ ] Re-word the missing-fingerprint branch in `check-publish-tag.ts`.
- [ ] A string `content` in a shadow-DOM component erases the component's own
      stylesheet (round 5 major) — `appendContentToElement` sets
      `textContent` on the shadow root.

### Process / elsewhere
- [ ] `UPSTREAM.md` is one gate behind on the tosijs-ui#130 defence.
- [ ] `reviews/AAR.md` does not exist; every round has asked for a line in it.
- [ ] Push the two transferable generalisations to
      `../tosijs-coding-practices` (gate-scope, and filing≠tracking).
- [ ] Add the post-browser-lane rebuild inline to CLAUDE.md's numbered
      Releasing list.
- [ ] Consider adding `docs` + `coverage` to the always-on lens set for
      releases touching rendered output — they owned most blockers in rounds
      4 and 5 and were not run either time.
- [ ] **The composite `v1.10.0…HEAD` has never been reviewed as a whole** —
      every round reviewed a remediation diff. Worth one pass before the next
      release, not this one.

## Mutation testing as a lane — the class fix I have NOT built

Three of four round-4 items were "the guard did not guard". Two now have
class-level fixes (a minimum-headroom assertion; content shapes in the type
probe). The third does not, and it is the biggest:

**A fix can land with no test that exercises the site it changed, and nothing
notices.** Round 4 proved it mechanically — re-adding the pre-fix hydrate
branch left all 987 tests green while fully restoring the bug. I have caught
this by hand, inconsistently, four times this release, and missed it once,
which is what produced that round.

- [ ] A mutation lane, even a cheap one: for a named set of invariants, revert
      the guarded line and assert the suite goes red. Slow, so not a per-commit
      gate — a pre-tag or quarterly job.
- [ ] Cheaper interim: make it a rule with teeth — a fix commit states the
      mutation it survived. Prose has already failed once here (the
      minimum-headroom assertion was filed by two review rounds and deferred
      both times, and then the failure recurred), so prefer the lane.

**Recorded as unbuilt on purpose.** "Filed as a follow-up" is where the
headroom gate sat for two rounds while the thing it prevents happened again.

## Shadow DOM kills the bindings of anything placed inside it — including whole components

Verified. The **same component**, light DOM vs inside another component's
shadow root:

```
light DOM  : "Alice"  ->  "Bob"     live
in shadow  : ""       ->  ""        dead, and never recovers
```

Binding dispatch is document-level, so an element inside any shadow root is
invisible to it — and that applies to a nested component's OWN internal
bindings, not just to bindings written at the insertion point. Putting a
bound web component in a shadow root silently disables it.

**Already covered where it is detectable:** the existing per-class warning
(`bind.ts` `warnIfShadowed` / the component's shadow-content check) fires for
this case — `<nest-outer> has data-binding sugar in its shadow-DOM content` —
naming the class and the correct pattern (bind the VALUE from outside,
implement `render()`).

- [ ] **Check the gap: a component that hydrates AFTER insertion.** The
      warning is driven by scanning content for binding sugar at insertion
      time. A component whose bindings appear later (blueprint-loaded, or
      upgraded after `customElements.define`) may slip past it — the same
      upgrade-timing seam that decides attribute-vs-property dispatch. If it
      does slip, warn from the binding side instead of the content side.
- [ ] Consider saying it in the component docs under shadow DOM: not just
      "bindings do not operate here" but "and that includes any component you
      place here".

Not folded into 1.10.1: it is not a regression from that release, the common
case already warns, and adding a diagnostic to a release that has been through
four review rounds is the scope creep those rounds keep finding.

## Value children that silently vanish: `div(new Date())`, `div(10n)`, `div(false)`

The child/props discriminator in `elements.ts` is `string | number` for children
and **any other object is a props bag**. So:

```
div('hello')      -> "hello"        child
div(42)           -> "42"           child
div(10n)          -> ""             props bag with no enumerable keys -> NOTHING
div(new Date())   -> ""             ditto
div(false)        -> ""             ditto
div({title:'x'})  -> ""             props, correctly sets title
```

Three *values* land in the props branch and disappear with no warning. This is
**silent failure**, not "garbage being accepted" — the API deliberately
dispatches on what it is handed, and the failure is that it dispatches wrongly
and says nothing. (A review framed it the other way; see
`../tosijs-coding-practices/practices/model-priors.md` #12.)

**Owner's expectation, recorded:** `div(false)` should render `<div>false</div>`.
The `cond && child` form is a React idiom and is not used here, so nothing
depends on booleans rendering as nothing — conditional children use a ternary
with `null`/`undefined`, which already skip correctly (`div('a', null, 'b')` →
`"ab"`).

- [ ] Render **primitives** as text children: add `boolean` and `bigint`
      alongside `string`/`number`. Unambiguous, and matches the expectation.
- [ ] Decide `Date` deliberately. It is an object, so it falls to the props
      branch, and `toString()` is timezone-dependent and rarely what anyone
      wants rendered — auto-stringifying trades a silent no-op for silently
      wrong-looking output. Options: render it anyway (JS-consistent), or warn.
- [ ] **Warn on the residual class**, whichever is chosen: a positional
      argument that is neither a child nor a usable props bag — not a plain
      object (prototype is not `Object.prototype`/`null`) **and** no enumerable
      own properties. Catches `Date`, `RegExp`, `Map`, class instances and
      functions; leaves `{}` and real props alone. Says "this did nothing"
      instead of doing nothing.

Note `null`/`undefined` must keep rendering nothing — that is the nothing-signal
the ternary form depends on, and it already works.

## Test-typecheck mining: where it stands, and what is left

No lane typechecks `*.test.ts` (`tsconfig.json` excludes them), so the errors
sitting there are unread signal. Mining them yielded **five public-surface
defects** — all shipped, all now fixed in 1.10.1:

| | |
| --- | --- |
| `ProxyObserveFunc` | declared `(path: string) => void`; takes a callback, returns an unsubscribe |
| `ElementPart` | excluded proxies, so `div(app.name)` — a live bound text child — did not typecheck |
| `tosiBinding` | served on both proxy kinds, declared on `TosiAccessor` only |
| `take` | same, and it is the plain-prop binding form the docs recommend |
| four public types | named in public signatures, exported from no entry |

**The remaining 390 are two homogeneous non-defect clusters plus a tail:**

- **85 — correct code flagged.** `app.name = 'Ada'` is intended and works;
  TypeScript cannot represent it. **Do not "fix" these.** See CLAUDE.md →
  *TypeScript is autocomplete, not a source of truth*.
- **~280 — test-file sloppiness.** `unknown` in catch blocks, `as any` gaps,
  fixtures missing optional fields. Low yield: mechanical to fix, and fixing
  them proves nothing about the library.
- **A tail worth sampling, not chasing.** The five findings above came from the
  first ~30 errors examined; the density dropped sharply after that.

**Done this pass:** `ReturnType<typeof X.elementCreator>` resolves to
`unknown` (the method is typed `this: new () => C`, and `ReturnType` does not
bind `this`), which accounted for **156 of the errors** across two test files.
Replaced with `ElementCreator<X>`, which works and preserves the component's
own members.

- [ ] **Consumer-facing sharp edge worth documenting**, since
      `ReturnType<typeof Widget.elementCreator>` is a natural thing to write
      and silently yields `unknown`: say in the component docs that the
      spelling is `ElementCreator<Widget>`.
- [ ] If a typecheck lane is ever gated, it must exclude the 85 deliberately
      — a ratchet chasing zero would rewrite correct code.

## `get` and `has` disagree: the proxy denies the API it serves

`app.observe(cb)` is a working function. `'observe' in app` is **false**.
The `get` trap serves `ACCESSOR_PROPS`; the `has` trap does not report them.

```
Object.keys(app)     -> ["name","count","list"]   // data: live and exactly right
'name' in app        -> true
'observe' in app     -> FALSE                     // but app.observe(cb) works
JSON.stringify(app)  -> {"name":"Ada",…}          // correct
```

**Why it matters beyond tidiness.** Anything that derives affordances by
*asking the live object* — console autocomplete, a REPL, a debugger, an
introspecting agent — sees the data half perfectly and is told the API half
does not exist. That is the DevTools-console model of autocomplete, which needs
no declarations and cannot go stale, failing on the half we hand-describe in
six type surfaces instead.

The principled shape is how ordinary objects already behave: `'toString' in obj`
is true while `Object.keys(obj)` omits it. `has` reports what EXISTS; `ownKeys`
reports what ENUMERATES. Ours currently disagree about the same object.

- [ ] Make `has` report `ACCESSOR_PROPS` (and leave `ownKeys` alone, so
      `Object.keys`, spread and `JSON.stringify` are unchanged).

**Blast radius is real, so this needs deliberate review, not a quick fix.**
`'x' in obj` is a duck-typing idiom: any consumer branching on
`'observe' in something` would change meaning. Check tosijs-ui and the agent
surface's own guards before touching it.

**Connection worth keeping:** this is the same idea as the agent surface, one
layer down. `describe()` is autocomplete-for-agents derived from the
framework's own live records rather than from declarations — which is why the
manifesto can say the description is *under oath*. The console case is that
principle applied to a human at a prompt, and it is the thing tjs is aiming at:
autocomplete as a **lemma of captured metadata**, not as a parallel artifact
maintained by hand.

## Raw assignment through a boxed proxy: the RUNTIME is right, the type cannot describe it

`app.name = 'Ada'` **works, and always was intended to** — the proxy is a port
of bindinator's, designed for JavaScript. The write lands in the registry and
observers fire, identically to `app.name.value = 'Ada'`. Not an accident:
`boxed` and `xin` share one `set` trap.

TypeScript reports it as an error, and **cannot be made not to**. Measured
(TS 5.9.3):

| | |
| --- | --- |
| asymmetric `get`/`set` on an **interface** | works — assignment takes the raw value, reads give the boxed type |
| the same from a **mapped type** | **not expressible** — mapped types have no get/set modifier, and `BoxedProxy<T>` is `{ [K in keyof T]: BoxedProxy<T[K]> }` over arbitrary `T` |
| widening to `BoxedProxy<T[K]> \| T[K]` | assignment becomes legal and **every read is poisoned** — `app.name.value` stops compiling |

So there is no formulation that keeps reads precise and admits the intended
write. This is not a defect to fix; it is TypeScript failing to describe a
JavaScript design.

- [ ] **Document it** where a TS consumer meets it — `.value =` is the
      TS-expressible form, direct assignment is the intended JS one, and both
      do exactly the same thing. Right now they get `TS2322` with no
      explanation and will assume their code is wrong.
- [ ] Revisit under **tjs** (2.0). This is a concrete instance of the case tjs
      exists to answer, and worth carrying into the port notes as one:
      correct code, flagged.

**Consequence for the tests-typecheck lane** (below): ~15 sites in our own
suite use direct assignment and are *correct*. A lane that chases zero errors
there would be rewriting good code to satisfy a checker that is wrong about it.
Any ratchet needs this class excluded deliberately, not silently.

## ~~FLAKE: value-commit.pw.ts loses a click to the doc-runner's "Running" badge~~ — FIXED

The test did `page.goto('/')`, loading the entire doc system merely to have
somewhere to import the module from. The lane runs 4 workers against ONE dev
server, so the doc-test runner's "Running" badge could sit over the element
this test clicks — intermittent on Firefox, and it reads as a real failure of
the behaviour under test rather than as contention.

Fixed by giving it a routed blank page instead. The fixture needs a document
and nothing else, so it now shares no state with the doc lane and does not
depend on what else is on screen. Verified: three consecutive lane runs green,
and — because isolating a test is a good way to make it vacuous — the
assertion was mutated and confirmed to still fail. Also 2x faster
(chromium 387ms vs ~700ms).

**The general shape, worth keeping:** a browser test that only needs *a
document* should not navigate to the application. Sharing the app's page with
other lanes buys nothing and imports every source of interference it has.

## Empty proxy targets — the 2.0-shaped follow-on to tosijs#35

1.9.2 made `.value`/`valueOf`/`toJSON` resolve the path instead of returning
the captured target. The obvious next step is to stop wrapping the target at
all — every proxy over a **shared near-empty target**, the way scalar proxies
already work.

**Why it is worth doing, in order of actual value:**

- [ ] It makes a proxy a **pure function of its path**, which is what makes it
      **cacheable**. Today it is not: a cached proxy would embed the same stale
      snapshot #35 was about. Measured churn on the current design: a 5-hop
      `boxed.a.b.c.d.value` read allocates **10 objects** (5 Proxy + 5 handler
      closures) and costs **0.55µs**; a path-keyed cache is ~0. That is the
      saving — not the target slot.
- [ ] Caching also gives **stable proxy identity** (`boxed.a.o === boxed.a.o`
      is currently **false**), which is exactly what
      [#17](https://github.com/tonioloewald/tosijs/issues/17) asks for on
      behalf of React-style integrations. One change closes both.
- [ ] A held proxy stops **retaining** the object it was created over — the
      long-lived-capture leak in the #35 reporter's own shape (`this._store`
      held for a component's lifetime across document loads).
- [ ] It collapses the `target === boxedScalarTarget ? … : target.valueOf ? …`
      branching to one rule.

**The constraint that makes it TWO targets, not one** — verified by execution,
and pinned by `xin.test.ts` "array proxies keep their array-ness":
`Array.isArray` and `JSON.stringify` read the **target**, not the traps. A
`{}`-targeted array proxy reports `isArray === false` and serializes to `{}`,
silently. So it needs a shared `{}` **and** a shared `[]`, and `ownKeys` /
`getOwnPropertyDescriptor` / `has` / `deleteProperty` all have to be
synthesised from the registry rather than answered for free by a real target.
`[].length` is non-configurable, so the gOPD trap must keep reporting it
non-configurable (legal: values may differ for writable props).

**Why not now:** stable `===` is itself an observable change, the trap surface
grows, and 1.9.2 already ships a behaviour change in this area. Sequence it
with 2.0, and land the cache in the same move or the main benefit is left on
the table.

## 1.9.0 pre-minor review — deferred follow-ups

Report: `reviews/1.9.0-preminor.md` (BLOCK; 3 blockers + 2 majors fixed before
tag). These are the findings NOT fixed, with the reasoning, so "reviewed and
deferred" stays distinguishable from "reviewed and fine".

**Fixed in the remediation pass, listed so nobody re-opens them:** the phantom
`quiet` option (now real, and verified load-bearing in both postures); the
`secret: true` marker missing on suppressed harvests (the CHANGELOG claim was
false for one of its three shapes — `suppressHarvest()` now marks, pinned by
test); the provably-dead second `querySelector` in `harvestWouldLeak`; the
lost zero-secret fast path in `isSecretPath`/`containsSecret` (re-verified
behaviour-neutral across the 54-query corpus); the `bind*` `.d.ts` deprecation
text, which shipped downstream advice that silently does not bind; the
`auditAccessibility()` empty-map silent pass; `Migration.md`; the scaffolder
README + a test that reads it.

- [ ] **No lane typechecks test files.** `tsconfig.json` and
      `tsconfig.build.json` both exclude `*.test.ts`, which is exactly why a
      `quiet` option that did not exist was passed at 16 sites and typechecked.
      `tsconfig.test.json` now exists as a MEASURING TOOL, wired into no gate:
      `npx tsc --noEmit -p tsconfig.test.json` reports **369 errors**, nearly
      all pre-existing looseness in test code (raw values assigned to
      `BoxedScalar`, incomplete `AgentDescription` fixtures behind `as` casts),
      not real defects. Wiring it in red would train everyone to ignore it, so
      it is a backlog with a number rather than a gate. Burn it down, then gate.
- [ ] **Path-spelling canonicalisation now exists at THREE addresses inside a
      security predicate** (`indexSpellingAliasesSecret`/`splitAtElement`,
      `redactWithin`'s candidate builder, the actions walk's `${path}.${key}`),
      and only two are tested together: SEC-2f fails only when BOTH the descent
      and the index-alias containment are reverted, so narrowing the
      containment silently unguards the descent. Land the shared canonicaliser
      (closes tosijs#32's query side and the third copy at once) and add an
      SEC-2f-independent case.
- [ ] **The closed posture still registers `tosi_describe`/`tosi_surface`** with
      a model-context host, and on hosts with no unregistration path that is
      register-once-per-name. A model gets a tool returning
      `{roots:{},wiring:[],actions:[],exposure:'closed'}` with no signal
      distinguishing "no state" from "never configured". Either skip
      registration while closed, or make the tool descriptions say the surface
      is unconfigured and name `expose`.
- [ ] **~25 live doc examples were mechanically rewritten and nothing executes
      them** (`list-binding.ts`, `xin.ts`, `elements.ts`, `xin-proxy.ts`, as
      ` ```js ` fences). This release's own advice warns that
      `textContent` with a path STRING sets literal text instead of binding —
      exactly the mistake that shipped once already and was caught only by the
      browser lane. Promote a sample to ` ```test `.
- [ ] **Re-measure the agent-surface size claims.** README and CLAUDE.md still
      carry "6.7 kB gz" and "+2.9 kB gz (+13.7%) vs 1.7.9" verbatim while
      `agent.ts` grew substantially; only the generated `<!-- sizes -->` block
      moved. Either re-measure or stop quoting a number nothing regenerates.
- [ ] **Hoist the remaining `harvestWouldLeak` DOM test.** `refreshSecretPaths()`
      already runs the document-wide query at the top of every `describe()`;
      cache it into a Set and build the ancestor set once, making the DOM arm an
      O(1) lookup instead of N subtree scans. (`agent.ts` claims this
      cheaper-scan follow-up is "Tracked in TODO.md" — it was not. It is now.)
- [ ] **~260 gz bytes of dev-only deprecation prose ship in every bundle**,
      including `tosijs/core` and DOM-free `tosijs/state`, which will never
      print a `bindText` warning (`elements.ts`; `grep 'permanently DISABLING'
dist/*.js` hits all four). Keep the actionable half, move the explanation
      behind a docs anchor.
- [x] ~~**Decide the `bind*` string-form question.**~~ **DONE (1.9.0)** — the
      rule now applies uniformly and turns on the VALUE: deprecated iff a
      plain prop expresses it exactly, which is true for a proxy and false for
      a path string. `bindText`/`bindEnabled`/`bindDisabled` warn only for the
      proxy form. tosijs-ui reached this independently for `bindText`; it is
      the same argument that kept `bindValue`/`bindList`, and applying it to
      only those two was the inconsistency. The `.d.ts` no longer marks the
      whole prop `@deprecated` (it was striking through correct code).
      Follow-up: post the resolution on tosijs-ui#127 and mirror in UPSTREAM.md.
- [ ] **Close tosijs#31 naming 1.9.0** — the `SYMBOL_MAP` split, the `create()`
      fix and the `listBinding()` fix close it, and it is still open, so
      downstream (including tosijs-ui#127) has no signal the fix shipped.
      Leave **tosijs#32** open with the narrowed-not-closed note.
- [ ] **Post the `bind*` resolution on tosijs-ui#127** (not #126, whose title
      reasons from the superseded `textContent`-only advice) and mirror in
      `UPSTREAM.md`. Comment; do not edit that repo.
- [ ] **Write back to `../tosijs-coding-practices`:** (a) a guard test whose
      fixture contains only one of the N paths it guards is VACUOUS — B-1 and
      B-2 both passed a green 927-test suite, and rounds 3/4 already flagged
      this shape ("every test used a single spelling per array"); (b) an
      environment-suppressed assertion is a passing test that proves nothing
      (happy-dom's zero rects hid the entire structural tier); (c) the
      root-cause escalation rule — when a security lens finds N findings
      sharing one precondition, the finding IS the precondition; (d) don't
      deprecate the primitive your own recommended sugar emits, and a
      deprecation whose replacement is a different syntactic form cannot be
      phrased as advice; (e) `releasing.md` already required a `Migration.md`
      entry and it was missed — make it a mechanical check.

## Benchmark numbers we publish, and the harness we do not have (round-4 M9)

- [ ] **We publish µs figures with no benchmark harness behind them.** `find src
bin tests -iname '*bench*'` is empty; so is a grep for `performance.now`
      or `Bun.nanoseconds` outside one-off probes. Every number quoted in the
      CHANGELOG and in this file came from an ad-hoc script under **happy-dom,
      in a shared test process** — which the shared practice on microbenchmark
      validity (`a3154cf`) says explicitly not to do: assert on ratios, never
      wall-clock; best-of-N; delete any ratio a test cannot defend.
      Interim: the CHANGELOG figure is now stated as a RATIO with the method
      disclosed. Proper fix: either add a harness that can defend a number, or
      stop quoting them and describe the shape of the win instead.
- [ ] **Lens 8's READ direction has never been run.** 48 practices commits since
      v1.7.9 have no disposition here. The KB is written back TO regularly and
      never read FROM, which is half a loop — and the one commit that turned out
      to govern numbers this release publishes (`a3154cf`) was sitting there
      unread the whole time. Add "read the KB diff since the last release" to
      the release checklist, next to the write-back.
- [ ] **P1's recorded range is stale.** It is ticked as outstanding but was
      landed by practices `1ca7eba`, whose range `v1.7.9..44ddc2b` is now ~28
      commits behind. A range that is not re-stamped is a range nobody can
      check, which is the failure the range was introduced to prevent.

## 1.8.0 pre-release review — round 3 (fast pass) + the security pass

Report: `REVIEW-1.8.0-rc.1-round3.md` (verdict BLOCK, now cleared), security
report: `SECURITY-1.8.0-rc.1.md`. **Commit range covered: `v1.7.9..e6f8eae`**
plus the follow-up commit that carries these entries — every later commit is
outside what those reports read, which is the thing round 2 asked for and did
not get.

### ✅ Fixed in round 3

Both blockers (B1 `setByPath` crashing on an own-`undefined` intermediate;
B2 the manifesto demo calling `call()` on a read-only surface) and **all nine
majors** M1–M9 — see the disposition table in the report. Plus five findings
promoted out of the "minor" tier because they were not minor:

- `assertSafeKey` refused `constructor`/`prototype` as ordinary **leaf** data
  keys, breaking dictionaries keyed by user data that worked in 1.7.9. Only
  `__proto__` is a sink at a leaf; descent still refuses all three.
- The secret-control denylist existed **twice** and had drifted, so a bound
  `<textarea autocomplete="cc-number">` returned **cleartext** before any
  `describe()` — a hole in the SEC-2 fix itself. One token list now feeds both.
- `<xin-slot>` markup was half-removed: still queried, never registered, so
  its children silently landed on the host. Now a warning tombstone, matching
  what `<xin-blueprint>`/`<xin-loader>` already got.
- The per-element isolation `console.error` was unthrottled — N× amplification,
  forever, because the loop no longer aborts. Now once per element type and
  message, like every other advisory this release added.
- CLAUDE.md's Session Completion told the next session to push a branch that
  **must never be pushed**, and to "resolve and retry until it succeeds". The
  prohibition existed only in agent memory. Now stated where the rule is read.

Also landed: batched ledger trim (~100× on a long-lived surface), `changes()`
drain no longer O(n²), `main.js` gained the CJS smoke gate it never had, and
`vendorSchematic()` now fails the build if NOTICE does not name the vendored
package's own repository (it went stale once across the rename already).

### 🔭 Open — routed, not dropped

**Needs a decision from the maintainer before the rc publishes:**

- [x] **E1 — DONE 2026-08-26, but it split in two.** The "one move" was
      tosijs-ui + tjs-lang + delete-the-`watchPaths`-duplication. Two of the
      three landed; the language bump did not, and the reason is a real bug
      rather than the false peer-range story this entry used to carry. - ✅ **tosijs-ui 1.9.4 → 1.12.0** (not 1.10.0 — three minors shipped
      while 1.8.0 was in flight) and the 10-entry `watchPaths` array is
      **deleted**. tosijs-ui#49 is genuinely fixed: `resolveWatchPaths()`
      folds `docPaths` in and dedupes by resolved path. Build + 898 unit
      tests + Playwright lane green, and **`dist/` is byte-identical to
      committed 1.8.0**, so the new build host changes nothing shipped. - ✅ **tjs-lang 0.10.1 → 0.13.6** (after a one-day detour at 0.12.0).
      0.13.0–0.13.5's `convert` stripped `new` from every class declared in
      the module it was converting, so the output threw `Cannot call a class
constructor without |new|` — at _import_ time for static-field
      initialisers. 15 sites across 4 of our modules, including
      `UnsafePathError`, the prototype-pollution guard. Bisected to 0.13.0,
      filed as **tjs-lang#37**, fixed upstream in **0.13.6** the same day.
      Caught by the published-bundle smoke gate and by nothing else — all
      898 unit tests passed under the broken toolchain, because they test
      `src/` and the bug is in the emitter. Re-verified on 0.13.6 by repro,
      green build, unit suite, Playwright 4/4, and by exercising the broken
      paths in the built artifact. Cost ~340 gz bytes per tjs bundle, which
      left 7 bytes of budget headroom — budgets raised 56k → 58k in the same
      commit. - The peer story is finally closed: since tosijs-ui 1.11.0, `tjs-lang` is
      an **optional** peer, so 0.12.0 against `^0.13.1` is a warning and
      nothing more. The peer range was never the blocker in either direction.

- [x] **E1a — DONE 2026-08-26.** tjs-lang#37 was fixed in 0.13.6 and adopted
      the same day; see E1 above. Still worth doing separately: re-read #33/#35
      (`asCompared`) against the 2.0 branch's boxed scalars.

- [x] **FILED as tjs-lang#40 (2026-08-26): the `tjs convert` inline-test-runner
      failures — both of them.** On every version tried, 0.10.1 through 0.13.6:
      `src/color.ts: 0 passed, 8 failed — clamp is not defined` (the runner does
      not resolve cross-module imports; `clamp` lives in `more-math.ts`), and
      `src/component.ts: 0 passed, 5 failed — Unexpected token ')'`. The emitted
      modules are fine — `tjs-out/component.js` parses, bundles and imports; the
      error is in the harness the runner wraps around the module. I first
      reported the `component.ts` one on tjs-lang#37 as a possible second
      emitter bug; it is not, and that correction belongs in the new issue.
      Net effect: **13 failures printed on every build, permanently ignored** —
      the ambient-noise condition that hides a real failure when one arrives,
      and why this read as noise during the E1 bump rather than as a known
      defect. **Largely fixed in 0.13.11** (verified 2026-09-04, not yet
      pinned): `color.ts` is clean and `component.ts` reports 2 _inconclusive_
      rather than 5 failures. See `UPSTREAM.md`.

- [ ] **Two repos, one e2e port.** `playwright.config.ts` here and tosijs-ui's
      both default to **8799**, so the two browser lanes cannot run at the same
      time — a lane running in tosijs-ui made this one fail with
      `NS_ERROR_CONNECTION_REFUSED`, which looks nothing like a port collision.
      Workaround is `E2E_PORT=8811 bun run test:browser`. Give the repos
      distinct defaults, or have the config pick a free port.

- [x] **E2 — MOOT, do not file (2026-08-21 re-survey).** The seam we were about
      to ask for already shipped: `registerTool(tool, { signal })` +
      `controller.abort()`, and since Chrome 153 it withdraws a tool without
      cancelling in-flight executions. We had probed only for a returned handle
      and for `unregisterTool` — neither of which the one browser that ships
      WebMCP provides — and fell back to overwriting tools with refusing stubs.
      So the compensation code was working around a gap that was not there.
      Now feature-probed and used (`supportsAbortSignal` in `src/webmcp.ts`),
      with the stub path kept for hosts that ignore the options argument.
      **Lesson: we inferred the absence of an API from a probe that never asked
      for it.** Filing would have been publicly wrong on a standards repo.
- [ ] **E3 — close #18, #22, #23, #24 naming v1.8.0** (all fixed by this
      release, all still open), and record a STILL-OPEN disposition for #26,
      #17, #16, #9. Deliberately NOT done yet: closing them announces a
      release that has not been published. Do it as part of the publish
      ceremony. When closing #22, state the fix's _condition_ — sugar is
      suppressed only when the member already HOLDS a function.
- [ ] **E4 — comment on haltija#16 and tosijs-ui#59.** Both are gated on
      "tosijs ships the agent surface" / "tosijs 1.8.0 beta-rc"; the condition
      is met. Same reasoning as E3 — post when the rc actually publishes.
- [x] **E8 — DONE for the two consumers present locally (2026-08-21).** Packed
      the rc tarball and ran each against it, restoring `node_modules`
      afterwards: - **tosijs-ui** (pins tosijs `1.7.8` exactly): `bun test` →
      **1003 pass / 0 fail**, 60 files. - **tosijs-3d** (`^1.7.8`): `bun run build` → exit 0, 117 static pages. - **react-tosijs**: _not checked out locally, so untested._ The residual
      risk is low for a specific reason rather than by hope: it ships state
      hooks with no DOM surface, and every removal in 1.8.0 is DOM-side
      (`data-ref`, `<xin-slot>`, the blueprint tags) or component-side (the
      `on<Event>` precedence flip). Verify before it adopts 1.8.0 anyway. - Still open: bump react-tosijs / ngx-tosijs off `^1.0.6` in their next
      releases — a range that wide is exposure to changes nobody reviewed.

- [ ] **THE CONSUMER LIST IS NOT DERIVABLE FROM npm, and I asserted otherwise.**
      Asked whether tosijs has consumers outside this ecosystem, I ran
      `registry.npmjs.org/-/v1/search?text=depends:tosijs`, got `0`, and
      reported it as fact. The maintainer immediately named two the query
      missed (**snowfox-app**, **nonono**). Checking why: the same query for
      `depends:tosijs-ui` returns **187,288** — the `depends:` qualifier does
      not filter, it fuzzy-matches text. So the number measured nothing.
      Two structural reasons no registry query can answer this:
      **an app is never a "dependent"** (nothing depends on an app, so it is
      invisible to the graph), and **private or unpublished repos do not
      appear at all** — snowfox-app is not on npm.
      **The only sources of truth are the maintainer's knowledge and grep over
      local checkouts.** Before the next release, get the real list from the
      maintainer and record it here, so consumer verification (E8) covers what
      actually exists rather than what npm can see.

- [ ] **Test a consumer with its TEST command, never its BUILD.** Learned doing
      E8: tosijs-3d has no test script, so I ran `bun run build` — which wiped
      and regenerated its **tracked** `docs/` (4,938 changes) and rewrote part
      of its uncommitted `dist/`. I restored `docs/` to committed state and
      left nothing untracked behind, but 17 `dist/` files that were dirty
      beforehand now match HEAD again, because my run regenerated them. No loss
      — every one is reproducible by running their build — but it is a change
      to another repo's working tree that I caused, and "file, don't fix" is
      supposed to mean not touching it at all. **Fix the shape:** ask
      tosijs-3d upstream for a `test` or `typecheck` script so a consumer check
      never has to invoke a site build, and use a throwaway clone if one is
      ever needed again.

**Correctness / efficiency (no user-visible harm today):**

- [x] **DONE (1.8.x, post-rc.1).** `contractviolation` now fires once per
      element per distinct reason, keyed in a `WeakMap` so a removed element
      takes its history with it. Measured before/after with the fix bypassed:
      **6 events → 1** over six binding passes, and it kept growing for the
      life of the page. Deduping IS a semantic change and the doc says so — a
      listener now counts distinct violations rather than binding-dispatch
      frequency, which is the number anyone actually wanted. Also documented
      (the event shipped in rc.1 with no docs and no tests, so every dispatch
      was unverifiable) and pinned by two tests, one of which was checked
      against the unfixed code to be sure it fails for the right reason.
- [x] **DONE (1.8.x, post-rc.1).** `anyInlineContracts()` — a monotonic count
      bumped at `setElementContract`, the single registration point — gives an
      O(1) early return for the common case where nobody declared an inline
      contract. **Measured on a 2000-element page: 44.9µs → 7.3µs per uncurated
      write, a 6× cut.** Monotonic on purpose: a WeakMap cannot say when an
      element is collected, and an undercount would skip a check someone asked
      for.
- [ ] A contracted root deep-clones the whole root (JSON round-trip) per
      sub-path write. **Copy-on-write was BUILT, MEASURED, and REVERTED —
      deliberately. Do not re-attempt without reading this.**

      The win is real: on a 200-doc root with 2 kB bodies, a sub-path write
      went **0.17ms → 0.04ms, a 4.3× cut**, and in a word-processor-shaped app
      that cost is per keystroke-equivalent.

      It was reverted because structural sharing changes **what a contract
      sees**, and that is not a thing to change casually in the release whose
      headline feature is contracts. Verified empirically: with the spine
      clone, a sibling `Date` reaches `check()` as a real `Date` and a sibling
      method reaches it as a live `function`. The JSON round-trip had been
      normalizing both away — a `Date` arrived as an ISO string, a function
      not at all.

      Both directions of that are defensible, which is exactly why it needs a
      decision rather than a perf commit:
      - *Truthful* — a contract validating a JSON-mangled fiction is arguably
        the bug, and `{type:'string'}` should fail against a `Date`.
      - *Compatible* — a root containing an action (which is normal: actions
        live under roots) would newly present a `function` to a JSON-Schema
        validator, so a schema with `additionalProperties: false` starts
        rejecting a root it used to accept.

      It also introduces an inconsistency worth resolving at the same time:
      `read()` still serializes, so a contract would see richer data than any
      reader of the same path.

      **Do it in 2.0, with the tjs schema-islands work** (tjs-lang#27), where
      the proposal shape is being reconsidered anyway and enforcement moves
      into the proxy — at which point "what does the validator see" is a
      first-class design question rather than a side effect. The spine-clone
      implementation is in the history if wanted.

- [x] **DONE (1.8.x, post-rc.1) — and the win is smaller than the finding
      implied, recorded honestly.** Cached against a `bindingGeneration()`
      counter bumped on binding registration and on observed insertion.
      **Measured: 5.4µs → 4.1µs per read on a 2000-element page — 24%**, not a
      transformation, because the selector is narrow by design and matches
      almost nothing. Kept because it is free at steady state and a real
      browser's document query over a large tree is likely worse than
      happy-dom's. **It is an optimisation inside a SECURITY path**, so the
      bump signal is deliberately generous (removals never bump — the secret
      set only grows) and two tests pin what matters: a secret bound _after_ an
      earlier read, and one bound while DETACHED then inserted — the case a
      naive dirty flag misses, since bind-time scanning cannot see an
      off-document element.
- [ ] `contractViolation` allocates two arrays per call via `warnIfFailsOpen`
      on the Component value-setter hot path — memoize on the schema object
      with a WeakSet; schemas are stable declarations.
- [ ] The `on<Event>` member-assignment rule depends on whether the element has
      been **upgraded**, so identical call sites diverge silently. Decide from
      the class (`customElements.get(tag)` prototype) or re-resolve on upgrade.
- [x] **DONE (1.8.x, post-rc.1) — closes the half of tosijs#24 that stayed
      broken.** The setter reflected a type-contradicting write to the
      attribute as a STRING and the getter preferred the attribute, so
      `el.mode = false` on a string-declared attribute read back the truthy
      string `"false"` — the exact bug the error message claims not to have
      ("applied as given — nothing is coerced"). A per-instance typed override
      now wins for as long as the attribute still holds what we reflected for
      it, so the message and the behaviour agree.
      An EXTERNAL `setAttribute` still wins, which is why the getter prefers
      the attribute at all, and a correctly-typed property write clears the
      override. Residual ambiguity stated rather than hidden: the DOM stores
      only strings, so an external `setAttribute('mode', 'false')` cannot be
      told apart from our own reflection of `false`. Three tests.
- [x] **DONE (1.8.x, post-rc.1) — did BOTH, because "route every advisory" was
      the wrong instruction.** Most of those ~20 sites report that something is
      WRONG (a binding threw, a contract was violated from a binding, a
      blueprint source was refused by policy, a WebMCP tool name was lost), and
      a flag called `quiet` must never be the reason nobody heard about one.
      So: the ADVISORY families now honour it — `warnDeprecated` (the largest,
      one function covering every deprecation) and the `on<Event>` collision
      advice, joining the posture notices and the slim-entry check — and the
      published doc comment now enumerates exactly what is silenced and what
      deliberately is not. Deprecations stay LATCHED while quiet, so turning
      the flag off mid-session does not replay warnings for things that already
      happened. Two tests, one per half of that contract.

**DRYness — four hand-duplicated lists, three of which have already drifted:**

- [x] **DONE (1.8.x, post-rc.1).** One `BUNDLES` declaration in
      `buildLibrary()`; the three build loops, `keepJs`, the execution gate and
      the size budgets all derive from it (**-31 lines net**). Each entry
      carries its own `probe` — `load` / `import` / `require` — because the
      three formats cannot be checked the same way, which is precisely why
      `main.js` had been built, kept and budgeted but never executed.
      Verified the budget gate still FIRES by setting an impossible budget:
      `module.js is 40928 gzipped, over its 100 budget`, exit 1. A gate nobody
      has watched fail is a gate you do not have.
- [x] **DONE (1.8.x, post-rc.1).** Inverted the composition: `index.ts` is now
      `export * from './index-browser'` + `export * from './index-agent'`, so
      the subset relation is structural — the CDN artifact cannot fall behind,
      because it is what the full entry is built from. Both did the same, and
      `entries.test.ts` asserts `full − browser === agent` anyway, because the
      failure it guards is someone re-adding an export to `index.ts` directly:
      that silently omits it from the most-loaded artifact this project
      publishes, and nothing else would say so. Verified the IIFE is still
      agent-free (`dist/index.js` does not contain `enableAgentInterface`) and
      unchanged in size.
- [x] **DONE (1.8.x, post-rc.1).** One hoisted `supersededByCuration()`, used
      by both `describe()` and `write()`. Hoisting alone does not prove the two
      USES line up, so there is now a test for the claim the comment was
      guarding: an inline schema under a curated root is absent from
      `describe().contract` AND unenforced by `write()`, while an uncurated one
      is both published and enforced.
- [x] **DONE (1.8.x, post-rc.1).** One `ownContract(cls)` in `contract-check.ts`
      (zero-dependency, no cycles), used by all six sites. Kept INTERNAL — it
      is not re-exported from any entry, so this consolidation added no public
      API. Callers that legitimately want a fallback still layer it on
      visibly: the agent surface's post-hoc `components[tag]` map, and
      `makeComponent`'s spec-level fill. Added the test the rule never had —
      a subclass declaring nothing inherits neither the parent's value gate nor
      its description, while the parent still honours its own.

**Coverage:**

- [ ] `contract-check.ts`'s fail-open warning and `const` branch are untested,
      and the `?case=N` cache-busting import idiom makes its reported coverage
      number meaningless — add a comment saying why.
- [x] **DONE (1.8.x, post-rc.1).** `test.skipIf` instead of a silent early
      `return`. Verified the difference: with `dist/state.js` moved aside the
      suite now reports **`1 skip`** where it previously reported a pass. A
      silent skip is the one form that can never be noticed, and during
      `bun run build` — which wipes dist before the suite — it was permanently
      a no-op reporting green.
- [x] **DONE (1.8.x, post-rc.1).** The artifact manifest moved to
      `bin/bundles.ts` — a module with NO side effects, because `bin/site.ts`
      executes on import (it starts the dev server), which is why the test was
      reduced to grepping its source text in the first place. Two real
      assertions now: every file reachable through `package.json`'s exports map
      is a declared artifact (so nothing ships with no ceiling and no execution
      gate), and every built artifact is under its declared budget. Verified by
      adding a bogus `./bogus` export — the test fails, as it should.
- [ ] Add a test asserting every schema in `describe().contract` refuses at
      least one value through `write()`.

**Docs / packaging:**

- [x] **DONE (1.8.x, post-rc.1), and one claim was outright FALSE.** The
      figures are now generated: `bun run build` rewrites a
      `<!-- sizes:start -->` block in README from the same measurements the
      budget gate takes, and CLAUDE.md points at it instead of restating it.
      llms.txt regenerates from `tosijs-site.config.ts`, corrected at source.
      Stated 26/24/16/36 kB against a measured 27/25/16/40.

      **The false one:** README claimed the release "tree-shakes to about
      1.7.x's size when you don't use it". The round-3 review had two
      contradictory measurements and said to measure before editing, so I did —
      an identical consumer app touching no agent API, built against each
      version: **20,995 → 23,862 bytes gzipped, +2.9 kB, +13.7%.** The agent
      surface *does* shake away (6.7 kB measured), but the contract seam, the
      path-segment guard and the binding bookkeeping sit on the ordinary path,
      so 1.8.0 is not size-neutral. README now says so and points minimalists
      at `tosijs/core`. **The "1.8.0 nets out at 1.7.x's size" release framing
      is falsified — do not repeat it.**

- [ ] "The agent surface tree-shakes away if unused" is claimed in five places
      with **no gate**, and `package.json` declares no `sideEffects` (removed
      deliberately — it shipped broken bundles once). Add a gate that bundles a
      two-line consumer and asserts gz size, or soften the claim and point
      minimalists at `tosijs/core`, which is the guarantee we actually ship.
- [x] **DONE (1.8.x, post-rc.1).** Fixed `/migration/` → `/Migration/` (README
      and history.md), `/building-apps/` → `/Building-Apps/`, and `/dom/` —
      which had no target at all, since `src/dom.ts` generates no page — is now
      prose naming the module. **Gated**, which is the durable half: the build
      checks every `](/slug/)` in the markdown docPaths and in `src/*.ts` doc
      blocks against the slugs `buildSite` actually just wrote, so the list
      cannot drift the way a hand-kept one would. Verified it fires by
      re-breaking a link: exit 1, with the offending file and the known-slug
      list printed.
      **Why these survived:** slugs are case-sensitive on GitHub Pages and not
      on APFS, so a case error looks perfect locally — and README is the site's
      home page, so one of them was a 404 from the front door.
      Still open: there is no `docs/404.html`, so a bad link lands on the SPA
      fallback rather than saying so. That needs buildSite support (upstream).

- [x] **DONE (1.8.x, post-rc.1). 5.48 MB → 3.81 MB unpacked** (packed 1.54 →
      1.17 MB). Dropped the source maps for `module.debug.js` and
      `module.safe.js` from `files`: 1.64 MB of maps for two bundles that are
      EXPERIMENTAL and currently inert. The other five keep theirs, because a
      consumer debugging `module.js` genuinely wants one.
      **Gated too**, beside the gzip budgets — those police what a consumer
      EXECUTES and nothing policed what they DOWNLOAD. Measured by actually
      packing, since summing `dist/` would quietly disagree with what npm
      ships. Verified it fires by setting an impossible budget: exit 1, "the
      published tarball is 3.81 MB unpacked, over its 1 MB budget".

- [x] **DONE (1.8.x, post-rc.2).** Documented at `PartsOf<T>` itself rather
      than softening the CHANGELOG line: "the declaration is the type" is
      ADDITIVE, not exhaustive. The intersection with `PartsMap` is required —
      parts resolve lazily by `[part]`, so an undeclared part is a legitimate
      runtime lookup — and the cost is that a typo typechecks as `Element` and
      throws. What the declaration buys is precision for what you DID declare;
      the check that closes the set is `exerciseComponent()`.
- [x] **DONE (1.8.x, post-rc.2).** The comment claimed "a non-function value
      (the usual `onClick: () => …`) is event sugar", which cannot be right —
      an arrow function IS a function. Rewritten to say what actually decides
      (whether the element already HOLDS a function under that key), with the
      two branches spelled out, why it is custom-elements-only, and the
      upgrade-timing sharp edge cross-referenced.
- [ ] **P7 — document the semver deviation.** 1.8.0 removes `data-ref` and
      `<xin-slot>`, de-functions `<xin-blueprint>`/`<xin-loader>`, and flips two
      behaviours with no prior deprecation warning, while CHANGELOG asserts
      adherence to semver. Add the note. Same paragraph: the BSD-3 → Apache-2.0
      relicense is invisible to semver and §4 imposes a NOTICE-redistribution
      obligation BSD-3 did not — say so, and put the relicense in the release
      notes' **first line**.
- [x] **DONE (1.8.x, post-rc.2).** The `--bare` form now annotates
      `ElementsProxy`, so a new user gets autocomplete inside `content` —
      where they will spend their first hour. The blueprint form keeps `any`
      and now says why: its tosijs import is type-only and erases, with
      `Component` arriving through the hydration factory, so that `any` is
      structural rather than lazy. Verified by scaffolding both forms and
      typechecking the bare one under `strict` against the published
      `tosijs@rc` — exit 0. Also corrected the generated README, which
      promised `https://localhost:3000` where `bun index.html` serves plain
      http on a port it prints.
- [ ] Freeze the declared-test step DSL's verbs, document that dev-time
      behaviour belongs in real tests, and consider making the scaffolded
      `tests:` block opt-in — it is a second, weaker test vocabulary that the
      scaffolder currently writes into every new component.

**Practices write-back (`../tosijs-coding-practices`) — P1, and P3–P6:**

- [ ] **P1 — do the lens-8 write-back.** It is a direct edit, not an issue, and
      filing it here is the deferral the KB explicitly warns against. Five
      edits, each attributed `— seen in: tosijs 1.8.0`: (a) `00-stack.md:122`
      and `review.md:9-26` omit tosijs from the has-CI list (`.github/workflows/
ci.yml` since e12d641); (b) `web-components.md:90,95,96,130` and
      `model-priors.md:66` still teach `xinSlot()`/`<xin-slot>`; (c)
      `web-components.md:169-182` teaches the unconditional `on<Capital>` rule
      this release inverted — rewrite WITH the determinism caveat; (d)
      `performance.md:155-159` recommends shipping an entry point with no
      singleton caveat. Tick with commit shas.
- [ ] **P3** — put a `base..HEAD` range line in all three report headers (this
      section now carries one), and make the range a literal template line in
      the KB's CONTRIBUTING.md. Second cycle in which that rule was written and
      then skipped by the very next write-back.
- [ ] **P4** — CLAUDE.md's Releasing section is a diverged, weaker copy of
      `practices/releasing.md` (7 steps vs 9 + scoreboard), and the omitted
      steps are exactly the ones this release missed. **There is no
      issue-closure step anywhere in the ceremony** — that is the structural
      cause of E3, not the four issues.
- [ ] **P5** — CLAUDE.md's Component Conventions never mentions `static
contract`, while `contract.attributes` + `initAttributes` on one class is
      a hard throw. Second consecutive release in which it drifted behind a
      component-API change; consider haltija's `docs-coverage.test.ts`
      CONCEPTS-table mechanism so drift is a failing test.
- [ ] **P6** — `practices/review.md` tells reviewers to file reports into
      `docs/reviews/`, which every tosijs-ui/site build `rm -rf`s — and the
      deletion gets committed, since release commits include regenerated
      `docs/`. This repo's reports live at the root, which is right, but it was
      reached by ignoring the practice rather than correcting it. Change the KB
      to `reviews/<version>-<slug>.md` and state the constraint.
- [x] **E5 — DONE.** tjs-lang#23 is now 🚧 FIXED-UPSTREAM / NOT-ADOPTED in
      `UPSTREAM.md`, naming the dates: the issue closed 2026-08-06, tjs-lang's
      last publish before that was 0.12.0 (2026-07-20), and we pin 0.10.1 — so
      no installable version carries the fix and the `configure-tjs-*`
      import-first guard stays. Verify against 0.13.0 stable. The stale
      RESOLVED marker was one 2.0 session away from deleting that guard and
      re-paying the H-4 defect.
- [ ] **E6** — `tosijs-schema` is a caret dep against a package we filed a
      "validation tightening in a MINOR" issue against, and 1.7.0 is already
      published. Pin exactly or narrow to `~1.6.0` and record why.
- [ ] **E7** — the WCAG 2.5.8 target-size rule is implemented twice and the two
      disagree; the shipped copy is machine-vendored, so it can only be fixed
      upstream. Already filed as tosijs-floorplan#4. Interim: let a caller's
      `flags` suppress the built-in rule map-wide.

## 1.8.0 pre-release review — the complete ledger (rounds 1 & 2)

Two nine-lens reviews ran against this release (`REVIEW-1.8.0-rc.1.md`,
`REVIEW-1.8.0-rc.1-round2.md`). **Every finding either shipped a fix, is
scheduled below, or is filed upstream.** Nothing was waved away.

### ✅ Fixed in this release

Round 1: B1 (a contract violation stranding the whole binding-dispatch
loop), M1 (typeMismatch broke third-party elements), M2 (a false
`on<Event>` warning), M3 (subclass `contract.attributes` dropped inherited
`initAttributes`), M4 (ARIA into the matching slot), M5 (the scaffolder's
open surface), M6 (semver + tombstones), M7 (Migration.md), M8 (ledger cap),
M9 (`describe()` waste), M10 (entry points), M11 (seven stale size claims),
M12 (docs speak as shipped), M13 (duplicated path matcher), M15/M16 (inert
gates became real build gates), M17 (list coverage — which exposed the
`cloneWithBindings` identity bug), M18 (CLAUDE.md), M20 (practices link),
M22 (UPSTREAM.md), M23 (WebMCP receipts).

Round 2: B1–B5 (the semver justification, the manifest leak, plaintext
passwords, non-idempotent `disable()`, read-only act tools) plus:
`settings.quiet` couldn't suppress what it was added for; contrast fired on
transparency; gzip budgets and the published bin are now gated in the BUILD;
unpinned CDN URLs in the scaffolder; Migration.md ships in the tarball;
`tosijs/state` really is a subset now; ungated `console.log` breadcrumbs;
tool-name collisions; EXPERIMENTAL surfaced to consumers; "old names still
work" scoped honestly.

### 🔴 ESCALATED on review — three fixed, one de-escalated after discussion

- [x] ~~**`share`/`sync`/`hot-reload` bypass contract enforcement.**~~
      **DE-ESCALATED after review (2026-08-17) — not a major, and arguably not a
      defect.** I escalated this as a security hole; it is a _trust boundary_,
      and the boundary is drawn correctly:

  - `share()` peers are **same-origin by construction** (BroadcastChannel).
    Injecting a message requires code execution on the origin — and anything
    with that can call `xin[path] = …` directly, so a contract check adds
    nothing against an attacker.
  - `sync()`'s transport is **chosen and wired by the app**. If your own
    server is hostile, contract validation is not the layer that saves you.
  - `hotReload()` restores what the same app wrote, in dev.

  Contracts gate the **agent boundary** (a non-human actor writing in) and
  the **component value boundary**. They were never a registry-wide
  invariant, and the docs now say so explicitly rather than implying it.
  Writes from these paths are still **auditable** — the agent ledger
  observes every touch in scope, so they are visible even when unvalidated.

  The one real residual is **version skew** (a v2 tab or a server ahead of
  the client pushing a shape the receiver doesn't expect) — a data-migration
  problem, not a security one, and one where refusing the write leaves the
  receiver _stuck_ rather than merely inconsistent. Scheduled as an opt-in,
  not a default:

- [ ] Optional `validate: true` on `share()`/`sync()` for the version-skew
      case, routing inbound deltas through the same contract check as
      `agent.write()` — with a documented failure mode (the delta is dropped and
      reported, not applied).
- [x] ~~`describe().contract` advertises constraints `write()` will not
      enforce.~~ **FIXED** — superseded inline schemas are dropped from the
      emitted contract, so the map never states a rule the surface won't apply.
- [x] ~~Contract validation fails open, silently.~~ **FIXED** — the
      built-in checker now warns once per keyword set when a schema declares
      constraints it cannot enforce, naming `setContractValidator`. Still
      paired with the upstream tosijs-schema vendorable-core ask, which would
      remove the divergence entirely.
- [x] ~~`exerciseContract` counts a surface REFUSAL as a passing
      counterexample.~~ **FIXED** — a read-only surface is refused up front with
      an actionable message; scope refusals and unreadable roots are recorded as
      _inconclusive_ failures. A harness that validated nothing can no longer
      report green.

### 🟠 Scheduled — correctness & packaging

- [ ] `globalThis.tosiAgent` has no collision detection — and two copies on
      a page is a scenario the scaffolder actively creates.
- [ ] WebMCP `provideContext` unregister BLANKS the page's entire tool set,
      including tools tosijs never registered.
- [ ] `on<Event>` member-vs-sugar depends on custom-element UPGRADE TIMING,
      which is exactly the blueprint case. Decide from `customElements.get(tag)`.
- [ ] The tosijs#24 mismatch route stringifies across the connect boundary
      (`false` before append, `"false"` after) while its error says nothing is
      coerced.
- [ ] `contract` became a reserved creator prop with no collision warning.
- [ ] `tosijs/state` emits `MODULE_TYPELESS_PACKAGE_JSON` under node and has
      no `require` condition — for exactly the CJS-likeliest audience. Emit
      `.mjs` (the build already does this for the CLI) or declare ESM-only.
- [ ] CJS `dist/main.js` grew ~49% carrying the agent surface, with no slim
      door (`./core` and `./state` declare only `import`).
- [ ] `index-browser.ts` copy-pastes index.ts's non-core exports; nothing
      forces a new full-entry export into the CDN artifact.
- [ ] `bun start` rewrites the tracked `src/schematic.ts` from a floating
      `^0.3.0` devDep. Pin exactly; run `vendorSchematic()` only under `--build`
      (verify-and-fail otherwise).

### 🟡 Scheduled — efficiency (confirmed by code shape; none is a ship-stopper)

- [ ] Ledger trim is an O(maxLog) splice per touch once saturated (~8%);
      amortize, and make `maxLog: 0` mean _don't record_.
- [ ] `changes()` is quadratic via `unshift` — push, then one reverse.
- [ ] `inlineSchemaFor()` walks every bound element on every `agent.write()`.
- [ ] `webmcpTools()` forces a full `describe()` (layout flush) at boot just
      to read `actions`.
- [ ] `bindingName`/`propBindingKey` do linear identity scans per record.
- [ ] `describe()` has no benchmark or budget, on the path a WebMCP host may
      call every turn.

### 🟡 Scheduled — audit / renderer consistency

- [ ] The audit re-implements the renderer's interactivity and target-size
      rules and has drifted; make the audit the single implementation once
      [tosijs-floorplan#4](https://github.com/tonioloewald/tosijs-floorplan/issues/4)
      lands. **Disclosed** in the audit doc block and the CHANGELOG meanwhile
      (which verdict to trust, and why).
- [ ] `boundsOf()` (window scroll only) and `measureBounds()` (accumulates
      ancestor scroll) define "page coordinates" differently, so the documented
      `within: boundsOf(el)` idiom mis-selects in inner-scroll apps.
- [ ] No conformance test that the vendored renderer and the producer agree
      on the record shape and provenance tokens.

### 🟡 Scheduled — coverage (every red or inert test stays scheduled)

- [ ] **Eight red `tjs convert` signature tests on every build**
      (`src/color.ts`, "clamp is not defined"); `tjs convert` exits 0, so the
      build reports success. Pre-existing and NOT dismissed: a new failure is
      indistinguishable from it.
- [x] ~~The `expose: 'all'` consent-warning assertion can never fail;
      `readOnlyNoticeGiven` has no test.~~ **FIXED** — `_resetPostureNotices()`
      (the test-only-reset pattern the deprecation registry already uses) makes
      both assertable; the consent warning is now asserted unconditionally, and
      the read-only notice has a test including that `settings.quiet` silences
      it.
- [ ] No compile-time verification of `PartsOf<T>` / `Component<typeof
contract>` — the release's headline TYPE feature lives in files tsc never
      sees. Add an _included_ `.types.ts` with positive and `@ts-expect-error`
      cases.
- [ ] `measureBounds()`'s scroll accumulation and fixed/sticky detection are
      untested in both tiers (happy-dom reports zeros).
- [ ] CLI error branches untested; the scaffolded _app_ is never executed.
- [ ] `src/cli.test.ts` leaves temp directories behind.

### 🟡 Scheduled — docs

- [ ] `static contract` / `ComponentMap` is absent from the canonical
      component reference page, though `contract.attributes` supersedes
      `initAttributes` and declaring both throws.
- [x] ~~CLAUDE.md's "Core modules" map omits all six new modules and the
      five entry modules.~~ **FIXED** — both groups documented, with the
      vendoring hazard and the same-file reason for `tosijs/agent`.
- [ ] The headline feature sits under "Utilities" in the nav and is
      unreachable from the README.
- [ ] `headless-embodiment.md`'s front matter advertises `elementsSSR` as a
      tosijs API; it does not exist, and the string ships in `llms.txt`.
- [ ] The review reports sit at the repo root asserting resolved claims as
      current — date-stamp and move to `reviews/`.

### 📤 Filed upstream (mirrored in UPSTREAM.md)

- Filed: [tosijs-floorplan#4](https://github.com/tonioloewald/tosijs-floorplan/issues/4)
  — one shared interactivity/target-size predicate.
- To file: tosijs-schema (a vendorable structural core, so one definition of
  `type`/`enum`/`required`/`minimum` semantics); tjs-lang (a: `convert`
  should exit non-zero when signature tests fail; b: resolve imported
  symbols instead of reporting `clamp is not defined`); tosijs-floorplan
  (the `esc()` workaround needs the tjs-lang#24 URL and a note that tosijs
  vendors the file through a converter); WebMCP (no unregistration seam).
- Add tosijs-ui#49 / #66 to UPSTREAM.md; resolve the tjs-lang pin skew
  (0.10.1 exact vs npm latest 0.12.0, which tosijs-ui@1.9.4 peer-deps).

### 📣 At publish

- [ ] Close #18, #22, #23, #24 naming v1.8.0, **with two honest caveats**:
      #22's member-wins applies only to custom elements when both sides are
      functions; #24's fix is declaration-based and covers tosijs Components
      only, not third-party custom elements.
- [ ] Comment on haltija#16 (the hold is lifted) and tosijs-ui#59 (the gate
      is met); add an "Unblocks" section to the CHANGELOG naming both.
- [ ] Give #9, #16, #17, #26 a recorded disposition — fix, re-scope, or
      close as stale.
- [ ] Deprecate `create-xinjs-blueprint` on npm with a pointer.

### 🔧 Process — route to `tosijs-coding-practices`

- [ ] **The nine-lens review has no security lens.** The one release whose
      headline feature is a remotely-drivable control surface shipped round 1
      with `security: NEVER RAN`, and round 2's B2/B3/B5 are the second
      demonstration. Add a conditional tenth lens, and make the report contract
      carry a mandatory `security: RAN (…) | NOT APPLICABLE because …` line.
- [ ] Five KB sites teach the pre-1.8.0 `on<Event>` rule; two teach the
      removed `xinSlot`/`<xin-slot>`.
- [ ] `00-stack.md` says tosijs has no CI (it has had since 2026-07-20 — but
      `main`-only, so it never ran against this branch). Add the rule: _a gate
      scoped to `main` is not a gate for work that never touches `main`;
      enumerate which lanes actually executed against the release commit._
- [ ] `review.md` tells reviewers to file reports into the directory the
      build `rm -rf`s.
- [ ] CLAUDE.md mandates `git push` as the definition of done — on a branch
      the user forbids pushing. Put the carve-out where the rule is read.
- [ ] CLAUDE.md's Releasing section is a diverged copy of
      `practices/releasing.md`, and the omitted steps are exactly the ones this
      release missed (the review itself, publish confirmation, issue closure).
- [ ] `performance.md`'s "smaller doors" needs the singleton caveat: an
      entry point that re-bundles module-scope state creates a SECOND instance,
      so a subpath that must share state has to resolve to the SAME FILE. Prove
      it by importing two entries in one process. (tosijs 1.8.0 shipped exactly
      this bug for an hour.)

## ✅ Bundle diet — shipped in 1.8.0 (2026-08-12)

Delivered as **entry points, not tree-shaking**: `tosijs/core` (slim —
33.9 → 32.2 KB gz, omits the blueprint machinery, share/sync, hotReload,
and warns in dev if blueprint markup is on the page) and `tosijs/state`
(15.9 KB gz, DOM-free, closes #18 — verified importing in plain node with
no shim, pinned by a subprocess test).

**⚠️ A `sideEffects` ARRAY is not safe with bun's bundler.** Adding an
accurate one (listing component/blueprint-loader/bind/css as
side-effectful) produced a BROKEN `dist/module.js`: `Blueprint` and friends
were exported while their definitions were shaken away — `ReferenceError:
"H6" is not declared in this file` on import. Caught only by executing the
built bundle, not by tests, tsc, or lint. Do not re-add `sideEffects` in
any form without an execute-the-bundle gate. (Filed as a build-lane
follow-up: the release checklist should smoke-import every published
bundle.)

Remaining (unchanged, 1.9-era):

## Bundle diet — the rest (deferred past 1.8.0)

**Tree-shaking / subpaths.** `share.ts` + `sync.ts` (~2.3 KB gz) and `hot-reload.ts`
(~0.3 KB) are clean, pure leaves — shake them via a `sideEffects` **array** and/or
subpaths. ⚠️ Never a blanket `sideEffects: false`: `component.ts` registers
`tosi-slot` at import (necessary), and `blueprint-loader.ts` registers TWO custom
elements at import (`tosi-blueprint`, `tosi-loader` — the 1.8.0 alias removal
halved this, and dropped `xin-slot` entirely). ✅ removals done.

**DECIDED (2026-08-03): blueprints are NOT shaken from the default entry.** Blueprint
consumers' contract is _markup_ — they have no import statement to protect them, and a
shaken registration fails SILENTLY (unknown element, no error, nothing hydrates; the
code that would warn is the code that's gone). So: `blueprint-loader.ts` stays listed
side-effectful and resident in `tosijs`; the size win ships as an opt-in **slim entry**
(`tosijs/core`) for consumers who choose minimalism — inverting who can get hurt from
"anyone upgrading" to "someone making an explicit choice". The slim entry should carry a
dev-mode check (scan `tosi-blueprint:not(:defined)` after load, warn) since unlike the
shaken case, slim core is present and can speak. Entangled on the merits (leave alone):
`color.ts` (via `css.ts`), `form-validation.ts` (via `component.ts`).

**CSS-native color math.** The computed-color-variable subsystem
(`Color.registerComputedColor` + `Color.queueRecompute` wired into
`onStylesheetChange`) reimplements what relative color syntax
(`oklch(from var(--x) calc(l * 1.5) c h)`, baseline 2024) and `color-mix()`
(baseline 2023) now do natively — emit those instead and the recompute loop,
its stylesheet observers, and the css.ts↔Color runtime coupling all delete,
and derived colors become live by construction. Keep in JS: contrast math
(`color-contrast()` unshipped everywhere; WCAG measurement is a JS-value job),
`invertLuminance`'s parser, `Color.fromCss`. Minor-version work: raises the
support floor to 2024 engines for derived colors; deprecation cycle for
`registerComputedColor`. Quick win regardless: `css-types.ts` imports `Color`
as a value but uses it only in types — make it `import type`.

## ✅ CI + real-browser lane (2026-07-20) — the review's "test:browser rots" finding, resolved durably

First CI for the repo (`.github/workflows/ci.yml`): `unit` (bun test) + `e2e` (Playwright).
The e2e lane runs the inline ```test doc fences through **Chromium + Firefox** via
`tests/doc-tests.pw.ts`(one navigation →`window.\_\_docTestResults` gates the whole
corpus; reuses the fences, zero duplication). Green in CI (~1.5 min). This closes the
review's practices finding — the browser lane no longer depends on anyone remembering to
run it.

Browser-runner journey (recorded so it's not re-litigated): tried haltija-Electron in CI
first; its `--headless` path delegates to Playwright anyway (filed haltija#6 on the
mode-discoverability), and tosijs-ui's own production e2e is pure Playwright with
`HALTIJA_DEV=0` — its code says they moved off "the fragile, not-in-CI haltija Electron
lane". So we mirror that proven pattern. Multi-engine (Firefox) immediately caught a real
cross-engine timing bug in a doc fence (rAF throttling) that Chromium and happy-dom both
missed — vindicating the multi-engine choice. The haltija doc-fence lane
(`bun bin/site.ts --test`) remains for **local** living-docs; Playwright is the CI gate.
Optional later: enable a webkit project (tosijs-ui skips it — iframe runner doesn't signal
per-page completion on WebKit).

## Post-1.7.0 follow-ups (from the 2026-07-20 pre-release review — GO_WITH_FOLLOWUPS)

Review verdict: 0 blockers. Confirmed items already actioned: share() H-7 test added;
`test:browser` gated in CLAUDE.md Releasing/Session-Completion; issues #14/#15 closed
(enforced since 1.6.7/1.6.8); UPSTREAM.md created; Migration.md 1.7 section added; stale
`package-lock.json` removed. Remaining (all non-blocking; **(unverified)** = sanity-check
before acting):

Most of this list was **retired in v1.7.1** (2026-07-21) — see the ✅ items.

**Coverage (minor):**

- [x] ✅ **v1.7.1** — Date-family control coverage: `getValue`/`setValue` round-trips for
      `datetime-local`/`month`/`week`/time-from-`Date` (`dom.test.ts`). _(The numeric-epoch
      `handleChange` UTC-vs-local test is still worth adding but not blocking.)_
- [ ] Headless assertion for the css theme-recompute fix — after changing a themed proxy
      var, assert the computed-colors `<style>` `textContent` regenerated (guard in `bun test`,
      not only the in-browser fence). (`css.ts`) _(unverified; covered by the Playwright fence)_

**DRY / cleanup (nit):**

- [x] ✅ **v1.7.1** — Extracted `settleBlueprints(host, selector, loaderTag)` for the
      copy-pasted allSettled+report block, and `configureTjs({...})` shared by both
      `configure-tjs-*.ts` (new `configure-tjs.ts`).
- [x] ✅ **v1.7.1** — Removed the dead `DATEISH` export from `dom.ts`.
- [ ] Centralize color recognition — an `isCssColor`/`tryParseColor` on `Color` so
      `invertLuminance`'s regex and `Color.fromCss` don't drift (regex rejects 4/8-digit hex +
      system colors that fromCss accepts). (`css.ts`)
- [x] ✅ **v1.7.1** — Reworded the `list-binding.ts` null-anchor comment (SVG/MathML
      namespaced case; HTML-table list containers unsupported).

**Efficiency micro-guards (nit, optional):** gate the shadow-content-binding diagnostic
behind `settings.debug` or record tagName regardless of query outcome (`component.ts:1584`);
short-circuit the `seenIds` build once `warnedDuplicateListId` (`list-binding.ts:1484`).

- [x] ✅ **v1.7.1** — `composedPath()` now guarded behind `event.composed` in `bind.ts`.

**Ecosystem / upstream:**

- [x] ✅ **v1.7.1** — #9/#16/#17 given explicit STILL-OPEN dispositions (commented on each;
      #9 = resize/hiddenProp, untouched by 1.7's nested-list/reorder work; #16 untouched; #17
      integrator caveat now documented, subscription seam still open).
- [x] ✅ **v1.7.1** — Filed the tjs-lang post-eval reconfiguration seam as
      [tjs-lang#23](https://github.com/tonioloewald/tjs-lang/issues/23) (UPSTREAM.md updated).
- [x] ✅ **v1.7.1** — #17's integrator note added to Building-Apps "Gotchas" (boxed proxies
      minted per access; never key memo on identity; `.map()` yields raw items).
- [ ] (optional) File tosijs-ui issue: site builder should strip its `.tjs`/`bun-plugin`/
      `*.tsbuildinfo` staging from `dist` after bundling so consumers don't need `files`
      negations.

**Packaging:**

- [x] ✅ **v1.7.1** — `CHANGELOG.md` + `llms.txt` added to the package `files` allowlist
      (they were built and committed but never published to npm). **This was the headline fix.**

**Practices / CLAUDE.md:**

- [x] ✅ **v1.7.1** — CLAUDE.md Build System debug/safe description updated (EXPERIMENTAL/inert,
      `configure-tjs-*` import-first ESM-order fix, strictness-is-a-different-axis note).
- [ ] Practices repo (`tosijs-coding-practices`): add "tosijs" to the haltija-port-squatting
      "seen in" note (review.md ~L448), reference haltija#1 as the in-flight isolation fix.

## 1.7 — the correctness release (planned)

Scope: fix all serious findings from the 2026-07-17 whole-codebase review (five parallel
adversarial reviews, each finding independently re-verified by executing repros against the
source). ~45 distinct defects; **every one passes the current 622-test suite** — the suite
tests happy paths. Ship as a **minor**, not 1.6.x patches, because several fixes are
observable behavior changes (shadow-DOM bindings coming alive, nested lists working at all,
number inputs writing numbers, exact observer matching) — semver-honest patch material they
are not. Contingency: if the id-path clobber (SB-3) bites anyone before 1.7 lands,
cherry-pick that one fix as 1.6.10.

Except where marked, everything below is in published 1.6.9. Line numbers are main's where
verified on main (`by-path.ts`, `xin.ts:1331`); others were confirmed on `tosijs-2.0`, whose
copies of `component.ts`/`list-binding.ts`/`path-listener.ts` are identical and whose
`bind.ts` differs only by +5 lines (checkPath hook).

### Ship-blockers

Progress: **ALL ship-blockers and the entire High tier (H-1…H-12) are fixed on main**
(2026-07-17/18, each with regression tests verified failing against the prior code where
distinguishable; suite 624 green). SB-3/SB-4/H-5 shipped in **v1.6.10**; everything else
lands in 1.7. SB-1 resolved as design-boundary (warnings + composedPath events + the
custom-input docs doctrine). H-4 decided (experimental tjs-built subpath bundles,
eval-order fixed, tjs-lang 0.10.1). H-6 shipped with its deepClone-Date prerequisite.

✅ **Browser-lane checks DONE** (2026-07-18): SB-2c (nested-list `<template>` cloning) and
on()-in-shadow origin resolution now have in-browser regression coverage as doc `test`
fences (bind.ts on() docs, list-binding.ts nested-list section), run via haltija through
`bun run test:browser` (wired as `--test` in bin/site.ts). Verified locally: 3 passed,
exit 0. This lane is reusable for any future happy-dom-blind behavior — just add a
`test` fence. Notes: H-10's observer-root-match change is a contract-alignment (deep
writes already touch the root, so saves happened either way — not a reproducible bug);
H-11's retry needed a `setModuleLoader` test seam because dynamic import() is unmockable.

**The 1.7 slate is code-complete and browser-verified.** Remaining before tagging: the
medium/minor backlog triage (fix-where-cheap), the runnable shadow value-widget doc
example, and the release mechanics (changelog with the behavior-change callouts,
tosijs-ui verification against a packed 1.7, version bump, build, tag, publish, then
rebase tosijs-2.0 onto v1.7.0).

Rebase policy (2026-07-17): `tosijs-2.0` is deliberately NOT rebased per-patch — one
rebase after 1.7 finalizes. If 2.0 work resumes earlier, hand-port only the by-path
fixes into `by-path.tjs` first (data corruption; the monadic-write machinery sits on
that lookup).

- **SB-1 — RECLASSIFIED (2026-07-17): not a bug, a documented design boundary that fails
  silently.** Binding inside shadow DOM is documented as unsupported (`component.ts:106`,
  `:226`). **The semantic model (decided 2026-07-17): a shadow-DOM component is bound
  like an `<input>`/`<textarea>` — its `value` is the binding surface.** Bind the
  component itself with `bindings.value`; setting `value` queues `render()` and emits
  `change` automatically; `render()` reflects value into the shadow DOM; internal
  representation is the implementer's business. Bindings do not compose _through_ a
  shadow tree (nested widgets are wired manually in `render()`) — a shadow component is
  materially different from a light-DOM component. Docs and warning text teach this
  model. (This is deliberate, original design — light-DOM-first with `tosi-slot`
  composition; don't re-litigate it against shadow-DOM-mandatory conventions.) The review's
  registry-of-shadow-roots sketch is REJECTED: per-root MutationObserver + per-root
  querySelectorAll decays exactly in the stress case that matters (a table of custom input
  widgets — N shadow roots each taxing every dispatch). Deliverables instead:
  1. ✅ **Warn at the point of misuse** — `bind()`/`on()` on an element inside a shadow
     root warns once per session, pointing at the documented pattern. The silent brick was
     the only genuinely broken part.
  2. ✅ **`on()` (and fromDOM change/input handling) works in open shadow roots via
     `composedPath()[0]`** — approved and landed 2026-07-17. Delegation also hops shadow
     boundaries upward (a click inside a shadow widget reaches light-DOM ancestors'
     handlers). O(1) per event, no registry, closed roots stay closed. Changelog callout:
     previously-dead handlers start firing. ⚠️ Browser-lane: happy-dom does NOT retarget
     composed events, so the retargeting half (composedPath vs event.target) is pinned
     only by the boundary-hop test — verify origin resolution in a real browser.
  3. **Path-indexed bind dispatch: WITHDRAWN — tried before, rejected again (2026-07-17).**
     Recorded so it stays dead: virtual list bindings keep the DOM at O(visible) by
     recycling elements and _reassigning their binding paths in place_ every scroll frame
     (`updateRelativeBindings` rewrites `binding.path`), so any path-keyed index turns
     scroll into per-element index churn on the exact hot path virtual scrolling keeps
     flat; and a leak-free path→element map is genuinely hard (element churn; strong refs
     leak subtrees, WeakRefs leak key entries). The current DOM-as-registry design is
     leak-free by construction, retargets recycled elements in O(1), and its
     querySelectorAll scan is bounded _because_ virtual lists cap live DOM size — the
     architecture and virtual lists are co-designed. The review's "O(paths × all bound
     elements)" efficiency finding should be read with that bound in mind. The only
     surviving bind-side shadow idea is an explicit **opt-in** per-root dispatch
     registration (developer owns the per-root query cost; nothing automatic) — parked,
     not planned.
- **SB-2: nested list bindings broken three ways.** (a) `list-binding.ts:1036` —
  `updateRelativeBindings` calls `toDOM` without the options argument, so a nested list's
  `idPath`/`virtual`/filter are discarded and the cached instance can never be repaired;
  pass the stored options through. (b) `xin.ts` `extendPath` double-brackets an
  already-bracketed segment (`list[id=x]` → `list[[id=x]]`) in the compound-path get branch,
  so all relative bindings under a nested list resolve to malformed paths; make extendPath
  idempotent for bracketed segments. (c) `metadata.ts:250-276` — `cloneWithBindings` on a
  `<template>` reads from `.content` but appends via `cloned.appendChild`, which per spec
  appends to the _element_; clone into `cloned.content`. Happy-dom masks (c) by redirecting
  `appendChild` — needs a browser test.
- **SB-3: stale id-path cache returns and CLOBBERS the wrong item.** `by-path.ts:63-68` —
  `buildIdPathValueMap` reuses the existing map object and never clears stale keys;
  `keyToIndex:95-102`'s validation fallback reads the stale entry back. After a proxied
  `splice` removes `{id:2}`, `getByPath('arr[id=2]')` returns the `{id:3}` item and
  `setByPath('arr[id=2].v', …)` overwrites item 3 (confirmed: silent data corruption). Fix:
  rebuild into a fresh map (or delete the stale key when validation fails). Same bug in the
  branch's `by-path.tjs` (inherited by the port).
- **SB-4: a cascaded write inside an observer breaks `await updates()`.** `path-listener.ts:163-227`
  — `update()` resets `updateTriggered` before dispatch; an observer that writes state (the
  documented calculator pattern) replaces the module-level `resolveUpdate`, so the prior
  promise never resolves (hang) and the new one resolves before its update runs. Related,
  same function: a throwing observer _test_ function is re-thrown out of the filter after
  `touchedPaths` was cleared — remaining observers never fire and `updates()` hangs
  (callback throws are caught; test throws are not, `:172-189`). Fix: chain/settle the
  promise correctly across cascades, try/catch around `test` like callbacks, and
  `resolveUpdate` in a finally.
- **SB-5: every list update re-inserts every item element.** `list-binding.ts:1508-1524` —
  the reorder pass anchors on `insertionPoint = null`, but the first item's previous sibling
  is always `listTop`, so item 1 always "moves" and the cascade re-inserts the entire
  visible list on every update, including no-op touches and every virtual-scroll frame.
  Kills focus/selection in list inputs, restarts animations/iframes. Fix: anchor the
  comparison against `listTop` (`insertionPoint ?? this.listTop`).

### High

- **H-1: prefix matching lacks segment boundaries, in three places.** Observer match
  (`'foo'` hears `'foobar'`, `path-listener.ts:130-133`), touch dedupe
  (`touch('foo'); touch('foobar')` swallows the second, `:230-234`), bind dispatch (touching
  `list[5]` re-renders bindings on `list[50]`, `bind.ts` dispatch loop). One shared helper:
  prefix match only if next char is `.`, `[`, or end.
- **H-2: Component pending-attribute drain is first-write-wins.** `component.ts:1147-1162` —
  the parser-wins guard `!hasAttribute` can't distinguish a parser-set attribute from one
  landed by an earlier op in the same queue, so the second pre-connect write to the same
  property is silently dropped. Fix: snapshot which guarded attributes existed before
  replay, or dedupe the queue keeping the last op per attribute.
- **H-3: `initAttributes` accessors are non-configurable.** `component.ts:1225` — omitted
  `configurable: true` means a leftover subclass field with the same name throws a cryptic
  TypeError from `document.createElement` under modern `[[Define]]` class-field semantics
  (ES2022/Vite/esbuild default). Fix: `configurable: true` + a helpful warn when an own
  field shadows an initAttribute.
- **H-4 — DECIDED (2026-07-18): keep the tjs-built subpath bundles as the toe-dip,
  flagged EXPERIMENTAL.** ✅ Landed: the eval-order bug is fixed (config now lives in
  `configure-tjs-{debug,safe}.ts`, imported FIRST from the entries, so it evaluates
  before any library module captures `__tjs` — previously `export * from './index'`
  evaluated the whole library before the config block ran); the debug bundle announces
  itself as experimental via console.info (safe stays silent — production-facing);
  tjs-lang upgraded 0.8.6 → **0.10.1** on main (includes the memory-leak fix).
  Plainly-documented current state: `tjs convert` marks all converted-from-TS functions
  unsafe by design (TS is presumed tsc-checked; safety is opt-in in native TJS — the
  emitted TJS stamps `:!` on every signature), so **no runtime checks fire on this line
  yet**; what ships is complete per-function `__tjs` runtime type metadata plus config
  plumbing that's genuinely wired for enforcement as modules go native in 2.0.
  Changelog for 1.7: describe exactly that — experimental, metadata now, enforcement
  with 2.0.
- **H-5: `throttle()` fires the wrapped function twice per isolated call.**
  `throttle.ts:91-106` — the trailing timer is scheduled unconditionally and never cancelled
  after a leading-edge run. Doubles every non-idempotent throttled handler and every
  ListBinding slice/filter update. Fix: schedule the trailing call only for suppressed
  invocations.
- **H-6: `getValue`/`setValue` value handling.** `dom.ts:49-72` — number/range inputs
  return strings, so numeric state silently becomes string state on first keystroke.
  **Decision (2026-07-17): two layers.** The binding layer is the type boundary — DOM
  speaks string, state speaks typed values — and both of these hold at once:
  1. **Typed-control reads (input-driven):** a control that declares its type is read
     natively by `getValue`, independent of state. `type=number`/`range` →
     `valueAsNumber`; the date family (`date`, `datetime-local`, `month`, `week`) →
     `valueAsDate`, `time` → `valueAsNumber` (ms since midnight); checkbox stays boolean.
     NaN/null (empty or partial entry) falls back to the raw string — never fabricate a
     number or a 1970 date from an empty field. This covers the **bind-before-data
     bootstrap**: when state is still undefined (deeply-async pattern) there is no state
     type to consult, and the control's declaration is what keeps the _first_ write
     correctly typed. It also keeps `getValue` honest as a public standalone utility.
  2. **State-driven coercion (the general net):** in `handleChange`, state's type is
     authoritative for controls that _don't_ declare one. Path holds a number + control
     yields a clean numeric string → coerce with `Number()` before writing (fixes text
     inputs, selects with numeric option values, radios). Guard: only non-empty strings
     that parse cleanly (`Number('')` is 0 — never coerce empty to zero); non-numeric
     input writes raw so 2.0 strictness flags it honestly instead of the coercion hiding
     it. For temporal state the same rule picks the **representation**: state holds a
     Date → write `valueAsDate`; holds a number → `valueAsNumber` (epoch ms); holds a
     string → keep the control's ISO string. Bootstrap default for empty state under a
     date-family control: the `Date` from layer 1.
     ⚠️ Dependency: Date objects in state require the `deepClone` Date fix (medium backlog —
     currently `deepClone(new Date())` → `{}`, and Component deep-clones `value` through
     it) landing in the SAME release; and document that JSON-based share/sync serializes
     Dates to ISO strings (inherent to JSON — don't pretend otherwise).
     toDOM direction, same doctrine: `setValue` accepts the union (Date | epoch number |
     ISO string) for date-family controls and sets via the matching native property; radio
     `checked` uses strict equality so numeric state never matches `value="5"` — compare
     `String(state)` to `element.value`; radio group lookup only searches `parentElement`.
     `setValue` guards: binding a text input to a missing path renders literal `"undefined"`
     (contradicts "bind before data exists" — render `''`), multi-select with `undefined`
     throws inside the observer flush, `date` with null must clear the field, not 1970-01-01.
- **H-7: `share()` restore re-broadcasts a stale snapshot over live tabs.**
  `share.ts:328-357` — restore does `setByPath` + `touch`, then registers the outbound
  observer synchronously; since touch is async-batched, the observer sees the restored
  (up-to-500ms-stale, debounced-persist) values as fresh local changes and broadcasts them,
  clobbering fresher live state in other tabs (confirmed). Also `sharedPaths.add` happens
  before the awaited IDB `get`, so a live delta landing mid-read is overwritten. Fix: route
  restore through `applyInbound` (or register the observer only after `await updates()`).
- **H-8: `sync()` loses deltas on transport failure.** `sync.ts:232-236` — the batch is
  `splice`d out before `transport.send`; a throwing send (websocket closing is routine)
  loses them permanently and silently (the exception is swallowed by path-listener's
  callback catch). Fix: requeue the batch on failure; document/require transports to throw
  rather than no-op (the sample websocket transport silently drops when not OPEN).
- **H-9: boxed `value`-property write asymmetry.** `xin.ts:1331` — the set trap treats
  `prop === 'value'` as the boxed-value write for any boxed target, with no own-property
  shadowing check (the get side has one). With `{slider: {value: 5, …}}`, reading
  `boxed.slider.value` returns 5 but assigning it **replaces the whole slider object with
  the scalar** (confirmed). Fix: mirror the get side's `'value' in target` check.
- **H-10: `hotReload()` restore corrupts state.** `hot-reload.ts:28-46` — `Object.assign`
  restore silently discards saved root scalars (assign onto a primitive) and merges arrays
  without truncating (`['a']` over `['x','y','z']` → `['a','y','z']`); the observer filter
  only matches the exact root key, so deep writes after restore are never saved again. Fix:
  wholesale replace via `setByPath`; prefix-match the filter. No test file exists — add one.
- **H-11: one failed blueprint import wedges the loader forever.**
  `blueprint-loader.ts:265-301` — the rejected promise is cached permanently (no retry) and
  `Promise.all` rejection means `allLoaded` never fires and the rejection is unhandled. Fix:
  evict failed cache entries, `allSettled` + per-blueprint error reporting.
- **H-12: events on `cloneNode` copies of bound elements throw in the global dispatchers.**
  `bind.ts` `handleChange`/`handleBoundEvent` — WeakMap `get(target)` is used without a null
  check; clones carry the `-xin-data` class (and, pre-1.7.3, `-xin-event`) but no WeakMap
  entries. Degrade gracefully (skip) instead of TypeError-ing and aborting ancestor traversal.
  _(1.7.3: the `-xin-event` marker class was retired entirely — the event ancestor walk now
  consults the elementToHandlers WeakMap directly, so clones are never even visited. The data
  marker stays but was renamed `-xin-data` → `-tosi-data` in 1.7.4, and dispatch now enumerates
  it via getElementsByClassName (1.6–2.6× faster than querySelectorAll); it can't be a WeakMap
  because dispatch enumerates by path, and can't be a data-attribute because getElementsByClassName
  is class-only.)_

### Medium backlog (fix in 1.7 where cheap; otherwise carry, don't drop)

**✅ FIXED in 1.7 (2026-07-18 triage pass, each with a regression test):**

- packaging: `types`-first in exports; excluded `*.tsbuildinfo` + `dist/bun-plugin` from
  the tarball.
- binding/lists: reactive `class` now replaces (not accumulates); `bind()` no longer
  mutates the caller's spec; `bind: { value, binding: 'name' }` string form resolves and
  renders; duplicate list ids warn once; removed the debug `console.log` in the filter path.
- css/color: unitless custom props no longer get `px`; alpha hex rounds (not floors);
  `deepClone` preserves Date/Map/Set + handles cycles (H-6 prereq).
- component: stale `_attrValues` cleared on external `removeAttribute`; `isSlotted` compares
  to `null`; `TosiSlot.replaceSlot` preserves `<slot>` fallback children; **Component
  `change` now bubbles + composes** (was non-bubbling — ancestor listeners never heard a
  component's value change, breaking the bound-like-an-input contract for user code).
- xin/by-path: symbol-keyed assignment stores on target (was throwing in extendPath);
  compound boxed paths already fixed by SB-2b; `deleteByPath` null already fixed by SB-3.

**⏸ DEFERRED / carried (not cheap, or better in 2.0):**

- `tosiValue` function-proxy unwrap — partial fix only (identity already lost to
  `.bind()`-per-access), and taxes the hot path; needs function-identity caching (2.0).
- no `deleteProperty` trap — `delete proxy.x` mutates silently with no touch. Design
  decision (should delete touch? synthesize a removal?) — 2.0.
- ListBinding has no teardown — `scrollContainer: 'window'` leaks the detached list
  forever. Converges with the `FinalizationRegistry` observer-cleanup idea (2.0).
- id values containing `=` resolve to the wrong item via the proxy get trap
  (`split('=')`); numeric-string object keys readable but unwritable (setByPath expects an
  array); id-path touch synthesis only handles the innermost bracket. Niche path edge
  cases — carry.
- `value` attribute beats a later `value` property write at hydration (property should
  win); no `parts` invalidation after a DOM-replacing `render()`; a `change` listener that
  mutates `value` swallows the second change event; `formResetCallback` ignores the
  captured class-field default; dead `_value` stores. Component edge cases — carry.
- changing an item's id in place orphans its bindings + leaks the strong-Map entry; scalar
  list items recreated every update; O(n²) removal scan without idPath. List perf/edge —
  carry.
- `vars.gray50` digit-suffix calc-sugar collision (escape hatch or loud docs) — carry.
  `debounce`/`throttle` `cancel`/`flush` API — carry (additive surface).
  ✅ FIXED 2026-07-20: `css-colors.ts` wired in (DOM-free named colors; killed 150 lines
  of dead code), `invertLuminance` no longer drops named colors, `StyleSheet()` returns
  its element, `debounce`/`throttle` preserve `this`. `invertLuminance` still skips
  MODERN color syntax (oklch/color()) — carry.
- share/sync minors: echo-window can swallow local changes; overlapping roots
  double-broadcast; `sync.ts` `inboundPaths` module-level across instances; the `share()`
  doc example (`restored.includes(app.user)`) can't work (boxed proxies aren't
  identity-stable) — fix the doc. Mostly design tradeoffs — carry.
- ✅ FIXED 2026-07-20: `parts` now honors the documented `data-ref` lookup (part= ->
  data-ref= -> css selector) and ignores symbol keys; docs restated. The `share()` doc
  example (proxy identity) also corrected.

### Docs surfacing for 1.7

The shadow-DOM doctrine (component = custom input, value is the binding surface) is now
in: Component's doc block (two passages), both warning texts, `bind()`'s doc block
(`on()` section), and Building-Apps.md's mental-model section — all of which feed the
doc site and llms.txt at build. ✅ **Shadow value-widget live example DONE** (2026-07-18): a runnable star-rating widget
in Building-Apps.md, bound by value alongside a plain number input on the same path, with
an in-browser companion `test`. Writing it surfaced the non-bubbling `change` bug (fixed).
⚠️ confirm the new doc `test` fence on a CLEAN browser run before 1.7 final (the last
`test:browser` run adopted a FOREIGN haltija — a tosijs-3d interactive session squatting
the default port 8700 — navigated its window to our pages, and timed out. Environment +
upstream, not our test; the widget logic is unit-verified in happy-dom). Root cause and
fix filed: **haltija#1** — spawned (`-f`) automation runs should be a private, isolated
instance (own server/port/Electron), never adopting the shared interactive browser;
tosijs-ui's dev-server test mode is the consumer that adopts the shared server today.
Until that lands, run `test:browser` when no other tosijs-ui project's haltija is on 8700.
Still wanted:

- README has no shadow-DOM guidance beyond one `shadowStyleSpec` code sample — fine
  (README stays lean), but verify llms.txt picks up the Building-Apps section after the
  next build.

### Test infrastructure for 1.7

- **Browser test lane** (we have browser-based testing available) for the class of bug
  happy-dom cannot see: shadow-DOM bind/on, `cloneWithBindings` on real `<template>`
  elements (happy-dom's non-spec appendChild redirect masks SB-2c), event retargeting,
  focus/selection retention across list updates (SB-5's regression test).
- **Error-path discipline:** every one of the ~45 findings passes the current green suite.
  Each 1.7 fix lands with a regression test asserting the previously-wrong behavior.
- Specific gaps called out by the review: throttle single-call-then-wait; hot-reload (no
  test file at all); share "restore does not broadcast"; sync transport-failure;
  deepClone Map/Date/circular; number-input round-trip type preservation; nested lists
  (zero tests today); duplicate-id lists.

### Release mechanics

**Cross-project release sequence (decided 2026-07-20).** tosijs and tosijs-ui are
mutually dependent — tosijs-ui runtime-depends on tosijs; tosijs build-depends on
tosijs-ui (doc/build host, a **devDependency**, not in tosijs's shipped bundle). Unwind
the cycle in this order:

1. **tosijs-ui 1.7.0-fc** (npm-published pre-release, not a branch ref — tosijs must pin a
   real version for a reproducible build). Settles the host: latest haltija (`--private`
   test lane, `haltijaDev` surfacing — tosijs-ui#18) **and the tsc-fatal fix** (make
   `libraryBuild` fail on `tsc` errors — a type error shipped in beta.1 because the build
   exits 0 on tsc failure; this is the gating item, it protects tosijs 1.7.0's `.d.ts`).
2. **tosijs 1.7.0 final** — bump the tosijs-ui host pin to the fc, consolidate the
   beta.1+beta.2 changelog into one 1.7.0 section, rebuild, one clean `test:browser` run
   (works now: `hj eval '…' --window <id>` targets our tab; `haltijaDev`/`HALTIJA_DEV=1`
   injects the client — no haltija upstream fix needed), tag, publish to `latest`.
3. **tosijs-ui 1.7.0 final** — bumps its tosijs dep to 1.7.0, closes the loop.
   haltija#4/#5 are quality-of-life, NOT release blockers — do not gate on them.

Then rebase `tosijs-2.0` onto v1.7.0 (see below).

- Fold in the **stale committed `dist/`** rebuild (the debug/safe bundles re-minify ~3.6KB
  smaller under current Bun; deliberately deferred from the 1.6.22 devDep bump so published
  artifacts wouldn't change under cover of a dev-only patch — 1.7 is the "next real
  release" it was waiting for).
- Changelog must call out the behavior changes explicitly: shadow-DOM bindings now live,
  nested lists functional, exact-segment observer matching, numeric input round-trip,
  class-binding replace semantics, list-update DOM stability, throttle single-fire.
- Verify tosijs-ui (the main consumer) against a packed 1.7 before tagging — SB-1/SB-2/SB-5
  all touch machinery it leans on.
- After shipping: rebase `tosijs-2.0` onto v1.7.0 (same dance as the v1.6.9 rebase); the
  branch's 2.0-only review findings are tracked in the branch's TODO.md.

### State-change type checking / strictness — DEFERRED to post-1.7.0 (2026-07-20)

Decision: do **not** backport `settings.strictness` / `pathCreation` / `bindingPaths` to
the 1.7 line. They stay 2.0-only; state-change type checking ships when 2.0 does.

Context (a consumer conflated two mechanisms — keep them straight):

- **`settings.strictness` = state-update type checking** (assign a value whose runtime
  type differs from what the path holds → warn/throw). Real, enforced, tested — but lives
  **only on `tosijs-2.0`** (main's `settings.ts` is just `{ debug, perf }`). This is the
  thing consumers actually want when they say "type checking on state updates."
- **`tosijs/debug` + `__tjs` metadata = TJS function-signature checking** (H-4). A
  _different axis_: ships per-function metadata now, enforcement arrives with native-TJS
  modules in 2.0. Will never provide state-update checking no matter how enabled.
- **"flight recording"** — no tosijs feature by that name; nearest is tjs-lang's monadic
  error ring buffer (write-closed; filed upstream), surfaced only via the debug bundle's
  `__tjs` runtime.

So a consumer (e.g. an experimental tosijs-ui build) wanting strictness in 1.7 can't get
it from any `tosijs@beta` release; the feature is on the 2.0 branch. Revisit when 2.0
lands it on the release line.

## work in progress

- change `MutationObserver` in Component if there's an `onDomChanged`
  or something handler to trigger it as appropriate
- automated golden tests?
- `css()` should handle multiple `@import`s
- possibly leverage component static property method (if we can keep type preservation)

- consider automatic observer cleanup via `FinalizationRegistry` — observers in the
  `listeners` array (path-listener.ts) persist forever unless explicitly `unobserve()`d
  or the callback returns `observerShouldBeRemoved`. If an observer is tied to a
  component/element, it could be auto-removed when the owner is GC'd (same pattern
  as `tosiUnique`'s owner-based cleanup). The 1.7 review's ListBinding-teardown finding
  (window-mode scroll listeners pinning detached lists forever) is the concrete case this
  would solve — see Medium backlog above.

## tjs-lang

- `Boolean()` on proxied scalars always returns `true` (JS spec limitation —
  `Boolean(anyObject)` is always `true`). TJS could fix this via `TjsEquals`
  or by compiling boolean coercion checks to use `.valueOf()` instead

## Agent surface — secret-path matching is spelling-sensitive (tosijs#32)

- [ ] **A DIRECT read spelled by index returns cleartext where the id-path
      spelling redacts.** `read('list[0].pw')` and `read('list.0.pw')` leak;
      `read('list[id=a1].pw')` redacts. Same location, three names, one string
      compare. Reachable through `tosi_read` wherever reads are published and
      through `globalThis.tosiAgent` from any script on the page.

      **Descending from an ancestor IS covered** as of 1.8.3 — `redactWithin`
      tries the bracket-index, dot-index and every registered id-path spelling,
      so `read('list')` is safe. It is the query side that is open.

      The fix is canonicalising index segments to the registered id-path form
      before matching, and **it must fail closed**: an error inside the
      canonicaliser has to mean "possibly secret", never "not secret". I
      attempted it during the 1.8.3 remediation, got `pathParts`' return shape
      wrong (`(string | string[])[]`, dot-split runs interleaved with bracket
      strings), and it THREW inside `isSecretPath()` — which fails open at
      every call site that does not catch. Reverted rather than shipped.

      Issue: https://github.com/tonioloewald/tosijs/issues/32 — carries the
      repro, the root cause and the test plan.

- [ ] **`redactWithin`'s multi-spelling descent is not independently pinned.**
      SEC-2f fails only when BOTH the descent loop and the index-alias
      containment are reverted — the containment subsumes the descent for the
      two-idPath shape. If the containment is ever narrowed, the `for`-over-
      `find` behaviour loses its only guard silently. Wanted: a case where two
      spellings both contain a secret and the containment does not apply.

- [ ] **The dot-index assumption has a third copy** at `src/agent.ts` in the
      actions walk (`${path}.${key}`). A shared path-canonicalisation helper
      would close both this and the query side at once, rather than leaving a
      third address to drift. _(unverified — line confirmed, behaviour not
      exercised.)_

## 2.0 — THE PURGE INVENTORY (every deprecation, in one place)

**Why this list exists.** 1.7.6 renamed five blueprint types to `Tosi*` with
`@deprecated` aliases and nobody wrote down what else needed the same
treatment — so **22 more `Xin*` type names sat unconverted and untracked for
four releases**, including ones in the _documented_ API. That miss happened
because there was no inventory. A 2.0 purge without one reproduces it at
larger scale, across markup, runtime functions and types at once.

Policy until then (maintainer, 2026-09-01): **the great purge is 2.0; until
then we try not to break anyone.** Keep compatibility where it is cheap — a
type alias costs nothing at runtime or in the bundle. Break only where
compatibility is preserving a design error (as the `initAttributes` /
`contract.attributes` throw was, #29).

### Runtime deprecations — each warns once, keyed in `deprecationWarnings`

| key                        | site                      | replacement                                                                                                                                           |
| -------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tag`                      | `blueprint-loader.ts:441` | `<xin-blueprint>` / `<xin-loader>` markup → `<tosi-*>`                                                                                                |
| `blueprint`                | `blueprint-loader.ts:467` | `tosiBlueprint()`                                                                                                                                     |
| `blueprintLoader`          | `blueprint-loader.ts:480` | `tosiLoader()`                                                                                                                                        |
| `elementCreator-tag`       | `component.ts:1293`       | `static preferredTagName`                                                                                                                             |
| `elementCreator-styleSpec` | `component.ts:1299`       | `static lightStyleSpec`                                                                                                                               |
| `elementCreator-extends`   | `component.ts:1305`       | `static extends`                                                                                                                                      |
| `initAttributes`           | `component.ts:1393`       | `static initAttributes = {}` (the method form goes)                                                                                                   |
| `static-styleSpec`         | `component.ts:2434`       | `static shadowStyleSpec`                                                                                                                              |
| `xin-slot`                 | `component.ts:2584`       | `<tosi-slot>` markup                                                                                                                                  |
| `xinSlot`                  | `component.ts:2602`       | `tosiSlot()`                                                                                                                                          |
| `initVars`                 | `css.ts:645`              | `_` / `__` prefixes                                                                                                                                   |
| `bind<Type>`               | `elements.ts`             | `bindText`→`textContent`, `bindEnabled`/`bindDisabled`→`disabled`. **`bindValue` and `bindList` are NOT deprecated** — no plain prop expresses either |
| `boxedProxy`               | `xin-proxy.ts:125`        | `tosi()`                                                                                                                                              |
| `xinProxy-boxed`           | `xin-proxy.ts:183`        | `tosi()`                                                                                                                                              |

Not in that registry but deprecated and warned separately:

- **`onResize`** (`component.ts:1722`) → `handleResize`.
- **`xinValue` / `xinPath`** (`metadata.ts:242`) → `.tosi.value` / `.tosi.path`.
  Note `tosiValue` / `tosiPath` are _also_ soft-deprecated in favour of the
  accessor; decide in 2.0 whether they go too or become canonical.

### Type-only deprecations — zero runtime cost, so cheapest to keep longest

- **All 27 `Xin*` type aliases.** Five renamed in 1.7.6
  (`make-component.ts:93-100`), the other 22 in **1.8.2**
  (`xin-types.ts`, `css-types.ts`, `metadata.ts`).
- ⚠️ **`index-core-exports.ts` and `index-state.ts` use EXPLICIT export lists,
  not `export *`.** Deleting an alias means deleting it in _two_ places, and
  the reverse bit us in 1.8.2: renaming the css types in that list silently
  removed the old spellings from the public surface, invisible to our own
  typecheck because our own code had already moved. **Any purge step needs a
  consumer-compile check, not just a green `tsc` here.**
- `xin-types.ts:303-309` — the `bindText` / `bindList` / `bindEnabled` /
  `bindDisabled` binding-shortcut types.

### When the purge runs

- Delete in **one** commit per category (markup / runtime / types), so a
  bisect can land on the category that broke someone.
- The three categories have different blast radii: **types** break a build
  (loud, instant, trivially fixed); **runtime functions** break at call time;
  **markup tombstones** break _silently_ — that is the entire reason
  `<xin-slot>` is a warning subclass rather than a plain removal, and the
  category to migrate first and remove last.
- Re-derive this table before starting; it is a snapshot of 1.8.2, and the
  point of writing it down is that snapshots go stale where memory just fails.

## 2.0 / tjs — why the port is the bet, not just a rewrite

**Framing recorded 2026-08-21, when tjs-lang hit 0.13.0-rc.1.** Two things
changed at once, and together they change what the port IS.

**1. The port is the test of tjs's new direction.** 0.13.0 reorients the
language to _TypeScript plus obvious improvements_ — seamless migration from
TS, up to and including reverting to TS. A claim like that is only worth
anything if something real migrates, and tosijs is the honest test: ~50
modules, a proxy-heavy core, a published API with consumers, and a branch
(`tosijs-2.0`) that already carries a written record of what the OLD ergonomics
cost (`TJS-PORT-DX.md`). That log is now the **before** measurement. Re-walk
`by-path.tjs` against 0.13.0 and the delta is evidence, not opinion — the
user's standing rule: test assumptions against experiment, "is this actually
easier?"

**2. The port has three consumers, not one.** `tosijs-3d` and `manta-recon`
both stand to gain more than tosijs does, for a specific reason worth stating
precisely:

> Their bugs are **structural, not hot**. Malformed data structures in a scene
> graph or a recon pipeline cost little or nothing at runtime — they don't show
> up as a slow frame — but they are a **debugging nightmare**, surfacing far
> from their origin as wrong geometry, wrong transforms, wrong results.

That locates where typing actually pays, and it is not where the instinct says.
The fear about types in a 3D/compute codebase is runtime cost in hot loops; the
real win is structural correctness in data that is _expensive to debug and
cheap to check_. tjs's safety boundaries (`safety inputs` at the edges,
`safety none` for hot internals) are shaped for exactly that split — check
where data enters, spend nothing in the loop.

**3. WASM integration is the maximum-payoff item.** Both 3D and recon are
compute-bound in ways tosijs is not, so a path from typed source to WASM is
worth more to them than to us. Sequencing follows from that: tosijs proves the
_migration_ story (does a real TS codebase move without pain, and can it move
back?), and 3D/recon prove the _payoff_ story.

**What this does NOT change:** the hold. Nothing starts until 0.13.0 is stable
— see `UPSTREAM.md` § tjs-lang. And the revert-to-TS escape hatch is what makes
a three-consumer bet safe to take at all: if the answer is no, the cost is
bounded.

## 2.0 / tjs — schema islands enforced from inside the proxy

**The idea (Tonio, 2026-08-17):** applying a schema to _part_ of state —
islands, not the whole registry — is the same shape as 1.8.0's contracts,
and **tjs is ideally placed to enforce it from inside the tosi proxy**.

1.8.0 built contracts at three granularities (app `expose.contract`,
component `static contract`, inline element `contract`) and every awkward
edge came from enforcement living _outside_ the thing being written:

| 1.8.0 pain                                                                                                                                | why it exists                                          | what proxy-level enforcement does                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| checks run only at `agent.write()` and the component `value` setter                                                                       | enforcement is bolted to two call sites                | every write is checked, whatever the caller — `share()`, `sync()`, `hotReload()`, plain assignment                       |
| sub-path writes must be routed to a synthesized whole-root **proposal** (clone + hypothetical apply)                                      | the schema is root-shaped but the write is leaf-shaped | the path _carries_ its own type; a leaf write is checked as a leaf                                                       |
| validation **fails open** unless a host registers an engine (`type`/`enum`/`const` only)                                                  | tosijs is zero-dependency, so the checker is a plug    | types are the language's job — no plug, no divergence between hosts                                                      |
| two plug-in seams for one concern (`AgentContract.check`, `setContractValidator`)                                                         | two boundaries grew their own                          | one definition, attached to the path                                                                                     |
| **B1**: a violation thrown from the value setter landed inside the global binding-dispatch loop and stranded every element bound after it | refusal is an exception, in a hot loop                 | **monadic errors** — a refused write is a _value_, not a control-flow event. This is the strongest argument of the five. |

**Islands, explicitly.** A schema must be attachable to a subtree without
claiming the rest: `app.cart` typed, `app.scratch` free. That is exactly
what contract roots and manifest scoping already express, one layer down —
and it is what makes the idea adoptable incrementally rather than as a
rewrite. Relates to the `schematic` state-factory sketch (non-singleton,
schema-first, boxed-from-birth) and to the 2.0 branch's
`settings.strictness` (assignment-time type-drift), which is the same
instinct at a coarser grain.

**What it would delete here:** `contract-check.ts`, the proposal-routing in
`agent.write()`, the fail-open warning added in this release, one of the two
plug seams, and the "contracts don't cover share/sync" boundary note — a
worked example of the practice that a framework feature should subtract more
than it adds. **Filed upstream:** tjs-lang#(see UPSTREAM.md) so the language
side has the use case with receipts.

### inferSchema: the other half — derived schemas, not just declared ones

**tosijs-schema#6** (`inferSchema(sample) → JSONSchema`, requested by
tosijs-ui's schema-powered form editor) is the adoption half of the islands
idea above. Contracts today are **declared**, which is the right end state
but also a cliff: nothing happens until someone writes a schema. Inference
makes the same machinery _derived-by-default, curated-when-it-matters_ —
the shape the agent surface already uses (`describe()` derives; `contract`
curates).

Three uses here, in rough order of value:

1. **Type-drift warnings from the proxy with zero declaration.** The 2.0
   branch's `settings.strictness` compares an assignment against the
   _previous value_; against an inferred schema of the island it could catch
   a `qty` that becomes a string, or an object that loses a required key, on
   the write that does it. Pairs directly with [tjs-lang#27]
   (https://github.com/tonioloewald/tjs-lang/issues/27) — infer to get the
   schema for free, enforce it where the write happens, promote it to a
   declaration when you want a guarantee rather than an observation.
2. **`describe().contract` for apps that declared nothing** — the map
   answers "what's legal here", not only "what exists".
3. **Better wiring diagrams** — field _types_ let tosijs-floorplan render a
   control the way its data behaves (enum → segmented, integer+range →
   slider) instead of inferring from the DOM.

**The requirement we contributed upstream — ADOPTED.** tosijs-schema
**1.6.0** ships `inferSchema`, and its output carries **`$inferred: true`**,
so an observation can never be mistaken for a promise as it travels. Array
unification works as asked (a key absent from the first element still
appears, and is correctly not `required`). devDependency bumped to `^1.6.0`;
the contract suite (which runs against the published `agentContract`) is
green.

**Not wired into tosijs yet, deliberately.** tosijs is zero-runtime-
dependency, so it cannot call `inferSchema` itself, and the review already
flagged _two_ plug seams for one concern — adding a third mid-release would
be going the wrong way. The integration is post-1.8.0, and the shape to
consider then:

    // the app owns the engine; tosijs owns the map
    import { inferSchema } from 'tosijs-schema'
    const observed = inferSchema(xin.app.value)   // { …, $inferred: true }
    enableAgentInterface({ expose: { roots: ['app'], contract: … } })

with `describe({ inferContracts })` (opt-in) merging observed schemas for
roots that declared none — emitted with their `$inferred` marker intact, so
`describe().contract` gains "what shape is this" for undeclared apps without
ever asserting a rule nobody promised.

## Dev-environment hardening (security pass, SEC-5 / SEC-16)

Both are local-environment items, not shipped code — nothing in `dist/`
changes.

- **`editableSources` is now `process.env.TOSI_EDIT === '1'`** (SEC-5). The
  upstream endpoint is CSRF-able from any page visited while `bun start`
  runs, and its repo-root confinement includes `.git/hooks/*`. Turn it on
  deliberately: `TOSI_EDIT=1 bun start`. Filed as
  [tosijs-ui#90](https://github.com/tonioloewald/tosijs-ui/issues/90);
  **when that lands, reconsider defaulting it back on.**
- **Preview/tunnel target moved to `.env`** (SEC-16) — a root SSH target plus
  tunnel port in a tracked file in a public repo is free recon. `.env` is
  gitignored and auto-loaded by bun, and was written with the previous values,
  so deploy/tunnel keep working here with no action. `.env.example` documents
  the names. **A fresh clone has no `.env`, so `preview` is absent and
  `bun run deploy` / `bun run tunnel` refuse to run** — deliberate (loud
  beats deploying somewhere unexpected), but it is the thing to remember on a
  new machine.
- [ ] Deploy as a non-root user — `root@` is the part of SEC-16 that config
      changes can't fix.

## 2.0 breaking change: blueprint `src` should default to same-origin

**Proposed for 2.0** (security review SEC-6). `<tosi-blueprint src>` executes
the module it names, and the element can arrive through `innerHTML` — so on a
page that renders untrusted HTML without stripping the tag, HTML injection is
arbitrary script execution on the origin. Verified end-to-end in real Chromium.

1.8.0 ships the conservative half only, because loading a blueprint from a CDN
is a documented, supported use case and breaking it in an rc is worse than the
risk (the defect is pre-existing and unchanged since xinjs):

- `javascript:`, `data:` and `vbscript:` srcs are refused unconditionally
  (control characters stripped first, so `java\tscript:` can't smuggle one).
- `settings.blueprintSrcCheck?: (src, el) => boolean` is the opt-in narrowing
  hook; refusal `console.error`s the URL and says how to allow it.
- The doc block now states that these tags execute code and must be stripped
  from user-supplied HTML.

For 2.0: **invert the default** — allow same-origin, refuse cross-origin
unless `settings.blueprintSrcCheck` says otherwise (or an explicit
`settings.blueprintOrigins` allowlist). Same-origin-by-default plus an
allowlist is the posture every other executable-URL feature on the platform
has converged on, and apps that set the hook today are already forward
compatible. Requires a CHANGELOG breaking-change note and a migration line
for CDN consumers, who are the ones it breaks.

## 2.0 refactoring candidates

- **Remove deprecated exports** (~2-3KB gzipped): `xinPath`, `xinValue`, `boxedProxy`,
  `xinSlot`, `bindText`, `bindEnabled`, `bindDisabled`, `bindList` and their warning wrappers
- **Simplify dual API surface** (~1.5-2KB gzipped): collapse `xin*`/`tosi*`/symbol variants
  in `XinProps`, `BoxedScalarAPI`, and the proxy `get` handler to just `.tosi` accessor +
  direct properties
- **Remove blueprint-loader deprecation scaffolding** (~0.5KB): `DeprecatedBlueprint`,
  `DeprecatedLoader` classes
- **Remove debug/test exports from prod bundle**: `_getArrayIdPathRegistry()`,
  `_resetDeprecationWarnings()`
- **Split list-binding.ts**: extract virtual scrolling logic into `list-binding-virtual.ts`
  for maintainability and documentation separation

## known issues

- bindList cloning doesn't duplicate svgs for some reason

## ~~take() transform lost on list-template relative paths~~ FIXED in v1.7.9

Root cause was richer than suspected: the closure froze the template's `^.`
paths (transform ran on undefined) AND shared one change-detection memo
across all cloned rows (first row starved its siblings). Fixed on main
(v1.7.9, `src/take-list-binding.test.ts`); the descriptor is now data on the
binding entry. The derived-surface demo uses the idiomatic take() again.

## ~~Enter-commit race~~ RESOLVED: a coding-pattern issue, not a core bug

Submit-like actions belong on `change` (Enter commits the field; tosijs's
capture-phase handler writes state BEFORE the element handler runs), not on
`keydown` — keydown races the commit and the echo clobbers programmatic
clears. Doctrine: act on committed state, mutate state atomically, let the
UI catch up. Pattern recorded in tosijs-coding-practices.

## ✅ 1.8.0 bucket 1 — promises kept (done 2026-08-12)

- **Relicensed BSD-3-Clause → Apache-2.0** (LICENSE, package.json, NOTICE,
  README). Sole author (921/921 commits) — no contributor consent needed.
  Adds an explicit patent grant + retaliation clause; GPLv2-only
  incompatible (GPLv3+ fine); consistent with tosijs-floorplan.
- **`data-ref` removed** — the deprecation warning named 1.8.0; `part="…"`
  (and bare CSS-selector refs) remain. Tests inverted to pin the removal.
- **`xin-slot`, `xin-blueprint`, `xin-loader` removed** with their
  `xinSlot`/`blueprint`/`blueprintLoader` creators — three fewer custom
  elements registered at import (the bundle diet's side-effect accounting).
  Docs (Building-Apps, CLAUDE.md) updated to `tosi-slot`.

## At 1.8.0 publish: deprecate create-xinjs-blueprint (repo + npm)

The scaffolder now lives in tosijs itself (`bunx tosijs create
app|component|blueprint`, dist/cli.mjs). Once 1.8.0 is on npm: deprecate
the create-xinjs-blueprint package with a pointer, archive-note the repo.
