# css

This is a collection of utilities for working with CSS rules.

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
to it automatically. There are *no bare numeric*ele properties in CSS except `0`.

Why `px`? Well the other obvious options would be `rem` and `em` but `px` seems the
least surprising option.

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

And then render this as CSS and stick it into a StyleNode and it will work.

You *cannot* write:

    initVars({
      background: '#fafafa',
      blockColor: vars.background_b5
    })

Because `--background` isn't defined on `document.body` yet, so vars.background_b5
won't be able to tell what `--background` is going to be yet. So either you need to
do this in two stags (create a StyleNode that defines the base color `--background`
then define the computed colors and add thos) OR use a `Color` instance:

    const background = Color.fromCss('#fafafa')

    initVars({
      background: background.toHTML,
      blockColor: background.brighten(-0.05).toHTML
    })

Until browsers support color calculations the way they support dimenion arithmetic with `calc()`
this is the miserable existence we all lead. That, or defining huge arrays of color
values that we mostly don't use and are often not exactly what we want. You choose!

> Finally, `vars` color computations **will not work on named HTML colors** (e.g. `aliceblue`)
> because I refuse to add the definitions for this trash into the `xinjs` codebase.

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
stuff like `const nameElement = this.refs.nameField as unknown as HTMLInputElement`
and prevent css property typos without adding a single byte to the size of
the javascript payload.