/*{"parent": "binding-to-the-dom", "order": 2, "title": "Custom Bindings and Events", "description": "bind() syncs application state to DOM elements via path-based observers. Plus on() for event handlers and touchElement() for forced updates."}*/
/*#
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
import { bind, bindings, tosi, elements, updates } from 'tosijs'
const {div, input} = elements

const divElt = div()
bind(divElt, 'app.title', bindings.text)
document.body.append(divElt)

const inputElt = input()
bind(inputElt, 'app.title', bindings.value)

const { app } = tosi({ app: { title: 'hello world' } })
await updates()
```

What's happening is essentially the same as:

```
divElt.textContent = app.title.value
observe('app.title', () => divElt.textContent = app.title.value)

inputElt.value = app.title.value
observe('app.title', () => inputElt.value = app.title.value)
inputElt.addEventListener('change', () => { app.title.value = inputElt.value })
```

Except:

1. this code is harder to write
2. it will fail if `app` hasn't been registered yet (and in the example above, the
   bindings were set up before it was!)
3. inputElt will also trigger *debounced* updates on `input` events

After this. `div.textContent` and `inputElt.value` are 'hello world'.
If the user edits the value of `inputElt` then `app.title` will
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
handlers that live in state, by path (e.g. allowing event-handling code to be loaded
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
*/

import { touch, observe, extendsPath } from './path-listener'
import { getXinProxy, setBindFunctions } from './registry'
import {
  elementToBindings,
  elementToHandlers,
  LIST_BINDING_REF,
  BOUND_CLASS,
  BOUND_SELECTOR,
  XIN_PATH,
  XIN_VALUE,
  TAKE_DESCRIPTOR,
  applyDataBinding,
  noteBindingChange,
  resolveTakePaths,
  tosiPath,
} from './metadata'
import {
  TosiObject,
  TosiProps,
  TosiEventHandler,
  TosiTouchableType,
  TosiBinding,
  TosiBindingSpec,
  TakeDescriptor,
  EventType,
  ValueElement,
} from './xin-types'
import { ListBinding, getListItem } from './list-binding'

const { document, MutationObserver } = globalThis

export const touchElement = (element: Element, changedPath?: string): void => {
  const dataBindings = elementToBindings.get(element)
  if (dataBindings == null) {
    return
  }
  for (const dataBinding of dataBindings) {
    const { binding } = dataBinding
    let { path } = dataBinding
    const { toDOM } = binding
    if (toDOM != null) {
      if (path.startsWith('^')) {
        const dataSource = getListItem(element)
        if (dataSource != null && (dataSource as TosiProps)[XIN_PATH] != null) {
          const itemPath = (dataSource as TosiProps)[XIN_PATH] as string
          path = dataBinding.path = `${itemPath}${path.substring(1)}`
          // a take()'s input paths resolve against the same row
          resolveTakePaths(dataBinding, itemPath)
        } else {
          if (element instanceof HTMLElement) {
            console.warn(
              `Unresolved relative binding "${path}" —`,
              element,
              'is not part of a list. If this is a list template, wrap it in a <template>.'
            )
          }
          continue
        }
      }
      if (changedPath == null || extendsPath(changedPath, path)) {
        applyDataBinding(element, dataBinding, path)
      }
    }
  }
}

/**
 * Hydrate every bound element in a subtree that just entered the document.
 *
 * EXPORTED SO IT CAN BE TESTED. It used to be an inline closure inside the
 * MutationObserver callback, and coverage showed the whole block had never
 * executed in ANY of the suite's tests — including the isolation try/catch —
 * while sitting on top of a live defect (below). happy-dom delivers mutation
 * records unreliably enough that a test written against the observer passes
 * and fails by run order, which is the same hazard the throttled-handler note
 * in CLAUDE.md describes: test the function, let the real browser test the
 * wiring (there is a ```test doc fence for that).
 */
