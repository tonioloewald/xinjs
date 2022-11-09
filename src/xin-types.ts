export interface XinObject {
  [key: string]: any
}

export type XinTouchableType = string | { _xinPath: string }

type _BooleanFunction = () => boolean
type _PathTestFunction = (path: string) => boolean | Symbol
export type PathTestFunction = _BooleanFunction | _PathTestFunction

type OptionalSymbol = Symbol | undefined
type _CallbackFunction = (() => void) | (() => OptionalSymbol)
type _PathCallbackFunction = ((path: string) => void) | ((path: string) => OptionalSymbol)
export type ObserverCallbackFunction = _PathCallbackFunction | _CallbackFunction

export interface XinBinding {
  toDOM?: (element: HTMLElement, value: any, options?: XinObject) => void
  fromDOM?: (element: HTMLElement) => any
}

export interface ElementProps {
  onClick?: (evt: MouseEvent) => void
  onInput?: (evt: Event) => void
  onChange?: (evt: Event) => void
  onSubmit?: (evt: Event) => void
  [key: string]: any
}

export type ElementPart = HTMLElement | DocumentFragment | ElementProps | string | number
export type HTMLElementCreator = (...contents: ElementPart[]) => HTMLElement
export type FragmentCreator = (...contents: ElementPart[]) => DocumentFragment
export type ElementCreator = HTMLElementCreator | FragmentCreator
