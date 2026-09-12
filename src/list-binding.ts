/*{ "parent": "binding", "description": "Reactive list bindings: surgical updates via id-paths, virtualized rendering for million-row lists, sticky headers, filtering, and grids." }*/
/*#
# binding arrays

The most likely source of complexity and performance issues in applications is
displaying large lists or grids of objects. `tosijs` provides robust support
for handling this efficiently.

## `.tosi.listBinding()`

The simplest way to bind an array is with `.tosi.listBinding()` (or `.listBinding()`
directly on a BoxedProxy). It takes a template builder function that receives
the `elements` proxy and a placeholder item for bindings:

```js
import { elements, tosi } from 'tosijs'
const { listBindingExample } = tosi({
  listBindingExample: {
    array: ['this', 'is', 'an', 'example']
  }
})

const { h3, ul } = elements

preview.append(
  h3('binding an array of strings'),
  ul(
    ...listBindingExample.array.tosi.listBinding(({li}, item) => li(item))
  )
)
```

### listBinding(templateBuilder, options?) => [ElementProps, HTMLTemplateElement]

    type ListTemplateBuilder<U = any> = (elements: ElementsProxy, item: U) => HTMLElement

The template builder receives two arguments: the `elements` proxy (destructure
the tags you need) and a placeholder proxy for the array item. Property access
on the placeholder creates relative bindings (`^.name`, `^.score`, etc.)
automatically.

Spread the result into a container element — it returns an `[ElementProps, HTMLTemplateElement]`
tuple. The props (containing `bindList`) are applied to the container and the
`<template>` becomes a child; the `ListBinding` constructor then finds and removes
the `<template>`, extracting its children as stamp templates. **The `<template>`
element never appears in the live DOM** — it's consumed during initialization.

### Options

Pass options as the second argument:

    ...items.tosi.listBinding(({div}, item) => div(item.name), {
      idPath: 'id',           // unique id field for surgical updates
      virtual: { height: 30 } // virtualize for large lists
    })

### `bindList` + `template` — the low-level form

`.tosi.listBinding()` is **sugar over `bindList`**, and **no `bind*` shortcut is
deprecated** — 1.9.0 deprecated some and 1.9.1 reversed it, because the shortcut
is the only form that takes a path STRING (`disabled: 'app.busy'` sets an
always-truthy string and permanently disables the control). Neither
`bindList` nor `bindValue` has a plain-prop equivalent either (one needs a `<template>`
sibling and options, the other is two-way), so both stay.

    div( // container element
      {
        bindList: {
          value: boxed.path.to.array, // OR 'path.to.array'
          idPath: 'id' // (optional) path to unique id of array items
        }
      },
      template( // template for the repeated item
        div( // repeated item should have a single root element
          ... // whatever you want
          span({
            bind: { value: '^.foo.bar', binding: 'text' }
              // binds a given array member's `foo.bar`
              // '^' refers to the array item itself
          })
        )
      )
    )

You rarely need this form — `.listBinding()` is more concise and type-safe.

Even better, `templateBuilder()` is passed the `elements` proxy and a placeholder `BoxedProxy` of
the array's type, supporting autocompletion of property names within the template.

### id-paths

**id-paths** are a wrinkle in `xin`'s paths specifically there to make list-binding more efficient.
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
It's the equivalent of a `key` in React, the difference being that it's optional and
specifically intended to leverage pre-existing keys where available.

### When to use idPath

**Always use `idPath` for arrays of objects** unless you have a very simple case.

Without `idPath`:
- Bindings use index-based paths like `list[0].name`
- If items are reordered (sort, splice, etc.), bindings point to wrong items
- Fine-grained property updates may not reach the correct DOM elements
- The list binding will work, but inefficiently - often recreating elements

Skipping `idPath` is fine when:
- The array is simple scalars (`['apple', 'banana', 'cherry']`)
- The list is static and never reorders
- You always replace items wholesale, never updating properties

> **Id values must not contain `]` characters.** Id-paths are encoded as
> `list[id=value]` in path strings, so a `]` in the value will break the
> path parser. Characters like `[`, `=`, and `.` are fine. If your ids
> could contain `]`, use a sanitized field or a separate numeric id.

### Surgical Updates with id-paths

When you specify an `idPath`, something remarkable happens: changes to individual
item properties trigger surgical DOM updates without re-rendering the entire list.

Here's how it works:

1. When a list binding is created with an `idPath`, tosijs registers that array path
2. When you modify an item property (e.g., `list[0].color = 'red'`), tosijs detects
   this is inside an array item
3. It automatically synthesizes an equivalent id-path touch (e.g., `list[id=123].color`)
4. Bindings registered with id-path notation receive the update

This means you can update one property on one item in a list of millions, and only
that single DOM element updates. No diffing, no virtual DOM, no reconciliation -
just direct, surgical updates.

**To see this in action:** Open your browser's DevTools, enable "Paint flashing"
(in Chrome: DevTools → More tools → Rendering → Paint flashing), and watch the
virtualized grid example below. Only the cells whose values actually change will flash.

## Nested lists

A list binding can live inside another list's item template — the inner list's
relative path (`^.subs`) resolves against each outer item. This depends on
cloning a `<template>` that itself contains a `<template>`, which only behaves
correctly in a real browser (jsdom/happy-dom put cloned children in the wrong
place), so it is verified in-browser here:

```test
import { tosi, elements, xin, updates } from 'tosijs'
const { div, span, template } = elements

test('a nested list binding renders each inner item', async () => {
  tosi({
    nestedListDoc: {
      groups: [
        { gid: 'g1', subs: [{ sid: 's1', label: 'one' }, { sid: 's2', label: 'two' }] },
        { gid: 'g2', subs: [{ sid: 's3', label: 'three' }] },
      ],
    },
  })
  const container = div(
    template(
      div(
        div(
          {
            class: 'subs',
            bind: { value: '^.subs', binding: 'list', options: { idPath: 'sid' } },
          },
          template(span({ bind: { value: '^.label', binding: 'text' } }))
        )
      )
    ),
    {
      bind: {
        value: xin['nestedListDoc.groups'],
        binding: 'list',
        options: { idPath: 'gid' },
      },
    }
  )
  preview.append(container)
  await updates()
  const labels = [...container.querySelectorAll('span')].map((s) => s.textContent)
  expect(labels).toEqual(['one', 'two', 'three'])
})
```

## Iterating and Searching Arrays

Proxied arrays have specific semantics around which iteration patterns
yield proxied vs. raw items — `for...of` and `find()` give you proxies
(mutations are observed), while `forEach()`/`map()`/`filter()` pass raw
items to callbacks (mutations are silent). See [iterating proxied
arrays](/xin/) under tosi for the full breakdown.

The relevant pattern for list bindings: when you want to update many
items at once, the most efficient idiom is to mutate the raw array
directly and then `touch()` the array path once — a single observer
wave instead of one per item:

    // Mutate behind the proxy's back…
    list.forEach(item => {
      item.score = computeScore(item)
    })
    // …then tell the proxy you're done.
    touch('path.to.list')

This trivial example would work fine via `for...of` too, but for thousands
of mutations the batched-touch form is dramatically cheaper. The path
string is used here deliberately: you've already bypassed the proxy, so
you notify the registry by path rather than reaching for a proxy reference.

## Virtualized Lists

The real power of list bindings comes from their support for virtualizing lists.

    ...emojiListExample.array.tosi.listBinding(({ div }, item) => div(item.name), {
      idPath: 'name',
      virtual: {
        height: 30,
        rowChunkSize: 3,
      },
    })

Simply add a `virtual` property to the list-binding specifying the row `height`
and the list will be `virtualized` (meaning that only visible elements will be rendered,
missing elements being replaced by a single padding element above and below the list).
For variable-height items, add `minHeight` — see **Variable-Height Items** below.

You can (optionally) specify `rowChunkSize` to virtualize the list in chunks of rows to allow
consistent `:nth-child()` styling.

Now you can trivially bind an array of a million objects to the DOM and have it scroll at
120fps.

```js
import { elements, tosi, scrollListItemIntoView } from 'tosijs'
const request = await fetch(
  'https://raw.githubusercontent.com/tonioloewald/emoji-metadata/master/emoji-metadata.json'
)
const emojiData = await request.json()
const { emojiListExample } = tosi({
  emojiListExample: {
    array: emojiData
  }
})

const { div, button } = elements

const emojiTable = div(
  {
    class: 'emoji-table'
  },
  ...emojiListExample.array.listBinding(({div, span}, item) =>
    div(
      {
        class: 'emoji-row',
        tabindex: 0,
      },
      span({ textContent: item.chars, class: 'graphic' }),
      span({ textContent: item.name, class: 'no-overflow' }),
      span({ textContent: item.category, class: 'no-overflow' }),
      span({ textContent: item.subcategory, class: 'no-overflow' })
    ),
    {
      value: emojiListExample.array,
      idPath: 'name',
      virtual: {
        height: 30,
        rowChunkSize: 3
      },
    }
  )
)

const scrollTo = (name) => {
  const item = emojiData.find(e => e.name === name)
  if (item) scrollListItemIntoView(emojiTable, item)
}

preview.append(
  emojiTable,
  div(
    { class: 'scroll-buttons' },
    button('rocket', { onClick: () => scrollTo('rocket') }),
    button('flag: Finland', { onClick: () => scrollTo('flag: Finland') }),
    button('pile of poo', { onClick: () => scrollTo('pile of poo') }),
  ),
)
```
```css
.scroll-buttons {
  display: flex;
  justify-content: center;
  gap: 4px;
  padding: 4px;
}
.emoji-table {
  height: calc(100% - 36px);
  overflow: auto;
}
.emoji-row {
  display: grid;
  grid-template-columns: 50px 300px 200px 200px;
  align-items: center;
  height: 30px;
  overflow-x: hidden;
}
.emoji-row:nth-child(3n) {
  background: #f002;
}
.emoji-row:nth-child(3n+2) {
  background: #00f2;
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

### Virtualized Grids

You can virtualize a grid by styling the padding elements (with class `.virtual-list-padding`)
to have the correct column span. (You can also just specify a fixed `width` for your list.)

This example creates 2000 cells with random text colors, then updates 10% of them
randomly every 500ms. Enable paint flashing to see the surgical updates in action.
Note how `rowChunkSize: 2` allows consistent row shading via `:nth-child()`.

```js
import { elements, tosi, scrollListItemIntoView } from 'tosijs'

// Generate random saturated colors
const randomColor = () => {
  const h = Math.floor(Math.random() * 360)
  return `hsl(${h}, 80%, 45%)`
}

const list = []
for (let i = 0; i < 2000; i++) {
  list.push({ id: i, color: randomColor() })
}

const { bigBindTest } = tosi({
  bigBindTest: list
})

// Update 10% of items randomly every 500ms
setInterval(() => {
  const count = Math.floor(list.length * 0.1)
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * list.length)
    bigBindTest[idx].color = randomColor()
  }
}, 500)

const { div, button } = elements

const grid = div(
  {
    class: 'virtual-grid-example',
  },
  ...bigBindTest.listBinding(
    ({div}, item) => div({
      class: 'cell',
      textContent: item.id,
      bind: {
        value: item.color,
        binding: {
          toDOM(el, color) {
            el.style.color = color
          }
        }
      }
    }),
    {
      idPath: 'id',
      virtual: {
        height: 40,
        visibleColumns: 7,
        rowChunkSize: 2,
      }
    }
  )
)

preview.append(
  grid,
  div(
    { class: 'scroll-buttons' },
    button('Scroll to #17', {
      onClick() {
        scrollListItemIntoView(grid, list[17])
      }
    }),
    button('Scroll to #1000', {
      onClick() {
        scrollListItemIntoView(grid, list[1000])
      }
    }),
    button('Scroll to #1984', {
      onClick() {
        scrollListItemIntoView(grid, list[1984])
      }
    })
  ),
)
```
```css
.scroll-buttons {
  display: flex;
  justify-content: center;
  gap: 4px;
  padding: 4px;
}
.virtual-grid-example {
  height: calc(100% - 36px);
  width: 100%;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 14% 14% 14% 14% 14% 14% 14%;
}

.virtual-grid-example .virtual-list-padding {
  grid-column: 1 / 8;
}

.virtual-grid-example .cell {
  height: 40px;
  line-height: 40px;
  text-align: center;
  font-weight: bold;
  transition: color 0.3s ease;
}

.virtual-grid-example .cell:nth-child(14n+2),
.virtual-grid-example .cell:nth-child(14n+3),
.virtual-grid-example .cell:nth-child(14n+4),
.virtual-grid-example .cell:nth-child(14n+5),
.virtual-grid-example .cell:nth-child(14n+6),
.virtual-grid-example .cell:nth-child(14n+7),
.virtual-grid-example .cell:nth-child(14n+8) {
  background: #0001;
}
```

## Multi-Column Grids with `itemsPerRow`

When `itemsPerRow` is set, the template builder is called N times per array item,
with a `columnIndex` argument (0..N-1). This produces a flat CSS grid where every
cell is a direct child of the container — which means `position: sticky` works
naturally for pinned rows and columns.

The container automatically gets:
- Class `tosi-virtual-grid`
- CSS variable `--tosi-columns` (equal to `itemsPerRow`)
- `display: grid` with `grid-template-columns: repeat(var(--tosi-columns), 1fr)`

Override `grid-template-columns` in your own CSS to set custom column widths.

### Pinned Header and Footer Rows

Any elements before the template in the container are treated as headers;
any after it are footers. Both are preserved across list updates, and
because they're siblings of the data cells in the same grid container,
`position: sticky` works for pinning rows to the top or bottom:

    div(
      ...headerCells,                                // sticky top: 0
      ...items.tosi.listBinding(builder, options),   // virtual data rows
      ...footerCells,                                // sticky bottom: 0
    )

The template's position determines where list items and virtual padding
are inserted — between the headers and footers.

> **Limitation:** header and footer rows must be static content. They
> cannot themselves be list bindings, because the list binding has no
> anchor element to track its insertion point among siblings. If you need
> dynamic columns, rebuild the entire grid container when the column set
> changes.

```js
import { elements, tosi } from 'tosijs'

const columns = [
  { key: 'id',     label: '#',          w: '40px',  sticky: 'left:0' },
  { key: 'name',   label: 'Name',       w: '120px', sticky: 'left:40px', edge: 'right' },
  { key: 'dept',   label: 'Department', w: '110px' },
  { key: 'role',   label: 'Role',       w: '80px' },
  { key: 'level',  label: 'Level',      w: '60px' },
  { key: 'region', label: 'Region',     w: '70px' },
  { key: 'joined', label: 'Joined',     w: '90px' },
  { key: 'email',  label: 'Email',      w: '160px' },
  { key: 'team',   label: 'Team',       w: '100px' },
  { key: 'score',  label: 'Score',      w: '60px' },
  { key: 'status', label: 'Status',     w: '80px',  sticky: 'right:0', edge: 'left' },
]

const depts = ['Engineering', 'Design', 'Product', 'QA', 'Marketing', 'Sales']
const roles = ['Lead', 'Senior', 'Mid', 'Junior']
const regions = ['AMER', 'EMEA', 'APAC']
const teams = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega']
const statuses = ['Active', 'Away', 'Offline']

const data = Array.from({ length: 2000 }, (_, i) => ({
  id: i,
  name: `Person ${i}`,
  dept: depts[i % depts.length],
  role: roles[i % roles.length],
  level: `L${3 + (i % 5)}`,
  region: regions[i % regions.length],
  joined: `2024-${String((i % 12) + 1).padStart(2, '0')}-15`,
  email: `person${i}@example.com`,
  team: teams[i % teams.length],
  score: Math.floor(Math.random() * 100),
  status: statuses[i % statuses.length],
}))

const { gridDemo } = tosi({ gridDemo: data })
const { div, span } = elements

const stickyStyle = (col) => col.sticky
  ? `position:sticky;${col.sticky}`
  : ''
const cellClass = (base, col) =>
  base + (col.sticky ? ' sg-pinned' : '') + (col.edge ? ` sg-edge-${col.edge}` : '')

// Headers and data cells are siblings in the same grid scroll container.
// Headers are static children; data cells come from the list binding.
// Both sticky columns (left/right) and the sticky header row work via CSS.
const grid = div(
  { class: 'sg-grid' },
  // Header cells — static content, preserved across list updates
  ...columns.map(col =>
    span({
      class: cellClass('sg-header', col),
      style: stickyStyle(col),
    }, col.label)
  ),
  // Data cells — itemsPerRow stamps one cell per column per array item
  ...gridDemo.listBinding(
    ({ span }, item, columnIndex) => {
      const col = columns[columnIndex]
      return span({
        class: cellClass('sg-cell', col),
        style: stickyStyle(col),
        textContent: item[col.key],
      })
    },
    {
      idPath: 'id',
      virtual: { height: 28, itemsPerRow: columns.length },
    }
  ),
  // Footer cells — static, pinned to bottom
  ...columns.map((col, i) =>
    span({
      class: cellClass('sg-footer', col),
      style: stickyStyle(col),
    }, i === 0 ? `${data.length}` : i === 1 ? 'rows' : '')
  ),
)

preview.append(grid)
```
```css
.sg-grid {
  height: 100%;
  overflow: auto;
  grid-template-columns: 40px 120px 110px 80px 60px 70px 90px 160px 100px 60px 80px !important;
}
.sg-header {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--bg-color, #f5f5f5);
  font-weight: bold;
  padding: 4px 8px;
  border-bottom: 2px solid #ccc;
  white-space: nowrap;
}
.sg-cell {
  padding: 4px 8px;
  height: 28px;
  line-height: 20px;
  border-bottom: 1px solid #eee;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sg-pinned {
  background: var(--bg-color, #fff);
  z-index: 1;
}
.sg-footer {
  position: sticky;
  bottom: 0;
  z-index: 2;
  background: var(--bg-color, #f5f5f5);
  font-weight: bold;
  padding: 4px 8px;
  border-top: 2px solid #ccc;
  white-space: nowrap;
}
.sg-header.sg-pinned, .sg-footer.sg-pinned {
  z-index: 3;
  background: var(--bg-color, #f5f5f5);
}
.sg-edge-right { border-right: 2px solid #ccc; }
.sg-edge-left  { border-left: 2px solid #ccc; }
```

## Variable-Height Items

If your list items have varying heights, you can use `minHeight` instead of
relying solely on `height`. When `minHeight` is specified, the list uses
scroll-fraction interpolation: the total scroll area is estimated from
`minHeight`, and the visible slice is determined by interpolating between
the top and bottom of the list based on scroll position.

Items render at their **natural height** — no fixed-height constraint.
The scrollbar position is approximate but smooth.

    ...myArray.tosi.listBinding(({ div }, item) => div(item.name), {
      idPath: 'id',
      virtual: {
        height: 40,
        minHeight: 30,
      },
    })

```js
import { elements, tosi, scrollListItemIntoView } from 'tosijs'

const items = Array.from({ length: 2000 }, (_, i) => ({
  id: i,
  label: `Item #${i}`,
  // Vary description length to create different heights
  description: i % 7 === 0
    ? 'This item has a much longer description that will cause it to wrap onto multiple lines, demonstrating variable-height rendering in the virtualized list.'
    : i % 3 === 0
      ? 'Medium-length description for this item.'
      : '',
}))

const { varHeightExample } = tosi({ varHeightExample: { items } })

const { div, span, button } = elements

const list = div(
  {
    class: 'var-height-list',
  },
  ...varHeightExample.items.listBinding(
    ({div, span}, item) => div(
      {
        class: 'var-height-item',
      },
      span({ textContent: item.label, class: 'var-item-label' }),
      span({ textContent: item.description, class: 'var-item-desc' }),
    ),
    {
      idPath: 'id',
      virtual: {
        height: 40,
        minHeight: 30,
      },
    }
  )
)

preview.append(
  list,
  div(
    { class: 'scroll-buttons' },
    button('Scroll to #5', {
      onClick() {
        scrollListItemIntoView(list, items[5])
      }
    }),
    button('Scroll to #1000', {
      onClick() {
        scrollListItemIntoView(list, items[1000])
      }
    }),
    button('Scroll to #1995', {
      onClick() {
        scrollListItemIntoView(list, items[1995])
      }
    }),
  ),
)
```
```css
.scroll-buttons {
  display: flex;
  justify-content: center;
  gap: 4px;
  padding: 4px;
}
.var-height-list {
  height: calc(100% - 36px);
  width: 100%;
  overflow-y: auto;
}
.var-height-item {
  padding: 6px 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.var-height-item:nth-child(odd) {
  background: #f8f8f8;
}
.var-item-label {
  font-weight: bold;
  font-size: 14px;
}
.var-item-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}
.var-item-desc:empty {
  display: none;
}
```

## Filtered Lists

It's also extremely common to want to filter a rendered list, and `tosijs`
provides both simple and powerful methods for doing this.

### `hiddenProp` and `visibleProp`

`hiddenProp` and `visibleProp` allow you to use a property to hide or show array
elements (and they can be `symbol` values if you want to avoid "polluting"
your data, e.g. for round-tripping to a database.)

### `filter` and `needle`

    ...filterListExample.array.tosi.listBinding(({ div }, item) => div(item.name), {
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

If the list binding's options provide a `filter` function and a `needle` (proxy or path) then
the list will be filtered using the function via throttled updates.

`filter` is passed the whole array, and `needle` can be anything so, `filter` can
sort the array or even synthesize it entirely.

In this example the `needle` is an object containing both a `needle` string and `sort`
value, and the `filter` function filters the list if the string is non-empty, and
sorts the list if `sort` is not "default". Also note that an `input` event handler
is used to `touch` the object and trigger updates.

```js
// note that this example is styled by the earlier example

import { elements, tosi } from 'tosijs'
const request = await fetch(
  'https://raw.githubusercontent.com/tonioloewald/emoji-metadata/master/emoji-metadata.json'
)
const { filterListExample } = tosi({
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
    },
    ...filterListExample.array.listBinding(
      ({div, span}, item) => div(
        {
          class: 'emoji-row',
          tabindex: 0,
        },
        span({ textContent: item.chars, class: 'graphic' }),
        span({ textContent: item.name, class: 'no-overflow' }),
        span({ textContent: item.category, class: 'no-overflow' }),
        span({ textContent: item.subcategory, class: 'no-overflow' })
      ),
      {
        idPath: 'name',
        virtual: {
          height: 30,
          rowChunkSize: 3,
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
    )
  )
)
```

## List Utilities

Suppose you have used a list binding to bind an array of objects
to a `<ul>`. So the DOM hierarchy looks something like this:

    <ul>  <-- array is bound to this element
      <template>
        <li>
          <span>...</span>
        </li>
      </template>
      <li>  <-- bound to array[0]
        <span>...</span>
      </li>
      <li>  <-- bound to array[1]
        <span>...</span>
      </li>
      ...
    </ul>

### `getListBinding(element: Element): ListBinding | undefined`

This gets the ListBinding object managing the bound list contained on the provided
element (if any). In the example above, you could call it on the `<ul>` and you'd
get back a `ListBinding` instance that contains all kinds of juicy information.

### `getListItem(element: Element): any`

Gets you the array item bound to the list instance containing the element (if any).

You could call this on an `<li>` element or a any element inside it and get back
the array item bound to the `<li>`.

### `getListInstance(element: Element): { element: Element, item: any } | undefined`

This returns both the root element bound to the array item, and the array item itself.

Again, you could call this on an `<li>` or its contents.

### `deleteListItem(element: Element): boolean`

If the element is part of a list instance bound to an array, this splices bound item out of the array
(and updates the rendered list).

If you call this on an `<li>` or something inside it, this will splice the bound
array item out of the array and then triggers an update the bound list.

> `deleteListItem()` requires that the list binding specifies
> a valid `idPath`, or it will throw an error (and fail).

### `scrollListItemIntoView(element: Element, item: any, options?): boolean`

Scrolls a bound array item into view within its list container. This is
especially useful for virtualized lists where the item's DOM element may
not exist yet.

- `element` - the list container element (the one carrying the list binding)
- `item` - the raw array item to scroll to
- `options.position` - where to place the item in the viewport:
  `'start'`, `'middle'` (default), `'end'`, or `'nearest'`
- `options.behavior` - `'smooth'` (default) or `'instant'`

Returns `true` on success, `false` if the binding or item can't be found
(with a `console.error` explaining what went wrong).

For **virtual lists**, the scroll position is computed mathematically from
the item's index and row height, then applied via `scrollTo()`.
For **non-virtual lists**, the item's DOM element is found and
`scrollIntoView()` is called directly.

> **Future:** a promise-based API using the `scrollend` event could notify
> callers when the scroll completes and the target item is rendered.

## List Operations on Proxied Arrays

In addition to the utility functions above, proxied arrays have `listFind`,
`listUpdate`, and `listRemove` methods that use the same selector pattern
as `listBinding`. These are documented in detail under [tosi](/xin/), but
here's a quick summary:

    // Find an item — returns a proxied item (mutations trigger observers)
    const item = app.items.listFind((item) => item.id, 'abc')

    // Find by DOM element (e.g. in a click handler)
    const item = app.items.listFind(clickedElement)

    // Upsert — update in place (preserving object identity) or push
    app.items.listUpdate((item) => item.id, { id: 'abc', name: 'New Name' })

    // Remove by field match
    app.items.listRemove((item) => item.id, 'abc')

`listUpdate` is designed to work hand-in-hand with list bindings: it mutates
the existing object property by property through the proxy, so the
`itemToElement` WeakMap still points to the same DOM element. Only changed
properties fire observers, producing surgical DOM updates with no element
teardown or recreation.

## Window Scroll Container (Experimental)

By default, virtualized lists scroll within their container element. For infinite-scroll
feeds or full-page lists, you can use the window as the scroll container instead by
setting `scrollContainer: 'window'` in the virtual options:

    ...feedItems.tosi.listBinding(({ div }, item) => div(item.title), {
      idPath: 'id',
      virtual: {
        height: 120,
        scrollContainer: 'window'
      }
    })

With `scrollContainer: 'window'`, the list virtualizes based on the window's scroll
position and viewport height, rather than the element's own scroll position. The list
calculates which items are visible by comparing the element's position (via
`getBoundingClientRect()`) against the window's scroll position and inner height.

This is ideal for:
- Social media-style feeds
- Search results pages
- Any full-page scrolling list where the list is part of the main document flow

**Important**: The list element should not be inside a separately scrollable container
when using window scroll. The element can be positioned anywhere on the page - the
virtualization will correctly account for content above the list.

## Templates and Namespaced Elements

List bindings use a **template** — the first child of the bound container — to stamp out
repeated items. The template can be either:

- A `<template>` element (recommended for HTML lists). Its content is inert and won't
  trigger premature bindings.
- A **naked element** (the first child is used directly and removed from the DOM).
  This is necessary for **SVG** and **MathML** containers, since `<template>` is an
  HTML element and invalid inside namespaced contexts.

### Relative bindings on templates

Bindings that start with `^` (relative to the list item) cannot resolve until the
template is cloned into a list instance. If `touchElement` encounters an unresolved
`^` binding:

- **HTML elements**: a `console.warn` is emitted suggesting you wrap the template in
  a `<template>` element (which keeps its content inert and avoids the issue).
- **Non-HTML elements** (SVG, MathML, etc.): the binding is silently skipped, since
  `<template>` is not available in these namespaces and naked templates are the only option.

In both cases, the `^` binding resolves correctly once the cloned element is placed
in a list instance.
*/
import { settings } from './settings'
import { resizeObserver } from './dom'
import { throttle } from './throttle'
import {
  cloneWithBindings,
  elementToBindings,
  BOUND_CLASS,
  DataBinding,
  tosiValue,
  tosiPath,
  LIST_BINDING_REF,
  LIST_INSTANCE_REF,
  registerArrayIdPath,
  applyDataBinding,
  resolveTakePaths,
} from './metadata'
import { TosiObject, ListBindingOptions } from './xin-types'
import { Listener } from './path-listener'

