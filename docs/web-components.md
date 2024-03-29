# web-components

**xinjs** provides the abstract `Component` class to make defining custom-elements
easier.

## Component

To define a custom-element you can subclass `Component`, simply add the properties
and methods you want, with some help from `Component` itself, and then simply
export your new class's `elementCreator()` which is a function that defines your
new component's element and produces instances of it as needed.

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

This component is just a structural element. By default a `Component` subclass will
comprise itself and a `<slot>`. You can change this by giving your subclass its
own `content` template.

The last line defines the `ToolBar` class as the implementation of `<tool-bar>`
HTML elements (`tool-bar` is derived automatically from the class name) and
returns an `ElementCreator` function that creates `<tool-bar>` elements.

See [elements](./elements.md) for more information on `ElementCreator` functions.

### Component properties

#### content: Element | Element[] | () => Element | () => Element[] | null

Here's a simple example of a custom-element that simply produces a
`<label>` wrapped around `<span>` and an `<input>`. Its value is synced
to that of its `<input>` so the user doesn't need to care about how
it works internally.

    const {label, span, input} = Component.elements

    class LabeledInput extends Component {
      caption: string = 'untitled'
      value: string = ''

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

    export const labeledInput = LabeledInput.elementCreator()

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
[labeled-input.ts](../demo/components/labeled-input.ts).

##### <slot> names and the `slot` attribute

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

One of the neat things about custom-elements is that you can give them *multiple*
`<slot>`s with different `name` attributes and then have children target a specific
slot using the `slot` attribute.

[app-layout.ts](../demo/components/app-layout.ts) is a more complex example of a
structural element utilizing multiple named `<slot>`s.

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

Also see the [faux-slot example](/demo/faux-slots.ts).

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

This is simply provided as a convenient way to get to [elements](./elements.md)

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

In proving out `Component` I've built a number of examples.

- [app-layout](../demo/components/app-layout.ts) uses multiple named slots to implement
  a typical app-layout with header, footer, sidebars, etc.
- [babylon3d](../demo/components/babylon3d.ts) implements a whole family of components
  (inspired by [a-frame](https://aframe.io)) that lets you assemble interactive 3d scenes.
  Aside from the core `<b-3d>` element, none of the other elements are actually displayed.
- [game-controller.ts](../demo/components/game-controller.ts) is an invisible element that
  implements basic game-controller functions (loosely based on [unity3d](https://unity3d.com)'s
  game controls).
- [labeled-input](../demo/components/labeled-input.ts) is what you'd expect.
- [labeled-value](../demo/components/labeled-input.ts) is like labeled-input but read-only.
- [markdown-viewer](../demo/components/markdown-viewer.ts) renders markdown.
- [toolbar.ts](../demo/components/toolbar.ts) is a simple toolbar container.
