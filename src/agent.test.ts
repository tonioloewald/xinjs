import { test, expect, describe, afterEach } from 'bun:test'
import { enableAgentInterface, BOUND_TWO_WAY, BOUND_TO_DOM } from './agent'
import { tosi } from './xin-proxy'
import { xin } from './xin'
import { updates } from './path-listener'
import { elements } from './elements'
import { bind, on } from './bind'
import { bindings } from './bindings'

// the sentinel is internal; the test asserts on its literal text on purpose
// — if that string ever changes, a consumer's redaction check changes too
const SECRET_SENTINEL_TEXT = '⟨secret⟩'

let current: ReturnType<typeof enableAgentInterface> | undefined
afterEach(() => {
  current?.disable()
  current = undefined
  /*
   * REMOVE SECRET-BEARING CONTROLS BETWEEN TESTS.
   *
   * `refreshSecretPaths()` rescans the WHOLE document before every read, and
   * `secretPaths` lives for the process — so a password field left appended by
   * one test keeps registering its path for every test after it. That is a
   * guard passing for the wrong reason, and it is the same hazard `M5` just
   * fixed for `warnDeprecated`'s latch: cross-test state that makes an
   * assertion look verified while proving nothing.
   *
   * Neighbouring tests each did `field.remove()` by hand; doing it here means
   * a new test cannot forget.
   */
  document.body.replaceChildren()
})

describe('agent interface — read/write/observe', () => {
  test('read returns serializable state; write flows through observers to the DOM', async () => {
    tosi({ agentRW: { name: 'Ada', tags: ['x'] } })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))

    expect(agent.read('agentRW.name')).toBe('Ada')
    expect(agent.read('agentRW')).toEqual({ name: 'Ada', tags: ['x'] })

    // a human-facing bound element updates from an agent write
    const input = elements.input()
    document.body.append(input)
    bind(input, 'agentRW.name', bindings.value)
    await updates()
    expect(input.value).toBe('Ada')

    agent.write('agentRW.name', 'Grace')
    await updates()
    expect(input.value).toBe('Grace')
    expect(agent.read('agentRW.name')).toBe('Grace')
    input.remove()
  })

  test('observe pushes on change; unsubscribe stops it', async () => {
    tosi({ agentObs: { count: 0 } })
    await updates() // drain the registration touch — agents act on settled apps
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    const seen: string[] = []
    const off = agent.observe('agentObs.count', (path) => seen.push(path))

    agent.write('agentObs.count', 1)
    await updates()
    expect(seen).toEqual(['agentObs.count'])

    off()
    agent.write('agentObs.count', 2)
    await updates()
    expect(seen).toEqual(['agentObs.count']) // no further pushes
  })

  test('subscribe-before-data: observing a path that does not exist yet works', async () => {
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    const seen: string[] = []
    agent.observe('agentLate.order.confirmation', (path) => seen.push(path))

    tosi({ agentLate: { order: { confirmation: 'ok!' } } })
    await updates()
    expect(seen.length).toBeGreaterThan(0)
    expect(agent.read('agentLate.order.confirmation')).toBe('ok!')
  })
})

describe('agent interface — actions', () => {
  test('call invokes a function in state by path', async () => {
    const store = {
      agentAct: {
        list: [] as string[],
        add(item: string) {
          ;(xin as any).agentAct.list.push(item)
        },
      },
    }
    tosi(store)
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    agent.call('agentAct.add', 'hello')
    await updates()
    expect(agent.read('agentAct.list')).toEqual(['hello'])
  })

  test('call on a non-function throws', () => {
    tosi({ agentNotFn: { x: 1 } })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    expect(() => agent.call('agentNotFn.x')).toThrow('not an action')
  })
})

describe('agent interface — when (await a condition)', () => {
  test('resolves immediately when the condition already holds', async () => {
    tosi({ agentWhenNow: { status: 'ready' } })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    // no touch will occur — only immediate satisfaction can resolve this
    const value = await agent.when('agentWhenNow.status', (s) => s === 'ready')
    expect(value).toBe('ready')
  })

  test('resolves when the condition becomes true; ignores non-satisfying changes', async () => {
    tosi({ agentWhen: { status: 'pending' } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    let settled = false
    const wait = agent
      .when('agentWhen.status', (s) => s === 'confirmed')
      .then((v) => {
        settled = true
        return v
      })

    agent.write('agentWhen.status', 'processing') // not the named condition
    await updates()
    expect(settled).toBe(false)

    agent.write('agentWhen.status', 'confirmed')
    expect(await wait).toBe('confirmed')
  })

  test('scope-checked, audit-logged, and invisible to the changes() drain', async () => {
    tosi({ agentWhenPub: { n: 0 }, agentWhenPriv: { x: 1 } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: { roots: ['agentWhenPub'], write: true },
    }))
    expect(() => agent.when('agentWhenPriv.x', () => true)).toThrow(
      'not exposed'
    )

    const { cursor } = agent.changes()
    const wait = agent.when('agentWhenPub.n', (n) => n === 2)
    agent.write('agentWhenPub.n', 2)
    expect(await wait).toBe(2)
    // the wait is in the audit trail…
    const notes = agent.log().filter((e) => e.note != null)
    expect(notes.some((e) => e.note!.startsWith('when: armed'))).toBe(true)
    expect(notes.some((e) => e.note === 'when: resolved')).toBe(true)
    // …but the drain reports only real state changes
    const { changes } = agent.changes(cursor)
    expect(changes).toEqual([{ path: 'agentWhenPub.n', value: 2 }])
  })

  test('disable() rejects pending waits', async () => {
    tosi({ agentWhenBye: { done: false } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    const wait = agent.when('agentWhenBye.done', (d) => d === true)
    agent.disable()
    current = undefined
    await expect(wait).rejects.toThrow('agent interface disabled')
  })

  test('a throwing predicate rejects the wait — both immediately and later', async () => {
    tosi({ agentWhenThrow: { v: 0 } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    // throws on the immediate check → rejected promise, not a sync throw
    await expect(
      agent.when('agentWhenThrow.v', () => {
        throw new Error('bad predicate')
      })
    ).rejects.toThrow('bad predicate')
    // throws only once observation delivers the new value
    const wait = agent.when('agentWhenThrow.v', (v) => {
      if (v === 1) throw new Error('late bad predicate')
      return false
    })
    agent.write('agentWhenThrow.v', 1)
    await expect(wait).rejects.toThrow('late bad predicate')
  })
})

describe('agent interface — changes (turn-based drain)', () => {
  test('coalesces to final-value-per-path since cursor; cursor advances', async () => {
    tosi({ agentDrain: { a: 0, b: 0 } })
    await updates() // drain the registration touch — agents act on settled apps
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    const { cursor: start } = agent.changes()

    agent.write('agentDrain.a', 1)
    agent.write('agentDrain.a', 2)
    agent.write('agentDrain.b', 10)
    await updates()

    const { cursor, changes } = agent.changes(start)
    expect(cursor).toBeGreaterThan(start)
    const byPath = Object.fromEntries(changes.map((c) => [c.path, c.value]))
    // one entry per path, final value — not three entries
    expect(byPath['agentDrain.a']).toBe(2)
    expect(byPath['agentDrain.b']).toBe(10)
    expect(changes.filter((c) => c.path === 'agentDrain.a').length).toBe(1)

    // draining from the new cursor is empty until something changes
    expect(agent.changes(cursor).changes).toEqual([])
  })
})

describe('agent interface — manifest mode (scoping)', () => {
  test('reads/writes/observes outside exposed roots throw; inside work', () => {
    tosi({ agentPub: { greeting: 'hi' }, agentSecret: { token: 'xyz' } })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: { roots: ['agentPub'], write: true },
    }))

    expect(agent.read('agentPub.greeting')).toBe('hi')
    agent.write('agentPub.greeting', 'yo')
    expect(agent.read('agentPub.greeting')).toBe('yo')

    expect(() => agent.read('agentSecret.token')).toThrow('not exposed')
    expect(() => agent.write('agentSecret.token', 'stolen')).toThrow(
      'not exposed'
    )
    expect(() => agent.observe('agentSecret.token', () => {})).toThrow(
      'not exposed'
    )
    // prefix must be segment-exact: agentPublic !== agentPub
    expect(() => agent.read('agentPublicity')).toThrow('not exposed')
  })

  test('a declared action is callable, NOT writable — declaring it must not let an agent replace app code', () => {
    tosi({
      agentActWrite: {
        data: { x: 1 },
        checkout() {
          return 'ok'
        },
      },
    })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        roots: ['agentActWrite.data'],
        actions: ['agentActWrite.checkout'],
        write: true,
      },
    }))
    expect(agent.call('agentActWrite.checkout')).toBe('ok')
    // the hole this pins shut: action-allowlisted paths passed the same
    // scope check as reads, so write() could overwrite the function itself
    expect(() =>
      agent.write('agentActWrite.checkout', 'not code anymore')
    ).toThrow('callable, not writable')
    expect(agent.call('agentActWrite.checkout')).toBe('ok') // still the app's code
    // and children of an action path are not a writable side door
    expect(() => agent.write('agentActWrite.checkout.evil', 1)).toThrow(
      'callable, not writable'
    )
    // root-declared paths still write normally
    agent.write('agentActWrite.data.x', 2)
    expect(agent.read('agentActWrite.data.x')).toBe(2)
  })

  test('undeclared actions cannot be called; declared ones can', () => {
    tosi({
      agentActs: {
        allowed() {
          return 'ran'
        },
        forbidden() {
          return 'no'
        },
      },
    })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: { roots: [], actions: ['agentActs.allowed'] },
    }))
    expect(agent.call('agentActs.allowed')).toBe('ran')
    expect(() => agent.call('agentActs.forbidden')).toThrow('not exposed')
  })

  test('the ledger only records in-scope paths', async () => {
    tosi({ agentLedgerPub: { a: 0 }, agentLedgerPriv: { b: 0 } })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: { roots: ['agentLedgerPub'] },
    }))
    ;(xin as any).agentLedgerPub.a = 1
    ;(xin as any).agentLedgerPriv.b = 1 // outside scope — direct app write
    await updates()
    const paths = agent.log().map((e) => e.path)
    expect(paths.some((p) => p.startsWith('agentLedgerPub'))).toBe(true)
    expect(paths.some((p) => p.startsWith('agentLedgerPriv'))).toBe(false)
  })
})

describe('agent interface — describe()', () => {
  test('wiring reports the affordance join: label × path × writability × handlers', async () => {
    tosi({
      agentDesc: {
        filter: '',
        total: 42,
        submit() {},
      },
    })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))

    // an input: two-way bound (writable), semantically labeled, event-wired by path
    const input = elements.input({
      id: 'agent-desc-input',
      placeholder: 'search…',
    })
    document.body.append(input)
    bind(input, 'agentDesc.filter', bindings.value)
    on(input, 'keydown', 'agentDesc.submit' as any)
    // a display: one-way bound (read-only)
    const span = elements.span({ id: 'agent-desc-span' })
    document.body.append(span)
    bind(span, 'agentDesc.total', bindings.text)
    await updates()

    const description = agent.describe()
    expect(description.exposure).toBe('all')
    expect(description.roots.agentDesc).toBe('object')
    expect(description.actions).toContain('agentDesc.submit')

    // flat records: semantically visible facts at the top level
    const inputRecord = description.wiring.find(
      (w) => w.id === 'agent-desc-input'
    )!
    expect(inputRecord).toBeDefined()
    // a placeholder is a HINT, not a name — its own field, never `label`
    expect(inputRecord.placeholder).toBe('search…')
    expect(inputRecord.label).toBeUndefined()
    // two-way arrow = user-writable affordance, provenance inline
    expect(inputRecord.value).toBe('⟷ agentDesc.filter') // '' value elided
    expect(inputRecord.on!.keydown).toBe('agentDesc.submit') // by-path handler is nameable

    const spanRecord = description.wiring.find(
      (w) => w.id === 'agent-desc-span'
    )!
    // one-way arrow = display-only, current value on the left
    expect(spanRecord.text).toBe('42 ⟵ agentDesc.total')

    // geometry rides in the map (happy-dom reports zeros; the shape is there)
    expect(inputRecord.bounds).toBeDefined()
    expect(typeof inputRecord.bounds!.width).toBe('number')

    input.remove()
    span.remove()
  })

  test('manifest mode limits described roots and actions to the declaration', () => {
    tosi({ agentDescPub: { x: 1 }, agentDescPriv: { y: 2 } })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: { roots: ['agentDescPub'], actions: [] },
    }))
    const description = agent.describe()
    expect(description.exposure).toBe('manifest')
    expect(Object.keys(description.roots)).toEqual(['agentDescPub'])
  })
})

describe('agent interface — lifecycle', () => {
  test('global installs and disable removes it', () => {
    tosi({ agentGlobal: { ok: true } })
    const agent = (current = enableAgentInterface())
    expect((globalThis as any).tosiAgent).toBe(agent)
    agent.disable()
    current = undefined
    expect((globalThis as any).tosiAgent).toBeUndefined()
  })
})

describe('post-hoc component contracts — lofting classes you do not control', () => {
  test('components option fills the gap; an own static contract always wins', async () => {
    const { elements } = await import('./elements')
    const { bind } = await import('./bind')
    const { bindings } = await import('./bindings')
    // a "legacy" custom element with no static contract at all
    class LegacyThing extends HTMLElement {}
    if (customElements.get('legacy-thing') == null) {
      customElements.define('legacy-thing', LegacyThing)
    }
    tosi({ loftApp: { x: 1 } })
    const el = document.createElement('legacy-thing') as HTMLElement
    document.body.append(el)
    bind(el as any, 'loftApp.x', bindings.value)
    const span = elements.span()
    document.body.append(span)
    bind(span, 'loftApp.x', bindings.text)
    await updates()

    const agent = (current = enableAgentInterface({
      global: false,
      quiet: true,
      // posture is not what this test is about, and the closed default (1.9.0)
      // maps nothing at all
      expose: 'all',
      components: {
        'legacy-thing': {
          description: 'lofted from outside — the class never knew',
          value: { type: 'number' },
        },
      },
    }))
    const record = agent
      .describe()
      .wiring.find((w) => w.tag === 'legacy-thing')!
    expect(record.component).toBeDefined()
    expect(record.component!.description).toContain('lofted from outside')
    el.remove()
    span.remove()
  })
})

