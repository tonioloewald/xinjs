# xinjs

- state management for modern web and node applications
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

### Observe application state

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

### Dynamic Type Checking

`xinjs` provides a type system that allows you to efficiently check types
at runtime. Types are just javascript and can be serialized as JSON, used
as mock data, and so on. The `matchType` function tells you exactly what's
wrong with an object

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
    const saveAdd = typeSafe(unsafeAdd, [0, 0], 0)

### Filtering Objects

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

## Development

I'm using [bun](https://bun.sh/) to develop xinjs. It's insanely fast but
also kind of bleeding edge. It runs typescript directly. If you want to work
on xinjs you'll probably want to install the latest version of bun (in addition
to [nodejs](https://nodejs.org)).

To run `build` you will need to `chmod +x build.command`.
