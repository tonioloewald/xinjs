import { XinObject } from './xin-types'
import { bind } from './bind'
import { bindings } from './bindings'

type elementPart = HTMLElement | XinObject | string | number
type ElementCreator = (...contents: elementPart[]) => HTMLElement | DocumentFragment

const templates: { [key: string]: HTMLElement } = {}

export const create = (tagType: string, ...contents: elementPart[]) => {
  if (!templates[tagType]) {
    templates[tagType] = document.createElement(tagType)
  }
  const elt = templates[tagType].cloneNode() as HTMLElement
  for (const item of contents) {
    if (item instanceof HTMLElement || typeof item === 'string' || typeof item === 'number') {
      if (elt instanceof HTMLTemplateElement) {
        elt.content.append(item as Node)
      } else {
        elt.append(item as Node)
      }
    } else {
      for (const key of Object.keys(item)) {
        const value = item[key]
        if (key === 'apply') {
          value(elt)
        } else if (key === 'style') {
          if (typeof value === 'object') {
            for (const prop of Object.keys(value)) {
              if (prop.startsWith('--')) {
                elt.style.setProperty(prop, value[prop])
              } else {
                // @ts-expect-error
                elt.style[prop] = value[prop]
              }
            }
          } else {
            elt.setAttribute('style', value)
          }
        } else if (key.match(/^on[A-Z]/) != null) {
          const eventType = key.substr(2).toLowerCase()
          elt.addEventListener(eventType, value)
        } else if (key.match(/^bind[A-Z]/) != null) {
          const bindingType = key.substr(4).toLowerCase()
          const binding = bindings[bindingType]
          if (binding) {
            bind(elt, value, binding)
          } else {
            throw new Error(`${key} is not allowed, bindings.${bindingType} is not defined`)
          }
        } else {
          const attr = key.replace(/[A-Z]/g, c => '-' + c.toLowerCase())
          if (typeof value === 'boolean') {
            value ? elt.setAttribute(attr, '') : elt.removeAttribute(attr)
          } else {
            elt.setAttribute(attr, value)
          }
        }
      }
    }
  }
  return elt
}

const fragment: ElementCreator = (...contents: elementPart[]) => {
  const frag = document.createDocumentFragment()
  for (const item of contents) {
    frag.append(item as Node)
  }
  return frag
}

const _elements: { [key: string | symbol]: ElementCreator } = { fragment }

export const elements = new Proxy(_elements, {
  get (target, tagName: string) {
    tagName = tagName.replace(/[A-Z]/g, c => `-${c.toLocaleLowerCase()}`)
    if (tagName.match(/^\w+(-\w+)*$/) == null) {
      throw new Error(`${tagName} does not appear to be a valid element tagName`)
    } else if (!target[tagName]) {
      target[tagName] = (...contents: elementPart[]) => create(tagName, ...contents)
    }
    return target[tagName]
  },
  set () {
    throw new Error('You may not add new properties to elements')
  }
})
