import { Color } from './color'
import { Component } from './component'
import { vars, varDefault } from './css'
import { XinStyleSheet } from './css-types'
import { elements } from './elements'
import { ElementCreator } from './xin-types'
// import { xinProxy } from './xin-proxy'

export interface XinFactory {
  Component: typeof Component
  elements: typeof elements
  vars: typeof vars
  // xinProxy: typeof xinProxy
  varDefault: typeof varDefault
  Color: typeof Color
}

export interface XinComponentSpec {
  type: typeof Component
  styleSpec?: XinStyleSheet
}

export interface XinPackagedComponent {
  type: typeof Component
  creator: ElementCreator
}

export type XinBlueprint = (tag: string, module: XinFactory) => XinComponentSpec

export function makeComponent(
  tag: string,
  blueprint: XinBlueprint
): XinPackagedComponent {
  const { type, styleSpec } = blueprint(tag, {
    Color,
    Component,
    elements,
    varDefault,
    vars /*, xinProxy */,
  })
  return {
    type,
    creator: type.elementCreator({ tag, styleSpec }),
  }
}

export async function importComponent(
  tag: string,
  url: string
): Promise<XinPackagedComponent> {
  const blueprint = (await import(url)).default
  return blueprint(tag, { Component, elements, vars, varDefault, Color })
}
