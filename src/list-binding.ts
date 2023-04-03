import { settings } from './settings'
import { resizeObserver } from './dom'
import { throttle } from './throttle'
import { xin, xinValue, xinPath } from './xin'
import { cloneWithBindings, elementToItem, elementToBindings, BOUND_SELECTOR, DataBinding } from './metadata'
import { XinObject } from './xin-types'

const listBindingRef = Symbol('list-binding')
const SLICE_INTERVAL_MS = 16 // 60fps

declare global {
  interface HTMLElement {
    [listBindingRef]?: ListBinding
  }
}

interface ListBindingOptions {
  idPath?: string
  initInstance?: (element: HTMLElement, value: any) => void
  updateInstance?: (element: HTMLElement, value: any) => void
  virtual?: { height: number, width?: number }
}

interface VirtualListSlice {
  firstItem: number
  lastItem: number
  topBuffer: number
  bottomBuffer: number
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
  listContainer: HTMLElement
  template: HTMLElement
  options: ListBindingOptions
  itemToElement: WeakMap<XinObject, HTMLElement>
  private _array: any[] = []
  private readonly _update?: VoidFunction
  private _previousSlice?: VirtualListSlice

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
      this.template = cloneWithBindings(template.content.children[0]) as HTMLElement
    } else {
      this.template = boundElement.children[0] as HTMLElement
      this.template.remove()
    }
    this.listContainer = document.createElement('div')
    this.boundElement.append(this.listContainer)
    this.options = options
    if (options.virtual != null) {
      resizeObserver.observe(this.boundElement)
      this._update = throttle(() => {
        this.update(this._array, true)
      }, SLICE_INTERVAL_MS)
      this.boundElement.addEventListener('scroll', this._update)
      this.boundElement.addEventListener('resize', this._update)
    }
  }

  private visibleSlice (): VirtualListSlice {
    const { virtual } = this.options
    let firstItem = 0
    let lastItem = this._array.length - 1
    let topBuffer = 0
    let bottomBuffer = 0

    if (virtual != null) {
      const width = this.boundElement.offsetWidth
      const height = this.boundElement.offsetHeight

      const visibleColumns = virtual.width != null ? Math.max(1, Math.floor(width / virtual.width)) : 1
      const visibleRows = Math.ceil(height / virtual.height) + 1
      const totalRows = Math.ceil(this._array.length / visibleColumns)
      const visibleItems = visibleColumns * visibleRows
      let topRow = Math.floor(this.boundElement.scrollTop / virtual.height)
      if (topRow > totalRows - visibleRows + 1) {
        topRow = Math.max(0, totalRows - visibleRows + 1)
      }
      firstItem = topRow * visibleColumns
      lastItem = firstItem + visibleItems - 1

      topBuffer = topRow * virtual.height
      bottomBuffer = totalRows * virtual.height - height - topBuffer
    }

    return {
      firstItem,
      lastItem,
      topBuffer,
      bottomBuffer
    }
}

  update (array?: any[], isSlice?: boolean): void {
    if (array == null) {
      array = []
    }
    this._array = array

    const { initInstance, updateInstance } = this.options
    // @ts-expect-error
    const arrayPath: string = array[xinPath]

    const slice = this.visibleSlice()
    const previousSlice = this._previousSlice
    const { firstItem, lastItem, topBuffer, bottomBuffer } = slice
    if (isSlice === true && previousSlice != null && firstItem === previousSlice.firstItem && lastItem === previousSlice.lastItem) {
      return
    }
    this._previousSlice = slice

    let removed = 0
    let moved = 0
    let created = 0

    for (const element of [...this.listContainer.children]) {
      const proxy = elementToItem.get(element as HTMLElement)
      if (proxy == null) {
        element.remove()
      } else {
        const idx = array.indexOf(proxy)
        if (idx < firstItem || idx > lastItem) {
          element.remove()
          this.itemToElement.delete(proxy)
          elementToItem.delete(element as HTMLElement)
          removed++
        }
      }
    }

    this.listContainer.style.marginTop = String(topBuffer) + 'px'
    this.listContainer.style.marginBottom = String(bottomBuffer) + 'px'

    // build a complete new set of elements in the right order
    const elements: HTMLElement[] = []
    const { idPath } = this.options
    for (let i = firstItem; i <= lastItem; i++) {
      const item = array[i]
      if (item === undefined) {
        continue
      }
      let element = this.itemToElement.get(item[xinValue])
      if (element == null) {
        created++
        element = cloneWithBindings(this.template) as HTMLElement
        if (typeof item === 'object') {
          this.itemToElement.set(item[xinValue], element)
          elementToItem.set(element, item[xinValue])
        }
        this.listContainer.append(element)
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
          this.listContainer.insertBefore(element, insertionPoint.nextElementSibling)
        } else {
          this.listContainer.append(element)
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
  let listBinding = boundElement[listBindingRef]
  if (listBinding == null) {
    listBinding = new ListBinding(boundElement, options)
    boundElement[listBindingRef] = listBinding
  }
  return listBinding
}
