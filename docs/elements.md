# elements

`xinjs` provides `elements` for easily and efficiently generating DOM elements
without using `innerHTML` or other unsafe methods.

    import {elements} from 'xinjs'

    const {label, span, input} = elements

    document.body.append(
      label(
      {style: {
        display: 'inline-flex'
      }},
      span('This is a field'),
      input({value: 'hello world', placeholder: 'type something'})
      )
    )

`elements` is a proxy whose properties are element factory functions,
so `elements.foo` is a function that returns a `<foo>` element.

The arguments of the factory functions can be strings, numbers, other
elements, or property-maps, which are converted into attributes or properties.

E.g.

    const {span} = elements
    span('foo')                   // produces <span>foo</foo>
    span('bar', {class: 'foo'})   // produces <span class="foo">bar</span>
    button('click me', {
      onclick() {
        alert('you clicked me')
      }
    })                            // creates a button with an event handler
    input({
      type: 'checkbox', 
      checked: true
    })                            // produces a checked checkbox

## camelCase conversion

Attributes in camelCase, e.g. `dataInfo`, will be converted to kebab-case,
so:

    span({dataInfo: 'foo'})        // produces <span data-ref="foo"></span>

## style properties

`style` properties can be objects, and these are used to modify the
element's `style` object (while a string property will just change the
element's `style` attribute, eliminating previous changes).

  span({style: 'border: 1px solid red'}, {style: 'font-size: 15px'})

…produces `<span style="font-size: 15px"></span>`, which is probably
not what was wanted.

  span({style: {border: '1px solid red'}, {style: {fontSize: '15px'}}})

…produces `<span style="border: 1px solid red; fon-size: 15px></span>`
which is probably what was wanted.

## event handlers

Properties starting with `on` (followed by an uppercase letter) 
will be converted into event-handlers, so `onMouseup` will be 
turned into a `mouseup` listener.

## binding

You can [bind](bind.md) an element to state using [bindings](bindings.md)
using convenient properties, e.g.

    import { elements } from 'xinjs'
    const {div} = elements
    div({ bindValue: 'app.title' })

…is syntax sugar for:

    import { elements, bind, bindings } from 'xinjs'
    const { div } = elements
    bind( div(), 'app.title', bindings.value )

If you want to use your own bindings, you can use `apply`:

    const visibleBinding = {
      toDOM(element, value) {
        element.classList.toggle('hidden', !value)
      }
    }

    div({ apply(elt){
      bind(elt, 'app.prefs.isVisible', visibleBinding})
    } })

## apply

A property named `apply` is assumed to be a function that will be called
on the element.

    span({
      apply(element){ element.textContent = 'foobar'}
    })

…produces `<span>foobar</span>`.

## fragment

`elements.fragment` is produces `DocumentFragment`s, but is otherwise
just like other element factory functions.

## svgElements

`svgElements` is a proxy just like `elements` but it produces **SVG** elements in
the appropriate namespace.

## mathML

`mathML` is a proxy just like `elements` but it products **MathML** elements in
the appropriate namespace.

> ### Caution
>
> Both `svgElements` and `mathML` are experimental and do not have anything like  the
> degree of testing behind them as `elements`. In particular, the properties of 
> SVG elements (and possible MathML elements) are quite different from ordinary 
> elements, so the underlying `ElementCreator` will never try to set properties
> directly and will always use `setAttribute(...)`.
>
> E.g. `svgElements.svg({viewBox: '0 0 100 100'})` will call `setAttribute()` and
> not set the property directly, because the `viewBox` property is… weird, but
> setting the attribute works.
>
> Again, use with caution!
