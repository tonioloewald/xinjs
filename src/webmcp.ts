/*{"parent": "One User Interface", "title": "WebMCP", "description": "EXPERIMENTAL WebMCP adapter: generate the browser-agent tool set from the agent surface — the tools write themselves from wiring the app already records."}*/
/*#
# WebMCP (EXPERIMENTAL)

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
*/
// type-only: keeps this module import-free at runtime, so agent.ts can
// import the adapter for auto-registration without a module cycle
import type { AgentInterface } from './agent'

export interface WebMCPTool {
  name: string
  description: string
  inputSchema: Record<string, any>
  execute: (input: Record<string, any>) => any
}

export interface WebMCPAdapterOptions {
  /** explicit host (tests, or a future relocation of the API) */
  modelContext?: any
  /** register tosi_write even outside `expose: 'all'` (default false) */
  allowWrites?: boolean
  /** register tosi_read / tosi_changes on a CLOSED surface (default false).
   * Rarely what you want since 1.9.0: a closed surface exposes nothing, so
   * the published tools refuse every path. Declare `expose: { roots }`
   * instead — that publishes them AND gives them something to read. */
  allowReads?: boolean
  /** tool-name prefix (default 'tosi') — namespace this surface when the
   * page carries more than one, or when another script owns the plain names */
  prefix?: string
}

const toolName = (prefix: string, ...parts: string[]): string =>
  [prefix, ...parts].join('_').replace(/[^A-Za-z0-9_]/g, '_')

/**
 * Generate the WebMCP tool set from the agent surface — pure; derives
 * everything from describe() and closes over the agent for execution.
 */
export const webmcpTools = (
  agent: AgentInterface,
  options: WebMCPAdapterOptions = {}
): WebMCPTool[] => {
  const { prefix = 'tosi', allowWrites = false, allowReads = false } = options
  const description = agent.describe()
  const tools: WebMCPTool[] = [
    {
      name: toolName(prefix, 'describe'),
      description:
        "The app's live affordance map: state roots, wired elements (flat " +
        'records — tag/label/text, bound props as "value ⟷ path" where ⟷ ' +
        'means two-way/user-writable and ⟵ means display-only), named ' +
        'actions, and per-element geometry (bounds). Start here.',
      inputSchema: {
        type: 'object',
        properties: { styles: { type: 'boolean' } },
      },
      execute: (input) => agent.describe({ styles: input?.styles === true }),
    },
    {
      name: toolName(prefix, 'surface'),
      description:
        'What this agent surface IS: shape-contract version, tosijs ' +
        'version, and enumerable capabilities. Ask before assuming — a ' +
        'consumer that checks capabilities degrades honestly instead of ' +
        'rendering a confident blank.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => agent.version,
    },
  ]
  // DECLARED SCOPE, OR EXPLICIT CONSENT — the same gate as tosi_write, for
  // the same reason. 'closed' is the no-options default, and until 1.9.0 it
  // was ALSO the widest read the surface had: with no manifest, inScope()
  // was unconditionally true, so these two tools published the ENTIRE
  // registry (and, via changes(), every value that settles in it) to a
  // model-context host — a different principal — on the strength of one
  // unargumented call. The default is now empty, so this gate is belt and
  // braces rather than the only thing standing there; it stays because
  // `allowReads` can still open it.
  const canRead = description.exposure !== 'closed' || allowReads
  if (canRead) {
    tools.push(
      {
        name: toolName(prefix, 'read'),
        description:
          'Read the serializable value at a state path (paths come from ' +
          `${toolName(prefix, 'describe')}).`,
        inputSchema: {
          type: 'object',
          properties: { path: { type: 'string' } },
          required: ['path'],
        },
        execute: (input) => agent.read(String(input?.path)),
      },
      {
        name: toolName(prefix, 'changes'),
        description:
          'Everything that changed since your last turn, coalesced to ' +
          'final-value-per-path. Pass the cursor from your previous call; ' +
          'the response includes the next cursor.',
        inputSchema: {
          type: 'object',
          properties: { since: { type: 'number' } },
        },
        execute: (input) => agent.changes(Number(input?.since ?? 0)),
      }
    )
  }
  // Only advertise what the surface will actually execute. A read-only
  // surface used to publish one tosi_act_* tool per discovered function —
  // a menu of the whole app where every item throws on invocation.
  const canAct = description.exposure !== 'closed'
  const actionNames = new Set<string>()
  for (const actionPath of canAct ? description.actions : []) {
    // toolName collapses every non-alphanumeric char, so `app.do.thing` and
    // `app.do_thing` both become tosi_act_app_do_thing. Disambiguate rather
    // than silently registering one tool for two actions.
    let name = toolName(prefix, 'act', actionPath)
    if (actionNames.has(name)) {
      let n = 2
      while (actionNames.has(`${name}_${n}`)) n++
      name = `${name}_${n}`
    }
    actionNames.add(name)
    tools.push({
      name,
      description:
        `Invoke the app action \`${actionPath}\` — the same function the ` +
        'UI is wired to. Arguments are passed through positionally.',
      inputSchema: {
        type: 'object',
        properties: { args: { type: 'array' } },
      },
      execute: (input) =>
        agent.call(actionPath, ...((input?.args as any[]) ?? [])),
    })
  }
  // EXPLICIT CONSENT ONLY. This used to register whenever the surface was
  // in introspection mode, i.e. by default — publishing an unvalidated
  // write endpoint to the browser's tool registry without anyone asking.
  if (allowWrites) {
    tools.push({
      name: toolName(prefix, 'write'),
      description:
        'Write a value to a state path — it flows through the same ' +
        'observers as user input, so every bound widget updates. A write ' +
        'to a path the app has contracted is validated, and a refusal ' +
        'names the reason so you can correct it; a write to an ' +
        'uncontracted path is applied as given.',
      inputSchema: {
        type: 'object',
        properties: { path: { type: 'string' }, value: {} },
        required: ['path'],
      },
      execute: (input) => {
        agent.write(String(input?.path), input?.value)
        return { written: input?.path }
      },
    })
  }
  return tools
}