const SLICE_INTERVAL_MS = 16 // 60fps
const FILTER_INTERVAL_MS = 100 // 10fps

interface VirtualListSlice {
  items: any[]
  firstItem: number
  lastItem: number
  topBuffer: number
  bottomBuffer: number
  // Variable-height mode: deferred buffer calculation after DOM measurement
  interpolation?: {
    t: number
    position: number
    scrollTop: number
    viewportHeight: number
    totalScrollHeight: number
    rowHeight: number
  }
}

function updateRelativeBindings(element: Element, path: string): void {
  const boundElements = Array.from(element.getElementsByClassName(BOUND_CLASS))
  // getElementsByClassName covers descendants only — prepend the element itself
  // if it too is bound (classList.contains, not matches(): no selector to parse)
  if (element.classList.contains(BOUND_CLASS)) {
    boundElements.unshift(element)
  }
  for (const boundElement of boundElements) {
    const bindings = elementToBindings.get(boundElement) as DataBinding[]
    for (const binding of bindings) {
      if (binding.path.startsWith('^')) {
        binding.path = `${path}${binding.path.substring(1)}`
      }
      // a take()'s input paths resolve against the same row as `path`
      resolveTakePaths(binding, path)
      // applyDataBinding passes the binding's stored options through (a
      // nested list binding constructed without them silently loses
      // idPath/virtual/filter, and getListBinding caches the instance so
      // later calls can't repair it) — and computes take() transforms with
      // the ROW's paths, which the old direct toDOM call never could
      applyDataBinding(boundElement as Element, binding, binding.path)
    }
  }
}

