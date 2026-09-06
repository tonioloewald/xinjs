import { XIN_PATH, XIN_VALUE, XIN_OBSERVE, XIN_BIND, TOSI_ACCESSOR, TAKE_DESCRIPTOR } from './metadata'
import { TosiStyleRule } from './css-types'
import { ElementsProxy } from './elements-types'

export type AnyFunction = (...args: any[]) => any | Promise<any>

export type TosiScalar = string | boolean | number | symbol | AnyFunction

export type TosiArray = any[]

export interface TosiObject {
  [key: string | number | symbol]: any
}

export type TosiProxyTarget = TosiObject | TosiArray

export type TosiValue = TosiObject | TosiArray | TosiScalar | null | undefined

// THE DIRECT `.observe` DELEGATES TO THE ACCESSOR, so it must have the
// accessor's signature: a CALLBACK in, an unsubscribe function out.
//
// It was typed `(path: string) => void`, which is exactly inverted. The
// working call — `proxy.items.observe(cb)`, which the docs show and which
// returns an unsubscribe — was a type error, while the call the type
// prescribed THREW at runtime: `expect callback to be a path or function`.
// So the typing sent a consumer to the one spelling that cannot work.
//
// Invisible because no lane typechecks `*.test.ts`: two of our own tests
// (`list-methods.test.ts`) call it correctly and were reported as errors by
// a typecheck nobody ran. Same family as tosijs#31 (bindText) and #35
// (`.value` disagreeing between the direct property and the accessor).
type ProxyObserveFunc = (
  callback: ObserverCallbackFunction
) => VoidFunction
type ProxyBindFunc<T extends Element = Element> = (element: T, binding: TosiBinding<T>, options?: TosiObject) => VoidFunction

/**
 * TakeDescriptor is returned by `.take()` — a reactive binding descriptor
 * that carries paths to observe and a transform function.
 * The binding system uses this to wire up multi-path reactive transforms.
 */
export interface TakeDescriptor {
  [TAKE_DESCRIPTOR]: true
  paths: string[]
  transform: (...values: any[]) => any
}

/**
 * TosiAccessor is the collision-free observer API accessed via `.tosi`.
 * Unlike the direct properties (path, value, observe, etc.) which can be
 * shadowed by actual object properties, `.tosi` is always available.
 */
export interface TosiAccessor<T = any> {
  value: T
  readonly path: string
  touch: () => void
  observe: (callback: ObserverCallbackFunction) => VoidFunction
  bind: <E extends Element = Element>(element: E, binding: TosiBinding<E>, options?: TosiObject) => void
  on: (element: HTMLElement, eventType: keyof HTMLElementEventMap) => VoidFunction
  binding: (binding: TosiBinding) => { bind: { value: string; binding: TosiBinding } }
  // the `tosi`-prefixed alias exists at runtime on object AND scalar proxies,
  // and BoxedScalarAPI declares it — TosiProps did not, so the same call was
  // typed on a scalar and an error on an object. (`xinBinding` is NOT the
  // matching legacy pair: it is undefined on scalars and resolves to a phantom
  // nested proxy on objects, so it is deliberately absent here.)
  tosiBinding: (binding: TosiBinding) => { bind: { value: string; binding: TosiBinding } }
  listBinding: (templateBuilder: ListTemplateBuilder, options?: ListBindingOptions) => ListBinding
  listFind: {
    (selector: (item: any) => any, value: any): BoxedProxy | undefined
    (element: Element): BoxedProxy | undefined
  }
  listUpdate: (selector: (item: any) => any, newValue: any) => BoxedProxy
  listRemove: (selector: (item: any) => any, value: any) => boolean
  take: (...args: [...sources: any[], transform: (...values: any[]) => any]) => TakeDescriptor
}

/**
 * TosiProps provides the observer API for boxed objects and arrays.
 * The `.tosi` accessor is the preferred, collision-free way to access
 * the observer API. The direct properties (path, value, observe, etc.)
 * still work but can be shadowed by actual object properties with the
 * same names.
 */
