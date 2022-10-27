import { xin, touch, observe, observerShouldBeRemoved } from './xin'
import { getListBinding } from './list-binding'
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
  },

  list: {
    toDOM(element: HTMLElement, value: any[], options?: XinObject) {
      console.log({options})
      const {bindInstance} = options || {}
      const listBinding = getListBinding(element, bindInstance)
      // @ts-expect-error
      listBinding.update(value._xinValue || value)
    }
  }
}

export const bind = (element: HTMLElement, what: XinTouchableType, binding: XinBinding, options?: XinObject) => {
  const {toDOM, fromDOM} = binding
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