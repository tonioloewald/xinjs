/*{"parent": "One User Interface", "description": "shared zero-dependency contract validation: the structural JSON-Schema subset (type/enum/const) plus the pluggable full-schema validator, used by component value contracts and inline element contracts alike."}*/
/*#
# Contract Validation

Contracts (a component's `static contract`, an element's inline `contract`)
are enforced by one gate, shared by every declaration site. The gate is two
layers:

1. the **built-in structural subset** — `type`, `enum`, `const`. Zero
   dependencies, always on, covers the common case.
2. an optional **full schema engine** you register. Everything else a schema
   can say (`required`, `minimum`, `pattern`, `items`, …) is inert until you
   plug one in — tosijs warns once per unenforceable keyword set so a
   contract never quietly means less than it says.

    import { setContractValidator, getContractValidator } from 'tosijs'
    import { validate } from 'tosijs-schema'

    setContractValidator((value, schema) =>
      validate(value, schema) ? true : new Error('schema violation')
    )

A validator returns `true` or an `Error` whose `message` becomes the
violation reason.

## The plug is a security boundary

It is process-global: whoever calls it last decides what "valid" means for
the whole app — including code you did not write but did bundle. So:

- **Replacing an installed validator warns**, loudly, naming what was
  swapped for what. Removing one (`setContractValidator(null)`) warns too:
  uninstalling enforcement is the same event wearing a different hat.
- **`getContractValidator()`** reads back what is actually installed, so an
  app, a test, or an audit can assert on it rather than assume.
- **`setContractValidator(validate, { final: true })`** locks it: any later
  attempt to replace or remove it **throws** instead of warning. Lock in
  your own startup path and no dependency can downgrade you afterwards.

Re-registering the *same* function is a no-op (a module evaluated twice, or
hot reload, must not trip the lock).

> The built-in subset keeps running whatever happens here, so the worst a
> hostile replacement can do is a downgrade, not a bypass.
*/

/**
 * A class's OWN `static contract`, or undefined.
 *
 * OWN, not inherited, and that is the whole point: `static` members reach a
 * subclass through the prototype chain, so `class Fancy extends Counter {}`
 * would otherwise silently wear Counter's claims — its parts map, its value
 * schema, its declared tests — and then fail them, or worse, pass them while
 * describing something it is not. The same reasoning that made
 * `_elementCreator` an own-property check.
 *
 * This was copy-pasted at six sites across four modules, with the rationale
 * re-written at four of them and the sites already differing in what they did
 * next. Callers that want a fallback (the agent surface's post-hoc
 * `components[tag]` map, `makeComponent`'s spec-level fill) layer it on top of
 * this, deliberately and visibly.
 */
export const ownContract = (cls: any): any =>
  cls != null && Object.prototype.hasOwnProperty.call(cls, 'contract')
    ? cls.contract
    : undefined

export type ContractValidator = (
  value: any,
  schema: Record<string, any>
) => true | Error

export interface SetContractValidatorOptions {
  /** later replacement (or removal) throws instead of warning */
  final?: boolean
}

// full-schema validation is pluggable (the setPredicateEvaluator idiom —
// tosijs stays zero-dep); until one is registered, the native structural
// subset below (type / enum / const) still enforces
let contractValidator: ContractValidator | null = null
// set by { final: true }: the app has claimed this decision, so a later
// caller (a dependency, an injected script) cannot silently take it back
let validatorIsFinal = false
const replacementWarned = new Set<string>()

const nameValidator = (validator: ContractValidator | null): string =>
  validator == null
    ? 'none'
    : validator.name !== ''
    ? `${validator.name}()`
    : 'an anonymous function'

/**
 * Register the full-schema engine — or `null` to remove it.
 *
 * This is process-global and last-writer-wins, which is why replacement is
 * announced: one line anywhere in the bundle changes what every contract in
 * the app means. Pass `{ final: true }` to make later replacement throw.
 */
