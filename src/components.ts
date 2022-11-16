import { bind } from './bind'
import { bindings } from './bindings'
import { css, StyleMap } from './css'
import { deepClone } from './deep-clone'
import { appendContentToElement, ContentType, dispatch, resizeObserver } from './dom'
import { elements, camelToKabob, kabobToCamel } from './elements'
import { XinObject, ElementCreator } from './xin-types'

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

interface WebComponentSpec {
  superClass?: typeof HTMLElement
  style?: StyleMap
  methods?: FunctionMap
  render?: VoidFunction
  bindValue?: (path: string) => void
  connectedCallback?: VoidFunction
  disconnectedCallback?: VoidFunction
  childListChange?: MutationCallback
  eventHandlers?: EventHandlerMap
  props?: PropMap
  attributes?: PropMap
  content?: ContentType | null
  role?: string
  value?: any
}

const defaultSpec = {
  superClass: HTMLElement,
  methods: {},
  eventHandlers: {},
  props: {},
  attributes: {},
  content: elements.slot()
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
    bindValue,
    childListChange
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
    _hydrated: boolean = false
    // @ts-expect-error-error
    elementRefs: { [key: string]: HTMLElement }
    _value?: any
    bindValue?: (path: string) => void

    initProps (): void {
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
    }

    initRefs (): void {
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
    }

    initEventHandlers (): void {
      Object.keys(eventHandlers).forEach(eventType => {
        const passive = eventType.startsWith('touch') ? { passive: true } : false
        this.addEventListener(eventType, eventHandlers[eventType].bind(this), passive)
      })

      if (childListChange !== undefined) {
        const observer = new MutationObserver(childListChange.bind(this))
        observer.observe(this, { childList: true })
      }
    }

    initAttributes (): void {
      const attributeNames = Object.keys(attributes)
      if (attributeNames.length > 0) {
        const attributeValues = {}
        const observer = new MutationObserver((mutationsList) => {
          let triggerRender = false
          mutationsList.forEach((mutation) => {
            // eslint-disable-next-line
            triggerRender = !!(mutation.attributeName && attributeNames.includes(kabobToCamel(mutation.attributeName)))
          })
          if (triggerRender && this.queueRender !== undefined) this.queueRender(false)
        })
        observer.observe(this, { attributes: true })
        attributeNames.forEach(attributeName => {
          const attributeKabob = camelToKabob(attributeName)
          Object.defineProperty(this, attributeName, {
            enumerable: false,
            get () {
              if (typeof attributes[attributeName] === 'boolean') {
                return this.hasAttribute(attributeKabob)
              } else {
                // eslint-disable-next-line
                if (this.hasAttribute(attributeKabob)) {
                  return typeof attributes[attributeName] === 'number'
                    ? parseFloat(this.getAttribute(attributeKabob))
                    : this.getAttribute(attributeKabob)
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
                    this.setAttribute(attributeKabob, '')
                  } else {
                    this.removeAttribute(attributeKabob)
                  }
                }
              } else if (typeof attributes[attributeName] === 'number') {
                if (value !== parseFloat(this[attributeName])) {
                  this.setAttribute(attributeKabob, value)
                }
              } else {
                if (typeof value === 'object' || `${value as string}` !== `${this[attributeName] as string}`) {
                  if (value === null || value === undefined || typeof value === 'object') {
                    this.removeAttribute(attributeKabob)
                  } else {
                    this.setAttribute(attributeKabob, value)
                  }
                  // @ts-expect-error
                  attributeValues[attributeName] = value
                }
              }
            }
          })
        })
      }
    }

    initValue (): void {
      if (value !== undefined) {
        this._value = deepClone(value)
      }
      if (bindValue !== undefined) {
        this.bindValue = (path: string) => {
          bind(this, path, bindings.value)
          bindValue.call(this, path)
        }
      }
    }

    constructor () {
      super()
      if (Object.prototype.hasOwnProperty.call(attributes, 'value')) {
        throw new Error('do not define an attribute named "value"; define value directly instead')
      }
      if (Object.prototype.hasOwnProperty.call(attributes, 'value')) {
        throw new Error('do not define a prop named "value"; define value directly instead')
      }

      this.initAttributes()

      this.initProps()

      this.initValue()

      this.initEventHandlers()

      this.initRefs()

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

    hydrate (): void {
      if (!this._hydrated) {
        if (styleNode !== undefined) {
          const shadow = this.attachShadow({ mode: 'open' })
          shadow.appendChild(styleNode.cloneNode(true))
          appendContentToElement(shadow, content)
        } else {
          appendContentToElement(this, content)
        }
        this._hydrated = true
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
      this.hydrate()
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
      this.hydrate()
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
