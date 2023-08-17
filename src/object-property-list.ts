interface KeyProp {
  key: string
  value: any
}

export function makePropList(obj: { [key: string]: any }): KeyProp[] {
  return Object.keys(obj).map((key) => ({
    key,
    get value() {
      return obj[key]
    },
    set value(newValue) {
      obj[key] = newValue
    },
  }))
}
