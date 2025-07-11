import { test, expect } from 'bun:test'
import { getByPath, setByPath, deleteByPath } from './by-path'
import { XinObject } from './xin-types'

const obj = {
  foo: 17,
  bar: {
    baz: 'lurman',
  },
  movies: ['strictly ballroom', 'romeo+juliet'],
  movieObjs: [
    {
      id: 17,
      name: 'strictly ballroom',
      reviews: {
        rottenTomatoes: 88,
        metaCritic: 72,
      },
    },
    {
      id: 123,
      name: 'romeo+juliet',
      reviews: {
        rottenTomatoes: 73,
        metaCritic: 60,
      },
    },
  ],
} as XinObject

test('getByPath works', () => {
  expect(getByPath(obj, '')).toBe(obj)
  expect(getByPath(obj, 'foo')).toBe(17)
  expect(getByPath(obj, '[=foo]')).toBe(17)
  expect(getByPath(obj, 'bar.baz')).toBe(obj.bar.baz)
  expect(getByPath(obj, 'movies')).toBe(obj.movies)
  expect(getByPath(obj, 'movies[0]')).toBe(obj.movies[0])
  expect(getByPath(obj, 'movieObjs[0]')).toBe(obj.movieObjs[0])
  expect(getByPath(obj, 'movieObjs[id=123]')).toBe(obj.movieObjs[1])
  expect(getByPath(obj, 'movieObjs[reviews.metaCritic=72]')).toBe(
    obj.movieObjs[0]
  )
})

test('setByPath works', () => {
  setByPath(obj, 'foo', -11)
  expect(obj.foo).toBe(-11)
  setByPath(obj, 'bar.baz', 'luhrman')
  expect(obj.bar.baz).toBe('luhrman')
  ;(getByPath(obj, 'movies') as any[]).push('TBD')
  expect(obj.movies.length).toBe(3)
  setByPath(obj, 'movies[2]', 'moulin rouge')
  expect(getByPath(obj, 'movies[2]')).toBe('moulin rouge')
  ;(getByPath(obj, 'movieObjs') as any[]).push({
    id: 666,
    name: 'moulin rouge',
  })
  expect(getByPath(obj, 'movieObjs[2].name')).toBe('moulin rouge')
  expect(getByPath(obj, 'movieObjs[id=666].name')).toBe('moulin rouge')
  setByPath(obj, 'movieObjs[id=666].reviews', {
    metaCritic: 66,
    rottenTomatoes: 75,
  })
  expect(getByPath(obj, 'movieObjs[reviews.metaCritic=66].name')).toBe(
    'moulin rouge'
  )
})

test('setByPath does not change values that do not need changing', () => {
  expect(setByPath(obj, 'foo', 1000)).toBe(true)
  expect(setByPath(obj, 'foo', 1000)).toBe(false)
  expect(setByPath(obj, 'foo', '1000')).toBe(true)
  const newObj = { hello: 'world' }
  expect(setByPath(obj, 'newObj', newObj)).toBe(true)
  newObj.hello = 'out of sight'
  expect(setByPath(obj, 'newObj', newObj)).toBe(false)
})

test('setByPath adds properties to objects if needed', () => {
  setByPath(obj, 'pi', Math.PI)
  expect(obj.pi).toBe(Math.PI)
  setByPath(obj, 'deep.down.there', true)
  expect(obj.deep.down.there).toBe(true)
  setByPath(obj, 'deep.space', ' ')
  expect(obj.deep.space).toBe(' ')
  setByPath(obj, 'deep', {})
  expect(obj.deep.space).toBe(undefined)
})

test('id-path edge cases, including deleteByPath', () => {
  const romeoPlusJuliet = getByPath(obj, 'movieObjs[id=17]')
  expect(romeoPlusJuliet).toBe(obj.movieObjs[0])
  expect(getByPath(obj, 'movieObjs[reviews.rottenTomatoes=73]')).toBe(
    obj.movieObjs[1]
  )
  deleteByPath(obj, 'movieObjs[reviews.metaCritic=72]')
  expect(getByPath(obj, 'movieObjs[id=17]')).toBe(undefined)
  expect(getByPath(obj, 'movieObjs[0].id')).toBe(123)
  try {
    setByPath(obj, 'movieObjects[id=11111]', {})
  } catch (e) {
    expect(!!e).toBe(true)
  }
  setByPath(obj, 'movieObjs[id=777]', {
    id: 777,
    name: 'australia',
  })
  expect(obj.movieObjs.length).toBe(3)
  setByPath(obj, 'movieObjs[id=17]', romeoPlusJuliet)
  expect(obj.movieObjs[3]).toBe(romeoPlusJuliet)
  setByPath(obj, 'movieObjs[id=777].reviews', {
    metaCritic: 53,
  })
  expect(getByPath(obj, 'movieObjs[id=777].reviews.metaCritic')).toBe(53)
  expect(getByPath(obj, 'movieObjs[id=777].name')).toBe('australia')

  setByPath(obj, 'movieObjs[id=777]', {})
  expect(getByPath(obj, 'movieObjs[id=777].name')).toBe(undefined)
})