/** what a host with no unregistration path is holding on our behalf */
interface HostRegistrations {
  /** names WE put there and cannot take back — live, ours, reportable */
  ours: Set<string>
  /** names the host refused as already-taken — SOMEONE ELSE'S tools */
  foreign: Set<string>
}

// hosts that provide NO unregistration path (no handle.unregister, no
// unregisterTool, and ignoring the { signal } option) get REGISTER-ONCE
// semantics per tool name: re-registering a held name is a console error on
// the host side and would strand a stale closure on ours. Skip names the
// host already holds — paired with enableAgentInterface's live-bound
// delegate, the existing registration already talks to the current surface.
// The two sets MUST stay distinct: `ours` is callable and belongs in the
// receipt, `foreign` is a name we lost to another script and must never be
// claimed — one set conflated "registered" with "refused as a duplicate".
const registeredOnHost: WeakMap<object, HostRegistrations> = new WeakMap()

const hostRegistrations = (mc: object): HostRegistrations => {
  let held = registeredOnHost.get(mc)
  if (held == null) {
    held = { ours: new Set(), foreign: new Set() }
    registeredOnHost.set(mc, held)
  }
  return held
}

/**
 * Does this host honour `registerTool(tool, { signal })`?
 *
 * There is no capability flag to read, and guessing wrong in either direction
 * is bad: assume support and revocation silently does nothing; assume none and
 * we stub tools on a host that would have withdrawn them properly. So ASK the
 * host — register a throwaway tool with an aborted-able signal, abort it, and
 * see whether the name disappears from getTools(). Done once per host and
 * cached, because it costs a registration.
 *
 * A host that cannot answer (no getTools, or it throws) is treated as NOT
 * supporting it — the conservative direction, since the fallback still works.
 */
