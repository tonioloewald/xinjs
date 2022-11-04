/* eslint-disable */
// @ts-expect-error
import { test, expect } from 'bun:test'
import { xin, observe, unobserve, observerShouldBeRemoved, touch, updates, isValidPath } from './xin'

type Change = { path: string, value: any, observed?: any }
const changes: Change[] = []

const obj = {
  message: 'hello xin',
  value: 17,
  people: ['tomasina', 'juanita', 'harriet'],
  things: [
    { id: 1701, name: 'Enterprise'},
    { id: 666, name: 'The Beast'},
    { id: 1, name: 'The Best'}
  ],
  cb(path: string) {
    if(path !== 'test.changes')
    changes.push({ path, value: xin[path]})
  },
  sub: {
    foo: 'bar'
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

// TODO make this work (see TODO in xin.ts)
test('array iterators', () => {
  let count = 0
  for(const item of xin.test.people) {
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
  expect(isValidPath('airtime-rooms[url=https://foo.bar/baz?x=y&foo=this, that, and the other.jpg]')).toBe(true)
  expect(isValidPath('airtime-rooms]')).toBe(false)
  expect(isValidPath('airtime-rooms[id=1234')).toBe(false)
  expect(isValidPath('airtime-rooms[id]')).toBe(false)
  expect(isValidPath('airtime-rooms[id=1234]]')).toBe(false)
  expect(isValidPath('airtime-rooms[]]')).toBe(false)
})

test('triggers listeners', async () => {
  changes.splice(0)
  const listener = observe('test', (path) => {
    changes.push({ path, value: xin[path]})
  })
  xin.test.value = Math.PI
  await updates()
  expect(changes.length).toBe(1)
  expect(changes[0].path).toBe('test.value')
  expect(changes[0].value).toBe(Math.PI)
  xin.test.message = 'kiss me xin'
  await updates()
  expect(changes.length).toBe(2)
  expect(changes[1].path).toBe('test.message')
  expect(changes[1].value).toBe('kiss me xin')
  xin.test.things['id=1701'].name = 'formerly known as Enterprise'
  await updates()
  expect(changes.length).toBe(3)
  expect(changes[2].path).toBe('test.things[id=1701].name')
  expect(changes[2].value).toBe('formerly known as Enterprise')
  xin.test.people.sort()
  // expect sort to trigger change
  await updates()
  expect(changes.length).toBe(4)
  expect(changes[3].path).toBe('test.people')
  // expect map to NOT trigger change
  const ignore = xin.test.people.map((person: string) => `hello ${person}`)
  await updates()
  expect(changes.length).toBe(4)
  unobserve(listener)
})

test('listener paths are selective', async () => {
  changes.splice(0)
  const listener = observe('test.value', (path) => {
    changes.push({ path, value: xin[path]})
  })
  xin.test.message = 'ignore this'
  xin.test.value = Math.random()
  await updates()
  expect(changes.length).toBe(1)
  unobserve(listener)
})

test('listener tests are selective', async () => {
  changes.splice(0)
  const listener = observe(/message/, (path) => {
    changes.push({ path, value: xin[path]})
  })
  xin.test.value = Math.random()
  xin.test.message = 'hello'
  xin.test.value = Math.random()
  await updates()
  expect(changes.length).toBe(1)
  unobserve(listener)
})

test('async updates skip multiple updates to the same path', async () => {
  changes.splice(0)
  const listener = observe('test.value', (path) => {
    changes.push({ path, value: xin[path]})
  })
  xin.test.value = xin.test.value - 1
  xin.test.value = 17
  xin.test.value = Math.PI
  await updates()
  expect(changes.length).toBe(1)
  xin.test.value = 17
  await updates()
  expect(changes.length).toBe(2)
  unobserve(listener)
})

test('listener callback paths work', async () => {
  changes.splice(0)
  const listener = observe('test', 'test.cb')
  xin.test.message = 'hello'
  xin.test.value = Math.random()
  xin.test.message = 'good-bye'
  xin.test.value = Math.random()
  await updates()
  expect(changes.length).toBe(2)
  unobserve(listener)
})

test('you can touch objects', async () => {
  changes.splice(0)
  const listener = observe('test', path => {
    changes.push({ path, value: xin[path] })
  })
  xin.test._xinValue.message = 'wham-o'
  expect(xin.test.message).toBe('wham-o')
  await updates()
  expect(changes.length).toBe(0)
  touch(xin.test)
  await updates()
  expect(changes.length).toBe(1)
  xin.test.message = 'because'
  await updates()
  expect(changes.length).toBe(2)
  xin.test._xinValue.message = 'i said so'
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

    get y () {
      return this.x
    }

    set y (newValue: number) {
      this.x = newValue
    }

    inc () {
        this.x++
    }
  }

  const baz = new Baz(17)
  xin.test.baz = baz

  const listener = observe(() => true, (path) => {
    changes.push({ path, value: xin[path]})
  })
  
  await updates()
  expect(changes.length).toBe(1)

  changes.splice(0)
  expect(xin.test.baz._xinValue).toBe(baz)
  expect(xin.test.baz.x).toBe(17)
  expect(xin.test.baz.y).toBe(17)
  await updates()
  expect(changes.length).toBe(0)
  xin.test.baz.x = 100
  await updates()
  expect(changes.length).toBe(1)
  expect(changes[0].path).toBe('test.baz.x')
  xin.test.baz.x = 100
  await updates()
  expect(changes.length).toBe(1)
  xin.test.baz.y = 100
  await updates()
  expect(changes.length).toBe(1)
  expect(changes[0].path).toBe('test.baz.x')
  xin.test.baz.y = -10
  await updates()
  expect(changes.length).toBe(2)
  expect(changes[1].path).toBe('test.baz.y')
  xin.test.baz.inc()
  await updates()
  expect(changes.length).toBe(2)
  expect(xin.test.baz.x).toBe(-9)
  xin.test.baz.child.inc()
  await updates()
  expect(changes.length).toBe(2)
  expect(xin.test.baz.x).toBe(-8)
  expect(xin.test.baz.x).toBe(xin.test.baz.child.parent.x)

  unobserve(listener)
})

test('handles array changes', async () => {
  changes.splice(0)
  const listener = observe('test', (path) => {
    changes.push({ path, value: xin[path]})
  })
  xin.test.people.push('stanton')
  await updates()
  expect(changes.length).toBe(1)
  expect(changes[0].path).toBe('test.people')
  xin.test.people.sort()
  await updates()
  expect(changes.length).toBe(2)
  expect(changes[1].path).toBe('test.people')
  unobserve(listener)
})

test('objects are replaced', () => {
  expect(xin.test.sub.foo).toBe('bar')
  xin.test.sub = {
    bar: 'baz'
  }
  expect(xin.test.sub.foo).toBe(undefined)
  expect(xin.test.sub.bar).toBe('baz')
})

test('unobserve works', async () => {
  changes.splice(0)
  const listener = observe('test', (path) => {
    changes.push({ path, value: xin[path]})
  })
  xin.test.value = Math.random()
  await updates()
  expect(changes.length).toBe(1)
  unobserve(listener)
  xin.test.things['id=1701'].name = 'Enterprise II'
  xin.test.value = 0
  await updates()
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

  xin.foo = new Foo('test')
  expect(xin.foo.x).toBe('test')
  expect(xin.foo.computedX).toBe('test')
})

test('parents and children', async () => {
  xin.grandparent = {
    name: 'Bobby',
    parent: {child: 17}
  }
  changes.splice(0)
  observe('grandparent.parent', path => {
    changes.push({path, value: xin[path], observed: 'parent'})
  })
  observe('grandparent.parent.child', path => {
    changes.push({path, value: xin[path], observed: 'parent.child'})
  })
  xin.grandparent.parent = {child: 20}
  await updates()
  expect(changes.length).toBe(2)
  xin.grandparent.parent.child = 20
  await updates()
  expect(changes.length).toBe(2)
  xin.grandparent.parent.child = 17
  await updates()
  expect(changes.length).toBe(4)
  xin.grandparent.parent = {child: 11}
  await updates()
  expect(changes.length).toBe(6)
  xin.grandparent.name = 'Drop Tables'
  await updates()
  expect(changes.length).toBe(6)
})