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
export declare const BOUND_TO_DOM = "\u27F5";
export declare const BOUND_TWO_WAY = "\u27F7";
/**
 * One wired element, flat. Producers may include fields beyond these —
 * bound props ride as "value ⟷ path" strings under their own keys.
 */
export interface SchematicRecord {
    tag: string;
    id?: string;
    part?: string;
    role?: string;
    label?: string;
    placeholder?: string;
    type?: string;
    checked?: boolean;
    focused?: boolean;
    invalid?: boolean;
    required?: boolean;
    disabled?: boolean;
    contentEditable?: boolean;
    description?: string;
    text?: string;
    on?: Record<string, string | string[]>;
    list?: {
        path: string;
        idPath?: string;
    };
    bounds?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    viewportFixed?: boolean;
    structural?: boolean;
    style?: {
        background: string;
        borderColor: string;
        color: string;
    };
    /** a DURABLE, actionable handle from the producer (haltija's `@42`) —
     * survives re-renders where a wiring index doesn't; rendered in the
     * index slot in preference to the index, and emitted as data-ref */
    ref?: string;
    /** computed verdicts about this element (WCAG contrast failures, etc.) —
     * drawn as severity-colored bars on the LEFT edge (the unclaimed slot),
     * with the first flag's label */
    flags?: Array<{
        kind: string;
        label: string;
        severity?: 'info' | 'warn' | 'error';
    }>;
    /** pixels a pure renderer can't obtain: a data-URL snapshot of inline
     * media (serialized <svg>, <canvas>.toDataURL()) drawn IN PLACE — on an
     * illustration-led page the picture IS the content */
    image?: string;
    /** a link's destination — the most actionable fact about a link, and
     * deliberately distinct from `text` ("the link says X" is not "the link
     * goes to Y"). Captions fall back to it only when nothing else names the
     * element; it ALWAYS rides the legend — URLs are the facts most often
     * too long to draw */
    href?: string;
    /** a filled control's value, distinct from label/placeholder — static
     * ("3") or bound ("3 ⟷ app.qty"). tosijs emits it as a bound prop; the
     * declared field gives plain-DOM producers the same home */
    value?: string;
    /** the producer's ASSERTION that this element can be acted on — for
     * producers that cannot introspect handlers (React delegates at a root;
     * vanilla addEventListener is not enumerable from page script). A binding
     * framework never needs it: `on` and two-way bindings already say so.
     * Asserting is truth-telling; fabricating `on` to unlock the styling
     * would be a lie in the payload. (issue #3, haltija) */
    interactive?: boolean;
    /** the producer's assertion that text goes in here — the DOM-side
     * counterpart of contentEditable/two-way bindings (issue #3) */
    editable?: boolean;
    [boundProp: string]: unknown;
}
/** the map: only `wiring` is read. The named optional fields are the
 * known producer extras (tosijs's describe() shape) — deliberately NOT an
 * index signature, which would stop interface-typed producers (TS gives
 * implicit index signatures to literals, never to interfaces) from
 * assigning without casts. */
export interface SchematicDescription {
    wiring: SchematicRecord[];
    roots?: unknown;
    actions?: unknown;
    exposure?: unknown;
    contract?: unknown;
}
export interface SchematicBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface SchematicOptions {
    /** padding around the drawn region, px (default 8) */
    pad?: number;
    /** boxes shorter than this get no caption (default 14) */
    minLabelHeight?: number;
    /** caption length limit (default 36) */
    maxCaption?: number;
    /** caption font size, px (default 11) */
    fontSize?: number;
    /**
     * Scope the map SPATIALLY: only records whose bounds intersect this
     * page-coordinate rect are drawn, and the viewBox IS the rect — the
     * schematic becomes "this region of the page". Use `boundsOf(element)`
     * to scope to an element's region; omit for the whole map.
     */
    within?: SchematicBounds;
    /**
     * Stamp each box with its wiring index (top-right corner) — the raster
     * form of `data-record`: a vision consumer reads the number off the image
     * and looks the record up in `description.wiring[n]` — image as legend.
     */
    index?: boolean;
    /**
     * Interactive elements (handlers or editable, toggles exempt as
     * user-agent-sized) smaller than this on either axis are flagged
     * undersized — amber bar + legend fact. Default 24 (WCAG 2.5.8 AA);
     * raise to 44/48 for the AAA / platform touch-target bar. 0 disables.
     */
    targetSize?: number;
    /** draw the footer strip advertising the legend when it's non-empty
     * (default true) — the raster must confess what it couldn't carry */
    legendNote?: boolean;
    /**
     * EXPERIMENTAL plugin seam: called once per drawn record, just before
     * its <g> closes — emit extra SVG into the record's group. The corner
     * slots already spoken for: top-left = invalid flag, top-right = index,
     * bottom-right = ↔ badge, outline = focus ring / emphasis. Claim empty
     * real estate; the first real plugins will shape the successor API.
     */
    decorate?: (ctx: {
        record: SchematicRecord;
        index: number;
        x: number;
        y: number;
        width: number;
        height: number;
        structural: boolean;
        emit: (svg: string) => void;
    }) => void;
}
/** what the drawing could not legibly carry, keyed back by index/ref —
 * the image's companion JSON. Pair every raster with this. */
export interface SchematicLegendEntry {
    index: number;
    ref?: string;
    tag: string;
    /** the caption that would have been drawn (or its untruncated form) */
    caption?: string;
    editable?: boolean;
    required?: boolean;
    invalid?: boolean;
    disabled?: boolean;
    flags?: Array<{
        kind: string;
        label: string;
        severity?: 'info' | 'warn' | 'error';
    }>;
    /** the link's destination — carried whenever the record has one */
    href?: string;
    /** the control's held value (provenance stripped), when the drawing
     * elided or truncated it */
    value?: string;
    /** interactive element below the target-size floor, e.g.
     * "18×13 — below 24×24 (WCAG 2.5.8)" */
    undersized?: string;
}
export interface SchematicResult {
    svg: string;
    legend: SchematicLegendEntry[];
    /** set when the map draws affordance-shaped boxes but NO record carries
     * any affordance evidence: "nothing here is actionable" and "the
     * producer couldn't tell" are different statements, and a consumer
     * acting on the first when the truth is the second is the
     * confident-wrong-answer case (issue #3). Also rides the svg's <desc>. */
    note?: string;
}
/**
 * An element's page-coordinate bounds (the same space describe() records) —
 * the natural `within` argument for a region-scoped schematic.
 */
export declare const boundsOf: (element: Element) => SchematicBounds;
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
export declare const isInteractive: (w: SchematicRecord) => boolean;
/** the WCAG 2.5.8 audit floor (24×24, the AA minimum) — one constant so
 * the option default and the exported rule cannot drift */
export declare const TARGET_SIZE_DEFAULT = 24;
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
export declare const targetSizeFinding: (w: SchematicRecord, targetSize?: number) => string | null;
export declare const schematic: (description: SchematicDescription, options?: SchematicOptions) => SchematicResult;
/** the string-only form — schematic().svg, kept for drop-in compatibility */
export declare const schematicSVG: (description: SchematicDescription, options?: SchematicOptions) => string;
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
export declare const rasterizeSVG: (svg: string, options?: {
    scale?: number;
}) => Promise<Blob>;
