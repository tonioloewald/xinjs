/*
# more-math

Some simple functions egregiously missing from `Math`
*/

export const RADIANS_TO_DEGREES = 180 / Math.PI
export const DEGREES_TO_RADIANS = Math.PI / 180

export function clamp (min: number, v: number, max: number): number {
  return v < min ? min : (v > max ? max : v)
}

export function lerp (a: number, b: number, t: number): number {
  t = clamp(0, t, 1)
  return t * (b - a) + a
}

export const MoreMath = {
  clamp,
  lerp
}
