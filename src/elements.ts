/*{ "order": 2, "description": "The elements proxy: build DOM elements with live bindings and event handlers in plain JS, no JSX or transpilation required." }*/
/*#
# Creating Elements

`tosijs` provides `elements` for easily and efficiently generating DOM elements
without using `innerHTML` or other unsafe methods.

> The design goal of `elements` was to make creating DOM elements using javascript simpler and faster than using HTML or
JSX / TSX while requiring no build-time tooling and no DSLs.

```js
import { elements } from 'tosijs'

const { div, input, label, span } = elements

preview.append(
  div(
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        padding: 10,
        gap: 10
      }
    },
    label(
      {
        style: {
          display: 'inline-flex'
        }
      },
      span('text'),
      input({value: 'hello world', placeholder: 'type something'})
    ),
    label(
      {
        style: {
          display: 'inline-flex'
        }
      },
      span('checkbox'),
      input({type: 'checkbox', checked: true})
    )
  )
)
```

## `ElementCreator` functions

`elements` is a proxy whose properties are element factory functions,
referred to throughout this documentation as `elementCreator`s, functions
of type `ElementCreator`. So `elements.div` is a function that returns a `<div>`
element, `elements.foo` creates <foo> elements, and elements.fooBar creates
`<foo-bar>` elements.

### What a positional argument means

Every argument is classified by what it *is*, and there is exactly one rule per
kind:

| you pass | you get |
| --- | --- |
| a node, string or number | appended as a child |
| a tosijs proxy | a **live** child, re-rendered as the value changes |
| any other value with a text form — `Date`, `bigint`, `boolean`, a `RegExp`, anything whose `toString` is its own | appended as text |
| a plain object, or a `Map` | applied as props → attributes, properties or bindings |
| `null` / `undefined` | **nothing**, deliberately |
| an array | a warning — arrays are not flattened, so spread it: `ul(...items.map(li))` |
| anything else (a function, a `WeakMap`, a class with neither text form nor fields) | a warning, and it is ignored |

**`null` is the way to render nothing, and it is the only way.** That is a
deliberate choice rather than an oversight: a conditional child should *say* it
is conditional, so write `div(cond ? label : null)`. `false` is a value and
renders as `"false"` — `div(cond && label)` is a JSX habit that relies on
short-circuit evaluation producing a falsy value, and importing it would mean
booleans could never be shown. `null` is the intentional version of the same
idea, and it reads as intent at the call site.

**Nothing is silently dropped.** An argument that cannot be used says so, once,
with the value attached — because the previous behaviour was to treat every
unrecognised argument as a props bag, which meant `div(new Date())` rendered an
empty `<div>` and `div(items.map(…))` with the spread forgotten turned array
indices into attributes. Both were silent.

E.g.

```js
import { elements, tosi } from 'tosijs'

const { elementCreatorDemo } = tosi({
  elementCreatorDemo: {
    isChecked: true,
    someString: 'hello elementCreator',
    someColor: 'blue',
    clicks: 0
  }
})

const { div, button, label, input } = elements

preview.append(
  div('I am a div'),
  div(
    {
      style: { color: 'blue' }
    },
    elementCreatorDemo.someString
  ),
  label(
    'Edit someString',
    input({bindValue: elementCreatorDemo.someString})
  ),
  div(
    button(
      'Click me',
      {
        onClick() {
          elementCreatorDemo.clicks += 1
        }
      }
    ),
    div(elementCreatorDemo.clicks, ' clicks so far'),
  ),
  label(
    'isChecked?',
    input({type: 'checkbox', bindValue: elementCreatorDemo.isChecked})
  )
)
```

## camelCase conversion

Attributes in camelCase, e.g. `dataInfo`, will be converted to kebab-case,
so:

    span({dataInfo: 'foo'})        // produces <span data-info="foo"></span>

## style properties

`style` properties can be objects, and these are used to modify the
element's `style` object (while a string property will just change the
element's `style` attribute, eliminating previous changes).

    span({style: 'border: 1px solid red'}, {style: 'font-size: 15px'})

…produces `<span style="font-size: 15px"></span>`, which is probably
not what was wanted.

    span({style: {border: '1px solid red'}, {style: {fontSize: '15px'}}})

…produces `<span style="border: 1px solid red; fon-size: 15px></span>`
which is probably what was wanted.

## class property

The `class` property accepts three forms:

- **a string** — one or more space-separated class names are added:

      div({ class: 'card selected' })   // adds both classes

- **an array** — each entry is added (entries may themselves be space-separated):

      div({ class: ['card', 'selected'] })

- **a boolean map** — each key is toggled on/off by its (truthy) value, so you
  can add and remove classes conditionally in one place:

      div({ class: { card: true, selected: isSelected, hidden: false } })

  adds `card`, adds or removes `selected` depending on `isSelected`, and removes
  `hidden`.

Extra whitespace is tolerated. Falsy values — `''`, `null`, `undefined`, and
`false` (e.g. from `cond ? 'active' : undefined` or `cond && 'active'`) — add no
class, so conditional class expressions work without special-casing. Array
entries are treated the same way (falsy entries are skipped).

## event handlers

Properties starting with `on` (followed by an uppercase letter)
will be converted into event-handlers, so `onMouseup` will be
turned into a `mouseup` listener.

## binding

You can [bind](/bind/) an element to state using [bindings](/bindings/)
using convenient properties, e.g.

    import { elements } from 'tosijs'
    const {div} = elements
    div({ bindValue: 'app.title' })

…is syntax sugar for:

    import { elements, bind, bindings } from 'tosijs'
    const { div } = elements
    bind( div(), 'app.title', bindings.value )

If you want to use your own bindings, you can use `apply`:

    const visibleBinding = {
      toDOM(element, value) {
        element.classList.toggle('hidden', !value)
      }
    }

    div({ apply(elt){
      bind(elt, 'app.prefs.isVisible', visibleBinding})
    } })

## event-handlers

You can attach event handlers to elements using `on<EventType>`
as syntax sugar, e.g.

    import { elements } from 'tosijs'
    const { button } = elements
    document.body.append(
      button('click me', {onClick() {
        alert('clicked!')
      }})
    )

…is syntax sugar for:

    import { elements, on } from 'tosijs'
    const { button } = elements
    const aButton = button('click me')
    on(aButton, 'click', () => {
      alert('clicked!')
    })
    document.body.append(
      aButton
    )

There are some subtle but important differences between `on()` and
`addEventListener` which are discussed in detail in the section on
[bind](/bind/).

## apply

A property named `apply` is assumed to be a function that will be called
on the element.

    span({
      apply(element){ element.textContent = 'foobar'}
    })

…produces `<span>foobar</span>`.

## fragment

`elements.fragment` is produces `DocumentFragment`s, but is otherwise
just like other element factory functions.

## svgElements

`svgElements` is a proxy just like `elements` but it produces **SVG** elements in
the appropriate namespace.

```js
import { svgElements, tosi, xin } from 'tosijs'

const { svg, g, path, circle, polygon } = svgElements

// --- radar background ---
const outerRing = 'M128,8 C194.274,8,248,61.7258,248,128 C248,194.274,194.274,248,128,248 C61.7258,248,8.00001,194.274,8.00001,128 C8.00001,61.7258,61.7258,8,128,8 z'
const vLine = 'M128,53 C128,53,128,203,128,203'
const hRight = 'M203,128 C203,128,143,128,143,128'
const hLeft = 'M113,128 C113,128,53,128,53,128'
const guide = 'fill:#00a79e;fill-opacity:0.127;fill-rule:evenodd;stroke:#00a79e;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:4;'
const axis = guide + 'stroke-opacity:0.24;'

// --- two separate arrays: friendlies and hostiles ---
let nextId = 0
const RANGE = 115

function spawnFriendly() {
  const angle = Math.random() * Math.PI * 2
  const heading = angle + Math.PI * (0.6 + Math.random() * 0.8)
  const speed = 0.2 + Math.random() * 0.3
  return {
    id: nextId++,
    x: 128 + Math.cos(angle) * 105, y: 128 + Math.sin(angle) * 105,
    dx: Math.cos(heading) * speed, dy: Math.sin(heading) * speed,
  }
}

function spawnHostile() {
  const angle = Math.random() * Math.PI * 2
  const heading = angle + Math.PI * (0.7 + Math.random() * 0.6)
  const speed = 0.5 + Math.random() * 0.6
  return {
    id: nextId++,
    x: 128 + Math.cos(angle) * 110, y: 128 + Math.sin(angle) * 110,
    dx: Math.cos(heading) * speed, dy: Math.sin(heading) * speed,
  }
}

const { friendlies, hostiles } = tosi({
  friendlies: Array.from({ length: 6 }, spawnFriendly),
  hostiles: Array.from({ length: 4 }, spawnHostile),
})

// custom binding: position a <g> from its list item's x,y
const position = (el, item) => {
  if (item) el.setAttribute('transform', `translate(${item.x},${item.y})`)
}

// --- list-bound blip layers (one per array, no filter needed) ---
const friendlyLayer = g(
  g(
    circle({ r: '5', fill: 'none', stroke: '#8cc63f', 'stroke-width': '1' }),
    { bind: { value: '^', binding: position } }
  ),
  { bind: { value: friendlies, binding: 'list', options: { idPath: 'id' } } }
)
const hostileLayer = g(
  g(
    polygon({ points: '0,-6 5.2,3 -5.2,3', fill: 'none', stroke: '#ff1d25', 'stroke-width': '1.5', 'stroke-linejoin': 'round' }),
    { bind: { value: '^', binding: position } }
  ),
  { bind: { value: hostiles, binding: 'list', options: { idPath: 'id' } } }
)

preview.append(
  svg(
    { width: '256', height: '256', viewBox: '0 0 256 256' },
    g(
      path({ style: guide + 'stroke-opacity:0.5;', d: outerRing }),
      path({ style: axis, d: vLine }),
      path({ style: axis, d: hRight }),
      path({ style: axis, d: hLeft }),
    ),
    friendlyLayer,
    hostileLayer,
  )
)

// animate: advance, cull out-of-range, spawn new
function tick(arr) {
  const kept = []
  for (const b of arr) {
    const nx = b.x + b.dx, ny = b.y + b.dy
    if (Math.sqrt((nx - 128) ** 2 + (ny - 128) ** 2) < RANGE) {
      kept.push({ ...b, x: nx, y: ny })
    }
  }
  return kept
}
setInterval(() => {
  const f = tick(xin.friendlies)
  if (Math.random() < 0.06) f.push(spawnFriendly())
  xin.friendlies = f

  const h = tick(xin.hostiles)
  if (Math.random() < 0.04) h.push(spawnHostile())
  xin.hostiles = h
}, 50)
```

## mathML

`mathML` is a proxy just like `elements` but it products **MathML** elements in
the appropriate namespace.

> ### Caution
>
> Both `svgElements` and `mathML` are experimental and do not have anything like  the
> degree of testing behind them as `elements`. In particular, the properties of
> SVG elements (and possible MathML elements) are quite different from ordinary
> elements, so the underlying `ElementCreator` will never try to set properties
> directly and will always use `setAttribute(...)`.
>
> E.g. `svgElements.svg({viewBox: '0 0 100 100'})` will call `setAttribute()` and
> not set the property directly, because the `viewBox` property is… weird, but
> setting the attribute works.
>
> Again, use with caution!

## `bindParts()`

```
bindParts(
  root: Element,
  bindingMap: Record<string, ElementProps>,
  dataAttribute?: string  // default: 'part'
): void
```

`bindParts()` applies `ElementProps` to elements inside `root` that are identified
by a `data-` attribute. This lets you take an existing chunk of DOM — from `innerHTML`,
a CMS, a server-rendered page, or an HTML `<template>` — and wire up bindings,
event handlers, and properties without having to build the DOM programmatically.

    const root = document.querySelector('.my-widget')
    root.innerHTML = `
      <h2 data-part="title"></h2>
      <input data-part="search">
      <button data-part="submit">Go</button>
    `

    bindParts(root, {
      title:  { textContent: app.title },
      search: { bindValue: app.query },
      submit: { onClick: () => performSearch() },
    })

Each key in `bindingMap` is matched against the value of `data-part` (or whatever
`dataAttribute` you specify). Matching elements receive the full `ElementProps`
treatment — the same logic used by element creators — so `bind`, `textContent`,
`on*` handlers, `style`, `class`, `apply`, and proxy values all work.

Elements are tracked via a `WeakSet` so calling `bindParts()` again on the same
root is safe — already-bound elements are skipped.

### Custom data attribute

Pass a third argument to use a different attribute name:

    bindParts(root, map, 'role')  // matches data-role="..."
*/

