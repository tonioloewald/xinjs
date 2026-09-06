/*{ "order": 6, "description": "The Component base class for building custom elements with tosijs: light-DOM by default, automatic slot composition, initAttributes, form association." }*/
/*#
# Web-Components

**tosijs** provides the abstract `Component` class to make defining custom-elements
easier.

- `Component` leverages the [elements](/elements/) proxy and [css](/css/) to make
defining elements very efficient.
- `Component` makes it easy to create custom-elements with
no shadowDOM but with slotting behavior so your elements are lighter weight and
easier to style.
- It solves friction points like allowing element tagNames to be changed on-the-fly to avoid registry clashes.
- It allows you to deploy `Component` classes as zero dependency [blueprints](/blueprint-loader/) functions.

## Component

To define a custom-element you can subclass `Component`, simply add the properties
and methods you want, with some help from `Component` itself, and then simply
export your new class's `elementCreator()` which is a function that defines your
new component's element and produces instances of it as needed.

```
import {Component} from 'tosijs'

class ToolBar extends Component {
  static preferredTagName = 'tool-bar'
  static shadowStyleSpec = {
    ':host': {
      display: 'flex',
      gap: '10px',
    },
  }
}

export const toolBar = ToolBar.elementCreator()
```

> **Note**: Custom elements default to `display: inline`, which often causes them to
> appear dimensionless. Unless you want this (e.g., for content-holder elements),
> set an explicit `display` value (e.g., `block`, `inline-block`, `flex`) in your
> `:host` styles.

This component is just a structural element. By default a `Component` subclass will
comprise itself and a `<slot>`. You can change this by giving your subclass its
own `content` template.

`static preferredTagName` sets the desired tag name for the custom element.
If omitted, it is derived from the class name (e.g. `ToolBar` → `tool-bar`),
but this does not survive minification. `elementCreator()` returns an
`ElementCreator` function that creates instances of the element.

See [elements](/elements/) for more information on `ElementCreator` functions.

### Component properties

#### content: Element | Element[] | () => Element | () => Element[] | null

Here's a simple example of a custom-element that simply produces a
`<label>` wrapped around `<span>` and an `<input>`. Its value is synced
to that of its `<input>` so the user doesn't need to care about how
it works internally.

```js
import { Component, elements } from 'tosijs'

class LabeledInput extends Component {
  static initAttributes = { caption: 'untitled' }
  value = ''

  content = ({label, span, input}) => label(span(), input())

  connectedCallback() {
    super.connectedCallback()
    const {input} = this.parts
    input.addEventListener('input', () => {
      this.value = input.value
    })
  }

  render() {
    super.render()
    const {span, input} = this.parts
    span.textContent = this.caption
    if (input.value !== this.value) {
      input.value = this.value
    }
  }
}

const labeledInput = LabeledInput.elementCreator()

preview.append(
  labeledInput({caption: 'A text field', value: 'some text'})
)
```

`content` is, in essence, a template for the internals of the element. By default
it's a single `<slot>` element. If you explicitly want an element with no content
you can set your subclass's content to `null` or omit any `<slot>` from its template.

By setting content to be a function that returns elements instead of a collection
of elements you can take customize elements based on the component's properties.
In particular, you can use `onXxxx` syntax sugar to bind events.

(Note that **data bindings do not operate inside a shadowDOM** — binding dispatch
cannot "see" elements there, and a component that tries now gets a console warning
instead of silent failure. The semantically correct model: **a component with a
shadowDOM is bound like an `<input>` or `<textarea>` — its `value` is the binding
surface.** Bind the component itself (e.g. `bindings.value`) from outside; setting
`value` automatically queues `render()` and emits `change`, so implement `render()`
to reflect `value` into the shadow DOM and let `change` events carry edits back out.
How the component represents its value internally is the implementer's business —
which also means shadow components don't compose *bindings* internally: wiring
nested widgets inside a shadow tree is manual (set their `value` in `render()`,
listen to their events). A shadowDOM component is materially a different thing than
a lightDOM component. For non-value internal state, `observe()` + `parts`, with
`unobserve()` on disconnect. **Event sugar is the exception**: `on()` handlers work
inside open shadow roots — composed events cross the boundary and the dispatcher
resolves the true origin via `composedPath()`.)

##### ElementProps in content arrays

When `content` returns an array, any plain objects (ElementProps) in the array are
applied to the **host element** itself, just as they would be applied to the element
being created by `div()`, `span()`, etc. This provides a clean way to set up styles,
event handlers, classes, and bindings on the component from within `content`:

```
class MyButton extends Component {
  static preferredTagName = 'my-button'

  content = ({span}) => [
    { onClick: () => console.log('clicked!'), style: { cursor: 'pointer' } },
    span({part: 'label'}, 'Click me'),
  ]
}
```

Multiple ElementProps objects are merged (later values override earlier ones).
Only plain objects are treated as props — DOM nodes, strings, numbers, and proxied
values pass through as children.

If you'd like to see a more complex example along the same lines, look at
[form and field](https://ui.tosijs.net/form/).

##### <slot> names and the `slot` attribute

```
class MenuBar extends Component {
  static shadowStyleSpec = {
    ':host, :host > slot': {
      display: 'flex',
    },
    ':host > slot:nth-child(1)': {
      flex: '1 1 auto'
    },
  }

  content = ({slot}) => [slot(), slot({name: 'gadgets'})]
}

export menuBar = MenuBar.elementCreator()
```

One of the neat things about custom-elements is that you can give them *multiple*
`<slot>`s with different `name` attributes and then have children target a specific
slot using the `slot` attribute.

This app's layout (the nav sidebar that disappears if the app is in a narrow space, etc.)
is built using just such a custom-element.

#### `<tosi-slot>`

If you put `<slot>` elements inside a `Component` subclass that doesn't have a
shadowDOM, they will automatically be replaced with `<tosi-slot>` elements that
have the expected behavior (i.e. sucking in children in based on their `<slot>`
attribute).

`<tosi-slot>` doesn't support `:slotted` but since there's no shadowDOM, just
style such elements normally, or use `tosi-slot` as a CSS-selector.

Note that you cannot give a `<slot>` element attributes (other than `name`) so if
you want to give a `<tosi-slot>` attributes (such as `class` or `style`), create it
explicitly (e.g. using `elements.tosiSlot()`) rather than using `<slot>` elements
and letting them be switched out (because they'll lose any attributes you give them).

> The legacy name `<xin-slot>` was removed in 1.8.0.

Here's a very simple example:

```js
import { Component, elements } from 'tosijs'

class FauxSlotExample extends Component {
  content = ({h4, h5, tosiSlot}) => [
    h4('This is a web-component with no shadow DOM and working slots!'),
    h5('top slot'),
    tosiSlot({name: 'top'}),
    h5('middle slot'),
    tosiSlot(),
    h5('bottom slot'),
    tosiSlot({name: 'bottom'}),
  ]
}

FauxSlotExample.preferredTagName = 'faux-slot-example'
FauxSlotExample.lightStyleSpec = {
  ':host': {
    display: 'flex',
    flexDirection: 'column'
  },
  ':host h4, :host h5': {
    margin: 0,
  },
  ':host tosi-slot': {
    border: '2px solid grey'
  }
}
const fauxSlotExample = FauxSlotExample.elementCreator()

const { div } = elements

preview.append(
  fauxSlotExample(
    div({slot: 'bottom'}, 'I should be on the bottom'),
    div({slot: 'top'}, 'I should be on the top'),
    div('I should be in the middle')
  )
)
```

> ##### Background
>
> `<slot>` elements do not work as expected in shadowDOM-less components. This is
> hugely annoying since it prevents components from composing nicely unless they
> have a shadowDOM, and while the shadowDOM is great for small widgets, it's
> terrible for composite views and excludes `tosijs`'s data bindings (inside the
> shadow DOM you manage state updates yourself with `observe()` + `parts`;
> `on()` event handlers do work there via `composedPath()`).

#### styleNode: HTMLStyleElement

`styleNode` is the `<style>` element that will be inserted into the element's
`shadowRoot`.

If a `Component` subclass has no `styleNode`, no `shadowRoot` will be
created. This reduces the memory and performance cost of the element.

This is to avoid the performance/memory costs associated with the `shadowDOM`
for custom-elements with no styling.

##### Notes

Styling custom-elements can be tricky, and it's worth learning about
how the `:host` and `:slotted()` selectors work.

It's also very useful to understand how CSS-Variables interact with the
`shadowDOM`. In particular, CSS-variables are passed into the `shadowDOM`
when other CSS rules are not. You can use css rules to modify css-variables
which will then penetrate the `shadowDOM`.

#### refs: {[key:string]: Element | undefined}

    render() {
      super.render() // see note
      const {span, input} = this.parts
      span.textContent = this.caption
      if (input.value !== this.value) {
        input.value = this.value
      }
    }

> **Note**: For form-associated components, `super.render()` syncs the form value
> automatically when the value changes. Always call `super.render()` if you override
> `render()` in a form-associated component.
>
> It is *necessary* to call `super.connectedCallback`, `super.disconnectedCallback`,
> `super.render()` (for form-associated), and `super()` in the `constructor()`
> should you override them.

`this.parts` returns a proxy that provides elements conveniently and efficiently. It
is intended to facilitate access to static elements (it memoizes its values the
first time they are computed).

`this.parts.foo` finds a content element by, in order: `part="foo"` (the preferred
form — it's also what `::part()` styling targets), and finally `foo` as a css
selector — so `this.parts['.foo']` finds a content element with `class="foo"`
while `this.parts.h1` finds an `<h1>`.

A component's `[part]` elements are captured from its content when it hydrates, so
`this.parts.foo` always resolves to **your own** part — never a matching `[part]`
inside a nested component or slotted content.

`parts` only resolves after **hydration** — the content it looks through is
instantiated on `connectedCallback`, not at construction. Reading `parts` on an
uninserted element (e.g. one just back from `elementCreator()`) has nothing to find.
If a public getter needs a ref before the element is guaranteed inserted, gate it on
`this.hydrated` or `await this.whenHydrated` first. (Prior to this you could not ask
whether an element was hydrated without probing `parts`, and that probe permanently
bound the proxy to the light DOM.)

### Component properties

#### content: ((elements: ElementsProxy) => ContentType) | null | ContentType = slot()

A component's content `property` can either be static content (it defaults to being a `<slot>` element) or an arrow function
that creates the basic content of the element on hydration. Static content will be deep-cloned.

By using an arrow function the content created can refer to the custom-element's properties and attributes (and this occurs post-initialization). This also means you can bind event-handlers in the component (which should also be arrow functions unless they don't need to refer to the element)

Because a `content` function is passed the `elements` proxy, you can easily destructure any element creators you need:

```
content = ({div}) => div('hello world')
```

`ContentType` can be an HTMLElement or an array of elements.

> Note that if a component does not use the shadowDOM, its `<slot>` elements will be replaced with `<tosi-slot>` elements.
> This allows composition to work as expected without requiring the shadow DOM.

### Component static properties

#### static contract: ComponentMap  🚧 IN FLUX

> **🚧 THE CONTRACT API IS IN FLUX — expect it to change without a deprecation
> cycle.** Not "experimental" in the shrug sense: the *idea* is settled and the
> feature works. What is unsettled is its shape, and we would rather get that
> right than freeze it early and carry a mistake. Changes will land in patch
> and minor releases, and the CHANGELOG will say so. **Nothing else in
> `Component` is in flux** — `initAttributes`, `content`, `parts`, form
> association and the rest are stable.
>
> Specifically open: how `contract.attributes` and `initAttributes` divide the
> work; whether an integrator's overlay may *embellish* a component's own
> declaration rather than replace it wholesale; and the precedence between the
> two (tosijs#29, #30). It settles when those close.
>
> If you need stability today, declare attributes with `initAttributes` — it is
> stable, it is terser, and since 1.8.1 it is described to agents identically.

A component's self-declaration: what it is, what its attributes and value are
allowed to be, which `part`s it exposes, and a test fixture — in one structure.
It feeds the docs, the agent surface, and `exerciseComponent()`, so a
declaration that lies breaks visibly.

    class Stepper extends Component {
      static preferredTagName = 'my-stepper'
      static initAttributes = { count: 0, mode: 'add' }
      static contract = {
        description: 'increments a counter',
        attributes: { mode: { enum: ['add', 'subtract'] } },
      }
    }

**`initAttributes` DECLARES; `contract.attributes` ENRICHES.** They compose —
declaring both is the intended shape, not an error. `initAttributes` gives a
name, a default and an inferred type; the contract adds constraints the
built-in checker enforces (`enum`, `const`) plus anything a registered schema
engine understands. A contract entry may omit `default` when `initAttributes`
already supplies one, so constraining one attribute costs one line rather than
a rewrite. The contract wins per key.

Both forms are described identically to an agent. (Before 1.8.1 they were not:
attributes were read from the contract alone, so a component using
`initAttributes` — nearly all of them — appeared in the map with no attribute
description at all. tosijs#29.)

### withAttributes: attributes that are typed on `this`

`static initAttributes` installs *instance* properties at hydration, and
TypeScript cannot derive an instance type from a static declared in the same
class. Declare the map as a **value** instead and inference does the work:

    import { withAttributes } from 'tosijs'

    export class Stepper extends withAttributes({
      count: 0,
      mode: 'add',
    })<StepperParts> {
      static preferredTagName = 'my-stepper'

      render() {
        this.count + 1        // number
        this.mode.trim()      // string
        this.nope()           // a type error, as it should be
      }
    }

This is a **move** of the `static initAttributes = {…}` you already had, not an
extra declaration — the same object, somewhere inference can see it. It is the
recommended form for new components.

Until 1.10.0 `Component` carried `[key: string]: any` so those properties would
compile, which had the side effect of accepting *every* typo in *every*
component anyone wrote (tosijs#36). Removing it is why this exists.

- **`static initAttributes` still works and is not deprecated.**
  `withAttributes()` sets it, and it remains the only way to add attributes to
  an **existing** component class — `withAttributes` always extends
  `Component`. Build a base with one, extend and add with the other; they
  compose at runtime, and the subclass's own declaration wins per key:

      class Base extends withAttributes({ label: 'base' }) { … }
      class Sub extends Base {
        static initAttributes = { extra: 7 }   // declare ONLY what you add
      }
      export interface Sub extends ComponentAttrs<typeof Sub.initAttributes> {}

  **Declare only the new keys** — do not spread the base's map in. tosijs
  merges the whole prototype chain, so spreading is redundant, and it hides
  the case the merge exists for.

  **The interface line is required on the subclass**, and it is the one place
  it cannot be avoided: `withAttributes` types the instance for the class it
  creates, and it cannot reach back into a class it did not create, so
  `this.extra` has no type without it. `this.label` is inherited and typed
  already.
- **Computed attributes are excluded from the declared type, deliberately.**
  `Component.computed()` means your class implements the property itself,
  normally as `get`/`set`, so declaring it here as well is what breaks. Its
  setter may call `this.queueRender()`.
- **If you cannot restructure the class**, `ComponentAttrs<T>` says the same
  thing in one line:
  `export interface Widget extends ComponentAttrs<typeof Widget.initAttributes> {}`

#### static initAttributes: Record<string, any>

Declares attributes that should be watched and synced with properties. The keys are
property names (camelCase), and the values are the defaults which also determine the type.

> This is the stable, terse way to declare attributes, and it is what most
> components use. To add *constraints* (`enum`, `const`, …) to an attribute,
> see `static contract` above — the two compose, and you do not have to move a
> declaration to constrain it.

    import { Component } from 'tosijs'

    class MyWidget extends Component {
      static initAttributes = {
        caption: '',      // string attribute
        count: 0,         // number attribute (auto-parsed)
        disabled: false,  // boolean attribute (presence/absence)
      }

      render() {
        // this.caption, this.count, this.disabled are automatically available
        // and synced with HTML attributes
      }
    }

This replaces both the old `initAttributes()` method call AND the instance property
declarations. A single static object now defines which properties are attributes,
their default values, and their types:

- **All-in-one**: Attributes, defaults, and types defined in one place
- **Declarative**: No constructor needed
- **Type inference**: Default values determine parsing (boolean attributes just work)

##### Attribute Types

- **string** (default `''`): Attribute value used as-is
- **number** (default `0`): Attribute value parsed with `parseFloat()`
- **boolean** (default `false`): Presence means `true`, absence means `false`

For non-attribute properties (e.g. objects), just declare them as regular instance
properties on your class.

##### Computed attributes

`Component.computed(shape)` declares an attribute your class implements itself with
an ordinary `get`/`set`. tosijs wraps your setter so a change always re-renders — you
never call `queueRender()` — and the name joins `observedAttributes`, so markup and
`setAttribute` reach your setter too.

The argument is a **shape**, not a default: `''` for string-valued, `false` for
presence-valued. There is no number shape, because markup has no numbers — take the
string and parse it. A getter with no setter is a read-only derived attribute. A
native DOM property name (`title`, `id`, `hidden`, …) throws rather than shadowing
the platform's accessor.

```test
import { Component } from 'tosijs'

// THE REAL-BROWSER TIER MATTERS FOR THIS ONE. The mechanism is
// markup → attributeChangedCallback → your setter, which rides custom-element
// UPGRADE TIMING — what happy-dom models most loosely, and where this project
// has been bitten before. Every unit test for computed attributes runs under
// happy-dom; this fence is what pins the feature in Chromium and Firefox.
test('a computed attribute is set from markup, in a real browser', async () => {
  class NameTag extends Component {
    static preferredTagName = 'doc-name-tag'
    static initAttributes = { fullName: Component.computed('') }
    first = '?'
    last = '?'
    get fullName() {
      return `${this.first} ${this.last}`
    }
    set fullName(v) {
      const [f, ...rest] = String(v).split(' ')
      this.first = f
      this.last = rest.join(' ')
    }
    content = null
  }
  NameTag.elementCreator()

  // parsed from MARKUP, then upgraded — the ordering that matters
  preview.innerHTML = '<doc-name-tag full-name="Grace Hopper"></doc-name-tag>'
  const el = preview.querySelector('doc-name-tag')
  await new Promise((resolve) => setTimeout(resolve, 60))
  expect(el.fullName).toBe('Grace Hopper')
  expect(el.first).toBe('Grace')

  // a post-upgrade setAttribute reaches the setter too
  el.setAttribute('full-name', 'Ada Lovelace')
  await new Promise((resolve) => setTimeout(resolve, 60))
  expect(el.fullName).toBe('Ada Lovelace')

  // and a property write must NOT fire `change` — that is the value-commit
  // signal, and an attribute is not a value
  let changes = 0
  el.addEventListener('change', () => changes++)
  el.fullName = 'Alan Turing'
  await new Promise((resolve) => setTimeout(resolve, 60))
  expect(el.fullName).toBe('Alan Turing')
  expect(changes).toBe(0)
})
```

##### Migration from initAttributes()

Old (deprecated):

    class MyComponent extends Component {
      caption = ''
      count = 0

      constructor() {
        super()
        this.initAttributes('caption', 'count')
      }
    }

New:

    class MyComponent extends Component {
      static initAttributes = { caption: '', count: 0 }
    }

### Component methods

#### queueRender(triggerChangeEvent = false): void

Uses `requestAnimationFrame` to queue a call to the component's `render` method. If
called with `true` it will also trigger a `change` event.

#### private initValue(): void

**Don't call this!** Sets up expected behavior for an `HTMLElement` with
a value (i.e. triggering a `change` events and `render` when the `value` changes).

#### private hydrate(): void

**Don't call this** Appends `content` to the element (or its `shadowRoot` if it has a `styleNode`)

#### connectedCallback(): void

If the class has a `handleResize` handler then a ResizeObserver will trigger
`resize` events on the element when its size changes and `handleResize` will be
set up to respond to them. (The legacy name `onResize` still works but is
deprecated — the `on<Event>` prefix is reserved for event-handler sugar in the
[elements](/elements/) factory, so component members must not use it.) Name by
intent: `handle<Event>` for a handler function the component invokes (e.g.
`handleResize`, `handleClick`), or `add<Event>Listener` for a method that
registers listeners for a synthetic event the component dispatches (e.g.
`addClickListener`).

Also, if the subclass has defined `value`, calls `initValue()`.

`connectedCallback` is a great place to attach **event-handlers** to elements in your component.

Be sure to call `super.connectedCallback()` if you implement `connectedCallback` in the subclass.

#### disconnectedCallback(): void

Be sure to call `super.disconnectedCallback()` if you implement `disconnectedCallback` in the subclass.

#### render(): void

Be sure to call `super.render()` if you implement `render` in the subclass.

### Component static properties

#### Component.elements

    const {label, span, input} = Component.elements

This is simply provided as a convenient way to get to [elements](/elements/)

#### static formAssociated: boolean

Set `static formAssociated = true` in your subclass to enable form participation
via `ElementInternals`. When true, the component will have `this.internals` available
for form integration, validation, ARIA properties, and custom states.

Form-associated components are automatically made focusable (`tabindex="0"`) unless
you explicitly set a different `tabindex`. This is required for form validation to
work correctly (the browser needs to focus invalid elements).

See [web-component-validation](/form-validation/) for the complete validation
API documentation, including:

- Validation methods (`checkValidity()`, `reportValidity()`, `setValidity()`)
- Automatic validation against HTML attributes (`required`, `minlength`, `maxlength`, `pattern`)
- Form lifecycle callbacks (`formResetCallback`, `formDisabledCallback`, `formStateRestoreCallback`)
- Custom states via `this.internals.states`
- Complete examples

#### value property

**If your component has a `value`, it should behave like an `<input>`.**

The `value` property is special in Component. It is NOT an attribute - it's a property
that can be *initialized* from an attribute. Here's what you need to know:

1. **Declare it with a default**: Simply assign a non-undefined default (e.g., `value = ''`)
2. **Initialization**: If a `value` attribute is present, it initializes the property (as a string)
3. **Setting value**: You can set it to any type directly (e.g., objects, arrays)
4. **Change events**: When `value` changes, a `change` event is automatically dispatched
5. **Auto-render**: When `value` changes, `render()` is automatically called
6. **Computed values**: If your value is computed, call `queueRender(true)` to trigger change + render

**Do NOT put `value` in `static initAttributes`** - it will be rejected with a warning.
The Component class handles `value` specially to provide form-like behavior automatically.

#### adoptedCallback

The `adoptedCallback` lifecycle method is called when a component is moved to a different
document, such as into or out of an iframe. Subclasses can implement this directly.

```js
import { Component, elements } from 'tosijs'

class AdoptableWidget extends Component {
  docCount = 0

  content = ({span}) => span({part: 'info'})

  adoptedCallback() {
    this.docCount++
    this.queueRender()
  }

  render() {
    this.parts.info.textContent = `Adopted ${this.docCount} time(s). Document: ${this.ownerDocument.title || 'untitled'}`
  }
}

AdoptableWidget.preferredTagName = 'adoptable-widget'
const adoptableWidget = AdoptableWidget.elementCreator()
const {iframe, button, div, span} = elements

const widget = adoptableWidget()
const widgetSlot = span({class: 'widget-slot'}, widget)
const frame = iframe()
const moveBtn = button('Move to iframe')
const backBtn = button('Move back')

moveBtn.addEventListener('click', () => {
  frame.contentDocument.body.append(frame.contentDocument.adoptNode(widget))
})
backBtn.addEventListener('click', () => {
  widgetSlot.append(document.adoptNode(widget))
})

preview.append(widgetSlot, div(moveBtn, backBtn), frame)
```
```css
.preview .widget-slot {
  display: block;
  min-height: 40px;
  border: 2px dashed #888;
  margin-bottom: 10px;
}
.preview adoptable-widget {
  display: block;
  padding: 10px;
  background: #666;
  color: white;
}
.preview > div { display: flex; gap: 8px; margin-bottom: 10px; }
.preview iframe {
  width: 100%;
  height: 60px;
  border: 2px dashed #888;
  background: #fff;
}
```

### The `contractviolation` event

When a component declares `contract.value` and a **binding** writes a value
that violates it, the write is applied and reported rather than thrown — state
is authoritative on that path, and throwing inside the binding-dispatch loop
would strand every element bound after this one. Alongside the one-time
`console.error`, the component dispatches a bubbling `contractviolation` event
so an app can react programmatically:

```
el.addEventListener('contractviolation', (event) => {
  const { reason, value, schema } = event.detail
  telemetry.record('contract', { tag: el.tagName, reason })
})
```

**It fires once per element per distinct reason, per bad-state episode** — not
once per binding pass, and not only once ever.

Not per pass, because for an object- or array-valued contract the upstream
`value !== newValue` guard never matches (the proxy returns a fresh object on
every access), so an unthrottled dispatch fired on every pass for the life of
the page.

**The latch clears the moment the value stops violating** — a valid value, an
empty field, or `null`. So re-entering a bad state fires again, which is what
makes this usable for a validation banner that hides on correction and has to
come back if the user re-breaks the field:

```
el.addEventListener('contractviolation', ({ detail }) => showBanner(detail.reason))
// and clear the banner on your own valid-input path
```

A listener therefore counts *episodes*, not binding-dispatch frequency — which
is the number you actually wanted.

A **direct** write (`el.value = bad`) still throws instead — no event, because
the caller is right there to catch it.

### Component static properties

#### `static preferredTagName?: string`

Sets the desired tag name for the custom element. If omitted, it is derived
from the class name (e.g. `ToolBar` → `tool-bar`), but this does **not** survive
minification. If the tag is already in use, a unique anonymous tag is generated.

#### `static shadowStyleSpec?: TosiStyleSheet`

Styles injected into the component's shadow DOM as a `<style>` element.
Setting this property causes the component to use shadow DOM.

#### `static lightStyleSpec?: TosiStyleSheet`

Global styles appended to `document.head` when the first instance is inserted
in the DOM. `:host` selectors are automatically rewritten to the tag name, e.g.:

    class ToolBar extends Component {
      static preferredTagName = 'tool-bar'
      static lightStyleSpec = {
        ':host': {
          display: 'flex',
          padding: 'var(--toolbar-padding, 0 8px)',
          gap: '4px'
        }
      }
    }

produces `tool-bar { display: flex; ... }` in a global `<style>` element.

#### `static extends?: string`

For customized built-in elements. Passed as `{ extends }` to `customElements.define()`.

### Component static methods

#### Component.elementCreator(): ElementCreator

    export const toolBar = ToolBar.elementCreator()

Returns a function that creates the custom-element. Registration uses
`preferredTagName`, `lightStyleSpec`, `shadowStyleSpec`, and `extends`
from the class's static properties.

`elementCreator` is memoized and only generated once.

**Naming the creator's type: use `ElementCreator<YourComponent>`.**

    import type { ElementCreator } from 'tosijs'

    let toolBar: ElementCreator<ToolBar>
    toolBar = ToolBar.elementCreator()
    toolBar().someMethodOfYours()      // typed

The natural-looking alternative silently loses the type:

    // DON'T — resolves to unknown
    let toolBar: ReturnType<typeof ToolBar.elementCreator>
    toolBar().someMethodOfYours()      // TS18046: 'toolBar()' is of type 'unknown'

`elementCreator` is declared `static elementCreator<C = Component>(this: new ()
=> C)`, so the component type is inferred from `this`. `ReturnType<>` does not
bind `this`, so `C` falls back and the result is `unknown` — with no error at
the declaration, only later at every use. This accounted for 156 of the
type errors in tosijs's own test suite before it was noticed.

> **Deprecated:** Passing `{ tag, styleSpec, extends }` as options to
> `elementCreator()` still works but emits deprecation warnings.
> Use the static properties instead.

## Examples

[tosijs-ui](https://ui.tosijs.net) is a component library built using this `Component` class
that provides the essential additions to standard HTML elements needed to build many
user-interfaces.

- [live-example](https://ui.tosijs.net/live-example/) uses multiple named slots to implement
  powers the interactive examples used for this site.
- [side-nav](https://ui.tosijs.net/side-nav/) implements the sidebar navigation
  used on this site.
- [data-table](https://ui.tosijs.net/data-table/) implements virtualized tables
  with resizable, reorderable, sortable columns that can handle more data
  than you're probably willing to load.
- [form and field](https://ui.tosijs.net/form/) allow you to
  quickly create forms that leverage all the built-in functionality of `<input>`
  elements (including powerful validation) even for custom-fields.
- [markdown-viewer](https://ui.tosijs.net/markdown-viewer/) uses `marked` to render
  markdown.
- [babylon-3d](https://ui.tosijs.net/babylon-3d/) lets you easily embed 3d scenes
  in your application using [babylonjs](https://babylonjs.com/)
*/
import { css } from './css'
import { TosiStyleSheet } from './css-types'
import { settings } from './settings'
import { deepClone } from './deep-clone'
import {
  appendContentToElement,
  dispatch,
  resizeObserver,
  isBindingWrite,
} from './dom'
import { ElementsProxy } from './elements-types'
import {
  elements,
  elementSet,
  mergeElementProps,
  classifyPositional,
  positionalWarning,
} from './elements'
import { validateAgainstConstraints } from './form-validation'
import { camelToKabob, kabobToCamel } from './string-case'
import { ElementCreator, ContentType, PartsMap } from './xin-types'
import { warnDeprecated, BOUND_SELECTOR } from './metadata'
import {
  contractViolation,
  setContractValidator,
  ownContract,
} from './contract-check'
import type { ComponentMap } from './agent'

