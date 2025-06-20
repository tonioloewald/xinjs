/*#
# 1. xin

> In Mandarin, 信 ("xin") has several meanings including "letter", "true" and "message".
> As conceived, `xin` acts is intended to be the "single source of truth" for application
> state, or data.
>
> In [b8rjs](https://b8rjs.com)—`xinjs`'s predecessor—it was called
> `registry`. But registry has some bad connotations (Windows "registry") and it's
> harder to type and search for.

`xin` is a path-based implementation of the **observer** or **pub/sub**
pattern designed to be very simple and straightforward to use, leverage
Typescript type-checking and autocompletion, and let you get more done with
less code and no weird build magic (such as special decorators or "execution zones").

## In a nutshell

[sandbox example](https://codesandbox.io/s/xintro-mh4rbj?file=/src/index.ts)

Think of xin as being an `object`, so you can just assign values to it:

    import { xin } from 'xinjs'

    // typically you won't set a "root-level" property to a simple scalar value like this
    xin.x = 17

    // more commonly you'll assign large chunks of your application state, if not its
    // entire state to a "root-level" property.
    xin.app = {
      prefs: {
        darkMode: false
      },
      docs: [
        {
          title: 'my novel',
          content: 'It was a dark and stormy night…'
        },
        {
          title: 'my poem',
          content: 'Let us go then, you and I, when the evening is spread out against the sky…'
        }
      ]
    }

Once an object is assigned to  `xin`, changing it within `xin` is simple:

    xin.x = Math.PI

    xin.app.docs[1].title = 'The Love Song of J. Alfred Prufrock'

But any changes can be observed by writing an observer:

    import { observe } from 'xinjs'

    observe('app.docs', (path) => {
      console.log(path, 'is now', xin[path])
    })

Now, if you sneakily make changes behind `xin`'s back, e.g. by modifying the values
directly, e.g.

    const emails = await getEmails()
    xin.emails = emails

    // notes that xin.emails is really JUST emails
    emails.push(...)
    emails.splice(...)
    emails[17].from = '...'

Then `xin` won't know and observers won't fire. So you can simply `touch` the path
impacted:

    import { touch } from 'xinjs'
    touch('emails')

## boxedProxy()

After working with `xin` and using `Typescript` for an extended period, I've tried to
improve the type declarations to minimize the amount of casting and `// @ts-ignore-error`
directives needed. The latest result of all this is `boxedProxy`.

`boxedProxy(foo)` is simply declared as a function that takes an object of type T and
returns a XinProxy<T>.

    import { boxedProxy } from 'xinjs'

    const { foo, bar } = boxedProxy({
      foo: 'bar',
      bar: {
        director: 'luhrmann'
      }
    })

This is syntax sugar for:

    import { boxed } from 'xinjs'

    const stuff = {
      foo: 'bar',
      bar: {
        director: 'luhrmann',
        born: 1962
      }
    }

    Object.assign(boxed, stuff)

    const { foo, bar } = boxed as XinProxy<typeof stuff>

So, Typescript will know that `foo` is a `XinProxy<String>`, and `bar.born` is a `XinProxy<Number>`.

## How it works

`xin` is a `Proxy` wrapped around a bare object: effectively a map of strings to values.

When you access the properties of an object assigned to `xin` it wraps the values in
similar proxies, and tracks the **path** that got you there:

    xin.foo = {
      bar: 'baz',
      luhrman: {
        job: 'director'
      }
    }

Now if you pull objects back out of `xin`:

    let foo = xin.foo
    let luhrman = foo.luhrman

`foo` is a `Proxy` wrapped around the original *untouched* object, and it knows it came from 'foo'.
Similarly `luhrman` is a `Proxy` that knows it came from 'foo.luhrman'.

If you **change** a value in a wrapped object, e.g.

    foo.bar = 'bob'
    luhrman.job = 'writer'

Then it will trigger any observers looking for relevant changes. And each change will fire the observer
and tell it the `path` that was changed. E.g. an observer watching `lurman` will be fired if `lurman`
or one of `lurman`'s properties is changed.

## Boxed Proxies

`boxed` is a sister to `xin` that wraps "scalar" values (`boolean`, `number`, `string`) in
objects. E.g. if you write something like:

    xin.test = { answer: 42 }
    boxed.box = { pie: 'apple' }

Then:

    xin.test.answer === 42
    xin.box.pie === 'apple'
    // box wraps "scalars" in objects
    boxed.test.answer.valueOf() === 42
    boxed.box.pie.valueOf() === 'apple'
    // anything that comes out of boxed has a path!
    xinPath(boxed.test.answer) === 'test.answer'
    xinPath(boxed.box.pie) === 'box.pie'

Aside from always "boxing" scalar values, `boxed` works just like `xin`.

And `xinProxy` will return a `boxed` proxy if you pass `true` as a second parameter, so:

    const { prox } = xinProxy({
        prox: {
            message: 'hello'
        }
    }, true)

> This is deprecated in favor of `boxedProxy(...)` which is declared in such a way
> that Typescript will be more helpful.

Will give you a proxy that emits boxed scalars.

### Why?!

As far as Typescript is concerned, `xinProxy` just passes back what you put into it,
which means that you can now write bindings with type-checking and autocomplete and
never use string literals. So something like this *just works*:

    const div = elements.div({bindText: prox.message})

## If you need the thing itself or the path to the thing…

`Proxy`s returned by `xin` are typically indistinguishable from the original object, but
in a pinch `xinPath()` will give you the path (`string`) of a `XinProxy` while `xinValue`
will give its "bare" value. `xinPath()` can also be used to test if something is actually
a proxy, as it will return `undefined` for regular objects.

E.g.

    xinPath(luhrman) === 'foo.luhrman'     // true
    const bareLurhman = xinValue(luhrman)  // not wrapped

You may want the thing itself to, for example, perform a large number of changes to an
object without firing observers. You can let `xin` know you've made changes behind its back using
`touch`, e.g.

    doTerribleThings(xinValue(luhrman))
    // eslint-disable-next-line
    touch(luhrman)

## id-paths

There's one more wrinkle in `xin`'s paths, and that is **id-paths**. This is because in many cases
you will encounter large arrays of objects, each with a unique id somewhere, e.g. it might be `id` or `uid`
or even buried deeper…

    xin.message = [
      {
        id: '1234abcd',
        title: 'hello',
        body: 'hello there!'
      },
      …
    ]

Instead of referring to the first item in `messages` as `messages[0]` it can be referred to
as `messages[id=1234abcd]`, and this will retrieve the item regardless of its position in messages.

### `touch`, `observe` and `unobserve`

`touch`, `observe` and `unobserve` provide low level access to the `xin` observer model. `touch(path: touchable)` allows you to directly inform `xin` that the value at a specified path has changed. You might want to update a large data structure directly without firing observers. You can let `xin` know you've made changes behind its back using `touch`, e.g.

    doTerribleThings(xin.luhrman)
    touch(xin.luhrman)

What's `touchable`? A string (id-path) or a xin observer proxy.

`observe(path: string | RegExp | PathTestFunction, callback: function): Listener` allows you to directly observe changes to a path (or any path that matches a RegExp or PathTestFunction evalutes as true) and trigger a callback which will be passed the path that actually changed. `unobserve(listener: Listener)` removes the listener.

### `async updates()`

`updates` is an async function that resolves after the next UI update. This is for a case where you expect a change you've made to trigger UI changes and you want to act after those have occurred. Typically, this is simply not needed, but it's very useful for testing when you want to change an observed value and verify that your UI widget has updated correctly.

> ## `isValidPath(path: string): boolean`
>
> This is an internally used function that validates a path string. It's used in testing and may be useful at runtime.
>
> ## `settings: { perf: boolean, debug: boolean }`
>
> This is a (so far) internally used configuration object. It's used in testing and may be useful at runtime. Eventually it will allow you to make path resolution and so forth easier to debug and performance tune.
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
