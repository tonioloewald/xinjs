/*#
# 5. css

`xinjs` provides a collection of utilities for working with CSS rules that
help leverage CSS variables to produce highly maintainable and lightweight
code that is nonetheless easy to customize.

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

## css(styleMap: XinStyleMap): string

A function that, given a `XinStyleMap` renders CSS code. What is a XinStyleMap?
It's kind of what you'd expect if you wanted to represent CSS as Javascript in
the most straightforward way possible. It allows for things like `@import`,
`@keyframes` and so forth, but knows just enough about CSS to help with things
like autocompletion of CSS rules (rendered as camelcase) so that, unlike me, it
can remind you that it's `whiteSpace` and not `whitespace`.

```
import {elements, css} from 'xinjs'
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
const { elements, vars } = tosijs
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
> that xinjs Component works around with tagNames, but in practice far more
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
> `color()` and `color-mix()` are [now enjoy 91% support](https://caniuse.com/?search=color-mix) as of writing.
> See [color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) documentation.
> Where they meet your needs, I'd suggest using them.
>
> [contrast-color()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/contrast-color) is coming in Safari 26, 
> but [currently enjoys 0% upport](https://caniuse.com/?search=contrast-color).
>
> **Caution** although these look superficially like the `vars` syntax
> sugar for `calc()` performed on dimensional variables, they are in fact
> color calculations are performed on colors *evaluated* on `document.body` at 
> execution time. (So they won'b automatically be recomputed on theme change.)

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
for `xinjs` so these new ideas really have to earn a spot. Perhaps the
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

Where I am always looking to improve this module (and all of `xinjs`) is to
do a better job of **declaring** things to improve autocomplete behavior and
minimize casting and other Typescript antipatterns. E.g. adding a ton of
declarations to `elements` and `css` has done wonders to reduce the need for
stuff like `const nameElement = this.parts.nameField as unknown as HTMLInputElement`
and prevent css property typos without adding a single byte to the size of
the javascript payload.
*/
import { Color } from './color'
import { elements } from './elements'
import { camelToKabob } from './string-case'
import { XinStyleSheet, XinStyleRule } from './css-types'

export function StyleSheet(id: string, styleSpec: XinStyleSheet) {
  const element = elements.style(css(styleSpec))
  element.id = id
  document.head.append(element)
}

const numericProps = [
  'animation-iteration-count',
  'flex',
  'flex-base',
  'flex-grow',
  'flex-shrink',
  'opacity',
  'order',
  'tab-size',
  'widows',
  'z-index',
  'zoom',
]

export const processProp = (
  prop: string,
  value: string | number
): { prop: string; value: string } => {
  if (typeof value === 'number' && !numericProps.includes(prop)) {
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
  value: Color | string | number | XinStyleRule | undefined,
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

export const css = (obj: XinStyleSheet, indentation = ''): string => {
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
}): XinStyleRule => {
  console.warn('initVars is deprecated. Just use _ and __ prefixes instead.')
  const rule: XinStyleRule = {}
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    const kabobKey = camelToKabob(key)
    rule[`--${kabobKey}`] =
      typeof value === 'number' && value !== 0 ? String(value) + 'px' : value
  }
  return rule
}

export const invertLuminance = (map: XinStyleRule): XinStyleRule => {
  const inverted: XinStyleRule = {}

  for (const key of Object.keys(map)) {
    const value = map[key]
    if (value instanceof Color) {
      inverted[key] = value.inverseLuminance
    } else if (
      typeof value === 'string' &&
      value.match(/^(#[0-9a-fA-F]{3}|rgba?\(|hsla?\()/)
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
            {
              const baseColor = Color.fromVar(varName)
              target[prop] =
                scale > 0
                  ? baseColor.brighten(scale).rgba
                  : baseColor.darken(-scale).rgba
            }
            break
          case 's': // saturate
            {
              const baseColor = Color.fromVar(varName)
              target[prop] =
                scale > 0
                  ? baseColor.saturate(scale).rgba
                  : baseColor.desaturate(-scale).rgba
            }
            break
          case 'h': // hue
            {
              const baseColor = Color.fromVar(varName)
              target[prop] = baseColor.rotate(scale * 100).rgba
            }
            break
          case 'o': // alpha
            {
              const baseColor = Color.fromVar(varName)
              target[prop] = baseColor.opacity(scale).rgba
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
