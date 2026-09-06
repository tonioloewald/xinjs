import { WebMCPAdapterOptions } from './webmcp';
import type { BoxedScalar, TosiProps } from './xin-types';
/**
 * The contract seam — tosijs stays zero-dependency, so the core doesn't know
 * any schema language; it knows a CHECK. The blessed adapter is a few lines
 * over tosijs-schema (`validate` on write, schemas into `describe()`), but
 * anything that can say "no, and here's why" fits.
 */
/**
 * **What a contract gates, and what it does not.** A contract is checked at
 * two boundaries: `agent.write()` (a non-human actor writing into your app)
 * and a Component's `value` setter. It is deliberately NOT a registry-wide
 * invariant — `share()`, `sync()` and `hotReload()` write straight to state.
 *
 * That is a trust boundary, not a gap: `share()` peers are same-origin by
 * construction (anything that can post to that channel can already assign
 * to `xin` directly), a `SyncTransport` is chosen and wired by the app
 * itself, and `hotReload()` restores what the same app wrote. Validation
 * would add ceremony, not safety. Those writes remain **auditable** — the
 * agent ledger observes every touch in scope.
 *
 * The case that MAY warrant enforcement is version skew (a peer or server
 * ahead of this client pushing a shape it doesn't expect); that is planned
 * as an opt-in on those APIs rather than a default, because refusing an
 * inbound delta leaves the receiver stuck rather than merely inconsistent.
 */
export interface AgentContract {
    /**
     * Validate a write at `path`; `true`, or an Error saying WHY (the refusal
     * is part of the surface — agents self-correct from reasons, not booleans).
     *
     * When the write lands at or under a contracted root (a key of
     * `describe()`), core supplies `proposal`: the root path and the
     * HYPOTHETICAL value of that whole root after this write. Validate the
     * proposal, not the leaf — sub-path writes then bypass nothing, and
     * root-level cross-field constraints and $predicates see every edit in
     * full context (a write to `app.docs[2].editor.value` is judged as the
     * docs array it would produce).
     */
    check: (path: string, value: any, proposal?: {
        root: string;
        proposed: any;
    }) => true | Error;
    /** serializable per-root contract (JSON-Schema-shaped, by convention) —
     * lands in describe().contract: "what's legal", not just what exists.
     * Its KEYS also tell core which roots are contracted (read once at
     * enable time) so proposals can be routed. */
    describe?: () => Record<string, any>;
}
/**
 * A component's self-declaration: contract, description, part map, and test
 * fixture in ONE structure. Declared as `static contract` on a Component
 * subclass (one word everywhere: the app manifest takes `expose.contract`,
 * the component declares `static contract`); harvested by describe() for any
 * wired instance; exercised by `exerciseComponent()` — a declaration that
 * feeds the map, the agent, and the harness breaks visibly when it lies.
 *
 * Declared tests here are SHIPPED, serializable claims (an agent can
 * self-verify a component wherever it mounts). Dev-only tests belong in tjs
 * `test {}` blocks instead (stripped from bundles) — and once components go
 * native-TJS, the bridge is a test block that calls exerciseComponent().
 */
/**
 * One step of a declared component test — PURE DATA, deliberately: today the
 * runner is exerciseComponent, tomorrow the same steps can be authored in
 * AJS, shipped over the wire, and replayed anywhere the component mounts.
 */