// warned once per session about duplicate id-path values in a list binding
let warnedDuplicateListId = false

export class ListBinding {
  boundElement: Element
  listTop: HTMLElement | null
  listBottom: HTMLElement | null
  isNamespaced: boolean
  templates: Element[]
  options: ListBindingOptions
  itemToElement: WeakMap<TosiObject, Element[]>
  private idToElement: Map<string, Element[]> = new Map()
  array: any[] = []
  private _filteredCache?: any[]
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

    // Register idPath for this array to enable id-path touch synthesis
    if (options.idPath != null) {
      const arrayPath = tosiPath(value)
      if (arrayPath != null) {
        registerArrayIdPath(arrayPath, options.idPath)
      }
    }

    const itemsPerRow = options.virtual?.itemsPerRow ?? 1
    // Find the template — its position divides headers (before) from footers (after)
    const templateEl = Array.from(boundElement.children).find(
      (c) => c instanceof HTMLTemplateElement
    ) as HTMLTemplateElement | undefined
    let insertionRef: Element | null = null // where to insert padding/items
    if (templateEl != null) {
      const expectedChildren = itemsPerRow
      if (
        templateEl.content.children.length < 1 ||
        templateEl.content.children.length !== expectedChildren
      ) {
        throw new Error(
          `ListBinding expects a template with exactly ${expectedChildren} child element(s)`
        )
      }
      this.templates = Array.from(templateEl.content.children).map(
        (child) => cloneWithBindings(child) as HTMLElement
      )
      insertionRef = templateEl.nextElementSibling
      templateEl.remove()
    } else if (boundElement.children.length === 1) {
      // Legacy: single non-template child used as the template
      this.templates = [boundElement.children[0] as HTMLElement]
      this.templates[0].remove()
    } else {
      throw new Error(
        'ListBinding expects a <template> child or exactly one child element'
      )
    }
    this.options = options
    const ns = boundElement.namespaceURI
    this.isNamespaced =
      ns === 'http://www.w3.org/2000/svg' ||
      ns === 'http://www.w3.org/1998/Math/MathML'