let anonymousElementCount = 0

// ---------------------------------------------------------------------------
// component contract enforcement — a contract is an OPT-IN to being held to
// it: components without one behave exactly as before. The validator itself
// (structural subset + pluggable full-schema engine) lives in
// contract-check.ts, shared with inline element contracts on the agent
// surface — one gate, every declaration site.
export { setContractValidator }

// warned once per tag+reason about a contract violation arriving via a binding
const bindingViolationWarned = new Set<string>()

// once per tag: a value contract the component's own accessor prevents us
// from enforcing (see initValue)
const inertContractWarned = new Set<string>()

/**
 * The marker `Component.computed()` returns, and the guard against wrapping a
 * setter twice (a subclass would otherwise double-queue every render).
 */
const COMPUTED_ATTRIBUTE = Symbol('tosi-computed-attribute')
const wrappedComputedSetters = new WeakSet<(value: any) => void>()

export interface ComputedAttribute {
  [COMPUTED_ATTRIBUTE]: true
  /** '' or false — records whether markup delivers a string or presence */
  shape: string | boolean
}

const isComputedAttribute = (v: any): v is ComputedAttribute =>
  v != null && typeof v === 'object' && v[COMPUTED_ATTRIBUTE] === true

// per element, the violation reasons already announced on the `contractviolation`
// channel. WeakMap so a removed element takes its history with it — a
// long-lived page that mounts and discards many components must not accumulate
// keys for elements nobody holds any more.
const violationsDispatched = new WeakMap<any, Set<string>>()

