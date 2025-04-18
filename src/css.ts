import { Color } from './color'
import { elements } from './elements'
import { camelToKabob } from './string-case'
import { XinStyleSheet, XinStyleRule } from './css-types'

export function StyleSheet(id: string, styleSpec: XinStyleSheet) {
  const element = elements.style(css(styleSpec))
  element.id = id
  document.head.append(element)
}

const numericProps = [
  'animation-iteration-count',
  'flex',
  'flex-base',
  'flex-grow',
  'flex-shrink',
  'opacity',
  'order',
  'tab-size',
  'widows',
  'z-index',
  'zoom',
]

export const processProp = (
  prop: string,
  value: string | number
): { prop: string; value: string } => {
  if (typeof value === 'number' && !numericProps.includes(prop)) {
    value = `${value}px`
  }
  if (prop.startsWith('_')) {
    if (prop.startsWith('__')) {
      prop = '--' + prop.substring(2)
      value = `var(${prop}-default, ${value})`
    } else {
      prop = '--' + prop.substring(1)
    }
  }
  return {
    prop,
    value: String(value),
  }
}

const renderProp = (
  indentation: string,
  cssProp: string,
  value: string | number | Color | undefined
): string => {
  if (value === undefined) {
    return ''
  }
  if (value instanceof Color) {
    value = value.html
  }
  const processed = processProp(cssProp, value)
  return `${indentation}  ${processed.prop}: ${processed.value};`
}

const renderStatement = (
  key: string,
  value: Color | string | number | XinStyleRule | undefined,
  indentation = ''
): string => {
  const cssProp = camelToKabob(key)
  if (typeof value === 'object' && !(value instanceof Color)) {
    const renderedRule = Object.keys(value)
      .map((innerKey) =>
        renderStatement(innerKey, value[innerKey], `${indentation}  `)
      )
      .join('\n')
    return `${indentation}  ${key} {\n${renderedRule}\n${indentation}  }`
  } else {
    return renderProp(indentation, cssProp, value)
  }
}

export const css = (obj: XinStyleSheet, indentation = ''): string => {
  const selectors = Object.keys(obj).map((selector) => {
    const body = obj[selector]
    if (typeof body === 'string') {
      if (selector === '@import') {
        return `@import url('${body}');`
      }
      throw new Error('top-level string value only allowed for `@import`')
    }
    const rule = Object.keys(body)
      .map((prop) => renderStatement(prop, body[prop]))
      .join('\n')
    return `${indentation}${selector} {\n${rule}\n}`
  })
  return selectors.join('\n\n')
}

export const initVars = (obj: {
  [key: string]: string | number
}): XinStyleRule => {
  console.warn('initVars is deprecated. Just use _ and __ prefixes instead.')
  const rule: XinStyleRule = {}
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    const kabobKey = camelToKabob(key)
    rule[`--${kabobKey}`] =
      typeof value === 'number' && value !== 0 ? String(value) + 'px' : value
  }
  return rule
}

export const darkMode = (obj: XinStyleRule): XinStyleRule => {
  console.warn('darkMode is deprecated. Use inverseLuminance instead.')
  const rule: XinStyleRule = {}
  for (const key of Object.keys(obj)) {
    let value = obj[key]
    if (
      typeof value === 'string' &&
      value.match(/^(#|rgb[a]?\(|hsl[a]?\()/) != null
    ) {
      value = Color.fromCss(value).inverseLuminance.html
      rule[`--${camelToKabob(key)}`] = value
    }
  }
  return rule
}

export const invertLuminance = (map: XinStyleRule): XinStyleRule => {
  const inverted: XinStyleRule = {}

  for (const key of Object.keys(map)) {
    const value = map[key]
    if (value instanceof Color) {
      inverted[key] = value.inverseLuminance
    } else if (
      typeof value === 'string' &&
      value.match(/^(#[0-9a-fA-F]{3}|rgba?\(|hsla?\()/)
    ) {
      inverted[key] = Color.fromCss(value).inverseLuminance
    }
  }

  return inverted
}

export const varDefault = new Proxy<{ [key: string]: CssVarBuilder }>(
  {},
  {
    get(target, prop: string) {
      if (target[prop] === undefined) {
        const varName = `--${prop.replace(
          /[A-Z]/g,
          (x) => `-${x.toLocaleLowerCase()}`
        )}`
        target[prop] = (val: string | number) => `var(${varName}, ${val})`
      }
      return target[prop]
    },
  }
)

export const vars = new Proxy<{ [key: string]: string }>(
  {},
  {
    get(target, prop: string) {
      if (prop === 'default') {
        return varDefault
      }
      if (target[prop] == null) {
        prop = prop.replace(/[A-Z]/g, (x) => `-${x.toLocaleLowerCase()}`)
        const [, _varName, , isNegative, scaleText, method] = prop.match(
          /^([^\d_]*)((_)?(\d+)(\w*))?$/
        ) as string[]
        const varName = `--${_varName}`
        if (scaleText != null) {
          const scale =
            isNegative == null
              ? Number(scaleText) / 100
              : -Number(scaleText) / 100
          switch (method) {
            case 'b': // brighten
              {
                const baseColor = getComputedStyle(
                  document.body
                ).getPropertyValue(varName)
                target[prop] =
                  scale > 0
                    ? Color.fromCss(baseColor).brighten(scale).rgba
                    : Color.fromCss(baseColor).darken(-scale).rgba
              }
              break
            case 's': // saturate
              {
                const baseColor = getComputedStyle(
                  document.body
                ).getPropertyValue(varName)
                target[prop] =
                  scale > 0
                    ? Color.fromCss(baseColor).saturate(scale).rgba
                    : Color.fromCss(baseColor).desaturate(-scale).rgba
              }
              break
            case 'h': // hue
              {
                const baseColor = getComputedStyle(
                  document.body
                ).getPropertyValue(varName)
                target[prop] = Color.fromCss(baseColor).rotate(scale * 100).rgba
                console.log(
                  Color.fromCss(baseColor).hsla,
                  Color.fromCss(baseColor).rotate(scale).hsla
                )
              }
              break
            case 'o': // alpha
              {
                const baseColor = getComputedStyle(
                  document.body
                ).getPropertyValue(varName)
                target[prop] = Color.fromCss(baseColor).opacity(scale).rgba
              }
              break
            case '':
              target[prop] = `calc(var(${varName}) * ${scale})`
              break
            default:
              console.error(method)
              throw new Error(
                `Unrecognized method ${method} for css variable ${varName}`
              )
          }
        } else {
          target[prop] = `var(${varName})`
        }
      }
      return target[prop]
    },
  }
)

type CssVarBuilder = (val: string | number) => string
