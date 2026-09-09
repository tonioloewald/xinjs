/*{ "parent": "utilities", "description": "tosijs/agent — the agent surface, the schematic renderer, the contract harnesses and the accessibility audit, in one opt-in subpath." }*/
/*#
# tosijs/agent

Everything that describes an app to a *non-human* user, behind one door:

    import { enableAgentInterface } from 'tosijs/agent'

    // nothing is exposed until you say so
    const agent = enableAgentInterface({ expose: { roots: ['app'] } })
    agent.describe()                       // the affordance map

| export | what |
| --- | --- |
| `enableAgentInterface` | the surface: describe / read / write / observe / call / changes / when / log |
| `webmcpTools`, `webmcpAdapter` | the generated WebMCP tool set (auto-registered by `enableAgentInterface` where a host exists) |
| `schematicSVG`, `rasterizeSVG`, `boundsOf` | the map, drawn (from **tosijs-floorplan**, vendored) |
| `schematic` | the same map as DATA (boxes, legend, `note`) instead of an SVG string |
| `isInteractive`, `targetSizeFinding`, `TARGET_SIZE_DEFAULT` | the shared affordance rules, over a **`SchematicRecord` from `describe()` — not over a DOM element**. `isInteractive(someAnchor)` compiles in plain JS and is meaningless. |
| `auditAccessibility`, `auditFlags`, `contrastRatio` | findings over the map |
| `exerciseContract`, `exerciseComponent` | contracts as tests |

> ⚠️ **These are the RENDERER's answers, and `auditAccessibility()` deliberately
> differs from them in three places** — it ignores producer `flags`, exempts
> `0×0`, and treats a list-bound element carrying direct evidence as a control
> (tosijs-floorplan #7/#8/#9). So the exported rules do **not** reproduce the
> audit's verdict on those shapes; the adjustment (`auditView`) is private
> because it is a workaround, not API. Use `auditAccessibility()` if you want
> the audit's answer, and these if you want the drawing's.

**Why a subpath and not the main entry.** This is ~11 kB gzipped, and an app
that never describes itself should not carry it. Bundler users would shake
it out — but the IIFE (CDN, `<script>`, our own doc pages) cannot, and that
is the most-loaded artifact we publish. Keeping it here means the cost falls
only on consumers who opt in, and the default bundle stays roughly where
1.7.x left it.

`ComponentMap` (the `static contract` shape) is exported from **both**
`tosijs` and here: declaring a contract is a component-authoring act that
must not require importing the agent surface. It is type-only, so it costs
nothing either way.
*/
export {
  enableAgentInterface,
  isAgentRefusal,
  BOUND_TO_DOM,
  BOUND_TWO_WAY,
  AGENT_SURFACE_VERSION,
  AGENT_CAPABILITIES,
} from './agent'
export type {
  AgentInterface,
  AgentInterfaceOptions,
  AgentContract,
  AgentDescription,
  AgentWiringRecord,
  AgentLogEntry,
  AgentSurfaceVersion,
  AgentExpose,
  AgentRefusalKind,
  AgentRefusalError,
  // the declared parameter type of every verb, and of expose.roots /
  // expose.actions — a consumer wrapping the surface has to be able to name it
  AgentPathRef,
  AgentObserveRef,
  ComponentMap,
  ComponentTestStep,
} from './agent'
export { webmcpTools, webmcpAdapter } from './webmcp'
export type { WebMCPTool, WebMCPAdapterOptions } from './webmcp'
// THE SHARED AFFORDANCE RULES, reachable by a consumer (1.11.0). Adopting
// tosijs-floorplan 0.4.0 gave the audit and the renderer ONE definition of
// "can I act here" and "is this big enough" — but the definition stopped at
// this package's boundary, so a downstream wanting the same verdict had to
// re-implement it or install a second, independently-versioned copy of
// tosijs-floorplan. That is the duplication floorplan#4 closed, one level out.
//
// NB this list is EXPLICIT, and a symbol not named here reaches nobody (the
// 1.8.2 near-miss: renaming types silently REMOVED the old spellings from the
// public surface, invisible to our own tsc because our code had already
// moved). The types below are not optional decoration — they are named in the
// signatures above, and shipping a value whose parameter type is unreachable
// is exactly the defect 1.10.1 spent a release fixing.
export {
  schematicSVG,
  rasterizeSVG,
  boundsOf,
  schematic,
  isInteractive,
  targetSizeFinding,
  TARGET_SIZE_DEFAULT,
} from './schematic'
export type {
  SchematicOptions,
  SchematicBounds,
  SchematicRecord,
  SchematicDescription,
  SchematicResult,
  SchematicLegendEntry,
} from './schematic'
export { auditAccessibility, auditFlags, contrastRatio } from './audit'
export type {
  AuditReport,
  AuditFinding,
  AuditOptions,
  AuditSeverity,
} from './audit'
export { exerciseContract, exerciseComponent } from './contract'
export type {
  ContractReport,
  ContractTrial,
  ComponentReport,
  ComponentTrial,
} from './contract'
