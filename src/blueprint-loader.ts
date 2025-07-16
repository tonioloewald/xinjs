/*#
# 4.1 blueprints

One issue with standard web-components built with xinjs is that building them
"sucks in" the version of `xinjs` you're working with. This isn't a huge problem
with monolithic code-bases, but it does prevent components from being loaded
"on-the-fly" from CDNs and composed on the spot and it does make it hard to
"tree shake" component libraries.

```js
const { elements, blueprintLoader, blueprint } = tosijs

preview.append(
  blueprintLoader(
    blueprint({
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

To address these issues, `xinjs` provides a `<xin-loader>` loader component and
a function `makeComponent` that can define a component given a blueprint
function.

## `<xin-loader>`—the blueprint loader

`<xin-loader>` is a simple custom-element provided by `xinjs` for the dynamic loading
of component **blueprints**. It will load its `<xin-blueprint>`s in parallel.

```
<xin-loader>
  <xin-blueprint tag="swiss-clock" src="https://loewald.com/lib/swiss-clock"></xin-blueprint>
</xin-loader>
<swiss-clock>
  <code style="color: var(--brand-color)">xinjs</code> rules!
</swiss-clock>
```

### `<xin-blueprint>` Attributes

- `src` is the url of the `blueprint` javascript module (required)
- `tag` is the tagName you wish to use. This defaults to the name of the source file if suitable.
- `property` allows you to load a named exported property from a blueprint module
  (allowing one blueprint to export multiple blueprints). By default, it's `default`.
- `loaded` is the `XinPackagedComponent` after loading

#### `<xin-blueprint>` Properties

- `blueprintLoaded(package: XinPackagedComponent)` `<xin-blueprint>` when its blueprint is loaded.

#### `<xin-loader>` Properties

- `allLoaded()` is called when all the blueprints have loaded.

## `makeComponent(tag: string, blueprint: XinBlueprint): Promise<XinPackagedCompoent>`

`makeComponent` takes a `tag` of your choice and a `blueprint` and generates
the custom-element's `class` and `elementCreator` as its `type` and `creator`
properties.

So, instead of:

    import {myThing} from './path/to/my-thing'

    document.body.append(myThing())

You could write:

    import { makeComponent } from 'xinjs'
    import myThingBlueprint from './path/to/my-thing-blueprint'

    makeComponent('different-tag', myThingBlueprint).then((packaged) => {
      document.body.append(packaged.creator())
    })

This is a more complex example that loads two components and only generates
the test component once everything is ready:

```js
const { blueprintLoader, blueprint } = tosijs

let clockType = null

preview.append(
  blueprintLoader(
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
    blueprint({
      tag: 'swiss-clock',
      src: 'https://tonioloewald.github.io/xin-clock/dist/blueprint.js?1234',
      blueprintLoaded({type, creator}) {
        clockType = type
        preview.append(creator())
      },
    }),
    blueprint({
      tag: 'xin-test',
      src: 'https://tonioloewald.github.io/xin-test/dist/blueprint.js',
    })
  )
)
```

## `XinBlueprint`

    export interface XinFactory {
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
      boxedProxy: typeof boxedProxy
      makeComponent: typeof makeComponent
      bind: typeof bind
      on: typeof on
      version: string
    }

    export interface XinPackagedComponent {
      type: typeof Component
      creator: ElementCreator
    }

    export type XinBlueprint = (
      tag: string,
      module: XinFactory
    ) => XinPackagedComponent

`XinBlueprint` lets you provide a component "blueprint", in the form of a function,
that can be loaded and turned into an actual component. The beauty of this is that
unlike an actual component, the blueprint has no special dependencies.

So instead of defining a component like this:

    import { Component, elements, vars, varDefault } from 'xinjs'

    const { h2, slot } = elements

    export class MyThing extends Component {
      static styleSpec = {
        ':host': {
          color: varDefault.textColor('#222'),
          background: vars.bgColor,
        },

        content = () => [
          h2('my thing'),
          slot()
        ]
      }
    }

    export const myThing = myThing.elementCreator({
      tag: 'my-thing',
      styleSpec: {
        _bgColor: '#f00'
      }
    })

You can define a "blueprint" like this:

    import { XinBlueprint } from 'xinjs'

    const blueprint: XinBlueprint = (
      tag,
      { Component, elements, vars, varDefault }
    ) => {
      const {h2, slot} = elements

      class MyThing extends Component {
        static styleSpec = {
          ':host': {
            color: varDefault.textColor('#222'),
            background: vars.bgColor,
          },

          content = () => [
            h2('my thing'),
            slot()
          ]
        }
      }

      return {
        type: MyThing,
        styleSpec: {
          _bgColor: '#f00'
        }
      }
    }

The blueprint function can be `async`, so you can use async import inside it to pull in dependencies.

> **Note** that in this example the blueprint is a *pure* function (i.e. it has no side-effects).
> If this blueprint is consumed twice, each will be completely independent. A non-pure blueprint
> could be implemented such that the different versions of the blueprint share information.
> E.g. you could maintain a list of all the instances of any version of the blueprint.

*/

import { Component } from './component'
import {
  makeComponent,
  XinBlueprint,
  XinPackagedComponent,
} from './make-component'

const loadedBlueprints: { [key: string]: Promise<XinPackagedComponent> } = {}

// @ts-ignore TS1323
const loadModule = (src: string): Promise<any> => import(src)

export class Blueprint extends Component {
  tag = 'anon-elt'
  src = ''
  property = 'default'
  loaded?: XinPackagedComponent
  blueprintLoaded = (_package: XinPackagedComponent) => {}

  async packaged(): Promise<XinPackagedComponent> {
    const { tag, src, property } = this
    const signature = `${tag}.${property}:${src}`
    if (!this.loaded) {
      if (loadedBlueprints[signature] === undefined) {
        loadedBlueprints[signature] = loadModule(src).then((imported) => {
          const blueprint = imported[property] as XinBlueprint
          return makeComponent(tag, blueprint)
        })
      } else {
        console.log(`using cached ${tag}`)
      }
      this.loaded = await loadedBlueprints[signature]
      this.blueprintLoaded(this.loaded)
    }
    return this.loaded!
  }

  constructor() {
    super()

    this.initAttributes('tag', 'src', 'property')
  }
}

export const blueprint = Blueprint.elementCreator({
  tag: 'xin-blueprint',
  styleSpec: { ':host': { display: 'none' } },
})

export class BlueprintLoader extends Component {
  allLoaded = () => {}

  constructor() {
    super()
  }

  private async load() {
    const blueprintElements = (
      Array.from(
        this.querySelectorAll(Blueprint.tagName as string)
      ) as Blueprint[]
    ).filter((elt) => elt.src)
    const promises = blueprintElements.map((elt) => elt.packaged())
    await Promise.all(promises)
    this.allLoaded()
  }

  connectedCallback() {
    super.connectedCallback()

    this.load()
  }
}

export const blueprintLoader = BlueprintLoader.elementCreator({
  tag: 'xin-loader',
  styleSpec: { ':host': { display: 'none' } },
})
