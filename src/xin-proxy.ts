/*#
# 1.1 xin proxy

The key to managing application state with `xinjs` is the `xin` proxy object.

`xin` is an single object wrapped with an **observer** proxy.

- when you assign an object (or array) to `xin` as a property, it does
  exactly what you'd expect.
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

You can also turning on Chrome's rendering tools to see how
efficiently the DOM is updated. And also note that typing into
the input field doesn't lose any state (so your text selection
and insertion point are stable.

```js
const { xin, elements } = xinjs

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

## `boxed`

`boxed` is a proxy wrapped around the same object that `xin` is wrapped around.
It has one important difference: when you pull a non-object value out of `boxed`
it gets wrapped in the corresponding object type (so, a string is wrapped in a `new String()`)
and that is wrapped with the proxy.

In the console, you can also access `boxed` and look at what happens if you
access `boxed.xinExample.string`. Note that you can still set `boxed.xinExample.string`
to an ordinary string value (the underlying object hasn't changed).

This is **useful** because `boxed.foo.bar` always knows where it came from, while
`xin.foo.bar` only knows where it came from if it's an object value.

This means you can write:

```js
const { boxed, elements } = xinjs

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
`String` objects.

## Working with boxed proxies

Using `boxed` proxies is generally full of win, however, because they have
lots of helpful properties:

- `xinValue` gets you the underlying object
- `xinPath` gets you the string path
- `xinBind(element: Element, binding: XinBinding, options?: XinObject)` will
  bind the path of the value to the element with the specified binding.
- `xinOn(element: HTMLElement, eventType: keyof HTMLElementEventMap)` will
  trigger the value (hopefully a function?) when the specified element receives
  an event of the specified type.
- `xinObserve(callback: ObserverCallbackFunction): UnobserveFunction` will
  trigger the provided callback when the value changes.

## `xinProxy()`

After coding with `xin` for a while, it became apparent that a common pattern
was something like this:
*/
import { XinProxy, BoxedProxy } from './xin-types'
import { xin, boxed } from './xin'

export function boxedProxy<T extends object>(obj: T): BoxedProxy<T> {
  Object.assign(boxed, obj)
  return boxed as BoxedProxy<T>
}

let deprecationMessage = false
export function xinProxy<T extends object>(obj: T, boxed = false): XinProxy<T> {
  if (boxed) {
    if (!deprecationMessage) {
      console.warn(
        `xinProxy(..., true) is deprecated; use boxedProxy(...) instead`
      )
      deprecationMessage = true
    }
    // @ts-expect-error deprecated
    return boxedProxy(obj)
  }
  Object.keys(obj).forEach((key: string) => {
    xin[key] = (obj as { [key: string]: any })[key]
  })
  return xin as XinProxy<T>
}
