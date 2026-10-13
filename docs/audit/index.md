# Accessibility Audit (EXPERIMENTAL)

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

> **The divergence is closed, and as of 1.10.2 there is no carve-out either**
> (tosijs-floorplan #4, then #7/#8/#9 and #13). `target-size` and "is this
> interactive" were once implemented *twice* — here and in the vendored
> renderer — and had drifted into contradicting each other on real elements.
> 0.4.0 shared the implementation; **0.5.0 removed the need for this module to
> adjust it.**
>
> Three adjustments used to live here, as `auditView`: strip producer `flags`
> (a lint never drew them), exempt `0×0` (hidden is not small), and treat a
> list-bound element carrying its own evidence as a control. All three are now
> in the rule itself, so `auditView` is **deleted** and this module contains no
> definition of what evidence *is* — not a copy, not an adjustment, nothing.
> The audit suite passes unchanged across the deletion, which is the only
> evidence that the retirement is real rather than nominal.
>
> What this module still owns is what it uniquely knows: the accessible name,
> the contrast math, and the wording of each finding.

> **EXPERIMENTAL.** Ships with the agent surface; rules and shapes may change.
