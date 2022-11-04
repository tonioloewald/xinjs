/* eslint-disable */
// @ts-expect-error
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
  expect(filter('#int', -1)).toBe(-1)
  expect(filter('#int [1', -1)).toBe(undefined)
  expect(filter('#int (-∞,0]', -1)).toBe(-1)
  expect(filter('#int ,0]', -1)).toBe(-1)
  expect(filter('#int 0]', -1)).toBe(-1)
  expect(filter('#int [0,∞)', 1)).toBe(1)
  expect(filter('#int [0,', 1)).toBe(1)
  expect(filter('#int [0', 1)).toBe(1)
  expect(filter({x: 0, y: 0}, {x: 17})).toBe(undefined)
  expect(filter({x: 0, y: '#?number'}, {x: 17}).x).toBe(17)
  expect(filter({x: 0, y: '#?number'}, {x: 17}).y).toBe(undefined)
  expect(filter({x: 0, y: '#?number'}, {x: 17, y: -2}).y).toBe(-2)
  expect(filter('#int', 1)).toBe(1)
  expect(filter(1, '#int')).toBe(undefined)
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

test('rejecting partial objects', () => {
  expect(filterText({x: 0, y: 0}, {x: 1, y: 2, z: 3})).toBe('{"x":1,"y":2}')
  expect(filter({x: 0, y: 0, z: 0}, {x: 1, y: 1})).toBe(undefined)
  expect(filterText({x: 0, y: 0, '#z?': 0}, {x: 1, y: 2})).toBe('{"x":1,"y":2}')
})