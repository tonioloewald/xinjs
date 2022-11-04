import { settings } from './settings'

const itemToElement: WeakMap<object, HTMLElement> = new WeakMap()
const elementToItem: WeakMap<HTMLElement, object> = new WeakMap()
const listBindings: WeakMap<HTMLElement, ListBinding> = new WeakMap()

interface ListBindingOptions {
  idPath?: string
  initInstance?: (element: HTMLElement, pathOrObj: any) => void
  updateInstance?: (element: HTMLElement, pathOrObj: any) => void
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

  update (array?: any[]) {
    if (array == null) {
      array = []
    }

    const { idPath, initInstance, updateInstance } = this.options

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
    // @ts-expect-error
    const arrayPath = array._xinPath
    for (let i = 0; i < array.length; i++) {
      const item = array[i]
      const path = idPath ? `${arrayPath}[${idPath}=${item[idPath]}]` : false
      if (!item) {
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
        if (initInstance != null) {
          initInstance(element, path || item)
        }
        this.boundElement.append(element)
      }
      if (updateInstance != null) {
        updateInstance(element, path || item)
      }
      elements.push(element)
    }

    // make sure all the elements are in the DOM and in the correct location
    let insertionPoint: HTMLElement | null = null
    for (const element of elements) {
      if (element.previousElementSibling !== insertionPoint) {
        moved++
        if ((insertionPoint != null) && (insertionPoint.nextElementSibling != null)) {
          this.boundElement.insertBefore(element, insertionPoint.nextElementSibling)
        } else {
          this.boundElement.append(element)
        }
      }
      insertionPoint = element
    }

    if (settings.perf) {
      // @ts-expect-error
      console.log(array._xinPath, 'updated', { removed, created, moved })
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
