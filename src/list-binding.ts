/*{"parent": "binding-to-the-dom", "order": 4, "title": "Array Bindings", "description": "List bindings: surgical updates via id-paths, virtualized rendering for million-row lists, sticky headers, filtering, and grids."}*/
/*#
# Array Bindings and Virtual Lists

The most likely source of complexity and performance issues in applications is
displaying large lists or grids of objects. `tosijs` provides robust support
for handling this efficiently.

## `.tosi.listBinding()`

The simplest way to bind an array is with `.tosi.listBinding()`. It takes a template builder function that receives
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

And here is the same thing at scale: a few thousand emoji, in a **virtual** list,
so only the rows on screen exist. [Virtualized Lists](#virtualized-lists) below
explains the options.

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
  ...emojiListExample.array.tosi.listBinding(({div, span}, item) =>
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

You rarely need this form — `.tosi.listBinding()` is more concise and type-safe.

Even better, `templateBuilder()` is passed the `elements` proxy and a placeholder `BoxedProxy` of
the array's type, supporting autocompletion of property names within the template.

### id-paths

**id-paths** are a wrinkle in `tosijs` paths specifically there to make list-binding more efficient.
This is because in many cases you will encounter large arrays of objects, each with a unique id somewhere, e.g. it might be `id` or `uid`
or even buried deeper…

    const { messages } = tosi({ messages: [
      {
        id: '1234abcd',
        title: 'hello',
        body: 'hello there!'
      },
      …
    ] })

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
import { tosi, elements, boxed, updates } from 'tosijs'
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
        value: boxed.nestedListDoc.groups,
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

**A list of more than 10 items must virtualize or say why.** Without `virtual`
or a `nonVirtualReason` (e.g. `{ nonVirtualReason: 'fixed list of 12 months' }`)
it logs one warning naming the list, its size and both fixes. See
[bindings](/bindings/) for the details.

    ...emojiListExample.array.tosi.listBinding(({ div }, item) => div(item.name), {
      idPath: 'name',
      virtual: {
        height: 30,
        rowChunkSize: 3,
      },
    })

**A virtual list needs somewhere to scroll.** The bound element is the scroll
container, so give it a height and `overflow: auto` (the example below uses
`height: calc(100% - 36px); overflow: auto`). An element that simply grows to
fit its content has nothing to virtualize against. To scroll with the page
instead, see **Window Scroll Container** below.

The full set of `virtual` options is `height`, `width`, `minHeight`,
`rowChunkSize`, `visibleColumns`, `itemsPerRow` and `scrollContainer`; each is
covered in its section on this page.

Simply add a `virtual` property to the list-binding specifying the row `height`
and the list will be `virtualized` (meaning that only visible elements will be rendered,
missing elements being replaced by a single padding element above and below the list).
For variable-height items, add `minHeight` — see **Variable-Height Items** below.

You can (optionally) specify `rowChunkSize` to virtualize the list in chunks of rows to allow
consistent `:nth-child()` styling.

Now you can trivially bind an array of a million objects to the DOM and have it scroll at
120fps.

The emoji table near the top of this page is exactly this: `virtual: { height: 30,
rowChunkSize: 3 }` on a container with a fixed height and `overflow: auto`.

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
  ...bigBindTest.tosi.listBinding(
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
  ...gridDemo.tosi.listBinding(
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

If your list items have varying heights, add `minHeight` (the smallest an
item will be) to `height` (a typical item). Items then render at their
**natural height**.

- **Content moves exactly with the scroll**, and rows that come and go off
  screen never move the rows you are looking at.
- **The scroll area is an estimate** of the rows not built, using the average
  height of the rows measured so far (`height` until there are some). So the
  scrollbar thumb can change size a little as you scroll; the content does not
  jump.
- After a jump (dragging the thumb), rows are placed by that estimate, and
  scrolling back up absorbs the difference gradually, so the first item still
  arrives flush with the top.
- `minHeight` decides how many rows to build, so a smaller value builds more.
- An item that changes height (say, a row that expands) pushes the rows below
  it down; the rows above stay put.
- The list sets `overflow-anchor: none` on its container, because the
  browser's own scroll anchoring would fight it.

    ...myArray.tosi.listBinding(({ div }, item) => div(item.name), {
      idPath: 'id',
      virtual: {
        height: 40,
        minHeight: 30,
      },
    })

```js
import { elements, tosi, scrollListItemIntoView } from 'tosijs'
import { tosiSegmented } from 'tosijs-ui'

// Heights vary a lot, and most items are well over minHeight: the hard case.
// Scroll slowly and watch an item; it should move exactly with your finger.
const sentence = 'Each item is as tall as its text, so heights vary a lot. '
const longList = Array.from({ length: 2000 }, (_, i) => ({
  id: i,
  label: `Item #${i}`,
  description: sentence.repeat((i * 37) % 9),
}))
// The other edge: barely more than fits, and one item taller than the view.
const shortList = Array.from({ length: 6 }, (_, i) => ({
  id: `short-${i}`,
  label: `Short #${i}`,
  description: sentence.repeat(i === 2 ? 60 : 1),
}))

const { varHeightExample } = tosi({ varHeightExample: { items: longList } })

const { div, span, button } = elements

const list = div(
  {
    class: 'var-height-list',
  },
  ...varHeightExample.items.tosi.listBinding(
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
        height: 80,
        minHeight: 30,
      },
    }
  )
)

// one button each for the first, middle and last item of the current list
const lists = { long: longList, short: shortList }
const positions = [0, 0.5, 1]
const jumpButtons = positions.map((fraction) =>
  button({
    onClick() {
      const items = varHeightExample.items.value
      const index = Math.round(fraction * (items.length - 1))
      scrollListItemIntoView(list, items[index], {
        position: fraction === 1 ? 'end' : 'start',
      })
    },
  })
)
const label = (items) => {
  positions.forEach((fraction, i) => {
    jumpButtons[i].textContent = `#${Math.round(fraction * (items.length - 1))}`
  })
}
label(longList)

preview.append(
  div(
    { class: 'var-height-demo' },
    list,
    div(
      { class: 'scroll-buttons' },
      ...jumpButtons,
      tosiSegmented({
        choices: 'long=2000 items, short=6 items',
        value: 'long',
        onChange(event) {
          const items = lists[event.target.value]
          varHeightExample.items.value = items
          label(items)
        },
      }),
    ),
  ),
)
```
```css
.var-height-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.var-height-demo .scroll-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  padding: 4px;
}
.var-height-list {
  flex: 1 1 0;
  min-height: 0;
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
    })

If the list binding's options provide a `filter` function and a `needle` (proxy or path) then
the list will be filtered using the function via throttled updates.

**This is the way to filter or sort a bound list.** The list stays bound to the
array itself, so each row keeps its path: its bindings show the item, and edits
in a row are written back to the item. The filter runs again when the array or
the needle changes, at most ten times a second.

Do not bind a list to `array.tosi.as(needle, fn)` instead. [`.tosi.as()`](/xin/#proxytosiastransformation)
transforms one value on its way to one element. It hands the list a new array
that has no path, so the rows cannot be bound to their items, and it is not
throttled. Use `.tosi.as()` for what is shown *about* the list (a count, a
disabled button) and for computing the `needle`.

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
    ...filterListExample.array.tosi.listBinding(
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

> `deleteListItem()` requires that the list binding specifies a valid `idPath`.
> Without one it logs an error and returns `false`; it does not throw.

### Removing a row: which function, and what it costs

There are three ways to remove a row, and they all do the same thing underneath:
splice the item out of the array through the proxy.

| you have | use |
| --- | --- |
| a DOM element in the row (a click handler's `event.target`) | `deleteListItem(element)` |
| the item's id, or another field value | `array.tosi.listRemove((item) => item.id, id)` |
| the index | `array.splice(index, 1)` |

**What it costs in the DOM**, measured on a 200-row list with an `idPath`:
one row element is removed, no other row is created or moved, and each of the
199 rows still rendered has its bindings applied again. (Changing one field of
one item, by contrast, touches one element.) So removal is proportional to the
number of rows that *exist*, which is the practical reason to make a long list
`virtual`: only the rows on screen exist, however long the array is.

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
    const item = app.items.tosi.listFind((item) => item.id, 'abc')

    // Find by DOM element (e.g. in a click handler)
    const item = app.items.tosi.listFind(clickedElement)

    // Upsert — update in place (preserving object identity) or push
    app.items.tosi.listUpdate((item) => item.id, { id: 'abc', name: 'New Name' })

    // Remove by field match
    app.items.tosi.listRemove((item) => item.id, 'abc')

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
  // Variable-height mode: the spacers are set after the rows are measured
  interpolation?: {
    scrollTop: number
    viewportHeight: number
    totalRows: number
    columns: number
    // initial: no layout yet; scroll: overlaps the built rows; jump: does
    // not (estimated from the last layout); bottom: a jump to the end
    mode: 'initial' | 'scroll' | 'jump' | 'bottom'
  }
}

/*
 * VARIABLE-HEIGHT LAYOUT (#3302, #3230).
 *
 * The built rows sit between two spacers. Between rebuilds the spacers do not
 * change, so the rows move exactly with the scroll. When rows are added or
 * removed, a row that stays built keeps its screen position (the top spacer
 * absorbs the heights of the rows that came and went). Rows not built are
 * estimated at the average measured row height.
 *
 * The top spacer is exact (the measured heights of the rows above) until a
 * jump — a scroll that leaves the built rows behind, like dragging the thumb —
 * places rows by estimate. After that, scrolling up spreads the error over the
 * distance left to the top, so the first row arrives flush at scrollTop 0
 * without a jump and without writing scrollTop (which kills momentum on iOS).
 * The bottom needs no correction: its spacer is re-estimated on every
 * rebuild, and is 0 once the last row is built. This keeps b8r's idea, pinned
 * to the top at the top and to the bottom at the bottom, but corrects the
 * previous layout instead of recomputing an absolute position each time.
 */
