/*#
# 6. more-math

Some simple functions egregiously missing from the Javascript `Math`
object. They are exported from `xinjs` as the `MoreMath` object.

## Functions

`clamp(min, v, max)` will return `v` if it's between `min` and `max`
and the `min` or `max` otherwise.

`lerp(a, b, t)` will interpolate linearly between `a` and `b` using
parameter `t`. `t` will be clamped to the interval `[0, 1]`, so
`lerp` will be clamped between a and b (but a does not need to be
less than b).

## Constants

`RADIANS+TO_DEGREES` and `DEGREES_TO_RADIANS` are values to multiply
an angle by to convert between degrees and radians.
*/

export const RADIANS_TO_DEGREES = 180 / Math.PI
export const DEGREES_TO_RADIANS = Math.PI / 180

export function clamp(min: number, v: number, max: number): number {
  return v < min ? min : v > max ? max : v
}

export function lerp(a: number, b: number, t: number): number {
  t = clamp(0, t, 1)
  return t * (b - a) + a
}

export const MoreMath = {
  RADIANS_TO_DEGREES,
  DEGREES_TO_RADIANS,
  clamp,
  lerp,
}
