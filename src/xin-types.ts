import { XIN_PATH, XIN_VALUE } from './metadata'
import { XinStyleRule } from './css-types'

export type AnyFunction = (...args: any[]) => any | Promise<any>

export type XinScalar = string | boolean | number | symbol | AnyFunction

export type XinArray = any[]

export interface XinObject {
  [key: string | number | symbol]: any
}

export type XinProxyTarget = XinObject | XinArray

export type XinValue = XinObject | XinArray | XinScalar | null | undefined

export interface XinProps {
  [XIN_VALUE]: XinObject | XinObject | XinScalar
  [XIN_PATH]: string
}

export type XinProxy<T> = T extends number
  ? XinProxy<Number>
  : T extends string
  ? XinProxy<String>
  : T extends boolean
  ? XinProxy<Boolean>
  : T extends bigint
  ? bigint
  : T extends symbol
  ? symbol
  : T extends null | undefined
  ? null | undefined
  : T extends Array<infer U>
  ? Array<XinProxy<U>>
  : T extends object
  ? { [K in keyof T]: XinProxy<T[K]> }
  : T

export type XinProxyObject = XinProps & {
  [key: string]:
    | XinProxyObject
    | XinProxyArray
    | XinObject
    | XinArray
    | XinScalar
}

export type XinProxyArray = XinProps & { [key: string]: XinProxyObject } & (
    | XinProxyObject[]
    | XinScalar[]
  )
export type XinTouchableType = string | XinProps
export type XinEventHandler<T = Event> =
  | ((evt: T) => void)
  | ((evt: T) => Promise<void>)
  | string
export type XinBindingShortcut = XinTouchableType | XinBindingSpec

type _BooleanFunction = () => boolean
type _PathTestFunction = (path: string) => boolean | symbol
export type PathTestFunction = _BooleanFunction | _PathTestFunction

type OptionalSymbol = symbol | undefined
type _CallbackFunction = (() => void) | (() => OptionalSymbol)
type _PathCallbackFunction =
  | ((path: string) => void)
  | ((path: string) => OptionalSymbol)
export type ObserverCallbackFunction = _PathCallbackFunction | _CallbackFunction

export interface XinBindingSpec {
  value: XinTouchableType | any
  [key: string]: any
}

export type XinBindingSetter<T = Element> = (
  element: T,
  value: any,
  options?: XinObject
) => void
export type XinBindingGetter<T = Element> = (
  element: T,
  options?: XinObject
) => any

export interface XinBinding<T = Element> {
  toDOM?: XinBindingSetter<T>
  fromDOM?: XinBindingGetter<T>
}

export interface XinInlineBinding<T = Element> {
  value: XinTouchableType
  binding: XinBinding<T> | XinBindingSetter<T> | string
}

export interface ElementProps<T = Element> {
  onClick?: XinEventHandler<MouseEvent>
  onInput?: XinEventHandler
  onChange?: XinEventHandler
  onSubmit?: XinEventHandler
  bind?: XinInlineBinding<T>
  bindValue?: XinBindingShortcut
  bindText?: XinBindingShortcut
  bindList?: XinBindingShortcut
  bindEnabled?: XinBindingShortcut
  bindDisabled?: XinBindingShortcut
  bindStyle?: XinBindingShortcut
  style?: XinStyleRule
  class?: string
  apply?: (element: Element) => void | Promise<void>
  [key: string]: any
}

export interface StringMap {
  [key: string]: any
}

export interface PartsMap<T = Element> {
  [key: string]: T
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
export type HTMLElementCreator<T = Element> = (
  ...contents: ElementPart<T>[]
) => T
export type FragmentCreator = (
  ...contents: ElementPart<Element>[]
) => DocumentFragment
export type ElementCreator<T = Element> = (...contents: ElementPart<T>[]) => T
export type ContentPart = Element | DocumentFragment | string
export type ContentType = ContentPart | ContentPart[]
