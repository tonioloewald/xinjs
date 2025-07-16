/*#
# 1. xin

> In Mandarin, 信 ("xin") has several meanings including "letter", "true" and "message".
> As conceived, `xin` is intended to be the "single source of truth" for application
> state, or data.
>
> In [b8rjs](https://b8rjs.com)—`xinjs`'s predecessor—it was called
> `registry`. But registry has some bad connotations (Windows "registry") and it's
> harder to type and search for.

`xin` is a path-based implementation of the **observer** or **pub/sub**
pattern designed to be very simple and straightforward to use, leverage
Typescript type-checking and autocompletion, and let you get more done with
less code and no weird build magic (such as special decorators or "execution zones").

> Note that the interactive examples on the xinjs.net website only support Javascript.
> If you want to play with xinjs using Typescript, try the [sandbox example](https://codesandbox.io/s/xintro-mh4rbj?file=/src/index.ts)

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
  xin.foo.xinValue === foo   // foo is still there!
  ```
- if you change a property of something already in `xin` then this
  change will be `observed` and anything *listening* for changes to
  the value at that **path** will be notified.
- xinjs's `bind` method leverages the proxy to keep the UI synced
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
const { xin, elements } = tosijs

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
    div({bindText: 'xinExample.string'}),
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
const { xin, elements, touch } = tosijs

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
    span({bindText: 'calculatorExample.result' })
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
  See [path-listener](/?path-listener.ts) for more documentation on `touch()`.
- `xin` is more than just an object!
    - `xin['foo.bar']` gets you the same thing `xin.foo.bar` gets you.
    - `xin.foo.bar = 17` tells `xin` that `foo.bar` changed, which triggers DOM updates.

> If you're reading this on xinjs.net then this the demo app you're looking
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
is documented in [path-listener](/?path-listener.ts).

```js
const { observe, xin, elements } = tosijs

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
import { touch } from 'xinjs'
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
objects. E.g. if you write something like:

```
xin.test = { answer: 42 }
boxed.box = { pie: 'apple' }
```

Then:

```
xin.test.answer === 42
xin.box.pie === 'apple'
// box wraps "scalars" in objects
boxed.test.answer.valueOf() === 42
boxed.box.pie.valueOf() === 'apple'
// anything that comes out of boxed has a path!
xinPath(boxed.test.answer) === 'test.answer'
xinPath(boxed.box.pie) === 'box.pie'
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
const div = elements.div({bindText: boxed.box.pie})
```

…because `boxed.box.pie` has a `xinPath` which is what is actually used for binding,
whereas `xin.box.pie` is just a scalar value. Without `boxed` you could write
`bindText: 'box.pie'` but you don't get lint support or autocomplete. (Also, in
some cases, you might even mangle the names of an object during minification and
`boxed` will know the mangled name).

### If you need the thing itself or the path to the thing…

`proxy`s returned by `xin` are typically indistinguishable from the original object, but
in a pinch `xinPath()` will give you the path (`string`) of a `XinProxy` while `xinValue`
will give its "bare" value. `xinPath()` can also be used to test if something is actually
a proxy, as it will return `undefined` for regular objects.

E.g.

```
xinPath(luhrman) === 'foo.luhrman'     // true
const bareLurhman = xinValue(luhrman)  // not wrapped
```

You may want the thing itself to, for example, perform a large number of changes to an
object without firing observers. You can let `xin` know you've made changes behind its back using
`touch`, e.g.

```
doTerribleThings(xinValue(luhrman))
// eslint-disable-next-line
touch(luhrman)
```

This is **useful** because `boxed.foo.bar` always knows where it came from, while
`xin.foo.bar` only knows where it came from if it's an object value.

This means you can write:

```js
const { boxed, elements } = tosijs

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
    div({bindText: boxedExample.string}),
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

It does have a downside! `boxedExample.string !== 'hello, boxed'` and in fact
`boxedExample.string !== boxedExample.string` because they're two different
`String` objects. This is critical for comparisons such as `===` and `!==`.
Always use `boxed.foo.bar.xinValue`, `xinValue(boxed.foo.bar)` or `boxed.foo.bar.valueOf()`
when performing comparisons like this.

## Helper properties and functions

`XinProxy` and `BoxedProxy` provide some helper properties and functions.

- `xinValue` gets you the underlying value
- `xinPath` gets you the string path
- `xinBind(element: Element, binding: [XinBinding](/?bindings.ts), options?: {[key: string]: any})` will
  bind the `xinPath` the element with the specified binding.
  ```
  boxed.foo.color.bind(element, {
    toDOM(element, color){
      element.style.backgroundColor = color
    }
  })
  ```
- `xinOn(element: HTMLElement, eventType: keyof HTMLElementEventMap)` will
  trigger the event handler when the specified element receives
  an event of the specified type.
- `xinObserve(callback: ObserverCallbackFunction): UnobserveFunction` will
  trigger the provided callback when the value changes, and can be cancelled
  using the returned function.

### To Do List Example

Each of the features described thus far, along with the features of the
`elementCreator` functions provided by the [elements](/?elements.ts) proxy
are designed to eliminate boilerplate, simplify your code, and reduce
the chance of making costly errors.

This example puts all of this together.

```js
const { elements, boxedProxy } = tosijs

const { todos } = boxedProxy({
  todos: {
    list: [],
    newItem: ''
  }
})

const { h3, div, label, input, button, template } = elements

const addItem = () => {
  todos.list.push({
    description: todos.newItem
  })
  todos.newItem = ''
}

preview.append(
  h3('To do'),
  div(
    {
      bindList: {
        value: todos.list
      }
    },
    template(
      div({ bindText: '^.description' })
    )
  ),
  div(
    input({
      placeholder: 'task',
      bindValue: todos.newItem,
      onKeyup(event) {
        if(event.key === 'Enter' && todos.newItem != '') {
          addItem()
        }
      }
    }),
    button('Add', {
      bindEnabled: todos.newItem,
      onClick: addItem
    })
  )
)
```
*/

