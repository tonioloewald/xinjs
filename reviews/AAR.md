# After-action reports

Newest first. **Facts, not analysis** — 3–6 bullets, five minutes. The whys are
asked periodically, by the Tier 3 quarterly audit reading these across projects
(`practices/releasing.md` step 10). Do not root-cause here.

## 1.10.9 — 2026-10-15

- **Went well:** the variable-height list rewrite was owner-tested on an iPhone
  through the tunnel's magic link before release, and the WebKit project caught
  a `scrollTop` clamp that Chromium alone would have hidden.
- **Went well:** the pre-release review's two majors (rows moving on an insert
  above the view; the README contradicting the Hot Reload page) were both fixed
  before tagging, the first with a spec case that was red beforehand.
- **Didn't:** the first attestation failed — Firefox measured 11px against an
  8px bound written for an unchanged list, under the attest lane's load.
- **Surprised:** approval landed after the 60-minute window; the run ended
  green with nothing verified, and a `verify_only` run supplied the verification.
- **Friction:** the dev server rewrites `dist/` (stubs and loose files), so it
  had to be stopped before every build, release-doctor and Playwright run.
- **Cycle:** none.

## 1.10.7 — 2026-10-03

- **Went well:** first release through the three-job publish workflow; the
  one untested piece (npm stage publish from the code-free stage job) worked
  first time. Approved inside the window; verify job green.
- **Went well:** the light review earned its keep: a scoping claim in the
  settled() docs that was wrong for two of four signals, and a stated
  mechanism (row recycling) the library does not have.
- **Didn't:** CI on main was red for five commits (a require() in a test;
  `bun run format` hid it because eslint gates prettier and I had silenced
  the output). Found while checking status for the owner, not by any gate.
- **Surprised:** a nested template literal broke `tjs convert` ~470 lines
  later, only in context (tjs-lang #2837); and the long-list warning cost
  480 B gz per bundle until the message was cut to 290.
- **Cycle:** none.

## 1.10.6 — 2026-10-01

- **Went well:** the fixed `verify_only` (audit in warn mode) was proven on the
  release it was written for — 1.10.5's verification is now on record, green.
- **Went well:** every bundle diffed against 1.10.5 before tagging: four
  byte-identical, the rest one version character plus `debugId`.
- **Didn't:** the attestation's browser lane collided with tosijs-ui's on port
  8799, and the aborted dev server deleted `dist/`. Re-attested on
  `E2E_PORT=8812` (#1716).
- **Surprised:** a timed-out approval now ends the run GREEN with nothing
  verified (#2495); and the packument listed 1.10.6 ~220 s before the CDN
  served its tarball, failing the first registry smoke test.
- **Cycle:** none.

## 1.10.5 — 2026-09-29

- **Went well:** docs-only patch; the pre-tag review caught that the CHANGELOG
  claimed a README fix that had not been made.
- **Didn't:** approved after the 60-minute wait, and `verify_only` then failed
  on an advisory published the next day (fixed in the template, #2469).
- **Cycle:** none.

## 1.10.4 — 2026-09-26

- **Went well:** first release through the OIDC + staged-publish workflow with
  local attestation. Tag to served in one run; published bytes identical to
  the staged tarball; registry smoke test green. Staged → served ~26 min,
  approval included.
- **Went well:** the dry runs found three defects no local lane could: two
  tests that only passed on macOS (npm notice captured as `tsc` errors; a
  warn-once latch spent under Linux file order) and `src/index-iife.ts`
  shipping with an undeclared import.
- **Didn't:** `attest.ts` could not attest at all (the browser lane's dev
  server rewrites non-shipped doc stamps). Fixed in the shared tool; the fix's
  first version misparsed the first porcelain line and would have waved a
  shipped file through. Caught by its own output (`ocs/tosijs.epub`).
- **Surprised:** the pre-tag review verified a latent supply-chain gap in the
  template: an unattested publish fails closed only because the job lacks a TLS
  cert. Filed upstream (practices #1751, #1083).
- **Friction:** `git checkout` to undo a mutation check reverted the whole
  uncommitted patch it was testing.
- **Cycle:** none. GO_WITH_FOLLOWUPS, 0 blockers.

## 1.10.3 — 2026-09-19

- **Went well:** the always-on review caught an **inverted condition in the new
  doc page** — it said `!==` where the code means the opposite — in the release
  whose purpose was retracting a false statement from shipped docs. One
  character, in prose, in the one file written to stop this exact thing.
- **Went well:** the release-totals table was right on the first paste, then
  went stale by 10 B on two rows when late doc edits moved the tjs bundles.
  Re-pasting from the emitter at release-final caught it — first cycle the
  discipline worked rather than being discovered after the fact.
- **Didn't:** Tier 0 failed on a **false positive in its own new check** —
  `dist/cli.mjs`'s `./components/${tag}` is a string inside a template literal
  the scaffolder writes into the project it generates, not an import. Fixed in
  the shared tool.
- **Didn't:** `SECURITY.md` declared the version being released unsupported and
  pointed reporters at a 1.11.x that does not exist. Shipped that way in 1.10.2;
  a renumber fixed two references in the file and missed two.
- **Surprised:** the 1.10.2 security remedy was wrong in **all three** known
  shapes, not just the one cited — found by verifying a claim I had already
  written down as narrower.
- **Surprised:** the browser lane reads `dist/` and the dev server restores the
  **committed** copies, so a tripwire written to fail on a new export passed
  against a stale bundle. The lane tests what you committed, not what you built.
- **Friction:** a backtick inside a comment inside a template literal made a
  test file unparseable, and Playwright reported "No tests found" rather than a
  syntax error.
- **Cycle:** none in code. Both blockers were prose; no runtime defect was found
  in the diff.

## 1.10.2 — 2026-09-16

- **Went well:** the budget ledger added this release (build emits
  bundle/gz/budget/spare) caught two bundles falling under the 1 kB headroom
  floor, and later caught the version restamp moving every bundle by a byte or
  two. Post-publish verification was clean first try: 8/8 bundles byte-identical
  to the tag, 7/7 entry points from the registry with 0 undefined exports.
- **Went well:** the `auditView` deletion was proven by executing the deleted
  code against its replacement over a 116,640-record matrix rather than by
  reading the upstream changelog.
- **Didn't:** shipped a false remedy in a security note — *"marking the control
  itself … works in all of these"* is wrong for the first shape in its own
  bullet list, two lines below the bullet that says so. Found by executing the
  published tarball, after release. Fixed on main.
- **Didn't:** #41 was described as "closed completely" mid-session; the
  2-levels-up wrapper still returns cleartext. The issue stays open.
- **Surprised:** three `perl` mutation checks silently matched nothing (prettier
  had rewrapped the conditions), each producing a confident *false* negative
  that pointed at deleting a working guard.
- **Surprised:** `bun -e` and `node -e` disagree ~1% on gzip; measuring with the
  wrong one produced a written accusation that a correct file was careless.
- **Friction:** twelve review rounds under the label 1.11.0, then renumbered to
  1.10.2 at tag time — 70 references across 17 files, two of which were
  historical and would have been corrupted by a blanket replace.
- **Cycle:** yes, three deep. R10 fix (withhold `href`) → R11 blocker
  (`<select>` leaked via flag-vs-decision) → R11 fix (audit gate on `secret`) →
  R12 majors (same flag-vs-decision error, one file over, in both directions).
