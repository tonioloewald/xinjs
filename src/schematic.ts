/*{ "parent": "utilities", "description": "EXPERIMENTAL schematic renderer: draw an agent-surface description as SVG — the app's affordance map at its true geometry, DOM-free." }*/
/*#
# schematic (EXPERIMENTAL)

`schematicSVG(description)` renders `agent.describe()` output as an SVG
string — one rectangle per visible wired element at its **actual position and
size** (`bounds` rides in the map), captioned from the map, optionally wearing
the app's computed colors (`describe({ styles: true })`).

    import { enableAgentInterface, schematicSVG } from 'tosijs'

    const agent = enableAgentInterface()
    const svg = schematicSVG(agent.describe({ styles: true }))

It is a **pure function over plain data** — no DOM, no layout engine, no
screenshots — so it runs anywhere the description can travel: in the page, in
a headless embodiment, or on the far side of a wire from an app nobody is
viewing.

Division of labor per consumer: **JSON for text reasoning**, **rasterized
PNG for vision encoders** (rasterize the SVG at 2× so labels OCR cleanly —
canvas in a browser, `@resvg/resvg-js` under bun), **SVG for humans and
tools** (deterministic, diffable, and each `<g>` carries `data-record="<i>"`
linking it back to `description.wiring[i]` — the image as index).

> **EXPERIMENTAL.** Ships alongside the agent surface; shapes may change.
*/

// VENDORED from tosijs-floorplan@0.4.0 — the upstream package
// is the source of truth. DO NOT EDIT below this line: edit
// tosijs-floorplan and rebuild (this section regenerates at build time).
// tosijs stays ZERO runtime dependencies — the core is inlined, not imported.

/**
 * tosijs-floorplan — render an agent-surface map as a floorplan SVG.
 *
 * (Formerly tosijs-schematic — renamed to stop near-colliding with
 * tosijs-schema. Exported API names are unchanged.)
 *
 * A PURE FUNCTION over plain data: one record per wired element, drawn at
 * its true geometry, wearing the affordance grammar. No DOM, no framework,
 * no dependencies — the map travels as JSON, so this runs in the page, in
 * a headless embodiment, or on the far side of a wire from an app nobody
 * is viewing.
 *
 * The RECORD FORMAT is the contract (see README): tosijs's describe()
 * produces it, but anything that emits records gets the renderer — and
 * every consumer inherits the grammar's hard-won rules (geometry over
 * glyphs, hints are not content, ground is not figure).
 */

/** provenance tokens for bound values: "shown ⟵ path" (display-only) and
 * "shown ⟷ path" (two-way — user-writable). Part of the record format. */
export const BOUND_TO_DOM = '⟵'
export const BOUND_TWO_WAY = '⟷'

/**
 * One wired element, flat. Producers may include fields beyond these —
 * bound props ride as "value ⟷ path" strings under their own keys.
 */
export interface SchematicRecord {
  tag: string
  id?: string
  part?: string
  role?: string
  label?: string
  placeholder?: string
  type?: string
  checked?: boolean
  focused?: boolean
  invalid?: boolean
  required?: boolean
  disabled?: boolean
  contentEditable?: boolean
  description?: string
  text?: string
  on?: Record<string, string | string[]>
  list?: { path: string; idPath?: string }
  bounds?: { x: number; y: number; width: number; height: number }
  viewportFixed?: boolean
  structural?: boolean
  style?: { background: string; borderColor: string; color: string }
  /** a DURABLE, actionable handle from the producer (haltija's `@42`) —
   * survives re-renders where a wiring index doesn't; rendered in the
   * index slot in preference to the index, and emitted as data-ref */
  ref?: string
  /** computed verdicts about this element (WCAG contrast failures, etc.) —
   * drawn as severity-colored bars on the LEFT edge (the unclaimed slot),
   * with the first flag's label */
  flags?: Array<{ kind: string; label: string; severity?: 'info' | 'warn' | 'error' }>
  /** pixels a pure renderer can't obtain: a data-URL snapshot of inline
   * media (serialized <svg>, <canvas>.toDataURL()) drawn IN PLACE — on an
   * illustration-led page the picture IS the content */
  image?: string
  /** a link's destination — the most actionable fact about a link, and
   * deliberately distinct from `text` ("the link says X" is not "the link
   * goes to Y"). Captions fall back to it only when nothing else names the
   * element; it ALWAYS rides the legend — URLs are the facts most often
   * too long to draw */
  href?: string
  /** a filled control's value, distinct from label/placeholder — static
   * ("3") or bound ("3 ⟷ app.qty"). tosijs emits it as a bound prop; the
   * declared field gives plain-DOM producers the same home */
  value?: string
  /** the producer's ASSERTION that this element can be acted on — for
   * producers that cannot introspect handlers (React delegates at a root;
   * vanilla addEventListener is not enumerable from page script). A binding
   * framework never needs it: `on` and two-way bindings already say so.
   * Asserting is truth-telling; fabricating `on` to unlock the styling
   * would be a lie in the payload. (issue #3, haltija) */
  interactive?: boolean
  /** the producer's assertion that text goes in here — the DOM-side
   * counterpart of contentEditable/two-way bindings (issue #3) */
  editable?: boolean
  [boundProp: string]: unknown
}

