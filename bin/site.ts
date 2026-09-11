/*
tosijs build entry — wraps the reusable doc-site system from tosijs-ui/site.
Project config lives in tosijs-site.config.ts; the library bundling (esm/cjs/iife
+ tjs-converted debug/safe variants) for the npm package is wired here.

  bun bin/site.ts                  # build, then dev server
  bun bin/site.ts --build          # build and exit (0/1)
*/

import * as path from 'path'
import { existsSync } from 'node:fs'
import { $ } from 'bun'
import {
  BUNDLES,
  BundleSpec,
  sourceFingerprint,
  FINGERPRINT_PATH,
} from './bundles'
import siteConfig from '../tosijs-site.config'
import { buildSite, devServer } from 'tosijs-ui/site'

declare global {
  var Bun: any
}

const buildOnly = process.argv.includes('--build')
const PROJECT_ROOT = path.resolve(import.meta.dir, '..')
const DIST = path.resolve(PROJECT_ROOT, 'dist')
const PUBLIC = path.resolve(PROJECT_ROOT, siteConfig.outputDir ?? 'docs')
const MINIFY = true

// Bun.build can't resolve a package's own name from its root (cycle), so any
// `import 'tosijs'` from inside tosijs-ui needs to be redirected to our local
// source. This keeps the IIFE single-copy: tosijs-ui and our index-iife.ts
// both end up sharing one tosijs.
const tosijsAlias = {
  name: 'tosijs-self-alias',
  setup(build: any) {
    const target = path.resolve(PROJECT_ROOT, 'src/index.ts')
    build.onResolve({ filter: /^tosijs$/ }, () => ({ path: target }))
  },
}

async function writeVersion() {
  const pkg = JSON.parse(await Bun.file('package.json').text())
  await Bun.write('src/version.ts', `export const version = '${pkg.version}'\n`)
  console.log('tosijs package version', pkg.version)
}

/**
 * May this run rewrite a TRACKED SOURCE FILE?
 *
 * Only a real build may. `bun start` must not dirty the tree under the
 * developer — it makes two contributors' checkouts differ from the same
 * commit, and it means a dev server started on a feature branch can stamp
 * generated values measured from uncommitted WIP.
 *
 * Both generators that write into tracked sources call this: the schematic
 * vendoring, which has always had the guard, and the README size block, which
 * shipped without it in rc.2 and rewrote README.md on every `bun start`.
 */
function mayRewriteTrackedSource(what: string, fix: string): boolean {
  if (buildOnly) return true
  console.warn(
    `${what} is out of date. Run \`bun run build\` to regenerate it — the dev ` +
      `server will not rewrite tracked sources. (${fix})`
  )
  return false
}

async function vendorSchematic() {
  // tosijs-floorplan (devDependency; formerly tosijs-schematic — renamed
  // away from the tosijs-schema near-collision) is the SOURCE OF TRUTH for
  // the schematic renderer; tosijs inlines its dependency-free core at
  // build time — batteries included, zero runtime deps, no divergence.
  // tosijs's own doc-system header (the /*{...}*/ and /*# ... */ blocks)
  // is preserved from the current file; everything below it regenerates.
  const upstreamPkg = JSON.parse(
    await Bun.file('node_modules/tosijs-floorplan/package.json').text()
  )
  const upstream = await Bun.file(
    'node_modules/tosijs-floorplan/src/index.ts'
  ).text()
  // NOTICE is the Apache-2.0 §4(d) attribution artifact and it SHIPS in the
  // tarball, so a stale URL there is a licensing defect, not a typo. It
  // already went stale once across the tosijs-schematic → tosijs-floorplan
  // rename and survived on a GitHub redirect that dies the moment anyone
  // claims the old path. Check it against the vendored package's own
  // repository field, here, where the vendoring happens.
  const upstreamRepo = String(upstreamPkg.repository?.url ?? '')
    .replace(/^git\+/, '')
    .replace(/\.git$/, '')
  if (upstreamRepo !== '') {
    const notice = await Bun.file('NOTICE').text()
    if (!notice.includes(upstreamRepo)) {
      throw new Error(
        `vendorSchematic: NOTICE does not name the vendored package's own ` +
          `repository (${upstreamRepo}). NOTICE ships in the published ` +
          `tarball as the Apache-2.0 attribution — update it in this commit.`
      )
    }
  }

  const current = await Bun.file('src/schematic.ts').text()
  const headerStart = current.indexOf('/*#')
  const headerEnd = current.indexOf('*/', headerStart) + 2
  if (headerStart < 0 || headerEnd < 2) {
    throw new Error('vendorSchematic: src/schematic.ts doc header not found')
  }
  const header = current.slice(0, headerEnd + 1)
  const banner =
    `\n// VENDORED from ${upstreamPkg.name}@${upstreamPkg.version} — the upstream package\n` +
    '// is the source of truth. DO NOT EDIT below this line: edit\n' +
    `// ${upstreamPkg.name} and rebuild (this section regenerates at build time).\n` +
    '// tosijs stays ZERO runtime dependencies — the core is inlined, not imported.\n\n'
  const generated = header + banner + upstream
  if (generated === current) return
  if (!buildOnly) {
    // `bun start` must not rewrite a TRACKED SOURCE FILE under the
    // developer — that dirties the tree on every dev-server start and makes
    // two contributors' checkouts differ from the same commit. Report and
    // continue; a real build regenerates it.
    console.warn(
      `src/schematic.ts is out of date with tosijs-floorplan@${upstreamPkg.version}. ` +
        'Run `bun run build` to regenerate it (the dev server will not ' +
        'rewrite tracked sources).'
    )
    return
  }
  await Bun.write('src/schematic.ts', generated)
  console.log('vendored tosijs-floorplan', upstreamPkg.version)
}

