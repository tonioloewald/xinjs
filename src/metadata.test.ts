import { test, expect } from 'bun:test'
import { xinValue, xinPath } from './metadata'
import { xin, boxed } from './xin'

test('xinValue works', () => {
  const foo = {
    bar: 'hello',
  }
  xin.foo = foo

  expect(xin.foo === foo).toBe(false)
  expect(xin.foo.xinValue === foo).toBe(true)
  expect(xinValue(xin.foo) === foo).toBe(true)
  expect(xinValue(foo) === foo).toBe(true)
  expect(xin.foo.bar === 'hello').toBe(true)
  expect(boxed.foo.bar === 'hello').toBe(false)
  expect(boxed.foo.bar.xinValue === 'hello').toBe(true)
  expect(xinValue(boxed.foo.bar) === 'hello').toBe(true)
})

test('xinPath works', () => {
  const foo = {
    bar: 'hello',
  }
  xin.foo = foo

  expect(xinPath(xin.foo)).toBe('foo')
  expect(xin.foo.xinPath).toBe('foo')
  expect(boxed.foo.bar.xinPath).toBe('foo.bar')
  expect(xinPath(boxed.foo.bar)).toBe('foo.bar')
  expect(xinPath(foo)).toBe(undefined)
  expect(xinPath(xin.foo.bar)).toBe(undefined)
})
