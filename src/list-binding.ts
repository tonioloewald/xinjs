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

  update(array?: any[]) {
    if (!array) {
      array = []
    }

    let removed = 0
    let moved = 0
    let created = 0

    // remove elements whose items no longer live in the array
    for(const element of this.elements) {
      const item = elementToItem.get(element)
      // @ts-ignore-error
      if (!item || !array._xinValue.includes(item)) {
        element.remove()
        itemToElement.delete(item as object)
        elementToItem.delete(element)
        removed++
      }
    }

    // build a complete new set of elements in the right order
    this.elements = []
    for(let i = 0; i < array.length; i++) {
      const item = array[i]
      if(!item) {
        continue
      }
      let element = itemToElement.get(item._xinValue)
      if (! element) {
        created++
        element = this.template.cloneNode(true) as HTMLElement
        if (typeof item === 'object') {
          itemToElement.set(item._xinValue, element as HTMLElement)
          elementToItem.set(element as HTMLElement, item._xinValue) 
        }
      }
      if (this.bindInstance) {
        this.bindInstance(element as HTMLElement, item)
      }
      this.elements.push(element as HTMLElement)
    }

    // make sure all the elements are in the DOM and in the correct location
    let insertionPoint = this.boundElement
    const parent = insertionPoint.parentElement
    if (parent) {
      for(const element of this.elements) {
        if (element.previousElementSibling !== insertionPoint) {
          moved++
          if(insertionPoint.nextElementSibling) {
            parent.insertBefore(element, insertionPoint.nextElementSibling)
          } else {
            parent.append(element) 
          }
        }
        insertionPoint = element
      }
    }

    // @ts-expect-error
    console.log(array._xinPath, 'updated', {removed, created, moved})
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