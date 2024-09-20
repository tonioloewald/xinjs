import { css } from './css'
import { XinStyleSheet } from './css-types'
import { deepClone } from './deep-clone'
import { appendContentToElement, dispatch, resizeObserver } from './dom'
import { elements, ElementsProxy } from './elements'
import { camelToKabob, kabobToCamel } from './string-case'
import { ElementCreator, ContentType, PartsMap } from './xin-types'

let anonymousElementCount = 0

function anonElementTag(): string {
  return `custom-elt${(anonymousElementCount++).toString(36)}`
}
let instanceCount = 0

interface ElementCreatorOptions extends ElementDefinitionOptions {
  tag?: string
  styleSpec?: XinStyleSheet
}

const globalStyleSheets: {
  [key: string]: string
} = {}

function setGlobalStyle(tagName: string, styleSpec: XinStyleSheet) {
  const existing = globalStyleSheets[tagName]
  const processed = css(styleSpec).replace(/:host\b/g, tagName)
  globalStyleSheets[tagName] = existing
    ? existing + '\n' + processed
    : processed
}

function insertGlobalStyles(tagName: string) {
  if (globalStyleSheets[tagName]) {
    document.head.append(
      elements.style({ id: tagName + '-component' }, globalStyleSheets[tagName])
    )
  }
  delete globalStyleSheets[tagName]
}

export abstract class Component extends HTMLElement {
  static elements: ElementsProxy = elements
  private static globalStyleSheets: HTMLStyleElement[] = []
  private static _elementCreator?: ElementCreator<Component>
  instanceId: string
  styleNode?: HTMLStyleElement
  static styleSpec?: XinStyleSheet
  static styleNode?: HTMLStyleElement
  content: ContentType | (() => ContentType) | null = elements.slot()
  isSlotted?: boolean
  private static _tagName: null | string = null
  static get tagName(): null | string {
    return this._tagName
  }
  [key: string]: any

  static StyleNode(styleSpec: XinStyleSheet): HTMLStyleElement {
    console.warn(
      'StyleNode is deprecated, just assign static styleSpec: XinStyleSheet to the class directly'
    )
    return elements.style(css(styleSpec))
  }

  static elementCreator(options: ElementCreatorOptions = {}): ElementCreator {
    if (this._elementCreator == null) {
      const { tag, styleSpec } = options
      let tagName = options != null ? tag : null
      if (tagName == null) {
        if (typeof this.name === 'string' && this.name !== '') {
          tagName = camelToKabob(this.name)
          if (tagName.startsWith('-')) {
            tagName = tagName.slice(1)
          }
        } else {
          tagName = anonElementTag()
        }
      }
      if (customElements.get(tagName) != null) {
        console.warn(`${tagName} is already defined`)
      }
      if (tagName.match(/\w+(-\w+)+/) == null) {
        console.warn(`${tagName} is not a legal tag for a custom-element`)
        tagName = anonElementTag()
      }
      while (customElements.get(tagName) !== undefined) {
        tagName = anonElementTag()
      }
      this._tagName = tagName
      window.customElements.define(
        tagName,
        this as unknown as CustomElementConstructor,
        options
      )
      this._elementCreator = elements[tagName]
      if (styleSpec !== undefined) {
        setGlobalStyle(tagName, styleSpec)
      }
    }
    return this._elementCreator
  }

  initAttributes(...attributeNames: string[]): void {
    const attributes: { [key: string]: any } = {}
    const attributeValues: { [key: string]: any } = {}
    const observer = new MutationObserver((mutationsList) => {
      let triggerRender = false
      mutationsList.forEach((mutation) => {
        triggerRender = !!(
          mutation.attributeName &&
          attributeNames.includes(kabobToCamel(mutation.attributeName))
        )
      })
      if (triggerRender && this.queueRender !== undefined)
        this.queueRender(false)
    })
    observer.observe(this, { attributes: true })
    attributeNames.forEach((attributeName) => {
      attributes[attributeName] = deepClone(this[attributeName])
      const attributeKabob = camelToKabob(attributeName)
      Object.defineProperty(this, attributeName, {
        enumerable: false,
        get() {
          if (typeof attributes[attributeName] === 'boolean') {
            return this.hasAttribute(attributeKabob)
          } else {
            if (this.hasAttribute(attributeKabob)) {
              return typeof attributes[attributeName] === 'number'
                ? parseFloat(this.getAttribute(attributeKabob))
                : this.getAttribute(attributeKabob)
            } else if (attributeValues[attributeName] !== undefined) {
              return attributeValues[attributeName]
            } else {
              return attributes[attributeName]
            }
          }
        },
        set(value) {
          if (typeof attributes[attributeName] === 'boolean') {
            if (value !== this[attributeName]) {
              if (value) {
                this.setAttribute(attributeKabob, '')
              } else {
                this.removeAttribute(attributeKabob)
              }
              this.queueRender()
            }
          } else if (typeof attributes[attributeName] === 'number') {
            if (value !== parseFloat(this[attributeName])) {
              this.setAttribute(attributeKabob, value)
              this.queueRender()
            }
          } else {
            if (
              typeof value === 'object' ||
              `${value as string}` !== `${this[attributeName] as string}`
            ) {
              if (
                value === null ||
                value === undefined ||
                typeof value === 'object'
              ) {
                this.removeAttribute(attributeKabob)
              } else {
                this.setAttribute(attributeKabob, value)
              }
              this.queueRender()
              attributeValues[attributeName] = value
            }
          }
        },
      })
    })
  }

