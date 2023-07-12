/* eslint-disable */
// @ts-expect-error
import { test, expect } from 'bun:test'
import { XinObject, XinProxyArray, XinProxyObject, XinArray } from './xin-types'
import { xin, observe, unobserve, touch, updates, isValidPath } from './xin'
import { XIN_VALUE, XIN_PATH } from './metadata'

type Change = { path: string; value: any; observed?: any }
const changes: Change[] = []
const recordChange = (change: Change) => {
  changes.push(change)
}

const obj = {
  message: 'hello xin',
  value: 17,
  people: ['tomasina', 'juanita', 'harriet'],
  things: [
    { id: 1701, name: 'Enterprise' },
    { id: 666, name: 'The Beast' },
    { id: 1, name: 'The Best' },
  ],
  cb(path: string) {
    if (path !== 'test.changes') recordChange({ path, value: xin[path] })
  },
  sub: {
    foo: 'bar',
  },
}

xin.test = obj as unknown as XinProxyObject

test('recovers simple values', () => {
  const _test = xin.test as XinProxyObject
  expect(_test.message).toBe('hello xin')
  expect(_test.value).toBe(17)
})

test('handles arrays', () => {
  const _test = xin.test as XinProxyObject
  const people = _test.people as string[]
  const things = _test.things as XinProxyArray
  expect(people[0]).toBe('tomasina')
  expect(things['id=1701'].name).toBe('Enterprise')
})

test('updates simple values', () => {
  const _test = xin.test as XinProxyObject
  _test.message = 'xin rules'
  // @ts-ignore-error
  _test.value++
  expect(_test.message).toBe('xin rules')
  expect(_test.value).toBe(18)
})

test('array iterators', () => {
  let count = 0
  // @ts-ignore-error
  for (const item of xin.test.people) {
    count++
  }
  expect(count).toBe(3)
})

test('isValidPath', () => {
  expect(isValidPath('')).toBe(false)
  expect(isValidPath('.')).toBe(false)
  expect(isValidPath('.foo')).toBe(true)
  expect(isValidPath('airtime-rooms[id=1234].')).toBe(false)
  expect(isValidPath('foo')).toBe(true)
  expect(isValidPath('_foo')).toBe(true)
  expect(isValidPath('foo_17')).toBe(true)
  expect(isValidPath('foo.bar')).toBe(true)
  expect(isValidPath('path.to.value,another.path')).toBe(false)
  expect(isValidPath('foo()')).toBe(false)
  expect(isValidPath('foo(path.to.value,another.path)')).toBe(false)
  expect(isValidPath('/')).toBe(true)
  expect(isValidPath('airtime-rooms[1234]')).toBe(true)
  expect(isValidPath('airtime-rooms[=abcd]')).toBe(true)
  expect(isValidPath('airtime-rooms[/=abcd]')).toBe(true)
  expect(isValidPath('airtime-rooms[id=1234]')).toBe(true)
  expect(isValidPath('airtime-rooms[url=https://foo.bar/baz?x=y]')).toBe(true)
  expect(
    isValidPath(
      'airtime-rooms[url=https://foo.bar/baz?x=y&foo=this, that, and the other.jpg]'
    )
  ).toBe(true)
  expect(isValidPath('airtime-rooms]')).toBe(false)
  expect(isValidPath('airtime-rooms[id=1234')).toBe(false)
  expect(isValidPath('airtime-rooms[id]')).toBe(false)
  expect(isValidPath('airtime-rooms[id=1234]]')).toBe(false)
  expect(isValidPath('airtime-rooms[]]')).toBe(false)
})

test('triggers listeners', async () => {
  changes.splice(0)
  const listener = observe('test', (path) => {
    recordChange({ path, value: xin[path] })
  })
  const test = xin.test as XinProxyObject
  test.value = Math.PI
  await updates()
  expect(changes.length).toBe(1)
  expect(changes[0].path).toBe('test.value')
  expect(changes[0].value).toBe(Math.PI)
  test.message = 'kiss me xin'
  await updates()
  expect(changes.length).toBe(2)
  expect(changes[1].path).toBe('test.message')
  expect(changes[1].value).toBe('kiss me xin')
  ;(test.things as XinProxyArray)['id=1701'].name =
    'formerly known as Enterprise'
  await updates()
  expect(changes.length).toBe(3)
  expect(changes[2].path).toBe('test.things[id=1701].name')
  expect(changes[2].value).toBe('formerly known as Enterprise')
  ;(test.people as XinProxyArray).sort()
  // expect sort to trigger change
  await updates()
  expect(changes.length).toBe(4)
  expect(changes[3].path).toBe('test.people')
  // expect map to NOT trigger change
  const ignore = (test.people as XinProxyArray).map(
    (person) => `hello ${person}`
  )
  await updates()
  expect(changes.length).toBe(4)
  unobserve(listener)
})