export interface ComponentTestStep {
    /** assign properties on the instance, e.g. { value: 3 } */
    set?: Record<string, any>;
    /** click a declared part by name */
    click?: string;
    /** assertions: value (faithful deep-equal) and/or per-part textContent */
    expect?: {
        value?: any;
        text?: Record<string, string>;
    };
}
export interface ComponentMap {
    /** one line for humans and agents alike. Materializes as
     * `aria-description` — a description is NOT a name, and stamping it as
     * one made components announce developer prose instead of their content. */
    description?: string;
    /** the ARIA role this component plays (`'button'`, `'tablist'`, …).
     * Materializes as the `role` attribute unless the author set one — which
     * fixes the audit's `missing-role` finding from the same declaration that
     * feeds the map, the types and the tests. */
    role?: string;
    /** the value contract (JSON-Schema-shaped; examples/$counterexamples make
     * it executable — see exerciseComponent) */
    value?: Record<string, any>;
    /** attribute contracts by attribute name (JSON-Schema-shaped) */
    attributes?: Record<string, Record<string, any>>;
    /** methods the component exposes, by name */
    methods?: Record<string, {
        description?: string;
    }>;
    /** declared parts: part name → expected tag (lowercase). When the class is
     * declared `Component<typeof map>` (map `as const`), these tags TYPE
     * `this.parts` — the declaration is the type. */
    parts?: Record<string, string>;
    /** named behavioral tests as serializable step scripts — run by
     * exerciseComponent, declared beside the behavior they pin. An ARRAY, on
     * purpose: execution order should be explicit in a serializable contract
     * (JS objects reorder integer-like keys, and other languages' maps promise
     * nothing) — and each test still snapshot/restores, so order-independence
     * remains the goal, just not a load-bearing assumption. */
    tests?: Array<{
        name: string;
        steps: ComponentTestStep[];
    }>;
}
export interface AgentExpose {
    /** state roots this surface may see — paths, or the proxies themselves:
     * `roots: [app.cart]` and `roots: ['app.cart']` are the same manifest */
    roots?: AgentPathRef[];
    /** actions this surface may `call()` — paths or proxies, as with `roots` */
    actions?: AgentPathRef[];
    contract?: AgentContract;
    /**
     * Allow `write()` into the declared roots. **Defaults to false** — a
     * manifest scopes what may be SEEN; changing the world is a separate,
     * explicit grant.
     *
     * The 1.8.0 security pass found the two reachable postures were
     * unscoped-read and scoped-read-*plus-write*: narrowing reads with
     * `roots` simultaneously made those roots writable, so the safest-sounding
     * option was the one that granted the most. There was no way to say
     * "scoped reads, no writes" — the posture a production surface most often
     * wants. This flag is that posture's other half; `expose: 'all'` still
     * grants everything at once.
     *
     * Declared `actions` remain callable without it: `call()` invokes what the
     * app chose to publish, `write()` assigns arbitrary values into state.
     */
    write?: boolean;
}
export interface AgentInterfaceOptions {
    /**
     * What this surface may expose. **Omit it and nothing is exposed** —
     * `describe()` reports an empty app and every verb refuses (1.9.0; it used
     * to mean read-only over the entire registry). Pass a manifest —
     * `{ roots, actions, contract }` — for the production shape, or the literal
     * `'all'` for full read/write/call over everything, deliberately and with a
     * warning.
     */
    expose?: AgentExpose | 'all';
    /**
     * POST-HOC component contracts, by tag name — for lofting components whose
     * classes you don't control (a legacy app, a library's widgets, the doc
     * system itself). A class's OWN `static contract` always wins; these fill
     * the gaps. Works in ANY mode: the whole surface can be attached from
     * outside the app — a console, a userscript, an extension — and with this,
     * so can the component-level self-descriptions.
     */
    components?: Record<string, ComponentMap>;
    /** install as globalThis.tosiAgent (default true); pass a string to rename */
    global?: boolean | string;
    /**
     * Auto-register the generated WebMCP tool set when the browser provides a
     * model-context host (default true — a no-op where no host exists). Pass
     * adapter options to configure, or `false` to keep the surface off the
     * browser's tool registry. NOTE: per-action tools snapshot the surface at
     * enable time — enable AFTER the UI is wired (re-enabling reconfigures).
     */
    webmcp?: boolean | WebMCPAdapterOptions;
    /** audit-ledger cap (default 10,000 entries). The ledger records every
     * settled touch and surfaces are meant to be enabled once and left, so
     * it is a ring buffer; `changes()` reports `truncated: true` if a drain
     * spans dropped entries. */
    maxLog?: number;
    /**
     * Silence THIS surface's posture notice (default false).
     *
     * `settings.quiet` is global and silences every advisory tosijs emits; this
     * is per-surface, for a page that enables one deliberately and does not want
     * the console line — and for tests, which want one surface quiet without
     * muting the library for every other test in the process.
     *
     * It was passed at 16 test call sites before it existed. Nothing caught that:
     * `tsconfig.json` and `tsconfig.build.json` both EXCLUDE `*.test.ts`, so no
     * lane typechecks tests, and the calls were silently accepted as excess
     * properties on a widened object. They passed only because the posture notice
     * dedupes on `lastPostureAnnounced`.
     */
    quiet?: boolean;
}
/**
 * Provenance tokens for bound properties in describe() output. A bound prop
 * reads `"<current value> <arrow> <path>"` — the arrow both marks the value
 * as live and carries its direction:
 *   ⟵  state flows to the DOM only (display)
 *   ⟷  two-way (fromDOM present — a user-writable affordance)
 * Chosen as tokens unlikely to occur in real values; parsers should split on
 * ` ⟷ ` / ` ⟵ ` (spaces included). A plain value with no arrow is static.
 */
