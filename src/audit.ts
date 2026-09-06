/*{ "parent": "utilities", "description": "EXPERIMENTAL accessibility audit over the agent surface's own map — anonymous affordances, unnameable actions, missing roles, WCAG contrast, target size." }*/
/*#
# audit (EXPERIMENTAL)

`auditAccessibility(agent.describe({ styles: true }))` turns the affordance
map into findings. It is the lint the map made obvious: **every element with
handlers should have a name, a role, and enough contrast and size to use** —
and because the map is the framework's own record of its wiring, a finding
here is a real defect, not a scraper's guess.

    import { enableAgentInterface, auditAccessibility } from 'tosijs'

    const agent = enableAgentInterface()
    const report = auditAccessibility(agent.describe({ styles: true }))
    report.failed   // 0 when clean
    report.findings // [{ rule, severity, message, record, index }]

Pure over the description — no DOM, so it runs on a map that arrived over a
wire, in a test, or in CI. Pass `styles: true` to `describe()` or the
contrast rule has nothing to measure and skips itself (it says so).

## The rules

| rule | what it catches | why |
| --- | --- | --- |
| `anonymous-affordance` | a wired element with no accessible name, text, or value | a screen reader announces "button"; an agent sees `<div>` |
| `unnameable-action` | a handler that is an anonymous function (`ƒ`) | nothing can invoke or describe it but a click |
| `missing-role` | a non-semantic tag (div/span) wired to act | assistive tech has no idea it is a control |
| `contrast` | text/background below the WCAG AA ratio | measured with tosijs's own `Color`; needs `styles: true` |
| `target-size` | interactive element below 24×24 (WCAG 2.5.8) | too small to hit reliably; toggles exempt |
| `label-hidden-by-placeholder` | a control whose only name is its placeholder | the name vanishes the moment the user types |

Findings carry the record and its index, so a caller can jump straight to
the element — or hand the pair to `schematicSVG`'s `flags` to *draw* them.

> **The divergence is closed** (tosijs-floorplan 0.4.0, issue #4). `target-size`
> and "is this interactive" used to be implemented *twice* — here, and in the
> vendored renderer that draws the same map — and the two had drifted into
> contradicting each other on real elements. Both now come from
> `./schematic`, so the audit and the drawing cannot disagree by
> construction. **Geometry is judged where the geometry lives**; this module
> keeps only what it uniquely knows (the accessible name, the contrast
> math) and the rule wording.
>
> Adopting the shared rule changed some verdicts, deliberately, in both
> directions — see the 1.11.0 CHANGELOG entry. The one exemption this module
> still applies on top is **zero-size**: a `0×0` element is hidden, not a
> small target, and `targetSizeFinding` (correctly, for a renderer) has no
> opinion about that.

> **EXPERIMENTAL.** Ships with the agent surface; rules and shapes may change.
*/
import { AgentDescription, AgentWiringRecord } from './agent'
import { Color } from './color'
// ONE implementation of "can I act here" and "is this big enough", shared with
// the renderer that draws the same map (tosijs-floorplan#4). Importing them is
// the whole point — a local copy is what drifted last time.
import {
  isInteractive,
  targetSizeFinding,
  TARGET_SIZE_DEFAULT,
} from './schematic'

export type AuditSeverity = 'error' | 'warn' | 'info'

export interface AuditFinding {
  /** stable rule id — see the table above */
  rule: string
  severity: AuditSeverity
  /** one line, phrased as what to fix */
  message: string
  /** index into description.wiring — the same key the schematic stamps */
  index: number
  record: AgentWiringRecord
}

export interface AuditReport {
  findings: AuditFinding[]
  /** count of severity: 'error' findings */
  failed: number
  /** rules that could not run, and why (an audit must not fail silently) */
  skipped: string[]
}

export interface AuditOptions {
  /** minimum interactive size, px (default 24 — WCAG 2.5.8 AA; 44/48 is the
   * platform touch bar). 0 disables the rule. */
  targetSize?: number
  /** WCAG contrast floor (default 4.5 — AA for body text) */
  contrastRatio?: number
  /** rule ids to skip */
  exclude?: string[]
}

const accessibleName = (w: AgentWiringRecord): string =>
  String(w.label ?? w.text ?? '').trim()

const SEMANTIC_TAGS = new Set([
  'button',
  'a',
  'input',
  'select',
  'textarea',
  'summary',
  'label',
  'option',
])

