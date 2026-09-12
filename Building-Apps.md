# Building Apps

<!--{ "pin": "top", "order": 2, "description": "How to think about building applications with tosijs: state in a proxy, UI built with live bindings, list bindings for collections. Read this first." }-->

> This guide explains how to think about building applications with tosijs.
> It's not an API reference — it's a mental model. If you're coming from React
> or another reactive framework, this is the most important thing to read first.

## The Downhill Model

In React, data flows "uphill." A child component needs to tell a parent something
happened, so you lift state up, pass callbacks down, drill props through layers
of components, and eventually something re-renders — often much more than needed.
You fight the framework to avoid unnecessary work.

tosijs works downhill. State changes at the top. The UI updates at the bottom.
Nothing in between needs to know about it.

    state changes → observers fire → bound DOM updates

There's no virtual DOM, no diffing, no reconciliation. When `user.name` changes,
the one `<span>` bound to `user.name` updates. Nothing else re-renders.

The key concept is the **path**. Where React thinks in terms of a component tree,
tosijs thinks in terms of addresses: `app.user.name` is a path. Bindings watch
paths. Mutations fire on paths. Everything in tosijs routes through paths — that's
why binding to a specific scalar path is so much more efficient than binding to
an object and diffing.

## The Three Steps

### 1. Put your state in a proxy

    const { app } = tosi({
      app: {
        user: { name: 'Alice', email: 'alice@example.com' },
        messages: [],
        prefs: { darkMode: false }
      }
    })

This is your entire application state. It's a plain JavaScript object — your
business logic doesn't know tosijs exists. You can add methods to it.
You can pass pieces of it to functions. The proxy wrapping is invisible
to your code.

There's no `dispatch`, no `setState`, no action creators.
To change state, just change it:

    app.user.name.value = 'Bob'

The proxy sees the mutation and notifies anyone who cares.

> **TypeScript note.** `app.user.name` is a `BoxedScalar<string>`, not a raw
> string, so use `.value` to read or write the underlying primitive.
>
> **Both spellings are correct and do exactly the same thing** — same write,
> same observers:
>
>     app.user.name = 'Bob'          // the intended JS spelling
>     app.user.name.value = 'Bob'    // identical, and what TypeScript accepts
>
> TypeScript rejects the first with `TS2322` and **cannot be made to accept
> it**: asymmetric `get`/`set` works on a hand-written interface, but
> `BoxedProxy<T>` is a mapped type over arbitrary `T` and mapped types have no
> such modifier — while widening the property to a union would make every read
> ambiguous, so `.value` would stop compiling. Your code is not wrong; the type
> is a lossy projection of a proxy designed for JavaScript. In `.ts`, write
> `.value =` because it is the form the checker can express.

This also means `===` doesn't work on proxied scalars — JavaScript
doesn't allow objects to be strictly equal to primitives:

    app.user.name === 'Bob'        // always false — comparing proxy to string
    app.user.name.value === 'Bob'  // correct

Reach for `.value` whenever you need the raw primitive — for comparisons,
assignments, or passing to external APIs.

### 2. Build your UI with bindings

    const { div, h1, input, ul } = elements

    const view = div(
      h1(app.user.name),
      input({ value: app.user.name }),
      div({ class: 'status', hidden: app.loggedIn })
    )

This is real DOM — not a template, not JSX, not a virtual representation.
You build it once. It doesn't re-render. You're writing a structure with
live bindings, not a render function that gets called over and over.

**Proxies become live bindings automatically.** Pass a proxy as a child
and it becomes a text-bound `<span>` — `h1(app.user.name)` just works
(at the cost of one extra DOM element; use `textContent: app.user.name`
if that bothers you). Pass a proxy as any property or attribute and tosijs
detects it and binds it — `hidden: app.loggedIn` stays in sync with state.
This eliminates the need for most custom bindings.

`textContent` and `bindValue` bind a **proxy**; `bindValue` also handles `fromDOM`.
For a path **string** rather than a proxy, use the inline form —
`bind: { value: 'app.user.name', binding: 'text' }` — because `textContent: 'app.user.name'`
would set that literal text instead of binding. (`bindText` is **not**
deprecated — 1.9.0 deprecated it and 1.9.1 reversed that, precisely because it
is the only form that takes a path string. It does not warn.)