interface VariableLayout {
  top: number // where row `first` starts, in the list's scroll coordinates
  T: number // top spacer height
  B: number // bottom spacer height
  first: number // first built row
  edges: number[] // built rows' tops relative to `top`, then their bottom
  S: number // scrollTop at this layout
  exact: boolean // T is the measured height of the rows above
}

interface LayoutAnchor {
  el: HTMLElement
  offset: number // its top relative to the built rows' top
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

/*
 * LONG LISTS MUST SAY HOW THEY SCALE (owner, 2026-10-03).
 *
 * An unvirtualized list binding keeps one live, bound DOM subtree per item and
 * updates them all; past a handful of items that is the commonest way a tosijs
 * page gets slow, and nothing said so. So a list of more than 10 items must
 * either virtualize or state, in `nonVirtualReason`, why it renders them all.
 * The warning is advice (settings.quiet silences it), once per list, and says
 * exactly what to write.
 */
export const NON_VIRTUAL_WARN_THRESHOLD = 10

const describeListElement = (el: Element): string => {
  const id = el.id ? `#${el.id}` : ''
  // the developer's own classes: tosijs's markers (-tosi-data,
  // -xin-empty-list) name nothing they wrote
  const own =
    typeof el.className === 'string'
      ? el.className.split(/\s+/).filter((c) => c && !c.startsWith('-'))
      : []
  const cls = own.length > 0 ? '.' + own.slice(0, 2).join('.') : ''
  return `<${el.tagName.toLowerCase()}${id}${cls}>`
}

const nonVirtualWarning = (
  el: Element,
  array: any[],
  namespaced: boolean
): string => {
  const path = tosiPath(array)
  // no template literal nested in a template literal: tjs convert cannot
  // tokenize one (the debug/safe build failed on it)
  const what = path ? 'list `' + path + '`' : 'a list'
  return (
    `tosijs: ${what} renders all ` +
    `${array.length} items into ${describeListElement(el)}. ` +
    (namespaced
      ? 'SVG cannot virtualize; '
      : 'Virtualize it: { virtual: { height: 32 } } (row px), or ') +
    "if rendering all is deliberate, say why: { nonVirtualReason: '…' }. " +
    'tosijs.net/bindings'
  )
}

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
  private _warnedNonVirtual = false
  // variable-height mode (see VARIABLE-HEIGHT LAYOUT)
  private _layout?: VariableLayout
  private _measuredSum = 0
  private _measuredRows = 0
  private _measuredWidth = -1
  private _relayoutDepth = 0
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
      // A variable-height list keeps its own rows in place; the browser's
      // scroll anchoring (Chromium, Firefox) would move scrollTop as well
      // when the top spacer changes, and the two fight.
      const style = (this.boundElement as HTMLElement).style
      if (
        options.virtual.minHeight != null &&
        options.virtual.scrollContainer !== 'window' &&
        style != null &&
        !style.overflowAnchor
      ) {
        style.overflowAnchor = 'none'
      }
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
        // Variable-height mode: see VARIABLE-HEIGHT LAYOUT. Row counts use
        // minHeight (so enough rows are built); positions use the measured
        // average.
        const minHeight = virtual.minHeight
        const chunk = virtual.rowChunkSize || 1
        const estimate = this._rowEstimate()
        // rubber-band overscroll (iOS) reports scrollTop beyond the content
        const maxS =
          (useWindowScroll
            ? this.boundElement.offsetHeight
            : this.boundElement.scrollHeight) - viewportHeight
        const S = Math.max(0, maxS > 0 ? Math.min(scrollTop, maxS) : scrollTop)
        const viewRows = Math.ceil(viewportHeight / minHeight) + chunk
        const maxRow = totalRows - 1
        const prev = this._layout
        let first: number
        let last: number
        let mode: 'initial' | 'scroll' | 'jump' | 'bottom'

