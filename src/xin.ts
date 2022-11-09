import { XinObject, PathTestFunction, ObserverCallbackFunction } from './xin-types'
import { settings } from './settings'
import { Listener, touch, observe as _observe, unobserve, updates, observerShouldBeRemoved } from './path-listener'
import { getByPath, setByPath } from './by-path'

// list of Array functions that change the array
const ARRAY_MUTATIONS = ['sort', 'splice', 'copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'unshift']

const registry: XinObject = {}
const debugPaths = true
const validPath = /^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/

const isValidPath = (path: string): boolean => validPath.test(path)

const extendPath = (path = '', prop = ''): string => {
  if (path === '') {
    return prop
  } else {
    if (prop.match(/^\d+$/) !== null || prop.includes('=')) {
      return `${path}[${prop}]`
    } else {
      return `${path}.${prop}`
    }
  }
}

interface ProxyHandler {
  get: (target: XinObject, prop: string) => any
  set: (target: XinObject, prop: string, newValue: any) => boolean
}

const regHandler = (path = ''): ProxyHandler => ({
  // TODO figure out how to correctly return array[Symbol.iterator] so that for(const foo of xin.foos) works
  // as you'd expect
  get (target: XinObject, _prop: string | symbol): any {
    if (typeof _prop === 'symbol') {
      // @ts-expect-error
      return target[_prop]
    }
    let prop = _prop
    const compoundProp = prop.match(/^([^.[]+)\.(.+)$/) ?? // basePath.subPath (omit '.')
                        prop.match(/^([^\]]+)(\[.+)/) ?? // basePath[subPath
                        prop.match(/^(\[[^\]]+\])\.(.+)$/) ?? // [basePath].subPath (omit '.')
                        prop.match(/^(\[[^\]]+\])\[(.+)$/) // [basePath][subPath
    if (compoundProp !== null) {
      const [, basePath, subPath] = compoundProp
      const currentPath = extendPath(path, basePath)
      const value = getByPath(target, basePath)
      return value !== null && typeof value === 'object' ? new Proxy(value, regHandler(currentPath))[subPath] : value
    }
    if (prop === '_xinPath') {
      return path
    }
    if (prop === '_xinValue') {
      return target
    }
    if (prop.startsWith('[') && prop.endsWith(']')) {
      prop = prop.substring(1, prop.length - 1)
    }
    if (
      (!Array.isArray(target) && target[prop] !== undefined) ||
      (Array.isArray(target) && prop.includes('='))
    ) {
      let value
      if (prop.includes('=')) {
        const [idPath, needle] = prop.split('=')
        value = (target as any[]).find(
          // eslint-disable-next-line
          (candidate: Object) => `${getByPath(candidate, idPath)}` === needle
        )
      } else {
        value = (target)[prop]
      }
      if (value !== null && typeof value === 'object') {
        const currentPath = extendPath(path, prop)
        const proxy: Object = new Proxy(value, regHandler(currentPath))
        return proxy
      } else if (typeof value === 'function') {
        return value.bind(target)
      } else {
        return value
      }
    } else if (Array.isArray(target)) {
      // @ts-expect-error -- we could be looking for an index, a property, or a method
      const value = target[prop]
      return typeof value === 'function'
        ? (...items: any[]) => {
            // @ts-expect-error
            const result = (Array.prototype[prop]).apply(target, items)
            if (ARRAY_MUTATIONS.includes(prop)) {
              touch(path)
            }
            return result
          }
        : typeof value === 'object'
          ? new Proxy(value, regHandler(extendPath(path, prop)))
          : value
    } else {
      return target[prop]
    }
  },
  set (target: Object, prop: string, value: any) {
    // eslint-disable-next-line
    if (value?._xinPath) {
      value = value._xinValue
    }
    const fullPath = extendPath(path, prop)
    if (debugPaths && !isValidPath(fullPath)) {
      throw new Error(`setting invalid path ${fullPath}`)
    }
    let existing = xin[fullPath]
    if (existing?._xinValue != null) {
      existing = existing._xinValue
    }
    if (existing !== value && setByPath(registry, fullPath, value)) {
      touch(fullPath)
    }
    return true
  }
})

const observe = (test: string | RegExp | PathTestFunction, callback: string | ObserverCallbackFunction): Listener => {
  const func = typeof callback === 'function' ? callback : xin[callback]

  if (typeof func !== 'function') {
    throw new Error(`observe expects a function or path to a function, ${callback as string} is neither`)
  }

  return _observe(test, func)
}

const xin = new Proxy(registry, regHandler())

export {
  xin,
  updates,
  touch,
  observe,
  unobserve,
  observerShouldBeRemoved,
  isValidPath,
  settings
}
