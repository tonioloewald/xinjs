import { test, expect, describe } from 'bun:test'
import { auditAccessibility, auditFlags, contrastRatio } from './audit'
import { BOUND_TWO_WAY } from './agent'
import type { AgentDescription } from './agent'

const map = (wiring: any[]): AgentDescription =>
  ({
    version: { surface: '1.0.0', tosijs: 'test', capabilities: [] },
    roots: {},
    actions: [],
    exposure: 'all',
    wiring,
  } as AgentDescription)

const box = (extra: any = {}) => ({
  bounds: { x: 0, y: 0, width: 100, height: 40 },
  ...extra,
})

describe('auditAccessibility — the lint the map made obvious', () => {
  test('anonymous affordance: wired, but nothing announces it', () => {
    const report = auditAccessibility(
      map([
        box({ tag: 'div', on: { click: 'app.go' } }), // nameless
        box({ tag: 'button', text: 'Save', on: { click: 'app.save' } }), // fine
      ])
    )
    const anon = report.findings.filter(
      (f) => f.rule === 'anonymous-affordance'
    )
    expect(anon.length).toBe(1)
    expect(anon[0].index).toBe(0)
    expect(anon[0].severity).toBe('error')
    expect(report.failed).toBeGreaterThan(0)
  })

  test('unnameable action: an anonymous handler is a dead end for agents', () => {
    const report = auditAccessibility(
      map([
        box({ tag: 'button', text: 'A', on: { click: 'ƒ' } }),
        box({ tag: 'button', text: 'B', on: { click: 'app.named' } }),
      ])
    )
    const found = report.findings.filter((f) => f.rule === 'unnameable-action')
    expect(found.length).toBe(1)
    expect(found[0].record.text).toBe('A')
  })

  test('missing role: a div that acts like a control', () => {
    const report = auditAccessibility(
      map([
        box({ tag: 'div', text: 'Delete', on: { click: 'app.del' } }),
        box({
          tag: 'div',
          text: 'Delete',
          role: 'button',
          on: { click: 'app.del' },
        }),
        box({ tag: 'button', text: 'Delete', on: { click: 'app.del' } }),
      ])
    )
    const found = report.findings.filter((f) => f.rule === 'missing-role')
    expect(found.length).toBe(1)
    expect(found[0].index).toBe(0)
  })

  test('contrast: measured with tosijs Color, and SKIPPED loudly without styles', () => {
    expect(Math.round(contrastRatio('#000', '#fff')!)).toBe(21)
    expect(contrastRatio('#777', '#fff')!).toBeLessThan(4.5)

    const styled = auditAccessibility(
      map([
        box({
          tag: 'button',
          text: 'faint',
          on: { click: 'a.x' },
          style: {
            color: 'rgb(170,170,170)',
            background: 'rgb(255,255,255)',
            borderColor: 'transparent',
          },
        }),
      ])
    )
    const contrast = styled.findings.filter((f) => f.rule === 'contrast')
    expect(contrast.length).toBe(1)
    expect(contrast[0].message).toContain(':1')

    // no styles in the map = the rule cannot run, and SAYS SO (a silent
    // pass would read as "no contrast problems")
    const unstyled = auditAccessibility(
      map([box({ tag: 'button', text: 'x' })])
    )
    expect(unstyled.skipped.some((s) => s.startsWith('contrast:'))).toBe(true)
  })

  test('target size honours the WCAG 2.5.8 inline exception; toggles exempt', () => {
    const report = auditAccessibility(
      map([
        {
          tag: 'button',
          on: { click: 'a.x' },
          label: 'delete',
          bounds: { x: 0, y: 0, width: 18, height: 18 },
        },
        {
          tag: 'a',
          href: '/x',
          text: 'a text link',
          bounds: { x: 0, y: 0, width: 60, height: 16 },
        },
        {
          tag: 'input',
          type: 'checkbox',
          value: 'true ⟷ a.on',
          bounds: { x: 0, y: 0, width: 13, height: 13 },
        },
      ])
    )
    const found = report.findings.filter((f) => f.rule === 'target-size')
    expect(found.length).toBe(1)
    expect(found[0].record.tag).toBe('button')
  })

  test('a placeholder is not a label', () => {
    const report = auditAccessibility(
      map([box({ tag: 'input', placeholder: 'Email', value: '⟷ app.email' })])
    )
    expect(
      report.findings.some((f) => f.rule === 'label-hidden-by-placeholder')
    ).toBe(true)
  })

  test('a clean map audits clean; exclude turns rules off', () => {
    const clean = auditAccessibility(
      map([
        box({
          tag: 'button',
          text: 'Save',
          on: { click: 'app.save' },
          style: {
            color: 'rgb(0,0,0)',
            background: 'rgb(255,255,255)',
            borderColor: 'transparent',
          },
        }),
      ])
    )
    expect(clean.findings).toEqual([])
    expect(clean.failed).toBe(0)

    const noisy = map([box({ tag: 'div', on: { click: 'ƒ' } })])
    expect(auditAccessibility(noisy).failed).toBeGreaterThan(0)
    expect(
      auditAccessibility(noisy, {
        exclude: ['anonymous-affordance', 'missing-role', 'unnameable-action'],
      }).findings
    ).toEqual([])
  })

  test('auditFlags feeds the schematic — findings become drawable', () => {
    const report = auditAccessibility(
      map([
        box({
          tag: 'button',
          text: 'faint',
          on: { click: 'a.x' },
          style: {
            color: 'rgb(200,200,200)',
            background: 'rgb(255,255,255)',
            borderColor: 'transparent',
          },
        }),
      ])
    )
    const flags = auditFlags(report)
    expect(flags[0]).toBeDefined()
    expect(flags[0][0].kind).toBe('contrast')
    expect(flags[0][0].label).toMatch(/[\d.]+:1/)
    expect(flags[0][0].severity).toBe('error')
  })
})

