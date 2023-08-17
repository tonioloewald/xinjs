import { XinObject, XinArray, AnyFunction } from './xin-types'

type Scalar = string | boolean | number | AnyFunction
type Cloneable = Scalar | XinObject | XinArray

export function deepClone(obj: Cloneable): Cloneable | Cloneable[] {
  if (obj == null || typeof obj !== 'object') {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(deepClone)
  }
  const clone: XinObject = {}
  for (const key in obj) {
    const val = obj[key]
    if (obj != null && typeof obj === 'object') {
      clone[key] = deepClone(val) as XinObject
    } else {
      clone[key] = val
    }
  }
  return clone
}
