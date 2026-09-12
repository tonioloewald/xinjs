/*{ "parent": "tosi", "order": 1, "description": "How the tosi observer proxy works: an object wrapped in a proxy that surgically updates bound DOM elements when its properties change." }*/
/*#
# The tosi proxy

`tosi()` assigns an object passed to it to a global state object,
and returns an observer proxy (`BoxedProxy`) wrapped around the global state object.

BoxedProxy wraps any object you pull out of it in an observer
proxy. It boxes booleans, numbers, and strings in lightweight proxies
that know their path and can access/modify the underlying value.

In rough terms:

```
const state = {}
const boxed = new Proxy(state, ...)
tosi = (obj<T>): BoxedProxy<T> => {
  Object.assign(state, obj)
  return state
}
```

This allows the following pattern, which gives Typescript a lot of useful
information for free, allowing autocomplete, etc. with a minimumn of
boilerplate.

```
import { tosi, elements, bind } from 'tosijs'

const { prefs } = tosi({
  prefs: {
    theme: 'system',
    highcontrast: false
  }
})

// this example continues…
```

So `{ prefs: ... }` is assigned to the state object, and now `prefs`
holds the same stuff except it's wrapped in a `BoxedProxy`.

The `BoxedProxy` behaves just like the original object, except
that it:

- knows where it came from, so `prefs.path === 'prefs'`
- will automatically trigger updates if its properties are changed through it
- can return the underlying value:
  `prefs.value === prefs.valueOf() === the prefs property of the object passed to `tosi()`
- it will wrap its non-object properties in objects and wrap those objects
  in a BoxedProxy, so `prefs.theme.path === 'prefs.theme'`

```
prefs.theme.value === 'system'          // true
prefs.theme.path === 'prefs.theme'      // true
prefs.theme.valueOf() === 'system'      // true
String(prefs.theme) === 'system'        // true (via Symbol.toPrimitive)
```

The `BoxedProxy` observes changes made through it and updates bound elements
accordingly:

```
bind(document.body, prefs.theme, {
  toDOM(element, value) {
    element.classList.toggle('dark-mode', value === 'dark')
  }
}

const { select, option } = elements

document.body.append(
  select(
    { bindValue: prefs.theme },
    option('system'),
    option('dark'),
    option('light')
  )
)
```

Setting up the binding to `document.body` will set the `class`
appropriately, and modifying `prefs.theme` will update the
bound element automatically.

```
proxy.theme.value = 'dark'
```

> In javascript you can just write `proxy.theme = 'dark'` (TypeScript
> doesn't allow this due to asymmetric get/set type limitations).

This, in a nutshell, explains exactly what `tosijs` is designed to do.

`tosi` tracks state and allows you to bind data to your user interface
directly and with almost no code, with clean separation between business
logic and presentation.

The [`elements` proxy](/elements/) lets you build HTML elements with
data and event bindings more compactly and efficiently than you can using
JSX/TSX, and it deals in regular `HTMLElement`—no virtual DOM, tranpilation
magic, spooky action at a distance, or any similar nonsense.

If you need to do complex bindings, the `bind` method lets you directly
link data to the DOM and automatically sets up observers for you.

`Component` lets you create reusable web-components.

`css` lets you write CSS economically and makes it easy to leverage the power
of CSS variables, while `Color` allows you to do color math quickly and
easily until similar functionality is added to CSS.

> In Finnish, *tosi* means true or really.
>
> As conceived, `tosi()` is an observer `Proxy` wrapped around your application's
> state. It's the **single source of truth for application state**.
>
> Note that the interactive examples on the tosijs.net website allow TypeScript
> but the Typescript is simply stripped to javascript using [sucrase](https://sucrase.io/).

## xin

`xin` is a path-based implementation of the **observer** or **pub/sub**
pattern designed to be very simple and straightforward to use, leverage
Typescript type-checking and autocompletion, and let you get more done with
less code and no weird build magic (such as special decorators or "execution zones").

## In a nutshell

`xin` is a single object wrapped with an **observer** proxy.

- when you assign an object (or array) to `xin` as a property, you're
  just assigning a property to the object. When you pull it out, you
  get a **proxy** of the underlying value, but the original value is
  still there, untouched.
  ```
  const foo = { bar: 'baz' }
  xin.foo = foo
  xin.foo.bar === foo.bar
  xin.foo.bar === 'baz'
  xin.foo !== foo            // xin.foo is a proxy
  xin.foo.value === foo   // foo is still there!
  ```
- if you change a property of something already in `xin` then this
  change will be `observed` and anything *listening* for changes to
  the value at that **path** will be notified.
- tosijs's `bind` method leverages the proxy to keep the UI synced
  with application state.

In the following example there's a `<div>` and an `<input>`. The
textContent of the former and the value of the latter are bound to
the **path** `xinExample.string`.

`xin` is exposed as a global in the console, so you can go into
console and look at `xin.xinExample` and (for example) directly
change it via the console.

You can also turn on Chrome's rendering tools to see how
efficiently the DOM is updated. And also note that typing into
the input field doesn't lose any state (so your text selection
and insertion point are stable.

```js
import { xin, elements } from 'tosijs'

xin.xinExample = {
  string: 'hello, xin'
}

const { label, input, div, span } = elements

preview.append(
  div(
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 10
      }
    },
    div({bind: {value: 'xinExample.string', binding: 'text'}}),
    label(
      span('Edit this'),
      input({ bindValue: 'xinExample.string'})
    )
  )
)
```

- a **data-path** typically resembles the way you'd reference a value inside
  a javascript object…
- `xin` also supports **id-paths** which allow you to create stable references
  to elements in arrays using a (hopefully unique) identifier. E.g. instead
  of referring to an item in an array as `xin.foo.array[3]`, assuming it had
  an `id` of `abcd1234` you could write `xin.foo.array[id=abcd1234]`. This makes
  handling large arrays much more efficient.
- when you pull an object-value out of `xin` it comes wrapped in the xin
  observer proxy, so it continues to support id-paths and so on.

### A Calculator

```js
import { xin, elements, touch } from 'tosijs'

// here's a vanilla javascript calculator
const calculator = {
  x: 4,
  y: 3,
  op: '+',
  result: 0,
  evaluate() {
    this.result = eval(`${this.x} ${this.op} ${this.y}`)
  }
}

calculator.evaluate()

xin.calculatorExample = calculator

// now we'll give it a user interface…
const { input, select, option, div, span } = elements

preview.append(
  div(
    {
      onChange() {
        calculator.evaluate()
        touch('calculatorExample.result')
      }
    },
    input({bindValue: 'calculatorExample.x', placeholder: 'x'}),
    select(
      {
        bindValue: 'calculatorExample.op'
      },
      option('+'),
      option('-'),
      option({value: '*'}, '×'),
      option({value: '/'}, '÷'),
    ),
    input({bindValue: 'calculatorExample.y', placeholder: 'y'}),
    span('='),
    span({bind: {value: 'calculatorExample.result', binding: 'text'}})
  )
)
```

Important points:

- `xin` points at a single object. It's a [Singleton](https://en.wikipedia.org/wiki/Singleton_pattern).
- `boxed` points to the **same** object
- `xin` and `boxed` are observers. They watch the object they point to and
  track changes made by accessing the underlying data through them.
- because `calculator.evaluate()` changes `calculator.result`
  directly, `touch()` is needed to tell `xin` that the change occurred.
  See [path-listener](/path-listener/) for more documentation on `touch()`.
- `xin` is more than just an object!
    - `xin['foo.bar']` gets you the same thing `xin.foo.bar` gets you.
    - `xin.foo.bar = 17` tells `xin` that `foo.bar` changed, which triggers DOM updates.

> If you're reading this on tosijs.net then this the demo app you're looking
> works a bit like this and `xin` (and `boxed`) are exposed as globals so
> you can play with them in the **debug console**.
>
> Try going into the console and typing `xin.app.title` to see what you get,
> and then try `xin.app.title = 'foobar' and see what happens to the heading.
>
> Also try `xin.prefs.theme` and try `app.prefs.theme = 'dark'` etc.

Once an object is assigned to  `xin`, changing it within `xin` is simple.
Try this in the console:

```
xin.calculatorExample.x = 17
```

This will update the `x` field in the calculator, but not the result.
The result is updated when a `change` event is triggered.

If you wanted the calculator to update based on *any* change to its
internal state, you could instead write:

```
observe('calculatorExample', () => {
  calculator.evaluate()
  touch('calculatorExample.result')
})
```

Now the `onChange` handler isn't necessary at all. `observe`
is documented in [path-listener](/path-listener/).

```js
import { observe, xin, elements } from 'tosijs'

const { h3, div } = elements

const history = div('This shows changes made to the preceding example')

preview.append(
  h3('Changes to the calculatorExample'),
  history
)

observe(/calculatorExample\./, path => {
  const value = xin[path]
  history.insertBefore(div(`${path} = ${value}`), history.firstChild)
})
```

Now, if you sneakily make changes behind `xin`'s back, e.g. by modifying the values
directly, e.g.

```
const emails = await getEmails()
xin.emails = emails

// notes that xin.emails is really JUST emails
emails.push(...)
emails.splice(...)
emails[17].from = '...'
```

Then `xin` won't know and observers won't fire. So you can simply `touch` the path
impacted:

```
import { touch } from 'tosijs'
touch('emails')
```

In the calculator example, the vanilla `calculator` code calls `evaluate` behind
`xin`'s back and uses `touch('calculatorExample.result')` to let `xin` know that
`calculatorExample.result` has changed. This causes `xin` to update the
DOM.

## How it works

`xin` is a `Proxy` wrapped around a bare object: effectively a map of strings to values.

When you access the properties of an object assigned to `xin` it wraps the values in
similar proxies, and tracks the **path** that got you there:

```
xin.foo = {
  bar: 'baz',
  luhrman: {
    job: 'director'
  }
}
```

Now if you pull objects back out of `xin`:

```
let foo = xin.foo
let luhrman = foo.luhrman
```

`foo` is a `Proxy` wrapped around the original *untouched* object, and it knows it came from 'foo'.
Similarly `luhrman` is a `Proxy` that knows it came from 'foo.luhrman'.

If you **change** a value in a wrapped object, e.g.

```
foo.bar = 'bob'
luhrman.job = 'writer'
```

Then it will trigger any observers looking for relevant changes. And each change will fire the observer
and tell it the `path` that was changed. E.g. an observer watching `lurman` will be fired if `lurman`
or one of `lurman`'s properties is changed.

## The `boxed` proxy

`boxed` is a sister to `xin` that wraps "scalar" values (`boolean`, `number`, `string`) in
lightweight proxies. These proxies know their path and provide convenient access to the
underlying value. E.g. if you write something like:

```
xin.test = { answer: 42 }
boxed.box = { pie: 'apple' }
```

Then:

```
xin.test.answer === 42
xin.box.pie === 'apple'
// boxed scalars have .value and .path
boxed.test.answer.value === 42
boxed.box.pie.value === 'apple'
boxed.test.answer.path === 'test.answer'
boxed.box.pie.path === 'box.pie'
// valueOf() works for coercion
boxed.test.answer.valueOf() === 42
String(boxed.box.pie) === 'apple'
```

Boxed scalars also delegate to the underlying value's prototype methods,
so you can call string, number, and boolean methods directly:

```
boxed.box.pie.toUpperCase() === 'APPLE'
boxed.box.pie.startsWith('app') === true
boxed.box.pie.length === 5
boxed.test.answer.toFixed(2) === '42.00'
```

Aside from always "boxing" scalar values, `boxed` works just like `xin`.

In the console, you can also access `boxed` and look at what happens if you
access `boxed.xinExample.string`. Note that this changes the value you get,
the underlying value is still what it was. If you set it to a new `string`
value that's what will be stored. `xin` doesn't monkey with the values you
assign.

### Why?!

As far as Typescript is concerned, `xinProxy` just passes back what you put into it,
which means that you can now write bindings with type-checking and autocomplete and
never use string literals. So something like this *just works*:

```
const div = elements.div({textContent: boxed.box.pie})
```

…because `boxed.box.pie` carries its `.tosi.path`, which is what is actually used for
binding, whereas `xin.box.pie` is just a scalar value.

Note the distinction: `textContent` binds a **proxy**. Given a path **string** it
would set literal text, so the string form needs the inline binding —
`bind: { value: 'box.pie', binding: 'text' }` — and you get no lint support or
autocomplete either way. (Also, in
some cases, you might even mangle the names of an object during minification and
`boxed` will know the mangled name).

### If you need the thing itself or the path to the thing…

`proxy`s returned by `xin` are typically indistinguishable from the original object, but
in a pinch `.tosi.path` gives you the path (`string`) of a proxy and `.tosi.value` (or
just `.value`) gives its "bare" value. The `tosiPath()` and `tosiValue()` functions do the
same and also work on non-proxies — `tosiPath(x)` returns `undefined` for a regular object,
so it doubles as a proxy test.

E.g.

```
tosiPath(luhrman) === 'foo.luhrman'     // true
const bareLurhman = tosiValue(luhrman)  // not wrapped
```

You may want the thing itself to, for example, perform a large number of changes to an
object without firing observers. You can let `xin` know you've made changes behind its back using
`touch`, e.g.

```
doTerribleThings(tosiValue(luhrman))
// eslint-disable-next-line
touch(luhrman)
```

This is **useful** because `boxed.foo.bar` always knows where it came from, while
`xin.foo.bar` only knows where it came from if it's an object value.

This means you can write:

```js
import { boxed, elements } from 'tosijs'

boxed.boxedExample = {
  string: 'hello, boxed'
}

const { boxedExample } = boxed

const { label, input, div, span } = elements

preview.append(
  div(
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 10
      }
    },
    div({textContent: boxedExample.string}),
    label(
      span('Edit this'),
      input({ bindValue: boxedExample.string})
    )
  )
)
```

And the difference here is you can bind direct to the reference itself rather
than a string. This leverages autocomplete, linting, and so on in a way that
using string paths doesn't.

It does have a downside! `boxedExample.string !== 'hello, boxed'` and
`boxedExample.string !== boxedExample.string` because they're proxies, not primitives.
This is critical for comparisons such as `===` and `!==`.
Always use `.value`, `tosiValue()`, or `valueOf()` when comparing:
`boxed.foo.bar.value === 'hello'` or `tosiValue(boxed.foo.bar) === 'hello'`.

## The `.tosi` accessor

Every boxed proxy has a `.tosi` property that provides the full reactive API
without risk of name collisions. If your data has properties named `value`,
`path`, `observe`, etc., those will shadow the proxy's direct API — but `.tosi`
is always available.

```
proxy.foo.tosi.value        // get the underlying value
proxy.foo.tosi.value = 17   // set it (triggers observers)
proxy.foo.tosi.path         // 'foo'
proxy.foo.tosi.observe(cb)  // watch for changes
proxy.foo.tosi.touch()      // force update notification
proxy.foo.tosi.bind(el, binding)
proxy.foo.tosi.on(el, eventType)
proxy.foo.tosi.binding(binding)
proxy.foo.tosi.listBinding(templateBuilder, options)
proxy.foo.tosi.listFind(selector, value)
proxy.foo.tosi.listUpdate(selector, newValue)
proxy.foo.tosi.listRemove(selector, value)
```

This is the recommended API. The only reserved name is `tosi` itself — don't
use it as a property name in your data.

If you do have data with a `tosi` property, use `tosiAccessor(proxy)` or
the `TOSI_ACCESSOR` symbol directly — these are guaranteed collision-free:

```
import { tosiAccessor, TOSI_ACCESSOR } from 'tosijs'

const acc = tosiAccessor(proxy.foo)  // always works
const acc2 = proxy.foo[TOSI_ACCESSOR]  // also always works
acc.value  // underlying value
acc.path   // path string
```

## Direct helper properties (deprecated)

The following properties are also available directly on boxed proxies, but
they can be shadowed by actual properties on the target object. Prefer
`.tosi.*` instead:

- `.value` gets or sets the underlying value
- `.path` gets the string path
- `.observe(callback)` watches for changes, returns an unsubscribe function
- `.touch()` forces an update notification
- `.bind(element, binding, options?)` binds the value to a DOM element
- `.on(element, eventType)` binds an event handler
- `.binding(binding)` returns an inline binding spec for use with elements
- `.listBinding(templateBuilder, options?)` returns a list binding spec
- `.valueOf()` / `.toJSON()` for type coercion (scalars also have `.toString()`)

Boxed scalars also expose all methods from the underlying primitive's prototype
(e.g. `.toUpperCase()`, `.startsWith()`, `.toFixed()`, `.length`, index access).

### Type coercion

`Number()`, `String()`, arithmetic, template literals, and `==` comparison
all work on boxed scalars via `Symbol.toPrimitive`:

    Number(proxy.score)       // 42
    String(proxy.name)        // 'Alice'
    proxy.score + 1           // 43
    `hello ${proxy.name}`     // 'hello Alice'
    proxy.score == 42         // true

**`Boolean()` is the exception** — in JavaScript, `Boolean(anyObject)` always
returns `true`. This is a language-level behavior, not a tosijs limitation
(`Boolean(new Boolean(false))` is also `true`). For boolean checks, use
`.value` or `.valueOf()`:

    // ❌ Always true — Boolean() on any object
    if (Boolean(proxy.flag)) ...

    // ✅ Correct
    if (proxy.flag.value) ...
    if (proxy.flag.valueOf()) ...

Arrays also have:
- `.listFind(selector, value)` finds an item by field and returns it proxied
- `.listFind(element)` finds the array item bound to a DOM element
- `.listUpdate(selector, newValue)` updates an existing item in place or pushes if not found
- `.listRemove(selector, value)` removes an item by field match

> Note: The `xinValue`, `xinPath`, `xinObserve`, `xinBind`, `xinOn`, and
> `tosiValue`, `tosiPath`, etc. names still work but are deprecated.
> Use `.tosi.*` instead.

## `.take()` — Reactive Binding Transforms

`.take()` creates a reactive binding descriptor that transforms values before
they reach the DOM. It eliminates most custom bindings.

### Single-path transform

```js
import { tosi, elements } from 'tosijs'

const { takeDemo } = tosi({ takeDemo: { count: 3, items: ['a', 'b', 'c'] } })

const { span, button } = elements

preview.append(
  span({ textContent: takeDemo.count.tosi.take(n => `Count: ${n}`) }),
  button('Delete', {
    disabled: takeDemo.items.tosi.take(list => list.length === 0),
  })
)
```

### Multi-path transform

Pass additional proxies before the transform function. The transform receives
all current values when any of the watched paths change.

```js
import { tosi, elements } from 'tosijs'

const { takeMultiDemo } = tosi({
  takeMultiDemo: { firstName: 'Alice', lastName: 'Smith' }
})

const { span, input, label } = elements

preview.append(
  span({ textContent: takeMultiDemo.firstName.tosi.take(
    takeMultiDemo.lastName,
    (first, last) => `${first} ${last}`
  ) }),
  label('First', input({ bindValue: takeMultiDemo.firstName })),
  label('Last', input({ bindValue: takeMultiDemo.lastName })),
)
```

`.take()` is efficient: the transform only runs when the input values actually
change (compared by identity). If an observer fires but the value is the same,
the transform is skipped entirely.

### Filtered list with `.take()`

`.take()` works with list bindings to create reactive filtered views. The filter
re-evaluates when any of the watched paths change, but the list binding still
does surgical DOM updates.

```js
import { elements, tosi, touch } from 'tosijs'

const { takeFilterDemo } = tosi({
  takeFilterDemo: {
    search: '',
    items: [
      { id: 1, name: 'Alice', role: 'engineer' },
      { id: 2, name: 'Bob', role: 'designer' },
      { id: 3, name: 'Carol', role: 'engineer' },
      { id: 4, name: 'Dave', role: 'manager' },
      { id: 5, name: 'Eve', role: 'designer' },
    ]
  }
})

const { div, input, label, ul } = elements

preview.append(
  div(
    { style: { display: 'flex', flexDirection: 'column', gap: 10, padding: 10 } },
    label('Filter', input({
      placeholder: 'type to filter...',
      bindValue: takeFilterDemo.search,
    })),
    div({
      textContent: takeFilterDemo.items.tosi.take(
        takeFilterDemo.search,
        (items, search) => {
          const s = search.toLowerCase()
          const count = s ? items.filter(i => i.name.toLowerCase().includes(s) || i.role.includes(s)).length : items.length
          return `Showing ${count} of ${items.length}`
        }
      ),
      style: { fontStyle: 'italic', opacity: 0.7 },
    }),
    ul(
      ...takeFilterDemo.items.tosi.listBinding(
        ({li, span}, item) => li(
          span({ textContent: item.name, style: { fontWeight: 'bold' } }),
          ' — ',
          span({ textContent: item.role }),
        ),
        {
          idPath: 'id',
          filter: (items, needle) => needle
            ? items.filter(i => i.name.toLowerCase().includes(needle) || i.role.includes(needle))
            : items,
          needle: takeFilterDemo.search.tosi.take(s => s.toLowerCase()),
        }
      )
    )
  )
)
```

## List Operations

When working with list-bound arrays, you often need to find, update, or remove
items efficiently. The `listFind`, `listUpdate`, and `listRemove` methods on
proxied arrays handle this with the same selector pattern used by `listBinding`.

### Selectors

All three methods use a **selector callback** to identify which field to match on.
The callback receives a placeholder proxy (the same `^` proxy trick used by
`listBinding`) and should return a property of the item:

    (item) => item.id        // match on the 'id' field
    (item) => item.uid       // match on 'uid'
    (item) => item.meta.key  // nested field paths work too

### `listFind(selector, value)` / `listFind(element)`

Find an item and return it as a proxied object (so mutations trigger observers):

    const item = app.items.listFind((item) => item.id, 'abc')
    if (item) {
      item.name.value = 'Updated'  // triggers observers + DOM updates
    }

You can also pass a DOM element to find the array item bound to it — useful
in click handlers on list-bound elements:

    container.addEventListener('click', (e) => {
      const item = app.items.listFind(e.target)
      if (item) console.log('Clicked:', item.name.value)
    })

### `listUpdate(selector, newValue)`

Upsert: update an existing item **in place** or push a new one. This is the
recommended way to update list items because it preserves object identity —
the `itemToElement` WeakMap still maps to the same DOM element, so no
teardown/recreation occurs:

    // Update existing — only changed properties fire observers
    app.items.listUpdate((item) => item.id, {
      id: 'abc', name: 'New Name', score: 100
    })

    // Item not found — pushes as new
    app.items.listUpdate((item) => item.id, {
      id: 'xyz', name: 'Brand New'
    })

Returns the proxied item (existing or newly pushed).

### `listRemove(selector, value)`

Remove an item by field match. Returns `true` if removed, `false` if not found:

    app.items.listRemove((item) => item.id, 'abc')  // true if found

### To Do List Example

Each of the features described thus far, along with the features of the
`elementCreator` functions provided by the [elements](/elements/) proxy
are designed to eliminate boilerplate, simplify your code, and reduce
the chance of making costly errors.

This example puts all of this together.

```js
import { elements, tosi } from 'tosijs'

const { todos } = tosi({
  todos: {
    list: [],
    newItem: ''
  }
})

const { h3, div, label, input, button, template } = elements

const addItem = () => {
  todos.list.push({
    description: todos.newItem.value
  })
  todos.newItem.value = ''
}

preview.append(
  h3('To do'),
  div(
    ...todos.list.tosi.listBinding(({ div }) =>
      div({ bind: { value: '^.description', binding: 'text' } })
    )
  ),
  div(
    input({
      placeholder: 'task',
      bindValue: todos.newItem,
      onKeyup(event) {
        if(event.key === 'Enter' && todos.newItem.value !== '') {
          addItem()
        }
      }
    }),
    button('Add', {
      disabled: todos.newItem.tosi.take(text => !text),
      onClick: addItem
    })
  )
)
```
*/

