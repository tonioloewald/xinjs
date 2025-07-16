/*#
# 4. web-components

**xinjs** provides the abstract `Component` class to make defining custom-elements
easier.

## Component

To define a custom-element you can subclass `Component`, simply add the properties
and methods you want, with some help from `Component` itself, and then simply
export your new class's `elementCreator()` which is a function that defines your
new component's element and produces instances of it as needed.

```
import {Component} from 'xinjs'

class ToolBar extends Component {
  static styleSpec = {
    ':host': {
      display: 'flex',
      gap: '10px',
    },
  }
}

export const toolBar = ToolBar.elementCreator({ tag: 'tool-bar' })
```

This component is just a structural element. By default a `Component` subclass will
comprise itself and a `<slot>`. You can change this by giving your subclass its
own `content` template.

The last line defines the `ToolBar` class as the implementation of `<tool-bar>`
HTML elements (`tool-bar` is derived automatically from the class name) and
returns an `ElementCreator` function that creates `<tool-bar>` elements.

See [elements](/?elements.ts) for more information on `ElementCreator` functions.

### Component properties

#### content: Element | Element[] | () => Element | () => Element[] | null

Here's a simple example of a custom-element that simply produces a
`<label>` wrapped around `<span>` and an `<input>`. Its value is synced
to that of its `<input>` so the user doesn't need to care about how
it works internally.

```js
const { Component, elements } = tosijs

const {label, span, input} = elements

class LabeledInput extends Component {
  caption = 'untitled'
  value = ''

  constructor() {
    super()
    this.initAttributes('caption')
  }

  content = label(span(), input())

  connectedCallback() {
    super.connectedCallback()
    const {input} = this.parts
    input.addEventListener('input', () => {
      this.value = input.value
    })
  }

  render() {
    super.render()
    const {span, input} = this.parts
    span.textContent = this.caption
    if (input.value !== this.value) {
      input.value = this.value
    }
  }
}

const labeledInput = LabeledInput.elementCreator()

preview.append(
  labeledInput({caption: 'A text field', value: 'some text'})
)
```

`content` is, in essence, a template for the internals of the element. By default
it's a single `<slot>` element. If you explicitly want an element with no content
you can set your subclass's content to `null` or omit any `<slot>` from its template.

By setting content to be a function that returns elements instead of a collection
of elements you can take customize elements based on the component's properties.
In particular, you can use `onXxxx` syntax sugar to bind events.

(Note that you cannot bind to xin paths reliably if your component uses a `shadowDOM`
because `xin` cannot "see" elements there. As a general rule, you need to take care
of anything in the `shadowDOM` yourself.)

If you'd like to see a more complex example along the same lines, look at
[xin-form and xin-field](https://ui.xinjs.net/?form.ts).

##### <slot> names and the `slot` attribute

```
const {slot} = Component.elements
class MenuBar extends Component {
  static styleSpec = {
    ':host, :host > slot': {
      display: 'flex',
    },
    ':host > slot:nth-child(1)': {
      flex: '1 1 auto'
    },
  }

  content = [slot(), slot({name: 'gadgets'})]
}

export menuBar = MenuBar.elementCreator()
```

One of the neat things about custom-elements is that you can give them *multiple*
`<slot>`s with different `name` attributes and then have children target a specific
slot using the `slot` attribute.

This app's layout (the nav sidebar that disappears if the app is in a narrow space, etc.)
is built using just such a custom-element.

#### `<xin-slot>`

If you put `<slot>` elements inside a `Component` subclass that doesn't have a
shadowDOM, they will automatically be replaced with `<xin-slot>` elements that
have the expected behavior (i.e. sucking in children in based on their `<slot>`
attribute).

`<xin-slot>` doesn't support `:slotted` but since there's no shadowDOM, just
style such elements normally, or use `xin-slot` as a CSS-selector.

Note that you cannot give a `<slot>` element attributes (other than `name`) so if
you want to give a `<xin-slot>` attributes (such as `class` or `style`), create it
explicitly (e.g. using `elements.xinSlot()`) rather than using `<slot>` elements
and letting them be switched out (because they'll lose any attributes you give them).

Here's a very simple example:

```js
const { Component, elements } = tosijs

const { xinSlot, div } = elements

class FauxSlotExample extends Component {
  content = [
    div('This is a web-component with no shadow DOM and working slots!'),
    xinSlot({name: 'top'}),
    xinSlot(),
    xinSlot({name: 'bottom'}),
  ]
}

const fauxSlotExample = FauxSlotExample.elementCreator({
  tag: 'faux-slot-example',
  styleSpec: {
    ':host': {
      display: 'flex',
      flexDirection: 'column'
    },
  }
})

preview.append(
  fauxSlotExample(
    div({slot: 'bottom'}, 'I should be on the bottom'),
    div({slot: 'top'}, 'I should be on the top'),
    div('I should be in the middle')
  )
)
```

> ##### Background
>
> `<slot>` elements do not work as expected in shadowDOM-less components. This is
> hugely annoying since it prevents components from composing nicely unless they
> have a shadowDOM, and while the shadowDOM is great for small widgets, it's
> terrible for composite views and breaks `xinjs`'s bindings (inside the shadow
> DOM you need to do data- and event- binding manually).

#### styleNode: HTMLStyleElement

`styleNode` is the `<style>` element that will be inserted into the element's
`shadowRoot`.

If a `Component` subclass has no `styleNode`, no `shadowRoot` will be
created. This reduces the memory and performance cost of the element.

This is to avoid the performance/memory costs associated with the `shadowDOM`
for custom-elements with no styling.

##### Notes

Styling custom-elements can be tricky, and it's worth learning about
how the `:host` and `:slotted()` selectors work.

It's also very useful to understand how CSS-Variables interact with the
`shadowDOM`. In particular, CSS-variables are passed into the `shadowDOM`
when other CSS rules are not. You can use css rules to modify css-variables
which will then penetrate the `shadowDOM`.

#### refs: {[key:string]: Element | undefined}

    render() {
      super.render() // see note
      const {span, input} = this.parts
      span.textContent = this.caption
      if (input.value !== this.value) {
        input.value = this.value
      }
    }

> **Note**: the `render()` method of the base `Component` class doesn't currently
> do anything, so calling it is optional (but a good practice in case one day…)
>
> It is *necessary* however to call `super.connectedCallback`, `super.disconnectedCallback`
> and `super()` in the `constructor()` should you override them.

`this.parts` returns a proxy that provides elements conveniently and efficiently. It
is intended to facilitate access to static elements (it memoizes its values the
first time they are computed).

`this.parts.foo` will return a content element with `data-ref="foo"`. If no such
element is found it tries it as a css selector, so `this.parts['.foo']` would find
a content element with `class="foo"` while `this.parts.h1` will find an `<h1>`.

`this.parts` will also remove a `data-ref` attribute once it has been used to find
the element. This means that if you use all your refs in `render` or `connectedCallback`
then no trace will remain in the DOM for a mounted element.

### Component methods

#### initAttributes(...attributeNames: string[])

    class LabeledInput extends Component {
      caption: string = 'untitled'
      value: string = ''

      constructor() {
        super()
        this.initAttributes('caption')
      }

      ...
    }

Sets up basic behavior such as queueing a render if an attribute is changed, setting
attributes based on the DOM source, updating them if they're changed, implementing
boolean attributes in the expected manner, and so forth.

Call `initAttributes` in your subclass's `constructor`, and make sure to call `super()`.

#### queueRender(triggerChangeEvent = false): void

Uses `requestAnimationFrame` to queue a call to the component's `render` method. If
called with `true` it will also trigger a `change` event.

#### private initValue(): void

**Don't call this!** Sets up expected behavior for an `HTMLElement` with
a value (i.e. triggering a `change` events and `render` when the `value` changes).

#### private hydrate(): void

**Don't call this** Appends `content` to the element (or its `shadowRoot` if it has a `styleNode`)

#### connectedCallback(): void

If the class has an `onResize` handler then a ResizeObserver will trigger `resize`
events on the element when its size changes and `onResize` will be set up to respond
to `resize` events.

Also, if the subclass has defined `value`, calls `initValue()`.

`connectedCallback` is a great place to attach **event-handlers** to elements in your component.

Be sure to call `super.connectedCallback()` if you implement `connectedCallback` in the subclass.

#### disconnectedCallback(): void

Be sure to call `super.disconnectedCallback()` if you implement `disconnectedCallback` in the subclass.

#### render(): void

Be sure to call `super.render()` if you implement `render` in the subclass.

### Component static properties

#### Component.elements

    const {label, span, input} = Component.elements

This is simply provided as a convenient way to get to [elements](/?elements.ts)

### Component static methods

#### Component.elementCreator(options? {tag?: string, styleSpec: XinStyleSheet}): ElementCreator

    export const toolBar = ToolBar.elementCreator({tag: 'tool-bar'})

Returns a function that creates the custom-element. If you don't pass a `tag` or if the provided tag
is already in use, a new unique tag will be used.

If no tag is provided, the Component will try to use introspection to "snake-case" the
"ClassName", but if you're using name mangling this won't work and you'll get something
pretty meaningless.

If you want to create a global `<style>` sheet for the element (especially useful if
your component doesn't use the `shadowDOM`) then you can pass `styleSpec`. E.g.

    export const toolBar = ToolBar.elementCreator({
      tag: 'tool-bar',
      styleSpec: {
        ':host': { // note that ':host' will be turned into the tagName automatically!
          display: 'flex',
          padding: 'var(--toolbar-padding, 0 8px)',
          gap: '4px'
        }
      }
    })

This will—assuming "tool-bar" is available—create:

    <style id="tool-bar-helper">
      tool-bar {
        display: flex;
        padding: var(--toolbar-padding, 0 8px);
        gap: 4px;
      }
    <style>

And append it to `document.head` when the first instance of `<tool-bar>` is inserted in the DOM.

Finally, `elementCreator` is memoized and only generated once (and the arguments are
ignored on all subsequent calls).

## Examples

[xinjs-ui](https://ui.xinjs.net) is a component library built using this `Component` class
that provides the essential additions to standard HTML elements needed to build many
user-interfaces.

- [xin-example](https://ui.xinjs.net/https://ui.xinjs.net/?live-example.ts) uses multiple named slots to implement
  powers the interactive examples used for this site.
- [xin-sidebar](https://ui.xinjs.net/?side-nav.ts) implements the sidebar navigation
  used on this site.
- [xin-table](https://ui.xinjs.net/?data-table.ts) implements virtualized tables
  with resizable, reorderable, sortable columns that can handle more data
  than you're probably willing to load.
- [xin-form and xin-field](https://ui.xinjs.net/?form.ts) allow you to
  quickly create forms that leverage all the built-in functionality of `<input>`
  elements (including powerful validation) even for custom-fields.
- [xin-md](https://ui.xinjs.net/?markdown-viewer.ts) uses `marked` to render
  markdown.
- [xin-3d](https://ui.xinjs.net/?babylon-3d.ts) lets you easily embed 3d scenes
  in your application using [babylonjs](https://babylonjs.com/)
*/
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

