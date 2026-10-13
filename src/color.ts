/*{"parent": "css", "description": "The Color class: parse CSS colors, do color math (brighten, saturate, blend, mix), convert between HSL and RGB, generate contrasting colors."}*/
/*#
# Color

`tosijs` includes a lightweight, powerful `Color` class for manipulating colors.
I hope at some point CSS will provide sufficiently capable native color calculations
so that this will no longer be needed. Some of these methods have begun to appear,
and are approaching wide implementation.

## Color

The most straightforward methods for creating a `Color` instance are to use the
`Color()` constructor to create an `rgb` or `rgba` representation, or using the
`Color.fromCss()` to create a `Color` from any CSS (s)rgb representation,
e.g.

```
new Color(255, 255, 0)               // yellow
new Color(0, 128, 0, 0.5)            // translucent dark green
Color.fromCss('#000')                // black
Color.fromCss('hsl(90deg 100% 50%))  // orange
Color.fromCss('color(srgb 1 0 0.5))  // purple
```

Note that `Color.fromCss()` is not compatible with non-srgb color spaces. The new CSS
color functions produce color specifications of the form `color(<space> ....)` and
`Color.fromCSS()` will handle `color(srgb ...)` correctly (this is so it can parse the
output of `color-mix(in hsl ...)` but not other [color spaces](https://developer.mozilla.org/en-US/blog/css-color-module-level-4/#whats_new_in_css_colors_module_level_4).

## Manipulating Colors

```js
import { elements, Color } from 'tosijs'

const { label, span, div, input, button } = elements

const swatches = div({ class: 'swatches' })
function makeSwatch(text) {
  const color = Color.fromCss(colorInput.value)
  const adjustedColor = eval('color.' + text)
  swatches.style.setProperty('--original', color)
  swatches.append(
    div(
      text,
      {
        class: 'swatch',
        title: `${adjustedColor.html} ${adjustedColor.hsla}`,
        style: {
          _adjusted: adjustedColor,
          _text: adjustedColor.contrasting()
        }
      }
    )
  )
}

const colorInput = input({
  type: 'color',
  value: '#000',
  onInput: update
})
const red = Color.fromCss('#f00')
const gray = Color.fromCss('#888')
const teal = Color.fromCss('teal')
const aliceblue = Color.fromCss('aliceblue')

function update() {
  swatches.textContent = ''
  makeSwatch('brighten(-0.5)')
  makeSwatch('brighten(0.5)')
  makeSwatch('saturate(0.25)')
  makeSwatch('saturate(0.5)')
  makeSwatch('desaturate(0.5)')
  makeSwatch('desaturate(0.75)')
  makeSwatch('contrasting()')
  makeSwatch('contrasting(0.05)')
  makeSwatch('contrasting(0.25)')
  makeSwatch('contrasting(0.45)')
  makeSwatch('inverseLuminance')
  makeSwatch('mono')
  makeSwatch('rotate(-330)')
  makeSwatch('rotate(60)')
  makeSwatch('rotate(-270)')
  makeSwatch('rotate(120)')
  makeSwatch('rotate(-210)')
  makeSwatch('rotate(180)')
  makeSwatch('rotate(-150)')
  makeSwatch('rotate(240)')
  makeSwatch('rotate(-90)')
  makeSwatch('rotate(300)')
  makeSwatch('rotate(-30)')
  makeSwatch('opacity(0.1)')
  makeSwatch('opacity(0.5)')
  makeSwatch('opacity(0.75)')
  makeSwatch('rotate(-90).opacity(0.75)')
  makeSwatch('brighten(0.5).desaturate(0.5)')
  makeSwatch('blend(Color.black, 0.5)')
  makeSwatch('mix(Color.white, 0.4)')
  makeSwatch('blend(gray, 0.4)')
  makeSwatch('mix(red, 0.25)')
  makeSwatch('mix(red, 0.5)')
  makeSwatch('mix(red, 0.75)')
  makeSwatch('mix(teal, 0.25)')
  makeSwatch('mix(teal, 0.5)')
  makeSwatch('mix(teal, 0.75)')
  makeSwatch('colorMix(aliceblue, 0.25)')
  makeSwatch('colorMix(aliceblue, 0.5)')
  makeSwatch('colorMix(aliceblue, 0.75)')
}

function randomColor() {
  colorInput.value = Color.fromHsl(Math.random() * 360, Math.random(), Math.random() * 0.5 + 0.25)
  update()
}

randomColor()

preview.append(
  label(
    span('base color'),
    colorInput
  ),
  button(
    'Random(ish) Color',
    {
      onClick: randomColor
    }
  ),
  swatches
)
```
```css
.preview .swatches {
  display: flex;
  gap: 4px;
  padding: 4px;
  flex-wrap: wrap;
  font-size: 80%;
}
.preview .swatch {
  display: inline-block;
  padding: 2px 6px;
  color: var(--text);
  background: var(--adjusted);
  border: 2px solid var(--original);
}
```

Each of these methods creates a new color instance based on the existing color(s).

In each case `amount` is from 0 to 1, and `degrees` is an angle in degrees.

- `brighten(amount: number)`
- `darken(amount: number)`
- `saturate(amount: number)`
- `desaturate(amount: number)`
- `rotate(angle: number)`
- `opacity(amount: number)` — this just creates a color with that opacity (it doesn't adjust it)
- `mix(otherColor: Color, amount)` — produces a mix of the two colors in HSL-space
- `colorMix(otherColor: Color, amount)` — uses `color-mix(in hsl...)` to blend the colors
- `blend(otherColor: Color, amount)` — produces a blend of the two colors in RGB-space (usually icky)
- `contrasting(amount = 1)` — produces a **contrasting color** by blending the color with black (if its
  `brightness` is > 0.5) or white by `amount`. The new color will always have opacity 1.
  `contrasting()` produce nearly identical results to `contrast-color()`.

> **Note** the captions in the example above are colored using `contrasting()` and thus
> should always be readable. In general, a base color will produce the worst results when
> its `brightness` is around 0.5, much as is the case with the new and experimental CSS
> [contrast-color()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/contrast-color)
> function.
>
> **Also note** that highly translucent colors might produce disappointing `.contrasting()`
> results since it's the blended color you need to worry about.

Where-ever possible, unless otherwise indicated, all of these operations are performed in HSL-space.
HSL space is not great! For example, `desaturate` essentially blends you with medium gray (`#888`)
rather than a BT.601 `brightness` value where "yellow" is really bright and "blue" is really dark.

If you want to desaturate colors more nicely, you can try blending them with their own `mono`.

## Static Methods

These are alternatives to the standard `Color(r, g, b, a = 1)` constructor.

`Color.fromVar(cssVariableName: string, element = document.body): Color` evaluates
the color at the specified element and then returns a `Color` instance with that
value. It will accept both bare variable names (`--foo-bar`) and wrapped (`var(--foo-bar)`).

`Color.fromCss(cssColor: string): Color` produces a `Color` instance from any
css color definition the browser can handle.

`Color.fromHsl(h: number, s: number, l: number, a = 1)` produces a `Color`
instance from HSL/HSLA values. The HSL values are cached internally and
used for internal calculations to reduce precision problems that occur
when converting HSL to RGB and back. It's nowhere near as sophisticated as
the models used by (say) Adobe or Apple, but it's less bad than doing all
computations in rgb.

## Static Properties

- `black`, `white` — handy constants

## Properties

- `r`, `g`, `b` are numbers from 0 to 255.
- `a` is a number from 0 to 1

## Properties (read-only)

- `html` — the color in HTML `#rrggbb[aa]` format
- `inverse` — the photonegative of the color (light is dark, orange is blue)
- `opaque` - the color, but guaranteed opaque
- `inverseLuminance` — inverts luminance but keeps hue, great for "dark mode"
- `rgb` and `rgba` — the color in `rgb(...)` and `rgba(...)` formats.
- `hsl` and `hsla` — the color in `hsl(...)` and `hsla(...)` formats.
- `RGBA` and `ARGB` — return the values as arrays of numbers from 0 to 1 for use with
  [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) (for example).
- `brightness` — this is the brightness of the color based on [BT.601](https://www.itu.int/rec/R-REC-BT.601)
- `mono` — this produces a `Color` instance that a greyscale version (based on `brightness`)

## Utilities

- `swatch()` emits the color into the console with a swatch and returns the color for chaining.
- `toString()` emits the `html` property
*/

