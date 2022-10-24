# xinjs

<div style="text-align: center">
	<a href="https://xinjs.net">
		<img style="width: 256px; max-width: 80%" alt="xinjs logo" src="https://xinjs.net/xinjs-logo.svg">
	</a>
</div>

[xinjs.net](https://xinjs.net) | [github](https://github.com/tonioloewald/xinjs) | [npm](https://www.npmjs.com/package/xinjs) | [cdn](https://www.jsdelivr.com/package/npm/xinjs)

### Path-based State for JS Apps

- simple, efficient observer pattern
- written in TypeScript
- incredibly lightweight
- works anywhere (browsers, node, bun, electron etc.)

`xinjs` takes the most valuable part of [b8r](https://b8rjs.com), i.e. the `registry`,
ports it to Typescript (mostly for autocomplete), and implements it 
with no browser dependencies so it can work just as well on the server as the client.

In particular, this means that you can do your state management *anywhere*,
including on either side of the "browser" divide in Electron / nwjs and
similar applications. You can also write stateful-stateless servers by
sending mutations to complex state to the server.

## What it does

### Observe object state

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
      // render the app
    })

### No Tax, No Packaging

`xinjs` does not modify the stuff you hand over to it! It just wraps an
ordinary `Object` with a `Proxy` and then if you use `xin` to make changes
to that `Object` it will notify any interested observers.

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

> The ultimate goal of `xinjs`'s type system is to allow for a single source
> of truth for types, so that one simple *JavaScript* declaration gives you:
> 
> - auto-completion when writing code
> - mock data —
>   E.g. `mock("# int(0,10]")` would produce a whole number >0 and <= 10
>   (This may require extra syntax to provide possible values for some types.)
> - run-time type-checking
> - filtering of objects (see *Filter* below) based on types
> 
> Because all types are serializable JavaScript, this also allows for self-documenting
> services, service requests cab easuky specify a "shape filter" for responses, and service
> versioning.

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
    const saveAdd = typeSafe(unsafeAdd, [0, 0], 0)

### Filter

If you want to pare down an object to a specific shape, e.g. to optimize bandwidth-usage,
the `filter` function lets you use a `type` object to extract exactly what you want, and
the way you specify what you want is with the same type objects used by matchType:

    filter(1, 17)                               // 17
    filter(1, 'hello')                          // undefined
    filter({x: 0, y: 0}, {x: 1, y: 2, z: 17})   // {x: 1, y: 2}
    filter({x: 0, y: 0}, {y: 1, z: 2})          // undefined

Note that you can filter heterogeneous arrays to only include the specified elements.


    filter([1], ['this', 4, 'that', 17])        // [4, 17]
    filter([], ['this', true, 17])              // ['this', true, 17]
    filter(['', 0], ['this', true, 17])         // ['this', 17]
    filter([{x: 0, y: 0}], [{x: 1, y: 2}, {lat: 10, long: -30}])
                                                // [{x: 1, y: 2}]
### Hot Reload

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
Only top-level properties in  `xin` that pass the test will be persisted.

## Development Notes

I'm using [bun](https://bun.sh/) to develop xinjs. It's insanely fast but
also kind of bleeding edge. It runs typescript directly. If you want to work
on xinjs you'll probably want to install the latest version of bun (in addition
to [nodejs](https://nodejs.org)).

To run `build` you will need to `chmod +x build.command`.
