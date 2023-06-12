import { bind, on } from './bind'
import { bindings } from './bindings'
import { ElementPart, ElementProps, ElementCreator, SwissArmyElement } from './xin-types'
import { camelToKabob } from './string-case'

export interface ElementsProxy {
  a: ElementCreator<HTMLAnchorElement>
  abbr: ElementCreator
  acronym: ElementCreator
  address: ElementCreator
  area: ElementCreator<HTMLAreaElement>
  article: ElementCreator
  aside: ElementCreator
  audio: ElementCreator<HTMLAudioElement>
  b: ElementCreator
  base: ElementCreator<HTMLBaseElement>
  basefont: ElementCreator
  bdi: ElementCreator
  bdo: ElementCreator
  big: ElementCreator
  blockquote: ElementCreator<HTMLQuoteElement>
  body: ElementCreator<HTMLBodyElement>
  br: ElementCreator<HTMLBRElement>
  button: ElementCreator<HTMLButtonElement>
  canvas: ElementCreator<HTMLCanvasElement>
  caption: ElementCreator
  center: ElementCreator
  cite: ElementCreator
  code: ElementCreator
  col: ElementCreator<HTMLTableColElement>
  colgroup: ElementCreator<HTMLTableColElement>
  data: ElementCreator<HTMLDataElement>
  datalist: ElementCreator<HTMLDataListElement>
  dd: ElementCreator
  del: ElementCreator
  details: ElementCreator<HTMLDetailsElement>
  dfn: ElementCreator
  dialog: ElementCreator<HTMLDialogElement>
  div: ElementCreator<HTMLDivElement>
  dl: ElementCreator
  dt: ElementCreator
  em: ElementCreator
  embed: ElementCreator<HTMLEmbedElement>
  fieldset: ElementCreator<HTMLFieldSetElement>
  figcaption: ElementCreator
  figure: ElementCreator
  font: ElementCreator
  footer: ElementCreator
  form: ElementCreator<HTMLFormElement>
  frame: ElementCreator
  frameset: ElementCreator
  head: ElementCreator<HTMLHeadElement>
  header: ElementCreator
  hgroup: ElementCreator
  h1: ElementCreator<HTMLHeadingElement>
  h2: ElementCreator<HTMLHeadingElement>
  h3: ElementCreator<HTMLHeadingElement>
  h4: ElementCreator<HTMLHeadingElement>
  h5: ElementCreator<HTMLHeadingElement>
  h6: ElementCreator<HTMLHeadingElement>
  hr: ElementCreator<HTMLHRElement>
  html: ElementCreator<HTMLHtmlElement>
  i: ElementCreator
  iframe: ElementCreator<HTMLIFrameElement>
  img: ElementCreator<HTMLImageElement>
  input: ElementCreator<HTMLInputElement>
  ins: ElementCreator<HTMLModElement>
  kbd: ElementCreator
  keygen: ElementCreator<HTMLUnknownElement>
  label: ElementCreator<HTMLLabelElement>
  legend: ElementCreator<HTMLLegendElement>
  li: ElementCreator<HTMLLIElement>
  link: ElementCreator<HTMLLinkElement>
  main: ElementCreator
  map: ElementCreator<HTMLMapElement>
  mark: ElementCreator
  menu: ElementCreator<HTMLMenuElement>
  menuitem: ElementCreator<HTMLUnknownElement>
  meta: ElementCreator<HTMLMetaElement>
  meter: ElementCreator<HTMLMeterElement>
  nav: ElementCreator
  noframes: ElementCreator
  noscript: ElementCreator
  object: ElementCreator<HTMLObjectElement>
  ol: ElementCreator<HTMLOListElement>
  optgroup: ElementCreator<HTMLOptGroupElement>
  option: ElementCreator<HTMLOptionElement>
  output: ElementCreator<HTMLOutputElement>
  p: ElementCreator<HTMLParagraphElement>
  param: ElementCreator
  picture: ElementCreator<HTMLPictureElement>
  pre: ElementCreator<HTMLPreElement>
  progress: ElementCreator<HTMLProgressElement>
  q: ElementCreator<HTMLQuoteElement>
  rp: ElementCreator
  rt: ElementCreator
  ruby: ElementCreator
  s: ElementCreator
  samp: ElementCreator
  script: ElementCreator<HTMLScriptElement>
  section: ElementCreator
  select: ElementCreator<HTMLSelectElement>
  slot: ElementCreator<HTMLSlotElement>
  small: ElementCreator
  source: ElementCreator<HTMLSourceElement>
  span: ElementCreator<HTMLSpanElement>
  strike: ElementCreator
  strong: ElementCreator
  style: ElementCreator<HTMLStyleElement>
  sub: ElementCreator
  summary: ElementCreator
  svg: ElementCreator<SVGElement>
  table: ElementCreator<HTMLTableElement>
  tbody: ElementCreator<HTMLTableSectionElement>
  td: ElementCreator<HTMLTableCellElement>
  template: ElementCreator<HTMLTemplateElement>
  textarea: ElementCreator<HTMLTextAreaElement>
  tfoot: ElementCreator<HTMLTableSectionElement>
  th: ElementCreator<HTMLTableCellElement>
  thead: ElementCreator<HTMLTableSectionElement>
  time: ElementCreator<HTMLTimeElement>
  title: ElementCreator<HTMLTitleElement>
  tr: ElementCreator<HTMLTableRowElement>
  track: ElementCreator<HTMLTrackElement>
  tt: ElementCreator
  u: ElementCreator
  ul: ElementCreator<HTMLUListElement>
  var: ElementCreator
  video: ElementCreator<HTMLVideoElement>
  wbr: ElementCreator
  [key: string | symbol]: ElementCreator<any>
}