const checkValueContract = (el: any, newValue: any): void => {
  const cls = el.constructor
  const schema = ownContract(cls)?.value
  if (schema == null) return
  const err = contractViolation(newValue, schema)
  if (err == null) {
    // RECOVERY CLEARS THE LATCH. Without this the dedupe below is one-way:
    // bad → event, valid → nothing, the SAME bad again → silence. An app
    // showing a validation banner on `contractviolation` could never re-show
    // it after the user corrected and re-broke the value, which makes the
    // channel useless for the thing it is most obviously for.
    violationsDispatched.delete(el)
    // the console channel is latched too, and the CHANGELOG promises recovery
    // works "on both the event and the console" — so clear both, or that is
    // half true. Keyed by tag+reason, so this clears every reason for the tag.
    const validTag = el.tagName?.toLowerCase()
    for (const k of [...bindingViolationWarned]) {
      if (k.startsWith(`${validTag}: `)) bindingViolationWarned.delete(k)
    }
    return
  }
  const tag = el.tagName?.toLowerCase()
  if (isBindingWrite()) {
    // STATE IS AUTHORITATIVE on this path. Throwing here would abort the
    // whole binding-dispatch loop and strand every element bound after this
    // one (and would fire spuriously before data arrives). Report, assign,
    // and let the app keep running — the DOM must still reflect state.
    if (newValue == null || newValue === '') {
      // AN EMPTY FIELD IS NOT CURRENTLY VIOLATING, so it must clear the latch
      // exactly as a valid value does. This returned FIRST, before any latch
      // handling — and `''` is not valid against `{ type: 'number' }`, so it
      // never reached the clear on the valid path either. The result was that
      // the sequence a user actually performs (type `bad`, select-all-delete,
      // type `bad` again) fired ONE event, and the rc.3 test stepped around it
      // by recovering to a valid `5` instead of to empty. Same for null — a
      // model reset.
      violationsDispatched.delete(el)
      bindingViolationWarned.delete(`${tag}: ${err}`)
      return // pre-data, not a defect
    }
    const key = `${tag}: ${err}`
    if (!bindingViolationWarned.has(key)) {
      bindingViolationWarned.add(key)
      console.error(
        `<${tag}> value contract violation from a BINDING: ${err}. The value ` +
          `was applied anyway (state is authoritative on this path) — fix the ` +
          `state, the contract, or the binding. Direct writes still throw.`
      )
    }
    // ONE EVENT PER ELEMENT PER REASON, not one per binding pass.
    //
    // The console.error beside this is warn-once; the dispatch was not — and
    // for an OBJECT- or ARRAY-valued contract it fired on every single binding
    // write, forever, because the `value !== newValue` guard upstream never
    // matches: the xin proxy returns a fresh proxy per access, so a repeated
    // write of "the same" object is never identity-equal. A persistently
    // violating contract therefore dispatched a bubbling event on every pass
    // for the life of the page.
    //
    // Deduping is a semantic change and worth being explicit about: this IS
    // the programmatic channel, so a listener that was counting occurrences
    // now counts distinct (element, reason) pairs instead. That is the more
    // useful number — the old one measured binding-dispatch frequency, not
    // violations — and an unbounded event storm is not a channel anyone can
    // actually consume.
    //
    // The latch is cleared the moment a VALID value arrives (see the early
    // return above), so the pair is "fires on entering a bad state, again on
    // re-entering it after recovery" — which is what a validation banner
    // needs. There is no `detail.repeated`: it was published as a way to tell
    // the two apart, but it was hard-coded `false` at the only dispatch site,
    // so it could never have told anyone anything.
    const seen = violationsDispatched.get(el) ?? new Set<string>()
    const already = seen.has(err)
    if (!already) {
      seen.add(err)
      violationsDispatched.set(el, seen)
      el.dispatchEvent?.(
        new CustomEvent('contractviolation', {
          bubbles: true,
          detail: { reason: err, value: newValue, schema },
        })
      )
    }
    return
  }
  throw new TypeError(`<${tag}> value contract violation: ${err}`)
}

// contract.attributes subsumes initAttributes: cache the derived map per
// class (never mutate the class), warn/throw toward the ideal exactly once
const derivedInitAttributes = new WeakMap<Function, Record<string, any>>()

/** tag-name literal → element type, for parts declared in a component contract */
type TagToElement<T> = T extends keyof HTMLElementTagNameMap
  ? HTMLElementTagNameMap[T]
  : Element

/**
 * Resolve the `parts` type from the Component generic. Two shapes are
 * accepted in the same slot:
 *
 * - a classic PartsMap (`{ readout: HTMLSpanElement }`) — used as-is;
 * - `typeof <contract>` (declare the contract `as const` so tags stay
 *   literal) — parts derive from `contract.parts` tag names, so THE
 *   DECLARATION IS THE TYPE, and the same declaration feeds describe(),
 *   exerciseComponent(), and this.parts typing.
 *
 * **"The declaration is the type" is ADDITIVE, not exhaustive** — worth
 * stating because the phrase oversells it. The derived shape is intersected
 * with `PartsMap` (`Record<string, Element>`), which it has to be: parts
 * resolve lazily by `[part]` attribute, so an undeclared part is a legitimate
 * runtime lookup, not an error. The cost is that a TYPO also typechecks —
 * `this.parts.readuot` is `Element` to tsc and throws when nothing matches.
 *
 * So the declaration buys you precise types for what you DID declare
 * (`this.parts.readout` is `HTMLSpanElement`, not `Element`); it does not
 * close the set. If you want the closed behaviour, the check that catches it
 * is `exerciseComponent()`, which verifies every declared part resolves and
 * matches its declared tag at runtime.
 */
export type PartsOf<T> = T extends {
  parts: infer P extends Record<string, string>
}
  ? { [K in keyof P]: TagToElement<P[K]> } & PartsMap
  : T extends Record<string, Element>
  ? T // classic PartsMap, verbatim
  : T extends ComponentMap
  ? PartsMap // a contract with no parts declared — untyped parts
  : T

function anonElementTag(): string {
  return `custom-elt${(anonymousElementCount++).toString(36)}`
}
let instanceCount = 0

// Component classes already warned about inert bind/on sugar in shadow content
const warnedShadowContentBindings = new Set<string>()

// Component classes already warned about class fields shadowing initAttributes
const warnedFieldShadowedAttrs = new Set<string>()

// Marks a prototype whose connectedCallback has already been wrapped to drain
// deferred constructor-time attribute ops before the subclass body runs.
const DRAIN_WRAPPED = Symbol('tosiDrainWrapped')

// Classes already checked for on<Event>-named member collisions (warn once each).
const handlerCollisionChecked = new WeakSet<new () => Component>()
// warn once per tag+attribute about a type-contradicting attribute write
const attrTypeMismatchWarned = new Set<string>()

// Lazy shared MutationObserver for deprecated initAttributes
let legacyAttributeObserver: MutationObserver | null = null

function getLegacyAttributeObserver(): MutationObserver {
  if (legacyAttributeObserver === null) {
    legacyAttributeObserver = new MutationObserver((mutationsList) => {
      const componentsToRender = new Set<Component>()
      for (const mutation of mutationsList) {
        if (
          mutation.type === 'attributes' &&
          mutation.target instanceof Component
        ) {
          const component = mutation.target as Component
          const attrName = kabobToCamel(mutation.attributeName!)
          if (component._legacyTrackedAttrs?.has(attrName)) {
            componentsToRender.add(component)
          }
        }
      }
      for (const component of componentsToRender) {
        component.queueRender(false)
      }
    })
  }
  return legacyAttributeObserver
}

interface ElementCreatorOptions extends ElementDefinitionOptions {
  tag?: string
  styleSpec?: TosiStyleSheet
}

const globalStyleSheets: {
  [key: string]: string
} = {}

function setGlobalStyle(tagName: string, styleSpec: TosiStyleSheet) {
  const existing = globalStyleSheets[tagName]
  const processed = css(styleSpec)
    .replace(/:host\(([^)]+)\)/g, `${tagName}$1`)
    .replace(/:host\b/g, tagName)
  globalStyleSheets[tagName] = existing
    ? existing + '\n' + processed
    : processed
}

function insertGlobalStyles(tagName: string) {
  if (globalStyleSheets[tagName]) {
    document.head.append(
      elements.style({ id: tagName + '-component' }, globalStyleSheets[tagName])
    )
  }
  delete globalStyleSheets[tagName]
}

// Collect a light-DOM component's OWN [part] elements from its content tree
// *before* it is inserted. At this point the tree is exactly what the component
// built: function content is not cloned, and nested sub-components have not
// hydrated (so they have not slotted anything and declared none of their own
// parts yet). Every [part] here is therefore unambiguously this component's own,
// independent of slots or whether a sub-component is light- or shadow-DOM. First
// occurrence in tree order wins.
function capturePartsFrom(content: unknown): Record<string, Element> {
  const parts: Record<string, Element> = Object.create(null)
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(visit)
      return
    }
    if (!(node instanceof Element)) return
    const part = node.getAttribute('part')
    if (part != null && !(part in parts)) parts[part] = node
    for (const child of Array.from(node.children)) visit(child)
  }
  visit(content)
  return parts
}

/**
 * Dynamic property access on a component, said OUT LOUD at the call site.
 *
 * `Component` used to carry `[key: string]: any` so that the handful of places
 * indexing by a runtime attribute name would compile. That turned off property
 * checking for every subclass anyone wrote, forever, to serve four call sites
 * (tosijs#36). The cost now lands where the dynamism actually is.
 */
const dynamic = (el: unknown): Record<string, any> => el as Record<string, any>

/**
 * The instance properties a component's `static initAttributes` installs.
 *
 * `initAttributes` keys become instance properties at hydration, which the
 * type system cannot infer from a static. Declare them in ONE line, using the
 * same declaration-merging trick `Component` uses internally:
 *
 *     export class Widget extends Component {
 *       static initAttributes = { month: 0, label: '' }
 *       render() { this.month + 1; this.label.trim() }   // typed, not `any`
 *     }
 *     export interface Widget extends ComponentAttrs<typeof Widget.initAttributes> {}
 *
 * You get real types (`number`, `string`) instead of the `any` the old
 * `[key: string]: any` index signature handed out — and typos still fail,
 * which is the point (tosijs#36).
 */
export type ComponentAttrs<T> = { -readonly [K in keyof T]: T[K] }

