import { cloneWithBindings } from './metadata'
import { ContentType } from './xin-types'

export const dispatch = (target: Element, type: string): void => {
  const event = new Event(type)
  target.dispatchEvent(event)
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

export const appendContentToElement = (elt: Element | ShadowRoot | null | undefined, content: ContentType | null | undefined): void => {
  if (elt != null && content != null) {
    if (typeof content === 'string') {
      elt.textContent = content
    } else if (Array.isArray(content)) {
      content.forEach(node => {
        elt.append(node instanceof Node ? cloneWithBindings(node) : node)
      })
    } else if (content instanceof HTMLElement) {
      elt.append(cloneWithBindings(content))
    } else {
      throw new Error('expect text content or document node')
    }
  }
}