export interface TosiProps<T = any> {
  // Collision-free API — always available
  [TOSI_ACCESSOR]: TosiAccessor<T>
  tosi: TosiAccessor<T>

  // Direct API (deprecated — can be shadowed by target properties)
  path: string
  value: T
  touch: () => void
  observe: ProxyObserveFunc
  bind: ProxyBindFunc
  on: (element: HTMLElement, eventType: keyof HTMLElementEventMap) => VoidFunction
  binding: (binding: TosiBinding) => { bind: { value: string; binding: TosiBinding } }
  // present at runtime on object AND scalar proxies. This was "fixed" once
  // already and landed in TosiAccessor instead — the same `binding:` line
  // exists in both interfaces and a first-match replace hit the wrong one,
  // while a runtime test (never broken) and a probe against TosiAccessor
  // (accidentally correct) both went green. The defect is HERE.
  tosiBinding: (binding: TosiBinding) => { bind: { value: string; binding: TosiBinding } }
  // `.take()` works directly on object and scalar proxies alike — it returns a
  // TakeDescriptor and is the plain-prop binding form the component docs
  // recommend. It was declared on TosiAccessor and on NEITHER direct-property
  // surface, so `proxy.take(...)` did not typecheck. Found by the guard in
  // type-surface.test.ts the moment it was widened past TosiAccessor.
  take: (...args: [...sources: any[], transform: (...values: any[]) => any]) => TakeDescriptor
  valueOf: () => T
  toJSON: () => T

  // Legacy API (deprecated but still supported). The `xin*` string aliases are
  // kept here in parity with BoxedScalarAPI — they resolve at runtime, so
  // dropping them from the type (but not the scalar type) was a silent,
  // typecheck-only break for object/array proxies (#19). Prefer `.value` /
  // `.tosi.value` / `.path` / `.tosi.path` in new code.
  [XIN_PATH]: string
  xinPath: string
  tosiPath: string
  [XIN_VALUE]: T
  xinValue: T
  tosiValue: T
  [XIN_OBSERVE]: ProxyObserveFunc
  xinObserve: ProxyObserveFunc
  tosiObserve: ProxyObserveFunc
  [XIN_BIND]: ProxyBindFunc
  xinBind: ProxyBindFunc
  tosiBind: ProxyBindFunc
}

type ListTemplateBuilder<U = any> = (elements: ElementsProxy, item: U, columnIndex?: number) => HTMLElement
type ListBinding = [ElementProps, HTMLTemplateElement]

type ListFieldSelector<U> = (item: BoxedProxy<U>) => BoxedScalar<any>

export interface BoxedArrayProps<U = any> {
  // Primary API
  listBinding: (templateBuilder: ListTemplateBuilder<U>, options?: ListBindingOptions) => ListBinding
  // Legacy API
  tosiListBinding: (templateBuilder: ListTemplateBuilder<U>, options?: ListBindingOptions) => ListBinding

  // List operations
  listFind: {
    (selector: ListFieldSelector<U>, value: any): BoxedProxy<U> | undefined
    (element: Element): BoxedProxy<U> | undefined
  }
  listUpdate: (selector: ListFieldSelector<U>, newValue: U) => BoxedProxy<U>
  listRemove: (selector: ListFieldSelector<U>, value: any) => boolean
}

/**
 * BoxedScalarAPI is the observer API surface for boxed primitives.
 */
interface BoxedScalarAPI<T> {
  // Collision-free API — always available
  [TOSI_ACCESSOR]: TosiAccessor<T>
  tosi: TosiAccessor<T>