/**
 * Declare a component's attributes as a VALUE, and get them typed on `this`.
 *
 *     export class TosiMonth extends withAttributes({
 *       month: 0,
 *       label: '',
 *     })<MonthParts> {
 *       render() {
 *         this.month + 1        // number
 *         this.label.trim()     // string
 *         this.nope()           // still a type error
 *       }
 *     }
 *
 * THE UNDERLYING PROBLEM: `static initAttributes` installs *instance*
 * properties at hydration, and TypeScript cannot derive an instance type from
 * a static declared in the same class — so `this.month` was only ever typed by
 * `Component`'s `[key: string]: any`, which typed it as `any` and, far worse,
 * accepted every typo in every component anyone wrote (tosijs#36).
 *
 * Passing the map as a value instead lets inference do the work: there is no
 * extra declaration to write and keep in step, and the attribute types are
 * read off the object you already had. `static initAttributes` still works
 * exactly as before — this is additive, and the two forms produce the same
 * runtime.
 */
/**
 * The attributes `withAttributes` declares ON the instance.
 *
 * COMPUTED attributes are deliberately excluded: `Component.computed()` means
 * "this class implements the property itself", normally as `get`/`set`. If the
 * synthesised base declared them too, every computed attribute would be a
 * property in the base and an accessor in the derived class — TS2611 — and its
 * type would be the `ComputedAttribute` marker rather than what the accessor
 * actually returns. Omitting them is not a workaround: the class IS the
 * declaration for those, which is the whole point of `computed()`.
 */
export type DeclaredAttributes<A> = {
  [K in keyof A as A[K] extends ComputedAttribute ? never : K]: A[K]
}

/**
 * What `withAttributes()` returns — NAMED, because an anonymous intersection
 * cannot be written into a downstream declaration file.
 *
 * tosijs-ui hit this adopting 1.10.0 (tosijs#38): `tsc --noEmit` was clean and
 * `tsc --declaration` failed with **TS2742** on all 34 migrated files —
 * "the inferred type of 'TosiMonth' cannot be named without a reference to
 * '../node_modules/tosijs/dist/component.js'". The pieces were all nameable;
 * the intersection was not, and `dist/component.d.ts` is not reachable through
 * `package.json` `exports`. So the package would have shipped JS with no types
 * for every component built this way — and it is not fixable downstream: a
 * named base const moves the error verbatim, and a `paths` mapping emits an
 * import their own consumers cannot resolve.
 *
 * Naming it here is the whole fix: `dist/` layout stays private, and a
 * downstream author who needs an explicit annotation has something to write.
 */
export type WithAttributes<A extends Record<string, any>> = (new <
  T = PartsMap
>() => Component<T> & DeclaredAttributes<A>) &
  Omit<typeof Component, 'prototype' | 'initAttributes'> & {
    initAttributes: Record<string, any>
  }

export const withAttributes = <A extends Record<string, any>>(
  initAttributes: A
): WithAttributes<A> => {
  class ComponentWithAttributes extends Component {
    static initAttributes = initAttributes
  }
  // THE STATIC IS TYPED WIDE ON PURPOSE; the INSTANCE keeps the precise
  // `DeclaredAttributes<A>`.
  //
  // Typing the static as `A` (its exact literal type) made a subclass unable
  // to declare attributes of its own: `class Sub extends Base { static
  // initAttributes = { extra: 7 } }` is a static-side conflict, TS2417
  // "Property 'label' is missing in type '{ extra: number }'". That is the
  // documented migration shape, so the typing forbade the thing the docs
  // recommend — and the runtime dropped the base's attributes at the same
  // time (fixed in `_resolveInitAttributes`). Nothing reads the static's
  // narrow type: the instance shape comes from `DeclaredAttributes<A>`
  // above, which is what types `this.label`.
  //
  // A subclass ADDING attributes still has to say so for `this.extra` to
  // type — withAttributes cannot reach back into a class it did not create.
  // The one-liner declares an interface over the subclass's own
  // initAttributes with ComponentAttrs; Migration.md has the exact form.
  //
  // (The form is described rather than shown on purpose — see UPSTREAM.md,
  // tjs-lang#51. Comment text here can change what the converter emits.)
  return ComponentWithAttributes as unknown as WithAttributes<A>
}

export abstract class Component<T = PartsMap> extends HTMLElement {
  static elements: ElementsProxy = elements
  private static _elementCreator?: ElementCreator<Component>
  static initAttributes?: Record<string, any>
  static formAssociated?: boolean
  static preferredTagName?: string
  static shadowStyleSpec?: TosiStyleSheet
  static lightStyleSpec?: TosiStyleSheet
  static extends?: string
  internals?: ElementInternals

  // Form validation API - delegated to internals when formAssociated
  get validity(): ValidityState | undefined {
    return this.internals?.validity
  }

  get validationMessage(): string {
    return this.internals?.validationMessage ?? ''
  }

  get willValidate(): boolean {
    return this.internals?.willValidate ?? false
  }

  checkValidity(): boolean {
    return this.internals?.checkValidity() ?? true
  }

  reportValidity(): boolean {
    return this.internals?.reportValidity() ?? true
  }

  setCustomValidity(message: string): void {
    if (this.internals) {
      if (message) {
        this.internals.setValidity({ customError: true }, message)
      } else {
        this.internals.setValidity({})
      }
    }
  }

  /**
   * Set validation state. Pass empty flags {} to clear validity.
   * The anchor element is used for focus when reportValidity() is called.
   */
  setValidity(
    flags: ValidityStateFlags,
    message?: string,
    anchor?: HTMLElement
  ): void {
    this.internals?.setValidity(flags, message, anchor)
  }

  /**
   * Set the form value. Call this when your component's value changes.
   */
  setFormValue(
    value: File | string | FormData | null,
    state?: File | string | FormData | null
  ): void {
    this.internals?.setFormValue(value, state)
  }

  /**
   * The attribute map the machinery actually uses. The two declaration forms
   * COMPOSE — they are not rivals:
   *
   * - `static initAttributes` DECLARES: name + default, type inferred. Terse,
   *   and what nearly every component uses.
   * - `contract.attributes` ENRICHES: the same, plus constraints the built-in
   *   checker enforces (`enum`, `const`) and anything a registered schema
   *   engine adds.
   *
   * A key in both is the INTENDED composition — declare it tersely, then
   * constrain it — so a contract entry may omit `default` when the key is
   * already declared in `initAttributes`. The contract wins per key.
   *
   * This used to THROW when a class declared both, which was wrong twice over:
   * the same two declarations split across a prototype chain already merged
   * cleanly (identical intent, opposite outcome, decided only by placement),
   * and "one source of truth" is a property of an attribute NAME, not of a
   * class — two disjoint declarations create no ambiguity at all. tosijs#29.
   */
  static _resolveInitAttributes(): Record<string, any> | undefined {
    const declaredContract = ownContract(this)
    const ownInit = Object.prototype.hasOwnProperty.call(this, 'initAttributes')
      ? this.initAttributes
      : undefined
    if (declaredContract?.attributes != null) {
      const cached = derivedInitAttributes.get(this)
      if (cached != null) return cached
      // initAttributes is the BASE layer; contract.attributes overlays it.
      const derived: Record<string, any> = { ...(ownInit ?? {}) }
      const missingDefaults: string[] = []
      for (const [name, schema] of Object.entries(
        declaredContract.attributes
      )) {
        if (schema != null && 'default' in (schema as any)) {
          derived[name] = (schema as any).default
        } else if (!(name in derived)) {
          // no default anywhere: the machinery infers an attribute's runtime
          // type from its default, so there is nothing to infer from. A
          // contract entry WITHOUT `default` is fine when initAttributes
          // already supplied one — that is the point of composing.
          missingDefaults.push(name)
        }
      }
      if (missingDefaults.length > 0) {
        throw new Error(
          `${this.name} contract.attributes entries missing 'default': ` +
            `${missingDefaults.join(', ')} — the attribute machinery infers ` +
            `each attribute's runtime type from its default, so every ` +
            `declared attribute needs one, either here or in ` +
            `static initAttributes.`
        )
      }
      // INHERITANCE: a subclass declaring contract.attributes must not
      // silently drop the base class's initAttributes. `hasOwnProperty`
      // skips the same-class BOTH-declared throw for inherited ones, so
      // without this merge `Child.observedAttributes` lost every inherited
      // name and reflection was severed in both directions — no throw, no
      // warning. That is exactly the intended migration shape (add a
      // contract to a subclass of an initAttributes base), so merge with
      // the subclass winning per key.
      const inherited = Object.getPrototypeOf(this) as typeof Component
      const inheritedAttrs =
        typeof inherited?._resolveInitAttributes === 'function'
          ? inherited._resolveInitAttributes()
          : undefined
      const merged =
        inheritedAttrs != null ? { ...inheritedAttrs, ...derived } : derived
      derivedInitAttributes.set(this, merged)
      return merged
    }
    // NO NUDGE HERE ANY MORE. This used to warn that attributes "ideally live
    // in the contract … so one declaration feeds the types, the docs, the
    // agents, and the tests" — whose only real force was the agents clause,
    // and that was true only because `initAttributes` never reached
    // `describe()`. It does now (see `_describedAttributes`), so the nudge
    // pushed people toward the verbose form for a reason that no longer
    // exists — and toward the form with, at last count, far fewer users than
    // the one it was nudging them away from. tosijs#29.
    // SAME INHERITANCE RULE AS THE CONTRACT BRANCH ABOVE. This used to be a
    // bare `return this.initAttributes` — a STATIC lookup, so a subclass's own
    // `static initAttributes` shadowed the base's entirely:
    //
    //   class Base extends withAttributes({ label: 'base' }) {}
    //   class Sub extends Base { static initAttributes = { extra: 7 } }
    //   Sub.observedAttributes  // ['hidden', 'extra'] — `label` GONE
    //   sub.label               // undefined, and setAttribute never fixes it
    //
    // Reflection was severed in both directions with no throw and no warning,
    // while the contract branch twenty lines up did exactly this merge and its
    // comment called dropping the base's attributes the defect it is. The two
    // branches disagreed about the same question, decided only by whether a
    // contract happened to be present — and the documented migration path
    // (a `withAttributes` base, subclasses adding attributes) went through the
    // branch that was wrong.
    // A CLASS THAT DECLARES NOTHING MUST STILL INHERIT THE RESOLVED MAP.
    //
    // This used to `return this.initAttributes` — a static prototype-chain
    // lookup for the RAW value, which finds the nearest ancestor's OWN static
    // and stops there. So the merge survived exactly one level:
    //
    //   class A extends withAttributes({ a: 'a' }) {}
    //   class B extends A { static initAttributes = { b: 'b' } }
    //   class C extends B {}          // declares nothing — the commonest kind
    //   C.observedAttributes          // ['hidden', 'b'] — 'a' GONE again
    //
    // Silently, reflection severed both ways: the very defect this function
    // was fixed for, one level further down, while the docs had just started
    // promising "tosijs merges the whole prototype chain for you". Ask the
    // ancestor for its RESOLVED map instead of reading the raw static.
    if (ownInit == null) {
      const parent = Object.getPrototypeOf(this) as typeof Component
      return typeof parent?._resolveInitAttributes === 'function'
        ? parent._resolveInitAttributes()
        : this.initAttributes
    }
    const cachedPlain = derivedInitAttributes.get(this)
    if (cachedPlain != null) return cachedPlain
    const inheritedPlain = Object.getPrototypeOf(this) as typeof Component
    const inheritedPlainAttrs =
      typeof inheritedPlain?._resolveInitAttributes === 'function'
        ? inheritedPlain._resolveInitAttributes()
        : undefined
    if (inheritedPlainAttrs == null || inheritedPlainAttrs === ownInit) {
      return ownInit
    }
    const mergedPlain = { ...inheritedPlainAttrs, ...ownInit }
    derivedInitAttributes.set(this, mergedPlain)
    return mergedPlain
  }

  /**
   * Declare an attribute the class computes itself.
   *
   *     static initAttributes = {
   *       fullName: Component.computed(''),      // markup delivers a string
   *       collapsed: Component.computed(false),  // presence = true
   *     }
   *     get fullName() { return `${this.first} ${this.last}` }
   *     set fullName(v: string) { … }            // MUST tolerate a string
   *
   * The class owns the value; tosijs owns the attribute-ness. Your setter is
   * wrapped so a change always re-renders — you never call `queueRender()`
   * yourself — and the name lands in `observedAttributes`, so markup changes
   * re-render too.
   *
   * The argument is a SHAPE, not a default: `''` for string-valued, `false`
   * for presence-valued. There is no number shape, because markup has no
   * numbers — take the string and parse it in your setter.
   *
   * A getter with no setter is legal, and means a read-only derived attribute.
   */
  static computed(shape: string | boolean = ''): ComputedAttribute {
    return { [COMPUTED_ATTRIBUTE]: true, shape }
  }

  /**
   * The attributes as an AGENT should see them — `{ type, default }` per name,
   * however they were declared.
   *
   * THE BUG THIS EXISTS TO FIX (tosijs#29): `describe()` read a component's
   * attributes from `static contract` alone, so a component declaring
   * `static initAttributes` — the terse form nearly every component uses, and
   * the only one the component reference documents — appeared in the map with
   * NO attribute description at all. The agent surface could see the element
   * and what its value was bound to, and had no idea what attributes it had.
   * The majority API was invisible to the feature 1.8.0 was named for.
   *
   * Types are inferred exactly as the attribute machinery infers them, from
   * the default — including through a `Component.computed()` marker, whose
   * `shape` IS the type example. A `contract.attributes` entry wins per key,
   * because it is the richer statement (it can carry `enum`/`const`).
   */
  static _describedAttributes(): Record<string, any> | undefined {
    const resolved = this._resolveInitAttributes()
    const declared = ownContract(this)?.attributes
    if (resolved == null) return declared
    const described: Record<string, any> = {}
    for (const [name, value] of Object.entries(resolved)) {
      const shape = isComputedAttribute(value) ? value.shape : value
      described[name] = { type: typeof shape, default: shape }
    }
    return declared != null ? { ...described, ...declared } : described
  }

