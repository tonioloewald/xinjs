/*{ "order": 3, "description": "Utilities for writing CSS as JS objects, generating stylesheets, and working with CSS variables and themes via css(), vars, and varDefault()." }*/
/*#
# CSS

`tosijs` provides a collection of utilities for working with CSS rules that
help leverage CSS variables to produce highly maintainable and lightweight
code that is nonetheless easy to customize.

> The design goal of `css`, `vars`, and `varDefault` is to make working with
> CSS3 more intuitive, maintainable, easier, and expressive than using libraries
> like Tailwind.

The basic goal is to be able to implement some or all of our CSS very efficiently, compactly,
and reusably in Javascript because:

- Javascript quality tooling is really good, CSS quality tooling is terrible
- Having to write CSS in Javascript is *inevitable* so it might as well be consistent and painless
- It turns out you can get by with *much less* and generally *simpler* CSS this way
- You get some natural wins this way. E.g. writing two definitions of `body {}` is easy to do
  and bad in CSS. In Javascript it's simply an error!

The `css` module attempts to implement all this the simplest and most obvious way possible,
providing syntax sugar to help with best-practices such as `css-variables` and the use of
`@media` queries to drive consistency, themes, and accessibility.

## css(styleMap: TosiStyleMap): string

A function that, given a `TosiStyleMap` renders CSS code. What is a TosiStyleMap?
It's kind of what you'd expect if you wanted to represent CSS as Javascript in
the most straightforward way possible. It allows for things like `@import`,
`@keyframes` and so forth, but knows just enough about CSS to help with things
like autocompletion of CSS rules (rendered as camelcase) so that, unlike me, it
can remind you that it's `whiteSpace` and not `whitespace`.

```
import {elements, css} from 'tosijs'
const {style} = elements

const myStyleMap = {
  body: {
    color: 'red'
  },
  button: {
    borderRadius: 5
  }
}

document.head.append(style(css(myStyleMap)))
```

There's a convenient `Stylesheet()` function that does all this and adds an id to the
resulting `<style>` element to make it easier to figure out where a given stylesheet
came from.

```
Stylesheet('my-styles', {
  body: {
    color: 'red'
  },
  button: {
    borderRadius: 5
  }
})
```

…inserts the following in the `document.head`:

```
<style id="my-styles">
body {
  color: red;
}
button {
  border-radius: 5px;
}
</style>
```

If a bare, non-zero **number** is assigned to a CSS property it will have 'px' suffixed
to it automatically. There are *no bare numeric*ele properties in CSS except `0`.

Why `px`? Well the other obvious options would be `rem` and `em` but `px` seems the
least surprising option.

`css` should render nested rules, such as `@keyframes` and `@media` correctly.

## Initializing CSS Variables

You can initialize CSS variables using `_` or `__` prefixes on property names.
One bar, turns the camelCase property-name into a --snake-case CSS variable
name, while two creates a default that can be overridden.

```
StyleSheet('my-theme', {
  ':root', {
    _fooBar: 'red',
    __bazBar: '10px'
  }
})
```

Will produce:

```
<style id="my-theme">
  :root {
    --foo-bar: red;
    --baz-bar: var(--baz-bar-default, 10px);
  }
</style>
```
```js
import { elements, vars } from 'tosijs'
const { div } = elements

window.CSS.registerProperty({
  name: '--at-bar',
  syntax: '<color>',
  inherits: true,
  initialValue: 'green',
})

preview.append(
  div(
    {
      style: {
        _fooBar: 'red',
        __bazBar: 'blue',
      }
    },
    div(
      {
        style: { color: vars.fooBar },
      },
      'fooBar'
    ),
    div(
      {
        style: { color: vars.bazBar },
      },
      'bazBar'
    ),
    div(
      {
        style: { color: vars.atBar },
      },
      'atBar'
    ),
  )
)
```

> ### @property and CSS.registerProperty() considered harmful
>
> This [new CSS feature}(https://developer.mozilla.org/en-US/docs/Web/CSS/@property)
> is well-intentioned but ill-considered. I advise
> against using it yourself until its serious flaws are addressed. The problem
> is that if someone registers a variable you're using or you register
> a variable someone else is using then your CSS may be broken. And
> you can't re-register a variable either.

> This is a bit like the problem
> that tosijs Component works around with tagNames, but in practice far more
> difficult to solve. It is impossible to tell if a given instance of
> a given variable name is an intentional reuse or a new separate variable.
> No-one intentionally defines two different components with the same tag.

## invertLuminance({[key: string]: any}) => {[key: string]: string}

Given a map of CSS properties (in camelCase) emit a map of those properties that
has color values with their luminance inverted.

    const myStyleMap = {
      ':root': cssVars,                      // includes --font-size
      '@media (prefers-color-scheme: dark)': {
        ':root': invertLuminance(cssVars)    // omits --font-size
      },
    }

## vars

`vars` is a proxy object that will return a css variable string from
a camelCase property, e.g.

    vars.camelCase // 'var(--camel-case)'

> **it isn't called `var`** because that's a reserved word!

### varDefault

`varDefault` is a proxy object just like `vars` except that it returns a
`function` that takes a property and renders it as a css variable reference
with a default, e.g

    varDefault.borderColor('red') // `var(--border-color, red)`

## `getCssVar(variable: string, atElement = document.body): string`

`getCssVar()` obtains the css variable evaluated at the specified element
(an element defined at `:root` can be evaluated at `document.body`). You
can provide the name, e.g. `--foo-bar`, or "wrapped", e.g. `var(--foo-bar)`.

### Syntax Sugar for `calc(...)`

More importantly, `vars` allows you to conveniently perform calculations
on css (dimensional) variables by a percentage:

    vars.camelSize50    // 'calc(var(--camel-size) * 0.5)'
    vars.camelSize_50   // 'calc(var(--camel-size) * -0.5)'

### Computed Colors

> #### Notes
>
> `color()` and `color-mix()` are [widely supported](https://caniuse.com/?search=color-mix) (Baseline since 2023).
> See [color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) documentation.
> Where they meet your needs, I'd suggest using them.
>
> [contrast-color()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/contrast-color) is coming in Safari 26,
> but [currently enjoys 0% upport](https://caniuse.com/?search=contrast-color).
>
> **Note** although these look superficially like the `vars` syntax sugar for
> `calc()` on dimensional variables, they are in fact color calculations
> performed on colors *evaluated* on `document.body`, emitted into a dedicated
> `tosijs-computed-colors` stylesheet.
>
> **They ARE recomputed on theme change** — every registered computed color is
> recalculated whenever an observant stylesheet regenerates (see
> [StyleSheet](#stylesheetid-string-stylespec-tosistylesheet-htmlstyleelement)), so a derived shade
> tracks its source variable automatically. (This documentation previously said
> the opposite; it was out of date.) Verified in-browser: changing `--brand`
> from `#3366cc` to `#cc3366` moves `--brand_20b` from `rgba(41,82,163,1)` to
> `rgba(163,41,82,1)` and the DOM restyles with it.

You can write:

```
const styleSpec = {
  _lineHeight: 24,
  _spacing: 5,
  _buttonHeight: calc(`vars.lineHeight + vars.spacing200`)
)
```

And then render this as CSS and stick it into a StyleNode and it will work.

You *cannot* write:

```
const styleSpec = {
  _background: '#fafafa',
  _blockColor: vars.background_5b
}
```

Because `--background` isn't defined on `document.body` yet, so vars.background_5b
won't be able to tell what `--background` is going to be yet. So either you need to
do this in two stags (create a StyleNode that defines the base color `--background`
then define the computed colors and add this) OR use a `Color` instance:

```
const background = Color.fromCss('#fafafa')

initVars({
  background: background.toHTML,
  blockColor: background.brighten(-0.05).toHTML
})
```

Until browsers support color calculations the way they support dimension arithmetic with `calc()`
this is the miserable existence we all lead. That, or defining huge arrays of color
values that we mostly don't use and are often not exactly what we want. You choose!

> **New** color now supports CSS [named colors](https://developer.mozilla.org/en-US/docs/Web/CSS/named-color),
such as `black`, `red`, and `aliceblue`.

`vars` also allows you to perform color calculations on css (color)
variables:

#### Change luminance with `b` (for brighten) suffix

The scale value is treated as a percentage and moves the brightness
that far from its current value to 100% (if positive) or 0% (if negattive).

    vars.textColor50b   // increases the luminance of textColor
    vars.textColor_50b  // halves the luminance of textColor

#### Change saturation with `s` suffix

The scale value is treated as a percentage and moves the saturation
that far from its current value to 100% (if positive) or 0% (if negattive).

    vars.textColor50s   // increases the saturation of textColor
    vars.textColor_50s  // halves the saturation of textColor

#### Rotate hue with `h` suffix

    vars.textColor30h   // rotates the hue of textColor by 30°
    vars.textColor_90h  // rotates the hue of textColor by -90°

#### Set Opacity with `o` suffix

Unlike the other modifiers, `o` simply sets the opacity of the
resulting color to the value provided.

    vars.textColor50o   // textColor with opacity set to 0.5

## More to follow?

The more I use the `css` module, the more I like it and the more ideas I have
to make it even better, but I have a very tight size/complexity target
for `tosijs` so these new ideas really have to earn a spot. Perhaps the
feature I have come closest to adding and then decided against was providing
syntax-sugar for classs so that:

    css({
      _foo: {
        color: 'red'
      }
    })

Would render:

    .foo {
      color: 'red'
    }

But looking at the code I and others have written, the case for this is weak as most class
declarations are not just bare classes. This doesn't help with declarations
for `input.foo` or `.foo::after` or `.foo > *` and now there'd be things that
look different which violates the "principle of least surprise". So, no.

### Something to Declare

Where I am always looking to improve this module (and all of `tosijs`) is to
do a better job of **declaring** things to improve autocomplete behavior and
minimize casting and other Typescript antipatterns. E.g. adding a ton of
declarations to `elements` and `css` has done wonders to reduce the need for
stuff like `const nameElement = this.parts.nameField as unknown as HTMLInputElement`
and prevent css property typos without adding a single byte to the size of
the javascript payload.

## StyleSheet(id: string, styleSpec: TosiStyleSheet): HTMLStyleElement

Creates a `<style>` element (with the given `id`) in `document.head` and returns
it, so you can remove or otherwise manage it later.

**If you pass a `tosi` proxy, the stylesheet is *observant*:** change the proxy and
the stylesheet regenerates **in place** — no re-rendering, no re-mounting, no
manual plumbing. This is the intended way to build themes.

    const { theme } = tosi({
      theme: {
        body: {
          _brandColor: '#3366cc',
          _pageBg: 'white',
        },
      },
    })

    StyleSheet('theme', theme)

    // later — every rule derived from these variables updates immediately
    theme.body._brandColor = '#cc3366'

### Computed colors recompute too

Derived colors created through the [`vars`](#vars) sugar (`vars.brandColor50b`
and friends) are **registered** when first referenced, and **recomputed whenever
an observant stylesheet changes**. So a derived shade tracks its source variable
without you wiring anything up: change `--brand-color` and every
`--brand-colorNNb`/`s`/`h`/`o` derived from it is recalculated and rewritten
(into a dedicated `tosijs-computed-colors` stylesheet).

Change the brand color and **everything derived from it follows** — the shades,
the borders, the hover states. Nothing here is re-rendered; one variable changes
and the browser restyles:

```html
<div class="theme-demo">
  <label>brand <input type="color" class="brand" value="#3366cc"></label>
  <label>page <input type="color" class="page" value="#f4f4f8"></label>
  <div class="card">
    <h4>Card heading</h4>
    <p>Body text on a derived surface.</p>
    <button class="primary">Primary</button>
    <button class="ghost">Ghost</button>
  </div>
</div>
```
```js
import { tosi, StyleSheet, vars, elements } from 'tosijs'

const { demoTheme } = tosi({
  demoTheme: {
    body: {
      _brand: '#3366cc',
      _page: '#f4f4f8',
    },
  },
})

StyleSheet('dynamic-theme-demo', demoTheme)

// every rule below is expressed in terms of the two variables above —
// note the derived shades (brand_20b darker, brand30o alpha, page20b lighter)
StyleSheet('dynamic-theme-demo-rules', {
  '.theme-demo': {
    display: 'flex', flexDirection: 'column', gap: '12px',
    padding: '16px', background: vars.page, borderRadius: '8px',
  },
  '.theme-demo label': { display: 'flex', gap: '8px', alignItems: 'center' },
  '.theme-demo .card': {
    padding: '16px', borderRadius: '8px',
    background: vars.page20b,
    border: `2px solid ${vars.brand30o}`,
    boxShadow: `0 2px 8px ${vars.brand30o}`,
  },
  '.theme-demo h4': { margin: '0 0 8px 0', color: vars.brand_20b },
  '.theme-demo button': {
    padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
    border: `1px solid ${vars.brand}`,
  },
  '.theme-demo .primary': { background: vars.brand, color: vars.brand90b },
  '.theme-demo .ghost': { background: 'transparent', color: vars.brand_20b },
})

preview.querySelector('.brand').addEventListener('input', (event) => {
  demoTheme.body._brand = event.target.value
})
preview.querySelector('.page').addEventListener('input', (event) => {
  demoTheme.body._page = event.target.value
})
```

This is the whole loop — proxy → stylesheet → derived colors → live DOM:

```test
const { tosi, StyleSheet, vars, elements, updates } = tosijs
const { div } = elements

test('changing a themed variable updates derived colors in the live DOM', async () => {
  const { swatchTheme } = tosi({
    swatchTheme: { body: { _swatchBase: '#3366cc' } },
  })
  const sheet = StyleSheet('swatch-theme-test', swatchTheme)

  // referencing the derived var registers it for recomputation
  const base = div({ style: { background: vars.swatchBase } })
  const lighter = div({ style: { background: vars.swatchBase50b } })
  preview.append(base, lighter)
  await updates()
  await waitMs(80) // let the microtask recompute + the browser restyle

  const read = (el) => getComputedStyle(el).backgroundColor
  const baseBefore = read(base)
  const lighterBefore = read(lighter)

  // the derived color resolved to a REAL color, and is not just the source
  expect(lighterBefore).not.toBe('')
  expect(lighterBefore).not.toBe('rgba(0, 0, 0, 0)')
  expect(lighterBefore).not.toBe(baseBefore)

  // now change the source variable through the proxy
  swatchTheme.body._swatchBase = '#cc3366'
  await updates()
  await waitMs(80)

  const baseAfter = read(base)
  const lighterAfter = read(lighter)

  expect(baseAfter).not.toBe(baseBefore) // the sheet regenerated in place
  expect(lighterAfter).not.toBe(lighterBefore) // and the DERIVED color recomputed
  expect(lighterAfter).not.toBe(baseAfter) // still a distinct shade

  sheet.remove()
  base.remove()
  lighter.remove()
})
```

## onStylesheetChange(callback: () => void): () => void

Registers a callback that fires whenever any observant stylesheet regenerates
(i.e., when a proxy-backed `StyleSheet` detects a change and rewrites its CSS).
Returns an unsubscribe function.

    const unsub = onStylesheetChange(() => {
      console.log('a stylesheet was updated')
    })

    // later
    unsub()
*/
import { Color } from './color'
import { cssColors } from './css-colors'
import { elements } from './elements'
import { camelToKabob } from './string-case'
import { TosiStyleSheet, TosiStyleRule } from './css-types'
import { warnDeprecated, tosiPath, tosiValue } from './metadata'
import { observe } from './xin'

