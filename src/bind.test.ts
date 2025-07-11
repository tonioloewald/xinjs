import { test, expect } from 'bun:test'
import { boxedProxy } from './xin-proxy'
import { elements } from './elements'
import { updates } from './path-listener'

test('element binding works', async () => {
  const { div, input } = elements
  const { test } = boxedProxy({
    test: {
      value: 17,
      string: 'foobar',
      enabled: false,
    },
  })
  const boundDiv = div({ bindText: test.string })
  const boundInput = input({
    bindValue: test.value,
    bindEnabled: test.enabled,
  })
  document.body.append(boundDiv, boundInput)
  await updates()
  expect(boundDiv.textContent).toBe('foobar')
  expect(JSON.stringify(boundInput.value)).toBe('"17"')
  expect(boundInput.disabled).toBe(true)
  boundInput.value = 'baz'
  boundInput.dispatchEvent(new Event('change'))
  await updates()
  expect(boundInput.value).toBe('baz')
})

test('custom bindings work', async () => {
  const { div, input } = elements
  const { test } = boxedProxy({
    test: {
      value: 87,
      string: 'foobar',
      enabled: false,
      color: 'red',
    },
  })

  const boundDiv = div({
    bind: {
      value: test.string,
      binding: {
        toDOM(element, value) {
          // happydom does not support element.dataset
          element.setAttribute('data-what', value)
        },
      },
    },
  })

  const boundInput = input({
    bind: {
      value: test.color,
      binding: {
        toDOM(element, value) {
          element.style.color = value
        },
        fromDOM(element) {
          return element.style.color
        },
      },
    },
  })

  document.body.append(boundDiv, boundInput)
  await updates()
  expect(boundDiv.getAttribute('data-what')).toBe('foobar')
  expect(boundInput.style.color).toBe('red')
  test.string = 'baz'
  test.color = 'yellow'
  await updates()
  expect(boundDiv.getAttribute('data-what')).toBe('baz')
  expect(boundInput.style.color).toBe('yellow')
  boundInput.style.color = 'blue'
  boundInput.dispatchEvent(new Event('change'))
  await updates()
  expect(test.color.valueOf()).toBe('blue')
})