test('listener paths are selective', async () => {
  changes.splice(0)
  const listener = observe('test.value', (path) => {
    recordChange({ path, value: xin[path] })
  })
  const test = xin.test as XinProxyObject
  test.message = 'ignore this'
  test.value = Math.random()
  await updates()
  expect(changes.length).toBe(1)
  unobserve(listener)
})

test('listener tests are selective', async () => {
  changes.splice(0)
  const listener = observe(/message/, (path) => {
    recordChange({ path, value: xin[path] })
  })
  const _test = xin.test as XinProxyObject
  _test.value = Math.random()
  _test.message = 'hello'
  _test.value = Math.random()
  await updates()
  expect(changes.length).toBe(1)
  unobserve(listener)
})

test('async updates skip multiple updates to the same path', async () => {
  changes.splice(0)
  const listener = observe('test.value', (path) => {
    recordChange({ path, value: xin[path] })
  })
  const test = xin.test as XinProxyObject
  test.value = (test.value as number) - 1
  test.value = 17
  test.value = Math.PI
  await updates()
  expect(changes.length).toBe(1)
  test.value = 17
  await updates()
  expect(changes.length).toBe(2)
  unobserve(listener)
})

test('listener callback paths work', async () => {
  changes.splice(0)
  const listener = observe('test', 'test.cb')
  const test = xin.test as XinProxyObject
  test.message = 'hello'
  test.value = Math.random()
  test.message = 'good-bye'
  test.value = Math.random()
  await updates()
  expect(changes.length).toBe(2)
  unobserve(listener)
})

test('you can touch objects', async () => {
  changes.splice(0)
  const listener = observe('test', (path) => {
    recordChange({ path, value: xin[path] })
  })

  const test = xin.test as XinProxyObject
  ;(test[XIN_VALUE] as XinObject).message = 'wham-o'
  expect(test.message).toBe('wham-o')
  await updates()
  expect(changes.length).toBe(0)
  touch('test')
  await updates()
  expect(changes.length).toBe(1)
  test.message = 'because'
  await updates()
  expect(changes.length).toBe(2)
  ;(test[XIN_VALUE] as XinObject).message = 'i said so'
  await updates()
  expect(changes.length).toBe(2)
  touch('test.message')
  await updates()
  expect(changes.length).toBe(3)
  expect(changes[2].value).toBe('i said so')
  unobserve(listener)
})

test('instance changes trigger observers', async () => {
  changes.splice(0)

  class Bar {
    parent: Baz

    constructor(parent: Baz) {
      this.parent = parent
    }

    inc() {
      this.parent.inc()
    }
  }

  class Baz {
    x: number = 0
    child: Bar

    constructor(x: number = 0) {
      this.x = x
      this.child = new Bar(this)
    }

    get y() {
      return this.x
    }

    set y(newValue: number) {
      this.x = newValue
    }

    inc() {
      this.x++
    }
  }

  const baz = new Baz(17)
  const _test = xin.test as XinProxyObject
  _test.baz = baz as unknown as XinProxyObject

  const listener = observe(
    () => true,
    (path) => {
      recordChange({ path, value: xin[path] })
    }
  )

  await updates()
  expect(changes.length).toBe(1)

  changes.splice(0)
  expect((_test.baz as XinProxyObject)[XIN_VALUE]).toBe(baz)
  expect(_test.baz.x).toBe(17)
  expect(_test.baz.y).toBe(17)
  await updates()
  expect(changes.length).toBe(0)
  _test.baz.x = 100
  await updates()
  expect(changes.length).toBe(1)
  expect(changes[0].path).toBe('test.baz.x')
  _test.baz.x = 100
  await updates()
  expect(changes.length).toBe(1)
  _test.baz.y = 100
  await updates()
  expect(changes.length).toBe(1)
  expect(changes[0].path).toBe('test.baz.x')
  _test.baz.y = -10
  await updates()
  expect(changes.length).toBe(2)
  expect(changes[1].path).toBe('test.baz.y')
  ;(_test.baz.inc as Function)()
  await updates()
  expect(changes.length).toBe(2)
  expect(_test.baz.x).toBe(-9)
  // @ts-ignore-error
  _test.baz.child.inc()
  await updates()
  expect(changes.length).toBe(2)
  expect(_test.baz.x).toBe(-8)
  // @ts-ignore-error
  expect(_test.baz.x).toBe(_test.baz.child.parent.x)

  unobserve(listener)
})