import {
  TosiProxyObject,
  TosiProxyTarget,
  TosiObject,
  TosiProxy,
  BoxedProxy,
  TosiArray,
  TosiValue,
  TosiBinding,
  PathTestFunction,
  ObserverCallbackFunction,
  TosiEventHandler,
} from './xin-types'
import { settings } from './settings'
import {
  Listener,
  touch,
  observe as _observe,
  unobserve,
  updates,
} from './path-listener'
import { getByPath, setByPath } from './by-path'
import { getBind, getOn } from './registry'
import { ElementsProxy } from './elements-types'
import { elements } from './elements'
import {
  tosiValue,
  XIN_VALUE,
  XIN_PATH,
  XIN_OBSERVE,
  XIN_BIND,
  XIN_ON,
  TOSI_ACCESSOR,
  TAKE_DESCRIPTOR,
  LIST_INSTANCE_REF,
} from './metadata'

interface ProxyConstructor {
  revocable: <T extends object, P extends object>(
    target: T,
    handler: ProxyHandler<P>
  ) => { proxy: P; revoke: () => void }
  new <T extends object>(target: T, handler: ProxyHandler<T>): T
  new <T extends object, P extends object>(
    target: T,
    handler: ProxyHandler<P>
  ): P
}
declare let Proxy: ProxyConstructor

