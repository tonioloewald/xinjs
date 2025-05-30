import { XinObject, XinBinding, ValueElement } from './xin-types'
import { getListBinding } from './list-binding'
import { getValue, setValue } from './dom'

export const bindings: { [key: string | symbol]: XinBinding<Element> } = {
  value: {
    toDOM: setValue,

    fromDOM(element: Element) {
      return getValue(element as ValueElement)
    },
  },

  set: {
    toDOM: setValue,
  },

  text: {
    toDOM(element: Element, value: any) {
      element.textContent = value
    },
  },

  enabled: {
    toDOM(element: Element, value: any) {
      ;(element as HTMLInputElement).disabled = !value
    },
  },

  disabled: {
    toDOM(element: Element, value: any) {
      ;(element as HTMLButtonElement).disabled = Boolean(value)
    },
  },

  style: {
    toDOM(element: Element, value: any) {},
  },

  callback: {
    toDOM(element: Element, value: any, options?: XinObject) {
      if (options?.callback) {
        options.callback(element, value)
      } else if (value instanceof Function) {
        value(element)
      }
    },
  },

  list: {
    toDOM(element: Element, value: any[], options?: XinObject) {
      const listBinding = getListBinding(element, options)
      listBinding.update(value)
    },
  },
}
