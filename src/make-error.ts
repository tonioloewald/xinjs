const stringify = (x: any): string => {
  try {
    return JSON.stringify(x)
  } catch (_) {
    return '{has circular references}'
  }
}

export const makeError = (...messages: any[]): Error => new Error(messages.map(stringify).join(' '))
