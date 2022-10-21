// @ts-ignore
import { test, expect } from 'bun:test'
import { filter } from './filter'

const data = {
  name: 'Juanita Citizen',
  age: 55,
  location: {
    lat: -35.1234,
    long: -50.5432
  },
  list: [
    {x: 0, y: 1},
    {x: 17, y: 18, z: 100},
    "hello",
    17,
    -2.33
  ],
}

const filterText = (template: any, obj: any) => JSON.stringify(filter(template, obj))

test('scalars', () => {
  expect(filter('foo', 'bar')).toBe('bar')
  expect(filter('foo', 17)).toBe(undefined)
  expect(filter('#int', Math.PI)).toBe(undefined)
})

test('objects', () => {
  expect(filterText({name: ''}, data)).toBe('{"name":"Juanita Citizen"}')
  expect(filter({DOB: '4/1/1999'}, data)).toBe(undefined)
})

test('arrays', () => {
  expect(filter([], data.list).length).toBe(5)
  expect(filterText([0], data.list)).toBe('[17,-2.33]')
  expect(filterText(['', 0], data.list)).toBe('["hello",17,-2.33]')
})