describe('describe({ scope }) — hierarchy scoping', () => {
  test('scope confines the wiring walk to one subtree, size be damned', async () => {
    const { elements } = await import('./elements')
    const { bind } = await import('./bind')
    const { bindings } = await import('./bindings')
    tosi({ scopeApp: { a: 1, b: 2 } })
    const hereBox = elements.div()
    const thereBox = elements.div()
    document.body.append(hereBox, thereBox)
    const here = elements.input()
    hereBox.append(here)
    bind(here, 'scopeApp.a', bindings.value)
    const there = elements.input()
    thereBox.append(there)
    bind(there, 'scopeApp.b', bindings.value)
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))

    const scoped = agent.describe({ scope: hereBox })
    const paths = scoped.wiring.flatMap((w) =>
      Object.values(w).filter(
        (v) => typeof v === 'string' && v.includes('scopeApp')
      )
    )
    expect(paths.some((p) => (p as string).includes('scopeApp.a'))).toBe(true)
    expect(paths.some((p) => (p as string).includes('scopeApp.b'))).toBe(false)
    // unscoped sees both
    const full = agent.describe()
    const fullPaths = JSON.stringify(full.wiring)
    expect(fullPaths).toContain('scopeApp.a')
    expect(fullPaths).toContain('scopeApp.b')
    hereBox.remove()
    thereBox.remove()
  })
})

describe('the structural tier', () => {
  test('headings and containers of wired elements appear, flagged structural', async () => {
    const { elements } = await import('./elements')
    const { bind } = await import('./bind')
    const { bindings } = await import('./bindings')
    tosi({ structApp: { q: '' } })
    const section = elements.section()
    const heading = elements.h2('Search Settings')
    const box = document.createElement('demo-box') // custom container
    const field = elements.input()
    box.append(field)
    section.append(heading, box)
    document.body.append(section)
    bind(field, 'structApp.q', bindings.value)
    // happy-dom reports zero-size for everything; structural records
    // correctly skip sizeless elements, so give these real geometry
    ;(heading as any).getBoundingClientRect = () =>
      ({ x: 10, y: 10, width: 300, height: 24 } as DOMRect)
    ;(box as any).getBoundingClientRect = () =>
      ({ x: 10, y: 40, width: 300, height: 60 } as DOMRect)
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))

    const d = agent.describe({ scope: section })
    const h = d.wiring.find((w) => w.tag === 'h2')
    expect(h?.structural).toBe(true)
    expect(h?.text).toBe('Search Settings')
    const container = d.wiring.find((w) => w.tag === 'demo-box')
    expect(container?.structural).toBe(true)
    // and structure: false yields affordances only
    const bare = agent.describe({ scope: section, structure: false })
    expect(bare.wiring.some((w) => w.structural)).toBe(false)
    section.remove()
  })
})

describe("describe({ view: 'viewport' }) — the camera", () => {
  test('only on-screen records, in screen coordinates', async () => {
    const { elements } = await import('./elements')
    const { bind } = await import('./bind')
    const { bindings } = await import('./bindings')
    tosi({ camApp: { a: 1, b: 2 } })
    const onScreen = elements.input()
    const offScreen = elements.input()
    document.body.append(onScreen, offScreen)
    bind(onScreen, 'camApp.a', bindings.value)
    bind(offScreen, 'camApp.b', bindings.value)
    ;(onScreen as any).getBoundingClientRect = () =>
      ({ x: 50, y: 100, width: 200, height: 30 } as DOMRect)
    ;(offScreen as any).getBoundingClientRect = () =>
      ({ x: 50, y: 5000, width: 200, height: 30 } as DOMRect)
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))

    const cam = agent.describe({ view: 'viewport' })
    const paths = JSON.stringify(cam.wiring)
    expect(paths).toContain('camApp.a')
    expect(paths).not.toContain('camApp.b') // the camera can't see it
    const rec = cam.wiring.find((w) => JSON.stringify(w).includes('camApp.a'))!
    expect(rec.bounds!.y).toBe(100) // screen coordinates, no scroll math

    // the atlas still sees both
    const atlas = agent.describe()
    expect(JSON.stringify(atlas.wiring)).toContain('camApp.b')
    onScreen.remove()
    offScreen.remove()
  })
})

describe('ARIA is a two-way street', () => {
  test('the harvest speaks screen reader: labelledby/describedby resolve, states surface, aria-hidden is hidden', async () => {
    const { elements } = await import('./elements')
    const { bind } = await import('./bind')
    const { bindings } = await import('./bindings')
    tosi({ ariaApp: { qty: 1, ghost: 0 } })
    const caption = elements.span({ id: 'qty-caption' }, 'Quantity')
    const hint = elements.span({ id: 'qty-hint' }, 'between 1 and 99')
    const field = elements.input({
      ariaLabelledby: 'qty-caption',
      ariaDescribedby: 'qty-hint',
      ariaRequired: 'true',
      ariaDisabled: 'true',
    })
    const invisible = elements.input({ ariaHidden: 'true' })
    document.body.append(caption, hint, field, invisible)
    bind(field, 'ariaApp.qty', bindings.value)
    bind(invisible, 'ariaApp.ghost', bindings.value)
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))

    const d = agent.describe()
    const rec = d.wiring.find((w) => JSON.stringify(w).includes('ariaApp.qty'))!
    expect(rec.label).toBe('Quantity') // resolved, not the raw id list
    expect(rec.description).toBe('between 1 and 99')
    expect(rec.required).toBe(true)
    expect(rec.disabled).toBe(true)
    // aria-hidden = hidden from assistive tech = hidden from the agent
    expect(JSON.stringify(d.wiring)).not.toContain('ariaApp.ghost')
    for (const el of [caption, hint, field, invisible]) el.remove()
  })

  test('curation materializes into the MATCHING slot: description, role — never the name', async () => {
    const { Component } = await import('./component')
    const described = {
      description: 'counts things, between 1 and 99',
      role: 'spinbutton',
    } as const
    class DescribedThing extends (Component as any) {
      static preferredTagName = 'described-thing'
      static contract = described
      content = ({ span }: any) => span('42')
    }
    const el = DescribedThing.elementCreator()() as any
    document.body.append(el)
    await updates()

    // a description projects to the DESCRIPTION slot…
    expect(el.getAttribute('aria-description')).toBe(
      'counts things, between 1 and 99'
    )
    // …never to the name slot: the visible content still names it, and our
    // own audit's anonymous-affordance rule stays honest
    expect(el.hasAttribute('aria-label')).toBe(false)
    // a declared role materializes — the audit's missing-role fix, declared
    expect(el.getAttribute('role')).toBe('spinbutton')

    // and the harvest reads it back
    // expose: 'all' — this test is about CONTRACT harvesting, not posture;
    // the closed default maps nothing (1.9.0)
    const agent = enableAgentInterface({
      global: false,
      quiet: true,
      expose: 'all',
    })
    try {
      const record = agent
        .describe()
        .wiring.find((w) => w.tag === 'described-thing')
      expect(record?.description).toBe('counts things, between 1 and 99')
      expect(record?.role).toBe('spinbutton')
    } finally {
      agent.disable()
    }
    el.remove()
  })

  test('an author-set description or role always wins', async () => {
    const { Component } = await import('./component')
    const declared = {
      description: 'the library says this',
      role: 'button',
    } as const
    class AuthorWins extends (Component as any) {
      static preferredTagName = 'author-wins'
      static contract = declared
      content = null
    }
    const creator = AuthorWins.elementCreator()
    const el = creator() as any
    el.setAttribute('aria-description', 'the author says this')
    el.setAttribute('role', 'link')
    document.body.append(el)
    await updates()
    expect(el.getAttribute('aria-description')).toBe('the author says this')
    expect(el.getAttribute('role')).toBe('link')
    el.remove()
  })
})

describe('describe() — form-control state harvest', () => {
  test('type, live checked state, and live unbound values are map facts', async () => {
    tosi({ sinkApp: { on: true } })
    const { elements } = await import('./elements')
    const check = elements.input({ type: 'checkbox', bindValue: 'sinkApp.on' })
    const radio = elements.input({ type: 'radio', checked: true })
    on(radio, 'click', 'sinkApp.noop' as any) // wire it so it maps
    const loose = elements.input({ value: 'typed by hand' })
    on(loose, 'change', 'sinkApp.noop' as any)
    document.body.append(check, radio, loose)
    await updates()

    const agent = enableAgentInterface({ global: false, expose: 'all' })
    try {
      const d = agent.describe()
      const checkRec = d.wiring.find((w) => w.type === 'checkbox')!
      expect(checkRec.checked).toBe(true) // live DOM truth
      const radioRec = d.wiring.find((w) => w.type === 'radio')
      expect(radioRec?.checked).toBe(true)
      const looseRec = d.wiring.find((w) => w.value === 'typed by hand')!
      // no arrow: current-but-unbound — honest provenance
      expect(looseRec).toBeDefined()
    } finally {
      agent.disable()
      check.remove()
      radio.remove()
      loose.remove()
    }
  })
})

describe('describe() — focus harvest', () => {
  test('the focused element is marked: where the user is, in the map', async () => {
    tosi({ focusApp: { q: '' } })
    const focused = elements.input({ id: 'focus-me' })
    const other = elements.input({ id: 'not-me' })
    document.body.append(focused, other)
    bind(focused, 'focusApp.q', bindings.value)
    bind(other, 'focusApp.q', bindings.value)
    focused.focus()
    await updates()

    const agent = enableAgentInterface({ global: false, expose: 'all' })
    try {
      const d = agent.describe()
      expect(d.wiring.find((w) => w.id === 'focus-me')?.focused).toBe(true)
      expect(d.wiring.find((w) => w.id === 'not-me')?.focused).toBeUndefined()
    } finally {
      agent.disable()
      focused.remove()
      other.remove()
    }
  })
})

describe('describe() — label association (the kitchen-sink lesson)', () => {
  test('a wrapping <label> or label[for] names the control, like a screen reader', async () => {
    tosi({ labelApp: { qty: 3 } })
    const { label } = elements
    const wrapped = elements.input({ type: 'number' })
    const wrapper = label(wrapped, ' qty')
    const pointed = elements.input({ id: 'label-target' })
    const pointer = label({ htmlFor: 'label-target' }, 'volume')
    document.body.append(wrapper, pointed, pointer)
    bind(wrapped, 'labelApp.qty', bindings.value)
    bind(pointed, 'labelApp.qty', bindings.value)
    await updates()

    const agent = enableAgentInterface({ global: false, expose: 'all' })
    try {
      const d = agent.describe()
      expect(d.wiring.find((w) => w.label === 'qty')).toBeDefined()
      expect(d.wiring.find((w) => w.label === 'volume')).toBeDefined()
    } finally {
      agent.disable()
      wrapper.remove()
      pointed.remove()
      pointer.remove()
    }
  })
})

describe('describe() — proxy handlers are nameable', () => {
  test('onEvent: proxy names by its path, exactly like the string form', async () => {
    const { proxyHandler } = tosi({
      proxyHandler: {
        n: 0,
        bump() {
          ;(proxyHandler as any).n = (proxyHandler as any).n.value + 1
        },
      },
    })
    await updates()
    const viaString = elements.button('s', { id: 'via-string' })
    const viaProxy = elements.button('p', { id: 'via-proxy' })
    on(viaString, 'click', 'proxyHandler.bump' as any)
    on(viaProxy, 'click', (proxyHandler as any).bump)
    document.body.append(viaString, viaProxy)

    const agent = enableAgentInterface({ global: false, expose: 'all' })
    try {
      const d = agent.describe()
      const s = d.wiring.find((w) => w.id === 'via-string')!
      const p = d.wiring.find((w) => w.id === 'via-proxy')!
      expect(s.on!.click).toBe('proxyHandler.bump')
      expect(p.on!.click).toBe('proxyHandler.bump') // not 'ƒ'
      // …because on() NORMALIZED the proxy to its path at registration —
      // the stored metadata is identical for both forms
      const { getElementBindings } = await import('./metadata')
      const stored = [
        ...(getElementBindings(viaProxy).eventBindings!.click as Set<any>),
      ]
      expect(stored).toEqual(['proxyHandler.bump'])
      // and the proxy handler DISPATCHES live, like the string
      viaProxy.click()
      await updates()
      expect(agent.read('proxyHandler.n')).toBe(1)
    } finally {
      agent.disable()
      viaString.remove()
      viaProxy.remove()
    }
  })

  test('a NAMED raw function leaves a breadcrumb; prop-key artifacts stay ƒ', async () => {
    const named = elements.button('n', { id: 'raw-named' })
    const artifact = elements.button('a', { id: 'raw-artifact' })
    function retallyEverything() {}
    on(named, 'click', retallyEverything as any)
    // method-shorthand names (onClick, handleClick) are prop-key noise
    on(artifact, 'click', { handleClick() {} }.handleClick as any)
    document.body.append(named, artifact)
    const agent = enableAgentInterface({ global: false, expose: 'all' })
    try {
      const d = agent.describe()
      expect(d.wiring.find((w) => w.id === 'raw-named')!.on!.click).toBe(
        'ƒ retallyEverything'
      )
      expect(d.wiring.find((w) => w.id === 'raw-artifact')!.on!.click).toBe('ƒ')
    } finally {
      agent.disable()
      named.remove()
      artifact.remove()
    }
  })
})

describe('describe() — validity harvest (the haltija exchange)', () => {
  test('live ValidityState and aria-invalid become map facts', async () => {
    tosi({ validApp: { email: '', other: 'ok' } })
    const missing = elements.input({ id: 'v-missing', required: true })
    const mismatch = elements.input({
      id: 'v-mismatch',
      type: 'email',
      value: 'not-an-email',
    })
    const fine = elements.input({ id: 'v-fine', value: 'ok' })
    const ariaBad = elements.input({ id: 'v-aria' })
    ariaBad.setAttribute('aria-invalid', 'true')
    document.body.append(missing, mismatch, fine, ariaBad)
    // NB: value-binding the mismatch input would OVERWRITE its bad value
    // with state — wire it (and aria) via handlers, bind the other two
    bind(missing, 'validApp.email', bindings.value)
    bind(fine, 'validApp.other', bindings.value)
    on(mismatch, 'change', 'validApp.noop' as any)
    on(ariaBad, 'change', 'validApp.noop' as any)
    await updates()
    const agent = enableAgentInterface({ global: false, expose: 'all' })
    try {
      const d = agent.describe()
      const rec = (id: string) => d.wiring.find((w) => w.id === id)!
      expect(rec('v-missing').invalid).toBe(true) // required + empty
      expect(rec('v-missing').required).toBe(true)
      expect(rec('v-mismatch').invalid).toBe(true) // typeMismatch
      expect(rec('v-fine').invalid).toBeUndefined()
      expect(rec('v-aria').invalid).toBe(true) // author's own claim
    } finally {
      agent.disable()
      for (const el of [missing, mismatch, fine, ariaBad]) el.remove()
    }
  })
})

