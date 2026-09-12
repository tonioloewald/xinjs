import { test, expect } from '@playwright/test'

/*
 * The inline ```test fences across the tosijs docs are the real-browser
 * regression coverage for behaviors happy-dom can't exercise (composed-event
 * retargeting, spec-correct <template> cloning, getComputedStyle-resolved
 * derived CSS vars). The doc-browser's background runner iframes every
 * page-with-tests on localhost and resolves window.__docTestResults with the
 * totals; we await it and assert nothing failed. One navigation gates the
 * whole corpus. (Mirrors tosijs-ui/tests/doc-tests.pw.ts.)
 */
interface PageResult {
  passed: boolean
  totalPassed: number
  totalFailed: number
  tests: { name: string; passed: boolean; error?: string }[]
}
interface DocTestResults {
  passed: number
  failed: number
  pages: Record<string, PageResult>
}

test('every inline doc test passes (the whole ```test tier)', async ({
  page,
  browserName,
}) => {
  // WebKit: the iframe runner never posts per-page completion, so pages wait
  // out the 30s per-page timeout (chromium+firefox run them all green). We
  // don't enable a webkit project, but skip defensively if one is added.
  test.skip(
    browserName === 'webkit',
    'WebKit: iframe test-runner does not signal per-page completion'
  )
  test.setTimeout(180_000)

  await page.goto('/')
  const results = (await page.evaluate(
    () => (window as any).__docTestResults as Promise<DocTestResults>
  )) as DocTestResults

  const ran = results.passed + results.failed
  expect(
    ran,
    'no inline doc tests ran — the runner never started'
  ).toBeGreaterThan(0)

  // `ran > 0` alone is not a gate: drop a page from docPaths, or mistype one
  // fence language tag, and the corpus silently shrinks while both CI lanes
  // stay green. These pages carry the ONLY real-browser coverage of the agent
  // surface, so each must contribute at least one passing test by name, and
  // the total is pinned so a loss anywhere has to be acknowledged deliberately.
  // matched as substrings: markdown pages key by filename, but a doc block
  // inside a source file keys by its own slug, and pinning the exact form
  // would just be a second thing to keep in sync
  const REQUIRED_PAGES = [
    'agent-surface',
    'one-user-interface',
    'derived-surface',
    'bind',
  ]
  const pageKeys = Object.keys(results.pages)
  for (const page of REQUIRED_PAGES) {
    expect(
      pageKeys.some((key) => key.includes(page)),
      `no inline doc tests ran for "${page}" (saw: ${pageKeys.join(', ')}) — ` +
        'was it dropped from docPaths, or did a fence language tag get mistyped?'
    ).toBe(true)
  }

  const MINIMUM_CORPUS = 17
  expect(
    ran,
    `the inline doc-test corpus shrank to ${ran} (expected at least ` +
      `${MINIMUM_CORPUS}). If that is deliberate, lower MINIMUM_CORPUS in the ` +
      'same commit; otherwise a page or a fence went missing.'
  ).toBeGreaterThanOrEqual(MINIMUM_CORPUS)

  if (results.failed > 0) {
    const detail = Object.entries(results.pages)
      .filter(([, p]) => !p.passed)
      .map(([file, p]) => {
        const failed = p.tests
          .filter((t) => !t.passed)
          .map((t) => `    ✗ ${t.name}${t.error ? ` — ${t.error}` : ''}`)
          .join('\n')
        return `  ${file} (${p.totalFailed} failed):\n${failed}`
      })
      .join('\n')
    throw new Error(`${results.failed} inline doc test(s) failed:\n${detail}`)
  }
})

test('no live example on any doc page renders an error', async ({
  page,
  browserName,
}) => {
  /*
   * A ```js fence in a doc block becomes a LIVE EXAMPLE — the doc site runs it
   * eagerly on connect. One that references identifiers it never imports
   * throws, and the page ships a red box under the prose it was meant to
   * illustrate.
   *
   * That happened in 1.11.0: a snippet added to `observe()`'s docs, arguing
   * that `bind` is the better-engineered path, rendered "div is not defined"
   * directly beneath the argument. It cleared the build, the unit suite, the
   * smoke gate and NINE review rounds — because nothing in this project ever
   * EXECUTED a live example.
   *
   * THE MECHANISM ALREADY EXISTS — only the reporting is missing. The doc-site
   * build runs every example on page load (that is the free smoke test), and
   * `live-example/execution.ts` catches a throw and appends `.preview-error`.
   * What it does NOT do is feed that into `window.__docTestResults`, whose
   * passed/failed counts come from the ```test tier alone. So a page can ship a
   * red error box with the doc-test lane green. Filed upstream as
   * tosijs-ui#161; when it lands, this test can be deleted in favour of the
   * host build reporting it for every consumer.
   *
   * A static check was tried first and abandoned: distinguishing a free
   * identifier from a method call, a method definition, a destructured element
   * creator and an ambient from the example context is a growing pile of
   * special cases, and it fired on correct pages. A gate that fails on correct
   * code teaches people to delete it. Execution answers the question exactly
   * and needs no heuristics — the page either errors or it does not.
   */
  test.skip(browserName === 'webkit', 'WebKit: iframe runner does not signal')
  test.setTimeout(180_000)

  // SLUGS FROM THE BUILT DIRECTORIES, which is what the site actually serves.
  // Two earlier cuts were vacuous: the first visited only '/', and the second
  // derived slugs from docs.json — where a source-derived page has
  // path='src/path-listener.ts', so it visited '/path-listener.ts/' and got a
  // 404 with no examples on it. Fifth version; every previous one passed
  // against the very defect it was written for, and only mutation-verification
  // said so.
  const { readdirSync, existsSync: exists } = await import('node:fs')
  const slugs = readdirSync('docs', { withFileTypes: true })
    .filter((d) => d.isDirectory() && exists(`docs/${d.name}/index.html`))
    .map((d) => d.name)
  expect(slugs.length, 'no built doc pages found to visit').toBeGreaterThan(10)

  const failures: string[] = []
  for (const slug of slugs) {
    await page.goto(`/${slug}/`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(600)
    const errs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.preview-error')).map((el) =>
        (el.textContent || '').trim().slice(0, 120)
      )
    )
    for (const e of errs) failures.push(`/${slug}/ → ${e}`)
  }
  expect(failures, `live example(s) threw:\n${failures.join('\n')}`).toEqual([])
})
