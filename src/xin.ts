import { getByPath, setByPath, deleteByPath } from './by-path'
import { matchType } from './type-by-example'

export const observerShouldBeRemoved = Symbol('observer should be removed')

type PathTestFunction = (path: string) => boolean | Symbol
type CallbackFunction = (path: string) => void | Symbol
type RegistryObject = {
  [key: string] : any
}
type TypeErrorHandler = (errors: string[], action: string) => void

const registry: RegistryObject = {}
const registeredTypes: RegistryObject = {}
const listeners: Listener[] = [] // { path_string_or_test, callback }
const debugPaths = true
const validPath = /^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/

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
        if (get(callback)) {
          get(callback)(...args)
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

const get = (path: string): any => {
  getByPath(registry, path)
}

const touch = (path: string) => {
  listeners
    .filter(listener => {
      let heard
      try {
        heard = listener.test(path)
      } catch (e) {
        throw new Error(`listener test (${path}) threw exception`)
      }
      if (heard === observerShouldBeRemoved) {
        unobserve(listener)
        return false
      }
      return !!heard
    })
    .forEach(listener => {
      const func = typeof listener.callback === 'function' ? listener.callback : get(listener.callback)
      try {
        if (
          func(path) === observerShouldBeRemoved
        ) {
          unobserve(listener)
        }
      } catch (e) {
        throw new Error(`listener callback (${path}) threw exception`)
      }
    })
}

const _defaultTypeErrorHandler = (errors: string[], action: string) => {
  throw new Error(`registry type check(s) failed after ${action}:\n${errors.join('\n')}`)
}

let typeErrorHandlers: TypeErrorHandler[] = [_defaultTypeErrorHandler]

export const onTypeError = (callback: TypeErrorHandler) => {
  offTypeError(_defaultTypeErrorHandler)
  if (typeErrorHandlers.indexOf(callback) === -1) {
    typeErrorHandlers.push(callback)
    return true
  }
  return false
}

export const offTypeError = (callback: TypeErrorHandler, restoreDefault = false) => {
  const handlerCount = typeErrorHandlers.length
  typeErrorHandlers = typeErrorHandlers.filter(f => f !== callback)
  if (restoreDefault) onTypeError(_defaultTypeErrorHandler)
  return typeErrorHandlers.length !== handlerCount - 1
}

const checkType = (action: string, name: string) => {
  const referenceType = registeredTypes[name]
  if (!referenceType || !registry[name]) return
  const errors = matchType(referenceType, registry[name], [], name)
  if (errors.length) {
    typeErrorHandlers.forEach(f => f(errors, action))
  }
}

const set = (path: string, value: any) => {
  if (value && value._xinPath) {
    throw new Error('You cannot put xin proxies into xin')
  }
  if (debugPaths && !isValidPath(path)) {
    throw new Error(`setting invalid path ${path}`)
  }
  const pathParts = path.split(/\.|\[/)
  const [name] = pathParts
  const model = pathParts[0]
  const existing = getByPath(registry, path)
  // @
  if (pathParts.length > 1 && !registry[model]) {
    throw new Error(`cannot set ${path} to ${value}, ${model} does not exist`)
  } else if (pathParts.length === 1 && typeof value !== 'object') {
    throw new Error(`cannot set ${path}; you can only register objects at root-level`)
  } else if (value === existing) {
    // if it's an array then it might have gained or lost elements
    if (Array.isArray(value) || Array.isArray(existing)) {
      touch(path)
    }
  } else if (value && value.constructor) {
    if (pathParts.length === 1 && !registry[path]) {
      registry[path] = value
    } else {
      // we only overlay vanilla objects, not custom classes or arrays
      if (
        value.constructor === Object &&
        existing &&
        existing.constructor === Object
      ) {
        setByPath(
          registry,
          path,
          Object.assign(value, Object.assign(existing, value))
        )
      } else {
        setByPath(registry, path, value)
      }
      touch(path)
    }
  } else {
    setByPath(registry, path, value)
    touch(path)
  }
  checkType(`set('${path}',...)`, name)
  return value // convenient for push (see below) but maybe an anti-feature?!
}

const types = () =>
  JSON.parse(
    JSON.stringify(registeredTypes)
  )

const registerType = (name: string, example: any) => {
  registeredTypes[name] = example
  checkType(`registerType('${name}')`, name)
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

const remove = (path: string, update = true) => {
  const [, listPath] = path.match(/^(.*)\[[^[]*\]$/) || []
  if (listPath) {
    const list = getByPath(registry, listPath)
    const item = getByPath(registry, path)
    const index = list.indexOf(item)
    if (index !== -1) {
      list.splice(index, 1)
      if (update) touch(listPath)
    }
  } else {
    deleteByPath(registry, path)
    if (update) touch(path)
  }
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
  get (target: RegistryObject, prop: string): any {
    const compoundProp = prop.match(/^([^.[]+)\.(.+)$/) || // basePath.subPath (omit '.')
                        prop.match(/^([^\]]+)(\[.+)/) || // basePath[subPath
                        prop.match(/^(\[[^\]]+\])\.(.+)$/) || // [basePath].subPath (omit '.')
                        prop.match(/^(\[[^\]]+\])\[(.+)$/) // [basePath][subPath
    if (compoundProp) {
      const [, basePath, subPath] = compoundProp
      const currentPath = extendPath(path, basePath)
      const value = getByPath(target, basePath)
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
      if (
        value &&
        typeof value === 'object' &&
        (value.constructor === Object || value.constructor === Array)
      ) {
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
          touch(path)
          return result
        }
        : target[Number(prop)]
    } else {
      return undefined
    }
  },
  set (target: Object, prop: string, value: any) {
    if (value && value._xinPath) {
      throw new Error('You cannot put xin proxies into the registry')
    }
    set(extendPath(path, prop), value)
    return true // success (throws error in strict mode otherwise)
  }
})

const xin = new Proxy(registry, regHandler())

export {
  touch,
  observe,
  unobserve,
  checkType,
  xin,
  registerType,
  types,
  remove,
  isValidPath
}
