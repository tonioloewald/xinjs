# Blueprints

One issue with standard web-components built with tosijs is that building them
"sucks in" the version of `tosijs` you're working with. This isn't a huge problem
with monolithic code-bases, but it does prevent components from being loaded
"on-the-fly" from CDNs and composed on the spot and it does make it hard to
"tree shake" component libraries.

```js
import { elements, tosiLoader, tosiBlueprint } from 'tosijs'

preview.append(
  tosiLoader(
    tosiBlueprint({
      tag: 'swiss-clock',
      src: 'https://tonioloewald.github.io/xin-clock/dist/blueprint.js?1234',
      blueprintLoaded({creator}) {
        preview.append(creator())
      }
    }),
  )
)
```

Another issue is name-collision. What if two people create a `<tab-selector>` component
and you want to use both of them? Or you want to switch to a new and better one but
don't want to do it everywhere all at once?

With blueprints, the *consumer* of the component chooses the `tag`, reducing the
chance of name-collision. (You can consume the same blueprint multiple times,
giving each one its own tag.)

To address these issues, `tosijs` provides a `<tosi-loader>` loader component and
a function `makeComponent` that can define a component given a blueprint
function.

## `<tosi-loader>`—the blueprint loader

`<tosi-loader>` is a simple custom-element provided by `tosijs` for the dynamic loading
of component **blueprints**. It will load its `<tosi-blueprint>`s in parallel.

```
<tosi-loader>
  <tosi-blueprint tag="swiss-clock" src="https://loewald.com/lib/swiss-clock"></tosi-blueprint>
</tosi-loader>
<swiss-clock>
  <code style="color: var(--brand-color)">tosijs</code> rules!
</swiss-clock>
```

> The legacy names `<xin-blueprint>` and `<xin-loader>` were removed in 1.8.0 —
> use `<tosi-blueprint>` and `<tosi-loader>`.

### ⚠️ These tags execute code

`<tosi-blueprint src="…">` **runs the module it names**. That is the whole
feature — but it means the tag is an arbitrary-script-execution sink, and a
custom element can arrive through `innerHTML` like any other markup. So:

- **Strip `<tosi-blueprint>` and `<tosi-loader>` from any HTML you did not
  write.** A sanitizer that passes unknown custom elements through (a denylist
  sanitizer, or `DOMPurify` configured with `CUSTOM_ELEMENT_HANDLING`) will
  hand an injected `src` straight to `import()`. Allowlist sanitizers —
  DOMPurify and `sanitize-html` in their default configurations — already drop
  these tags.
- `javascript:`, `data:` and `vbscript:` URLs are **refused unconditionally**;
  no honest blueprint uses one.
- Everything else loads by default, because loading a blueprint from a CDN is
  the point. If your app doesn't need that, narrow it with
  `settings.blueprintSrcCheck` — return `false` and the load is refused with a
  `console.error` naming the URL:

```
import { settings } from 'tosijs'

settings.blueprintSrcCheck = (src, el) =>
  new URL(src, location.href).origin === location.origin
```

> The default may become same-origin in 2.0. Setting the hook now is
> forward-compatible either way.

### `<tosi-blueprint>` Attributes

- `src` is the url of the `blueprint` javascript module (required)
- `tag` is the tagName you wish to use. This defaults to the name of the source file if suitable.
- `property` allows you to load a named exported property from a blueprint module
  (allowing one blueprint to export multiple blueprints). By default, it's `default`.
- `loaded` is the `TosiPackagedComponent` after loading

#### `<tosi-blueprint>` Properties

- `blueprintLoaded(package: TosiPackagedComponent)` `<tosi-blueprint>` when its blueprint is loaded.

#### `<tosi-loader>` Properties

- `allLoaded()` is called when all the blueprints have loaded.

## `makeComponent(tag: string, blueprint: TosiBlueprint): Promise<TosiPackagedComponent>`

