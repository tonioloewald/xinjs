# Color

`xinjs` includes a compact (~1.3kB) and powerful `Color` class for manipulating colors.
The hope is that when the CSS provides native color calculations this will no
longer be needed.

## Color(r: number, g: number, b: number, a = 1) constructor

The most straightforward method for creating a `Color` instance is using
the constructor to create an `rgb` or `rgba` representation.

## Static Methods

`Color.fromCss(cssColor: string): Color` produces a `Color` instance from any
css color definition the browser can handle.

`Color.fromHsl(h: number, s: number, l: number, a = 1)` produces a `Color` 
instance from HSL/HSLA values. The HSL values are cached internally and 
used for internal calculations to reduce precision problems that occur
when converting HSL to RGB and back. It's nowhere near as sophisticated as
the models used by (say) Adobe or Apple, but it's less bad than doing all
computations in rgb.

## Properties

- `r`, `g`, `b` are numbers from 0 to 255.
- `a` is a number from 0 to 1

## Properties (read-only)

- `html` — the color in HTML `#rrggbb[aa]` format
- `inverse` — the photonegative of the color (light is dark, orange is blue)
- `inverseLuminance` — inverts luminance but keeps hue, great for "dark mode"
- `rgb` and `rgba` — the color in `rgb(...)` and `rgba(...)` formats.
- `hsl` and `hsla` — the color in `hsl(...)` and `hsla(...)` formats.
- `RGBA` and `ARGB` — return the values as arrays of numbers from 0 to 1 for use with
  [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) (for example). 
- `brightness` — this is the brightness of the color based on [BT.601](https://www.itu.int/rec/R-REC-BT.601)
- `mono` — this produces a `Color` instance that a greyscale version (based on `brightness`)

## Manipulating Colors

Each of these methods creates a new color instance based on the existing color(s).

In each case `amount` is from 0 to 1, and `degrees` is an angle (e.g. ± 0 to 360).

- `brighten(amount: number)`
- `darken(amount: number)`
- `saturate(amount: number)`
- `desaturate(amount: number)`
- `rotate(angle: number)`
- `opacity(amount: number)` — this just creates a color with that opacity (it doesn't adjust it)
- `mix(otherColor: Color, amount)` — produces a mix of the two colors in HSL-space
- `blend(otherColor: Color, amount)` — produces a blend of the two colors in RGB-space (usually icky)

Where-ever possible, unless otherwise indicated, all of these operations are performed in HSL-space.
HSL space is not great! For example, `desaturate` essentially blends you with medium gray (`#888`)
rather than a BT.601 `brightness` value where "yellow" is really bright and "blue" is really dark.

If you want to desaturate colors more nicely, you can try blending them with their own `mono`.

## Utilities

- `swatch()` emits the color into the console with a swatch and returns the color for chaining.
- `toString()` emits the `html` property