const templates: { [key: string]: HTMLElement } = {}

/**
 * makeComponent takes an elementCreator along with its arguments and produces
 * a "curried" version of that element creator. This is a way of creating
 * reusable, composable, pure functional components with no shadowDOM.
 */
export function makeComponent<T extends HTMLElement> (rootElementCreator: ElementCreator<T>, ...componentParts: ElementPart[]): ElementCreator<T> {
  return (...args: ElementPart[]) => rootElementCreator(...args, ...componentParts.map(part => {
    if (part instanceof Element || part instanceof DocumentFragment) {
      return part.cloneNode(true)
    } else {
      return part
    }
  }))
}

const create = (tagType: string, ...contents: ElementPart[]): SwissArmyElement => {
  if (templates[tagType] === undefined) {
    templates[tagType] = globalThis.document.createElement(tagType)
  }
  const elt = templates[tagType].cloneNode() as SwissArmyElement
  const elementProps: ElementProps = {}
  for (const item of contents) {
    if (item instanceof Element || item instanceof DocumentFragment || typeof item === 'string' || typeof item === 'number') {
      if (elt instanceof HTMLTemplateElement) {
        elt.content.append(item as Node)
      } else {
        elt.append(item as Node)
      }
    } else {
      Object.assign(elementProps, item)
    }
  }
  for (const key of Object.keys(elementProps)) {
    const value: any = elementProps[key]
    if (key === 'apply') {
      value(elt)
    } else if (key === 'style') {
      if (typeof value === 'object') {
        for (const prop of Object.keys(value)) {
          if (prop.startsWith('--')) {
            elt.style.setProperty(prop, value[prop])
          } else {
            // @ts-expect-error
            elt.style[prop] = value[prop]
          }
        }
      } else {
        elt.setAttribute('style', value)
      }
    } else if (key.match(/^on[A-Z]/) != null) {
      const eventType = key.substring(2).toLowerCase()
      on(elt, eventType, value)
    } else if (key.match(/^bind[A-Z]/) != null) {
      const bindingType = key.substring(4, 5).toLowerCase() + key.substring(5)
      const binding = bindings[bindingType]
      if (binding !== undefined) {
        bind(elt, value, binding)
      } else {
        throw new Error(`${key} is not allowed, bindings.${bindingType} is not defined`)
      }
    } else {
      const attr = camelToKabob(key)

      if (attr === 'class') {
        value.split(' ').forEach((className: string) => {
          elt.classList.add(className)
        })
      // @ts-expect-error-error
      } else if (elt[attr] !== undefined) {
        // @ts-expect-error-error
        elt[attr] = value
      } else if (typeof value === 'boolean') {
        value ? elt.setAttribute(attr, '') : elt.removeAttribute(attr)
      } else {
        elt.setAttribute(attr, value)
      }
    }
  }
  return elt
}

const fragment: ElementCreator<DocumentFragment> = (...contents: ElementPart[]) => {
  const frag = globalThis.document.createDocumentFragment()
  for (const item of contents) {
    frag.append(item as Node)
  }
  return frag
}

/**
 * elements is a proxy that produces ElementCreators, e.g.
 * elements.div() creates <div> elements and
 * elements.myElement() creatres <my-element> elements.
 */
export const elements = new Proxy({ fragment }, {
  get (target, tagName: string) {
    tagName = tagName.replace(/[A-Z]/g, c => `-${c.toLocaleLowerCase()}`)
    if (tagName.match(/^\w+(-\w+)*$/) == null) {
      throw new Error(`${tagName} does not appear to be a valid element tagName`)
      // @ts-expect-error
    } else if (target[tagName] === undefined) {
      // @ts-expect-error
      target[tagName] = (...contents: ElementPart[]) => create(tagName, ...contents)
    }
    // @ts-expect-error
    return target[tagName]
  },
  set () {
    throw new Error('You may not add new properties to elements')
  }
}) as unknown as ElementsProxy
