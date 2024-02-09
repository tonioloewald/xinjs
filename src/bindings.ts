import { XinObject, XinBinding, ValueElement } from './xin-types'
import { getListBinding } from './list-binding'
import { getValue, setValue } from './dom'

export const bindings: { [key: string | symbol]: XinBinding } = {
  value: {
    toDOM(element: HTMLElement, value: any) {
      setValue(element, value)
    },

    fromDOM(element: HTMLElement) {
      return getValue(element as ValueElement)
    },
  },

  text: {
    toDOM(element: HTMLElement, value: any) {
      element.textContent = value
    },
  },

  enabled: {
    toDOM(element: HTMLElement, value: any) {
      // eslint-disable-next-line
      ;(element as HTMLInputElement).disabled = !value
    },
  },

  disabled: {
    toDOM(element: HTMLElement, value: any) {
      ;(element as HTMLInputElement).disabled = Boolean(value)
    },
  },

  style: {
    toDOM(element: HTMLElement, value: any) {
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
    toDOM(element: HTMLElement, value: any[], options?: XinObject) {
      const listBinding = getListBinding(element, options)
      listBinding.update(value)
    },
  },
}