// Callbacks to notify when any observant stylesheet regenerates
const stylesheetChangeCallbacks: Set<() => void> = new Set()

// Register Color.queueRecompute as a listener (done lazily to avoid circular import issues)
let colorListenerRegistered = false
function ensureColorListener(): void {
  if (!colorListenerRegistered) {
    colorListenerRegistered = true
    stylesheetChangeCallbacks.add(() => Color.queueRecompute())
  }
}

export function onStylesheetChange(callback: () => void): () => void {
  stylesheetChangeCallbacks.add(callback)
  return () => stylesheetChangeCallbacks.delete(callback)
}

function notifyStylesheetChange(): void {
  ensureColorListener()
  for (const callback of stylesheetChangeCallbacks) {
    callback()
  }
}

// Returns the <style> element so callers can remove or further manipulate the
// sheet they created (it used to return nothing, leaving no handle at all).
export function StyleSheet(
  id: string,
  styleSpec: TosiStyleSheet
): HTMLStyleElement {
  const spec = tosiValue(styleSpec) as TosiStyleSheet
  const element = elements.style(css(spec))
  element.id = id
  document.head.append(element)

  // If styleSpec is a proxy, observe it for changes
  const path = tosiPath(styleSpec)
  if (path !== undefined) {
    observe(path, () => {
      element.textContent = css(tosiValue(styleSpec) as TosiStyleSheet)
      notifyStylesheetChange()
    })
  }
  return element as HTMLStyleElement
}

