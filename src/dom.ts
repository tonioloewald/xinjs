export type ContentPart = HTMLElement | DocumentFragment | string
export type ContentType = ContentPart | ContentPart[]

export const dispatch = (target: Element, type: string): void => {
  const event = new Event(type)
  target.dispatchEvent(event)
}

/* global ResizeObserver */
export const resizeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    const element = entry.target
    dispatch(element, 'resize')
  }
})

export const appendContentToElement = (elt: Element | ShadowRoot, content: ContentType | null): void => {
  if (content != null) {
    if (typeof content === 'string') {
      elt.textContent = content
    } else if (Array.isArray(content)) {
      content.forEach(node => {
        elt.append(node instanceof HTMLElement ? node.cloneNode(true) : node)
      })
    } else if (content instanceof HTMLElement) {
      elt.append(content.cloneNode(true))
    } else {
      throw new Error('expect text content or document node')
    }
  }
}
