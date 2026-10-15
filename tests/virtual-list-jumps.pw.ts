import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { join } from 'path'

/*
 * bindList virtual `minHeight` mode: the paths virtual-list-motion.pw.ts does not
 * take (#3302). That spec scrolls downward from the top, where the top spacer is
 * the measured height of the rows above and is exact. Here the list is moved in
 * ways that place rows by ESTIMATE, the way dragging the scrollbar thumb does:
 *
 * - a jump to the bottom, then scrolling up all the way to the top: the estimate's
 *   error is spread over the distance left, so no step jumps and the first card
 *   arrives flush with the top;
 * - a jump into the middle, then scrolling down to the end;
 * - scrollListItemIntoView to a card that is not built.
 *
 * Same page as virtual-list-motion.pw.ts (cards 90-210px, height 120, 320x700).
 */

const moduleSource = readFileSync(
  join(__dirname, '..', 'dist', 'module.js'),
  'utf-8'
)
const ORIGIN = 'https://virtual-list.test'
const N = 60

const html = `<!doctype html><meta charset="utf-8">
<style>
  body { margin: 0 }
  .cards { height: 700px; width: 320px; overflow: auto; display: flex; flex-direction: column }
  .cards > .virtual-list-padding { flex: 0 0 auto }
  .card { box-sizing: border-box; border-bottom: 1px solid #ccc; flex: 0 0 auto }
</style>
<script type="module">
  import * as tosijs from '/module.js'
  const { tosi, elements } = tosijs
  window.tosijs = tosijs
  const items = Array.from({ length: ${N} }, (_, i) => ({ id: 'c' + i, h: 90 + ((i * 37) % 121) }))
  const { vlistJumps } = tosi({ vlistJumps: { items } })
  window.items = vlistJumps.items
  const { div, template } = elements
  window.lane = div(
    { class: 'cards', bindList: { value: 'vlistJumps.items', idPath: 'id',
      virtual: { height: 120, minHeight: 76 } } },
    template(div({ class: 'card', bind: [
      { value: '^.id', binding: (el, v) => { el.dataset.id = v } },
      { value: '^.h', binding: (el, v) => { el.style.height = v + 'px' } },
    ] }))
  )
  document.body.append(window.lane)
</script>`

test.beforeEach(async ({ page }) => {
  await page.route(`${ORIGIN}/**`, (route) => {
    const path = new URL(route.request().url()).pathname
    return path === '/module.js'
      ? route.fulfill({ contentType: 'text/javascript', body: moduleSource })
      : route.fulfill({ contentType: 'text/html', body: html })
  })
  await page.setViewportSize({ width: 400, height: 800 })
  await page.goto(`${ORIGIN}/`)
  await page.waitForFunction(() => (window as any).lane?.querySelector('.card'))
})

test('jump to the bottom, then scroll up to the top without a jump', async ({
  page,
}) => {
  test.setTimeout(120_000)
  const report = await page.evaluate(async () => {
    const lane = (window as any).lane as HTMLElement
    const frame = () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    const top = (id: string) => {
      const el = lane.querySelector<HTMLElement>(`[data-id="${id}"]`)
      return el == null
        ? null
        : el.getBoundingClientRect().top - lane.getBoundingClientRect().top
    }
    await frame()
    // the thumb dragged to the end: several jumps, as a drag delivers them
    for (let i = 0; i < 3; i++) {
      lane.scrollTop = lane.scrollHeight
      await frame()
    }
    const snapshot = () => {
      const m = new Map<string, number>()
      for (const c of lane.querySelectorAll<HTMLElement>('.card')) {
        m.set(c.dataset.id!, top(c.dataset.id!)!)
      }
      return m
    }
    let prev = snapshot()
    let prevTop = lane.scrollTop
    let worst = 0
    let steps = 0
    while (lane.scrollTop > 0 && steps++ < 4000) {
      lane.scrollTop = lane.scrollTop - 16
      await frame()
      const now = snapshot()
      const dy = prevTop - lane.scrollTop
      for (const [id, y] of now) {
        if (!prev.has(id)) continue
        worst = Math.max(worst, Math.abs(y - prev.get(id)! - dy))
        break
      }
      prev = now
      prevTop = lane.scrollTop
    }
    return {
      worst: Math.round(worst),
      firstTop: top('c0'),
      scrollTop: lane.scrollTop,
    }
  })
  expect(report.scrollTop, JSON.stringify(report)).toBe(0)
  expect(report.firstTop, 'first card flush with the top').toBe(0)
  expect(report.worst, JSON.stringify(report)).toBeLessThanOrEqual(8)
})

test('jump into the middle, then scroll down to the end', async ({ page }) => {
  test.setTimeout(120_000)
  const report = await page.evaluate(async (count) => {
    const lane = (window as any).lane as HTMLElement
    const frame = () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    await frame()
    lane.scrollTop = lane.scrollHeight / 2
    await frame()
    let stuck = 0
    let prevTop = lane.scrollTop
    for (let i = 0; i < 4000 && stuck < 6; i++) {
      lane.scrollTop = lane.scrollTop + 16
      await frame()
      stuck = lane.scrollTop <= prevTop ? stuck + 1 : 0
      prevTop = lane.scrollTop
    }
    const last = lane.querySelector<HTMLElement>(`[data-id="c${count - 1}"]`)
    const box = lane.getBoundingClientRect()
    return {
      lastBottom:
        last == null
          ? null
          : Math.round(last.getBoundingClientRect().bottom - box.bottom),
    }
  }, N)
  // the last card ends at the bottom of the lane
  expect(report.lastBottom, JSON.stringify(report)).not.toBeNull()
  expect(Math.abs(report.lastBottom!)).toBeLessThanOrEqual(1)
})

test('scrollListItemIntoView reaches a card that is not built', async ({
  page,
}) => {
  const report = await page.evaluate(async () => {
    const w = window as any
    const lane = w.lane as HTMLElement
    const frame = () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    await frame()
    const target = 'c40'
    const built = lane.querySelector(`[data-id="${target}"]`) != null
    w.tosijs.scrollListItemIntoView(lane, w.items[40], {
      position: 'start',
      behavior: 'instant',
    })
    for (let i = 0; i < 5; i++) await frame()
    const el = lane.querySelector<HTMLElement>(`[data-id="${target}"]`)
    const box = lane.getBoundingClientRect()
    const r = el?.getBoundingClientRect()
    return {
      builtBefore: built,
      visible: r != null && r.bottom > box.top && r.top < box.bottom,
    }
  })
  expect(report.builtBefore).toBe(false)
  expect(report.visible, JSON.stringify(report)).toBe(true)
})
