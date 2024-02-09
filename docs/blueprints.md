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
chance of name-collision.

To address these issues, `xinjs` provides two new functions and some important new
`interface` and `type` declarations to make them work together.

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

This seems like more work. Why bother?

First of all, note that the *consumer* of the blueprint decides what tag to assign it.

Next…

## `importComponent(tag: string, url: string): Promise<XinPackagedComponent>`

> **Warning** experimental!

`importComponent` is the async version of `makeComponent` that loads the blueprint
asynchronously from whereever and then returns the XinPackagedComponent.

This is why all this is worth the effort.

## `XinBlueprint`

    export interface XinFactory {
      Component: typeof Component
      elements: typeof elements
      vars: typeof vars
      // xinProxy: typeof xinProxy
      varDefault: typeof varDefault
      Color: typeof Color
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

Again, this is more code. Why bother?

Well, the distributed code is much smaller and you don't need to worry about
ending up with multiple versions of `xinjs` being baked into a single project.
Components can be freely mixed and loaded on-the-fly.