describe('describe() — contenteditable surfaces as an input field', () => {
  test('existence leads: mapped even unbound, live text as value, aria-placeholder as hint', async () => {
    const region = elements.div({ id: 'ce-region' })
    region.setAttribute('contenteditable', '')
    region.setAttribute('aria-placeholder', 'jot something…')
    region.textContent = 'draft text'
    const empty = elements.div({ id: 'ce-empty' })
    empty.setAttribute('contenteditable', 'true')
    empty.setAttribute('aria-placeholder', 'jot something…')
    document.body.append(region, empty)
    await updates()
    const agent = enableAgentInterface({ global: false, expose: 'all' })
    try {
      const d = agent.describe()
      const rec = d.wiring.find((w) => w.id === 'ce-region')!
      // no bindings, no handlers — surfaced anyway: the region EXISTS
      expect(rec).toBeDefined()
      expect(rec.contentEditable).toBe(true)
      expect(rec.value).toBe('draft text') // live text, no provenance arrow
      const hint = d.wiring.find((w) => w.id === 'ce-empty')!
      expect(hint.placeholder).toBe('jot something…')
      expect(hint.value).toBeUndefined()
    } finally {
      agent.disable()
      region.remove()
      empty.remove()
    }
  })
})

describe('describe() — links are affordances (the href field)', () => {
  test('a bare <a href> is on the map; destination is distinct from text', async () => {
    const named = elements.a({ href: '/pricing' }, 'Pricing')
    const nameless = elements.a({ href: 'https://example.com/deep/path' })
    document.body.append(named, nameless)
    const agent = enableAgentInterface({ global: false, expose: 'all' })
    try {
      const d = agent.describe()
      const link = d.wiring.find((w) => w.href === '/pricing')!
      expect(link).toBeDefined() // no bindings, no handlers — mapped anyway
      expect(link.tag).toBe('a')
      expect(link.text).toBe('Pricing') // "says X" …
      expect(link.href).toBe('/pricing') // … "goes to Y" — both facts
      expect(
        d.wiring.some((w) => w.href === 'https://example.com/deep/path')
      ).toBe(true)
    } finally {
      agent.disable()
      named.remove()
      nameless.remove()
    }
  })
})

describe('surface identity — ask, do not assume (tosijs#23)', () => {
  test('agent.version and describe().version carry shape, library, capabilities', async () => {
    const { AGENT_SURFACE_VERSION, AGENT_CAPABILITIES } = await import(
      './agent'
    )
    const { version: libVersion } = await import('./version')
    tosi({ verApp: { x: 1 } })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))

    expect(agent.version.surface).toBe(AGENT_SURFACE_VERSION)
    expect(agent.version.tosijs).toBe(libVersion)
    expect(agent.version.capabilities).toEqual([...AGENT_CAPABILITIES])
    // the identity travels WITH the map — a serialized description is
    // self-describing wherever it lands
    const d = agent.describe()
    expect(d.version).toEqual(agent.version)
    expect(JSON.parse(JSON.stringify(d)).version.surface).toBe(
      AGENT_SURFACE_VERSION
    )
    // capabilities are membership-tested, not semver-inferred
    for (const capability of ['describe', 'bounds', 'aria', 'validity']) {
      expect(agent.version.capabilities.includes(capability)).toBe(true)
    }
  })

  test('the shape contract and the capability list are honest about THIS build', async () => {
    tosi({ verHonest: { x: 1 } })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    const d = agent.describe({ styles: true, view: 'viewport' })
    // every claimed describe-shaping capability is one this build supports
    expect(agent.version.capabilities.includes('viewport')).toBe(true)
    expect(agent.version.capabilities.includes('styles')).toBe(true)
    expect(Array.isArray(d.wiring)).toBe(true) // the shape haltija reads
    expect(typeof d.exposure).toBe('string')
  })
})

