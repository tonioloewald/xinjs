import {
  XinProxyObject,
  XinProxyTarget,
  XinObject,
  XinProxy,
  XinArray,
  XinValue,
  PathTestFunction,
  ObserverCallbackFunction,
} from './xin-types'
import { settings } from './settings'
import {
  Listener,
  touch,
  observe as _observe,
  unobserve,
  updates,
  observerShouldBeRemoved,
} from './path-listener'
import { getByPath, setByPath } from './by-path'
import { xinValue, xinPath, XIN_VALUE, XIN_PATH } from './metadata'

interface ProxyConstructor {
  revocable: <T extends object, P extends object>(
    target: T,
    handler: ProxyHandler<P>
  ) => { proxy: P; revoke: () => void }
  new <T extends object>(target: T, handler: ProxyHandler<T>): T
  new <T extends object, P extends object>(
    target: T,
    handler: ProxyHandler<P>
  ): P
}
declare let Proxy: ProxyConstructor

// list of Array functions that change the array
const ARRAY_MUTATIONS = [
  'sort',
  'splice',
  'copyWithin',
  'fill',
  'pop',
  'push',
  'reverse',
  'shift',
  'unshift',
]

const registry: XinObject = {}
const debugPaths = true
const validPath =
  /^\.?([^.[\](),])+(\.[^.[\](),]+|\[\d+\]|\[[^=[\](),]*=[^[\]()]+\])*$/

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

const boxes: { [key: string]: (x: any) => any } = {
  string(s: string) {
    return new String(s)
  },
  boolean(b: boolean) {
    return new Boolean(b)
  },
  bigint(b: bigint) {
    return b
  },
  symbol(s: symbol) {
    return s
  },
  number(n: number) {
    return new Number(n)
  },
}

function box<T>(x: T, path: string): T {
  const t = typeof x
  if (x === undefined || t === 'object' || t === 'function') {
    return x
  } else {
    return new Proxy<XinProxyTarget, XinObject>(
      boxes[t](x),
      regHandler(path, true)
    ) as T
  }
}

const regHandler = (
  path: string,
  boxScalars: boolean
): ProxyHandler<XinObject> => ({
  // TODO figure out how to correctly return array[Symbol.iterator] so that for(const foo of xin.foos) works
  // as you'd expect
  get(target: XinObject | XinArray, _prop: string | symbol): XinValue {
    switch (_prop) {
      case XIN_PATH:
      case 'xinPath':
        return path
      case XIN_VALUE:
        return xinValue(target)
      case 'valueOf': {
        const value = xinValue(target)
        return typeof value.valueOf === 'function'
          ? () => value.valueOf()
          : () => value
      }
    }
    if (typeof _prop === 'symbol') {
      return (target as XinObject)[_prop]
    }
    let prop = _prop
    const compoundProp =
      prop.match(/^([^.[]+)\.(.+)$/) ?? // basePath.subPath (omit '.')
      prop.match(/^([^\]]+)(\[.+)/) ?? // basePath[subPath
      prop.match(/^(\[[^\]]+\])\.(.+)$/) ?? // [basePath].subPath (omit '.')
      prop.match(/^(\[[^\]]+\])\[(.+)$/) // [basePath][subPath
    if (compoundProp !== null) {
      const [, basePath, subPath] = compoundProp
      const currentPath = extendPath(path, basePath)
      const value = getByPath(target, basePath)
      return value !== null && typeof value === 'object'
        ? new Proxy<XinObject, XinProxyObject>(
            value,
            regHandler(currentPath, boxScalars)
          )[subPath]
        : value
    }
    if (prop.startsWith('[') && prop.endsWith(']')) {
      prop = prop.substring(1, prop.length - 1)
    }
    if (
      (!Array.isArray(target) && target[prop] !== undefined) ||
      (Array.isArray(target) && prop.includes('='))
    ) {
      let value: XinValue
      if (prop.includes('=')) {
        const [idPath, needle] = prop.split('=')
        value = (target as XinObject[]).find(
          (candidate: XinObject) =>
            `${getByPath(candidate, idPath) as string}` === needle
        )
      } else {
        value = (target as XinArray)[prop as unknown as number]
      }
      if (value !== null && typeof value === 'object') {
        const currentPath = extendPath(path, prop)
        return new Proxy<XinObject, XinProxyObject>(
          value,
          regHandler(currentPath, boxScalars)
        ) as XinValue
      } else if (typeof value === 'function') {
        return value.bind(target)
      } else {
        return boxScalars ? box(value, extendPath(path, prop)) : value
      }
    } else if (Array.isArray(target)) {
      const value = target[prop as unknown as number]
      return typeof value === 'function'
        ? (...items: any[]) => {
            // @ts-expect-error seriously?
            const result = Array.prototype[prop].apply(target, items)
            if (ARRAY_MUTATIONS.includes(prop)) {
              touch(path)
            }
            return result
          }
        : typeof value === 'object'
        ? new Proxy<XinProxyTarget, XinObject>(
            value,
            regHandler(extendPath(path, prop), boxScalars)
          )
        : boxScalars
        ? box(value, extendPath(path, prop))
        : value
    } else {
      return boxScalars
        ? box(target[prop], extendPath(path, prop))
        : target[prop]
    }
  },
  set(_, prop: string, value: any) {
    value = xinValue(value)
    const fullPath = extendPath(path, prop)
    if (debugPaths && !isValidPath(fullPath)) {
      throw new Error(`setting invalid path ${fullPath}`)
    }
    const existing = xinValue(xin[fullPath])
    if (existing !== value && setByPath(registry, fullPath, value)) {
      touch(fullPath)
    }
    return true
  },
})

const observe = (
  test: string | RegExp | PathTestFunction,
  callback: string | ObserverCallbackFunction
): Listener => {
  const func = typeof callback === 'function' ? callback : xin[callback]

  if (typeof func !== 'function') {
    throw new Error(
      `observe expects a function or path to a function, ${
        callback as string
      } is neither`
    )
  }

  return _observe(test, func as ObserverCallbackFunction)
}

const xin = new Proxy<XinObject, XinProxyObject>(
  registry,
  regHandler('', false)
)

const boxed = new Proxy<XinObject, XinProxyObject>(
  registry,
  regHandler('', true)
) as XinProxy<object>

export {
  xin,
  boxed,
  updates,
  touch,
  observe,
  unobserve,
  observerShouldBeRemoved,
  isValidPath,
  settings,
}
