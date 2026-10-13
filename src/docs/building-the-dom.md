# Building the DOM
<!--{ "order": 4, "description": "How tosijs builds user interfaces: element creators that return real DOM elements, CSS written as objects, and web components for the pieces worth naming. An overview with links to the detail." }-->

Elements are the user interface. `tosijs` creates real DOM elements, directly,
with ordinary function calls. There is no template language, no JSX and nothing
to compile, and what you get back is what the browser gives you: an
`HTMLElement` you can append, query and inspect.

This page is the overview. Each part links to the page with the detail.

## Element creators

    import { elements } from 'tosijs'

    const { div, h1, input, button } = elements

    document.body.append(
      div(
        { class: 'card' },
        h1('Hello'),
        input({ placeholder: 'your name' }),
        button('OK', { onClick: () => console.log('clicked') })
      )
    )

`elements` has a creator for every tag. A creator takes its arguments in any
order: strings and elements become children, a plain object sets attributes,
properties, styles and event handlers. [Element creators](/elements/) covers
everything they accept, including SVG and MathML, and `bindParts()` for wiring
up HTML that already exists.

## Styling

Use CSS. `tosijs` adds a way to write it as JavaScript objects, CSS variables
with defaults, and color math: see [CSS](/css/).

## Web components

When a piece of the page deserves its own tag, make it a custom element with
[`Component`](/component/). Components have no shadow DOM by default, compose
with `<slot>`, and are bound like an `<input>`, through their `value`.
[Blueprints](/blueprint-loader/) load components straight from markup.

## Making it live

Everything above builds a static page. To have it follow your state, see
[Binding to the DOM](/binding-to-the-dom/).

<!-- toc -->
- [Element Creators](/elements/)
- [CSS](/css/)
- [Web Components](/component/)
<!-- /toc -->
