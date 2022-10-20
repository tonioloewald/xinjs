// @ts-ignore
import { test, expect } from "bun:test"
import {xin, observe, unobserve, observerShouldBeRemoved} from './xin'

type Change = {path: string, value: any}
const changes: Change[] = []

const obj = {
  message: 'hello xin',
  value: 17,
  people: ['tomasina', 'juanita', 'harriet'],
  things: [
    {id: 1701, name: 'Enterprise'},
    {id: 666, name: 'The Beast'},
    {id: 1, name: 'The Best'}
  ],
  cb(path: string) {
    if(path !== 'test.changes')
    changes.push({path, value: xin[path]})
  }
}

xin.test = obj

test('recovers simple values', () => {
  expect(xin.test.message).toBe('hello xin')
  expect(xin.test.value).toBe(17)
})

test('handles arrays', () => {
  expect(xin.test.people[0]).toBe('tomasina')
  expect(xin.test.things['id=1701'].name).toBe('Enterprise')
})

test('updates simple values', () => {
  xin.test.message = 'xin rules'
  xin.test.value++
  expect(xin.test.message).toBe('xin rules')
  expect(xin.test.value).toBe(18)
})

test('triggers listeners', () => {
  changes.splice(0)
  const listener = observe('test', (path) => {
    changes.push({path, value: xin[path]})
  })
  xin.test.value = Math.PI
  expect(changes.length).toBe(1)
  expect(changes[0].path).toBe('test.value')
  expect(changes[0].value).toBe(Math.PI)
  xin.test.message = 'kiss me xin'
  expect(changes.length).toBe(2)
  expect(changes[1].path).toBe('test.message')
  expect(changes[1].value).toBe('kiss me xin')
  xin.test.things['id=1701'].name = 'formerly known as Enterprise'
  expect(changes.length).toBe(3)
  expect(changes[2].path).toBe('test.things[id=1701].name')
  expect(changes[2].value).toBe('formerly known as Enterprise')
  unobserve(listener)
})

test('listener paths are selective', () => {
  changes.splice(0)
  const listener = observe('test.value', (path) => {
    changes.push({path, value: xin[path]})
  })
  xin.test.message = 'ignore this'
  xin.test.value = Math.random()
  expect(changes.length).toBe(1)
  unobserve(listener)
})

test('listener tests are selective', () => {
  changes.splice(0)
  const listener = observe(/message/, (path) => {
    changes.push({path, value: xin[path]})
  })
  xin.test.message = 'hello'
  xin.test.value = Math.random()
  xin.test.message = 'good-bye'
  xin.test.value = Math.random()
  expect(changes.length).toBe(2)
  unobserve(listener)
})

test('listener callback paths work', () => {
  changes.splice(0)
  const listener = observe('test', 'test.cb')
  xin.test.message = 'hello'
  xin.test.value = Math.random()
  xin.test.message = 'good-bye'
  xin.test.value = Math.random()
  expect(changes.length).toBe(4)
  unobserve(listener)
})

test('handles array changes', () => {
  changes.splice(0)
  const listener = observe('test', (path) => {
    changes.push({path, value: xin[path]})
  })
  xin.test.people.push('stanton')
  expect(changes.length).toBe(1)
  expect(changes[0].path).toBe('test.people')
  xin.test.people.sort()
  expect(changes.length).toBe(2)
  expect(changes[1].path).toBe('test.people')
  unobserve(listener)
})

test('unobserve works', () => {
  changes.splice(0)
  const listener = observe('test', (path) => {
    changes.push({path, value: xin[path]})
  })
  xin.test.value = Math.random()
  expect(changes.length).toBe(1)
  unobserve(listener)
  xin.test.things['id=1701'].name = 'Enterprise II'
  xin.test.value = 0
  expect(changes.length).toBe(1)
})

test('_xinPath works', () => {
  expect(xin.test._xinPath).toBe('test')
  expect(xin.test.people._xinPath).toBe('test.people')
  expect(xin.test.things['id=666']._xinPath).toBe('test.things[id=666]')
})

test('_xinValue works, xin does not corrupt content', () => {
  expect(xin.test._xinValue).toBe(obj)
  expect(xin.test.people._xinValue).toBe(obj.people)
  expect(xin.test.things['id=666']._xinValue).toBe(obj.things[1])
})