# webmcp (EXPERIMENTAL)

The [WebMCP](https://github.com/webmachinelearning/webmcp) standard (`document.modelContext` — `navigator.modelContext` is
deprecated as of Chrome 150, and this adapter still probes it) lets a
page expose typed, callable **tools** to browser agents — but every existing
integration hand-writes those tools. tosijs doesn't have to: the agent surface
already knows the app's state roots, wiring, and actions, so **the tool set is
generated, not authored**.

    import { enableAgentInterface, webmcpAdapter } from 'tosijs'

    // declare what the tools may reach — a bare enableAgentInterface() is
    // closed, so the generated tools would refuse every path
    const agent = enableAgentInterface({ expose: { roots: ['app'] } })
    const mcp = webmcpAdapter(agent) // detect, generate, register
    // …
    mcp?.unregister()

Two layers, split like `schematicSVG`:

- **`webmcpTools(agent)`** — pure: returns the tool definitions
  (`{ name, description, inputSchema, execute }`) derived from `describe()`.
  Test it, print it, hand it to any MCP-shaped host — no browser API needed.
- **`webmcpAdapter(agent, options)`** — feature-detects the runtime
  (`document.modelContext` first, then `navigator.modelContext`, or an
  injected `options.modelContext`), registers the tools through whichever
  registration shape the host offers (`registerTool` per tool, or
  `provideContext({ tools })` as a batch), and returns `{ tools, unregister }`
  — or `undefined` when no host API exists (callers feature-detect by result).

The generated set:

| tool | does |
| --- | --- |
| `tosi_describe` | the live affordance map — start here |
| `tosi_surface` | what this surface IS: version + capabilities |
| `tosi_read` | serializable value at a path — **scoped surfaces only** |
| `tosi_changes` | turn drain: final-value-per-path since your cursor — **scoped surfaces only** |
| `tosi_act_<path>` | one **named** tool per discovered/declared action |
| `tosi_write` | direct state writes — **dev-gated** (see below) |

`tosi_write` registers only with an explicit `allowWrites: true`: an
unvalidated write tool is an RPC endpoint with good documentation.

`tosi_read` and `tosi_changes` register only once the surface says what it
exposes — `expose: { roots: [...] }` or `expose: 'all'` — or with an
explicit `allowReads: true`. Since 1.9.0 the no-options default is **closed**
— it exposes nothing, so those two tools would have nothing to read — and
before that it was read-only over the *whole registry*, which a browser agent
(a different principal) should not receive as a side effect of one
unargumented call. The introspection tools still register in every posture:
they report the shape of the surface, not its contents.

Tool names are global to the page. Where another script (or a second
surface) already owns `tosi_*`, pass a distinct `prefix` — the adapter
reports any generated tool the host did not take as a `console.error`,
because a name you didn't get is a name an agent will reach *someone else*
through.

> **EXPERIMENTAL.** The WebMCP spec is churning; the adapter is deliberately
> tolerant of both registration shapes and takes an injected host for tests.
