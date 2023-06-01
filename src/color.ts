import { lerp, clamp } from './more-math'

const hex2 = (n: number): string => ('00' + Math.round(Number(n)).toString(16)).slice(-2)

class HslColor {
  h: number
  s: number
  l: number

  constructor (r: number, g: number, b: number) {
    r /= 255
    g /= 255
    b /= 255
    const l = Math.max(r, g, b)
    const s = l - Math.min(r, g, b)
    const h = s !== 0
      ? l === r
        ? (g - b) / s
        : l === g
          ? 2 + (b - r) / s
          : 4 + (r - g) / s
      : 0

    this.h = 60 * h < 0 ? 60 * h + 360 : 60 * h
    this.s = s !== 0 ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0
    this.l = (2 * l - s) / 2
  }
}

const span = globalThis.document !== undefined ? globalThis.document.createElement('span') : undefined
export class Color {
  r: number
  g: number
  b: number
  a: number

  static fromCss (spec: string): Color {
    let converted = spec
    if (span instanceof HTMLSpanElement) {
      span.style.color = spec
      document.body.appendChild(span)
      converted = getComputedStyle(span).color
      span.remove()
    }
    const [r, g, b, a] = converted.match(/[\d.]+/g) as string[]
    return new Color(Number(r), Number(g), Number(b), a == null ? 1 : Number(a))
  }

  static fromHsl (h: number, s: number, l: number, a = 1): Color {
    return Color.fromCss(`hsla(${h.toFixed(0)}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%, ${a.toFixed(2)})`)
  }

  constructor (r: number, g: number, b: number, a = 1) {
    this.r = clamp(0, r, 255)
    this.g = clamp(0, g, 255)
    this.b = clamp(0, b, 255)
    this.a = a !== undefined ? clamp(0, a, 1) : a = 1
  }

  get inverse (): Color {
    return new Color(255 - this.r, 255 - this.g, 255 - this.b, this.a)
  }

  get inverseLuminance (): Color {
    const { h, s, l } = this._hsl
    return Color.fromHsl(h, s, 1 - l, this.a)
  }

  get rgb (): string {
    const { r, g, b } = this
    return `rgb(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)})`
  }

  get rgba (): string {
    const { r, g, b, a } = this
    return `rgba(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)},${a.toFixed(2)})`
  }

  get RGBA (): number[] {
    return [this.r / 255, this.g / 255, this.b / 255, this.a]
  }

  get ARGB (): number[] {
    return [this.a, this.r / 255, this.g / 255, this.b / 255]
  }

  _hslCached?: HslColor

  get _hsl (): HslColor {
    if (this._hslCached == null) {
      this._hslCached = new HslColor(this.r, this.g, this.b)
    }
    return this._hslCached
  }

  get hsl (): string {
    const { h, s, l } = this._hsl
    return `hsl(${h.toFixed(0)}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%)`
  }

  get hsla (): string {
    const { h, s, l } = this._hsl
    return `hsla(${h.toFixed(0)}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%, ${this.a.toFixed(2)})`
  }

  get mono (): Color {
    const v = this.brightness * 255
    return new Color(v, v, v)
  }

  get brightness (): number {
    // http://www.itu.int/rec/R-REC-BT.601
    return (0.299 * this.r + 0.587 * this.g + 0.114 * this.b) / 255
  }

  get html (): string {
    return this.a === 1 ? '#' + hex2(this.r) + hex2(this.g) + hex2(this.b) : '#' + hex2(this.r) + hex2(this.g) + hex2(this.b) + hex2(Math.floor(255 * this.a))
  }

  brighten (amount: number): Color {
    let { h, s, l } = this._hsl
    l = clamp(0, l + amount * (1 - l), 1)
    return Color.fromHsl(h, s, l, this.a)
  }

  darken (amount: number): Color {
    let { h, s, l } = this._hsl
    l = clamp(0, l * (1 - amount), 1)
    return Color.fromHsl(h, s, l, this.a)
  }

  saturate (amount: number): Color {
    let { h, s, l } = this._hsl
    s = clamp(0, s + amount * (1 - s), 1)
    return Color.fromHsl(h, s, l, this.a)
  }

  desaturate (amount: number): Color {
    let { h, s, l } = this._hsl
    s = clamp(0, s * (1 - amount), 1)
    return Color.fromHsl(h, s, l, this.a)
  }

  rotate (amount: number): Color {
    let { h, s, l } = this._hsl
    h = (h + 360 + amount) % 360
    return Color.fromHsl(h, s, l, this.a)
  }

  opacity (alpha: number): Color {
    const { h, s, l } = this._hsl
    return Color.fromHsl(h, s, l, alpha)
  }

  swatch (): void {
    const { r, g, b, a } = this
    console.log(`%c   %c ${this.html}, rgba(${r}, ${g}, ${b}, ${a}), ${this.hsla}`, `background-color: rgba(${r}, ${g}, ${b}, ${a})`, 'background-color: #eee')
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
