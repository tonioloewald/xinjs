import { XinObject, XinBinding } from './xin-types'
import { getListBinding } from './list-binding'

export const bindings: { [key: string | symbol]: XinBinding } = {
  value: {
    toDOM (element: HTMLElement, value: any) {
      // @ts-expect-error
      if (element.value !== undefined) {
        // @ts-expect-error
        element.value = value
      } else {
        throw new Error(`cannot set value of <${element.tagName}>`)
      }
    },

    fromDOM (element: HTMLElement) {
      // @ts-expect-error
      return element.value
    }
  },

  text: {
    toDOM (element: HTMLElement, value: any) {
      element.textContent = value
    }
  },

  style: {
    toDOM (element: HTMLElement, value: any) {
      if (typeof value === 'object') {
        for (const prop of Object.keys(value)) {
          // @ts-expect-error
          element.style[prop] = value[prop]
        }
      } else if (typeof value === 'string') {
        element.setAttribute('style', value)
      } else {
        throw new Error('style binding expects either a string or object')
      }
    }
  },

  list: {
    toDOM (element: HTMLElement, value: any[], options?: XinObject) {
      const listBinding = getListBinding(element, options)
      listBinding.update(value)
    }
  }
}
