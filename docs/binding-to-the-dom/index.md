# Binding to the DOM
<!--{ "order": 5, "description": "How tosijs keeps the page in step with state: implicit bindings (a proxy as a property or child), explicit bindings (bindValue and friends), array bindings, and custom bindings. An overview with links to the detail." }-->

A binding wires a piece of state to an element. When the state changes, the
element is updated; for a two-way binding, when the user changes the element,
the state is updated. Nothing is re-rendered and nothing is compared.

The design goal is to eliminate the code that copies values between state and
the page, because that code is where the bugs are. There are four kinds of
binding, from the one you will use most to the one you will rarely need. This
page is the overview; each part links to the page with the detail.

## Implicit binding

Pass a proxy where you would have passed a value, and it stays up to date:

    const { foo } = tosi({
      foo: { bar: { initialString: 'hello', type: 'search' } },
    })

    input({ value: foo.bar.initialString, type: foo.bar.type })
    h1('Results for ', foo.bar.initialString)

A proxy as a property keeps that property in step with the state. A proxy as a
child becomes text that stays in step. This direction is **state to element
only**: typing in that input does not change `foo.bar.initialString`.
[Element creators](/elements/) has the detail.

## Explicit binding

When the element should also write back, say so:

    input({ bindValue: foo.bar.string })

`bindValue` is two-way: the field shows the state and typing changes it. It works
the same on checkboxes, selects, and any component with a `value`. The
`bind<Name>` props use the [built-in bindings](/bindings/) (`value`, `text`,
`enabled`, `disabled`, `list`), and they also accept a path as a string, which a
plain property cannot.

## Array bindings

A list is bound once. Rows are created from a template, and are added, removed
and updated individually as the array changes:

    ul(
      ...app.todos.tosi.listBinding(
        ({ li }, item) => li(item.title),
        { idPath: 'id' }
      )
    )

Long lists can be virtual, so only the rows on screen exist.
[Array bindings](/list-binding/) covers ids, virtual lists, filtering, and
finding, updating and removing rows.

## Custom binding

A binding is just a `toDOM` function and, optionally, a `fromDOM` function. When
none of the above fits, write your own:

    div({
      bind: {
        value: app.progress,
        binding: {
          toDOM(element, value) {
            element.style.width = `${value * 100}%`
          },
        },
      },
    })

[bind()](/bind/) covers custom bindings, `bind()` itself for elements you did not
create, and `on()` for events.

## What not to do

Do not write an observer that updates an element. That is a binding written by
hand, and it will miss a case that `bind` already handles. See
[Why `bind`, and when to use `observe`](/bind-vs-observe/).

<!-- toc -->
- [Why bind, and when to use observe](/bind-vs-observe/)
- [Custom Bindings and Events](/bind/)
- [Built-in Bindings](/bindings/)
- [Array Bindings](/list-binding/)
<!-- /toc -->
