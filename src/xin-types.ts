import { XIN_PATH, XIN_VALUE } from './metadata'
import { XinStyleRule } from './css-types'

export type XinScalar = string | boolean | number | Function

export type XinArray = XinObject[] | XinScalar[]

export interface XinObject {
  [key: string]: XinObject | XinArray | XinScalar
}

export type XinProxyTarget = XinObject | XinArray

export type XinValue = XinObject | XinArray | XinScalar | null | undefined

export interface XinProps {
  [XIN_VALUE]: XinObject | XinObject | XinScalar
  [XIN_PATH]: string
}

export type XinProxyObject = XinProps & {
  [key: string]: XinProxyObject | XinProxyArray | XinObject | XinArray | XinScalar
}

export type XinProxyArray = XinProps & { [key: string]: XinProxyObject } & (XinProxyObject[] | XinScalar[])
export type XinProxy = XinProps & (XinObject | XinArray)
export type XinProxyValue = XinProxy | XinScalar | null | undefined
export type XinTouchableType = string | XinProps
export type XinEventHandler<T=Event> = ((evt: T) => void) | ((evt: T) => Promise<void>) | string
export type XinBindingShortcut = XinTouchableType | XinBindingSpec

type _BooleanFunction = () => boolean
type _PathTestFunction = (path: string) => boolean | Symbol
export type PathTestFunction = _BooleanFunction | _PathTestFunction

type OptionalSymbol = Symbol | undefined
type _CallbackFunction = (() => void) | (() => OptionalSymbol)
type _PathCallbackFunction = ((path: string) => void) | ((path: string) => OptionalSymbol)
export type ObserverCallbackFunction = _PathCallbackFunction | _CallbackFunction

export interface XinBindingSpec {
  value: XinTouchableType | any
  [key: string]: any
}

export interface XinBinding<T = HTMLElement> {
  toDOM?: (element: T, value: any, options?: XinObject) => void
  fromDOM?: (element: T, options?: XinObject) => any
}
export interface ElementProps {
  onClick?: XinEventHandler<MouseEvent>
  onInput?: XinEventHandler
  onChange?: XinEventHandler
  onSubmit?: XinEventHandler
  bindValue?: XinBindingShortcut
  bindText?: XinBindingShortcut
  bindList?: XinBindingShortcut
  bindEnabled?: XinBindingShortcut
  bindDisabled?: XinBindingShortcut
  bindStyle?: XinBindingShortcut
  style?: XinStyleRule
  class?: string
  apply?: (element: HTMLElement) => void | Promise<void>
  [key: string]: any
}

export type ValueElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
export type SwissArmyElement = HTMLElement & HTMLInputElement & HTMLCanvasElement
export type ElementPart = HTMLElement | DocumentFragment | ElementProps | string | number
export type HTMLElementCreator<T extends Node = SwissArmyElement> = (...contents: ElementPart[]) => T
export type FragmentCreator = (...contents: ElementPart[]) => DocumentFragment
export type ElementCreator<T extends Node = SwissArmyElement> = (...contents: ElementPart[]) => T
export type ContentPart = HTMLElement | DocumentFragment | string
export type ContentType = ContentPart | ContentPart[]