import { bind, on } from './bind'
import { bindings } from './bindings'
import {
  ElementPart,
  ElementProps,
  ElementCreator,
  StringMap,
  TosiBinding,
  EventType,
} from './xin-types'
import { camelToKabob } from './string-case'
import { processProp } from './css'
import { tosiPath, TAKE_DESCRIPTOR, setElementContract } from './metadata'
import { MATH, SVG, type ElementsProxy } from './elements-types'

const templates: { [key: string]: Element } = {}

const elementStyle = (elt: HTMLElement, prop: string, value: any) => {
  const processed = processProp(camelToKabob(prop), value)
  if (processed.prop.startsWith('--')) {
    elt.style.setProperty(processed.prop, processed.value)
  } else {
    ;(elt.style as unknown as { [key: string]: string })[prop] = processed.value
  }
}

const elementStyleBinding = (prop: string): TosiBinding => {
  return {
    toDOM(element, value) {
      elementStyle(element as HTMLElement, prop, value)
    },
  }
}

// per-element record of the classes the `class` prop binding last applied,
// so a reactive class binding can replace (not accumulate) on each update
const appliedClasses = new WeakMap<Element, Set<string>>()

const elementProp = (elt: HTMLElement, key: string, value: any) => {
  if (key === 'style') {
    if (typeof value === 'object') {
      for (const prop of Object.keys(value)) {
        if (tosiPath(value[prop])) {
          bind(elt, value[prop], elementStyleBinding(prop))
        } else {
          elementStyle(elt, prop, value[prop])
        }
      }
    } else {
      elt.setAttribute('style', value)
    }
  } else {
    const attr = camelToKabob(key)

    // Check if declared in observedAttributes (works for third-party web components)
    const observedAttrs = (elt.constructor as any).observedAttributes as
      | string[]
      | undefined
    const isObservedAttr =
      observedAttrs?.includes(key) || observedAttrs?.includes(attr)

    if (isObservedAttr) {
      // tosijs#24: only treat a boolean VALUE as an HTML boolean attribute
      // when the attribute is actually boolean-TYPED. Writing `false` to an
      // attribute declared `'on' | 'off'` used to land here and REMOVE the
      // attribute, so the element silently read back its default — a
      // feature explicitly turned off stayed on.
      //
      // The type must come from a DECLARATION, never from the property's
      // current value: a third-party element whose `count` initialises to
      // `null` would otherwise look "object-typed" (typeof null === 'object'),
      // and every numeric write would be routed away from the attribute —
      // its attributeChangedCallback would never fire and it would render
      // nothing. Only tosijs Components declare attribute types, so only
      // they get the mismatch routing.
      const declaredAttrs = (
        elt.constructor as unknown as {
          _resolveInitAttributes?: () => Record<string, any> | undefined
        }
      )._resolveInitAttributes?.()
      const declaredDefault = declaredAttrs?.[key] ?? declaredAttrs?.[attr]
      const typeMismatch =
        declaredDefault !== undefined &&
        declaredDefault !== null &&
        value !== null &&
        value !== undefined &&
        typeof value !== typeof declaredDefault
      if (typeMismatch) {
        ;(elt as { [key: string]: any })[key] = value
      } else if (typeof value === 'boolean') {
        if (value) {
          elt.setAttribute(attr, '')
        } else {
          elt.removeAttribute(attr)
        }
      } else {
        elt.setAttribute(attr, value)
      }
    } else if ((elt as { [key: string]: any })[key] !== undefined) {
      // MathML is only supported on 91% of browsers, and not on the Raspberry Pi Chromium
      const { MathMLElement } = globalThis
      if (
        elt instanceof SVGElement ||
        (MathMLElement !== undefined && elt instanceof MathMLElement)
      ) {
        elt.setAttribute(key, value)
      } else {
        ;(elt as { [key: string]: any })[key] = value
      }
    } else if (attr === 'class') {
      // `v || ''` collapses null/undefined/false — idiomatic conditional
      // "no class" (`cond ? 'active' : undefined`, `cond && 'active'`, or an
      // explicit null) — to an empty string, so it adds NO class rather than a
      // literal "null"/"undefined"/"false". Also tolerates extra whitespace.
      const splitClasses = (v: any): string[] =>
        String(v || '')
          .split(/\s+/)
          .filter(Boolean)
      // classes this binding wants ON, and (boolean-map only) explicitly OFF
      const on = new Set<string>()
      const off = new Set<string>()
      if (Array.isArray(value)) {
        // ['foo', 'bar'] (each entry may itself be space-separated)
        for (const entry of value)
          for (const c of splitClasses(entry)) on.add(c)
      } else if (value != null && typeof value === 'object') {
        // { foo: true, bar: false } adds foo, removes bar
        for (const [key, isOn] of Object.entries(value))
          for (const c of splitClasses(key)) (isOn ? on : off).add(c)
      } else {
        // 'foo bar baz' (and null/undefined/false/'' -> no class)
        for (const c of splitClasses(value)) on.add(c)
      }
      // Diff against what THIS binding applied last time, so a reactive
      // `class` binding REPLACES rather than accumulates (a change from
      // 'red' to 'blue' must not leave 'red bl ue'). Only classes this
      // binding previously added are candidates for removal — classes from
      // other sources (a static `class`, `-tosi-data`, etc.) are untouched.
      const prev = appliedClasses.get(elt)
      if (prev) for (const c of prev) if (!on.has(c)) elt.classList.remove(c)
      for (const c of off) elt.classList.remove(c)
      for (const c of on) elt.classList.add(c)
      appliedClasses.set(elt, on)
    } else if ((elt as { [key: string]: any })[attr] !== undefined) {
      ;(elt as StringMap)[attr] = value
    } else if (typeof value === 'boolean') {
      if (value) {
        elt.setAttribute(attr, '')
      } else {
        elt.removeAttribute(attr)
      }
    } else {
      elt.setAttribute(attr, value)
    }
  }
}

