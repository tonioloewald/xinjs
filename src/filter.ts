import { matchType } from './type-by-example'
import { XinObject } from './xin-types'

export const filterArray = (template: any[], obj: any[]): any[] | undefined => {
  if (!Array.isArray(obj)) {
    return undefined
  }
  if (template.length === 0) {
    return [...obj]
  }
  const output = []
  for (const item of obj) {
    const itemTemplate = (template).find(possible => matchType(possible, item).length === 0)
    if (itemTemplate !== undefined) {
      output.push(filter(itemTemplate, item))
    }
  }
  return output
}

export const filterObject = (template: XinObject, obj: XinObject): XinObject | undefined => {
  if (matchType(template, obj).length > 0) {
    return undefined
  }
  const output: XinObject = {}
  for (const key of Object.keys(template)) {
    const value = filter(template[key], obj[key])
    if (value !== undefined) {
      output[key] = value
    }
  }
  return output
}

export const filter = (template: any, obj: any): any => {
  if (obj === undefined || obj === null) {
    return undefined
  } else if (typeof obj !== 'object' && (matchType(template, obj).length > 0)) {
    return undefined
  } else if (Array.isArray(template)) {
    return filterArray(template, obj)
  } else if (typeof obj === 'object') {
    return filterObject(template, obj)
  } else {
    return (matchType(template, obj).length > 0) ? undefined : obj
  }
}
