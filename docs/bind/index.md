# Custom Bindings and Events (bind, on)

`bind()` lets you synchronize data / application state to the user-interface reliably,
efficiently, and with a minimum of code.

> The design goal of `bind` is to eliminate most of the code used to sync state to and
> from the UI (DOM elements) making code simpler, faster, and more reliable.

## An Aside on Reactive Programming vs. the Observer Model

A good deal of front-end code deals with keeping the application's
state synchronized with the user-interface. One approach to this problem
is [Reactive Programming](https://en.wikipedia.org/wiki/Reactive_programming)
as exemplified by [React](https://reactjs.org) and its many imitators.

`tosijs` works very well with React via the [useTosi](https://github.com/tonioloewald/react-tosijs) React "hook".
But `tosijs` is not designed for "reactive programming" and in fact "hooks" aren't
"reactive" at all, so much as an example of the "observer" or "pub/sub" pattern.

`tosijs` is a "path-observer" in that it's an implementation of the
[Observer Pattern](https://en.wikipedia.org/wiki/Observer_pattern)
where **path strings** serve as a level of *indirection* to the things observed.
This allows data to be "observed" before it exists, which in particular *decouples* the setup
of the user interface from the initialization of data and allows user interfaces
built with `tosijs` to be *deeply asynchronous*.

## `bind()`

```
bind<T = Element>(
  element: T,
  what: TosiTouchableType,
  binding: TosiBinding,
  options: TosiObject
): T
```

`bind()` binds a `path` to an element, syncing the value at the path to and/or from the DOM.

```js
import { bind, tosi } from 'tosijs'

const { simpleBindExample } = tosi({
  simpleBindExample: {
    showThing: true
  }
})

bind(
  preview.querySelector('b'),
  'simpleBindExample.showThing',
  {
    toDOM(element, value) {
      element.style.visibility = value ? 'visible' : 'hidden'
    }
  }
)

bind(
  preview.querySelector('input[type=checkbox]'),
  // the tosi can be used instead of a string path
  simpleBindExample.showThing,
  // we could just use bindings.value here
  {
    toDOM(element, value) {
      element.checked = value
    },
    fromDOM(element) {
      return element.checked
    }
  }
)
```
```html
<b>The thing</b><br>
<label>
  <input type="checkbox">
  Show the thing
</label>
```

The `bind` function is a simple way of tying an `HTMLElement`'s properties to
state via `path` using [bindings](/bindings/)

```
import {bind, bindings, xin, elements, updates} from 'tosijs'
const {div, input} = elements

const divElt = div()
bind(divElt, 'app.title', bindings.text)
document.body.append(divElt)

const inputElt = input()
bind(inputElt, 'app.title', bindings.value)

xin.app = {title: 'hello world'}
await updates()
```

What's happening is essentially the same as:

```
divElt.textContent = xin.app.title
observe('app.title', () => divElt.textContent = xin.app.title)

inputElt.value = xin.app.title
observe('app.title', () => inputElt.value = xin.app.title)
inputElt.addEventListener('change', () => { xin.app.title = inputElt.value })
```

Except:

1. this code is harder to write
2. it will fail if xin.app hasn't been initialized (which it hasn't been!)
3. inputElt will also trigger *debounced* updates on `input` events

After this. `div.textContent` and `inputElt.value` are 'hello world'.
If the user edits the value of `inputElt` then `xin.app.title` will
be updated, and `app.title` will be listed as a changed path, and
an update will be fired via `setTimout`. When that update fires,
anything observer of the paths `app.text` and `app` will be fired.

A `binding` looks like this:

```
interface TosiBinding {
  toDOM?: (element: HTMLElement, value: any, options?: TosiObject) => void
  fromDOM?: (element: HTMLElement) => any
}
```

Simply put the `toDOM` method updates the DOM based on changes in state
while `fromDOM` updates state based on data in the DOM. Most bindings
will have a `toDOM` method but no `fromDOM` method since `bindings.value`
(which has both) covers most of the use-cases for `fromDOM`.

It's easy to write your own `bindings` if those in `bindings` don't meet your
need, e.g. here's a custom binding that toggles the visibility of an element
based on whether the bound value is neither "falsy" nor an empty `Array`.

```
const visibility = {
  toDOM(element, value) {
    if (element.dataset.origDisplay === undefined && element.style.display !== 'none') {
      element.dataset.origDisplay = element.style.display
    }
    element.style.display = (value != null && value.length > 0) ? element.dataset.origDisplay : 'none'
  }
}
bind(listElement, 'app.bigList', visibility)
```

## `on()`

```
on(element: Element, eventType: string, handler: TosiEventHandler): VoidFunction

export type TosiEventHandler<T extends Event = Event, E extends Element = Element> =
  | ((evt: T & {target: E}) => void)
  | ((evt: T & {target: E}) => Promise<void>)
  | string
```

```js
import { elements, on, tosi } from 'tosijs'
import { postNotification } from 'tosijs-ui'

const makeHandler = (message) => () => {
  postNotification({ message, duration: 2 })
}

const { onExample } = tosi({
  onExample: {
    clickHandler: makeHandler('Hello from onExample proxy')
  }
})

const { button, div, h2 } = elements

const hasListener = button('has listener')
hasListener.addEventListener('click', makeHandler('Hello from addEventListener'))

preview.append(
  div(
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        padding: 10,
        gap: 10
      }
    },
    h2('Event Handler Examples'),
    hasListener,
    button('just a callback', {onClick: makeHandler('just a callback')}),
    button('via proxy', {onClick: onExample.clickHandler}),
  )
)
```

`on()` binds event-handlers to DOM elements.

More than syntax sugar for `addEventListener`, `on()` allows you to bind event
handlers inside `xin` by path (e.g. allowing event-handling code to be loaded
asynchronously or lazily, or simply allowing event-handlers to be switched dynamically
without rebinding) and it uses event-bubbling to minimize the actual number of
event handlers that need to be registered.

`on()` returns a function for removing the event handler.

In essence, only one event handler of a given type is ever added to the
DOM by `on()` (at `document.body` level), and then when that event is detected,
that handler goes from the original target through to the DOM and fires off
event-handlers, passing them an event proxy (so that `stopPropagation()` still
works).

`on()` handlers work inside **open shadow roots** too: composed events cross
shadow boundaries, and the dispatcher resolves the true origin via
`composedPath()` (retargeting would otherwise hide it) and continues delegation
up through shadow hosts to light-DOM ancestors. Closed shadow roots stay
closed. (Note that *data* bindings deliberately do not operate inside shadow
DOM — a component, with or without a shadow DOM, is bound like an `<input>`,
via its `value`; see the Component docs.)

This behavior needs a real browser to observe (a composed event is only
*retargeted* to its shadow host outside jsdom/happy-dom), so it is verified
in-browser here:

```test
import { elements, on } from 'tosijs'
const { button } = elements

test('on() fires for a click originating inside an open shadow root', () => {
  const host = document.createElement('div')
  preview.append(host)
  const shadow = host.attachShadow({ mode: 'open' })
  const b = button('inside shadow')
  shadow.append(b)
  let clicks = 0
  on(b, 'click', () => { clicks++ })
  b.click()
  expect(clicks).toBe(1)
})

test('delegation crosses the shadow boundary to a light-DOM ancestor', () => {
  const outer = document.createElement('div')
  preview.append(outer)
  const host = document.createElement('div')
  outer.append(host)
  const inner = button('inner')
  host.attachShadow({ mode: 'open' }).append(inner)
  let heard = 0
  on(outer, 'click', () => { heard++ })
  inner.click()
  expect(heard).toBe(1)
})
```

## `touchElement()`

```
touchElement(element: Element, changedPath?: string)
```

This is a low-level function for *immediately* updating a bound element. If you specifically
want to force a render of an element (versus anything bound to a path), simply call
`touchElement(element)`. Specifying a `changedPath` will only trigger bindings bound
to paths staring with the provided path.

## Binding before insertion

You can bind an element that isn't in the document yet — build a view offscreen,
cache a dialog, detach and re-attach a panel — and it hydrates when it lands. A
`MutationObserver` on `document.body` catches the insertion and renders every
bound element in the subtree, **including the inserted node itself**.

```test
import { elements, tosi, bind, bindings, updates } from 'tosijs'

test('an element bound while detached hydrates when it is inserted', async () => {
  const { detachedDemo } = tosi({ detachedDemo: { label: 'arrived' } })
  const panel = elements.div(elements.span())
  // bound while OUTSIDE the document, and inserted a turn later — only the
  // MutationObserver can render this, and it must cover the root as well as
  // the descendants (happy-dom's mutation delivery is too order-dependent to
  // assert this in the unit tier, so the real engine owns it)
  bind(panel, 'detachedDemo.label', {
    toDOM: (el, value) => el.setAttribute('data-label', value),
  })
  bind(panel.querySelector('span'), 'detachedDemo.label', bindings.text)
  await updates()
  document.body.append(panel)
  await new Promise((resolve) => setTimeout(resolve, 50))
  expect(panel.getAttribute('data-label')).toBe('arrived')
  expect(panel.querySelector('span').textContent).toBe('arrived')
  panel.remove()
})
```
