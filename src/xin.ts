import { XinObject, PathTestFunction } from './xin-types'
import { getByPath, setByPath } from './by-path'

export const observerShouldBeRemoved = Symbol('observer should be removed')

// list of Array functions that change the array  
const ARRAY_MUTATIONS = ['sort', 'splice', 'copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'unshift']

type CallbackFunction = (path: string) => void | Symbol
type TypeErrorHandler = (errors: string[], action: string) => void

const registry: XinObject = {}
const listeners: Listener[] = [] // { path_string_or_test, callback }
const debugPaths = true
const validPath = /^\.?([^.[\](),])+(\.[^.[\](),]+|\[\mad+\]|\[[^=[\](),]*=[^[\]()]+\])*$/

const isValidPath = (path: string) => validPath.test(path)

class Listener {
  test: PathTestFunction
  callback: CallbackFunction

  constructor (test: string | RegExp | PathTestFunction, callback: string | CallbackFunction) {
    if (typeof test === 'string') {
      this.test = t => typeof t === 'string' && t.startsWith(test)
    } else if (test instanceof RegExp) {
      this.test = test.test.bind(test)
    } else if (test instanceof Function) {
      this.test = test
    } else {
      throw new Error(
        'expect listener test to be a string, RegExp, or test function'
      )
    }
    if (typeof callback === 'string') {
      this.callback = (...args) => {
        const func = xin[callback]
        if (func) {
          func(...args)
        } else {
          throw new Error(`callback path ${callback} does not exist`)
        }
      }
    } else if (typeof callback === 'function') {
      this.callback = callback
    } else {
      throw new Error('expect callback to be a path or function')
    }
    listeners.push(this)
  }
}

const touch = (path: string) => {
  listeners
    .filter(listener => {
      let heard
      try {
        heard = listener.test(path)
      } catch (e) {
        throw new Error(`listener test (${path}) threw ${e}`)
      }
      if (heard === observerShouldBeRemoved) {
        unobserve(listener)
        return false
      }
      return !!heard
    })
    .forEach(listener => {
      try {
        if (
          listener.callback(path) === observerShouldBeRemoved
        ) {
          unobserve(listener)
        }
      } catch (e) {
        throw new Error(`listener callback threw ${e} handling ${path}`)
      }
    })
}

const observe = (test: string | RegExp | PathTestFunction, callback: string | CallbackFunction) => {
  return new Listener(test, callback)
}

const unobserve = (listener: Listener) => {
  let index
  let found = false

  index = listeners.indexOf(listener)
  if (index > -1) {
    listeners.splice(index, 1)
  } else {
    throw new Error('unobserve failed, listener not found')
  }

  return found
}

const extendPath = (path = '', prop = '') => {
  if (path === '') {
    return prop
  } else {
    if (prop.match(/^\d+$/) || prop.includes('=')) {
      return `${path}[${prop}]`
    } else {
      return `${path}.${prop}`
    }
  }
}

const regHandler = (path = '') => ({
  get (target: XinObject, prop: string): any {
    const compoundProp = prop.match(/^([^.[]+)\.(.+)$/) || // basePath.subPath (omit '.')
                        prop.match(/^([^\]]+)(\[.+)/) || // basePath[subPath
                        prop.match(/^(\[[^\]]+\])\.(.+)$/) || // [basePath].subPath (omit '.')
                        prop.match(/^(\[[^\]]+\])\[(.+)$/) // [basePath][subPath
    if (compoundProp) {
      const [, basePath, subPath] = compoundProp
      const currentPath = extendPath(path, basePath)
      const value = getByPath(target, basePath)
      // @ts-expect-error
      return value && typeof value === 'object' ? new Proxy(value, regHandler(currentPath))[subPath] : value
    }
    if (prop === '_xinPath') {
      return path
    }
    if (prop === '_xinValue') {
      return target
    }
    if (prop.startsWith('[') && prop.endsWith(']')) {
      prop = prop.substr(1, prop.length - 2)
    }
    if (
      Object.prototype.hasOwnProperty.call(target, prop) ||
      (Array.isArray(target) && typeof prop === 'string' && prop.includes('='))
    ) {
      let value
      if (prop.includes('=')) {
        const [idPath, needle] = prop.split('=')
        value = (target as any[]).find(
          (candidate: Object) => `${getByPath(candidate, idPath)}` === needle
        )
      } else {
        value = (target)[prop]
      }
      if (value && typeof value === 'object') {
        const currentPath = extendPath(path, prop)
        const proxy: Object = new Proxy(value, regHandler(currentPath))
        return proxy
      } else if (typeof value === 'function') {
        return value.bind(target)
      } else {
        return value
      } 
    } else if (Array.isArray(target)) {
      // @ts-ignore -- tsc doesn't like the fact we're looking at array functions
      return typeof target[prop] === 'function'
        ? (...items: any[]) => {
          // @ts-ignore
          const result = (Array.prototype[prop]).apply(target, items)
          if(ARRAY_MUTATIONS.includes(prop)) {
            touch(path)
          }
          return result
        }
        : target[Number(prop)]
    } else {
      return target ? target[prop] : undefined
    }
  },
  set (target: Object, prop: string, value: any) {
    if (value && value._xinPath) {
      throw new Error('You cannot put xin proxies into the registry')
    }
    const fullPath = extendPath(path, prop)
    if (debugPaths && !isValidPath(fullPath)) {
      throw new Error(`setting invalid path ${fullPath}`)
    }
    if (setByPath(registry, fullPath, value)){
      touch(fullPath) 
    }
    return true
  }
})

const xin = new Proxy(registry, regHandler()) as XinObject

export {
  touch,
  observe,
  unobserve,
  xin,
  isValidPath
}
