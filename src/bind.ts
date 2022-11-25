import { xin, touch, observe, xinPath, xinValue } from './xin'
import { getListItem, elementToBindings, elementToHandlers, DataBindings, BOUND_CLASS, BOUND_SELECTOR, EVENT_CLASS, EVENT_SELECTOR, XinEventBindings, XinEventHandler } from './metadata'
import { XinObject, XinTouchableType, XinBinding, XinProxy, XinBindingSpec } from './xin-types'

observe(() => true, (changedPath: string) => {
  const boundElements = globalThis.document.body.querySelectorAll(BOUND_SELECTOR)

  for (const element of boundElements) {
    const dataBindings = elementToBindings.get(element) as DataBindings
    for (const dataBinding of dataBindings) {
      let { path, binding, options } = dataBinding
      const { toDOM } = binding
      if (toDOM != null) {
        if (path.startsWith('^')) {
          const dataSource = getListItem(element as HTMLElement)
          if (dataSource != null && (dataSource as XinProxy)[xinPath] != null) {
            path = dataBinding.path = `${(dataSource as XinProxy)[xinPath]}${path.substring(1)}`
          } else {
            console.error(`Cannot resolve relative binding ${path}`, element, 'is not part of a list')
            throw new Error(`Cannot resolve relative binding ${path}`)
          }
        }
        if (path.startsWith(changedPath)) {
          toDOM(element as HTMLElement, xin[path], options)
        }
      }
    }
  }
})

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
            // @ts-expect-error-error
            const existingActual = existing[xinPath] != null ? (existing as XinProxy)[xinValue] : existing
            const valueActual = value[xinPath] != null ? value[xinValue] : value
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
  globalThis.document.body.addEventListener('change', handleChange, true)
  globalThis.document.body.addEventListener('input', handleChange, true)
}

export const bind = (element: HTMLElement | DocumentFragment, what: XinTouchableType | XinBindingSpec, binding: XinBinding, options?: XinObject): HTMLElement => {
  if (element instanceof DocumentFragment) {
    throw new Error('bind cannot bind to a DocumentFragment')
  }
  let path: string
  if (typeof what === 'object' && (what as XinProxy)[xinPath] === undefined && options === undefined) {
    const { value } = what as XinBindingSpec
    path = typeof value === 'string' ? value : value[xinPath]
    options = what as XinObject
    delete options.value
  } else {
    path = typeof what === 'string' ? what : (what as XinProxy)[xinPath]
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
  dataBindings.push({ path, binding, options })

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
    get (target, prop) {
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
    }
  })
  // eslint-disable-next-line no-unmodified-loop-condition
  while (!propagationStopped && target != null) {
    const eventBindings = elementToHandlers.get(target) as XinEventBindings
    // eslint-disable-next-line
    const handlers = eventBindings[event.type] || [] as XinEventHandler[]
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
    target = target.parentElement.closest(EVENT_SELECTOR)
  }
}

export const on = (element: HTMLElement, eventType: string, eventHandler: XinEventHandler): void => {
  let eventBindings = elementToHandlers.get(element)
  element.classList.add(EVENT_CLASS)
  if (eventBindings == null) {
    eventBindings = {}
    elementToHandlers.set(element, eventBindings)
  }
  // eslint-disable-next-line
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
