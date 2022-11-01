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
elements, or property-maps, which are converted into attributes.

E.g.

    const {span} = elements
    span('foo')                   // produces <span>foo</foo>
    span('bar', {class: 'foo'})   // produces <span class="foo">bar</span>

## camelCase conversion

Attributes in camelCase, e.g. `dataRef`, will be converted to kebab-case,
so:

    span({dataRef: 'foo'})        // produces <span data-ref="foo"></span>

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