describe('contrast cannot be measured through transparency (round-2 review)', () => {
  test('a transparent background is reported as unmeasurable, not as black', () => {
    const report = auditAccessibility(
      map([
        box({
          tag: 'button',
          text: 'on the page background',
          on: { click: 'a.x' },
          // what getComputedStyle returns for "inherit from behind me"
          style: {
            color: 'rgb(17,17,17)',
            background: 'rgba(0, 0, 0, 0)',
            borderColor: 'transparent',
          },
        }),
      ])
    )
    // it used to score 1.11:1 and fire an ERROR on almost every element
    expect(report.findings.filter((f) => f.rule === 'contrast')).toEqual([])
    expect(report.skipped.some((s) => s.includes('transparent'))).toBe(true)
    expect(report.failed).toBe(0)
  })
})

describe('an empty map is not a clean bill of health', () => {
  test('auditing zero elements SAYS so instead of reporting no findings', () => {
    /*
     * 1.9.0's closed default means `describe()` over a bare surface returns no
     * wiring — so an audit examined ZERO elements and reported no findings,
     * which reads exactly like "your page is accessible". Same hazard as the
     * contrast skip: silence that looks like a pass.
     */
    const report = auditAccessibility({
      version: { surface: '1.0.0', tosijs: 'test', capabilities: [] },
      roots: {},
      actions: [],
      exposure: 'closed',
      wiring: [],
      writable: false,
    } as unknown as AgentDescription)
    expect(report.findings).toEqual([])
    expect(report.skipped.some((s) => s.includes('exposes nothing'))).toBe(true)
    // and it names the fix rather than just refusing
    expect(report.skipped.some((s) => s.includes('expose:'))).toBe(true)
  })

  test('a non-closed surface with no wiring still says nothing was examined', () => {
    const report = auditAccessibility(map([]))
    expect(report.skipped.some((s) => s.includes('no wired elements'))).toBe(
      true
    )
  })
})

/*
 * THE SHARED-RULE ADOPTION (tosijs-floorplan 0.4.0, issue #4).
 *
 * `isInteractive` and the target-size rule used to live here AND in the
 * vendored renderer, and had drifted into contradicting each other on real
 * elements. 1.11.0 deletes the local copies and imports both.
 *
 * These tests exist because the audit suite passed UNCHANGED across that
 * adoption — 11/11 green while six verdicts moved — which means it did not
 * reach a single changed case. Each test below is one of those six, written
 * so it FAILS against the 1.10.1 predicate. They are the record of what the
 * reconciliation actually changed, and the guard against drifting back.
 */
