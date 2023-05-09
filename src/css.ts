import { Color } from './color'
import { elements } from './elements'
import { camelToKabob } from './string-case'

export interface StyleRule {
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

export interface StyleMap {
  [key: string]: StyleRule
}

export interface StyleSheet {
  [key: string]: StyleRule | StyleMap | string
}

export function StyleNode (styleSheet: StyleSheet): HTMLStyleElement {
  return elements.style(css(styleSheet))
}

const dimensionalProps = ['left', 'right', 'top', 'bottom', 'gap']
const isDimensional = (cssProp: string): boolean => {
  return (cssProp.match(/(width|height|size|margin|padding|radius|spacing|top|left|right|bottom)/) != null) || dimensionalProps.includes(cssProp)
}

const renderStatement = (key: string, value: string | number | StyleRule | undefined, indentation = ''): string => {
  const cssProp = camelToKabob(key)
  if (typeof value === 'object') {
    const renderedRule = Object.keys(value).map(innerKey => renderStatement(innerKey, value[innerKey], `${indentation}  `)).join('\n')
    return `${indentation}  ${key} {\n${renderedRule}\n${indentation}  }`
  } else if (typeof value === 'number' && isDimensional(cssProp)) {
    return `${indentation}  ${cssProp}: ${value}px;`
  }
  return value !== undefined ? `${indentation}  ${cssProp}: ${value};` : ''
}

export const css = (obj: StyleSheet | StyleMap, indentation = ''): string => {
  const selectors = Object.keys(obj).map((selector) => {
    const body = obj[selector]
    if (typeof body === 'string') {
      if (selector === '@import') {
        return `@import url('${body}');`
      }
      throw new Error('top-level string value only allowed for `@import`')
    }
    const rule = Object.keys(body)
      .map(prop => renderStatement(prop, body[prop]))
      .join('\n')
    return `${indentation}${selector} {\n${rule}\n}`
  })
  return selectors.join('\n\n')
}

export const initVars = (obj: StyleRule): StyleRule => {
  const rule: StyleRule = {}
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    const kabobKey = camelToKabob(key)
    rule[`--${kabobKey}`] = typeof value === 'number' && isDimensional(kabobKey) ? String(value) + 'px' : value
  }
  return rule
}

export const darkMode = (obj: StyleRule): StyleRule => {
  const rule: StyleRule = {}
  for (const key of Object.keys(obj)) {
    let value = obj[key]
    if (typeof value === 'string' && value.match(/^(#|rgb[a]?\(|hsl[a]?\()/) != null) {
      value = Color.fromCss(value).inverseLuminance.html
      rule[`--${camelToKabob(key)}`] = value
    }
  }
  return rule
}

export const vars = new Proxy<{ [key: string]: string }>({}, {
  get (target, prop: string) {
    if (target[prop] == null) {
      prop = prop.replace(/[A-Z]/g, x => `-${x.toLocaleLowerCase()}`)
      let [,varName,, isNegative, scaleText, method] = prop.match(/^([^\d_]*)((_)?(\d+)(\w*))?$/) as string[]
      varName = `--${varName}`
      if (scaleText != null) {
        const scale = isNegative == null ? Number(scaleText) / 100 : -Number(scaleText) / 100
        switch (method) {
          case 'b': // brighten
            {
              const baseColor = getComputedStyle(document.body).getPropertyValue(varName)
              target[prop] = scale > 0 ? Color.fromCss(baseColor).brighten(scale).rgba : Color.fromCss(baseColor).darken(-scale).rgba
            }
            break
          case 's': // saturate
            {
              const baseColor = getComputedStyle(document.body).getPropertyValue(varName)
              target[prop] = scale > 0 ? Color.fromCss(baseColor).saturate(scale).rgba : Color.fromCss(baseColor).desaturate(-scale).rgba
            }
            break
          case 'h': // hue
            {
              const baseColor = getComputedStyle(document.body).getPropertyValue(varName)
              target[prop] = Color.fromCss(baseColor).rotate(scale * 100).rgba
              console.log(Color.fromCss(baseColor).hsla, Color.fromCss(baseColor).rotate(scale).hsla)
            }
            break
          case 'o': // alpha
            {
              const baseColor = getComputedStyle(document.body).getPropertyValue(varName)
              target[prop] = Color.fromCss(baseColor).opacity(scale).rgba
            }
            break
          case '':
            target[prop] = `calc(var(${varName}) * ${scale})`
            break
          default:
            console.error(method)
            throw new Error(`Unrecognized method ${method} for css variable ${varName}`)
        }
      } else {
        target[prop] = `var(${varName})`
      }
    }
    return target[prop]
  }
})