export declare const BOUND_TO_DOM = "\u27F5";
export declare const BOUND_TWO_WAY = "\u27F7";
/**
 * One wired element, flat: semantically visible facts (tag, label, text,
 * bound props, handlers) at the top; anything that can't be expressed flat
 * drops one level into `detail`.
 */
export interface AgentWiringRecord {
    tag: string;
    id?: string;
    part?: string;
    role?: string;
    /** harvested from aria-label(ledby) / title / alt — the accessible NAME */
    label?: string;
    /** the placeholder hint, kept distinct from label: an empty input with a
     * placeholder must never read as an input with content */
    placeholder?: string;
    /** input kind when it isn't plain text (checkbox, radio, range, …) */
    type?: string;
    /** live checked state for checkboxes and radios — DOM truth at map time */
    checked?: boolean;
    /** this control holds a secret (password / one-time code): its VALUE is
     * never emitted, only the fact that it exists and what it's bound to */
    secret?: boolean;
    /** this element holds keyboard focus right now — where the user IS */
    focused?: boolean;
    /** resolved aria-describedby text — the author's own explanation */
    description?: string;
    /** present and true when the affordance is currently disabled */
    disabled?: boolean;
    /** present and true when the field is required */
    required?: boolean;
    /** present and true when the control's live ValidityState says invalid
     * (or aria-invalid is set) — the map reads what :invalid styles */
    invalid?: boolean;
    /** a link's destination — "says X" is not "goes to Y". Links are
     * intrinsic affordances: enumerated even when nothing else wires them;
     * the renderer captions nameless links by their href and always carries
     * href in the legend (URLs are the facts most often too long to draw) */
    href?: string;
    /** contenteditable: surfaces AS an input field. What matters to an agent
     * is that the region EXISTS and which path feeds it — it will read and
     * write the bound state directly, not synthesize keystrokes — so the
     * record leads with existence + bindings (live text as value,
     * aria-placeholder as hint), mapped even before bindings attach */
    contentEditable?: boolean;
    /** textContent — static ("foo") or bound ("foo ⟵ path") */
    text?: string;
    /** event handlers by type — a path string when nameable, 'ƒ' when anonymous */
    on?: Record<string, string | string[]>;
    /** a list binding rendering a collection */
    list?: {
        path: string;
        idPath?: string;
    };
    /** the component's own self-declaration, when its class carries a
     * `static componentMap` — the element doesn't just have affordances, it
     * DESCRIBES them */
    component?: ComponentMap;
    /** inline contract declared where the element was built
     * (`input({ bindValue, contract })`) — JSON-Schema-shaped; also aggregated
     * into describe().contract under the element's bound path */
    contract?: Record<string, any>;
    /** page-relative geometry — the layout IS part of the semantics; zero-size
     * means "not currently visible", which is itself information */
    bounds?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /** the element rides the VIEWPORT (fixed/sticky ancestry): bounds are
     * viewport coordinates, not page coordinates — screen furniture has no
     * stable page position */
    viewportFixed?: boolean;
    /** structure, not affordance: headings, landmarks, and the containers of
     * wired elements — the page's information architecture, mappable and
     * filterable */
    structural?: boolean;
    /** computed colors, harvested when describe({ styles: true }) */
    style?: {
        background: string;
        borderColor: string;
        color: string;
    };
    /** bindings that couldn't be named as a flat prop */
    detail?: Array<{
        path: string;
        readable: boolean;
        writable: boolean;
    }>;
    /** named bound props (value, checked, disabled, …): "value ⟷ path" strings */
    [boundProp: string]: unknown;
}
/** the interrogable identity of an agent surface (tosijs#23) */
export interface AgentSurfaceVersion {
    /** shape-contract version — bump when describe()'s shape changes */
    surface: string;
    /** the tosijs version that produced this surface */
    tosijs: string;
    /** enumerable feature names — test membership, don't infer from semver */
    capabilities: string[];
}
/**
 * The SHAPE contract version. Bump on any change a consumer reading
 * describe() could notice: renamed/removed record fields, changed
 * provenance tokens, changed nesting. Additive optional fields do NOT
 * require a bump (they can't break a reader) — but DO add a capability.
 */
