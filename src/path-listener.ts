/*#
# 1.2 path-listener

`path-listener` implements the `xin` observer model. Although these events
are exported from `xinjs` they shouldn't need to be used very often. Mostly
they're used by `bind` and `xin` to manage state.

## `touch(path: string)`

This is used to inform `xin` that a value at a path has changed. Remember that
xin simply wraps an object, and if you change the object directly, `xin` won't
necessarily know about it.

The two most common uses for `touch()` are:

1. You want to make lots of changes to a large data structure, possibly
   over a period of time (e.g. update hundreds of thousands of values
   in a table that involve service calls or heavy computation) and don't
   want to thrash the UI so you just change the object directly.
2. You want to change the content of an object but need a something that
   is bound to the "outer" object to be refreshed.

## `observe()` and `unobserve()`

    const listener = observe(
      path: string | RegExp | (path: string) => boolean,
      (changedPath: string) => {
        ...
      }
    )

    // and later, when you're done
    unobserve(listener);

`observe(…)` lets you call a function whenever a specified path changes. You'll
be passed the path that changed and you can do whatever you like. It returns
a reference to the listener to allow you to dispose of it later.

`unobserve(listener)` removes the listener.

> This is how binding works. When you bind a path to an interface element, an
> observer is created that knows when to update the interface element. (If the
> binding is "two-way" (i.e. provides a `fromDOM` callback) then an `input` or
> `change` event that hits that element will update the value at the bound
> path.

## `async updates()`

You can `await updates()` or use `updates().then(…)` to execute code
after any changes have been rendered to the DOM. Typically, you shouldn't
have to mess with this, but sometimes—for example—you might need to know
how large a rendered UI element is to adjust something else.

It's also used a lot in unit tests. After you perform some logic, does
it appear correctly in the UI?
*/

import {
  PathTestFunction,
  ObserverCallbackFunction,
  AnyFunction,
} from './xin-types'
import { xinPath } from './metadata'
import { settings } from './settings'

export const observerShouldBeRemoved = Symbol('observer should be removed')
export const listeners: Listener[] = [] // { path_string_or_test, callback }
const touchedPaths: string[] = []
let updateTriggered: number | boolean = false
let updatePromise: Promise<undefined>
let resolveUpdate: AnyFunction

export class Listener {
  description: string
  test: PathTestFunction
  callback: ObserverCallbackFunction

  constructor(
    test: string | RegExp | PathTestFunction,
    callback: string | ObserverCallbackFunction
  ) {
    const callbackDescription =
      typeof callback === 'string'
        ? `"${callback}"`
        : `function ${callback.name}`
    let testDescription
    if (typeof test === 'string') {
      this.test = (t) =>
        typeof t === 'string' &&
        t !== '' &&
        (test.startsWith(t) || t.startsWith(test))
      testDescription = `test = "${test}"`
    } else if (test instanceof RegExp) {
      this.test = test.test.bind(test)
      testDescription = `test = "${test.toString()}"`
    } else if (test instanceof Function) {
      this.test = test
      testDescription = `test = function ${test.name}`
    } else {
      throw new Error(
        'expect listener test to be a string, RegExp, or test function'
      )
    }
    this.description = `${testDescription}, ${callbackDescription}`
    if (typeof callback === 'function') {
      this.callback = callback
    } else {
      throw new Error('expect callback to be a path or function')
    }
    listeners.push(this)
  }
}

export const updates = async (): Promise<void> => {
  if (updatePromise === undefined) {
    return
  }
  await updatePromise
}

const update = (): void => {
  if (settings.perf) {
    console.time('xin async update')
  }
  const paths = Array.from(touchedPaths)

  for (const path of paths) {
    listeners
      .filter((listener) => {
        let heard
        try {
          heard = listener.test(path)
        } catch (e) {
          throw new Error(
            `Listener ${listener.description} threw "${
              e as string
            }" at "${path}"`
          )
        }
        if (heard === observerShouldBeRemoved) {
          unobserve(listener)
          return false
        }
        return heard as boolean
      })
      .forEach((listener) => {
        let outcome
        try {
          outcome = listener.callback(path)
        } catch (e) {
          console.error(
            `Listener ${listener.description} threw "${
              e as string
            }" handling "${path}"`
          )
        }
        if (outcome === observerShouldBeRemoved) {
          unobserve(listener)
        }
      })
  }

  touchedPaths.splice(0)
  updateTriggered = false
  if (typeof resolveUpdate === 'function') {
    resolveUpdate()
  }
  if (settings.perf) {
    console.timeEnd('xin async update')
  }
}

export const touch = (touchable: any): void => {
  const path = typeof touchable === 'string' ? touchable : xinPath(touchable)

  if (path === undefined) {
    console.error('touch was called on an invalid target', touchable)
    throw new Error('touch was called on an invalid target')
  }

  if (updateTriggered === false) {
    updatePromise = new Promise((resolve) => {
      resolveUpdate = resolve
    })
    updateTriggered = setTimeout(update) as unknown as number
  }

  if (
    touchedPaths.find((touchedPath) => path.startsWith(touchedPath)) == null
  ) {
    touchedPaths.push(path)
  }
}

export const observe = (
  test: string | RegExp | PathTestFunction,
  callback: ObserverCallbackFunction
): Listener => {
  return new Listener(test, callback)
}

export const unobserve = (listener: Listener): void => {
  const index = listeners.indexOf(listener)
  if (index > -1) {
    listeners.splice(index, 1)
  } else {
    throw new Error('unobserve failed, listener not found')
  }
}
