import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { join } from 'path'

/*
 * bindList virtual `minHeight` mode, scrolled in a real engine (board #3302, #3230).
 *
 * A lane like virta's: cards of 90-210px (taller than minHeight, as on a phone),
 * `virtual: { height: 120, minHeight }`, 320x700. The lane is scrolled in small steps
 * and, after each step settles, one card that was built before and after is followed.
 * A list that is stable moves that card up by exactly the scroll distance, so:
 *
 * - motion: total on-screen movement / total scroll. 1 means content tracks the finger.
 * - jump: how far a card lands from where the scroll put it, in one step. A jump is a
 *   card being re-laid-out under the reader.
 *
 * Also checked: the lane reaches its last card at the bottom and its first card at the
 * top, since absorbing an estimate error must not leave content unreachable.
 *
 * Measured 2026-10-14 on tosijs-ui's copy of tosijs (WebKit, 4px steps), before any fix:
 *   minHeight 76:  motion 2.67 / 2.20 / 2.05 (25 / 60 / 200 cards), worst jump 117-128px
 *   minHeight 150: motion 1.05 / 1.05 / 1.02, worst jump 76-120px
 * Targets from #3302: motion within 1.1, no step over 8px. Run it in WebKit: iOS is the
 * reported failure (playwright.config.ts has a webkit project for these specs).
 *
 * Chromium fails differently at minHeight 76: the last card is never reached. That is
 * Chromium's scroll anchoring (`overflow-anchor: auto`; WebKit has none) moving scrollTop
 * when the top spacer changes. Measured: with `overflow-anchor: none` on the lane,
 * Chromium's numbers match WebKit's to the pixel. A list that anchors itself (#3302 item 1)
 * should turn the browser's anchoring off, or the two will fight.
 *
 * Runtime: about 4 minutes for both engines with 4 workers; WebKit's 200-card cases are
 * most of it.
 *
 * Self-contained: the page and dist/module.js are served by page.route, so no dev server.
 */

const moduleSource = readFileSync(
  join(__dirname, '..', 'dist', 'module.js'),
  'utf-8'
)
const ORIGIN = 'https://virtual-list.test'
// A slice changes once per row whatever the step, so a 16px step sees every rebuild;
// 4px (the original measurement) took minutes per case.
const STEP = 16

const page_ = (
  n: number,
  minHeight: number
) => `<!doctype html><meta charset="utf-8">
<style>
  body { margin: 0 }
  .cards { height: 700px; width: 320px; overflow: auto; display: flex; flex-direction: column }
  .cards > .virtual-list-padding { flex: 0 0 auto }
  .card { box-sizing: border-box; border-bottom: 1px solid #ccc; flex: 0 0 auto }
</style>
<script type="module">
  import { tosi, elements } from '/module.js'
  // Deterministic heights, 90..210px
  const items = Array.from({ length: ${n} }, (_, i) => ({ id: 'c' + i, h: 90 + ((i * 37) % 121) }))
  tosi({ vlistProbe: { items } })
  const { div, template } = elements
  window.lane = div(
    { class: 'cards', bindList: { value: 'vlistProbe.items', idPath: 'id',
      virtual: { height: 120, minHeight: ${minHeight} } } },
    template(div({ class: 'card', bind: [
      { value: '^.id', binding: (el, v) => { el.dataset.id = v } },
      { value: '^.h', binding: (el, v) => { el.style.height = v + 'px' } },
    ] }))
  )
  document.body.append(window.lane)
</script>`

for (const minHeight of [76, 150]) {
  for (const n of [25, 60, 200]) {
    test(`virtual list, ${n} cards, minHeight ${minHeight}: content tracks the scroll`, async ({
      page,
    }) => {
      test.setTimeout(240_000)
      await page.route(`${ORIGIN}/**`, (route) => {
        const path = new URL(route.request().url()).pathname
        return path === '/module.js'
          ? route.fulfill({
              contentType: 'text/javascript',
              body: moduleSource,
            })
          : route.fulfill({
              contentType: 'text/html',
              body: page_(n, minHeight),
            })
      })
      await page.setViewportSize({ width: 400, height: 800 })
      await page.goto(`${ORIGIN}/`)
      await page.waitForFunction(() =>
        (window as any).lane?.querySelector('.card')
      )

      const report = await page.evaluate(
        async ([count, STEP]) => {
          const lane = (window as any).lane as HTMLElement
          const frame = () =>
            new Promise((r) =>
              requestAnimationFrame(() => requestAnimationFrame(r))
            )
          await frame()
          const snapshot = () => {
            const m = new Map<string, number>()
            const top = lane.getBoundingClientRect().top
            for (const c of lane.querySelectorAll<HTMLElement>('.card')) {
              m.set(c.dataset.id!, c.getBoundingClientRect().top - top)
            }
            return m
          }
          let prev = snapshot()
          let prevTop = lane.scrollTop
          let moved = 0
          let scrolled = 0
          let stuck = 0
          let worst = { jump: 0, at: 0, t: 0 }
          const jumps: number[] = []
          for (let step = 0; step < 4000; step++) {
            lane.scrollTop = lane.scrollTop + STEP
            await frame()
            const top = lane.scrollTop
            if (top <= prevTop) {
              if (++stuck > 5) break // the end
              continue
            }
            stuck = 0
            const now = snapshot()
            const dy = top - prevTop
            for (const [id, y] of now) {
              if (!prev.has(id)) continue
              const delta = prev.get(id)! - y // a stable list: delta === dy
              const jump = Math.abs(delta - dy)
              moved += Math.abs(delta)
              scrolled += dy
              if (jump > 8) jumps.push(Math.round(jump))
              if (jump > worst.jump) {
                const max = lane.scrollHeight - lane.clientHeight
                worst = {
                  jump: Math.round(jump),
                  at: Math.round(top),
                  t: +(top / max).toFixed(2),
                }
              }
              break
            }
            prev = now
            prevTop = top
          }
          const visible = (id: string) => {
            const el = lane.querySelector<HTMLElement>(`[data-id="${id}"]`)
            if (!el) return false
            const box = lane.getBoundingClientRect()
            const r = el.getBoundingClientRect()
            return r.bottom > box.top && r.top < box.bottom
          }
          const lastReachable = visible(`c${count - 1}`)
          lane.scrollTop = 0
          await frame()
          await frame()
          const firstReachable = visible('c0')
          return {
            motion: +(moved / scrolled).toFixed(2),
            stepsOver8px: jumps.length,
            worst,
            lastReachable,
            firstReachable,
          }
        },
        [n, STEP]
      )

      test.info().annotations.push({
        type: 'measured',
        description: JSON.stringify(report),
      })
      expect(report.lastReachable, 'last card reachable at the bottom').toBe(
        true
      )
      expect(report.firstReachable, 'first card reachable at the top').toBe(
        true
      )
      expect(report.motion, JSON.stringify(report)).toBeLessThanOrEqual(1.1)
      expect(report.worst.jump, JSON.stringify(report)).toBeLessThanOrEqual(8)
    })
  }
}
