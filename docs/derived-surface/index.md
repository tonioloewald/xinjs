# The Derived Surface

<!--{ "parent": "One User Interface", "order": 1, "description": "The wiring diagram tosijs already records, the metadata harvest from element sugar, and describe() assembling the affordance graph — live." }-->

_Part of [One User Interface](/one-user-interface/) — why the agent surface derives from what tosijs already knows._

Your app already wrote its own agent map — every binding and handler tosijs
records is a line in it. Below: a todo list built the ordinary way, and the
**schematic** — the map, drawn — growing as you add items.

## The map, drawn: a schematic embodiment (live)

```css
.preview.split-view {
  display: grid;
  grid-template-columns: 50% 50%;
  gap: 8px;
}

/* app above map on narrow displays */
@media (max-width: 600px) {
  .preview.split-view {
    grid-template-columns: 100%;
  }
}
```

```js
import {
  elements,
  tosi,
  enableAgentInterface,
  schematicSVG,
  rasterizeSVG,
  getListItem,
} from 'tosijs'
import { tosiTabs, icons } from 'tosijs-ui'

const { mapDemo } = tosi({
  mapDemo: {
    newItem: '',
    items: [
      { id: 1, text: 'draw the map', done: true },
      { id: 2, text: 'add more todos', done: false },
    ],
    addItem() {
      const text = mapDemo.newItem.value.trim()
      if (!text) return
      mapDemo.items.push({ id: Math.random(), text, done: false })
      mapDemo.newItem = ''
    },
  },
})
const agent = globalThis.tosiAgent ?? enableAgentInterface({ expose: 'all' })
const { div, input, button, ul, pre, img } = elements

// an ordinary todo list — each row's checkbox and label are WIRED, so every
// item is part of the map, and the map grows as the list does
preview.append(
  div(
    input({
      placeholder: 'add a todo…',
      bindValue: mapDemo.newItem,
      // Enter COMMITS the field — change fires after the binding writes
      // state, so addItem acts on committed state, mutates atomically, and
      // the UI catches up on its own. (Acting on keydown instead means
      // racing the commit — the classic clear-that-doesn't.) The PROXY form:
      // resolves live by path, and the map names it just like the string
      onChange: mapDemo.addItem,
    }),
    ' ',
    // another PRECONDITION: nothing to add = nothing to press (an
    // observant transform — the button follows the field)
    button('add', {
      onClick: 'mapDemo.addItem',
      disabled: mapDemo.newItem.tosi.take((text) => text.trim() === ''),
    }),
    ul(
      { style: { maxHeight: '10em', overflow: 'auto', margin: 0 } },
      ...mapDemo.items.listBinding(
        ({ li, input: check, span, button }, item) =>
          li(
            check({ type: 'checkbox', bindValue: item.done }),
            ' ',
            span(item.text),
            ' ',
            // an icon-only affordance: `title` gives it its NAME (harvested
            // the way a screen reader reads it), and an observant transform
            // makes checked-ness a PRECONDITION — watch the delete button
            // fade in and out of the map as you toggle its todo
            button(icons.x(), {
              title: 'delete',
              disabled: item.done.tosi.take((done) => !done),
              onClick(event) {
                const row = getListItem(event.target.closest('li'))
                mapDemo.items.listRemove((i) => i.id, row.id)
              },
            })
          ),
        { idPath: 'id' }
      )
    )
  )
)

// four live views in tabs — the selected one redraws on every state
// change: the map follows the app, hands off
const detail = pre({ style: { maxHeight: '8em', overflow: 'auto', margin: 0 } })
const pane = (name) =>
  div({ name, style: { overflow: 'auto', height: '100%' } })
const panes = [
  // what an agent's vision encoder receives: map -> SVG -> raster, 2× —
  // the default view, because it's the one that has to stand alone
  pane('image'),
  // scoped by HIERARCHY: this demo's subtree (a within-rect is REGIONAL)
  pane('schematic'),
  // the camera: what the USER sees right now, in screen coordinates
  pane('screen'),
  // the atlas: the ENTIRE host app, chrome and all (best maximized)
  pane('whole page'),
]
const tabs = tosiTabs(
  { style: { flex: '1 1 auto', minHeight: '160px' } },
  ...panes
)

// display fit + click-to-inspect (the image is an index: data-record links
// each box to its JSON record)
const show = (target, d) => {
  target.innerHTML = schematicSVG(d, { index: true })
  const svg = target.querySelector('svg')
  if (svg) {
    svg.setAttribute('width', '100%')
    svg.removeAttribute('height')
  }
  target.onclick = (event) => {
    const g = event.target.closest('[data-record]')
    if (g) {
      detail.textContent = JSON.stringify(
        d.wiring[Number(g.dataset.record)],
        null,
        2
      )
    }
  }
}

let rasterBusy = false
const render = [
  async () => {
    if (rasterBusy) return // rasterization is async — never overlap ticks
    rasterBusy = true
    try {
      const d = agent.describe({ styles: true, scope: preview })
      const svg = schematicSVG(d, { index: true })
      const blob = await rasterizeSVG(svg, { scale: 2 })
      // update the ONE img in place — the old frame stays up until the new
      // src decodes, so the view never flickers
      let shot = panes[0].querySelector('img')
      if (!shot) {
        shot = img({ style: { maxWidth: '100%' } })
        panes[0].append(shot)
      }
      const prior = shot.src
      shot.src = URL.createObjectURL(blob)
      if (prior) URL.revokeObjectURL(prior)
    } finally {
      rasterBusy = false
    }
  },
  () => show(panes[1], agent.describe({ styles: true, scope: preview })),
  () => show(panes[2], agent.describe({ styles: true, view: 'viewport' })),
  () => show(panes[3], agent.describe({ styles: true })),
]
// no polling: the drawing is an OBSERVER — any state change (or focus
// move, which state can't see) redraws the selected view, debounced a beat
const redraw = { timer: 0 }
const requestRedraw = () => {
  clearTimeout(redraw.timer)
  redraw.timer = setTimeout(() => {
    if (tabs.isConnected) render[tabs.value ?? 0]()
  }, 100)
}
const off = agent.observe(/./, requestRedraw)
document.addEventListener('focusin', requestRedraw)
tabs.addEventListener('change', requestRedraw)
const cleanup = setInterval(() => {
  if (!tabs.isConnected) {
    off()
    document.removeEventListener('focusin', requestRedraw)
    clearInterval(cleanup)
  }
}, 2000)
requestRedraw()
// side by side: the app IS the left pane, its map the right — same state,
// two renderings (the JSON inspector runs full width below)
preview.classList.add('split-view')
detail.style.gridColumn = '1 / -1'
preview.append(tabs, detail)
```

