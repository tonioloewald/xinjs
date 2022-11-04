import { xin, touch, observe, observerShouldBeRemoved } from './xin'
import { XinObject, XinTouchableType } from './xin-types'
import { XinBinding, bindings } from './bindings'
import { throttle } from './throttle'

export const bind = (element: HTMLElement, what: XinTouchableType, binding: XinBinding, options?: XinObject) => {
  const {toDOM, fromDOM} = binding
  if (!what || (typeof what === 'object' && !what._xinPath)) {
    throw new Error('bind requires a path or object with xin Proxy')
  }
  const path = typeof what === 'string' ? what : what._xinPath
  if (toDOM) {
    // toDOM(element, xin[path], options)
    touch(path)

    observe(path, () => {
      if(!element.closest('body')) {
        return observerShouldBeRemoved
      }
      const value = xin[path]
      if (typeof value === 'object' || !fromDOM || fromDOM(element) !== value) {
        toDOM(element, value, options)
      }
    })
  }
  if (fromDOM) {
    const updateXin = () => {
      const value = fromDOM(element)
      if (value !== undefined && value !== null) {
        xin[path] = value
      }
    }

    element.addEventListener('input', throttle(updateXin, 500))
    element.addEventListener('change', updateXin)
  }
  return element
}