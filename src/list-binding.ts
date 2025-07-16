/*#
# 2.1 binding arrays

The most likely source of complexity and performance issues in applications is
displaying large lists or grids of objects. `xinjs` provides robust support
for handling this efficiently.

## `bindList` and `bindings.list`

The basic structure of a **list-binding** is:

    div( // container element
      {
        bindList: {
          value: boxed.path.to.array // OR 'path.to.array'
          idPath: 'id' // (optional) path to unique id of array items
        }
      },
      template( // template for the repeated item
        div( // repeated item should have a single root element
          ... // whatever you want
          span({
            bindText: '^.foo.bar' // binding to a given array member's `foo.bar`
              // '^' refers to the array item itself
          })
        )
      )
    )

```js
const { elements, boxedProxy } = tosijs
const { listBindingExample } = boxedProxy({
  listBindingExample: {
    array: ['this', 'is', 'an', 'example']
  }
})

const { h3, ul, li, template } = elements

preview.append(
  h3('binding an array of strings'),
  ul(
    {
      bindList: {
        value: listBindingExample.array
      },
    },
    template(
      li({ bindText: '^' })
    )
  )
)
```

### id-paths

**id-paths** are a wrinkle in `xin`'s paths specifically there to make list-bindign more efficient.
This is because in many cases you will encounter large arrays of objects, each with a unique id somewhere, e.g. it might be `id` or `uid`
or even buried deeper…

    xin.message = [
      {
        id: '1234abcd',
        title: 'hello',
        body: 'hello there!'
      },
      …
    ]

Instead of referring to the first item in `messages` as `messages[0]` it can be referred to
as `messages[id=1234abcd]`, and this will retrieve the item regardless of its position in messages.

Specifying an `idPath` in a list-binding will allow the list to be more efficiently updated.
It's the equivalent of a `key` in React, the difference being that its optional and
specifically intended to leverage pre-existing keys where available.

## Virtualized Lists

The real power of `bindList` comes from its support for virtualizing lists.

    bindList: {
      value: emojiListExample.array,
      idPath: 'name',
      virtual: {
        height: 30,
      },
    }

Simply add a `virtual` property to the list-binding specifying a *minimum* `height` (and, optionally,
`height`) and the list will be `virtualized` (meaning that only visible elements will be rendered,
missing elements being replaced by a single padding element above and below the list).

Now you can trivially bind an array of a million objects to the DOM and have it scroll at
120fps.

```js
const { elements, boxedProxy } = tosijs
const request = await fetch(
  'https://raw.githubusercontent.com/tonioloewald/emoji-metadata/master/emoji-metadata.json'
)
const { emojiListExample } = boxedProxy({
  emojiListExample: {
    array: await request.json()
  }
})

const { div, span, template } = elements

preview.append(
  div(
    {
      class: 'emoji-table',
      bindList: {
        value: emojiListExample.array,
        idPath: 'name',
        virtual: {
          height: 30,
        },
      }
    },
    template(
      div(
        {
          class: 'emoji-row',
          tabindex: 0,
        },
        span({ bindText: '^.chars', class: 'graphic' }),
        span({ bindText: '^.name', class: 'no-overflow' }),
        span({ bindText: '^.category', class: 'no-overflow' }),
        span({ bindText: '^.subcategory', class: 'no-overflow' })
      )
    )
  )
)
```
```css
.emoji-table {
  height: 100%;
  overflow: auto;
}
.emoji-row {
  display: grid;
  grid-template-columns: 50px 300px 200px 200px;
  align-items: center;
  height: 30px;
}

.emoji-row > .graphic {
  font-size: 20px;
  justify-self: center;
}

.emoji-row > * {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

## Filtered Lists

It's also extremely common to want to filter a rendered list, and `xinjs`
provides both simple and powerful methods for doing this.

## `hiddenProp` and `visibleProp`

`hiddenProp` and `visibleProp` allow you to use a property to hide or show array
elements (and they can be `symbol` values if you want to avoid "polluting"
your data, e.g. for round-tripping to a database.)

## `filter` and `needle`

    bindList: {
      value: filterListExample.array,
      idPath: 'name',
      virtual: {
        height: 30,
      },
      filter: (emojis, needle) => {
        needle = needle.trim().toLocaleLowerCase()
        if (!needle) {
          return emojis
        }
        return emojis.filter(emoji => `${emoji.name} ${emoji.category} ${emoji.subcategory}`.toLocaleLowerCase().includes(needle))
      },
      needle: filterListExample.needle
    }

If `bindList`'s options provide a `filter` function and a `needle` (proxy or path) then
the list will be filtered using the function via throttled updates.

`filter` is passed the whole array, and `needle` can be anything so, `filter` can
sort the array or even synthesize it entirely.

In this example the `needle` is an object containing both a `needle` string and `sort`
value, and the `filter` function filters the list if the string is non-empty, and
sorts the list if `sort` is not "default". Also note that an `input` event handler
is used to `touch` the object and trigger updates.

```js
// note that this example is styled by the earlier example

const { elements, boxedProxy } = tosijs
const request = await fetch(
  'https://raw.githubusercontent.com/tonioloewald/emoji-metadata/master/emoji-metadata.json'
)
const { filterListExample } = boxedProxy({
  filterListExample: {
    config: {
      needle: '',
      sort: 'default',
    },
    array: await request.json()
  }
})

const { b, div, span, template, label, input, select, option } = elements

preview.append(
  div(
    {
      style: {
        display: 'flex',
        padding: 10,
        gap: 10,
        height: 60,
        alignItems: 'center'
      },
      onInput() {
        // need to trigger change if any prop of config changes
        touch(filterListExample.config)
      },
    },
    b('filtered list'),
    span({style: 'flex: 1'}),
    label(
      span('sort by'),
      select(
        {
          bindValue: filterListExample.config.sort
        },
        option('default'),
        option('name'),
        option('category')
      ),
    ),
    input({
      type: 'search',
      placeholder: 'filter emoji',
      bindValue: filterListExample.config.needle
    })
  ),
  div(
    {
      class: 'emoji-table',
      style: 'height: calc(100% - 60px)',
      bindList: {
        value: filterListExample.array,
        idPath: 'name',
        virtual: {
          height: 30,
        },
        filter: (emojis, config) => {
          let { needle, sort } = config
          needle = needle.trim().toLocaleLowerCase()
          if (needle) {
            emojis = emojis.filter(emoji => `${emoji.name} ${emoji.category} ${emoji.subcategory}`.toLocaleLowerCase().includes(needle))
          }
          return config.sort === 'default' ? emojis : emojis.sort((a, b) => a[config.sort] > b[config.sort] ? 1 : -1)
        },
        needle: filterListExample.config
      }
    },
    template(
      div(
        {
          class: 'emoji-row',
          tabindex: 0,
        },
        span({ bindText: '^.chars', class: 'graphic' }),
        span({ bindText: '^.name', class: 'no-overflow' }),
        span({ bindText: '^.category', class: 'no-overflow' }),
        span({ bindText: '^.subcategory', class: 'no-overflow' })
      )
    )
  )
)
```
*/
import { settings } from './settings'
import { resizeObserver } from './dom'
import { throttle } from './throttle'
import { xin } from './xin'
import {
  cloneWithBindings,
  elementToItem,
  elementToBindings,
  BOUND_SELECTOR,
  DataBinding,
  xinValue,
  xinPath,
} from './metadata'
import { XinObject, XinTouchableType } from './xin-types'
import { Listener } from './path-listener'