export declare const AGENT_SURFACE_VERSION = "1.0.0";
/**
 * Capabilities of this build's surface. A consumer asks
 * `agent.version.capabilities.includes('bounds')` rather than inferring
 * from a version number — the whole point of tosijs#23.
 */
export declare const AGENT_CAPABILITIES: readonly ["describe", "read", "write", "observe", "call", "changes", "when", "log", "bounds", "styles", "scope", "viewport", "structure", "aria", "validity", "contract", "components", "webmcp"];
export interface AgentDescription {
    /** the surface's identity — travels WITH the map, so a serialized
     * description is self-describing wherever it lands (tosijs#23) */
    version: AgentSurfaceVersion;
    roots: Record<string, string>;
    wiring: AgentWiringRecord[];
    actions: string[];
    /** 'closed' (the default since 1.9.0: nothing is exposed until you say so),
     * 'manifest' (the declared roots/actions), or 'all' (everything,
     * deliberately). Renamed from 'read-only'/'introspection' when the default
     * stopped exposing the whole registry — the old names described a posture
     * that no longer exists. */
    exposure: 'closed' | 'manifest' | 'all';
    /** whether `write()` can land at all. Orthogonal to `exposure`, because a
     * manifest scopes what may be SEEN: `expose: { roots }` is readable but
     * not writable until it says `write: true`. Read this rather than
     * inferring writability from the posture name. */
    writable: boolean;
    /** what's LEGAL, per root — present when the manifest declares a contract */
    contract?: Record<string, any>;
}
export interface AgentChange {
    path: string;
    value: any;
}
export interface AgentLogEntry {
    seq: number;
    path: string;
    /** synthetic audit notes (e.g. when() arming/resolution) — not state touches */
    note?: string;
}
/**
 * Why the SURFACE refused, as a tag rather than as prose.
 *
 * `exerciseContract()` has to tell "the surface refused this write before any
 * contract ran" (inconclusive) from "the contract rejected it" (a pass), and
 * it did so by substring-matching the error message. That is a coupling
 * between a security gate and its own wording, and it broke exactly as you
 * would expect: 1.9.0 rewrote every refusal message, and by the re-review ALL
 * THREE substrings were unreachable while the one refusal that does fire —
 * "is callable, not writable" — matched none of them, so a contract suite of
 * nothing but `$counterexamples` returned `{ passed: 2, failed: 0 }`,
 * byte-identical to a genuinely validated run, in a public API consumers run
 * in their own CI.
 */
export type AgentRefusalKind = 'scope' | 'mutability' | 'callable' | 'path' | 'revoked';
/** an Error carrying why the surface refused; `kind` survives message edits */
export interface AgentRefusalError extends Error {
    tosiRefusal: AgentRefusalKind;
}
export declare const isAgentRefusal: (e: unknown) => e is AgentRefusalError;
/**
 * A path, or the thing that lives at it.
 *
 * Every verb and every manifest entry takes either — `agent.read('app.cart')`
 * and `agent.read(app.cart)` mean the same thing, because a tosijs proxy
 * already carries its own path and nobody should have to spell it twice.
 *
 * Hand-written paths are a transcription problem: they duplicate a fact the
 * proxy knows, they don't move when you rename a root, and nothing checks
 * them. This is the fix — but note what it does NOT fix, because a real
 * session confused the two. A **wrong string** is still just a wrong string;
 * only the proxy form is checked, and only because it isn't a string at all.
 */
