export type XinObject = {
  [key: string] : any
}

type _BooleanFunction = () => boolean
type _PathTestFunction = (path: string) => boolean | Symbol
export type PathTestFunction = _BooleanFunction | _PathTestFunction