/** the map: only `wiring` is read. The named optional fields are the
 * known producer extras (tosijs's describe() shape) — deliberately NOT an
 * index signature, which would stop interface-typed producers (TS gives
 * implicit index signatures to literals, never to interfaces) from
 * assigning without casts. */
export interface SchematicDescription {
  wiring: SchematicRecord[]
  roots?: unknown
  actions?: unknown
  exposure?: unknown
  contract?: unknown
}


export interface SchematicBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface SchematicOptions {
  /** padding around the drawn region, px (default 8) */
  pad?: number
  /** boxes shorter than this get no caption (default 14) */
  minLabelHeight?: number
  /** caption length limit (default 36) */
  maxCaption?: number
  /** caption font size, px (default 11) */
  fontSize?: number
  /**
   * Scope the map SPATIALLY: only records whose bounds intersect this
   * page-coordinate rect are drawn, and the viewBox IS the rect — the
   * schematic becomes "this region of the page". Use `boundsOf(element)`
   * to scope to an element's region; omit for the whole map.
   */
  within?: SchematicBounds
  /**
   * Stamp each box with its wiring index (top-right corner) — the raster
   * form of `data-record`: a vision consumer reads the number off the image
   * and looks the record up in `description.wiring[n]` — image as legend.
   */
  index?: boolean
  /**
   * Interactive elements (handlers or editable, toggles exempt as
   * user-agent-sized) smaller than this on either axis are flagged
   * undersized — amber bar + legend fact. Default 24 (WCAG 2.5.8 AA);
   * raise to 44/48 for the AAA / platform touch-target bar. 0 disables.
   */
  targetSize?: number
  /** draw the footer strip advertising the legend when it's non-empty
   * (default true) — the raster must confess what it couldn't carry */
  legendNote?: boolean
  /**
   * EXPERIMENTAL plugin seam: called once per drawn record, just before
   * its <g> closes — emit extra SVG into the record's group. The corner
   * slots already spoken for: top-left = invalid flag, top-right = index,
   * bottom-right = ↔ badge, outline = focus ring / emphasis. Claim empty
   * real estate; the first real plugins will shape the successor API.
   */
  decorate?: (ctx: {
    record: SchematicRecord
    index: number
    x: number
    y: number
    width: number
    height: number
    structural: boolean
    emit: (svg: string) => void
  }) => void
}

/** what the drawing could not legibly carry, keyed back by index/ref —
 * the image's companion JSON. Pair every raster with this. */
export interface SchematicLegendEntry {
  index: number
  ref?: string
  tag: string
  /** the caption that would have been drawn (or its untruncated form) */
  caption?: string
  editable?: boolean
  required?: boolean
  invalid?: boolean
  disabled?: boolean
  flags?: Array<{ kind: string; label: string; severity?: 'info' | 'warn' | 'error' }>
  /** the link's destination — carried whenever the record has one */
  href?: string
  /** the control's held value (provenance stripped), when the drawing
   * elided or truncated it */
  value?: string
  /** interactive element below the target-size floor, e.g.
   * "18×13 — below 24×24 (WCAG 2.5.8)" */
  undersized?: string
}

export interface SchematicResult {
  svg: string
  legend: SchematicLegendEntry[]
  /** set when the map draws affordance-shaped boxes but NO record carries
   * any affordance evidence: "nothing here is actionable" and "the
   * producer couldn't tell" are different statements, and a consumer
   * acting on the first when the truth is the second is the
   * confident-wrong-answer case (issue #3). Also rides the svg's <desc>. */
  note?: string
}

// strip provenance from a bound-value string: "shown ⟷ path" → "shown"
// (empty when the binding holds no value yet); a plain string (no arrow)
// is a live-but-unbound value and passes through whole.
// The STRUCTURAL arrow is the LAST one in the string — the surface appends
// it, so everything before it is data, and data can carry arrow tokens
// (forged, or from a producer older than tosijs 1.8.0, which neutralizes
// them at the source). A renderer consumes maps it did not generate, so it
// parses defensively: split at the last arrow, and neutralize any arrow
// left INSIDE the shown value (geometry over glyphs — a rare glyph must
// never ride a caption run, and a fake arrow must never read as structure).
const shownValue = (v: unknown): string | undefined => {
  if (typeof v !== 'string') return undefined
  const at = Math.max(v.lastIndexOf(BOUND_TWO_WAY), v.lastIndexOf(BOUND_TO_DOM))
  return neutralizeArrows(at >= 0 ? v.slice(0, at).trim() : v)
}

