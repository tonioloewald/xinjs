// @ts-ignore
import { test, expect } from 'bun:test'
import { create, elements } from './elements'

test('create', () => {
  expect(create('div').tagName).toBe('DIV')
})