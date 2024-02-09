/*
  Note that re-exported types should be explicitly and separately exported
  as types because of issues with parceljs

  The error messages will be very perplexing

  https://github.com/parcel-bundler/parcel/issues/4796
  https://github.com/parcel-bundler/parcel/issues/4240
  https://devblogs.microsoft.com/typescript/announcing-typescript-3-8/#type-only-imports-exports
*/

export { bind, on } from './bind'
export { bindings } from './bindings'
export {
  css,
  invertLuminance,
  darkMode,
  initVars,
  vars,
  varDefault,
  StyleSheet,
} from './css'
export type { XinStyleSheet, XinStyleMap, XinStyleRule } from './css-types'
export { Color } from './color'
export { Component } from './component'
export { elements, svgElements, mathML } from './elements'
export type { ElementsProxy } from './elements'
export { hotReload } from './hot-reload'
export { getListItem, xinPath, xinValue } from './metadata'
export { makeComponent, importComponent } from './make-component'
export type {
  XinBlueprint,
  XinFactory,
  XinPackagedComponent,
} from './make-component'
export { MoreMath } from './more-math'
export { settings } from './settings'
export * from './test-component'
export { throttle, debounce } from './throttle'
export {
  xin,
  observe,
  unobserve,
  touch,
  observerShouldBeRemoved,
  updates,
} from './xin'
export * from './xin-types'
export { xinProxy } from './xin-proxy'