export const listBindingRef = Symbol('list-binding')
const SLICE_INTERVAL_MS = 16 // 60fps
const FILTER_INTERVAL_MS = 100 // 10fps

type ListFilter = (array: any[], needle: any) => any[]

interface ListBindingOptions {
  idPath?: string
  virtual?: { height: number; width?: number }
  hiddenProp?: symbol | string
  visibleProp?: symbol | string
  filter?: ListFilter
  needle?: XinTouchableType
}

interface VirtualListSlice {
  items: any[]
  firstItem: number
  lastItem: number
  topBuffer: number
  bottomBuffer: number
}

function updateRelativeBindings(element: Element, path: string): void {
  const boundElements = Array.from(element.querySelectorAll(BOUND_SELECTOR))
  if (element.matches(BOUND_SELECTOR)) {
    boundElements.unshift(element)
  }
  for (const boundElement of boundElements) {
    const bindings = elementToBindings.get(boundElement) as DataBinding[]
    for (const binding of bindings) {
      if (binding.path.startsWith('^')) {
        binding.path = `${path}${binding.path.substring(1)}`
      }
      if (binding.binding.toDOM != null) {
        binding.binding.toDOM(boundElement as Element, xin[binding.path])
      }
    }
  }
}

export class ListBinding {
  boundElement: Element
  listTop: HTMLElement
  listBottom: HTMLElement
  template: Element
  options: ListBindingOptions
  itemToElement: WeakMap<XinObject, Element>
  private _array: any[] = []
  private readonly _update?: VoidFunction
  private _previousSlice?: VirtualListSlice
  static filterBoundObservers = new WeakMap<Element, Listener>()