// relative luminance per WCAG 2.x, via tosijs's own Color parser
const luminance = (css: string): number | null => {
  try {
    const { r, g, b } = Color.fromCss(css)
    const channel = (v: number): number => {
      const c = v / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
  } catch (_e) {
    return null
  }
}

export const contrastRatio = (
  foreground: string,
  background: string
): number | null => {
  const a = luminance(foreground)
  const b = luminance(background)
  if (a == null || b == null) return null
  const [light, dark] = a > b ? [a, b] : [b, a]
  return (light + 0.05) / (dark + 0.05)
}

/**
 * Audit an agent-surface description for accessibility defects. Pure over
 * plain data — no DOM — so it runs anywhere the map travels.
 */
export const auditAccessibility = (
  description: AgentDescription,
  options: AuditOptions = {}
): AuditReport => {
  const {
    targetSize = TARGET_SIZE_DEFAULT,
    contrastRatio: floor = 4.5,
    exclude = [],
  } = options
  const findings: AuditFinding[] = []
  const skipped: string[] = []
  const enabled = (rule: string): boolean => !exclude.includes(rule)

  // AN EMPTY MAP IS NOT A CLEAN BILL OF HEALTH. Since 1.9.0 the default
  // posture exposes nothing, so `describe()` over a bare surface returns no
  // wiring at all — and auditing it examined ZERO elements while reporting no
  // findings, which reads exactly like "your page is accessible". Same
  // philosophy as the contrast skip below: say what was not checked.
  if (description.wiring.length === 0) {
    skipped.push(
      description.exposure === 'closed'
        ? 'everything: the agent surface exposes nothing, so there was no ' +
            'wiring to audit — enable it with expose: { roots } or ' +
            "expose: 'all'"
        : 'everything: the map contains no wired elements, so nothing was ' +
            'examined'
    )
  }

  // the contrast rule needs computed colors; say so rather than passing
  // silently, which would read as "no contrast problems"
  const anyStyles = description.wiring.some((w) => w.style != null)
  if (enabled('contrast') && !anyStyles) {
    skipped.push(
      'contrast: no computed styles in the map — call describe({ styles: true })'
    )
  }

  description.wiring.forEach((w, index) => {
    const add = (
      rule: string,
      severity: AuditSeverity,
      message: string
    ): void => {
      if (enabled(rule))
        findings.push({ rule, severity, message, index, record: w })
    }
    const interactive = isInteractive(w)
    const name = accessibleName(w)

    if (interactive && name === '' && w.value === undefined) {
      add(
        'anonymous-affordance',
        'error',
        `<${w.tag}> is interactive but has no accessible name — a screen ` +
          `reader announces it as "${w.role ?? w.tag}" and nothing else. Add ` +
          `aria-label, a <label>, or visible text.`
      )
    }

    for (const [event, handler] of Object.entries(w.on ?? {})) {
      const handlers = Array.isArray(handler) ? handler : [handler]
      if (handlers.some((h) => h === 'ƒ')) {
        add(
          'unnameable-action',
          'warn',
          `<${w.tag}>'s ${event} handler is an anonymous function — nothing ` +
            `can invoke or describe it but a click. Bind it by path ` +
            `(onClick: 'app.doThing') so it becomes an addressable action.`
        )
      }
    }

    if (
      interactive &&
      !SEMANTIC_TAGS.has(w.tag) &&
      w.role == null &&
      w.contentEditable !== true
    ) {
      add(
        'missing-role',
        'error',
        `<${w.tag}> acts like a control but has no role — assistive tech ` +
          `sees generic markup. Use a <button>/<a>, or set an ARIA role.`
      )
    }

    // The rule itself lives in ./schematic — including the toggle exemption
    // and WCAG 2.5.8's inline exception, which is geometric (text, and a box
    // WIDER than tall) rather than "has a name": an aria-label never sized a
    // box, and a square box was not sized by its text.
    //
    // The one condition kept HERE is zero-size. A 0×0 record is a hidden or
    // unlaid-out element, not a target too small to hit, and the renderer has
    // no reason to care (it draws nothing either way).
    const tooSmall =
      w.bounds != null && w.bounds.width > 0 && w.bounds.height > 0
        ? targetSizeFinding(w, targetSize)
        : null
    if (tooSmall != null) {
      add(
        'target-size',
        'warn',
        `<${w.tag}> is ${tooSmall}. Small targets are hard to hit and ` +
          `harder on touch.`
      )
    }

    if (w.style != null && name !== '') {
      // A TRANSPARENT BACKGROUND IS NOT BLACK. Computed styles report
      // `rgba(0,0,0,0)` for "inherit from whatever is behind me", which the
      // luminance math read as pure black — in a real browser that fired a
      // severity-error on nearly every element on the page. The map does
      // not know the effective ancestor background, so the honest answer is
      // "cannot measure", not a confident wrong number.
      const transparent = /rgba?\([^)]*,\s*0(\.0+)?\s*\)/.test(
        w.style.background
      )
      if (transparent) {
        if (!skipped.some((s) => s.startsWith('contrast: transparent'))) {
          skipped.push(
            'contrast: transparent backgrounds cannot be measured from the ' +
              'map alone (the effective ancestor background is unknown)'
          )
        }
      }
      const ratio = transparent
        ? null
        : contrastRatio(w.style.color, w.style.background)
      if (ratio != null && ratio < floor) {
        add(
          'contrast',
          'error',
          `<${w.tag}> text contrast is ${ratio.toFixed(2)}:1 (needs ` +
            `${floor}:1) — ${w.style.color} on ${w.style.background}.`
        )
      }
    }

    if (
      interactive &&
      w.label == null &&
      w.placeholder != null &&
      w.placeholder !== ''
    ) {
      add(
        'label-hidden-by-placeholder',
        'warn',
        `<${w.tag}> is named only by its placeholder ("${w.placeholder}") — ` +
          `that name disappears as soon as the user types. Add a <label> or ` +
          `aria-label.`
      )
    }
  })

  return {
    findings,
    failed: findings.filter((f) => f.severity === 'error').length,
    skipped,
  }
}

/**
 * Audit findings as schematic `flags` — feed them straight to
 * `schematicSVG` and the drawing shows where the problems are.
 */
export const auditFlags = (
  report: AuditReport
): Record<
  number,
  Array<{ kind: string; label: string; severity: AuditSeverity }>
> => {
  const byIndex: Record<
    number,
    Array<{ kind: string; label: string; severity: AuditSeverity }>
  > = {}
  for (const finding of report.findings) {
    byIndex[finding.index] ??= []
    byIndex[finding.index].push({
      kind: finding.rule,
      label:
        finding.rule === 'contrast'
          ? finding.message.match(/is ([\d.]+:1)/)?.[1] ?? 'contrast'
          : finding.rule,
      severity: finding.severity,
    })
  }
  return byIndex
}
