## bindings

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

## value

The `value` binding syncs state from `xin` to the bound element's `value` property.

## text

The `text` binding copies state from `xin` to the bound element's `textContent` property.

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

`initInstance` is called once for each element created, and is passed
that element and the array value that it represents.

Meanwhile, `updateInstance` is called once on creation and then any time the 
array value is updated.

### Binding custom-elements using idPath

If you list-bind a custom-element with `bindValue` implemented and providing an
`idPath` then the list-binding will bind the array items to the value of the 
custom-element.

See [arrayBindingTest.ts](../demo/ArrayBindingTest.ts) for an example of this.

### Virtual List Binding

If you want to bind large lists and maintain performance, you can make a list
binding `virtual` by passing the `height` (and optionally `width`) of an item.
Only visible elements will be rendered.