describe('the posture: safe by default, full access behind one line', () => {
  test('default = CLOSED: nothing is exposed until you say so', async () => {
    /*
     * 1.9.0 replaced the read-only-over-everything default.
     *
     * The old default was the root cause of four separate secret leaks found
     * across four review rounds: each was reachable ONLY because a caller who
     * passed no arguments got the whole registry plus every bound element on
     * the page. Redaction was patched four times; the default was the defect.
     */
    tosi({ postureApp: { n: 1, pin: 'PIN-9999', go() {} } })
    await updates()
    const el = elements.input({ id: 'posture-el' })
    document.body.append(el)
    bind(el, 'postureApp.n', bindings.value)
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      quiet: true,
    }))

    /*
     * THE FIXTURE IS THE TEST. (1.9.0 pre-minor review, B-1.)
     *
     * This assertion existed and passed while `describe()` published four
     * records in the closed posture, because the fixture held only a bound
     * input — one of the two shapes that WERE gated. Every leak lived in a
     * shape it did not contain. So the shapes are the point: a bare `<a href>`
     * (token in a query string), a contenteditable (a user's live draft), a
     * heading bound to an undeclared secret, and a self-declaring custom
     * element (its private action namespace and attribute defaults).
     *
     * Bounds are mocked because happy-dom reports zero-size rects, which
     * suppressed the structural tier here and in NO real browser.
     */
    const link = elements.a({ href: '/admin/reset?token=SEKRIT' }, 'admin')
    const draft = elements.div({ contentEditable: 'true' }, 'SSN 123-45-6789')
    const head = elements.h2({ id: 'closed-h' })
    document.body.append(link, draft, head)
    bind(head, 'postureApp.pin', bindings.text)
    await updates()
    for (const el of [link, draft, head]) {
      Object.defineProperty(el, 'getBoundingClientRect', {
        value: () => ({ x: 0, y: 0, width: 200, height: 30 }),
        configurable: true,
      })
    }

    expect(agent.describe().exposure).toBe('closed')
    // the map describes an EMPTY app: no roots, and no wiring — the DOM walk
    // must be scoped too, or these elements carry the values out anyway
    expect(Object.keys(agent.describe().roots)).toEqual([])
    expect(agent.describe().wiring).toEqual([])
    expect(agent.describe().actions).toEqual([])
    const closedJson = JSON.stringify(agent.describe())
    for (const leak of ['SEKRIT', '123-45-6789', 'PIN-9999', 'admin'])
      expect(closedJson).not.toContain(leak)

    // and every verb refuses, saying how to open it
    expect(() => agent.read('postureApp.n')).toThrow(/not exposed/)
    expect(() => agent.read('postureApp.n')).toThrow(/expose/)
    expect(() => agent.write('postureApp.n', 2)).toThrow(/exposes nothing/)
    expect(() => agent.call('postureApp.go')).toThrow(/exposes nothing/)

    // POSITIVE CONTROL: the same app is fully visible once declared, so the
    // assertions above are about the posture and not about a broken fixture
    current.disable()
    const open = (current = enableAgentInterface({
      global: false,
      quiet: true,
      expose: { roots: ['postureApp'] },
    }))
    expect(open.read('postureApp.n')).toBe(1)
    expect(open.describe().wiring.length).toBeGreaterThan(0)
  })

  test('suppression is MARKED, so it does not read as absence', async () => {
    /*
     * The CHANGELOG promises a suppressed harvest keeps `secret: true`. That
     * held only for elements whose secrecy comes from their own kind (a
     * password input, a `data-tosi-secret` node) — `describeElement` sets the
     * flag there. An element merely BOUND to a secret path is not a secret
     * control, so its text was correctly withheld while the record said
     * nothing: an agent could not tell "no text" from "text withheld".
     */
    tosi({ mark: { token: 'eyJ-MARK-SECRET' } })
    await updates()
    const pw = elements.input({ type: 'password' })
    document.body.append(pw)
    bind(pw, 'mark.token', bindings.value)
    const mirror = elements.div({ id: 'mark-mirror' })
    document.body.append(mirror)
    bind(mirror, 'mark.token', {
      toDOM(el: any, v: any) {
        el.textContent = v
      },
    })
    await updates()

    const agent = (current = enableAgentInterface({
      quiet: true,
      global: false,
      expose: 'all',
    }))
    const rec = (agent.describe().wiring as any[]).find(
      (w) => w.id === 'mark-mirror'
    )
    expect(rec).toBeDefined() // the element is still ON the map
    expect(JSON.stringify(rec)).not.toContain('eyJ-MARK-SECRET')
    expect(rec.secret).toBe(true) // …and says why its content is missing
  })

  test('a MANIFEST closes the DOM walk too, not just the closed default', async () => {
    /*
     * Re-review B-1 — the manifest twin of the closed-posture fixture above.
     *
     * The first fix put ONE gate on the walk keyed to `closed`, and I asserted
     * in the commit message that this was the durable fix because it could not
     * drift out of sync. It was durable for exactly one posture. The MANIFEST
     * posture — the one the docs call the production floor, and the one where
     * `tosi_read` is actually published — kept handing over a token in an
     * href, a user's live contenteditable text, a private component's action
     * namespace, and the rendered text of a binding `read()` refuses.
     *
     * Nothing broke when this was gated because no test exercised these shapes
     * under a manifest at all: both were tested only under `expose: 'all'`.
     * That absence is what this test is.
     */
    tosi({ mApp: { cart: 2 }, mPriv: { csrf: 'CSRF-TOKEN-8f31' } })
    await updates()
    const declared = elements.input({ id: 'm-declared' })
    const link = elements.a(
      { id: 'm-link', href: '/reset?t=RESET-TOKEN' },
      'go'
    )
    const draft = elements.div(
      { id: 'm-draft', contentEditable: 'true' },
      'patient SSN 123-45-6789'
    )
    // bound to an UNDECLARED path: its rendered text is a value read() refuses
    const mirror = elements.div({ id: 'm-mirror' })
    /*
     * The element that makes the GUARD matter, as opposed to the `wired`
     * gates: bound to a DECLARED path (so it legitimately earns a place on the
     * map) AND to an undeclared one whose value it renders as text. The `wired`
     * gates cannot drop this — it is properly in scope — so only a guard that
     * can SEE the out-of-scope binding stops its text going out. `boundPaths`
     * is built after the publishing loop's `if (!inScope) continue`, so the
     * guard was blind to precisely that binding.
     */
    const both = elements.div({ id: 'm-both' })
    document.body.append(declared, link, draft, mirror, both)
    bind(declared, 'mApp.cart', bindings.value)
    bind(mirror, 'mPriv.csrf', {
      toDOM(el: any, v: any) {
        el.textContent = v
      },
    })
    bind(both, 'mApp.cart', { toDOM() {} })
    bind(both, 'mPriv.csrf', {
      toDOM(el: any, v: any) {
        el.textContent = v
      },
    })
    // a self-declaring PRIVATE component: its contract is the component
    // author's declaration, not the app author's grant
    const { Component } = await import('./component')
    class MPriv extends (Component as any) {
      static preferredTagName = 'm-priv-widget'
      static contract = {
        description: 'internal admin panel — MANIFEST-KILL-SWITCH',
        actions: { wipe: {} },
      }
      content = null
    }
    const widget = MPriv.elementCreator()() as any
    document.body.append(widget)
    await updates()
    for (const el of [declared, link, draft, mirror, both, widget]) {
      Object.defineProperty(el, 'getBoundingClientRect', {
        value: () => ({ x: 0, y: 0, width: 200, height: 30 }),
        configurable: true,
      })
    }

    const agent = (current = enableAgentInterface({
      quiet: true,
      global: false,
      expose: { roots: ['mApp'] },
    }))
    expect(agent.describe().exposure).toBe('manifest')
    expect(() => agent.read('mPriv.csrf')).toThrow(/not exposed/)
    const json = JSON.stringify(agent.describe())
    // …and describe() must agree with read(), through tosi_describe, which is
    // published in EVERY posture
    for (const leak of [
      'RESET-TOKEN',
      '123-45-6789',
      'CSRF-TOKEN-8f31',
      'mPriv.csrf',
      'MANIFEST-KILL-SWITCH',
    ]) {
      expect(json).not.toContain(leak)
    }
    // the dual-bound element IS on the map (its declared binding earns that)
    // — with its out-of-scope value withheld, which is the guard's job
    const bothRec = (agent.describe().wiring as any[]).find(
      (w) => w.id === 'm-both'
    )
    expect(bothRec).toBeDefined()
    expect(JSON.stringify(bothRec)).not.toContain('CSRF-TOKEN-8f31')
    // POSITIVE CONTROL: the declared root is still fully described, so the
    // assertions above are about scope and not about an empty map
    expect(json).toContain('mApp.cart')
    expect((agent.describe().wiring as any[]).length).toBeGreaterThan(0)
  })

  test('aria-labelledby/describedby cannot launder a secret', async () => {
    /*
     * Re-review M-2. `record.label` and `record.description` are built by
     * following an id reference to ANY node in the document — while every
     * other secrecy guard is a SUBTREE query, so a referenced node outside the
     * element's own subtree was invisible to all of them. A heading labelled
     * from a `data-tosi-secret` span published the secret as its label, and an
     * element whose own record was correctly suppressed had its content
     * republished as a neighbour's label.
     */
    tosi({ ariaApp: { n: 1 } })
    await updates()
    const secret = elements.span({ id: 'aria-secret' }, 'ARIA-LAUNDERED')
    secret.setAttribute('data-tosi-secret', '')
    const plain = elements.span({ id: 'aria-plain' }, 'ARIA-ORDINARY')
    const viaLabel = elements.input({
      id: 'aria-l',
      'aria-labelledby': 'aria-secret',
    })
    const viaDesc = elements.input({
      id: 'aria-d',
      'aria-describedby': 'aria-secret',
    })
    const control = elements.input({
      id: 'aria-ok',
      'aria-labelledby': 'aria-plain',
    })
    document.body.append(secret, plain, viaLabel, viaDesc, control)
    for (const el of [viaLabel, viaDesc, control]) {
      bind(el, 'ariaApp.n', bindings.value)
    }
    await updates()

    const agent = (current = enableAgentInterface({
      quiet: true,
      global: false,
      expose: 'all', // the WIDEST posture: secrecy is the only guard left
    }))
    const json = JSON.stringify(agent.describe())
    expect(json).not.toContain('ARIA-LAUNDERED')
    // POSITIVE CONTROL — ordinary references still resolve, or this test
    // would pass by breaking the accessible-name harvest entirely
    expect(json).toContain('ARIA-ORDINARY')
  })

  test('every accessible-name source obeys secrecy and scope', async () => {
    /*
     * Round 3, B-1. `record.label` has THREE sources and the previous round
     * guarded exactly one. `associatedLabel()` — `<label for=…>` and a
     * wrapping `<label>`, the most common naming idiom in real HTML — had no
     * guard of any kind, and `harvestWouldLeak` could never have caught it:
     * its DOM arm is a SUBTREE query on an `<input>`, which has no children.
     *
     * All three sources now run through one `ContentGuard` threaded into
     * `describeElement`, rather than a fourth per-site restatement. This is
     * the matrix: {label[for], wrapping label, aria-labelledby,
     * aria-describedby} × {out-of-scope, secret}.
     */
    tosi({ nApp: { qty: 1 }, nPriv: { tok: 'NAME-SCOPE-LEAK' } })
    await updates()
    const mk = (id: string, path: string) => {
      const s = elements.span({ id })
      bind(s, path, bindings.text)
      return s
    }
    // (a) label[for] wrapping a span bound OUT OF SCOPE
    const la = elements.label('Qty ', mk('n-a', 'nPriv.tok'))
    la.setAttribute('for', 'n-in-a')
    const ia = elements.input({ id: 'n-in-a' })
    // (b) WRAPPING label containing an author-marked secret
    const sec = elements.span('NAME-SECRET-LEAK')
    sec.setAttribute('data-tosi-secret', '')
    const ib = elements.input({ id: 'n-in-b' })
    const lb = elements.label('Key: ', sec, ib)
    // (c) aria-labelledby, (d) aria-describedby
    const ic = elements.input({ id: 'n-in-c', 'aria-labelledby': 'n-c' })
    const idd = elements.input({ id: 'n-in-d', 'aria-describedby': 'n-d' })
    // POSITIVE CONTROL: an ordinary label must still name its control
    const lok = elements.label('Ordinary Name ', elements.input({ id: 'n-ok' }))
    document.body.append(
      la,
      ia,
      lb,
      mk('n-c', 'nPriv.tok'),
      ic,
      mk('n-d', 'nPriv.tok'),
      idd,
      lok
    )
    for (const el of [ia, ib, ic, idd, lok.querySelector('input')!]) {
      bind(el as any, 'nApp.qty', bindings.value)
    }
    await updates()

    const agent = (current = enableAgentInterface({
      quiet: true,
      global: false,
      expose: { roots: ['nApp'] },
    }))
    const json = JSON.stringify(agent.describe())
    expect(() => agent.read('nPriv.tok')).toThrow(/not exposed/)
    // no name source may carry it out
    expect(json).not.toContain('NAME-SCOPE-LEAK')
    // …and the author's own opt-in holds in every posture
    expect(json).not.toContain('NAME-SECRET-LEAK')
    // POSITIVE CONTROL — without this, breaking the name harvest outright
    // would pass every assertion above
    expect(json).toContain('Ordinary Name')
  })

  test('a wired ancestor cannot publish a bound DESCENDANT it may not read', async () => {
    /*
     * Round 3, B-2. `outOfScopeBinding` was element-local, and
     * `harvestWouldLeak`'s subtree arm matches secret CONTROLS and
     * `data-tosi-secret` marks — never a plain `<span>` merely BOUND to a
     * refused path. So a wrapper made `wired` by one in-scope handler
     * published its child's out-of-scope value in its own text, while the
     * child's own record was correctly suppressed: one response contradicting
     * itself. `contentWithheld` now walks the subtree's bindings.
     */
    tosi({ aApp: { n: 1 }, aPriv: { token: 'DESC-TOKEN-LEAK' } })
    await updates()
    const child = elements.span({ id: 'a-child' })
    bind(child, 'aPriv.token', bindings.text)
    const panel = elements.div({ id: 'a-panel' }, 'Session: ', child)
    const plain = elements.div({ id: 'a-plain' }, 'Ordinary panel text')
    document.body.append(panel, plain)
    on(panel, 'click', 'aApp.noop')
    on(plain, 'click', 'aApp.noop')
    await updates()

    const agent = (current = enableAgentInterface({
      quiet: true,
      global: false,
      expose: { roots: ['aApp'] },
    }))
    expect(() => agent.read('aPriv.token')).toThrow(/not exposed/)
    const json = JSON.stringify(agent.describe())
    expect(json).not.toContain('DESC-TOKEN-LEAK')
    // POSITIVE CONTROL: an ordinary wired panel still reports its text
    expect(json).toContain('Ordinary panel text')
  })

  test('the structural tier obeys scope, secrecy and aria-hidden', async () => {
    /*
     * Review B-2 — a FOURTH unguarded harvest, and the nastiest, because it
     * survives every posture including a correctly-narrowed manifest.
     *
     * `recordFor` guards its harvests and then RELEASES the elements it
     * rejected (`seen.delete`, "the structural tier may want it"). This loop
     * re-visited them and read `textContent` with no scope check, no secrecy
     * check and no aria-hidden check — defeating all three independently.
     */
    tosi({ sPub: { title: 'Public Title' }, sPriv: { key: 'sk-STRUCT-LEAK' } })
    await updates()
    const bad = elements.h2({ id: 's-bad' })
    const good = elements.h2({ id: 's-good' })
    const span = elements.span('ZX9-LAUNDERED')
    span.setAttribute('data-tosi-secret', '')
    const laundered = elements.h2({ id: 's-laundered' }, 'Recovery: ', span)
    const hidden = elements.h2(
      { id: 's-hidden', 'aria-hidden': 'true' },
      'HIDDEN-STRUCT'
    )
    const plain = elements.h2({ id: 's-plain' }, 'Ordinary Section')
    document.body.append(bad, good, laundered, hidden, plain)
    bind(bad, 'sPriv.key', bindings.text)
    bind(good, 'sPub.title', bindings.text)
    await updates()
    // happy-dom reports zero-size rects, which suppresses this tier here and
    // in no real browser — the leak was invisible locally for that reason
    for (const el of [bad, good, laundered, hidden, plain]) {
      Object.defineProperty(el, 'getBoundingClientRect', {
        value: () => ({ x: 0, y: 0, width: 200, height: 30 }),
        configurable: true,
      })
    }

    const agent = (current = enableAgentInterface({
      quiet: true,
      global: false,
      expose: { roots: ['sPub'] },
    }))
    const json = JSON.stringify(agent.describe())
    // SCOPE: read() refuses this path, so describe() must not print it
    expect(() => agent.read('sPriv.key')).toThrow(/not exposed/)
    expect(json).not.toContain('sk-STRUCT-LEAK')
    // SECRECY: the author's own opt-in, laundered through an ancestor heading
    expect(json).not.toContain('ZX9-LAUNDERED')
    // ARIA-HIDDEN: hidden from assistive tech means hidden here
    expect(json).not.toContain('HIDDEN-STRUCT')
    // POSITIVE CONTROLS — structure is still mapped, and a declared binding
    // still describes. Without these the three above pass on an empty map.
    expect(json).toContain('Ordinary Section')
    expect(json).toContain('Public Title')
  })

  test("expose: 'all' is the deliberate override — everything, with a warning", async () => {
    tosi({ postureAll: { n: 1, go() {} } })
    await updates()
    const warnings: string[] = []
    const original = console.warn
    console.warn = (...args: any[]) => warnings.push(args.map(String).join(' '))
    const { _resetPostureNotices } = await import('./agent')
    _resetPostureNotices() // the latch is once-per-process; spend it here
    let agent: ReturnType<typeof enableAgentInterface>
    try {
      agent = current = enableAgentInterface({ global: false, expose: 'all' })
    } finally {
      console.warn = original
    }
    agent!.write('postureAll.n', 7)
    expect(agent!.read('postureAll.n')).toBe(7)
    expect(agent!.describe().exposure).toBe('all')
    // asserted UNCONDITIONALLY — the old form was `… || warnings.length === 0`,
    // which passes even if the warning is deleted outright
    expect(warnings.some((w) => w.includes('WRITABLE'))).toBe(true)
    expect(warnings.some((w) => w.includes('any script on this page'))).toBe(
      true
    )
  })

  test('the closed-posture notice fires, names the escape hatches, and respects quiet', async () => {
    const { _resetPostureNotices } = await import('./agent')
    const { settings } = await import('./settings')
    tosi({ noticeApp: { n: 1 } })
    await updates()

    _resetPostureNotices()
    const infos: string[] = []
    const original = console.info
    console.info = (...args: any[]) => infos.push(args.map(String).join(' '))
    try {
      ;(current = enableAgentInterface({ global: false })).disable()
    } finally {
      console.info = original
    }
    expect(infos.some((i) => i.includes('nothing is exposed'))).toBe(true)
    expect(infos.some((i) => i.includes('expose'))).toBe(true)

    // …and settings.quiet actually silences it
    _resetPostureNotices()
    const quiet: string[] = []
    console.info = (...args: any[]) => quiet.push(args.map(String).join(' '))
    settings.quiet = true
    try {
      ;(current = enableAgentInterface({ global: false })).disable()
    } finally {
      console.info = original
      settings.quiet = false
      current = undefined
    }
    expect(quiet).toEqual([])
  })

  test('a manifest scopes SIGHT: readable and callable, but not writable until it says so', async () => {
    tosi({ postureManifest: { open: 1, secret: 'shh', go: () => 'ran' } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: {
        roots: ['postureManifest.open'],
        actions: ['postureManifest.go'],
      },
    }))
    expect(agent.describe().exposure).toBe('manifest')
    // the posture SEC-7 found missing: scoped reads WITHOUT writes. Narrowing
    // reads used to confer writes as a side effect, so the safest-sounding
    // option granted the most
    expect(agent.describe().writable).toBe(false)
    expect(agent.read('postureManifest.open')).toBe(1)
    expect(agent.call('postureManifest.go')).toBe('ran') // calls are separate
    expect(() => agent.write('postureManifest.open', 2)).toThrow(/reading only/)
    expect(agent.read('postureManifest.open')).toBe(1)
    // out of scope is still out of scope, whatever the write flag says
    expect(() => agent.read('postureManifest.secret')).toThrow(/not exposed/)
  })

  test('write: true is the explicit grant, and it does not widen scope', async () => {
    tosi({ postureWrite: { open: 1, secret: 'shh' } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: { roots: ['postureWrite.open'], write: true },
    }))
    expect(agent.describe().writable).toBe(true)
    agent.write('postureWrite.open', 2)
    expect(agent.read('postureWrite.open')).toBe(2)
    expect(() => agent.write('postureWrite.secret', 'x')).toThrow(/not exposed/)
  })

  test('SEC-9: a write cannot clobber a declared action that lives under a declared root', async () => {
    tosi({
      sec9: {
        data: 1,
        checkout: () => 'ok',
      },
    })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      // the shape the docs recommend: one root, actions inside it
      expose: { roots: ['sec9'], actions: ['sec9.checkout'], write: true },
    }))
    // writable() consulted the roots ONLY, so an action living under a
    // declared root was writable after all: this disabled the action…
    expect(() => agent.write('sec9.checkout', 'not code anymore')).toThrow(
      /callable, not writable/
    )
    // …and this wiped every action in one go
    expect(() => agent.write('sec9', {})).toThrow(/callable, not writable/)
    expect(agent.call('sec9.checkout')).toBe('ok')
    agent.write('sec9.data', 2) // ordinary state under the same root still writes
    expect(agent.read('sec9.data')).toBe(2)
  })
})

describe('the audit ledger is bounded (review M8)', () => {
  test('a long-lived surface does not grow without bound, and says when it dropped', async () => {
    tosi({ ledgerApp: { n: 0 } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
      maxLog: 50,
    }))
    const { cursor } = agent.changes()
    for (let i = 1; i <= 200; i++) {
      agent.write('ledgerApp.n', i)
      await updates()
    }
    // bounded…
    expect(agent.log().length).toBeLessThanOrEqual(50)
    // …and honest: a drain from before the trim admits it saw a window
    const drained = agent.changes(cursor)
    expect(drained.truncated).toBe(true)
    // seq stays monotonic, so cursors keep working
    expect(drained.cursor).toBeGreaterThanOrEqual(200)
    // a drain from a live cursor is complete and says nothing
    expect(agent.changes(drained.cursor).truncated).toBeUndefined()
  })
})

describe('list bindings on the agent surface (review M17)', () => {
  test('every rendered row is a record with its OWN resolved paths', async () => {
    const { listRows } = tosi({
      listRows: {
        items: [
          { id: 1, label: 'alpha', done: false },
          { id: 2, label: 'beta', done: true },
        ],
      },
    })
    await updates()
    const { ul } = elements
    const list = ul(
      ...(listRows.items as any).listBinding(
        ({ li, input: check, span }: any, item: any) =>
          li(
            check({ type: 'checkbox', bindValue: item.done }),
            span({ textContent: item.label })
          ),
        { idPath: 'id' }
      )
    )
    document.body.append(list)
    await updates()

    const agent = enableAgentInterface({ global: false, expose: 'all' })
    try {
      const wiring = agent.describe().wiring
      // one checkbox record per row, each bound to ITS OWN id-path
      const checks = wiring.filter((w) => w.type === 'checkbox')
      expect(checks.length).toBe(2)
      const paths = checks.map((w) => String(w.value))
      expect(paths.some((p) => p.includes('listRows.items[id=1].done'))).toBe(
        true
      )
      expect(paths.some((p) => p.includes('listRows.items[id=2].done'))).toBe(
        true
      )
      // live state per row, not the template's
      expect(
        checks.find((w) => String(w.value).includes('id=2'))?.checked
      ).toBe(true)
      // and an agent write reaches the right row
      agent.write('listRows.items[id=1].done', true)
      await updates()
      const after = agent
        .describe()
        .wiring.filter((w) => w.type === 'checkbox')
        .find((w) => String(w.value).includes('id=1'))
      expect(after?.checked).toBe(true)
    } finally {
      agent.disable()
      list.remove()
    }
  })

  test('a per-row inline contract survives cloning and is ENFORCED per row', async () => {
    const { rowContracts } = tosi({
      rowContracts: {
        items: [
          { id: 1, qty: 1 },
          { id: 2, qty: 2 },
        ],
      },
    })
    await updates()
    const { ul } = elements
    const list = ul(
      ...(rowContracts.items as any).listBinding(
        ({ li, input }: any, item: any) =>
          li(
            input({
              type: 'number',
              bindValue: item.qty,
              contract: { type: 'integer' },
            })
          ),
        { idPath: 'id' }
      )
    )
    document.body.append(list)
    await updates()

    const agent = enableAgentInterface({ global: false, expose: 'all' })
    try {
      // the template's contract reached EVERY cloned row (cloneWithBindings)
      const contract = agent.describe().contract ?? {}
      const keys = Object.keys(contract).filter((k) =>
        k.includes('rowContracts')
      )
      expect(keys.length).toBe(2)
      // …and it is enforced per row, not just declared
      expect(() =>
        agent.write('rowContracts.items[id=1].qty', 'not a number')
      ).toThrow(/contract/)
      agent.write('rowContracts.items[id=1].qty', 7)
      expect(agent.read('rowContracts.items[id=1].qty')).toBe(7)
    } finally {
      agent.disable()
      list.remove()
    }
  })
})

