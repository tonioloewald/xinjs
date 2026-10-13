# more-math

Some simple functions egregiously missing from the Javascript `Math`
object. They are exported from `tosijs` as the `MoreMath` object.

## Functions

`clamp(min, v, max)` will return `v` if it's between `min` and `max`
and the `min` or `max` otherwise.

If min > max, the function will return NaN.

```
clamp(0, 0.5, 1)        // produces 0.5
clamp(0, -0.5, 1)       // produces 0
clamp(-50, 75, 50)      // produces 50
```

`lerp(a, b, t, clamped = true)` will interpolate linearly between `a` and `b` using
parameter `t`. `t` will be clamped to the interval `[0, 1]`, so
`lerp` will be clamped *between* a and b unless you pass `false` as the
optional fourth parameter (allowing `lerp()` to extrapolate).

```
lerp(0, 10, 0.5)        // produces 5
lerp(0, 10, 2)          // produces 10
lerp(0, 10, 2, false)   // produces 20
lerp(5, -5, 0.75)       // produces -2.5
```

## Constants

`RADIANS_TO_DEGREES` and `DEGREES_TO_RADIANS` are values to multiply
an angle by to convert between degrees and radians.
