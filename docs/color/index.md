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
