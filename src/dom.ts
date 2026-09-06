import { cloneWithBindings } from './metadata'
import { ValueElement } from './xin-types'

export const dispatch = (
  target: Element,
  type: string,
  // change/input must bubble (and compose) so bind()'s delegated document.body
  // listener sees them — a component bound like an <input> via bindings.value
  // reports edits through its `change` event, and a non-bubbling event never
  // reached the delegated fromDOM handler. Defaults preserve non-bubbling
  // dispatch for internal events like 'resize'.
  { bubbles = false, composed = false }: EventInit = {}
): void => {
  const event = new Event(type, { bubbles, composed })
  target.dispatchEvent(event)
}

const valueType = (element: Element): string => {
  if (element instanceof HTMLInputElement) {
    return element.type
  } else if (
    element instanceof HTMLSelectElement &&
    element.hasAttribute('multiple')
  ) {
    return 'multi-select'
  } else {
    return 'other'
  }
}

// DOM controls speak string; state speaks typed values. The binding layer is
// the type boundary, in two layers (H-6, decided 2026-07-17):
//   1. typed-control reads (below): a control that DECLARES its type is read
//      natively — number/range as numbers, the date family as Dates, time as
//      ms-since-midnight — independent of state. This keeps the FIRST write
//      correctly typed when state is still undefined (deeply-async pattern),
//      and keeps getValue honest as a standalone utility.
//   2. state-driven coercion (bind.ts handleChange): for controls that don't
//      declare a type, the type state currently holds is authoritative.
// Empty/partial entry never fabricates a value: NaN/null falls back to the
// control's raw string.

const pad = (n: number, len = 2): string => String(n).padStart(len, '0')

// the string serialization each date-family control expects. type=date /
// month use UTC fields (matching valueAsDate semantics); datetime-local is
// local time per spec.
const dateToControlString = (type: string, d: Date): string => {
  switch (type) {
    case 'date':
      return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(
        d.getUTCDate()
      )}`
    case 'month':
      return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`
    case 'datetime-local':
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
      )}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    default:
      return d.toISOString()
  }
}

const msToTimeString = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const hhmm = `${pad(Math.floor(seconds / 3600))}:${pad(
    Math.floor(seconds / 60) % 60
  )}`
  // platform normalization omits zero seconds
  return seconds % 60 === 0 ? hhmm : `${hhmm}:${pad(seconds % 60)}`
}

const timeStringToMs = (value: string): number => {
  const match = value.match(/^(\d\d):(\d\d)(?::(\d\d)(?:\.(\d+))?)?$/)
  if (match == null) return NaN
  const [, h, m, sec, frac] = match
  return (
    (Number(h) * 60 + Number(m)) * 60000 +
    Number(sec ?? 0) * 1000 +
    Number(frac ?? 0)
  )
}

// True while a BINDING is writing state into the DOM (bindings.value.toDOM
// === setValue). A contract violation on this path must be REPORTED, never
// thrown: the throw lands inside the global dispatch loop and strands every
// element bound after it — and under the documented bind-before-data
// pattern it fires with no user error present at all (setValue writes '' or
// undefined while state hasn't arrived). Direct programmatic writes still
// throw: that IS the developer's own mistake, caught immediately.
let bindingWriteDepth = 0
export const isBindingWrite = (): boolean => bindingWriteDepth > 0

export const setValue = (element: Element, newValue: any): void => {
  bindingWriteDepth++
  try {
    setValueInner(element, newValue)
  } finally {
    bindingWriteDepth--
  }
}

