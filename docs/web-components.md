# web-components

## Component

`xinjs` provides `Component`, an abstract class designed to make creating new
web-components (or "custom elements") easier.

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

The last line defines the `ToolBar` class as the implementation of `<tool-bar>`
HTML elements (`tool-bar` is derived automatically from the class name) and
returns an `ElementCreator` function that creates `<tool-bar>` elements.

See [elements](./elements.md) for more information on `ElementCreator` functions.

Note that by default, a component will comprise a `<slot>`, so it's possible to create
a simple structural component like `ToolBar` very easily.

### Component.StyleNode(styleSpec: StyleSheet)

A static class function that converts a `StyleSheet` object (think a map of CSS selector
strings to CSS property maps) into a `<style>` element with the CSS in it. 

## WebComponentSpec

The appearance and behavior of the custom element are entirely defined by the 
specification object:

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
      content?: ContentType
      role?: string
      value?: any
    }

|| Property || Description
|| superClass | (optional) Use this to specify a superclass other than HTMLElement.

## <labeled-input> example

[labeled-input.ts](../demo/components/labeled-input.ts) is a more complex example 
that shows a lot of the deeper functionality provided by `makeWebComponent`.

### style

A custom-element with no `style` property will not be created with a shadowDOM,
making unstyled custom-elements more efficient.

Styling custom-elements can be tricky, and it's worth learning about
how the `:host` and `:slotted()` selectors work.

It's also very useful to understand how CSS-Variables interact with the
shadowDOM. In particular, CSS-variables are passed into the shadowDOM
when other CSS rules are not.

### value

The goal of this module is to make a custom-element's `value` behave as much
like an `<input>` element's as possible. As such:

- if you provide a `value` property for your component specification, it will
  have a `value` property that defaults to the value provided.
- if you create an instance of the custom-element with a `value` attribute, its
  value will be initialized to the attribute, but changing the attribute later
  will have no effect, nor will changes to the `value` property update the 
  attribute.
- if you change your component's `value`, it will trigger a `change` event on
  the component. (If you want to trigger `input` events, etc., that's on you.)
  Note that for `object` values, you may want to replace the object to trigger
  updates.

[labeled-input.ts](../demo/components/labeled-input.ts) wraps a single `<input>`
in a custom-element and passes the component's value to-and-from between the
`<input>`.

[ArrayBindingTest.ts](../demo/ArrayBindingTest.ts) creates a more complex
component and binds a component (object) value's different properties
to different elements within it.

### attributes

`attributes` are properties that are assigned via the DOM. If those attributes
are changed then the element will be re-rendered (i.e. its `render` method,
if any, will be called).

`boolean` attributes will automatically be handled correctly.

All elements created using `makeWebComponent` automatically support the `hidden`
boolean attribute, and will disappear if given the attribute.

### props

`props` are properties that are assigned/obtained programmatically but do not
appear in the DOM.

You can specify a prop as a `function`. If the function takes no arguments
(i.e. has a `length` of 1) it will be treated as ready-only. If it takes an
argument it is also used as a setter.

E.g. you could implement something like the `checked` property of
`<input type="checkbox">` by looking at / setting the element's `value`.

### Life-Cycle Methods

`connectedCallback`, `disconnectedCallback`, and `render` are all wired
up if provided. Note that the underlying component class will be constructed
automatically and these methods will be called by the class's corresponding
methods (so you don't need to call `super()`).

### Event Handlers

You can provide an `eventHandlers` object with functions named for the 
event-types they will handle.

If you provide a `resize` event handler, it will be called when the element's
size changes (a `ResizeObserver` will watch the element and fire `resize` events
when it changes size).

### elementRefs

The component will have a property containing references to any element created
with a `data-ref` attribute. In the example, the `<input>` inside the component's
shadowDOM has the `data-ref` of "field", so `this.elementRefs.field` references
the element.

    import {elements, makeWebComponent} from 'xinjs'
    const {label, slot, input} = elements
    const labeledInput = makeWebComponent('labeled-input', {
      style: {
        ':host > label': {
          display: 'inline-flex',
          gap: '5px'
        },
      },
      attributes: {
        type: '',
        placeholder: ''
      },
      props: {
        value: ''
      },
      content: label(slot(), input({dataRef: 'field'})),
      connectedCallback() {
        const self = this
        const {field} = self.elementRefs
        field.addEventListener('input', () => self.value = field.value)
      },
      render() {
        const {field} = this.elementRefs
        if (this.type) {
          field.setAttribute('type', this.type)
        } else {
          field.removeAttribute('type')
        }
        if (this.placeholder) {
          field.setAttribute('placeholder', this.placeholder)
        } else {
          field.removeAttribute('placeholder')
        }
        if (field.value !== `${this.value}`) {
          field.value = this.value 
        }
      }
    })

