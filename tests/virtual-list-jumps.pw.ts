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
 * - scrollListItemIntoView (smooth) to a card that is not built;
 * - switching between the long list and a short one (barely more than fits, one
 *   card taller than the lane), from the middle of each.
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
  window.state = vlistJumps
  window.longList = items
  // barely more than fits, with one card taller than the lane
  window.shortList = [100, 150, 1500, 120, 90, 110].map((h, i) => ({ id: 's' + i, h }))
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

test('scrollListItemIntoView lands a card that is not built where asked', async ({
  page,
}) => {
  // the default smooth scroll rebuilds the list all the way there, so an
  // estimated target would go stale before it arrived (#1999 landed on #1887)
  const report = await page.evaluate(async () => {
    const w = window as any
    const lane = w.lane as HTMLElement
    const frame = () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    await frame()
    const target = 'c40'
    const built = lane.querySelector(`[data-id="${target}"]`) != null
    w.tosijs.scrollListItemIntoView(lane, w.items[40], { position: 'start' })
    let top: number | null = null
    for (let i = 0; i < 60; i++) {
      await frame()
      const el = lane.querySelector<HTMLElement>(`[data-id="${target}"]`)
      top =
        el == null
          ? null
          : Math.round(
              el.getBoundingClientRect().top - lane.getBoundingClientRect().top
            )
      if (top === 0) break
    }
    return { builtBefore: built, top }
  })
  expect(report.builtBefore).toBe(false)
  expect(report.top, JSON.stringify(report)).toBe(0)
})

test('switch between a long list and a short one with a giant card', async ({
  page,
}) => {
  test.setTimeout(120_000)
  const report = await page.evaluate(async () => {
    const w = window as any
    const lane = w.lane as HTMLElement
    const frame = () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    const box = () => lane.getBoundingClientRect()
    const top = (id: string) => {
      const el = lane.querySelector<HTMLElement>(`[data-id="${id}"]`)
      return el == null ? null : el.getBoundingClientRect().top - box().top
    }
    // scroll down in steps to the end; the worst jump on the way, and where
    // the last card ends relative to the lane's bottom
    const scrollDown = async (lastId: string) => {
      let worst = 0
      let stuck = 0
      while (stuck < 6) {
        const before = new Map<string, number>()
        for (const c of lane.querySelectorAll<HTMLElement>('.card')) {
          before.set(c.dataset.id!, top(c.dataset.id!)!)
        }
        const from = lane.scrollTop
        lane.scrollTop = from + 16
        await frame()
        const dy = lane.scrollTop - from
        stuck = dy <= 0 ? stuck + 1 : 0
        for (const [id, y] of before) {
          const now = top(id)
          if (now == null) continue
          worst = Math.max(worst, Math.abs(y - now - dy))
          break
        }
      }
      const last = lane.querySelector<HTMLElement>(`[data-id="${lastId}"]`)
      return {
        worst: Math.round(worst),
        lastBottom:
          last == null
            ? null
            : Math.round(last.getBoundingClientRect().bottom - box().bottom),
      }
    }
    await frame()
    lane.scrollTop = lane.scrollHeight / 2
    await frame()
    w.state.items.value = w.shortList
    await frame()
    await frame()
    const shortFirstVisible = lane.querySelector('[data-id^="s"]') != null
    lane.scrollTop = 0
    await frame()
    const shortTop = top('s0')
    const short = await scrollDown('s5')
    lane.scrollTop = lane.scrollHeight
    await frame()
    w.state.items.value = w.longList
    await frame()
    await frame()
    const longVisible = [...lane.querySelectorAll<HTMLElement>('.card')].some(
      (c) => {
        const r = c.getBoundingClientRect()
        return r.bottom > box().top && r.top < box().bottom
      }
    )
    lane.scrollTop = 0
    await frame()
    const longTop = top('c0')
    const long = await scrollDown('c59')
    return { shortFirstVisible, shortTop, short, longVisible, longTop, long }
  })
  const r = JSON.stringify(report)
  expect(report.shortFirstVisible, r).toBe(true)
  expect(report.shortTop, r).toBe(0)
  expect(report.short.worst, r).toBeLessThanOrEqual(8)
  expect(Math.abs(report.short.lastBottom ?? 99), r).toBeLessThanOrEqual(1)
  expect(report.longVisible, r).toBe(true)
  expect(report.longTop, r).toBe(0)
  expect(report.long.worst, r).toBeLessThanOrEqual(8)
  expect(Math.abs(report.long.lastBottom ?? 99), r).toBeLessThanOrEqual(1)
})

test('cards added or removed above the view do not move what is on screen', async ({
  page,
}) => {
  test.setTimeout(120_000)
  const report = await page.evaluate(async () => {
    const w = window as any
    const lane = w.lane as HTMLElement
    const frame = () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    const firstVisible = () => {
      const box = lane.getBoundingClientRect()
      for (const c of lane.querySelectorAll<HTMLElement>('.card')) {
        const r = c.getBoundingClientRect()
        if (r.bottom > box.top + 1)
          return { id: c.dataset.id!, y: r.top - box.top }
      }
      return null
    }
    const yOf = (id: string) => {
      const el = lane.querySelector<HTMLElement>(`[data-id="${id}"]`)
      return el == null
        ? null
        : el.getBoundingClientRect().top - lane.getBoundingClientRect().top
    }
    await frame()
    // scroll to the middle the way a reader does, in steps
    while (lane.scrollTop < 3000) {
      lane.scrollTop += 16
      await frame()
    }
    const moves: number[] = []
    for (const mutate of [
      () => w.items.splice(2, 1),
      () => w.items.unshift({ id: 'new', h: 300 }),
    ]) {
      const before = firstVisible()!
      mutate()
      await frame()
      await frame()
      moves.push(Math.round(Math.abs((yOf(before.id) ?? 9999) - before.y)))
    }
    // then scroll back up to the top: no step jumps, and the first card is flush
    let worst = 0
    while (lane.scrollTop > 0) {
      const before = firstVisible()!
      const from = lane.scrollTop
      lane.scrollTop = from - 16
      await frame()
      // measured against the step asked for, not the change in scrollTop:
      // the list may scroll by as much as it makes room above (see
      // _layoutVariable), and that must not move anything on screen
      const dy = Math.min(16, from)
      const now = yOf(before.id)
      if (now != null) worst = Math.max(worst, Math.abs(now - before.y - dy))
    }
    return { moves, worst: Math.round(worst), firstTop: yOf('new') }
  })
  const r = JSON.stringify(report)
  expect(Math.max(...report.moves), r).toBeLessThanOrEqual(8)
  // Not the 8px target for an unchanged list: a card of unknown height went in
  // above, and its height is absorbed on the way back up. The bound is that no
  // step moves more than the scroll step itself (it was 126px before 1.10.9;
  // it measures ~7px, and 11px under the attest lane's load).
  expect(report.worst, r).toBeLessThanOrEqual(16)
  expect(report.firstTop, r).toBe(0)
})