For anything truly custom, use `bind: { value, binding: { toDOM, fromDOM } }`.
A function is also accepted as shorthand for `{ toDOM: fn }`:

    div({ bind: {
      value: app.prefs.darkMode,
      binding(el, isDark) {
        el.classList.toggle('dark', isDark)
      }
    }})

**Bind individual scalar values, not objects.** This is the key insight.
When you bind `app.user.name` to a `<span>`, tosijs sets up a listener
on that exact path. When only the name changes, only that `<span>` updates.

If you bound the entire `app.user` object and pulled out `.name` in a
`toDOM` function, the binding would fire on _any_ change to user — name,
email, whatever. You'd be doing React's job of figuring out what actually
changed. Don't. Let the path system do it for you.

**`fromDOM` bindings flow user input back to state** — an `<input>` with
`bindValue: app.user.name` writes directly to `app.user.name` when the
user types. Two-way binding with zero boilerplate.

**Conditional UI?** Don't think `condition ? <A/> : <B/>`. Instead,
build both and bind visibility:

    div(
      loginForm({ bind: {
        value: app.loggedIn,
        binding(el, loggedIn) { el.hidden = loggedIn }
      }}),
      dashboard({ bind: {
        value: app.loggedIn,
        binding(el, loggedIn) { el.hidden = !loggedIn }
      }})
    )

Both elements exist in the DOM. Bindings show/hide them. No teardown,
no re-creation, no lost state.

For large, expensive UI branches you don't want in the initial DOM at all,
just append them when needed — it's standard DOM manipulation:

    const container = div()
    app.showFeature.observe(() => {
      if (app.showFeature.value && !container.children.length) {
        container.append(buildExpensiveFeature())
      }
    })

No lazy-loading API, no `Suspense`, no dynamic imports. A function returns
an element, you put it in the DOM, bindings activate. That's it.

### 3. Use list bindings for collections

    ul(
      ...app.messages.listBinding(
        ({li, span}, msg) => li(
          span({ textContent: msg.sender }),
          span({ textContent: msg.body })
        ),
        {
          idPath: 'id',
          virtual: { height: 60 }
        }
      )
    )

This looks like `...items.map(item => li(item.name))` — familiar one-shot
rendering. It's not. The binding stays alive: additions, removals, and
property changes on `app.messages` automatically update the DOM. The
familiar mapping syntax is a Trojan horse for live list rendering.

Virtual list bindings only render what's visible. A list of a million
messages renders the same number of DOM nodes as a list of twenty.
Scrolling is O(1) — the same virtual slice calculation runs regardless
of list size.

**Always specify `idPath` for arrays of objects.** This enables surgical
updates — changing one property on one item updates one DOM element.
Without it, the list falls back to index-based paths that break on reorder.

> **Id values must not contain `]` characters.** Paths are encoded as
> `list[id=value]`, so a `]` in the value breaks the parser. Characters
> like `[`, `=`, and `.` are safe. Use numeric ids or UUIDs and you'll
> never hit this.

### Finding, updating, and removing list items

Proxied arrays have `listFind`, `listUpdate`, and `listRemove` methods
that use the same selector pattern as `listBinding`:

    // Find an item — returns proxied, so mutations trigger updates
    const item = app.items.listFind((item) => item.id, 'abc')
    if (item) item.name.value = 'Updated'

    // Find by DOM element (in a click handler)
    const item = app.items.listFind(e.target)

    // Update in place — preserves object identity and DOM elements
    app.items.listUpdate((item) => item.id, {
      id: 'abc', name: 'New Name', score: 100
    })

    // Remove
    app.items.listRemove((item) => item.id, 'abc')

`listUpdate` is the key one: it mutates the existing object property by
property through the proxy, so only changed properties fire observers and
the DOM element is reused. If the item doesn't exist, it pushes a new one.

## Proxied vs. Raw