// arrow tokens inside record data must neither ride a caption run
// (geometry over glyphs) nor read as structure — neutralized the same way
// tosijs ≥1.8.0 does at the source
const neutralizeArrows = (s: string): string =>
  s.replaceAll(BOUND_TWO_WAY, '<->').replaceAll(BOUND_TO_DOM, '<-')

// is this string a live two-way binding? Only the arrow in STRUCTURAL
// position (last) counts — a ⟷ buried inside the data must not confer an
// affordance (a drawing that lies about what the page can do is worse than
// no drawing).
const boundTwoWay = (v: unknown): boolean => {
  if (typeof v !== 'string') return false
  const at = v.lastIndexOf(BOUND_TWO_WAY)
  return at >= 0 && at > v.lastIndexOf(BOUND_TO_DOM)
}

// fields the surface NEVER appends a binding arrow to: identity, naming,
// hints, destinations. In these, any arrow is data (or forgery) — the
// last-occurrence rule only protects fields that actually receive an
// appended binding, so these are excluded from the binding scan entirely
// (0.4.0 review B1: a lone forged arrow in a never-bindable field is
// always in "last = structural" position).
const NEVER_BOUND = new Set([
  'tag', 'id', 'part', 'role', 'label', 'placeholder', 'type',
  'description', 'href', 'ref', 'image',
])
const hasTwoWayBinding = (w: SchematicRecord): boolean =>
  Object.entries(w).some(
    ([key, v]) => !NEVER_BOUND.has(key) && boundTwoWay(v)
  )

// the two kinds of affordance evidence, split once and shared by the
// renderer AND the exported predicate — three independently edited copies
// of this logic is how the renderer and tosijs's audit drifted into
// contradicting each other (issue #4); parity is now by construction
const hasActEvidence = (w: SchematicRecord): boolean =>
  w.on != null ||
  w.interactive === true ||
  (typeof w.href === 'string' && w.href !== '')
const hasEditEvidence = (w: SchematicRecord): boolean =>
  w.editable === true || w.contentEditable === true || hasTwoWayBinding(w)

/**
 * An element's page-coordinate bounds (the same space describe() records) —
 * the natural `within` argument for a region-scoped schematic.
 */
export const boundsOf = (element: Element): SchematicBounds => {
  const rect = element.getBoundingClientRect()
  return {
    x: Math.round(rect.x + ((globalThis as any).scrollX ?? 0)),
    y: Math.round(rect.y + ((globalThis as any).scrollY ?? 0)),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  }
}

// structure behind affordances — a LIST CONTAINER is ground too: it's
// wired (the collection binds here), but its items are the affordances
const isGround = (w: SchematicRecord): boolean =>
  w.structural === true || (w.list != null && w.on == null)

/**
 * "Can I act here?" — the single implementation of the interactivity
 * predicate, exported so audits (tosijs's auditAccessibility) consume THIS
 * rather than keeping a drifting copy (issue #4: the two had already
 * reached contradictory verdicts on the same element). Evidence, any of:
 * handlers (`on`), a link destination (`href` — a link IS an affordance),
 * `contentEditable`, a two-way binding in structural position, or the
 * producer's own `interactive`/`editable` assertion (issue #3). Ground
 * (structure, list containers) is never interactive.
 */
export const isInteractive = (w: SchematicRecord): boolean =>
  !isGround(w) && (hasActEvidence(w) || hasEditEvidence(w))

/** the WCAG 2.5.8 audit floor (24×24, the AA minimum) — one constant so
 * the option default and the exported rule cannot drift */
export const TARGET_SIZE_DEFAULT = 24

/**
 * The WCAG 2.5.8 target-size rule, exported for the same reason as
 * `isInteractive` (issue #4): one implementation, geometry judged where the
 * geometry lives. Returns the measured finding string (the legend fact) or
 * null. Embodies the settled exemptions: toggles (user-agent-sized); links
 * plausibly sized by VISIBLE text — the WCAG inline exception as far as
 * pure geometry can honour it, which is: has text, and the box is WIDER
 * than tall, the shape text layout produces (issue #2 caught the earlier
 * text-only rule exempting 16×16 icon links that happened to carry a
 * label; an accessible name alone never sizes a box, and a square box was
 * not sized by its text); and supersession by any producer-supplied flag
 * whose kind mentions `target` — a producer with DOM access (computed
 * display, parent text nodes) computes the real exception and ships the
 * finding via `flags`; that is the INTENDED path for DOM producers, and
 * the built-in never double-marks over it.
 */
