# xin

> In Mandarin, "xin" has several meanings including "truth" and "message".

`xin` is an path-based implementation of the **observer** or **pub/sub**
pattern designed to be very simple and straightforward to use.

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

## xinProxy()

After working with `xin` and using `Typescript` for an extended period, I've tried to
improve the type declarations to minimize the amount of casting and `// @ts-ignore-error`
directives needed. This has led to the addition of the `xinProxy` utility function.

`xinProxy(foo)` is simply declared as an identify function that operates on objects,
in fact it assigns each property of the object passed to `xin` and returns its proxy, so:

    import { xinProxy } from 'xinjs'

    const { foo, bar } = xinProxy({
      foo: { /* stuff in foo */ },
      bar: { /* stuff in bar */ }
    })

…is syntax sugar for:

    import { xin } from 'xinjs'

    const foo = xin.foo = { /* stuff in foo */ }
    const bar = xin.bar = { /* stuff in bar */ }

The difference is that now Typescript automatically understands the types of `foo` and
`bar` (except for the fact that they're now actually `XinProxys`s, but shhhhh).

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

Will give you a prox that emits boxed scalars.

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

