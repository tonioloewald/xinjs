/*{"parent": "One User Interface", "title": "Contract Harness", "description": "EXPERIMENTAL contract harness: exercise an agent surface's declared contract — schema examples must be accepted, counterexamples refused — through the real surface."}*/
/*#
# Contract Harness (EXPERIMENTAL)

If a contract carries **example values**, the contract is a test. This is the
contract equivalent of tjs-lang's signature tests: the declaration proves
itself by execution, and a declaration that feeds tests is load-bearing —
it breaks visibly when it lies.

    import { enableAgentInterface, exerciseContract } from 'tosijs'

    const agent = enableAgentInterface({
      expose: { roots, contract, write: true },
    })
    const report = exerciseContract(agent)
    // report.failed === 0, or report.trials says exactly what lied

Conventions read from each root's serialized contract (`describe().contract`):

- **`examples: [...]`** (standard JSON Schema keyword) — every example is
  WRITTEN through the real surface: it must be accepted, and it must
  round-trip (`read()` returns what was written — catching contracts the app
  itself violates, not just values the contract refuses).
- **`$counterexamples: [...]`** (our convention) — every one must be
  REFUSED by `write()`. A contract that never refuses anything isn't a
  contract; counterexamples prove the gate exists.

State is snapshotted per root and restored after each root's trials.

Future: richer exercise steps as custom properties (e.g. `$exercise`)
written in **AJS** — serializable like the schema, executable like a test,
sandboxable like neither `Function` nor `eval`. The contract file becomes
the whole conformance suite, shippable over the wire.

> **EXPERIMENTAL.** Ships alongside the agent surface; shapes may change.
*/
import {
  AgentInterface,
  ComponentMap,
  ComponentTestStep,
  isAgentRefusal,
} from './agent'
import { ownContract } from './contract-check'
import { updates } from './path-listener'

export interface ContractTrial {
  root: string
  kind: 'example' | 'counterexample'
  value: any
  passed: boolean
  error?: string
}

export interface ContractReport {
  passed: number
  failed: number
  trials: ContractTrial[]
}

// faithful structural equality — deliberately NOT JSON.stringify comparison,
// which normalizes Dates (via toJSON) on both sides and so hides exactly the
// serialization infidelity round-tripping exists to catch
const same = (a: any, b: any): boolean => {
  if (a === b) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a == null || b == null)
    return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  // only plain data survives the surface; anything fancier must be identical
  const plain = (x: any) =>
    x.constructor === Object || x.constructor === Array || x.constructor == null
  if (!plain(a) || !plain(b)) return false
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  return aKeys.every((key) => same(a[key], b[key]))
}

/**
 * Exercise every example and counterexample in the surface's declared
 * contract, through the surface itself. Pure over the public API — usable
 * from bun test, a doc fence, or an agent's own self-check.
 */