export const targetSizeFinding = (
  w: SchematicRecord,
  targetSize = TARGET_SIZE_DEFAULT
): string | null => {
  if (targetSize <= 0 || w.bounds == null || !isInteractive(w)) return null
  if (w.type === 'checkbox' || w.type === 'radio') return null
  if (
    w.tag === 'a' &&
    typeof w.text === 'string' &&
    w.text !== '' &&
    w.bounds.width > w.bounds.height
  ) {
    return null
  }
  if (
    Array.isArray(w.flags) &&
    w.flags.some((f) => f.kind.toLowerCase().includes('target'))
  ) {
    return null
  }
  const { width, height } = w.bounds
  return width < targetSize || height < targetSize
    ? `${width}×${height} — below ${targetSize}×${targetSize} (WCAG 2.5.8)`
    : null
}

const intersects = (a: SchematicBounds, b: SchematicBounds): boolean =>
  a.x < b.x + b.width &&
  b.x < a.x + a.width &&
  a.y < b.y + b.height &&
  b.y < a.y + a.height

const contains = (outer: SchematicBounds, inner: SchematicBounds): boolean =>
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.width <= outer.x + outer.width &&
  inner.y + inner.height <= outer.y + outer.height

// string args (not regexes) — tjs convert's lexer mis-reads a quote inside a
// regex literal (/"/g) as a string opener; see tjs-lang issue
const esc = (s: string): string =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const TRANSPARENT = 'rgba(0, 0, 0, 0)'

const FLAG_COLORS: Record<string, string> = {
  error: '#d32f2f',
  warn: '#e6a700',
  info: '#888888',
}

// severity comes from producer JSON, so it can be anything — including
// 'constructor', which a bare index would resolve up the prototype chain
// into a function serialized straight into a fill attribute
const flagColor = (severity: unknown): string =>
  typeof severity === 'string' && Object.hasOwn(FLAG_COLORS, severity)
    ? FLAG_COLORS[severity]
    : FLAG_COLORS.warn

// greedy word-wrap: captions should USE vertical room, not truncate with
// space to spare (a <p> that wraps on the real page has the same height
// here). Returns at most maxLines lines, each at most maxChars long;
// appends … when the caption is cut.
const wrapCaption = (
  caption: string,
  maxChars: number,
  maxLines: number
): string[] => {
  if (maxLines <= 1 || caption.length <= maxChars) {
    return [caption.slice(0, maxChars + 2)]
  }
  const words = caption.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const candidate = line === '' ? word : `${line} ${word}`
    if (candidate.length <= maxChars) {
      line = candidate
    } else {
      if (line !== '') lines.push(line)
      line = word.length > maxChars ? word.slice(0, maxChars) : word
      if (lines.length === maxLines) break
    }
  }
  if (lines.length < maxLines && line !== '') lines.push(line)
  if (lines.length > maxLines || (lines.length === maxLines && line !== '' && !lines.includes(line))) {
    lines.length = maxLines
    lines[maxLines - 1] = lines[maxLines - 1].slice(0, maxChars - 1) + '…'
  }
  return lines
}