/**
 * Report a binding failure ONCE per (element type, message) pair.
 *
 * The per-element try/catch is the right behaviour — one bad binding must not
 * strand every element after it — but it turned a single abort into an
 * unthrottled `console.error` per failing element per update, forever, because
 * the loop no longer stops. 20 failing elements measured 20 errors on the
 * first touch and 20 on every touch after that. Every other advisory this
 * release added is warn-once; this one was not.
 */
const bindingErrorReported = new Set<string>()

function reportBindingError(
  what: string,
  element: Element,
  error: unknown
): void {
  const key = `${what}:${element.tagName}:${(error as Error)?.message ?? error}`
  if (bindingErrorReported.has(key)) return
  bindingErrorReported.add(key)
  console.error(
    `tosijs: a binding threw while ${what} this element; the rest of the ` +
      'pass continued. (Reported once per element type and message — fix the ' +
      'binding, the transform, or the state it reads.)',
    element,
    error
  )
}

export function hydrateInsertedSubtree(node: Element): void {
  // an inserted subtree can bring already-bound elements into the document,
  // which is the other way a document-wide walk's answer changes
  noteBindingChange()
  // getElementsByClassName (class-bucket index) over querySelectorAll
  // (whole-tree walk): same descendant set, measured faster; snapshot to
  // an array because touchElement → toDOM may mutate the DOM mid-scan.
  const inserted = Array.from(node.getElementsByClassName(BOUND_CLASS))
  // DESCENDANTS ONLY — so an inserted node that is ITSELF bound was never
  // hydrated. The same-tick bind()-then-append() case is rescued by the async
  // touch drain, which is why nothing caught this; the trigger is a node bound
  // while DETACHED and inserted later (a cached dialog, a re-attached view),
  // which renders empty. list-binding.ts's updateRelativeBindings already
  // carried this exact fix and comment — classList.contains, not matches():
  // no selector to parse.
  if (node.classList.contains(BOUND_CLASS)) {
    inserted.unshift(node)
  }
  inserted.forEach((element) => {
    // same isolation as the dispatch loop above: a newly-inserted subtree must
    // hydrate every bound element even if one throws
    try {
      touchElement(element)
    } catch (error) {
      reportBindingError('hydrating', element, error)
    }
  })
}

// this is just to allow bind to be testable in node
if (MutationObserver != null) {
  const observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach((mutation) => {
      Array.from(mutation.addedNodes).forEach((node) => {
        if (node instanceof Element) {
          hydrateInsertedSubtree(node)
        }
      })
    })
  })
  observer.observe(document.body, { subtree: true, childList: true })
}

observe(
  () => true,
  (changedPath: string) => {
    // the library's hottest scan — runs on every settled state change. Snapshot
    // getElementsByClassName (class-bucket index, ~O(matches)) rather than
    // querySelectorAll (whole-tree walk, O(total DOM)): measured 1.6–2.6× faster
    // in Blink and the gap widens with DOM size. Array.from makes it static so
    // toDOM mutations during dispatch can't perturb a live collection.
    // no document = state-only environment (tosijs/state, SSR, a Node
    // script using tosijs purely as a data model): observers still fire,
    // there is simply nothing bound to update
    if (globalThis.document == null) return
    const boundElements = Array.from(
      document.getElementsByClassName(BOUND_CLASS)
    )

    for (const element of boundElements) {
      // ISOLATION: one element's failure must never strand the others. This
      // loop is the library's hottest scan and every bound element on the
      // page shares it — an exception thrown by any toDOM (a contract
      // violation, a bad transform, a component's own render bug) used to
      // abort the remainder of the pass, leaving later-bound elements stale
      // while state said otherwise, with only a single listener-level log.
      try {
        touchElement(element as HTMLElement, changedPath)
      } catch (error) {
        reportBindingError('updating', element as Element, error)
      }
    }
  }
)