// list of Array functions that change the array
const ARRAY_MUTATIONS = [
  'sort',
  'splice',
  'copyWithin',
  'fill',
  'pop',
  'push',
  'reverse',
  'shift',
  'unshift',
]

import { registry, setXinProxy } from './registry'

const debugPaths = true

// in essence this very liberally matches foo ( .bar | [17] | [id=123] ) *
const validPath =
  /^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/

const isValidPath = (path: string): boolean => validPath.test(path)

const extendPath = (path = '', prop = ''): string => {
  if (path === '') {
    return prop
  } else {
    if (prop.startsWith('[') && prop.endsWith(']')) {
      // already a bracketed segment — the compound-path branch hands us
      // basePaths like '[0]' or '[id=x]'. Append verbatim: re-bracketing
      // produced 'list[[id=x]]' and dot-joining produced 'list.[0]', either
      // way a malformed path whose bindings never resolve or fire
      return `${path}${prop}`
    } else if (prop.match(/^\d+$/) !== null || prop.includes('=')) {
      return `${path}[${prop}]`
    } else {
      return `${path}.${prop}`
    }
  }
}

// Single shared target for all boxed scalar proxies - the proxy handler
// closure contains all the actual information (path), and values are
// always read from/written to the registry
const boxedScalarTarget = {}

