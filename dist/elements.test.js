/* eslint-disable */
// @ts-expect-error
import { test, expect } from 'bun:test';
import { camelToKabob, kabobToCamel } from './elements';
import { initVars, vars, css } from './css';
test('camelToKabob works', () => {
    expect(camelToKabob('x')).toBe('x');
    expect(camelToKabob('X')).toBe('-x');
    expect(camelToKabob('thisIsATest')).toBe('this-is-a-test');
    expect(camelToKabob('hello world')).toBe('hello world');
    expect(camelToKabob('innerHTML')).toBe('inner-h-t-m-l');
    expect(camelToKabob('InnerHTML')).toBe('-inner-h-t-m-l');
});
test('kabobToCamel works', () => {
    expect(kabobToCamel('-a')).toBe('A');
    expect(kabobToCamel('a')).toBe('a');
    expect(kabobToCamel('this-is-a-test')).toBe('thisIsATest');
    expect(kabobToCamel('-wabbit-season')).toBe('WabbitSeason');
    expect(kabobToCamel('-inner-h-t-m-l')).toBe('InnerHTML');
    expect(kabobToCamel('inner-h-t-m-l')).toBe('innerHTML');
});
// these tests belong in css.test.ts but mysteriously putting them there causes other tests to fail
test('vars works', () => {
    expect(vars.foo).toBe('var(--foo)');
    expect(vars.fooBar).toBe('var(--foo-bar)');
    expect(vars.fooBar50).toBe('calc(var(--foo-bar) * 0.5)');
    expect(vars.fooBar_50).toBe('calc(var(--foo-bar) * -0.5)');
});
test('initVars works', () => {
    expect(initVars({
        foo: 17
    })['--foo']).toBe('17px');
});
const cssText = `:root {
  --foo: 17px;
}

bar {
  baz-lurman: calc(var(--foo-bar) * 0.75);
  cohen-bros: calc(var(--fargo) * -1);
}`;
test('css works', () => {
    expect(css({
        ':root': initVars({
            foo: 17,
        }),
        'bar': {
            bazLurman: vars.fooBar75,
            cohenBros: vars.fargo_100
        }
    })).toBe(cssText);
});