import {
  XinProxyObject,
  XinProxyTarget,
  XinObject,
  XinProxy,
  BoxedProxy,
  XinArray,
  XinValue,
  XinBinding,
  PathTestFunction,
  ObserverCallbackFunction,
  XinEventHandler,
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
import { bind, on } from './bind'
import {
  xinValue,
  XIN_VALUE,
  XIN_PATH,
  XIN_OBSERVE,
  XIN_BIND,
  XIN_ON,
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

const registry: XinObject = {}
const debugPaths = true
const validPath =
  /^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/

const isValidPath = (path: string): boolean => validPath.test(path)

const extendPath = (path = '', prop = ''): string => {
  if (path === '') {
    return prop
  } else {
    if (prop.match(/^\d+$/) !== null || prop.includes('=')) {
      return `${path}[${prop}]`
    } else {
      return `${path}.${prop}`
    }
  }
}

const boxes: { [key: string]: (x: any) => any } = {
  string(s: string) {
    return new String(s)
  },
  boolean(b: boolean) {
    return new Boolean(b)
  },
  bigint(b: bigint) {
    return b
  },
  symbol(s: symbol) {
    return s
  },
  number(n: number) {
    return new Number(n)
  },
}

function box<T>(x: T, path: string): T {
  const t = typeof x
  if (x === undefined || t === 'object' || t === 'function') {
    return x
  } else {
    return new Proxy<XinProxyTarget, XinObject>(
      boxes[typeof x](x),
      regHandler(path, true)
    ) as T
  }
}

const regHandler = (
  path: string,
  boxScalars: boolean
): ProxyHandler<XinObject> => ({
  get(target: XinObject | XinArray, _prop: string | symbol): XinValue {
    switch (_prop) {
      case XIN_PATH:
        return path
      case XIN_VALUE:
        return target.valueOf ? target.valueOf() : target
      case XIN_OBSERVE:
        return (callback: ObserverCallbackFunction) => {
          const listener = _observe(path, callback)
          return () => unobserve(listener)
        }
      case XIN_ON:
        return (
          element: HTMLElement,
          eventType: keyof HTMLElementEventMap
        ): VoidFunction =>
          on(element, eventType, xinValue(target) as XinEventHandler)
      case XIN_BIND:
        return (element: Element, binding: XinBinding, options?: XinObject) => {
          bind(element, path, binding, options)
        }
    }
    if (typeof _prop === 'symbol') {
      return (target as XinObject)[_prop]
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
      const value = getByPath(target, basePath)
      return value !== null && typeof value === 'object'
        ? new Proxy<XinObject, XinProxyObject>(
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
      let value: XinValue
      if (prop.includes('=')) {
        const [idPath, needle] = prop.split('=')
        value = (target as XinObject[]).find(
          (candidate: XinObject) =>
            `${getByPath(candidate, idPath) as string}` === needle
        )
      } else {
        value = (target as XinArray)[prop as unknown as number]
      }
      if (value instanceof Object) {
        const currentPath = extendPath(path, prop)
        return new Proxy<XinObject, XinProxyObject>(
          value instanceof Function ? value.bind(target) : value,
          regHandler(currentPath, boxScalars)
        ) as XinValue
      } else {
        return boxScalars ? box(value, extendPath(path, prop)) : value
      }
    } else if (Array.isArray(target)) {
      const value = target[prop as unknown as number]
      return typeof value === 'function'
        ? (...items: any[]) => {
            const result = value.apply(target, items)
            if (ARRAY_MUTATIONS.includes(prop)) {
              touch(path)
            }
            return result
          }
        : typeof value === 'object'
        ? new Proxy<XinProxyTarget, XinObject>(
            value,
            regHandler(extendPath(path, prop), boxScalars)
          )
        : boxScalars
        ? box(value, extendPath(path, prop))
        : value
    } else {
      return boxScalars
        ? box(target[prop], extendPath(path, prop))
        : target[prop]
    }
  },
  set(_, prop: string, value: any) {
    value = xinValue(value)
    const fullPath = prop !== XIN_VALUE ? extendPath(path, prop) : path
    if (debugPaths && !isValidPath(fullPath)) {
      throw new Error(`setting invalid path ${fullPath}`)
    }
    const existing = xinValue(xin[fullPath])
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

const xin = new Proxy<XinObject, XinProxy<XinObject>>(
  registry,
  regHandler('', false)
)

const boxed = new Proxy<XinObject, BoxedProxy<XinObject>>(
  registry,
  regHandler('', true)
)

// settings and isValidPath are only used for internal testing
export { xin, boxed, updates, touch, observe, unobserve, settings, isValidPath }
