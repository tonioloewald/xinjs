/* eslint new-cap: 0 */

const hex2 = (n: number): string => ('00' + Math.round(Number(n)).toString(16)).slice(-2)

function clamp (min: number, v: number, max: number): number {
  return v < min ? min : (v > max ? max : v)
}

function lerp (a: number, b: number, t: number): number {
  t = clamp(0, t, 1)
  return t * (b - a) + a
}

const span = globalThis.document != null ? globalThis.document.createElement('span') : { style: { color: '' } }

export class Color {
  r: number
  g: number
  b: number
  a: number

  static fromCss (spec: string): Color {
    span.style.color = spec
    const converted = span.style.color
    const [r, g, b, a] = converted.match(/[\d.]+/g) as string[]
    return new Color(Number(r), Number(g), Number(b), a == null ? 1 : Number(a))
  }

  constructor (r: number, g: number, b: number, a = 1) {
    this.r = clamp(0, r, 255)
    this.g = clamp(0, g, 255)
    this.b = clamp(0, b, 255)
    this.a = a !== undefined ? clamp(0, a, 1) : a = 1
  }

  invert (): Color {
    return new Color(255 - this.r, 255 - this.g, 255 - this.b, this.a)
  }

  rgb (): string {
    const { r, g, b } = this
    return `rgb(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)})`
  }

  rgba (): string {
    const { r, g, b, a } = this
    return `rgba(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)},${a.toFixed(2)})`
  }

  _hsl (): number[] {
    const r = this.r / 255
    const g = this.g / 255
    const b = this.b / 255
    const l = Math.max(r, g, b)
    const s = l - Math.min(r, g, b)
    const h = s !== 0
      ? l === r
        ? (g - b) / s
        : l === g
          ? 2 + (b - r) / s
          : 4 + (r - g) / s
      : 0
    return [
      60 * h < 0 ? 60 * h + 360 : 60 * h,
      100 * (s !== 0 ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
      (100 * (2 * l - s)) / 2
    ]
  }

  hsl (): string {
    const [h, s, l] = this._hsl()
    return `hsl(${h}, ${s}, ${l})`
  }

  hsla (): string {
    const [h, s, l] = this._hsl()
    return `hsla(${h}, ${s}, ${l}, ${this.a})`
  }

  mono (): Color {
    const v = this.brightness() * 255
    return new Color(v, v, v)
  }

  brightness (): number {
    // http://www.itu.int/rec/R-REC-BT.601
    return (0.299 * this.r + 0.587 * this.g + 0.114 * this.b) / 255
  }

  html (): string {
    return this.a === 1 ? '#' + hex2(this.r) + hex2(this.g) + hex2(this.b) : '#' + hex2(this.r) + hex2(this.g) + hex2(this.b) + hex2(Math.floor(255 * this.a))
  }

  blend (otherColor: Color, t: number): Color {
    return new Color(
      lerp(this.r, otherColor.r, t),
      lerp(this.g, otherColor.g, t),
      lerp(this.b, otherColor.b, t),
      lerp(this.a, otherColor.a, t)
    )
  }
}
