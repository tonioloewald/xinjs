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

export type XinEventHandler<T=Event> = ((evt: T) => void) | ((evt: T) => Promise<void> | string | Promise<string>)

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

export interface XinStyleRule {
  alignContent?: string | number
  alignItems?: string | number
  alignSelf?: string | number
  all?: string | number
  animation?: string | number
  animationDelay?: string | number
  animationDirection?: string | number
  animationDuration?: string | number
  animationFillMode?: string | number
  animationIterationCount?: string | number
  animationName?: string | number
  animationPlayState?: string | number
  animationTimingFunction?: string | number
  backfaceVisibility?: string | number
  background?: string | number
  backgroundAttachment?: string | number
  backgroundBlendMode?: string | number
  backgroundClip?: string | number
  backgroundColor?: string | number
  backgroundImage?: string | number
  backgroundOrigin?: string | number
  backgroundPosition?: string | number
  backgroundRepeat?: string | number
  backgroundSize?: string | number
  border?: string | number
  borderBottom?: string | number
  borderBottomColor?: string | number
  borderBottomLeftRadius?: string | number
  borderBottomRightRadius?: string | number
  borderBottomStyle?: string | number
  borderBottomWidth?: string | number
  borderCollapse?: string | number
  borderColor?: string | number
  borderImage?: string | number
  borderImageOutset?: string | number
  borderImageRepeat?: string | number
  borderImageSlice?: string | number
  borderImageSource?: string | number
  borderImageWidth?: string | number
  borderLeft?: string | number
  borderLeftColor?: string | number
  borderLeftStyle?: string | number
  borderLeftWidth?: string | number
  borderRadius?: string | number
  borderRight?: string | number
  borderRightColor?: string | number
  borderRightStyle?: string | number
  borderRightWidth?: string | number
  borderSpacing?: string | number
  borderStyle?: string | number
  borderTop?: string | number
  borderTopColor?: string | number
  borderTopLeftRadius?: string | number
  borderTopRightRadius?: string | number
  borderTopStyle?: string | number
  borderTopWidth?: string | number
  borderWidth?: string | number
  bottom?: string | number
  boxShadow?: string | number
  boxSizing?: string | number
  captionSide?: string | number
  caretColor?: string | number
  clear?: string | number
  clip?: string | number
  clipPath?: string | number
  color?: string | number
  columnCount?: string | number
  columnFill?: string | number
  columnGap?: string | number
  columnRule?: string | number
  columnRuleColor?: string | number
  columnRuleStyle?: string | number
  columnRuleWidth?: string | number
  columnSpan?: string | number
  columnWidth?: string | number
  columns?: string | number
  content?: string | number
  counterIncrement?: string | number
  counterReset?: string | number
  cursor?: string | number
  direction?: string | number
  display?: string | number
  emptyCells?: string | number
  filter?: string | number
  flex?: string | number
  flexBasis?: string | number
  flexDirection?: string | number
  flexFlow?: string | number
  flexGrow?: string | number
  flexShrink?: string | number
  flexWrap?: string | number
  float?: string | number
  font?: string | number
  fontFamily?: string | number
  fontKerning?: string | number
  fontSize?: string | number
  fontSizeAdjust?: string | number
  fontStretch?: string | number
  fontStyle?: string | number
  fontVariant?: string | number
  fontWeight?: string | number
  grid?: string | number
  gridArea?: string | number
  gridAutoColumns?: string | number
  gridAutoFlow?: string | number
  gridAutoRows?: string | number
  gridColumn?: string | number
  gridColumnEnd?: string | number
  gridColumnGap?: string | number
  gridColumnStart?: string | number
  gridGap?: string | number
  gridRow?: string | number
  gridRowEnd?: string | number
  gridRowGap?: string | number
  gridRowStart?: string | number
  gridTemplate?: string | number
  gridTemplateAreas?: string | number
  gridTemplateColumns?: string | number
  gridTemplateRows?: string | number
  height?: string | number
  hyphens?: string | number
  justifyContent?: string | number
  left?: string | number
  letterSpacing?: string | number
  lineHeight?: string | number
  listStyle?: string | number
  listStyleImage?: string | number
  listStylePosition?: string | number
  listStyleType?: string | number
  margin?: string | number
  marginBottom?: string | number
  marginLeft?: string | number
  marginRight?: string | number
  marginTop?: string | number
  maxHeight?: string | number
  maxWidth?: string | number
  minHeight?: string | number
  minWidth?: string | number
  objectFit?: string | number
  objectPosition?: string | number
  opacity?: string | number
  order?: string | number
  outline?: string | number
  outlineColor?: string | number
  outlineOffset?: string | number
  outlineStyle?: string | number
  outlineWidth?: string | number
  overflow?: string | number
  overflowX?: string | number
  overflowY?: string | number
  padding?: string | number
  paddingBottom?: string | number
  paddingLeft?: string | number
  paddingRight?: string | number
  paddingTop?: string | number
  pageBreakAfter?: string | number
  pageBreakBefore?: string | number
  pageBreakInside?: string | number
  perspective?: string | number
  perspectiveOrigin?: string | number
  pointerEvents?: string | number
  position?: string | number
  quotes?: string | number
  right?: string | number
  scrollBehavior?: string | number
  tableLayout?: string | number
  textAlign?: string | number
  textAlignLast?: string | number
  textDecoration?: string | number
  textDecorationColor?: string | number
  textDecorationLine?: string | number
  textDecorationStyle?: string | number
  textIndent?: string | number
  textJustify?: string | number
  textOverflow?: string | number
  textShadow?: string | number
  textTransform?: string | number
  top?: string | number
  transform?: string | number
  transformOrigin?: string | number
  transformStyle?: string | number
  transition?: string | number
  transitionDelay?: string | number
  transitionDuration?: string | number
  transitionProperty?: string | number
  transitionTimingFunction?: string | number
  userSelect?: string | number
  verticalAlign?: string | number
  visibility?: string | number
  whiteSpace?: string | number
  width?: string | number
  wordBreak?: string | number
  wordSpacing?: string | number
  wordWrap?: string | number
  writingMode?: string | number
  zIndex?: string | number
  [key: string]: string | number | undefined
}
export interface XinStyleMap {
  [key: string]: XinStyleRule
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