describe('review round 2: the surface must not leak or lie', () => {
  test('B2: manifest mode scopes HANDLERS, not just data bindings', async () => {
    tosi({
      scopePub: { n: 1 },
      scopePriv: { wipe() {}, token: 'sekrit' },
    })
    await updates()
    const publicBtn = elements.button('ok', { id: 'scope-public' })
    const privateBtn = elements.button('wipe', { id: 'scope-private' })
    on(publicBtn, 'click', 'scopePub.noop' as any)
    on(privateBtn, 'click', 'scopePriv.wipe' as any)
    document.body.append(publicBtn, privateBtn)
    await updates()

    const agent = (current = enableAgentInterface({
      global: false,
      expose: { roots: ['scopePub'], actions: ['scopePub.noop'] },
    }))
    const wiring = agent.describe().wiring
    const serialized = JSON.stringify(wiring)
    // the private action PATH must not appear anywhere in the map
    expect(serialized.includes('scopePriv.wipe')).toBe(false)
    // and the out-of-scope element contributes no harvested content
    expect(wiring.find((w) => w.id === 'scope-private')).toBeUndefined()
    // the allowlisted one is fully described
    expect(wiring.find((w) => w.id === 'scope-public')?.on?.click).toBe(
      'scopePub.noop'
    )
  })

  test('B3: a password value is NEVER emitted — the affordance still is', async () => {
    tosi({ secretApp: { password: 'hunter2', note: 'fine' } })
    await updates()
    const secret = elements.input({ type: 'password', id: 'pw' })
    const otp = elements.input({ id: 'otp', autocomplete: 'one-time-code' })
    const plain = elements.input({ id: 'plain' })
    document.body.append(secret, otp, plain)
    bind(secret, 'secretApp.password', bindings.value)
    bind(otp, 'secretApp.password', bindings.value)
    bind(plain, 'secretApp.note', bindings.value)
    await updates()

    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    const d = agent.describe()
    expect(JSON.stringify(d).includes('hunter2')).toBe(false)
    const pw = d.wiring.find((w) => w.id === 'pw')!
    expect(pw.secret).toBe(true)
    // the PATH still travels — an agent can see what it's bound to
    expect(String(pw.value)).toContain('secretApp.password')
    expect(d.wiring.find((w) => w.id === 'otp')?.secret).toBe(true)
    // a normal field is unaffected
    expect(String(d.wiring.find((w) => w.id === 'plain')?.value)).toContain(
      'fine'
    )
    for (const el of [secret, otp, plain]) el.remove()
  })

  test('B4: disable() and un-subscribe are idempotent and complete', async () => {
    tosi({ teardownApp: { n: 1 } })
    await updates()
    const agent = enableAgentInterface({ expose: 'all' })
    expect((globalThis as any).tosiAgent).toBe(agent)
    const off = agent.observe('teardownApp.n', () => {})
    off()
    expect(() => off()).not.toThrow() // second unsubscribe is a no-op

    agent.disable()
    expect(() => agent.disable()).not.toThrow() // second disable is a no-op
    expect((globalThis as any).tosiAgent).toBeUndefined()

    // a STALE surface must not delete the CURRENT surface's global
    const fresh = (current = enableAgentInterface({ expose: 'all' }))
    agent.disable()
    expect((globalThis as any).tosiAgent).toBe(fresh)
    fresh.disable()
    current = undefined
  })
})

