import { defineConfig, devices } from '@playwright/test'

/*
 * Real-browser regression lane. The tosijs doc corpus contains inline ```test
 * fences that exercise behaviors happy-dom cannot: composed-event retargeting
 * across shadow roots, spec-correct <template> cloning, and getComputedStyle
 * resolving derived CSS custom properties (dynamic theming). The doc-browser's
 * background runner already executes every page-with-tests in hidden iframes
 * and resolves window.__docTestResults with the totals — so ONE navigation
 * (tests/doc-tests.pw.ts) gates the whole corpus through a real engine.
 *
 * This mirrors tosijs-ui's proven e2e lane (which replaced a fragile
 * haltija-Electron lane that couldn't run in CI). Playwright starts its own
 * dev server on a dedicated port, so it never collides with a `bun start`.
 */
const E2E_PORT = Number(process.env.E2E_PORT || 8799)
const E2E_BASE_URL = `https://localhost:${E2E_PORT}`

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.pw\.ts/, // .pw.ts = playwright (vs .test.ts = bun)
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: E2E_BASE_URL,
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true, // dev server's self-signed cert
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'bun start',
    env: {
      // the browser lane runs `bun start`, whose WATCHER deletes tracked
      // dist/ artifacts on every rebuild (tosijs-ui#130). No watching needed
      // for a test run.
      DEV_NO_WATCH: '1',
      PORT: String(E2E_PORT),
      HALTIJA_DEV: '0', // no haltija overlay during the Playwright run
      DEV_SKIP_PREFLIGHT: '1', // the machine-health guard would flake CI
    },
    url: E2E_BASE_URL,
    reuseExistingServer: false,
    ignoreHTTPSErrors: true,
    timeout: 180_000, // first start does the full doc build (tjs convert)
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