  constructor(
    boundElement: Element,
    value: any[],
    options: ListBindingOptions = {}
  ) {
    this.boundElement = boundElement
    this.itemToElement = new WeakMap()
    if (boundElement.children.length !== 1) {
      throw new Error(
        'ListBinding expects an element with exactly one child element'
      )
    }
    if (boundElement.children[0] instanceof HTMLTemplateElement) {
      const template = boundElement.children[0]
      if (template.content.children.length !== 1) {
        throw new Error(
          'ListBinding expects a template with exactly one child element'
        )
      }
      this.template = cloneWithBindings(
        template.content.children[0]
      ) as HTMLElement
    } else {
      this.template = boundElement.children[0] as HTMLElement
      this.template.remove()
    }
    this.listTop = document.createElement('div')
    this.listBottom = document.createElement('div')
    this.boundElement.append(this.listTop)
    this.boundElement.append(this.listBottom)
    this.options = options
    if (options.virtual != null) {
      resizeObserver.observe(this.boundElement)
      this._update = throttle(() => {
        this.update(this._array, true)
      }, SLICE_INTERVAL_MS)
      this.boundElement.addEventListener('scroll', this._update)
      this.boundElement.addEventListener('resize', this._update)
    }
  }

  private visibleSlice(): VirtualListSlice {
    const { virtual, hiddenProp, visibleProp } = this.options
    let visibleArray = this._array
    if (hiddenProp !== undefined) {
      visibleArray = visibleArray.filter((item) => item[hiddenProp] !== true)
    }
    if (visibleProp !== undefined) {
      visibleArray = visibleArray.filter((item) => item[visibleProp] === true)
    }
    if (this.options.filter && this.needle !== undefined) {
      visibleArray = this.options.filter(visibleArray, this.needle)
    }
    let firstItem = 0
    let lastItem = visibleArray.length - 1
    let topBuffer = 0
    let bottomBuffer = 0

    if (virtual != null && this.boundElement instanceof HTMLElement) {
      const width = this.boundElement.offsetWidth
      const height = this.boundElement.offsetHeight

      const visibleColumns =
        virtual.width != null
          ? Math.max(1, Math.floor(width / virtual.width))
          : 1
      const visibleRows = Math.ceil(height / virtual.height) + 1
      const totalRows = Math.ceil(visibleArray.length / visibleColumns)
      const visibleItems = visibleColumns * visibleRows
      let topRow = Math.floor(this.boundElement.scrollTop / virtual.height)
      if (topRow > totalRows - visibleRows + 1) {
        topRow = Math.max(0, totalRows - visibleRows + 1)
      }
      firstItem = topRow * visibleColumns
      lastItem = firstItem + visibleItems - 1

      topBuffer = topRow * virtual.height
      bottomBuffer = Math.max(
        totalRows * virtual.height - height - topBuffer,
        0
      )
    }

    return {
      items: visibleArray,
      firstItem,
      lastItem,
      topBuffer,
      bottomBuffer,
    }
  }