The proxy is the core of tosijs, so understanding where it applies matters.

### `for...of` gives proxied items; callbacks give raw items

`for...of` on a proxied array yields proxied items — mutations trigger
observers. But `forEach`, `map`, and `filter` pass _raw_ items to callbacks.
Mutations inside these are invisible to tosijs.

    // for...of gives proxied items — mutations trigger observers
    for (const item of app.items) {
      item.score.value = 100  // observers fire
    }

    // forEach/map/filter pass raw items — mutations are silent
    app.items.forEach(item => {
      item.score = 100  // no observer fires
    })
    touch(app.items)  // manual touch needed after raw mutations

### `this` in proxied methods

Methods on proxied objects receive the proxy as `this`, which means
property access goes through the proxy. This is usually what you want —
mutations trigger observers automatically. But be aware that `this.items`
returns a proxied array, not a raw one:

    const todo = {
      items: [],
      add(text) {
        // `this` is the proxy — this push triggers observers
        this.items.push({ id: Date.now(), text, done: false })
      }
    }

If you need the raw value (e.g. for serialization), use
`this.items.value` (or the `tosiValue(this.items)` function).

## Why This Works

### No component tree means no prop drilling

State lives in the `tosi()` proxy. Any element anywhere can bind to any path. You don't
need wrapper components to shuttle data through the hierarchy. A deeply
nested `<span>` can bind directly to `app.user.name` without any of its
ancestors knowing or caring.

### Business logic stays clean

Your data objects are just objects. They can have methods:

    const todo = {
      items: [],
      add(text) {
        this.items.push({ id: Date.now(), text, done: false })
      },
      toggle(id) {
        for (const item of this.items) {
          if (item.id.value === id) {
            item.done.value = !item.done.value
            break
          }
        }
      }
    }

    const { app } = tosi({ app: todo })

Note the `toggle` method uses `for...of` (which yields proxied items) and
`.value` for reads and writes. This ensures mutations trigger observers.
Array callbacks like `find` and `forEach` pass raw items — see
"Proxied vs. Raw" below.

No imports from tosijs needed in your business logic — though methods
called through the proxy receive proxied `this`, so your code does need
to be proxy-aware (using `.value` and `for...of`). You can test
`todo.add()` and `todo.toggle()` with plain unit tests.

### Deeply async by default

You can set up bindings before data exists. When data arrives — from a fetch,
a websocket, user input — the bindings just start working:

    const { app } = tosi({ app: { posts: [] } })

    // UI is already bound to app.posts
    // this just works whenever the fetch completes
    fetch('/api/posts')
      .then(r => r.json())
      .then(posts => { app.posts.value = posts })

No suspense boundaries, no effect hooks. The real UI is already mounted —
an empty bound list is your loading state, and it fills in with no layout
shift when data arrives. If you want an explicit loading indicator, bind one:

    div({ class: 'spinner', hidden: app.loaded })

That's a real element with a real binding, not a parallel placeholder UI
that gets swapped out. Other frameworks have you build two versions of your
UI and orchestrate the handoff. tosijs just has the UI, and it fills in.

Note the bare `hidden: app.loaded` — when you pass a proxy value as any
element property, tosijs detects it and creates a live binding automatically.
No `bind: { value, binding }` needed for simple property mappings.

Bindings to paths that don't exist yet are safe — they render as empty/blank
until data arrives. No `TypeError: cannot read property of undefined`.
The proxy intercepts the access; tosijs simply waits for the path to
materialize before firing the first update.

### `observe()` is for side effects, not rendering

In React you'd use `useEffect` for everything. In tosijs, DOM rendering
is handled by bindings. `observe()` is for _side effects_ — things that
aren't directly binding a value to a DOM property:

    app.prefs.darkMode.observe(() => {
      document.body.classList.toggle('dark', app.prefs.darkMode.value)
    })

The `.observe()` method on a boxed value watches that exact path. You can
also use the standalone `observe()` function for pattern matching:

    observe('app.prefs', () => { /* any pref changed */ })
    observe(/app\.user\./, path => { /* any user field changed */ })

