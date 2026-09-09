/*{ "parent": "utilities", "description": "EXPERIMENTAL agent interface: expose a tosijs app's state, wiring, and actions to AI agents (and test harnesses) as a described, observable, path-addressed surface." }*/
/*#
# agent (EXPERIMENTAL)

`enableAgentInterface()` turns a tosijs app's existing records — the state
registry, the binding wiring, the event handlers — into a described,
path-addressed surface for *non-human users*: AI agents, test harnesses,
automation. Nothing is recorded that tosijs doesn't already know; `describe()`
assembles the picture on demand.

**Nothing is exposed until you say so.** Say what an agent may see, and that
is exactly what it sees:

    import { tosi, enableAgentInterface } from 'tosijs'

    const { app } = tosi({ app: { cart: [], filter: '', addItem() {} } })

    const agent = enableAgentInterface({
      expose: {
        roots: [app.cart, app.filter],
        actions: [app.addItem, app.checkout],
        write: true, // omit for scoped reads with no writes
      },
    })

    agent.describe()          // roots, wiring (elements ↔ paths ↔ handlers), actions
    agent.read(app.filter)    // serializable value
    agent.observe(app.cart, (path) => { ... }) // push; returns un-observe
    agent.changes(cursor)     // turn-based drain: final value per changed path
    await agent.when(app.order.status, (s) => s === 'confirmed') // await a condition
    agent.write(app.filter, 'milk') // through the same observers as any write
    agent.call(app.addItem, 'buy milk')           // invoke an action by path
    agent.log()               // the audit trail

**Paths or proxies, everywhere.** Every verb and every manifest entry takes
either — `agent.read(app.filter)` and `agent.read('app.filter')` are the same
call, because the proxy already carries its path. Prefer the proxy: it survives
a rename and it cannot be misspelled. Strings remain fully supported, and are
what you want when the path arrives from outside the program (a tool call, a
config file, a wire message).

Anything that is *neither* — a plain object, a raw value read out of the tree —
is **refused**, with `kind: 'path'`. It used to be coerced with `String()`, so
`roots: [app.cart]` declared a root named `"[object Object]"` and every read
then failed as out-of-scope: a broken manifest whose error blamed the reader.
Worse for a scalar, where `String()` yields the *value*, so `read(app.filter)`
quietly read whatever path the filter text happened to spell.

Undeclared state is not redacted, it is **absent**: it never enters the map,
the elements bound to it never appear in `wiring`, and every verb refuses the
path. A manifest scopes **sight**, not reach — `roots` says what may be seen,
`write: true` is a separate grant to change it, and declared `actions` stay
callable either way. `describe().writable` reports which you have.

While developing, one word opens everything:

    const dev = enableAgentInterface({ expose: 'all' }) // and warns that it did

`enableAgentInterface()` with no manifest is legal and **exposes nothing** —
`describe()` reports an empty app and every verb refuses. That is deliberate:
the default used to be read-only over the *entire registry*, which is how four
separate secret leaks became reachable through one unargumented call. Scope is
the control; the redaction described below is defence in depth beneath it.

## Secrets

A path bound to a password field, a `cc-*` autocomplete, a hidden CSRF token,
or anything you mark `data-tosi-secret` is withheld — it reads back as the
sentinel `⟨secret⟩` rather than its value:

    <input type="password" data-bind="value=app.login.password">

    agent.read('app.login.password')  // '⟨secret⟩'
    agent.read('app.login')           // { user: 'ada', password: '⟨secret⟩' }

This matters for what you DID expose — an undeclared path is absent, not
redacted, so redaction is what protects a secret sitting *inside* a declared
root (and it is the only thing protecting you under `expose: 'all'`).

**And `describe()` withholds the element's own content, not just its bound
value.** A secret-marked element — or any element inside a
`data-tosi-secret` region — publishes its tag, role, name, bound path and
geometry, but *not* its `href`, `placeholder`, `title`/`alt`-derived name,
`aria-description` or a toggle's `checked` state. A reset-link token lives in
an `href`, not in a bound path, and until 1.11.0 it travelled in cleartext
beside a `text` field that had been correctly withheld. The record carries
`secret: true` so a consumer can tell suppression from absence.

An **`aria-label` survives** — it is authored to be announced, and dropping it
would make every secret control anonymous to assistive tech and to the audit.
Names survive secrecy; content and live state do not.

**Secrecy is a property of the PATH, not of an element.** Marking one control
secret withholds that path everywhere it surfaces — `read`, `describe`,
`changes`, `when` — including from *other* elements bound to the same path,
and from every field beneath it if the path names an object. It is also
one-way for the session: a path that was ever secret stays secret, because the
alternative is a window in which it isn't.

**What this is for, and what it is not.** It is not a defence against script
running in your page — that code can read the state directly and never asks
the agent surface. It exists because `describe()` output is *designed to
leave the machine*: it is assembled to be handed to a model, and typically an
off-device one. The guarantee is "tosijs will not volunteer your secrets into
that channel", not "your secrets are safe from an attacker with code
execution". Scope is the real control — declare a manifest, and keep
secrets out of the roots you expose.

**Shadow roots are covered (since 1.10.0).** Every secret scan used to be
light-DOM only — `querySelectorAll` and `closest` both stop at a shadow
boundary — while the *write* path deliberately crosses it. So a password
inside a styled `Component` wrote to state normally and was never redacted:
`read`, `changes` and `describe` all returned it in cleartext, against the
guarantee above, for anything using the supported shadow-DOM pattern. Three
things now cross the boundary: the document sweep descends into open shadow
trees, a `[data-tosi-secret]` region marks the paths bound *inside* it (it
previously withheld rendered content while leaving `read()` of the same path
in cleartext — half of what its name promises), and a component that renders
a secret control marks the path bound on its own **host**, which is where such
a binding actually lives. Closed shadow roots stay invisible, correctly:
nothing outside can bind into one either.

> **Matching is by spelling (tosijs#32).** A secret learned as
> `rows[id=r1].pw` is withheld from `read('rows')`, `read('rows[0])`, and
> `read('rows[0].pw')` — descent and index-aliasing are both covered. The
> known gap is narrower: exotic spellings of a *direct* query that no
> canonicalisation resolves. Treat the redaction as defence in depth beneath
> manifest scoping, not as the boundary itself.

One call is the whole story: where the browser provides a WebMCP host
(`document.modelContext`), `enableAgentInterface()` also registers the
generated tool set automatically — `agent.webmcp` is the receipt, and
`webmcp: false` opts out. No host, no-op.

> **🚧 CONTRACTS ARE IN FLUX.** `ComponentMap` / `static contract` /
> `expose.contract` will change shape without a deprecation cycle while the
> layering questions settle (tosijs#29, #30) — how `contract.attributes` and
> `initAttributes` divide the work, and whether an integrator's overlay may
> embellish a component's own declaration rather than replace it. Changes land
> in patch and minor releases and are called out in the CHANGELOG. For stable
> attribute declaration today, use `static initAttributes`; since 1.8.1 it is
> described to agents identically.
>
> **EXPERIMENTAL.** Shapes and names may change. The surface is deliberately
> protocol-neutral — MCP / WebMCP adapters sit on top of it; the WebMCP
> auto-registration is a convenience over that adapter, not a dependency.
*/
import { registry } from './registry'
import { version } from './version'
import { settings } from './settings'
import { observe, unobserve, extendsPath, Listener } from './path-listener'
import { getByPath, setByPath } from './by-path'
import { xin } from './xin'
import {
  BOUND_CLASS,
  getElementBindings,
  elementToHandlers,
  elementContract,
  anyInlineContracts,
  tosiValue,
  tosiPath,
  getArrayIdPaths,
} from './metadata'
import { contractViolation, ownContract } from './contract-check'
import { bindings } from './bindings'
import { propBindingKey } from './elements'
import { webmcpAdapter, WebMCPAdapterOptions } from './webmcp'
import type { BoxedScalar, TosiProps } from './xin-types'

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
  check: (
    path: string,
    value: any,
    proposal?: { root: string; proposed: any }
  ) => true | Error
  /** serializable per-root contract (JSON-Schema-shaped, by convention) —
   * lands in describe().contract: "what's legal", not just what exists.
   * Its KEYS also tell core which roots are contracted (read once at
   * enable time) so proposals can be routed. */
  describe?: () => Record<string, any>
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
  set?: Record<string, any>
  /** click a declared part by name */
  click?: string
  /** assertions: value (faithful deep-equal) and/or per-part textContent */
  expect?: { value?: any; text?: Record<string, string> }
}

export interface ComponentMap {
  /** one line for humans and agents alike. Materializes as
   * `aria-description` — a description is NOT a name, and stamping it as
   * one made components announce developer prose instead of their content. */
  description?: string
  /** the ARIA role this component plays (`'button'`, `'tablist'`, …).
   * Materializes as the `role` attribute unless the author set one — which
   * fixes the audit's `missing-role` finding from the same declaration that
   * feeds the map, the types and the tests. */
  role?: string
  /** the value contract (JSON-Schema-shaped; examples/$counterexamples make
   * it executable — see exerciseComponent) */
  value?: Record<string, any>
  /** attribute contracts by attribute name (JSON-Schema-shaped) */
  attributes?: Record<string, Record<string, any>>
  /** methods the component exposes, by name */
  methods?: Record<string, { description?: string }>
  /** declared parts: part name → expected tag (lowercase). When the class is
   * declared `Component<typeof map>` (map `as const`), these tags TYPE
   * `this.parts` — the declaration is the type. */
  parts?: Record<string, string>
  /** named behavioral tests as serializable step scripts — run by
   * exerciseComponent, declared beside the behavior they pin. An ARRAY, on
   * purpose: execution order should be explicit in a serializable contract
   * (JS objects reorder integer-like keys, and other languages' maps promise
   * nothing) — and each test still snapshot/restores, so order-independence
   * remains the goal, just not a load-bearing assumption. */
  tests?: Array<{ name: string; steps: ComponentTestStep[] }>
}