test('handles array changes', async () => {
  changes.splice(0)
  const listener = observe('test', (path) => {
    recordChange({ path, value: xin[path] })
  })
  const _test = xin.test as XinProxyObject
  const people = _test.people as XinArray
  // @ts-ignore-error
  _test.people.push('stanton')
  await updates()
  expect(changes.length).toBe(1)
  expect(changes[0].path).toBe('test.people')
  ;(_test.people as XinProxyArray).sort()
  await updates()
  expect(changes.length).toBe(2)
  expect(changes[1].path).toBe('test.people')
  unobserve(listener)
})

test('objects are replaced', () => {
  const _test = xin.test as XinProxyObject
  // @ts-ignore-error
  expect(_test.sub.foo).toBe('bar')
  _test.sub = {
    bar: 'baz',
  } as unknown as XinProxyObject
  expect(_test.sub.foo).toBe(undefined)
  expect(_test.sub.bar).toBe('baz')
})

test('unobserve works', async () => {
  changes.splice(0)
  const listener = observe('test', (path) => {
    recordChange({ path, value: xin[path] })
  })
  const _test = xin.test as XinProxyObject
  const things = _test.things as XinProxyArray
  _test.value = Math.random()
  await updates()
  expect(changes.length).toBe(1)
  unobserve(listener)
  things['id=1701'].name = 'Enterprise II'
  _test.value = 0
  await updates()
  expect(changes.length).toBe(1)
})

test('XIN_PATH works', () => {
  const _test = xin.test as XinProxyObject
  const things = _test.things as XinProxyArray
  const people = _test.people as XinProxyArray
  expect(_test[XIN_PATH]).toBe('test')
  expect(people[XIN_PATH]).toBe('test.people')
  expect(things['id=666'][XIN_PATH]).toBe('test.things[id=666]')
})

test('XIN_VALUE works, xin does not corrupt content', () => {
  const _test = xin.test as XinProxyObject
  const things = _test.things as XinProxyArray
  const people = _test.people as XinProxyArray
  expect(_test[XIN_VALUE]).toBe(obj)
  expect(people[XIN_VALUE]).toBe(obj.people)
  expect((things['id=666'] as XinProxyObject)[XIN_VALUE]).toBe(
    (things[1] as XinProxyObject)[XIN_VALUE]
  )
})

test('instance properties, computed properties', () => {
  class Foo {
    x: string = ''

    constructor(x: string) {
      this.x = x
    }

    get computedX() {
      return this.x
    }
  }

  xin.foo = new Foo('test') as unknown as XinProxyObject
  expect(xin.foo.x).toBe('test')
  expect(xin.foo.computedX).toBe('test')
})

test('parents and children', async () => {
  xin.grandparent = {
    name: 'Bobby',
    parent: { child: 17 },
  } as unknown as XinProxyObject
  const grandparent = xin.grandparent as XinObject
  changes.splice(0)
  observe('grandparent.parent', (path) => {
    recordChange({ path, value: xin[path], observed: 'parent' })
  })
  observe('grandparent.parent.child', (path) => {
    recordChange({ path, value: xin[path], observed: 'parent.child' })
  })
  grandparent.parent = { child: 20 }
  await updates()
  expect(changes.length).toBe(2)
  grandparent.parent.child = 20
  await updates()
  expect(changes.length).toBe(2)
  grandparent.parent.child = 17
  await updates()
  expect(changes.length).toBe(4)
  grandparent.parent = { child: 11 }
  await updates()
  expect(changes.length).toBe(6)
  grandparent.name = 'Drop Tables'
  await updates()
  expect(changes.length).toBe(6)
})

test('no double wrapping', () => {
  const fubar = { barfu: { bazfu: 17 } }
  xin.fubar = fubar
  expect(xin.fubar[XIN_VALUE]).toBe(fubar)
  expect(xin.fubar.barfu[XIN_VALUE]).toBe(fubar.barfu)
  xin.fubar = { ...xin.fubar }
  expect(xin.fubar[XIN_VALUE]).not.toBe(fubar)
  expect(xin.fubar.barfu[XIN_VALUE]).toBe(fubar.barfu)
  delete xin.fubar
  expect(xin.fubar).toBe(undefined)
})
