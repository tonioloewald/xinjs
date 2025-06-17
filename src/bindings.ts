/*#
# bindings

`bindings` is simply a collection of common bindings.

You can create your own bindings easily enough (and add them to `bindings` if so desired).

A `binding` looks like this:

    interface XinBinding {
      toDOM?: (element: HTMLElement, value: any, options?: XinObject) => void
      fromDOM?: (element: HTMLElement) => any
    }

The `fromDOM` function is only needed for bindings to elements that trigger `change` or `input`
events, typically `<input>`, `<textarea>`, and `<select>` elements, and of course your
own [Custom Elements](web-components.md).

You can see examples of these bindings in the [kitchen sink demo](../demo/components/kitchen-sink.ts).

## set

The `set` binding sends state from `xin` to the bound element's `value` property. It's a
"one way" version of the `value` binding. It's recommended for handling compound
UI elements like dialog boxes or composite custom-elements like a code-editor which might
have all kinds of internal elements generating `change` events.

## value

The `value` binding syncs state from `xin` to the bound element's `value` property. In
general this should only be used for binding simple things, like `<input>` and `<textarea>`
elements.

## text

The `text` binding copies state from `xin` to the bound element's `textContent` property.

## enabled & disabled

The `enabled` and `disabled` bindings allow you to make a widget's enabled status
be determined by the truthiness of something in `xin`, e.g.

```
import { xinProxy, elements } from 'xinjs'

const myDoc = xinProxy({
    myDoc: {
        content: ''
        unsavedChanges: false
    }
}, 1)

// this button will only be enabled if there is something in `myList.array`
document.body.append(
    elements.textarea({
        bindValue: myDoc.content,
        onInput() {
            myDoc.unsavedChanges = true
        }
    }),
    elements.button(
        'Save Changes',
        {
            bindEnabled: myDoc.unsavedChanges,
            onClick() {
                // save the doc
                myDoc.unsavedChanges = false
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

You can find examples of large, virtual bound arrays in [ArrayBindingsTest.ts](../demo/ArrayBindingTest.ts)
and [list-filters.ts](../demo/components/list-filters.ts)

### Filtered Lists and Detail Views

You can **filter** the elements you wish to display in a bound list by using the
`hiddenProp` (to hide elements of the list) and/or `visibleProp` (to show elements
of the list).

You can pass a `path` or a `symbol` as either the `hiddenProp` or `visibleProp`.

Typically, you can use `hiddenProp` to power filters and `visibleProp` to power
detail views. The beauty of using symbols is that it won't impact the serialized
values of the array and different views of the array can use different selection
and filtering criteria.

An example of a large array bound to a filtered list view using `hiddenProp`
and a detail view using `visibleProp` can be found in [list-filters.ts](../demo/components/list-filters.ts).

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

See [arrayBindingTest.ts](../demo/ArrayBindingTest.ts) for an example of this.

### xin-empty-list class

The `list` binding will automatically add the class `-xin-empty-list` to a
container bound to an empty array, making it easier to conditionally render
instructions or explanations when a list is empty.
*/
import { XinObject, XinBinding, ValueElement } from './xin-types'
import { getListBinding } from './list-binding'
import { getValue, setValue } from './dom'

export const bindings: { [key: string | symbol]: XinBinding<Element> } = {
  value: {
    toDOM: setValue,

    fromDOM(element: Element) {
      return getValue(element as ValueElement)
    },
  },

  set: {
    toDOM: setValue,
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

  style: {
    toDOM(element: Element, value: any) {},
  },

  callback: {
    toDOM(element: Element, value: any, options?: XinObject) {
      if (options?.callback) {
        options.callback(element, value)
      } else if (value instanceof Function) {
        value(element)
      }
    },
  },

  list: {
    toDOM(element: Element, value: any[], options?: XinObject) {
      const listBinding = getListBinding(element, options)
      listBinding.update(value)
    },
  },
}
