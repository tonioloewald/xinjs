import { css, StyleSheet } from './css'
import { deepClone } from './deep-clone'
import { appendContentToElement, dispatch, resizeObserver } from './dom'
import { elements } from './elements'
import { camelToKabob, kabobToCamel } from './string-case'
import { ElementCreator, SwissArmyElement, ContentType } from './xin-types'

let instanceCount = 0

export abstract class Component extends HTMLElement {
  static elements = elements
  private static _elementCreator?: ElementCreator
  instanceId: string
  styleNode?: HTMLStyleElement
  content: ContentType | (() => ContentType) | null = elements.slot()
  value?: any
  [key: string]: any

  static StyleNode (styleSpec: StyleSheet): HTMLStyleElement {
    return elements.style(css(styleSpec)) as HTMLStyleElement
  }

  static elementCreator (options?: ElementDefinitionOptions & { tag?: string }): ElementCreator {
    if (this._elementCreator == null) {
      let desiredTag = options != null ? options.tag : null
      if (desiredTag == null) {
        desiredTag = camelToKabob(this.name)
        if (desiredTag.startsWith('-')) {
          desiredTag = desiredTag.substring(1)
        }
        if (!desiredTag.includes('-')) {
          desiredTag += '-elt'
        }
      }
      let attempts = 0
      while (this._elementCreator == null) {
        attempts += 1
        const tag = attempts === 1 ? desiredTag : `${desiredTag}-${attempts}`
        try {
          window.customElements.define(tag, this as unknown as CustomElementConstructor, options)
          this._elementCreator = elements[tag]
        } catch (e) {
          throw new Error(`could not define ${this.name} as <${tag}>: ${String(e)}`)
        }
      }
    }
    return this._elementCreator
  }

  initAttributes (...attributeNames: string[]): void {
    const attributes: { [key: string]: any } = {}
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
      attributes[attributeName] = deepClone(this[attributeName])
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
              this.queueRender()
            }
          } else if (typeof attributes[attributeName] === 'number') {
            if (value !== parseFloat(this[attributeName])) {
              this.setAttribute(attributeKabob, value)
              this.queueRender()
            }
          } else {
            if (typeof value === 'object' || `${value as string}` !== `${this[attributeName] as string}`) {
              if (value === null || value === undefined || typeof value === 'object') {
                this.removeAttribute(attributeKabob)
              } else {
                this.setAttribute(attributeKabob, value)
              }
              this.queueRender()
              // @ts-expect-error
              attributeValues[attributeName] = value
            }
          }
        }
      })
    })
  }

  private initValue (): void {
    const valueDescriptor = Object.getOwnPropertyDescriptor(this, 'value')
    if (valueDescriptor === undefined || valueDescriptor.get !== undefined || valueDescriptor.set !== undefined) {
      return
    }
    let value = this.hasAttribute('value') ? this.getAttribute('value') : deepClone(this.value)
    delete this.value
    Object.defineProperty(this, 'value', {
      enumerable: false,
      get () {
        return value
      },
      set (newValue: any) {
        if (value !== newValue) {
          value = newValue
          this.queueRender(true)
        }
      }
    })
  }

  private _refs?: { [key: string]: SwissArmyElement }
  get refs (): { [key: string]: SwissArmyElement } {
    const root = this.shadowRoot != null ? this.shadowRoot : this
    if (this._refs == null) {
      this._refs = new Proxy({}, {
        get (target: { [key: string]: SwissArmyElement }, ref: string) {
          if (target[ref] === undefined) {
            let element = root.querySelector(`[data-ref="${ref}"]`)
            if (element == null) {
              element = root.querySelector(ref)
            }
            if (element == null) throw new Error(`elementRef "${ref}" does not exist!`)
            element.removeAttribute('data-ref')
            target[ref] = element as SwissArmyElement
          }
          return target[ref]
        }
      })
    }
    return this._refs
  }

  constructor () {
    super()
    instanceCount += 1
    this.initAttributes('hidden')
    this.instanceId = `${this.tagName.toLocaleLowerCase()}-${instanceCount}`
    this._value = deepClone(this.defaultValue)
  }

  connectedCallback (): void {
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
  }

  disconnectedCallback (): void {
    resizeObserver.unobserve(this)
  }

  private _changeQueued = false
  private _renderQueued = false
  queueRender (triggerChangeEvent = false): void {
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
  private hydrate (): void {
    if (!this._hydrated) {
      this.initValue()
      const _content: ContentType | null = typeof this.content === 'function' ? this.content() : this.content
      if (this.styleNode !== undefined) {
        const shadow = this.attachShadow({ mode: 'open' })
        shadow.appendChild(this.styleNode)
        appendContentToElement(shadow, _content)
      } else {
        appendContentToElement(this as HTMLElement, _content)
      }
      this._hydrated = true
    }
  }

  render (): void {
    this.hydrate()
  }
}
