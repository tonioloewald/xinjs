import { XinProxy, BoxedProxy } from './xin-types'
import { xin, boxed } from './xin'

export function boxedProxy<T extends object>(obj: T): BoxedProxy<T> {
  Object.assign(boxed, obj)
  return boxed as BoxedProxy<T>
}

let deprecationMessage = false
export function xinProxy<T extends object>(obj: T, boxed = false): XinProxy<T> {
  if (boxed) {
    if (!deprecationMessage) {
      console.warn(
        `xinProxy(..., true) is deprecated; use boxedProxy(...) instead`
      )
      deprecationMessage = true
    }
    // @ts-expect-error deprecated
    return boxedProxy(obj)
  }
  Object.keys(obj).forEach((key: string) => {
    xin[key] = (obj as { [key: string]: any })[key]
  })
  return xin as XinProxy<T>
}
