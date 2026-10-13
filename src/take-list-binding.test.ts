import { test, expect, describe } from 'bun:test'
import { tosi } from './xin-proxy'
import { updates } from './path-listener'
import { elements } from './elements'

// the take() descriptor is DATA on the binding entry (DataBinding.take), so
// list instantiation can rewrite its relative paths per row and each row
// carries its own change-detection memo. The closure version froze the
// template's `^.` paths (transform ran on undefined) and shared one memo
// across all rows (the first row's update starved its siblings — observed
// as [true, false] where both rows should have been transformed).
describe('take() inside list templates', () => {
  test('relative-path take: transform runs per row against row values', async () => {
    const { takeRows } = tosi({
      takeRows: {
        items: [
          { id: 1, text: 'a', done: true },
          { id: 2, text: 'b', done: false },
          { id: 3, text: 'c', done: true },
        ],
      },
    })
    const { ul } = elements
    const list = ul(
      ...(takeRows.items as any).listBinding(
        ({ li, button }: any, item: any) =>
          li(
            button('x', {
              // delete only when done: the transform INVERTS the value
              disabled: item.done.tosi.as((done: boolean) => !done),
            })
          ),
        { idPath: 'id' }
      )
    )
    document.body.append(list)
    await updates()
    const buttons = [...list.querySelectorAll('button')] as HTMLButtonElement[]
    expect(buttons.map((b) => b.disabled)).toEqual([false, true, false])

    // sibling independence: toggling ONE row updates that row only —
    // and actually updates it (the shared-memo bug suppressed this)
    ;(takeRows.items as any)[1].done = true
    await updates()
    expect(buttons.map((b) => b.disabled)).toEqual([false, false, false])
    ;(takeRows.items as any)[0].done = false
    await updates()
    expect(buttons.map((b) => b.disabled)).toEqual([true, false, false])
    list.remove()
  })

  test('rows added later get working take bindings too', async () => {
    const { takeGrow } = tosi({
      takeGrow: { items: [{ id: 1, lit: false }] },
    })
    const { ul } = elements
    const list = ul(
      ...(takeGrow.items as any).listBinding(
        ({ li, span }: any, item: any) =>
          li(
            span({
              textContent: item.lit.tosi.as((lit: boolean) =>
                lit ? 'ON' : 'off'
              ),
            })
          ),
        { idPath: 'id' }
      )
    )
    document.body.append(list)
    await updates()
    expect(list.textContent).toBe('off')
    ;(takeGrow.items as any).push({ id: 2, lit: true })
    await updates()
    expect(list.textContent).toBe('offON')
    list.remove()
  })

  test('one descriptor reused across two elements stays independent', async () => {
    const { takeShared } = tosi({ takeShared: { n: 1 } })
    const { span } = elements
    const descriptor = (takeShared.n as any).tosi.as((n: number) => n * 2)
    const a = span({ textContent: descriptor })
    const b = span({ textContent: descriptor })
    document.body.append(a, b)
    await updates()
    expect(a.textContent).toBe('2')
    expect(b.textContent).toBe('2') // the old shared memo starved the second
    ;(takeShared as any).n = 3
    await updates()
    expect(a.textContent).toBe('6')
    expect(b.textContent).toBe('6')
    a.remove()
    b.remove()
  })

  test('absolute-path take in a list template still works', async () => {
    const { takeAbs } = tosi({
      takeAbs: { muted: false, items: [{ id: 1 }, { id: 2 }] },
    })
    const { ul } = elements
    const list = ul(
      ...(takeAbs.items as any).listBinding(
        ({ li, button }: any) =>
          li(
            button('go', {
              disabled: (takeAbs.muted as any).tosi.as((m: boolean) => m),
            })
          ),
        { idPath: 'id' }
      )
    )
    document.body.append(list)
    await updates()
    const buttons = [...list.querySelectorAll('button')] as HTMLButtonElement[]
    expect(buttons.map((b) => b.disabled)).toEqual([false, false])
    ;(takeAbs as any).muted = true
    await updates()
    expect(buttons.map((b) => b.disabled)).toEqual([true, true])
    list.remove()
  })
})
