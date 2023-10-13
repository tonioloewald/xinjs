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
  XinProxy,
  XinEventHandler,
  XinTouchableType,
  XinBinding,
  XinBindingSpec,
} from './xin-types'

const { document, MutationObserver } = globalThis

export const touchElement = (
  element: HTMLElement,
  changedPath?: string
): void => {
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
        if (dataSource != null && (dataSource as XinProxy)[XIN_PATH] != null) {
          path = dataBinding.path = `${
            (dataSource as XinProxy)[XIN_PATH]
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
      ;[...mutation.addedNodes].forEach((node) => {
        if (node instanceof HTMLElement) {
          ;[...node.querySelectorAll(BOUND_SELECTOR)].forEach((element) =>
            touchElement(element as HTMLElement)
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
    const boundElements = document.querySelectorAll(BOUND_SELECTOR)

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
          // eslint-disable-next-line
          if (existing == null) {
            xin[path] = value
          } else {
            const existingActual =
              // @ts-expect-error-error
              existing[XIN_PATH] != null
                ? (existing as XinProxy)[XIN_VALUE]
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

export function bind<T extends HTMLElement>(
  element: T,
  what: XinTouchableType | XinBindingSpec,
  binding: XinBinding<T>,
  options?: XinObject
): T {
  if (element instanceof DocumentFragment) {
    throw new Error('bind cannot bind to a DocumentFragment')
  }
  let path: string
  if (
    typeof what === 'object' &&
    (what as XinProxy)[XIN_PATH] === undefined &&
    options === undefined
  ) {
    const { value } = what as XinBindingSpec
    path = typeof value === 'string' ? value : value[XIN_PATH]
    options = what as XinObject
    delete options.value
  } else {
    path = typeof what === 'string' ? what : (what as XinProxy)[XIN_PATH]
  }
  if (path == null) {
    throw new Error('bind requires a path or object with xin Proxy')
  }
  const { toDOM } = binding

  element.classList.add(BOUND_CLASS)
  let dataBindings = elementToBindings.get(element)
  if (dataBindings == null) {
    dataBindings = []
    elementToBindings.set(element, dataBindings)
  }
  dataBindings.push({
    path,
    binding: binding as XinBinding<HTMLElement>,
    options,
  })

  if (toDOM != null && !path.startsWith('^')) {
    touch(path)
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
        // @ts-expect-error-error
        const value = target[prop]
        return typeof value === 'function' ? value.bind(target) : value
      }
    },
  })
  while (!propagationStopped && target != null) {
    const eventBindings = elementToHandlers.get(target) as XinEventBindings
    const handlers = eventBindings[event.type] || ([] as XinEventHandler[])
    for (const handler of handlers) {
      if (typeof handler === 'function') {
        handler(wrappedEvent)
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

export const on = (
  element: HTMLElement,
  eventType: string,
  eventHandler: XinEventHandler
): void => {
  let eventBindings = elementToHandlers.get(element)
  element.classList.add(EVENT_CLASS)
  if (eventBindings == null) {
    eventBindings = {}
    elementToHandlers.set(element, eventBindings)
  }
  if (!eventBindings[eventType]) {
    eventBindings[eventType] = []
  }
  if (!eventBindings[eventType].includes(eventHandler)) {
    eventBindings[eventType].push(eventHandler)
  }
  if (!handledEventTypes.has(eventType)) {
    handledEventTypes.add(eventType)
    document.body.addEventListener(eventType, handleBoundEvent, true)
  }
}