function box<T>(x: T, path: string): T {
  // Objects and functions don't need boxing - they get proxied directly
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    return x
  }
  // For scalars, use the shared target - path is captured in the handler closure
  return new Proxy<TosiProxyTarget, TosiObject>(
    boxedScalarTarget,
    regHandler(path, true)
  ) as T
}

const listElement = () => new Proxy({}, regHandler('^', true))

// List operation helpers

const selectorToFieldPath = (selector: (item: any) => any): string => {
  const result = selector(listElement())
  const resultPath = result?.path
  if (!resultPath?.startsWith('^.')) {
    throw new Error('selector must return a property of the item')
  }
  return resultPath.substring(2)
}

const findByField = (target: any[], fieldPath: string, value: any): number => {
  for (let i = 0; i < target.length; i++) {
    if (`${getByPath(target[i], fieldPath)}` === `${value}`) return i
  }
  return -1
}

const makeListMethods = (path: string, target: any[]) => ({
  listFind(selectorOrElement: any, value?: any) {
    if (selectorOrElement instanceof Element) {
      let el = selectorOrElement as any
      while (el && !el[LIST_INSTANCE_REF] && el.parentElement) {
        el = el.parentElement
      }
      const rawItem = el?.[LIST_INSTANCE_REF]
      if (rawItem == null) return undefined
      const index = target.indexOf(rawItem)
      return index !== -1 ? boxed[path][index] : undefined
    }
    const fieldPath = selectorToFieldPath(selectorOrElement)
    const index = findByField(target, fieldPath, value)
    return index !== -1 ? boxed[path][index] : undefined
  },

  listUpdate(selector: any, newValue: any) {
    const fieldPath = selectorToFieldPath(selector)
    const matchValue = getByPath(newValue, fieldPath)
    const index = findByField(target, fieldPath, matchValue)
    if (index !== -1) {
      const proxiedItem = boxed[path][index]
      for (const key of Object.keys(newValue)) {
        proxiedItem[key] = (newValue as any)[key]
      }
      return proxiedItem
    }
    boxed[path].push(newValue)
    return boxed[path][target.length - 1]
  },

  listRemove(selector: any, value: any) {
    const fieldPath = selectorToFieldPath(selector)
    const index = findByField(target, fieldPath, value)
    if (index === -1) return false
    boxed[path].splice(index, 1)
    return true
  },
})

