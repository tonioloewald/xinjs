import { bind, on } from './bind'
import { bindings } from './bindings'
import { ElementPart, ElementCreator, SwissArmyElement } from '../src/xin-types'
import { camelToKabob } from './string-case'

const templates: { [key: string]: HTMLElement } = {}

export const makeComponent = (...componentParts: ElementPart[]) => {
  return (...args: ElementPart[]) => elements.div(...args, ...componentParts)
}

export const create = (tagType: string, ...contents: ElementPart[]): SwissArmyElement => {
  if (templates[tagType] === undefined) {
    templates[tagType] = globalThis.document.createElement(tagType)
  }
  const elt = templates[tagType].cloneNode() as SwissArmyElement
  for (const item of contents) {
    if (item instanceof Element || item instanceof DocumentFragment || typeof item === 'string' || typeof item === 'number') {
      if (elt instanceof HTMLTemplateElement) {
        elt.content.append(item as Node)
      } else {
        elt.append(item as Node)
      }
    } else {
      for (const key of Object.keys(item)) {
        const value: any = (item)[key]
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
          const eventType = key.substring(2).toLowerCase()
          on(elt, eventType, value)
        } else if (key.match(/^bind[A-Z]/) != null) {
          const bindingType = key.substring(4).toLowerCase()
          const binding = bindings[bindingType]
          if (binding !== undefined) {
            bind(elt, value, binding)
          } else {
            throw new Error(`${key} is not allowed, bindings.${bindingType} is not defined`)
          }
        } else {
          const attr = camelToKabob(key)

          // @ts-expect-error-error
          if (elt[attr] !== undefined) {
            // @ts-expect-error-error
            elt[attr] = value
          } else if (typeof value === 'boolean') {
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

const fragment: ElementCreator<DocumentFragment> = (...contents: ElementPart[]) => {
  const frag = globalThis.document.createDocumentFragment()
  for (const item of contents) {
    frag.append(item as Node)
  }
  return frag
}

const _elements: { [key: string | symbol]: ElementCreator<any> } = { fragment }

export const elements = new Proxy(_elements, {
  get (target, tagName: string) {
    tagName = tagName.replace(/[A-Z]/g, c => `-${c.toLocaleLowerCase()}`)
    if (tagName.match(/^\w+(-\w+)*$/) == null) {
      throw new Error(`${tagName} does not appear to be a valid element tagName`)
    } else if (target[tagName] === undefined) {
      target[tagName] = (...contents: ElementPart[]) => create(tagName, ...contents)
    }
    return target[tagName]
  },
  set () {
    throw new Error('You may not add new properties to elements')
  }
})