  // Direct API (deprecated — can be shadowed on object proxies, safe on scalars)
  value: T
  path: string
  touch: () => void
  observe: (callback: ObserverCallbackFunction) => VoidFunction
  bind: <E extends Element = Element>(element: E, binding: TosiBinding<E>, options?: TosiObject) => void
  on: (element: HTMLElement, eventType: keyof HTMLElementEventMap) => VoidFunction
  binding: (binding: TosiBinding) => { bind: { value: string; binding: TosiBinding } }
  // served on scalars too (`app.count.take(v => v > 3)`), and was declared on
  // TosiAccessor only — so the direct spelling did not typecheck on either
  // proxy kind. Third surface of the same drift; the guard now covers all three.
  take: (...args: [...sources: any[], transform: (...values: any[]) => any]) => TakeDescriptor
  listBinding: (templateBuilder: ListTemplateBuilder<T>, options?: ListBindingOptions) => ListBinding

  // Type coercion methods
  valueOf: () => T
  toString: () => string
  toJSON: () => T

  // Deprecated aliases - will trigger console warning
  xinValue: T
  xinPath: string
  tosiValue: T
  tosiPath: string
  xinObserve: (callback: ObserverCallbackFunction) => VoidFunction
  tosiObserve: (callback: ObserverCallbackFunction) => VoidFunction
  xinBind: <E extends Element = Element>(element: E, binding: TosiBinding<E>, options?: TosiObject) => void
  tosiBind: <E extends Element = Element>(element: E, binding: TosiBinding<E>, options?: TosiObject) => void
  xinOn: (element: HTMLElement, eventType: keyof HTMLElementEventMap) => VoidFunction
  tosiOn: (element: HTMLElement, eventType: keyof HTMLElementEventMap) => VoidFunction
  tosiBinding: (binding: TosiBinding) => { bind: { value: string; binding: TosiBinding } }
}

/**
 * BoxedScalar represents a boxed primitive value (string, number, boolean, null, undefined).
 * It provides the reactive API (value, path, observe, etc.) plus all methods from the
 * underlying primitive's prototype (e.g. toLocaleLowerCase for strings, toFixed for numbers).
 *
 * Note: Direct assignment like `proxy.x = 3` is a TypeScript type error due to
 * fundamental limitations in TypeScript's mapped types (no asymmetric get/set).
 * Use `proxy.x.value = 3` instead.
 */
export type BoxedScalar<T> = BoxedScalarAPI<T> &
  (T extends string ? Omit<String, keyof BoxedScalarAPI<any>>
  : T extends number ? Omit<Number, keyof BoxedScalarAPI<any>>
  : T extends boolean ? Omit<Boolean, keyof BoxedScalarAPI<any>>
  : unknown)

export type BoxedProxy<T = any> = T extends Array<infer U>
  ? Array<BoxedProxy<U>> & TosiProps<T> & BoxedArrayProps<U>
  : T extends Function
  ? T & TosiProps<Function>
  : T extends object
  ? {
    [K in keyof T]: BoxedProxy<T[K]>
  } & TosiProps<T>
  : T extends string
  ? BoxedScalar<string>
  : T extends number
  ? BoxedScalar<number>
  : T extends boolean
  ? BoxedScalar<boolean>
  : T extends undefined | null
  ? BoxedScalar<T>
  : T

// Unboxed extracts the primitive value from a BoxedScalar or returns T as-is
// Since boxed scalars are proxies (not String/Number/Boolean objects),
// we check for BoxedScalar interface
export type Unboxed<T = any> = T extends BoxedScalar<infer U>
  ? U
  : T extends String
  ? string
  : T extends Number
  ? number
  : T extends Boolean
  ? boolean
  : T

export type TosiProxy<T = any> = T extends Array<infer U>
  ? Array<TosiProxy<U>>
  : T extends Function
  ? T
  : T extends object
  ? {
    [K in keyof T]: T[K] extends object ? TosiProxy<T[K]> : T[K]
  }
  : T

export type TosiProxyObject = TosiProps<object> & {
  [key: string]:
    | TosiProxyObject
    | TosiProxyArray
    | TosiObject
    | TosiArray
    | TosiScalar
}

