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
      styleNode = Component.StyleNode({
        ':host': {
          display: 'flex',
          gap: '10px',
        },
      })
    }

    export const toolBar = ToolBar.elementCreator()

This component is just a structural element. By default a `Component` subclass will
comprise itself and a `<slot>`. You can change this by giving your subclass its
own `content` template.

The last line defines the `ToolBar` class as the implementation of `<tool-bar>`
HTML elements (`tool-bar` is derived automatically from the class name) and
returns an `ElementCreator` function that creates `<tool-bar>` elements.

See [elements](./elements.md) for more information on `ElementCreator` functions.

### Component properties

#### content: Element | Element[] | null

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

      content: label(span(), input())

      connectedCallback() {
        super.connectedCallback()
        const {input} = this.refs
        input.addEventListener('input', () => {
          this.value = input.value
        })
      }

      render() {
        super.render()
        const {span, input} = this.refs
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

If you'd like to see a more complex example along the same lines, look at
[labeled-input.ts](../demo/components/labeled-input.ts).

##### <slot> names and the `slot` attribute

    const {slot} = Component.elements
    class MenuBar extends Component {
      styleNode: Component.StyleNode({
        ':host, :host > slot': {
          display: 'flex',
        },
        ':host > slot:nth-child(1)': {
          flex: '1 1 auto'
        },
      })
      content: [slot(), slot({name: 'gadgets'})]
    }

    export menuBar = MenuBar.elementCreator()

One of the neat things about custom-elements is that you can give them *multiple*
`<slot>`s with different `name` attributes and then have children target a specific
slot using the `slot` attribute.

[app-layout.ts](../demo/components/app-layout.ts) is a more complex example of a
structural element utilizing multiple named `<slot>`s.

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
      super.render()
      const {span, input} = this.refs
      span.textContent = this.caption
      if (input.value !== this.value) {
        input.value = this.value
      }
    }

`this.refs` returns a proxy that provides elements conveniently and efficiently. It
is intended to facilitate access to static elements (it memoizes its values the
first time they are computed).

`this.refs.foo` will return a content element with `data-ref="foo"`. If no such
element is found it tries it as a css selector, so `this.refs['.foo']` would find
a content element with `class="foo"` while `this.refs.h1` will find an `<h1>`.

`this.refs` will also remove a `data-ref` attribute once it has been used to find
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

#### Component.StyleNode(styleSpec: StyleSheet): HTMLStyleElement

    class ToolBar extends Component {
      styleNode = Component.StyleNode({
        ':host': {
          display: 'flex',
          gap: '10px',
        },
      })
    }

A static class function that converts a `StyleSheet` object (think a map of CSS selector
strings to CSS property maps) into a `<style>` element with the CSS in it.

#### Component.elementCreator(options? {extends?: string, tag?: string}): ElementCreator

    export const toolBar = ToolBar.elementCreator()

Returns a function that creates the custom-element. You can specify the tag and the
pre-existing element it extends if you like. By default, the tag is produced by
kabob-casing the class name (so `class FooBar…` implements `<foo-bar>`).

If there's no second bar, then `-elt` is added to the tag. So `class Foo…` implements `<foo-elt>`.

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
- [todo.ts](../demo/components/todo.ts) implements a simple reminder list.
- [toolbar.ts](../demo/components/toolbar.ts) is a simple toolbar container.