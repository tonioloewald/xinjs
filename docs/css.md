# css

This is a collection of utilities for working with CSS.

The basic goal is to be able to implement some or all of our CSS very efficiently, compactly,
and reusably in Javascript because:

- Javascript tooling is really good, CSS quality tooling is terrible
- Having to write CSS in Javascript is *inevitable* so it might as well be consistent and painless
- It turns out you can get by with *much less* and generally *simpler* CSS this way
- You get some natural wins this way. E.g. writing two definitions of `body {}` is easy to do
  and bad in CSS. In Javascript it's simply an error!

The `css` module attempts to implement all this the simplest and most obvious way possible,
providing syntax sugar to help with best-practices such as `css-variables` and the use of
`@media` queries to drive consistency, themes, and accessibility.

## css(styleMap: XinStyleSheet): string

A function that, given a `XinStyleSheet` renders CSS code. What is a XinStyleSheet?
It's kind of what you'd expect if you wanted to represent CSS as Javascript in
the most straightforward way possible. It allows for things like `@import`,
`@keyframes` and so forth, but knows just enough about CSS to help with things
like autocompletion of CSS rules (rendered as camelcase) so that, unlike me, it
can remind you that it's `whiteSpace` and not `whitespace`.

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

If a bare, non-zero **number** is assigned to a CSS property it will have 'px' suffixed
to it automatically. There are *no bare numeric* properties in CSS except `0`.

Why `px`? Well the other obvious options would be `rem` and `em` but `px` seems the
least surprising option. (I've heard the arguments for `rem` and they make my head spin.)

`css` should render nested rules, such as `@keyframes` and `@media` correctly.

## StyleSheet(id: string, styleSpec: XinStyleSheet)

This is a convenience function for creating `<style>` elements (with the id provided)
and appending them to `document.head`.

    StyleSheet('base-style', {
      '*': {
        boxSizing: 'border-box'
      }
    })

Will insert the following in the `document.head` (with no formatting):

    <style id="base-style">
      * {
        box-sizing: border-box;
      }
    </style>

## Color

You can pass `Color` (see [Color](color.md))

## CSS-variable definitions

### using `_` and `__`

You can define a css-variable using an `_` prefix, e.g.:

    css({
      ':root': {
        _fontFamily: 'Roboto, Sans-serif'
      }
    })

generates:

    :root {
      --font-family: Roboto, Sans-serif;
    }

Similarly, you can define a variable which defines a default value using `__`, e.g.:

    css({
      'p': {
        __color: '#222'
      }
    })

generates:

    p {
      --color: var(--color-default, #222);
    }

> **Note**: Originally I wanted this to generate `--color: var(--color, #222)` but it turns out
> that the way CSS is evaluated in browsers, this is considered a cyclic reference (which
> it is, but it would be easy to resolve and very useful).

### inverseLuminance(styleRule: XinStyleRule): XinStyleRule

`inverseLuminance` takes a styleRule and tries to find all the color properties and replace them with `inverseLuminance`
(see [Color](color.md)) versions for easy implementation of "dark mode".

**Note** that the css method is called `invertLuminance` while the `Color` property is `inverseLuminance`.

    import { Color, StyleSheet, invertLuminance } from 'xinjs'

    const textColor = Color.fromCss('#222')

    const cssVars = {
      _textColor: textColor,
      _background: '#fafafa',
      _spacing: 16,
    }

    StyleSheet({
      ':root': cssVars,
      '@media (prefers-color-scheme: dark)': {
        ':root': invertLuminance(cssVars)
      } 
    })

`invertLuminance()` will only output inverted colors (it tries to identify color specifications in strings
using regular expression matching), skipping variables with non-color values.

### Deprecated methods

These methods will be removed, but currently generate a (hopefully helpful) warning.

- `initVars({[key: string]: any}) => {[key: string]: any}`
- `darkMode({[key: string]: any}) => {[key: string]: string}`

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

### Syntax Sugar for `calc(...)`

More importantly, `vars` allows you to conveniently perform calculations
on css (dimensional) variables by a percentage:

    vars.camelSize50    // 'calc(var(--camel-size) * 0.5)'
    vars.camelSize_50   // 'calc(var(--camel-size) * -0.5)'

### Computed Colors

> **Caution** although these look superficially like the `vars` syntax
> sugar for `calc()` performed on dimensional variables, they are in fact
> color calculations are performed on colors *evaluated* on `document.body`.

You can write:

    initVars({
      lineHeight: 24,
      spacing: 5,
      buttonHeight: calc(`vars.lineHeight + vars.spacing200`)
    })

And then render this as CSS and stick it into a `<style>` element and it will work.

You *cannot* write:

    initVars({
      background: '#fafafa',
      blockColor: vars.background_b5
    })

Because `--background` isn't defined on `document.body` yet, so vars.background_b5
won't be able to tell what `--background` is going to be yet. So either you need to
do this in two stags (create a `<style>` element that defines the base color `--background`
then define the computed colors and add thos) OR use a `Color` instance:

    const background = Color.fromCss('#fafafa')

    initVars({
      background: background.toHTML,
      blockColor: background.brighten(-0.05).toHTML
    })

Until browsers support color calculations the way they support dimenion arithmetic with `calc()`
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
syntax-sugar for classes so that:

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

Another thought:

    css({
      ':root': {
        _font: 'Roboto, sans-serif',
        __textColor: 'red',
      }
    })

Could render:

    :root {
      --font: Roboto, sans-serif,
      --text-color: var(--text-color, red),
    }

The idea here is to make defining both css-variables directly and as inherited much easier.
The main thing holding me back here is that a lot of lint tools complain blue murder about
leading underscores in property names.

### Something to Declare

Where I am always looking to improve this module (and all of `xinjs`) is to
do a better job of **declaring** things to improve autocomplete behavior and
minimize casting and other Typescript antipatterns. E.g. adding a ton of
declarations to `elements` and `css` has done wonders to reduce the need for
stuff like `const nameElement = this.parts.nameField as unknown as HTMLInputElement`
and prevent css property typos without adding a single byte to the size of
the javascript payload.