const propBindingCache: Record<string, TosiBinding> = {}
// reverse lookup: which element prop does this (cached) prop binding drive?
// used by the agent surface to name bindings in describe() output
export const propBindingKey = (binding: TosiBinding): string | undefined => {
  for (const key of Object.keys(propBindingCache)) {
    if (propBindingCache[key] === binding) return key
  }
  return undefined
}
const elementPropBinding = (key: string): TosiBinding => {
  if (!propBindingCache[key]) {
    propBindingCache[key] = {
      toDOM(element, value) {
        elementProp(element as HTMLElement, key, value)
      },
    }
  }
  return propBindingCache[key]
}

/**
 * Fold one props object into another — `bind` ACCUMULATES, everything else is
 * last-write-wins.
 *
 * Last-write-wins is right for scalar props and WRONG for `bind`: since
 * `.tosi.listBinding()` started emitting `bind` instead of the deprecated
 * `bindList`, a plain `Object.assign` silently destroyed one of two bindings.
 * Both orders failed without a word — caller's bind first dropped the caller's
 * binding, listBinding first destroyed the ENTIRE LIST, template unconsumed.
 *
 * EXPORTED AND SHARED because there are TWO addresses that fold props this
 * way: `create()` here and `Component.hydrate()`. The first fix landed only
 * here, so the identical bug survived in hydrate() — where host props in a
 * content array are documented to apply "just as they would be applied to the
 * element being created by div()". One helper, so they cannot drift again.
 */
