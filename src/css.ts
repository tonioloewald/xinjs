import { Color } from './color'
import { camelToKabob } from './elements'

export interface StyleRule {
  [key: string]: string | number
}

export interface StyleMap {
  [key: string]: StyleRule
}

export const css = (obj: StyleMap): string => {
  const selectors = Object.keys(obj).map((selector) => {
    const body = obj[selector]
    const rule = Object.keys(body)
      .map((prop) => {
        const value = body[prop]
        return `  ${camelToKabob(prop)}: ${typeof value === 'number' ? String(value) + 'px' : value};`
      })
      .join('\n')
    return `${selector} {\n${rule}\n}`
  })
  return selectors.join('\n\n')
}

export const initVars = (obj: StyleRule): StyleRule => {
  const rule: StyleRule = {}
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    rule[`--${camelToKabob(key)}`] = typeof value === 'number' ? String(value) + 'px' : value
  }
  return rule
}

export const vars = new Proxy<{ [key: string]: string }>({}, {
  get (target, prop: string) {
    if (target[prop] == null) {
      prop = prop.replace(/[A-Z]/g, x => `-${x.toLocaleLowerCase()}`)
      const [,varName,, isNegative, scaleText, method] = prop.match(/^([^\d_]*)((_)?(\d+)(\w*))?$/) as string[]
      if (scaleText != null) {
        const scale = isNegative == null ? Number(scaleText) / 100 : -Number(scaleText) / 100
        switch (method) {
          case 'b': // brightness
            {
              const baseColor = getComputedStyle(document.body).getPropertyValue(varName)
              target[prop] = Color.fromCss(baseColor).brighten(scale).rgba
            }
            break
          case 's': // saturation
            {
              const baseColor = getComputedStyle(document.body).getPropertyValue(varName)
              target[prop] = Color.fromCss(baseColor).saturate(scale).rgba
            }
            break
          case 'h': // hue
            {
              const baseColor = getComputedStyle(document.body).getPropertyValue(varName)
              target[prop] = Color.fromCss(baseColor).rotate(scale).rgba
            }
            break
          case 'o': // alpha
            {
              const baseColor = getComputedStyle(document.body).getPropertyValue(varName)
              target[prop] = Color.fromCss(baseColor).opacity(scale).rgba
            }
            break
          case '':
            target[prop] = `calc(var(--${varName}) * ${scale})`
            break
          default:
            console.error(method)
            throw new Error(`Unrecognized method ${method} for css variable ${varName}`)
        }
      } else {
        target[prop] = `var(--${varName})`
      }
    }
    return target[prop]
  }
})