// The true origin of an event: composed events cross open shadow boundaries
// but are RETARGETED to the host, so event.target hides any origin inside a
// shadow root. composedPath()[0] sees through open roots; closed roots stay
// hidden (the path is truncated for outside listeners) — closed means closed.
const eventOrigin = (event: Event): Element | null => {
  // Only pierce shadow boundaries for composed events — for a non-composed
  // event composedPath()[0] is just event.target anyway, so skip the call
  // (and its array allocation) on the common path.
  const origin =
    event.composed && event.composedPath != null
      ? event.composedPath()[0]
      : event.target
  return origin instanceof Element ? origin : null
}

// closest(), but hopping open-shadow boundaries: when the search exhausts an
// element's tree, continue from the shadow host so delegation reaches
// light-DOM ancestors of events that originate inside a shadow widget.
const closestAcrossShadow = (
  el: Element | null,
  selector: string
): Element | null => {
  while (el != null) {
    const found = el.closest(selector)
    if (found != null) return found
    const root = el.getRootNode()
    el =
      typeof ShadowRoot !== 'undefined' && root instanceof ShadowRoot
        ? root.host
        : null
  }
  return null
}

// the upward delegation step from a handled element
const nextAcrossShadow = (el: Element, selector: string): Element | null => {
  if (el.parentElement != null) {
    return closestAcrossShadow(el.parentElement, selector)
  }
  const root = el.getRootNode()
  if (typeof ShadowRoot !== 'undefined' && root instanceof ShadowRoot) {
    return closestAcrossShadow(root.host, selector)
  }
  return null
}

// one step up the ancestor chain, hopping out of an open shadow root to its host
const parentAcrossShadow = (el: Element): Element | null => {
  if (el.parentElement != null) return el.parentElement
  const root = el.getRootNode()
  return typeof ShadowRoot !== 'undefined' && root instanceof ShadowRoot
    ? root.host
    : null
}

// nearest self-or-ancestor (across open-shadow boundaries) with registered event
// handlers. Event delegation used to climb a `-xin-event` marker class via
// closest(); the elementToHandlers WeakMap already IS that record, so we consult
// it directly and never stamp a class onto the consumer's DOM. cloneNode copies
// nothing into the map, so clones are simply not visited — no zombie markers.
const closestHandlerElement = (el: Element | null): Element | null => {
  while (el != null && !elementToHandlers.has(el)) {
    el = parentAcrossShadow(el)
  }
  return el
}

const handleChange = (event: Event): void => {
  let target = closestAcrossShadow(eventOrigin(event), BOUND_SELECTOR)
  while (target != null) {
    // plain cloneNode(true) copies the marker class but not the WeakMap
    // metadata — skip such elements instead of crashing the dispatcher
    // (which would also abort ancestor traversal for this event)
    const dataBindings = elementToBindings.get(target)
    for (const dataBinding of dataBindings ?? []) {
      const { binding, path } = dataBinding
      const { fromDOM } = binding
      if (fromDOM != null) {
        let value
        try {
          value = fromDOM(target, dataBinding.options)
        } catch (e) {
          console.error('Cannot get value from', target, 'via', dataBinding)
          throw new Error('Cannot obtain value fromDOM', { cause: e })
        }
        if (value != null) {
          const xin = getXinProxy()
          const existing = xin[path]
          if (existing == null) {
            // bootstrap: no state type to consult — the typed-control read
            // (getValue) already gave the control's native type
            xin[path] = value
          } else {
            const existingActual =
              existing[XIN_PATH] != null
                ? (existing as TosiProps)[XIN_VALUE]
                : existing
            let valueActual = value[XIN_PATH] != null ? value[XIN_VALUE] : value
            // State-driven coercion (H-6 layer 2): the type state currently
            // holds is authoritative — DOM controls speak string, state
            // speaks typed values, and the binding layer owns conversion.
            if (
              typeof existingActual === 'number' &&
              typeof valueActual === 'string'
            ) {
              // covers controls that don't declare a type: text inputs,
              // selects with numeric option values, radios. Only coerce a
              // clean, non-empty parse — Number('') is 0, and genuinely
              // non-numeric input writes raw so type-drift stays visible.
              const trimmed = valueActual.trim()
              if (trimmed !== '') {
                const n = Number(trimmed)
                if (!Number.isNaN(n)) valueActual = n
              }
            } else if (valueActual instanceof Date) {
              // state picks the temporal representation
              if (typeof existingActual === 'number') {
                valueActual = valueActual.getTime()
              } else if (typeof existingActual === 'string') {
                // the control's own serialization (e.g. 'yyyy-mm-dd')
                valueActual = (target as unknown as ValueElement).value
              }
            }
            const bothDates =
              existingActual instanceof Date && valueActual instanceof Date
            const changed = bothDates
              ? (existingActual as Date).getTime() !==
                (valueActual as Date).getTime()
              : existingActual !== valueActual
            if (changed) {
              xin[path] = valueActual
            }
          }
        }
      }
    }
    target = nextAcrossShadow(target, BOUND_SELECTOR)
  }
}

