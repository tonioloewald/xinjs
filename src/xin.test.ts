// @ts-expect-error bun:test
import { test, expect } from 'bun:test'
import { XinObject, XinProxyArray, XinProxyObject, XinArray } from './xin-types'
import {
  xin,
  boxed,
  observe,
  unobserve,
  touch,
  updates,
  isValidPath,
} from './xin'
import { XIN_VALUE, XIN_PATH, xinPath } from './metadata'

type Change = { path: string; value: any; observed?: any }
const changes: Change[] = []
const recordChange = (change: Change) => {
  changes.push(change)
}
async function resetChanges() {
  await updates()
  changes.splice(0)
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

test('boxed proxies', () => {
  const _test = boxed.test
  expect(_test.message.valueOf()).toBe('hello xin')
  expect(xinPath(_test.message)).toBe('test.message')
  expect(_test.people[1].valueOf()).toBe('juanita')
  expect(xinPath(_test.people[1])).toBe('test.people[1]')
  expect(_test.things['id=1701'].name.valueOf()).toBe('Enterprise')
  expect(xinPath(_test.things['id=1701'].name)).toBe(
    'test.things[id=1701].name'
  )
})

test('valueOf works', () => {
  expect(boxed.test.message.valueOf()).toBe('hello xin')
  expect(boxed.test.message).not.toBe('hello xin')
  expect(boxed.test.valueOf().message).toBe('hello xin')
  expect(boxed.test.things['id=666'].name.valueOf()).toBe('The Beast')
})

test('xinPath works', () => {
  expect(boxed.test.xinPath).toBe('test')
  expect(boxed.test.message.xinPath).toBe('test.message')
  expect(boxed.test.things['id=666'].xinPath).toBe('test.things[id=666]')
  expect(boxed.test.things[2].xinPath).toBe('test.things[2]')
})

test('updates simple values', () => {
  const _test = xin.test as XinProxyObject
  _test.message = 'xin rules!'
  // @ts-expect-error it's just a test
  _test.value++
  expect(_test.message).toBe('xin rules!')
  expect(_test.value).toBe(18)
})

test('array iterators', () => {
  let count = 0
  for (const item of xin.test.people) {
    if (item !== undefined) {
      count++
    }
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
  await resetChanges()
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
    (person) => `hello ${String(person)}`
  )
  expect(ignore === undefined).toBe(false)
  await updates()
  expect(changes.length).toBe(4)
  unobserve(listener)
})

test('listener paths are selective', async () => {
  await resetChanges()
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
  await resetChanges()
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
  await resetChanges()
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
  await resetChanges()
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
  await resetChanges()
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
  await resetChanges()

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

  await resetChanges()
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
  ;(_test.baz.inc as () => void)()
  await updates()
  expect(changes.length).toBe(2)
  expect(_test.baz.x).toBe(-9)
  _test.baz.child.inc()
  await updates()
  expect(changes.length).toBe(2)
  expect(_test.baz.x).toBe(-8)
  expect(_test.baz.x).toBe(_test.baz.child.parent.x)

  unobserve(listener)
})

test('handles array changes', async () => {
  await resetChanges()
  const listener = observe('test', (path) => {
    recordChange({ path, value: xin[path] })
  })
  const _test = xin.test as XinProxyObject
  const people = _test.people as XinArray
  expect(people === undefined).toBe(false)
  // @ts-expect-error it's a test
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
  // @ts-expect-error it's a test
  expect(_test.sub.foo).toBe('bar')
  _test.sub = {
    bar: 'baz',
  } as unknown as XinProxyObject
  expect(_test.sub.foo).toBe(undefined)
  expect(_test.sub.bar).toBe('baz')
})

test('unobserve works', async () => {
  await resetChanges()
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

test('xinPath works', () => {
  const _test = xin.test as XinProxyObject
  const things = _test.things as XinProxyArray
  const people = _test.people as XinProxyArray
  expect(_test.xinPath).toBe('test')
  expect(people.xinPath).toBe('test.people')
  expect(things['id=666'].xinPath).toBe('test.things[id=666]')
})

test('xinValue works, xin does not corrupt content', () => {
  const _test = xin.test as XinProxyObject
  const things = _test.things as XinProxyArray
  const people = _test.people as XinProxyArray
  expect(_test[XIN_VALUE]).toBe(obj)
  expect(people[XIN_VALUE]).toBe(obj.people)
  expect((things['id=666'] as XinProxyObject)[XIN_VALUE]).toBe(
    (things[1] as XinProxyObject)[XIN_VALUE]
  )
})

test('xinObserve works', async () => {
  const { test } = boxed
  let a: any = null
  const observer = test.value.xinObserve((path) => {
    a = xin[path]
  })
  test.value = 'hello'
  await updates()
  expect(a).toBe('hello')
  test.value = 17
  await updates()
  expect(a).toBe(17)
  unobserve(observer)
  test.value = 'goodbye'
  await updates()
  expect(a).toBe(17)
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
  await resetChanges()
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