export abstract class Component<T = PartsMap> extends HTMLElement {
  static elements: ElementsProxy = elements
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

  static elementCreator(
    options: ElementCreatorOptions = {}
  ): ElementCreator<Component> {
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
      if (styleSpec !== undefined) {
        setGlobalStyle(tagName, styleSpec)
      }
      window.customElements.define(
        tagName,
        this as unknown as CustomElementConstructor,
        options
      )
      this._elementCreator = elements[tagName]
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

  private _parts?: T
  get parts(): T {
    const root = this.shadowRoot != null ? this.shadowRoot : this
    if (this._parts == null) {
      this._parts = new Proxy(
        {},
        {
          get(target: any, ref: string) {
            if (target[ref] === undefined) {
              let element = root.querySelector(`[part="${ref}"]`)
              if (element == null) {
                element = root.querySelector(ref)
              }
              if (element == null)
                throw new Error(`elementRef "${ref}" does not exist!`)
              element.removeAttribute('data-ref')
              target[ref] = element as Element
            }
            return target[ref]
          },
        }
      ) as T
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
        const existingChildren = Array.from(this.childNodes)
        appendContentToElement(this as HTMLElement, _content, cloneElements)
        this.isSlotted = this.querySelector('slot,xin-slot') !== undefined
        const slots = Array.from(this.querySelectorAll('slot'))
        if (slots.length > 0) {
          slots.forEach(XinSlot.replaceSlot)
        }
        if (existingChildren.length > 0) {
          const slotMap: { [key: string]: Element } = { '': this }
          Array.from(this.querySelectorAll('xin-slot')).forEach((slot) => {
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
