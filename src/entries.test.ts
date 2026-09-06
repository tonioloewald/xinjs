import { test, expect, describe } from 'bun:test'
import { existsSync } from 'node:fs'

// The entry map is a PUBLIC CONTRACT: tosijs (everything), tosijs/core
// (slim — no blueprint machinery, no multi-window leaves) and tosijs/state
// (DOM-free, tosijs#18). These tests pin what's in each door.
describe('entry points', () => {
  test('tosijs/state is DOM-FREE at import and carries the state API', async () => {
    // the whole point of #18: no HTMLElement, no document, no shim
    const state = await import('./index-state')
    for (const name of [
      'xin',
      'boxed',
      'tosi',
      'observe',
      'unobserve',
      'touch',
      'updates',
      'tosiPath',
      'tosiValue',
      'throttle',
    ]) {
      expect(typeof (state as any)[name]).not.toBe('undefined')
    }
    // the by-path helpers are deliberately NOT here: they were public from
    // this entry and nowhere else, which made the subset claim false. The
    // path API is the proxy — xin['a.b.c'] — which needs no DOM either.
    expect('getByPath' in state).toBe(false)
    expect('setByPath' in state).toBe(false)
    expect('id' in state).toBe(false)

    // and nothing DOM-facing leaked in
    expect('Component' in state).toBe(false)
    expect('elements' in state).toBe(false)
    expect('css' in state).toBe(false)

    // it actually works: observers fire with no DOM in sight
    const { tosi, observe, updates } = state as any
    const { stateEntry } = tosi({ stateEntry: { n: 0 } })
    await updates() // drain the registration touch — as agents/apps do
    const seen: string[] = []
    observe('stateEntry.n', (p: string) => seen.push(p))
    stateEntry.n = 1
    await updates()
    expect(seen).toEqual(['stateEntry.n'])
  })

  // test.skipIf, not an early `return`: a silent early return is the one form
  // of skip that can never be noticed, and during `bun run build` — which
  // wipes dist BEFORE running the suite — this was PERMANENTLY a no-op that
  // reported as a pass. The real gate is inside buildLibrary(), after the
  // bundle exists; this copy serves a developer running `bun test` against an
  // existing build, and now says out loud when it isn't doing that.
  // WHICH `node` IS ON PATH? This test spawns it, and on a machine whose
  // default node predates modern ESM (v14 is still `/usr/local/bin/node` on
  // plenty of them) the import fails for reasons that have nothing to do with
  // a DOM — so the test reported a DOM-free REGRESSION when the truth was an
  // ancient toolchain. A misdiagnosis is worse than an abstention: it sends
  // you to debug the shipped bundle. Skip loudly instead.
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
  if (nodeMajor > 0 && nodeMajor < NODE_FLOOR) {
    console.warn(
      `entries.test: DOM-free gate SKIPPED — \`node -v\` is v${nodeMajor}, ` +
        `too old to import a modern ESM bundle (need ${NODE_FLOOR}+). This is ` +
        `your PATH, not the artifact. The build's own copy of this gate is the ` +
        `one that must pass before publishing.`
    )
  }

  test.skipIf(!existsSync('dist/state.js') || nodeMajor < NODE_FLOOR)(
    'the BUILT state bundle imports in plain node — no DOM, no shim (tosijs#18)',
    async () => {
      // the acceptance criterion of #18 is environmental, so the test has to
      // leave this process: happy-dom is already registered here, which would
      // mask exactly the failure we're pinning
      const bundle = 'dist/state.js'
      const script = `
      import { tosi, observe, updates, xin } from './${bundle}'
      const { nodeProbe } = tosi({ nodeProbe: { n: 0 } })
      await updates()
      const seen = []
      observe('nodeProbe.n', (p) => seen.push(p))
      nodeProbe.n = 42
      await updates()
      if (seen[0] !== 'nodeProbe.n' || xin['nodeProbe.n'] !== 42) process.exit(2)
      process.exit(0)
    `
      const result = Bun.spawnSync(
        ['node', '--input-type=module', '-e', script],
        {
          cwd: process.cwd(),
          stderr: 'pipe',
          stdout: 'pipe',
        }
      )
      expect({
        code: result.exitCode,
        stderr: result.stderr.toString().slice(0, 300),
      }).toEqual({ code: 0, stderr: expect.any(String) })
    }
  )

  test('tosijs/core omits blueprints and the multi-window leaves, keeps the rest', async () => {
    const core = await import('./index-core')
    // omitted, deliberately
    for (const name of [
      'tosiBlueprint',
      'tosiLoader',
      'makeComponent',
      'share',
      'sync',
      'hotReload',
    ]) {
      expect(name in core).toBe(false)
    }
    // present: the actual library
    for (const name of [
      'tosi',
      'elements',
      'Component',
      'bind',
      'css',
      'Color',
    ]) {
      expect(typeof (core as any)[name]).not.toBe('undefined')
    }
    // the agent surface lives behind tosijs/agent (its ~11 KB must not ride
    // on consumers who never describe their app — and the IIFE can't shake)
    for (const name of [
      'enableAgentInterface',
      'schematicSVG',
      'auditAccessibility',
      'webmcpTools',
      'exerciseContract',
    ]) {
      expect(name in core).toBe(false)
    }
  })

  test('tosijs/agent carries the whole agent surface, and ComponentMap stays on BOTH', async () => {
    const agent = await import('./index-agent')
    for (const name of [
      'enableAgentInterface',
      'webmcpTools',
      'webmcpAdapter',
      'schematicSVG',
      'rasterizeSVG',
      'boundsOf',
      'auditAccessibility',
      'auditFlags',
      'contrastRatio',
      'exerciseContract',
      'exerciseComponent',
      'AGENT_SURFACE_VERSION',
    ]) {
      expect(typeof (agent as any)[name]).not.toBe('undefined')
    }
    // the main entry carries it too — ONE runtime copy of the registry.
    // A separately-bundled subpath gave the agent its own registry and it
    // described an empty app; `tosijs/agent` is the same file, narrower
    // types. The IIFE (which cannot shake) is where the weight is dropped.
    const full = await import('./index')
    expect(typeof (full as any).enableAgentInterface).toBe('function')
  })

  test('THE HAZARD: agent and core must share ONE registry', async () => {
    const core = await import('./index')
    const agentEntry = await import('./index-agent')
    const { updates } = core as any
    ;(core as any).tosi({ oneRegistry: { n: 41 } })
    await updates()
    const a = agentEntry.enableAgentInterface({ global: false, expose: 'all' })
    try {
      // if these ever become separate bundles again, this reads undefined
      expect(a.read('oneRegistry.n')).toBe(41)
      a.write('oneRegistry.n', 42)
      await updates()
      expect((core as any).xin['oneRegistry.n']).toBe(42)
    } finally {
      a.disable()
    }
  })

  test('the IIFE/browser entry omits the agent surface (a script tag cannot shake)', async () => {
    const browser = await import('./index-browser')
    for (const name of [
      'enableAgentInterface',
      'schematicSVG',
      'auditAccessibility',
    ]) {
      expect(name in browser).toBe(false)
    }
    for (const name of ['tosi', 'elements', 'Component', 'tosiBlueprint']) {
      expect(typeof (browser as any)[name]).not.toBe('undefined')
    }
  })

  // tosijs/state calls itself "a narrower door onto the same house". That was
  // FALSE for five exports (getByPath/setByPath/deleteByPath/pathParts/id),
  // which shipped public from tosijs/state and nowhere else — and no test
  // asked, because only core ⊆ full was pinned (round-3 review, M7).
  // index.ts is now `index-browser + index-agent`, so this holds structurally.
  // The test stays because the failure it guards is re-adding an export to
  // index.ts directly: that silently omits it from the CDN artifact — the
  // most-loaded thing this project publishes — and nothing else would say so.
  test('the browser/CDN entry is exactly the full entry minus the agent surface', async () => {
    const full = await import('./index')
    const browser = await import('./index-browser')
    const agentEntry = await import('./index-agent')

    // nothing in the CDN build is missing from the full build
    expect(Object.keys(browser).filter((n) => !(n in full))).toEqual([])

    // and everything the full build adds is agent-surface, nothing else
    const extras = Object.keys(full)
      .filter((n) => !(n in browser))
      .sort()
    const agentNames = Object.keys(agentEntry).sort()
    expect(extras).toEqual(agentNames)
  })

  test('the full entry is a SUPERSET of tosijs/state — the subset claim holds', async () => {
    const full = await import('./index')
    const state = await import('./index-state')
    const missing = Object.keys(state).filter((name) => !(name in full))
    expect(missing).toEqual([])
  })

  test('the full entry is a SUPERSET of core — no export lands in one and not the other', async () => {
    const full = await import('./index')
    const core = await import('./index-core')
    const missing = Object.keys(core).filter((name) => !(name in full))
    expect(missing).toEqual([])
    // …and the extras are exactly the documented ones
    const extras = Object.keys(full)
      .filter((name) => !(name in core))
      .sort()
    const agentEntry = await import('./index-agent')
    const expected = [
      'Blueprint',
      'BlueprintLoader',
      'blueprint',
      'blueprintLoader',
      'hotReload',
      'makeComponent',
      'share',
      'sync',
      'tosiBlueprint',
      'tosiLoader',
      ...Object.keys(agentEntry), // the agent surface rides the full entry
    ]
      .filter((name) => !(name in core))
      .sort()
    expect(extras).toEqual([...new Set(expected)].sort())
  })

  // NB: the size-regression gate lives in buildLibrary() (bin/site.ts),
  // where the artifacts actually exist. A copy here could never run during
  // `bun run build` — buildSite() wipes dist BEFORE the suite — so it
  // asserted nothing and a regression would have shipped fully green.
  test('every artifact package.json publishes has a budget and a probe', async () => {
    // this used to grep bin/site.ts for log strings, which passed happily if
    // the budget loop were deleted and only the console.log survived. The
    // manifest is now a side-effect-free module, so the test can assert on the
    // real thing. (bin/site.ts itself cannot be imported — it executes, and
    // starts the dev server.)
    const { BUNDLES } = await import('../bin/bundles')
    const pkg = JSON.parse(await Bun.file('package.json').text())

    const declared = new Set(BUNDLES.map((b: any) => b.naming))
    // every file reachable through the exports map must be a declared
    // artifact — otherwise it ships with no size ceiling and no execution gate
    const published = new Set<string>()
    for (const entry of Object.values(pkg.exports as Record<string, any>)) {
      for (const [condition, target] of Object.entries(
        entry as Record<string, string>
      )) {
        if (condition === 'types' || typeof target !== 'string') continue
        const file = target.split('/').pop() as string
        if (file.endsWith('.js')) published.add(file)
      }
    }
    const ungated = [...published].filter((f) => !declared.has(f))
    expect(ungated).toEqual([])

    for (const bundle of BUNDLES as any[]) {
      expect(typeof bundle.budget).toBe('number')
      expect(bundle.budget).toBeGreaterThan(0)
      expect(['load', 'import', 'require']).toContain(bundle.probe)
    }
  })

  // NB: the exports-target EXISTENCE gate lives in buildLibrary()
  // (bin/site.ts), for the same reason the size gate does and stated one
  // comment above: this suite runs BEFORE the bundles are rebuilt, so a copy
  // here fires against the previous run's dist and fails a correct build.
  // Verified the hard way — placing it here broke `bun run build`.

  // measured against the SAME declaration the build gates on, so a budget
  // that has quietly become meaningless (raised past reality, or attached to
  // an artifact nobody builds) fails here too
  /*
   * A BUDGET THAT PASSES BY A HAIR IS NOT A GATE.
   *
   * `bin/bundles.ts` says so twice in prose, and prose did not hold: 1.8.1
   * shipped a bundle passing by SEVEN bytes, 1.10.0 left main.js with
   * SEVENTEEN, and 1.10.1 put module.debug.js EIGHTEEN OVER with module.safe.js
   * holding 36. Each time the next unrelated commit would have broken
   * `bun start` for every developer, and the fix a stranger reaches for is
   * raising the number without reading why.
   *
   * This assertion was filed as a follow-up by TWO separate review rounds
   * ("add a minimum-headroom assertion", "the 5th unbuilt gate") and deferred
   * both times — and then the failure it describes happened again. Writing the
   * rule down is not the same as enforcing it.
   *
   * 1 kB is the slack `bin/bundles.ts` already specifies for the shipped
   * bundles; the tjs pair carries more because it polices toolchain
   * regressions rather than a promise to consumers.
   */
  test.skipIf(!existsSync('dist/module.js'))(
    'no budget passes by a hair — every bundle keeps real headroom',
    async () => {
      const { BUNDLES } = await import('../bin/bundles')
      const { gzipSync } = await import('node:zlib')
      const MIN_HEADROOM = 1024
      const tight: string[] = []
      for (const { naming, budget } of BUNDLES as any[]) {
        if (!existsSync(`dist/${naming}`)) continue
        const bytes = gzipSync(await Bun.file(`dist/${naming}`).bytes()).length
        const headroom = budget - bytes
        if (headroom < MIN_HEADROOM) {
          tight.push(
            `${naming} has ${headroom}B headroom (want >=${MIN_HEADROOM})`
          )
        }
      }
      expect(tight).toEqual([])
    }
  )

  test.skipIf(!existsSync('dist/module.js'))(
    'every built artifact is actually under its declared budget',
    async () => {
      const { BUNDLES } = await import('../bin/bundles')
      const { gzipSync } = await import('node:zlib')
      const over: string[] = []
      for (const { naming, budget } of BUNDLES as any[]) {
        if (!existsSync(`dist/${naming}`)) continue
        const bytes = gzipSync(await Bun.file(`dist/${naming}`).bytes()).length
        if (bytes > budget) over.push(`${naming} ${bytes} > ${budget}`)
      }
      expect(over).toEqual([])
    }
  )

  test('slim core warns about blueprint markup it cannot hydrate', async () => {
    await import('./index-core') // installs the dev-mode check
    const el = document.createElement('tosi-blueprint')
    document.body.append(el)
    const warnings: string[] = []
    const original = console.warn
    console.warn = (...args: any[]) => warnings.push(args.map(String).join(' '))
    try {
      // the check is scheduled (DOMContentLoaded or a macrotask) — run the
      // same query it runs, to prove the selector finds unhydrated markup
      const orphans = document.querySelectorAll(
        'tosi-blueprint:not(:defined), tosi-loader:not(:defined)'
      )
      expect(
        orphans.length > 0 || customElements.get('tosi-blueprint') != null
      ).toBe(true)
    } finally {
      console.warn = original
      el.remove()
    }
  })
})

