/*#
# 2. bind

`bind()` lets you synchronize data / application state to the user-interface reliably,
efficiently, and with a minimum of code.

## An Aside on Reactive Programming vs. the Observer Model

A good deal of front-end code deals with keeping the application's
state synchronized with the user-interface. One approach to this problem
is [Reactive Programming](https://en.wikipedia.org/wiki/Reactive_programming)
as exemplified by [React](https://reactjs.org) and its many imitators.

`xinjs` works very well with React via the [useXin](https://github.com/tonioloewald/react-xinjs) React "hook".
But `xinjs` is not designed for "reactive programming" and in fact "hooks" aren't
"reactive" at all, so much as an example of the "observer" or "pub/sub" pattern.

`xinjs` is a "path-observer" in that it's an implementation of the
[Observer Pattern](https://en.wikipedia.org/wiki/Observer_pattern)
where **path strings** serve as a level of *indirection* to the things observed.
This allows data to be "observed" before it exists, which in particular *decouples* the setup
of the user interface from the initialization of data and allows user interfaces
built with `xinjs` to be *deeply asynchronous*.

## `bind()`

```
bind<T = Element>(
  element: T,
  what: XinTouchableType,
  binding: XinBinding,
  options: XinObject
): T
```

`bind()` binds a `path` to an element, syncing the value at the path to and/or from the DOM.

```js
const { bind, boxedProxy } = tosijs

const { simpleBindExample } = boxedProxy({
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
  // the boxedProxy can be used instead of a string path
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
state via `path` using [bindings](/?bindings.ts)

```
import {bind, bindings, xin, elements, updates} from 'xinjs'
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
interface XinBinding {
  toDOM?: (element: HTMLElement, value: any, options?: XinObject) => void
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
    element.style.display = (value != null && element.length > 0) ? element.dataset.origDisplay : 'none'
  }
}
bind(listElement, 'app.bigList', visibility)
```

## `on()`

```
on(element: Element, eventType: string, handler: XinEventHandler): VoidFunction

export type XinEventHandler<T extends Event = Event, E extends Element = Element> =
  | ((evt: T & {target: E}) => void)
  | ((evt: T & {target: E}) => Promise<void>)
  | string
```

```js
const { elements, on, boxedProxy } = tosijs
const { postNotification } = tosijsui

const makeHandler = (message) => () => {
  postNotification({ message, duration: 2 })
}

const { onExample } = boxedProxy({
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

## `touchElement()`

```
touchElement(element: Element, changedPath?: string)
```

This is a low-level function for *immediately* updating a bound element. If you specifically
want to force a render of an element (versus anything bound to a path), simply call
`touchElement(element)`. Specifying a `changedPath` will only trigger bindings bound
to paths staring with the provided path.
*/

import { xin, touch, observe } from './xin'
import {
  getListItem,
  elementToBindings,
  elementToHandlers,
  DataBindings,
  BOUND_CLASS,
  BOUND_SELECTOR,
  EVENT_CLASS,
  EVENT_SELECTOR,
  XinEventBindings,
  XIN_PATH,
  XIN_VALUE,
} from './metadata'
import {
  XinObject,
  XinProps,
  XinEventHandler,
  XinTouchableType,
  XinBinding,
  XinBindingSpec,
  EventType,
} from './xin-types'
import { ListBinding, listBindingRef } from './list-binding'

const { document, MutationObserver } = globalThis

export const touchElement = (element: Element, changedPath?: string): void => {
  const dataBindings = elementToBindings.get(element)
  if (dataBindings == null) {
    return
  }
  for (const dataBinding of dataBindings) {
    const { binding, options } = dataBinding
    let { path } = dataBinding
    const { toDOM } = binding
    if (toDOM != null) {
      if (path.startsWith('^')) {
        const dataSource = getListItem(element)
        if (dataSource != null && (dataSource as XinProps)[XIN_PATH] != null) {
          path = dataBinding.path = `${
            (dataSource as XinProps)[XIN_PATH]
          }${path.substring(1)}`
        } else {
          console.error(
            `Cannot resolve relative binding ${path}`,
            element,
            'is not part of a list'
          )
          throw new Error(`Cannot resolve relative binding ${path}`)
        }
      }
      if (changedPath == null || path.startsWith(changedPath)) {
        toDOM(element, xin[path], options)
      }
    }
  }
}

// this is just to allow bind to be testable in node
if (MutationObserver != null) {
  const observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach((mutation) => {
      Array.from(mutation.addedNodes).forEach((node) => {
        if (node instanceof Element) {
          Array.from(node.querySelectorAll(BOUND_SELECTOR)).forEach((element) =>
            touchElement(element as Element)
          )
        }
      })
    })
  })
  observer.observe(document.body, { subtree: true, childList: true })
}

observe(
  () => true,
  (changedPath: string) => {
    const boundElements = Array.from(document.querySelectorAll(BOUND_SELECTOR))

    for (const element of boundElements) {
      touchElement(element as HTMLElement, changedPath)
    }
  }
)

