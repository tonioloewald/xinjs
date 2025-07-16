/*#
# 1.1 xin proxy

The key to managing application state with `xinjs` is the `xin` proxy object
(and `boxed`). These are documented [here](/?xin.ts).

## `xinProxy()` and `boxedProxy()`

After coding with `xin` for a while, it became apparent that a common pattern
was something like this:

    import myThing as _myThing from 'path/to/my-thing'
    import { xin } from 'xinjs'

    xin.myThing = _myThing
    export const myThing = xin.myThing as typeof _myThing

Now we can use the new `myThing` in a pretty intuitive way, leverage autocomplete
most of the time, and it's all pretty nice.

And because `myThing.path.to.something` is actually a `XinProxy` we can actually
bind to it directly. So instead of typing (or mis-typing):

    customElement({bindValue: 'mything.path.to.something'}))

We can type the following and even use autocomplete:

    customElement({bindValue: mything.path.to.something}))

This gets you:

    const { myThing } = xinProxy({ myThing: ... })

And after working with that for a while, the question became, what if we could
leverage autocomplete even for non-object properties?

This gets us to:

    const { myThing } = boxedProxy({ myThing: ... })

…(and also `boxed`).

`boxed` and `boxedProxy` deliver a proxy wrapped around an object wrapped around
the original `string`, `boolean`, or `number`. This gets you autocomplete and
strong typing in general, at the cost of slight annoyances (e.g. having to write
`myThing.path.to.string.valueOf() === 'some value'`). That's the tradeoff. In
practice it's really very nice.

`xinProxy(foo)` is simply declared as a function that takes an object of type T and
returns a BoxedProxy<T>.

    import { xinProxy } from 'xinjs'

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

So, Typescript will know that `foo` is a `string` and `bar` is a `XinProxy<typeof stuff.bar>`.

Now, `boxedProxy` is the same except replace `XinProxy` with `BoxedProxy` and
now Typescript will know that `foo` is a `BoxedProxy<string>`, `bar` is a `BoxedProxy<typeof stuff.bar>`
and `bar.born` is a `BoxedProxy<number>`.

This lets you write bindings that support autocomplete and lint. Yay!
*/
import { XinProxy, BoxedProxy } from './xin-types'
import { xin, boxed } from './xin'

export function tosi<T extends object>(obj: T): BoxedProxy<T> {
  Object.assign(boxed, obj)
  return boxed as BoxedProxy<T>
}

export function boxedProxy<T extends object>(obj: T): BoxedProxy<T> {
  console.warn('boxedProxy is deprecated, please use tosi() instead')
  return tosi(obj)
}

export function xinProxy<T extends object>(obj: T, boxed = false): XinProxy<T> {
  if (boxed) {
    console.warn(
      `xinProxy(..., true) is deprecated; use tosi(...) instead`
    )
    // @ts-expect-error deprecated
    return boxedProxy(obj)
  }
  Object.keys(obj).forEach((key: string) => {
    xin[key] = (obj as { [key: string]: any })[key]
  })
  return xin as XinProxy<T>
}