// CSS properties that accept unitless numbers (no px suffix), split by whether
// a px value is even legal for that property:
//   alwaysUnitless — `<prop>: 25px` is INVALID (opacity, z-index, font-weight…).
//     px is suppressed for real declarations AND custom props (`_opacity: 0.5`
//     must stay `--opacity: 0.5`, not `0.5px`).
//   dualUnitless — `line-height` accepts BOTH a unitless multiplier (`1.5`) and a
//     length (`25px`). As a real declaration we honor the multiplier idiom and
//     keep bare numbers unitless; as a custom property (`_lineHeight`) the value
//     is an opaque token and tosijs's bare-number→px convention wins — the vars
//     system uses it as a length (e.g. calc(vars.lineHeight + vars.spacing200)).
//     Want a unitless custom-prop line-height? pass a string: `_lineHeight: '1.5'`.
const alwaysUnitless =
  /^(animation-iteration-count|column-count|flex(-grow|-shrink)?|font-weight|opacity|order|orphans|scale|tab-size|widows|z-index|zoom)$/
const dualUnitless = /^line-height$/

export const processProp = (
  prop: string,
  value: string | number
): { prop: string; value: string } => {
  // Test against the bare CSS property name — a custom property arrives here
  // still prefixed (`_opacity`), and prop is already kebab-cased by the caller.
  const bareProp = prop.replace(/^_+/, '')
  const isCustomProp = prop.startsWith('_')
  const unitlessHere =
    alwaysUnitless.test(bareProp) ||
    (!isCustomProp && dualUnitless.test(bareProp))
  if (typeof value === 'number' && !unitlessHere) {
    value = `${value}px`
  }
  if (prop.startsWith('_')) {
    if (prop.startsWith('__')) {
      prop = '--' + prop.substring(2)
      value = `var(${prop}-default, ${value})`
    } else {
      prop = '--' + prop.substring(1)
    }
  }
  return {
    prop,
    value: String(value),
  }
}