describe('shared interactivity/target-size rule (floorplan#4)', () => {
  const at = (w: number, h: number) => ({ x: 0, y: 0, width: w, height: h })
  const rules = (rec: any): string[] =>
    auditAccessibility(map([rec]))
      .findings.map((f) => f.rule)
      .sort()

  describe('STRICTER — an accessible name never sized a box', () => {
    test('icon-only <a href aria-label> at 20x20 now flags', () => {
      // 1.10.1 exempted any <a> with an accessible NAME, so an aria-label
      // bought a 20x20 icon link a clean audit. A label is not a layout.
      expect(
        rules({ tag: 'a', href: '/x', label: 'Buy', bounds: at(20, 20) })
      ).toContain('target-size')
    })

    test('SQUARE <a> with text at 16x16 now flags', () => {
      // the inline exception is geometric: text AND wider than tall, the
      // shape text layout produces. A 16x16 box was not sized by its glyph.
      expect(
        rules({ tag: 'a', href: '/x', text: 'x', bounds: at(16, 16) })
      ).toContain('target-size')
    })

    test('a WIDE text link is still exempt (the exception still works)', () => {
      expect(
        rules({ tag: 'a', href: '/x', text: 'Read more', bounds: at(100, 16) })
      ).toEqual([])
    })
  })

  describe('LOOSER — evidence must be real', () => {
    test('an arrow forged into a LABEL confers no interactivity', () => {
      // the old rule scanned EVERY string property for the two-way glyph, so
      // user-controlled text could dress an inert div as a control. Identity
      // fields are never bindable and are no longer scanned.
      expect(
        rules({
          tag: 'div',
          label: `Buy ${BOUND_TWO_WAY} now`,
          bounds: at(20, 20),
        })
      ).toEqual([])
    })

    test('an arrow forged into a PLACEHOLDER confers no interactivity', () => {
      expect(
        rules({
          tag: 'div',
          placeholder: `a ${BOUND_TWO_WAY} b`,
          bounds: at(20, 20),
        })
      ).toEqual([])
    })

    test('a real two-way binding in a BINDABLE field still counts', () => {
      // the positive control: the loosening above must not have disarmed the
      // rule itself.
      expect(
        rules({
          tag: 'input',
          value: `app.q ${BOUND_TWO_WAY}`,
          label: 'Q',
          bounds: at(20, 20),
        })
      ).toContain('target-size')
    })

    test('a bare list container is still ground — and that is NOT new', () => {
      // An invariant, not a verdict change: 1.10.1 also called this
      // non-interactive (no handlers, no href, no arrow anywhere). Kept as a
      // guard that the auditView adjustment below did not resurrect plain
      // containers.
      expect(
        rules({ tag: 'ul', list: { path: 'app.rows' }, bounds: at(20, 20) })
      ).toEqual([])
    })

    test('an empty href is not a destination', () => {
      // ALSO originally a no-op: with `label: 'Nowhere'` the record audits
      // clean under BOTH predicates (a name suppresses anonymous-affordance,
      // and <a> is semantic so missing-role never fires). Nameless is the
      // fixture that can tell the two apart — 1.10.1 called it interactive on
      // `href != null` and raised two findings.
      expect(rules({ tag: 'a', href: '', bounds: at(20, 20) })).toEqual([])
    })
  })

  test('a producer may ASSERT interactivity it cannot introspect', () => {
    // new capability from 0.4.0 (#2/#3): producers that cannot enumerate
    // handlers (React delegates at a root) say so. tosijs never emits it,
    // so this only affects foreign maps handed to auditAccessibility.
    expect(
      rules({
        tag: 'div',
        interactive: true,
        label: 'Widget',
        bounds: at(20, 20),
      })
    ).toContain('target-size')
  })

  test('ZERO-SIZE stays exempt — this module keeps that rule itself', () => {
    // a 0x0 element is hidden, not a small target. targetSizeFinding has no
    // opinion (a renderer draws nothing either way), so the guard lives here.
    expect(
      rules({
        tag: 'button',
        on: { click: 'app.go' },
        label: 'Go',
        bounds: at(0, 0),
      })
    ).toEqual([])
  })
})

