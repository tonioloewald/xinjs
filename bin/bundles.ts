/**
 * THE PUBLISHED ARTIFACTS, DECLARED ONCE — and in a module with NO SIDE
 * EFFECTS, so it can be imported by the build, by tests, and by any future
 * tooling without running a build or starting a dev server.
 *
 * (`bin/site.ts` executes on import — it starts the dev server — so anything
 * that needs to *reason* about the artifacts cannot import it. That is why
 * `entries.test.ts` used to assert on the build script's SOURCE TEXT, which
 * passed happily if the budget loop were deleted and only the log strings
 * survived.)
 */
/*
 * ⚠️ THESE ARE BUN-ZLIB FIGURES. The gate runs under Bun, whose `node:zlib`
 * compresses differently from Node's: a byte-identical `dist/index.js` gzips
 * to ~29.0 kB under Bun and ~28.7 kB under Node — a ~1% swing, which is the
 * same order as the headroom the gate polices. So `gzip`, `node -e`, or a
 * bundle-size tool will disagree with these numbers by about a percent, and a
 * reviewer checking them the obvious way can conclude the budgets were raised
 * against a measurement that does not reproduce. Compare like with like.
 */
export type BundleProbe = 'load' | 'import' | 'require'
export type BundleStage = 'main' | 'alt' | 'tjs'

export interface BundleSpec {
  /** output filename in dist/ */
  naming: string
  format: 'iife' | 'esm' | 'cjs'
  entry: string
  /** gzipped ceiling in bytes — a DECISION, not a measurement */
  budget: number
  /** how the artifact is EXECUTED by the smoke gate */
  probe: BundleProbe
  /** build ordering: tjs entries need `tjs convert` to have run first */
  stage: BundleStage
  /**
   * Emit a source map? Default true.
   *
   * `false` for a bundle whose map is excluded from `files`: building the map
   * and then not shipping it leaves a `//# sourceMappingURL=` pointing at a
   * 404 in the published artifact, which is worse than having no map — a
   * devtools that finds the comment goes looking. The two are one decision and
   * belong in one place.
   */
  sourcemap?: boolean
}

/*
 * BUDGETS RAISED 2026-09-02, deliberately, in the commit that caused the
 * growth — the gate's own instruction. Every bundle grew 215–610 gz bytes
 * fixing the 1.8.3 pre-release review, and THREE were within 100 bytes of
 * their ceiling (index.js was 35 OVER). Raised to the ~1 kB headroom this file
 * already specifies, rather than nudged past the measurement: a gate that
 * passes by a hair fails next week on something unrelated and teaches whoever
 * hits it to raise the number without reading it. (1.8.1 shipped one that
 * passed by SEVEN bytes; that is the mistake not being repeated.)
 *
 * What the bytes bought:
 *   M1  `bind` accumulates instead of clobbering — a container can be
 *       list-bound AND carry its own binding. Was silent data loss: one order
 *       dropped the caller's binding, the other destroyed the entire list.
 *   M2  create() stops emitting a deprecated key for `div(proxy)`, the most
 *       idiomatic call form in the library.
 *   M3  deprecation messages became whole sentences, because two of them told
 *       users to write props keys that do not exist and one shipped a
 *       permanently disabled button.
 *   B1  describe() redacts secrets by PATH (agent-carrying bundles only —
 *       index.js and core.js omit the agent surface, state.js is DOM-free).
 */
