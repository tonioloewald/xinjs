# The Observer Proxy (tosi)

`tosi()` assigns an object passed to it to a global state object,
and returns an observer proxy (`BoxedProxy`, a JavaScript
[`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)) wrapped around the global state object.

BoxedProxy wraps any object you pull out of it in an observer
proxy. It boxes booleans, numbers, and strings in lightweight proxies
that know their path and can access/modify the underlying value.

In rough terms:

```
const state = {}
const boxed = new Proxy(state, ...)
tosi = (obj<T>): BoxedProxy<T> => {
  Object.assign(state, obj)
  return boxed
}
```

This allows the following pattern, which gives Typescript a lot of useful
information for free, allowing autocomplete, etc. with a minimum of
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
})

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
prefs.theme.value = 'dark'
```

> In javascript you can just write `prefs.theme = 'dark'` (TypeScript
> doesn't allow this due to asymmetric get/set type limitations).

This, in a nutshell, explains exactly what `tosijs` is designed to do.

`tosi` tracks state and allows you to bind data to your user interface
directly and with almost no code, with clean separation between business
logic and presentation.

The [`elements` proxy](/elements/) lets you build HTML elements with
data and event bindings more compactly and efficiently than you can using
JSX/TSX, and it deals in regular `HTMLElement`—no virtual DOM, transpilation
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


## In a nutshell

`tosi()` registers your object as state and hands back an **observer proxy** for it.

- The object you registered is still your object, untouched. What you get back
  is a **proxy** of it:
  ```
  const foo = { bar: 'baz' }
  const { foo: fooProxy } = tosi({ foo })
  fooProxy.bar.value === 'baz'
  fooProxy !== foo             // it is a proxy
  fooProxy.value === foo       // and foo is still there
  ```
- If you change a property through the proxy, the change is **observed**, and
  anything listening for changes to the value at that **path** is notified.
- `bind` uses this to keep the page in step with the state.

In the following example there's a `<div>` and an `<input>`. The text of the
former and the value of the latter are bound to the **path**
`tosiExample.string`.

Open the example's **Console** tab and try `tosiExample.string = 'changed'`.
You can also turn on your browser's rendering tools to see how little of the
DOM is updated. And note that typing into the input field doesn't lose any
state: your text selection and insertion point are stable.

```js
import { tosi, elements } from 'tosijs'

const { tosiExample } = tosi({
  tosiExample: {
    string: 'hello, tosi'
  }
})

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
    div(tosiExample.string),
    label(
      span('Edit this'),
      input({ bindValue: tosiExample.string })
    )
  )
)
```

- a **path** typically resembles the way you'd reference a value inside
  a javascript object: `tosiExample.string`.
- **id-paths** give you stable references to items in arrays, using a
  (hopefully unique) identifier. Instead of referring to an item as
  `foo.array[3]`, if it has an `id` of `abcd1234` its path can be
  `foo.array[id=abcd1234]`. This makes handling large arrays much more efficient.
- when you pull an object out of the proxy it comes wrapped in a proxy too,
  so it continues to know its path.

### A Calculator

```js
import { tosi, elements, touch } from 'tosijs'

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

const { calculatorExample } = tosi({ calculatorExample: calculator })

// now we'll give it a user interface…
const { input, select, option, div, span } = elements

preview.append(
  div(
    {
      onChange() {
        calculator.evaluate()
        touch(calculatorExample.result)
      }
    },
    input({ bindValue: calculatorExample.x, placeholder: 'x' }),
    select(
      {
        bindValue: calculatorExample.op
      },
      option('+'),
      option('-'),
      option({value: '*'}, '×'),
      option({value: '/'}, '÷'),
    ),
    input({ bindValue: calculatorExample.y, placeholder: 'y' }),
    span('='),
    span(calculatorExample.result)
  )
)
```

Important points:

- All registered state lives in a single object. It's a
  [Singleton](https://en.wikipedia.org/wiki/Singleton_pattern), and every proxy
  `tosi()` returns is a view of it.
- The proxy is an observer. It tracks changes made **through it**.
- Because `calculator.evaluate()` changes `calculator.result` directly, on the
  plain object, `touch()` is needed to say that the change occurred.
  See [Path Listener](/path-listener/) for more on `touch()`.

Changing state through the proxy is simple. Try this in the example's console:

```
calculatorExample.x = 17
```

This will update the `x` field in the calculator, but not the result.
The result is updated when a `change` event is triggered.

If you wanted the calculator to update based on *any* change to its
internal state, you could instead write:

```
observe('calculatorExample', () => {
  calculator.evaluate()
  touch(calculatorExample.result)
})
```

Now the `onChange` handler isn't necessary at all. `observe`
is documented in [Path Listener](/path-listener/).

```js
import { observe, boxed, elements } from 'tosijs'

const { h3, div } = elements

const history = div('This shows changes made to the preceding example')

preview.append(
  h3('Changes to the calculatorExample'),
  history
)

observe(/calculatorExample\./, path => {
  // an observer is told the path; `boxed` looks any registered path up
  const value = boxed[path].value
  history.insertBefore(div(`${path} = ${value}`), history.firstChild)
})
```

Now, if you make changes behind the proxy's back, by modifying the plain
object directly:

```
const rawEmails = await getEmails()
const { emails } = tosi({ emails: rawEmails })

// the proxy cannot see any of these
rawEmails.push(...)
rawEmails.splice(...)
rawEmails[17].from = '...'
```

Then nothing is notified and observers won't fire. So you `touch` the path
that changed:

```
import { touch } from 'tosijs'
touch(emails)        // or touch('emails')
```

In the calculator example, the vanilla `calculator` code calls `evaluate` behind
the proxy's back and uses `touch(calculatorExample.result)` to say that the
result has changed, which updates the DOM.

## How it works

The state is a bare object: effectively a map of names to values. The observer
proxy is a `Proxy` wrapped around it.

When you access the properties of an object in the state, the proxy wraps the
values in similar proxies, and tracks the **path** that got you there:

```
const { foo } = tosi({
  foo: {
    bar: 'baz',
    luhrman: {
      job: 'director'
    }
  }
})

const luhrman = foo.luhrman
```

`foo` is a `Proxy` wrapped around the original *untouched* object, and it knows it came from 'foo'.
Similarly `luhrman` is a `Proxy` that knows it came from 'foo.luhrman'.

If you **change** a value through a proxy, e.g.

```
foo.bar = 'bob'
luhrman.job = 'writer'
```

Then it will trigger any observers looking for relevant changes. And each change will fire the observer
and tell it the `path` that was changed. E.g. an observer watching `luhrman` will be fired if `luhrman`
or one of `luhrman`'s properties is changed.

## Scalars are boxed

Strings, numbers and booleans cannot carry a path, so the proxy **boxes** them:
it wraps each one in a lightweight proxy that knows its path and gives you the
underlying value on request.

```
const { test, box } = tosi({
  test: { answer: 42 },
  box: { pie: 'apple' },
})

test.answer.value === 42
box.pie.value === 'apple'
test.answer.path === 'test.answer'
box.pie.path === 'box.pie'
// valueOf() works for coercion
test.answer.valueOf() === 42
String(box.pie) === 'apple'
```

Boxed scalars also delegate to the underlying value's prototype methods,
so you can call string, number, and boolean methods directly:

```
box.pie.toUpperCase() === 'APPLE'
box.pie.startsWith('app') === true
box.pie.length === 5
test.answer.toFixed(2) === '42.00'
```

Boxing changes what you *get*, not what is stored. If you set `box.pie` to a
new string, a string is what is stored; your values are never altered.

### Why?!

Because a boxed value knows its path, you can write bindings with type-checking
and autocomplete and never use string literals. So something like this *just works*:

```
const div = elements.div({ textContent: box.pie })
```

…because `box.pie` carries its path, which is what is actually used for binding.
A bare `'apple'` could not.

Note the distinction: `textContent` binds a **proxy**. Given a path **string** it
would set literal text, so the string form needs the inline binding —
`bind: { value: 'box.pie', binding: 'text' }` — and you get no lint support or
autocomplete that way. (Also, in some cases, you might even mangle the names of
an object during minification, and the proxy will know the mangled name.)

### If you need the thing itself or the path to the thing…

`.tosi.path` gives you the path (`string`) of a proxy and `.tosi.value` (or
just `.value`) gives its "bare" value. The `tosiPath()` and `tosiValue()` functions do the
same and also work on non-proxies — `tosiPath(x)` returns `undefined` for a regular object,
so it doubles as a proxy test.

E.g.

```
tosiPath(luhrman) === 'foo.luhrman'     // true
const bareLuhrman = tosiValue(luhrman)  // not wrapped
```

You may want the thing itself to, for example, perform a large number of changes to an
object without firing observers. Then say that you have, using `touch`:

```
doTerribleThings(tosiValue(luhrman))
touch(luhrman)
```

### Comparing

There is a downside to boxing! `box.pie !== 'apple'` and even
`box.pie !== box.pie`, because they're proxies, not primitives.
This is critical for comparisons such as `===` and `!==`.
Always use `.value`, `tosiValue()`, or `valueOf()` when comparing:
`box.pie.value === 'apple'` or `tosiValue(box.pie) === 'apple'`.

## The `.tosi` accessor

Every boxed proxy has a `.tosi` property that provides the full observer API
without risk of name collisions. If your data has properties named `value`,
`path`, `observe`, etc., those will shadow the proxy's direct API — but `.tosi`
is always available.

| accessor | what it does |
| --- | --- |
| `.tosi.value` | The underlying value. Assign to it to change the state, which notifies observers and updates bound elements. |
| `.tosi.path` | The path as a string, e.g. `'app.user.name'`. |
| `.tosi.observe(callback)` | Calls `callback(path)` when the value changes. Returns a function that stops observing. |
| `.tosi.touch()` | Notifies observers and bound elements without changing the value, for a change the proxy could not see. |
| `.tosi.as(transformation)` | Transforms the value in a binding: `{ textContent: price.tosi.as((n) => n.toFixed(2)) }`. See [below](#proxytosiastransformation). |
| `.tosi.bind(element, binding, options?)` | Binds the value to an element you already have. |
| `.tosi.on(element, eventType)` | When the value is a function, makes it the handler for that event on the element. |
| `.tosi.binding(binding)` | Returns a `{ bind: … }` spec to pass to an element creator, for a custom binding. |
| `.tosi.listBinding(templateBuilder, options?)` | Binds an array to a container: returns what you spread into the container's creator. See [Array Bindings](/list-binding/). |
| `.tosi.listFind(selector, value)` | Finds an item of an array by a field's value (or by a DOM element in its row) and returns it proxied. |
| `.tosi.listUpdate(selector, newValue)` | Updates the matching item in place, or adds it if there is none. |
| `.tosi.listRemove(selector, value)` | Removes the matching item. Returns whether one was found. |

Use it wherever your data might have a property with one of those names. The
only reserved name is `tosi` itself — don't use it as a property name in your
data.

If you do have data with a `tosi` property, use `tosiAccessor(proxy)` or
the `TOSI_ACCESSOR` symbol directly — these are guaranteed collision-free:

```
import { tosiAccessor, TOSI_ACCESSOR } from 'tosijs'

const acc = tosiAccessor(proxy.foo)  // always works
const acc2 = proxy.foo[TOSI_ACCESSOR]  // also always works
acc.value  // underlying value
acc.path   // path string
```

## Direct helper properties

The same API is available directly on a boxed proxy, and this is the everyday
spelling: `app.user.name.value`, `app.user.name.observe(…)`. **These are not
deprecated.** Their one hazard is shadowing: if your data has its own property
called `value`, `path`, `observe` and so on, that property wins, and `.tosi.*`
(above) is how you reach the proxy's.

- `.value` gets or sets the underlying value
- `.path` gets the string path
- `.observe(callback)` watches for changes, returns an unsubscribe function
- `.touch()` forces an update notification
- `.bind(element, binding, options?)` binds the value to a DOM element
- `.on(element, eventType)` binds an event handler
- `.binding(binding)` returns an inline binding spec for use with elements
- `.listBinding(templateBuilder, options?)` returns a list binding spec
- `.as(transformation)` transforms the value in a binding
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
- `.tosi.listFind(selector, value)` finds an item by field and returns it proxied
- `.tosi.listFind(element)` finds the array item bound to a DOM element
- `.tosi.listUpdate(selector, newValue)` updates an existing item in place or pushes if not found
- `.tosi.listRemove(selector, value)` removes an item by field match

> Note: the `xinValue` / `xinPath` / `xinObserve` / `xinBind` / `xinOn`
> **properties** on a boxed proxy still work but are deprecated — use
> `.tosi.value`, `.tosi.path`, `.tosi.observe()` and friends.
>
> **The `tosiValue()` and `tosiPath()` FUNCTIONS are not deprecated.** They are
> canonical, they are what this file uses internally (26 call sites), and they
> accept a non-proxy — which `.tosi.value` cannot. Migrating off them onto
> `.tosi.*` loses that.

## `<proxy>.tosi.as(<transformation>)`

`.tosi.as()` lets you transform a proxied value in a binding. Use it when an
element should show something computed from the state and not the state itself:
a formatted price, a button that is disabled while a list is empty, a full name
made from a first and a last name.

    span({ textContent: cart.total.tosi.as((n) => `$${n.toFixed(2)}`) })
    button('Delete', { disabled: cart.items.tosi.as((list) => list.length === 0) })

You can pass the result anywhere you would pass the proxy itself. The element is
bound to the same path as usual, and the transformation is applied to the value
on its way to the element. This eliminates the need for most
[custom bindings](/binding-to-the-dom/#custom-binding).

Two things to know:

- It goes **one way**, from state to the element. There is nothing to write back.
- The transformation runs **only when its inputs have changed** (compared by
  identity). If something touches the path but the value is the same, it is
  skipped.

> `.tosi.as()` was called `.take()` before 1.10.9. The old name still works and
> warns once.

### One value

```js
import { tosi, elements } from 'tosijs'

const { asDemo } = tosi({ asDemo: { count: 3, items: ['a', 'b', 'c'] } })

const { span, button } = elements

preview.append(
  span({ textContent: asDemo.count.tosi.as(n => `Count: ${n}`) }),
  button('Delete', {
    disabled: asDemo.items.tosi.as(list => list.length === 0),
  })
)
```

### Several values

To compute from more than one path, pass the other proxies before the function.
It is called with all of the current values whenever any of them changes.

```js
import { tosi, elements } from 'tosijs'

const { asMultiDemo } = tosi({
  asMultiDemo: { firstName: 'Alice', lastName: 'Smith' }
})

const { span, input, label } = elements

preview.append(
  span({ textContent: asMultiDemo.firstName.tosi.as(
    asMultiDemo.lastName,
    (first, last) => `${first} ${last}`
  ) }),
  label('First', input({ bindValue: asMultiDemo.firstName })),
  label('Last', input({ bindValue: asMultiDemo.lastName })),
)
```

### In a filtered list

A list binding's `needle` can use `.tosi.as()` as well, so the filter can depend on a
computed value (here, the search text in lower case). The filter runs again when
any of the paths involved changes, and the list still updates row by row.

```js
import { elements, tosi, touch } from 'tosijs'

const { asFilterDemo } = tosi({
  asFilterDemo: {
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
      bindValue: asFilterDemo.search,
    })),
    div({
      textContent: asFilterDemo.items.tosi.as(
        asFilterDemo.search,
        (items, search) => {
          const s = search.toLowerCase()
          const count = s ? items.filter(i => i.name.toLowerCase().includes(s) || i.role.includes(s)).length : items.length
          return `Showing ${count} of ${items.length}`
        }
      ),
      style: { fontStyle: 'italic', opacity: 0.7 },
    }),
    ul(
      ...asFilterDemo.items.tosi.listBinding(
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
          needle: asFilterDemo.search.tosi.as(s => s.toLowerCase()),
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

    const item = app.items.tosi.listFind((item) => item.id, 'abc')
    if (item) {
      item.name.value = 'Updated'  // triggers observers + DOM updates
    }

You can also pass a DOM element to find the array item bound to it — useful
in click handlers on list-bound elements:

    container.addEventListener('click', (e) => {
      const item = app.items.tosi.listFind(e.target)
      if (item) console.log('Clicked:', item.name.value)
    })

### `listUpdate(selector, newValue)`

Upsert: update an existing item **in place** or push a new one. This is the
recommended way to update list items because it preserves object identity —
the `itemToElement` WeakMap still maps to the same DOM element, so no
teardown/recreation occurs:

    // Update existing — only changed properties fire observers
    app.items.tosi.listUpdate((item) => item.id, {
      id: 'abc', name: 'New Name', score: 100
    })

    // Item not found — pushes as new
    app.items.tosi.listUpdate((item) => item.id, {
      id: 'xyz', name: 'Brand New'
    })

Returns the proxied item (existing or newly pushed).

### `listRemove(selector, value)`

Remove an item by field match. Returns `true` if removed, `false` if not found:

    app.items.tosi.listRemove((item) => item.id, 'abc')  // true if found

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
      disabled: todos.newItem.tosi.as(text => !text),
      onClick: addItem
    })
  )
)
```

## Under the hood: `xin`, `boxed` and `xinProxy()`

> You do not need any of this to use `tosijs`. Use `tosi()`. This section
> explains the implementation, and the older names you may meet in existing code.

There are two proxies over the same single state object, and both are exported:

- **`boxed`** is the one `tosi()` returns. It boxes scalars, as described above.
- **`xin`** is the older, raw proxy. It does **not** box scalars:
  `xin.box.pie === 'apple'`, a plain string with no `.value`, no `.path` and
  nothing to bind by reference.

Both accept a path as a string: `boxed['box.pie']` and `xin['box.pie']` look up
the same value, which is occasionally useful when all you have is a path (in an
observer callback, for instance).

`xin` is where the library began. It is a path-based implementation of the
**observer** or **pub/sub** pattern, designed to be simple to use, to work with
TypeScript's type-checking and autocompletion, and to need no build magic.

> `tosi()` was formerly called `boxedProxy()`.

After coding with `xin` for a while, it became apparent that a common pattern
was something like this:

    import myThing as _myThing from 'path/to/my-thing'
    import { xin } from 'tosijs'

    xin.myThing = _myThing
    export const myThing = xin.myThing as typeof _myThing

Now we can use the new `myThing` in a pretty intuitive way, leverage autocomplete
most of the time, and it's all pretty nice.

And because `myThing.path.to.something` is actually a `TosiProxy` we can actually
bind to it directly. So instead of typing (or mis-typing):

    customElement({bindValue: 'mything.path.to.something'}))

We can type the following and even use autocomplete:

    customElement({bindValue: mything.path.to.something}))

This gets you:

    const { myThing } = xinProxy({ myThing: ... })

And after working with that for a while, the question became, what if we could
leverage autocomplete even for non-object properties?

This gets us to:

    const { myThing } = tosi({ myThing: ... })

…(and also `boxed`). `boxedProxy()` is the old name for `tosi()`; it still
works and warns.

`boxed` and `boxedProxy` deliver a proxy wrapped around an object wrapped around
the original `string`, `boolean`, or `number`. This gets you autocomplete and
strong typing in general, at the cost of slight annoyances (e.g. having to write
`myThing.path.to.string.valueOf() === 'some value'`). That's the tradeoff. In
practice it's really very nice.

`xinProxy(foo)` takes an object of type T and returns a **`TosiProxy<T>`** — the
raw `xin` proxy, NOT a boxed one. **It is not an alias for `tosi()`.** `tosi()`
assigns into `boxed` and returns `boxed`; `xinProxy()` assigns into `xin` and
returns `xin`, and `xin` is created with `boxScalars: false`. So a scalar read
off an `xinProxy` result is the raw value: `foo.value`, `foo.path`,
`foo.observe()` and `[TOSI_ACCESSOR]` are all absent.

Prefer `tosi()` unless you specifically want unboxed scalars.

    import { tosi } from 'tosijs'

    const { foo, bar } = tosi({
      foo: 'bar',
      bar: {
        director: 'luhrmann'
      }
    })

This is syntax sugar for:

    import { boxed } from 'tosijs'

    const stuff = {
      foo: 'bar',
      bar: {
        director: 'luhrmann',
        born: 1962
      }
    }

    Object.assign(boxed, stuff)

    const { foo, bar } = boxed as TosiProxy<typeof stuff>

So, Typescript will know that `foo` is a `string` and `bar` is a `TosiProxy<typeof stuff.bar>`.

Now, `tosi()` is the same except replace `TosiProxy` with `BoxedProxy` and
now Typescript will know that `foo` is a `BoxedProxy<string>`, `bar` is a `BoxedProxy<typeof stuff.bar>`
and `bar.born` is a `BoxedProxy<number>`.

This lets you write bindings that support autocomplete and lint. Yay!

## `tosiUnique()`

`tosiUnique()` creates an observer proxy stored under a guaranteed unique key.
This is useful for component instances or any situation where you need
per-instance state without worrying about key collisions.

It returns a tuple of `[proxy, removeFunc]`:

- `proxy` is a `BoxedProxy<T>` — the observer proxy for your object
- `removeFunc` is a cleanup function that removes the state from the registry

If you pass an `owner` object (e.g. `this` in a component), the state will
be automatically cleaned up when the owner is garbage collected — no need
to call the remove function manually.

Typical usage in a component:

    class MyComponent extends Component {
      proxy = tosiUnique({ count: 0, name: '' }, this)[0]
    }

Or if you want explicit cleanup control:

    const [proxy, remove] = tosiUnique({ count: 0, name: '' })
    // ... later ...
    remove()