const renderProp = (
  indentation: string,
  cssProp: string,
  value: string | number | Color | undefined
): string => {
  if (value === undefined) {
    return ''
  }
  if (value instanceof Color) {
    value = value.html
  }
  const processed = processProp(cssProp, value)
  return `${indentation}  ${processed.prop}: ${processed.value};`
}

const renderStatement = (
  key: string,
  value: Color | string | number | TosiStyleRule | undefined,
  indentation = ''
): string => {
  const cssProp = camelToKabob(key)
  if (typeof value === 'object' && !(value instanceof Color)) {
    const renderedRule = Object.keys(value)
      .map((innerKey) =>
        renderStatement(innerKey, value[innerKey], `${indentation}  `)
      )
      .join('\n')
    return `${indentation}  ${key} {\n${renderedRule}\n${indentation}  }`
  } else {
    return renderProp(indentation, cssProp, value)
  }
}

export const css = (obj: TosiStyleSheet, indentation = ''): string => {
  const selectors = Object.keys(obj).map((selector) => {
    const body = obj[selector]
    if (typeof body === 'string') {
      if (selector === '@import') {
        return `@import url('${body}');`
      }
      throw new Error('top-level string value only allowed for `@import`')
    }
    const rule = Object.keys(body)
      .map((prop) => renderStatement(prop, body[prop]))
      .join('\n')
    return `${indentation}${selector} {\n${rule}\n}`
  })
  return selectors.join('\n\n')
}

