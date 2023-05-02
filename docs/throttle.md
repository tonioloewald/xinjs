# throttle and debounce

Usage:

    const debouncedFunc = debounce(func, 250)
    const throttledFunc = debounce(func, 250)

`throttle(voidFunc, interval)` and `debounce(voidFunc, interval)` are utility functions for 
producing functions that only fire a maximum of once every `interval` ms.

Classically, a throttled function becomes a no-op for `interval` ms after being called but
this `throttle` is actually `throttleAndDebounce` meaning that it will fire `interval` ms
after the last skipped call. This eliminates edge cases where the most recent call never
happens, leaving changes unhandled.

The usual purpose of these functions is to prevent over-calling of a function based on
rapidly changing data, such as keyboard event or scroll event handling.

Note that  parameters will be passed to the wrapped function, and that *the last call always goes through*.