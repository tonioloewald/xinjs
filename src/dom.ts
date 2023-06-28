import { cloneWithBindings } from './metadata'
import { ContentType, ValueElement } from './xin-types'

export const dispatch = (target: Element, type: string): void => {
  const event = new Event(type)
  target.dispatchEvent(event)
}

const valueType = (element: HTMLElement): string => {
  if (element instanceof HTMLInputElement) {
    return element.type
  } else if (element instanceof HTMLSelectElement && element.hasAttribute('multiple')) {
    return 'multi-select'
  } else {
    return 'other'
  }
}

export const setValue = (element: HTMLElement, newValue: any): void => {
  switch (valueType(element)) {
    case 'radio':
      // @ts-expect-error
      element.checked = element.value === newValue
      break
    case 'checkbox':
      // @ts-expect-error
      element.checked = newValue
      break
    case 'date':
      // @ts-expect-error
      element.valueAsDate = new Date(newValue)
      break
    case 'multi-select':
      for (const option of [...element.querySelectorAll('option')] as HTMLOptionElement[]) {
        option.selected = newValue[option.value]
      }
      break
    default:
      // @ts-expect-error
      element.value = newValue
  }
}

interface PickMap {
  [key: string]: boolean
}
export const getValue = (element: ValueElement): any => {
  switch (valueType(element)) {
    case 'radio':
    {
      const radio = element.parentElement?.querySelector(`[name="${element.name}"]:checked`) as HTMLInputElement
      return radio != null ? radio.value : null
    }
    case 'checkbox':
      // @ts-expect-error
      return element.checked
    case 'date':
      // @ts-expect-error
      return element.valueAsDate.toISOString()
    case 'multi-select':
      return [...element.querySelectorAll('option')]
        .reduce((map: PickMap, option: HTMLOptionElement): PickMap => {
          map[option.value] = option.selected
          return map
        }, {})
    default:
      return element.value
  }
}

/* global ResizeObserver */
const { ResizeObserver } = globalThis
export const resizeObserver = ResizeObserver != null
  ? new ResizeObserver(entries => {
    for (const entry of entries) {
      const element = entry.target
      dispatch(element, 'resize')
    }
  })
  : {
      observe () {},
      unobserve () {}
    }

function convertToXinSlot (slot: HTMLSlotElement): void {
  const xinSlot = document.createElement('xin-slot')
  if (slot.name !== '') {
    xinSlot.setAttribute('name', slot.name)
  }
  slot.replaceWith(xinSlot)
}

export const appendContentToElement = (elt: Element | ShadowRoot | null | undefined, content: ContentType | null | undefined): boolean => {
  let isSlotted = false
  if (elt != null && content != null) {
    if (typeof content === 'string') {
      elt.textContent = content
    } else if (Array.isArray(content)) {
      content.forEach(node => {
        elt.append(node instanceof Node ? cloneWithBindings(node) : node)
        if (node instanceof Node && (node.querySelector('slot') != null)) {
          isSlotted = true
        }
      })
    } else if (content instanceof HTMLElement || content instanceof DocumentFragment) {
      const slots = [...content.querySelectorAll('slot')]
      if (slots.length > 0) {
        isSlotted = true
        slots.forEach(convertToXinSlot)
      }
      elt.append(cloneWithBindings(content))
    } else {
      throw new Error('expect text content or document node')
    }
  }
  return isSlotted
}