  private initValue(): void {
    const valueDescriptor = Object.getOwnPropertyDescriptor(this, 'value')
    if (
      valueDescriptor === undefined ||
      valueDescriptor.get !== undefined ||
      valueDescriptor.set !== undefined
    ) {
      return
    }
    let value = this.hasAttribute('value')
      ? this.getAttribute('value')
      : deepClone(this.value)
    delete this.value
    Object.defineProperty(this, 'value', {
      enumerable: false,
      get() {
        return value
      },
      set(newValue: any) {
        if (value !== newValue) {
          value = newValue
          this.queueRender(true)
        }
      },
    })
  }

  private _parts?: PartsMap
  get parts(): PartsMap {
    const root = this.shadowRoot != null ? this.shadowRoot : this
    if (this._parts == null) {
      this._parts = new Proxy(
        {},
        {
          get(target: PartsMap, ref: string) {
            if (target[ref] === undefined) {
              let element = root.querySelector(`[part="${ref}"]`)
              if (element == null) {
                element = root.querySelector(ref)
              }
              if (element == null)
                throw new Error(`elementRef "${ref}" does not exist!`)
              element.removeAttribute('data-ref')
              target[ref] = element as HTMLElement
            }
            return target[ref]
          },
        }
      )
    }
    return this._parts
  }

  constructor() {
    super()
    instanceCount += 1
    this.initAttributes('hidden')
    this.instanceId = `${this.tagName.toLocaleLowerCase()}-${instanceCount}`
    this._value = deepClone(this.defaultValue)
  }

  connectedCallback(): void {
    insertGlobalStyles((this.constructor as unknown as Component).tagName)
    this.hydrate()
    // super annoyingly, chrome loses its shit if you set *any* attributes in the constructor
    if (this.role != null) this.setAttribute('role', this.role)
    if (this.onResize !== undefined) {
      resizeObserver.observe(this)
      if (this._onResize == null) {
        this._onResize = this.onResize.bind(this)
      }
      this.addEventListener('resize', this._onResize)
    }
    if (this.value != null && this.getAttribute('value') != null) {
      this._value = this.getAttribute('value')
    }
    this.queueRender()
  }

  disconnectedCallback(): void {
    resizeObserver.unobserve(this)
  }

  private _changeQueued = false
  private _renderQueued = false
  queueRender(triggerChangeEvent = false): void {
    if (!this._hydrated) return
    if (!this._changeQueued) this._changeQueued = triggerChangeEvent
    if (!this._renderQueued) {
      this._renderQueued = true
      requestAnimationFrame(() => {
        // TODO add mechanism to allow component developer to have more control over
        // whether input vs. change events are emitted
        if (this._changeQueued) dispatch(this, 'change')
        this._changeQueued = false
        this._renderQueued = false
        this.render()
      })
    }
  }

  private _hydrated = false
  private hydrate(): void {
    if (!this._hydrated) {
      this.initValue()
      const cloneElements = typeof this.content !== 'function'
      const _content: ContentType | null =
        typeof this.content === 'function' ? this.content() : this.content

      const { styleSpec } = this.constructor as unknown as Component
      let { styleNode } = this.constructor as unknown as Component
      if (styleSpec) {
        styleNode = (this.constructor as unknown as Component).styleNode =
          elements.style(css(styleSpec))
        delete (this.constructor as unknown as Component).styleNode
      }
      if (this.styleNode) {
        console.warn(
          this,
          'styleNode is deprecrated, use static styleNode or statc styleSpec instead'
        )
        styleNode = this.styleNode
      }
      if (styleNode) {
        const shadow = this.attachShadow({ mode: 'open' })
        shadow.appendChild(styleNode.cloneNode(true))
        appendContentToElement(shadow, _content, cloneElements)
      } else if (_content !== null) {
        const existingChildren = [...this.childNodes]
        appendContentToElement(this as HTMLElement, _content, cloneElements)
        this.isSlotted = this.querySelector('slot,xin-slot') !== undefined
        const slots = [...this.querySelectorAll('slot')]
        if (slots.length > 0) {
          slots.forEach(XinSlot.replaceSlot)
        }
        if (existingChildren.length > 0) {
          const slotMap: { [key: string]: Element } = { '': this }
          ;[...this.querySelectorAll('xin-slot')].forEach((slot) => {
            slotMap[(slot as XinSlot).name] = slot
          })
          existingChildren.forEach((child) => {
            const defaultSlot = slotMap['']
            const destSlot =
              child instanceof Element ? slotMap[child.slot] : defaultSlot
            ;(destSlot !== undefined ? destSlot : defaultSlot).append(child)
          })
        }
      }
      this._hydrated = true
    }
  }

  render(): void {}
}

class XinSlot extends Component {
  name = ''
  content = null

  static replaceSlot(slot: HTMLSlotElement): void {
    const _slot = document.createElement('xin-slot')
    if (slot.name !== '') {
      _slot.setAttribute('name', slot.name)
    }
    slot.replaceWith(_slot)
  }

  constructor() {
    super()
    this.initAttributes('name')
  }
}

export const xinSlot = XinSlot.elementCreator({ tag: 'xin-slot' })
