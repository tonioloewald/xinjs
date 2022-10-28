import { xin, touch, observe, observerShouldBeRemoved } from './xin'
import { XinObject, XinTouchableType } from './xin-types'
import { XinBinding, bindings } from './bindings'


export const bind = (element: HTMLElement, what: XinTouchableType, binding: XinBinding, options?: XinObject) => {
  const {toDOM, fromDOM} = binding
  if (!what || (typeof what === 'object' && !what._xinPath)) {
    throw new Error('bind requires a path or object with xin Proxy')
  }
  const path = typeof what === 'string' ? what : what._xinPath
  if (toDOM) {
    toDOM(element, xin[path], options)

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
    element.addEventListener('input', () => {
      xin[path] = fromDOM(element)
    })
  }
}