describe('security pass (1.8.0): secrecy, scope, and the path sink', () => {
  test('SEC-8: a value cannot forge a provenance arrow', async () => {
    tosi({ sec8: { status: 'confirmed ⟷ spoof.orderStatus' } })
    await updates()
    // other suites leave elements in document.body, so this test identifies
    // its own by id rather than by tag
    const readout = elements.span({ id: 'sec8-readout' })
    const plain = elements.div(
      { id: 'sec8-plain' },
      'shipped ⟷ spoof.plainText'
    )
    document.body.append(readout, plain)
    bind(readout, 'sec8.status', bindings.text)
    await updates()

    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    const d = agent.describe()
    const bound = d.wiring.find((w) => w.id === 'sec8-readout')!
    // exactly ONE real arrow, and it is the one the surface put there
    // (text is a one-way binding, so the honest arrow is BOUND_TO_DOM)
    const text = String(bound.text)
    expect(text.split(BOUND_TO_DOM).length - 1).toBe(1)
    expect(text.includes(BOUND_TWO_WAY)).toBe(false) // the forged one is gone
    // and the real one is last, so the path parses correctly either way
    expect(text.endsWith('sec8.status')).toBe(true)
    // static page text is data too — no binding needed to forge one
    const forged = d.wiring.find((w) => w.id === 'sec8-plain')
    if (forged != null) {
      expect(String(forged.text).includes(BOUND_TWO_WAY)).toBe(false)
    }
    readout.remove()
    plain.remove()
  })

  test('SEC-10: one exotic element id does not blind the whole map', async () => {
    tosi({ sec10: { n: 1 } })
    await updates()
    const field = elements.input({ id: 'a"]b' })
    const ok = elements.input({ id: 'sec10-ok' })
    document.body.append(field, ok)
    bind(field, 'sec10.n', bindings.value)
    bind(ok, 'sec10.n', bindings.value)
    await updates()

    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    // the id was interpolated raw into `label[for="…"]`, so ONE bad id threw
    // and took describe(), the audit and the schematic down with it
    const d = agent.describe()
    expect(d.wiring.find((w) => w.id === 'sec10-ok')).toBeDefined()
    field.remove()
    ok.remove()
  })

  test('SEC-1: a path segment cannot walk the prototype chain', async () => {
    tosi({ protoApp: { cart: { total: 1 } } })
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: { roots: ['protoApp.cart'], write: true },
    }))
    expect(() => agent.write('protoApp.cart.__proto__.pwned', 'yes')).toThrow(
      /unsafe path segment/
    )
    expect(({} as any).pwned).toBeUndefined()
    // and the same guard covers the sink share()/sync() write through
    const { setByPath } = await import('./by-path')
    const target: any = {}
    expect(() => setByPath(target, 'constructor.prototype.x', 1)).toThrow(
      /unsafe path segment/
    )
    expect(({} as any).x).toBeUndefined()
  })

  test('SEC-2: a secret path is redacted by read, changes AND ancestor reads', async () => {
    tosi({ secretRead: { login: { user: 'ada', password: 'hunter2' } } })
    await updates()
    const field = elements.input({ type: 'password' })
    document.body.append(field)
    bind(field, 'secretRead.login.password', bindings.value)
    await updates()

    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    agent.describe() // the walk is what learns which paths are secret

    // the direct read is redacted…
    expect(agent.read('secretRead.login.password')).not.toBe('hunter2')
    // …and so is an ANCESTOR read, which used to hand back the whole subtree
    const parent = agent.read('secretRead.login')
    expect(JSON.stringify(parent).includes('hunter2')).toBe(false)
    expect(parent.user).toBe('ada') // non-secret siblings still readable
    // …and the turn drain
    agent.write('secretRead.login.password', 'newpass')
    await updates()
    const drained = agent.changes(0)
    expect(JSON.stringify(drained).includes('newpass')).toBe(false)
    field.remove()
  })

  test('SEC-2b: describe() must not publish what read() refuses', async () => {
    /*
     * THE BUG (pre-release review 1.8.3, B1). `boundValue()` redacted on the
     * DOM record's own `secret` flag and never consulted the PATH — violating
     * the invariant this module states out loud: secrecy is a property of the
     * path, not of a DOM record.
     *
     * Two shapes leaked, both in the READ-ONLY DEFAULT posture and both
     * through `tosi_describe` — the one WebMCP tool published in EVERY
     * posture, while `tosi_read` sits behind a gate precisely because reads
     * are considered too much to publish unasked.
     */
    const { secretDescribe } = tosi({
      secretDescribe: { session: { user: 'ada', token: 'eyJhbGciOi.SECRET' } },
    })
    void secretDescribe
    const pw = elements.input({ type: 'password' })
    document.body.append(pw)
    bind(pw, 'secretDescribe.session.token', bindings.value)

    // (a) bound to an ANCESTOR — serialised the whole subtree, secret included
    const viaAncestor = elements.button('Go', { id: 'via-ancestor' })
    document.body.append(viaAncestor)
    bind(viaAncestor, 'secretDescribe.session', bindings.enabled)

    // (b) bound to the EXACT secret path with a NON-VALUE binding, so nothing
    //     of the value reaches the DOM and record.secret is false
    const viaExact = elements.button('Go', { id: 'via-exact' })
    document.body.append(viaExact)
    bind(viaExact, 'secretDescribe.session.token', bindings.enabled)
    await updates()

    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: 'all',
    })) // read-only
    const description = agent.describe()

    // the whole description, not just the records we happen to look at
    expect(JSON.stringify(description)).not.toContain('eyJhbGciOi.SECRET')

    const wiring = description.wiring as any[]
    const ancestor = wiring.find((w) => w.id === 'via-ancestor')
    const exact = wiring.find((w) => w.id === 'via-exact')

    // an ancestor still describes its NON-secret siblings — redact, don't hide
    expect(ancestor.enabled).toContain('"user":"ada"')
    expect(ancestor.enabled).toContain('⟨secret⟩')
    // the exact path yields path-only, exactly as a direct read does
    expect(exact.enabled).not.toContain('eyJhbGciOi')
    expect(exact.enabled).toContain('secretDescribe.session.token')

    // and describe() must agree with read(), which is the whole point
    expect(agent.read('secretDescribe.session.token')).toBe('⟨secret⟩')
    expect(agent.read('secretDescribe.session')).toEqual({
      user: 'ada',
      token: '⟨secret⟩',
    })
  })

  test('SEC-2c: reading a list does not hand back the secrets inside it', async () => {
    /*
     * Review M4. Secrets are learned from bound controls, and a control in a
     * list template binds through the id-path form (`list[id=a1].pw`), while
     * redactWithin walked arrays by INDEX (`list.0.pw`) — the same location
     * under a different name. Nothing matched, so reading the parent array
     * returned every secret it contained in cleartext.
     */
    const { secretList } = tosi({
      secretList: { rows: [{ id: 'r1', label: 'work', pw: 'hunter2' }] },
    })
    const container = elements.div(
      ...secretList.rows.tosi.listBinding(
        ({ div, input }: any) =>
          div(input({ type: 'password', bindValue: '^.pw' })),
        { idPath: 'id' }
      )
    )
    document.body.append(container)
    await updates()
    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: 'all',
    }))

    expect(agent.read('secretList.rows[id=r1].pw')).toBe('⟨secret⟩')
    // the parent read must agree — this is what leaked
    const rows = agent.read('secretList.rows') as any[]
    expect(rows[0].pw).toBe('⟨secret⟩')
    expect(rows[0].label).toBe('work') // non-secret fields still describe
    expect(JSON.stringify(agent.read('secretList'))).not.toContain('hunter2')
  })

  test('SEC-2d: a list WITHOUT idPath still redacts, and a null row does not crash', async () => {
    /*
     * Review round 2, B2 + B3 — both introduced or left open by the first
     * attempt at this fix, which descended by id-path ONLY.
     *
     * B2: a list with no idPath is a documented, supported configuration.
     * ListBinding names its rows `rows[0]`; the walk built `rows.0`, matched
     * nothing, and `read('rows')` returned every secret in cleartext.
     * B3: the id-path lookup called getByPath on the row unguarded, and
     * getByPath tolerates undefined but THROWS on null — so one null row took
     * read/describe/changes down for the whole page.
     */
    const { noIdList } = tosi({
      noIdList: { rows: [{ id: 'r1', label: 'work', pw: 'hunter2' }] },
    })
    document.body.append(
      elements.div(
        ...noIdList.rows.tosi.listBinding(({ div, input }: any) =>
          div(input({ type: 'password', bindValue: '^.pw' }))
        )
      )
    )
    await updates()
    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: 'all',
    }))
    expect(agent.read('noIdList.rows[0].pw')).toBe('⟨secret⟩')
    const rows = agent.read('noIdList.rows') as any[]
    expect(rows[0].pw).toBe('⟨secret⟩') // B2: leaked before
    expect(rows[0].label).toBe('work')
    expect(JSON.stringify(agent.read('noIdList'))).not.toContain('hunter2')
  })

  test('SEC-2e: a null row in an id-path list does not take the surface down', async () => {
    const { nullRow } = tosi({
      nullRow: {
        rows: [
          { id: 'a', pw: 'p1' },
          { id: 'b', pw: 'p2' },
        ],
      },
    })
    document.body.append(
      elements.div(
        ...nullRow.rows.tosi.listBinding(
          ({ div, input }: any) =>
            div(input({ type: 'password', bindValue: '^.pw' })),
          { idPath: 'id' }
        )
      )
    )
    await updates()
    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: 'all',
    }))
    expect(agent.read('nullRow.rows[id=a].pw')).toBe('⟨secret⟩')

    xin.nullRow.rows = [{ id: 'a', pw: 'p1' }, null]
    await updates()
    // all three threw `null is not an object` before the guard
    const read = agent.read('nullRow.rows') as any[]
    expect(read[0].pw).toBe('⟨secret⟩')
    expect(read[1]).toBe(null)
    expect(() => agent.describe()).not.toThrow()
    expect(() => agent.changes(0)).not.toThrow()
  })

  test('SEC-2f: descent ORs across spellings — two idPaths on one array', async () => {
    /*
     * Round 3, B1. The LEAF test was `candidates.some(isSecretPath)` but the
     * DESCENT was `candidates.find(containsSecret)` — it recursed under the
     * FIRST matching spelling only, so with two idPaths registered on one
     * array the secret under the other spelling came back in cleartext. Both
     * leaves redacted individually, which is exactly what hid it: every prior
     * test used a single spelling per array.
     *
     * ⚠️ WHAT THIS TEST ACTUALLY PINS: the OUTCOME, not the mechanism. It
     * fails when B1's loop AND B2's index-alias containment are both reverted;
     * it does NOT fail when only B1 is, because the containment independently
     * covers this shape. So the `for`-over-`find` change is defence in depth
     * here rather than load-bearing, and narrowing the containment later would
     * silently remove this test's grip on it. Stated because this release has
     * already shipped two guards that passed while the thing they named was
     * broken; a test whose coverage is narrower than its name is the same
     * defect one step earlier.
     */
    const { twoIds } = tosi({
      twoIds: { rows: [{ id: 'a1', uid: 'u1', pw: 'PW-SEC', tok: 'TOK-SEC' }] },
    })
    document.body.append(
      elements.div(
        ...twoIds.rows.tosi.listBinding(
          ({ div, input }: any) =>
            div(input({ type: 'password', bindValue: '^.pw' })),
          { idPath: 'id' }
        )
      ),
      elements.div(
        ...twoIds.rows.tosi.listBinding(
          ({ div, input }: any) =>
            div(input({ type: 'password', bindValue: '^.tok' })),
          { idPath: 'uid' }
        )
      )
    )
    await updates()
    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: 'all',
    }))
    expect(agent.read('twoIds.rows[id=a1].pw')).toBe('⟨secret⟩')
    expect(agent.read('twoIds.rows[uid=u1].tok')).toBe('⟨secret⟩')
    const rows = agent.read('twoIds.rows') as any[]
    expect(rows[0].pw).toBe('⟨secret⟩')
    expect(rows[0].tok).toBe('⟨secret⟩') // leaked before
    expect(JSON.stringify(agent.describe())).not.toContain('TOK-SEC')
  })

  test('SEC-2g: an index-spelled alias of a secret fails closed, including passively via changes()', async () => {
    /*
     * Round 3, B2. `rows[id=r1].pw` and `rows[0].pw` name the same value and
     * have no string-prefix relation. The passive case is the serious one:
     * tosijs's OWN id-path synthesis records both spellings on an ordinary
     * write, so changes() handed them over side by side with the agent
     * constructing nothing — and a manifest does not contain it, because the
     * aliased path is inside the declared root.
     */
    const { p4 } = tosi({
      p4: { rows: [{ id: 'r1', label: 'work', pw: 'hunter2' }] },
    })
    document.body.append(
      elements.div(
        ...p4.rows.tosi.listBinding(
          ({ div, input }: any) =>
            div(input({ type: 'password', bindValue: '^.pw' })),
          { idPath: 'id' }
        )
      )
    )
    await updates()
    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: { roots: ['p4'] },
    }))

    expect(agent.read('p4.rows[0].pw')).toBe('⟨secret⟩')
    expect(agent.read('p4.rows.0.pw')).toBe('⟨secret⟩')
    // an index-spelled ANCESTOR read still describes non-secret fields
    const row = agent.read('p4.rows[0]') as any
    expect(row.pw).toBe('⟨secret⟩')
    expect(row.label).toBe('work')

    xin.p4.rows[0].pw = 'rotated' // ordinary app write, no agent involvement
    await updates()
    const drained = agent.changes(0).changes
    expect(JSON.stringify(drained)).not.toContain('rotated')
    expect(drained.length).toBeGreaterThan(0)
  })

  test('SEC-2i: secrecy is inherited by DESCENDANTS of a secret path', async () => {
    /*
     * The ancestor-walk case, pinned because the suite could not see it.
     *
     * `isSecretPath` used to scan every known secret asking "is this one an
     * ancestor of the path being read?". Indexing that scan (to break the
     * quadratic read — see `secretAncestors`) rewrote it as a walk of the
     * READ path's ancestors, which is only equivalent if descendants of a
     * secret stay secret. A differential corpus of 45 queries said the two
     * were identical, and it was WRONG TO TRUST: mutating the walk down to a
     * single exact-match check changed nothing, because not one query in it
     * read BENEATH a secret path. This test is that missing query.
     *
     * The shape is real: an author marks a container `data-tosi-secret` and
     * binds it to a credentials OBJECT. Every field under it must inherit.
     */
    tosi({ inherit: { creds: { user: 'U', pass: 'P', deep: { k: 'K' } } } })
    await updates()
    const box = elements.div()
    box.setAttribute('data-tosi-secret', '')
    document.body.append(box)
    bind(box, 'inherit.creds', { toDOM() {} })
    await updates()

    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: 'all',
    }))
    expect(agent.read('inherit.creds.pass')).toBe(SECRET_SENTINEL_TEXT)
    // and ARBITRARILY DEEP beneath it, not just one level
    expect(agent.read('inherit.creds.deep.k')).toBe(SECRET_SENTINEL_TEXT)

    // a name-prefix SIBLING must not be swept up — `extendsPath` matches on
    // segment boundaries, and an index that used raw startsWith would redact
    // this and look like it was working
    tosi({ inheritOpen: { visible: 'V' } })
    await updates()
    expect(agent.read('inheritOpen.visible')).toBe('V')
  })

  test('SEC-2h: the live-DOM harvests do not publish what read() refuses', async () => {
    /*
     * Round 4, B-1 — the SAME invariant as SEC-2b, at a THIRD address.
     * `describe()` has three live-DOM harvests; the unbound-form-control one
     * gated on `record.secret`, and the static-text and contenteditable ones
     * gated on NOTHING. Three shapes leaked in the read-only default posture,
     * and no single signal covers them:
     *   - bound to a secret path but NOT itself a secret control (no flag);
     *   - a secret <select> that redacted `value` and printed the option text
     *     beside it, in the same object, having stamped itself secret:true;
     *   - a contenteditable carrying the author's own `data-tosi-secret`.
     */
    tosi({
      harvest: { token: 'eyJ-SUPER-SECRET', card: '4111 1111 1111 1111' },
    })
    await updates()

    // (a) bound to the secret path via a custom toDOM — no `secret` flag at all
    const pw = elements.input({ type: 'password' })
    document.body.append(pw)
    bind(pw, 'harvest.token', bindings.value)
    const mirror = elements.div({ id: 'h-mirror' })
    document.body.append(mirror)
    bind(mirror, 'harvest.token', {
      toDOM(el: any, v: any) {
        el.textContent = v
      },
    })

    // (b) a secret <select> whose OPTION TEXT is the secret
    const sel = elements.select(
      { id: 'h-sel', autocomplete: 'cc-number' },
      elements.option('4111 1111 1111 1111')
    )
    document.body.append(sel)
    bind(sel, 'harvest.card', bindings.value)

    // (c) the author's explicit opt-in on a contenteditable
    const ed = elements.div(
      { id: 'h-ed', contentEditable: 'true' },
      'sk-live-DEADBEEF'
    )
    ed.setAttribute('data-tosi-secret', '')
    document.body.append(ed)
    await updates()

    // `expose: 'all'` DELIBERATELY — this test is about redaction, and under
    // the 1.9.0 closed default the three not.toContain assertions below would
    // pass because the map is EMPTY. Redaction has to be exercised where it
    // is load-bearing: the widest posture. (The positive controls on `secret`
    // are what caught this when the default changed.)
    const agent = (current = enableAgentInterface({
      quiet: true,
      global: false,
      expose: 'all',
    }))
    const description = agent.describe()
    const json = JSON.stringify(description)

    expect(json).not.toContain('eyJ-SUPER-SECRET')
    expect(json).not.toContain('4111 1111 1111 1111')
    expect(json).not.toContain('sk-live-DEADBEEF')

    // suppression must not read as absence — the flag survives
    const wiring = description.wiring as any[]
    expect(wiring.find((w) => w.id === 'h-sel')?.secret).toBe(true)
    expect(wiring.find((w) => w.id === 'h-ed')?.secret).toBe(true)
    // and describe() still agrees with read()
    expect(agent.read('harvest.token')).toBe('⟨secret⟩')
  })

  test('SEC-3: secrets are not just <input type=password>, and manifest mode withholds unbound values', async () => {
    const hidden = elements.input({ type: 'hidden', id: 'csrf' })
    ;(hidden as any).value = 'CSRF-TOKEN-123'
    const card = elements.input({ id: 'card', autocomplete: 'cc-number' })
    ;(card as any).value = '4111111111111111'
    const marked = elements.textarea({ id: 'notes' })
    marked.setAttribute('data-tosi-secret', '')
    ;(marked as any).value = 'private notes'
    for (const el of [hidden, card, marked]) document.body.append(el)
    tosi({ sec3: { n: 1 } })
    await updates()
    for (const el of [hidden, card, marked]) {
      on(el as HTMLElement, 'change', 'sec3.noop' as any)
    }

    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    const d = agent.describe()
    const serialized = JSON.stringify(d)
    expect(serialized.includes('CSRF-TOKEN-123')).toBe(false)
    expect(serialized.includes('4111111111111111')).toBe(false)
    expect(serialized.includes('private notes')).toBe(false)
    expect(d.wiring.find((w) => w.id === 'csrf')?.secret).toBe(true)
    expect(d.wiring.find((w) => w.id === 'card')?.secret).toBe(true)
    expect(d.wiring.find((w) => w.id === 'notes')?.secret).toBe(true)
    for (const el of [hidden, card, marked]) el.remove()
  })

  test('SEC-4: a named plain function does not confer scope', async () => {
    tosi({ pub4: { ok: 1, noop() {} }, priv4: { pin: '4821-9930-1177' } })
    await updates()
    const leaky = elements.input({ id: 'leaky' })
    document.body.append(leaky)
    bind(leaky, 'priv4.pin', bindings.value)
    function addItem(): void {}
    on(leaky, 'input', addItem as any) // a NAMED plain function — our own idiom
    await updates()

    const agent = (current = enableAgentInterface({
      global: false,
      expose: { roots: ['pub4'], actions: ['pub4.noop'] },
    }))
    const d = agent.describe()
    const serialized = JSON.stringify(d)
    // the out-of-scope element must not appear, and its value must not leak
    expect(serialized.includes('4821-9930-1177')).toBe(false)
    expect(d.wiring.find((w) => w.id === 'leaky')).toBeUndefined()
    expect(() => agent.read('priv4.pin')).toThrow(/not exposed/)
    leaky.remove()
  })
})

describe('inline-contract lookup does not scan when nobody declared one', () => {
  test('a page with no inline contracts answers without touching the DOM', async () => {
    const { anyInlineContracts, setElementContract } = await import(
      './metadata'
    )
    // NB this is process-global and monotonic by design (a WeakMap cannot tell
    // us when an element is collected, and an undercount would skip a real
    // check) — so this test asserts the SHAPE, and tolerates other test files
    // having declared contracts before it ran.
    const probe = elements.input({ id: 'inline-probe' })
    const before = anyInlineContracts()
    setElementContract(probe, { type: 'string' })
    expect(anyInlineContracts()).toBe(true)
    // once true it stays true — over-scanning is the safe direction, because
    // under-scanning silently stops enforcing a contract someone declared
    expect(anyInlineContracts()).toBe(true)
    if (!before) {
      // we were the first: the flag genuinely flipped rather than being
      // already-on from another file
      expect(before).toBe(false)
    }
  })

  test('an inline contract still gates a write once one exists', async () => {
    tosi({ inlineGate: { qty: 1 } })
    await updates()
    const field = elements.input({
      id: 'inline-gate',
      contract: { type: 'number' },
    } as any)
    document.body.append(field)
    bind(field, 'inlineGate.qty', bindings.value)
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    // the early return must not skip a contract that IS declared
    expect(() => agent.write('inlineGate.qty', 'not a number')).toThrow(
      /contract/i
    )
    agent.write('inlineGate.qty', 7)
    expect(agent.read('inlineGate.qty')).toBe(7)
    field.remove()
  })
})