const abortSupport = new WeakMap<object, boolean>()

function supportsAbortSignal(mc: any): boolean {
  const known = abortSupport.get(mc)
  if (known !== undefined) return known
  let supported = false
  try {
    if (
      typeof AbortController === 'function' &&
      typeof mc.getTools === 'function'
    ) {
      const probeName = 'tosi__abort_probe'
      const controller = new AbortController()
      mc.registerTool(
        {
          name: probeName,
          description: 'capability probe; ignore',
          inputSchema: { type: 'object', properties: {} },
          execute: async () => 'probe',
        },
        { signal: controller.signal }
      )
      controller.abort()
      const names = (mc.getTools() ?? []).map((t: any) => t?.name)
      supported = !names.includes(probeName)
    }
  } catch (_e) {
    supported = false
  }
  abortSupport.set(mc, supported)
  return supported
}

/**
 * Best-effort revocation on a host with no unregisterTool: overwrite the
 * name with a stub that refuses and says why. A register-once host rejects
 * the overwrite — and then the ORIGINAL tool is still callable, so the only
 * honest move left is to say so loudly. Quietly dropping the name would
 * make "revoked" mean "still there, just unlisted".
 */
const revokeOnHost = (
  mc: any,
  held: HostRegistrations,
  name: string,
  why: string
): void => {
  try {
    mc.registerTool({
      name,
      description:
        `REVOKED by tosijs — ${why}. This tool does nothing; it is listed ` +
        'only because this host provides no way to withdraw a tool.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => {
        throw new Error(`tosijs webmcp: "${name}" was revoked — ${why}`)
      },
    })
    held.ours.delete(name)
  } catch (error) {
    console.error(
      `tosijs webmcp: CANNOT REVOKE "${name}" — ${why}, but this host has ` +
        'no unregisterTool and refused the overwrite, so the tool stays ' +
        'callable. It is late-bound to the current surface, which will ' +
        'refuse whatever the current posture disallows.',
      error
    )
  }
}

/**
 * Detect the WebMCP host, register the generated tools, return
 * { tools, unregister } — or undefined when no host API is present.
 */