const setValueInner = (element: Element, newValue: any): void => {
  const type = valueType(element)
  switch (type) {
    case 'radio':
      // String() the state side: numeric state 5 must check value="5"
      ;(element as HTMLInputElement).checked =
        newValue != null &&
        (element as HTMLInputElement).value === String(newValue)
      break
    case 'checkbox':
      ;(element as HTMLInputElement).checked = !!newValue
      break
    case 'date':
    case 'datetime-local':
    case 'month':
    case 'week': {
      const input = element as HTMLInputElement
      if (newValue == null || newValue === '') {
        // clear the field — new Date(null) used to render 1970-01-01
        input.value = ''
      } else if (newValue instanceof Date || typeof newValue === 'number') {
        const d = newValue instanceof Date ? newValue : new Date(newValue)
        if (type === 'week') {
          // no portable string serialization for ISO weeks — lean on the
          // platform, and leave the field alone where it isn't supported
          try {
            input.valueAsDate = d
          } catch (_e) {
            // ignore: setter unsupported in this environment
          }
        } else {
          input.value = dateToControlString(type, d)
        }
      } else {
        input.value = String(newValue)
      }
      break
    }
    case 'time': {
      const input = element as HTMLInputElement
      if (newValue == null || newValue === '') {
        input.value = ''
      } else if (typeof newValue === 'number') {
        input.value = msToTimeString(newValue)
      } else if (newValue instanceof Date) {
        input.value = `${pad(newValue.getHours())}:${pad(
          newValue.getMinutes()
        )}:${pad(newValue.getSeconds())}`
      } else {
        input.value = String(newValue)
      }
      break
    }
    case 'multi-select':
      for (const option of Array.from(
        (element as HTMLSelectElement).querySelectorAll('option')
      ) as HTMLOptionElement[]) {
        // accept the natural array-of-selected-values shape as well as the
        // PickMap; undefined (bound before data exists) selects nothing
        // instead of throwing inside the observer flush
        option.selected = Array.isArray(newValue)
          ? newValue.map(String).includes(option.value)
          : newValue != null
          ? !!newValue[option.value]
          : false
      }
      break
    default:
      // binding before the data exists must render an empty control, not
      // the literal string "undefined"
      ;(element as HTMLInputElement).value = newValue == null ? '' : newValue
  }
}

interface PickMap {
  [key: string]: boolean
}
export const getValue = (element: ValueElement): any => {
  const type = valueType(element)
  switch (type) {
    case 'radio': {
      const radio = element.parentElement?.querySelector(
        `[name="${element.name}"]:checked`
      ) as HTMLInputElement
      return radio != null ? radio.value : null
    }
    case 'checkbox':
      return (element as HTMLInputElement).checked
    case 'number':
    case 'range': {
      const input = element as HTMLInputElement
      const n =
        typeof input.valueAsNumber === 'number'
          ? input.valueAsNumber
          : Number(input.value)
      return Number.isNaN(n) ? input.value : n
    }
    case 'date':
    case 'datetime-local':
    case 'month':
    case 'week': {
      const input = element as HTMLInputElement
      const d =
        input.valueAsDate ?? (input.value !== '' ? new Date(input.value) : null)
      return d != null && !Number.isNaN(d.getTime()) ? d : input.value
    }
    case 'time': {
      const input = element as HTMLInputElement
      let n =
        typeof input.valueAsNumber === 'number' ? input.valueAsNumber : NaN
      if (Number.isNaN(n)) n = timeStringToMs(input.value)
      return Number.isNaN(n) ? input.value : n
    }
    case 'multi-select':
      return Array.from(element.querySelectorAll('option')).reduce(
        (map: PickMap, option: HTMLOptionElement): PickMap => {
          map[option.value] = option.selected
          return map
        },
        {}
      )
    default:
      return element.value
  }
}

const { ResizeObserver } = globalThis
export const resizeObserver =
  ResizeObserver != null
    ? new ResizeObserver((entries) => {
        for (const entry of entries) {
          const element = entry.target
          dispatch(element, 'resize')
        }
      })
    : {
        observe() {},
        unobserve() {},
      }

/**
 * Append ALREADY-CLASSIFIED content. Both callers run their items through
 * `applyPositional` first, so by here everything is a Node or a string —
 * which is why the parameter is not `ContentType`. It used to be, and that
 * was only harmless while `ContentType` happened to be that narrow: widening
 * `ContentPart` to match what `content` arrays really accept (values, boxed
 * proxies, null) immediately made this a type error, correctly, because this
 * function cannot handle those and is never given them.
 */
export type ResolvedContent = Node | string | Array<Node | string>

export const appendContentToElement = (
  elt: Element | ShadowRoot | null | undefined,
  content: ResolvedContent | null | undefined,
  cloneElements = true
): void => {
  if (elt != null && content != null) {
    if (typeof content === 'string') {
      elt.textContent = content
    } else if (Array.isArray(content)) {
      content.forEach((node) => {
        elt.append(
          node instanceof Node && cloneElements ? cloneWithBindings(node) : node
        )
      })
    } else if (content instanceof Node) {
      elt.append(cloneElements ? cloneWithBindings(content) : content)
    } else {
      throw new Error('expect text content or document node')
    }
  }
}
