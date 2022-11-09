import { bind } from './bind'
import { bindings } from './bindings'
import { elements } from './elements'
import { XinObject, ElementCreator } from './xin-types'

interface StyleRule {
  [key: string]: string | number
}

interface StyleMap {
  [key: string]: StyleRule
}

interface FunctionMap {
  [key: string]: Function
}

type EventHandler = (event: Event) => void

interface EventHandlerMap {
  [key: string]: EventHandler
}

interface PropMap {
  [key: string]: any
}

type ContentPart = HTMLElement | DocumentFragment | string
type ContentType = ContentPart | ContentPart[]

interface WebComponentSpec {
  superClass?: typeof HTMLElement
  style?: StyleMap
  methods?: FunctionMap
  render?: () => void
  bindValue?: (path: string) => void
  connectedCallback?: () => void
  disconnectedCallback?: () => void
  eventHandlers?: EventHandlerMap
  props?: PropMap
  attributes?: PropMap
  content?: ContentType | null
  role?: string
  value?: any
}

export const dispatch = (target: Element, type: string): void => {
  const event = new Event(type)
  target.dispatchEvent(event)
}

/* global ResizeObserver */
const resizeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    const element = entry.target
    dispatch(element, 'resize')
  }
})

const appendContentToElement = (elt: Element | ShadowRoot, content: ContentType): void => {
  if (content != null) {
    if (typeof content === 'string') {
      elt.textContent = content
    } else if (Array.isArray(content)) {
      content.forEach(node => {
        // @ts-expect-error-error
        elt.appendChild(node instanceof HTMLElement ? node.cloneNode(true) : node)
      })
    } else if (content instanceof HTMLElement) {
      elt.appendChild(content.cloneNode(true))
    } else {
      throw new Error('expect text content or document node')
    }
  }
}

const hyphenated = (s: string): string => s.replace(/[A-Z]/g, c => '-' + c.toLowerCase())

const css = (obj: StyleMap): string => {
  const selectors = Object.keys(obj).map((selector) => {
    const body = obj[selector]
    const rule = Object.keys(body)
      .map((prop) => `  ${hyphenated(prop)}: ${body[prop]};`)
      .join('\n')
    return `${selector} {\n${rule}\n}`
  })
  return selectors.join('\n\n')
}

const defaultSpec = {
  superClass: HTMLElement,
  methods: {},
  eventHandlers: {},
  props: {},
  attributes: {},
  content: elements.slot()
}

type Scalar = string | boolean | number | Function
function deepClone (obj: XinObject | Scalar): XinObject | Scalar {
  if (typeof obj !== 'object') {
    return obj
  }
  const clone: XinObject = {}
  for (const key in obj) {
    const val = obj[key]
    if (obj != null && typeof obj === 'object') {
      clone[key] = deepClone(val) as XinObject
    } else {
      clone[key] = val
    }
  }
  return clone
}

