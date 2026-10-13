# Plan & Prior Art

<!--{ "parent": "One User Interface", "order": 5, "description": "Phases 0–5, open questions, and the prior-art survey: WebMCP, the window, and the unclaimed tosijs delta." }-->

_Part of [One User Interface](/one-user-interface/) — what shipped, what
remains open, and why the window is real._

> **Where this stands at 1.8.0.** Phases 0–3 **shipped**: the surface, the
> contracts, the drawn map, and the browser bridge (registration _and_
> invocation verified in Chrome Canary; haltija ships a native tier that
> consumes `describe()` directly). Phases 4 and 5 are **not built** — they
> are recorded here as direction, and the pages say so. Every "shipped"
> below happened in a shipping browser or a real test lane, not on paper.
>
> The prior-art survey further down is the part worth reading even if you
> never use the agent surface: it is the only written comparison of the
> WebMCP landscape we know of, and it explains _why_ a framework-native
> map is a different thing from an automation adapter.

## The plan

| phase                     | status                                                                                                                                                                                                                                       |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 — prove it              | ✅ live demos on every page of this family                                                                                                                                                                                                   |
| 1 — the surface           | ✅ shipped in 1.8.0 (`tosijs/agent`)                                                                                                                                                                                                         |
| 2 — manifests + contracts | ✅ shipped — app, component **and** inline element contracts                                                                                                                                                                                 |
| 3 — the bridge            | ✅ shipped — WebMCP auto-registration; registration **and invocation** verified in Chrome Canary 153; haltija ships a native tier. Open: [haltija#16](https://github.com/tonioloewald/haltija/issues/16) bridge design, which 1.8.0 unblocks |
| 4 — distance              | ⬜ not built — design recorded below                                                                                                                                                                                                         |
| 5 — headless embodiment   | ⬜ not built — see [Headless Embodiment](/headless-embodiment/) for what _is_ real                                                                                                                                                           |

- **Phase 0 — prove it (no new code).** A doc-site demo: an "agent panel"
  drives the todo example through raw paths while the reader clicks the same
  UI. Two actors, one state, zero sync. **Done — and split across the family:**
  the proofs live as live examples in the [intro](/one-user-interface/)
  (two actors), [The Derived Surface](/derived-surface/) (describe()), and
  [Headless Embodiment](/headless-embodiment/) (elementsSSR) — the manifesto
  demonstrating its own thesis inline.
- **Phase 1 — the surface (introspection). Built** — `enableAgentInterface()`
  with `describe`/`read`/`write`/`observe`/`call`/`changes`/`when`/`log`,
  the `tosiAgent` global, manifest scoping (declared actions are _callable,
  not writable_), flat geometric records with arrow provenance, plus the
  downstream pure functions (`schematicSVG`/`rasterizeSVG`, `webmcpTools`).
  **Published** as the `tosijs/agent` subpath (the same file as `tosijs`
  with narrower types — a separately-bundled surface would carry its own
  copy of the state registry), marked EXPERIMENTAL like `tosijs/debug`, and
  omitted from the `<script>`/CDN build, which cannot tree-shake. Still open from the original scope:
  preconditions from enabled-bindings and item schemas from list templates
  (both land naturally with Phase 2's contracts).
- **Phase 2 — manifest + contracts.** **Core shipped** (2026-08-03): the
  zero-dependency contract seam (`expose.contract = { check, describe }`),
  `write()` enforcement with audited refusals, `describe().contract`
  ("what's legal"), and **`exerciseContract()`** — contracts carrying
  `examples` / `$counterexamples` are executable specs, the contract
  equivalent of tjs signature tests (see
  [The Agent Surface](/agent-surface/)). The blessed adapter now **ships
  FROM tosijs-schema** (1.5.0's `agentContract(schemas)`, closing
  tosijs-schema#2) — stricter than our hand-rolled original: it fails
  CLOSED on contracted writes without a proposal, and refuses at
  construction any schema keyword `validate` doesn't enforce; our suite
  runs against the published adapter and pins the proposal seam from this
  side (tosijs#25). **ComponentMap
  shipped** (2026-08-03): `static contract` (one word everywhere) = contract
  - description + test fixture + parts map in one declaration;
    `Component<typeof contract>` types `this.parts` from the declared tags —
    THE DECLARATION IS THE TYPE (classic PartsMap still accepted in the same
    slot); `describe()` harvests own-statics only; `exerciseComponent()`
    executes parts/methods/value-examples AND declared `tests` (serializable
    set/click/expect step scripts, updates()+rAF settled). Shipped tests
    travel with the contract; dev-only tests go to tjs `test {}` blocks
    (stripped) — the native-TJS bridge is a test block calling
    exerciseComponent(). initAttributes subsumption + value-setter enforcement
    BOTH shipped 2026-08-03 (contract.attributes with defaults drives the
    machinery, both-declared throws, nudge-warn toward the ideal; setter
    enforces declared value contracts — native type/enum/const subset +
    pluggable setContractValidator; no contract, no check). Sub-path schema
    routing shipped (2026-08-03): writes at/under a contracted root are judged
    as the whole root they would produce (proposal = clone + hypothetical
    apply; adapters validate roots, core owns paths). Remaining: the AJS
    `$exercise` future. Feeds directly
    into 2.0's `schematic` design rather than duplicating it. **Gate:** state-level validation is a hard prerequisite
    for production `write()` access (see [Trust](/trust-and-transports/)) — until this
    phase lands, production surfaces are read/observe/call-only. `agent.when(path, predicate)`
    — the episodic agent's await-a-condition primitive — **shipped early**
    (2026-08-01): immediate-satisfaction check, audit-logged waits invisible to
    the `changes()` drain, predicate errors reject, `disable()` rejects pending
    waits.
- **Phase 3 — the bridge.** **WebMCP adapter prototype shipped** (2026-08-02):
  `webmcpTools(agent)` generates the tool set pure from `describe()` (core
  quartet + one named tool per action; `tosi_write` dev-gated per Trust);
  `webmcpAdapter()` feature-detects the host and tolerates both registration
  shapes (`registerTool` / `provideContext`) while the spec churns — live
  proof in [The Agent Surface](/agent-surface/). **The real-agent e2e has
  RUN** (2026-08-02): haltija shipped `hj map` with a native `tosi-agent`
  source that returns `describe()` **verbatim** (its own decision — reshaping
  would be the lossy reconstruction the tier exists to avoid), and a live
  session drove this very page through the surface — `call('oneUI.addItem')`
  through a private headless haltija, observers fired, the human-facing list
  rendered the agent's item, the audit log recorded the act. No vision, no
  selectors, no synthesized input. **The WebMCP-host
  registration e2e is CONFIRMED** (2026-08-03, Chrome Canary with the WebMCP
  flags enabled): the live demo detected the host and registered the
  generated tool set — witnessed on the page's own self-report. **And the INVOCATION
  e2e is done** (2026-08-03, later that night): through Chrome Canary 153's
  shipped `document.modelContext` — `getTools()` listed our five (the
  quartet + `tosi_act_mcpDemo_addNote`, derived not authored), and
  `executeTool(tool, input)` ran the derived action through the browser's
  own execution path: state updated, the human-visible list rendered the
  item, the audit log recorded it. Wire contract learned live:
  `executeTool` takes the `RegisteredTool` OBJECT (not a name) and the
  input as a JSON **string**; `inputSchema` round-trips as a string too.
  Our `registerTool` path matched the shipped API exactly. Remaining: only
  the bridge-convergence answers on haltija#16.
- **Phase 4 — distance.** The `SyncTransport` MCP peer; AJS capability
  sandboxing for agent-submitted logic; lukko alignment.
- **Phase 5 — headless embodiment.** The DOM-free core (tosijs#18) running an
  app server-side as its abstract self; UI vended on demand via the prerender
  pipeline; humans and agents as co-equal session peers. This is the 2.0-era
  horizon — `schematic` (validated-from-birth state) plus #18 (no DOM at
  import) _are_ its prerequisites, and both are already on the roadmap.

Sequencing note: phases 0–1 are cheap and demonstrable now; 2 is where the
`schematic`/2.0 work and this plan become the same work; 3–4 are ecosystem
plays (file, don't fix — designs land as issues on haltija/tjs-lang/lukko);
5 is where the plan and tosijs 2.0 converge entirely.

### The empirical lane: LLM-in-the-loop tests (cross-cutting)

Every legibility claim in this plan — flat records beat nested, arrows beat
booleans, PNG schematic beats screenshot beats SVG source, glance-then-zoom
beats full-dump — is currently an _argument_. All of them are **measurable**:
give a model a task battery (find the affordance for X; which action changes
path Y; complete this flow) against each encoding of the same app (JSON map /
schematic PNG / raw screenshot / a11y tree), and score task success × token
cost × turns. Once tjs makes model calls stupidly easy, this becomes a test
lane like any other — sampled and budgeted rather than per-commit (models are
slow, priced, and flaky), but _regression-shaped_: _a change to `describe()`'s
shape gets a measured delta, not vibes._ The earlier design reviews kept
ending at "the remaining questions are empirical" — this is the lane where
they get answered. It doubles as the marketing evidence: "agents complete
tasks N× more reliably against the map than against pixels" is a claim with a
number in it.

**First number (haltija, 2026-08-02):** on a trivial page JSON wins outright
(an image's fixed cost dominates); on a **60-control app the JSON map is
~1,567 tokens — right at the crossover with an image's ~1,000–1,600 vision
tokens**. Above that density the rasterized schematic wins, exactly the
DeepSeek-OCR curve. So the encoding choice is itself density-dependent, which
the eval lane should treat as a variable, not a constant.

## Open questions

- **Naming — SETTLED (2026-08-01): `tosiAgent`.** Self-describing wins for a
  console-first affordance whose consumers include LLMs; "MCP" stays reserved
  for the adapter that speaks it. **`pöllö`** (the owl) is reserved for the
  **schematic viewer** when it becomes a tool — the owl's-eye view: sees the
  whole territory, in the dark, without rendering it.
- **Handler enumeration cost.** Data bindings are enumerable via `BOUND_CLASS`;
  event wiring is per-element (WeakMap probe during a tree walk on
  `describe()`). Fine on demand; if it ever needs to be live, the toggle can
  turn on a ledger — never a cost when disabled.
- **Element identity across the wire.** `describe()` needs stable element
  references for remote agents (in-page gets real elements). Candidates:
  generated selector, instanceId, or path-of-binding as the primary key.
- **`describe()` freshness.** Snapshot vs. live subscription to wiring changes
  (elements mount/unmount constantly in list bindings). Likely: snapshot +
  "wiring changed" notification, not a live graph.
- **Does the manifest belong in `tosi()` itself?** `tosi({...}, { expose })`
  would make exposure a property of _registration_ — arguably the most
  tosijs-shaped answer of all.
- **Is the map the whole truth?** Time travel, state diffing, and deterministic
  replay come free _if the map is the source of truth for state_. In tosijs the
  registry is the norm — but apps can and do hold state in closures the map
  only observes after the fact. Worth stating as a discipline ("state lives in
  the registry") the way zero-trust is stated as one, and worth `describe()`
  being honest about what it can't see.
- **Wake policy for episodic agents.** `when(path, predicate)` answers "sleep
  until the world reaches a named condition," but the general policy question
  remains: which changes justify spending an inference pass? Candidates:
  predicate-gated wake (`when`), coalesced drains on a cadence, priority
  paths declared in the manifest ("wake me for `app.order.*`, batch the
  rest"). Probably all three, declared per subscription.
- **Versioning the contract.** Once haltija tests and agent workflows script
  against the schema'd surface, its shape is a public API. What's contractual
  vs. incidental, and how the schema versions, should be decided _before_ fifty
  tests depend on the accidental shape — much cheaper than after.

## Prior art & the window — **all facts below are as of 2026-08-21**

<!-- as-of: 2026-08-21 | WebMCP spec + Chrome versions, who has shipped auto-exposure (Shopify/Cloudflare), competing derivation approaches, the five unclaimed-delta claims -->

> **This section is a snapshot, not a maintained page.** Everything in it —
> browser versions, who has shipped what, which competitor exists — is
> external state we do not control and cannot generate, so it is stamped
> rather than promised. **Do not read it as current; read it as dated.** If
> the date is old and the answer matters, re-survey and re-stamp. It has
> already moved twice: the first survey was 2026-07-28, three and a half weeks
> before this one, and one of the five claims below had to be rewritten in
> that gap.

- **WebMCP** (`document.modelContext`): a W3C WebML CG standard from Google +
  Microsoft, announced 2026-02-10; explainer first published August 2025,
  current Draft Community Group Report 2026-07-21. A **public origin trial in
  Chrome 149**; `navigator.modelContext` deprecated in Chrome 150 in favour of
  `document.modelContext`; **Chrome 153** withdraws a tool without cancelling
  in-flight executions. A page-registers-tools API.
- **Unregistration** is `registerTool(tool, { signal })` + `controller.abort()`.
  Worth stating because we got it wrong: our adapter probed for a returned
  handle and for `unregisterTool`, found neither, and inferred the capability
  was missing — shipping register-once semantics and revoke-by-refusing-stub to
  compensate for a gap that did not exist. Now feature-probed and used.
- **Platform auto-exposure, from the platform layer.** Shopify switched WebMCP
  on for every Liquid storefront (Hydrogen in developer preview) on 2026-08-05
  — catalog, cart, checkout, policy lookup, no merchant asked, opt out with
  `webMcp={false}`. Cloudflare followed on 08-06: any site behind Cloudflare,
  dashboard toggle, no redeploy. Read the mechanism before reading the threat:
  Cloudflare ships **two pre-defined tool packs** (Content Credentials, and a
  proxy to an existing server-side MCP server), Shopify ships **commerce
  primitives it already knows**. Neither derives anything from _your_ app.
- **A declarative HTML API synthesizes tools from `<form>`s** — annotate with
  `toolname` / `tooldescription` / `toolparamdescription` and the browser
  builds the tool. Forms only, and annotation is still declaration, but it is
  the first standards-track derivation.
- **`webmcp-core`** (keak-ai): a **build-time Playwright crawler** — BFS the
  site, snapshot the DOM, record network calls, cluster them into tools, emit
  TS/React/HTML/JSON, across Next/React/Vue/Svelte/Astro/Shopify. The closest
  thing to "derived", and its epistemic position is the point: it
  **reconstructs** intent from rendered output, exactly like a11y-tree
  scraping, moved to build time. Unannotated forms are guessed at from
  `aria-label` / `<label>` / headings.
- **Framework integrations, hand-registered per tool:** `@mcp-b/react-webmcp`
  (a hook per tool, Zod schemas by hand); GoogleChromeLabs `use-webmcp-tool`.
  Angular's is `provideExperimentalWebMcpTools()`, experimental across all
  versions ("APIs are subject to change even outside of major versions").
  Signal Forms auto-derive a JSON schema from the form's data model — **per
  form, on opt-in** via `experimentalWebMcpTool`. The most interesting prior
  art, and still scoped to forms.
- **Playwright MCP / Operator / Computer Use / Mariner:** a11y-tree + vision +
  synthesized input, impersonating the human user. **Scope honesty:** their
  value is working on _arbitrary_ sites. This plan doesn't do that for free; it
  makes it unnecessary for apps you control. One external datum argues our
  side: accessibility surveys in 2026 report the structure agents depend on
  getting worse for the first time in six years — a11y-tree scraping is
  building on subsiding ground.
- **Phoenix LiveView / Hotwire:** real prior art for the inversion (app lives
  server-side, DOM is a projection) — but opaque process state, no agent
  interface, one embodiment.
- **HATEOAS / hypermedia:** the philosophical ancestor of `describe()` — the
  interface advertising its own affordances — done for REST twenty years early.
- **llms.txt:** static self-description for sites (we ship it); the agent
  surface is its runtime sibling.

**What remains unclaimed — the tosijs delta:**

1. **State, not just tools.** The spec confirms it: WebMCP is tools-only, with
   no MCP `resources` and no readable/writable state. Its own open questions
   list multimodal I/O, `outputSchema` and service workers — state is not among
   them. Nobody exposes a path-addressable, writable, observable model.
2. **Derived from records you already hold — not declared, annotated, packed or
   crawled.** The blunt version of this claim ("everyone hand-registers") died
   between the two surveys, and the replacement is sharper. The question is
   _where the knowledge comes from_:
   - platform packs (Shopify, Cloudflare) know **their** domain, not your app;
   - the declarative API and Angular's Signal Forms derive from **a declaration
     written for that purpose** — an attribute, an opt-in flag — and only for
     forms;
   - crawlers and a11y-tree agents **reconstruct** intent from rendered output:
     a guess, however good, that decays as markup does;
   - tosijs **reads records it already holds**, because it created the
     bindings. Not a guess, not an annotation, not a pack — and still nobody
     else's claim, because no other mainstream framework has a wiring record to
     read.
3. **One-truth propagation.** An agent write updates the human's UI because
   both observe the same registry. Every integration surveyed routes through a
   tool `execute()` and relies on the author to remember to sync.
4. **Push observation.** The only event in the API is `toolchange` — the _tool
   list_ changed, not the _state_. `observe(path)` remains a channel nobody
   offers.
5. **Embodiment independence.** Headless app + vended UI has no equivalent in
   the agent-web space.

**On the curb-cut framing itself:** it is no longer novel — the a11y tree as
the thing agents read is now a mainstream observation, down to a W3C CG
document disambiguating "WAI-ARIA" from "Agent-ARIA". Claim the **mechanism**,
not the metaphor. What is ours is that the surface is derived from the
framework's own records and therefore **prosecutes** a11y defects rather than
absorbing them — `auditAccessibility` over the same map, `contract.role` and
`description` materializing as real ARIA. An integration absorbs discrepancies;
an intrinsic surface prosecutes them.

**The axis that actually separates these approaches: is the agent surface a
SECOND ARTIFACT, or a facet of the one you already maintain?**

Ordering the field by _where the knowledge comes from_ is useful but incomplete
— it invites an argument about whose intent counts. The sharper question is
what the surface **costs to keep true**, and it sorts everything cleanly:

|                                            | where knowledge comes from                                           | what it costs to keep true                                                        |
| ------------------------------------------ | -------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| a11y-tree agents, crawlers (`webmcp-core`) | reconstructed from rendered output                                   | nothing to maintain, because it is a **guess** — and it decays as the markup does |
| platform packs (Cloudflare)                | a pre-built library, bolted on at the edge                           | maintained by the platform, knows nothing about your app                          |
| platform-as-API-consumer (Shopify)         | the platform's **own** domain model — real knowledge, well used      | a **separate thing**, built and maintained beside the app                         |
| declarative form API, Angular Signal Forms | a declaration you wrote **for that purpose**                         | a second declaration per form, kept in step by hand                               |
| tosijs                                     | records the framework already holds, because it created the bindings | **nothing** — it is a projection of the one truth                                 |

Shopify is the instructive case, and the one that would be easy to
mis-characterise. It is not post-hoc scraping: they are a **leaf-node API
consumer** exposing their own commerce surface, and they have the information
to do that part _well_ — better names, better descriptions, more stable across
a merchant's refactors than anything derived could be. **For a fixed, known
domain, a curated pack beats a derived surface**, and it is worth conceding
that plainly.

What it is not is a **discipline** — nothing about it generalises to the next
app, because the next app is not a storefront. And it is not a **free facet of
a single source of truth**: it is a second artifact, so it can drift from the
app it describes, and it covers exactly what somebody decided to cover. A
customised storefront whose checkout no longer behaves like the pack says still
publishes the pack. Better than post-hoc, and a long way from a surface that
cannot lie about the wiring because it _is_ the wiring.

**This is the documentation problem wearing different clothes.** The house rule
for docs is: don't promise to keep a second copy in step — delete it and
generate it from the first (see `tosijs-coding-practices` →
`documentation-surface.md`). An agent surface is the same shape. Every approach
above except the last maintains a second description of the app, by hand or by
platform, and inherits the drift that guarantees. Ours is generated from the
wiring, which means the failure mode is not "the description went stale" but
"the app stopped working" — and that is a failure someone notices.

Two consequences follow structurally, not from being ahead:

- **Consumption-level decays; intention-level cannot.** Anything downstream of
  rendered output rests on an artifact that is, by the 2026 accessibility
  surveys, getting _worse_ for the first time in six years. Records read from
  bindings cannot drift from the app, because the app stops working if they do.
- **Only intention-level can PROSECUTE defects.** A scraper inherits whatever
  a11y sins the DOM contains; it has nothing to compare them against. Holding
  both sides — declared intent (contract, binding, role) and realised output
  (the DOM) — is what makes `auditAccessibility` possible at all, and it is
  structurally unavailable to anything reading only the output. This is the
  whole content of "an integration absorbs discrepancies, an intrinsic surface
  prosecutes them", and it is the curb-cut claim in its strongest form: not
  "we thought of accessibility too", but _the mechanism that serves agents is
  the mechanism that finds the a11y bugs._

**Strategic consequence.** Targeting WebMCP first was right and is now clearly
right — a real origin trial with default-on deployments, not a proposal. But
the window narrowed: "derived agent surface" is being approached from the
platform layer, the markup layer and the crawler layer at once. None of them
reach the app's own records, and that is the defensible ground — so the framing
to ship is _derived from what the framework already knows_, contrasted
explicitly against packs, annotations and crawls. The parts nobody is near —
**state, propagation, observation, embodiment** — are the durable delta, and
they are where the next phase should spend.