// Single deprecation warning for all legacy property names
let deprecationWarned = false
function warnDeprecation() {
  if (!deprecationWarned) {
    console.warn(
      // NAME ONLY WHAT IS ACTUALLY DEPRECATED. This message used to say
      // "xinValue, tosiValue, xinPath, tosiPath ... are deprecated", which is
      // false for two of them: `tosiValue()` and `tosiPath()` are the
      // CANONICAL free functions (metadata.ts), they work on non-proxies, and
      // this file alone calls `tosiValue` 22 times. A user obeying the warning
      // migrated off the recommended API. The deprecated things are the
      // PROPERTY spellings and the `xin*` free functions.
      'The .xinValue / .tosiValue / .xinPath / .tosiPath properties and the ' +
        'xinValue() / xinPath() functions are deprecated. Use .tosi.value, ' +
        '.tosi.path, .tosi.observe() — or the tosiValue() / tosiPath() ' +
        'functions, which are NOT deprecated and work on non-proxies too.'
    )
    deprecationWarned = true
  }
}

// Check if target is a boxed scalar proxy
const isBoxedScalar = (target: any): boolean => {
  return target === boxedScalarTarget
}

// Accessor handler — wraps the same target, dispatches accessor API via get/set
const accessorHandler = (path: string, target: any): ProxyHandler<any> => ({
  get(_t, prop) {
    switch (prop) {
      case 'value':
        return getByPath(registry, path)
      case 'path':
        return path
      case 'touch':
        return () => touch(path)
      case 'observe':
        return (callback: ObserverCallbackFunction) => {
          const listener = _observe(path, callback)
          return () => unobserve(listener)
        }
      case 'bind':
        return (
          element: Element,
          binding: TosiBinding,
          options?: TosiObject
        ) => {
          getBind()(element, path, binding, options)
        }
      case 'on': {
        const val =
          target === boxedScalarTarget
            ? getByPath(registry, path)
            : target.valueOf
            ? target.valueOf()
            : target
        return (
          element: HTMLElement,
          eventType: keyof HTMLElementEventMap
        ): VoidFunction => getOn()(element, eventType, val as TosiEventHandler)
      }
      case 'binding':
        return (binding: TosiBinding) => ({
          bind: { value: path, binding },
        })
      case 'listBinding':
        return (
          content: (
            e: ElementsProxy,
            obj: BoxedProxy,
            columnIndex?: number
          ) => HTMLElement = ({ span }) =>
            // NOT `{ textContent: '^' }` — that sets the LITERAL string. A
            // path only binds through the inline `bind` form; `textContent`
            // binds a proxy, not a path.
            span({ bind: { value: '^', binding: 'text' } }),
          options: TosiObject = {}
        ) => {
          const n = options.virtual?.itemsPerRow ?? 1
          const templates = []
          for (let col = 0; col < n; col++) {
            templates.push(content(elements, listElement(), col))
          }
          return [
            // `bindList` is the low-level prop form and this is its sugar.
            // (An earlier fix emitted `{ bind: { binding: 'list', options } }`
            // to dodge a deprecation warning — which collided with a caller's
            // own `bind:` and silently destroyed the list. The warning was the
            // bug; the key is fine.)
            { bindList: { value: path, ...options } },
            elements.template(...templates),
          ]
        }
      case 'listFind':
      case 'listUpdate':
      case 'listRemove':
        return makeListMethods(path, Array.isArray(target) ? target : [])[
          prop as 'listFind' | 'listUpdate' | 'listRemove'
        ]
      case 'take':
        return (...args: any[]) => {
          const transform = args[args.length - 1]
          const extraSources = args.slice(0, -1)
          const extraPaths = extraSources.map((p: any) =>
            typeof p === 'string' ? p : p[XIN_PATH]
          )
          return {
            [TAKE_DESCRIPTOR]: true,
            paths: [path, ...extraPaths],
            transform,
          }
        }
    }
    return undefined
  },
  set(_t, prop, v) {
    if (prop === 'value') {
      v = tosiValue(v)
      const existing = tosiValue(xin[path])
      if (existing !== v && setByPath(registry, path, v)) {
        touch(path)
      }
      return true
    }
    return false
  },
})