  static get observedAttributes(): string[] {
    const initAttrs = this._resolveInitAttributes()
    if (initAttrs) {
      return ['hidden', ...Object.keys(initAttrs).map(camelToKabob)]
    }
    return ['hidden']
  }
  instanceId!: string
  styleNode?: HTMLStyleElement
  static styleSpec?: TosiStyleSheet
  static styleNode?: HTMLStyleElement
  content: ContentType | ((e: typeof elements) => ContentType) | null =
    elements.slot()
  isSlotted?: boolean
  private static _tagName: null | string = null
  static get tagName(): null | string {
    return this._tagName
  }

  /*
   * THE MEMBERS THE INDEX SIGNATURE WAS HIDING. (tosijs#36.)
   *
   * `Component` declared `[key: string]: any`, which propagates to every
   * subclass — so `this.definitelyNotAMethod()` typechecked in every component
   * anyone wrote, and a deleted method compiled clean. Reported after five
   * methods were lost to a mis-splice: typecheck green, 312 tests green, and
   * the failure surfaced by clicking on the page.
   *
   * Removing it revealed that the library was leaning on it too. These are
   * real members that were simply never declared — `value` most of all, which
   * the component reference documents as *the* special property. They are
   * declared now (in `component-augment.d.ts`, for the reasons noted below),
   * and the accesses that are genuinely dynamic say so at the call site
   * instead of the whole class paying for them.
   */
  /*
   * `value`, `_value`, `defaultValue`, `handleResize`, `onResize` and
   * `_onResize` are DELIBERATELY NOT DECLARED HERE, and a comment that once
   * claimed they were declared "by interface merging below" was describing a
   * merge that does not exist — it was abandoned when `tjs convert` rejected
   * it (tjs-lang#49) and the comment outlived it. Caught by review, not tsc.
   *
   * Declaring them on the class is a trap in three directions:
   *   - a bare field is EMITTED under ES2022 class-field semantics, installing
   *     `undefined` own-properties that tripped the on<Event> collision guard;
   *   - a base PROPERTY makes `get value()` in a subclass TS2611;
   *   - a base ACCESSOR makes `value = ''` in a subclass TS2610.
   * The last two are both how real components are written, so any single
   * declaration here breaks somebody.
   *
   * A `declare module` augmentation in a `.d.ts` was tried and rejected by tsc
   * (TS2428, identical-type-parameters, against a generic class). So: your
   * component declares its own `value` — which every component that has one
   * already does, and which the runtime already requires (`initValue()` no-ops
   * without an own descriptor or a `contract.value`). Documented in
   * Migration.md under 1.10.0.
   */
  // For legacy initAttributes method - tracks which attrs this instance watches
  _legacyTrackedAttrs?: Set<string>
  // Tracks attribute values for property accessors
  private _attrValues?: Map<string, any>
  // Tracks whether value changed (for form sync in render)
  private _valueChanged = false
  // Queue of attribute mutations deferred from the constructor (see
  // _installAttributeQueue / _drainPendingAttrOps).
  private _pendingAttrOps?: Array<['set', string, string] | ['remove', string]>

  static StyleNode(styleSpec: TosiStyleSheet): HTMLStyleElement {
    console.warn('StyleNode is deprecated, use static shadowStyleSpec instead')
    return elements.style(css(styleSpec))
  }

  static elementCreator<C = Component>(
    this: new () => C,
    options: ElementCreatorOptions = {}
  ): ElementCreator<C> {
    /*
     * THE CLASS, TYPED AS THE CLASS. This said `as unknown as Component` —
     * the INSTANCE type — inside a static method, where `this` is the
     * constructor. Every static access through it (`preferredTagName`,
     * `_tagName`, `lightStyleSpec`, `extends`, `_elementCreator`) was
     * therefore wrong, and compiled only because `Component` carried a
     * `[key: string]: any` index signature that answered for anything
     * (tosijs#36).
     */
    const componentClass = this as unknown as typeof Component
    if (
      !Object.prototype.hasOwnProperty.call(componentClass, '_elementCreator')
    ) {
      // Deprecation warnings for options-based API
      if (options.tag !== undefined) {
        warnDeprecated(
          'elementCreator-tag',
          'Passing tag to elementCreator() is deprecated. Use static preferredTagName instead.'
        )
      }
      if (options.styleSpec !== undefined) {
        warnDeprecated(
          'elementCreator-styleSpec',
          'Passing styleSpec to elementCreator() is deprecated. Use static lightStyleSpec instead.'
        )
      }
      if (options.extends !== undefined) {
        warnDeprecated(
          'elementCreator-extends',
          'Passing extends to elementCreator() is deprecated. Use static extends instead.'
        )
      }

      // Resolve tag: options.tag > static preferredTagName > camelToKabob > anon
      let tagName: string | null | undefined =
        options.tag ?? componentClass.preferredTagName
      if (tagName == null) {
        if (
          typeof componentClass.name === 'string' &&
          componentClass.name !== ''
        ) {
          tagName = camelToKabob(componentClass.name)
          if (tagName.startsWith('-')) {
            tagName = tagName.slice(1)
          }
        } else {
          tagName = anonElementTag()
        }
      }
      if (customElements.get(tagName) != null) {
        console.warn(`${tagName} is already defined`)
      }
      if (tagName.match(/\w+(-\w+)+/) == null) {
        console.warn(`${tagName} is not a legal tag for a custom-element`)
        tagName = anonElementTag()
      }
      while (customElements.get(tagName) !== undefined) {
        tagName = anonElementTag()
      }
      componentClass._tagName = tagName

      // Resolve light style spec: options.styleSpec > static lightStyleSpec
      const lightStyleSpec = options.styleSpec ?? componentClass.lightStyleSpec
      if (lightStyleSpec !== undefined) {
        setGlobalStyle(tagName, lightStyleSpec)
      }

      // Resolve extends: options.extends > static extends
      const extendsTag = options.extends ?? componentClass.extends
      const defineOptions: ElementDefinitionOptions | undefined = extendsTag
        ? { extends: extendsTag }
        : undefined

      // Guarantee the deferred-attribute drain (see _installAttributeQueue)
      // runs BEFORE the subclass's connectedCallback body — regardless of
      // whether or when the subclass calls super.connectedCallback(). The
      // platform invokes the most-derived connectedCallback, so wrap it on the
      // concrete prototype to drain first. Without this, a subclass that reads
      // an initAttributes-backed attribute (e.g. getAttribute('url')) or fires
      // an event before calling super would observe the pre-drain default —
      // the value set via `el.foo = …` between createElement and a synchronous
      // append is queued, not yet reflected to the DOM.
      const proto = (this as unknown as { prototype: any }).prototype
      if (
        proto != null &&
        !Object.prototype.hasOwnProperty.call(proto, DRAIN_WRAPPED)
      ) {
        const inner = proto.connectedCallback as undefined | (() => void)
        proto.connectedCallback = function (this: Component): void {
          const self = this as unknown as { _drainPendingAttrOps(): void }
          self._drainPendingAttrOps()
          if (inner) inner.call(this)
        }
        Object.defineProperty(proto, DRAIN_WRAPPED, {
          value: true,
          enumerable: false,
        })
      }

      window.customElements.define(
        tagName,
        this as unknown as CustomElementConstructor,
        defineOptions
      )
      componentClass._elementCreator = elements[tagName]
    }
    /*
     * The memo is stored on the base-class static (`ElementCreator<Component>`)
     * while this getter is generic over the CONCRETE class, so the narrowing
     * cannot be expressed — the cache is per-class at runtime and the field
     * that holds it is not. Non-null because the branch above assigns it when
     * absent.
     */
    return componentClass._elementCreator as unknown as ElementCreator<C>
  }

  /**
   * @deprecated Use static initAttributes instead.
   * Example:
   *   static initAttributes = { caption: '', count: 0, disabled: false }
   */
  initAttributes(...attributeNames: string[]): void {
    warnDeprecated(
      'initAttributes',
      'initAttributes() is deprecated. Use static initAttributes = { ... } instead.'
    )

    // Track which attributes this instance is watching via legacy mechanism
    if (!this._legacyTrackedAttrs) {
      this._legacyTrackedAttrs = new Set()
    }
    for (const name of attributeNames) {
      this._legacyTrackedAttrs.add(name)
    }

    // Use shared MutationObserver instead of per-instance observer
    const observer = getLegacyAttributeObserver()
    observer.observe(this, { attributes: true })

    const attributes: { [key: string]: any } = {}
    const attributeValues: { [key: string]: any } = {}

    attributeNames.forEach((attributeName) => {
      attributes[attributeName] = deepClone(dynamic(this)[attributeName])
      const attributeKabob = camelToKabob(attributeName)
      Object.defineProperty(this, attributeName, {
        enumerable: false,
        get() {
          if (typeof attributes[attributeName] === 'boolean') {
            return this.hasAttribute(attributeKabob)
          } else {
            if (this.hasAttribute(attributeKabob)) {
              return typeof attributes[attributeName] === 'number'
                ? parseFloat(this.getAttribute(attributeKabob))
                : this.getAttribute(attributeKabob)
            } else if (attributeValues[attributeName] !== undefined) {
              return attributeValues[attributeName]
            } else {
              return attributes[attributeName]
            }
          }
        },
        set(value) {
          if (typeof attributes[attributeName] === 'boolean') {
            if (value !== this[attributeName]) {
              if (value) {
                this.setAttribute(attributeKabob, '')
              } else {
                this.removeAttribute(attributeKabob)
              }
              this.queueRender()
            }
          } else if (typeof attributes[attributeName] === 'number') {
            if (value !== parseFloat(this[attributeName])) {
              this.setAttribute(attributeKabob, value)
              this.queueRender()
            }
          } else {
            if (
              typeof value === 'object' ||
              `${value as string}` !== `${this[attributeName] as string}`
            ) {
              if (
                value === null ||
                value === undefined ||
                typeof value === 'object'
              ) {
                this.removeAttribute(attributeKabob)
              } else {
                this.setAttribute(attributeKabob, value)
              }
              this.queueRender()
              attributeValues[attributeName] = value
            }
          }
        },
      })
    })
  }

  private initValue(): void {
    const valueDescriptor = Object.getOwnPropertyDescriptor(this, 'value')

    if (
      valueDescriptor !== undefined &&
      (valueDescriptor.get !== undefined || valueDescriptor.set !== undefined)
    ) {
      return // the instance already owns an accessor — not ours to replace
    }

    if (valueDescriptor === undefined) {
      // NO OWN `value` FIELD. Normally that means the component has no value
      // and there is nothing to install. But if the class DECLARED a value
      // contract, silence is the wrong answer: the contract check only ever
      // runs from the accessor installed below, so `static contract = { value:
      // {...} }` on a class with no `value = …` field was completely inert —
      // every value accepted, and exerciseComponent reported its examples
      // green INCLUDING the counterexamples. describe() published the contract
      // anyway, so the map advertised a rule nothing enforced: exactly the
      // failure mode this release exists to make impossible.
      const cls = this.constructor as any
      if (ownContract(cls)?.value == null) return

      let inherited: PropertyDescriptor | undefined
      for (
        let proto = Object.getPrototypeOf(this);
        proto != null && inherited === undefined;
        proto = Object.getPrototypeOf(proto)
      ) {
        inherited = Object.getOwnPropertyDescriptor(proto, 'value')
      }
      if (inherited?.get !== undefined || inherited?.set !== undefined) {
        // the class implements `value` itself, via a prototype accessor —
        // shadowing it would break the component, so say so instead of
        // leaving a contract that quietly means nothing
        const tag = this.tagName?.toLowerCase()
        if (!inertContractWarned.has(tag)) {
          inertContractWarned.add(tag)
          console.error(
            `<${tag}> declares contract.value, but implements \`value\` as ` +
              `its own getter/setter, so tosijs cannot enforce the contract ` +
              `there — and describe() still publishes it. Call ` +
              `exerciseComponent in your tests, check the value in your own ` +
              `setter, or drop contract.value so the map stops advertising a ` +
              `rule nothing checks.`
          )
        }
        return
      }
      // give the declaration something to be load-bearing on
      ;(this as any).value = this.hasAttribute('value')
        ? this.getAttribute('value')
        : undefined
    }

    let value = this.hasAttribute('value')
      ? this.getAttribute('value')
      : deepClone(dynamic(this).value)
    delete dynamic(this).value
    Object.defineProperty(this, 'value', {
      enumerable: false,
      get() {
        return value
      },
      set(newValue: any) {
        if (value !== newValue) {
          // a declared contract is an opt-in to being held to it — no
          // contract, no check, no cost
          checkValueContract(this, newValue)
          value = newValue
          this._valueChanged = true
          this.queueRender(true)
        }
      },
    })
  }

