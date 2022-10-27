import { xin, touch, observe, observerShouldBeRemoved } from './xin'
import { XinObject, XinTouchableType } from './xin-types'

export type XinBinding = {
  toDOM: (element: HTMLElement, value: any, options?: XinObject) => void,
  fromDOM?: (element: HTMLElement) => any
}

const getListTemplate = (element: HTMLElement) => {
  if (element instanceof HTMLTemplateElement) {
    if (element.content.children.length !== 1) {
      throw new Error ('list template must have exactly one top-level element')
    }
    return element.content.children[0]
  }
  return element
}

const templateInstances = new WeakMap() // template -> WeakMap array elements -> instance
const getInstances = (template: Element) => {
  if(!templateInstances.get(template)) {
    templateInstances.set(template, {elements: [], elementToItem: new WeakMap(), itemToElement: new WeakMap()}) // array element -> instance
  }
  return templateInstances.get(template)
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
      const template = getListTemplate(element)
      const {elements, elementToItem, itemToElement} = getInstances(template)
      const {bindInstance} = options || {}
      // @ts-expect-error
      const {includes} = value._xinValue ? value : value.includes.bind(value)
      for(let i = elements.length - 1; i >= 0; i--) {
        const instance = elements[i]
        const item = elementToItem.get(instance)
        if(!item || !includes(item)) {
          instance.remove()
          elements.splice(i, 1)
        }
      }
      if(Array.isArray(value) && element.parentElement) {
        // @ts-expect-error
        for(const item of (value._xinValue || value)) {
          if (!item) {
            continue
          }

          let instance
          if (typeof item === 'object') {
            instance = itemToElement.get(item)
            if (!instance) {
              instance = template.cloneNode(true)
              itemToElement.set(item, instance)
              elementToItem.set(instance, item)
              elements.push(instance)
            }
          } else {
            instance = template.cloneNode(true)
            elements.push(instance)
          }
          if (bindInstance) {
            bindInstance(instance, item)
          }
          element.parentElement.insertBefore(instance, element)
        }
      }
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