const makeTosiAccessor = (path: string, target: any) =>
  new Proxy(target, accessorHandler(path, target))

// Accessor API property names — looked up on every get, so use a Set
/**
 * THE ACCESSOR SURFACE, AS DATA. This list is what the `get` trap actually
 * serves — it is the implementation's own answer to "what is the accessor
 * API", and therefore the only authoritative one.
 *
 * It is `as const` so the TYPES can be checked against it rather than
 * hand-restating it. Six declaration surfaces describe this one proxy
 * (`TosiAccessor`, `TosiProps`, `BoxedScalarAPI`, `BoxedArrayProps`,
 * `BoxedScalar`, `BoxedProxy`), nothing kept them in sync, and they drifted:
 * `tosiBinding` was present on two and missing from a third for an unknown
 * number of releases. `src/type-surface.test.ts` now fails if a name here is
 * absent from the declared accessor type.
 */
export const ACCESSOR_PROP_NAMES = [
  'path',
  'value',
  'touch',
  'observe',
  'bind',
  'on',
  'binding',
  'listBinding',
  'listFind',
  'listUpdate',
  'listRemove',
  'take',
] as const

const ACCESSOR_PROPS = new Set<string>(ACCESSOR_PROP_NAMES)

/*
 * SYMBOLS ARE NOT DEPRECATED — they are the unshadowable escape hatch, and the
 * library uses them internally (bind.ts alone reads `[XIN_PATH]` eight times).
 * They were in the same map as the deprecated STRING spellings, so every one of
 * those internal reads fired "xinValue, tosiValue, xinPath, tosiPath … are
 * deprecated" at the consumer, for API the consumer never touched (tosijs#31).
 *
 * Split: symbols resolve silently, strings warn.
 */