`makeComponent` takes a `tag` of your choice and a `blueprint` and generates
the custom-element's `class` and `elementCreator` as its `type` and `creator`
properties.

So, instead of:

    import {myThing} from './path/to/my-thing'

    document.body.append(myThing())

You could write:

    import { makeComponent } from 'tosijs'
    import myThingBlueprint from './path/to/my-thing-blueprint'

    makeComponent('different-tag', myThingBlueprint).then((packaged) => {
      document.body.append(packaged.creator())
    })

This is a more complex example that loads two components and only generates
the test component once everything is ready:

```js
import { tosiLoader, tosiBlueprint } from 'tosijs'

let clockType = null

preview.append(
  tosiLoader(
    {
      allLoaded() {
        const xinTest = this.querySelector('[tag="xin-test"]').loaded.creator
        preview.append(
          xinTest({
            description: `${clockType.tagName} registered`,
            test() {
              return (
                preview.querySelector(clockType.tagName) && preview.querySelector(clockType.tagName).constructor !==
                HTMLElement
              )
            },
          })
        )
      },
    },
    tosiBlueprint({
      tag: 'swiss-clock',
      src: 'https://tonioloewald.github.io/xin-clock/dist/blueprint.js?1234',
      blueprintLoaded({type, creator}) {
        clockType = type
        preview.append(creator())
      },
    }),
    tosiBlueprint({
      tag: 'xin-test',
      src: 'https://tonioloewald.github.io/xin-test/dist/blueprint.js',
    })
  )
)
```

## `TosiBlueprint`

    export interface TosiFactory {
      Color: typeof Color
      Component: typeof Component
      elements: typeof elements
      svgElements: typeof svgElements
      mathML: typeof mathML
      vars: typeof vars
      varDefault: typeof varDefault
      xin: typeof xin
      boxed: typeof boxed
      xinProxy: typeof xinProxy
      boxedProxy: typeof boxedProxy // deprecated
      tosi: typeof tosi
      makeComponent: typeof makeComponent
      bind: typeof bind
      on: typeof on
      version: string
    }

    export interface TosiPackagedComponent {
      type: typeof Component
      creator: ElementCreator
    }

    export type TosiBlueprint = (
      tag: string,
      module: TosiFactory
    ) => TosiPackagedComponent

`TosiBlueprint` lets you provide a component "blueprint", in the form of a function,
that can be loaded and turned into an actual component. The beauty of this is that
unlike an actual component, the blueprint has no special dependencies.

So instead of defining a component like this:

    import { Component, elements, vars, varDefault } from 'tosijs'

    const { h2, slot } = elements

    export class MyThing extends Component {
      static preferredTagName = 'my-thing'
      static shadowStyleSpec = {
        ':host': {
          color: varDefault.textColor('#222'),
          background: vars.bgColor,
        },
      }
      static lightStyleSpec = {
        _bgColor: '#f00'
      }

      content = () => [
        h2('my thing'),
        slot()
      ]
    }

    export const myThing = MyThing.elementCreator()

You can define a "blueprint" like this:

    import { TosiBlueprint } from 'tosijs'

    const blueprint: TosiBlueprint = (
      tag,
      { Component, elements, vars, varDefault }
    ) => {
      const {h2, slot} = elements

      class MyThing extends Component {
        static shadowStyleSpec = {
          ':host': {
            color: varDefault.textColor('#222'),
            background: vars.bgColor,
          },
        }

        content = () => [
          h2('my thing'),
          slot()
        ]
      }

      return {
        type: MyThing,
        lightStyleSpec: {
          _bgColor: '#f00'
        }
      }
    }

The blueprint function can be `async`, so you can use async import inside it to pull in dependencies.

> **Note** that in this example the blueprint is a *pure* function (i.e. it has no side-effects).
> If this blueprint is consumed twice, each will be completely independent. A non-pure blueprint
> could be implemented such that the different versions of the blueprint share information.
> E.g. you could maintain a list of all the instances of any version of the blueprint.