export type TosiProxyArray = TosiProps<[]> & { [key: string]: TosiProxyObject } & (
    | TosiProxyObject[]
    | TosiScalar[]
  )
export type TosiTouchableType = string | TosiProxy | BoxedProxy | String | Number | Boolean

export type EventType = keyof HTMLElementEventMap
export type TosiEventHandler<T extends Event = Event, E = Element> =
  | ((evt: T & {target: E}) => void)
  | ((evt: T & {target: E}) => Promise<void>)
  | string
export type TosiBindingShortcut = TosiTouchableType | TosiBindingSpec | TakeDescriptor

type _BooleanFunction = () => boolean
type _PathTestFunction = (path: string) => boolean | symbol
export type PathTestFunction = _BooleanFunction | _PathTestFunction

type OptionalSymbol = symbol | undefined
type _CallbackFunction = (() => void) | (() => OptionalSymbol)
type _PathCallbackFunction =
  | ((path: string) => void)
  | ((path: string) => OptionalSymbol)
export type ObserverCallbackFunction = _PathCallbackFunction | _CallbackFunction

export interface TosiBindingSpec {
  value: TosiTouchableType | any
  [key: string]: any
}

export type TosiBindingSetter<T = Element> = (
  element: T,
  value: any,
  options?: TosiObject
) => void
export type TosiBindingGetter<T = Element> = (
  element: T,
  options?: TosiObject
) => any

export interface TosiBinding<T = Element> {
  toDOM?: TosiBindingSetter<T>
  fromDOM?: TosiBindingGetter<T>
}

export interface TosiInlineBinding<T = Element> {
  value: TosiTouchableType
  binding: TosiBinding<T> | TosiBindingSetter<T> | string
  /** forwarded as `bind()`'s fourth argument — idPath, virtual, hiddenProp… */
  options?: TosiObject
}

// The `class` element-prop accepts (as of 1.6.6):
// - a space-separated string:            'card selected'
// - an array (falsy entries skipped):    ['card', isSel && 'selected']
// - a boolean map (adds/removes):        { card: true, selected: isSel }
// A top-level falsy value adds no class (idiomatic `cond ? 'x' : false`).
export type TosiClassSpec =
  | string
  | false
  | null
  | Array<string | false | null | undefined>
  | Record<string, boolean>

