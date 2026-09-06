import { test, expect } from 'bun:test'
import { existsSync } from 'node:fs'

/*
 * THE PUBLIC TYPE SURFACE MUST BE IMPORTABLE — CHECKED BY THE COMPILER,
 * AGAINST THE BUILT ARTIFACT.
 *
 * `index-core-exports.ts`, `index-agent.ts` and `index-state.ts` use EXPLICIT
 * export lists rather than `export *`, so a type not named there never reaches
 * a consumer — and nothing notices, because the library's own code imports
 * from the modules directly and compiles fine.
 *
 * That has cost us twice. Twenty-two `Xin*` aliases sat unreachable for four
 * releases, some of them named in the docs. Then 1.10.0 shipped
 * `AgentPathRef` / `AgentObserveRef` — the declared parameter type of every
 * agent verb — plus `ComponentClass`, the declared type of two public
 * blueprint fields the CHANGELOG points authors at, with none of them
 * exported: you could read a name in a signature and be unable to write it.
 *
 * Two design notes, both learned the hard way while writing this:
 *
 * 1. It runs `tsc` over the BUILT `.d.ts`, because that is what a consumer
 *    resolves. Our own source compiling proves nothing about the export list.
 * 2. It does NOT parse `.d.ts` with regexes. The first version did, scored
 *    `dist/index.d.ts` — a 24-line re-export stub — found almost nothing on
 *    either side of the comparison, and passed. It still passed after
 *    `AgentPathRef` was deliberately deleted from the export lists. A gate
 *    that cannot fail is worse than no gate, because it reports safety.
 */
/*
 * A GATE THAT ONLY ASSERTS SUCCESS CANNOT SEE A TYPE WIDENED TO `any`.
 *
 * The idiomatic-spellings probe below compiles a file and requires no errors.
 * That is satisfied trivially once a type becomes `any` — and it was: widening
 * `ElementPart` with `BoxedProxy<any>` collapsed the union to `any` (any
 * distributes through the conditional), which made the probe pass while
 * deleting argument checking on the whole element factory. THE WIDENING MADE
 * TO SATISFY THE GATE IS WHAT BLINDED THE GATE.
 *
 * So this asserts the other direction: things that MUST NOT compile, and the
 * anti-`any` property directly. A success-only type gate is half a gate.
 */
test('the element factory still REJECTS what it should, and is not `any`', async () => {
  const probe = `
import { elements } from '${process.cwd()}/dist/index'
import type { ElementPart } from '${process.cwd()}/dist/xin-types'

// if ElementPart ever becomes \`any\` this flips to true and the assignment fails
type IsAny<T> = 0 extends (1 & T) ? true : false
const _notAny: IsAny<ElementPart> = false

// inline handlers must still infer their event type (TS7006 if the factory
// signature has degraded to any)
const _btn = elements.button({ onClick: (evt) => evt.clientX })

// @ts-expect-error a bare function is not an element part
const _fn = elements.div(() => {})

// NOTE: \`elements.div(new Date())\` is NOT asserted here. The review that
// found this blocker listed it as a regression alongside the function case;
// it is not — v1.10.0 accepted it too, because ElementProps carries an index
// signature (tosijs#26). Asserting it would be asserting a fix nobody made.

export { _notAny, _btn, _fn }
`
  const probePath = `${process.cwd()}/dist/.type-negative-probe.ts`
  await Bun.write(probePath, probe)
  const result = Bun.spawnSync(
    [
      'npx',
      'tsc',
      '--noEmit',
      '--strict',
      '--target',
      'es2022',
      '--module',
      'esnext',
      '--moduleResolution',
      'bundler',
      '--skipLibCheck',
      probePath,
    ],
    { stdout: 'pipe', stderr: 'pipe' }
  )
  const output = result.stdout.toString() + result.stderr.toString()
  await Bun.file(probePath)
    .unlink?.()
    .catch(() => {})
  // an UNUSED @ts-expect-error is itself an error, so this fails in BOTH
  // directions: if the rejections stop happening, and if they start over-firing
  expect({ errors: output.trim(), exitCode: result.exitCode }).toEqual({
    errors: '',
    exitCode: 0,
  })
}, 60_000)