    if (this.isNamespaced) {
      // SVG/MathML containers cannot hold HTML div elements,
      // so skip virtual list padding entirely
      this.listTop = null
      this.listBottom = null
    } else {
      this.listTop = document.createElement('div')
      this.listBottom = document.createElement('div')
      this.listTop.classList.add('virtual-list-padding')
      this.listBottom.classList.add('virtual-list-padding')
      this.listTop.setAttribute('role', 'presentation')
      this.listBottom.setAttribute('role', 'presentation')
      this.listTop.setAttribute('aria-hidden', 'true')
      this.listBottom.setAttribute('aria-hidden', 'true')
      // Insert padding where the template was — between headers and footers
      if (insertionRef != null) {
        this.boundElement.insertBefore(this.listTop, insertionRef)
        this.boundElement.insertBefore(this.listBottom, insertionRef)
      } else {
        this.boundElement.append(this.listTop)
        this.boundElement.append(this.listBottom)
      }
    }
    if (itemsPerRow > 1) {
      this.boundElement.classList.add('tosi-virtual-grid')
      const style = (this.boundElement as HTMLElement).style
      if (style != null) {
        style.setProperty('--tosi-columns', String(itemsPerRow))
        style.display = style.display || 'grid'
        style.gridTemplateColumns =
          style.gridTemplateColumns || `repeat(var(--tosi-columns), 1fr)`
      }
      if (this.listTop != null && this.listBottom != null) {
        this.listTop.style.gridColumn = `1 / -1`
        this.listBottom.style.gridColumn = `1 / -1`
      }
    }
    // Set default ARIA role for virtual lists if not already specified
    if (options.virtual != null && !this.boundElement.getAttribute('role')) {
      this.boundElement.setAttribute('role', itemsPerRow > 1 ? 'grid' : 'list')
    }
    // @ts-expect-error storing binding ref on element
    this.boundElement[LIST_BINDING_REF] = this
    if (this.isNamespaced && options.virtual != null) {
      console.warn(
        'ListBinding: virtual scrolling is not supported in SVG/MathML containers, ignoring virtual option'
      )
    }
    if (!this.isNamespaced && options.virtual != null) {
      resizeObserver.observe(this.boundElement)
      this._update = throttle(() => {
        this.update(this.array, true)
      }, SLICE_INTERVAL_MS)
      // Always listen to element resize (from ResizeObserver)
      this.boundElement.addEventListener('resize', this._update)
      if (options.virtual.scrollContainer === 'window') {
        window.addEventListener('scroll', this._update)
        window.addEventListener('resize', this._update)
      } else {
        this.boundElement.addEventListener('scroll', this._update)
      }
    }
  }

  filteredArray(): any[] {
    if (this._filteredCache != null) return this._filteredCache
    const { hiddenProp, visibleProp } = this.options
    let visibleArray = this.array
    if (hiddenProp !== undefined) {
      visibleArray = visibleArray.filter((item) => item[hiddenProp] !== true)
    }
    if (visibleProp !== undefined) {
      visibleArray = visibleArray.filter((item) => item[visibleProp] === true)
    }
    if (this.options.filter && this.needle !== undefined) {
      visibleArray = this.options.filter(visibleArray, this.needle)
    }
    this._filteredCache = visibleArray
    return visibleArray
  }

  private visibleSlice(): VirtualListSlice {
    const { virtual } = this.options
    const visibleArray = this.filteredArray()
    let firstItem = 0
    let lastItem = visibleArray.length - 1
    let topBuffer = 0
    let bottomBuffer = 0

    if (virtual != null && this.boundElement instanceof HTMLElement) {
      const width = this.boundElement.offsetWidth
      const useWindowScroll = virtual.scrollContainer === 'window'

      // Viewport height and scroll position
      let viewportHeight: number
      let scrollTop: number

      if (useWindowScroll) {
        viewportHeight = window.innerHeight
        const elementRect = this.boundElement.getBoundingClientRect()
        // scrollTop is how far into the list we've scrolled
        // negative elementRect.top means we've scrolled past the top of the element
        scrollTop = Math.max(0, -elementRect.top)
      } else {
        viewportHeight = this.boundElement.offsetHeight
        scrollTop = this.boundElement.scrollTop
      }

      // Always recalculate visibleColumns from current width so resizing
      // a previously-dimensionless container produces the correct slice
      const visibleColumns =
        virtual.width != null
          ? Math.max(1, Math.floor(width / virtual.width))
          : virtual.visibleColumns ?? 1
      const totalRows = Math.ceil(visibleArray.length / visibleColumns)

      if (virtual.minHeight != null) {
        // Variable-height mode: scroll-fraction interpolation (b8r approach)
        // Total scroll area is fixed at totalRows * minHeight.
        // We interpolate which rows to show based on scroll fraction,
        // then position them using an interpolated offset that smoothly
        // transitions from top-pinned (t=0) to bottom-pinned (t=1).
        const effectiveHeight = virtual.minHeight
        const visibleRows =
          Math.ceil(viewportHeight / effectiveHeight) +
          (virtual.rowChunkSize || 1)
        const visibleItems = visibleColumns * visibleRows
        const totalScrollHeight = totalRows * effectiveHeight
        const maxScrollTop = Math.max(0, totalScrollHeight - viewportHeight)

        const t =
          maxScrollTop > 0
            ? Math.min(1, Math.max(0, scrollTop / maxScrollTop))
            : 0

        // position is the fractional row index at the scroll point
        const maxPosition = Math.max(0, totalRows - visibleRows + 1)
        const position = t * maxPosition
        let topRow = Math.floor(position)
        if (virtual.rowChunkSize) {
          topRow -= topRow % virtual.rowChunkSize
        }

        firstItem = topRow * visibleColumns
        lastItem = firstItem + visibleItems - 1

        // Defer buffer calculation to update() where we can measure
        // actual rendered content height (b8r approach).
        // Set provisional buffers for the early-exit comparison.
        topBuffer = scrollTop
        bottomBuffer = Math.max(
          0,
          totalScrollHeight - scrollTop - viewportHeight
        )

        return {
          items: visibleArray,
          firstItem,
          lastItem,
          topBuffer,
          bottomBuffer,
          interpolation: {
            t,
            position,
            scrollTop,
            viewportHeight,
            totalScrollHeight,
            rowHeight: virtual.height,
          },
        }
      } else {
        // Fixed-height mode: exact pixel-to-row mapping
        const visibleRows =
          Math.ceil(viewportHeight / virtual.height) +
          (virtual.rowChunkSize || 1)
        const visibleItems = visibleColumns * visibleRows
        let topRow = Math.floor(scrollTop / virtual.height)
        if (topRow > totalRows - visibleRows + 1) {
          topRow = Math.max(0, totalRows - visibleRows + 1)
        }
        if (virtual.rowChunkSize) {
          topRow -= topRow % virtual.rowChunkSize
        }

        firstItem = topRow * visibleColumns
        lastItem = firstItem + visibleItems - 1

        topBuffer = topRow * virtual.height
        bottomBuffer = Math.max(
          (totalRows - visibleRows) * virtual.height - topBuffer,
          0
        )
      }
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
      this.update(this.array)
    }
  }, FILTER_INTERVAL_MS)

  update(array?: any[], isSlice?: boolean) {
    if (array == null) {
      array = []
    }
    this.array = array
    if (!isSlice) this._filteredCache = undefined

    const { hiddenProp, visibleProp } = this.options
    const arrayPath: string = tosiPath(array) as string

    const slice = this.visibleSlice()
    this.boundElement.classList.toggle(
      '-xin-empty-list',
      slice.items.length === 0
    )
    // Announce total item count to assistive tech for virtual lists
    if (this.options.virtual != null) {
      this.boundElement.setAttribute(
        'aria-rowcount',
        String(slice.items.length)
      )
    }
    const previousSlice = this._previousSlice
    const { firstItem, lastItem, topBuffer, bottomBuffer } = slice
    const sliceUnchanged =
      hiddenProp === undefined &&
      visibleProp === undefined &&
      isSlice === true &&
      previousSlice != null &&
      firstItem === previousSlice.firstItem &&
      lastItem === previousSlice.lastItem
    if (
      sliceUnchanged &&
      slice.interpolation == null &&
      topBuffer === previousSlice!.topBuffer &&
      bottomBuffer === previousSlice!.bottomBuffer
    ) {
      return
    }
    // Variable-height mode: slice unchanged but buffers need updating
    if (sliceUnchanged && slice.interpolation != null) {
      this._updateInterpolatedBuffers(slice)
      return
    }
    this._previousSlice = slice

    let removed = 0
    let moved = 0
    let created = 0

    const { idPath } = this.options
    const itemsPerRow = this.options.virtual?.itemsPerRow ?? 1

    // Build a set of visible ids for the removal phase
    let visibleIds: Set<string> | undefined
    if (idPath != null) {
      visibleIds = new Set()
      for (let i = firstItem; i <= lastItem; i++) {
        const item = slice.items[i]
        if (item !== undefined) {
          visibleIds.add(String(item[idPath]))
        }
      }
    }

    // Track which items we've already processed for removal (avoids
    // removing the same group multiple times when itemsPerRow > 1)
    const removedProxies = new Set()
    for (const element of Array.from(this.boundElement.children)) {
      if (element === this.listTop || element === this.listBottom) {
        continue
      }
      // @ts-expect-error if it's there it's there
      const proxy = element[LIST_INSTANCE_REF]
      if (proxy == null) {
        // Static content (e.g. pinned header rows) — leave it alone
        continue
      } else if (proxy === true) {
        // Scalar list item — no identity tracking, always remove and rebuild
        element.remove()
        removed++
      } else {
        if (removedProxies.has(proxy)) continue
        let shouldRemove: boolean
        if (idPath != null) {
          shouldRemove = !visibleIds!.has(String(proxy[idPath]))
        } else {
          const idx = slice.items.indexOf(proxy)
          shouldRemove = idx < firstItem || idx > lastItem
        }
        if (shouldRemove) {
          removedProxies.add(proxy)
          const group = this.itemToElement.get(proxy)
          if (group != null) {
            for (const el of group) el.remove()
          } else {
            element.remove()
          }
          this.itemToElement.delete(proxy)
          if (idPath != null) {
            this.idToElement.delete(String(proxy[idPath]))
          }
          removed++
        }
      }
    }

    if (this.listTop != null && this.listBottom != null) {
      this.listTop.style.height = String(topBuffer) + 'px'
      this.listBottom.style.height = String(bottomBuffer) + 'px'
    }

    // build a complete new set of elements in the right order
    const elements: Element[] = []
    const seenIds = idPath != null ? new Set<string>() : null
    for (let i = firstItem; i <= lastItem; i++) {
      const item = slice.items[i]
      if (item === undefined) {
        continue
      }
      if (seenIds != null && idPath != null) {
        // duplicate idPath values silently collapse to one row (both items
        // map to the same element group) — warn once rather than lose data
        // without a trace
        const id = String(item[idPath])
        if (seenIds.has(id)) {
          if (!warnedDuplicateListId) {
            warnedDuplicateListId = true
            console.error(
              `tosijs list binding: duplicate idPath value "${id}" (idPath: "${idPath}"). ` +
                'id-path values must be unique — items sharing an id collapse to a single ' +
                'row and updates target the wrong item. Warned once per session.'
            )
          }
        } else {
          seenIds.add(id)
        }
      }
      let group = this.itemToElement.get(tosiValue(item))
      // When WeakMap misses (new object ref) but idPath matches an
      // existing element group, reuse it and augment the WeakMap
      if (group == null && idPath != null) {
        const id = String(item[idPath])
        group = this.idToElement.get(id)
        if (group != null) {
          const rawItem = tosiValue(item)
          this.itemToElement.set(rawItem, group)
          for (const el of group) {
            // @ts-expect-error storing binding ref on element
            el[LIST_INSTANCE_REF] = rawItem
          }
        }
      }
      if (group == null) {
        created++
        const rawItem = tosiValue(item)
        group = this.templates.map(
          (tmpl) => cloneWithBindings(tmpl) as HTMLElement
        )
        if (typeof item === 'object') {
          this.itemToElement.set(rawItem, group)
        }
        // Always mark list-created elements so the removal phase can
        // distinguish them from static content (e.g. pinned header rows)
        for (const el of group) {
          // @ts-expect-error storing binding ref on element
          el[LIST_INSTANCE_REF] = typeof item === 'object' ? rawItem : true
        }
        for (const el of group) {
          if (this.listBottom != null) {
            this.boundElement.insertBefore(el, this.listBottom)
          } else {
            this.boundElement.append(el)
          }
        }
        if (idPath != null) {
          const idValue = item[idPath] as string
          const itemPath = `${arrayPath}[${idPath}=${idValue}]`
          for (const el of group) updateRelativeBindings(el, itemPath)
          this.idToElement.set(String(idValue), group)
        } else {
          const itemPath = `${arrayPath}[${i}]`
          for (const el of group) updateRelativeBindings(el, itemPath)
        }
      }
      // Update ARIA attributes for virtual lists
      if (this.options.virtual != null) {
        const rowIndex = String(i + 1)
        if (itemsPerRow > 1) {
          for (let col = 0; col < group.length; col++) {
            const el = group[col]
            el.setAttribute('role', 'gridcell')
            el.setAttribute('aria-rowindex', rowIndex)
            el.setAttribute('aria-colindex', String(col + 1))
          }
        } else {
          for (const el of group) {
            el.setAttribute('role', 'listitem')
            el.setAttribute('aria-rowindex', rowIndex)
          }
        }
      }
      elements.push(...group)
    }

    // make sure all the elements are in the DOM and in the correct location.
    // The anchor starts at listTop (not null): in an ordinary (HTML) list the
    // first item's previousElementSibling is listTop, so a null anchor judged
    // every first item "moved" and the comparison cascaded — every element was
    // re-inserted on every update (killing focus/selection in list inputs and
    // restarting animations), even for a no-op touch. In the SVG/MathML
    // (namespaced) case listTop is null (no <template>/padding elements), and
    // the null anchor remains correct. (HTML-table list containers are not
    // supported.)
    let insertionPoint: Element | null = this.listTop
    for (const element of elements) {
      if (element.previousElementSibling !== insertionPoint) {
        moved++
        if (insertionPoint?.nextElementSibling != null) {
          this.boundElement.insertBefore(
            element,
            insertionPoint.nextElementSibling
          )
        } else if (this.listBottom != null) {
          this.boundElement.insertBefore(element, this.listBottom)
        } else {
          this.boundElement.append(element)
        }
      }
      insertionPoint = element
    }

    // Variable-height mode: compute final buffer positions from measured heights
    if (slice.interpolation != null) {
      this._updateInterpolatedBuffers(slice)
    }

    if (settings.perf) {
      console.log(arrayPath, 'updated', { removed, created, moved })
    }
  }

  private _updateInterpolatedBuffers(slice: VirtualListSlice): void {
    const {
      t,
      position,
      scrollTop,
      viewportHeight,
      totalScrollHeight,
      rowHeight,
    } = slice.interpolation!

    // Measure actual rendered content height from DOM
    let renderedHeight = 0
    for (const child of Array.from(this.boundElement.children)) {
      if (child === this.listTop || child === this.listBottom) continue
      renderedHeight += (child as HTMLElement).offsetHeight || rowHeight
    }

    // b8r formula: interpolate between pinning to top and bottom
    const pinTop = scrollTop
    const pinBottom = scrollTop + viewportHeight - renderedHeight
    const offset = Math.max(
      0,
      t * pinBottom + (1 - t) * pinTop - (position % 1) * rowHeight
    )

    if (this.listTop != null && this.listBottom != null) {
      this.listTop.style.height = String(offset) + 'px'
      this.listBottom.style.height =
        String(Math.max(0, totalScrollHeight - offset - renderedHeight)) + 'px'
    }
  }
}

