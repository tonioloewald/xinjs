// @ts-ignore
import { test, expect } from "bun:test"
import { matchType, describe, exampleAtPath } from './type-by-example'

const join = (errors: string[]) => errors.join(';')
const matchTypeString = (...args: any[]) => join(matchType(...args))

test('simple tests', () => {
  expect(matchTypeString(0, 17)).toBe('')
  expect(matchTypeString(0, 'hello')).toBe('was "hello", expected number')
  expect(matchTypeString(false, true)).toBe('')
  expect(matchTypeString(false, null)).toBe('was null, expected boolean')
})

test('number types and ranges', () => {
  expect(matchTypeString('#int', 17)).toBe('')
  expect(matchTypeString('#int [-5,5]', 5)).toBe('')
  expect(matchType('#int [-5,5)', 5)[0]).toBe('was 5, expected #int [-5,5)')
  expect(matchTypeString('#int [-5,5]', 6)).toBe('was 6, expected #int [-5,5]')
  expect(matchTypeString('#int [-5,5)', -5)).toBe('')
  expect(matchType('#int (-5,5)', -5)[0]).toBe('was -5, expected #int (-5,5)')
  expect(matchTypeString('#int [-5,5]', -6)).toBe('was -6, expected #int [-5,5]')
  expect(matchTypeString('#number (0', 6)).toBe('')
  expect(matchTypeString('#number (0', -6)).toBe('was -6, expected #number (0')
  expect(matchTypeString('#number (0,∞)', 6)).toBe('')
  expect(matchType('#number (0,∞)', -6)[0]).toBe('was -6, expected #number (0,∞)')
  expect(matchType('#number (0,∞)', Infinity)[0]).toBe('was Infinity, expected #number (0,∞)')
  expect(matchTypeString('#number [-∞,∞)', -Infinity)).toBe('')
  expect(matchTypeString('#number 0]', 6)).toBe('was 6, expected #number 0]')
  expect(matchTypeString('#number 0]', -6)).toBe('')
  expect(matchTypeString('#number [-∞,0]', 6)).toBe('was 6, expected #number [-∞,0]')
  expect(matchTypeString('#number [-∞,0]', -6)).toBe('')
  expect(matchTypeString('#number [0,5]', Math.PI)).toBe('')
  expect(matchTypeString('#number [0,2]', Math.PI)).toBe(`was ${Math.PI}, expected #number [0,2]`)
  expect(matchTypeString('#number', 6.022e+23)).toBe('')
  expect(matchTypeString('#int', Math.PI)).toBe(`was ${Math.PI}, expected #int`)
})

test('any and ?', () => {
  expect(matchTypeString('#?number')).toBe('')
  expect(matchTypeString('#any', {})).toBe('')
  expect(matchTypeString('#?any', null)).toBe('')
  expect(matchTypeString('#any', null)).toBe('was null, expected #any')
  expect(matchTypeString('#any')).toBe('was undefined, expected #any')
})

test('enum', () => {
  expect(matchTypeString('#enum false|null|17|"hello"', null)).toBe('')
  expect(matchTypeString('#enum false|null|17|"hello"', 17)).toBe('')
  expect(matchTypeString('#enum false|null|17|"hello"', undefined)).toBe('was undefined, expected #enum false|null|17|"hello"')
})


test('misc', () => {
  expect(matchTypeString({foo: 17, bar: 'hello'}, {foo: 0, bar: 'world'})).toBe('')
  expect(matchTypeString({foo: 17, bar: 'hello'}, {foo: 99})).toBe('.bar was undefined, expected string')
  expect(matchTypeString({foo: 17, bar: 'hello'}, {bar: 'world'})).toBe('.foo was undefined, expected number')
  expect(matchTypeString({foo: 17, bar: 'hello'}, {foo: 0, bar: 17})).toBe('.bar was 17, expected string')
  expect(matchTypeString({foo: 17, bar: 'hello'}, {bar: 17}))
    .toBe(join([".foo was undefined, expected number", ".bar was 17, expected string"]))
  expect(matchTypeString({foo: {bar: {baz: true}}}, {foo: {bar: {baz: false}}})).toBe('')
  expect(matchTypeString({foo: {bar: {baz: true}}}, {foo: {bar: {baz: 17}}})).toBe('.foo.bar.baz was 17, expected boolean')
})