Toggle a body class. Fire an analytics event. Persist to localStorage.
That's what `observe()` is for.

## Components

tosijs includes a `Component` base class for web components. A few things
to know:

### `content()` vs `render()`

- **`content()` runs once.** It builds the DOM during hydration and never
  re-runs. Set up bindings here — they handle all data-driven updates
  automatically.

- **`render()` runs on attribute changes.** It's for _structural_ changes
  driven by attributes — showing/hiding sections, swapping an `<input>`
  from `type="text"` to `type="password"`, reconfiguring layout. It is
  **not** for updating text, values, or display state.

The separation: **attributes drive structure, bindings drive content.**

    class MessageBubble extends Component {
      static initAttributes = { expanded: false }

      content = ({div, span}) => [
        span({ textContent: msg.sender }),
        div({
          class: 'body',
          bind: {
            // structure: show/hide based on attribute
            value: this.expanded,
            binding: (el, expanded) => { el.hidden = !expanded }
          }
        },
          span({ textContent: msg.body })  // content: flows through binding
        )
      ]
    }

**The anti-pattern** is writing an `updateDisplay()` method that manually
sets `textContent`, toggles classes, and shows/hides elements — then
calling it from event handlers. This recreates React's "render on every
change" model inside what should be a binding-driven system. If you find
yourself writing a method that walks the DOM and sets properties, those
should be bindings set up in `content()`.

When state lives in the `tosi()` proxy rather than in component instance
variables, bindings can reach it directly. A component that stores
`this.isExpanded = true` and manually propagates that to the DOM is
doing extra work — store it in the proxy and let bindings handle it.

### Light DOM is where the action is

From reading most web component documentation, you'd think shadow DOM was
the only option. It isn't. tosijs components use **light DOM by default**,
and this is a deliberate choice, not a limitation.

Shadow DOM gives you style encapsulation — great for word-processor-style
isolated widgets, but a memory and performance hit for everything else.
It also creates an encapsulation boundary that blocks path bindings,
external styling, and the usual DOM query APIs.

tosijs takes the one really valuable feature of shadow DOM components —
`<slot>` composition — and makes it work in the light DOM. You get:

- **Path bindings work everywhere.** No encapsulation boundary to cross.
- **CSS just works.** Style your components the same way you style everything else.
- **Lighter weight.** No shadow root overhead per instance.
- **Slot composition.** tosijs rewrites `<slot>` elements in light DOM components.

#### How `<tosi-slot>` works

Native `<slot>` elements only work inside a shadow root. tosijs solves this
by automatically replacing any `<slot>` in a light DOM component with an
`<tosi-slot>` custom element that provides the same composition behavior:
children with a matching `slot="name"` attribute get moved into the
corresponding `<tosi-slot name="name">`, and unslotted children go into the
default (unnamed) `<tosi-slot>`.

This happens during hydration — you write `<slot>` in your `content()` and
tosijs handles the rewrite transparently. You can also use `tosiSlot()`
directly from the `elements` proxy if you need to set attributes like
`class` or `style` on the slot container (plain `<slot>` elements lose
non-`name` attributes during the rewrite).

```
class CardLayout extends Component {
  content = ({ h3, tosiSlot }) => [
    h3('Header'),
    tosiSlot({ name: 'top', style: { background: '#eee' } }),
    h3('Body'),
    tosiSlot(), // default slot
    h3('Footer'),
    tosiSlot({ name: 'bottom' }),
  ]
}
```

Two things to keep in mind:

- **`:slotted` doesn't apply** — there's no shadow DOM, so style slotted
  children with normal CSS selectors. You can use `tosi-slot` as a selector.
- **The rewrite is one-way.** Once hydration runs, the DOM contains
  `<tosi-slot>` elements. If you inspect the DOM, you'll see `<tosi-slot>`,
  not `<slot>`.

Components declare their styles via static properties:

- **`static shadowStyleSpec`** — injected into the shadow DOM as a `<style>` element.
  Setting this causes the component to use shadow DOM.
- **`static lightStyleSpec`** — appended to `document.head` as a global `<style>`.
  `:host` selectors are rewritten to the component's tag name, so
  `:host { display: flex }` becomes `my-tag { display: flex }`.
