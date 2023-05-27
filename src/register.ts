import { XinProxy, XinProxyObject } from './xin-types'
import { xin } from './xin'

export function register<T extends {}> (obj: T): XinProxy & T {
  const registered: { [key: string]: any } = {}
  Object.keys(obj).forEach((key: string) => {
    // @ts-expect-error-error
    xin[key] = obj[key]
    registered[key] = xin[key] as XinProxyObject
  })
  return registered as XinProxy & T
}