/*
 * THE DECLARED ACCESSOR SURFACE MUST MATCH THE IMPLEMENTATION'S OWN LIST.
 *
 * `ACCESSOR_PROP_NAMES` in `xin.ts` is what the `get` trap actually serves —
 * the implementation's own answer to "what is the accessor API", and so the
 * only authoritative one. Six declaration surfaces restate it by hand, nothing
 * kept them in sync, and they drifted: `tosiBinding` sat on two of them and
 * was missing from a third.
 *
 * This is the cheap half of the fix — it makes MEMBERSHIP derived rather than
 * remembered. It does NOT make any signature true: a name being present says
 * nothing about whether its declared type describes what the function does.
 */
test('the declared accessor type covers every name the proxy serves', async () => {
  const probe = `
import type {
  TosiAccessor,
  TosiProps,
  BoxedArrayProps,
  BoxedScalar,
} from '${process.cwd()}/src/xin-types'
import { ACCESSOR_PROP_NAMES } from '${process.cwd()}/src/xin'
type Served = (typeof ACCESSOR_PROP_NAMES)[number]

// TosiAccessor is THE accessor — it must name everything the trap serves.
type MissingFromAccessor = Exclude<Served, keyof TosiAccessor<any>>
const _a: [MissingFromAccessor] extends [never] ? true : MissingFromAccessor = true

// The direct-property surfaces SPLIT the same set on purpose, and that split
// is the types doing real work: the runtime serves all twelve on any proxy
// (an object proxy will hand you a listBinding), while TosiProps carries the
// universal ones and BoxedArrayProps the list ones -- so calling listBinding
// on a non-array is caught at compile time even though the trap would serve
// it. The invariant is therefore about the UNION, not about either half.
type MissingFromDirect = Exclude<
  Served,
  keyof TosiProps<any> | keyof BoxedArrayProps<any>
>
const _d: [MissingFromDirect] extends [never] ? true : MissingFromDirect = true

// SCALARS ARE A THIRD SURFACE, and were the one this guard still missed:
// after TosiProps was fixed, take(...) still did not typecheck on a boxed
// scalar. Anything not list-shaped must be reachable there too.
type ScalarServed = Exclude<
  Served,
  'listBinding' | 'listFind' | 'listUpdate' | 'listRemove'
>
type MissingFromScalar = Exclude<ScalarServed, keyof BoxedScalar<number>>
const _s: [MissingFromScalar] extends [never] ? true : MissingFromScalar = true
export { _a, _d, _s }
`
  const probePath = `${process.cwd()}/src/.accessor-surface-probe.ts`
  await Bun.write(probePath, probe)
  const result = Bun.spawnSync(
    [
      'npx',
      'tsc',
      '--noEmit',
      '--strict',
      '--target',
      'es2022',
      '--module',
      'esnext',
      '--moduleResolution',
      'bundler',
      '--skipLibCheck',
      probePath,
    ],
    { stdout: 'pipe', stderr: 'pipe' }
  )
  const output = result.stdout.toString() + result.stderr.toString()
  await Bun.file(probePath)
    .unlink?.()
    .catch(() => {})
  expect(output.trim()).toBe('')
}, 60_000)

/*
 * AND THE TYPES MUST ADMIT THE IDIOMATIC SPELLING.
 *
 * Importability is not enough: a type can be reachable and still be narrower
 * than the runtime it describes, which is worse than missing because it sends
 * a consumer away from working code. Two shipped that way and were found only
 * by typechecking the test files, which no lane does:
 *
 *   - the direct `.observe` was typed `(path: string) => void` when it takes a
 *     CALLBACK and returns an unsubscribe — the working call was an error and
 *     the type-prescribed call threw;
 *   - `ElementPart` excluded boxed proxies, so `div(app.name)` — a LIVE bound
 *     text child, and what elements.test.ts calls "the most-used site" — did
 *     not typecheck.
 *
 * So compile the spellings the docs actually show, against the BUILT `.d.ts`.
 */
