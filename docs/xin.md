# xin

> In Mandarin, "xin" has several meanings including "truth" and "message".

`xin` is an path-based implementation of the **observer** or **pub/sub** 
pattern designed to be very simple and straightforward to use.

## In a nutshell

[sandbox example](https://codesandbox.io/s/xintro-mh4rbj?file=/src/index.ts)

Think of xin as being an `object`, so you can just assign values to it:

    import { xin } from 'xinjs'

    xin.x = 17

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

Once an object is assigned to xin, changing it within xin is simple:

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

## If you need the thing itself

`Proxy`s returned by `xin` have two properties you may find helpful in a pinch: `_xinValue` gives you the
underlying (unwrapped) object and `_xinPath` gives you the path to that object.

E.g.

    luhrman._xinPath === 'foo.luhrman'     // true
    const bareLurhman = luhrman._xinValue  // not wrapped

You may want the thing itself to, for example, efficiently perform a large number of changes to an
object without firing observers. You can let `xin` know you've made changes behind its back using
`touch`, e.g.

    doTerribleThings(lurhman._xinValue)
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