const handleChange = (event: Event): void => {
  // @ts-expect-error-error
  let target = event.target.closest(BOUND_SELECTOR)
  while (target != null) {
    const dataBindings = elementToBindings.get(target) as DataBindings
    for (const dataBinding of dataBindings) {
      const { binding, path } = dataBinding
      const { fromDOM } = binding
      if (fromDOM != null) {
        let value
        try {
          value = fromDOM(target, dataBinding.options)
        } catch (e) {
          console.error('Cannot get value from', target, 'via', dataBinding)
          throw new Error('Cannot obtain value fromDOM')
        }
        if (value != null) {
          const existing = xin[path]
          if (existing == null) {
            xin[path] = value
          } else {
            const existingActual =
              existing[XIN_PATH] != null
                ? (existing as XinProps)[XIN_VALUE]
                : existing
            const valueActual =
              value[XIN_PATH] != null ? value[XIN_VALUE] : value
            if (existingActual !== valueActual) {
              xin[path] = valueActual
            }
          }
        }
      }
    }
    target = target.parentElement.closest(BOUND_SELECTOR)
  }
}

if (globalThis.document != null) {
  document.body.addEventListener('change', handleChange, true)
  document.body.addEventListener('input', handleChange, true)
}

interface BindingOptions {
  [key: string]: any
}

export function bind<T extends Element = Element>(
  element: T,
  what: XinTouchableType | XinBindingSpec,
  binding: XinBinding<T>,
  options?: BindingOptions
): T {
  if (element instanceof DocumentFragment) {
    throw new Error('bind cannot bind to a DocumentFragment')
  }
  let path: string
  if (
    typeof what === 'object' &&
    (what as XinProps)[XIN_PATH] === undefined &&
    options === undefined
  ) {
    const { value } = what as XinBindingSpec
    path = typeof value === 'string' ? value : value[XIN_PATH]
    options = what as XinObject
    delete options.value
  } else {
    path = typeof what === 'string' ? what : (what as XinProps)[XIN_PATH]
  }
  if (path == null) {
    throw new Error('bind requires a path or object with xin Proxy')
  }
  const { toDOM } = binding

  element.classList?.add(BOUND_CLASS)
  let dataBindings = elementToBindings.get(element)
  if (dataBindings == null) {
    dataBindings = []
    elementToBindings.set(element, dataBindings)
  }
  dataBindings.push({
    path,
    binding: binding as XinBinding<Element>,
    options,
  })

  if (toDOM != null && !path.startsWith('^')) {
    // not calling toDOM directly here allows virtual list bindings to work
    touch(path)
  }

  if (options?.filter && options?.needle) {
    bind(element, options.needle, {
      toDOM(element, value) {
        console.log({ needle: value })
        ;(element as { [listBindingRef]?: ListBinding })[
          listBindingRef
        ]?.filter(value)
      },
    })
  }

  return element
}

const handledEventTypes: Set<string> = new Set()

const handleBoundEvent = (event: Event): void => {
  // @ts-expect-error-error
  let target = event?.target.closest(EVENT_SELECTOR)
  let propagationStopped = false

  const wrappedEvent = new Proxy(event, {
    get(target, prop) {
      if (prop === 'stopPropagation') {
        return () => {
          event.stopPropagation()
          propagationStopped = true
        }
      } else {
        const value = (target as any)[prop]
        return typeof value === 'function' ? value.bind(target) : value
      }
    },
  })
  const nohandlers = new Set<XinEventHandler>()
  while (!propagationStopped && target != null) {
    const eventBindings = elementToHandlers.get(target) as XinEventBindings
    const handlers = eventBindings[event.type] || nohandlers
    for (const handler of handlers) {
      if (typeof handler === 'function') {
        handler(wrappedEvent as Event & { target: Element })
      } else {
        const func = xin[handler]
        if (typeof func === 'function') {
          func(wrappedEvent)
        } else {
          throw new Error(`no event handler found at path ${handler}`)
        }
      }
      if (propagationStopped) {
        continue
      }
    }
    target =
      target.parentElement != null
        ? target.parentElement.closest(EVENT_SELECTOR)
        : null
  }
}

type RemoveListener = VoidFunction

export function on<E extends HTMLElement, K extends EventType>(
  element: E,
  eventType: K,
  eventHandler: XinEventHandler<HTMLElementEventMap[K], E>
): RemoveListener {
  let eventBindings = elementToHandlers.get(element)
  element.classList.add(EVENT_CLASS)
  if (eventBindings == null) {
    eventBindings = {}
    elementToHandlers.set(element, eventBindings)
  }
  if (!eventBindings[eventType]) {
    eventBindings[eventType] = new Set<XinEventHandler>()
  }
  eventBindings[eventType].add(eventHandler as XinEventHandler)
  if (!handledEventTypes.has(eventType)) {
    handledEventTypes.add(eventType)
    document.body.addEventListener(eventType, handleBoundEvent, true)
  }
  return () => {
    eventBindings[eventType].delete(eventHandler as XinEventHandler)
  }
}
