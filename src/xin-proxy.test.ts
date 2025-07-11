import { test, expect } from 'bun:test'
import { xin } from './xin'
import { xinPath } from './metadata'
import { xinProxy, boxedProxy } from './xin-proxy'

test('xinProxy works', () => {
  const { test } = xinProxy({
    test: {
      foo: 'bar',
    },
  })
  expect(test.foo.valueOf()).toBe('bar')
  test.foo = 'baz'
  expect(test.foo.valueOf()).toBe('baz')
})

test('boxedProxy works', () => {
  const { box } = boxedProxy({
    box: {
      foo: 'bar',
      deep: [{ id: 'thought', answer: 42 }],
      nullity: null,
    },
  })
  expect(xin.box.foo).toBe('bar')
  expect(box.foo.valueOf()).toBe('bar')
  expect(xinPath(box.foo)).toBe('box.foo')
  // @ts-expect-error it's a test ffs
  expect(box.deep['id=thought'].answer.valueOf()).toBe(42)
  // @ts-expect-error it's a test ffs
  expect(xinPath(box.deep['id=thought'].answer)).toBe(
    'box.deep[id=thought].answer'
  )
  // @ts-expect-error it's a test ffs
  expect(box.whatevs).toBe(undefined)
  expect(box.nullity).toBe(null)
})