test.skipIf(!existsSync('dist/index.d.ts'))(
  'the documented spellings compile against the built package',
  async () => {
    const probe = `
import { tosi, elements, bindings } from '${process.cwd()}/dist/index'

const { app } = tosi({ app: { name: 'Ada', count: 0, items: [{ id: 1 }] } })

// a bare proxy child is a live text node
const a = elements.div(app.name)
// mixed with ordinary parts
const b = elements.span('hello ', app.name, 1)
// the direct observer API: a callback in, an unsubscribe out
const off: () => void = app.name.observe((path: string) => void path)
const off2: () => void = app.items.observe(() => {})
// the accessor spelling must agree with the direct one
const off3: () => void = app.name.tosi.observe(() => {})
export { a, b, off, off2, off3, bindings }
`
    const probePath = `${process.cwd()}/dist/.type-usage-probe.ts`
    await Bun.write(probePath, probe)
    const result = Bun.spawnSync(
      [
        'npx',
        'tsc',
        '--noEmit',
        '--strict',
        '--target',
        'es2022',
        '--module',
        'esnext',
        '--moduleResolution',
        'bundler',
        '--skipLibCheck',
        probePath,
      ],
      { stdout: 'pipe', stderr: 'pipe' }
    )
    const output = result.stdout.toString() + result.stderr.toString()
    await Bun.file(probePath)
      .unlink?.()
      .catch(() => {})
    expect({ errors: output.trim(), exitCode: result.exitCode }).toEqual({
      errors: '',
      exitCode: 0,
    })
  },
  60_000
)

test.skipIf(!existsSync('dist/index.d.ts'))(
  'every type the public API names can be imported from the built package',
  async () => {
    // The list is EXPLICIT on purpose — deriving it from the same export
    // lists it is checking would be circular. It is the set a consumer is
    // told to use: anything named in a public signature, in the docs, or in
    // Migration.md. Adding a public type means adding a line here.
    const PUBLIC_TYPES = [
      // component authoring
      'ComponentAttrs',
      'DeclaredAttributes',
      'WithAttributes',
      'ComponentClass',
      'PartsOf',
      'ComponentMap',
      'ComponentTestStep',
      // agent surface
      'AgentInterface',
      'AgentInterfaceOptions',
      'AgentExpose',
      'AgentDescription',
      'AgentWiringRecord',
      'AgentPathRef',
      'AgentObserveRef',
      'AgentRefusalKind',
      'AgentRefusalError',
      // blueprints
      'TosiBlueprint',
      'TosiComponentSpec',
      'TosiPackagedComponent',
      // state + binding
      'BoxedProxy',
      'BoxedScalar',
      'TosiBinding',
      'TosiObject',
      'ElementProps',
    ]
    // a floor, so the list cannot be silently emptied and keep passing
    expect(PUBLIC_TYPES.length).toBeGreaterThan(20)

    // THE IMPORT IS THE WHOLE CHECK. `import type { Missing }` is a TS2305
    // whether or not the name is used, and trying to *use* each one instead
    // was a mistake: half of these are generic, so `ComponentAttrs extends
    // never` is an arity error (TS2314) and the probe failed on types that
    // were perfectly reachable.
    const probe =
      `import type {\n${PUBLIC_TYPES.join(',\n')}\n} from ` +
      `'${process.cwd()}/dist/index'\nexport {}\n`
    const probePath = `${process.cwd()}/dist/.type-surface-probe.ts`
    await Bun.write(probePath, probe)

    const result = Bun.spawnSync(
      [
        'npx',
        'tsc',
        '--noEmit',
        '--strict',
        '--target',
        'es2022',
        '--module',
        'esnext',
        '--moduleResolution',
        'bundler',
        '--skipLibCheck',
        probePath,
      ],
      { stdout: 'pipe', stderr: 'pipe' }
    )
    const output = result.stdout.toString() + result.stderr.toString()
    await Bun.file(probePath)
      .unlink?.()
      .catch(() => {})

    // TS2305 is "module has no exported member X" — the failure this exists
    // for. Report the NAMES, so the message says what to add where.
    const missing = [
      ...output.matchAll(/no exported member (?:named )?'(\w+)'/g),
    ]
      .map((m) => m[1])
      .sort()
    expect({ missing, exitCode: result.exitCode }).toEqual({
      missing: [],
      exitCode: 0,
    })
  },
  60_000
)
