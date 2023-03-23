# css

This is a collection of utilities for working with CSS rules.

## css(styleMap): string

A function that, given a `styleMap` renders CSS code.

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

If a **number** is assigned to a dimensional CSS property it will have 'px' suffixed
to it automatically.

`css` should render nested rules, such as `@keyframes` and `@media` correctly.

## initVars({[key: string]: any}) => {[key: string]: any}

Given a map of CSS properties (in camelCase) form emit a map of css-variables to
the values, with `px` suffixed to bare numbers where appropriate.

    const cssVars = {
      textColor: '#222',   // --text-color: #222
      background: '#eee',  // --background: #eee
      fontSize: 15         // --font-size: 15px
    }

    const myStyleMap = {
      ':root': initVars(cssVars)
    }

## darkMode({[key: string]: any}) => {[key: string]: string}

Given a map of CSS properties (in camelCase) emit a map of those properties that
has color values with their luminance inverted.

    const myStyleMap = {
      ':root': cssVars,               // includes --font-size
      '@media (prefers-color-scheme: dark)': {
        ':root': darkMode(cssVars)    // omits --font-size
      },
    }

## vars

Vars is a proxy object that will return a css variable string from
a camelCase property, e.g.

    vars.camelCase // 'var(--camel-case)'

### Syntax Sugar for `calc(...)`

More importantly, vars allows you to conveniently perform calculations
on css (dimensional) variables by a percentage:

    vars.camelSize50    // 'calc(var(--camel-size) * 0.5)'
    vars.camelSize_50   // 'calc(var(--camel-size) * -0.5)'

### Computed Colors

> Experimental! Note: color calculations are performed on colors
> evaluated on `document.body`.

Color computations will not work on named HTML colors (e.g. `aliceblue`).

And it also allows you to perform color calculations on css (color) 
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

##