const SYMBOL_MAP = new Map<symbol, string>([
  [XIN_PATH, 'path'],
  [XIN_VALUE, 'value'],
  // ONLY THESE TWO. `XIN_OBSERVE` and `XIN_ON` are *strings* — 'xinObserve'
  // and 'xinOn', the deprecated spellings themselves — so they belong in
  // LEGACY_MAP and must keep warning. tsc caught this; the first draft
  // silenced two genuinely deprecated names.
])

// Legacy/deprecated property names → accessor property they map to
const LEGACY_MAP = new Map<string | symbol, string>([
  [XIN_PATH, 'path'],
  ['xinPath', 'path'],
  ['tosiPath', 'path'],
  [XIN_VALUE, 'value'],
  ['xinValue', 'value'],
  ['tosiValue', 'value'],
  [XIN_OBSERVE, 'observe'],
  ['xinObserve', 'observe'],
  ['tosiObserve', 'observe'],
  [XIN_ON, 'on'],
  ['xinOn', 'on'],
  ['tosiOn', 'on'],
  [XIN_BIND, 'bind'],
  ['xinBind', 'bind'],
  ['tosiBind', 'bind'],
  ['tosiBinding', 'binding'],
  ['tosiListBinding', 'listBinding'],
])

const regHandler = (
  path: string,
  boxScalars: boolean
): ProxyHandler<TosiObject> => ({
  get(target: TosiObject | TosiArray, _prop: string | symbol): TosiValue {
    // .tosi / TOSI_ACCESSOR — collision-free accessor API
    if ((_prop === 'tosi' || _prop === TOSI_ACCESSOR) && boxScalars) {
      return makeTosiAccessor(path, target)
    }

    // For boxed scalars, intercept property access - value always comes from registry
    if (isBoxedScalar(target)) {
      const getValue = () => getByPath(registry, path)

      // Coercion methods — must live on the main proxy
      switch (_prop) {
        case 'valueOf':
        case 'toJSON':
          return () => getValue()
        case Symbol.toPrimitive:
          return (hint: string) => {
            const val = getValue()
            if (hint === 'number') return Number(val)
            if (hint === 'string') return String(val)
            return val
          }
        case 'toString':
          return () => String(getValue())
      }

      // Accessor API — delegate to accessor proxy
      if (ACCESSOR_PROPS.has(_prop as string)) {
        return makeTosiAccessor(path, target)[_prop]
      }

      // Symbol escape hatches — current API, resolve silently
      const bySymbol =
        typeof _prop === 'symbol' ? SYMBOL_MAP.get(_prop) : undefined
      if (bySymbol !== undefined) {
        return makeTosiAccessor(path, target)[bySymbol]
      }

      // Deprecated prefixed names — delegate to accessor
      const mapped = LEGACY_MAP.get(_prop)
      if (mapped !== undefined) {
        warnDeprecation()
        return makeTosiAccessor(path, target)[mapped]
      }

      // Delegate to underlying primitive for unrecognized properties
      // (string methods, number methods, index access, etc.)
      const val = getValue()
      if (val != null) {
        const wrapped = Object(val)
        if (_prop in wrapped) {
          const member = wrapped[_prop]
          return typeof member === 'function' ? member.bind(wrapped) : member
        }
      }

      return undefined
    }

    // valueOf/toJSON — must override the inherited Object.prototype versions.
    // RESOLVED BY PATH, not from the captured target: a held object proxy whose
    // parent was replaced must not serialize the value it was created over.
    if (boxScalars && (_prop === 'valueOf' || _prop === 'toJSON')) {
      return () => getByPath(registry, path)
    }

    // For non-boxed-scalar objects: accessor API (only when not shadowed by target)
    if (
      boxScalars &&
      !(_prop in target) &&
      ACCESSOR_PROPS.has(_prop as string)
    ) {
      return makeTosiAccessor(path, target)[_prop]
    }

    // Legacy prefixed API — works for both xin and boxed proxies
    const legacyMapped = LEGACY_MAP.get(_prop)
    if (legacyMapped !== undefined) {
      return makeTosiAccessor(path, target)[legacyMapped]
    }
    if (typeof _prop === 'symbol') {
      return (target as TosiObject)[_prop]
    }

    // Check for non-configurable, non-writable properties (e.g., String character indices)
    // Proxy invariant: must return the exact target value for such properties
    const descriptor = Object.getOwnPropertyDescriptor(target, _prop)
    if (
      descriptor &&
      !descriptor.configurable &&
      !descriptor.writable &&
      'value' in descriptor
    ) {
      return descriptor.value
    }

    let prop = _prop
    const compoundProp =
      prop.match(/^([^.[]+)\.(.+)$/) ?? // basePath.subPath (omit '.')
      prop.match(/^([^\]]+)(\[.+)/) ?? // basePath[subPath
      prop.match(/^(\[[^\]]+\])\.(.+)$/) ?? // [basePath].subPath (omit '.')
      prop.match(/^(\[[^\]]+\])\[(.+)$/) // [basePath][subPath
    if (compoundProp !== null) {
      const [, basePath, subPath] = compoundProp
      const currentPath = extendPath(path, basePath)
      const value = tosiValue(getByPath(target, basePath))
      return value !== null && typeof value === 'object'
        ? new Proxy<TosiObject, TosiProxyObject>(
            value,
            regHandler(currentPath, boxScalars)
          )[subPath]
        : value
    }
    if (prop.startsWith('[') && prop.endsWith(']')) {
      prop = prop.substring(1, prop.length - 1)
    }
    if (
      (!Array.isArray(target) && target[prop] !== undefined) ||
      (Array.isArray(target) && prop.includes('='))
    ) {
      let value: TosiValue
      if (prop.includes('=')) {
        const [idPath, needle] = prop.split('=')
        value = (target as TosiObject[]).find(
          (candidate: TosiObject) =>
            `${getByPath(candidate, idPath) as string}` === needle
        )
      } else {
        // we're working around Typescript's incorrect understanding of arrays
        value = (target as TosiArray)[prop as unknown as number]
      }
      if (value instanceof Object) {
        value = tosiValue(value)
        const currentPath = extendPath(path, prop)
        return new Proxy<TosiObject, TosiProxyObject>(
          value instanceof Function ? value.bind(target) : value,
          regHandler(currentPath, boxScalars)
        ) as TosiValue
      } else {
        return boxScalars ? box(value, extendPath(path, prop)) : value
      }
    } else if (Array.isArray(target)) {
      const value = target[prop as unknown as number]
      return typeof value === 'function'
        ? (...items: any[]) => {
            // Unwrap any proxied/boxed values before passing to array methods
            // to prevent proxy objects from leaking into the underlying data
            const unwrappedItems = items.map((item) => tosiValue(item))
            const result = value.apply(target, unwrappedItems)
            if (ARRAY_MUTATIONS.includes(prop)) {
              touch(path)
            }
            // Wrap results from methods that return array items by reference
            if (result != null && typeof result === 'object') {
              if (prop === 'find' || prop === 'findLast' || prop === 'at') {
                const index = target.indexOf(result)
                if (index !== -1) {
                  return new Proxy<TosiProxyTarget, TosiObject>(
                    result,
                    regHandler(extendPath(path, String(index)), boxScalars)
                  )
                }
              }
            }
            return result
          }
        : typeof value === 'object'
        ? new Proxy<TosiProxyTarget, TosiObject>(
            tosiValue(value),
            regHandler(extendPath(path, prop), boxScalars)
          )
        : boxScalars
        ? box(value, extendPath(path, prop))
        : value
    } else {
      let val = target[prop]
      if (val !== null && typeof val === 'object') {
        val = tosiValue(val) // unwrap if already proxied (defensive)
      }
      return boxScalars ? box(val, extendPath(path, prop)) : val
    }
  },
  set(target, prop: string | symbol, value: any) {
    value = tosiValue(value)
    // A symbol key (other than the XIN_VALUE boxed-value escape hatch) is not
    // a state path — store it on the target directly. extendPath would call
    // prop.match() on it and throw. Mirrors the get trap, which passes
    // symbols through.
    if (typeof prop === 'symbol' && prop !== XIN_VALUE) {
      ;(target as any)[prop] = value
      return true
    }
    // Shallow-unwrap proxied children (e.g. from { ...proxy } spreads). Only
    // rewrite WRITABLE DATA properties: a getter/setter (computed properties are
    // legal state) or a non-writable property can't be reassigned and would throw
    // "Attempted to assign to readonly property". Reading the descriptor (rather
    // than value[k]) also means we never invoke a getter just to register state.
    if (value !== null && typeof value === 'object') {
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          const desc = Object.getOwnPropertyDescriptor(value, i)
          if (desc === undefined || desc.writable !== true) continue
          if (desc.value !== null && typeof desc.value === 'object') {
            value[i] = tosiValue(desc.value)
          }
        }
      } else {
        for (const k of Object.keys(value)) {
          const desc = Object.getOwnPropertyDescriptor(value, k)
          if (desc === undefined || desc.writable !== true) continue
          if (desc.value !== null && typeof desc.value === 'object') {
            value[k] = tosiValue(desc.value)
          }
        }
      }
    }
    // Treat 'value' as a path setter for boxed scalars AND for boxed objects/arrays
    // (when boxScalars is true, .value should always set the underlying value) —
    // UNLESS the target has a real 'value' member, mirroring the get side's
    // shadowing rule: with { slider: { value: 5, … } }, boxed.slider.value
    // reads 5, so assigning it must write slider.value — not replace the
    // whole slider object with the scalar. The symbol key (XIN_VALUE) remains
    // the unshadowable escape hatch for the boxed-value write.
    const isValueProp =
      prop === XIN_VALUE ||
      prop === 'xinValue' ||
      prop === 'tosiValue' ||
      (prop === 'value' &&
        (isBoxedScalar(target) || (boxScalars && !('value' in target))))
    const fullPath = isValueProp ? path : extendPath(path, prop as string)
    if (debugPaths && !isValidPath(fullPath)) {
      throw new Error(`setting invalid path ${fullPath}`)
    }
    const existing = tosiValue(xin[fullPath])
    if (existing !== value && setByPath(registry, fullPath, value)) {
      touch(fullPath)
    }
    return true
  },
})

const observe = (
  test: string | RegExp | PathTestFunction,
  callback: string | ObserverCallbackFunction
): Listener => {
  const func = typeof callback === 'function' ? callback : xin[callback]

  if (typeof func !== 'function') {
    throw new Error(
      `observe expects a function or path to a function, ${
        callback as string
      } is neither`
    )
  }

  return _observe(test, func as ObserverCallbackFunction)
}

const xin = new Proxy<TosiObject, TosiProxy<TosiObject>>(
  registry,
  regHandler('', false)
)

// Register xin proxy for use by bind.ts (breaks circular dependency)
setXinProxy(xin)

const boxed = new Proxy<TosiObject, BoxedProxy<TosiObject>>(
  registry,
  regHandler('', true)
)

// settings and isValidPath are only used for internal testing
export { xin, boxed, updates, touch, observe, unobserve, settings, isValidPath }
