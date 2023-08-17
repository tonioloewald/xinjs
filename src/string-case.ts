export function camelToKabob(s: string): string {
  return s.replace(/[A-Z]/g, (c: string): string => {
    return `-${c.toLocaleLowerCase()}`
  })
}

export function kabobToCamel(s: string): string {
  return s.replace(/-([a-z])/g, (_: string, c: string): string => {
    return c.toLocaleUpperCase()
  })
}
