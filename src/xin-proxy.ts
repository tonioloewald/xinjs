import { XinProxyObject, AnyObject } from './xin-types'
import { xin, boxed } from './xin'

export function xinProxy<T = AnyObject>(
  obj: object,
  boxScalars = false
): T & XinProxyObject {
  const registered: { [key: string]: any } = {}
  Object.keys(obj).forEach((key: string) => {
    xin[key] = (obj as { [key: string]: any })[key]
    registered[key] = boxScalars
      ? (boxed[key] as XinProxyObject)
      : (xin[key] as XinProxyObject)
  })
  return registered as T & XinProxyObject
}