export const exerciseContract = (agent: AgentInterface): ContractReport => {
  const description = agent.describe()
  // ASK THE SURFACE WHETHER IT CAN WRITE, don't infer it from the posture
  // name: a manifest scopes sight, and is read-only until it says
  // `write: true`. Reading `exposure !== 'read-only'` assumed otherwise and
  // would have run a whole contract suite whose every trial was refused
  // before a contract ever ran — green, and meaningless.
  if (!description.writable) {
    throw new Error(
      'exerciseContract: this surface cannot write, so every write would be ' +
        'refused before any contract ran — the report would be green and ' +
        'meaningless. Enable a surface that can write: ' +
        'enableAgentInterface({ expose: "all" }) in dev, or a manifest ' +
        'covering the contracted roots with write: true.'
    )
  }
  const contract = description.contract ?? {}
  const trials: ContractTrial[] = []

  for (const [root, schema] of Object.entries(contract)) {
    const examples: any[] = (schema as any)?.examples ?? []
    const counterexamples: any[] = (schema as any)?.$counterexamples ?? []
    // a contracted root the surface cannot even READ is inconclusive, not a
    // crash mid-loop and not a pass
    let snapshot: any
    try {
      snapshot = agent.read(root)
    } catch (e) {
      trials.push({
        root,
        kind: 'example',
        value: undefined,
        passed: false,
        error:
          'inconclusive: the surface cannot read this contracted root (' +
          ((e as Error)?.message ?? '') +
          ') — nothing here was validated.',
      })
      continue
    }

    for (const value of examples) {
      let passed = true
      let error: string | undefined
      try {
        agent.write(root, value)
        const readBack = agent.read(root)
        if (!same(readBack, value)) {
          passed = false
          error = 'round-trip mismatch: read() returned a different value'
        }
      } catch (e) {
        passed = false
        error = `example rejected: ${(e as Error).message}`
      }
      trials.push({ root, kind: 'example', value, passed, error })
    }

    for (const value of counterexamples) {
      let passed = false
      let error: string | undefined
      try {
        agent.write(root, value)
        error = 'counterexample was ACCEPTED'
      } catch (e) {
        // NOT EVERY REFUSAL IS A CONTRACT REFUSAL. A read-only or
        // manifest-scoped surface refuses every write, so a contract with
        // only $counterexamples used to produce a fully green report from a
        // harness that had validated nothing at all.
        /*
         * ASK THE ERROR, DON'T READ IT.
         *
         * This matched the refusal's PROSE, which coupled a security gate to
         * its own wording. It broke as soon as 1.9.0 rewrote the messages: by
         * the re-review all three substrings were unreachable, and the refusal
         * that DOES fire — "is callable, not writable", thrown when a write
         * lands on or contains a declared action — matched none of them. So
         * `refusedBySurface` was false, the catch took the `passed = true`
         * branch, and a contract of nothing but `$counterexamples` returned a
         * green report having validated nothing. Exactly the outcome the
         * comment here was written to prevent.
         *
         * `tosiRefusal` is set by `agent.ts` at every refusal site and survives
         * message edits. The substrings stay as a fallback for a surface built
         * against an older tosijs, and are now covered by tests.
         */
        const message = (e as Error)?.message ?? ''
        const refusedBySurface =
          isAgentRefusal(e) ||
          message.includes('exposes nothing') ||
          message.includes('reading only') ||
          message.includes('not exposed') ||
          message.includes('is callable, not writable')
        if (refusedBySurface) {
          error =
            'inconclusive: the SURFACE refused this write before any ' +
            'contract ran (' +
            message +
            '). Exercise a surface that can write — expose: "all" or a ' +
            'manifest covering this root.'
        } else {
          passed = true // a genuine contract refusal is the pass
        }
      }
      trials.push({ root, kind: 'counterexample', value, passed, error })
    }

    if (snapshot !== undefined) {
      try {
        agent.write(root, snapshot)
      } catch (_e) {
        // a snapshot the contract itself refuses is a finding, not a crash —
        // it will already have surfaced as a failed example or in app tests
      }
    }
  }

  const failed = trials.filter((trial) => !trial.passed).length
  return { passed: trials.length - failed, failed, trials }
}

export interface ComponentTrial {
  claim: string
  passed: boolean
  error?: string
}

export interface ComponentReport {
  passed: number
  failed: number
  trials: ComponentTrial[]
}

/**
 * Exercise a CONNECTED component instance against its own `componentMap`
 * self-declaration (passed explicitly, or read from the instance's class):
 *
 * - every declared **part** must resolve inside the instance and match its
 *   declared tag — the map of parts to internal elements, verified live;
 * - every declared **method** must exist as a function;
 * - every **value example** must round-trip through the instance's `value`
 *   (faithful comparison — the same discipline as exerciseContract).
 *
 * The component equivalent of a signature test: the declaration that types
 * the parts, informs the agent, and documents the component is the same one
 * the harness executes.
 */