interface ListBoundElement extends Element {
  [LIST_BINDING_REF]?: ListBinding
}

export const getListBinding = (
  boundElement: ListBoundElement,
  value?: any[],
  options?: ListBindingOptions
): ListBinding | undefined => {
  let listBinding = boundElement[LIST_BINDING_REF]
  if (value && listBinding === undefined) {
    listBinding = new ListBinding(boundElement, value, options)
    boundElement[LIST_BINDING_REF] = listBinding
  }
  return listBinding
}

type PossiblyBoundElement = Element & {
  [LIST_BINDING_REF]?: ListBinding
  [LIST_INSTANCE_REF]?: ListBinding
}

export const getListInstance = (
  element: Element
): { element: Element; item: any } | undefined => {
  let item: any
  while (
    !(item = (element as PossiblyBoundElement)[LIST_INSTANCE_REF]) &&
    element &&
    element.parentElement
  ) {
    element = element.parentElement
  }
  return item ? { element, item } : undefined
}

export const getListItem = (element: Element): any => {
  const instance = getListInstance(element)
  return instance ? instance.item : undefined
}

export const deleteListItem = (element: Element): boolean => {
  const instance = getListInstance(element)
  if (!instance) {
    console.error(
      'deleteListItem failed, element is not part of a list instance',
      element
    )
    return false
  }
  const binding = getListBinding(instance.element.parentElement!)!
  if (!binding.options.idPath) {
    console.error(
      'deleteListItem failed, list binding has no idPath',
      element.parentElement,
      binding
    )
    return false
  }
  const index = binding.array.indexOf(instance.item)
  if (index > -1) {
    binding.array.splice(index, 1)
    return true
  }
  return false
}

