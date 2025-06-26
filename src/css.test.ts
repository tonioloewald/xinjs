import { test, expect } from 'bun:test'
import { camelToKabob, kabobToCamel } from './string-case'
import { initVars, vars, css, varDefault } from './css'

test('camelToKabob works', () => {
  expect(camelToKabob('x')).toBe('x')
  expect(camelToKabob('X')).toBe('-x')
  expect(camelToKabob('thisIsATest')).toBe('this-is-a-test')
  expect(camelToKabob('hello world')).toBe('hello world')
  expect(camelToKabob('innerHTML')).toBe('inner-h-t-m-l')
  expect(camelToKabob('InnerHTML')).toBe('-inner-h-t-m-l')
  expect(camelToKabob('_thisIsATest')).toBe('_this-is-a-test')
  expect(camelToKabob('__thisIsATest')).toBe('__this-is-a-test')
})

test('kabobToCamel works', () => {
  expect(kabobToCamel('-a')).toBe('A')
  expect(kabobToCamel('a')).toBe('a')
  expect(kabobToCamel('this-is-a-test')).toBe('thisIsATest')
  expect(kabobToCamel('-wabbit-season')).toBe('WabbitSeason')
  expect(kabobToCamel('-inner-h-t-m-l')).toBe('InnerHTML')
  expect(kabobToCamel('inner-h-t-m-l')).toBe('innerHTML')
})

test('vars works', () => {
  expect(vars.foo).toBe('var(--foo)')
  expect(vars.fooBar).toBe('var(--foo-bar)')
  expect(vars.fooBar50).toBe('calc(var(--foo-bar) * 0.5)')
  expect(vars.fooBar_50).toBe('calc(var(--foo-bar) * -0.5)')
  expect(vars.h2Scale).toBe('var(--h2-scale)')
  expect(vars.h2FontSize80).toBe('calc(var(--h2-font-size) * 0.8)')
  expect(vars.h2FontSize_50).toBe('calc(var(--h2-font-size) * -0.5)')
})

test('initVars works', () => {
  expect(
    initVars({
      foo: 17,
    })['--foo']
  ).toBe('17px')
})

const cssText = `:root {
  --foo: 17px;
  --foo-width: 666px;
}

bar {
  baz-lurman: calc(var(--foo-bar) * 0.75);
  cohen-bros: calc(var(--fargo) * -1);
}`

test('css works', () => {
  expect(
    css({
      ':root': initVars({
        foo: 17,
        fooWidth: 666,
      }),
      bar: {
        bazLurman: vars.fooBar75,
        cohenBros: vars.fargo_100,
      },
    })
  ).toBe(cssText)
})

test('varDefault Works', () => {
  expect(varDefault.fooBar('50px')).toBe('var(--foo-bar, 50px)')
})

test('vars.default Works', () => {
  expect(vars.default.barBaz('#f00')).toBe('var(--bar-baz, #f00)')
})
