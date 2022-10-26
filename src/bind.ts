import { xin, touch, observe, observerShouldBeRemoved } from './xin'
import { XinObject, XinTouchableType } from './xin-types'

export type XinBinding = {
  toDOM: (element: HTMLElement, value: any, options?: XinObject) => void,
  fromDOM?: (element: HTMLElement) => any
}

export const bindings: {[key: string | symbol] : XinBinding} = {
  value: {
    toDOM(element: HTMLElement, value: any, options?: XinObject) {
      // @ts-expect-error
      if(element.value !== undefined) {
        // @ts-expect-error
        element.value = value
      } else {
        throw new Error(`cannot set value of <${element.tagName}>`)
      }
    },

    fromDOM(element: HTMLElement) {
      // @ts-expect-error
      return element.value
    }
  },

  text: {
    toDOM(element: HTMLElement, value: any) {
      element.textContent = value
    }
  }
}

export const bind = (element: HTMLElement, what: XinTouchableType, binding: XinBinding, options?: XinObject) => {
  const {toDOM, fromDOM} = binding
  const path = typeof what === 'string' ? what : what._xinPath
  if (toDOM) {
    toDOM(element, xin[path])

    observe(path, () => {
      if(!element.closest('body')) {
        return observerShouldBeRemoved
      }
      const value = xin[path]
      if (typeof value === 'object' || !fromDOM || fromDOM(element) !== value) {
        toDOM(element, value)
      }
    })
  }
  if (fromDOM) {
    element.addEventListener('input', () => {
      xin[path] = fromDOM(element)
    })
  }
}