export const exerciseComponent = async (
  element: HTMLElement,
  map?: ComponentMap
): Promise<ComponentReport> => {
  // OWN static only — statics inherit through the prototype chain, and a
  // subclass must not silently wear its parent's claims
  const cls = element.constructor as any
  const declared: ComponentMap | undefined = map ?? ownContract(cls)
  const trials: ComponentTrial[] = []
  if (declared == null) {
    return {
      passed: 0,
      failed: 1,
      trials: [
        {
          claim: 'component declares a static contract',
          passed: false,
          error: 'no own static contract declared (and none passed in)',
        },
      ],
    }
  }

  const root = ((element as any).shadowRoot ?? element) as ParentNode
  // prefer the component's own parts proxy — its resolution is
  // ownership-correct (pre-hydration capture); a bare querySelector can
  // false-positive on a nested component's same-named part
  const resolvePart = (name: string): Element | null => {
    let found: Element | null = null
    if ((element as any).parts != null) {
      try {
        found = (element as any).parts[name] ?? null
      } catch {
        found = null // the proxy throws for parts it never owned
      }
    }
    return found ?? root.querySelector(`[part="${name}"]`)
  }

  for (const [name, tag] of Object.entries(declared.parts ?? {})) {
    const found = resolvePart(name)
    trials.push(
      found == null
        ? {
            claim: `part "${name}" resolves`,
            passed: false,
            error: 'declared part not found in the instance',
          }
        : found.tagName.toLowerCase() !== tag
        ? {
            claim: `part "${name}" is <${tag}>`,
            passed: false,
            error: `found <${found.tagName.toLowerCase()}>`,
          }
        : { claim: `part "${name}" resolves as <${tag}>`, passed: true }
    )
  }

  for (const name of Object.keys(declared.methods ?? {})) {
    const isFn = typeof (element as any)[name] === 'function'
    trials.push({
      claim: `method "${name}" exists`,
      passed: isFn,
      error: isFn ? undefined : `typeof is ${typeof (element as any)[name]}`,
    })
  }

  const valueExamples: any[] = (declared.value as any)?.examples ?? []
  if (valueExamples.length > 0) {
    const snapshot = (element as any).value
    // A HARNESS REPORTS; IT DOES NOT THROW. The assignment goes through the
    // component's value setter, which ENFORCES the contract — so an example
    // that violates the very contract declaring it made exerciseComponent
    // reject instead of returning a failed trial, and the restore below (then
    // outside the loop) never ran, leaving the component holding a probe
    // value. The `tests` loop further down already got this right.
    try {
      for (const example of valueExamples) {
        try {
          ;(element as any).value = example
        } catch (error) {
          trials.push({
            claim: `value example round-trips`,
            passed: false,
            error: `the component REFUSED its own declared example ${JSON.stringify(
              example
            )}: ${(error as Error).message}`,
          })
          continue
        }
        const back = (element as any).value
        trials.push(
          same(back, example)
            ? { claim: `value example round-trips`, passed: true }
            : {
                claim: `value example round-trips`,
                passed: false,
                error: `wrote ${JSON.stringify(example)}, read ${JSON.stringify(
                  back
                )}`,
              }
        )
      }
    } finally {
      ;(element as any).value = snapshot
    }
  }

  // observers settle via updates(); component renders queue on rAF — a step
  // assertion must wait for BOTH (the same discipline as the doc-test lane)
  const settle = async () => {
    await updates()
    if (typeof requestAnimationFrame === 'function') {
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
    }
  }

  // declared behavioral tests: serializable step scripts, run live, in
  // declared order (an array — order is explicit, never a map-key accident)
  for (const { name, steps } of declared.tests ?? []) {
    const snapshot = (element as any).value
    let error: string | undefined
    try {
      for (const step of steps as ComponentTestStep[]) {
        if (step.set != null) Object.assign(element, step.set)
        if (step.click != null) {
          const target = resolvePart(step.click)
          if (target == null) {
            throw new Error(`click target part "${step.click}" not found`)
          }
          ;(target as HTMLElement).click()
        }
        await settle()
        if (step.expect != null) {
          if (
            'value' in step.expect &&
            !same((element as any).value, step.expect.value)
          ) {
            throw new Error(
              `expected value ${JSON.stringify(
                step.expect.value
              )}, got ${JSON.stringify((element as any).value)}`
            )
          }
          for (const [part, text] of Object.entries(step.expect.text ?? {})) {
            const target = resolvePart(part)
            const actual = (target?.textContent ?? '').trim()
            if (actual !== text) {
              throw new Error(
                `expected part "${part}" text "${text}", got "${actual}"`
              )
            }
          }
        }
      }
    } catch (e) {
      error = (e as Error).message
    }
    ;(element as any).value = snapshot
    await settle()
    trials.push({ claim: `test "${name}"`, passed: error == null, error })
  }

  const failed = trials.filter((trial) => !trial.passed).length
  return { passed: trials.length - failed, failed, trials }
}
