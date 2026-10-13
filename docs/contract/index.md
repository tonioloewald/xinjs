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