export const schematic = (
  description: SchematicDescription,
  options: SchematicOptions = {}
): SchematicResult => {
  const {
    pad = 8,
    minLabelHeight = 14,
    maxCaption = 36,
    fontSize = 11,
    within,
    index: showIndex = false,
    targetSize = TARGET_SIZE_DEFAULT,
    legendNote = true,
    decorate,
  } = options
  const legend: SchematicLegendEntry[] = []
  const boxes = description.wiring.filter(
    (w) =>
      w.bounds != null &&
      w.bounds.width > 0 &&
      w.bounds.height > 0 &&
      // fully negative coordinates = hidden by off-page positioning (the
      // spatial analog of zero-size): invisible to humans, invisible here
      (w.viewportFixed === true ||
        (w.bounds.x + w.bounds.width > 0 && w.bounds.y + w.bounds.height > 0)) &&
      (within == null ||
        w.viewportFixed === true ||
        intersects(w.bounds, within))
  )
  // viewport furniture (fixed/sticky) has viewport coordinates: it neither
  // stretches the viewBox nor sits at a page position — it gets PINNED as an
  // overlay at the map's origin, which is where it lives on screen
  const flow = boxes.filter((w) => w.viewportFixed !== true)
  if (boxes.length === 0) {
    return {
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0"></svg>',
      legend,
    }
  }
  // scoped: the viewBox IS the region; unscoped: fit the FLOW boxes (pinned
  // furniture must not stretch the map)
  const fitBoxes = flow.length > 0 ? flow : boxes
  const minX =
    within != null
      ? within.x - pad
      : Math.min(...fitBoxes.map((w) => w.bounds!.x)) - pad
  const minY =
    within != null
      ? within.y - pad
      : Math.min(...fitBoxes.map((w) => w.bounds!.y)) - pad
  const maxX =
    within != null
      ? within.x + within.width + pad
      : Math.max(...fitBoxes.map((w) => w.bounds!.x + w.bounds!.width)) + pad
  const maxY =
    within != null
      ? within.y + within.height + pad
      : Math.max(...fitBoxes.map((w) => w.bounds!.y + w.bounds!.height)) + pad

  // explicit width/height (not just viewBox): gives the svg an intrinsic
  // size as a document/img, and Firefox refuses to draw an svg image onto a
  // canvas without them — which rasterizeSVG depends on
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${
      maxX - minX
    } ${maxY - minY}" width="${maxX - minX}" height="${maxY - minY}">`,
  ]
  // structure behind affordances: dotted outlines the eye (and the raster)
  // reads as grouping, not controls (isGround, module level — the exported
  // predicates share it).
  const drawOrder = [...boxes].sort(
    (a, b) => Number(isGround(b)) - Number(isGround(a))
  )
  // NO AFFORDANCE EVIDENCE ANYWHERE: for a producer that cannot introspect
  // handlers (issue #3), every record answers "can I act here?" with no —
  // silently, which is the confident-wrong-answer failure. "Nothing here is
  // actionable" and "I couldn't tell" are different statements; when the
  // map draws non-ground boxes but not one record carries any evidence, the
  // result says so instead of letting silence claim the first.
  // evidence is judged over the WHOLE wiring, not the drawn subset: a
  // `within` crop of a map whose evidence lies outside the region is not a
  // blind map, it's a blind REGION of a sighted one (review follow-up)
  const blind =
    boxes.some((w) => !isGround(w)) && !description.wiring.some(isInteractive)
  const note = blind
    ? 'no record carries affordance evidence (on, href, contentEditable, ' +
      'a two-way binding, or an interactive/editable assertion) — ' +
      '"nothing here is actionable" is NOT established; a producer that ' +
      'cannot introspect handlers should assert `interactive`/`editable` ' +
      'per record (see README)'
    : undefined
  for (const w of drawOrder) {
    const index = description.wiring.indexOf(w)
    const pinOffsetX = w.viewportFixed === true ? minX + pad : 0
    const pinOffsetY = w.viewportFixed === true ? minY + pad : 0
    const x = w.bounds!.x + pinOffsetX
    const y = w.bounds!.y + pinOffsetY
    const { width, height } = w.bounds!
    // a box that CONTAINS other drawn boxes is a container: its textContent
    // is its children's text concatenated, so a text-derived caption would
    // overprint the children's own captions — the children speak for
    // themselves. Only an explicit label earns a container a caption.
    const isContainer =
      w.viewportFixed !== true &&
      boxes.some(
        (other) =>
          other !== w &&
          other.viewportFixed !== true &&
          contains(w.bounds!, other.bounds!)
      )
    // caption truth, per control kind:
    // - checkbox/radio: the state is GEOMETRY (✕ in the box, dot in the
    //   circle — drawn below, legible at any raster scale); the caption is
    //   just the label, set to the RIGHT of the control
    // - other form controls: the live VALUE wins; an empty control falls
    //   back to its placeholder in italics (a hint must not read as content)
    // - everything else: label, then text, then value
    const toggle = w.type === 'checkbox' || w.type === 'radio'
    let caption: string
    let hint = false
    if (isContainer) {
      caption = String(w.label ?? '')
    } else if (toggle) {
      caption = String(w.label ?? '')
    } else if (
      w.tag === 'input' ||
      w.tag === 'textarea' ||
      w.tag === 'select' ||
      w.contentEditable === true
    ) {
      const value = shownValue(w.value)
      if (value) {
        // both name and value known: say both — "qty: 3"
        caption = w.label != null ? `${w.label}: ${value}` : value
      } else if (w.placeholder != null && w.placeholder !== '') {
        caption = String(w.placeholder)
        hint = true
      } else {
        caption = String(w.label ?? w.text ?? `<${w.tag}>`)
      }
    } else {
      // href is last resort before the bare tag: a link with no name at all
      // (haltija's icon-less sidebar case) is still distinguished by where
      // it goes — but a name, when present, wins; the destination's real
      // home is the legend
      caption = String(
        w.label ??
          shownValue(w.text) ??
          shownValue(w.value) ??
          w.href ??
          `<${w.tag}>`
      )
    }
    // EVERY caption source (label, placeholder, href, tag fallback — not
    // just the text/value paths shownValue serves) is neutralized here, at
    // one choke point: the 0.4.0 review's B1 found the arrow defense
    // bypassed by exactly the sources this line now covers
    caption = neutralizeArrows(caption)
    const structural = isGround(w)
    // the affordance grammar, explicit: BOLD outline = wired to act —
    // handlers, a link destination (href: a link IS an affordance, 0.4.0),
    // or the producer's `interactive` word. The ↔ badge = editable here.
    // Solid = affordance, dotted = structure.
    const actable = !structural && hasActEvidence(w)
    const editable = !structural && hasEditEvidence(w)
    const fill = structural
      ? 'none'
      : w.style != null
        ? w.style.background
        : 'transparent'
    const stroke =
      !structural && w.style != null && w.style.borderColor !== TRANSPARENT
        ? w.style.borderColor
        : 'currentColor'
    const color = w.style != null ? w.style.color : 'currentColor'
    // embedded media first: pixels the producer captured, drawn in place —
    // everything else (state geometry, captions, badges) reads over it
    const drawImage =
      !structural && typeof w.image === 'string' && w.image.startsWith('data:')
    // CRAMPED: the box can't legibly carry its dress — draw it bare (shape,
    // state geometry, emphasis, focus) with an auto stamp pointing into the
    // legend, where the metadata actually lives. Toggles are exempt from
    // caption suppression (their label draws OUTSIDE the box).
    const cramped =
      !structural && (height < minLabelHeight || width < fontSize * 3)
    // UNDERSIZED: an interactive element below the target-size floor is a
    // usability defect in its own right (WCAG 2.5.8: 24×24 AA; 44/48 is the
    // platform touch bar). The whole rule — the interactivity predicate,
    // the toggle and inline-link exemptions, producer-flag supersession —
    // lives in the exported targetSizeFinding (issue #4: one
    // implementation, shared with tosijs's audit).
    const undersized = targetSizeFinding(w, targetSize)
    const emphasis = structural
      ? ' stroke-dasharray="1 3" stroke-linecap="round" opacity="0.45"'
      : w.disabled === true
        ? ' opacity="0.4"'
        : actable
          ? ' stroke-width="2"'
          : ''
    parts.push(
      `<g data-record="${index}"${
        w.ref != null ? ` data-ref="${esc(String(w.ref))}"` : ''
      }>`
    )
    if (w.type === 'radio') {
      // a radio IS a circle — and its state is a filled dot, legible at any
      // raster scale (text glyphs are mush at 13px; geometry is not)
      const r = Math.min(width, height) / 2
      const cx = x + width / 2
      const cy = y + height / 2
      parts.push(
        `<circle cx="${cx}" cy="${cy}" r="${r - 0.5}" fill="${esc(fill)}" ` +
          `stroke="${esc(stroke)}"${emphasis}/>`
      )
      if (w.checked === true) {
        parts.push(
          `<circle cx="${cx}" cy="${cy}" r="${Math.max(2, r * 0.45)}" ` +
            `fill="${esc(color)}"/>`
        )
      }
    } else {
      parts.push(
        `<rect x="${x}" y="${y}" width="${width}" height="${height}" ` +
          `fill="${esc(fill)}" stroke="${esc(stroke)}"${emphasis}/>`
      )
      if (drawImage) {
        parts.push(
          `<image x="${x + 1}" y="${y + 1}" width="${width - 2}" ` +
            `height="${height - 2}" href="${esc(w.image as string)}" ` +
            `preserveAspectRatio="xMidYMid meet"/>`
        )
      }
      if (w.type === 'checkbox' && w.checked === true) {
        // checked = an ✕ drawn corner to corner, inset a hair
        const inset = 3
        parts.push(
          `<line x1="${x + inset}" y1="${y + inset}" x2="${x + width - inset}" ` +
            `y2="${y + height - inset}" stroke="${esc(color)}" stroke-width="1.5"/>`,
          `<line x1="${x + inset}" y1="${y + height - inset}" ` +
            `x2="${x + width - inset}" y2="${y + inset}" ` +
            `stroke="${esc(color)}" stroke-width="1.5"/>`
        )
      }
    }
    // computed verdicts (contrast failures etc.): severity-colored bars on
    // the LEFT edge — the unclaimed slot — plus the first flag's label
    if (!cramped && !structural && Array.isArray(w.flags) && w.flags.length > 0) {
      w.flags.forEach((flag, at) => {
        parts.push(
          `<rect x="${x + at * 3}" y="${y}" width="3" height="${height}" ` +
            `fill="${flagColor(flag.severity)}" data-flag="${esc(flag.kind)}"/>`
        )
      })
      const first = w.flags[0]
      if (first.label && height >= minLabelHeight) {
        parts.push(
          `<rect x="${x + w.flags.length * 3 + 1}" y="${y + height - 9}" ` +
            `width="${first.label.length * 4.5 + 2}" height="8" ` +
            `fill="white" opacity="0.85"/>`,
          `<text x="${x + w.flags.length * 3 + 2}" y="${y + height - 2}" ` +
            `font-size="7" font-family="monospace" ` +
            `fill="${flagColor(first.severity)}">` +
            // the drawn label is a text RUN (neutralize: rare glyphs tofu);
            // the legend's copy of flags stays verbatim, per the spec
            `${esc(neutralizeArrows(first.label))}</text>`
        )
      }
    }
    // undersized interactive element: one amber bar on the left edge —
    // legible at any size; the measurement itself rides the legend
    if (undersized != null) {
      parts.push(
        `<rect x="${x}" y="${y}" width="3" height="${height}" ` +
          `fill="${FLAG_COLORS.warn}" data-flag="target-size"/>`
      )
    }
    // invalid = the spreadsheet error-corner: a red flag at top-left
    // (index owns top-right, ↔ owns bottom-right) — geometry, so it's
    // legible at any raster scale and in any font
    if (w.invalid === true && !structural) {
      const flagSize = Math.min(7, Math.floor(Math.min(width, height) / 2))
      parts.push(
        `<path d="M${x} ${y} l${flagSize} 0 l-${flagSize} ${flagSize} z" ` +
          `fill="#d32f2f"/>`
      )
    }
    // focus ring: a second outline just outside the box — where the user IS
    if (w.focused === true && !structural) {
      parts.push(
        `<rect x="${x - 2.5}" y="${y - 2.5}" width="${width + 5}" ` +
          `height="${height + 5}" fill="none" stroke="${esc(stroke)}" ` +
          `stroke-width="1.5"/>`
      )
    }
    // editable = an ↔ badge at the box's right edge — SEPARATE from the
    // caption text: rasterizers resolve fonts per text run, and one exotic
    // glyph (⟷ is rare in monospace fonts) can tofu the whole caption.
    // ↔ (U+2194) is near-universal; isolated, it can only cost itself.
    if (editable && !toggle && !cramped) {
      parts.push(
        `<text x="${x + width - 3}" y="${y + height - 4}" ` +
          `font-size="${fontSize}" text-anchor="end" ` +
          `font-family="monospace" fill="${esc(color)}">↔</text>`
      )
    }
    let drawnCaption: string | null = null // null = caption block never ran
    // required wears the universal asterisk on its caption — ASCII-safe
    const shownCaption =
      w.required === true && !structural && caption !== ''
        ? `${caption} *`
        : caption
    if (toggle) {
      // the toggle's label sits to the RIGHT of the control, like the real
      // layout — the control itself already says everything else
      if (shownCaption !== '') {
        parts.push(
          `<text x="${x + width + 4}" ` +
            `y="${y + height / 2 + fontSize / 2 - 1}" ` +
            `font-size="${fontSize}" font-family="monospace" ` +
            `fill="${esc(color)}">` +
            `${esc(shownCaption.slice(0, maxCaption + 2))}</text>`
        )
      }
    } else if (!cramped && height >= minLabelHeight && shownCaption !== '') {
      // wrap when the box affords more than one line — a paragraph that
      // wraps on the real page has the same vertical room here; truncating
      // at maxCaption with space to spare threw that text away
      const lineHeight = fontSize + 2
      const maxLines = Math.max(1, Math.floor((height - 6) / lineHeight))
      const perLine = Math.min(
        maxCaption,
        Math.max(8, Math.floor((width - 8) / (fontSize * 0.6)))
      )
      const lines = wrapCaption(shownCaption, perLine, maxLines)
      // rejoining with single spaces reconstructs a fully-wrapped caption
      // exactly (wrapping only consumes break spaces) — a caption-count
      // comparison would mark EVERY wrapped caption truncated
      drawnCaption = lines.join(' ')
      const styleAttrs =
        `font-size="${fontSize}" font-family="monospace" fill="${esc(color)}"` +
        `${hint ? ' font-style="italic" opacity="0.6"' : ''}`
      if (lines.length === 1) {
        parts.push(
          `<text x="${x + 4}" y="${y + Math.min(height - 4, fontSize + 2)}" ` +
            `${styleAttrs}>${esc(lines[0])}</text>`
        )
      } else {
        parts.push(
          `<text x="${x + 4}" y="${y + fontSize + 2}" ${styleAttrs}>` +
            lines
              .map(
                (line, at) =>
                  `<tspan x="${x + 4}"${at > 0 ? ` dy="${lineHeight}"` : ''}>` +
                  `${esc(line)}</tspan>`
              )
              .join('') +
            '</text>'
        )
      }
    }
    // build the legend entry: everything the drawing could not carry
    const truncated =
      drawnCaption != null &&
      drawnCaption.length <
        shownCaption.split(' ').filter(Boolean).join(' ').length
    const elided: SchematicLegendEntry = { index, tag: w.tag }
    if (w.ref != null) elided.ref = String(w.ref)
    // a destination is always legend-worthy: it never fits a caption
    // legibly, and it's the fact an agent acts on ("goes to Y", not
    // "says X")
    if (typeof w.href === 'string' && w.href !== '' && !structural) {
      elided.href = w.href
    }
    if (cramped || truncated) {
      if (shownCaption !== '' && !toggle) elided.caption = caption
      const heldValue = shownValue(w.value)
      if (heldValue) elided.value = heldValue
      if (cramped) {
        if (editable) elided.editable = true
        if (w.required === true) elided.required = true
        if (Array.isArray(w.flags) && w.flags.length > 0) {
          elided.flags = w.flags as SchematicLegendEntry['flags']
        }
      }
    }
    if (w.invalid === true && cramped) elided.invalid = true
    if (w.disabled === true && cramped) elided.disabled = true
    if (undersized != null) elided.undersized = undersized
    const inLegend =
      elided.caption != null ||
      elided.href != null ||
      elided.value != null ||
      elided.editable != null ||
      elided.required != null ||
      elided.flags != null ||
      elided.invalid != null ||
      elided.disabled != null ||
      elided.undersized != null
    if (inLegend) legend.push(elided)
    // the stamp is the POINTER into the legend — cramped and legend-bearing
    // records always wear one, whatever showIndex says
    if (showIndex || w.ref != null || inLegend) {
      // the raster's actionable handle: the producer's DURABLE ref when it
      // has one (it survives re-renders; an agent can act on it), else the
      // wiring index (look up description.wiring[n]). Toggles are too small
      // to wear it inside — theirs sits just left of the control. A mostly
      // opaque white backdrop keeps it legible over ANY artwork.
      const shown = w.ref != null ? String(w.ref) : String(index)
      const indexX = toggle ? x - 3 : x + width - 2
      parts.push(
        `<rect x="${indexX - shown.length * 5 - 1}" y="${y + 1}" ` +
          `width="${shown.length * 5 + 2}" height="8" fill="white" ` +
          `opacity="0.85" data-index-backdrop="true"/>`,
        `<text x="${indexX}" y="${y + 8}" font-size="8" ` +
          `text-anchor="end" font-family="monospace" fill="black" ` +
          `opacity="0.8">${esc(shown)}</text>`
      )
    }
    if (decorate != null) {
      decorate({
        record: w,
        index,
        x,
        y,
        width,
        height,
        structural,
        emit: (svg) => parts.push(svg),
      })
    }
    parts.push('</g>')
  }
  // the image confesses what it couldn't carry: a machine-readable <desc>
  // plus a visible footer strip — the raster's pointer to its legend JSON
  const footerExtra = legendNote && legend.length > 0 ? 14 : 0
  if (footerExtra > 0) {
    parts.push(
      `<text x="${minX + pad}" y="${maxY + 10}" font-size="8" ` +
        `font-family="monospace" fill="currentColor" opacity="0.75">` +
        `${legend.length} element${legend.length === 1 ? '' : 's'} with ` +
        `details in legend — match by stamped number</text>`
    )
  }
  const descBits: string[] = []
  if (legend.length > 0) {
    descBits.push(
      `${description.wiring.length} records; ${legend.length} ` +
        'legend entries carry metadata the drawing could not — pair this ' +
        'image with its legend JSON (schematic().legend), matched by the ' +
        'stamped number / data-record index.'
    )
  }
  if (note != null) descBits.push(note)
  parts[0] =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${
      maxX - minX
    } ${maxY - minY + footerExtra}" width="${maxX - minX}" height="${
      maxY - minY + footerExtra
    }">` +
    (descBits.length > 0 ? `<desc>${esc(descBits.join(' '))}</desc>` : '')
  parts.push('</svg>')
  const result: SchematicResult = { svg: parts.join(''), legend }
  if (note != null) result.note = note
  return result
}