test('array types', () => {
  expect(matchTypeString([], [])).toBe('')
  expect(matchTypeString([1], [])).toBe('')
  expect(matchTypeString([], [1])).toBe('')
  expect(matchTypeString([], [])).toBe('')
  expect(matchTypeString([], {})).toBe('was object, expected array')
  expect(matchTypeString({}, {})).toBe('')
  expect(matchTypeString({}, [])).toBe('was array, expected object')
  expect(matchTypeString(['hello'], ['world'])).toBe('')
  expect(matchTypeString([false], ['world'])).toBe('[0] was "world", expected boolean')
  expect(matchTypeString([{x: 0, y: 17}], [{y: 0, x: 17}])).toBe('')
  expect(matchTypeString([{x: 0, y: 17}], [{y: 0}])).toBe('[0].x was undefined, expected number')
  expect(matchTypeString([{x: 0, y: 17}], [{x: 'world'}]))
    .toBe(join(["[0].x was \"world\", expected number", "[0].y was undefined, expected number"]))
  expect(matchTypeString([{x: 0, y: 17}, {foo: 'bar'}], [{foo: 'baz'}])).toBe('')
  expect(matchTypeString([{x: 0, y: 17}, {foo: 'bar'}], [{foo: false}])).toBe("[0] had no matching type")
})

test ('instance types', () => {
  class Foo {}
  class Bar extends Foo {}
  class Baz extends Bar {}

  expect(matchTypeString('#instance Foo', new Foo())).toBe('')
  expect(matchTypeString('#instance Foo', new Bar())).toBe('')
  expect(matchTypeString('#instance Bar', new Baz())).toBe('')
  expect(matchTypeString('#instance Foo', {})).toBe('was object, expected #instance Foo')
  expect(matchTypeString('#instance Baz', new Foo())).toBe('was Foo, expected #instance Baz')
})

test('enums', () => {
  const requestType = '#enum "get"|"post"|"put"|"delete"|"head"'
  expect(matchTypeString(requestType, 'post')).toBe('')
  expect(matchTypeString(requestType, 'save'))
    .toBe(join(['was \"save\", expected #enum "get"|"post"|"put"|"delete"|"head"']))  
})

test('union types', () => {
  expect(matchTypeString('#union string||int', 'foo')).toBe('')
  expect(matchTypeString('#union string||int', 17)).toBe('')
  expect(matchTypeString('#union string||int', null)).toBe("was null, expected #union string||int")
  expect(matchTypeString('#union string||int', false)).toBe("was false, expected #union string||int")
  expect(matchTypeString('#?union string||int', null)).toBe('')
  expect(matchTypeString('#?union string||int', 17)).toBe('')
})

test('regexp types', () => {
  expect(matchTypeString('#regexp ^\\d{5,5}(-\\d{4,4})?$', '12345')).toBe('')
  expect(matchTypeString('#regexp ^\\d{5,5}(-\\d{4,4})?$', '12345-6789')).toBe('')
  expect(matchTypeString('#regexp ^\\d{5,5}(-\\d{4,4})?$', '2350')).toBe('was "2350", expected #regexp ^\\d{5,5}(-\\d{4,4})?$')
  expect(matchTypeString('#regexp ^\\d{5,5}(-\\d{4,4})?$', '12345-679')).toBe('was "12345-679", expected #regexp ^\\d{5,5}(-\\d{4,4})?$')
})

test('exampleAtPath finds sub-types', () => {
  expect(exampleAtPath({foo: 17}, 'foo')).toBe(17)
  expect(exampleAtPath({bar: 'hello'}, 'foo')).toBe(undefined)
  expect(exampleAtPath({foo: [{bar: 'hello'}]}, 'foo')[0].bar).toBe('hello')
  expect(exampleAtPath({foo: [{bar: 'hello'}]}, 'foo[]').bar).toBe('hello')
  expect(exampleAtPath({foo: [{bar: 'hello'}, {baz: 17}]}, 'foo[]').baz).toBe(17)
  expect(exampleAtPath({foo: [{bar: 'hello'}, {baz: 17}]}, 'foo[].bar')).toBe('hello')
  expect(exampleAtPath({foo: [{bar: 'hello'}, {baz: 17}]}, 'foo[].baz')).toBe(17)
  expect(exampleAtPath({foo: [{bar: 'hello'}, {baz: 17}]}, 'foo[].hello')).toBe(undefined)
})