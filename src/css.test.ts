/* eslint-disable */
// @ts-expect-error
import { test, expect } from 'bun:test'
import { initVars, vars, css } from './css'

test('vars works', () => {
  expect(vars.foo).toBe('var(--foo)')
  expect(vars.fooBar).toBe('var(--foo-bar)')
  expect(vars.fooBar50).toBe('calc(var(--foo-bar) * 0.5)')
  expect(vars.fooBar_50).toBe('calc(var(--foo-bar) * -0.5)')
})

test('initVars works', () => {
  expect(initVars({
    foo: 17
  })['--foo']).toBe('17px') 
})

const cssText = `:root {
  --foo: 17px;
}

bar {
  baz-lurman: calc(var(--foo-bar) * 0.75);
  cohen-bros: calc(var(--fargo) * -1);
}`

test('css works', () => {
  expect(css({
    ':root': initVars({
      foo: 17,
    }),
    'bar': {
      bazLurman: vars.fooBar75,
      cohenBros: vars.fargo_100
    }
  })).toBe(cssText)
})
