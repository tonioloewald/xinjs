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
    toDOM(element: Element, value: any) {
      if (typeof value === 'object') {
        for (const prop of Object.keys(value)) {
          // @ts-expect-error typescript has a strange/incorrect idea of what element.style is
          element.style[prop] = value[prop]
        }
      } else if (typeof value === 'string') {
        element.setAttribute('style', value)
      } else {
        throw new Error('style binding expects either a string or object')
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