export const initVars = (obj: {
  [key: string]: string | number
}): TosiStyleRule => {
  warnDeprecated(
    'initVars',
    'initVars is deprecated. Just use _ and __ prefixes instead.'
  )
  const rule: TosiStyleRule = {}
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    const kabobKey = camelToKabob(key)
    rule[`--${kabobKey}`] =
      typeof value === 'number' && value !== 0 ? String(value) + 'px' : value
  }
  return rule
}

export const invertLuminance = (map: TosiStyleRule): TosiStyleRule => {
  const inverted: TosiStyleRule = {}

  for (const key of Object.keys(map)) {
    const value = map[key]
    if (value instanceof Color) {
      inverted[key] = value.inverseLuminance
    } else if (
      typeof value === 'string' &&
      // named CSS colors (now DOM-free parseable) were silently dropped from
      // the inverted map — only #hex/rgb()/hsl() were recognized
      (value.match(/^(#[0-9a-fA-F]{3}|rgba?\(|hsla?\()/) != null ||
        cssColors[value.trim().toLowerCase()] !== undefined)
    ) {
      inverted[key] = Color.fromCss(value).inverseLuminance
    }
  }

  return inverted
}

export const varDefault = new Proxy<{ [key: string]: CssVarBuilder }>(
  {},
  {
    get(target, prop: string) {
      if (target[prop] === undefined) {
        const varName = '--' + camelToKabob(prop)
        target[prop] = (val: string | number) => `var(${varName}, ${val})`
      }
      return target[prop]
    },
  }
)

type VarsType = {
  default: typeof varDefault
} & {
  [key: string]: string
}

export const vars = new Proxy<VarsType>({} as VarsType, {
  get(target, prop: string) {
    if (prop === 'default') {
      return varDefault
    }
    if (target[prop] == null) {
      prop = camelToKabob(prop)
      const [, _varName, , isNegative, scaleText, method] = prop.match(
        /^([-\w]*?)((_)?(\d+)(\w?))?$/
      ) || ['', prop]
      const varName = `--${_varName}`
      if (scaleText != null) {
        const scale =
          isNegative == null
            ? Number(scaleText) / 100
            : -Number(scaleText) / 100
        switch (method) {
          case 'b': // brighten
          case 's': // saturate
          case 'h': // hue
          case 'o': // alpha
            {
              // Return a CSS variable reference and register for computation
              const outputVar = `--${prop}`
              Color.registerComputedColor(outputVar, varName, scale, method)
              target[prop] = `var(${outputVar})`
            }
            break
          case '':
            target[prop] = `calc(var(${varName}) * ${scale})`
            break
          default:
            console.error(method)
            throw new Error(
              `Unrecognized method ${method} for css variable ${varName}`
            )
        }
      } else {
        target[prop] = `var(${varName})`
      }
    }
    return target[prop]
  },
})

type CssVarBuilder = (val: string | number) => string

// Theme Preferences

export type ColorScheme = 'light' | 'dark'
export type ContrastPreference = 'no-preference' | 'more' | 'less' | 'custom'

export interface ThemePreferences {
  colorScheme: ColorScheme
  contrast: ContrastPreference
  reducedMotion: boolean
  reducedTransparency: boolean
  forcedColors: boolean
}

export function getThemePreferences(): ThemePreferences {
  const mq = (query: string) =>
    typeof matchMedia !== 'undefined' && matchMedia(query).matches

  return {
    colorScheme: mq('(prefers-color-scheme: dark)') ? 'dark' : 'light',
    contrast: mq('(prefers-contrast: more)')
      ? 'more'
      : mq('(prefers-contrast: less)')
      ? 'less'
      : mq('(prefers-contrast: custom)')
      ? 'custom'
      : 'no-preference',
    reducedMotion: mq('(prefers-reduced-motion: reduce)'),
    reducedTransparency: mq('(prefers-reduced-transparency: reduce)'),
    forcedColors: mq('(forced-colors: active)'),
  }
}

export function onThemePreferencesChange(
  callback: (prefs: ThemePreferences) => void
): () => void {
  if (typeof matchMedia === 'undefined') {
    return () => {}
  }

  const queries = [
    '(prefers-color-scheme: dark)',
    '(prefers-contrast: more)',
    '(prefers-contrast: less)',
    '(prefers-contrast: custom)',
    '(prefers-reduced-motion: reduce)',
    '(prefers-reduced-transparency: reduce)',
    '(forced-colors: active)',
  ]

  const handler = () => callback(getThemePreferences())

  const mediaQueryLists = queries.map((q) => matchMedia(q))
  for (const mql of mediaQueryLists) {
    mql.addEventListener('change', handler)
  }

  return () => {
    for (const mql of mediaQueryLists) {
      mql.removeEventListener('change', handler)
    }
  }
}
