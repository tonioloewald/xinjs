/*{"parent": "component", "title": "Make Component", "description": "makeComponent() hydrates a blueprint function into a usable tosijs web-component class plus its elementCreator."}*/
/*#
# Make Component (makeComponent)

`makeComponent(tag: string, bluePrint: TosiBlueprint<T>): Promise<TosiComponentSpec<T>>`
hydrates [blueprints](/blueprint-loader/) into usable [web-components](/component/).

Here are the relevant interfaces:

```
export interface PartsMap<T = Element> {
  [key: string]: T
}

export type TosiBlueprint<T = PartsMap> = (
  tag: string,
  module: TosiFactory
) => TosiComponentSpec<T> | Promise<TosiComponentSpec<T>>

export interface TosiComponentSpec<T = PartsMap> {
  type: Component<T>
  lightStyleSpec?: TosiStyleSheet
  styleSpec?: TosiStyleSheet // deprecated, use lightStyleSpec
}
```

Note that a crucial benefit of blueprints is that the **consumer** of the blueprint gets
to choose the `tagName` of the custom-element.
*/

import { Color } from './color'
import { ownContract } from './contract-check'
import { Component, withAttributes } from './component'
import { vars, varDefault } from './css'
import { TosiStyleSheet } from './css-types'
import { bind, on } from './bind'
import { elements, svgElements, mathML } from './elements'
import { ElementCreator, PartsMap } from './xin-types'
import { version } from './version'
import { xin, boxed } from './xin'
import { xinProxy, tosi, boxedProxy } from './xin-proxy'

export interface TosiFactory {
  Color: typeof Color
  Component: typeof Component
  /** build a base class whose attributes are typed from a concrete object —
   * blueprints get everything through this factory, so it has to be here or
   * a blueprint cannot use the form the docs recommend */
  withAttributes: typeof withAttributes
  elements: typeof elements
  svgElements: typeof svgElements
  mathML: typeof mathML
  vars: typeof vars
  varDefault: typeof varDefault
  xin: typeof xin
  boxed: typeof boxed
  xinProxy: typeof xinProxy
  boxedProxy: typeof boxedProxy
  tosi: typeof tosi
  makeComponent: typeof makeComponent
  bind: typeof bind
  on: typeof on
  version: string
}

/**
 * The CLASS a blueprint returns — not an instance of it.
 *
 * `TosiComponentSpec.type` and `TosiPackagedComponent.type` were both declared
 * `Component<T>` — the INSTANCE type — while every producer assigns a
 * constructor. The mis-typing was invisible because `Component` carried
 * `[key: string]: any`, which makes *any* object structurally assignable to
 * it, so these fields accepted anything at all (tosijs#36). The same
 * class/instance confusion appeared at two more sites in `component.ts`.
 */
export type ComponentClass<T = PartsMap> = (new () => Component<T>) &
  Pick<typeof Component, 'elementCreator'> & {
    preferredTagName?: string
    contract?: import('./agent').ComponentMap
    lightStyleSpec?: TosiStyleSheet
    styleSpec?: TosiStyleSheet
  }

export interface TosiComponentSpec<T = PartsMap> {
  type: ComponentClass<T>
  lightStyleSpec?: TosiStyleSheet
  /** @deprecated Use lightStyleSpec instead */
  styleSpec?: TosiStyleSheet
  /**
   * The component's self-declaration (contract + description + parts map +
   * test fixture — see ComponentMap). Stamped as an OWN static on `type` at
   * hydration, so a blueprint-delivered component is a first-class citizen
   * of the agent surface: harvested by describe(), enforced by the value
   * setter, exercisable by exerciseComponent — blueprints are not left
   * behind by the contract work. A class's own `static contract` wins.
   */
  contract?: import('./agent').ComponentMap
}

export interface TosiPackagedComponent<T = PartsMap> {
  type: ComponentClass<T>
  creator: ElementCreator
}

export const madeComponents: { [key: string]: TosiPackagedComponent<any> } = {}

export type TosiBlueprint<T = PartsMap> = (
  tag: string,
  module: TosiFactory
) => TosiComponentSpec<T> | Promise<TosiComponentSpec<T>>

// --- Deprecated Xin* aliases (type-only; runtime is unaffected). Prefer the
// Tosi* names above. Kept exported so existing `import { XinBlueprint } from
// 'tosijs'` code keeps compiling. ---
/** @deprecated Use `TosiFactory` */
export type XinFactory = TosiFactory
/** @deprecated Use `TosiComponentSpec` */
export type XinComponentSpec<T = PartsMap> = TosiComponentSpec<T>
/** @deprecated Use `TosiPackagedComponent` */
export type XinPackagedComponent<T = PartsMap> = TosiPackagedComponent<T>
/** @deprecated Use `TosiBlueprint` */
export type XinBlueprint<T = PartsMap> = TosiBlueprint<T>

export async function makeComponent<T = PartsMap>(
  tag: string,
  blueprint: TosiBlueprint<T>
): Promise<TosiPackagedComponent<T>> {
  const spec = (await blueprint(tag, {
    Color,
    Component,
    withAttributes,
    elements,
    svgElements,
    mathML,
    varDefault,
    vars,
    xin,
    boxed,
    xinProxy,
    boxedProxy,
    tosi,
    makeComponent,
    bind,
    on,
    version,
  })) as TosiComponentSpec<T>
  const { type } = spec
  // Set static properties from blueprint spec before calling elementCreator
  ;(type as any).preferredTagName = tag
  // spec-level contract fills; a class's OWN static contract wins
  if (spec.contract != null && ownContract(type) === undefined) {
    ;(type as any).contract = spec.contract
  }
  const lightStyle = spec.lightStyleSpec ?? spec.styleSpec
  if (lightStyle) {
    ;(type as any).lightStyleSpec = lightStyle
  }
  const packagedComponent = {
    type,
    creator: type.elementCreator(),
  }

  madeComponents[tag] = packagedComponent
  return packagedComponent
}
