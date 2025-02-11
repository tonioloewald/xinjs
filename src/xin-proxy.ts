import { XinProxy } from './xin-types'
import { xin, boxed } from './xin'

export function boxedProxy<T extends object>(obj: T): XinProxy<T> {
  Object.assign(boxed, obj)
  return boxed as XinProxy<T>
}

let deprecationMessage = false
export function xinProxy<T extends object>(obj: T, boxed = false): T {
  if (boxed) {
    if (!deprecationMessage) {
      console.warn(
        `xinProxy(..., true) is deprecated; use boxedProxy(...) instead`
      )
      deprecationMessage = true
    }
    return boxedProxy(obj) as T
  }
  Object.keys(obj).forEach((key: string) => {
    xin[key] = (obj as { [key: string]: any })[key]
  })
  return xin as T
}