- **`static preferredTagName`** — sets the tag name explicitly (survives minification).

> The older patterns — `static styleSpec` (alias for `shadowStyleSpec`) and
> passing `{ tag, styleSpec }` to `elementCreator()` — still work but are deprecated.

Use light DOM unless you know _exactly_ why you need shadow DOM.
When you do, the mental model is:

- **Light DOM** (default): bindings flow through naturally.
- **Shadow DOM**: the component is a _custom input_. Think of it exactly like
  an `<input>` or `<textarea>`: **its `value` is the binding surface**. Bind
  the component itself (e.g. `bindings.value`) from outside; setting `value`
  automatically queues `render()` and emits `change`, so implement `render()`
  to reflect `value` into the shadow DOM, and let `change` events carry edits
  back out. How the component represents its value internally is your business
  as the implementer — and that includes wiring any nested widgets manually in
  `render()`, because **bindings do not compose through a shadow tree**. A
  shadow DOM component is materially a different kind of thing than a light
  DOM component.

Data-binding sugar inside shadow content doesn't operate — and as of 1.7 it
warns instead of failing silently. Event sugar is the exception: `on()`
handlers work inside open shadow roots (composed events cross the boundary,
and the dispatcher resolves the true origin via `composedPath()`).

A good example: an email message bubble might use Shadow DOM for the
HTML body (CSS isolation from untrusted email styles) but keep
everything else — sender, subject, timestamps — in Light DOM with
normal bindings.

#### A shadow value-widget, bound like an `<input>`

Here's the canonical shape: a `shadowStyleSpec` component whose `value` is the
binding surface. `render()` reflects `value` into the shadow DOM; a control
inside the shadow root writes back to `this.value` (which emits `change`). From
outside, it binds exactly like a native input — here a plain `<input>` and the
widget share one state path and stay in sync, neither one reaching into the
other's internals:

```js
const { Component, elements, bindings, tosi } = tosijs
const { input, label } = elements

class StarRating extends Component {
  static preferredTagName = 'star-rating'
  static shadowStyleSpec = {
    ':host': { display: 'inline-flex', gap: '4px', cursor: 'pointer' },
    '.star': { fontSize: '24px', color: '#ccc' },
    '.star.on': { color: 'gold' },
  }
  value = 0
  content = ({ span }) =>
    [1, 2, 3, 4, 5].map((n) => span({ class: 'star', dataStar: n }, '★'))

  connectedCallback() {
    super.connectedCallback()
    this.shadowRoot.addEventListener('click', (event) => {
      const star = event.target.closest('[data-star]')
      if (star) this.value = Number(star.dataset.star) // emits `change`
    })
  }

  render() {
    super.render()
    for (const star of this.shadowRoot.querySelectorAll('.star')) {
      star.classList.toggle('on', Number(star.dataset.star) <= this.value)
    }
  }
}
StarRating.elementCreator()

const { demo } = tosi({ demo: { rating: 3 } })

preview.append(
  // the widget: bound by VALUE, like an input
  elements.starRating({
    bind: { value: 'demo.rating', binding: bindings.value },
  }),
  // a plain number input on the SAME path — they stay in sync
  label(
    ' rating: ',
    input({
      type: 'number',
      min: 0,
      max: 5,
      bind: { value: 'demo.rating', binding: bindings.value },
    })
  )
)
```