export function setContractValidator(
  validator: ContractValidator | null,
  options?: SetContractValidatorOptions
): void {
  if (validator === contractValidator) {
    // idempotent re-registration must not trip the lock — the same module
    // can evaluate twice (dual bundles, hot reload) with nothing changing
    if (options?.final === true) validatorIsFinal = true
    return
  }
  if (validatorIsFinal) {
    throw new Error(
      `tosijs contracts: the schema validator is FINAL (${nameValidator(
        contractValidator
      )}) and cannot be replaced — something tried to install ${nameValidator(
        validator
      )}. This is the point of { final: true }: no later code, yours or a ` +
        'dependency\'s, can change what "valid" means. Drop { final: true } ' +
        'from the call that locked it if the replacement is intended.'
    )
  }
  if (contractValidator != null) {
    const key = `${nameValidator(contractValidator)}>${nameValidator(
      validator
    )}`
    if (!replacementWarned.has(key)) {
      replacementWarned.add(key)
      console.warn(
        `tosijs contracts: the schema validator was ${
          validator == null ? 'REMOVED' : 'REPLACED'
        } (was ${nameValidator(contractValidator)}, now ${nameValidator(
          validator
        )}). Contracts are already installed, so this changes what "valid" ` +
          'means for every component and inline contract in this app — a ' +
          'weaker validator (or none) is a silent downgrade, and the ' +
          'unenforceable-keyword warning stays suppressed while any ' +
          'validator is installed. Read the current one back with ' +
          'getContractValidator(); pass { final: true } to the call you ' +
          'trust to make later replacement throw. Warned once per swap.'
      )
    }
  }
  contractValidator = validator
  validatorIsFinal = options?.final === true
}

/**
 * What full-schema engine is actually installed, if any. Without a read-back
 * an app cannot tell enforcement from the appearance of it.
 */
export function getContractValidator(): ContractValidator | null {
  return contractValidator
}

/** JSON-Schema keywords the built-in subset actually enforces */
const ENFORCED = new Set(['type', 'enum', 'const'])
/** keywords that are METADATA, not constraints — silence is correct */
const NOT_CONSTRAINTS = new Set([
  'description',
  'title',
  'default',
  'examples',
  '$counterexamples',
  '$comment',
  '$id',
  '$schema',
])
const failsOpenWarned = new Set<string>()

/**
 * Warn once per shape when a schema declares constraints the built-in
 * subset cannot check. Without this, the SAME shipped component enforces
 * differently depending on whether the host happened to register a full
 * validator — and nothing anywhere says so.
 */
const warnIfFailsOpen = (schema: any): void => {
  if (contractValidator != null) return // a real engine is installed
  const inert = Object.keys(schema).filter(
    (key) => !ENFORCED.has(key) && !NOT_CONSTRAINTS.has(key)
  )
  if (inert.length === 0) return
  const key = inert.sort().join(',')
  if (failsOpenWarned.has(key)) return
  failsOpenWarned.add(key)
  console.warn(
    `tosijs contracts: ${inert.join(', ')} ${
      inert.length === 1 ? 'is' : 'are'
    } ` +
      'NOT enforced by the built-in checker, which understands only ' +
      'type/enum/const — those constraints are currently inert. Register a ' +
      'full schema engine with setContractValidator(validate) (e.g. from ' +
      'tosijs-schema) to enforce them. Warned once per keyword set.'
  )
}

// the zero-dependency structural subset — covers the common case
// (value: { type: 'number' }) without any schema engine
export const contractViolation = (value: any, schema: any): string | null => {
  warnIfFailsOpen(schema)
  if (schema.const !== undefined && value !== schema.const) {
    return `expected const ${JSON.stringify(schema.const)}`
  }
  if (Array.isArray(schema.enum) && !schema.enum.includes(value)) {
    return `expected one of ${JSON.stringify(schema.enum)}`
  }
  if (typeof schema.type === 'string') {
    const t = schema.type
    const ok =
      t === 'array'
        ? Array.isArray(value)
        : t === 'null'
        ? value === null
        : t === 'integer'
        ? typeof value === 'number' && Number.isInteger(value)
        : t === 'object'
        ? typeof value === 'object' && value !== null && !Array.isArray(value)
        : typeof value === t
    if (!ok) {
      return `expected type ${t}, got ${
        Array.isArray(value) ? 'array' : typeof value
      }`
    }
  }
  if (contractValidator != null) {
    const verdict = contractValidator(value, schema)
    if (verdict !== true) return verdict.message
  }
  return null
}