export type AgentPathRef = string | BoxedScalar<any> | TosiProps<any>;
/**
 * What `observe()` accepts: a path or proxy, or — under `expose: 'all'` only
 * — a pattern matching many paths, which the underlying observer has always
 * supported and which the map's own "redraw on any change" examples use.
 */
export type AgentObserveRef = AgentPathRef | RegExp | ((path: string) => boolean);
export interface AgentInterface {
    /**
     * `scope` limits the wiring walk to one element's SUBTREE — hierarchy
     * scoping ("this part of the app"), stable regardless of how big the
     * subtree renders. Contrast schematicSVG's `within` rect, which is
     * REGIONAL ("this area of the page") and includes whatever overlaps it.
     */
    describe: (options?: {
        styles?: boolean;
        scope?: Element;
        /** include the structural tier (headings/landmarks/containers) —
         * default true; pass false for affordances only */
        structure?: boolean;
        /** 'page' (default): every record, true unrolled-document coordinates —
         * the atlas. 'viewport': only what is VISIBLE right now, in screen
         * coordinates — the camera. Users see the viewport; pages are designed
         * to be legible in that frame, and so is its map. */
        view?: 'page' | 'viewport';
    }) => AgentDescription;
    read: (path: AgentPathRef) => any;
    write: (path: AgentPathRef, value: any) => void;
    observe: (path: AgentObserveRef, callback: (path: string) => void) => () => void;
    call: (actionPath: AgentPathRef, ...args: any[]) => any;
    changes: (since?: number) => {
        cursor: number;
        changes: AgentChange[];
        /** present and true when the drain reached past entries the ring
         * buffer had already dropped — you did not see everything */
        truncated?: boolean;
    };
    /**
     * Await a state CONDITION, not a change: resolves (with the satisfying
     * value) as soon as the value at `path` satisfies `predicate` — immediately
     * if it already does. The episodic agent's missing middle: name the world
     * you're waiting for and spend no inference until it arrives. The wait is
     * audit-logged. No built-in timeout — Promise.race one in if you need it.
     */
    when: (path: AgentPathRef, predicate: (value: any) => boolean) => Promise<any>;
    log: () => AgentLogEntry[];
    disable: () => void;
    /**
     * What this surface IS, so consumers can ask instead of assume
     * (tosijs#23, raised by haltija after a shape mismatch rendered a
     * confident blank).
     *
     * - `surface` — the SHAPE contract version, bumped when the record/map
     *   shape changes in a way a consumer could notice. Independent of the
     *   library version: shape stability is the thing being promised.
     * - `tosijs` — the library version, for provenance.
     * - `capabilities` — enumerable feature names. Test membership rather
     *   than inferring from a version number.
     */
    version: AgentSurfaceVersion;
    /** names of the WebMCP tools auto-registered at enable time — set only
     * when a model-context host was present (feature-detect by presence) */
    webmcp?: {
        tools: string[];
    };
}
/**
 * May this node's RENDERED CONTENT be published?
 *
 * ONE predicate, threaded in, rather than a guard restated at each harvest.
 * Six review findings across three rounds were all the same invariant wrong at
 * a site nobody had enumerated — `boundValue`, the list-redaction walk, its
 * descent, three `describe()` harvests, the structural tier, and then
 * `associatedLabel`, which had no guard at all. Restating it a seventh time
 * would be the same bet that lost six times.
 *
 * `describeElement` is module-level and pure, so it cannot see `inScope`
 * (per-surface). Callers that have a posture pass this in; callers that don't
 * omit it and get today's unguarded behaviour, which is correct for them.
 */
export type ContentGuard = (node: Element) => boolean;
/**
 * Reset the once-per-process posture notices (testing only). Without this
 * the `expose: 'all'` consent warning could not be asserted — the latch is
 * spent by the first surface any test creates, so the assertion had to be
 * written as "…or no warnings at all", which can never fail. That warning
 * is the only signal that every state root is writable through a global.
 */
export declare function _resetPostureNotices(): void;
export declare function enableAgentInterface(options?: AgentInterfaceOptions): AgentInterface;