/**
 * Is this a CONFIG BAG rather than a value?
 *
 * A plain object always is — including `{}`, which a spread of a conditional
 * (`{...(cond ? {class:'x'} : {})}`) legitimately produces, so it must stay
 * silent. Anything else counts only if it actually carries enumerable own
 * properties, which preserves the existing behaviour for class instances used
 * as config (`div(new Settings())` sets its fields as attributes).
 */
const isPropsBag = (item: any): boolean => {
  if (typeof item !== 'object') return false
  // A MAP IS A PROPS BAG — a cleaner one than an object literal, in fact: no
  // prototype to collide with, insertion-ordered, and it cannot accidentally
  // inherit anything. Allowed, never required.
  if (item instanceof Map) return true
  const proto = Object.getPrototypeOf(item)
  if (proto === Object.prototype || proto === null) return true
  return Object.keys(item).length > 0
}

/** does this value know how to render itself as text? */
const renderableAsText = (item: any): boolean => {
  if (Array.isArray(item)) return false
  // A FUNCTION IS NEVER A VALUE YOU MEANT TO SHOW. `Function.prototype
  // .toString` is not `Object.prototype`'s, so functions passed the text test
  // and rendered their own SOURCE into the DOM — silently, and in the release
  // whose headline is "mistakes complain":
  //   div(span)                  -> the factory's source, from a forgotten ()
  //   div(class Foo { … })       -> the whole class body, method bodies and all
  // Falls through to the "neither a child nor a props object" warning instead.
  if (typeof item === 'function') return false
  const toString = (item as any).toString
  return (
    typeof toString === 'function' && toString !== Object.prototype.toString
  )
}