// The secret-path scan is cached against a binding generation counter, which
// is a performance optimisation sitting in a SECURITY path: a missed bump is
// an under-redaction. Measured win is modest (~24% per read on a 2000-element
// page under happy-dom), so the caching only earns its keep if these hold.
describe('secret redaction survives every way a control BECOMES secret', () => {
  // These five are the reproductions from the round-4 review, which BLOCKED
  // the release on a cache I added and defended. The cache keyed off a
  // binding-generation counter; three of these five are ATTRIBUTE changes on
  // an element that never re-binds, so no binding-shaped signal can see them
  // at all. Each asserts read() ALONE — no intervening describe(), no await
  // to step around a synchronous window, which is how the original two guard
  // tests missed it.
  const mountBound = async (path: string, props: any = {}) => {
    const el = elements.input(props)
    document.body.append(el)
    bind(el, path, bindings.value)
    await updates()
    return el
  }

  test('type flipped to password AFTER an earlier read', async () => {
    tosi({ becomeSecret1: { pw: 'hunter2' } })
    await updates()
    const el = await mountBound('becomeSecret1.pw', { type: 'text' })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    expect(agent.read('becomeSecret1.pw')).toBe('hunter2') // not secret yet
    el.setAttribute('type', 'password')
    ;(el as any).type = 'password'
    expect(agent.read('becomeSecret1.pw')).toBe(SECRET_SENTINEL_TEXT)
    el.remove()
  })

  test("data-tosi-secret added later — the author's explicit opt-in", async () => {
    tosi({ becomeSecret2: { pw: 'hunter2' } })
    await updates()
    const el = await mountBound('becomeSecret2.pw')
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    agent.read('becomeSecret2.pw')
    el.setAttribute('data-tosi-secret', '')
    expect(agent.read('becomeSecret2.pw')).toBe(SECRET_SENTINEL_TEXT)
    el.remove()
  })

  test('autocomplete becomes cc-* when a payment method is chosen', async () => {
    tosi({ becomeSecret3: { card: '4111111111111111' } })
    await updates()
    const el = await mountBound('becomeSecret3.card')
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    agent.read('becomeSecret3.card')
    el.setAttribute('autocomplete', 'cc-number')
    expect(agent.read('becomeSecret3.card')).toBe(SECRET_SENTINEL_TEXT)
    el.remove()
  })

  test('a SECOND binding on an already-mounted element (was permanent)', async () => {
    tosi({ becomeSecret4: { user: 'ada', pw: 'hunter2' } })
    await updates()
    const el = await mountBound('becomeSecret4.user', { type: 'password' })
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    agent.read('becomeSecret4.pw')
    // no DOM mutation follows this, so nothing would ever rescue a stale cache
    bind(el, 'becomeSecret4.pw', bindings.value)
    await updates()
    expect(agent.read('becomeSecret4.pw')).toBe(SECRET_SENTINEL_TEXT)
    el.remove()
  })

  test('same-task append after a detached bind — NO await', async () => {
    tosi({ becomeSecret5: { pw: 'hunter2' } })
    await updates()
    const el = elements.input({ type: 'password' })
    bind(el, 'becomeSecret5.pw', bindings.value)
    await updates()
    const agent = (current = enableAgentInterface({
      global: false,
      expose: 'all',
    }))
    agent.read('becomeSecret5.pw')
    document.body.append(el)
    // deliberately no await: a MutationObserver-based signal has not fired yet
    expect(agent.read('becomeSecret5.pw')).toBe(SECRET_SENTINEL_TEXT)
    el.remove()
  })
})

describe('attributes are described however they were declared (tosijs#29)', () => {
  /*
   * THE BUG: describe() read a component's attributes off `static contract`
   * alone, so a component using `static initAttributes` — the terse form
   * nearly every component uses, and the only one the component reference
   * documents — appeared in the map with NO attribute description at all.
   * The majority API was invisible to the feature 1.8.0 was named for.
   *
   * This pins the PROPERTY (the two forms describe equivalently), not the
   * implementation, because the property is what shipped broken.
   */
  test('initAttributes and contract.attributes produce equivalent descriptions', async () => {
    const { Component } = await import('./component')

    class EqInit extends (Component as any) {
      static preferredTagName = 'eq-init'
      static initAttributes = { label: '', count: 0, on: false }
      content = null
    }
    class EqContract extends (Component as any) {
      static preferredTagName = 'eq-contract'
      static contract = {
        attributes: {
          label: { type: 'string', default: '' },
          count: { type: 'number', default: 0 },
          on: { type: 'boolean', default: false },
        },
      }
      content = null
    }
    const initEl = EqInit.elementCreator()() as any
    const contractEl = EqContract.elementCreator()() as any
    tosi({ eqApp: { a: 'x', b: 'y' } })
    document.body.append(initEl, contractEl)
    // both must be WIRED — an unbound element is dropped from the map, which
    // is what made two earlier probes of this look like "neither works"
    bind(initEl, 'eqApp.a', bindings.value)
    bind(contractEl, 'eqApp.b', bindings.value)
    await updates()

    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: 'all',
    }))
    const wiring = agent.describe().wiring as any[]
    const viaInit = wiring.find((w) => w.tag === 'eq-init')
    const viaContract = wiring.find((w) => w.tag === 'eq-contract')

    expect(viaInit?.component?.attributes).toEqual(
      viaContract?.component?.attributes
    )
    // and it is the real description, not two matching absences
    expect(viaInit?.component?.attributes).toEqual({
      label: { type: 'string', default: '' },
      count: { type: 'number', default: 0 },
      on: { type: 'boolean', default: false },
    })
  })

  test('attributes alone never make an element wired — declaration is still the signal', async () => {
    const { Component } = await import('./component')
    class QuietThing extends (Component as any) {
      static preferredTagName = 'quiet-thing'
      static initAttributes = { label: '' }
      content = null
    }
    const el = QuietThing.elementCreator()() as any
    document.body.append(el)
    await updates()

    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: 'all',
    }))
    const tags = (agent.describe().wiring as any[]).map((w) => w.tag)
    // nothing binds it and it declares no contract, so it stays out of the
    // map. Otherwise every custom element on the page would flood it.
    expect(tags).not.toContain('quiet-thing')
  })
})

describe('paths may be proxies — the proxy already knows its own path', () => {
  /*
   * WHY THIS EXISTS. Every verb took a hand-written string, which duplicates
   * a fact the proxy holds, does not survive a rename, and is checked by
   * nothing. Worse, the OBJECT form silently half-worked: `roots: [app]`
   * reached String(), declared a root literally named "[object Object]",
   * matched no path, and every read then refused as out-of-scope — so the
   * manifest was broken and the error blamed the reader.
   *
   * These tests FAIL on the pre-1.11 code: the proxy forms threw
   * `path.startsWith is not a function`, and the plain-object form passed
   * while producing a surface that refused everything.
   */
  test('a manifest can be written with proxies instead of strings', async () => {
    const { proxied } = tosi({
      proxied: {
        count: 1,
        bump(this: any) {
          xin.proxied.count += 1
        },
      },
    })
    await updates()

    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: { roots: [proxied], actions: [proxied.bump] },
    }))

    // resolved to real paths, not "[object Object]"
    expect(agent.describe().exposure).toBe('manifest')
    expect(agent.read(proxied.count)).toBe(1)
    agent.call(proxied.bump)
    await updates()
    expect(agent.read('proxied.count')).toBe(2)
  })

  test('proxy and string forms are interchangeable in every verb', async () => {
    const { mixed } = tosi({ mixed: { a: 'x', list: [{ id: 1, t: 'one' }] } })
    await updates()
    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: { roots: ['mixed'], write: true },
    }))

    expect(agent.read(mixed.a)).toBe(agent.read('mixed.a'))
    expect(agent.read(mixed.list)).toEqual(agent.read('mixed.list'))

    const seen: string[] = []
    const off = agent.observe(mixed, (path) => seen.push(path))
    agent.write(mixed.a, 'y')
    await updates()
    off()
    expect(agent.read('mixed.a')).toBe('y')
    expect(seen.length).toBeGreaterThan(0)

    const settled = agent.when(mixed.a, (v) => v === 'z')
    agent.write('mixed.a', 'z')
    await updates()
    expect(await settled).toBe('z')
  })

  test('a non-proxy object is REFUSED, not stringified', async () => {
    tosi({ strict: { a: 1 } })
    await updates()

    // the manifest fails where the mistake is — at enable time
    expect(() =>
      enableAgentInterface({ quiet: true, expose: { roots: [{} as any] } })
    ).toThrow(/takes a path string .* or a tosijs proxy/)

    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: { roots: ['strict'] },
    }))
    expect(() => agent.read({} as any)).toThrow(/carries none/)
    // a value read OUT of the tree is not a proxy — the classic near-miss
    expect(() => agent.read(1 as any)).toThrow(/got number/)
  })

  test('the refusal is tagged, so callers need not match its wording', async () => {
    const { tagged } = tosi({ tagged: { a: 1 } })
    await updates()
    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: { roots: [tagged] },
    }))
    const { isAgentRefusal } = await import('./agent')
    try {
      agent.read({} as any)
      throw new Error('should have refused')
    } catch (e) {
      expect(isAgentRefusal(e)).toBe(true)
      expect((e as any).tosiRefusal).toBe('path')
    }
  })
})

describe('observe() patterns: allowed wide open, refused under a manifest', () => {
  /*
   * REGRESSION GUARD. `observe()` was typed `(path: string, …)` but passed
   * its argument straight to the path-listener, which also accepts a RegExp
   * or a predicate — and the doc site's own "redraw on any change" examples
   * use `/./`. Nothing in the unit suite covered it, so widening the type to
   * accept proxies silently broke every one of them; only the Playwright doc
   * lane caught it. An undocumented capability is still a capability.
   */
  test('a RegExp observer works under expose: all', async () => {
    tosi({ pat: { a: 1 } })
    await updates()
    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: 'all',
    }))
    const seen: string[] = []
    const off = agent.observe(/pat/, (path) => seen.push(path))
    xin.pat.a = 2
    await updates()
    off()
    expect(seen.length).toBeGreaterThan(0)
  })

  test('a predicate observer works under expose: all', async () => {
    tosi({ pred: { a: 1 } })
    await updates()
    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: 'all',
    }))
    const seen: string[] = []
    const off = agent.observe(
      (path: string) => path.startsWith('pred'),
      (path) => seen.push(path)
    )
    xin.pred.a = 2
    await updates()
    off()
    expect(seen.length).toBeGreaterThan(0)
  })

  test('a pattern is REFUSED under a manifest — it cannot be scope-checked', async () => {
    const { scopedPat } = tosi({ scopedPat: { a: 1 } })
    await updates()
    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: { roots: [scopedPat] },
    }))
    // it used to throw a raw `path.startsWith is not a function` here
    expect(() => agent.observe(/./, () => {})).toThrow(/cannot be checked/)
    try {
      agent.observe(/./, () => {})
    } catch (e) {
      expect((e as any).tosiRefusal).toBe('scope')
    }
    // the path form is unaffected
    const off = agent.observe(scopedPat, () => {})
    off()
  })
})

describe('disable() revokes the capability, not just the global', () => {
  /*
   * THE BUG. disable() tore down everything AROUND the surface — observers,
   * pending when()s, the WebMCP registration, the global — and left the verbs
   * working on the handle the caller already held. Because
   * enableAgentInterface() auto-disables the previous surface, TIGHTENING a
   * posture at runtime left the old, wider surface fully usable by anyone
   * holding it. The delegate's own comment already claimed "Disabled means
   * REFUSED"; only the delegate honoured it.
   */
  test('every verb refuses after disable()', async () => {
    tosi({ revoked: { a: 1, act() {} } })
    await updates()
    const agent = enableAgentInterface({
      quiet: true,
      expose: { roots: ['revoked'], actions: ['revoked.act'], write: true },
    })
    // it works while live
    expect(agent.read('revoked.a')).toBe(1)
    agent.disable()

    for (const attempt of [
      () => agent.read('revoked.a'),
      () => agent.write('revoked.a', 2),
      () => agent.call('revoked.act'),
      () => agent.observe('revoked', () => {}),
      () => agent.describe(),
      () => agent.changes(),
    ]) {
      let refusal: any
      try {
        attempt()
      } catch (e) {
        refusal = e
      }
      expect(refusal?.tosiRefusal).toBe('revoked')
    }
    // when() REJECTS — it does not throw synchronously. Asserted WITHOUT
    // await, because `try { await … } catch` catches both and so proves
    // nothing: the previous version of this test passed against a guard that
    // threw synchronously, while its own comment and the CHANGELOG both
    // promised a rejection. `.catch()` on a sync throw never runs.
    const pending = agent.when('revoked.a', () => true)
    expect(typeof (pending as any)?.then).toBe('function')
    let whenRejection: any
    await pending.catch((e) => {
      whenRejection = e
    })
    expect(whenRejection?.tosiRefusal).toBe('revoked')

    // log() is DELIBERATELY still readable: revoke, then audit what happened.
    // The ledger is closed over, so refusing here would leave no door at all,
    // and a historical record grants no capability.
    expect(Array.isArray(agent.log())).toBe(true)

    // and the state was never touched by the refused write
    expect(xin.revoked.a).toBe(1)
  })

  test('narrowing a posture revokes the wider surface someone still holds', async () => {
    tosi({ narrowing: { secretish: 'shh', ok: 1 } })
    await updates()
    const wide = enableAgentInterface({ quiet: true, expose: 'all' })
    expect(wide.read('narrowing.secretish')).toBe('shh')

    // the app tightens up; enableAgentInterface disables `wide` for us
    const narrow = (current = enableAgentInterface({
      quiet: true,
      expose: { roots: ['narrowing.ok'] },
    }))
    expect(narrow.read('narrowing.ok')).toBe(1)

    // the OLD handle must not still be a skeleton key
    expect(() => wide.read('narrowing.secretish')).toThrow(/been disabled/)
  })

  test('disable() is still idempotent', async () => {
    tosi({ idem: { a: 1 } })
    await updates()
    const agent = enableAgentInterface({ quiet: true, expose: 'all' })
    agent.disable()
    expect(() => agent.disable()).not.toThrow()
  })
})

describe('observe() must never INVOKE what you asked it to watch', () => {
  /*
   * THE BUG the proxy widening introduced. A boxed proxy over a function
   * reports `typeof === 'function'` (xin returns a Proxy over
   * `value.bind(target)`, and a Proxy preserves its target's typeof), so
   * `observe(app.action, cb)` classified the ACTION as a filter predicate and
   * the path-listener CALLED it on every settled touch — no assertScope, no
   * assertMutable('call'), and no `call:` entry in the ledger, so the
   * invocations were invisible to audit. Typechecked clean: AgentObserveRef
   * admits it as the predicate arm.
   */
  test('observing an action proxy watches its path and does not call it', async () => {
    let invocations = 0
    const { watched } = tosi({
      watched: {
        n: 0,
        act() {
          invocations += 1
        },
      },
    })
    await updates()
    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: 'all',
    }))
    const seen: string[] = []
    const off = agent.observe(watched.act, (path) => seen.push(path))
    for (let i = 1; i <= 5; i++) {
      xin.watched.n = i
      await updates()
    }
    off()
    // the action was never run...
    expect(invocations).toBe(0)
    // ...and nothing on an unrelated path masqueraded as its notification
    expect(seen.every((p) => p.startsWith('watched.act'))).toBe(true)
  })

  test('under a manifest, an action proxy is a PATH — not a rejected pattern', async () => {
    let invocations = 0
    const { scopedAct } = tosi({
      scopedAct: {
        go() {
          invocations += 1
        },
      },
    })
    await updates()
    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: { roots: ['scopedAct'], actions: ['scopedAct.go'] },
    }))
    // it used to be refused here with a message about patterns, told to a
    // caller who had passed an ordinary path ref — the two postures
    // disagreed about what observe(proxy) even meant
    const off = agent.observe(scopedAct.go, () => {})
    off()
    expect(invocations).toBe(0)
  })
})

