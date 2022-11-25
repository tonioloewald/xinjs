import { XinBinding, XinObject } from './xin-types'
import { deepClone } from './deep-clone'

export const BOUND_CLASS = '-xin-data'
export const BOUND_SELECTOR = `.${BOUND_CLASS}`
export const EVENT_CLASS = '-xin-event'
export const EVENT_SELECTOR = `.${EVENT_CLASS}`

export interface DataBinding {
  path: string
  binding: XinBinding
  options?: XinObject
}

export type XinEventHandler = ((event: Event) => void) | string

export type DataBindings = DataBinding[]

export interface XinEventBindings {
  [eventType: string]: XinEventHandler[]
}

export const elementToHandlers: WeakMap<Element, XinEventBindings> = new WeakMap()
export const elementToBindings: WeakMap<Element, DataBindings> = new WeakMap()

interface ElementMetadata {
  eventBindings?: XinEventBindings
  dataBindings?: DataBindings
}

export const getElementBindings = (element: Element): ElementMetadata => {
  return {
    eventBindings: elementToHandlers.get(element),
    dataBindings: elementToBindings.get(element)
  }
}

export const cloneWithBindings = (element: Node): Node => {
  const cloned = element.cloneNode()
  if (cloned instanceof HTMLElement) {
    const dataBindings = elementToBindings.get(element as HTMLElement)
    const eventHandlers = elementToHandlers.get(element as HTMLElement)
    if (dataBindings != null) {
      // @ts-expect-error-error
      elementToBindings.set(cloned, deepClone(dataBindings))
    }
    if (eventHandlers != null) {
      // @ts-expect-error-error
      elementToHandlers.set(cloned, deepClone(eventHandlers))
    }
  }
  for (const node of element.childNodes) {
    if (node instanceof HTMLElement || node instanceof DocumentFragment) {
      cloned.appendChild(cloneWithBindings(node))
    } else {
      cloned.appendChild(node.cloneNode())
    }
  }
  return cloned
}

export const elementToItem: WeakMap<HTMLElement, XinObject> = new WeakMap()

export const getListItem = (element: HTMLElement): any => {
  const html = document.body.parentElement
  while (element.parentElement != null && element.parentElement !== html) {
    const item = elementToItem.get(element)
    if (item != null) {
      return item
    }
    element = element.parentElement
  }
  return false
}
