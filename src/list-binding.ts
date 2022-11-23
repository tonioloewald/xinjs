import { settings } from './settings'
import { xin } from './xin'
import { cloneWithBindings, elementToItem, elementToBindings, BOUND_SELECTOR, DataBinding } from './metadata'
import { XinObject } from './xin-types'

const listBindings: WeakMap<HTMLElement, ListBinding> = new WeakMap()

interface ListBindingOptions {
  idPath?: string
  initInstance?: (element: HTMLElement, value: any) => void
  updateInstance?: (element: HTMLElement, value: any) => void
}

function updateRelativeBindings (element: HTMLElement, path: string): void {
  const boundElements = [...element.querySelectorAll(BOUND_SELECTOR)]
  if (element.matches(BOUND_SELECTOR)) {
    boundElements.unshift(element)
  }
  for (const boundElement of boundElements) {
    const bindings = elementToBindings.get(boundElement) as DataBinding[]
    for (const binding of bindings) {
      if (binding.path.startsWith('^')) {
        binding.path = `${path}${binding.path.substring(1)}`
      }
      if (binding.binding.toDOM != null) {
        binding.binding.toDOM(boundElement as HTMLElement, xin[binding.path])
      }
    }
  }
}

class ListBinding {
  boundElement: HTMLElement
  template: HTMLElement
  options: ListBindingOptions
  itemToElement: WeakMap<XinObject, HTMLElement>

  constructor (boundElement: HTMLElement, options: ListBindingOptions = {}) {
    this.boundElement = boundElement
    this.itemToElement = new WeakMap()
    if (boundElement.children.length !== 1) {
      throw new Error('ListBinding expects an element with exactly one child element')
    }
    if (boundElement.children[0] instanceof HTMLTemplateElement) {
      const template = boundElement.children[0]
      if (template.content.children.length !== 1) {
        throw new Error('ListBinding expects a template with exactly one child element')
      }
      template.remove()
      this.template = cloneWithBindings(template.content.children[0]) as HTMLElement
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

    const { initInstance, updateInstance } = this.options
    // @ts-expect-error
    const arrayPath: string = array._xinPath

    let removed = 0
    let moved = 0
    let created = 0

    for (const element of [...this.boundElement.children]) {
      const proxy = elementToItem.get(element as HTMLElement)
      if (proxy == null) {
        element.remove()
      } else if (!array.includes(proxy)) {
        element.remove()
        this.itemToElement.delete(proxy)
        elementToItem.delete(element as HTMLElement)
        removed++
      }
    }

    // build a complete new set of elements in the right order
    const elements = []
    const { idPath } = this.options
    for (let i = 0; i < array.length; i++) {
      const item = array[i]
      if (item === undefined) {
        continue
      }
      let element = this.itemToElement.get(item._xinValue)
      if (element == null) {
        created++
        element = cloneWithBindings(this.template) as HTMLElement
        if (typeof item === 'object') {
          this.itemToElement.set(item._xinValue, element)
          elementToItem.set(element, item._xinValue)
        }
        this.boundElement.append(element)
        if (idPath != null) {
          const idValue = item[idPath] as string
          const itemPath = `${arrayPath}[${idPath}=${idValue}]`
          updateRelativeBindings(element, itemPath)
        }
        if (initInstance != null) {
          // eslint-disable-next-line
          initInstance(element, item)
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