export const BUNDLES: BundleSpec[] = [
  {
    naming: 'index.js',
    format: 'iife',
    // the IIFE cannot tree-shake, so it gets the slim entry (no agent
    // surface); ESM/CJS carry everything and consumers shake what they skip
    entry: './src/index-browser.ts',
    budget: 30_000,
    probe: 'load',
    stage: 'main',
  },
  {
    naming: 'module.js',
    format: 'esm',
    entry: './src/index.ts',
    // 43_000 -> 43_500 in 1.11.0, deliberately. The agent surface's
    // path-or-proxy resolution and its refusal text cost ~100 bytes gzipped
    // over the old ceiling; almost all of it is the error strings, which is
    // the growth we want (the defect being fixed was a SILENT coercion). The
    // headroom matches main.js so the two budgets stop drifting apart.
    //
    // 43_500 -> 45_000 in 1.10.1: the element factory now renders values that
    // used to vanish (Date, bigint, boolean, anything with its own toString),
    // accepts a Map as a props bag, and WARNS on an unspread array or a value
    // that is neither — +264 gz. Most of it is the two warning strings, which
    // are the point: they convert three silent no-ops into a named mistake.
    budget: 45_000,
    probe: 'import',
    stage: 'main',
  },
  {
    naming: 'main.js',
    format: 'cjs',
    entry: './src/index.ts',
    // 43_500 -> 44_500. THE TWO CEILINGS ARE DELIBERATELY NOT EQUAL: the CJS
    // artifact runs ~290 gz bytes over the ESM one (271 B at v1.9.2, 287 B
    // now), so copying module.js's number here — which is what the previous
    // comment reasoned itself into — cannot give equal headroom, and left
    // main.js with SEVENTEEN bytes. That is the hair-trigger this file
    // forbids twice: the next ~20 bytes anywhere in the library would have
    // broken `bun start` for every developer (the budget loop is not gated
    // on `full`), and the fix a stranger reaches for is raising the number
    // without reading it. Budget per bundle from its own measurement.
    budget: 46_000,
    probe: 'require',
    stage: 'main',
  },
  // the alternate entries: tosijs/core (slim — no blueprint machinery, no
  // share/sync/hotReload) and tosijs/state (DOM-free state layer, tosijs#18)
  {
    naming: 'core.js',
    format: 'esm',
    entry: './src/index-core.ts',
    budget: 27_500,
    probe: 'import',
    stage: 'alt',
  },
  {
    naming: 'state.js',
    format: 'esm',
    entry: './src/index-state.ts',
    budget: 17_500,
    probe: 'import',
    stage: 'alt',
  },
  // EXPERIMENTAL tjs-built entries (tosijs/debug, tosijs/safe). They ship
  // complete per-function __tjs metadata, hence the ~12 kB over module.js —
  // that overhead is the POINT, so the budget is generous; it exists to
  // catch it doubling. They were published with no gate at all until the
  // 1.8.0 security pass (SEC-15): the two bundles built by the least-trusted
  // toolchain were the two nobody executed.
  //
  // RAISED 56_000 -> 58_000 on 2026-08-26, deliberately, in the commit that
  // caused the growth. tjs-lang 0.13.6 restores `new` on locally-declared
  // classes (tjs-lang#37) and moves the transform to the graduation step;
  // that put module.debug.js at 55_993 against the old 56_000 — a pass with
  // SEVEN BYTES of headroom, which is a gate that will fail on the next
  // unrelated edit and teach whoever hits it to raise the number without
  // reading. The growth buys output that does not throw on import, so it is
  // worth it. Unlike the shipped-to-consumers bundles, these two are
  // EXPERIMENTAL and inert, so the number polices toolchain regressions, not
  // a promise to anyone: ~2 kB of room is the right slack for that job.
  //
  // RAISED 58_000 -> 59_500 in 1.9.0, deliberately and in the same commit the
  // growth landed, exactly as the gate's message asks. The growth is the
  // agent surface's content guard, the subtree binding walk and the tagged
  // refusals — security code, on the opt-in surface, which these two bundles
  // carry in full because they are whole-library builds. It went over by 30
  // BYTES, and only under Bun's gzip; Node's measures the same artifact
  // under. The slack is restored rather than shaved to the new number, so the
  // gate keeps policing regressions instead of tripping on noise.
  // RAISED 59_500 -> 61_500 in 1.10.1, deliberately and in this commit. The
  // element-creator dispatch adds ~730 gz to each of these (they are whole-
  // library builds carrying full __tjs metadata), which put module.debug.js
  // 18 BYTES OVER and left module.safe.js with 36 — precisely the hair-trigger
  // this file forbids twice, and which a pre-release review flagged. Restored
  // to the ~2 kB slack that is right for a gate policing TOOLCHAIN
  // regressions on two EXPERIMENTAL, inert bundles, rather than shaved to the
  // new measurement.
  {
    naming: 'module.debug.js',
    format: 'esm',
    entry: './tjs-out/index-debug.js',
    budget: 61_500,
    probe: 'import',
    stage: 'tjs',
    // map excluded from `files` (1.64 MB for inert bundles) — so don't emit
    // one, or the shipped artifact ends with a sourceMappingURL that 404s
    sourcemap: false,
  },
  {
    naming: 'module.safe.js',
    format: 'esm',
    entry: './tjs-out/index-safe.js',
    budget: 61_500,
    probe: 'import',
    stage: 'tjs',
    // map excluded from `files` (1.64 MB for inert bundles) — so don't emit
    // one, or the shipped artifact ends with a sourceMappingURL that 404s
    sourcemap: false,
  },
]

/**
 * A FINGERPRINT OF EVERYTHING THAT DETERMINES `dist/`.
 *
 * `prepublishOnly` could prove the artifacts EXIST and are TRACKED, and not
 * that they were built from the source being published. That gap is reachable:
 * a dev run wipes `dist/`, `restoreCommittedDist()` puts the COMMITTED copies
 * back, and those satisfy existence and tracking while being older than the
 * source. `release-doctor` catches it — but release-doctor is not run by
 * `npm publish`, so the only freshness check was one a human had to remember,
 * which is exactly the kind this repo has already been bitten by three times.
 *
 * Defined HERE, in the side-effect-free module both the build and the publish
 * hook already import, so the two cannot compute it differently. That is the
 * failure this file's own header warns about, and the one that produced three
 * review rounds this week.
 */
export async function sourceFingerprint(root = process.cwd()): Promise<string> {
  const { readdirSync, readFileSync, existsSync } = await import('node:fs')
  const { join, relative } = await import('node:path')
  const { createHash } = await import('node:crypto')

  const files: string[] = []
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
      a.name < b.name ? -1 : 1
    )) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else if (
        entry.name.endsWith('.ts') &&
        !entry.name.endsWith('.test.ts') &&
        !entry.name.endsWith('.d.ts')
      ) {
        files.push(full)
      }
    }
  }
  walk(join(root, 'src'))
  // the build inputs that are not in src/: the bundle manifest and the build
  // entry both change what lands in dist/, and the version is stamped into it
  for (const extra of ['bin/bundles.ts', 'bin/site.ts']) {
    const p = join(root, extra)
    if (existsSync(p)) files.push(p)
  }

  const hash = createHash('sha256')
  for (const f of files) {
    hash.update(relative(root, f))
    hash.update(readFileSync(f))
  }
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  hash.update(String(pkg.version))
  return hash.digest('hex')
}

/** where the build records it, and the publish hook reads it */
export const FINGERPRINT_PATH = 'dist/.build-fingerprint'