export const webmcpAdapter = (
  agent: AgentInterface,
  options: WebMCPAdapterOptions = {}
): { tools: string[]; unregister: () => void } | undefined => {
  const mc =
    options.modelContext ??
    (globalThis as any).document?.modelContext ??
    (globalThis as any).navigator?.modelContext
  if (mc == null) return undefined

  const tools = webmcpTools(agent, options)
  const namespace = `${toolName(options.prefix ?? 'tosi')}_`
  const undo: Array<() => void> = []
  /** names the host is holding FOR US — the receipt must not claim more */
  const registered: string[] = []
  if (typeof mc.registerTool === 'function') {
    const held = hostRegistrations(mc)
    const publishing = new Set(tools.map((tool) => tool.name))
    // NARROWING IS REVOCATION. Re-enabling with a tighter posture (dropping
    // tosi_write, or reads via the read gate) left the previous
    // registration live on a host that cannot unregister — the tool an
    // author believes they revoked is still in the agent's menu. Restricted
    // to our own namespace: another surface's prefix is not ours to stub.
    for (const name of [...held.ours]) {
      if (publishing.has(name) || !name.startsWith(namespace)) continue
      revokeOnHost(mc, held, name, 'this surface no longer publishes it')
    }
    for (const tool of tools) {
      if (held.ours.has(tool.name)) {
        // live from an earlier registration, and late-bound to the current
        // surface — so it IS callable through this surface and belongs in
        // the receipt. Skipping it made agent.webmcp.tools under-report
        // exactly the tools nobody can take back.
        registered.push(tool.name)
        continue
      }
      if (held.foreign.has(tool.name)) continue // lost to another script
      const canUnregister = typeof mc.unregisterTool === 'function'
      try {
        // ABORTSIGNAL IS THE SHAPE CHROME ACTUALLY SHIPPED, and we were not
        // asking for it. `registerTool(tool, { signal })` + `controller.abort()`
        // is the spec's unregistration path (and since Chrome 153 it withdraws
        // a tool without cancelling in-flight executions). We probed only for a
        // returned handle and for `unregisterTool`, found neither, and fell
        // through to remembering the name as unrevocable — so on the one
        // browser that shipped WebMCP, every revocation was best-effort
        // stubbing when real revocation was available.
        //
        // Feature-detected rather than assumed: a host that ignores the
        // options argument simply never fires the abort, and the checks below
        // still apply. AbortController is not universal in the exotic
        // environments this adapter tolerates, hence the typeof guard.
        const controller =
          typeof AbortController === 'function'
            ? new AbortController()
            : undefined
        const handle = controller
          ? mc.registerTool(tool, { signal: controller.signal })
          : mc.registerTool(tool)
        if (handle != null && typeof handle.unregister === 'function') {
          undo.push(() => handle.unregister())
        } else if (canUnregister) {
          undo.push(() => mc.unregisterTool(tool.name))
        } else if (controller != null && supportsAbortSignal(mc)) {
          undo.push(() => controller.abort())
        } else {
          held.ours.add(tool.name) // no way back: remember it's registered
        }
        registered.push(tool.name)
      } catch (error) {
        // A FAILURE IS NOT A REGISTRATION. This used to mark every failure
        // as "the host already holds this name", so a rejected schema or a
        // transient error produced a RECEIPT CLAIMING A TOOL THE HOST NEVER
        // RECEIVED — and on a host that supports unregistration, one
        // transient failure blacklisted the name for its lifetime.
        const duplicate = /already|exist|duplicate|registered/i.test(
          String((error as Error)?.message ?? '')
        )
        if (duplicate && !canUnregister) held.foreign.add(tool.name)
        console.warn(
          `tosijs webmcp: the host refused "${tool.name}" — it is NOT in ` +
            "this surface's tool list.",
          error
        )
      }
    }
  } else if (typeof mc.provideContext === 'function') {
    // NOTE: provideContext replaces the page's whole tool context — if the
    // app also registers its own tools this way, coordinate registration in
    // one place (or use a registerTool-shaped host)
    mc.provideContext({ tools })
    // the batch call has no per-tool result: it replaces the context
    // wholesale, so the set IS the receipt
    for (const tool of tools) registered.push(tool.name)
    undo.push(() => mc.provideContext({ tools: [] }))
  } else {
    return undefined
  }
  // A NAME YOU DIDN'T GET IS A NAME AN AGENT REACHES SOMEONE ELSE THROUGH.
  // Tool names are page-global and unnamespaced by default, so a script
  // that registers `tosi_read` first keeps it — and the per-tool warning
  // above reads as routine host chatter. The mismatch between what this
  // surface generated and what the host is holding for it is the one
  // signal worth interrupting for.
  const missing = tools
    .map((tool) => tool.name)
    .filter((name) => !registered.includes(name))
  if (missing.length > 0) {
    console.error(
      `tosijs webmcp: the host is NOT holding ${missing.length} of this ` +
        `surface's tools: ${missing.join(', ')}. Either another script ` +
        'registered those names first — in which case an agent calling ' +
        'them reaches THAT script, not tosijs — or the host rejected ' +
        'them. Pass a distinct `prefix` to namespace this surface.'
    )
  }
  return {
    tools: registered,
    // NOTE: names in `ours` are deliberately NOT forgotten here. On a host
    // with no unregistration path they are still live and still late-bound;
    // forgetting them would make the next enableAgentInterface() re-attempt
    // them, collect the host's duplicate refusal, and file its own tools as
    // foreign. Revocation happens where the new posture is known — the
    // narrowing pass above — not on the way out.
    unregister: () => {
      for (const fn of undo) fn()
      undo.length = 0
    },
  }
}
