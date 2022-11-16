/* eslint-disable */
// @ts-expect-error
import { test, expect } from 'bun:test'
import { camelToKabob, kabobToCamel } from './elements'

test('camelToKabob works', () => {
  expect(camelToKabob('x')).toBe('x')
  expect(camelToKabob('X')).toBe('-x')
  expect(camelToKabob('thisIsATest')).toBe('this-is-a-test')
  expect(camelToKabob('hello world')).toBe('hello world')
  expect(camelToKabob('innerHTML')).toBe('inner-h-t-m-l')
  expect(camelToKabob('InnerHTML')).toBe('-inner-h-t-m-l')
})

test('kabobToCamel works', () => {
  expect(kabobToCamel('-a')).toBe('A')
  expect(kabobToCamel('a')).toBe('a')
  expect(kabobToCamel('this-is-a-test')).toBe('thisIsATest')
  expect(kabobToCamel('-wabbit-season')).toBe('WabbitSeason')
  expect(kabobToCamel('-inner-h-t-m-l')).toBe('InnerHTML')
  expect(kabobToCamel('inner-h-t-m-l')).toBe('innerHTML')
})