        // nothing measurable (hidden, or no layout engine): don't extend
        // the slice from geometry that isn't there; start over instead
        if (
          prev == null ||
          prev.first > maxRow ||
          prev.edges[prev.edges.length - 1] <= 0
        ) {
          mode = 'initial'
          first = S <= 0 ? 0 : Math.floor(S / estimate)
          last = first + viewRows
        } else {
          const { top: blockTop, edges } = prev
          const builtRows = edges.length - 1
          const blockBottom = blockTop + edges[builtRows]
          const lo = S - minHeight
          const hi = S + viewportHeight + minHeight
          if (
            hi < blockTop - viewportHeight ||
            lo > blockBottom + viewportHeight
          ) {
            // the built rows are nowhere near: place by estimate
            if (S <= 0) {
              mode = 'jump'
              first = 0
            } else if (maxS > 0 && S >= maxS - 1) {
              mode = 'bottom'
              first = Math.max(0, maxRow - viewRows)
            } else {
              mode = 'jump'
              first = prev.first + Math.round((S - prev.top) / estimate)
            }
            last = first + viewRows
          } else {
            mode = 'scroll'
            first = prev.first
            if (blockTop > lo && first > 0) {
              first = Math.max(
                0,
                first - Math.ceil((blockTop - lo) / minHeight)
              )
            } else {
              let r = 0
              while (r < builtRows - 1 && blockTop + edges[r + 1] <= lo) {
                r++
              }
              first += r
            }
            const lastBuilt = prev.first + builtRows - 1
            if (blockBottom < hi) {
              last = lastBuilt + Math.ceil((hi - blockBottom) / minHeight)
            } else {
              let r = builtRows - 1
              while (r > 0 && blockTop + edges[r] >= hi) r--
              last = prev.first + r
            }
          }
        }
        first = Math.max(0, Math.min(first, maxRow))
        if (chunk > 1) first -= first % chunk
        last = Math.max(first, Math.min(last, maxRow))
        if (chunk > 1)
          last = Math.min(maxRow, last + chunk - 1 - (last % chunk))

