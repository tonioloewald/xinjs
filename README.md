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

    import {xin, observe} from 'xinjs'

    xin.app = {
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

    observe('app.prefs.darkmode', () => {
      document.body.classList.toggle('dark-mode', xin.app.prefs.darkmode)
    })

    observe('app.docs', () => {
      // render docs
    })

### No Tax, No Packaging

`xinjs` does not modify the stuff you hand over to it… it just wraps objects 
with a `Proxy` and then if you use `xin` to make changes to those objects,
`xinjs` will notify any interested observers.

    import {xin, observe} from 'xinjs'
    xin.foo = {bar: 17}
    observe('foo.bar', v => {
      console.log('foo.bar was changed to', xin.foo.bar)
    })
    
    xin.foo.bar = 17        // does not trigger the observer
    xin.foo.bar = Math.PI   // triggers the observer

### Paths are like JavaScript

`xin` is designed to behave just like a JavaScript `Object`. What you put
into it is what you get out of it:

    import {xin} from 'xinjs'
    
    const foo = {bar: 'baz'}
    xin.foo = foo
    
    // xin.foo returns a Proxy wrapped around foo (without touching foo)
    xin.foo._xinValue === foo
    
    // really, it's just the original object
    xin.foo.bar = 'lurman'
    foo.bar === 'lurman' // true
    
    // seriously, it's just the original object
    foo.bar = 'luhrman'
    xin.foo.bar === 'luhrman' // true

### …but better!

It's very common to deal with arrays of objects that have unique id values,
so xin supports the idea of id-paths

    const app = {
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
    xin.app = app
    console.log(xin.app.list[0].text)          // hello world
    console.log(xin.app.list['id=5678efgh']    // so long, redux
    console.log(xin['app.list[id=1234abcd]')   // hello world

### Telling `xin` about changes using `touch()`

Sometimes you will modify an object behind `xin`'s back (e.g. for efficiency).
When you want to trigger updates, simply touch the path.

    import {xin, observe, touch} from 'xinjs'
    
    const foo = {bar: 17}
    xin.foo = foo
    observe('foo.bar', path => console.log(path, '->', xin[path])
    xin.foo.bar = -2              // console will show: foo.bar -> -2
    
    foo.bar = 100                 // nothing happens
    touch('foo.bar')              // console will show: foo.bar -> 100

### Types

`xinjs` provides a type system that allows you to efficiently check types
at runtime. Types are *just javascript* and can be *serialized* as JSON, used
as mock data, and so on. The `matchType` function tells you exactly what's
wrong with a given value:

    const userType = {
      name: 'name',
      age: 17,
      address: {
        street: 'somewhere',
        city: 'city',
        zipcode: '12345'
      }
    }

    matchType(userType, {
      name: 'Juanita Citizen',
      age: '17',
      address: {
        street: '123 Sesame',
        zipcode: 10001
      }
    }) // returns a list of problems...

The exact response from `matchType` in this example is:

    [
      '.age was "17", expected number',
      '.address.city was undefined, expected string',
      '.address.zipcode was 10001, expected string'
    ]

### Specific numeric and string types, unions, optionals, etc.

`matchType` supports very specific types, including optional values, and despite this
all types are "just javascript" and serializable as JSON.

E.g. object properties can be specified as optional:

    const positionType = {
      lat: 0,
      long: 0,
      'altitude?': 0
    }

And numeric values can be restricted to whole numbers or ranges:

    const positionType = {
      lat: '#number [-90,90]',
      long: '#number [-180,180]',
      'altitude?': 0
    }

    const arrayIndexType = '#int [0,∞)'

Enumerations can be specified:

    const method = '#enum "HEAD"|"INFO"|"GET"|"POST"|"PUT"|"DELETE"'

And strings can be restricted to regular expressions:

    const zipcodeType = '#regexp ^\\d{5,5}(-\\d{4,4})?$'

### TypeSafe functions

You can build hardened functions that will throw an error if they receive the wrong
input or would produce the wrong output.

    import {typeSafe} from 'xinjs'
    const unsafeAdd(a, b) => a + b
    const safeAdd = typeSafe(unsafeAdd, [0, 0], 0)

If the function receives the wrong input or produces the wrong output, it throws a
type error (specifying exactly what went wrong). If it receives an error, it passes
it straight through (like a [monad](https://en.wikipedia.org/wiki/Monad_(functional_programming))).
Basically, if you chain typesafe functions and there's an error somewhere in the chain,
you'll receive *that* error at the far end, and no further work will be done.

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