/**
 * WHAT IS THIS POSITIONAL ARGUMENT? One answer, for the two places that ask.
 *
 * `create()` and `Component.hydrate()`'s content filter both classify the same
 * arguments, and `mergeElementProps` was extracted precisely to keep them in
 * step — its comment says so. They drifted anyway: the value/array/warning
 * rules landed in `create()` only, so `content = [span('a'), new Date()]`
 * still dropped the Date silently and a nested array still turned its INDICES
 * into host attributes — verbatim the symptom the release notes call fixed.
 *
 * So the classification is the shared thing now, not just the merge.
 *
 * `Node`, not `Element | DocumentFragment`: hydrate() already used the wider
 * test and it is the correct one — a `Text` or `Comment` node is legitimate
 * content, and create() rejecting it was the narrower of two disagreeing
 * copies.
 */
export type PositionalKind =
  | 'child'
  | 'proxy'
  | 'text'
  | 'props'
  | 'array'
  | 'unusable'

export const classifyPositional = (item: any): PositionalKind => {
  const Node = (globalThis as any).Node
  if (
    (Node != null && item instanceof Node) ||
    typeof item === 'string' ||
    typeof item === 'number'
  ) {
    return 'child'
  }
  // BEFORE the array test: `Array.isArray` is true for a Proxy over an array,
  // so testing arrays first turned `div(app.items)` from a bound child into a
  // warn-and-drop.
  if (tosiPath(item)) return 'proxy'
  if (Array.isArray(item)) return 'array'
  // null/undefined stay the nothing-signal conditional children rely on:
  // merged (a no-op) and silent.
  if (item == null) return 'props'
  if (isPropsBag(item)) return 'props'
  if (renderableAsText(item)) return 'text'
  return 'unusable'
}

