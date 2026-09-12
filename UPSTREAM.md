# UPSTREAM.md

A local mirror of dependency rough edges we've **filed as issues** upstream
(haltija, tosijs-ui, tjs-lang). An entry here without a filed issue is a complaint
nobody will read; the issue on the target repo is the real channel. Mark entries
RESOLVED when the fix lands and we've adopted it.

> This file is mandated by `CLAUDE.md` and the shared coding practices (review.md
> lens 7, releasing.md). Ecosystem findings get **filed as issues on the upstream
> repo, never fixed by editing it** — file, don't fix.

## haltija

### 🚧 Per-tab routing by declared origins (issue REOPENED and retitled upstream)

**Issue:** https://github.com/tonioloewald/haltija/issues/1
Spawned automation runs (the doc-test lane) adopted a foreign shared haltija on
port 8700 and navigated another project's live browser to our pages, then timed
out. `haltija --private` (shipped 1.4.1, in direct response to #1) binds an
ephemeral port, isn't registered, and never reaches out. (My original framing —
"private instances don't exist" — was wrong; corrected in the issue thread.)

### ✅ RESOLVED (closed upstream) `hj tabs focus <id>` times out for a live, listed tab

**Issue:** https://github.com/tonioloewald/haltija/issues/4
Tested 1.4.0. A hidden tab may be unreachable by construction if `tabs focus` is
tab-dispatched. Workaround: `hj eval '…' --window <id>` (after the subcommand)
targets a specific tab regardless of focus.

### ✅ RESOLVED (closed upstream) Engine modes aren't discoverable (`--headless` = Playwright; `--private`/`--ci` = Electron, no Playwright)

**Issue:** https://github.com/tonioloewald/haltija/issues/6
`--headless` drives Chromium **via Playwright** (needs it as a dep); `--private`/`--ci`
use **Electron directly, no Playwright**. Both `--help` lines say "for CI", so an agent
(this one) picked `--headless`, hit "Playwright not installed", and wrongly concluded
haltija's CI path requires Playwright — pivoting a whole CI-lane design before being
corrected. Ask: state the engine in `--help`/banner; the only real reason for
`--headless`/Playwright is multi-engine (Firefox/WebKit) coverage. **This is why the
tosijs CI browser lane uses `xvfb + bunx haltija -f` (Electron), not Playwright.**

### ✅ RESOLVED (closed upstream) A tab with no injected client is silently uncontrollable

