/*{ "parent": "binding", "description": "The built-in collection of common bindings: value (two-way), text, enabled, disabled, list — plus how to write your own." }*/
/*#
# bindings

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

The `value` binding syncs state from `xin` to the bound element's `value` property. In
general this should only be used for binding simple things, like `<input>` and `<textarea>`
elements.

## text

The `text` binding copies state from `xin` to the bound element's `textContent` property.

## enabled & disabled

> **Note:** `bindEnabled` and `bindDisabled` are NOT deprecated (1.9.0
> deprecated them; 1.9.1 removed that, because the shortcut is the only form
> that accepts a path STRING — `disabled: 'path'` sets an always-truthy string
> and permanently disables the control). Both spellings are correct. Prefer the
> plain prop with a proxy where you have one:
>
>     button({ disabled: proxy.flag })
>     button({ disabled: proxy.items.tosi.take(list => !list.length) })

The `enabled` and `disabled` bindings allow you to make a widget's enabled status
be determined by the truthiness of something in `xin`, e.g.

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
            disabled: myDoc.unsavedChanges.tosi.take(v => !v),
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
- `virtual: {width?: number, height: number}`
- `hiddenProp: symbol | string`
- `visibleProp: symbol | string`

`initInstance` is called once for each element created, and is passed
that element and the array value that it represents.

Meanwhile, `updateInstance` is called once on creation and then any time the
array value is updated.

### Virtual List Binding

If you want to bind large arrays with minimal performance impact, you can make a list
binding `virtual` by passing the `height` (and optionally `width`) of an item.
Only visible elements will be rendered. Just make sure the values passed represent
the *minimum* dimensions of the individual rendered items if they can vary in size.

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

### xin-empty-list class

The `list` binding will automatically add the class `-xin-empty-list` to a
container bound to an empty array, making it easier to conditionally render
instructions or explanations when a list is empty.
*/
import { TosiObject, TosiBinding, ValueElement } from './xin-types'
import { getListBinding } from './list-binding'
import { getValue, setValue } from './dom'

export const bindings: { [key: string | symbol]: TosiBinding<Element> } = {
  value: {
    toDOM: setValue,

    fromDOM(element: Element) {
      return getValue(element as ValueElement)
    },
  },

  text: {
    toDOM(element: Element, value: any) {
      element.textContent = value
    },
  },

  enabled: {
    toDOM(element: Element, value: any) {
      ;(element as HTMLInputElement).disabled = !value
    },
  },

  disabled: {
    toDOM(element: Element, value: any) {
      ;(element as HTMLButtonElement).disabled = Boolean(value)
    },
  },

  list: {
    toDOM(element: Element, value: any[], options?: TosiObject) {
      const listBinding = getListBinding(element, value, options)!
      listBinding.update(value)
    },
  },
}