/** the message for an argument that will do nothing, so both sites say it identically */
export const positionalWarning = (
  kind: PositionalKind,
  tagName: string
): string | undefined => {
  const tag = tagName.toLowerCase()
  if (kind === 'array') {
    return (
      `<${tag}> was passed an array as a child. Arrays are not flattened — ` +
      `did you mean to spread it? \`${tag}(...items.map(…))\``
    )
  }
  if (kind === 'unusable') {
    return (
      `<${tag}> was passed a value that is neither a child nor a props ` +
      `object — it has no text form and no properties to apply, so it was ` +
      `ignored.`
    )
  }
  return undefined
}

export const mergeElementProps = (target: any, item: any): void => {
  if (item?.bind != null && target.bind != null) {
    target.bind = ([] as any[]).concat(target.bind, item.bind)
    const { bind: _accumulated, ...rest } = item
    Object.assign(target, rest)
    return
  }
  Object.assign(target, item)
}

export const elementSet = (elt: HTMLElement, key: string, value: any) => {
  if (key === 'apply') {
    value(elt)
  } else if (key === 'contract') {
    // inline contract: declared where the element is built, harvested by the
    // agent surface, curated/overridden at enableAgentInterface if desired
    setElementContract(elt, value)
  } else if (key.match(/^on[A-Z]/) != null) {
    // tosijs#22: the on<Event> sugar is for CONFIG KEYS, not for a
    // component's own methods. `onSceneAddition` is ordinary OO naming for
    // "what to do when a scene addition happens", and a component author
    // has no reason to expect the framework to claim that namespace — so
    // when the element already defines a FUNCTION under this name (its own
    // method or class field), assigning it is what the caller meant.
    // THE DISCRIMINATOR IS THE EXISTING MEMBER, NOT THE PASSED VALUE. An
    // earlier version of this comment said "a non-function value (the usual
    // `onClick: () => …`) is event sugar", which cannot be right — an arrow
    // function IS a function. What decides is whether the element already
    // HOLDS a function under this key:
    //
    //   plain element, or custom element with no such member → event sugar
    //   custom element already holding a function there      → assignment
    //
    // Custom elements only, deliberately: on a plain DOM element `onclick`
    // and friends are functions too, so testing `typeof existing` there would
    // hijack every ordinary handler.
    //
    // Known sharp edge (tracked in TODO.md): this reads the member off the
    // INSTANCE, so it depends on the element having been upgraded. A
    // component delivered by `<tosi-blueprint>` and created before
    // `customElements.define` runs sees `undefined` here and takes the sugar
    // branch — so an identical call site can mean two different things
    // depending on timing.
    const existing = (elt as { [key: string]: any })[key]
    if (
      elt.tagName.includes('-') &&
      typeof existing === 'function' &&
      typeof value === 'function'
    ) {
      ;(elt as { [key: string]: any })[key] = value
    } else {
      const eventType = key.substring(2).toLowerCase()
      on(elt, eventType as EventType, value)
    }
  } else if (key === 'bind') {
    // may be a single inline binding or several accumulated by create()
    if (Array.isArray(value)) {
      for (const one of value) elementSet(elt, 'bind', one)
      return
    }
    const binding =
      typeof value.binding === 'string'
        ? bindings[value.binding]
        : value.binding
    if (binding !== undefined && value.value !== undefined) {
      // pass the RESOLVED binding, not value.binding — a string name
      // (`binding: 'text'`) was passed through raw, so bind() got a string
      // with no toDOM and silently did nothing
      bind(
        elt,
        value.value,
        binding instanceof Function ? { toDOM: binding } : binding,
        // OPTIONS WERE SILENTLY DROPPED HERE. `bind()` has always taken a
        // fourth argument, but the inline form ignored anything beyond
        // value/binding — so a list binding could not be expressed inline and
        // had to go through the DEPRECATED `bindList` key, which is how
        // `.tosi.listBinding()` ended up warning its own callers (tosijs#31).
        value.options
      )
    } else {
      throw new Error(`bad binding`)
    }
  } else if (key.match(/^bind[A-Z]/) != null) {
    const bindingType = key.substring(4, 5).toLowerCase() + key.substring(5)
    /*
     * NO `bind*` SHORTCUT IS DEPRECATED. (1.9.1 — removed, not narrowed.)
     *
     * This warned for `bindText`/`bindEnabled`/`bindDisabled`, latterly only
     * for the proxy form, on the rule "deprecated iff a plain prop expresses
     * it exactly". The rule is sound and the narrowing was right, but it
     * ended somewhere incoherent: deprecation-ness depended on the VALUE,
     * which TypeScript cannot express, so the typings carried no
     * `@deprecated` while the runtime still warned — a typings/runtime
     * mismatch, reported by tosijs-ui, that we introduced trying to fix the
     * previous one.
     *
     * The nudge was never worth much: `bindText` is barely more writing than
     * `textContent`, and the shortcut is the ONLY form that binds a path
     * string. So it is console spam in someone else's build for a stylistic
     * preference. It belongs in the docs, and that is where it now lives.
     *
     * `bindValue` and `bindList` were never deprecated (two-way; and the
     * primitive `.tosi.listBinding()` emits). Now nothing here is, and the
     * types say exactly that.
     */
    const binding = bindings[bindingType]
    if (binding !== undefined) {
      bind(elt, value, binding)
    } else {
      throw new Error(
        `${key} is not allowed, bindings.${bindingType} is not defined`
      )
    }
  } else if (
    value != null &&
    typeof value === 'object' &&
    value[TAKE_DESCRIPTOR]
  ) {
    // TakeDescriptor used as a bare property binding
    bind(elt, value, elementPropBinding(key))
  } else if (tosiPath(value)) {
    bind(elt, value, elementPropBinding(key))
  } else {
    elementProp(elt, key, value)
  }
}

