# xinjs

<div style="text-align: center; margin: 20px">
  <a href="https://xinjs.net">
    <img style="width: 200px; max-width: 80%" alt="xinjs logo" src="https://xinjs.net/xinjs-logo.svg">
  </a>
</div>

[xinjs.net](https://xinjs.net) | [docs](https://github.com/tonioloewald/xinjs/blob/main/docs/_contents_.md) | [github](https://github.com/tonioloewald/xinjs) | [npm](https://www.npmjs.com/package/xinjs) | [cdn](https://www.jsdelivr.com/package/npm/xinjs) | [react-xinjs](https://github.com/tonioloewald/react-xinjs#readme) | [discord](https://discord.gg/ramJ9rgky5)

[![xinjs is on NPM](https://badge.fury.io/js/xinjs.svg)](https://www.npmjs.com/package/xinjs)
[![xinjs is about 10kB gzipped](https://deno.bundlejs.com/?q=xinjs&badge=)](https://bundlejs.com/?q=xinjs&badge=)
[![xinjs on jsdelivr](https://data.jsdelivr.com/v1/package/npm/xinjs/badge)](https://www.jsdelivr.com/package/npm/xinjs)

### Path-based State for Web Apps

- simple, efficient observer pattern
- written in TypeScript
- lightweight
- works anywhere (browsers, node, bun, electron etc.)

In particular, this means that you can do your state management *anywhere*,
including on either side of the "browser" divide in Electron / nwjs and
similar applications. You can also efficiently implement "stateful-stateless" servers by
sending mutations to complex state to the server and use GraphQL-like queries to
[filter the shape](https://github.com/tonioloewald/filter-shapes) of the response from a service
or the data you save to a service.

## What `xinjs` does

### Observe Object State

`xinjs` tracks the state of objects you assign to it using `paths` allowing economical 
and direct updates to application state.

    import { xinProxy, observe } from 'xinjs'

    const { app } = xinProxy({
      app: {
        prefs: {
          darkmode: false
        },
        docs: [
          {
            id: 1234,
            title: 'title',
            body: 'markdown goes here'
          }
        ]
      }
    })

    observe('app.prefs.darkmode', () => {
      document.body.classList.toggle('dark-mode', app.prefs.darkmode)
    })

    observe('app.docs', () => {
      // render docs
    })

> #### What does `xinProxy` do, and what is a `XinProxy`?
>
> `xinProxy` is syntax sugar for assigning something to `xin` (which is a `XinProxyObject`)
> and then getting it back out again.
>
> A `XinProxy` is an [ES Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 
> wrapped around an `object` (which in Javascript means anything
> that has a `constructor` which in particular includes `Array`s, `class` instances, `function`s
> and so on, but not "scalars" like `number`s, `string`s and `boolean`s.) Also for some crazy
> reason `null` is a special case and then there are `Symbol`s.
>
> All you need to know about a `XinProxy` is that it's a nearly invisible wrapper around an
> object that allows you to interact with the object normally, but which allows `xinjs` to
> **observe** changes made to the wrapped object and tell interested parties about the changes.
>
> If you want to original object back you can just hold on to a reference or use `xinValue(someProxy)`
> to unwrap it.

### No Tax, No Packaging

`xinjs` does not modify the stuff you hand over to it… it just wraps objects 
with a `Proxy` and then if you use `xin` to make changes to those objects,
`xinjs` will notify any interested observers.

**Note** `xinProxy({foo: {...}})` is syntax sugar for `xin.foo = {...}`.

    import { xinProxy, observe } from 'xinjs'
    const { foo } = xinProxy({
      foo: {
        bar: 17
      }
    })

    observe('foo.bar', v => {
      console.log('foo.bar was changed to', xin.foo.bar)
    })
    
    foo.bar = 17        // does not trigger the observer
    foo.bar = Math.PI   // triggers the observer

### Paths are like JavaScript

`xin` is designed to behave just like a JavaScript `Object`. What you put
into it is what you get out of it:

    import { xin, xinValue } from 'xinjs'
    
    const foo = {bar: 'baz'}
    xin.foo = foo
    
    // xin.foo returns a Proxy wrapped around foo (without touching foo)
    xinValue(xin.foo) === foo
    
    // really, it's just the original object
    xin.foo.bar = 'lurman'
    foo.bar === 'lurman' // true
    
    // seriously, it's just the original object
    foo.bar = 'luhrman'
    xin.foo.bar === 'luhrman' // true

### …but better!

It's very common to deal with arrays of objects that have unique id values,
so `xinjs` supports the idea of id-paths

    import { xinProxy, xin } from 'xinjs

    const { app } = xinProxy ({
      app: {
        list: [
          {
            id: '1234abcd',
            text: 'hello world'
          },
          {
            id: '5678efgh',
            text: 'so long, redux'
          }
        ]
      }
    })
    
    console.log(app.list[0].text)              // hello world
    console.log(app.list['id=5678efgh'])       // so long, redux
    console.log(xin['app.list[id=1234abcd'])   // hello world

### Telling `xin` about changes using `touch()`

Sometimes you will modify an object behind `xin`'s back (e.g. for efficiency).
When you want to trigger updates, simply touch the path.

    import { xin, observe, touch } from 'xinjs'
    
    const foo = { bar: 17 }
    xin.foo = foo
    observe('foo.bar', path => console.log(path, '->', xin[path])
    xin.foo.bar = -2              // console will show: foo.bar -> -2
    
    foo.bar = 100                 // nothing happens
    touch('foo.bar')              // console will show: foo.bar -> 100

### CSS

`xinjs` includes utilities for working with css.

    import {css, vars, initVars, darkMode} from 'xinjs'
    const cssVars = {
      textFont: 'sans-serif'
      color: '#111'
    }

`initVars()` processes an object changing its keys from camelCase to --kabob-case:

    initVars(cssVars) // emits { --text-font: "sans-serif", --color: "#111" }

`darkMode()` processes an object, taking only the color properties and inverting their luminance values:
    darkMode(cssVars) // emits { color: '#ededed' }

The `vars` simply converts its camelCase properties into css variable references
    
    vars.fooBar // emits 'var(--foo-bar)'
    calc(`${vars.width} + 2 * ${vars.spacing}`) // emits 'calc(var(--width) + 2 * var(--spacing))'

`css()` processes an object, rendering it as CSS

    css({
      '.container': {
        'position', 'relative'
      }
    }) // emits .container { position: relative; }

## Color

`xinjs` includes a powerful `Color` class for manipulating colors.

    import {Color} from 'xinjs
    const translucentBlue = new Color(0, 0, 255, 0.5) // r, g, b, a parameters
    const postItBackground = Color.fromCss('#e7e79d')
    const darkGrey = Color.fromHsl(0, 0, 0.2)

The color objects have computed properties for rendering the color in different ways,
making adjustments, blending colors, and so forth.

## Hot Reload

One of the nice things about working with the React toolchain is hot reloading.
`xinjs` supports hot reloading (and not just in development!) via the `hotReload()`
function:

    import {xin, hotReload} from 'xinjs'
    
    xin.app = {
      ...
    }
    
    hotReload() 

`hotReload` stores serializable state managed by `xin` in localStorage and restores
it (by overlay) on reload. Because any functions (for example) won't be persisted,
simply call `hotReload` after initializing your app state and you're good to go.

`hotReload` accepts a test function (path => boolean) as a parameter. 
Only top-level properties in `xin` that pass the test will be persisted.

To completely reset the app, run `localStorage.clear()` in the console.

### Types

`xinjs` [type-by-example](https://www.npmjs.com/package/type-by-example) has been
broken out into a separate standalone library. (Naturally it works very well with
xinjs but they are completely independent.)

## Development Notes

You'll need to install [bun](https://bun.sh/) and [nodejs](https://nodejs.org)),
and then run `npm install` and `bun install`. `bun` is used because it's 
**fast** and is a really nice test-runner.

To work interactively on the demo code, use `bun start`. This runs the demo
site on localhost.

To build everything run `bun run make` which builds production versions of the
demo site (in `www`) and the `dist` and `cdn` directories.

To create a local package (for experimenting with a build) run `bun pack`.

## Credits

`xinjs` is in essence a highly incompatible update to `b8rjs` with the goal
of removing cruft, supporting more use-cases, and eliminating functionality
that has been made redundant by improvements to the JavaScript language and
DOM APIs.

`xinjs` is being developed using [bun](https://bun.sh/). 
`bun` is crazy fast (based on Webkit's JS engine, vs. V8), does a lot of stuff
natively, and runs TypeScript (with import and require) directly.