```test
import { enableAgentInterface, schematicSVG, rasterizeSVG, elements, tosi, updates } from 'tosijs'

test('the full pipeline: map -> SVG string -> PNG blob (real browsers only)', async () => {
  const agent = globalThis.tosiAgent ?? enableAgentInterface({ expose: 'all' })
  const svg = schematicSVG(agent.describe({ styles: true }))
  expect(svg.includes('<svg xmlns=')).toBe(true)
  expect(svg.includes('data-record=')).toBe(true)
  // rasterization needs a real rendering engine — the exact capability a
  // unit DOM cannot fake, which is why this lives in the browser tier
  const blob = await rasterizeSVG(svg, { scale: 2 })
  expect(blob.type).toBe('image/png')
  expect(blob.size > 0).toBe(true)
})

test('the delete affordance: named by its title, gated by checked-ness', async () => {
  const agent = globalThis.tosiAgent ?? enableAgentInterface({ expose: 'all' })
  // build our OWN rows: a doc test must not depend on another fence's DOM
  // (the runner executes fences in isolated frames, in no fixed order)
  const { ul, li, button } = elements
  const { delFence } = tosi({
    delFence: { rows: [{ id: 1, done: true }, { id: 2, done: false }] },
  })
  const list = ul(
    ...delFence.rows.listBinding(
      ({ li: row, button: btn }, item) =>
        row(
          btn('x', {
            title: 'delete-fence',
            bind: {
              value: item.done,
              binding: (el, done) => {
                el.disabled = !done
              },
            },
            onClick() {},
          })
        ),
      { idPath: 'id' }
    )
  )
  preview.append(list)
  await updates()

  const dels = agent
    .describe()
    .wiring.filter((w) => w.label === 'delete-fence')
  expect(dels.length).toBe(2)
  // the checked row's delete is live; the unchecked one is disabled —
  // a PRECONDITION, visible in the map (and faded in the schematic)
  expect(dels.some((w) => w.disabled === true)).toBe(true)
  expect(dels.some((w) => w.disabled == null)).toBe(true)
  list.remove()
})
```

