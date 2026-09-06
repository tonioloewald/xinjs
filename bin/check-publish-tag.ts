#!/usr/bin/env bun
/**
 * Refuse to publish a PRERELEASE onto npm's `latest` tag.
 *
 * `npm publish` defaults to `latest`. Forget `--tag rc` on a prerelease and
 * every `npm i tosijs` starts serving it — which is precisely what happened
 * with 1.8.0-rc.2: the publish itself was fine, the tag routing was not, and
 * `latest` pointed at a release candidate until someone noticed.
 *
 * The signal is reliable: npm sets `npm_config_tag` in the environment when
 * `--tag` is passed and leaves it undefined otherwise (verified against
 * `npm publish --dry-run` both ways). So this can distinguish "forgot the
 * flag" from "deliberately publishing a prerelease as latest", which is a
 * thing someone might genuinely want and should have to say out loud.
 *
 * Wired as `prepublishOnly`, so it runs for `npm publish` and NOT for
 * `npm pack`, `bun pm pack`, or an install — the narrowest hook that covers
 * the mistake.
 */
import pkg from '../package.json'
import { existsSync, readFileSync } from 'node:fs'
import { sourceFingerprint, FINGERPRINT_PATH } from './bundles'
import { spawnSync } from 'node:child_process'

const version: string = pkg.version
const isPrerelease = version.includes('-')
const tag = process.env.npm_config_tag

/**
 * REFUSE TO PUBLISH A TARBALL WITH MISSING EXPORTS TARGETS.
 *
 * This is the ordering-proof backstop for a defect that no source-order fix
 * inside `bin/site.ts` can close. `buildSite()`'s prebuild runs
 * `rm -rf dist` (tosijs-ui `orchestrator.js`), so EVERY `bun start` wipes the
 * library output and a dev run rebuilds only the non-tjs bundles — leaving
 * `dist/module.debug.js` and `dist/module.safe.js` gone while package.json
 * still exports `./debug` and `./safe`.
 *
 * The release checklist walks straight into it: step 3 `bun run build`
 * creates them, step 4 `bun run test:browser` launches a dev server that
 * deletes them, step 8 publishes. It shipped once already, as collateral in
 * a build-speed commit, and no gate could see it — the smoke loop and the
 * budget loop iterate only what the current run built, and the entries suite
 * skips a file that is absent.
 *
 * `prepublishOnly` is the one hook that runs after all of that and before
 * the tarball leaves. Deliberately NOT `npm pack`: packing a partial tree
 * while iterating is legitimate.
 */
