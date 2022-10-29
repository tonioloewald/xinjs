export type XinObject = {
  [key: string] : any
}

export type XinTouchableType = string | {_xinPath: string}

type _BooleanFunction = () => boolean
type _PathTestFunction = (path: string) => boolean | Symbol
export type PathTestFunction = _BooleanFunction | _PathTestFunction

type _CallbackFunction = () => void | Symbol
type _PathCallbackFunction = (path: string) => void | Symbol
export type ObserverCallbackFunction = _PathCallbackFunction | _CallbackFunction