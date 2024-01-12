import { test, expect } from 'bun:test'
import { xin } from './xin'
import { xinPath } from './metadata'
import { xinProxy } from './xin-proxy'

test('xinProxy works', () => {
  const { test } = xinProxy({
    test: {
      foo: 'bar',
    },
  })
  expect(test.foo).toBe('bar')
  test.foo = 'baz'
  expect(test.foo).toBe('baz')
})

test('xinProxy works with boxed scalars', () => {
  const { box } = xinProxy(
    {
      box: {
        foo: 'bar',
        deep: [{ id: 'thought', answer: 42 }],
      },
    },
    true
  )
  expect(xin.box.foo).toBe('bar')
  expect(box.foo.valueOf()).toBe('bar')
  expect(xinPath(box.foo)).toBe('box.foo')
  expect(box.deep['id=thought'].answer.valueOf()).toBe(42)
  expect(xinPath(box.deep['id=thought'].answer)).toBe(
    'box.deep[id=thought].answer'
  )
})
