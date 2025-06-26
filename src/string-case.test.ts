import { test, expect } from 'bun:test'
import { camelToKabob, kabobToCamel } from './string-case'

test('camelToKabob works', () => {
  expect(camelToKabob('aBc')).toBe('a-bc')
  expect(camelToKabob('a-bc')).toBe('a-bc')
  expect(camelToKabob('testHTML')).toBe('test-h-t-m-l')
  expect(camelToKabob('testHtml')).toBe('test-html')
  expect(camelToKabob('h2Scale')).toBe('h2-scale')
})

test('kabobToCamel works', () => {
  expect(kabobToCamel('aBc')).toBe('aBc')
  expect(kabobToCamel('a-bc')).toBe('aBc')
})