if (globalThis.document != null) {
  document.body.addEventListener('change', handleChange, true)
  document.body.addEventListener('input', handleChange, true)
}

interface BindingOptions {
  [key: string]: any
}

function bindTake<T extends Element>(
  element: T,
  descriptor: TakeDescriptor,
  binding: TosiBinding<T>,
  options?: BindingOptions
): T {
  const { paths, transform } = descriptor
  const { toDOM } = binding
  if (toDOM == null) return element

  element.classList?.add(BOUND_CLASS)
  let dataBindings = elementToBindings.get(element)
  if (dataBindings == null) {
    dataBindings = []
    elementToBindings.set(element, dataBindings)
    noteBindingChange()
  }

  // the descriptor becomes DATA on each entry (see DataBinding.take): the
  // closure version froze the template's `^.` paths and shared ONE
  // change-detection cache across every cloned row. Copy the paths — the
  // caller may reuse a descriptor across elements, and rows rewrite them
  // in place.
  const take = { paths: [...paths], transform }
  for (const p of take.paths) {
    dataBindings.push({
      path: p,
      binding: binding as unknown as TosiBinding<Element>,
      options,
      take,
    })
  }

  if (!paths[0].startsWith('^')) {
    touch(paths[0])
  }

  return element
}

// DATA binding inside shadow DOM is a documented design boundary (see
// Component's docs): dispatch cannot see into shadow roots, so bind() there
// is inert. (Event sugar is different: on() works across open shadow roots
// via composedPath.) The failure used to be SILENT — warn at the point of
// misuse instead. Once per session: the trap, not every element in it.
let warnedShadowedBinding = false
/**
 * Re-arm the once-per-session shadow warning (testing only). The latch is
 * process-wide, so whichever test FIRST binds inside a shadow root spends it —
 * and which one that is depends on the order Bun runs test files, which
 * differs between macOS and Linux. The assertion that the warning fires then
 * passed on one OS and failed on the other.
 */
export function _resetShadowWarning(): void {
  warnedShadowedBinding = false
}
export const warnIfShadowed = (element: Element, what: string): void => {
  if (warnedShadowedBinding) return
  if (
    typeof ShadowRoot !== 'undefined' &&
    element.getRootNode != null &&
    element.getRootNode() instanceof ShadowRoot
  ) {
    warnedShadowedBinding = true
    console.warn(
      `tosijs: ${what} targets an element inside a shadow root, where data ` +
        'bindings do not operate (documented Component design boundary). ' +
        'A shadow-DOM component is bound like an <input>: bind its VALUE from ' +
        'outside (bindings.value) and implement render() to reflect value ' +
        'into the shadow DOM. Warned once per session.',
      element
    )
  }
}

