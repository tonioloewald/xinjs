const itemToElement: WeakMap<object, HTMLElement> = new WeakMap()
const elementToItem: WeakMap<HTMLElement, object> = new WeakMap()
const listBindings: WeakMap<HTMLElement, ListBinding> = new WeakMap()

const getListTemplate = (element: HTMLElement) => {
  if (element instanceof HTMLTemplateElement) {
    if (element.content.children.length !== 1) {
      throw new Error ('list template must have exactly one top-level element')
    }
    return element.content.children[0]
  }
  return element
}

class ListBinding {
  boundElement: HTMLElement
  template: HTMLElement
  elements: HTMLElement[]
  bindInstance?: (element: HTMLElement, obj: any) => void

  constructor(boundElement: HTMLElement, bindInstance?: (element: HTMLElement, obj: any) => void) {
    this.boundElement = boundElement
    this.template = getListTemplate(boundElement) as HTMLElement
    this.elements = []
    this.bindInstance = bindInstance
  }

  update(array: any[]) {
    for(const element of this.elements) {
      const item = elementToItem.get(element)
      if (!array.includes(item)) {
        element.remove()
        itemToElement.delete(item as object)
        elementToItem.delete(element)
      }
    }
    this.elements = []
    for(const item of array) {
      if(!item) {
        continue
      }
      let element = itemToElement.get(item)
      if (! element) {
        element = this.template.cloneNode(true) as HTMLElement
        itemToElement.set(item, element as HTMLElement)
        elementToItem.set(element as HTMLElement, item)
      }
      if (this.bindInstance) {
        this.bindInstance(element as HTMLElement, item)
      }
      this.elements.push(element as HTMLElement)
    }
    let insertionPoint = this.boundElement
    const parent = insertionPoint.parentElement
    if (parent) {
      for(const element of this.elements.reverse()) {
        if (insertionPoint.previousElementSibling !== element) {
          parent.insertBefore(element, insertionPoint)
        }
        insertionPoint = element
      }
    }
  }
}

export const getListBinding = (boundElement: HTMLElement, bindInstance?: (element: HTMLElement, obj: any) => void): ListBinding => {
  let listBinding = listBindings.get(boundElement)
  if (!listBinding) {
    listBinding = new ListBinding(boundElement, bindInstance)
    listBindings.set(boundElement, listBinding)
  }
  return listBinding
}