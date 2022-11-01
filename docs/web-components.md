# web-components

`xinjs` provides `makeWebComponent`, a convenience function for creating new
web-components (or "custom elements").

    import {elements, makeWebComponent} from 'xinjs'
    const {slot} = elements
    const toolBar = makeWebComponent('tool-bar', {
      style: {
        ':host': {
          display: 'flex',
          gap: '10px',
        },
      }
    })

By default, a component will comprise a `<slot>`, so it's possible to create
a simple structural component very easily.

## <labeled-input> example

This is a more complex example that shows a lot of the deeper functionality
provided by `makeWebComponent`.

### style

A custom-element with no `style` property will not be created with a shadowDOM,
making unstyled custom-elements more efficient.

Styling custom-elements can be tricky, and it's worth learning about
how the `:host` and `:slotted()` selectors work.

It's also very useful to understand how CSS-Variables interact with the
shadowDOM. In particular, CSS-variables are passed into the shadowDOM
when other CSS rules are not.

### value

If you want your component to handle a value then give it a `prop` named
`value` of the appropriate type.

If your element is given a `value` attribute in the DOM, this will be used
when the element is connected, but not otherwise.

If you change the `value` of the component, a `change` event will automatically
be fired on that element.

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