describe('secrets inside SHADOW ROOTS are redacted too', () => {
  /*
   * THE HOLE, latent since 1.8.0. Every secret scan used
   * `document.querySelectorAll` / `closest`, which stop at a shadow
   * boundary — while the WRITE path deliberately crosses it
   * (bind.ts's closestAcrossShadow). So typing into a password field inside
   * a styled Component wrote to state normally and the redaction never saw
   * the element: read(), changes() and describe() all returned cleartext,
   * against a guarantee agent.ts states unconditionally.
   *
   * It could not have been caught here before: ~15 secret tests, and not one
   * `attachShadow`. happy-dom does implement shadow roots, so this is a real
   * witness — but the browser lane is the authority for boundary behaviour.
   */
  const shadowPasswordHost = (path: string): HTMLElement => {
    const host = document.createElement('div')
    document.body.append(host)
    const root = host.attachShadow({ mode: 'open' })
    const pw = elements.input({ type: 'password' })
    root.append(pw)
    bind(pw, path, bindings.value)
    return host
  }

  test('read() redacts a password bound inside a shadow root', async () => {
    tosi({ shadowCreds: { password: 'hunter2', user: 'ada' } })
    await updates()
    const host = shadowPasswordHost('shadowCreds.password')
    await updates()
    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: 'all',
    }))
    expect(agent.read('shadowCreds.password')).toBe(SECRET_SENTINEL_TEXT)
    // an ANCESTOR read must not hand back what a direct read refuses
    expect(agent.read('shadowCreds')).toEqual({
      password: SECRET_SENTINEL_TEXT,
      user: 'ada',
    })
    host.remove()
  })

  test('changes() does not leak the shadow-bound secret in a drain', async () => {
    const { drainCreds } = tosi({ drainCreds: { password: 'first' } })
    await updates()
    const host = shadowPasswordHost('drainCreds.password')
    await updates()
    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: 'all',
    }))
    const cursor = agent.changes().cursor
    drainCreds.password = 'second'
    await updates()
    const drained = agent.changes(cursor).changes
    const entry = drained.find((c: any) => c.path === 'drainCreds.password')
    expect(entry?.value).toBe(SECRET_SENTINEL_TEXT)
    expect(JSON.stringify(drained)).not.toContain('second')
    host.remove()
  })

  test('describe() does not publish it through the HOST element either', async () => {
    // THE REVIEW'S ACTUAL REPRODUCTION, and the supported pattern: a Component
    // with shadowStyleSpec, bound from OUTSIDE with bindings.value — exactly
    // what component.ts advises — whose shadow tree holds the password field.
    // The HOST carries the binding, so it lands in `wiring`, and the subtree
    // check that should withhold its content stopped at its own shadow
    // boundary: describe() published `value: "hunter2 <-> ..."`, the plaintext
    // itself, inside the output this module's docs say is designed to leave
    // the machine.
    //
    // A first draft of this test used a plain <div> host with the binding on
    // the shadow input instead. It passed against the BROKEN library — the
    // div was never wired, so it never entered the map and the assertion had
    // nothing to examine. An environment-suppressed assertion is a passing
    // test that proves nothing.
    const { Component } = await import('./component')
    class PwField extends (Component as any) {
      static preferredTagName = 'pw-field'
      static shadowStyleSpec = { ':host': { display: 'block' } }
      content = elements.input({ type: 'password', part: 'field' })
    }
    tosi({ hostCreds: { password: 'hunter2' } })
    await updates()
    const host = PwField.elementCreator()() as any
    document.body.append(host)
    bind(host, 'hostCreds.password', bindings.value)
    Object.defineProperty(host, 'getBoundingClientRect', {
      value: () => ({ x: 0, y: 0, width: 200, height: 30 }),
      configurable: true,
    })
    await updates()
    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: 'all',
    }))
    const described = JSON.stringify(agent.describe())
    // the host IS on the map — otherwise this test examines nothing
    expect(described).toContain('pw-field')
    expect(described).not.toContain('hunter2')
    host.remove()
  })

  test('the marker ON a shadow host covers its shadow tree', async () => {
    // THE CASE THE FIRST FIX MISSED. `deepQueryAll` recursed into
    // DESCENDANTS' shadow roots but never the root's own, and the test above
    // puts the marker on a wrapper CONTAINING the host — so it passed while
    // `<my-thing data-tosi-secret>`, the most natural place to put the
    // marker, still leaked. Fixing the instance you reproduced is not fixing
    // the class.
    tosi({ hostMark: { token: 'sekrit' } })
    await updates()
    const host = document.createElement('div')
    host.setAttribute('data-tosi-secret', '')
    document.body.append(host)
    const shadow = host.attachShadow({ mode: 'open' })
    const field = elements.input({ type: 'text' })
    shadow.append(field)
    bind(field, 'hostMark.token', bindings.value)
    await updates()
    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: 'all',
    }))
    expect(agent.read('hostMark.token')).toBe(SECRET_SENTINEL_TEXT)
    host.remove()
  })

  test('a light-DOM [data-tosi-secret] wrapper still covers shadow content', async () => {
    tosi({ wrapCreds: { token: 'sekrit' } })
    await updates()
    const wrapper = document.createElement('div')
    wrapper.setAttribute('data-tosi-secret', '')
    document.body.append(wrapper)
    const host = document.createElement('div')
    wrapper.append(host)
    const root = host.attachShadow({ mode: 'open' })
    const field = elements.input({ type: 'text' })
    root.append(field)
    bind(field, 'wrapCreds.token', bindings.value)
    await updates()
    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: 'all',
    }))
    // `closest` could never see the wrapper from inside the shadow tree
    expect(agent.read('wrapCreds.token')).toBe(SECRET_SENTINEL_TEXT)
    wrapper.remove()
  })
})

describe('redaction stays NARROW — fail-closed must not mean fail-everything', () => {
  /*
   * M1. The shadow-host walk went up EVERY host and took EVERY binding, so a
   * bound wrapper anywhere above a password field marked its whole root
   * secret and the surface answered ⟨secret⟩ to everything — permanently,
   * since secret paths are append-only for the session. Fail-closed, so never
   * a leak; a silent availability break instead, of the surface this release
   * exists to harden. The comment directly above that loop warned against
   * exactly it.
   */
  test('the walk stops at ONE shadow host — an outer component keeps its own value', async () => {
    // M1's actual shape: NESTED shadow hosts. The old walk climbed every host
    // to the top of the page, so an outer component's own bound value was
    // marked secret because something far below it, in a different shadow
    // tree, was a password field. A light-DOM wrapper was never the trigger —
    // the first draft of this test used one and passed against the bug.
    tosi({ compose: { password: 'hunter2', user: 'ada' } })
    await updates()
    const outerHost = elements.div()
    document.body.append(outerHost)
    const outerShadow = outerHost.attachShadow({ mode: 'open' })
    bind(outerHost, 'compose.user', bindings.value)

    const innerHost = document.createElement('div')
    outerShadow.append(innerHost)
    const innerShadow = innerHost.attachShadow({ mode: 'open' })
    const pw = elements.input({ type: 'password' })
    innerShadow.append(pw)
    bind(pw, 'compose.password', bindings.value)
    await updates()

    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: 'all',
    }))
    expect(agent.read('compose.password')).toBe(SECRET_SENTINEL_TEXT)
    // the OUTER component's value is not a secret and must still read
    expect(agent.read('compose.user')).toBe('ada')
    outerHost.remove()
  })

  test('a hidden input in a component does not redact the host binding', async () => {
    // input[type="hidden"] is in SECRET_CONTROL_SELECTOR, so the unbounded
    // walk let a component with an internal hidden input redact its own
    // bound value with no secret anywhere in sight
    tosi({ hiddenish: { label: 'ordinary' } })
    await updates()
    const host = elements.div()
    document.body.append(host)
    const shadow = host.attachShadow({ mode: 'open' })
    shadow.append(elements.input({ type: 'hidden' }))
    // a toDOM-only binding cannot be where a typed secret lands
    bind(host, 'hiddenish.label', bindings.text)
    await updates()
    const agent = (current = enableAgentInterface({
      quiet: true,
      expose: 'all',
    }))
    expect(agent.read('hiddenish.label')).toBe('ordinary')
    host.remove()
  })
})

/*
 * THE ATTRIBUTE HARVEST IS GUARDED TOO (1.11.0 remediation re-review, B1).
 *
 * `describeElement` received a ContentGuard and asked it only inside
 * `referencedText()` and `associatedLabel()`, so `href`, `placeholder`,
 * `title`-as-label and `checked` were published in cleartext past
 * `data-tosi-secret` — beside a `text` on the SAME record that had been
 * correctly withheld. Reachable through `tosi_describe`, which `webmcp.ts`
 * registers unconditionally while gating `tosi_read`, so the value the read
 * gate withholds reached a model-context host anyway.
 *
 * The seventh address of the invariant the ContentGuard exists to close, and
 * the same wording as the 1.8.3 blocker.
 *
 * THESE ASSERT ON THE TOKEN SUBSTRING IN THE WHOLE SERIALISED MAP, not on a
 * named field. The previous fixtures used UNWIRED anchors, so they passed for
 * a reason unrelated to secrecy and could not have caught this. A substring
 * assertion over `JSON.stringify(describe())` is inherited automatically by
 * whatever harvest someone adds next.
 */
describe('describe(): secrecy covers the ATTRIBUTE harvest, not just text', () => {
  const rect = (el: Element): Element =>
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ x: 0, y: 0, width: 200, height: 30 }),
      configurable: true,
    })

  test('no token survives describe(), in any of four harvests', async () => {
    document.body.innerHTML = ''
    const { sec } = tosi({ sec: { name: 'Ada', tick: false } })
    await updates()

    // (a) marker on an ANCESTOR region — this one also published NO
    //     `secret: true`, so the suppression read as plain absence
    const region = elements.div({ 'data-tosi-secret': '' })
    const inRegion = elements.a(
      { href: 'https://x/reset?token=TOKEN-AAA', bindText: sec.name },
      'go'
    )
    region.append(inRegion)
    // (b) marker directly on the anchor
    const marked = elements.a({
      'data-tosi-secret': '',
      href: '/reset?t=TOKEN-BBB',
      bindText: sec.name,
    })
    // (c) placeholder and (d) title, on a marked control
    const field = elements.input({
      'data-tosi-secret': '',
      placeholder: 'TOKEN-DDD',
      title: 'TOKEN-EEE',
      bindValue: sec.name,
    })
    document.body.append(region, marked, field)
    ;[inRegion, marked, field].forEach(rect)
    await updates()

    const agent = enableAgentInterface({
      quiet: true,
      expose: { roots: [sec] },
    })
    const json = JSON.stringify(agent.describe())
    for (const token of ['TOKEN-AAA', 'TOKEN-BBB', 'TOKEN-DDD', 'TOKEN-EEE']) {
      expect(json).not.toContain(token)
    }
    // and suppression must never read as absence
    const region_record = (agent.describe().wiring as any[]).find(
      (r) => r.tag === 'a' && r.text != null
    )
    expect(region_record?.secret).toBe(true)
    agent.disable()
  })

  test('a secret toggle does not publish its live state', async () => {
    document.body.innerHTML = ''
    const { sec2 } = tosi({ sec2: { on: true } })
    await updates()
    const cb = elements.input({
      type: 'checkbox',
      'data-tosi-secret': '',
      bindValue: sec2.on,
    })
    document.body.append(cb)
    rect(cb)
    ;(cb as any).checked = true
    await updates()
    const agent = enableAgentInterface({
      quiet: true,
      expose: { roots: [sec2] },
    })
    const rec = (agent.describe().wiring as any[]).find(
      (r) => r.type === 'checkbox'
    )
    expect(rec?.secret).toBe(true)
    expect(rec?.checked).toBeUndefined()
    agent.disable()
  })

  test('AND ORDINARY MAP DATA SURVIVES — the over-redaction control', async () => {
    /*
     * The other half, and the reason this uses `referencedNodeIsSecret` rather
     * than the `contentWithheld` guard the other harvests use: that guard
     * answers secrecy AND SCOPE, so routing `href` through it would strip the
     * destination from every link outside the exposed roots. Over-redaction is
     * the failure this class produced in 1.10.0, where one password field
     * marked a whole state root secret, permanently.
     */
    document.body.innerHTML = ''
    const { ord } = tosi({ ord: { name: 'Ada' } })
    await updates()
    const link = elements.a({ href: '/docs', bindText: ord.name }, 'Docs')
    const input = elements.input({
      placeholder: 'your email',
      title: 'Email',
      bindValue: ord.name,
    })
    const toggle = elements.input({ type: 'checkbox', bindValue: ord.name })
    const password = elements.input({
      type: 'password',
      'aria-label': 'Password',
      bindValue: ord.name,
    })
    document.body.append(link, input, toggle, password)
    ;[link, input, toggle, password].forEach(rect)
    ;(toggle as any).checked = true
    await updates()

    const agent = enableAgentInterface({ quiet: true, expose: 'all' })
    const w = agent.describe().wiring as any[]
    expect(w.find((r) => r.href === '/docs')).toBeDefined()
    expect(w.find((r) => r.placeholder === 'your email')).toBeDefined()
    expect(w.find((r) => r.label === 'Email')).toBeDefined()
    expect(w.find((r) => r.checked === true)).toBeDefined()
    // a password keeps its NAME while losing its content: dropping the name
    // would trade a leak for a false `anonymous-affordance` on every secret
    // control in the app
    const pw = w.find((r) => r.type === 'password')
    expect(pw?.label).toBe('Password')
    expect(pw?.secret).toBe(true)
    agent.disable()
  })
})

test('the two provenance tokens are declared once, not twice (floorplan#4 class)', async () => {
  /*
   * `BOUND_TWO_WAY`/`BOUND_TO_DOM` exist in BOTH src/agent.ts (what describe()
   * emits) and src/schematic.ts (what the now-EXPORTED isInteractive matches
   * against). Two independently-maintained copies of the exact constant whose
   * duplication WAS the mechanism of floorplan#4 — and 1.11.0 makes the
   * consumer of one copy public while exporting only the other. Coverage
   * existed but was incidental, riding on audit fixtures.
   */
  const schematic = await import('./schematic')
  expect(BOUND_TWO_WAY).toBe(schematic.BOUND_TWO_WAY)
  expect(BOUND_TO_DOM).toBe(schematic.BOUND_TO_DOM)
})