async function buildCli() {
  // the scaffolder: `bunx tosijs create …` / `npx tosijs create …` —
  // node-target build (npx runs node), shebang + exec bit stamped here
  await Bun.build({
    entrypoints: ['./bin/cli.ts'],
    format: 'esm',
    target: 'node',
    outdir: DIST,
    naming: 'cli.mjs',
  })
  const cliPath = `${DIST}/cli.mjs`
  const built = await Bun.file(cliPath).text()
  if (!built.startsWith('#!')) {
    await Bun.write(cliPath, '#!/usr/bin/env node\n' + built)
  }
  const { chmodSync } = await import('node:fs')
  chmodSync(cliPath, 0o755)
}

/**
 * `full` = the PUBLISHING gates. Dev serving does not need them.
 *
 * `bun start` ran all of this before it would serve a page: the whole unit
 * suite, a 53-file `tjs convert`, two extra bundle builds and their smoke
 * imports — 24,575 lines and ~1 MB of output, of which the actual test result
 * was ONE line at 23,941. The watch rebuild already skipped it "for speed"
 * (see the note above `checkInternalLinks`); the same reasoning simply was
 * never applied to the first run.
 *
 * The debug/safe bundles are the tjs half, and they are EXPERIMENTAL and
 * currently inert — the dev server never serves them, and `tjs convert` emits
 * 527 unknown-type warnings producing them.
 */
/**
 * PUT BACK EVERY TRACKED dist/ ARTIFACT THIS RUN DID NOT BUILD.
 *
 * `buildSite()`'s prebuild does an unconditional `rm -rf dist` on EVERY run
 * (tosijs-ui#130), and a dev run rebuilds only some of what lives there. Since
 * `dist/` is committed in this repo, the next `git add -A` records deletions
 * nobody made — which has happened three times, twice reaching a release
 * commit.
 *
 * This lived inside `buildLibrary()` and therefore ran ONCE, on the first
 * build. The watcher calls `rebuild()`, which is `buildSite` + docs bundle and
 * never touches `buildLibrary` — so saving any watched file under `bun start`
 * deleted all eight tracked bundles again with no restore, and the comment
 * claiming the problem was "ended by not relying on remembering" was false: it
 * still relied on remembering not to save a file while the dev server ran,
 * which is the ordinary dev loop.
 *
 * Widened past the tjs pair to ANY tracked `dist/*` that is currently missing,
 * because `dist/cli.mjs` is `bin`, not `exports`, and no publish gate covers
 * it.
 */
async function restoreCommittedDist(): Promise<void> {
  const tracked = await $`git ls-files dist`.nothrow().quiet()
  if (tracked.exitCode !== 0) return
  // SKIP UNMERGED PATHS. `git ls-files` lists conflict stages too, and
  // `git checkout -- <path>` on an unmerged path does not restore "the
  // committed copy" — there isn't one — so it would either error or silently
  // pick a stage mid-merge.
  const unmerged = await $`git ls-files -u dist`.nothrow().quiet()
  const conflicted = new Set(
    unmerged.stdout
      .toString()
      .split('\n')
      .map((l) => l.split('\t')[1])
      .filter((f) => f != null && f !== '')
  )
  const missing = tracked.stdout
    .toString()
    .split('\n')
    .filter((f) => f.trim() !== '' && !conflicted.has(f) && !existsSync(f))
  if (conflicted.size > 0) {
    console.warn(
      `dist/ has ${conflicted.size} unmerged path(s); not restoring those — ` +
        'resolve the merge first.'
    )
  }
  if (missing.length === 0) return
  // AND DO NOT ANNOUNCE A RESTORE THAT DID NOT HAPPEN. This ran `.nothrow()`
  // and logged success unconditionally, so a failed checkout reported
  // "restored N" and the deletions stayed — the message was the only signal
  // anyone had.
  const restored = await $`git checkout -- ${missing}`.nothrow().quiet()
  const stillMissing = missing.filter((f) => !existsSync(f))
  if (restored.exitCode !== 0 || stillMissing.length > 0) {
    console.error(
      `FAILED to restore ${stillMissing.length || missing.length} committed ` +
        `dist artifact(s): ${stillMissing.join(', ') || missing.join(', ')}. ` +
        'Do not commit — `git status` will show them deleted.'
    )
    return
  }
  console.log(
    `restored ${missing.length} committed dist artifact(s) — these are the ` +
      `COMMITTED copies, which may be older than your source. Re-run ` +
      `\`bun run build\` before committing (release-doctor's artifact-freshness ` +
      `check catches it if you forget).`
  )
}

