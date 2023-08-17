import { cloneWithBindings } from './metadata'
import { ContentType, ValueElement } from './xin-types'

export const dispatch = (target: Element, type: string): void => {
  const event = new Event(type)
  target.dispatchEvent(event)
}

const valueType = (element: HTMLElement): string => {
  if (element instanceof HTMLInputElement) {
    return element.type
  } else if (
    element instanceof HTMLSelectElement &&
    element.hasAttribute('multiple')
  ) {
    return 'multi-select'
  } else {
    return 'other'
  }
}

export const setValue = (element: HTMLElement, newValue: any): void => {
  switch (valueType(element)) {
    case 'radio':
      ;(element as HTMLInputElement).checked =
        (element as HTMLInputElement).value === newValue
      break
    case 'checkbox':
      ;(element as HTMLInputElement).checked = !!newValue
      break
    case 'date':
      ;(element as HTMLInputElement).valueAsDate = new Date(newValue)
      break
    case 'multi-select':
      for (const option of [
        ...(element as HTMLSelectElement).querySelectorAll('option'),
      ] as HTMLOptionElement[]) {
        option.selected = newValue[option.value]
      }
      break
    default:
      ;(element as HTMLInputElement).value = newValue
  }
}

interface PickMap {
  [key: string]: boolean
}
export const getValue = (element: ValueElement): any => {
  switch (valueType(element)) {
    case 'radio': {
      const radio = element.parentElement?.querySelector(
        `[name="${element.name}"]:checked`
      ) as HTMLInputElement
      return radio != null ? radio.value : null
    }
    case 'checkbox':
      return (element as HTMLInputElement).checked
    case 'date':
      return (element as HTMLInputElement).valueAsDate?.toISOString()
    case 'multi-select':
      return [...element.querySelectorAll('option')].reduce(
        (map: PickMap, option: HTMLOptionElement): PickMap => {
          map[option.value] = option.selected
          return map
        },
        {}
      )
    default:
      return element.value
  }
}

const { ResizeObserver } = globalThis
export const resizeObserver =
  ResizeObserver != null
    ? new ResizeObserver((entries) => {
        for (const entry of entries) {
          const element = entry.target
          dispatch(element, 'resize')
        }
      })
    : {
        observe() {},
        unobserve() {},
      }

export const appendContentToElement = (
  elt: Element | ShadowRoot | null | undefined,
  content: ContentType | null | undefined,
  cloneElements = true
): void => {
  if (elt != null && content != null) {
    if (typeof content === 'string') {
      elt.textContent = content
    } else if (Array.isArray(content)) {
      content.forEach((node) => {
        elt.append(
          node instanceof Node && cloneElements ? cloneWithBindings(node) : node
        )
      })
    } else if (
      content instanceof HTMLElement ||
      content instanceof DocumentFragment
    ) {
      elt.append(cloneElements ? cloneWithBindings(content) : content)
    } else {
      throw new Error('expect text content or document node')
    }
  }
}
