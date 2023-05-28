import { Color } from './color'
import { elements } from './elements'
import { camelToKabob } from './string-case'
import { XinStyleRule, XinStyleMap } from './xin-types'

export interface XinStyleSheet {
  [key: string]: XinStyleRule | XinStyleMap | string
}

export function StyleNode (styleSheet: XinStyleSheet): HTMLStyleElement {
  return elements.style(css(styleSheet))
}

const renderStatement = (key: string, value: string | number | XinStyleRule | undefined, indentation = ''): string => {
  const cssProp = camelToKabob(key)
  if (typeof value === 'object') {
    const renderedRule = Object.keys(value).map(innerKey => renderStatement(innerKey, value[innerKey], `${indentation}  `)).join('\n')
    return `${indentation}  ${key} {\n${renderedRule}\n${indentation}  }`
  } else if (typeof value === 'number' && value !== 0) {
    return `${indentation}  ${cssProp}: ${value}px;`
  }
  return value !== undefined ? `${indentation}  ${cssProp}: ${value};` : ''
}

export const css = (obj: XinStyleSheet | XinStyleMap, indentation = ''): string => {
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

export const initVars = (obj: XinStyleRule): XinStyleRule => {
  const rule: XinStyleRule = {}
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    const kabobKey = camelToKabob(key)
    rule[`--${kabobKey}`] = typeof value === 'number' && value !== 0 ? String(value) + 'px' : value
  }
  return rule
}

export const darkMode = (obj: XinStyleRule): XinStyleRule => {
  const rule: XinStyleRule = {}
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
