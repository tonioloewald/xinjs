import { Color } from './color'
import { Component } from './component'
import { vars, varDefault } from './css'
import { XinStyleSheet } from './css-types'
import { elements, svgElements, mathML } from './elements'
import { ElementCreator } from './xin-types'
import { version } from './version'
import { xinProxy, boxedProxy } from './xin-proxy'

export interface XinFactory {
  Color: typeof Color
  Component: typeof Component
  elements: typeof elements
  svgElements: typeof svgElements
  mathML: typeof mathML
  vars: typeof vars
  varDefault: typeof varDefault
  xinProxy: typeof xinProxy
  boxedProxy: typeof boxedProxy
  version: string
}

export interface XinComponentSpec {
  type: typeof Component
  styleSpec?: XinStyleSheet
}

export interface XinPackagedComponent {
  type: typeof Component
  creator: ElementCreator
}

export const madeComponents: { [key: string]: XinPackagedComponent } = {}

export type XinBlueprint = (tag: string, module: XinFactory) => XinComponentSpec

export function makeComponent(
  tag: string,
  blueprint: XinBlueprint
): XinPackagedComponent {
  const { type, styleSpec } = blueprint(tag, {
    Color,
    Component,
    elements,
    svgElements,
    mathML,
    varDefault,
    vars,
    xinProxy,
    boxedProxy,
    version,
  })
  const packagedComponent = {
    type,
    creator: type.elementCreator({ tag, styleSpec }),
  }

  madeComponents[tag] = packagedComponent
  return packagedComponent
}