  private _parts?: PartsOf<T>
  // Resolved parts, keyed by ref. Seeded at hydration with this component's OWN
  // [part] elements — captured from the content tree BEFORE it is inserted, so
  // nesting/slotting can't contaminate them (see capturePartsFrom + hydrate) —
  // and filled lazily for anything not declared in content. Shadow and static
  // (cloned) content start empty and resolve entirely via querySelector.
  private _partsCache: Record<string, Element> = Object.create(null)
  get parts(): PartsOf<T> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias -- the Proxy handler's methods have their own `this`
    const self = this
    if (this._parts == null) {
      this._parts = new Proxy(
        {},
        {
          get(_target: any, ref: string) {
            // symbol keys (and thenable probing, e.g. Promise.resolve(parts))
            // must not be treated as element refs
            if (typeof ref !== 'string') return undefined
            const cache = self._partsCache
            const cached: Element | null = cache[ref] ?? null
            let element: Element | null = cached
            // re-validate: a captured/cached part may have been replaced (e.g. by
            // a render()); a stale ref re-resolves, so `parts` self-heals. A
            // missing part is never cached, so a later access resolves once present.
            if (element != null && !element.isConnected) element = null
            if (element == null) {
              const root = self.shadowRoot != null ? self.shadowRoot : self
              element = root.querySelector(`[part="${ref}"]`)
              // (data-ref="foo" — a React-era "refs" fossil — was deprecated
              // through 1.7 and REMOVED in 1.8.0 as promised. Use part="…".)
              if (element == null) {
                element = root.querySelector(ref) // bare CSS-selector ref
              }
              // A previously-resolved part that is now detached with NO
              // replacement in the tree stays available as the cached node
              // rather than throwing — a component may legitimately hold a part
              // out of the DOM (e.g. an optional input it re-appends on demand).
              // Self-healing still wins when a replacement EXISTS; the throw is
              // reserved for refs that never resolved at all. (tosijs#21: the
              // 1.7.7 eviction turned that lenient case into a throw inside
              // change handlers, killing the handler before it committed
              // `this.value`.)
              if (element == null && cached != null) {
                return cached
              }
              if (element == null)
                throw new Error(`elementRef "${ref}" does not exist!`)
              cache[ref] = element
            }
            return element
          },
        }
      ) as PartsOf<T>
    }
    return this._parts
  }

  /**
   * Native web component callback for attribute changes.
   * Only called for attributes declared in static observedAttributes.
   */
  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null
  ): void {
    // Convert kabob-case attribute to camelCase property name
    const propName = kabobToCamel(name)
    // When the attribute is removed externally (el.removeAttribute), drop the
    // in-memory fallback so the getter returns the default instead of the last
    // property value — otherwise the fallback masked the removal forever.
    if (_newValue === null && this._attrValues?.has(propName)) {
      this._attrValues.delete(propName)
    }
    // A COMPUTED ATTRIBUTE HAS TO ACCEPT MARKUP, or it is not an attribute.
    //
    // Computed names are in observedAttributes, so this fired — but it only
    // queued a render. Nothing pushed the value into the author's setter, and
    // computed names skip _installAttrAccessor so no getter read it back. So
    // `<my-el full-name="Grace Hopper">` left the setter uncalled and
    // `el.fullName` returned the derived default, while the docs promised the
    // setter "MUST tolerate a string" — describing a path that could not run.
    // Only property writes worked, which makes it a computed *property*.
    //
    // Presence semantics for a boolean-shaped one: `<el collapsed>` is `true`,
    // absence is `false`. String-shaped gets the attribute text, and `<el
    // full-name>` delivers `''` — the case a naive `split(' ')` setter fumbles,
    // which is exactly why it has to actually reach the setter.
    const shape = this._computedAttrShapes?.get(propName)
    if (shape !== undefined && !this._applyingComputedAttr?.has(propName)) {
      this._applyingComputedAttr ??= new Set()
      this._applyingComputedAttr.add(propName)
      try {
        ;(this as any)[propName] =
          shape === 'boolean' ? _newValue !== null : _newValue ?? ''
      } finally {
        // re-entry guard: the author's setter may reflect back to the
        // attribute, which would re-enter this callback
        this._applyingComputedAttr.delete(propName)
      }
      return // the setter wrapper already queued the render if it changed
    }
    // Only queue render if this isn't a legacy-tracked attr (those use MutationObserver)
    if (!this._legacyTrackedAttrs?.has(propName)) {
      this.queueRender(false)
    }
  }

  /** computed attributes currently being applied FROM markup (re-entry guard) */
  private _applyingComputedAttr?: Set<string>

  constructor() {
    super()
    instanceCount += 1

    // The custom-elements spec forbids a constructor from "gaining
    // attributes." Property setters generated by `static initAttributes`
    // (and the legacy `initAttributes()` method) reflect to the DOM via
    // setAttribute, so any property assignment during construction —
    // class-field initializers or subclass constructor bodies — would
    // violate the spec. Install per-instance setAttribute/removeAttribute
    // overrides that queue calls. The queue drains either at the top of
    // connectedCallback (parser-upgrade path) or via a microtask
    // (createElement path), whichever fires first. Drain is idempotent.
    this._installAttributeQueue()

    // Attach ElementInternals for form-associated components
    // Only call once - attachInternals() throws if called more than once
    if (
      (this.constructor as typeof Component).formAssociated &&
      typeof this.attachInternals === 'function' &&
      !this.internals
    ) {
      this.internals = this.attachInternals()
    }

    // Set up property accessors from static initAttributes (or the
    // contract.attributes that subsume them)
    const initAttrs = (
      this.constructor as typeof Component
    )._resolveInitAttributes()
    if (initAttrs) {
      this._setupAttributeAccessors(initAttrs)
    }

    this.instanceId = `${this.tagName.toLocaleLowerCase()}-${instanceCount}`
    dynamic(this)._value = deepClone(dynamic(this).defaultValue)

    this._warnOnHandlerCollisions()
  }

  // Warn (once per class) when a subclass defines an `on<Event>`-named member.
  // The elements factory treats `on<Event>` prop names as event-handler sugar
  // (`creator({ onClick })` attaches a `click` listener via `on()`), so such a
  // member is shadowed and can never be assigned/read through the element
  // creator. Deferred to a microtask because arrow-function class fields
  // (`onClick = () => …`) are set AFTER the base constructor runs.
  private _warnOnHandlerCollisions(): void {
    const ctor = this.constructor as unknown as new () => Component
    if (handlerCollisionChecked.has(ctor)) return
    handlerCollisionChecked.add(ctor)
    queueMicrotask(() => {
      const names = new Set<string>()
      for (const key of Object.keys(this)) {
        if (/^on[A-Z]/.test(key)) names.add(key)
      }
      let proto = Object.getPrototypeOf(this)
      while (proto && proto !== Component.prototype) {
        for (const key of Object.getOwnPropertyNames(proto)) {
          if (/^on[A-Z]/.test(key)) names.add(key)
        }
        proto = Object.getPrototypeOf(proto)
      }
      const tag = this.tagName.toLowerCase()
      // onResize is the legacy resize hook — still honored, but deprecated in
      // favor of handleResize (the on<Event> prefix is reserved for event sugar).
      const usesLegacyOnResize =
        names.delete('onResize') && dynamic(this).handleResize === undefined
      if (usesLegacyOnResize) {
        console.warn(
          `<${tag}> defines 'onResize', which is deprecated. Rename it to ` +
            `'handleResize'. The on<Event> prefix is reserved for event-handler ` +
            `sugar in the elements factory (creator({ onResize }) would attach a ` +
            `'resize' listener) and is being retired for component callbacks in ` +
            `favor of the handle<Event> convention.`
        )
      }
      if (names.size === 0) return
      const list = Array.from(names, (n) => `'${n}'`).join(', ')
      const example = Array.from(names)[0]
      // tosijs#22: as of 1.8.0 an on<Event>-named component MEMBER is no
      // longer hijacked — passing a function through the creator assigns the
      // member. The name still can't carry event sugar, though, so the
      // warning says exactly what happens and what to rename to.
      // ADVISORY — it reports a naming CHOICE, not a defect — so it honours
      // settings.quiet, unlike the console.errors in this file that report
      // something actually wrong.
      if (settings.quiet === true) return
      console.warn(
        `<${tag}> defines ${list} — on<Event>-shaped member name(s), which ` +
          `collide with the elements factory's event-handler sugar. Since ` +
          `1.8.0, IF the member holds a function when the creator runs, it ` +
          `wins: creator({ ${example}: fn }) assigns it rather than ` +
          `attaching a '${example.slice(2).toLowerCase()}' listener ` +
          `(tosijs#22) — and then that name can no longer carry event sugar. ` +
          `A member declared but left undefined/null still gets event sugar, ` +
          `so the meaning depends on initialisation: give it a function ` +
          `default, or rename to handle<Event> for a component callback / ` +
          `add<Event>Listener for something that registers a listener.`
      )
    })
  }

  private _installAttributeQueue(): void {
    // Only mask setAttribute/removeAttribute for attribute NAMES declared in
    // `static initAttributes`. Those are the names whose setAttribute calls
    // can be auto-triggered by the property setters we generate — which is
    // the only spec-violation surface we set out to fix. Anything else
    // (Element.part assigning through to setAttribute, slot/name on
    // composition primitives, internal platform reflection, user code
    // calling setAttribute directly with some other name) goes straight
    // through, because intercepting it broke composition in tosijs-ui
    // (parts proxy couldn't find a `[part="…"]` whose attribute hadn't
    // landed yet) and the spec violation it would have caused is just a
    // Chrome warning — all browsers actually run the code.
    const initAttrs = (
      this.constructor as typeof Component
    )._resolveInitAttributes()
    if (!initAttrs) return
    const guarded = new Set(Object.keys(initAttrs).map(camelToKabob))
    const queue: Array<['set', string, string] | ['remove', string]> = []
    this._pendingAttrOps = queue
    const proto = HTMLElement.prototype
    ;(this as any).setAttribute = (name: string, value: any) => {
      if (guarded.has(name)) {
        queue.push(['set', name, String(value)])
      } else {
        proto.setAttribute.call(this, name, value)
      }
    }
    ;(this as any).removeAttribute = (name: string) => {
      if (guarded.has(name)) {
        queue.push(['remove', name])
      } else {
        proto.removeAttribute.call(this, name)
      }
    }
    queueMicrotask(() => this._drainPendingAttrOps())
  }

  private _drainPendingAttrOps(): void {
    const queue = this._pendingAttrOps
    if (queue === undefined) return
    this._pendingAttrOps = undefined
    delete (this as any).setAttribute
    delete (this as any).removeAttribute
    // Snapshot which attributes exist BEFORE replay: those were set by the
    // parser (pre-upgrade markup) and win over queued default reflections.
    // The guard must consult this snapshot, not live hasAttribute() — an
    // attribute landed by an EARLIER op in this same queue would otherwise
    // block later ops, making the drain first-write-wins and silently
    // dropping the second of two pre-connect property writes.
    const preExisting = new Set<string>()
    for (const op of queue) {
      if (this.hasAttribute(op[1])) preExisting.add(op[1])
    }
    for (const op of queue) {
      if (op[0] === 'set') {
        if (!preExisting.has(op[1])) this.setAttribute(op[1], op[2])
      } else {
        // an explicit remove consciously discards the parser-set value, so
        // a later queued set for the same attribute must land
        preExisting.delete(op[1])
        this.removeAttribute(op[1])
      }
    }
  }

  /**
   * Sets up property accessors from static initAttributes.
   */
  // initAttributes accessors actually installed on this instance — the set
  // field-shadow recovery consults (names skipped for other reasons must not
  // be "restored")
  private _installedAttrAccessors?: Set<string>
  /** attrName → the typed value written and the string it reflected as, so a
   * type-contradicting write reads back as written (tosijs#24) */
  private _attrTypedOverride?: Map<string, { reflected: string; value: any }>

  /**
   * Wire a computed attribute: the class owns `get`/`set`, we own the promise
   * that it behaves like an attribute.
   *
   * An attribute has two defining qualities, and neither is reflection:
   *
   * 1. **It re-renders when it changes after initialization.** If that is
   *    definitional then it has to be GUARANTEED, not documented — an author
   *    who forgets `this.queueRender()` in their setter has not written a
   *    slightly-broken attribute, they have written something that is not one.
   *    So the setter is wrapped rather than trusted. Changes arriving from
   *    MARKUP are already covered: `observedAttributes` derives from
   *    `initAttributes` keys, so `attributeChangedCallback` fires for these
   *    too.
   * 2. **It accepts a string (or boolean presence).** Markup can only deliver
   *    those, and `<el full-name>` delivers the EMPTY string specifically —
   *    the case a naive `split(' ')` setter gets wrong. The declared `shape`
   *    records which of the two this is, for `describe()` and the contract.
   *
   * A getter with no setter is legal and means a read-only derived attribute:
   * quality 1 still holds via `attributeChangedCallback`, and quality 2 is
   * vacuous because nothing can set it.
   */
  private _installComputedAttribute(attrName: string, shape: unknown): void {
    // FLOOR THE WALK AT Component.prototype.
    //
    // Unfloored, this found the NATIVE accessor for any DOM-owned name —
    // `title`, `id`, `hidden`, `dir`, `lang`, `slot`, `tabIndex`,
    // `className`, `contentEditable` — and then installed the wrapper on
    // `HTMLElement.prototype` (or `Element.prototype` for `id`, which takes
    // SVG with it). Those descriptors are configurable, so it SUCCEEDED: after
    // one such component was constructed, `document.createElement('div').title
    // = 'x'` threw `this.queueRender is not a function`, page-wide and
    // permanently, surfacing nowhere near the cause.
    //
    // That is the author-error path the throw below exists for, and it failed
    // OPEN into global DOM corruption. Only a prototype strictly below
    // Component's can own a computed attribute — anything at or above it
    // belongs to the platform, and shadowing the platform is never what
    // `Component.computed('title')` meant.
    let proto: object | null = Object.getPrototypeOf(this)
    let descriptor: PropertyDescriptor | undefined
    while (
      proto != null &&
      proto !== Component.prototype &&
      descriptor === undefined
    ) {
      descriptor = Object.getOwnPropertyDescriptor(proto, attrName)
      if (descriptor === undefined) proto = Object.getPrototypeOf(proto)
    }
    if (descriptor?.get == null) {
      throw new Error(
        `${this.tagName}: initAttributes.${attrName} is Component.computed(), ` +
          `which declares that this class implements the attribute itself — ` +
          `but no \`get ${attrName}()\` was found on the class. ` +
          `Define get/set for it, or give the attribute an ordinary default ` +
          `value instead. (If "${attrName}" is a native DOM property — title, ` +
          `id, hidden, lang, slot, tabIndex … — it cannot be a computed ` +
          `attribute: tosijs will not shadow the platform's accessor, because ` +
          `doing so corrupts it for every element on the page.)`
      )
    }
    // Remembered so attributeChangedCallback knows how to deliver a markup
    // value to this setter: presence for a boolean-shaped attribute, the
    // string otherwise.
    this._computedAttrShapes ??= new Map()
    this._computedAttrShapes.set(
      attrName,
      typeof shape === 'boolean' ? 'boolean' : 'string'
    )

    // read-only derived attribute: nothing to wrap
    if (descriptor.set == null || proto == null) return
    // WRAP ONCE PER CLASS, not per instance. Without the guard a subclass
    // re-wraps its parent's already-wrapped setter and every assignment queues
    // two renders — the same hazard DRAIN_WRAPPED exists for on connectedCallback.
    if (wrappedComputedSetters.has(descriptor.set)) return
    const authorGet = descriptor.get
    const authorSet = descriptor.set
    const wrapped = function (this: Component, value: any): void {
      // `queueRender(true)` is the VALUE-COMMIT signal — it dispatches a
      // bubbling, composed `change` and calls internals.setFormValue(). An
      // attribute is not a value: on an element with `bindValue`, a
      // presentational `el.collapsed = true` was committing the element's
      // stale DOM value back into bound state and reverting an external
      // update that had not yet flushed. Ordinary initAttributes setters call
      // queueRender() with no argument; so does this one now.
      //
      // Equality guard for the same reason ordinary attributes have one: a
      // repeat write of the same value is not a change, and firing renders for
      // it is how "always re-renders" turns into a render loop.
      let previous: unknown
      try {
        previous = authorGet.call(this)
      } catch {
        previous = undefined // a getter that throws pre-init is not a change
      }
      authorSet.call(this, value)
      let next: unknown
      try {
        next = authorGet.call(this)
      } catch {
        next = undefined
      }
      if (next !== previous) this.queueRender()
    }
    wrappedComputedSetters.add(wrapped)
    Object.defineProperty(proto, attrName, {
      configurable: true,
      enumerable: descriptor.enumerable,
      get: descriptor.get,
      set: wrapped,
    })
  }

  /** computed attribute name → declared shape ('string' | 'boolean') */
  private _computedAttrShapes?: Map<string, string>

  private _setupAttributeAccessors(initAttrs: Record<string, any>): void {
    if (!this._attrValues) {
      this._attrValues = new Map()
    }
    if (!this._installedAttrAccessors) {
      this._installedAttrAccessors = new Set()
    }

    for (const attrName of Object.keys(initAttrs)) {
      const attrKabob = camelToKabob(attrName)
      const defaultValue = initAttrs[attrName]

      // 'value' is a property, not an attribute - use Component's built-in value handling
      if (attrName === 'value') {
        console.warn(
          `${this.tagName}: 'value' cannot be an attribute. Use the Component value property instead.`
        )
        continue
      }

      // A COMPUTED attribute: the class implements get/set itself, and this
      // declaration exists to make it a real attribute rather than a property
      // that happens to be named like one. Checked before the object guard
      // below, because the marker IS an object.
      if (isComputedAttribute(defaultValue)) {
        this._installComputedAttribute(attrName, defaultValue.shape)
        continue
      }

      // Skip objects - attributes must be serializable (string, number, boolean)
      if (typeof defaultValue === 'object' && defaultValue !== null) {
        console.warn(
          `${this.tagName}: initAttributes.${attrName} is an object. Use a regular property instead.`
        )
        continue
      }

      // Boolean attributes are false-by-default in HTML: presence = true, absence
      // = false. A reflected boolean attribute cannot default to true — the element
      // would have to "gain" the attribute during construction (which the custom-
      // elements spec forbids), so a true default silently reads back as false.
      // Reject it loudly rather than surprise the developer.
      if (defaultValue === true) {
        throw new Error(
          `${this.tagName}: static initAttributes.${attrName} defaults a boolean attribute to true, ` +
            `but HTML boolean attributes are false-by-default (presence = true, absence = false) and ` +
            `cannot reflect a true default — it would silently become false. Use { ${attrName}: false }, ` +
            `or model it as a string/number attribute or a plain (non-attribute) property.`
        )
      }

      // Skip if already set up (e.g., by legacy initAttributes) or not configurable
      // Check prototype chain for non-configurable properties (e.g., 'name' on Element)
      // eslint-disable-next-line @typescript-eslint/no-this-alias -- walking cursor up the prototype chain
      let proto: object | null = this
      let isNonConfigurable = false
      while (proto) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, attrName)
        if (descriptor) {
          if (!descriptor.configurable || descriptor.get || descriptor.set) {
            isNonConfigurable = true
            break
          }
          break
        }
        proto = Object.getPrototypeOf(proto)
      }
      if (isNonConfigurable) {
        continue
      }

      this._installAttrAccessor(attrName, attrKabob, defaultValue)
    }
  }

  private _installAttrAccessor(
    attrName: string,
    attrKabob: string,
    defaultValue: any
  ): void {
    Object.defineProperty(this, attrName, {
      enumerable: false,
      // configurable, so a leftover subclass class field ([[Define]]
      // semantics — the default for ES2022 targets) replaces the accessor
      // instead of throwing a cryptic TypeError out of document.createElement.
      // connectedCallback detects the replacement, warns, and restores the
      // accessor, adopting the field's value (see _recoverShadowedAttrAccessors).
      configurable: true,
      get: () => {
        // DOM attribute wins over the in-memory fallback so external
        // setAttribute calls remain observable. The fallback covers the
        // window between a property assignment and its (possibly deferred)
        // DOM reflection.
        // tosijs#24 applies to ALL THREE declared types, not just string.
        // rc.2 wired the typed override into the string branch only, while
        // the error message and the CHANGELOG both claimed the fix
        // unscoped — so `el.count = false` on a number-declared attribute
        // read back NaN/null, and `el.flag = 'off'` on a boolean-declared
        // one read back `true`. Worse for the boolean case: 'off' is a
        // perfectly reasonable thing for a caller to write and it inverted
        // the meaning. The warning is warn-once per tag+attr, so instances
        // 2..N got it silently.
        const typedOverride = (): any => {
          const override = this._attrTypedOverride?.get(attrName)
          return override !== undefined &&
            override.reflected === this.getAttribute(attrKabob)
            ? { value: override.value }
            : undefined
        }
        if (typeof defaultValue === 'boolean') {
          if (this.hasAttribute(attrKabob)) {
            return typedOverride()?.value ?? true
          }
          if (this._attrValues!.has(attrName))
            return this._attrValues!.get(attrName)
          return false
        } else if (this.hasAttribute(attrKabob)) {
          if (typeof defaultValue === 'number') {
            return (
              typedOverride()?.value ??
              parseFloat(this.getAttribute(attrKabob)!)
            )
          }
          // tosijs#24, the half that was still broken: the setter reflects a
          // type-contradicting write to the attribute as a STRING, and this
          // getter preferred the attribute — so `el.mode = false` on a
          // string-declared attribute read back the truthy string "false",
          // and `if (this.mode)` was still wrong. That is the exact bug the
          // error message claims not to have ("applied as given — nothing is
          // coerced"). Hand back the typed value the caller actually wrote,
          // for as long as the attribute still holds what we reflected for it.
          //
          // The attribute still wins for any EXTERNAL setAttribute, which is
          // what keeps outside writes observable. Residual ambiguity, stated
          // rather than hidden: the DOM stores only strings, so an external
          // `setAttribute('mode', 'false')` is indistinguishable from our own
          // reflection of `false` and keeps the typed value.
          const override = this._attrTypedOverride?.get(attrName)
          if (
            override !== undefined &&
            override.reflected === this.getAttribute(attrKabob)
          ) {
            return override.value
          }
          return this.getAttribute(attrKabob)
        } else if (this._attrValues!.has(attrName)) {
          return this._attrValues!.get(attrName)
        } else {
          return defaultValue
        }
      },
      set: (value: any) => {
        // Remember a type-contradicting write so the getter can hand back what
        // was WRITTEN rather than the string it reflected as. Hoisted above the
        // per-type branches deliberately: rc.2 recorded this only in the string
        // branch, which is why the number and boolean cases still coerced while
        // the message promised they did not. Any type-AGREEING write clears it.
        if (
          value != null &&
          typeof value !== typeof defaultValue &&
          typeof value !== 'object'
        ) {
          this._attrTypedOverride ??= new Map()
          this._attrTypedOverride.set(attrName, {
            reflected:
              typeof defaultValue === 'boolean' && value ? '' : String(value),
            value,
          })
        } else {
          this._attrTypedOverride?.delete(attrName)
        }
        // tosijs#24: a write whose TYPE contradicts the declared default is
        // almost always a stale call site (the classic: `false` written to
        // an attribute declared `'on' | 'off'` after the tosijs#15
        // boolean-default migration). It used to be silently discarded —
        // the attribute was removed and the DEFAULT read back, so a feature
        // the author explicitly turned off stayed on. Apply the write as
        // given (coercion would be magic), but say so, loudly, once.
        if (
          value != null &&
          typeof value !== typeof defaultValue &&
          typeof defaultValue !== 'object'
        ) {
          const key = `${this.tagName.toLowerCase()}.${attrName}`
          if (!attrTypeMismatchWarned.has(key)) {
            attrTypeMismatchWarned.add(key)
            console.error(
              `<${this.tagName.toLowerCase()}>: ${attrName} is declared ` +
                `${typeof defaultValue} (default ${JSON.stringify(
                  defaultValue
                )}), ` +
                `but was written ${typeof value} ${JSON.stringify(value)}. ` +
                `The value is applied as given — nothing is coerced — but this ` +
                `is usually a call site left behind by a type change. ` +
                `(tosijs#24)`
            )
          }
        }
        if (typeof defaultValue === 'boolean') {
          if (value !== dynamic(this)[attrName]) {
            if (value) {
              this.setAttribute(attrKabob, '')
            } else {
              this.removeAttribute(attrKabob)
            }
            this.queueRender()
            this._attrValues!.set(attrName, !!value)
          }
        } else if (typeof defaultValue === 'number') {
          if (value !== parseFloat(dynamic(this)[attrName])) {
            this.setAttribute(attrKabob, value)
            this.queueRender()
            this._attrValues!.set(attrName, value)
          }
        } else {
          if (
            typeof value === 'object' ||
            `${value as string}` !== `${dynamic(this)[attrName] as string}`
          ) {
            if (
              value === null ||
              value === undefined ||
              typeof value === 'object'
            ) {
              this.removeAttribute(attrKabob)
            } else {
              this.setAttribute(attrKabob, value)
            }
            this.queueRender()
            this._attrValues!.set(attrName, value)
          }
        }
      },
    })
    this._installedAttrAccessors!.add(attrName)
  }

  // A subclass instance field named after a static initAttribute replaces the
  // generated accessor with a plain data property (class fields use [[Define]]
  // semantics), silently severing attribute reflection. Detect the
  // replacement at connect, restore the accessor, and adopt the field's value
  // as an ordinary property write. Idempotent: once restored, the own
  // descriptor is an accessor again and the check passes it by.
  private _recoverShadowedAttrAccessors(): void {
    const installed = this._installedAttrAccessors
    const initAttrs = (
      this.constructor as typeof Component
    )._resolveInitAttributes()
    if (installed == null || initAttrs == null) return
    const shadowed: string[] = []
    for (const attrName of installed) {
      const desc = Object.getOwnPropertyDescriptor(this, attrName)
      if (desc == null || desc.get != null || desc.set != null) continue
      const fieldValue = desc.value
      delete (this as any)[attrName]
      this._installAttrAccessor(
        attrName,
        camelToKabob(attrName),
        initAttrs[attrName]
      )
      ;(this as any)[attrName] = fieldValue
      shadowed.push(attrName)
    }
    if (shadowed.length > 0 && !warnedFieldShadowedAttrs.has(this.tagName)) {
      warnedFieldShadowedAttrs.add(this.tagName)
      const list = shadowed.map((n) => `'${n}'`).join(', ')
      console.warn(
        `<${this.tagName.toLowerCase()}> declares instance field(s) ${list} ` +
          'that shadow static initAttributes accessors (class fields use ' +
          '[[Define]] semantics). The field value was adopted and the ' +
          'reactive accessor restored — delete the field declaration; ' +
          'static initAttributes already defines the property.'
      )
    }
  }

  connectedCallback(): void {
    // Restore any initAttributes accessors clobbered by subclass class
    // fields BEFORE draining/rendering (idempotent; warns once per class).
    this._recoverShadowedAttrAccessors()
    // Apply any setAttribute/removeAttribute calls that were queued during
    // construction. Idempotent — if the microtask drain already ran, this
    // is a no-op.
    this._drainPendingAttrOps()
    insertGlobalStyles((this.constructor as unknown as Component).tagName)
    this.hydrate()
    if (this.role != null) this.setAttribute('role', this.role)
    // Curation materializes as accessibility — but into the MATCHING slot.
    // A contract `description` is a description; it is NOT a name. Stamping
    // it as aria-label (1.8.0-rc.1) made a role="button" component announce
    // developer prose instead of its visible text, put a name on shadow
    // components where ARIA prohibits one, and — worst — silenced our own
    // audit's `anonymous-affordance` rule, since the harvest reads
    // aria-label first. The library was grading its own homework.
    //
    // ARIA is the DOM's compatibility namespace for facts our contract
    // already states in its own vocabulary. So: `description` projects to
    // the description slot, `role` to the role attribute, and the NAME is
    // left to content and the author — where it belongs, because a name
    // varies per instance while a class-level description does not.
    {
      const cls = this.constructor as any
      const contract = ownContract(cls)
      const description = contract?.description
      if (
        typeof description === 'string' &&
        description !== '' &&
        !this.hasAttribute('aria-description') &&
        !this.hasAttribute('aria-describedby')
      ) {
        // aria-description is ARIA 1.3 — support is still uneven, but it is
        // additive and correct, and the harvest reads it back either way
        this.setAttribute('aria-description', description)
      }
      const declaredRole = contract?.role
      if (
        typeof declaredRole === 'string' &&
        declaredRole !== '' &&
        // getAttribute, not hasAttribute: the light-DOM convention above
        // stamps role="" when a component declares no role, and an empty
        // role is the same as none
        !this.getAttribute('role')
      ) {
        // a declared role fixes the audit's `missing-role` finding in the
        // same declaration that feeds the map, the types and the tests
        this.setAttribute('role', declaredRole)
      }
    }
    // Form-associated components must be focusable for validation to work
    if (
      (this.constructor as typeof Component).formAssociated &&
      !this.hasAttribute('tabindex')
    ) {
      this.setAttribute('tabindex', '0')
    }
    // handleResize is the current name; onResize is the deprecated legacy hook
    // (the deprecation warning is emitted once per class in _warnOnHandlerCollisions).
    const resizeHandler = dynamic(this).handleResize ?? dynamic(this).onResize
    if (resizeHandler !== undefined) {
      resizeObserver.observe(this)
      if (dynamic(this)._onResize == null) {
        dynamic(this)._onResize = resizeHandler.bind(this)
      }
      this.addEventListener('resize', dynamic(this)._onResize)
    }
    if (dynamic(this).value != null && this.getAttribute('value') != null) {
      dynamic(this)._value = this.getAttribute('value')
    }
    // Sync initial form value and validate for formAssociated components
    if (this.internals && dynamic(this).value !== undefined) {
      this.internals.setFormValue(dynamic(this).value)
      this.validateValue()
    }
    this.queueRender()
  }

  disconnectedCallback(): void {
    resizeObserver.unobserve(this)
  }

  /**
   * Called when the form is reset. Override to customize reset behavior.
   * Default: resets value to defaultValue or empty string.
   */
  formResetCallback(): void {
    if (dynamic(this).value !== undefined) {
      dynamic(this).value = dynamic(this).defaultValue ?? ''
    }
  }

  /**
   * Called when the form or a parent fieldset is disabled/enabled.
   * Default: syncs the disabled attribute.
   */
  formDisabledCallback(disabled: boolean): void {
    if (disabled) {
      this.setAttribute('disabled', '')
    } else {
      this.removeAttribute('disabled')
    }
  }

  /**
   * Called when browser restores form state (back/forward navigation).
   * Default: restores the value.
   */
  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (dynamic(this).value !== undefined && typeof state === 'string') {
      dynamic(this).value = state
    }
  }

  private _changeQueued = false
  private _renderQueued = false
  queueRender(triggerChangeEvent = false): void {
    if (!this._hydrated) return
    if (!this._changeQueued) this._changeQueued = triggerChangeEvent
    if (!this._renderQueued) {
      this._renderQueued = true
      requestAnimationFrame(() => {
        // TODO add mechanism to allow component developer to have more control over
        // whether input vs. change events are emitted
        if (this._changeQueued) {
          // bubble + compose so bind()'s delegated change handler sees it,
          // even when the component lives inside a shadow root
          dispatch(this, 'change', { bubbles: true, composed: true })
          // Sync form value for formAssociated components
          if (this.internals && dynamic(this).value !== undefined) {
            this.internals.setFormValue(dynamic(this).value)
          }
        }
        this._changeQueued = false
        this._renderQueued = false
        this.render()
      })
    }
  }

  private _hydrated = false
  private _whenHydrated?: Promise<void>
  private _resolveHydrated?: () => void

  /**
   * `true` once `hydrate()` has run (content instantiated, shadow root
   * attached). Read this instead of probing `parts` to find out whether the
   * element is ready — a pre-hydration `parts` read is meaningless (there is no
   * content yet) and used to permanently poison the proxy.
   */
  get hydrated(): boolean {
    return this._hydrated
  }

  /**
   * Resolves once the element is hydrated. `await el.whenHydrated` before doing
   * `parts`-dependent work on an element that may not be inserted yet (e.g. one
   * fresh from `elementCreator()`), instead of hand-queuing pending operations.
   * Already-hydrated elements resolve immediately.
   */
  get whenHydrated(): Promise<void> {
    if (this._hydrated) return Promise.resolve()
    if (this._whenHydrated == null) {
      this._whenHydrated = new Promise((resolve) => {
        this._resolveHydrated = resolve
      })
    }
    return this._whenHydrated
  }

  private hydrate(): void {
    if (!this._hydrated) {
      this.initValue()
      const cloneElements = typeof this.content !== 'function'
      let _content: ContentType | null =
        typeof this.content === 'function'
          ? this.content(elements)
          : this.content

      if (Array.isArray(_content)) {
        const hostProps: Record<string, any> = {}
        const _textFromContent: string[] = []
        _content = _content.filter((item) => {
          // ONE CLASSIFIER, shared with create() — see classifyPositional.
          // These two sites drifted: the value/array/warning rules landed in
          // create() only, so `content = [span('a'), new Date()]` dropped the
          // Date silently and a nested array turned its INDICES into host
          // attributes, which is verbatim the symptom the release notes call
          // fixed. `mergeElementProps` was extracted to stop exactly this and
          // was not enough, because the CLASSIFICATION was still duplicated.
          const kind = classifyPositional(item)
          const warning = positionalWarning(kind, this.tagName)
          if (warning != null) {
            console.warn(warning, item)
            return false
          }
          if (kind === 'child' || kind === 'proxy') return true
          if (kind === 'text') {
            _textFromContent.push(String(item))
            return false
          }
          // `bind` accumulates rather than clobbering — a host-props object
          // carrying `bind` and a spread `.tosi.listBinding()` destroyed each
          // other otherwise (review round 2, B1).
          mergeElementProps(
            hostProps,
            item instanceof Map ? Object.fromEntries(item) : item
          )
          return false
        })
        for (const text of _textFromContent) _content.push(text)
        for (const key of Object.keys(hostProps)) {
          elementSet(this as HTMLElement, key, hostProps[key])
        }
      }

      const ctor = this.constructor as unknown as typeof Component
      const shadowStyle = ctor.shadowStyleSpec ?? ctor.styleSpec
      if (ctor.styleSpec && !ctor.shadowStyleSpec) {
        warnDeprecated(
          'static-styleSpec',
          'static styleSpec is deprecated. Use static shadowStyleSpec instead.'
        )
      }
      let { styleNode } = ctor
      if (shadowStyle) {
        styleNode = ctor.styleNode = elements.style(css(shadowStyle))
        delete ctor.styleNode
      }
      if (this.styleNode) {
        console.warn(
          this,
          'styleNode is deprecated, use static shadowStyleSpec instead'
        )
        styleNode = this.styleNode
      }
      if (styleNode) {
        const shadow = this.attachShadow({ mode: 'open' })
        shadow.appendChild(styleNode.cloneNode(true))
        appendContentToElement(shadow, _content, cloneElements)
        // Data-binding sugar in shadow content is inert by design (see the
        // docs above: dispatch does not see into shadow roots; micro-manage
        // with observe() + parts instead — on() event sugar DOES work, via
        // composedPath). bind() runs while content is still detached, so it
        // cannot catch this itself. One query per shadow component at hydrate
        // turns a silent brick into a named warning.
        if (
          !warnedShadowContentBindings.has(this.tagName) &&
          shadow.querySelector(BOUND_SELECTOR) != null
        ) {
          warnedShadowContentBindings.add(this.tagName)
          console.warn(
            `<${this.tagName.toLowerCase()}> has data-binding sugar in its ` +
              'shadow-DOM content, where bindings do not operate. A shadow-DOM ' +
              'component is bound like an <input>: bind its VALUE from outside ' +
              '(bindings.value) and implement render() to reflect value into ' +
              'the shadow DOM — setting value queues render() and emits change ' +
              'automatically. on() event handlers are fine. Warned once per ' +
              'component class.'
          )
        }
      } else if (_content !== null) {
        const existingChildren = Array.from(this.childNodes)
        // Capture our own parts from the content tree BEFORE it is inserted and
        // before any nested sub-components hydrate/slot. Function content is not
        // cloned, so these are the very nodes that go into the DOM; static
        // (cloned) content is skipped and falls back to querySelector.
        if (!cloneElements) {
          this._partsCache = capturePartsFrom(_content)
        }
        appendContentToElement(this as HTMLElement, _content, cloneElements)
        // querySelector returns null (never undefined) when there's no match,
        // so `!== undefined` was always true
        this.isSlotted = this.querySelector('slot,tosi-slot,xin-slot') !== null
        const slots = Array.from(this.querySelectorAll('slot'))
        if (slots.length > 0) {
          slots.forEach(TosiSlot.replaceSlot)
        }
        if (existingChildren.length > 0) {
          const slotMap: { [key: string]: Element } = { '': this }
          Array.from(this.querySelectorAll('tosi-slot,xin-slot')).forEach(
            (slot) => {
              slotMap[(slot as TosiSlot).name] = slot
            }
          )
          existingChildren.forEach((child) => {
            const defaultSlot = slotMap['']
            const destSlot =
              child instanceof Element ? slotMap[child.slot] : defaultSlot
            ;(destSlot !== undefined ? destSlot : defaultSlot).append(child)
          })
        }
      }
      this._hydrated = true
      // Any `parts` read before this point built a proxy closed over the
      // light-DOM root (`this`), because the shadow root did not exist yet.
      // Discard it so the next access rebuilds against the now-correct root —
      // otherwise one early read poisons `parts` for the life of the element.
      this._parts = undefined
      this._resolveHydrated?.()
    }
  }

  render(): void {
    // Sync form value and validate when value actually changed
    if (
      this._valueChanged &&
      this.internals &&
      dynamic(this).value !== undefined
    ) {
      this.internals.setFormValue(dynamic(this).value)
      this.validateValue()
    }
    this._valueChanged = false
  }

  /**
   * Validates the current value against standard constraints (required, minlength, maxlength, pattern).
   * Called automatically in render() when value changes. Override to add custom validation.
   * Call super.validateValue() to include standard validation.
   *
   * See [web-component-validation](/form-validation/) for details.
   */
  validateValue(): void {
    if (!this.internals || dynamic(this).value === undefined) return
    const value =
      typeof dynamic(this).value === 'string'
        ? dynamic(this).value
        : String(dynamic(this).value)
    validateAgainstConstraints(this, value)
  }
}