export interface AgentExpose {
  /** state roots this surface may see — paths, or the proxies themselves:
   * `roots: [app.cart]` and `roots: ['app.cart']` are the same manifest */
  roots?: AgentPathRef[]
  /** actions this surface may `call()` — paths or proxies, as with `roots` */
  actions?: AgentPathRef[]
  contract?: AgentContract
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
  write?: boolean
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
  expose?: AgentExpose | 'all'
  /**
   * POST-HOC component contracts, by tag name — for lofting components whose
   * classes you don't control (a legacy app, a library's widgets, the doc
   * system itself). A class's OWN `static contract` always wins; these fill
   * the gaps. Works in ANY mode: the whole surface can be attached from
   * outside the app — a console, a userscript, an extension — and with this,
   * so can the component-level self-descriptions.
   */
  components?: Record<string, ComponentMap>
  /** install as globalThis.tosiAgent (default true); pass a string to rename */
  global?: boolean | string
  /**
   * Auto-register the generated WebMCP tool set when the browser provides a
   * model-context host (default true — a no-op where no host exists). Pass
   * adapter options to configure, or `false` to keep the surface off the
   * browser's tool registry. NOTE: per-action tools snapshot the surface at
   * enable time — enable AFTER the UI is wired (re-enabling reconfigures).
   */
  webmcp?: boolean | WebMCPAdapterOptions
  /** audit-ledger cap (default 10,000 entries). The ledger records every
   * settled touch and surfaces are meant to be enabled once and left, so
   * it is a ring buffer; `changes()` reports `truncated: true` if a drain
   * spans dropped entries. */
  maxLog?: number
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
  quiet?: boolean
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
export const BOUND_TO_DOM = '⟵'
export const BOUND_TWO_WAY = '⟷'

/**
 * One wired element, flat: semantically visible facts (tag, label, text,
 * bound props, handlers) at the top; anything that can't be expressed flat
 * drops one level into `detail`.
 */
export interface AgentWiringRecord {
  tag: string
  id?: string
  part?: string
  role?: string
  /** harvested from aria-label(ledby) / title / alt — the accessible NAME */
  label?: string
  /** the placeholder hint, kept distinct from label: an empty input with a
   * placeholder must never read as an input with content */
  placeholder?: string
  /** input kind when it isn't plain text (checkbox, radio, range, …) */
  type?: string
  /** live checked state for checkboxes and radios — DOM truth at map time */
  checked?: boolean
  /** this control holds a secret (password / one-time code): its VALUE is
   * never emitted, only the fact that it exists and what it's bound to */
  secret?: boolean
  /** this element holds keyboard focus right now — where the user IS */
  focused?: boolean
  /** resolved aria-describedby text — the author's own explanation */
  description?: string
  /** present and true when the affordance is currently disabled */
  disabled?: boolean
  /** present and true when the field is required */
  required?: boolean
  /** present and true when the control's live ValidityState says invalid
   * (or aria-invalid is set) — the map reads what :invalid styles */
  invalid?: boolean
  /** a link's destination — "says X" is not "goes to Y". Links are
   * intrinsic affordances: enumerated even when nothing else wires them;
   * the renderer captions nameless links by their href and normally carries
   * href in the legend (URLs are the facts most often too long to draw)
   *
   * WITHHELD on a secret-marked element or one inside a `data-tosi-secret`
   * region (1.11.0): a reset/magic-link token lives here, not in a bound
   * path. Such a record carries `secret: true` and no `href` at all, so a
   * renderer's caption fallback has nothing to fall back to — filed upstream.
   */
  href?: string
  /** contenteditable: surfaces AS an input field. What matters to an agent
   * is that the region EXISTS and which path feeds it — it will read and
   * write the bound state directly, not synthesize keystrokes — so the
   * record leads with existence + bindings (live text as value,
   * aria-placeholder as hint), mapped even before bindings attach */
  contentEditable?: boolean
  /** textContent — static ("foo") or bound ("foo ⟵ path") */
  text?: string
  /** event handlers by type — a path string when nameable, 'ƒ' when anonymous */
  on?: Record<string, string | string[]>
  /** a list binding rendering a collection */
  list?: { path: string; idPath?: string }
  /** the component's own self-declaration, when its class carries a
   * `static componentMap` — the element doesn't just have affordances, it
   * DESCRIBES them */
  component?: ComponentMap
  /** inline contract declared where the element was built
   * (`input({ bindValue, contract })`) — JSON-Schema-shaped; also aggregated
   * into describe().contract under the element's bound path */
  contract?: Record<string, any>
  /** page-relative geometry — the layout IS part of the semantics; zero-size
   * means "not currently visible", which is itself information */
  bounds?: { x: number; y: number; width: number; height: number }
  /** the element rides the VIEWPORT (fixed/sticky ancestry): bounds are
   * viewport coordinates, not page coordinates — screen furniture has no
   * stable page position */
  viewportFixed?: boolean
  /** structure, not affordance: headings, landmarks, and the containers of
   * wired elements — the page's information architecture, mappable and
   * filterable */
  structural?: boolean
  /** computed colors, harvested when describe({ styles: true }) */
  style?: { background: string; borderColor: string; color: string }
  /** bindings that couldn't be named as a flat prop */
  detail?: Array<{ path: string; readable: boolean; writable: boolean }>
  /** named bound props (value, checked, disabled, …): "value ⟷ path" strings */
  [boundProp: string]: unknown
}

/** the interrogable identity of an agent surface (tosijs#23) */
export interface AgentSurfaceVersion {
  /** shape-contract version — bump when describe()'s shape changes */
  surface: string
  /** the tosijs version that produced this surface */
  tosijs: string
  /** enumerable feature names — test membership, don't infer from semver */
  capabilities: string[]
}

/**
 * The SHAPE contract version. Bump on any change a consumer reading
 * describe() could notice: renamed/removed record fields, changed
 * provenance tokens, changed nesting. Additive optional fields do NOT
 * require a bump (they can't break a reader) — but DO add a capability.
 */
export const AGENT_SURFACE_VERSION = '1.0.0'

/**
 * Capabilities of this build's surface. A consumer asks
 * `agent.version.capabilities.includes('bounds')` rather than inferring
 * from a version number — the whole point of tosijs#23.
 */
export const AGENT_CAPABILITIES = [
  'describe', // the affordance map
  'read',
  'write',
  'observe',
  'call',
  'changes', // turn-based drain with a cursor
  'when', // await a state condition
  'log', // the audit ledger
  'bounds', // per-record geometry
  'styles', // describe({ styles: true }) computed colors
  'scope', // describe({ scope: element }) hierarchy scoping
  'viewport', // describe({ view: 'viewport' }) camera mode
  'structure', // the structural tier (headings/landmarks/containers)
  'aria', // resolved accessible names, describedby, disabled/required
  'validity', // live ValidityState + required as record facts
  'contract', // declared contracts in describe().contract
  'components', // per-component self-declaration (ComponentMap)
  'webmcp', // generated WebMCP tool set (auto-registered where hosted)
] as const

export interface AgentDescription {
  /** the surface's identity — travels WITH the map, so a serialized
   * description is self-describing wherever it lands (tosijs#23) */
  version: AgentSurfaceVersion
  roots: Record<string, string>
  wiring: AgentWiringRecord[]
  actions: string[]
  /** 'closed' (the default since 1.9.0: nothing is exposed until you say so),
   * 'manifest' (the declared roots/actions), or 'all' (everything,
   * deliberately). Renamed from 'read-only'/'introspection' when the default
   * stopped exposing the whole registry — the old names described a posture
   * that no longer exists. */
  exposure: 'closed' | 'manifest' | 'all'
  /** whether `write()` can land at all. Orthogonal to `exposure`, because a
   * manifest scopes what may be SEEN: `expose: { roots }` is readable but
   * not writable until it says `write: true`. Read this rather than
   * inferring writability from the posture name. */
  writable: boolean
  /** what's LEGAL, per root — present when the manifest declares a contract */
  contract?: Record<string, any>
}

export interface AgentChange {
  path: string
  value: any
}

export interface AgentLogEntry {
  seq: number
  path: string
  /** synthetic audit notes (e.g. when() arming/resolution) — not state touches */
  note?: string
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
export type AgentRefusalKind =
  | 'scope'
  | 'mutability'
  | 'callable'
  | 'path'
  | 'revoked'

/** an Error carrying why the surface refused; `kind` survives message edits */
export interface AgentRefusalError extends Error {
  tosiRefusal: AgentRefusalKind
}

export const isAgentRefusal = (e: unknown): e is AgentRefusalError =>
  e instanceof Error && typeof (e as any).tosiRefusal === 'string'

const refuse = (kind: AgentRefusalKind, message: string): AgentRefusalError => {
  const error = new Error(message) as AgentRefusalError
  error.tosiRefusal = kind
  return error
}

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
export type AgentPathRef = string | BoxedScalar<any> | TosiProps<any>
// NOT `BoxedProxy<any>` — `any` distributes through its conditional and a
// union containing `any` IS `any`, so both these types silently became `any`
// and every verb stopped checking its argument. The identical mistake was made
// in `ElementPart` in the same release and caught by review; this is the
// second address. `TosiProps<any>` covers object and array proxies without the
// conditional.

/**
 * What `observe()` accepts: a path or proxy, or — under `expose: 'all'` only
 * — a pattern matching many paths, which the underlying observer has always
 * supported and which the map's own "redraw on any change" examples use.
 */
export type AgentObserveRef =
  | AgentPathRef
  | RegExp
  | ((path: string) => boolean)

/**
 * Resolve a path-or-proxy to a path, and REFUSE anything else.
 *
 * The refusal is the point. Passing a non-proxy object used to reach
 * `String(value)` — so `expose: { roots: [{}] }` declared a root literally
 * named `"[object Object]"`, matched nothing, and every subsequent read was
 * refused for being out of scope. The manifest was the broken thing and the
 * error pointed at the reader: exactly the failure mode where you debug the
 * wrong end for an hour. Fail where the mistake is.
 */
const toPath = (ref: AgentPathRef, where: string): string => {
  if (typeof ref === 'string') return ref
  const path = tosiPath(ref)
  if (typeof path === 'string' && path !== '') return path
  const got =
    ref === null
      ? 'null'
      : Array.isArray(ref)
      ? 'a raw array'
      : typeof ref === 'object'
      ? 'a plain object'
      : typeof ref
  throw refuse(
    'path',
    `agent interface: ${where} takes a path string ("app.cart") or a tosijs ` +
      `proxy that knows its own path (what tosi() handed you) — got ${got}, ` +
      `which carries none. A raw value read OUT of the state tree is not a ` +
      `proxy: pass \`app.cart\`, not \`app.cart.value\` or a spread copy.`
  )
}

export interface AgentInterface {
  /**
   * `scope` limits the wiring walk to one element's SUBTREE — hierarchy
   * scoping ("this part of the app"), stable regardless of how big the
   * subtree renders. Contrast schematicSVG's `within` rect, which is
   * REGIONAL ("this area of the page") and includes whatever overlaps it.
   */
  describe: (options?: {
    styles?: boolean
    scope?: Element
    /** include the structural tier (headings/landmarks/containers) —
     * default true; pass false for affordances only */
    structure?: boolean
    /** 'page' (default): every record, true unrolled-document coordinates —
     * the atlas. 'viewport': only what is VISIBLE right now, in screen
     * coordinates — the camera. Users see the viewport; pages are designed
     * to be legible in that frame, and so is its map. */
    view?: 'page' | 'viewport'
  }) => AgentDescription
  read: (path: AgentPathRef) => any
  write: (path: AgentPathRef, value: any) => void
  observe: (
    path: AgentObserveRef,
    callback: (path: string) => void
  ) => () => void
  call: (actionPath: AgentPathRef, ...args: any[]) => any
  changes: (since?: number) => {
    cursor: number
    changes: AgentChange[]
    /** present and true when the drain reached past entries the ring
     * buffer had already dropped — you did not see everything */
    truncated?: boolean
  }
  /**
   * Await a state CONDITION, not a change: resolves (with the satisfying
   * value) as soon as the value at `path` satisfies `predicate` — immediately
   * if it already does. The episodic agent's missing middle: name the world
   * you're waiting for and spend no inference until it arrives. The wait is
   * audit-logged. No built-in timeout — Promise.race one in if you need it.
   */
  when: (path: AgentPathRef, predicate: (value: any) => boolean) => Promise<any>
  log: () => AgentLogEntry[]
  disable: () => void
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
  version: AgentSurfaceVersion
  /** names of the WebMCP tools auto-registered at enable time — set only
   * when a model-context host was present (feature-detect by presence) */
  webmcp?: { tools: string[] }
}

// a path is "under" a root if it IS the root or extends it by a segment
// (the segment-boundary rule lives in path-listener as extendsPath — one
// helper, every site. A second implementation here would be a second thing
// to keep true, and this one guards what a production manifest may read
// and write.)

// values leave the surface as plain serializable data — proxies unwrapped,
// functions elided (they are actions, addressed by path, not data)
const serialize = (value: any): any => {
  const raw = tosiValue(value)
  if (raw === undefined || typeof raw === 'function') return undefined
  try {
    return JSON.parse(JSON.stringify(raw))
  } catch (_e) {
    return undefined
  }
}

// measure an element in TRUE DOCUMENT coordinates: accumulate every
// ancestor's scroll (apps commonly scroll an inner container, not the
// window; the walk reaches <html>, whose scrollTop IS the window scroll).
// Fixed/sticky elements ride the viewport: they keep viewport coordinates
// and are flagged, because screen furniture has no stable page position.
const measureBounds = (
  el: Element,
  viewportView = false
): {
  bounds: NonNullable<AgentWiringRecord['bounds']>
  fixed: boolean
} | null => {
  const rect = (el as HTMLElement).getBoundingClientRect?.()
  if (rect == null) return null
  if (viewportView) {
    // the camera: screen coordinates, and only what the screen shows
    const vw = (globalThis as any).innerWidth ?? 0
    const vh = (globalThis as any).innerHeight ?? 0
    const onScreen =
      rect.x < vw &&
      rect.y < vh &&
      rect.x + rect.width > 0 &&
      rect.y + rect.height > 0
    if (!onScreen) return null
    return {
      bounds: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
      fixed: false, // everything is viewport-anchored in this view
    }
  }
  let fixed = false
  if (typeof (globalThis as any).getComputedStyle === 'function') {
    let probe: Element | null = el
    for (let hop = 0; probe != null && hop < 12; hop++) {
      const position = (globalThis as any).getComputedStyle(probe).position
      if (position === 'fixed' || position === 'sticky') {
        fixed = true
        break
      }
      probe = probe.parentElement
    }
  }
  let scrollX = 0
  let scrollY = 0
  if (!fixed) {
    let ancestor: Element | null = el.parentElement
    while (ancestor != null) {
      scrollX += (ancestor as HTMLElement).scrollLeft ?? 0
      scrollY += (ancestor as HTMLElement).scrollTop ?? 0
      ancestor = ancestor.parentElement
    }
  }
  return {
    bounds: {
      x: Math.round(rect.x + scrollX),
      y: Math.round(rect.y + scrollY),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    },
    fixed,
  }
}

// the join: the element's own semantic self-description, harvested from
// attributes the developer wrote for humans and a11y
const referencedText = (
  el: Element,
  attr: string,
  withheld?: ContentGuard
): string | null => {
  const ids = el.getAttribute(attr)
  if (!ids) return null
  const text = ids
    .split(/\s+/)
    .map((id) => {
      const target = el.ownerDocument?.getElementById(id)
      if (target == null) return undefined
      /*
       * AN ID REFERENCE ESCAPES THE SUBTREE. (Re-review M-2.)
       *
       * `aria-labelledby` / `aria-describedby` point at ANY node in the
       * document, and this text became `record.label` / `record.description`
       * with no secrecy check ever applied to those two fields. Every other
       * guard here is a SUBTREE query (`el.querySelector(...)`), so a
       * referenced node outside the element's own subtree was invisible to
       * all of them — and a `<h2 aria-labelledby="x">` pointing at a
       * `<span id="x" data-tosi-secret>` published the secret as a label.
       * Worse, an element whose own record was correctly suppressed had its
       * value republished as a NEIGHBOUR's label.
       *
       * So check the node we are about to read, and the ancestors that could
       * have marked it — the same question `isSecretControl` asks, asked at
       * the place the text is actually taken from.
       */
      // secrecy (M-2) AND scope (round 3): the referenced node may be bound
      // to a path this surface refuses, and an id reference escapes the
      // subtree every other guard queries
      if (referencedNodeIsSecret(target)) return undefined
      if (withheld?.(target) === true) return undefined
      return target.textContent?.trim()
    })
    .filter(Boolean)
    .join(' ')
  return text || null
}

/**
 * SHADOW ROOTS ARE PART OF THE PAGE, AND SECRETS LIVE IN THEM.
 *
 * `querySelectorAll` and `closest` both stop at a shadow boundary, so every
 * secret scan in this module was light-DOM only — while the WRITE path
 * deliberately crosses the boundary (`bind.ts`'s `closestAcrossShadow`).
 * Typing into a `<input type="password">` inside a styled Component wrote to
 * state normally, and the redaction that was supposed to cover it never saw
 * the element: `read()`, `changes()` and `describe()` all returned the
 * password in cleartext, against a guarantee this module's own docs state
 * unconditionally.
 *
 * It is not an exotic case. It is the supported one — a Component with
 * `shadowStyleSpec`, bound from outside, exactly as `component.ts` advises.
 * And no test could have caught it: ~15 secret tests, zero `attachShadow`.
 *
 * Closed shadow roots are invisible here, and that is correct: nothing
 * outside can bind into one either, so there is no path for it to leak.
 */
const deepQueryAll = (
  root: Document | ShadowRoot | Element,
  selector: string
): Element[] => {
  const found: Element[] = Array.from(root.querySelectorAll(selector))
  // THE ROOT'S OWN SHADOW TREE, not only its descendants'. Omitting this arm
  // was a real leak: `<my-thing data-tosi-secret>` — the marker ON the host,
  // which is the most natural place to put it — has a subtree that looks
  // EMPTY from the light DOM, so nothing inside it was ever marked and
  // `read()` returned the value in cleartext. The first version of this
  // function checked only descendants, and the accompanying test put the
  // marker on a wrapper CONTAINING the host, so it passed.
  const ownShadow = (root as any).shadowRoot as ShadowRoot | null | undefined
  if (ownShadow != null) found.push(...deepQueryAll(ownShadow, selector))
  for (const el of Array.from(root.querySelectorAll('*'))) {
    const shadow = (el as any).shadowRoot as ShadowRoot | null | undefined
    if (shadow != null) found.push(...deepQueryAll(shadow, selector))
  }
  return found
}

/**
 * Does anything in this node's subtree — INCLUDING shadow trees, including
 * its own — match?
 *
 * ONE walker. This used to hand-code its own traversal, which is how the two
 * disagreed: it checked the node's own `shadowRoot` and `deepQueryAll` did
 * not. Two near-duplicate walkers written in the same commit, answering the
 * same question differently, and the security guarantee rode on the one that
 * was wrong.
 */
const deepHas = (node: Element, selector: string): boolean =>
  deepQueryAll(node, selector).length > 0

/**
 * `closest`, but stepping out through shadow hosts — the read-side twin of
 * bind.ts's `closestAcrossShadow`. A `[data-tosi-secret]` wrapper in the
 * light DOM must still cover content rendered inside a component's shadow.
 */
const closestAcrossRoots = (
  node: Element | null | undefined,
  selector: string
): Element | null => {
  if (node == null) return null
  const hit = node.closest?.(selector)
  if (hit != null) return hit
  const root = node.getRootNode?.() as ShadowRoot | Document | undefined
  const host = (root as ShadowRoot | undefined)?.host
  return host != null ? closestAcrossRoots(host, selector) : null
}

/** is this referenced node — or an ancestor of it — marked secret? */
const referencedNodeIsSecret = (target: Element): boolean => {
  try {
    if (isSecretControl(target)) return true
    if (deepHas(target, SECRET_CONTROL_SELECTOR)) return true
    return closestAcrossRoots(target, '[data-tosi-secret]') != null
  } catch {
    return true // cannot tell === must not publish
  }
}

// a form control's <label> — wrapping, or associated via for="id" — names
// it, exactly as the accessible-name algorithm says (the kitchen-sink
// lesson: real HTML names controls with <label>, not aria-label)
const associatedLabel = (
  el: Element,
  withheld?: ContentGuard
): string | undefined => {
  const tag = el.tagName
  if (tag !== 'INPUT' && tag !== 'SELECT' && tag !== 'TEXTAREA') {
    return undefined
  }
  let labelEl: Element | null = el.closest?.('label') ?? null
  if (labelEl == null && el.id) {
    // an id is author data, and it was interpolated RAW into a selector: one
    // element with a `"` or `]` in its id threw, and because describeElement
    // is called bare, the exception blinded the entire map — describe(), the
    // audit and the schematic all went dark at once (SEC-10)
    const escaped = (globalThis as any).CSS?.escape
      ? (globalThis as any).CSS.escape(el.id)
      : el.id.replace(/["\\\]]/g, '\\$&')
    try {
      labelEl =
        el.ownerDocument?.querySelector?.(`label[for="${escaped}"]`) ?? null
    } catch (_e) {
      labelEl = null // a shim without CSS.escape and an exotic id: no label
    }
  }
  if (labelEl == null) return undefined
  /*
   * A `<label>` ESCAPES THE SUBTREE, exactly as an aria-* id reference does —
   * `closest('label')` walks UP and `label[for=…]` searches the whole
   * document. This had no guard of any kind: not secrecy, not scope. It is the
   * most common naming idiom in real HTML (the comment above says so), so it
   * was the highest-traffic of the three name sources and the only completely
   * unguarded one. `harvestWouldLeak` could never have caught it — its DOM arm
   * is a SUBTREE query on an `<input>`, which has no children.
   */
  if (referencedNodeIsSecret(labelEl)) return undefined
  if (withheld?.(labelEl) === true) return undefined
  const text = labelEl.textContent?.trim().slice(0, 60)
  return text || undefined
}

/**
 * Paths bound to a secret-bearing control. SECRECY IS A PROPERTY OF THE
 * PATH, not of a DOM record: `describe()` redacting a password field while
 * `read('app.login.password')` returns the cleartext is not redaction, it
 * is a speed bump — and the map publishes the very path to ask for. Learned
 * the hard way in the 1.8.0 security pass.
 *
 * Consulted by read / changes / when. It only ever grows: a path that was
 * once bound to a password field stays secret for the session, because the
 * alternative is a window where it isn't. (Over-redaction is the safe
 * direction; under-redaction is a leak.)
 */
const secretPaths = new Set<string>()

/**
 * Every ancestor-or-self spelling of every path in `secretPaths`, so that
 * `containsSecret` is a lookup instead of a scan.
 *
 * `extendsPath(prefix, path)` is a segment-boundary prefix test, which makes
 * this an EXACT restatement, not an approximation:
 *   - `containsSecret(p)` — "∃ secret with p an ancestor-or-self of it" — is
 *     `secretAncestors.has(p)`;
 *   - `isSecretPath(p)` — "∃ secret that is an ancestor-or-self of p" — is
 *     an ancestor walk of `p` against `secretPaths`.
 * Both were linear scans of `secretPaths`, and every node of a read walks
 * them, so a page whose SECRET COUNT grows with its row count read
 * quadratically: 800 password-bound rows took 686ms, 4.1× per doubling.
 * (The ordinary shape — a few secrets, many rows — was and remains linear
 * and sub-millisecond; this bounds the pathological one.)
 *
 * Add ONLY via `addSecretPath`, never `secretPaths.add`: a missed update here
 * makes `containsSecret` under-report, and under-redaction is a leak. That is
 * why this is a derived index behind one choke point rather than a second set
 * maintained alongside the first.
 */
const secretAncestors = new Set<string>()

/** every prefix of `path` that ends on a segment boundary, plus `path` */
const pathAncestors = (path: string): string[] => {
  const out: string[] = []
  for (let i = 1; i < path.length; i++) {
    const c = path.charAt(i)
    if (c === '.' || c === '[') out.push(path.slice(0, i))
  }
  out.push(path)
  return out
}

/**
 * ancestor spelling -> the id-segment REMAINDERS of the secrets beneath it.
 *
 * `indexSpellingAliasesSecret` filters secrets by `extendsPath(arrayPath, …)`
 * and then compares only each one's remainder after its first id-segment —
 * a function of the secret alone, so it can be computed once at add time.
 * Storing remainders in a Set is what actually breaks the quadratic: 800 rows
 * bound to `rows[id=rN].pw` share the single remainder `.pw`.
 */
const secretRestsByAncestor = new Map<string, Set<string>>()

/** secrets whose remainder could not be computed; scanned the slow way */
const unindexedSecrets = new Set<string>()

const addSecretPath = (path: string): void => {
  if (secretPaths.has(path)) return
  secretPaths.add(path)
  const ancestors = pathAncestors(path)
  for (const ancestor of ancestors) secretAncestors.add(ancestor)
  let rest: string | null
  try {
    const split = splitAtElement(path, ID_SEGMENT)
    rest = split == null ? null : split[1]
  } catch {
    // cannot index it -> keep scanning it, rather than silently dropping it
    unindexedSecrets.add(path)
    return
  }
  // no id-segment: this secret can never alias an index spelling
  if (rest == null) return
  for (const ancestor of ancestors) {
    let rests = secretRestsByAncestor.get(ancestor)
    if (rests == null) {
      rests = new Set<string>()
      secretRestsByAncestor.set(ancestor, rests)
    }
    rests.add(rest)
  }
}

/*
 * FAIL CLOSED ON A SPELLING WE CANNOT RESOLVE.
 *
 * Matching is a string-prefix test, so `rows[id=r1].pw` has no prefix relation
 * to `rows[0].pw` even though they name the same value. That is not only an
 * agent constructing an odd query — tosijs's OWN id-path synthesis records
 * both spellings on an ordinary write, and `changes()` handed them over side
 * by side:
 *
 *   [{path:'rows[0].pw', value:'rotated'}, {path:'rows[id=r1].pw', value:'⟨secret⟩'}]
 *
 * The agent constructed nothing. A manifest does not contain it either — the
 * aliased path is INSIDE the declared root, and declaring the manifest is what
 * turns `read`/`changes` on in the first place.
 *
 * Full canonicalisation (resolve the index against live state, rewrite to the
 * id spelling) is the right fix and is tracked in tosijs#32. This is the
 * containment that can ship safely today: if a path indexes into an array that
 * has BOTH a registered idPath and some registered secret beneath it, then it
 * is an alias of a path we cannot cheaply resolve — so treat it as secret.
 *
 * Deliberately OVER-redacts (a non-secret sibling read by index is withheld
 * too). That is the correct direction for a redaction predicate, and it is
 * bounded to arrays that are both id-path-registered and actually carry a
 * secret. Anything that throws in here must also mean "secret".
 */
// NOTE the required trailing separator: this must match `rows[0].pw` (a path
// that could ALIAS a secret leaf) and NOT bare `rows[0]` (a row, which is an
// ANCESTOR of the secret and belongs to redactWithin's descent). Without it
// the rule blanket-redacted whole rows and `read('rows')` returned
// ['⟨secret⟩'] instead of the row with one field withheld — destroying the
// map's usefulness to buy nothing, since the descent already covers it.
const INDEX_SEGMENT = /^(.*?)(?:\[(\d+)\]|\.(\d+))(?:([.[].*)|$)/
const ID_SEGMENT = /^(.*?)\[[^\]=]+=[^\]]*\](?:([.[].*)|$)/

/**
 * Split a path at its first array-element segment: `[a, rest]`.
 * `rows[0].pw` and `rows[id=r1].pw` both split to `['rows', '.pw']`, which is
 * what lets one be recognised as an alias of the other.
 */
const splitAtElement = (
  path: string,
  pattern: RegExp
): [string, string] | undefined => {
  const m = pattern.exec(path)
  if (m == null || m[1] === '') return undefined
  return [m[1], m[m.length - 1] ?? '']
}

const indexSpellingAliasesSecret = (
  path: string,
  wantLeaf: boolean
): boolean => {
  try {
    const split = splitAtElement(path, INDEX_SEGMENT)
    if (split == null) return false
    const [arrayPath, rest] = split
    // only arrays whose rows are ALSO named by an idPath can be aliased
    const idPaths = getArrayIdPaths(arrayPath)
    if (idPaths == null || idPaths.size === 0) return false
    // COMPARE THE REMAINDER, not just the array. `rows[0].pw` aliases
    // `rows[id=r1].pw`; `rows[0].label` aliases nothing and must still be
    // described — blanket-redacting the array withheld ordinary fields and
    // made the map useless to buy nothing.
    const rests = secretRestsByAncestor.get(arrayPath)
    if (rests != null) {
      for (const secretRest of rests) {
        if (wantLeaf ? rest === secretRest : secretRest.startsWith(rest)) {
          return true
        }
      }
    }
    // anything the index could not absorb still gets the original scan
    for (const secret of unindexedSecrets) {
      if (!extendsPath(arrayPath, secret)) continue
      const secretSplit = splitAtElement(secret, ID_SEGMENT)
      if (secretSplit == null) continue
      const secretRest = secretSplit[1]
      if (wantLeaf ? rest === secretRest : secretRest.startsWith(rest)) {
        return true
      }
    }
    return false
  } catch {
    return true // an error here means "possibly secret", never "not secret"
  }
}

/** is this path, or an ancestor of it, bound to a secret-bearing control? */
const isSecretPath = (path: string): boolean => {
  // THE OVERWHELMINGLY COMMON PAGE HAS NO SECRETS AT ALL. Every index here
  // is populated only from `addSecretPath`, so an empty `secretPaths` means
  // all of them are empty — and without this both predicates allocated an
  // ancestor array and ran regexes on every path of every read.
  if (secretPaths.size === 0) return false
  // an ancestor walk, not a scan of secretPaths — see `secretAncestors`
  for (const ancestor of pathAncestors(path)) {
    if (secretPaths.has(ancestor)) return true
  }
  if (indexSpellingAliasesSecret(path, true)) return true
  // ⚠️ NARROWED, NOT CLOSED — tosijs#32, and TODO.md "Agent surface —
  // secret-path matching is spelling-sensitive". Matching is by SPELLING and
  // the rule above is a conservative containment, not canonicalisation. An
  // earlier version of this comment claimed ancestor descent was fully
  // covered; that was FALSE, and it was load-bearing — it was the stated
  // reason the remaining gap was accepted. A secret learned as
  // `list[id=a1].pw` is not matched by a DIRECT read spelled `list[0].pw`.
  // Descending from an ancestor IS covered — redactWithin tries every
  // spelling — so `read('list')` is safe; it is the direct index-spelled
  // query that is not. Fixing it needs canonicalisation of the QUERY, which
  // must fail closed: an error in the canonicaliser has to mean "possibly
  // secret", never "not secret".
  return false
}

/** would this read expose a secret nested anywhere beneath it? */
const containsSecret = (path: string): boolean => {
  if (secretPaths.size === 0) return false // see isSecretPath
  if (secretAncestors.has(path)) return true
  // an index-spelled ANCESTOR — `rows[0]` — has no prefix relation to a secret
  // learned as `rows[id=r1].pw`, so without this the read returned the whole
  // row in cleartext. Saying "contains" (rather than "is") keeps the descent,
  // so only the secret field is withheld.
  return indexSpellingAliasesSecret(path, false)
}

const SECRET_SENTINEL = '⟨secret⟩'

/**
 * Learn which state paths are bound to secret-bearing controls, BEFORE
 * anything reads or publishes them.
 *
 * Harvesting this during the describe walk alone left two windows open:
 * `read('login.password')` called without a prior `describe()` was never
 * redacted at all (a WebMCP host can call `tosi_read` first), and within a
 * single walk an element bound to the same path that happened to be visited
 * *before* the password field had already put the value in its record. So
 * the scan runs up front — at `enableAgentInterface()`, at the top of every
 * describe, and before every read/when.
 *
 * It is cheap by construction: the selector matches only the handful of
 * controls that can be secret, not every bound element on the page.
 */
/**
 * ONE token list, two consumers. The selector and the predicate below were
 * written separately and drifted: the predicate accepted input/textarea/select
 * but the selector carried autocomplete arms for `input` only, so a bound
 * `<textarea autocomplete="cc-number">` (or the standard
 * `<select autocomplete="cc-exp-month">`) returned CLEARTEXT from read()
 * before any describe() and `⟨secret⟩` after — turn-to-turn inconsistent, in
 * exactly the tosi_read-called-first window the up-front scan exists to close.
 */
const SECRET_TAGS = ['input', 'textarea', 'select']
const SECRET_AUTOCOMPLETE_PREFIXES = [
  'cc-',
  'current-password',
  'new-password',
  'one-time-code',
]
const SECRET_INPUT_TYPES = ['password', 'hidden']

const SECRET_CONTROL_SELECTOR = [
  '[data-tosi-secret]',
  ...SECRET_INPUT_TYPES.map((type) => `input[type="${type}"]`),
  ...SECRET_TAGS.flatMap((tag) =>
    SECRET_AUTOCOMPLETE_PREFIXES.map(
      (prefix) => `${tag}[autocomplete^="${prefix}"]`
    )
  ),
].join(',')

/**
 * NO CACHE HERE. THIS SCAN RUNS EVERY TIME, ON PURPOSE.
 *
 * A binding-generation cache was added, measured at ~24% per read, and
 * REVERTED — it was a security regression, and the way it failed is the
 * argument for never trying again without a very different invalidation story.
 *
 * The generation was bumped from three call sites, two of which sat inside
 * `if (dataBindings == null)` — so only an element's FIRST binding bumped.
 * That produced five reachable leaks, each returning cleartext from `read()`
 * where rc.1 returned the sentinel:
 *
 *   1. `type` flipped to `password` after a read (a show/hide toggle)
 *   2. `data-tosi-secret` added later — the author's EXPLICIT opt-in
 *   3. `autocomplete="cc-…"` set when a payment method is chosen
 *   4. a second `bind()` on an already-mounted element — PERMANENT, since no
 *      DOM mutation follows to rescue it
 *   5. same-task append after a detached bind, and `cloneWithBindings()`
 *
 * Three of those are ATTRIBUTE changes on an element that never re-binds, so
 * no binding-shaped signal can see them at all; correctness would need a
 * MutationObserver on `type`/`autocomplete`/`data-tosi-secret` plus bumps at
 * every binding mutation — at which point the 24% is gone anyway.
 *
 * The selector is deliberately narrow (only controls that CAN be secret), so
 * the uncached scan matches almost nothing.
 *
 * ⚠️ **It is not free, and an earlier version of this comment said it was.**
 * That text claimed "1.3µs a read … not a trade worth revisiting" — a
 * happy-dom figure, and happy-dom memoises `querySelectorAll`. Real engines do
 * not: measured in Chromium, this scan costs **~350µs at 2k elements and
 * 1–2ms at 7k**, with or without an intervening mutation. 200 `tosi_read`
 * calls in one WebMCP turn is 200 of those.
 *
 * The revert still stands — a redaction guarantee is worth real milliseconds,
 * and the invalidation this replaced could not be made correct (see above).
 * But the SHAPE is the open question, not the trade: 15 selector arms, 12 of
 * them `[autocomplete^=…]` prefix matches no engine can bucket. A cheaper scan
 * that is still correct — narrowing to bound elements, or checking secrecy at
 * the point a path is read rather than sweeping the document — would be a real
 * improvement. Tracked in TODO.md.
 *
 * Two lessons in one comment: do not benchmark a DOM operation in happy-dom,
 * and do not write a number into a comment phrased to close future argument.
 */
const refreshSecretPaths = (): void => {
  if (typeof document === 'undefined') return
  let candidates: Element[]
  try {
    // Array.from, not for-of: the lib target types NodeListOf without
    // Symbol.iterator, and happy-dom's list is not iterable either
    // deep: shadow roots are part of the page (see deepQueryAll)
    candidates = deepQueryAll(document, SECRET_CONTROL_SELECTOR)
  } catch (_e) {
    return // a DOM shim without full selector support: nothing to learn
  }
  for (const el of candidates) {
    if (!isSecretControl(el)) continue
    // A REGION MARKER COVERS ITS SUBTREE, NOT JUST ITSELF.
    //
    // `[data-tosi-secret]` is the first arm of SECRET_CONTROL_SELECTOR and is
    // plainly meant as a WRAPPER — `contentWithheld` asks
    // `closest('[data-tosi-secret]')`, i.e. "am I inside a secret region".
    // But this loop only ever read bindings off the MATCHED element, and a
    // wrapper carries none: its children do. So marking a region withheld its
    // rendered CONTENT while `read()` of the very path bound inside it still
    // returned cleartext — the attribute did half of what its name promises,
    // in both light and shadow DOM. Collect the subtree's bindings too.
    //
    // For a bare `input[type="password"]` there is no subtree, so this costs
    // nothing and changes nothing.
    // BREADTH ONLY WHERE THE AUTHOR ASKED FOR IT. `[data-tosi-secret]` is a
    // region marker, so everything bound beneath it is the stated intent. A
    // bare `input[type="password"]` is one control, and has no subtree.
    const explicitRegion = el.hasAttribute?.('data-tosi-secret') === true
    const bound: Element[] = explicitRegion
      ? [el, ...deepQueryAll(el, '*')]
      : [el]
    for (const boundNode of bound) {
      const { dataBindings } = getElementBindings(boundNode)
      if (dataBindings == null) continue
      for (const b of dataBindings) addSecretPath(b.path)
    }

    // AND ONE STEP UP, ACROSS THE SHADOW BOUNDARY ONLY. A component that
    // RENDERS a secret control carries the binding on its host —
    // `bind(pwField, path, bindings.value)`, the supported pattern — while
    // the control sits in the shadow tree with no binding of its own.
    // Walking down finds the control and learns nothing; the path lives one
    // step up, across the boundary.
    //
    // ONE step, and only VALUE-CARRYING bindings. The first version of this
    // walked every host to the top of the page and harvested every binding on
    // each — which is precisely the hazard the paragraph above it warned
    // against, committed three lines later. A bound app shell containing one
    // password field anywhere below marked its whole root secret, so the
    // entire surface answered `⟨secret⟩`; `input[type="hidden"]` is in the
    // selector, so a component with an internal hidden input did it with no
    // secret involved; and because secret paths are append-only for the
    // session (deliberately — see the docs), it never came back. Fail-closed,
    // so never a leak — a silent, permanent availability break of the surface
    // this release exists to harden.
    //
    // `fromDOM != null` is the narrowing: a typed secret can only land in
    // state through a binding that reads the DOM. A `toDOM`-only text /
    // enabled / class / list binding on the host cannot be where it goes.
    const root = el.getRootNode?.() as ShadowRoot | Document | undefined
    const host = (root as ShadowRoot | undefined)?.host
    if (host != null) {
      const { dataBindings } = getElementBindings(host)
      for (const b of dataBindings ?? []) {
        if (b.binding?.fromDOM != null) addSecretPath(b.path)
      }
    }

    /*
     * AND THE LIGHT-DOM TWIN (tosijs#41).
     *
     * The arm above walks up only across a SHADOW boundary. Light DOM has no
     * `.host`, so a wrapper carrying the binding over a contained password
     * field — a plain `<form>`, or any container with a custom `fromDOM`
     * binding — was never harvested and the path was never learned. Because
     * the miss is in PATH LEARNING, it defeated `read()` and `changes()` too,
     * with no `describe()` involved. Present in every released version;
     * verified back to v1.10.1.
     *
     * EXACTLY ONE STEP — the immediate parent — because that is what the
     * shadow arm does, and the shadow arm is the one that has survived review.
     *
     * My first cut walked up to the "nearest ancestor carrying any data
     * binding", which sounds bounded and is not: it bounds by BINDEDNESS, not
     * by DISTANCE, so an app shell with unbound elements between it and the
     * password is still "nearest". A control fixture caught it —
     * `div(bindValue) > div > div > input[type=password]` marked the shell's
     * path `⟨secret⟩` permanently, which is precisely the availability break
     * the paragraph above records, reached by a different route.
     *
     * `fromDOM != null` is the same narrowing as the shadow arm, and it is
     * what keeps the round-4 over-redaction fixed: that container carries a
     * `data-theme` binding, toDOM-only, so it is not marked.
     *
     * ⚠️ THIS COVERS THE ONE-LEVEL WRAPPER ONLY. `<form bindValue> <div> <input
     * type=password>` — the binding two or more levels up — is still not
     * learned, and tosijs#41 stays open for it. A partial fix that cannot
     * poison state is worth more than a complete one that can; the remaining
     * shape needs a discriminator better than "how many levels up", which is
     * a design question, not a patch.
     */
    /*
     * AND NOT ON `type="hidden"` ALONE. Propagating secrecy UP is a stronger
     * claim than classifying the element itself, so it needs stronger
     * evidence. `input[type="hidden"]` is in SECRET_CONTROL_SELECTOR because a
     * CSRF token lives there — but hidden inputs just as often carry ids,
     * flags and redirect URLs, and this file already records what happened
     * when one of them propagated: "a component with an internal hidden input
     * did it with no secret involved", permanently, because secret paths are
     * append-only. A control fixture caught the same thing here (`div(bindValue)
     * > input[type=hidden]` marked the div's path ⟨secret⟩ where it had been
     * readable).
     *
     * So this arm propagates for a password, a `cc-*`-style autocomplete, or
     * an EXPLICIT `data-tosi-secret` — where the author or the input kind says
     * so unambiguously — and not for a bare hidden input. The element itself
     * is classified exactly as before; only the upward claim is narrowed.
     *
     * Deliberately stricter than the shadow arm above, which does propagate on
     * `hidden`. New code gets the conservative default; widening later is one
     * line, and un-poisoning an append-only set is not.
     */
    const kind = ((el as any).type ?? '') as string
    const propagates =
      el.hasAttribute?.('data-tosi-secret') === true || kind !== 'hidden'
    const parent = propagates ? el.parentElement : null
    if (parent != null) {
      const { dataBindings } = getElementBindings(parent)
      for (const b of dataBindings ?? []) {
        if (b.binding?.fromDOM != null) addSecretPath(b.path)
      }
    }
  }
}

/**
 * Replace secret-bound leaves inside a serialized value.
 *
 * Takes a LIST of paths, not one, because a single node can be named several
 * ways (`rows[0]` / `rows.0` / `rows[id=r1]`) and secrecy must hold under all
 * of them. Descending once per spelling instead — the first version of the
 * multi-spelling fix — re-cloned and re-walked the whole subtree 3× per row
 * and made `read()` over a secret-bearing list quadratic (measured 4.3× per
 * doubling, 647ms at 800 rows). Carrying the spellings together collapses
 * that back to one walk while covering strictly more ground than the `find`
 * it replaced.
 */
const redactWithin = (paths: string[], value: any): any => {
  if (value == null || typeof value !== 'object') return value
  const clone: any = Array.isArray(value) ? [...value] : { ...value }
  const isArray = Array.isArray(value)
  const idPaths = isArray
    ? paths.reduce<Set<string> | undefined>((acc, p) => {
        const found = getArrayIdPaths(p)
        if (found == null) return acc
        const set = acc ?? new Set<string>()
        for (const idPath of found) set.add(idPath)
        return set
      }, undefined)
    : undefined
  for (const key of Object.keys(clone)) {
    /*
     * EVERY SPELLING THAT CAN NAME THIS CHILD — because secrecy must not
     * depend on which one the binding happened to use (review B2).
     *
     * A first attempt descended by id-path only, which fixed lists that
     * register one and left two holes wide open:
     *   - a list with NO idPath is a documented, supported configuration, and
     *     `ListBinding` names its rows `rows[0]`; the walk built `rows.0`, so
     *     nothing matched and `read('rows')` returned every secret in
     *     cleartext — the exact bug the fix was written to close;
     *   - two bindings registering DIFFERENT idPaths for one array meant
     *     `[...idPaths][0]` picked one and secrets under the other leaked.
     *
     * So: collect the candidates, redact if ANY is secret, and recurse under
     * whichever one actually contains a secret.
     */
    const candidates: string[] = []
    for (const path of paths) {
      if (!isArray) {
        candidates.push(`${path}.${key}`)
        continue
      }
      candidates.push(`${path}[${key}]`, `${path}.${key}`)
      if (idPaths != null) {
        for (const idPath of idPaths) {
          // `clone[key] == null` guard: getByPath tolerates undefined but
          // THROWS on null, so a single null row (a cleared entry, a hole in
          // a server payload) took read/describe/changes down for the page —
          // and changes() threw inside its coalescing loop, killing every
          // subsequent poll. Introduced by the first version of this fix.
          const idValue =
            clone[key] == null ? undefined : getByPath(clone[key], idPath)
          if (idValue !== undefined && idValue !== null) {
            candidates.push(`${path}[${idPath}=${String(idValue)}]`)
          }
        }
      }
    }
    if (candidates.some((candidate) => isSecretPath(candidate))) {
      clone[key] = SECRET_SENTINEL
      continue
    }
    // DESCEND UNDER *EVERY* SPELLING THAT CONTAINS A SECRET, not the first.
    // The leaf test above is `some` — OR across spellings — and this once used
    // `find`, so with two idPaths registered on one array the recursion ran
    // under one spelling and the secret registered under the other came back
    // in cleartext, through `read()` AND through `describe()` in the
    // read-only default posture. Both leaves redacted individually, which is
    // exactly what made it invisible: every test used a single spelling per
    // array, so the suite was structurally incapable of catching it.
    //
    // ONE recursion carrying all matching spellings — a loop of recursions
    // (the first version) covered the same ground quadratically.
    const deeper = candidates.filter((candidate) => containsSecret(candidate))
    if (deeper.length > 0) clone[key] = redactWithin(deeper, clone[key])
  }
  return clone
}

/**
 * Does this control hold something that must never travel? A DENYLIST is
 * defence in depth, not the control — the control is manifest scoping, and
 * `data-tosi-secret` is the author's explicit opt-in. Applies to
 * input/textarea/select, not just `<input type=password>`: hidden CSRF
 * tokens and `autocomplete="cc-*"` payment fields are the common cases.
 */
const isSecretControl = (el: Element, type?: string): boolean => {
  if (el.hasAttribute?.('data-tosi-secret')) return true
  const tag = el.tagName.toLowerCase()
  if (!SECRET_TAGS.includes(tag)) return false
  const kind = type ?? (el as any).type ?? ''
  if (SECRET_INPUT_TYPES.includes(kind)) return true
  const autocomplete = el.getAttribute('autocomplete') ?? ''
  // the SAME token list the selector is built from — this pair drifting is
  // what let a bound <textarea autocomplete="cc-number"> leak
  return SECRET_AUTOCOMPLETE_PREFIXES.some((prefix) =>
    autocomplete.startsWith(prefix)
  )
}

/**
 * Would harvesting this element's LIVE DOM TEXT expose a secret?
 *
 * `describe()` has three live-DOM harvests. The unbound-form-control one gates
 * on `record.secret`; the static-text and contenteditable ones gated on
 * NOTHING, so `describe()` published in cleartext exactly what `read()`
 * refuses — the invariant this release exists to restore, leaking at a third
 * address after `boundValue` and `redactWithin` were fixed.
 *
 * Three signals, because no one of them covers the observed shapes:
 *   - the element IS a secret control (`record.secret`) — a secret <select>
 *     redacted its `value` and printed the card numbers in `text` beside it;
 *   - the element is BOUND to a secret path, without being a secret control
 *     itself — a plain <div> with a custom toDOM rendering a token has no
 *     `secret` flag at all;
 *   - the element CONTAINS a secret control or an author-marked region — a
 *     wired ancestor otherwise launders its descendant's text, including the
 *     author's own `data-tosi-secret` opt-in.
 */
/**
 * The data-binding paths an element carries, or `[]`.
 *
 * Extracted so the STRUCTURAL tier can ask the same question `recordFor` asks
 * — it re-visits elements `recordFor` deliberately rejected, and had no way to
 * see what they were bound to.
 */
const bindingPathsOf = (el: Element): string[] => {
  try {
    const { dataBindings } = getElementBindings(el)
    if (dataBindings == null) return []
    return dataBindings.map((b: any) => b.path).filter((p: any) => p != null)
  } catch {
    return [] // callers pair this with a fail-closed secrecy check
  }
}

/**
 * `harvestWouldLeak`, but it also MARKS the record when it suppresses.
 *
 * The CHANGELOG promised suppressed harvests keep `secret: true` "so
 * suppression does not read as absence", and that held for the two shapes
 * whose secrecy comes from the element itself — `describeElement` sets the
 * flag from the element's own kind. It did NOT hold for the third: an element
 * merely BOUND to a secret path is not a secret control, so its text was
 * (correctly) withheld and the record said nothing about why. An agent cannot
 * tell "this div has no text" from "this div's text was withheld".
 */
const suppressHarvest = (
  el: Element,
  record: AgentWiringRecord,
  boundPaths: string[]
): boolean => {
  if (!harvestWouldLeak(el, record, boundPaths)) return false
  record.secret = true
  /*
   * LIVE STATE GOES WITH THE HARVEST, and it is stripped HERE rather than
   * gated at the site that wrote it — the ninth per-site restatement is what
   * three consecutive reviews have found a hole in.
   *
   * `describeElement` computes `checked` before bindings are known, so it can
   * only ask ELEMENT-local secrecy. Every sibling channel asks the PATH:
   * `boundValue` checks `isSecretPath`, `harvestWouldLeak` checks
   * `containsSecret`, `read()` returns the sentinel. So two checkboxes bound
   * to one secret path published opposite answers — the marked one withheld,
   * the unmarked MIRROR emitting `checked: true` next to its own
   * `secret: true`, disclosing exactly the value `read()` refuses.
   *
   * This function is the one place that already knows path-derived secrecy at
   * record level, so a live-state field added later inherits the guard by
   * construction instead of needing a tenth gate.
   */
  delete record.checked
  return true
}

/**
 * Binding paths on this element AND everything under it.
 *
 * `outOfScopeBinding` was element-local, and `harvestWouldLeak`'s DOM arm
 * matches secret *controls* and `data-tosi-secret` marks — never a plain
 * `<span>` merely BOUND to a refused path. So a wrapper made `wired` by one
 * in-scope binding published a child's out-of-scope value in its own text,
 * while the child's own record was correctly suppressed: the same response
 * contradicted itself.
 */
const subtreeBindingPaths = (el: Element): string[] => {
  const paths = bindingPathsOf(el)
  const bound = el.getElementsByClassName?.(BOUND_CLASS)
  if (bound != null) {
    for (const child of Array.from(bound)) paths.push(...bindingPathsOf(child))
  }
  return paths
}

const harvestWouldLeak = (
  el: Element,
  record: AgentWiringRecord,
  boundPaths: string[]
): boolean => {
  if (record.secret === true) return true
  for (const path of boundPaths) {
    if (isSecretPath(path) || containsSecret(path)) return true
  }
  try {
    // ONE query. A second `querySelector('[data-tosi-secret]')` used to
    // follow this line and could never fire: that selector is the FIRST arm
    // of SECRET_CONTROL_SELECTOR, so reaching it means it already didn't
    // match. Deleted — zero behaviour change, one less subtree scan per
    // described element.
    if (deepHas(el, SECRET_CONTROL_SELECTOR)) return true
  } catch {
    return true // cannot tell === must not publish
  }
  return false
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
export type ContentGuard = (node: Element) => boolean

const describeElement = (
  el: Element,
  withheld?: ContentGuard
): AgentWiringRecord => {
  const record: AgentWiringRecord = {
    tag: el.tagName.toLowerCase(),
  }
  if (el.id) record.id = el.id
  const part = el.getAttribute('part')
  if (part) record.part = part
  const role = el.getAttribute('role')
  if (role) record.role = role
  /*
   * SECRECY IS DECIDED ONCE, BEFORE ANY CONTENT-BEARING ATTRIBUTE IS READ.
   *
   * `withheld` was threaded into this function and then asked only by
   * `referencedText()` and `associatedLabel()`, so the attribute harvest below
   * ran unguarded: a token in an `href` was published in cleartext beside a
   * `text` that had been correctly withheld ON THE SAME RECORD — a response
   * that contradicts itself. Reachable through `tosi_describe`, which
   * `webmcp.ts` registers unconditionally while gating `tosi_read`, so the
   * value the read gate withholds was handed to a model-context host anyway.
   * That is the SEVENTH address of the invariant ContentGuard exists to close.
   *
   * Deliberately NOT `withheld` (a.k.a. `contentWithheld`): that guard answers
   * secrecy AND SCOPE, and an out-of-scope link's destination is ordinary map
   * data. Routing `href` through it would strip the destination from every
   * link outside the exposed roots — the over-redaction failure of 1.10.0,
   * where one password field marked a whole state root secret. This asks the
   * SECRECY arm only.
   */
  /*
   * ELEMENT-OR-ANCESTOR, DELIBERATELY NOT `referencedNodeIsSecret`.
   *
   * That helper's middle arm is `deepHas(el, SECRET_CONTROL_SELECTOR)` —
   * "contains a secret control anywhere BELOW" — which is right for deciding
   * whether harvesting a referenced node's TEXT would expose a secret, and
   * catastrophically wrong here, because `record.secret` is read downstream as
   * an IDENTITY signal: `recordFor` does `if (record.secret === true)
   * addSecretPath(b.path)`, and `secretPaths` is module-level and append-only
   * for the session.
   *
   * So an ordinary bound container that merely CONTAINED a password field —
   * a login form — permanently marked its own bound path `⟨secret⟩` for every
   * later `read()`, surviving removal of the password field, `disable()`, and
   * a fresh `enableAgentInterface()`. Measured: `read('pe.theme')` was `dark`
   * before one `describe()` and `⟨secret⟩` after, forever.
   *
   * That is the 1.10.0 over-redaction — one password field marking a whole
   * state root secret — reintroduced by the commit whose comment said it was
   * avoiding it. It avoided it on the SCOPE arm and walked into it on the
   * containment arm. Containment must never imply "the paths bound HERE are
   * secret".
   *
   * Ancestor marking DOES belong: `<div data-tosi-secret>` is the author
   * declaring the region secret, which is a statement about what is bound
   * inside it. Containment is not a statement about anything.
   */
  const secretHere =
    isSecretControl(el) || closestAcrossRoots(el, '[data-tosi-secret]') != null
  // and say so, always. In the region case (`data-tosi-secret` on an
  // ANCESTOR) nothing was previously marked, so suppression read as absence
  // and a consumer could not tell anything had been withheld.
  if (secretHere) record.secret = true
  // the accessible-name algorithm, abridged: what a screen reader would say.
  // placeholder is deliberately NOT folded in — it's a hint, not a name, and
  // conflating them makes an empty input read like it has content
  //
  // A NAME SURVIVES SECRECY, CONTENT DOES NOT. `aria-label` is authored to be
  // announced, and dropping it would make every secret control anonymous —
  // which the audit would then flag, trading a leak for a false a11y defect.
  // `title`/`alt` are free-text fallbacks far likelier to carry incidental
  // content, so they are withheld here; the referenced/associated sources
  // already ask `withheld` themselves.
  const label =
    el.getAttribute('aria-label') ||
    referencedText(el, 'aria-labelledby', withheld) ||
    associatedLabel(el, withheld) ||
    (secretHere ? null : el.getAttribute('title') || el.getAttribute('alt'))
  if (label) record.label = label
  const placeholder =
    el.getAttribute('placeholder') || el.getAttribute('aria-placeholder')
  if (placeholder && !secretHere) record.placeholder = placeholder
  // a link IS an affordance — its destination is a fact of the map, EXCEPT
  // where the destination is the secret (a reset/magic-link token)
  const href = el.getAttribute?.('href')
  if (href && !secretHere) record.href = href
  // contenteditable IS an input field — an affordance in itself, whatever
  // custom bindings ride it (and they usually do)
  const editableAttr = el.getAttribute?.('contenteditable')
  if (
    (el as any).isContentEditable === true ||
    editableAttr === '' ||
    editableAttr === 'true' ||
    editableAttr === 'plaintext-only'
  ) {
    record.contentEditable = true
  }
  // where the user IS: keyboard focus is part of the scene
  if ((globalThis as any).document?.activeElement === el) {
    record.focused = true
  }
  // secrecy is not an <input> concern: a textarea or an author-marked
  // control can hold one too
  if (record.tag !== 'input' && isSecretControl(el)) record.secret = true
  // form controls: the control's kind and LIVE state are facts of the map
  if (record.tag === 'input') {
    const type = (el as any).type || 'text'
    if (type !== 'text') record.type = type
    // SECRETS ARE NEVER VALUES. A password field's content is exactly what
    // must not travel to an agent, a log, a WebMCP host or a screenshot of
    // the map. The affordance is still described — kind, name, bound path,
    // geometry — just never its content.
    if (isSecretControl(el, type)) record.secret = true
    // LIVE STATE IS CONTENT. Whether a secret-marked toggle is on is exactly
    // the fact its marking withholds.
    if ((type === 'checkbox' || type === 'radio') && !secretHere) {
      record.checked = (el as any).checked === true
    }
  }
  /*
   * A DESCRIPTION IS CONTENT, NOT A NAME — this file says so itself, at the
   * `aria-description` note near the top: "a description is NOT a name". The
   * B1 fix enumerated `title`/`alt`, `placeholder`, `href` and `checked` and
   * missed this, the FIFTH free-text attribute in the same harvest, eight
   * lines below the fix.
   *
   * Both arms are gated, not just the raw one. `referencedText()` asks
   * `referencedNodeIsSecret` about the TARGET only, never about `el` — so a
   * `data-tosi-secret` control whose `aria-describedby` points at an unmarked
   * node published cleartext too. Gating the whole expression closes the
   * channel rather than one spelling of it, which is the lesson B1 was
   * supposed to have taught: a guard is only as good as its enumeration.
   */
  const description = secretHere
    ? null
    : referencedText(el, 'aria-describedby', withheld) ||
      el.getAttribute('aria-description')
  if (description) record.description = description
  if (
    (el as any).disabled === true ||
    el.getAttribute('aria-disabled') === 'true'
  ) {
    record.disabled = true
  }
  if (
    (el as any).required === true ||
    el.getAttribute('aria-required') === 'true'
  ) {
    record.required = true
  }
  // live validity — the same truth :invalid styling and screen readers get:
  // the platform's ValidityState (native controls AND form-associated
  // components via ElementInternals) or an explicit aria-invalid
  if (
    el.getAttribute('aria-invalid') === 'true' ||
    ((el as any).willValidate === true && (el as any).validity?.valid === false)
  ) {
    record.invalid = true
  }
  return record
}

// resolve the inline contract governing a path, if any element declares one:
// scanned from the live bound elements at write time — deliberately NOT a
// path→element index (virtual lists thrash those; the DOM is the registry)
const inlineSchemaFor = (path: string): Record<string, any> | undefined => {
  // the common case, answered without touching the DOM: no element on this
  // page has ever declared an inline contract, so there is nothing to find
  if (!anyInlineContracts()) return undefined
  const doc = (globalThis as any).document
  if (doc?.getElementsByClassName == null) return undefined
  for (const el of Array.from(
    doc.getElementsByClassName(BOUND_CLASS)
  ) as Element[]) {
    const schema = elementContract(el)
    if (schema == null) continue
    const { dataBindings } = getElementBindings(el)
    if (dataBindings?.some((b: any) => b.path === path)) {
      return schema
    }
  }
  return undefined
}

// aria-hidden means invisible to assistive tech — and the agent reads the
// page the way assistive tech does. Hidden is hidden.
const ariaHidden = (el: Element): boolean => {
  let probe: Element | null = el
  for (let hop = 0; probe != null && hop < 12; hop++) {
    if (probe.getAttribute?.('aria-hidden') === 'true') return true
    probe = probe.parentElement
  }
  return false
}

// "value ⟷ path" — current value plus provenance in one parseable string
/**
 * Neutralize provenance tokens inside DATA. The arrows are structure, not
 * content: an attacker-controlled string containing ` ⟷ ` forged one, and
 * every consumer believed it — the schematic truncated the shown value at
 * the fake arrow and decided editability by `includes(BOUND_TWO_WAY)`, so a
 * plain string could DRAW itself a false affordance, and the audit reported
 * on it (SEC-8). Fixed here at the source, which fixes every consumer at
 * once; the replacement character is visually honest about what happened.
 */
const stripArrows = (text: string): string =>
  text.includes(BOUND_TWO_WAY) || text.includes(BOUND_TO_DOM)
    ? text.split(BOUND_TWO_WAY).join('<->').split(BOUND_TO_DOM).join('<-')
    : text

const boundValue = (path: string, twoWay: boolean, secret = false): string => {
  const arrowOnly = twoWay ? BOUND_TWO_WAY : BOUND_TO_DOM
  // a secret's PATH is useful (an agent can still see what it's bound to);
  // its content never is
  //
  // SECRECY IS A PROPERTY OF THE PATH — the invariant this file states at the
  // top of the secret-scan section, and which this function used to violate.
  // It redacted on `secret`, the flag for THIS DOM record, and never consulted
  // the path. So `describe()` published in cleartext what `read()` refuses:
  //
  //   - an element bound to the EXACT secret path with a non-value binding
  //     (`bindings.enabled` on a token — "enable when a session exists") has
  //     record.secret === false, because nothing of the value reaches the DOM;
  //   - an element bound to an ANCESTOR serialised the whole subtree, secret
  //     included.
  //
  // Both leak in the READ-ONLY DEFAULT posture, through `tosi_describe` — the
  // one WebMCP tool published in every posture, while `tosi_read` sits behind
  // a gate precisely because reads are considered too much to publish unasked.
  // So the surface handed out the exact value the gate exists to withhold.
  // Now mirrors `readScanned()` exactly. THE MECHANISM THAT KEEPS THEM IN
  // STEP IS SEC-2b in agent.test.ts, which mutation-fails if either arm of
  // this dispatch is removed — not this comment.
  if (secret || isSecretPath(path)) return `${arrowOnly} ${path}`
  const serialized = serialize(xin[path])
  const raw = containsSecret(path)
    ? redactWithin([path], serialized)
    : serialized
  const shown =
    raw === undefined ? '' : typeof raw === 'string' ? raw : JSON.stringify(raw)
  const arrow = twoWay ? BOUND_TWO_WAY : BOUND_TO_DOM
  return shown ? `${stripArrows(shown)} ${arrow} ${path}` : `${arrow} ${path}`
}

// name a binding by identity: the shared bindings collection first, then the
// element-prop binding cache; textContent surfaces under the friendlier `text`
const bindingName = (binding: any): string | undefined => {
  for (const key of Object.keys(bindings)) {
    if ((bindings as any)[key] === binding) return key
  }
  const propKey = propBindingKey(binding)
  return propKey === 'textContent' ? 'text' : propKey
}

/** the posture last announced — notices fire on CHANGE, not once per process */
let lastPostureAnnounced: string | undefined

/**
 * Reset the once-per-process posture notices (testing only). Without this
 * the `expose: 'all'` consent warning could not be asserted — the latch is
 * spent by the first surface any test creates, so the assertion had to be
 * written as "…or no warnings at all", which can never fail. That warning
 * is the only signal that every state root is writable through a global.
 */
export function _resetPostureNotices(): void {
  lastPostureAnnounced = undefined
}
let active: AgentInterface | undefined

export function enableAgentInterface(
  options: AgentInterfaceOptions = {}
): AgentInterface {
  // re-enabling reconfigures: tear down the previous surface first
  if (active != null) active.disable()

  const {
    expose,
    components,
    global = true,
    webmcp = true,
    quiet = false,
  } = options
  let webmcpRegistration:
    | { tools: string[]; unregister: () => void }
    | undefined
  // THE POSTURE (1.9.0). Three modes, and the default is EMPTY:
  //
  //   enableAgentInterface()                    nothing is exposed
  //   enableAgentInterface({ expose: {roots} }) manifest — the production shape
  //   enableAgentInterface({ expose: 'all' })   everything, deliberately
  //
  // This has taken two goes to get right. 1.8.0 narrowed a default that meant
  // read, write AND call over the entire registry, on a global any script on
  // the page shares, with an unvalidated `tosi_write` auto-published to the
  // browser's tool registry — but it kept "the part that only LOOKS", on the
  // reasoning that a map of the app is the point and looking is harmless.
  //
  // Looking was not harmless. Four review rounds then found four ways that
  // read-only-over-everything default published secrets, each patched where
  // it was found. The default WAS the defect: an allowlist makes all four
  // unreachable, and leaves redaction as defence in depth rather than as the
  // boundary. Say nothing, see nothing.
  const exposeAll = expose === 'all'
  const manifest =
    typeof expose === 'object' && expose !== null ? expose : undefined
  // resolved ONCE, at enable time, so a bad entry fails while you are still
  // looking at the manifest — not later, from a read that names the wrong file
  const roots = manifest?.roots?.map((ref) => toPath(ref, 'expose.roots'))
  const exposedActions = manifest?.actions?.map((ref) =>
    toPath(ref, 'expose.actions')
  )
  const contract = manifest?.contract
  // contracted roots (the describe() keys) are read ONCE at enable time so
  // sub-path writes can be routed to a whole-root proposal
  const contractRoots =
    contract?.describe != null ? Object.keys(contract.describe()) : []
  /**
   * Is this path already governed by top-level curation?
   *
   * Two callers must agree on this and only this: `describe()`, which drops
   * superseded inline schemas so THE MAP DOES NOT ADVERTISE WHAT `write()`
   * WILL NOT ENFORCE, and `write()`, which skips inline checking under a
   * curated root. They were two copies of one expression sitting either side
   * of a comment calling their disagreement "the worst possible defect" — so
   * now there is one expression, and `curationHonoured()` below proves the
   * two uses still line up.
   */
  const supersededByCuration = (path: string): boolean =>
    contract != null && contractRoots.some((root) => extendsPath(root, path))

  const manifestMode = manifest != null
  /**
   * IS AN ALLOWLIST IN FORCE? (1.9.0 — this replaced `manifestMode` at every
   * disclosure gate.)
   *
   * The default used to be "read-only over EVERYTHING", and that one decision
   * produced four separate secret leaks across four review rounds: each was
   * only reachable because a caller who passed no arguments got the whole
   * registry and every bound element on the page. Patching the leaks treated
   * symptoms of a permissive default.
   *
   * Now the ladder is: say nothing and see nothing; declare roots and see
   * those; ask for `'all'` and own it. Redaction stops being the boundary —
   * it was never good at that — and goes back to being defence in depth for
   * what you DID declare.
   *
   * Gating on `manifestMode` would have been the bug again: "no manifest"
   * stopped meaning "no scoping" here, so any gate still asking that question
   * would spill in the new default exactly as before.
   */
  const scoped = !exposeAll
  /** nothing declared and nothing demanded: the surface describes an empty app */
  const closed = !manifestMode && !exposeAll
  // A MANIFEST SCOPES SIGHT, NOT REACH. `expose: { roots }` used to confer
  // writes over those roots as a side effect of narrowing reads, which made
  // the safest-sounding posture the most permissive one available and left
  // "scoped reads, no writes" inexpressible (1.8.0 security pass, SEC-7).
  // Writes now need saying so — `write: true`, or `expose: 'all'`.
  const writesAllowed = exposeAll || (manifestMode && manifest?.write === true)
  const callsAllowed = exposeAll || manifestMode

  // ANNOUNCE EVERY TRANSITION, not just the first one. These were
  // once-per-process latches, so the documented dev workflow — open it up,
  // narrow it to a manifest, open it up again — announced full access ONCE
  // and stayed silent through every later widening (SEC-14). Latching on the
  // posture keeps repeated identical enables quiet while making each change
  // of posture speak.
  const posture = exposeAll ? 'all' : manifestMode ? 'manifest' : 'closed'
  const announce =
    posture !== lastPostureAnnounced && settings.quiet !== true && !quiet
  if (announce) lastPostureAnnounced = posture
  if (closed && announce) {
    // NOT a warning: exposing nothing is the correct, safe outcome. It is
    // announced because it is also almost certainly not what the caller
    // wanted, and an empty map with no explanation reads as a broken library.
    console.info(
      'tosijs agent: nothing is exposed. describe() reports an empty app and ' +
        'read/observe/changes/when refuse every path, because no manifest was ' +
        "declared. Pass expose: 'all' while developing, or " +
        'expose: { roots, actions } to declare what an agent may see.'
    )
  }
  if (exposeAll && announce) {
    console.warn(
      "tosijs agent: expose: 'all' — every state root is readable, WRITABLE " +
        'and callable through globalThis.tosiAgent, which any script on this ' +
        'page can reach. Intended for development. Production posture is ' +
        'expose: { roots, actions } with a contract.'
    )
  }

  let disabled = false

  /**
   * A REVOKED SURFACE REFUSES.
   *
   * `disable()` used to tear down everything AROUND the surface — observers,
   * pending `when()`s, the WebMCP registration, the global — and leave the
   * verbs working on the handle the caller already had. So revocation revoked
   * the discovery of the capability, not the capability: anyone holding the
   * object returned by `enableAgentInterface()` could still read, write and
   * call, forever, including after a re-enable had narrowed the manifest.
   * `enableAgentInterface()` auto-disables the previous surface, so tightening
   * a posture at runtime left the OLD, wider one fully usable.
   *
   * The WebMCP delegate already got this right and its comment already said
   * so out loud — "Disabled means REFUSED, and dead surfaces get to be
   * garbage" — but only the delegate consulted `active`. This makes the
   * statement true of the surface itself.
   */
  const assertLive = (verb: string): void => {
    if (!disabled) return
    throw refuse(
      'revoked',
      `agent interface: ${verb}() refused — this surface has been disabled. ` +
        'Disabling revokes the capability, not just the global: get a fresh ' +
        'surface from enableAgentInterface() (or globalThis.tosiAgent) ' +
        'rather than holding one across a reconfigure.'
    )
  }
  let myGlobalName: string | undefined
  const surfaceVersion: AgentSurfaceVersion = {
    surface: AGENT_SURFACE_VERSION,
    tosijs: version,
    capabilities: [...AGENT_CAPABILITIES],
  }

  const inScope = (path: string): boolean =>
    !scoped ||
    (roots ?? []).some((root) => extendsPath(root, path)) ||
    (exposedActions ?? []).some((action) => extendsPath(action, path))

  /**
   * THE ONE CONTENT GUARD. Would publishing this node's rendered content
   * disclose something this surface refuses?
   *
   * Answers secrecy and scope together, over the node AND its subtree, so
   * every harvest asks one question instead of each asking a slightly
   * different one. Fails closed: if we cannot tell, we do not publish.
   */
  const contentWithheld: ContentGuard = (node: Element): boolean => {
    try {
      if (isSecretControl(node)) return true
      if (closestAcrossRoots(node, '[data-tosi-secret]') != null) return true
      if (deepHas(node, SECRET_CONTROL_SELECTOR)) return true
      for (const path of subtreeBindingPaths(node)) {
        if (!inScope(path)) return true
        if (isSecretPath(path) || containsSecret(path)) return true
      }
      return false
    } catch {
      return true // cannot tell === must not publish
    }
  }

  // writes are gated on declared ROOTS only: a declared action is callable,
  // not writable — otherwise `actions: ['app.checkout']` would let an agent
  // REPLACE app.checkout (a function) with agent-supplied data.
  //
  // Consulting the roots alone did not actually achieve that, because an
  // action normally LIVES under a declared root: with
  // `{ roots: ['app'], actions: ['app.checkout'] }`,
  // `write('app.checkout', 'x')` disabled the action and `write('app', {})`
  // wiped every one of them (SEC-9). So a write is refused when it lands ON
  // a declared action, UNDER one, or on an ancestor that CONTAINS one.
  const hitsDeclaredAction = (path: string): boolean =>
    (exposedActions ?? []).some(
      (action) => extendsPath(action, path) || extendsPath(path, action)
    )
  const writable = (path: string): boolean =>
    !hitsDeclaredAction(path) &&
    (!scoped || (roots ?? []).some((root) => extendsPath(root, path)))

  const assertScope = (path: string): void => {
    if (!inScope(path)) {
      throw refuse(
        'scope',
        closed
          ? `agent interface: "${path}" is not exposed — this surface ` +
              "declares no manifest, so nothing is. Pass expose: 'all' while " +
              'developing, or expose: { roots } to declare what may be read.'
          : `agent interface: "${path}" is not exposed (manifest mode)`
      )
    }
  }

  /** the verbs that CHANGE things need consent; looking does not */
  const assertMutable = (verb: string, path: string): void => {
    const allowed = verb === 'call' ? callsAllowed : writesAllowed
    if (allowed) return
    if (closed) {
      throw refuse(
        'mutability',
        `agent interface: ${verb}("${path}") refused — this surface exposes ` +
          `nothing. Declare expose: { roots${
            verb === 'call' ? ', actions' : ''
          }${verb === 'write' ? ', write: true' : ''} } to allow it, or ` +
          "expose: 'all' while developing."
      )
    }
    throw refuse(
      'mutability',
      `agent interface: ${verb}("${path}") refused — this manifest exposes ` +
        'its roots for reading only. Add write: true to the manifest to ' +
        "allow writes, or use expose: 'all' while developing."
    )
  }

  // the audit ledger — one global observer; every touch lands here.
  // log/changes are two consumptions of this one stream. Entries with a
  // `note` are synthetic audit events (when() arming etc.), visible in
  // log() but skipped by the changes() drain.
  let seq = 0
  // RING BUFFER. `observe(() => true, …)` records every settled touch, and
  // the documented pattern is enable-once-and-leave — 20k touches measured
  // 3.2 MB. `seq` stays monotonic so cursors keep working across a trim,
  // and a drain that spans dropped entries says so rather than pretending
  // it saw everything.
  const maxLog = options.maxLog ?? 10_000
  let dropped = 0
  const ledger: AgentLogEntry[] = []
  // TRIM IN BATCHES, not on every touch. splice(0, 1) once the ledger is full
  // re-indexes the whole array per touch — measured 155.6ms per 200k touches
  // against 1.6ms batched, ~100×, and it starts silently once an app has been
  // running a while (which is the documented usage: enable once and leave).
  // Let it grow 10% past the cap, then trim back to it in one move.
  const trimAt = Math.max(maxLog + 1, Math.ceil(maxLog * 1.1))
  const record = (entry: AgentLogEntry): void => {
    ledger.push(entry)
    if (ledger.length >= trimAt) {
      const excess = ledger.length - maxLog
      dropped += excess
      ledger.splice(0, excess)
    }
  }
  const pendingWhens = new Set<{ reject: (reason: Error) => void }>()
  const ledgerListener: Listener = observe(
    () => true,
    (path: string) => {
      if (inScope(path)) record({ seq: ++seq, path })
    }
  )
  const subscriptions = new Set<Listener>()

  // the read itself, once the secret-path set is known to be current
  const readScanned = (path: string): any => {
    assertScope(path)
    if (isSecretPath(path)) return SECRET_SENTINEL
    const value = serialize(xin[path])
    // an ANCESTOR read must not hand back what a direct read refuses
    return containsSecret(path) ? redactWithin([path], value) : value
  }

  const read = (pathRef: AgentPathRef): any => {
    assertLive('read')
    const path = toPath(pathRef, 'read')
    refreshSecretPaths()
    return readScanned(path)
  }

  // one scan at enable time, so the very first read is already redacted
  // even if the caller never asks for a description
  refreshSecretPaths()

  const surface: AgentInterface = {
    describe(
      options: {
        styles?: boolean
        scope?: Element
        structure?: boolean
        view?: 'page' | 'viewport'
      } = {}
    ): AgentDescription {
      assertLive('describe')
      // learn the secret-bound paths BEFORE any record harvests a value:
      // within a single walk, an element bound to the same path could be
      // visited before the password field that makes it secret
      refreshSecretPaths()
      const viewportView = options.view === 'viewport'
      // `scoped`, not `manifestMode`: with no manifest `roots` is undefined,
      // so the closed posture lists nothing rather than enumerating every
      // root name (and its type) in the registry.
      const rootNames = scoped ? (roots ?? []).slice() : Object.keys(registry)
      const rootSummary: Record<string, string> = {}
      for (const root of rootNames) {
        rootSummary[root] = Array.isArray(tosiValue(xin[root]))
          ? 'array'
          : typeof tosiValue(xin[root])
      }

      // wiring: every data-bound element (enumerable via the marker class),
      // plus every event-wired element (probe the handler map on a tree walk).
      // With `scope`, both walks are confined to that element's subtree —
      // hierarchy scoping, stable however large the subtree renders.
      const wiring: AgentWiringRecord[] = []
      // inline element contracts aggregate here, keyed by bound path —
      // merged into describe().contract below (curation keys win)
      const inlineContracts: Record<string, any> = {}
      /*
       * THE CLOSED POSTURE MAPS NOTHING. (1.9.0 pre-minor review, B-1.)
       *
       * There are five ways an element becomes `wired`, and only two asked
       * about posture: data bindings (via `inScope`) and event handlers. A
       * bare `<a href>`, a contenteditable, a self-declaring custom element
       * and the entire structural tier were gated on nothing — so a surface
       * that printed "nothing is exposed", reported `roots: []` and refused
       * every read still returned four wiring records, among them a heading
       * carrying the very secret `read()` had just refused, plus a token in
       * an href and a user's half-typed draft.
       *
       * The bug beneath the bug: I checked `wiring` was empty using a fixture
       * of a bound input, an unbound input and a button — the three shapes
       * that WERE gated. Every leak lived in a shape my fixture did not
       * contain, and the guard test had the same blind spot, so it could not
       * fail. That is the fifth time this release that an invariant restated
       * per-site was wrong at a site nobody enumerated.
       *
       * Hence ONE gate on the walk, not five more conditions to keep in sync:
       * a harvest added later inherits it by construction.
       */
      if (typeof document !== 'undefined' && !closed) {
        const walkRoot: Element =
          options.scope ?? (document.body as unknown as Element)
        const seen = new Set<Element>()
        const recordFor = (el: Element): AgentWiringRecord | undefined => {
          if (seen.has(el)) return undefined
          seen.add(el)
          if (ariaHidden(el)) return undefined // hidden from AT = hidden here
          const { dataBindings, eventBindings } = getElementBindings(el)
          const record = describeElement(el, contentWithheld)
          // every state path this element is bound to, so the live-DOM
          // harvests below can ask whether any of them is secret
          const boundPaths: string[] = []
          // inline contract: declared at the element, aggregated (below) into
          // describe().contract under the element's bound path — declaration
          // is distributed, curation is central
          const inline = elementContract(el)
          let inlinePath: string | undefined
          let inlineTwoWay = false
          let wired = false
          /*
           * EVERY bound path, in scope or not — the GUARDS need the ones the
           * publishing loop skips.
           *
           * `boundPaths` is built inside the loop below, AFTER its
           * `if (!inScope) continue`, so an element bound only to undeclared
           * paths reached `suppressHarvest` with an empty list. The guard then
           * saw no secret and no scope violation, and the DOM arm found
           * nothing because the element is not a secret *control* — so a
           * contenteditable bound to an undeclared token published it as text.
           * Scope-filtering what we PUBLISH is right; scope-filtering what the
           * guards can SEE is what let it out.
           */
          const allBoundPaths =
            dataBindings != null
              ? dataBindings
                  .map((b: any) => b.path)
                  .filter((p: any) => p != null)
              : []
          if (dataBindings != null) {
            for (const b of dataBindings) {
              if (!inScope(b.path)) continue
              wired = true
              if (inline != null && !inlineTwoWay) {
                if (b.binding.fromDOM != null) {
                  inlinePath = b.path // the writable path is the one it gates
                  inlineTwoWay = true
                } else {
                  inlinePath ??= b.path
                }
              }
              const idPath = (b.options as any)?.idPath
              if (idPath != null || b.binding === (bindings as any).list) {
                record.list = idPath
                  ? { path: b.path, idPath }
                  : { path: b.path }
                continue
              }
              const name = bindingName(b.binding)
              // remember the PATH, so read/changes/when redact it too — the
              // map publishes this path, so withholding only the DOM value
              // would just be telling the agent what to ask for
              if (record.secret === true) addSecretPath(b.path)
              boundPaths.push(b.path)
              if (name != null && record[name] === undefined) {
                record[name] = boundValue(
                  b.path,
                  b.binding.fromDOM != null,
                  record.secret === true
                )
              } else {
                // obscure stuff one level deeper
                record.detail ??= []
                record.detail.push({
                  path: b.path,
                  readable: b.binding.toDOM != null,
                  writable: b.binding.fromDOM != null,
                })
              }
            }
          }
          if (eventBindings != null) {
            // every state path this element is bound to, so a live-DOM
            // harvest can ask whether any of them is secret
            const on: Record<string, string | string[]> = {}
            // SCOPE COMES FROM PROVENANCE, NEVER FROM THE RENDERED STRING.
            // This used to test `name !== 'ƒ'`, so a plain named function
            // (`button({ onClick: addItem })` — our own documented idiom)
            // rendered as "ƒ addItem", counted as in-scope, and dragged the
            // element's text and live value into a manifest-scoped map. A
            // plain function has no path and can never be in-manifest.
            let anyHandlerInScope = false
            for (const [type, set] of Object.entries(eventBindings)) {
              // MANIFEST SCOPE APPLIES HERE TOO. Data bindings were filtered
              // but handlers were not, so an allowlisted surface published
              // the private action namespace ('app.secret.wipe') — and,
              // because an unscoped handler still flipped `wired`, the
              // record then harvested text, live control values, labels and
              // geometry from regions the manifest deliberately excluded.
              const names = Array.from(set as Set<any>, (h) => {
                if (typeof h === 'string') {
                  // a by-path handler outside the manifest is not ours to
                  // name — report it as anonymous rather than leaking the
                  // path (the element is still visibly interactive)
                  if (inScope(h)) {
                    anyHandlerInScope = true
                    return h
                  }
                  return 'ƒ'
                }
                // on() normalizes proxies to paths at registration; this is
                // defense for handlers registered around it. A raw function
                // contributes its NAME as a breadcrumb when it has a real
                // one ('ƒ addThing' — worth little under minification, but
                // free) — prop-key artifacts (onClick, handleClick method
                // shorthand) say nothing, so they stay plain 'ƒ'
                const path = tosiPath(h)
                if (path != null) return path
                const name = (h as any)?.name
                return name && !/^(on|handle)[A-Z]/.test(name)
                  ? `ƒ ${name}`
                  : 'ƒ'
              })
              on[type] = names.length === 1 ? names[0] : names
            }
            if (Object.keys(on).length > 0) {
              record.on = on
              // under an allowlist, handlers that are ALL out of scope do not
              // make this element part of the exposed surface
              if (!scoped || anyHandlerInScope) wired = true
            }
          }
          // static text, when textContent isn't already surfaced as bound —
          // NOT when harvesting it would publish a secret (round-4 B-1), and
          // NOT when the element is bound to something out of scope: its text
          // is then the rendered form of a value `read()` refuses.
          // `allBoundPaths`, not `boundPaths` — the latter is scope-filtered,
          // so the guard was blind to exactly the bindings that matter here.
          if (
            record.text === undefined &&
            !suppressHarvest(el, record, allBoundPaths) &&
            !contentWithheld(el)
          ) {
            const text = stripArrows((el.textContent || '').trim()).slice(0, 40)
            if (text) record.text = text
          }
          // an UNBOUND form control still holds a live value — harvest it
          // (no provenance arrow: a plain string means "current, not bound").
          // ONLY under `expose: 'all'`: an allowlist that hides
          // `read('app.pin')` must not hand the same digits over as DOM
          // content, and an unbound control's value is by definition outside
          // every declared root. This gate asked `!manifestMode` until 1.9.0,
          // which was the same question until the default became closed —
          // after which it would have harvested live control values for a
          // caller who exposed nothing at all.
          if (
            !scoped &&
            record.value === undefined &&
            record.checked === undefined &&
            record.secret !== true &&
            (record.tag === 'input' ||
              record.tag === 'textarea' ||
              record.tag === 'select')
          ) {
            const liveValue = stripArrows(
              String((el as any).value ?? '')
            ).slice(0, 40)
            if (liveValue) record.value = liveValue
          }
          /*
           * AN ALLOWLIST GOVERNS THESE TOO. (Re-review B-1.)
           *
           * These two, plus the self-declared component below, put an element
           * on the map with no posture check at all. The first fix put ONE
           * gate on the walk keyed to `closed` — which closed the closed
           * posture and left the MANIFEST posture, the one the docs call the
           * production floor, publishing exactly what `read()` refuses: a
           * token in an href, a user's live contenteditable text, a private
           * component's action namespace. Through `tosi_describe`, which is
           * published in every posture.
           *
           * The tell was already in the file: the unbound-form-control
           * harvest twenty lines up is gated `!scoped`, with the comment "an
           * allowlist that hides read('app.pin') must not hand the same digits
           * over as DOM content". Same invariant; these disagreed with it.
           *
           * So `scoped`, not `closed`. Under any allowlist an element earns a
           * place on the map by being DECLARED — via an in-scope binding or an
           * in-scope handler — never merely by existing in the DOM.
           */
          if (!scoped && record.href != null && record.tag === 'a') {
            wired = true
          }
          // contenteditable: live text is its value; the region is an
          // affordance in itself, mapped even before bindings attach
          if (record.contentEditable === true) {
            // a contenteditable region carrying `data-tosi-secret` is the
            // author's own opt-in, and it was being ignored here.
            // `allBoundPaths`, not `boundPaths`: the guard must see the
            // bindings the publishing loop skipped as out of scope.
            if (
              record.value === undefined &&
              !suppressHarvest(el, record, allBoundPaths) &&
              !contentWithheld(el)
            ) {
              const liveText = stripArrows((el.textContent || '').trim()).slice(
                0,
                40
              )
              if (liveText) record.value = liveText
            }
            if (!scoped) wired = true
          }
          if (inline != null) {
            record.contract = inline
            if (
              inlinePath != null &&
              inlineContracts[inlinePath] === undefined
            ) {
              inlineContracts[inlinePath] = inline
            }
          }
          // a custom element may carry its own self-declaration. OWN statics
          // only: statics inherit through the prototype chain, and a subclass
          // must not silently wear its parent's claims (the _elementCreator
          // lesson, applied to contracts). Post-hoc contracts (expose.
          // components, keyed by tag) fill the gaps for classes you don't
          // control — the class's own declaration always wins.
          if (record.tag.includes('-')) {
            const cls = (globalThis as any).customElements?.get?.(record.tag)
            const own = ownContract(cls)
            const declared =
              own !== undefined ? own : components?.[record.tag] ?? undefined
            if (declared != null) {
              record.component = declared
            }
            // a self-DECLARED component is an affordance by declaration:
            // carrying a contract announces it to the surface, shadow
            // internals or not — but under an allowlist, declaring a contract
            // is the COMPONENT author's decision, not the app author's, and it
            // must not put a private widget (its description, action
            // namespace and attribute defaults) on a scoped map
            if (record.component != null && !scoped) {
              wired = true
            }
            // ATTRIBUTES, HOWEVER THEY WERE DECLARED (tosijs#29). Reading them
            // off `static contract` alone meant a component using
            // `static initAttributes` — the terse form nearly every component
            // uses, and the only one the component reference documents — sat
            // in the map with no attribute description at all.
            //
            // DELIBERATELY GATED ON `wired`, and it never sets it. Declaration
            // stays the announce signal: every component has attributes, so
            // letting them make an element wired would flood the map with
            // every custom element on the page. This only fills in the surface
            // of something already in the map.
            if (wired) {
              const described =
                typeof (cls as any)?._describedAttributes === 'function'
                  ? (cls as any)._describedAttributes()
                  : undefined
              if (described != null && Object.keys(described).length > 0) {
                record.component = {
                  ...(record.component ?? {}),
                  attributes: described,
                }
              }
            }
          }
          // BAIL FIRST. measureBounds is a getBoundingClientRect plus a
          // fixed/sticky ancestor walk that calls getComputedStyle up to 12
          // times — and every custom element on the page is fed in here.
          // Measuring before the wired check meant ~70% of that work was
          // thrown away on a redraw the docs recommend running on every
          // state change.
          if (!wired) {
            seen.delete(el) // release the claim; the structural tier may want it
            return undefined
          }
          // geometry: the layout is part of the semantics
          const measured = measureBounds(el, viewportView)
          if (measured != null) {
            record.bounds = measured.bounds
            if (measured.fixed) record.viewportFixed = true
          } else if (viewportView) {
            return undefined // the camera doesn't record what it can't see
          }
          if (
            options.styles === true &&
            typeof (globalThis as any).getComputedStyle === 'function'
          ) {
            const cs = (globalThis as any).getComputedStyle(el)
            record.style = {
              background: cs.backgroundColor,
              borderColor: cs.borderTopColor,
              color: cs.color,
            }
          }
          return record
        }
        /*
         * THE CLOSED POSTURE MAPS NOTHING. (1.9.0 pre-minor review, B-1.)
         *
         * Five ways an element can become `wired`, and only two of them asked
         * about posture: data bindings (via `inScope`) and event handlers.
         * A bare `<a href>`, a contenteditable, a self-declaring custom
         * element and the whole structural tier were gated on nothing — so a
         * surface that printed "nothing is exposed", reported `roots: []` and
         * refused every read still returned four wiring records, including a
         * heading bound to the very path `read()` had just refused.
         *
         * The bug beneath the bug: I verified `wiring` was empty using a
         * fixture of a bound input, an unbound input and a button — the three
         * shapes that WERE gated. Every leak lived in a shape the fixture did
         * not contain, and the guard test at agent.test.ts had exactly the
         * same blind spot, so it could not fail.
         *
         * So this is one gate at the top of the walk rather than five more
         * conditions to keep in sync. A future harvest added below inherits
         * it by construction; that is the whole point, because the last four
         * times this invariant was restated per-site it was wrong per-site.
         */
        for (const el of Array.from(
          walkRoot.getElementsByClassName(BOUND_CLASS)
        )) {
          const record = recordFor(el)
          if (record) wiring.push(record)
        }
        for (const el of [
          walkRoot,
          ...Array.from(walkRoot.querySelectorAll('*')),
        ]) {
          // handlers wire an element; a custom element may instead be
          // self-declared (own static contract / post-hoc components map) —
          // recordFor decides, we just make sure it gets ASKED
          if (elementToHandlers.has(el) || el.tagName.includes('-')) {
            const record = recordFor(el)
            if (record) wiring.push(record)
          }
        }
        // contenteditable regions are affordances in themselves — enumerated
        // even before any binding or handler attaches (the walk otherwise
        // only visits WIRED elements)
        for (const el of Array.from(
          walkRoot.querySelectorAll('[contenteditable]')
        )) {
          if (el.getAttribute('contenteditable') === 'false') continue
          const record = recordFor(el)
          if (record) wiring.push(record)
        }
        // links likewise: navigation is app surface, bindings or not
        for (const el of Array.from(walkRoot.querySelectorAll('a[href]'))) {
          const record = recordFor(el)
          if (record) wiring.push(record)
        }
        // the structural tier (unless structure: false): headings and
        // landmarks — the page's information architecture — plus the
        // custom-element containers wired elements live inside. Structure
        // is what turns a scatter of affordances into a MAP.
        if (options.structure !== false) {
          const structural: Element[] = Array.from(
            walkRoot.querySelectorAll(
              'h1,h2,h3,h4,h5,h6,main,article,section,nav,aside,header,footer'
            )
          )
          for (const wired of Array.from(seen)) {
            let ancestor = wired.parentElement
            while (ancestor != null && ancestor !== walkRoot) {
              if (ancestor.tagName.includes('-')) structural.push(ancestor)
              ancestor = ancestor.parentElement
            }
          }
          for (const el of structural) {
            if (seen.has(el)) continue
            seen.add(el)
            /*
             * THE STRUCTURAL TIER IS A HARVEST TOO. (Review B-2.)
             *
             * `recordFor` guards its harvests with `ariaHidden`, `inScope`
             * and `harvestWouldLeak` — and then RELEASES elements it rejected
             * (`seen.delete`, "the structural tier may want it"), so this
             * loop re-visited them and read their textContent with none of
             * those guards. It therefore defeated all three independently, in
             * EVERY posture: an `<h2>` bound to an undeclared path published
             * the value a manifest refused; an `<h2>` containing a
             * `data-tosi-secret` span laundered the author's own opt-in; and
             * `aria-hidden` was ignored outright.
             *
             * Structure may be worth mapping, but a heading's TEXT is content,
             * and content goes through the same gates as any other harvest.
             */
            if (ariaHidden(el)) continue
            const record = describeElement(el, contentWithheld)
            record.structural = true
            const structuralPaths = bindingPathsOf(el)
            const heading = /^H[1-6]$/.test(el.tagName)
            if (
              heading &&
              record.text === undefined &&
              // SCOPE: a heading bound to an undeclared path must not print
              // the value `read()` refuses on that same path
              !suppressHarvest(el, record, structuralPaths) &&
              !contentWithheld(el)
            ) {
              // stripArrows like the other three text harvests (2234, 2255,
              // 2296). This was the one exception, under a docstring saying
              // there is none — inert, because a structural record is ground
              // and never interactive, but an agent reading the description
              // JSON directly saw a heading that appeared to carry a live
              // two-way binding.
              const text = stripArrows((el.textContent || '').trim()).slice(
                0,
                60
              )
              if (text) record.text = text
            }
            const measured = measureBounds(el, viewportView)
            if (
              measured == null ||
              measured.bounds.width === 0 ||
              measured.bounds.height === 0
            ) {
              continue
            }
            record.bounds = measured.bounds
            if (measured.fixed) record.viewportFixed = true
            wiring.push(record)
          }
        }
      }

      // actions: functions reachable from exposed roots (bounded walk).
      // `scoped` again — the closed posture declares no actions, and must not
      // fall through to walking the registry for them.
      const actions: string[] = []
      if (scoped) {
        actions.push(...(exposedActions ?? []))
      } else {
        const walk = (value: any, path: string, depth: number): void => {
          if (depth > 3 || value == null || typeof value !== 'object') return
          for (const key of Object.keys(value)) {
            const child = value[key]
            const childPath = `${path}.${key}`
            if (typeof child === 'function') actions.push(childPath)
            else walk(child, childPath, depth + 1)
          }
        }
        for (const root of rootNames) {
          walk(registry[root], root, 0)
        }
      }

      const description: AgentDescription = {
        version: surfaceVersion,
        roots: rootSummary,
        wiring,
        actions,
        exposure: manifestMode ? 'manifest' : exposeAll ? 'all' : 'closed',
        writable: writesAllowed,
      }
      // inline declarations fill the contract; top-level curation OVERRIDES
      // on collision — declare where you build, curate at the top
      const declared =
        contract?.describe != null ? contract.describe() : undefined
      // THE MAP MUST NOT ADVERTISE WHAT write() WILL NOT ENFORCE. Curation
      // supersedes inline declarations beneath its roots — that is the
      // documented precedence — but the inline schema was still emitted, so
      // describe().contract stated a rule the surface would then accept a
      // violation of. For a surface whose whole claim is that its
      // description is honest, that is the worst possible defect: drop the
      // superseded entries instead.
      const enforceable: Record<string, any> = {}
      for (const [path, schema] of Object.entries(inlineContracts)) {
        if (!supersededByCuration(path)) enforceable[path] = schema
      }
      const merged = { ...enforceable, ...(declared ?? {}) }
      if (Object.keys(merged).length > 0) {
        description.contract = merged
      }
      return description
    },

    read,

    write(pathRef: AgentPathRef, value: any): void {
      assertLive('write')
      const path = toPath(pathRef, 'write')
      assertMutable('write', path)
      assertScope(path)
      if (!writable(path)) {
        throw refuse(
          'callable',
          `agent interface: "${path}" is callable, not writable (declare it under roots to allow writes)`
        )
      }
      if (contract != null) {
        // route the WRITE, not the schema: judge a sub-path write as the
        // whole contracted root it would produce (clone + hypothetical
        // apply) — closes the sub-path bypass, and root-level cross-field
        // constraints and $predicates see the edit in context
        let proposal: { root: string; proposed: any } | undefined
        const root = contractRoots
          .filter((contractRoot) => extendsPath(contractRoot, path))
          .sort((a, b) => b.length - a.length)[0]
        if (root != null) {
          if (path === root) {
            proposal = { root, proposed: value }
          } else {
            const wrapper = { root: serialize(xin[root]) }
            const relative = path.slice(root.length)
            setByPath(
              wrapper,
              relative.startsWith('[')
                ? `root${relative}`
                : `root.${relative.replace(/^\./, '')}`,
              value
            )
            proposal = { root, proposed: wrapper.root }
          }
        }
        const verdict = contract.check(path, value, proposal)
        if (verdict !== true) {
          // refusals are audit events: what an agent TRIED matters as much
          // as what it did
          record({
            seq: ++seq,
            path,
            note: `write rejected: ${verdict.message}`,
          })
          throw verdict
        }
      }
      // inline contracts gate wherever top-level curation does NOT cover the
      // path — declared at the element, enforced at the surface. Curation
      // always wins: an expose.contract root supersedes ("curate away") any
      // inline declarations beneath it.
      if (!supersededByCuration(path)) {
        const schema = inlineSchemaFor(path)
        if (schema != null) {
          const err = contractViolation(value, schema)
          if (err != null) {
            record({
              seq: ++seq,
              path,
              note: `write rejected: ${err}`,
            })
            throw new TypeError(
              `agent interface: inline contract violation at "${path}": ${err}`
            )
          }
        }
      }
      xin[path] = value
    },

    observe(
      pathRef: AgentObserveRef,
      callback: (path: string) => void
    ): () => void {
      // A PATTERN IS NOT A PATH, and cannot be proven in scope. The
      // underlying observer accepts a RegExp or a predicate and the map's own
      // "redraw on anything" examples use `/./` — but a pattern says which
      // paths it wants only by running, so under a manifest there is nothing
      // to check it against. `expose: 'all'` has nothing to protect, so it is
      // allowed there and refused everywhere else. It already failed under a
      // manifest, with a raw `path.startsWith is not a function`; this says
      // what is wrong instead.
      assertLive('observe')
      // RESOLVE THE PATH BEFORE CLASSIFYING. A boxed proxy over a FUNCTION
      // reports `typeof === 'function'` (xin.ts returns a Proxy over
      // `value.bind(target)`, and a Proxy preserves its target's typeof), so
      // asking `typeof pathRef === 'function'` first classified an ACTION
      // PROXY as a filter predicate — and the path-listener then CALLED it on
      // every settled touch. `agent.observe(app.saveOrder, cb)` ran
      // saveOrder('app.n') on every keystroke, forever: no assertScope, no
      // assertMutable('call'), and no `call:` entry in the ledger, so the
      // invocations were invisible to audit. The caller's own callback never
      // fired unless the action happened to return truthy.
      //
      // A path ref resolves; a genuine pattern does not. Ask that instead.
      const resolved =
        typeof pathRef === 'string' ? pathRef : tosiPath(pathRef as any)
      const pattern =
        resolved == null &&
        (pathRef instanceof RegExp || typeof pathRef === 'function')
      if (pattern && scoped) {
        throw refuse(
          'scope',
          'agent interface: observe() takes a pattern (RegExp or predicate) ' +
            "only under expose: 'all' — a pattern cannot be checked against " +
            'a manifest, so it would observe outside the declared roots. ' +
            'Name the paths you want, or observe a declared root directly.'
        )
      }
      const path = pattern
        ? (pathRef as unknown as string)
        : resolved ?? toPath(pathRef as AgentPathRef, 'observe')
      if (!pattern) assertScope(path)
      const listener = observe(path, callback)
      subscriptions.add(listener)
      let off = false
      return () => {
        if (off) return // idempotent: unobserve throws on a stranger
        off = true
        // ONLY UNOBSERVE WHAT IS STILL OURS. disable() unobserves every
        // subscription and clears the set, but this closure still holds the
        // listener — so an app following the documented reconfigure flow
        // ("enableAgentInterface auto-disables the previous surface, then the
        // app calls its own cleanup") threw 'unobserve failed, listener not
        // found' on the first off() and skipped every teardown line after it.
        // Same defect class disable()'s own comment says was fixed for
        // double-disable.
        if (subscriptions.delete(listener)) unobserve(listener)
      }
    },

    call(actionRef: AgentPathRef, ...args: any[]): any {
      assertLive('call')
      const actionPath = toPath(actionRef, 'call')
      assertMutable('call', actionPath)
      if (manifestMode && !(exposedActions ?? []).includes(actionPath)) {
        throw new Error(
          `agent interface: action "${actionPath}" is not exposed (manifest mode)`
        )
      }
      const fn = xin[actionPath]
      if (typeof fn !== 'function') {
        throw new Error(`agent interface: "${actionPath}" is not an action`)
      }
      // THE INVOCATION IS THE AUDIT EVENT. The ledger records in-scope
      // TOUCHES, so a call-only surface (`roots: []`) mutating state through
      // its action left no trace at all — the one posture where the app has
      // told us exactly what an agent is allowed to do was the one where the
      // log went blank. Arguments are deliberately not recorded: they are
      // arbitrary caller data and can carry secrets.
      record({
        seq: ++seq,
        path: actionPath,
        note: `call: ${args.length} arg${args.length === 1 ? '' : 's'}`,
      })
      return fn(...args)
    },

    // await a state condition: the value now if it already satisfies,
    // otherwise the first settling round where it does
    when(
      pathRef: AgentPathRef,
      predicate: (value: any) => boolean
    ): Promise<any> {
      // ONE CHANNEL FOR EVERY FAILURE, and that channel is the promise.
      // These guards used to throw SYNCHRONOUSLY out of a promise-returning
      // method, so `agent.when(p, f).catch(handle)` — no await, no try — got
      // an uncaught exception instead of a rejection. The predicate-error
      // path below already got this right and said so; the guards did not,
      // and the CHANGELOG, the commit message and the test all claimed
      // otherwise. The test could not tell: `try { await … } catch` catches
      // both.
      let path: string
      try {
        assertLive('when')
        path = toPath(pathRef, 'when')
        assertScope(path)
      } catch (e) {
        return Promise.reject(e)
      }
      refreshSecretPaths()
      const current = serialize(xin[path])
      let alreadySatisfied: boolean
      try {
        alreadySatisfied = predicate(current)
      } catch (e) {
        // predicate errors use one channel: the returned promise
        return Promise.reject(e)
      }
      if (alreadySatisfied) {
        record({ seq: ++seq, path, note: 'when: already satisfied' })
        // resolve through read() so a secret-bound path redacts here exactly
        // as it does on a direct read. The PREDICATE still sees the truth —
        // it has to, or a condition on a secret could never be expressed —
        // and that is not a hole: a predicate is a live function, so anyone
        // who can pass one already runs code in this page. What matters is
        // that the value handed BACK travels the same redacted channel as
        // read(), which is the one a WebMCP host or a serialized transport
        // can actually reach.
        return Promise.resolve(read(path))
      }
      record({
        seq: ++seq,
        path,
        note: `when: armed ${String(predicate).slice(0, 80)}`,
      })
      return new Promise((resolve, reject) => {
        const pending = { reject }
        pendingWhens.add(pending)
        const settle = (fn: () => void) => {
          pendingWhens.delete(pending)
          subscriptions.delete(listener)
          unobserve(listener)
          fn()
        }
        const listener = observe(path, () => {
          const value = serialize(xin[path])
          let satisfied: boolean
          try {
            satisfied = predicate(value)
          } catch (e) {
            settle(() => reject(e as Error))
            return
          }
          if (satisfied) {
            record({ seq: ++seq, path, note: 'when: resolved' })
            settle(() => resolve(read(path)))
          }
        })
        subscriptions.add(listener)
      })
    },

    // turn-based drain: everything since the cursor, coalesced to one entry
    // per path (final value read at drain time — updates()' settling
    // semantics, extended across agent turns)
    changes(since = 0): {
      cursor: number
      changes: AgentChange[]
      truncated?: boolean
    } {
      assertLive('changes')
      // ONE scan for the whole drain: the per-path read used to rescan the
      // DOM for secret-bound controls on every entry, so a 200-path drain
      // did 200 querySelectorAlls to learn the same thing 200 times
      refreshSecretPaths()
      const seenPaths = new Set<string>()
      const coalesced: AgentChange[] = []
      for (let i = ledger.length - 1; i >= 0; i--) {
        const entry = ledger[i]
        if (entry.seq <= since) break
        if (entry.note != null) continue // audit notes are not state changes
        if (seenPaths.has(entry.path)) continue
        seenPaths.add(entry.path)
        // push + one reverse: unshift in a loop is O(n²) — a 10,000-path
        // drain measured 5.46ms against 0.25ms, for identical output
        coalesced.push({ path: entry.path, value: readScanned(entry.path) })
      }
      coalesced.reverse()
      // a drain that reaches past trimmed entries cannot claim completeness:
      // compare against the OLDEST entry still held, not a computed offset
      const oldestHeld = ledger.length > 0 ? ledger[0].seq : seq + 1
      const truncated = dropped > 0 && oldestHeld > since + 1
      return truncated
        ? { cursor: seq, changes: coalesced, truncated: true }
        : { cursor: seq, changes: coalesced }
    },

    log(): AgentLogEntry[] {
      // DELIBERATELY NOT GUARDED, like `version`. The natural incident flow
      // is "an agent did something alarming -> revoke -> read the ledger",
      // and `ledger` is closed over, so refusing here left no door at all.
      // A historical record grants no capability; withholding it only makes
      // a revoked surface unauditable at the moment you most want the audit.
      return ledger.slice()
    },

    version: surfaceVersion,

    disable(): void {
      // IDEMPOTENT. A second disable() used to throw out of unobserve —
      // after already unregistering WebMCP, so subscriptions, pending
      // when()s and the global were left behind. The documented reconfigure
      // flow (enableAgentInterface auto-disables the previous surface, then
      // the app calls its own cleanup) hit this every time.
      if (disabled) return
      disabled = true
      webmcpRegistration?.unregister()
      webmcpRegistration = undefined
      delete surface.webmcp
      unobserve(ledgerListener)
      for (const listener of subscriptions) unobserve(listener)
      subscriptions.clear()
      for (const pending of pendingWhens) {
        pending.reject(new Error('agent interface disabled'))
      }
      pendingWhens.clear()
      // delete OUR global, and only if it is still ours: a stale surface
      // must never remove the current one's (activeGlobalName was
      // module-level, so it did exactly that)
      if (
        myGlobalName != null &&
        (globalThis as any)[myGlobalName] === surface
      ) {
        delete (globalThis as any)[myGlobalName]
      }
      if (active === surface) active = undefined
    },
  }

  if (global !== false) {
    myGlobalName = typeof global === 'string' ? global : 'tosiAgent'
    ;(globalThis as any)[myGlobalName] = surface
  }
  // one call, whole surface: where the browser provides a model-context
  // host, the generated WebMCP tool set registers automatically (and a
  // re-enable or disable() unregisters it — where the host allows). The
  // tools are LATE-BOUND: they always talk to the currently active surface,
  // so on hosts without unregistration (Canary today) a re-enable can't
  // strand the browser's tools on a disabled surface.
  active = surface
  if (webmcp !== false) {
    // the delegate deliberately captures NOTHING but the module-level
    // `active` (registration happens after it's set, above): on hosts
    // without unregistration the browser's tools live forever, and a
    // `?? surface` fallback would pin the first (long-disabled) surface —
    // and its ledger — for the page's lifetime, then talk to the ghost.
    // Disabled means REFUSED, and dead surfaces get to be garbage.
    const live = (): AgentInterface => {
      if (active == null) {
        throw new Error('agent interface: disabled (no active surface)')
      }
      return active
    }
    const delegate: AgentInterface = {
      describe: (o) => live().describe(o),
      read: (path) => live().read(path),
      write: (path, value) => live().write(path, value),
      observe: (path, cb) => live().observe(path, cb),
      call: (path, ...args) => live().call(path, ...args),
      changes: (since) => live().changes(since),
      when: (path, predicate) => live().when(path, predicate),
      log: () => live().log(),
      disable: () => live().disable(),
      // the delegate must be interrogable too — a WebMCP consumer asking
      // tosi_surface gets the CURRENT surface's identity, not a snapshot
      get version() {
        return live().version
      },
    }
    webmcpRegistration = webmcpAdapter(
      delegate,
      typeof webmcp === 'object' ? webmcp : {}
    )
    if (webmcpRegistration != null) {
      surface.webmcp = { tools: webmcpRegistration.tools }
    }
  }
  return surface
}