export function bind<T extends Element = Element>(
  element: T,
  what: TosiTouchableType | TosiBindingSpec | TakeDescriptor,
  binding: TosiBinding<T>,
  options?: BindingOptions
): T {
  if (element instanceof DocumentFragment) {
    throw new Error('bind cannot bind to a DocumentFragment')
  }
  warnIfShadowed(element, 'bind()')

  // TakeDescriptor — multi-path transform
  if (
    what != null &&
    typeof what === 'object' &&
    (what as any)[TAKE_DESCRIPTOR]
  ) {
    return bindTake(
      element,
      what as unknown as TakeDescriptor,
      binding,
      options
    )
  }

  let path: string
  if (
    typeof what === 'object' &&
    (what as TosiProps)[XIN_PATH] === undefined &&
    options === undefined
  ) {
    const { value } = what as TosiBindingSpec
    path = typeof value === 'string' ? value : value[XIN_PATH]
    // Copy the spec rather than mutating the caller's object: deleting `value`
    // from `what` in place broke reusing one bindList spec for two containers
    // (the second call saw no `value` and threw "bind requires a path").
    options = { ...(what as TosiObject) }
    delete options.value
  } else {
    path = typeof what === 'string' ? what : (what as TosiProps)[XIN_PATH]
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
    noteBindingChange()
  }
  dataBindings.push({
    path,
    binding: binding as TosiBinding<Element>,
    options,
  })

  if (toDOM != null && !path.startsWith('^')) {
    // not calling toDOM directly here allows virtual list bindings to work
    touch(path)
  }

  if (options?.filter && options?.needle) {
    bind(element, options.needle, {
      toDOM(element, value) {
        ;(element as { [LIST_BINDING_REF]?: ListBinding })[
          LIST_BINDING_REF
        ]?.filter(value)
      },
    })
  }

  return element
}

const handledEventTypes: Set<string> = new Set()

const handleBoundEvent = (event: Event): void => {
  let target = closestHandlerElement(eventOrigin(event))
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
  const nohandlers = new Set<TosiEventHandler>()
  while (!propagationStopped && target != null) {
    // every target visited is, by construction, a key in elementToHandlers
    const eventBindings = elementToHandlers.get(target)
    const handlers = eventBindings?.[event.type] ?? nohandlers
    for (const handler of handlers) {
      if (typeof handler === 'function') {
        handler(wrappedEvent as Event & { target: Element })
      } else {
        const func = getXinProxy()[handler]
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
    target = closestHandlerElement(parentAcrossShadow(target))
  }
}

type RemoveListener = VoidFunction

export function on<E extends HTMLElement, K extends EventType>(
  element: E,
  eventType: K,
  eventHandler: TosiEventHandler<HTMLElementEventMap[K], E>
): RemoveListener {
  // normalize at the boundary: a proxy handler IS a path — store it as one,
  // so dispatch, dedup, and every consumer of the metadata (the agent
  // surface's map included) treat `onClick: app.doThing` and
  // `onClick: 'app.doThing'` identically
  const handlerPath = tosiPath(eventHandler)
  if (handlerPath != null) {
    eventHandler = handlerPath as unknown as typeof eventHandler
  }
  let eventBindings = elementToHandlers.get(element)
  if (eventBindings == null) {
    eventBindings = {}
    elementToHandlers.set(element, eventBindings)
  }
  if (!eventBindings[eventType]) {
    eventBindings[eventType] = new Set<TosiEventHandler>()
  }
  eventBindings[eventType].add(eventHandler as TosiEventHandler)
  if (!handledEventTypes.has(eventType)) {
    handledEventTypes.add(eventType)
    document.body.addEventListener(eventType, handleBoundEvent, true)
  }
  return () => {
    eventBindings[eventType].delete(eventHandler as TosiEventHandler)
  }
}

// Register bind and on functions for lazy access (breaks circular dependency with xin.ts)
setBindFunctions(bind, on)