**Issue:** https://github.com/tonioloewald/haltija/issues/5
`hj tabs` lists such a tab as healthy and commands silently retarget the focused
tab, so it reads as a routing bug. Ask: surface `"client": "none"` / explain
`"fallback": true`, or error instead of silently retargeting. (Consumer half —
surfacing the `haltijaDev` opt-in — is tosijs-ui#18.)

### 🕐 BLOCKED ON US — haltija#16, "Bridge design (HOLD until tosijs ships the agent surface)"

**Issue:** https://github.com/tonioloewald/haltija/issues/16 (OPEN)
haltija is holding a native-bridge design pending the agent surface, so
tosijs 1.8.0 is the event that unblocks it — and `agent.version`
(tosijs#23, fixed here) is precisely what lets haltija detect the surface's
SHAPE instead of duck-typing `describe`. Answer the convergence questions
there when the rc publishes.

### OPEN: tjs-lang#49 — `convert` rejects class/interface declaration merging

**Issue:** https://github.com/tonioloewald/tjs-lang/issues/49

`✗ Identifier 'Blueprint' has already been declared` on valid TypeScript. It
blocks tosijs from dogfooding the migration it documents for tosijs#36 — the
one-line `export interface X extends ComponentAttrs<typeof X.initAttributes> {}`
that declares what `static initAttributes` installs. Consumers can write it;
`src/` cannot, because every file there goes through `tjs convert` for the
debug/safe bundles. So the library writes those members out by hand.

Types-only, so the cheapest correct fix is probably for `convert` to ignore a
same-named interface: it emits nothing either way.

**Watch for:** when this lands, `blueprint-loader.ts` and any other in-repo
component collapse to the one-liner, and the docs stop having to say "do as we
say, not as we do".

## prettier

### NOT FILED (third-party, outside this ecosystem): the markdown printer is not idempotent

**Affects:** prettier **2.8.8** (our pin) and **3.9.6** (current) — both.
I have not searched prettier's issue tracker, so this may be known.

A formatter that is not idempotent is broken by definition: `format(format(x))`
must equal `format(x)`. Ours was not, on markdown, and it had been quietly
damaging `TODO.md` for months — a list continuation gaining indentation on
every `bun run format` until it sat at column 44, with the surrounding content
mangled (a nested list flattened into prose, a sentence dedented mid-way).

**Minimal repro** — four lines, reduced by delta-debugging from the real file.
Indentation grows by four on every `--write`, without converging:

```markdown
- [x] **an unclosed bold list item

                                                A deeply indented paragraph
                                                that follows a blank line.
```

```
pass 1: indent=52   pass 2: indent=56   pass 3: indent=60
```

**Not configurable away.** `proseWrap: preserve | never | always` all
oscillate. **Not fixed upstream:** 3.9.6 does it too, and faster than 2.8.8.

**Scope, measured:** every one of the **110 non-markdown files** in this repo
(`.ts`, `.js`, `.json`, `.css`, `.html`, `.yml`) is idempotent. It is a
markdown-printer problem only.

**What we did:** `*.md` is in `.prettierignore`. Markdown here is hand-written
prose rendered by a doc site — there is no consistency problem for a formatter
to solve, so formatting it was pure risk. The `prettier --check` CI gate keeps
its value on the 110 files where the value is, and can no longer be held
permanently red by a printer bug. Re-check idempotency before ever
re-enabling it.

## tosijs-ui

### ✅ RESOLVED (closed upstream 2026-09-04): tosijs-ui#129 — devServer sends no cache headers

**Issue:** https://github.com/tonioloewald/tosijs-ui/issues/129

No `Cache-Control`, no `ETag`, no `Last-Modified` on anything the dev server
serves, so the browser caches heuristically and a reload is not guaranteed to
fetch current content. A new tab picks changes up; reloading the open tab may
not. A devtools session with "Disable cache" never sees it.

**Why we care:** the workflow here is deliberately explicit reload, not hot
reload — automatic refreshes fire mid-thought and cost you context. Explicit is
right _provided a reload is authoritative_. When it silently isn't, the loop
produces confident wrong answers: while chasing the broken `/one-user-interface/`
demo, two correct hypotheses were "falsified" because every edit→rebuild→reload
cycle re-tested stale code.

**CONFIRMED 2026-09-04, with a two-browser control** — and it is worse than the
above. The `/one-user-interface/` demo appeared to be a _library security
failure_: the agent surface refused every verb, and `describe().exposure`
reported `closed` even though the demo declares
`expose: { roots: ['oneUI'], actions: ['oneUI.addItem'] }`. It was stale cache,
for a whole working session, across many explicit reloads.

What made it deceptive is that the cache serves stale **code**, not stale prose.
Chrome was running a pre-`e6f8eae` revision of the live-example fence — one with
a bare `enableAgentInterface()` — against the _current_ library. So the refusal
was correct, precisely worded, and pointed at the wrong file: the message
("this surface declares no manifest") described the cached fence, while the
fence on disk and in the served `docs.json` had a manifest. Every reading of the
source contradicted the running page.

Reproduce it:

```bash
curl -skI https://localhost:8018/docs.json
# HTTP/1.1 200 OK
# content-length: 423821
#   ← no Cache-Control, no ETag, no Last-Modified
```

With no validator, Chrome takes heuristic freshness and does not revalidate on
reload. Safari, with no cache entry, fetched current content and the same demo
worked — the tie-breaker. `ETag` + `Cache-Control: no-cache` (revalidate, don't
re-download) fixes it without giving up caching.

**Until it lands:** iterate in a NEW TAB per change, or with devtools cache
disabled. Do not trust a plain reload to prove anything. And if a page's
behaviour contradicts its source, **suspect the transport before the code** —
check two browsers before spending a session on the library.

### OPEN: tjs-lang#51 — `convert` silently DROPS an exported function based on comment text

**Issue:** https://github.com/tonioloewald/tjs-lang/issues/51

Editing only a `//` comment _inside_ `withAttributes` (`src/component.ts`) made
`tjs convert` emit `tjs-out/component.js` with **no `withAttributes` export**,
and the debug/safe bundle build failed to link. Reword the comment and it
emits. Bisected to one paragraph; would not reduce to a small file, so it needs
the surrounding generic arrow function and large return type.

**The failure mode is the point.** Silent — no error for the dropped
declaration; invisible to our 964 unit tests, which exercise `src/`, not the
converted output; caught only because a bundler happened to import the name. A
dropped export that nobody imports ships as a hole. Exactly tjs-lang#37's shape
(the `new`-stripping bug), which the suite also could not see.

**Ask:** even without a root cause, refuse when a top-level `export` in the
input has no declaration in the output.

**Living with it:** the `withAttributes` comment describes the
`ComponentAttrs` one-liner in prose instead of showing the declaration. If that
comment is ever rewritten, re-run `bun tjs convert src/component.ts -o /tmp/x.js`
and confirm `export function withAttributes` is present.

**Retested on 0.13.11 (2026-09-04): STILL BROKEN.** Same repro, clean install,
still exits 0 with no diagnostic. Checked because five versions shipped
(0.13.7–0.13.11) — the issue tracker said nothing either way, and the rule here
is to execute the artifact, not read the changelog.

**But the signature-test runner improved in that range, and it is worth a pin
bump on its own merits:**

| file           | 0.13.6 (pinned)      | 0.13.11                                                                   |
| -------------- | -------------------- | ------------------------------------------------------------------------- |
| `color.ts`     | `0 passed, 8 failed` | clean — the `clamp is not defined` cross-module bug is gone               |
| `component.ts` | `0 passed, 5 failed` | `0 passed, 2 inconclusive (not run — the harness could not execute them)` |

That is 13 spurious build-log failures per build reduced to zero failures and
two honest abstentions. The relabelling matters more than the count:
"inconclusive (not run)" distinguishes _the code is wrong_ from _I could not
check_, which is the property that stops a harness limitation from masking a
real defect — the same distinction `TODO.md` complains this noise was
destroying. **Not bumped yet** — a toolchain bump must be validated by
executing the artifact (all seven bundles), which is its own change, not a
tail-end edit to a release.

### ✅ RESOLVED (closed upstream 2026-09-04): tosijs-ui#130 — `buildSite` prebuild did `rm -rf DIST` on every run

**Issue:** https://github.com/tonioloewald/tosijs-ui/issues/130

`orchestrator.js:418` wipes the **library** output dir in the prebuild, on a
dev-server start as well as a build. Where one entry builds both the doc site
and the npm package — the arrangement `buildSite` + `libraryBuild` exists for —
`dist/` is an input to `npm publish`, not a site artifact.

**What it cost us:** `dist/module.debug.js` and `dist/module.safe.js` are built
only under `--build` (the tjs transpile is slow), so every `bun start` — and
every Playwright run, whose `webServer` is `bun start` — left them deleted while
`package.json` still exported `./debug` and `./safe`. The release checklist
walks into it: build (step 3), browser tests (step 4), publish (step 8). It
reached a commit once already as unnoticed collateral. No local gate could see
it: the smoke and size loops iterate only what the current run built.

**Fixed upstream, adopting our first option and our framing verbatim** —
*"the doc-output `rm -rf <outputDir>` is fine and expected … `DIST` is
different: it is an input to `npm publish`"* became the stated rule, **clean
only what you wholly generate**: `emitLibrary`/`libraryTsconfig` (tsc emits the
complete set) still cleans; `libraryBuild` (a consumer function that may emit a
subset — our case) does not. **Adopt on the next tosijs-ui bump**, after which
our local restore below is belt-and-braces rather than load-bearing. Keep it:
it costs one `git checkout` on a dev run and this defect recurred three times.

**Our defence, since no build-order fix on our side can close it:** the two
bundles are tracked in git (so the deletion shows in `git status` — untracked,
it was invisible), plus a gate in BOTH `buildLibrary()` and `prepublishOnly`
(`bin/check-publish-tag.ts`) asserting every `exports` target exists **and is
tracked**. `existsSync` alone was not enough and failed on the very next
commit: the browser lane deleted the bundles, the commit recorded the
deletion, a later build left untracked copies, and every check went green over
a release commit that lacked them. The publish hook is the ordering-proof one. Offered the check upstream.

**Correction worth keeping:** a pre-release review diagnosed this as the strip
loop in our own `bin/site.ts` keying off the filtered bundle list. That was real
and is fixed — but it was not the dominant cause, and fixing it alone did not
stop the deletion. The empirical check (run the lane, look for the files) is
what found the `rm -rf`. **A plausible mechanism that explains the symptom is
not the same as the mechanism.**

### RESOLVED (by us, upstream-of-them): tosijs-ui#127 — deprecated binding shortcuts

**Issue:** https://github.com/tonioloewald/tosijs-ui/issues/127

Reversed direction: tosijs-ui reported that _our_ deprecation was unfixable at
their call sites, and they were right. No `bind*` shortcut is deprecated as of
**tosijs 1.9.1** — all eight of their sites go quiet on upgrade with no edits.
Also closed on our side: tosijs#31 and tosijs#33.

**The part worth remembering:** they found the 1.9.0 residue by **grepping the
built bundles**, not the source. Our own release checks had passed. That is the
"execute/inspect the artifact, not the repo" rule arriving from a consumer
instead of from us — the second time this quarter (the first was the tjs-lang
0.13.x `new`-stripping bug, caught only by the published-bundle smoke gate).

### 🚧 FILED — `/__docstore/source` is CSRF-able: local code execution

**Issue:** https://github.com/tonioloewald/tosijs-ui/issues/90
While `bun start` runs with `editableSources: true`, any page the maintainer
visits can `fetch()` a `text/plain` body (CORS-safelisted, so no preflight) at
`https://localhost:8018/__docstore/source`; `handleWriteSource` JSON-parses it
regardless of content type, and `mayWriteSource` authorizes direct traffic on
the loopback peer alone — the session cookie is never consulted. `resolveInRepo`
confines to the repo root, which **contains `.git/hooks/*`**, so the write is
local code execution at the next commit. Chromium's Private Network Access
blocks it today; Firefox does not. Asked for: require the browser-set
`Sec-Fetch-Site: same-origin`, and reject bodies whose Content-Type is not
`application/json` (the latter alone forces a preflight and kills the attack).
**Mitigated here** in `tosijs-site.config.ts` — `editableSources` is now
`process.env.TOSI_EDIT === '1'`, so the endpoint is off unless a session asks
for it (tosijs 1.8.0-rc security review, SEC-5).

### 🚧 Doc-test lane should use `haltija --private`; surface the `haltijaDev` opt-in

**Issue:** https://github.com/tonioloewald/tosijs-ui/issues/18
The dev-server test mode does an unscoped `hj windows` adopt-or-spawn instead of
requesting a `--private` instance (now that 1.4.1 has it), and injection is
opt-in with an invisible failure mode. Ask: use `--private`; document
`haltijaDev` in docs/llms.txt + a dev-server banner when off.

### ✅ RESOLVED (tosijs-ui 1.7.0-rc.1) — orchestrator swallowed tsc failures

**Issue:** https://github.com/tonioloewald/tosijs-ui/issues/22
The `libraryTsconfig`/`emitLibrary` build paths caught `tsc` failures and logged
a success-sounding line, so a broken typecheck exited 0 and published stale
`.d.ts` — a type error shipped in tosijs 1.7.0-beta.1 this way. rc.1 runs
`tsc -p` with `.nothrow()` + exit-code check and fails the build. Adopted as the
1.7.0 build host; verified a deliberate type error now aborts the build (exit 1).

### 📋 FILED (gated) — accessibility ⇄ agent-surface program for every component

**Issue:** https://github.com/tonioloewald/tosijs-ui/issues/59
**Extended 2026-08-09:** component-level contracts promoted to a deliverable
(the fix-vehicle for audit findings), plus `<tosi-agent-viewer>` — the map/
legend/contract/audit cockpit, built purely on tosijs's public re-exports
(derived-surface's demo fences are the prototype; it carries its own
contract). The 1.8.0-rc is the sweep's instrument, not just its gate.
The one-user-interface curb cut as an instrument: `static contract` on every
tosijs-ui component (auto aria-label + agent self-description + typed parts +
exercisable spec), a real roles/states pass (tablist/tab/tabpanel +
aria-selected, radiogroup, grid), shadow components surfacing semantic intent
at the host while hiding implementation, and the near-free audit ("every
record with handlers must have label|text|role" over describe() output).
**Gated per Tonio: not to be picked up until tosijs 1.8.0 (the one-user-interface release) is beta/rc.**

## tosijs-floorplan (formerly tosijs-schematic)

**Separately maintained as of 2026-08-09** (its own agent; context in its
CLAUDE.md). Renamed at 0.3.0 — the old name near-collided with
tosijs-schema; exported API keeps the schematic-\* names. tosijs is a
CONSUMER: devDependency pin + build-time vendoring (`vendorSchematic()` in
bin/site.ts regenerates src/schematic.ts from the package source). From
here: **file, don't fix** — renderer changes, grammar proposals, and
record-format questions go to github.com/tonioloewald/tosijs-schematic
issues (repo redirects post-rename), mirrored here. Adopting a new
version = bump the devDep, `bun update`, rebuild, sync any output-truth
tests deliberately.

### ✅ RESOLVED (NARROWED) — tosijs-floorplan 0.4.0, adopted in tosijs 1.11.0 (2026-09-06)
### Provenance-arrow parsing is forgeable from data (tosijs 1.8.0 SEC-8)

**Issue:** https://github.com/tonioloewald/tosijs-floorplan/issues/5
The renderer splits `"<value> ⟷ <path>"` with `indexOf` and decides
editability with `.includes(BOUND_TWO_WAY)`, so a bound string whose VALUE
contains the token forges an arrow: the shown value truncates at the fake
one, and a plain non-interactive element gets drawn with the `↔` badge and
the actable outline — a drawing that lies about what the page can do.
tosijs fixed the producer side in 1.8.0 (both tokens are neutralized to
`<->` / `<-` inside harvested values and text), but a renderer consumes
maps it did not generate — over a wire, from an older tosijs, or from
another producer — so the parse should be robust on its own:
`lastIndexOf`, and decide editability from the arrow at that position
rather than from a bare `includes`.

**0.4.0 does the `lastIndexOf` split and neutralizes every caption source at
one choke point — but it NARROWS this hole rather than closing it, and the
close-out should say so.** The binding scan now skips eleven never-bindable
identity fields, which is a denylist over an OPEN key set
(`SchematicRecord` ends in `[boundProp: string]: unknown`): a forged arrow in
`text`, `title` or any unrecognised key is still read as evidence and still
earns the `↔` badge. Verified against the adopted vendor. Reachable only with
a FOREIGN map — tosijs's own `describe()` strips arrows at every harvest — so
the producer-side fix from 1.8.0 remains the real defence. Re-filed as
[#11](https://github.com/tonioloewald/tosijs-floorplan/issues/11) rather than
left implied by a closed issue.

### ✅ RESOLVED — tosijs-floorplan 0.4.0, adopted in tosijs 1.11.0 (2026-09-06)
### Target-size + "is interactive" implemented twice, and they disagree

**Issue:** https://github.com/tonioloewald/tosijs-floorplan/issues/4
tosijs's `auditAccessibility` and the vendored renderer each decide WCAG
2.5.8 independently, and they already give contradictory verdicts on the
same element: `audit.isInteractive` counts `href`, the renderer's does not;
audit's inline-link exemption reads `label ?? text`, the renderer's reads
only text. So an icon-only `<a href onClick aria-label="Buy">` at 20×20
audits CLEAN while the drawing flags it, and a nameless 16×16 `<a href>`
does the reverse — inside the very workflow `audit.ts` recommends. Because
`src/schematic.ts` is machine-vendored (DO NOT EDIT), the reconciliation
must happen in tosijs-floorplan: export the predicate and the target-size
rule so one implementation serves both, or accept producer `flags` as
authoritative and drop the built-in audit.

**0.4.0 took the first route** — `isInteractive`, `targetSizeFinding` and
`TARGET_SIZE_DEFAULT` are exported, and tosijs 1.11.0 deletes its local
copies. Seven audit verdicts moved; see the 1.11.0 CHANGELOG.

**Adopting it surfaced three NEW asks, all filed rather than patched here**
(the vendor is DO-NOT-EDIT), and two of them exist because the renderer and
the audit are asking different questions of one rule.

⚠️ **#7 and #8 are MITIGATED LOCALLY in 1.11.0** — `auditView()` in
`src/audit.ts` hands the shared predicate an adjusted record rather than
keeping a copy of the rule, so the audit gets the lint's answer while the one
definition of *evidence* stays upstream. The issues stay open because upstream
is the better home; when they land, the local adjustment becomes a no-op and
goes. #12 falls out of #8's fix (we never pass `flags` down) and is likewise
still worth fixing upstream for other callers.

1. **[#7](https://github.com/tonioloewald/tosijs-floorplan/issues/7) — `isGround` treats list-ness as decisive.** A list-bound element that IS
   the control — `select({ bindList: …, bindValue: … })`, which tosijs 1.10.1
   deliberately enabled — is classified as structure, so `isInteractive` is
   false and the audit silences `anonymous-affordance` and `missing-role`
   (both **error**) as well as `target-size`. Suggested:
   `w.structural === true || (w.list != null && !hasActEvidence(w) && !hasEditEvidence(w))`.
2. **[#8](https://github.com/tonioloewald/tosijs-floorplan/issues/8) — `targetSizeFinding` honours producer `flags`.** Any flag whose `kind`
   merely *contains* `"target"` suppresses the finding. Correct for a renderer
   (it already drew the flag, and must not double-mark); wrong for a lint,
   which never reads `flags` into its findings. Worse, `auditFlags()` emits
   `kind: 'target-size'`, so the documented draw-then-re-audit flow returns a
   clean verdict on the elements it just flagged. Ask: an explicit
   `{ honorProducerFlags = false }` opt, and an exact kind match.
3. **[#9](https://github.com/tonioloewald/tosijs-floorplan/issues/9) — `targetSizeFinding` reports `0×0` as undersized.** Hidden is not small.
   `schematic()` pre-filters 0×0 so parity holds today, but the function is
   now documented as the general exported rule, and the next caller writes its
   own guard — reproducing the drift #4 closed, one level up. tosijs carries
   that guard locally at `src/audit.ts`.

Plus two more found while adopting:
**[#10](https://github.com/tonioloewald/tosijs-floorplan/issues/10)** — the
"blind map" note fires on read-only tosijs pages and recommends
`interactive`/`editable`, fields tosijs never emits because it introspects
handlers directly; and
**[#12](https://github.com/tonioloewald/tosijs-floorplan/issues/12)** — a
`flags` entry with no `kind` throws in both `targetSizeFinding` and
`schematic()`. ⚠️ **Correction worth keeping:** it is tempting to say 1.11.0
"widened this from internal to consumer-reachable" by exporting
`targetSizeFinding`. It did not. `schematicSVG` has been a public export of
`tosijs/agent` since **v1.10.1**, takes a caller-supplied description, and
already throws the identical error — verified against
`git show v1.10.1:dist/module.js`. 1.11.0 adds a SECOND door to a crash that
was already public, and `targetSizeFinding` in fact returns early on
`!isInteractive`/null bounds where the renderer computed unconditionally, so
its throw surface is slightly NARROWER.

**[#15](https://github.com/tonioloewald/tosijs-floorplan/issues/15)** — the
renderer has never been drawn against a REDACTED record. After 1.11.0's
secrecy fix a secret-marked link publishes neither `label` nor `href`, so the
caption fallback documented in `AgentWiringRecord.href` has nothing left.

(**[#11](https://github.com/tonioloewald/tosijs-floorplan/issues/11)** is the
narrowed-not-closed follow-up to #5, recorded in the section above.)

### ✅ RESOLVED (tosijs-floorplan 0.3.0, adopted 2026-08-09)

0.3.0 published under the new name with the second haltija batch folded in
(href/value fields, the inline target-size exception, wrapped-caption fix).
tosijs adopted: devDep swapped, vendor path updated (banner now derives
from the package name), `href` harvested by describe() with bare-link
enumeration (links are intrinsic affordances — the contenteditable
precedent), suite synced.

### 🚧 FILED — live examples run as free smoke tests, but failures never reach the harness

**Issue:** https://github.com/tonioloewald/tosijs-ui/issues/161
⚠️ **First description was wrong and is corrected on the issue.** Two
mechanisms already exist: `checkExamples` compiles every executable block and
throws on failure, and the Playwright lane runs the ```test tier across two
browsers. The gap is one step wide — `checkExamples` uses
`new AsyncFunction(js)`, which COMPILES and does not CALL, so a block that
compiles and throws on invocation passes. A page
can ship a red error box with the doc-test lane green. It cost tosijs 1.11.0 a
shipped "div is not defined" on `/path-listener/` that cleared the build, the
suite, the smoke gate, CI and **nine review rounds**; the same scrape then
found two more pre-existing on `/Migration/`. Asked for an `exampleErrors`
field so every `tosijs-ui/site` consumer gets it free. **Interim workaround
lives here** in `tests/doc-tests.pw.ts` — delete it when the upstream lands.

## tosijs-schema

### ✅ SHIPPED (tosijs-schema 1.6.0) — `inferSchema(sample)`: derived schemas

**Issue:** https://github.com/tonioloewald/tosijs-schema/issues/6
**Our contributed requirement was adopted:** inferred schemas carry
`$inferred: true`, so an observation cannot be mistaken for a promise once
it travels. Array unification behaves as asked. devDep bumped to `^1.6.0`;
tosijs's contract suite is green against it. Integration into `describe()`
is post-1.8.0 (tosijs is zero-runtime-dependency, so the app owns the
engine) — see TODO.md § 2.0 / tjs.
Requested by tosijs-ui's schema-powered form editor; tosijs is the third
consumer. It is the adoption half of tjs-lang#27: contracts today are
DECLARED (a cliff — nothing until someone writes a schema), and inference
makes the same machinery derived-by-default, curated-when-it-matters. Uses
here: type-drift warnings from the proxy with no declaration,
`describe().contract` for apps that declared nothing, and field types for
better wiring diagrams. **Our added requirement:** an inferred schema must be
distinguishable from an authored one _in the artifact_ (`$inferred` /
`$source`), and the marker must survive serialization — a consumer needs to
know whether it is reading a rule or a sample.

### ✅ RESOLVED (tosijs-schema 1.5.0 / 1.5.1) — `agentContract()` + executable-contract conventions

**Issue:** https://github.com/tonioloewald/tosijs-schema/issues/2 (CLOSED)
The blessed adapter behind 1.8.0's contract seam ships upstream: it fails
CLOSED on a contracted write with no proposal, and refuses at construction
any schema keyword `validate` does not actually enforce. tosijs's suite runs
against the published adapter and pins the proposal guarantee from this side
(tosijs#25, closed). 1.5.1 carries haltija's `s.any` serialization fix —
which would otherwise have ridden into `describe().contract`.

## WebMCP (the standard, not a repo)

### ❌ WITHDRAWN — "no unregistration seam" was OUR probe's blind spot, not a gap

**Do not file this.** It was the last `(to file)` entry here, and the
2026-08-21 re-survey killed it: WebMCP's unregistration path is
`registerTool(tool, { signal })` + `controller.abort()`, and since **Chrome
153** it withdraws a tool _without_ cancelling in-flight executions. Our
adapter probed for a returned handle and for `unregisterTool`, found neither,
and concluded the capability was missing — then shipped register-once
semantics plus revoke-by-refusing-stub to compensate for a gap that did not
exist. `src/webmcp.ts` now feature-probes the signal path
(`supportsAbortSignal`) and uses it, keeping the stub fallback for hosts that
ignore the options argument.

**The lesson is the reusable part:** we inferred the ABSENCE of an API from a
probe that never asked for it, wrote the inference into a doc as fact, and
queued a public filing on a standards repo against it. When a capability
appears missing, check the spec text before the object shape — and never file
"X doesn't exist" without having tried X's documented spelling.

## tjs-lang

### 🛑 HOLD on build-host bumps (2026-08-31, maintainer)

**Do not adopt `tosijs-ui` 1.12.5+ or the next `tjs-lang` yet.** 1.12.6 carries
tweaks we want, and tjs-lang is mid-way through a **major pipeline rework** —
adopting into the middle of that buys churn, and this session already showed
what a build-host bump costs when the toolchain moves under you (tjs-lang#37
took a bisect, a repro and a day).

**The bug driving the rework, because the class matters more than the instance:**
the `ts → js` path was **a lie**. It used tsc's own emission to produce JS
directly, so `ts → tjs → js` was never actually exercised. `ts → tjs` was
tested. `tjs → js` was tested. But `tjs → js` was only ever tested against TJS a
**human had written** — so the corner cases where `ts → tjs` emits TJS nobody
would author went straight through untested.

⚠️ **tjs-lang#37 — the `new`-stripping regression we hit and filed — is an
instance of exactly this.** Dropping `new` is _correct_ for hand-written `.tjs`
(the emitter Proxy-wraps the class, making it callable) and _wrong_ for `fromTS`
output (annotated `/* tjs <- … */`, plain JS semantics, no wrap — so the `new`
was load-bearing). The transform was right for the authored population and
wrong for the generated one. It reached us because we are a consumer of the
generated path, and it cost the 0.12.0 detour.

**The generalisation is worth holding onto:** testing `A → B` and `B → C` does
not test `A → C`. The `B` values a generator emits are a different population
from the `B` values a human writes, and the hand-written test inputs for the
second stage are by construction the ones somebody thought of. See
`../tosijs-coding-practices/practices/testing.md`.

**What we can offer when the rework lands:** the 2.0 branch already ran the
tosijs suite against the _converted_ output (`tjs-out/`) rather than `src/` —
**872 of 898 passed, and all 26 failures were staging artifacts**, not
behavioural differences (tests that hardcode `import.meta.dir` or a `.ts`
extension). That is precisely the shape of gate that catches this bug class: it
exercises generated intermediates against a real suite. It is ~26
location-independence fixes away from being a standing lane. Recorded on the
branch in `TJS-PORT-DX.md`.

### 📋 FILED — schema islands enforced from inside the proxy (the 2.0 dissolve)

**Issue:** https://github.com/tonioloewald/tjs-lang/issues/27
The use case behind tosijs 1.8.0's contracts, recorded with its scars: a
schema attachable to PART of the state tree (islands — `app.cart` typed,
`app.scratch` free), enforced in the proxy's set trap rather than at two
call sites. Would let 2.0 delete `contract-check.ts`, the whole-root
proposal routing, the fail-open warning, one of the two plug seams, and the
share/sync trust-boundary caveat. The strongest argument is **monadic
errors**: 1.8.0's release blocker was a contract violation THROWN from a
value setter inside the global binding-dispatch loop, stranding every
element bound after it — with refusal as a value, that class of defect stops
existing.

### ⏳ WAITING ON 0.13.4 — `asCompared`, the real computed comparator

**Issue:** https://github.com/tonioloewald/tjs-lang/issues/33 (kept open as the
use-case record)

**Resolved by discussion with the tjs-lang maintainer, 2026-08-24.** `goIs`'s
`[tjsEquals]` dispatch is a DIFFERENT mechanism from what boxed scalars need —
so both of my readings were wrong, and the fix is neither "add an opt-in
channel" (one exists, for something else) nor "call `customEquals` from `Eq`".
The intended answer is a real computed comparator, **`asCompared`**, landing in
**0.13.4**.

**Do not act on this until 0.13.4 ships.** What still holds, and what
`asCompared` has to satisfy for tosijs 2.0:

- a Proxy has no internal slot and slots are not forwarded to the target, so a
  slot read can never be the fallback for this shape (verified for String,
  Number and Boolean against the exact targets `tosijs-2.0` uses);
- the value must be LIVE — read per access from the registry — so it cannot be
  baked into a target at construction;
- `toBool` decides it. tjs injects it at every truthiness site, so a boxed
  `false` reading truthy in every `if` is what makes or breaks boxed-only state.

When 0.13.4 lands: test 2.0's boxed scalars against `asCompared` (real consumer,
real corpus) and only then decide the boxed-only question. **Two lessons already
paid for here — don't re-learn them:** I twice asserted things about tjs's
internals from a partial read (first "no opt-in exists", then "`goIs` is the
right hook"), and both times a maintainer had to correct it. Read the mechanism
end to end, or ask, before filing.

### ✅ HOLD LIFTED — 0.13.0 shipped (now **0.13.2**, 2026-08-21)

The hold below is satisfied: 0.13.0 is published (0.13.0 went out by mistake as a
non-rc and was superseded by 0.13.1/0.13.2, which also carry review fixes). The
bump-tjs-lang + bump-tosijs-ui + delete-the-`watchPaths`-duplication move is
unblocked — do it as ONE change, and re-read issue #33 first, since it may change
what the port is worth.

### ⚠️ E1 DONE, BUT SPLIT — `convert` is broken on 0.13.x (2026-08-26)

**Issue:** https://github.com/tonioloewald/tjs-lang/issues/37

The one move above turned out to be two, because the halves disagree:

- ✅ **`tosijs-ui` 1.9.4 → 1.12.0, and the `watchPaths` duplication is deleted.**
  #49 is genuinely fixed: `resolveWatchPaths()` now folds `docPaths` into the
  watch set and dedupes by resolved path, so the 10-entry copy was pure
  redundancy. Build, 898 unit tests and the Playwright lane are all green, and
  **`dist/` came out byte-identical to committed 1.8.0** — the new build host
  changes nothing we ship.
- ✅ **`tjs-lang` 0.10.1 → 0.13.6.** This half took two attempts, and the
  detour is the useful part.

  **The bug (tjs-lang#37, CLOSED — fixed in 0.13.6).** `tjs convert` on
  0.13.0–0.13.5 stripped `new` from every class declared in the module being
  converted, so the output threw `Cannot call a class constructor without
|new|` — at _import_ time where the call is a static field initialiser. 15
  call sites across 4 of our modules, `UnsafePathError` (the
  prototype-pollution guard) among them, which would have degraded a security
  refusal into a `TypeError`. Bisected to **0.13.0** against a ten-line repro;
  filed the same day, fixed the same day.

  Upstream's diagnosis is worth recording because it explains why this looked
  deliberate: dropping `new` **is** correct where a class is callable, and in
  native `.tjs` it is, because the emitter Proxy-wraps it. The scope was wrong
  — `fromTS` output is plain JS with no Proxy wrap, so there the `new` is
  load-bearing. The transform moved to the _graduation_ step. Six regression
  tests, one of which actually **imports** the converted module (the failure
  was at module evaluation, so a test that only transpiled would have missed
  it).

  **Caught by the published-bundle smoke gate, and only by it.** All 898 unit
  tests passed under the broken toolchain: they exercise `src/`, and the bug is
  in the emitter, downstream of everything the suite can see. This is the
  standing argument for a gate that executes what you ship — see
  `../tosijs-coding-practices/practices/dependencies.md` §12.

  **Verified on 0.13.6** by repro, by a green build (all gates), by 898 unit
  tests, by the Playwright lane 4/4, and by exercising the previously-broken
  paths in the built artifact: `new Color(...)`, the `Color.black` static field
  initialiser, `Color.fromHsl`, and the `__proto__` guard throwing
  `UnsafePathError` with its intended message. Only `dist/module.debug.js` and
  `dist/module.safe.js` changed; every consumer-facing bundle is byte-identical.

  **Budget note:** the fix cost ~340 gzipped bytes on each tjs bundle, landing
  `module.debug.js` at 55_993 against a 56_000 ceiling — a pass with **seven
  bytes** of headroom. Raised to 58_000 in the same commit, with the reasoning
  at `bin/bundles.ts`. A gate that passes by seven bytes is a gate that fails
  next week on something unrelated, and teaches whoever hits it to raise the
  number without reading it.

  The peer range was never the blocker in either direction: since tosijs-ui
  1.11.0 `tjs-lang` is an **optional** peer. That retires the last trace of the
  false "1.10.0 peers ^0.12.0 so we cannot bump" rationale below.

- 🔭 **STILL OPEN, and NOT caused by any of this: `tjs convert`'s inline
  signature-test runner fails on two of our files, on every version tried
  (0.10.1 through 0.13.6).**

  - `src/color.ts: 0 passed, 8 failed — clamp is not defined` — the runner does
    not resolve cross-module imports (`clamp` lives in `more-math.ts`).
  - `src/component.ts: 0 passed, 5 failed — Unexpected token ')'. Try statements
must have at least a catch or finally block.`

  **The emitted modules are fine.** `tjs-out/component.js` parses, bundles
  (`bun build`, 27 modules, exit 0) and imports; the syntax error is inside the
  harness the runner builds around the module, not in the output. I originally
  reported the `component.ts` one on #37 as a possible second emitter bug — it
  is not; correcting that here so the next reader does not chase it.

  Consequence: **13 failures printed on every single build**, permanently, both
  ignored. That is exactly the ambient-noise condition that hides a real
  failure when one appears — and the reason the #37 emitter regression first
  read to me as more of the usual convert noise.

  **Issue:** https://github.com/tonioloewald/tjs-lang/issues/40 — asks for
  either import resolution in the runner, or (cheaper, and arguably more
  correct) reporting an unrunnable module as **skipped-with-reason** instead of
  as N failed tests. A runner that cannot build its harness has not observed a
  failing test.

### 🛑 HOLD — everything tjs-lang waits for **0.13.0 stable**

**Maintainer decision, 2026-08-21.** tjs-lang is at **0.13.0-rc.1**, and 0.13.0
is not an increment: the language was **reoriented to be TypeScript plus
obvious improvements**, rather than to fight TypeScript idioms and muscle
memory. That changes the shape of every question below — what `tjs convert`
emits, what a native-TJS module looks like, and how much of the 2.0 port's
recorded friction still exists. Resolving tjs-lang items against 0.10.1, or
chasing 0.12.0 to satisfy a peer range, would be work done against a target
that is about to move.

So, deliberately, for 1.8.0:

- **`tjs-lang` stays pinned at `0.10.1`.** The debug/safe bundles it builds are
  EXPERIMENTAL and inert (every TS-converted function is marked `unsafe` by
  design), so nothing user-facing rides on the version.
- ⚠️ **`tosijs-ui` stays pinned at `1.9.4`, but the reason recorded here was
  FALSE and is corrected.** This said 1.10.0 was unadoptable "because 1.10.0
  peers `tjs-lang ^0.12.0`". Verified against the registry: **1.9.1, 1.9.4 and
  1.10.0 all declare `tjs-lang: ^0.12.0`.** The 1.9.4 we already install
  carries that peer, so upgrading changes nothing about it — we have been
  paying a cost for a constraint that does not exist. Found by round-4 (M6).

  The cost is real and itemised: the 10-entry `watchPaths` array in
  `tosijs-site.config.ts` duplicating `docPaths` is the tosijs-ui#49
  workaround, and **#49 is closed upstream**, along with #51, #70, #71, #72.

  So the bump is unblocked and always was. It is deferred now for one honest
  reason only — it is a build-host change and 1.8.0 is mid-release — and it is
  reopened as work rather than closed as a decision (`TODO.md` E1).

- **The `tosijs-2.0` port branch stays on hold** (it already was). When it
  resumes, the 0.13.0 ergonomics ARE the experiment: re-walk `by-path.tjs`
  against the branch's `TJS-PORT-DX.md` friction log as the BEFORE.

### 🚧 FIXED UPSTREAM, NOT ADOPTED — post-eval reconfiguration seam for `globalThis.__tjs`

**Issue:** https://github.com/tonioloewald/tjs-lang/issues/23 (closed
2026-08-06 — but tjs-lang's last publish before that close was 0.12.0 on
2026-07-20, and we pin 0.10.1, so **no version we can install carries the
fix**). Marked ✅ RESOLVED here while its own body still said the workaround was
mandatory; the round-3 review caught the contradiction, and the risk is
specific: a future 2.0 session reads RESOLVED, deletes the `configure-tjs-*`
import-order guard as obsolete, and the debug/safe bundles silently configure
nothing — which is exactly the H-4 defect, paid a second time.

Converted modules capture `globalThis.__tjs?.createRuntime?.()` at eval time, so
config set after the library's `export *` has evaluated configures nothing — the
`configure-tjs-*` import-first workaround compensates, **and must stay until a
version carrying the fix is actually installed and the guard is proven
unnecessary.** Verify against 0.13.0 stable.

(There is also a related, already-filed ring-buffer ask on the `tosijs-2.0`
branch's UPSTREAM.md — tjs-lang#17.)
