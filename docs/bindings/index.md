# Built-in Bindings (bindings)

`bindings` is simply a collection of common bindings.

You can create your own bindings easily enough (and add them to `bindings` if so desired).

A `binding` looks like this:

```
interface TosiBinding {
  toDOM?: (element: HTMLElement, value: any, options?: TosiObject) => void
  fromDOM?: (element: HTMLElement) => any
}
```

The `fromDOM` function is only needed for bindings to elements that trigger `change` or `input`
events, typically `<input>`, `<textarea>`, and `<select>` elements, and of course your
own [Custom Elements](/component/).

## value

The `value` binding syncs state with the bound element's value, in both directions. It is
what `bindValue` uses. It is meant for form controls: `<input>`, `<textarea>`, `<select>`
and components that implement `value`.

It reads and writes the property that carries the control's value, which is not always
`value`: a **checkbox** is bound through `checked` (a boolean), and a **radio** group
through whichever radio is checked (its `value`). So `input({ type: 'checkbox',
bindValue: app.done })` binds a boolean.

## text

The `text` binding copies state to the bound element's `textContent` property.

## enabled & disabled

> **Note:** `bindEnabled` and `bindDisabled` are NOT deprecated (1.9.0
> deprecated them; 1.9.1 removed that, because the shortcut is the only form
> that accepts a path STRING — `disabled: 'path'` sets an always-truthy string
> and permanently disables the control). Both spellings are correct. Prefer the
> plain prop with a proxy where you have one:
>
>     button({ disabled: proxy.flag })
>     button({ disabled: proxy.items.tosi.as(list => !list.length) })

The `enabled` and `disabled` bindings allow you to make a widget's enabled status
be determined by the truthiness of something in state, e.g.

```
import { tosi, elements } from 'tosijs'

const { myDoc } = tosi({
    myDoc: {
        content: '',
        unsavedChanges: false
    }
})

document.body.append(
    elements.textarea({
        bindValue: myDoc.content,
        onInput() {
            myDoc.unsavedChanges.value = true
        }
    }),
    elements.button(
        'Save Changes',
        {
            disabled: myDoc.unsavedChanges.tosi.as(v => !v),
            onClick() {
                myDoc.unsavedChanges.value = false
            }
        }
    )
)
```

## list

The `list` binding makes a copy of a `template` element inside the bound element
for every item in the bound `Array`.

It uses the existing **single** child element it finds inside the bound element
as its `template`. If the child is a `<template>` (which is a good idea) then it
expects that `template` to have a *single child element*.

E.g. if you have a simple unordered list:

    <ul>
      <li></li>
    </ul>

You can bind an array to the `<ul>` and it will make a copy of the `<li>` inside
for each item in the source array.

The `list` binding accepts as options:
- `idPath: string`
- `initInstance: (element, item: any) => void`
- `updateInstance: (element, item: any) => void`
- `virtual: { height: number, … }` (see [virtualized lists](/list-binding/#virtualized-lists) for all of its options)
- `nonVirtualReason: string` — why a long list deliberately renders every item
- `hiddenProp: symbol | string`
- `visibleProp: symbol | string`

`initInstance` is called once for each element created, and is passed
that element and the array value that it represents.

Meanwhile, `updateInstance` is called once on creation and then any time the
array value is updated.

### Long lists: virtualize, or say why

A list of **more than 10 items** with neither `virtual` nor `nonVirtualReason`
logs a warning, once per list. An unvirtualized list keeps one live, bound DOM
subtree per item and updates them all, which is the commonest way a tosijs page
gets slow. The warning names the bound path, the item count and the element,
and the two fixes:

    { virtual: { height: 32 } }                  // only the visible rows exist
    { nonVirtualReason: 'fixed list of 12 months' } // rendering all is deliberate

The reason does nothing at runtime except silence the warning; it is there so
the next reader knows the choice was made, not missed. `settings.quiet`
silences this along with tosijs's other advice.

### Virtual List Binding

To bind large arrays with minimal performance impact, make the list binding
`virtual` by passing the `height` of an item, and give the bound element a
height and `overflow: auto` so it can scroll. Only visible elements will be
rendered. [Array Bindings](/list-binding/#virtualized-lists) has the options,
grids, variable-height rows and window scrolling.

### Filtered Lists and Detail Views

You can **filter** the elements you wish to display in a bound list by using the
`hiddenProp` (to hide elements of the list) and/or `visibleProp` (to show elements
of the list).

You can pass a `path` or a `symbol` as either the `hiddenProp` or `visibleProp`.

Typically, you can use `hiddenProp` to power filters and `visibleProp` to power
detail views. The beauty of using symbols is that it won't impact the serialized
values of the array and different views of the array can use different selection
and filtering criteria.

> **Note** for a given list-binding, if you specify `hiddenProp` (but not `visibleProp`),
> then all items in the array will be shown *unless* `item[hiddenProp] === true`.
>
> Conversely, if you specify `visibleProp` (but not `hiddenProp`), then all items
> in the array will be ignored *unless* `item[visibleProp] === true`.
>
> If, for some reason, you specify both then an item will only be visible if
> it `item[visibleProp] === true` and `item[hiddenProp] !== true`.

### Binding custom-elements using idPath

If you list-bind a custom-element with `bindValue` implemented and providing an
`idPath` then the list-binding will bind the array items to the value of the
custom-element.

### The `-tosi-empty-list` class

The `list` binding automatically adds the class `-tosi-empty-list` to a
container bound to an empty array, making it easier to conditionally render
instructions or explanations when a list is empty.

> The class was called `-xin-empty-list` before 1.10.9. Both are set for now;
> the old name is deprecated and goes away in 2.0.
