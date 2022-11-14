export interface StyleRule {
  [key: string]: string | number
}

export interface StyleMap {
  [key: string]: StyleRule
}

const hyphenated = (s: string): string => s.replace(/[A-Z]/g, c => '-' + c.toLowerCase())

export const css = (obj: StyleMap): string => {
  const selectors = Object.keys(obj).map((selector) => {
    const body = obj[selector]
    const rule = Object.keys(body)
      .map((prop) => `  ${hyphenated(prop)}: ${body[prop]};`)
      .join('\n')
    return `${selector} {\n${rule}\n}`
  })
  return selectors.join('\n\n')
}