One rectangle per wired element, at its **actual position and size**, wearing
the app's own colors (`describe({ styles: true })`) — and since `bounds` is
plain data, a _remote_ agent can draw a page nobody is looking at.

Above — a todo list, because a list's map **changes shape as you use it**:
every item you add is new wired elements and the map grows with them, hands
off. Each row's icon-only delete button is _named_ by its `title` and
_gated_ by its checkbox — toggle a todo and watch its delete button fade in
and out of the map, hands off: the drawing observes the same state it draws
(plus focus moves, which state can't see). Type in the input and watch the caption
change from italic hint to held value; check a box and watch the glyph flip.
The **schematic** tab is scoped **by hierarchy** — `agent.describe({ scope:
preview })` walks only this demo's subtree, so the map is the same whether
the example is inline or maximized. (Spatial scoping — `schematicSVG(map, {
within: rect })` — also exists, but a region includes whatever _overlaps_ it,
occluded or not; use it for viewport maps, not app parts.) **whole page**
drops the scope for the full reveal; click any rectangle for its JSON record:

**SVG vs. bitmap, per consumer.** For an LLM, SVG _source_ is the worst
encoding of the three: same information as the JSON plus 2–4× markup overhead,
through the same text channel with the same no-perception problem (models
compute "x:340 is right of x:120"; they don't _see_ it — and they're famously
poor at mentally rendering SVG). The division of labor: **JSON for text
reasoning** (minimal, precise), **rasterized PNG for vision encoders** (the
only channel where adjacency/containment/alignment are perceived, and where
the ~10× visual token compression lives — rasterize at 2× so labels land
≥ 12px effective and OCR is near-lossless), **SVG as the master artifact** for
humans and tools (deterministic, diffable, clickable — the index). The helper
this implies: `schematicSVG(description) → string`, a pure DOM-free function
(bounds is plain data, so the headless embodiment can vend its own schematic
and a remote agent can draw a page nobody is viewing), plus a rasterize step —
canvas in-browser, `@resvg/resvg-js` under bun (already a devDep for ePub
covers).

**The grammar** (explicit, so "can I act here?" never needs guessing):
**bold outline** = wired to act (has handlers) · an `↔` badge at the right
edge = editable here · caption ending `*` = required · a **red corner
flag** (top-left) = invalid _right now_ — live ValidityState, the same
truth `:invalid` styles · toggle state is drawn, live (an `✕`
fills a checked box; radios are circles with a dot when selected) · a
**double outline** = keyboard focus, where the user is right now · _italic_ =
placeholder hint, **not** content · **faded** = disabled right now (it beats
bold: a disabled button is not an affordance) · plain solid = display ·
faint dotted = structure, including list _containers_ (subtle on purpose —
the ground, not the figure: a list's items are the affordances; the
container is where they live, and its wiring stays in the JSON record).

## The audit: findings, not vibes

Every rule below is one the map makes obvious — _every element with handlers
should have a name, a role, and enough contrast and size to use_ — and
because the map is the framework's own record of its wiring, a finding is a
real defect rather than a scraper's guess. `auditFlags()` turns the report
into schematic `flags`, so the drawing shows you where they are.

```js
import {
  enableAgentInterface,
  auditAccessibility,
  auditFlags,
  schematicSVG,
  elements,
} from 'tosijs'

const agent = globalThis.tosiAgent ?? enableAgentInterface({ expose: 'all' })
const { div, button, pre } = elements

// a deliberately bad little UI — an anonymous div-button with faint text
const bad = div(
  { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
  div({
    onClick() {},
    style: {
      color: '#bbb',
      background: 'white',
      padding: '2px 6px',
      cursor: 'pointer',
    },
    textContent: 'delete',
  }),
  div({ onClick() {} }) // no name at all
)

const out = pre({ style: { maxHeight: '10em', overflow: 'auto', margin: 0 } })
preview.append(
  bad,
  button('audit this demo', {
    onClick() {
      const map = agent.describe({ styles: true, scope: preview })
      const report = auditAccessibility(map)
      out.textContent =
        `${report.failed} error(s), ${report.findings.length} finding(s)\n\n` +
        report.findings
          .map((f) => `[${f.severity}] ${f.rule}\n  ${f.message}`)
          .join('\n\n') +
        (report.skipped.length
          ? `\n\nskipped: ${report.skipped.join('; ')}`
          : '')
    },
  }),
  out
)
```

```test
import { enableAgentInterface, auditAccessibility } from 'tosijs'

test('the audit finds real defects in a real page', () => {
  const agent = globalThis.tosiAgent ?? enableAgentInterface({ expose: 'all' })
  const report = auditAccessibility(agent.describe({ styles: true }))
  // shape, not score: this page is a live document, its findings will vary
  expect(Array.isArray(report.findings)).toBe(true)
  expect(typeof report.failed).toBe('number')
  // styles WERE supplied, so the rule must not skip for lack of them…
  expect(
    report.skipped.some((s) => s.includes('no computed styles'))
  ).toBe(false)
  // …though it may honestly report that transparent backgrounds can't be
  // measured from the map alone (the effective ancestor colour is unknown)
  expect(
    report.skipped.every((s) => s.startsWith('contrast:'))
  ).toBe(true)
})
```

## Kitchen sink: the truth test

Every "obvious" rendering claim, verifiable at a glance — one of everything,
drawn live (250ms) with `index: true`, so each box wears its wiring index and
the legend below maps numbers to records (the raster form of
`data-record`: a vision consumer reads the number off the image and looks up
the JSON). Interact with anything on the left; the map must never disagree:

```js
import { elements, tosi, enableAgentInterface, schematicSVG } from 'tosijs'

const { sink } = tosi({
  sink: {
    text: '',
    email: '',
    qty: 3,
    volume: 7,
    flavor: 'mango',
    terms: true,
    spam: false,
    size: 'medium',
    pick(event) {
      sink.size = event.target.value
    },
    submit() {},
  },
})
const agent = globalThis.tosiAgent ?? enableAgentInterface({ expose: 'all' })
const { div, label, input, select, option, button, span, pre } = elements

const radio = (value) =>
  label(
    input({
      type: 'radio',
      name: 'sink-size',
      value,
      checked: sink.size.value === value,
      onChange: 'sink.pick',
    }),
    ' ',
    value
  )

const controls = div(
  { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
  input({ placeholder: 'type here…', bindValue: sink.text }),
  // required + empty = INVALID right now: the map reads live ValidityState
  // (red corner flag + asterisk) — type a real address and watch it clear
  input({
    type: 'email',
    required: true,
    placeholder: 'email (required)',
    bindValue: sink.email,
  }),
  label(
    input({ type: 'number', bindValue: sink.qty, style: { width: '4em' } }),
    ' qty'
  ),
  label(
    input({ type: 'range', min: 0, max: 10, bindValue: sink.volume }),
    ' volume'
  ),
  label(input({ type: 'checkbox', bindValue: sink.terms }), ' terms'),
  label(input({ type: 'checkbox', bindValue: sink.spam }), ' spam me'),
  div(radio('small'), radio('medium'), radio('large')),
  select({ bindValue: sink.flavor }, option('mango'), option('lime')),
  // contenteditable surfaces AS an input: the agent cares that the region
  // EXISTS and which path feeds it (it writes state, not keystrokes)
  div(
    {
      contenteditable: 'true',
      ariaPlaceholder: 'editable region…',
      style: {
        border: '1px dashed gray',
        padding: '2px 4px',
        minHeight: '1.2em',
      },
    },
    'edit me'
  ),
  div(
    button('submit', { onClick: 'sink.submit' }),
    ' ',
    button('disabled', { disabled: true, onClick: 'sink.submit' })
  ),
  // a DISPLAY affordance: bound text, colored — mapped, but neither bold
  // nor badged (you can read it, not act on it)
  span({
    title: 'flavor',
    textContent: sink.flavor,
    style: {
      background: 'rgb(0, 128, 96)',
      color: 'white',
      padding: '2px 6px',
      alignSelf: 'flex-start',
    },
  })
)

const drawing = div({ style: { flex: '1 1 auto', overflow: 'auto' } })
const legend = pre({
  style: { maxHeight: '9em', overflow: 'auto', margin: 0, fontSize: '10px' },
})
const draw = () => {
  const d = agent.describe({ styles: true, scope: preview })
  drawing.innerHTML = schematicSVG(d, { index: true })
  const svg = drawing.querySelector('svg')
  if (svg) {
    svg.setAttribute('width', '100%')
    svg.removeAttribute('height')
  }
  legend.textContent = d.wiring
    .map(
      (w, i) =>
        `${i} ${w.tag}${w.type ? ':' + w.type : ''}` +
        `${w.disabled === true ? ' (disabled)' : ''}` +
        `${w.required === true ? ' (required)' : ''}` +
        `${w.invalid === true ? ' (invalid)' : ''} ` +
        `${w.label ?? w.placeholder ?? w.text ?? w.value ?? ''}`
    )
    .join('\n')
}
// state changes redraw (the map is an observer); focus moves too, since
// state can't see them
const redraw = { timer: 0 }
const requestRedraw = () => {
  clearTimeout(redraw.timer)
  redraw.timer = setTimeout(() => {
    if (drawing.isConnected) draw()
  }, 100)
}
const off = agent.observe(/./, requestRedraw)
document.addEventListener('focusin', requestRedraw)
const cleanup = setInterval(() => {
  if (!drawing.isConnected) {
    off()
    document.removeEventListener('focusin', requestRedraw)
    clearInterval(cleanup)
  }
}, 2000)
requestRedraw()

preview.append(
  div(
    { style: { display: 'flex', gap: '8px', height: '100%' } },
    controls,
    div(
      {
        style: {
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      },
      drawing,
      legend
    )
  )
)
```

```test
import { enableAgentInterface, schematicSVG, updates } from 'tosijs'

test('kitchen sink: the map never disagrees with the controls', async () => {
  const agent = globalThis.tosiAgent ?? enableAgentInterface({ expose: 'all' })
  const d = agent.describe({ styles: true })
  // toggle state is harvested live, both ways
  const checks = d.wiring.filter((w) => w.type === 'checkbox')
  expect(checks.some((w) => w.checked === true)).toBe(true)
  expect(checks.some((w) => w.checked === false)).toBe(true)
  // exactly one radio in the group is checked
  const radios = d.wiring.filter((w) => w.type === 'radio')
  expect(radios.filter((w) => w.checked === true).length).toBe(1)
  // a placeholder is a hint field, never the label
  const hinted = d.wiring.find((w) => w.placeholder === 'type here…')
  expect(hinted != null).toBe(true)
  expect(hinted.label).toBe(undefined)
  // disabled is a record fact
  expect(
    d.wiring.some((w) => w.tag === 'button' && w.disabled === true)
  ).toBe(true)
  // contenteditable: an affordance in itself, live text as value
  const ce = d.wiring.find((w) => w.contentEditable === true)
  expect(ce != null).toBe(true)
  expect(ce.value).toBe('edit me')
  // required + empty email = invalid, live (ValidityState is map truth)
  const email = d.wiring.find((w) => w.type === 'email')
  expect(email != null).toBe(true)
  expect(email.required).toBe(true)
  expect(email.invalid).toBe(true)
  // and the drawing carries all of it
  const svg = schematicSVG(d, { index: true })
  expect(svg.includes('<line')).toBe(true) // the checked box's ✕
  expect(svg.includes('<circle')).toBe(true) // radios are circles
  expect(svg.includes('font-style="italic"')).toBe(true) // the hint
  expect(svg.includes('opacity="0.4"')).toBe(true) // the disabled button
  expect(svg.includes('#d32f2f')).toBe(true) // the invalid corner flag
  expect(svg.includes(' *')).toBe(true) // the required asterisk
  // the agent types: the value must replace the hint
  agent.write('sink.text', 'actual content')
  await updates()
  const after = schematicSVG(agent.describe({ styles: true }))
  expect(after.includes('actual content')).toBe(true)
  agent.write('sink.text', '') // leave the demo as found
})
```

**Why the map beats pixels:**

- **Layout is free structure** — containment says nesting, adjacency says
  order, arrows say direction; none of it spends a token on syntax
  (the DeepSeek-OCR result, applied to UI).
- **The image is an index** — every rectangle links to its JSON record:
  glance at the picture, zoom into the one subtree you need.
- **Three encodings, one wiring** — JSON, DOM, schematic; a diff invisible in
  one is glaring in another (a schematic diff is a regression a human _sees_).
- **It's the demo of the thesis** — a map that draws itself from a page that
  never declared one. Every tosijs demo can end with the reveal.

**The raster economics** (encoders normalize the long edge, so cost is capped
by construction — the budget is _aspect ratio_, not bytes):

| what you rasterize                               | vision tokens | labels readable?                           | role                             |
| ------------------------------------------------ | ------------- | ------------------------------------------ | -------------------------------- |
| **viewport render** (`view: 'viewport'`, ≈16:10) | ~700–1100     | **yes** — the frame pages are designed for | **the user's-eye glance**        |
| whole page (≈1300×6500)                          | ~650–800      | no (crushed ~4×)                           | the atlas — topology + structure |
| region map, ≤3:1 (`scope`/`within`)              | ~600–1500     | yes                                        | **the zoom** — full fidelity     |
| JSON map, 60-control app (haltija's measurement) | ~1,567 (text) | exact                                      | the reasoning form               |

Compression and index are the same design: the glance is cheap _because_ the
zoom exists to recover what it discarded.

The schematic above is ~60 lines of vanilla SVG generation over `describe()`
output — no layout engine, no rendering, no screenshots. **This code and the
thinking belong in haltija too**: a test driver that can draw the schematic of
any page it's driving has a map view humans can check at a glance and a
compressed overview a vision model can ingest — the natural shared artifact
between the agent surface and the test harness (they are, after all, the same
interface).

## Proof: the harvest, assembled live

The UI below is built with ordinary element sugar — a labeled filter input
(two-way bound), a read-only total (one-way prop binding), and a button whose
handler is attached _by path_. There is not one agent-specific declaration in
it. Click **describe()** and the affordance graph is assembled on demand — and
because this page runs in introspection mode, the graph is the _whole page's_:
the [two-actors demo](/one-user-interface/), the doc site's own chrome, and the very button you
clicked to ask.

```js
import { elements, tosi, enableAgentInterface } from 'tosijs'

const { harvest } = tosi({
  harvest: {
    filter: '',
    total: 3,
    restock() {
      harvest.total = harvest.total.value + 1
    },
  },
})

// reuse the page's surface if one is already installed
const agent = globalThis.tosiAgent ?? enableAgentInterface({ expose: 'all' })
const { div, input, span, button, pre } = elements

// output as a DIRECT preview child: height 100% is a no-op inline and
// fills the box when the example is maximized
const out = pre({ style: { height: '100%', overflow: 'auto', margin: 0 } })
// an ordinary UI — no agent-specific declarations anywhere
preview.append(
  div(
    input({ placeholder: 'filter stock…', bindValue: harvest.filter }),
    ' ',
    span({ title: 'items in stock', textContent: harvest.total }),
    ' ',
    button('restock', { onClick: 'harvest.restock' }),
    ' ',
    button('describe()', {
      onClick() {
        const d = agent.describe()
        const summary = [
          `exposure: ${d.exposure}`,
          `roots: ${Object.keys(d.roots).join(', ')}`,
          `actions: ${d.actions.join(', ')}`,
          `wired elements: ${d.wiring.length}`,
        ].join('\n')
        out.textContent = summary + '\n\n' + JSON.stringify(d.wiring, null, 2)
      },
    })
  ),
  out
)
```

```test
import {
  elements,
  tosi,
  enableAgentInterface,
  bind,
  bindings,
  updates,
} from 'tosijs'

test('describe() harvests the affordance join from ordinary declarations', async () => {
  const agent = globalThis.tosiAgent ?? enableAgentInterface({ expose: 'all' })
  tosi({ harvestTest: { q: '' } })
  const input = elements.input({ placeholder: 'harvest-test…' })
  preview.append(input)
  bind(input, 'harvestTest.q', bindings.value)
  await updates()
  const d = agent.describe()
  // a placeholder is a HINT: its own field, never conflated with label
  const record = d.wiring.find((w) => w.placeholder === 'harvest-test…')
  expect(record != null).toBe(true)
  expect(record.label).toBe(undefined)
  // the two-way arrow ⟷ marks a user-writable affordance, provenance inline
  expect(String(record.value).includes('⟷ harvestTest.q')).toBe(true)
  // geometry rides in the map — in a real browser the input has real bounds
  // (this line is exactly what happy-dom cannot assert: it reports zero-size)
  expect(record.bounds.width > 0).toBe(true)
  input.remove()
})
```

Read what it prints. Records are **flat** — the semantically visible facts sit
at the top level, sized for an LLM to scan. The input's record joins its
`placeholder` hint to its live value and its path in one string:
`value: "⟷ harvest.filter"` — the two-way arrow means _user-writable
affordance_. The total is the same idea, one-way: `text: "3 ⟵ harvest.total"`
(current value, display-only; a plain `text: "restock"` with no arrow is
static). The restock button's handler is not an anonymous `ƒ` but a _name_ —
`on: { click: "harvest.restock" }` — and the same path appears under
`actions`. That is the affordance descriptor from the table above: harvested,
joined, and serialized, authored by nobody.

## The part nobody else can offer: the wiring diagram is already recorded

Here is the b8r inheritance paying off. In b8r it was the norm to put state
_and_ event handlers in the registry. tosijs kept that affordance
(`onClick: 'app.doThing'` binds a handler **by path**) but also allows the
ergonomic shortcut (`onClick: (event) => { … }`) — and crucially, **the shortcut
still passes through tosijs**. Every handler attached via element sugar or
`on()` is recorded. Every data binding records element ↔ path. The framework
doesn't just hold the model — it holds the complete map of _which widget is
wired to what_, as a side effect of normal operation.

That means an introspection surface costs the programmer **nothing**. Today,
with shipped exports:

| Question an agent asks            | Answer, today                                                                                                                     |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| What state exists?                | `xin` / `boxed` — plain serializable objects (this is what `hotReload` already relies on)                                         |
| What is the value at a path?      | `boxed[path].value`                                                                                                               |
| Change it (and update the UI)     | `xin[path] = value` — observers fire, DOM updates surgically                                                                      |
| Tell me when it changes           | `observe(path, cb)` — and `unobserve` to hang up                                                                                  |
| Which elements are data-bound?    | `document.getElementsByClassName(BOUND_CLASS)` — the marker class **is** the enumerable index                                     |
| What is _this_ element wired to?  | `getElementBindings(el)` → its data bindings (paths + binding types) **and** its event handlers _(one `export` away from public)_ |
| Which datum does this row render? | `getListItem(el)` — DOM → model, including virtual list rows                                                                      |
| What actions exist?               | Functions in the registry (`app.addItem`) — addressable, callable, and already supported as by-path event handlers                |
| What happened while I watched?    | The path-touch stream — the `connectDevTools` pattern (every touch is `{path, snapshot}`)                                         |

The React/Angular worlds cannot produce this table without becoming tosijs: it
requires a universal addressing scheme, a central observable registry, stable
DOM, and recorded wiring — which is simply a description of the observant model.
This is the "two steps beyond" claim, made concrete.

A useful subtlety: **shadow-DOM components are already agent-shaped.** A shadow
component is bound like an `<input>` — its `value` is the interface and its
internals are private by design. That's precisely the affordance/implementation
split an agent needs: it should set the date-picker's _value_, not fumble with
its internal buttons. (Closed shadow roots stay closed — for agents too.)

## The opportunistic harvest

The wiring table above is what tosijs records _deliberately_. There is a second,
larger layer it can harvest _opportunistically_ — metadata that exists only
because developers use elementCreators and their syntax sugar. Every prop passed
to `div({…})`, every `initAttributes`, every `listBinding` flows through one
chokepoint (`elementSet` / the creator machinery), and almost all of it persists
somewhere recoverable (the element's attributes, the binding WeakMaps, the
component class). Nothing new needs recording — `describe()` computes the
harvest **on demand** from what's already there:

| The developer wrote (for their own reasons)                                                                    | What it tells an agent, free                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onClick: (e) => {…}`                                                                                          | this element is interactive; event type known                                                                                                                                                                                                   |
| `onClick: 'app.doThing'` — or `onClick: app.doThing` (a proxy IS a path: `on()` normalizes it at registration) | the action is _addressable and nameable_ — a tool with a path; a named plain function leaves a breadcrumb (`ƒ addThing` — dev-mode value only, minification scrambles it); anonymous maps as `ƒ`                                                |
| `bindValue: app.filter` (binding has `fromDOM`)                                                                | **this path is user-writable** — an input affordance                                                                                                                                                                                            |
| `textContent: app.total` (prop binding is `toDOM`-only)                                                        | this path is _displayed_ — read-only output                                                                                                                                                                                                     |
| `disabled: app.cart.invalid`                                                                                   | a **precondition**: the guarded action's availability depends on this path                                                                                                                                                                      |
| `listBinding(template, { idPath: 'id' })`                                                                      | `app.items` is a collection keyed by `id`; the template's relative (`^.field`) bindings enumerate **which fields of each item the UI presents**, and per-row handlers are per-row actions                                                       |
| `aria-label(ledby)`, `title`, `placeholder`, `alt`                                                             | **the accessible name, resolved** — what a screen reader would say, harvested at the source                                                                                                                                                     |
| `aria-describedby`, `aria-disabled`/`disabled`, `aria-required`                                                | the author's own explanation + live affordance state (`description`, `disabled`, `required` on the record)                                                                                                                                      |
| `aria-hidden`                                                                                                  | hidden from assistive tech = hidden from the agent — the map reads the page the way a screen reader does                                                                                                                                        |
| `aria-description` / `aria-describedby`                                                                        | the author's own explanation, read back into the record — and a component's `contract.description` is _stamped_ here (a description is not a name: it never touches `aria-label`)                                                               |
| `<a href>`                                                                                                     | **links are affordances** — mapped bindings-or-not; `href` is a distinct fact from the text ("says X" is not "goes to Y"), captions nameless links, and always rides the legend                                                                 |
| `contenteditable`                                                                                              | **surfaces as an input field**, mapped even before bindings attach: live text as its value, `aria-placeholder` as its hint, ↔ unbid — what an agent needs is that the region _exists_ and which path feeds it (it writes state, not keystrokes) |
| `input({ type: 'email' })`, `required`, `min`/`max`/`pattern`                                                  | value types and validation constraints, straight from the markup sugar                                                                                                                                                                          |
| `part: 'searchBox'`                                                                                            | the developer's _own name_ for the affordance                                                                                                                                                                                                   |
| `contract: { type: 'integer', examples: [1, 42] }`                                                             | an **inline contract**, declared at the element: rides the record, aggregates into `describe().contract` under the bound path, gates agent writes, and its examples are executable — see [The Agent Surface](/agent-surface/)                   |
| `static initAttributes = { count: 0, live: false }`                                                            | a **typed per-component attribute schema** — types already inferred from defaults at runtime (`typeof` branch in the attribute machinery)                                                                                                       |
| component `value` + `formAssociated`                                                                           | the component's value surface and its form contract                                                                                                                                                                                             |

Two compounding effects make this more than a list of facts:

- **The join.** Because everything is declared _on the same element through the
  same call_, tosijs can join what no one else can: `role="search"` ×
  `bindValue: app.filter` × `onKeydown: app.submit` on one element is a complete
  **affordance descriptor** — semantic label, writable state, and action,
  co-located. The a11y-tree agents get the label but not the path; API tools get
  the action but not the label. tosijs stands in the middle when all three are
  declared, and the DOM + WeakMaps preserve the join for on-demand assembly.
- **The behavioral harvest.** At runtime, the audit stream adds provenance:
  `call('app.addItem')` → touches observed on `app.items` teaches the agent the
  **causal graph** (which actions affect which paths) purely by watching.
  `describe()` gets richer the longer the app runs, with zero developer effort.
- **Triangulated typing without schema.** `typeof` the state at the path ∧ the
  input's declared `type` ∧ `initAttributes` defaults: three independent
  signals agree on a field's type before tosijs-schema is even introduced —
  and flag a smell when they disagree.

The punchline is the same as the wiring table's, one octave up: the WebMCP
world asks developers to _author_ tool schemas by hand; in tosijs, the app's
ordinary construction **is** the authoring. The sugar was designed for
ergonomics; it turns out to have been designing an agent interface all along.
