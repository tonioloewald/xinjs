import { test, expect } from 'bun:test'
import { Color } from './color'

test('Color works', () => {
  const white = new Color(255, 255, 255)
  const black = new Color(0, 0, 0)
  const red = new Color(255, 0, 0)
  const yellow = new Color(255, 255, 0)
  const pink = red.blend(white, 0.5)
  const orange = red.blend(yellow, 0.5)
  const scarlet = red.blend(orange, 0.5)
  expect(white.html).toBe('#ffffff')
  expect(black.html).toBe('#000000')
  expect(red.html).toBe('#ff0000')
  expect(yellow.html).toBe('#ffff00')
  expect(pink.html).toBe('#ff8080')
  expect(orange.html).toBe('#ff8000')
  expect(scarlet.html).toBe('#ff4000')
})
