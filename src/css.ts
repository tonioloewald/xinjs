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
      const [,varName, isNegative, scaleText] = prop.match(/^([^\d_]*)(_)?(\d+)?$/) as string[]
      if (scaleText != null) {
        const scale = isNegative == null ? Number(scaleText) / 100 : -Number(scaleText) / 100
        target[prop] = `calc(var(--${varName}) * ${scale})`
      } else {
        target[prop] = `var(--${varName})`
      }
    }
    return target[prop]
  }
})