```test
const { Component, elements, bindings, tosi, xin, updates } = tosijs

test('a shadow value-widget round-trips through its value like an input', async () => {
  class Knob extends Component {
    static preferredTagName = 'knob-widget'
    static shadowStyleSpec = { ':host': { display: 'block' } }
    value = 0
    content = ({ button }) => button({ part: 'inc' }, '+')
    connectedCallback() {
      super.connectedCallback()
      this.shadowRoot.querySelector('[part=inc]').addEventListener('click', () => {
        this.value = Number(this.value) + 1
      })
    }
    render() {
      super.render()
      this.setAttribute('aria-valuenow', String(this.value))
    }
  }
  Knob.elementCreator()
  tosi({ knobDemo: { level: 2 } })

  const widget = elements.knobWidget({
    bind: { value: 'knobDemo.level', binding: bindings.value },
  })
  preview.append(widget)
  // render() reflects value into the DOM on an animation frame; poll for it
  // rather than assume a fixed delay (headless browsers throttle rAF for a
  // non-visible page). state -> widget.value (bound like an input):
  await waitFor('[aria-valuenow="2"]', 3000)
  expect(Number(widget.value)).toBe(2)

  // interaction inside the shadow root -> value -> state (change event out):
  widget.shadowRoot.querySelector('[part=inc]').click()
  await waitFor('[aria-valuenow="3"]', 3000)
  expect(Number(widget.value)).toBe(3)
  expect(xin['knobDemo.level']).toBe(3)
})
```

## Gotchas

### Observer callbacks receive paths, not values

Observer callbacks are called with the _path_ that changed, not the new value:

    app.prefs.darkMode.observe((path) => {
      // path is a string like 'app.prefs.darkMode'
      // to get the value, read it explicitly:
      const isDark = app.prefs.darkMode.value
      document.body.classList.toggle('dark', isDark)
    })

This is true for both the `.observe()` method and the standalone `observe()` function.

### Boxed proxies are minted fresh per access — never key on their identity

Every time you read a proxied value out of state you get a **new** proxy object over
the same underlying data. So identity comparisons and identity-keyed memoization do not
work the way you might expect:

    app.user === app.user            // false — two different proxies
    const seen = new WeakSet()
    seen.add(app.user); seen.has(app.user)   // false

Compare and key on the **path** (`.tosi.path` / `tosiPath(x)`) or the **underlying
value** (`.value` / `tosiValue(x)`), never on the proxy object itself. This is why, for
example, `share()`'s `restored` list is compared by path rather than
`restored.includes(app.user)`. Relatedly, `.map()`/`.filter()`/`.forEach()` over an
observed array hand you the **raw**, identity-stable items (mutating them is silent —
`touch()` after); `for…of` and `.find()` give you proxies.

### `touch()` is the escape hatch

When you mutate state behind the proxy's back — from a raw reference,
inside a `forEach`, after a bulk operation — call `touch()` to
tell tosijs to propagate updates. Most of the time the proxy handles
this automatically. `touch()` is for when it can't.

Every boxed proxy has a `.touch()` method, and there's also a standalone
`touch()` function you can import:

    app.user.name.touch()     // on a scalar
    app.items[2].touch()      // on a list item
    touch(app.items)          // standalone, on an array
    touch('app.user')         // standalone, by path string

For list items with `idPath`, `.touch()` automatically synthesizes the
equivalent id-path touch, so DOM bindings update correctly even when you've
mutated the raw data behind the proxy's back.

`touch()` is also useful for **batch optimization**. If you need to make
many mutations, you can bypass the proxy, mutate the raw data directly,
and call `touch()` once at the end — one notification instead of N:

    const raw = app.items.value
    for (let i = 0; i < raw.length; i++) {
      raw[i].score = computeScore(raw[i])
    }
    touch(app.items)  // single update for all mutations

## The React Comparison, In Short

| React                     | tosijs                              |
| ------------------------- | ----------------------------------- |
| `useState` + `setState`   | assign via `.value`                 |
| `useEffect`               | `observe()` (but rarely needed)     |
| `useMemo` / `useCallback` | not needed — no re-renders to avoid |
| props / prop drilling     | bind directly to any path           |
| Context API               | everything is already global        |
| `key` prop on lists       | `idPath` on list bindings           |
| Virtual DOM diffing       | path-based direct DOM updates       |
| Component re-render       | individual binding updates          |
| ~45kB gzipped             | ~24kB gzipped (`tosijs/core`)       |

The fundamental difference: React asks "what changed?" after every state update
and works backwards to figure out the minimum DOM update. tosijs knows exactly
what changed (the path) and updates exactly the DOM nodes bound to that path.
React is O(tree size). tosijs is O(bindings on the changed path).