        return {
          items: visibleArray,
          firstItem: first * visibleColumns,
          lastItem: totalRows === 0 ? -1 : (last + 1) * visibleColumns - 1,
          // the spacers are set by _layoutVariable once rows are measured
          topBuffer: prev?.T ?? 0,
          bottomBuffer: prev?.B ?? 0,
          interpolation: {
            scrollTop: S,
            viewportHeight,
            totalRows,
            columns: visibleColumns,
            mode,
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
    if (
      array.length > NON_VIRTUAL_WARN_THRESHOLD &&
      !this._warnedNonVirtual &&
      this.options.virtual == null &&
      !this.options.nonVirtualReason
    ) {
      this._warnedNonVirtual = true
      if (settings.quiet !== true) {
        console.warn(
          nonVirtualWarning(this.boundElement, array, this.isNamespaced)
        )
      }
    }
    if (!isSlice) this._filteredCache = undefined

    const { hiddenProp, visibleProp } = this.options
    const arrayPath: string = tosiPath(array) as string

    const slice = this.visibleSlice()
    const isEmpty = slice.items.length === 0
    this.boundElement.classList.toggle('-tosi-empty-list', isEmpty)
    // the pre-1.10.9 name, kept until 2.0 so existing stylesheets keep working
    this.boundElement.classList.toggle('-xin-empty-list', isEmpty)
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
    // Variable-height mode: same rows; only the drift correction can apply
    if (sliceUnchanged && slice.interpolation != null) {
      this._layoutVariable(slice, null, false)
      return
    }
    this._previousSlice = slice

    // Variable-height mode: remember where a row that stays built is now
    const anchor = slice.interpolation != null ? this._findAnchor(slice) : null
    // ...and keep the content from getting shorter while rows are swapped:
    // the browser clamps scrollTop the moment it does, before the top
    // spacer grows to make up for the rows removed above (this stalled
    // scrolling short of the end). _layoutVariable sets the real height.
    if (anchor != null && this.listBottom != null && this._layout != null) {
      const { B, edges } = this._layout
      const V = slice.interpolation!.viewportHeight
      this.listBottom.style.height =
        String(B + edges[edges.length - 1] + V) + 'px'
    }

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

    // (variable-height spacers are set by _layoutVariable, after measuring)
    if (
      this.listTop != null &&
      this.listBottom != null &&
      slice.interpolation == null
    ) {
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

    // Variable-height mode: set the spacers from the measured rows
    if (slice.interpolation != null) {
      this._layoutVariable(slice, anchor, true)
    }

    if (settings.perf) {
      console.log(arrayPath, 'updated', { removed, created, moved })
    }
  }

  // the average measured row height; virtual.height until a row is measured
  private _rowEstimate(): number {
    return this._measuredRows > 0
      ? this._measuredSum / this._measuredRows
      : this.options.virtual!.height
  }

  // the first element of each built row, in order
  private _builtRows(columns: number): HTMLElement[] {
    const perRow = columns * this.templates.length
    const rows: HTMLElement[] = []
    let n = 0
    for (
      let el = this.listTop!.nextElementSibling;
      el != null && el !== this.listBottom;
      el = el.nextElementSibling
    ) {
      if (n++ % perRow === 0) rows.push(el as HTMLElement)
    }
    return rows
  }

  // A row built now that the new slice keeps, and where it is. (After the
  // array itself changed this may be a different item; whichever element
  // it is, keeping it in place is right if it survives, and is checked.)
  private _findAnchor(slice: VirtualListSlice): LayoutAnchor | null {
    const prev = this._layout
    if (prev == null) return null
    const { columns } = slice.interpolation!
    const first = Math.floor(slice.firstItem / columns)
    const el =
      this._builtRows(columns)[Math.max(first, prev.first) - prev.first]
    return el == null
      ? null
      : {
          el,
          offset:
            el.getBoundingClientRect().top -
            this.listTop!.getBoundingClientRect().bottom,
        }
  }

  private _layoutVariable(
    slice: VirtualListSlice,
    anchor: LayoutAnchor | null,
    rebuilt: boolean
  ): void {
    const { listTop, listBottom, boundElement } = this
    if (listTop == null || listBottom == null) return
    const {
      scrollTop: S,
      viewportHeight: V,
      totalRows,
      columns,
      mode,
    } = slice.interpolation!
    const prev = this._layout

    // heights depend on width: a new width invalidates what was learned
    const width = (boundElement as HTMLElement).offsetWidth
    if (width !== this._measuredWidth) {
      this._measuredWidth = width
      this._measuredSum = 0
      this._measuredRows = 0
    }

    // measure the built rows: their tops, then the bottom of the last
    const topRect = listTop.getBoundingClientRect()
    const base = topRect.bottom
    const edges = this._builtRows(columns).map(
      (el) => el.getBoundingClientRect().top - base
    )
    const R = listBottom.getBoundingClientRect().top - base
    edges.push(R)
    const first = Math.floor(slice.firstItem / columns)
    const lastRow = first + edges.length - 2
    // where listTop starts in the list's scroll coordinates (headers above it)
    const boundRect = boundElement.getBoundingClientRect()
    let header = topRect.top - boundRect.top
    if (this.options.virtual!.scrollContainer !== 'window') {
      header += boundElement.scrollTop - boundElement.clientTop
    }

    let estimate = this._rowEstimate()
    let T = prev?.T ?? 0
    let exact = prev?.exact ?? true
    if (prev == null || mode === 'initial') {
      T = first * estimate
      exact = first === 0
    } else if (!rebuilt) {
      // same rows: the spacers stay, so the rows move with the scroll
    } else if (anchor?.el.parentNode === boundElement) {
      // the anchor row keeps its place: T absorbs the rows that came and went
      T += anchor.offset - (anchor.el.getBoundingClientRect().top - base)
    } else {
      T =
        mode === 'bottom'
          ? S + V - R - header
          : T + (first - prev.first) * estimate
      exact = false
    }

    // spread an estimated top spacer's error over the distance left to the top
    if (!exact && prev != null && S < prev.S && prev.S > 0) {
      T -= ((T - first * estimate) * (prev.S - S)) / prev.S
    }
    if (first === 0 && (exact || S <= 0)) {
      T = 0
      exact = true
    }
    T = Math.max(0, T)

    // learn the heights of rows that were not built at the last layout
    for (let i = 0; i < edges.length - 1; i++) {
      const row = first + i
      const h = edges[i + 1] - edges[i]
      if (
        h > 0 &&
        (prev == null ||
          row < prev.first ||
          row > prev.first + prev.edges.length - 2)
      ) {
        this._measuredSum += h
        this._measuredRows++
        estimate = this._rowEstimate()
      }
    }

    const B = Math.max(0, (totalRows - 1 - lastRow) * estimate)
    listTop.style.height = String(T) + 'px'
    listBottom.style.height = String(B) + 'px'
    const top = header + T
    this._layout = { top, T, B, first, edges, S, exact }

    // estimates can leave the viewport uncovered: build again from here
    if (
      R > 0 &&
      this._relayoutDepth < 3 &&
      ((first > 0 && top > S + 1) ||
        (lastRow < totalRows - 1 && top + R < S + V - 1))
    ) {
      this._relayoutDepth++
      this.update(this.array, true)
      this._relayoutDepth--
    }
  }

  /**
   * Where a row starts, in the list's scroll coordinates, and its height:
   * measured if it is built, estimated from the current layout if not.
   * Variable-height mode only (scrollListItemIntoView).
   */
  _rowPosition(row: number): { top: number; height: number; built: boolean } {
    const estimate = this._rowEstimate()
    const L = this._layout
    if (L == null)
      return { top: row * estimate, height: estimate, built: false }
    const { edges } = L
    const i = row - L.first
    const count = edges.length - 1
    const built = i >= 0 && i < count
    return built
      ? { top: L.top + edges[i], height: edges[i + 1] - edges[i], built }
      : {
          top:
            L.top +
            (i < 0 ? i * estimate : edges[count] + (i - count) * estimate),
          height: estimate,
          built,
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

    const useWindowScroll = virtual.scrollContainer === 'window'
    const viewportHeight = useWindowScroll
      ? window.innerHeight
      : element.offsetHeight

    // where the row is: exact for fixed heights; for variable heights,
    // measured if it is built and estimated if not
    const variable = virtual.minHeight != null
    const place = () =>
      variable
        ? binding._rowPosition(itemRow)
        : { top: itemRow * virtual.height, height: virtual.height, built: true }
    // the scroll position that shows the row as asked; null if already shown
    const target = (): number | null => {
      const { top, height } = place()
      switch (position) {
        case 'start':
          return top
        case 'end':
          return top + height - viewportHeight
        case 'nearest': {
          const currentScroll = useWindowScroll
            ? Math.max(0, -element.getBoundingClientRect().top)
            : element.scrollTop
          if (top < currentScroll) return top
          if (top + height > currentScroll + viewportHeight) {
            return top + height - viewportHeight
          }
          return null
        }
        default: // middle
          return top - (viewportHeight - height) / 2
      }
    }
    const scroll = (top: number, how: ScrollBehavior) => {
      top = Math.max(0, top)
      if (useWindowScroll) {
        const elementTop = element.getBoundingClientRect().top + window.scrollY
        window.scrollTo({ top: elementTop + top, behavior: how })
      } else {
        element.scrollTo({ top, behavior: how })
      }
    }

    // A row that is not built is only an estimate, and a smooth scroll
    // rebuilds the list all the way there, so the estimate goes stale before
    // it arrives (#1999 landed on #1887). Go there instantly, let the list
    // build and measure the row, then scroll to where it really is.
    for (let i = 0; i < 3 && variable && !place().built; i++) {
      const estimate = target()
      if (estimate == null) break
      scroll(estimate, 'instant')
      binding.update(binding.array, true)
    }
    const scrollTarget = target()
    if (scrollTarget == null) return true // already visible
    scroll(scrollTarget, behavior)
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
