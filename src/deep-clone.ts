import { XinObject } from './xin-types'

type Scalar = string | boolean | number | Function
type Cloneable = Scalar | XinObject

export function deepClone (obj: XinObject | Scalar): Cloneable | Cloneable[] {
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