const create = (tagType: string, ...contents: ElementPart[]): HTMLElement => {
  if (templates[tagType] === undefined) {
    const [tag, namespace] = tagType.split('|')
    if (namespace === undefined) {
      templates[tagType] = globalThis.document.createElement(tag)
    } else {
      templates[tagType] = globalThis.document.createElementNS(namespace, tag)
    }
  }
  const elt = templates[tagType].cloneNode() as HTMLElement
  const elementProps: ElementProps = {}
  for (const item of contents) {
    const kind = classifyPositional(item)
    const warning = positionalWarning(kind, elt.tagName)
    if (warning != null) {
      console.warn(warning, item)
    } else if (kind === 'child') {
      if (elt instanceof HTMLTemplateElement) {
        elt.content.append(item as Node)
      } else {
        elt.append(item as Node)
      }
    } else if (kind === 'text') {
      const text = String(item)
      if (elt instanceof HTMLTemplateElement) {
        elt.content.append(text)
      } else {
        elt.append(text)
      }
    } else if (kind === 'proxy') {
      // `elements.div(proxy)` — the most idiomatic call form in the library.
      elt.append(elements.span({ bind: { value: item, binding: 'text' } }))
    } else {
      // `bind` IS ACCUMULATED, NOT OVERWRITTEN — a container can be
      // list-bound AND carry its own binding; a plain Object.assign silently
      // destroyed one of the two.
      mergeElementProps(
        elementProps,
        item instanceof Map ? Object.fromEntries(item) : item
      )
    }
  }
  for (const key of Object.keys(elementProps)) {
    const value: any = elementProps[key]
    elementSet(elt, key, value)
  }
  return elt
}

