import { test, expect } from 'bun:test'
import { clamp, lerp } from './more-math'

test('clamp works', () => {
  expect(clamp(0, 0.4, 1)).toBe(0.4)
  expect(clamp(0, -1, 1)).toBe(0)
  expect(clamp(0, 1.5, 1)).toBe(1)
  expect(clamp(1, 0.5, 0)).toBe(NaN)
})

test('lerp works', () => {
  expect(lerp(5, 10, 0)).toBe(5)
  expect(lerp(5, 10, 0.5)).toBe(7.5)
  expect(lerp(-5, 5, 0.25)).toBe(-2.5)
  expect(lerp(10, 0, 0.9)).toBe(1)
  expect(lerp(10, 0, 5)).toBe(0)
  expect(lerp(5, -5, -3)).toBe(5)
})

test('unclamped lerp works', () => {
  expect(lerp(0.5, -0.5, 3, false)).toBe(-2.5)
  expect(lerp(-0.5, 0.5, 2, false)).toBe(1.5)
})
