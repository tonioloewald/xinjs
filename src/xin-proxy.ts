/*{ "parent": "tosi", "description": "Background on the tosijs observer proxies: how tosi() and xinProxy() relate to xin and boxed, plus tosiUnique() for per-instance state." }*/
/*#
# tosi, xin, and xinProxy

> This documentation is mainly here for explanatory purposes. Just use `tosi()`
> as described in the parent doc.

The key to managing application state with `tosijs` are its **observer** proxies, `tosi` and `xin`. These are documented [here](/xin/).

The basic idea is pretty simple.

If you assign a value to a proxy, things that are bound to that proxy will be updated. E.g.

```
import { elements, tosi } from 'tosijs'

consy myProxy = tosi({
  myProxy: {
    foo: 'bar'
  }
})

// create an element and bind its textContent to myProxy.foo
//
const myDiv = elements.div({ textContent: myProxy.foo })

myProxy.foo = 'now it is updated'
// wait until the next animation frame is rendered
myDiv.textContent === 'now it is updated'
```

It's not magic. It's proxies. And the updates are surgical. The rest of the DOM isn't touched.

## `xinProxy()` and `tosi()`

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

    const { myThing } = boxedProxy({ myThing: ... })

…(and also `boxed`).

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

    import { xinProxy } from 'tosijs'

    const { foo, bar } = boxedProxy({
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

Now, `boxedProxy` is the same except replace `TosiProxy` with `BoxedProxy` and
now Typescript will know that `foo` is a `BoxedProxy<string>`, `bar` is a `BoxedProxy<typeof stuff.bar>`
and `bar.born` is a `BoxedProxy<number>`.

This lets you write bindings that support autocomplete and lint. Yay!
*/
import { TosiProxy, BoxedProxy } from './xin-types'
import { xin, boxed } from './xin'
import { warnDeprecated } from './metadata'
import { id } from './by-path'

export function tosi<T extends object>(obj: T): BoxedProxy<T> {
  Object.assign(boxed, obj)
  return boxed as BoxedProxy<T>
}

export function boxedProxy<T extends object>(obj: T): BoxedProxy<T> {
  warnDeprecated(
    'boxedProxy',
    'boxedProxy is deprecated, please use tosi() instead'
  )
  return tosi(obj)
}

/*#
## `tosiUnique()`

`tosiUnique()` creates a reactive proxy stored under a guaranteed unique key.
This is useful for component instances or any situation where you need
per-instance reactive state without worrying about key collisions.

It returns a tuple of `[proxy, removeFunc]`:

- `proxy` is a `BoxedProxy<T>` — the reactive proxy for your object
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

*/
const tosiUniqueCleanup = new FinalizationRegistry((remove: () => void) => {
  remove()
})

export function tosiUnique<T extends object>(
  obj: T,
  owner?: object
): [BoxedProxy<T>, () => void] {
  const key = id()
  ;(boxed as any)[key] = obj
  const proxy = (boxed as any)[key] as BoxedProxy<T>
  const remove = () => {
    delete (xin as any)[key]
  }
  if (owner) {
    tosiUniqueCleanup.register(owner, remove)
  }
  return [proxy, remove]
}

export function xinProxy<T extends object>(
  obj: T,
  boxed = false
): TosiProxy<T> {
  if (boxed) {
    warnDeprecated(
      'xinProxy-boxed',
      'xinProxy(..., true) is deprecated; use tosi(...) instead'
    )
    // @ts-expect-error deprecated
    return boxedProxy(obj)
  }
  Object.keys(obj).forEach((key: string) => {
    xin[key] = (obj as { [key: string]: any })[key]
  })
  return xin as TosiProxy<T>
}