  private needle?: any
  filter = throttle((needle: any) => {
    if (this.needle !== needle) {
      this.needle = needle
      this.update(this._array)
    }
  }, FILTER_INTERVAL_MS)

  update(array?: any[], isSlice?: boolean) {
    if (array == null) {
      array = []
    }
    this._array = array

    const { hiddenProp, visibleProp } = this.options
    const arrayPath: string = xinPath(array) as string

    const slice = this.visibleSlice()
    this.boundElement.classList.toggle(
      '-xin-empty-list',
      slice.items.length === 0
    )
    const previousSlice = this._previousSlice
    const { firstItem, lastItem, topBuffer, bottomBuffer } = slice
    if (
      hiddenProp === undefined &&
      visibleProp === undefined &&
      isSlice === true &&
      previousSlice != null &&
      firstItem === previousSlice.firstItem &&
      lastItem === previousSlice.lastItem
    ) {
      return
    }
    this._previousSlice = slice

    let removed = 0
    let moved = 0
    let created = 0

    for (const element of Array.from(this.boundElement.children)) {
      if (element === this.listTop || element === this.listBottom) {
        continue
      }
      const proxy = elementToItem.get(element as HTMLElement)
      if (proxy == null) {
        element.remove()
      } else {
        const idx = slice.items.indexOf(proxy)
        if (idx < firstItem || idx > lastItem) {
          element.remove()
          this.itemToElement.delete(proxy)
          elementToItem.delete(element as HTMLElement)
          removed++
        }
      }
    }

    this.listTop.style.height = String(topBuffer) + 'px'
    this.listBottom.style.height = String(bottomBuffer) + 'px'

    // build a complete new set of elements in the right order
    const elements: Element[] = []
    const { idPath } = this.options
    for (let i = firstItem; i <= lastItem; i++) {
      const item = slice.items[i]
      if (item === undefined) {
        continue
      }
      let element = this.itemToElement.get(xinValue(item))
      if (element == null) {
        created++
        element = cloneWithBindings(this.template) as HTMLElement
        if (typeof item === 'object') {
          this.itemToElement.set(xinValue(item), element)
          elementToItem.set(element, xinValue(item))
        }
        this.boundElement.insertBefore(element, this.listBottom)
        if (idPath != null) {
          const idValue = item[idPath] as string
          const itemPath = `${arrayPath}[${idPath}=${idValue}]`
          updateRelativeBindings(element, itemPath)
        } else {
          const itemPath = `${arrayPath}[${i}]`
          updateRelativeBindings(element, itemPath)
        }
      }
      elements.push(element)
    }

    // make sure all the elements are in the DOM and in the correct location
    let insertionPoint: Element | null = null
    for (const element of elements) {
      if (element.previousElementSibling !== insertionPoint) {
        moved++
        if (insertionPoint?.nextElementSibling != null) {
          this.boundElement.insertBefore(
            element,
            insertionPoint.nextElementSibling
          )
        } else {
          this.boundElement.insertBefore(element, this.listBottom)
        }
      }
      insertionPoint = element
    }

    if (settings.perf) {
      console.log(arrayPath, 'updated', { removed, created, moved })
    }
  }
}

interface ListBoundElement extends Element {
  [listBindingRef]?: ListBinding
}

export const getListBinding = (
  boundElement: ListBoundElement,
  value: any[],
  options?: ListBindingOptions
): ListBinding => {
  let listBinding = boundElement[listBindingRef]
  if (listBinding === undefined) {
    listBinding = new ListBinding(boundElement, value, options)
    boundElement[listBindingRef] = listBinding
  }
  return listBinding
}