export interface ElementProps<T = Element> {
  onClick?: TosiEventHandler<MouseEvent, T>
  onMousedown?: TosiEventHandler<MouseEvent, T>
  onMouseenter?: TosiEventHandler<MouseEvent, T>
  onMouseleave?: TosiEventHandler<MouseEvent, T>
  onMouseup?: TosiEventHandler<MouseEvent, T>
  onTouchstart?: TosiEventHandler<TouchEvent, T>
  onTouchmove?: TosiEventHandler<TouchEvent, T>
  onTouchend?: TosiEventHandler<TouchEvent, T>
  onTouchcancel?: TosiEventHandler<TouchEvent, T>
  onDragstart?: TosiEventHandler<DragEvent, T>
  onDragover?: TosiEventHandler<DragEvent, T>
  onDragend?: TosiEventHandler<DragEvent, T>
  onDragenter?: TosiEventHandler<DragEvent, T>
  onDragleave?: TosiEventHandler<DragEvent, T>
  onInput?: TosiEventHandler<InputEvent, T>
  onChange?: TosiEventHandler<InputEvent, T>
  onSubmit?: TosiEventHandler<SubmitEvent, T>
  onKeydown?: TosiEventHandler<KeyboardEvent, T>
  onKeyup?: TosiEventHandler<KeyboardEvent, T>
  /** one inline binding, or several — `create()` accumulates rather than
   * overwriting, so a container can be list-bound AND carry its own binding */
  bind?: TosiInlineBinding<T> | Array<TosiInlineBinding<T>>
  /** TWO-WAY value binding; `value: proxy` is one-way (state -> DOM) only */
  bindValue?: TosiBindingShortcut
  /** Text binding. With a proxy, `{ textContent: proxy }` says the same thing
   * in a plain prop and is the more durable spelling; with a PATH STRING this
   * is the only form that binds — `textContent: 'path'` sets the literal text
   * "path" and silently does not bind (a mistake that typechecks and passes a
   * unit suite; it was caught only by the browser doc-test lane). Not
   * deprecated in either form. */
  bindText?: TosiBindingShortcut
  /** the low-level list-binding prop; `.tosi.listBinding()` is sugar over it */
  bindList?: TosiBindingShortcut
  /** Enabled binding (inverted `disabled`). With a proxy,
   * `{ disabled: proxy.tosi.take(v => !v) }` is the plain-prop equivalent;
   * with a PATH STRING this is the only form that works — `disabled: 'path'`
   * assigns a non-empty, therefore always truthy, string and permanently
   * DISABLES the control. Not deprecated in either form. */
  bindEnabled?: TosiBindingShortcut
  /** Disabled binding. With a proxy, `{ disabled: proxy }` is the plain-prop
   * equivalent; with a PATH STRING this is the only form that works, for the
   * same always-truthy reason as `bindEnabled`. Not deprecated. */
  bindDisabled?: TosiBindingShortcut
  style?: TosiStyleRule
  class?: TosiClassSpec
  apply?: (element: Element) => void | Promise<void>
  /** inline contract: JSON-Schema-shaped description of the element's bound
   *  value — harvested into the agent surface's map, enforced on agent
   *  writes, overridable by top-level curation (expose.contract) */
  contract?: Record<string, any>
  [key: string]: any
}

export interface StringMap {
  [key: string]: any
}

export interface PartsMap {
  [key: string]: Element
}

export type ValueElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
export type ElementPart<T = Element> =
  | Element
  | DocumentFragment
  | ElementProps<T>
  | string
  | number
  // A BARE PROXY IS A LIVE TEXT CHILD — `div(app.name)` renders the value and
  // keeps rendering it as the value changes. The runtime has always supported
  // it, and elements.test.ts calls it "the most-used site", but the type did
  // not admit it, so the idiomatic spelling was a type error for every
  // consumer. Same family as the direct `.observe` being typed backwards:
  // a type narrower than the runtime it describes, invisible because no lane
  // typechecks `*.test.ts`.
  // a Map is a props bag too — allowed, never required
  | Map<string, any>
  | BoxedScalar<any>
  // NOT `BoxedProxy<any>`. `any` distributes through BoxedProxy's conditional
  // — the `T extends Function` branch yields `any & …` = `any` — and a union
  // containing `any` IS `any`. Writing it that way collapsed this entire type
  // to `any`, which deleted argument checking on the most-used API in the
  // library: `div(() => {})` and `div(new Date())` started typechecking, and
  // `button({ onClick: (evt) => evt.clientX })` broke with TS7006 because
  // there was no longer a signature to infer from. That is tosijs#36's defect
  // (an index signature making every typo compile) reproduced one layer up,
  // in the release that exists to fix it.
  //
  // TosiProps<any> covers object and array proxies without the conditional,
  // so the union stays a union.
  | TosiProps<any>
export type HTMLElementCreator<T = HTMLElement> = (
  ...contents: ElementPart<T>[]
) => T
export type FragmentCreator = (
  ...contents: ElementPart<Element>[]
) => DocumentFragment
export type ElementCreator<T = Element> = (...contents: ElementPart<T>[]) => T
// CONTENT IS ELEMENT-CREATOR ARGUMENTS. `hydrate()` runs every item through
// `applyPositional` — the same code `create()` uses — so the accepted set is
// by construction the same set, and this should not be a second hand-written
// union that drifts from it.
//
// It was one, briefly: a partial union whose only object arm was
// `TosiProps<any>` (24 required members), which admitted proxies and values
// and rejected a `Date`, a plain props object and a `Map` — three of the six
// rows in the doc table shipped in the same commit, all of which RUN
// correctly. The probe written to catch that tested exactly the shapes the
// partial union already admitted.
//
// `ElementPart` carries `ElementProps<T> | Map<string, any>`, and
// `ElementProps` has the index signature that absorbs props bags. Aliasing is
// the fix: one definition, so "the same code, so the two cannot drift" is true
// of the types as well as the runtime.
export type ContentPart = ElementPart | null | undefined
export type ContentType = ContentPart | ContentPart[]

