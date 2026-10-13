import { TosiProxy, BoxedProxy } from './xin-types'
import { xin, boxed } from './xin'
import { warnDeprecated } from './metadata'
import { id } from './by-path'

export function tosi<T extends object>(obj: T): BoxedProxy<T> {
  Object.assign(boxed, obj)
  return boxed as BoxedProxy<T>
}

export function boxedProxy<T extends object>(obj: T): BoxedProxy<T> {
  warnDeprecated(
    'boxedProxy',
    'boxedProxy is deprecated, please use tosi() instead'
  )
  return tosi(obj)
}

const tosiUniqueCleanup = new FinalizationRegistry((remove: () => void) => {
  remove()
})

export function tosiUnique<T extends object>(
  obj: T,
  owner?: object
): [BoxedProxy<T>, () => void] {
  const key = id()
  ;(boxed as any)[key] = obj
  const proxy = (boxed as any)[key] as BoxedProxy<T>
  const remove = () => {
    delete (xin as any)[key]
  }
  if (owner) {
    tosiUniqueCleanup.register(owner, remove)
  }
  return [proxy, remove]
}

export function xinProxy<T extends object>(
  obj: T,
  boxed = false
): TosiProxy<T> {
  if (boxed) {
    warnDeprecated(
      'xinProxy-boxed',
      'xinProxy(..., true) is deprecated; use tosi(...) instead'
    )
    // @ts-expect-error deprecated
    return boxedProxy(obj)
  }
  Object.keys(obj).forEach((key: string) => {
    xin[key] = (obj as { [key: string]: any })[key]
  })
  return xin as TosiProxy<T>
}
