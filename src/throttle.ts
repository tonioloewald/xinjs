/*#
# throttle & debounce

Usage:

    const debouncedFunc = debounce(func, 250)
    const throttledFunc = debounce(func, 250)

`throttle(voidFunc, interval)` and `debounce(voidFunc, interval)` are utility functions for
producing functions that filter out unnecessary repeated calls to a function, typically
in response to rapid user input, e.g. from keystrokes or pointer movement.

The usual purpose of these functions is to prevent over-calling of a function based on
rapidly changing data, such as keyboard event or scroll event handling.

`debounce`ed functions will only actually be called `interval` ms after the last time the
wrapper is called.

E.g. if the user types into a search field, you can call a `debounce`ed
function to do the query, and it won't fire until the user stops typing for `interval` ms.

`throttle`ed functions will only called at most every `interval` ms.

E.g. if the user types into a search field, you can call a `throttle`ed function
every `interval` ms, including one last time after the last time the wrapper is called.

> In particular, both throttle and debounce are guaranteed to execute the
> wrapped function after the last call to the wrapper.

Note that parameters will be passed to the wrapped function, and that *the last call always goes through*.
However, parameters passed to skipped calls will *never* reach the wrapped function.
*/

type VoidFunc = (...args: any[]) => void

export const debounce = (origFn: VoidFunc, minInterval = 250): VoidFunc => {
  let debounceId: number
  return (...args: any[]) => {
    if (debounceId !== undefined) clearTimeout(debounceId)
    debounceId = setTimeout(() => {
      origFn(...args)
    }, minInterval) as unknown as number
  }
}

export const throttle = (origFn: VoidFunc, minInterval = 250): VoidFunc => {
  let debounceId: number
  let previousCall = Date.now() - minInterval
  let inFlight = false
  return (...args: any[]) => {
    clearTimeout(debounceId)
    debounceId = setTimeout(async () => {
      origFn(...args)
      previousCall = Date.now()
    }, minInterval) as unknown as number
    if (!inFlight && Date.now() - previousCall >= minInterval) {
      inFlight = true
      try {
        origFn(...args)
        previousCall = Date.now()
      } finally {
        inFlight = false
      }
    }
  }
}