export type ListFilter = (array: any[], needle: any) => any[]
export interface ListBindingOptions {
  idPath?: string
  virtual?: {
    height: number
    /** When set, enables variable-height mode using scroll-fraction interpolation.
     *  Items render at natural height; minHeight is used for scroll area estimation. */
    minHeight?: number
    width?: number
    visibleColumns?: number
    rowChunkSize?: number
    /** Use 'window' to virtualize based on window scroll position instead of element scroll */
    scrollContainer?: 'window' | 'element'
    /** Number of elements to stamp per array item (for grid layouts). Default 1. */
    itemsPerRow?: number
  }
  hiddenProp?: symbol | string
  visibleProp?: symbol | string
  filter?: ListFilter
  needle?: TosiTouchableType
}

/* --- DEPRECATED `Xin*` SPELLINGS -------------------------------------------
 * The library is tosijs; these names are xinjs-era. The canonical spellings
 * are the `Tosi*` forms above. Kept exported so existing
 * `import { XinStyleSheet } from 'tosijs'` keeps compiling — a type-only
 * alias, so it costs nothing at runtime and nothing in the bundle.
 *
 * SCHEDULED FOR REMOVAL IN 2.0. The blueprint types were renamed this way in
 * 1.7.6 and the remaining 22 were simply missed, untracked, for four
 * releases — so this block states its own end, rather than drifting again.
 * -------------------------------------------------------------------------- */
/** @deprecated Use `TosiScalar` */
export type XinScalar = TosiScalar
/** @deprecated Use `TosiArray` */
export type XinArray = TosiArray
/** @deprecated Use `TosiObject` */
export type XinObject = TosiObject
/** @deprecated Use `TosiProxyTarget` */
export type XinProxyTarget = TosiProxyTarget
/** @deprecated Use `TosiValue` */
export type XinValue = TosiValue
/** @deprecated Use `TosiProps` */
export type XinProps<T = any> = TosiProps<T>
/** @deprecated Use `TosiProxy` */
export type XinProxy<T = any> = TosiProxy<T>
/** @deprecated Use `TosiProxyObject` */
export type XinProxyObject = TosiProxyObject
/** @deprecated Use `TosiProxyArray` */
export type XinProxyArray = TosiProxyArray
/** @deprecated Use `TosiTouchableType` */
export type XinTouchableType = TosiTouchableType
/** @deprecated Use `TosiEventHandler` */
export type XinEventHandler<T extends Event = Event, E = Element> = TosiEventHandler<T, E>
/** @deprecated Use `TosiBindingShortcut` */
export type XinBindingShortcut = TosiBindingShortcut
/** @deprecated Use `TosiBindingSpec` */
export type XinBindingSpec = TosiBindingSpec
/** @deprecated Use `TosiBindingSetter` */
export type XinBindingSetter<T = Element> = TosiBindingSetter<T>
/** @deprecated Use `TosiBindingGetter` */
export type XinBindingGetter<T = Element> = TosiBindingGetter<T>
/** @deprecated Use `TosiBinding` */
export type XinBinding<T = Element> = TosiBinding<T>
/** @deprecated Use `TosiInlineBinding` */
export type XinInlineBinding<T = Element> = TosiInlineBinding<T>
/** @deprecated Use `TosiClassSpec` */
export type XinClassSpec = TosiClassSpec