async function buildLibrary(full = true) {
  console.time('library')

  if (full) await $`bun test src/`

  await buildCli()

  // THE PUBLISHED ARTIFACTS, DECLARED ONCE.
  //
  // This list used to exist four times — three `Bun.build` loops, `keepJs`,
  // the smoke loop, and the size budgets — and the copies had already drifted:
  // `main.js` was built, kept and budgeted but never executed, so a repeat of
  // the `sideEffects` defect this gate exists to catch would have shipped
  // fully green in the CJS artifact. Everything below derives from BUNDLES,
  // so adding an entry point cannot leave one gate behind.
  //
  // `probe` picks how the artifact is executed, because the three formats
  // cannot be checked the same way: an IIFE has no ESM exports (loading
  // without throwing IS the assertion — that is the failure mode a shaken-away
  // definition produces), CJS needs `require()`, ESM needs `import()`.
  //
  // Budgets are a DECISION, not a measurement: ~1 kB of headroom, so ordinary
  // work fits and the next feature has to be argued for. They were raised
  // deliberately twice — in the round-2 review commit, and for the 1.8.0
  // security pass (+~1.7 kB on module.js: the path-segment guard at the
  // setByPath sink, path-level secret redaction, the write/read posture split,
  // arrow neutralisation, escaped id lookups, contract-validator locking and
  // the WebMCP revocation bookkeeping). The gate caught both on its first run,
  // which is the gate working.
  const buildBundle = async (bundle: BundleSpec) => {
    const result = await Bun.build({
      entrypoints: [bundle.entry],
      format: bundle.format,
      outdir: DIST,
      target: 'browser',
      sourcemap: bundle.sourcemap === false ? 'none' : 'linked',
      minify: MINIFY,
      naming: bundle.naming,
    })
    if (!result.success) {
      console.error(`library ${bundle.naming} build failed`)
      for (const m of result.logs) console.error(m)
      throw new Error(`library build failed: ${bundle.naming}`)
    }
  }

  for (const bundle of BUNDLES.filter((b) => b.stage !== 'tjs')) {
    await buildBundle(bundle)
  }

  if (full) {
    const TJS_OUT = path.resolve(PROJECT_ROOT, 'tjs-out')
    await $`rm -rf ${TJS_OUT}`
    await $`mkdir -p ${TJS_OUT}`
    await $`bun tjs convert src/ -o ${TJS_OUT}/`
    await $`bun tjs convert src/index-debug.ts -o ${TJS_OUT}/index-debug.js`
    await $`bun tjs convert src/index-safe.ts -o ${TJS_OUT}/index-safe.js`

    for (const bundle of BUNDLES.filter((b) => b.stage === 'tjs')) {
      await buildBundle(bundle)
    }
  }

  // Strip the per-file tsc-emitted .js (kept only so generate-css could
  // resolve `tosijs` mid-buildSite) — the published library is only the
  // bundled outputs above. .d.ts files are kept.
  // (cli.mjs isn't matched by the *.js strip below — .mjs so node runs it as
  // ESM without a package-level "type": "module", which would break main.js's
  // CJS consumers.)
  // only the bundles this run actually produced — a dev run skips the tjs
  // pair, and smoking a file that was never built fails for the wrong reason
  if (!full) await restoreCommittedDist()

  const BUILT = full ? BUNDLES : BUNDLES.filter((b) => b.stage !== 'tjs')
  // NEVER DELETE A PUBLISHED BUNDLE THIS RUN DID NOT BUILD.
  //
  // The strip loop exists to remove tsc's per-file emissions, and it keyed
  // off BUILT — which is the *filtered* list. So every `bun start` unlinked
  // dist/module.debug.js and dist/module.safe.js, the two bundles a dev run
  // deliberately skips, while package.json still exported ./debug and
  // ./safe. It had already fired: 5229813 committed their deletion as
  // collateral. And the release checklist guarantees the bad state — step 3
  // `bun run build` creates them, step 4 `bun run test:browser` launches a
  // dev server that deletes them, step 8 publishes. No gate could see it:
  // the smoke and budget loops both iterate BUILT too.
  //
  // BUILT is right for smoking and for budgets. It is wrong for deletion:
  // what may be REMOVED is "not a published bundle at all", which is the
  // full set.
  const keepJs = new Set(BUNDLES.map((b) => b.naming))
  const fs = await import('fs/promises')
  for (const name of await fs.readdir(DIST)) {
    if (name.endsWith('.js') && !keepJs.has(name)) {
      await fs.unlink(path.join(DIST, name))
    } else if (name.endsWith('.js.map')) {
      const base = name.replace(/\.map$/, '')
      if (!keepJs.has(base)) await fs.unlink(path.join(DIST, name))
    }
  }

  // EXECUTE EVERY PUBLISHED BUNDLE. A `sideEffects` array once produced
  // bundles that exported names whose definitions had been shaken away
  // ("H6 is not declared") — green tests, green tsc, green lint, broken
  // package. Only running the artifact catches that class of defect.
  const DOM_SHIM = `const { Window } = await import('happy-dom')
       const w = new Window()
       globalThis.window = w
       for (const k of Object.getOwnPropertyNames(w)) {
         if (globalThis[k] === undefined) {
           try { globalThis[k] = w[k] } catch {}
         }
       }`
  const ASSERT_EXPORTS = `if (Object.keys(m).length === 0) throw new Error('no exports')
       for (const [name, value] of Object.entries(m)) {
         if (value === undefined) throw new Error(name + ' is undefined')
       }`
  for (const { naming, probe } of BUILT) {
    const body =
      probe === 'load'
        ? `await import('${DIST}/${naming}')`
        : probe === 'require'
        ? `const { createRequire } = await import('node:module')
       const require = createRequire('${DIST}/')
       const m = require('${DIST}/${naming}')
       ${ASSERT_EXPORTS}`
        : `const m = await import('${DIST}/${naming}')
       ${ASSERT_EXPORTS}`
    const result = Bun.spawnSync(['bun', '-e', `${DOM_SHIM}\n       ${body}`], {
      stderr: 'pipe',
      stdout: 'pipe',
    })
    if (result.exitCode !== 0) {
      console.error(`smoke ${probe} FAILED for dist/${naming}:`)
      console.error(result.stderr.toString().slice(0, 800))
      throw new Error(`dist/${naming} does not ${probe} cleanly`)
    }
  }
  console.log(
    `smoke: ${BUILT.map((b) => `${b.naming} (${b.probe})`).join(', ')}`
  )

  // THE DOM-FREE GATE (tosijs#18). The smoke probe above injects happy-dom
  // globals before importing, so a top-level `document.` anywhere reachable
  // from index-state.ts would sail through it — and through `bun test`,
  // which runs under happy-dom too. Only a BARE node process can prove the
  // claim, and it has to run after state.js exists.
  // What `node` is actually on PATH? The gate below spawns it, and a machine
  // whose default node predates modern ESM makes the gate lie rather than fail.
  const NODE_FLOOR = 20
  const nodeMajor = Number(
    (
      Bun.spawnSync(['node', '-v'], {
        stdout: 'pipe',
        stderr: 'pipe',
      }).stdout?.toString?.() ?? ''
    )
      .trim()
      .replace(/^v/, '')
      .split('.')[0]
  )

  const domFree = Bun.spawnSync(
    [
      'node',
      '--input-type=module',
      '-e',
      `import { tosi, observe, updates, xin } from '${DIST}/state.js'
       const { buildGate } = tosi({ buildGate: { n: 0 } })
       await updates()
       const seen = []
       observe('buildGate.n', (p) => seen.push(p))
       buildGate.n = 42
       await updates()
       if (seen[0] !== 'buildGate.n' || xin['buildGate.n'] !== 42) process.exit(2)`,
    ],
    { stderr: 'pipe', stdout: 'pipe' }
  )
  if (domFree.exitCode !== 0) {
    // DISTINGUISH "CANNOT RUN" FROM "FOUND A PROBLEM" — practices
    // dependencies.md §2, fail open on inability and closed on findings.
    //
    // This gate spawns whatever `node` is on PATH and used to blame the bundle
    // for any non-zero exit. On a machine whose default node predates modern
    // ESM (node 14 is still `/usr/local/bin/node` on plenty of them) it
    // therefore reported `dist/state.js requires a DOM` — a specific, confident
    // and WRONG diagnosis that sends you to debug the bundle instead of your
    // toolchain. A gate that misdiagnoses is worse than one that abstains.
    if (nodeMajor > 0 && nodeMajor < NODE_FLOOR) {
      console.warn(
        `⚠️  dom-free gate SKIPPED — node ${nodeMajor} is too old to import a ` +
          `modern ESM bundle (need ${NODE_FLOOR}+). This is your PATH, not the ` +
          `artifact: \`node -v\` reports v${nodeMajor}. The gate did NOT run, ` +
          `so tosijs/state is UNVERIFIED in this build.`
      )
    } else {
      console.error('tosijs/state is NOT DOM-free (tosijs#18):')
      console.error(domFree.stderr.toString().slice(0, 800))
      throw new Error('dist/state.js requires a DOM')
    }
  } else {
    console.log('dom-free gate: tosijs/state imports and runs under bare node')
  }

  // SIZE BUDGETS, where the artifacts exist. The suite's copy can't run
  // during a build (buildSite wipes dist before the tests), so a regression
  // would ship green and only trip on the next developer's local run.
  // The figures live on BUNDLES above, beside the entry they measure — they
  // were a fifth copy of the artifact list until the round-3 DRY pass.
  const { gzipSync } = await import('node:zlib')
  const sizes: string[] = []
  const measured = new Map<string, number>()
  for (const { naming: file, budget } of BUILT) {
    const bytes = gzipSync(await Bun.file(`${DIST}/${file}`).bytes()).length
    measured.set(file, bytes)
    sizes.push(
      `${file} ${(bytes / 1024).toFixed(1)}k/${(budget / 1024).toFixed(0)}k`
    )
    if (bytes > budget) {
      throw new Error(
        `${file} is ${bytes} gzipped, over its ${budget} budget. Either the ` +
          'growth is worth it (raise the budget deliberately, in the same ' +
          'commit) or it is not.'
      )
    }
  }
  console.log('gzip budgets:', sizes.join(', '))

  // EMIT THE DELTA, DO NOT RETYPE IT. Three consecutive pre-release reviews
  // found hand-transcribed byte figures drifted in CHANGELOG.md and
  // bin/bundles.ts, and one of those was a correction that drifted in turn.
  // Both artifacts are on disk (`dist/` is committed) and both are measured
  // by the same Bun zlib, so the release table can be COPIED from here.
  try {
    const prevTag = Bun.spawnSync(
      ['git', 'describe', '--tags', '--abbrev=0', '--match', 'v*'],
      { stdout: 'pipe', stderr: 'pipe' }
    )
    const tag = prevTag.stdout.toString().trim()
    if (tag !== '') {
      const rows: string[] = []
      for (const { naming } of BUILT) {
        const show = Bun.spawnSync(['git', 'show', `${tag}:dist/${naming}`], {
          stdout: 'pipe',
          stderr: 'pipe',
        })
        if (show.exitCode !== 0) continue
        const was = gzipSync(show.stdout).length
        const now = gzipSync(await Bun.file(`${DIST}/${naming}`).bytes()).length
        rows.push(
          `| \`${naming}\` | ${was
            .toLocaleString('en-US')
            .replace(/,/g, '_')} | ` +
            `${now.toLocaleString('en-US').replace(/,/g, '_')} | ` +
            `**${now - was >= 0 ? '+' : ''}${now - was}** |`
        )
      }
      if (rows.length > 0) {
        console.log(`gz delta since ${tag} — paste into the CHANGELOG:`)
        console.log('| bundle | ' + tag + ' | this build | Δ |')
        console.log('| --- | --- | --- | --- |')
        for (const r of rows) console.log(r)
      }
    }
  } catch {
    // a shallow clone or a missing tag is not a build failure
  }

  // EVERY EXPORTS TARGET MUST EXIST. Keyed off package.json's `exports`, not
  // off BUNDLES, because `exports` is the promise made to consumers — and it
  // is the promise that was broken: ./debug and ./safe pointed at bundles a
  // build-speed change had deleted from git and every `bun start` re-deleted,
  // so a publish shipped two subpaths that throw ERR_MODULE_NOT_FOUND. It was
  // invisible to every gate: the smoke loop and budget loop iterate only what
  // THIS run built, and `entries.test.ts` skips a file that is absent.
  //
  // It lives here, not in the suite, for the same reason the size gate does:
  // `bun test src/` runs BEFORE the bundles are rebuilt, so a copy there
  // fires against the previous run's dist and fails a correct build. (Tried
  // it. It did.)
  if (full) {
    const pkgJson = JSON.parse(await Bun.file('package.json').text())
    const missingTargets: string[] = []
    for (const [subpath, entry] of Object.entries(
      pkgJson.exports as Record<string, any>
    )) {
      for (const [condition, target] of Object.entries(
        entry as Record<string, string>
      )) {
        if (condition === 'types' || typeof target !== 'string') continue
        if (!target.endsWith('.js')) continue
        const file = target.replace(/^\.\//, '')
        if (!existsSync(file)) {
          missingTargets.push(`${subpath} (${condition}) -> ${target}`)
        } else if (
          (await $`git ls-files --error-unmatch ${file}`.nothrow().quiet())
            .exitCode !== 0
        ) {
          // ON DISK IS NOT IN THE COMMIT — dist/ is committed in this repo,
          // so an untracked bundle is missing from the release even though
          // every filesystem check passes. See check-publish-tag.ts.
          missingTargets.push(
            `${subpath} (${condition}) -> ${target} [untracked]`
          )
        }
      }
    }
    if (missingTargets.length > 0) {
      throw new Error(
        'package.json exports point at files that do not exist, so a publish ' +
          'would ship subpaths that throw ERR_MODULE_NOT_FOUND:\n  ' +
          missingTargets.join('\n  ') +
          '\nEither build them or remove the export.'
      )
    }
    console.log(
      `exports gate: ${Object.keys(pkgJson.exports).length} subpaths resolve`
    )
    // RECORD WHAT THIS dist/ WAS BUILT FROM, so `prepublishOnly` can prove the
    // artifacts match the source being published rather than merely existing.
    await Bun.write(FINGERPRINT_PATH, await sourceFingerprint(PROJECT_ROOT))
  }

  // PACKAGE PAYLOAD BUDGET. The gzip budgets above police what a consumer
  // EXECUTES; nothing policed what they DOWNLOAD. The tarball had reached
  // 5.48 MB unpacked, 4.3 MB of it source maps — 1.64 MB for the two
  // EXPERIMENTAL, admittedly-inert tjs bundles, whose maps are excluded from
  // `files` for exactly that reason. Measured by packing, because summing
  // dist/ would quietly disagree with whatever npm actually ships.
  // BUDGET WHAT WE PUBLISH, ONLY WHEN WE ARE PUBLISHING. A tarball budget has
  // no business running inside `bun start` — and it did, which is how it took
  // the release gate down (below).
  if (!buildOnly) return

  const packDir = path.resolve(PROJECT_ROOT, '.pack-probe')
  await $`rm -rf ${packDir}`
  await $`mkdir -p ${packDir}`
  // --ignore-scripts: `bun pm pack` runs prepack/prepare, and the day someone
  // adds `"prepare": "bun run build"` this recurses into itself forever.
  const packed = (
    await $`bun pm pack --ignore-scripts --destination ${packDir}`
      .env({ ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' })
      .text()
  )
    // STRIP ANSI ANYWAY. Playwright sets FORCE_COLOR=1 in its webServer child
    // env, so `bun pm pack` coloured its output and the summary line arrived as
    // `\x1b[1m\x1b[34mUnpacked size\x1b[0m: 3.89MB` — the reset sequence sits
    // between `size` and `:`, so a `/Unpacked size:/` regex cannot match.
    //
    // That killed `bun run test:browser` entirely: Playwright's webServer is
    // `bun start`, this gate threw, and Playwright reported only "Process from
    // config.webServer was not able to start" — so the doc-test lane and the
    // per-engine value-commit lane ran ZERO times, on a release that rewrites
    // the attribute accessors. Both a passing lane and a failing one would have
    // been fine; what we got was no lane and a green-looking summary from an
    // earlier run.
    //
    // Note the direction of the damage: the earlier FAIL-OPEN version had the
    // same parse bug and merely skipped the budget silently, so the lane still
    // started. Making the gate fail closed is right, and it is what exposed
    // this — but a gate that can take down another gate needs its input
    // normalised, not just its failure mode hardened.
    // Stripping ANSI IS the point here: the control characters are the thing
    // being removed, so no-control-regex's "you probably didn't mean this"
    // premise is inverted. Disable must sit on the line ABOVE the regex —
    // a wrapped explanatory comment pushed it out of range once already.
    // eslint-disable-next-line no-control-regex
    .replace(/\x1b\[[0-9;]*m/g, '')
  await $`rm -rf ${packDir}`
  // FAIL CLOSED ON A PARSE MISS. This was `if (match != null)` with no else —
  // so a unit change (KB/GB), a reword of bun's output, or the line going to
  // stderr silently disabled the budget and the build still exited 0. That is
  // the same fail-open shape removed from the test suite two commits earlier;
  // a gate that cannot measure must say so, not pass.
  const unpackedMatch = packed.match(/Unpacked size:\s*([\d.]+)\s*(KB|MB|GB)/i)
  if (unpackedMatch == null) {
    throw new Error(
      'package payload gate could not parse `bun pm pack` output, so the ' +
        'tarball budget did not run. Fix the parse rather than removing the ' +
        `gate — output was:\n${packed.slice(0, 400)}`
    )
  }
  const scale: Record<string, number> = { kb: 1 / 1024, mb: 1, gb: 1024 }
  const unpackedMb =
    Number(unpackedMatch[1]) * scale[unpackedMatch[2].toLowerCase()]
  // RAISED 4.5 -> 4.75 in 1.11.0, deliberately and in the commit that tripped
  // it, with the measurement. Tier 0 caught the tarball at 4.511 MB. Growth
  // since v1.10.1 is +81 kB: +63 kB across `module.js.map` and `main.js.map`
  // (the two whole-library builds, whose maps track the secrecy work), +15 kB
  // of CHANGELOG, +3 kB of actual code. That is ordinary growth, not the case
  // this gate is worded for ("a new bundle brought a map nobody needs").
  //
  // WORTH A REAL DECISION SOMEDAY, THOUGH, AND NOT A SILENT RAISE PER RELEASE:
  // source maps are 3.27 MB of the 4.51 MB payload — 72% — and `module.js.map`
  // and `main.js.map` are 886 kB each for what is the same library built two
  // ways. Every installer pays for both while using one. TODO.md carries it.
  const PAYLOAD_BUDGET_MB = 4.75
  console.log(`package payload: ${unpackedMb.toFixed(2)} MB unpacked`)
  if (unpackedMb > PAYLOAD_BUDGET_MB) {
    throw new Error(
      `the published tarball is ${unpackedMb.toFixed(2)} MB unpacked, over ` +
        `its ${PAYLOAD_BUDGET_MB} MB budget. Source maps are usually the ` +
        'cause — check what `files` in package.json is admitting, and whether ' +
        'a new bundle brought a map nobody needs.'
    )
  }

  // WRITE THE FIGURES THE DOCS QUOTE, rather than trusting prose to keep up.
  // README advertised 26/24/16/36 kB while the build measured 27/25/16/40, and
  // claimed the release "tree-shakes to about 1.7.x's size" — which measured
  // +13.7% on an identical non-agent consumer app. Numbers that a build can
  // produce should not be maintained by hand (practices/documentation-surface
  // move 1); the surrounding prose is still hand-written, because only the
  // figures are derivable.
  const kb = (name: string): string => {
    const spec = BUNDLES.find((b) => b.naming === name)
    const bytes = measured.get(name)
    if (spec == null || bytes == null) throw new Error(`no size for ${name}`)
    return `~${Math.round(bytes / 1024)} kB`
  }
  const sizeBlock =
    `<!-- sizes:start --><!-- generated by \`bun run build\` — do not hand-edit -->\n` +
    `  ${kb('index.js')} gzipped from a script tag, ${kb(
      'core.js'
    )} for \`tosijs/core\`, ${kb('state.js')} for the\n` +
    `  DOM-free \`tosijs/state\`; the full ESM entry is ${kb('module.js')}.\n` +
    `  <!-- sizes:end -->`
  const readmePath = path.resolve(PROJECT_ROOT, 'README.md')
  const readme = await Bun.file(readmePath).text()
  const withBlock = readme.replace(
    /<!-- sizes:start -->[\s\S]*?<!-- sizes:end -->/,
    sizeBlock
  )
  // ONE MEASUREMENT, EVERY SITE THAT QUOTES IT.
  //
  // The block above was generated while an "Entry points" table eleven lines
  // higher stayed hand-written, and they disagreed on the same page: the table
  // said 36/24/16/26 kB against a measured 42/26/16/28, and the page-metadata
  // string in line 3 (which feeds llms.txt and the site description) said a
  // third number. Generating one figure and hand-maintaining its neighbours is
  // how they drift apart while looking maintained.
  //
  // `<!--gz:module.js-->…<!--/gz-->` substitutes anywhere in the file, so the
  // prose stays in the README and only the numbers come from the build.
  const withTokens = withBlock.replace(
    /<!--gz:([\w.]+)-->[\s\S]*?<!--\/gz-->/g,
    (_match, name: string) => `<!--gz:${name}-->${kb(name)}<!--/gz-->`
  )
  // the agent surface's own weight, derived rather than remembered: it is
  // exactly what the full ESM entry carries over `tosijs/core`
  const agentDelta = (() => {
    const full = measured.get('module.js')
    const core = measured.get('core.js')
    if (full == null || core == null) throw new Error('no agent delta')
    return `~${((full - core) / 1024).toFixed(1)} kB`
  })()
  const replaced = withTokens.replace(
    /<!--agentgz-->[\s\S]*?<!--\/agentgz-->/g,
    `<!--agentgz-->${agentDelta}<!--/agentgz-->`
  )
  if (
    replaced !== readme &&
    mayRewriteTrackedSource(
      "README.md's sizes block",
      'the figures come from the artifacts this build just measured'
    )
  ) {
    await Bun.write(readmePath, replaced)
    console.log('README sizes block regenerated')
  }

  // THE PUBLISHED BIN, executed as consumers run it: the bundle, under node.
  // src/cli.test.ts spawns the SOURCE under bun, so a lost shebang, a lost
  // exec bit or a bun-only construct would ship green.
  const cliProbe = Bun.spawnSync(['node', `${DIST}/cli.mjs`, 'version'], {
    stderr: 'pipe',
    stdout: 'pipe',
  })
  if (cliProbe.exitCode !== 0 || !cliProbe.stdout.toString().includes('.')) {
    console.error('dist/cli.mjs does not run under node:')
    console.error(cliProbe.stderr.toString().slice(0, 500))
    throw new Error('the published bin is broken')
  }
  console.log('bin gate: node dist/cli.mjs runs')

  console.timeEnd('library')
}

async function buildDocsBundle() {
  console.time('docs iife')
  const result = await Bun.build({
    entrypoints: ['./src/index-iife.ts'],
    outdir: PUBLIC,
    target: 'browser',
    sourcemap: 'linked',
    format: 'iife',
    minify: MINIFY,
    naming: 'iife.js',
    plugins: [tosijsAlias],
  })
  if (!result.success) {
    console.error('docs iife bundle failed')
    for (const m of result.logs) console.error(m)
    throw new Error('docs iife bundle failed')
  }
  console.timeEnd('docs iife')
}

const config = {
  ...siteConfig,
  prebuild: async () => {
    await writeVersion()
    await vendorSchematic()
  },
}

// The dev-server watcher re-runs this on every change. buildSite() starts with
// `rm -rf docs`, which deletes the separately-built docs/iife.js — so the watch
// rebuild must regenerate it, or the page's /iife.js 404s into the SPA fallback
// ("loads as html"). buildLibrary() (tests + tjs variants) is only needed for
// publishing, so the watch build skips it for speed.

/**
 * INTERNAL LINK CHECK, against the slugs the site actually generated.
 *
 * Three `](/slug/)` links pointed at pages that do not exist — `/migration/`,
 * `/building-apps/` and `/dom/`. Two were case errors, invisible locally
 * because APFS is case-insensitive while GitHub Pages is not, and there is no
 * `docs/404.html` to make the failure loud. README is the site's home page,
 * so one of them was a 404 from the front door.
 *
 * The slug set is whatever `buildSite` just wrote, so this cannot drift from
 * the real site the way a hand-kept list would.
 */
async function checkInternalLinks(): Promise<void> {
  const fs = await import('fs/promises')
  const docsDir = path.resolve(PROJECT_ROOT, 'docs')
  let slugs: Set<string>
  try {
    const entries = await fs.readdir(docsDir, { withFileTypes: true })
    slugs = new Set(entries.filter((e) => e.isDirectory()).map((e) => e.name))
  } catch {
    return // no docs/ yet: nothing to check
  }
  // Set: README.md is normally in docPaths already, and reporting the same
  // broken link twice makes a short list look like a big problem
  // EXPAND docPaths THE WAY THE SITE DOES. The first version filtered
  // docPaths for `.md` and then did a non-recursive, `.ts`-only readdir of
  // `src` — which missed `src/docs/**` entirely, because docPaths carries the
  // bare entry `'src'` and buildSite expands that to `src/docs/*.md` as well
  // as the source doc blocks. 21 links lived in the blind spot, INCLUDING
  // `src/docs/history.md`, whose `/migration/` case error is the very bug the
  // commit that added this gate was fixing. A checker with a blind spot over
  // the thing it was written for is worse than none: it reports "no 404s".
  const sources = new Set<string>(['README.md'])
  const addTree = async (dir: string): Promise<void> => {
    let entries: Awaited<ReturnType<typeof fs.readdir>>
    try {
      entries = await fs.readdir(path.resolve(PROJECT_ROOT, dir), {
        withFileTypes: true,
      })
    } catch {
      return
    }
    for (const entry of entries) {
      const rel = `${dir}/${entry.name}`
      if (entry.isDirectory()) {
        await addTree(rel)
      } else if (
        (entry.name.endsWith('.md') || entry.name.endsWith('.ts')) &&
        !entry.name.endsWith('.test.ts')
      ) {
        sources.add(rel)
      }
    }
  }
  for (const entry of siteConfig.docPaths as string[]) {
    if (entry.endsWith('.md')) sources.add(entry)
    else await addTree(entry) // a bare directory: sweep it recursively
  }

  const broken: string[] = []
  for (const rel of sources) {
    let text: string
    try {
      text = await Bun.file(path.resolve(PROJECT_ROOT, rel)).text()
    } catch {
      continue
    }
    for (const match of text.matchAll(/\]\(\/([A-Za-z0-9._-]+)\/\)/g)) {
      const slug = match[1]
      if (!slugs.has(slug)) broken.push(`${rel} → /${slug}/`)
    }
  }
  if (broken.length > 0) {
    console.error('BROKEN INTERNAL LINKS (these 404 on the deployed site):')
    for (const b of broken) console.error(`  ${b}`)
    console.error(
      `  known slugs: ${[...slugs].sort().join(', ')}\n` +
        '  NB slugs are case-SENSITIVE on GitHub Pages but not on APFS, so a ' +
        'case error looks fine locally.'
    )
    throw new Error(`${broken.length} broken internal link(s)`)
  }
  console.log(`internal links: ${slugs.size} slugs, no 404s`)
}

const rebuild = async () => {
  if (!(await buildSite(config))) throw new Error('site build failed')
  await buildDocsBundle()
  // the watcher's rm -rf dist deletes tracked artifacts it will not rebuild
  await restoreCommittedDist()
}

const ok = await buildSite(config)
if (!ok) process.exit(1)

await checkInternalLinks()

// DEV SERVES FAST. The publishing gates — the unit suite and the tjs
// debug/safe pair — run for --build and --test only. The watch rebuild has
// always skipped them "for speed"; the first run simply never did.
await buildLibrary(
  process.argv.includes('--build') || process.argv.includes('--test')
)
await buildDocsBundle()

if (buildOnly) process.exit(0)

// --test drives the doc `test` fences through a real browser (haltija) and
// exits on a real pass/fail code — the lane for behaviors happy-dom can't
// observe (composed-event retargeting, real <template> cloning).
const testMode = process.argv.includes('--test')

await devServer(config, { build: rebuild, test: testMode })