export const makeWebComponent = (tagName: string, spec: WebComponentSpec): ElementCreator => {
  const {
    superClass,
    style,
    methods,
    eventHandlers,
    props,
    attributes,
    content,
    role,
    value,
    bindValue
  } = Object.assign({}, defaultSpec, spec)
  let styleNode: HTMLStyleElement
  if (style !== undefined) {
    const styleText = css(Object.assign({ ':host([hidden])': { display: 'none !important' } }, style))
    styleNode = elements.style(styleText) as HTMLStyleElement
  }

  const componentClass = class extends superClass {
    _initialized: boolean = false
    _changeQueued: boolean = false
    _renderQueued: boolean = false
    elementRefs: { [key: string]: HTMLElement }
    _value?: any
    bindValue?: (path: string) => void

    constructor () {
      super()
      if (Object.prototype.hasOwnProperty.call(attributes, 'value')) {
        throw new Error('do not define an attribute named "value"; define value directly instead')
      }
      if (Object.prototype.hasOwnProperty.call(attributes, 'value')) {
        throw new Error('do not define a prop named "value"; define value directly instead')
      }
      if (value !== undefined) {
        this._value = deepClone(value)
      }
      if (bindValue !== undefined) {
        this.bindValue = (path: string) => {
          bind(this, path, bindings.value)
          bindValue.call(this, path)
        }
      }

      for (const prop of Object.keys(props)) {
        let propVal = deepClone(props[prop])
        if (typeof propVal !== 'function') {
          Object.defineProperty(this, prop, {
            enumerable: false,
            get () {
              return propVal
            },
            set (x) {
              if (x !== undefined && (x !== propVal || typeof x === 'object')) {
                propVal = x
                this.queueRender(true)
              }
            }
          })
        } else {
          const setter = propVal
          Object.defineProperty(this, prop, {
            enumerable: false,
            get () {
              return setter.call(this)
            },
            set (x) {
              if (setter.length === 1) {
                setter.call(this, x)
              } else {
                throw new Error(`cannot set ${prop}, it is read-only`)
              }
            }
          })
        }
      }
      // eslint-disable-next-line
      const self = this
      this.elementRefs = new Proxy({}, {
        get (target: { [key: string]: HTMLElement }, ref: string) {
          if (target[ref] === undefined) {
            const element = (self.shadowRoot != null) ? self.shadowRoot.querySelector(`[data-ref="${ref}"]`) : self.querySelector(`[data-ref="${ref}"]`)
            if (element == null) throw new Error(`elementRef "${ref}" does not exist!`)
            element.removeAttribute('data-ref')
            target[ref] = element as HTMLElement
          }
          return target[ref]
        },
        set () {
          throw new Error('elementRefs is read-only')
        }
      })
      if (styleNode !== undefined) {
        const shadow = this.attachShadow({ mode: 'open' })
        shadow.appendChild(styleNode.cloneNode(true))
        appendContentToElement(shadow, content)
      } else {
        appendContentToElement(this, content)
      }
      Object.keys(eventHandlers).forEach(eventType => {
        const passive = eventType.startsWith('touch') ? { passive: true } : false
        this.addEventListener(eventType, eventHandlers[eventType].bind(this), passive)
      })
      if (eventHandlers.childListChange !== undefined) {
        // @ts-expect-error
        const observer = new MutationObserver(eventHandlers.childListChange.bind(this))
        observer.observe(this, { childList: true })
      }
      const attributeNames = Object.keys(attributes)
      if (attributeNames.length > 0) {
        const attributeValues = {}
        const observer = new MutationObserver((mutationsList) => {
          let triggerRender = false
          mutationsList.forEach((mutation) => {
            // eslint-disable-next-line
            triggerRender = !!(mutation.attributeName && attributeNames.includes(mutation.attributeName))
          })
          if (triggerRender && this.queueRender !== undefined) this.queueRender(false)
        })
        observer.observe(this, { attributes: true })
        attributeNames.forEach(attributeName => {
          Object.defineProperty(this, attributeName, {
            enumerable: false,
            get () {
              if (typeof attributes[attributeName] === 'boolean') {
                return this.hasAttribute(attributeName)
              } else {
                // eslint-disable-next-line
                if (this.hasAttribute(attributeName)) {
                  return typeof attributes[attributeName] === 'number'
                    ? parseFloat(this.getAttribute(attributeName))
                    : this.getAttribute(attributeName)
                // @ts-expect-error
                } else if (attributeValues[attributeName] !== undefined) {
                // @ts-expect-error
                  return attributeValues[attributeName]
                } else {
                  return attributes[attributeName]
                }
              }
            },
            set (value) {
              if (typeof attributes[attributeName] === 'boolean') {
                if (value !== this[attributeName]) {
                  // eslint-disable-next-line
                  if (value) {
                    this.setAttribute(attributeName, '')
                  } else {
                    this.removeAttribute(attributeName)
                  }
                }
              } else if (typeof attributes[attributeName] === 'number') {
                if (value !== parseFloat(this[attributeName])) {
                  this.setAttribute(attributeName, value)
                }
              } else {
                if (typeof value === 'object' || `${value as string}` !== `${this[attributeName] as string}`) {
                  if (value === null || value === undefined || typeof value === 'object') {
                    this.removeAttribute(attributeName)
                  } else {
                    this.setAttribute(attributeName, value)
                  }
                  // @ts-expect-error
                  attributeValues[attributeName] = value
                }
              }
            }
          })
        })
      }
      this.queueRender()
      this._initialized = true
    }

    get value (): any {
      return this._value
    }

    set value (newValue: any) {
      if (newValue !== undefined && (typeof newValue === 'object' || newValue !== this._value)) {
        this._value = newValue
        this.queueRender(true)
      }
    }

    queueRender (change = false): void {
      if (this.render === undefined) {
        return
      }
      if (!this._changeQueued) this._changeQueued = change
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

    connectedCallback (): void {
      // super annoyingly, chrome loses its shit if you set *any* attributes in the constructor
      if (role !== undefined && role !== '') this.setAttribute('role', role)
      if (eventHandlers.resize !== undefined) {
        resizeObserver.observe(this)
      }
      if (value != null && this.getAttribute('value') != null) {
        this._value = this.getAttribute('value')
      }
      if (spec.connectedCallback != null) spec.connectedCallback.call(this)
    }

    disconnectedCallback (): void {
      resizeObserver.unobserve(this)
      if (spec.disconnectedCallback != null) spec.disconnectedCallback.call(this)
    }

    render (): void {
      if (spec.render != null) spec.render.call(this)
    }

    static defaultAttributes (): XinObject {
      return { ...attributes }
    }
  }

  Object.keys(methods).forEach(methodName => {
    // @ts-expect-error
    componentClass.prototype[methodName] = methods[methodName]
  })

  // if-statement is to prevent some node-based "browser" tests from breaking
  if (window.customElements !== undefined) window.customElements.define(tagName, componentClass)

  return elements[tagName]
}