interface SlotParts extends PartsMap {
  slotty: HTMLSlotElement
}

/*
 * DECLARED BY MERGING, NOT AS CLASS FIELDS. (tosijs#36.)
 *
 * Two reasons, both found by building a real consumer against it:
 *   - a class FIELD is emitted under ES2022 class-fields semantics, so bare
 *     declarations installed `undefined` own-properties on every component and
 *     tripped the on<Event> collision detector;
 *   - a field also forbids the shapes components actually use — `get value()`
 *     is TS2611 against a base-class property, and `handleResize() {}` as a
 *     method is TS2425. Both are the normal way to write a component, and
 *     both broke in tosijs-ui until these moved here.
 *
 * An interface declares existence without dictating property-vs-accessor or
 * property-vs-method, and emits nothing. It is also exactly the one-line
 * pattern consumers use for their own `initAttributes` keys.
 */
class TosiSlot extends Component<SlotParts> {
  static preferredTagName = 'tosi-slot'
  static initAttributes = { name: '' }
  /** installed by `initAttributes` at hydration — see the Blueprint note */
  declare name: string
  content = null

  static replaceSlot(slot: HTMLSlotElement): void {
    const _slot = document.createElement('tosi-slot')
    if (slot.name !== '') {
      _slot.setAttribute('name', slot.name)
    }
    // Preserve the slot's fallback content (its children) — they were being
    // dropped, so a `slot('default text')` lost its default text on rewrite.
    while (slot.firstChild != null) {
      _slot.appendChild(slot.firstChild)
    }
    slot.replaceWith(_slot)
  }
}

