import { xin, touch, observe } from './xin'
import { XinObject, XinTouchableType, XinBinding } from './xin-types'
import { throttle } from './throttle'

export const bind = (element: HTMLElement | DocumentFragment, what: XinTouchableType, binding: XinBinding, options?: XinObject): HTMLElement => {
  if (element instanceof DocumentFragment) {
    throw new Error('bind cannot bind to a DocumentFragment')
  }
  const { toDOM, fromDOM } = binding
  // eslint-disable-next-line
  if (typeof what !== 'string' && what !== null && typeof what === 'object' && !what._xinPath) {
    throw new Error('bind requires a path or object with xin Proxy')
  }
  const path = typeof what === 'string' ? what : what._xinPath
  if (toDOM != null) {
    touch(path)

    observe(path, () => {
      const value = xin[path]
      if (typeof value === 'object' || (fromDOM == null) || fromDOM(element) !== value) {
        toDOM(element, value, options)
      }
    })
  }
  if (fromDOM != null) {
    const updateXin = (): void => {
      const value = fromDOM(element)
      if (value !== undefined && value !== null) {
        const existing = xin[path]._xinValue || xin[path]
        const actual = value._xinValue || value
        if (xin[path] != null && existing !== actual) {
          xin[path] = value
        }
      }
    }

    element.addEventListener('input', throttle(updateXin, 500))
    element.addEventListener('change', updateXin)
  }
  return element
}