import { lerp, clamp } from './more-math'
import { getCssVar } from './get-css-var'
import { CSSSystemColor } from './css-system-color'
import { cssColors } from './css-colors'

// http://www.itu.int/rec/R-REC-BT.601
const bt601 = (r: number, g: number, b: number): number => {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

const hex2 = (n: number): string =>
  ('00' + Math.round(Number(n)).toString(16)).slice(-2)

class HslColor {
  h: number
  s: number
  l: number

  constructor(r: number, g: number, b: number) {
    r /= 255
    g /= 255
    b /= 255
    const l = Math.max(r, g, b)
    const s = l - Math.min(r, g, b)
    const h =
      s !== 0
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

const span =
  globalThis.document !== undefined
    ? globalThis.document.createElement('span')
    : undefined
if (span) span.style.display = 'none'
export class Color {
  r: number
  g: number
  b: number
  a: number

  static fromVar(varName: string, element = document.body): Color {
    return Color.fromCss(getCssVar(varName, element))
  }

  static fromCss(spec: CSSSystemColor | string): Color {
    // Named CSS colors resolve from the table, so they work with no DOM at all
    // (SSR, workers, tests). Without this they fell through to the
    // getComputedStyle path and, with no `span`, parsed as transparent black.
    const named = cssColors[String(spec).trim().toLowerCase()]
    if (named !== undefined) {
      spec = named
    }
    // Parse hex colors directly to avoid DOM roundtrip
    const hex = spec.match(/^#([0-9a-fA-F]+)$/)
    if (hex) {
      const h = hex[1]
      const p = (i: number, len: number) => parseInt(h.slice(i, i + len), 16)
      if (h.length === 3 || h.length === 4) {
        const x = (i: number) => p(i, 1) * 0x11
        return new Color(x(0), x(1), x(2), h.length === 4 ? x(3) / 255 : 1)
      }
      if (h.length === 6 || h.length === 8) {
        return new Color(
          p(0, 2),
          p(2, 2),
          p(4, 2),
          h.length === 8 ? p(6, 2) / 255 : 1
        )
      }
    }

    // Fall back to getComputedStyle for named colors, rgb(), hsl(), etc.
    let converted = spec
    if (span instanceof HTMLSpanElement) {
      span.style.color = 'black'
      span.style.color = spec
      document.body.appendChild(span)
      converted = getComputedStyle(span).color
      span.remove()
    }
    const [r, g, b, a] = (converted.match(/[\d.]+/g) as string[]) || [
      '0',
      '0',
      '0',
      '0',
    ]
    const scale = converted.startsWith('color(srgb') ? 255 : 1
    return new Color(
      Number(r) * scale,
      Number(g) * scale,
      Number(b) * scale,
      a == null ? 1 : Number(a)
    )
  }

  static fromHsl(h: number, s: number, l: number, a = 1): Color {
    let r: number, g: number, b: number

    if (s === 0) {
      r = g = b = l // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      const hNormalized = (((h % 360) + 360) % 360) / 360
      r = hue2rgb(p, q, hNormalized + 1 / 3)
      g = hue2rgb(p, q, hNormalized)
      b = hue2rgb(p, q, hNormalized - 1 / 3)
    }

    const color = new Color(r * 255, g * 255, b * 255, a)
    // Cache the HSL value to avoid re-calculating it later
    color.hslCached = { h: ((h % 360) + 360) % 360, s, l }
    return color
  }

  static black = new Color(0, 0, 0)
  static white = new Color(255, 255, 255)

  constructor(r: number, g: number, b: number, a = 1) {
    this.r = clamp(0, r, 255)
    this.g = clamp(0, g, 255)
    this.b = clamp(0, b, 255)
    this.a = clamp(0, a, 1)
  }

  get inverse(): Color {
    return new Color(255 - this.r, 255 - this.g, 255 - this.b, this.a)
  }

  get inverseLuminance(): Color {
    const { h, s, l } = this._hsl
    return Color.fromHsl(h, s, 1 - l, this.a)
  }

  get opaque(): Color {
    return this.a === 1 ? this : new Color(this.r, this.g, this.b, 1)
  }

  contrasting(amount = 1): Color {
    return this.opaque.blend(
      this.brightness > 0.5 ? Color.black : Color.white,
      amount
    )
  }

  get rgb(): string {
    const { r, g, b } = this
    return `rgb(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)})`
  }

  get rgba(): string {
    const { r, g, b, a } = this
    return `rgba(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)},${a.toFixed(
      2
    )})`
  }

  get RGBA(): number[] {
    return [this.r / 255, this.g / 255, this.b / 255, this.a]
  }

  get ARGB(): number[] {
    return [this.a, this.r / 255, this.g / 255, this.b / 255]
  }

  private hslCached?: HslColor

  get _hsl(): HslColor {
    if (this.hslCached == null) {
      this.hslCached = new HslColor(this.r, this.g, this.b)
    }
    return this.hslCached
  }

  get hsl(): string {
    const { h, s, l } = this._hsl
    return `hsl(${h.toFixed(0)}deg ${(s * 100).toFixed(0)}% ${(l * 100).toFixed(
      0
    )}%)`
  }

  get hsla(): string {
    const { h, s, l } = this._hsl
    return `hsl(${h.toFixed(0)}deg ${(s * 100).toFixed(0)}% ${(l * 100).toFixed(
      0
    )}% / ${(this.a * 100).toFixed(0)}%)`
  }

  get mono(): Color {
    const v = this.brightness * 255
    return new Color(v, v, v)
  }

  get brightness(): number {
    return bt601(this.r, this.g, this.b)
  }

  get html(): string {
    return this.toString()
  }

  toString(): string {
    return this.a === 1
      ? '#' + hex2(this.r) + hex2(this.g) + hex2(this.b)
      : '#' +
          hex2(this.r) +
          hex2(this.g) +
          hex2(this.b) +
          // round (hex2 already rounds) to match the r/g/b channels — floor
          // biased alpha down (0.5 -> 7f instead of 80)
          hex2(255 * this.a)
  }

  brighten(amount: number): Color {
    const { h, s, l } = this._hsl
    const lClamped = clamp(0, l + amount * (1 - l), 1)
    return Color.fromHsl(h, s, lClamped, this.a)
  }

  darken(amount: number): Color {
    const { h, s, l } = this._hsl
    const lClamped = clamp(0, l * (1 - amount), 1)
    return Color.fromHsl(h, s, lClamped, this.a)
  }

  saturate(amount: number): Color {
    const { h, s, l } = this._hsl
    const sClamped = clamp(0, s + amount * (1 - s), 1)
    return Color.fromHsl(h, sClamped, l, this.a)
  }

  desaturate(amount: number): Color {
    const { h, s, l } = this._hsl
    const sClamped = clamp(0, s * (1 - amount), 1)
    return Color.fromHsl(h, sClamped, l, this.a)
  }

  rotate(amount: number): Color {
    const { h, s, l } = this._hsl
    const hClamped = (h + 360 + amount) % 360
    return Color.fromHsl(hClamped, s, l, this.a)
  }

  opacity(alpha: number): Color {
    const { h, s, l } = this._hsl
    return Color.fromHsl(h, s, l, alpha)
  }

  swatch(): Color {
    console.log(
      `%c      %c ${this.html}, ${this.rgba}`,
      `background-color: ${this.html}`,
      'background-color: transparent'
    )
    return this
  }

  blend(otherColor: Color, t: number): Color {
    return new Color(
      lerp(this.r, otherColor.r, t),
      lerp(this.g, otherColor.g, t),
      lerp(this.b, otherColor.b, t),
      lerp(this.a, otherColor.a, t)
    )
  }

  static blendHue(a: number, b: number, t: number): number {
    const delta = (b - a + 720) % 360
    if (delta < 180) {
      return a + t * delta
    } else {
      return a - (360 - delta) * t
    }
  }

  mix(otherColor: Color, t: number): Color {
    const a = this._hsl
    const b = otherColor._hsl
    return Color.fromHsl(
      a.s === 0 ? b.h : b.s === 0 ? a.h : Color.blendHue(a.h, b.h, t),
      lerp(a.s, b.s, t),
      lerp(a.l, b.l, t),
      lerp(this.a, otherColor.a, t)
    )
  }

  colorMix(otherColor: Color, t: number): Color {
    return Color.fromCss(
      `color-mix(in hsl, ${this.html}, ${otherColor.html} ${(t * 100).toFixed(
        0
      )}%)`
    )
  }

  // Computed color variable management
  private static computedColorStylesheet: HTMLStyleElement | null = null
  private static computedColors: Map<
    string,
    { varName: string; scale: number; method: string }
  > = new Map()
  private static recomputeQueued = false

  /**
   * Register a computed color variable. Called by vars proxy when a computed
   * color like `vars.primaryColor50b` is accessed.
   */
  static registerComputedColor(
    outputVar: string,
    sourceVar: string,
    scale: number,
    method: string
  ): void {
    if (!Color.computedColors.has(outputVar)) {
      Color.computedColors.set(outputVar, {
        varName: sourceVar,
        scale,
        method,
      })
      Color.queueRecompute()
    }
  }

  /**
   * Queue a recomputation of all computed color variables.
   * Called when observant stylesheets change.
   */
  static queueRecompute(): void {
    if (Color.recomputeQueued) return
    Color.recomputeQueued = true
    queueMicrotask(() => {
      Color.recomputeQueued = false
      Color.recomputeColors()
    })
  }

  /**
   * Recompute all registered computed color variables and update the stylesheet.
   */
  private static recomputeColors(): void {
    if (Color.computedColors.size === 0) return

    const rules: string[] = []
    for (const [
      outputVar,
      { varName, scale, method },
    ] of Color.computedColors) {
      try {
        const baseColor = Color.fromVar(varName)
        let computedColor: Color

        switch (method) {
          case 'b': // brighten
            computedColor =
              scale > 0 ? baseColor.brighten(scale) : baseColor.darken(-scale)
            break
          case 's': // saturate
            computedColor =
              scale > 0
                ? baseColor.saturate(scale)
                : baseColor.desaturate(-scale)
            break
          case 'h': // hue
            computedColor = baseColor.rotate(scale * 100)
            break
          case 'o': // alpha/opacity
            computedColor = baseColor.opacity(scale)
            break
          default:
            continue
        }
        rules.push(`  ${outputVar}: ${computedColor.rgba};`)
      } catch (_e) {
        // Skip if source color can't be resolved
      }
    }

    if (rules.length === 0) return

    const cssText = `:root {\n${rules.join('\n')}\n}`

    if (Color.computedColorStylesheet === null) {
      Color.computedColorStylesheet = document.createElement('style')
      Color.computedColorStylesheet.id = 'tosijs-computed-colors'
      document.head.append(Color.computedColorStylesheet)
    }
    Color.computedColorStylesheet.textContent = cssText
  }
}