/*
 * THE AUDIT'S OWN VIEW OF A RECORD (tosijs-floorplan#7 / #8).
 *
 * Two of the shared rules answer a RENDERER's question, and a lint needs the
 * other answer. `auditView()` composes the shared predicate over an adjusted
 * record — it re-implements nothing — so there is still one definition of what
 * evidence IS. These pin both, and both were found by the 1.11.0 pre-release
 * review as regressions introduced by the adoption itself.
 */
describe('auditView — where a lint and a drawing differ', () => {
  const at = (w: number, h: number) => ({ x: 0, y: 0, width: w, height: h })
  const rules = (rec: any): string[] =>
    auditAccessibility(map([rec]))
      .findings.map((f) => f.rule)
      .sort()

  describe('#7 — a list-bound element that IS the control', () => {
    test('<select> with bindList AND bindValue is audited, not skipped', () => {
      // exactly the shape tosijs 1.10.1 shipped a fix to ENABLE. Under the
      // bare shared rule it returns [] — list-ness is decisive — which
      // silences target-size AND two error-severity rules.
      expect(
        rules({
          tag: 'select',
          list: { path: 'app.options', idPath: 'id' },
          value: `b ${BOUND_TWO_WAY} app.choice`,
          bounds: at(20, 20),
        })
      ).toContain('target-size')
    })

    test('the error-severity rules come back too, not just target-size', () => {
      // the review's completeness gap: `interactive` gates THREE rules and
      // every other test here asserts only the warn-level one. A nameless,
      // role-less, editable list-bound div trips all three — `editable` is
      // edit evidence without being `contentEditable`, which missing-role
      // deliberately exempts, and carrying no `value` leaves
      // anonymous-affordance free to fire.
      expect(
        rules({
          tag: 'div',
          list: { path: 'app.rows' },
          editable: true,
          bounds: at(20, 20),
        })
      ).toEqual(['anonymous-affordance', 'missing-role', 'target-size'])
    })

    test('a forged arrow does NOT resurrect a container', () => {
      // the control: auditView must not undo the identity-field narrowing.
      expect(
        rules({
          tag: 'div',
          list: { path: 'app.rows' },
          label: `x ${BOUND_TWO_WAY} y`,
          bounds: at(20, 20),
        })
      ).toEqual([])
    })

    test('structural stays ground even with evidence and a list', () => {
      expect(
        rules({
          tag: 'div',
          structural: true,
          list: { path: 'app.rows' },
          value: `x ${BOUND_TWO_WAY} app.q`,
          bounds: at(20, 20),
        })
      ).toEqual([])
    })
  })

  describe('#8 — producer flags do not silence the lint', () => {
    const base = {
      tag: 'button',
      on: { click: 'app.go' },
      label: 'Go',
      bounds: at(10, 10),
    }

    test('a foreign flag cannot suppress the finding', () => {
      expect(
        rules({ ...base, flags: [{ kind: 'target-ok', label: 'x' }] })
      ).toContain('target-size')
    })

    test('THE ROUND TRIP: auditFlags output fed back must still report', () => {
      // auditFlags() emits `kind: finding.rule` — literally 'target-size' —
      // and the docs say to hand findings to the renderer as `flags`. Any tool
      // that draws findings and re-audits must not get a clean bill.
      // auditFlags returns Record<index, flag[]> — flags for record 0
      const flags = auditFlags(auditAccessibility(map([base])))[0]
      expect(flags.some((f) => f.kind === 'target-size')).toBe(true)
      expect(rules({ ...base, flags })).toContain('target-size')
    })

    test('a flag with no `kind` does not crash the audit', () => {
      // floorplan#12: `f.kind.toLowerCase()` throws inside the shared rule on
      // a malformed foreign map. The audit never hands it flags at all.
      expect(() =>
        rules({ ...base, flags: [{ label: 'no kind' }] })
      ).not.toThrow()
    })

    test('flags are not stripped from the RETURNED record', () => {
      // the adjustment is for the predicates only — a caller gets back
      // exactly what it handed in.
      const withFlags = { ...base, flags: [{ kind: 'contrast', label: 'x' }] }
      const rep = auditAccessibility(map([withFlags]))
      expect((rep.findings[0].record as any).flags).toEqual([
        { kind: 'contrast', label: 'x' },
      ])
    })
  })
})
