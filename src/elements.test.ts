import { test, expect } from 'bun:test'
import { boxedProxy } from './xin-proxy'
import { elements } from './elements'
import { updates } from './path-listener'

test('element creation works', () => {
  const { div, input } = elements
  expect(div().tagName).toBe('DIV')
  expect(input({ value: 17 }).value).toBe('17')
})

test('element attributes work', () => {
  const { div } = elements
  expect(div({ dataFoo: 'bar' }).dataset.foo).toBe('bar')
  expect(div({ id: 'whatevs' }).id).toBe('whatevs')
})

test('data binding works', async () => {
  const { test } = boxedProxy({
    test: {
      value: 'hello world',
    },
  })

  expect(test.value.valueOf()).toBe('hello world')

  const div = elements.div({ bindText: test.value })
  document.body.append(div)

  await updates()
  expect(div.textContent).toBe('hello world')
})

test('event binding works', async () => {
  const { test } = boxedProxy({
    test: {
      count: 0,
      handler() {
        // @ts-expect-error tsc is stupid
        test.count += 1
      },
    },
  })

  test.handler()
  expect(test.count.valueOf()).toBe(1)

  const button = elements.button({ onClick: test.handler })
  document.body.append(button)
  button.click()
  expect(test.count.valueOf()).toBe(2)

  button.remove()
})

test('style binding works', async () => {
  const div = elements.div({
    style: {
      _fooBar: '17px',
      __barBaz: 'green',
      textAlign: 'center',
    },
  })

  expect(div.style.textAlign).toBe('center')
  expect(div.style.getPropertyValue('--foo-bar')).toBe('17px')
  expect(div.style.getPropertyValue('--bar-baz')).toBe(
    'var(--bar-baz-default, green)'
  )
})
