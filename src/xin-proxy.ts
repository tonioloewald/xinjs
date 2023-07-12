import { XinProxyObject } from './xin-types'
import { xin } from './xin'

export function xinProxy<T extends {}>(obj: T): T {
  const registered: { [key: string]: any } = {}
  Object.keys(obj).forEach((key: string) => {
    // eslint-disable-next-line
    xin[key] = (obj as { [key: string]: any })[key]
    registered[key] = xin[key] as XinProxyObject
  })
  return registered as T
}
