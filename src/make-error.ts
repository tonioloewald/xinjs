const stringify = (x: any) => {
  try {
    return JSON.stringify(x)
  } catch (_) {
    return '{has circular references}'
  }
}

export const makeError = (...messages: any[]) => new Error(messages.map(stringify).join(' '))
