import { bind } from './bind'
import { bindings } from './bindings'
import { settings } from './settings'

const itemToElement: WeakMap<object, HTMLElement> = new WeakMap()
const elementToItem: WeakMap<HTMLElement, object> = new WeakMap()
const listBindings: WeakMap<HTMLElement, ListBinding> = new WeakMap()

interface ListBindingOptions {
  idPath?: string
  initInstance?: (element: HTMLElement, value: any) => void
  updateInstance?: (element: HTMLElement, value: any) => void
}

class ListBinding {
  boundElement: HTMLElement
  template: HTMLElement
  options: ListBindingOptions

  constructor (boundElement: HTMLElement, options: ListBindingOptions = {}) {
    this.boundElement = boundElement
    if (boundElement.children.length !== 1) {
      throw new Error('ListBinding expects an element with exactly one child element')
    }
    if (boundElement.children[0] instanceof HTMLTemplateElement) {
      const template = boundElement.children[0]
      if (template.content.children.length !== 1) {
        throw new Error('ListBinding expects a template with exactly one child element')
      }
      template.remove()
      this.template = template.content.children[0].cloneNode(true) as HTMLElement
    } else {
      this.template = boundElement.children[0] as HTMLElement
      this.template.remove()
    }
    this.options = options
  }

  update (array?: any[]): void {
    if (array == null) {
      array = []
    }

    const { idPath, initInstance, updateInstance } = this.options
    // @ts-expect-error
    const arrayPath = array._xinPath

    let removed = 0
    let moved = 0
    let created = 0

    for (const element of [...this.boundElement.children]) {
      const item = elementToItem.get(element as HTMLElement)
      if ((item == null) || !array.includes(item)) {
        element.remove()
        itemToElement.delete(item as object)
        elementToItem.delete(element as HTMLElement)
        removed++
      }
    }

    // build a complete new set of elements in the right order
    const elements = []
    for (let i = 0; i < array.length; i++) {
      const item = array[i]
      if (item === undefined) {
        continue
      }
      let element = itemToElement.get(item._xinValue)
      if (element == null) {
        created++
        element = this.template.cloneNode(true) as HTMLElement
        if (typeof item === 'object') {
          itemToElement.set(item._xinValue, element)
          elementToItem.set(element, item._xinValue)
        }
        this.boundElement.append(element)
        if (initInstance != null) {
          // eslint-disable-next-line
          initInstance(element, item)
        }
        // @ts-expect-error
        if (typeof element.bindValue === 'function') {
          if (!idPath) {
            throw new Error('cannot bindValue without an idPath')
          }
          // @ts-expect-error
          element._value = item
          const idValue = item[idPath]
          const path = `${arrayPath}[${idPath}=${idValue}]`
          bind(element, path, bindings.value)
          // @ts-expect-error
          element.bindValue()
        }
      }
      if (updateInstance != null) {
        // eslint-disable-next-line
        updateInstance(element, item)
      }
      elements.push(element)
    }

    // make sure all the elements are in the DOM and in the correct location
    let insertionPoint: HTMLElement | null = null
    for (const element of elements) {
      if (element.previousElementSibling !== insertionPoint) {
        moved++
        if (insertionPoint?.nextElementSibling != null) {
          this.boundElement.insertBefore(element, insertionPoint.nextElementSibling)
        } else {
          this.boundElement.append(element)
        }
      }
      insertionPoint = element
    }

    if (settings.perf) {
      console.log(arrayPath, 'updated', { removed, created, moved })
    }
  }
}

export const getListBinding = (boundElement: HTMLElement, options?: ListBindingOptions): ListBinding => {
  let listBinding = listBindings.get(boundElement)
  if (listBinding == null) {
    listBinding = new ListBinding(boundElement, options)
    listBindings.set(boundElement, listBinding)
  }
  return listBinding
}