const fragment = (...contents: ElementPart[]): DocumentFragment => {
  const frag = globalThis.document.createDocumentFragment()
  for (const item of contents) {
    frag.append(item as Node)
  }
  return frag
}

/**
 * elements is a proxy that produces ElementCreators, e.g.
 * elements.div() creates <div> elements and
 * elements.myElement() creates <my-element> elements.
 */
export const elements = new Proxy(
  { fragment },
  {
    get(target, tagName: string) {
      tagName = tagName.replace(/[A-Z]/g, (c) => `-${c.toLocaleLowerCase()}`)
      if ((target as StringMap)[tagName] === undefined) {
        ;(target as StringMap)[tagName] = (...contents: ElementPart[]) =>
          create(tagName, ...contents)
      }
      return (target as StringMap)[tagName]
    },
    set() {
      throw new Error('You may not add new properties to elements')
    },
  }
) as unknown as ElementsProxy

interface SVGElementsProxy {
  [key: string]: ElementCreator<SVGElement>
}

export const svgElements = new Proxy(
  { fragment },
  {
    get(target, tagName: string) {
      if ((target as StringMap)[tagName] === undefined) {
        ;(target as StringMap)[tagName] = (...contents: ElementPart[]) =>
          create(`${tagName}|${SVG}`, ...contents)
      }
      return (target as StringMap)[tagName]
    },
    set() {
      throw new Error('You may not add new properties to elements')
    },
  }
) as unknown as SVGElementsProxy

interface MathMLElementsProxy {
  [key: string]: ElementCreator<MathMLElement>
}

export const mathML = new Proxy(
  { fragment },
  {
    get(target, tagName: string) {
      if ((target as StringMap)[tagName] === undefined) {
        ;(target as StringMap)[tagName] = (...contents: ElementPart[]) =>
          create(`${tagName}|${MATH}`, ...contents)
      }
      return (target as StringMap)[tagName]
    },
    set() {
      throw new Error('You may not add new properties to elements')
    },
  }
) as unknown as MathMLElementsProxy

const boundParts = new WeakSet<Element>()

export function bindParts(
  root: Element,
  bindingMap: Record<string, ElementProps>,
  dataAttribute = 'part'
): void {
  const selector = `[data-${dataAttribute}]`
  for (const el of Array.from(root.querySelectorAll(selector))) {
    if (boundParts.has(el)) continue
    const key = el.getAttribute(`data-${dataAttribute}`)
    if (key == null) continue
    const props = bindingMap[key]
    if (props == null) continue
    boundParts.add(el)
    for (const k of Object.keys(props)) {
      elementSet(el as HTMLElement, k, (props as any)[k])
    }
  }
}
