# Migrating from `xinjs` to `tosijs`

<!--{ "pin": "bottom", "description": "Upgrading tosijs: the 1.11.0 agent-surface disclosure fix (rotate link tokens), the 1.9.0 agent-surface default change, the 1.8.0 removals and behaviour changes, the 1.7.0 correctness release, and the original xinjs to tosijs rename." }-->

In a nutshell:

1. Update to `xinjs` (and `xinjs-ui`) 1.0.6
2. Fix any issues
3. Replace all references to "xinjs" with "tosijs"

`xinjs` and `tosijs` 1.0.6 should be identical (likewise `xinjs-ui` and `tosijs-ui`), so the only thing you need to change
should be the module names.

> Please [let me know](https://discord.gg/ramJ9rgky5) if there are any issues.

# Upgrading to 1.11.0

**Nothing you wrote needs to change.** No API is removed or renamed. Two
behaviours move, both narrowing what the *agent surface* discloses, and one is
worth acting on outside your code.

## If you use the agent surface: rotate tokens in links

`describe()` published an element's `href`, `placeholder`, `title`-derived name
and a checkbox's `checked` state **past `data-tosi-secret`** — in cleartext,
beside a record already stamped `secret: true`. This affects **1.8.0 through
1.10.1**, every release that has had the agent surface, and those versions
*do* honour `data-tosi-secret`, so marking a region was reasonable and did not
protect the destination.

`tosi_describe` is registered with model-context hosts unconditionally in every
posture, so if you enabled the surface on a page with token-bearing links
(password reset, magic links), treat those tokens as disclosed to anything that
called `describe()` and rotate them. `read()` was never affected.

## If you audit: five verdicts changed

`auditAccessibility()` reports differently for the same input — stricter on
icon-only and square links (an `aria-label` never sized a box), looser where
evidence was forged or absent. The full list is in the CHANGELOG. If you
snapshot audit output, re-baseline it.

## If you rely on `describe()` output shape

Records for secret-marked elements no longer carry `href`, `placeholder`,
`title`-as-`label`, `aria-description` or `checked`. `aria-label` survives —
names survive secrecy, content and live state do not. A consumer that read
`record.href` unconditionally should now expect it to be absent on those
records.

## Nice surprise: the package is 44% smaller, and ships its source

4.51 MB → 2.51 MB unpacked. Source maps stopped inlining `sourcesContent` and
`src/` ships once instead, so devtools now opens the real `src/*.ts` from
`node_modules` — comments and design rationale included — rather than a copy
embedded in a map file. Nothing to do; maps keep working.

## Known limitation

Secrecy is discovered by finding a secret control and locating the binding that
feeds it. Three shapes are not yet discovered — a custom element carrying
`data-tosi-secret` inside a bound `<form>`, a shadow component holding a
password inside a bound `<form>`, and a light-DOM container two or more levels
up with no `<form>` between. **Marking the control itself, or its immediate
wrapper, works in all of them** and is the reliable form. Tracked as
[tosijs#41](https://github.com/tonioloewald/tosijs/issues/41).

# Upgrading to 1.10.0

**Type-only. Nothing changes at runtime**, and if you do not write components
in TypeScript there is nothing to do.

`Component` declared `[key: string]: any`. An index signature on a class
propagates to every subclass, so TypeScript accepted **any property or method
name at all** on every component anyone has ever written:

```typescript
class Thing extends Component {
  greet() {
    this.definitelyNotAMethod() // compiled clean
    const n: number = this.alsoNotAThing // compiled clean, typed as number
  }
}
```

Removing it means `tsc` now reports real errors in your components. Expect
them; they were always there.

## The migration: move `initAttributes` into the class header

Attribute keys become _instance_ properties at hydration, and TypeScript cannot
derive an instance type from a static declared in the same class — which is why
the index signature existed. Passing the map as a **value** lets inference do
the work:

```typescript
// before — `this.month` was `any`
export class TosiMonth extends Component<MonthParts> {
  static initAttributes = { month: NaN, year: NaN, selectable: false }
  render() {
    this.month + 1
  }
}

// after — `this.month` is a number
import { withAttributes } from 'tosijs'

export class TosiMonth extends withAttributes({
  month: NaN,
  year: NaN,
  selectable: false,
})<MonthParts> {
  render() {
    this.month + 1
  }
}
```

It is a **move**, not an addition — the attribute map is the same object, just
declared where inference can reach it. In tosijs-ui this took one component
from 44 errors to 0, and 413 of that project's 415 errors are this one pattern.

**If you cannot restructure the class**, declare the same thing in one line:

```typescript
import type { ComponentAttrs } from 'tosijs'
export interface Widget extends ComponentAttrs<typeof Widget.initAttributes> {}
```

## `Component` no longer declares `value`

Along with the index signature went the type for `value` (and `defaultValue`).
If your component has a value, **declare it** — which is almost certainly what
you already do:

```typescript
class Stepper extends Component {
  value = 0                    // a field
}
class Picker extends Component {
  declare value: Thing[]       // or just the type
}
class Editor extends Component {
  get value(): string { … }    // or an accessor
  set value(v: string) { … }
}
```

All three shapes are legal, which is exactly why `Component` cannot declare it
for you: a base _property_ makes `get value()` a TS2611, and a base _accessor_
makes `value = ''` a TS2610. Whichever we picked would break the other half.

The runtime has always required this — `initValue()` does nothing unless the
instance has its own `value` descriptor or the contract declares one. The one
case that now needs a line it did not before is a component that declares
`static contract = { value: … }` and no `value` member: it gets a working
accessor at runtime, so add `declare value: T` to match.

## You depend on a library that hasn't migrated yet

Removing `Component`'s index signature is a **compile-time** change, and it
reaches past your own components: a library built against 1.9.x declares its
attributes as `static initAttributes` only, with no instance property. Under
1.9.x `el.month` typed as `any` through the index signature. Under 1.10.0 it
does not exist, so **imperative instance access stops compiling**:

```
TS2551: Property 'month' does not exist on type 'TosiMonth'.
```

Three things worth knowing before you treat this as a blocker:

- **Nothing breaks at runtime.** The attribute still installs, reflects and
  renders. This is a typecheck failure, not a behaviour change.
- **The idiomatic path is unaffected.** Creating elements through the factory
  — `tosiMonth({ month, year })` — compiles clean, because props are typed
  from the creator, not from the instance. Only reaching into a live element
  afterwards is affected.
- **Importing the library is safe.** Its own shipped `.d.ts` still compile.

If you hit it, you have three options, cheapest first:

1. **Wait for the library to migrate.** It is one line per component on their
   side (see above), and nothing about your code is wrong.
2. **Declare the attributes yourself**, in your own project, without touching
   theirs:

   ```typescript
   import type { ComponentAttrs } from 'tosijs'
   import type { TosiMonth } from 'their-library'

   declare module 'their-library' {
     interface TosiMonth
       extends ComponentAttrs<{ month: number; year: number }> {}
   }
   ```

3. **Cast at the call site** — `(el as any).month` — which is what the index
   signature was doing for you invisibly, now written where a reader can see
   it.

Option 2 is the one to prefer: it is checked, it is local to you, and it
disappears when the library migrates.

## What does NOT change

- **`static initAttributes` still works and is not deprecated.**
  `withAttributes()` sets it, and it is still the only way to add attributes to
  an **existing** component class. Build a base with `withAttributes`, extend
  it and add more with `static initAttributes` — they compose, with the
  subclass winning per key:

  ```typescript
  class Base extends withAttributes({ label: 'base' }) {
    /* … */
  }

  class Sub extends Base {
    static initAttributes = { extra: 7 } // declare ONLY what you add
  }
  export interface Sub extends ComponentAttrs<typeof Sub.initAttributes> {}
  ```

  Two things that are easy to get wrong, and were wrong here before 1.10.0:

  - **Declare only the new keys.** Do not spread the base's map in. tosijs
    merges the whole prototype chain for you, so a spread is redundant — and
    it silently papers over the merge, which is how a version of this shipped
    where declaring `extra` dropped `label` from the instance _and_ from
    `observedAttributes`, with no error.
  - **The `interface` line is required on a subclass that adds attributes.**
    `withAttributes` types the instance of the class it creates; it cannot
    reach back into a class it did not create, so `this.extra` has no type
    without it. `this.label`, being inherited, is typed already.

- **Computed attributes** (`Component.computed()`) work unchanged. They are
  deliberately excluded from the type `withAttributes` declares, because your
  class implements them itself — usually as `get`/`set`. A computed setter may
  call `this.queueRender()`.
- **Runtime behaviour is identical.** Attributes install the same way, coerce
  the same way, and trigger renders the same way, whichever form you use.

## Also worth knowing

`TosiComponentSpec.type` and `TosiPackagedComponent.type` are now typed as a
class (`ComponentClass<T>`) rather than `Component<T>`. They always held a
constructor — the instance-type declaration was simply wrong, and invisible
because the index signature made any object assignable to `Component`. If you
author blueprints you should see no change; if you were relying on that field
accepting arbitrary objects, you will now get an error.

# Upgrading to 1.9.0

**One break, and only if you call `enableAgentInterface()`.** Nothing else
changes; apps that never touch the agent surface upgrade with no action.

**`enableAgentInterface()` with no manifest now exposes NOTHING.** It used to
mean "read-only over the entire registry" — every state root, every value, and
every bound element on the page, reachable through `globalThis.tosiAgent` and
published to any WebMCP host, from one unargumented call. `describe()` now
reports an empty app (`roots: {}`, `wiring: []`, `actions: []`) and
`read`/`write`/`call`/`observe`/`when` refuse every path.

| if you had                 | you now want                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `enableAgentInterface()`   | `enableAgentInterface({ expose: { roots: [...], actions: [...] } })` — name what an agent may see |
| …and you're just exploring | `enableAgentInterface({ expose: 'all' })` — everything, deliberately, with a warning              |

The surface tells you which it is: a bare call logs _"nothing is exposed"_ and
names both escape hatches, and `describe().exposure` reports `'closed'`.

**Why:** four separate secret leaks were found in 1.8.x, and every one of them
was reachable **only** in that default posture — a heading printing a password,
a token in a link, a half-typed draft. Each was patched where it was found,
which was four symptoms of one permissive default. Undeclared state is now
_absent_ rather than redacted: it never enters the map, and the elements bound
to it never appear in `wiring`.

**Also renamed:** `describe().exposure` values — `'read-only'` → `'closed'`,
`'introspection'` → `'all'`. If you branched on those strings, update them;
`'read-only'` in particular now describes a posture that no longer exists.

# Upgrading to 1.8.0

**Removed.** Only one deprecation named 1.8.0 in its 1.7 warning, and it is
the only thing actually removed:

| was                                      | now                                                                                                                                    |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `data-ref="thing"`                       | `part="thing"` (bare CSS-selector refs still work)                                                                                     |
| `<xin-blueprint>`, `<xin-loader>` markup | `<tosi-blueprint>`, `<tosi-loader>`. The old tags are **tombstones**: still registered, render nothing, and log exactly what to rename |
| `<xin-slot>` element                     | `<tosi-slot>` (the rewrite produces it automatically)                                                                                  |

**Deprecated but still working** (their 1.7 warnings named no version, so
they survive 1.x and now warn naming **2.0**):

| still works         | prefer            |
| ------------------- | ----------------- |
| `xinSlot()`         | `tosiSlot()`      |
| `blueprint()`       | `tosiBlueprint()` |
| `blueprintLoader()` | `tosiLoader()`    |

**Behaviour changes worth checking even if you use no removed names** —
neither had a prior deprecation warning:

- **A component member named `on<Event>` now wins over the event sugar.** If
  your component holds a _function_ under, say, `onClose`, then
  `creator({ onClose: fn })` now **assigns the member** instead of attaching
  a `close` listener; previously the sugar won and your member was shadowed.
  Rename to `handle<Event>` if you want the event channel. (A member left
  `undefined`/`null` still gets event sugar.)
- **A type-contradicting attribute write is applied and reported, not
  silently discarded.** Writing `false` to an attribute declared
  `'on' | 'off'` used to _remove_ the attribute — so the default read back
  and a feature you turned off stayed on. It now lands as written, with one
  `console.error` naming both types.

**New, and opt-in:** the agent surface (`enableAgentInterface()`). In 1.8.0
it defaulted to **read-only** introspection — `write()` and `call()` refused
until you declared `expose: { roots, actions }` (production) or
`expose: 'all'` (development). **1.9.0 closed that default entirely** — see
above. A manifest scopes what may be **seen**; add `write: true` to
let an agent change it. Nothing changes for apps that never call it.

**License:** tosijs is **Apache-2.0** as of 1.8.0 (BSD-3-Clause through
1.7.x) — adding an explicit patent grant and a patent-retaliation clause.
Apache-2.0 cannot be combined with **GPLv2-only** code; GPLv3+ is fine.

**One new obligation, easy to miss because semver cannot express it.**
Apache-2.0 §4(d) requires that redistributors carry the `NOTICE` text. If you
ship a build containing tosijs to anyone else, include the contents of our
`NOTICE` file (it also credits the vendored schematic renderer) in your
attribution notices — a THIRD-PARTY-NOTICES file, an about screen, or
alongside your own licence text. BSD-3-Clause imposed no equivalent duty, so
this is genuinely new for existing users, and it applies to _redistribution_
— using tosijs to build something you host yourself is unaffected.

# Upgrading to 1.7.0

1.7.0 is the **correctness release** — a large batch of bug fixes. Most are pure
fixes (things that were broken now work), but a few are **observable behavior
changes**. If your code depended on the old (buggy) behavior, these are the ones
to check. No API was removed or renamed.

## Observer/touch matching is now segment-exact

Before 1.7, path matching used a raw prefix test, so an observer or binding on
`foo` also heard `foobar`, and `touch('foo')` swallowed a later `touch('foobar')`.
Now matching respects path segment boundaries.

```
// before 1.7: this observer fired for BOTH 'app.user' and 'app.username'
observe('app.user', cb)
// 1.7+: fires only for 'app.user' and its children ('app.user.name', …),
// NOT the sibling 'app.username'
```

Hierarchical matching is unchanged (a parent still hears its children and vice
versa). **If you relied on the sloppy prefix match** — e.g. an observer on `item`
that you expected to also fire for `items` — give it the exact path, a RegExp, or
a filter function.

## `getValue()` returns typed values for typed inputs

`getValue(element)` (and therefore `bindings.value`'s `fromDOM`) now returns the
control's native type instead of a string:

- `type="number"` / `type="range"` → a **number** (was a string). Empty input
  still returns `''`, never a fabricated `0`.
- `type="date"` / `datetime-local` / `month` / `week` → a **`Date`** (was an ISO
  string for `type=date`).
- `type="time"` → **milliseconds since midnight**.

Bound numeric state now _stays_ numeric across edits. **If you read `getValue()`
directly and expected a string**, coerce explicitly (`String(getValue(el))`), or
read `el.value`. If you bound a `type=date` input and stored the ISO string, note
the stored value is now a `Date` — bind to string state and it keeps the control's
ISO string (the H-6 two-layer coercion, in `src/dom.ts` — `getValue`
reads typed controls natively, and `handleChange` coerces on the way back).

## `Component` `change` events now bubble (and compose)

A component's `change` event (fired when its `value` changes) now bubbles and
crosses shadow boundaries — matching how native `<input>` `change` events behave.
This makes a shadow-DOM component bindable **like an `<input>`** (bind its
`value`; see the [Building Apps](/Building-Apps/) shadow-DOM section).

**If you have a `change` listener on an ancestor** of a tosijs component, it will
now fire for the component's changes where before it did not. If that causes
double-handling, scope the listener (check `event.target`) or use capture-phase
delegation.

## Other fixes worth a glance (not breaks, but visible)

- Reactive `class` bindings now **replace** instead of accumulating.
- `on()` handlers now fire inside **open shadow roots**.
- Named CSS colors (`Color.fromCss('red')`) now parse **without a DOM**.
- Component data-binding sugar placed **inside shadow DOM** now **warns** (it
  never operated there — bind the component by its `value` instead).

See `CHANGELOG.md` for the complete list.
