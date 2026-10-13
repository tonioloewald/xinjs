# Web-Components

**tosijs** provides the abstract `Component` class to make defining
[custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) easier. Everything
here is the platform's own machinery ([shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM),
[slots](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot),
[form-associated elements](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals)) with the boilerplate removed.

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

Each item is classified exactly as `elements.div()` classifies its positional
arguments — the same code, so the two cannot drift:

| item | result |
| --- | --- |
| a node, string or number | a child, in place |
| a tosijs proxy | a **live** child (a bound `<span>`) |
| a `Date`, `bigint`, `boolean`, or anything with its own `toString` | text, in place |
| a plain object or a `Map` | props applied to the host |
| `null` / `undefined` | nothing, deliberately |
| an array | a warning — spread it |

A single non-array `content` is classified the same way, so `content = proxy`
works rather than throwing.

> **In shadow DOM a bound child renders nothing.** Data bindings are inert
> inside a shadow root by design, so a proxy in the `content` of a
> shadow-DOM component produces an empty span and a warning. Bind the
> component's `value` from outside and implement `render()` instead.

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

export const menuBar = MenuBar.elementCreator()
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

#### parts: {[key:string]: Element | undefined}

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
