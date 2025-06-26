/*#
# 4.2 makeComponent

`makeComponent(tag: string, bluePrint: XinBlueprint<T>): Promise<XinComponentSpec<T>>`
hydrates [blueprints](/?blueprint-loader.ts) into usable [web-component](./?component.ts)s.

Here are the relevant interfaces:

```
export interface PartsMap<T = Element> {
  [key: string]: T
}

export type XinBlueprint<T = PartsMap> = (
  tag: string,
  module: XinFactory
) => XinComponentSpec<T> | Promise<XinComponentSpec<T>>

export interface XinComponentSpec<T = PartsMap> {
  type: Component<T>
  styleSpec?: XinStyleSheet
}
```

Note that a crucial benefit of blueprints is that the **consumer** of the blueprint gets
to choose the `tagName` of the custom-element. (Of course with react you can choose
the virtualDOM representation, but this often doesn't give you much of a clue where
the corresponding code is by looking at the DOM or even the React component panel.
*/

import { Color } from './color'
import { Component } from './component'
import { vars, varDefault } from './css'
import { XinStyleSheet } from './css-types'
import { bind, on } from './bind'
import { elements, svgElements, mathML } from './elements'
import { ElementCreator, PartsMap } from './xin-types'
import { version } from './version'
import { xin, boxed } from './xin'
import { xinProxy, boxedProxy } from './xin-proxy'

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

export interface XinComponentSpec<T = PartsMap> {
  type: Component<T>
  styleSpec?: XinStyleSheet
}

export interface XinPackagedComponent<T = PartsMap> {
  type: Component<T>
  creator: ElementCreator
}

export const madeComponents: { [key: string]: XinPackagedComponent<any> } = {}

export type XinBlueprint<T = PartsMap> = (
  tag: string,
  module: XinFactory
) => XinComponentSpec<T> | Promise<XinComponentSpec<T>>

export async function makeComponent<T = PartsMap>(
  tag: string,
  blueprint: XinBlueprint<T>
): Promise<XinPackagedComponent<T>> {
  const { type, styleSpec } = (await blueprint(tag, {
    Color,
    Component,
    elements,
    svgElements,
    mathML,
    varDefault,
    vars,
    xin,
    boxed,
    xinProxy,
    boxedProxy,
    makeComponent,
    bind,
    on,
    version,
  })) as XinComponentSpec<T>
  const packagedComponent = {
    type,
    creator: type.elementCreator({ tag, styleSpec }),
  }

  madeComponents[tag] = packagedComponent
  return packagedComponent
}