const POSITION_TO_BLOCK: Record<string, ScrollLogicalPosition> = {
  start: 'start',
  middle: 'center',
  end: 'end',
  nearest: 'nearest',
}

export const scrollListItemIntoView = (
  element: Element,
  item: any,
  options: {
    position?: 'start' | 'middle' | 'end' | 'nearest'
    behavior?: ScrollBehavior
  } = {}
): boolean => {
  const binding = getListBinding(element)
  if (binding == null) {
    console.error(
      'scrollListItemIntoView failed, element has no list binding',
      element
    )
    return false
  }

  const { position = 'middle', behavior = 'smooth' } = options
  const filtered = binding.filteredArray()
  const rawItem = tosiValue(item) ?? item
  const index = filtered.indexOf(rawItem)
  if (index === -1) {
    console.error('scrollListItemIntoView failed, item not found in list', item)
    return false
  }

  const { virtual } = binding.options

  if (virtual != null && element instanceof HTMLElement) {
    const visibleColumns =
      virtual.width != null
        ? Math.max(1, Math.floor(element.offsetWidth / virtual.width))
        : virtual.visibleColumns ?? 1
    const itemRow = Math.floor(index / visibleColumns)
    const effectiveHeight = virtual.minHeight ?? virtual.height
    const totalRows = Math.ceil(filtered.length / visibleColumns)

    const useWindowScroll = virtual.scrollContainer === 'window'
    const viewportHeight = useWindowScroll
      ? window.innerHeight
      : element.offsetHeight

    let scrollTarget: number

    if (virtual.minHeight != null) {
      // Variable-height mode: convert row to scroll fraction
      const visibleRows =
        Math.ceil(viewportHeight / effectiveHeight) +
        (virtual.rowChunkSize || 1)
      const totalScrollHeight = totalRows * effectiveHeight
      const maxScrollTop = Math.max(0, totalScrollHeight - viewportHeight)
      const maxTopRow = Math.max(1, totalRows - visibleRows + 1)
      const itemFraction = itemRow / maxTopRow

      switch (position) {
        case 'start':
          scrollTarget = itemFraction * maxScrollTop
          break
        case 'end':
          scrollTarget = Math.max(
            0,
            ((itemRow - visibleRows + 1) / maxTopRow) * maxScrollTop
          )
          break
        case 'nearest': {
          const currentScroll = useWindowScroll
            ? Math.max(0, -element.getBoundingClientRect().top)
            : element.scrollTop
          const currentFraction =
            maxScrollTop > 0 ? currentScroll / maxScrollTop : 0
          const currentTopRow = Math.floor(currentFraction * maxTopRow)
          if (itemRow < currentTopRow) {
            scrollTarget = itemFraction * maxScrollTop
          } else if (itemRow >= currentTopRow + visibleRows) {
            scrollTarget = Math.max(
              0,
              ((itemRow - visibleRows + 1) / maxTopRow) * maxScrollTop
            )
          } else {
            return true // already visible
          }
          break
        }
        default: {
          // middle
          const midRow = itemRow - Math.floor(visibleRows / 2)
          const midFraction = Math.max(0, midRow) / maxTopRow
          scrollTarget = midFraction * maxScrollTop
        }
      }
    } else {
      // Fixed-height mode: exact pixel calculation
      const itemTop = itemRow * virtual.height

      switch (position) {
        case 'start':
          scrollTarget = itemTop
          break
        case 'end':
          scrollTarget = itemTop - viewportHeight + virtual.height
          break
        case 'nearest': {
          const currentScroll = useWindowScroll
            ? Math.max(0, -element.getBoundingClientRect().top)
            : element.scrollTop
          if (itemTop < currentScroll) {
            scrollTarget = itemTop
          } else if (
            itemTop + virtual.height >
            currentScroll + viewportHeight
          ) {
            scrollTarget = itemTop - viewportHeight + virtual.height
          } else {
            return true // already visible
          }
          break
        }
        default: // middle
          scrollTarget = itemTop - (viewportHeight - virtual.height) / 2
      }
    }

    scrollTarget = Math.max(0, scrollTarget)

    if (useWindowScroll) {
      const elementTop = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top: elementTop + scrollTarget, behavior })
    } else {
      element.scrollTo({ top: scrollTarget, behavior })
    }
  } else {
    // Non-virtual: find the DOM element and use native scrollIntoView
    const domGroup = binding.itemToElement.get(rawItem)
    if (domGroup == null || domGroup.length === 0) {
      console.error(
        'scrollListItemIntoView failed, no DOM element found for item',
        item
      )
      return false
    }
    domGroup[0].scrollIntoView({
      block: POSITION_TO_BLOCK[position] ?? 'center',
      behavior,
    })
  }

  return true
}