const missing: string[] = []
for (const [subpath, entry] of Object.entries(
  (pkg as any).exports as Record<string, any>
)) {
  for (const [condition, target] of Object.entries(
    entry as Record<string, string>
  )) {
    if (condition === 'types' || typeof target !== 'string') continue
    if (!target.endsWith('.js')) continue
    const file = target.replace(/^\.\//, '')
    if (!existsSync(file)) {
      missing.push(`  ${subpath} (${condition}) -> ${target} [not on disk]`)
      continue
    }
    // ON DISK IS NOT IN THE COMMIT.
    //
    // This gate checked `existsSync` alone, and the previous review had
    // already predicted the false pass in as many words: "verify with
    // `git ls-files`, not `ls`, because a dev run can leave an untracked copy
    // that makes `npm pack` look correct." It then happened on the very next
    // commit after the gate was declared: `bun run test:browser` deleted both
    // tjs bundles, the commit recorded the deletion, a later build left
    // untracked copies behind, and every existsSync check went green over a
    // release commit that no longer contained them. A clean clone of the tag
    // resolves ./debug and ./safe to nothing.
    const tracked = spawnSync('git', ['ls-files', '--error-unmatch', file], {
      stdio: 'ignore',
    })
    if (tracked.status !== 0) {
      missing.push(
        `  ${subpath} (${condition}) -> ${target} [on disk but NOT COMMITTED]`
      )
    }
  }
}
if (missing.length > 0) {
  console.error(
    `\n  REFUSING TO PUBLISH: package.json exports point at files that do ` +
      `not exist.\n\n${missing.join('\n')}\n\n` +
      `  Consumers importing those subpaths would get ERR_MODULE_NOT_FOUND.\n` +
      `  Run \`bun run build\` (NOT \`bun start\`, and AFTER the browser lane —\n` +
      `  both wipe dist/), then \`git add\` the result and publish from that\n` +
      `  COMMIT — or remove the export if the artifact is being retired.\n`
  )
  process.exit(1)
}
/**
 * ARE THESE ARTIFACTS BUILT FROM THIS SOURCE?
 *
 * The check above proves every `exports` target EXISTS and is TRACKED. It
 * cannot prove they were built from the source being published — and that gap
 * is reachable, because a dev run wipes `dist/` and `restoreCommittedDist()`
 * puts the COMMITTED copies back, which satisfy both conditions while being
 * older than the source. `release-doctor` catches staleness, but it is not run
 * by `npm publish`, so this was the one guard a human had to remember.
 */
const recorded = existsSync(FINGERPRINT_PATH)
  ? readFileSync(FINGERPRINT_PATH, 'utf8').trim()
  : ''
const actual = await sourceFingerprint()
if (recorded !== actual) {
  console.error(
    `\n  REFUSING TO PUBLISH: dist/ was not built from this source.\n\n` +
      `  recorded: ${
        recorded || '(no fingerprint — dist/ predates this check)'
      }\n` +
      `  current:  ${actual}\n\n` +
      `  Run \`bun run build\` and publish from that tree. This usually means a\n` +
      `  dev server or the browser lane wiped dist/ after the last real build\n` +
      `  and the committed copies were restored in its place.\n`
  )
  process.exit(1)
}

console.log(
  `exports gate: ${Object.keys((pkg as any).exports).length} subpaths resolve`
)

if (!isPrerelease) {
  // a stable release going to `latest` is the ordinary case
  process.exit(0)
}

const channel = version.split('-')[1]?.split('.')[0] ?? 'next'

// WE CAN ONLY ENFORCE WHAT WE CAN OBSERVE.
//
// The guard reads `npm_config_tag`, which npm sets when `--tag` is passed.
// bun does NOT set it — so under `bun publish --tag rc`, a perfectly correct
// command, this saw `undefined` and refused, advising the user to do the exact
// thing they had just done. That is worse than the hazard: it teaches people to
// reach for `--ignore-scripts`, which disables the guard permanently.
//
// So: hard-block only where the signal is trustworthy (npm). Under bun, say
// loudly what cannot be checked and let it through — the release checklist's
// "verify dist-tags after publishing" step is the backstop, and a reminder that
// occasionally repeats is cheaper than a gate that blocks correct work.
const agent = process.env.npm_config_user_agent ?? ''
const canReadTag = tag != null || !agent.includes('bun')

if (!canReadTag) {
  console.warn(
    `\n  ⚠️  ${version} is a PRERELEASE, and bun does not tell this hook which ` +
      `tag you passed.\n\n` +
      `  Publishing without \`--tag ${channel}\` puts a release candidate on ` +
      `\`latest\`,\n  where a bare install picks it up.\n\n` +
      `  Not blocking, because this cannot be distinguished from a correct ` +
      `command.\n  VERIFY IMMEDIATELY AFTER:\n\n` +
      `      npm view ${pkg.name} dist-tags\n\n` +
      `  and if \`latest\` moved when you did not mean it to:\n\n` +
      `      npm dist-tag add ${pkg.name}@${version} ${channel}\n` +
      `      npm dist-tag add ${pkg.name}@<last-stable> latest\n`
  )
  process.exit(0)
}

// THE ESCAPE HATCH CANNOT BE `--tag latest`, and this guard used to claim it
// was. npm exports `npm_config_*` only for NON-DEFAULT values, and `tag`'s
// default IS `latest` — so `npm publish --tag latest` leaves `npm_config_tag`
// unset, indistinguishable from omitting the flag, and hits the same refusal
// the message told you it would bypass. The only real escapes were
// `--ignore-scripts` or deleting the hook, both of which disable every publish
// gate permanently. "Verified both ways" had probed flag and no-flag; the
// third case the hatch depended on was never probed.
//
// So the deliberate override is an env var, which IS observable:
//   ALLOW_PRERELEASE_ON_LATEST=1 npm publish
const deliberateOverride = process.env.ALLOW_PRERELEASE_ON_LATEST === '1'

if (deliberateOverride) {
  console.warn(
    `\n  ⚠️  Publishing prerelease ${version} to \`latest\` deliberately ` +
      `(ALLOW_PRERELEASE_ON_LATEST=1).\n     A bare \`npm i ${pkg.name}\` will ` +
      `serve it.\n`
  )
  process.exit(0)
}

if (tag == null || tag === 'latest') {
  console.error(
    `\n  REFUSING TO PUBLISH: ${version} is a prerelease and would become ` +
      `\`latest\`.\n\n` +
      `  npm publish defaults to \`latest\`, so every \`npm i ${pkg.name}\` ` +
      `would start\n  serving a release candidate.\n\n` +
      `  Did you mean:\n\n` +
      `      npm publish --tag ${channel}\n\n` +
      `  If you really do want this prerelease on \`latest\`, note that\n` +
      `  \`--tag latest\` is INVISIBLE to this hook (npm only exports ` +
      `non-default\n  config, and \`latest\` is the default). Say it with an ` +
      `env var instead:\n\n` +
      `      ALLOW_PRERELEASE_ON_LATEST=1 npm publish\n\n` +
      `  (If it already happened, it is fixable without unpublishing:\n` +
      `      npm dist-tag add ${pkg.name}@${version} ${channel}\n` +
      `      npm dist-tag add ${pkg.name}@<last-stable> latest)\n`
  )
  process.exit(1)
}

console.log(`publish tag: ${version} → \`${tag}\` (prerelease, not latest)`)