export const tosiSlot = TosiSlot.elementCreator()

/**
 * `<xin-slot>` MARKUP, kept working for one more cycle.
 *
 * The `xinSlot()` creator was restored as a deprecated alias, but the TAG was
 * left half-removed: hydrate still queries `'tosi-slot,xin-slot'` and reads
 * `.name`, while nothing registered the element — so an unupgraded
 * `<xin-slot>` had `name === undefined`, filed itself under `slotMap[undefined]`,
 * and its children fell through to the host. No warning, no exception, content
 * silently in the wrong place: the exact failure mode the blueprint tags got
 * tombstones for. This subclass composes identically AND says what to rename.
 * Goes away in 2.0 with the rest of the xin-* markup.
 */
class XinSlot extends TosiSlot {
  static preferredTagName = 'xin-slot'

  connectedCallback(): void {
    super.connectedCallback()
    warnDeprecated(
      'xin-slot',
      '<xin-slot> is deprecated and will be REMOVED IN 2.0 — rename it to ' +
        '<tosi-slot> (same attributes, same composition). It is registered ' +
        'only so your content keeps landing in the right place until you do.'
    )
  }
}
XinSlot.elementCreator()

/**
 * @deprecated Use `tosiSlot()`. Kept because 1.7's warning never named a
 * removal version — only `data-ref` did — so removing it outright in a
 * MINOR would have broken code that was promised nothing. It now creates a
 * `<tosi-slot>` (composition is identical; only the tag name differs, which
 * matters solely if you wrote CSS against `xin-slot`). Removed in 2.0.
 */
export const xinSlot: typeof tosiSlot = (...args) => {
  warnDeprecated(
    'xinSlot',
    'xinSlot() is deprecated and will be REMOVED IN 2.0 — use tosiSlot(). ' +
      'It now creates a <tosi-slot> (identical composition; the tag name ' +
      'differs, which only matters if you styled `xin-slot`).'
  )
  return tosiSlot(...args)
}