/** the string-only form — schematic().svg, kept for drop-in compatibility */
export const schematicSVG = (
  description: SchematicDescription,
  options: SchematicOptions = {}
): string => schematic(description, options).svg

/**
 * Rasterize an SVG string to a PNG Blob — the vision-encoder form of the map
 * (rasterize at 2× so labels land large enough to OCR near-losslessly).
 *
 * Browser-only by design: it uses Image + canvas, which keeps tosijs at zero
 * dependencies. Under bun/node, use `@resvg/resvg-js` directly instead:
 *
 *     const { Resvg } = await import('@resvg/resvg-js')
 *     const png = new Resvg(svg, { fitTo: { mode: 'zoom', value: 2 } })
 *       .render().asPng()
 */
export const rasterizeSVG = (
  svg: string,
  options: { scale?: number } = {}
): Promise<Blob> => {
  const { scale = 2 } = options
  if (typeof document === 'undefined' || typeof Image === 'undefined') {
    return Promise.reject(
      new Error(
        'rasterizeSVG needs a browser (Image + canvas); under bun/node use @resvg/resvg-js — see the doc comment'
      )
    )
  }
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  const img = new Image()
  return new Promise<Blob>((resolve, reject) => {
    img.onload = () => {
      try {
        const width = (img.naturalWidth || 800) * scale
        const height = (img.naturalHeight || 600) * scale
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx == null) throw new Error('no 2d context')
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          if (blob != null) resolve(blob)
          else reject(new Error('canvas.toBlob produced no data'))
        }, 'image/png')
      } catch (e) {
        reject(e as Error)
      } finally {
        URL.revokeObjectURL(url)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('SVG failed to load as an image'))
    }
    img.src = url
  })
}