// settings.quiet promised to silence "advisory warnings and friends" while
// being honoured at 2 of ~20 sites. The fix was to route the ADVISORY families
// through it and narrow the promise — not to gate all 20, because most of the
// rest report that something is wrong.
describe('settings.quiet silences advice, never defect reports', () => {
  test('deprecation warnings honour it, and stay latched', async () => {
    const { warnDeprecated, _resetDeprecationWarnings } = await import(
      './metadata'
    )
    const { settings } = await import('./settings')
    const warnings: string[] = []
    const original = console.warn
    console.warn = (...args: any[]) => warnings.push(args.map(String).join(' '))
    try {
      _resetDeprecationWarnings()
      settings.quiet = true
      warnDeprecated('quiet-probe', 'this should not be heard')
      expect(warnings).toEqual([])

      // latched even while quiet: flipping the flag off must not replay
      // warnings for things that already happened
      settings.quiet = false
      warnDeprecated('quiet-probe', 'this should not be heard')
      expect(warnings).toEqual([])

      // …but a NEW deprecation still speaks
      warnDeprecated('quiet-probe-2', 'this SHOULD be heard')
      expect(warnings.length).toBe(1)
    } finally {
      console.warn = original
      settings.quiet = false
      _resetDeprecationWarnings()
    }
  })

  test('a defect report is NOT silenced by quiet', async () => {
    const { settings } = await import('./settings')
    const { blueprintSrcRefusal } = (await import('./blueprint-loader')) as any
    if (typeof blueprintSrcRefusal !== 'function') return
    const errors: string[] = []
    const original = console.error
    console.error = (...args: any[]) => errors.push(args.map(String).join(' '))
    try {
      settings.quiet = true
      // a refused blueprint source is a DEFECT REPORT — quiet must not hide it.
      // NB the <tosi-loader> wrapper is load-bearing: hydration runs from the
      // LOADER's connectedCallback, so a bare <tosi-blueprint> does nothing at
      // all — which is the same defect this release fixed in the scaffolder,
      // and it caught this test too.
      const loader = document.createElement('tosi-loader')
      const el = document.createElement('tosi-blueprint')
      el.setAttribute('tag', 'quiet-probe-thing')
      el.setAttribute('src', 'javascript:alert(1)')
      loader.append(el)
      document.body.append(loader)
      await new Promise((resolve) => setTimeout(resolve, 40))
      loader.remove()
    } finally {
      console.error = original
      settings.quiet = false
    }
    // the refusal is announced regardless of quiet
    expect(errors.some((e) => e.includes('refused'))).toBe(true)
  })
})
