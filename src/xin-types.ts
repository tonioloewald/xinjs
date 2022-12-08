export type XinScalar = string | boolean | number | Function

export type XinArray = XinObject[] | XinScalar[]

export interface XinObject {
  [key: string]: XinObject | XinArray | XinScalar
}

export type XinProxyTarget = XinObject | XinArray

export type XinValue = XinObject | XinArray | XinScalar | null | undefined

export const xinPath = Symbol('xin-path')
export const xinValue = Symbol('xin-value')

export interface XinProps {
  [xinValue]: XinObject | XinObject | XinScalar
  [xinPath]: string
}

export type XinProxyObject = XinProps & {
  [key: string]: XinProxyObject | XinProxyArray | XinObject | XinArray | XinScalar
}

export type XinProxyArray = XinProps & { [key: string]: XinProxyObject } & (XinProxyObject[] | XinScalar[])

export type XinProxy = XinProps & (XinObject | XinArray)

export type XinProxyValue = XinProxy | XinScalar | null | undefined

export type XinTouchableType = string | XinProps

export type XinEventHandler<T=Event> = ((evt: T) => void) | string

export type XinBindingShortcut = XinTouchableType | XinBindingSpec

type _BooleanFunction = () => boolean
type _PathTestFunction = (path: string) => boolean | Symbol
export type PathTestFunction = _BooleanFunction | _PathTestFunction

type OptionalSymbol = Symbol | undefined
type _CallbackFunction = (() => void) | (() => OptionalSymbol)
type _PathCallbackFunction = ((path: string) => void) | ((path: string) => OptionalSymbol)
export type ObserverCallbackFunction = _PathCallbackFunction | _CallbackFunction

export interface XinBindingSpec {
  value: XinTouchableType
  [key: string]: any
}

export interface XinBinding {
  toDOM?: (element: HTMLElement, value: any, options?: XinObject) => void
  fromDOM?: (element: HTMLElement, options?: XinObject) => any
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
  [key: string]: any
}

export type SwissArmyElement = HTMLInputElement & HTMLCanvasElement
export type ElementPart = SwissArmyElement | DocumentFragment | ElementProps | string | number
export type HTMLElementCreator = (...contents: ElementPart[]) => SwissArmyElement
export type FragmentCreator = (...contents: ElementPart[]) => DocumentFragment
export type ElementCreator<T = HTMLElementCreator | FragmentCreator> = (...contents: ElementPart[]) => T
