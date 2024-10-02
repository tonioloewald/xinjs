# blueprints

One issue with standard web-components built with xinjs is that building them
"sucks in" the version of `xinjs` you're working with. This isn't a huge problem
with monolithic code-bases, but it does prevent components from being loaded
"on-the-fly" from CDNs and composed on the spot and it does make it hard to
"tree shake" component libraries.

Another issue is name-collision. What if two people create a `<tab-selector>` component
and you want to use both of them? Or you want to switch to a new and better one but
don't want to do it everywhere all at once?

With blueprints, the *consumer* of the component chooses the `tag`, reducing the
chance of name-collision. (You can consume the same blueprint multiple times,
giving each one its own tag.)

To address these issues, `xinjs` provides a `<xin-bp>` loader component and
a function `makeComponent` that can define a component given a blueprint
function.

## `<xin-bp>`—the blueprint loader

`<cin-bp>` is a simple custom-element provided by `xinjs` for the dynamic loading
of component **blueprints**.

```
<xin-bp
  blueprint="https://loewald.com/lib/swiss-clock"
>
  <code style="color: var(--brand-color)">xinjs</code> rules!
</xin-bp>
```

### Attributes

- `blueprint` is the url of the `blueprint` javascript module (required)
- `tag` is the tagName you wish to use. If the name of the blueprint is
  hyphenated, then that will be used by default
- `property` if the blueprint module exports the blueprint function as
  a property, you can specify the property here.

## `makeComponent(tag: string, blueprint: XinBlueprint): XinPackagedCompoent`

`makeComponent` takes a `tag` of your choice and a `blueprint` and generates
the custom-element's `class` and `elementCreator` as its `type` and `creator`
properties.

So, instead of:

    import {myThing} from './path/to/my-thing'

    document.body.append(myThing())

You could write:

    import { makeComponent } from 'xinjs'
    import myThingBlueprint from './path/to/my-thing-blueprint'

    const differentTag = makeComponent('different-tag', myThingBlueprint).creator

    document.body.append(differentTag())

## `XinBlueprint`

    export interface XinFactory {
      Color: typeof Color
      Component: typeof Component
      elements: typeof elements
      svgElements: typeof svgElements
      mathML: typeof mathML
      vars: typeof vars
      varDefault: typeof varDefault
      xinProxy: typeof xinProxy
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

> **Note** that in this example the blueprint is a *pure* function (i.e. it has no side-effects).
> If this blueprint is consumed twice, each will be completely independent. A non-pure blueprint
> could be implemented such that the different versions of the blueprint share information.
> E.g. you could maintain a list of all the instances of any version of the blueprint.
