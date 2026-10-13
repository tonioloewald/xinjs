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

…produces `<span style="border: 1px solid red; font-size: 15px"></span>`
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

A handler can also be a **proxy** (or a path string) for a function in state:

    const { app } = tosi({ app: { save() { … } } })
    button('Save', { onClick: app.save })

The element is given the *path* `app.save`, not the function, and the handler is
looked up when the event fires. Replace `app.save` later and the button runs the
new function.
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
