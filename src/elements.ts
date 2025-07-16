/*#
# 3. elements

`xinjs` provides `elements` for easily and efficiently generating DOM elements
without using `innerHTML` or other unsafe methods.

```js
const { elements } =  xinjs

const { div, input, label, span } = elements

preview.append(
  div(
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        padding: 10,
        gap: 10
      }
    },
    label(
      {
        style: {
          display: 'inline-flex'
        }
      },
      span('text'),
      input({value: 'hello world', placeholder: 'type something'})
    ),
    label(
      {
        style: {
          display: 'inline-flex'
        }
      },
      span('checkbox'),
      input({type: 'checkbox', checked: true})
    )
  )
)
```

## `ElementCreator` functions

`elements` is a proxy whose properties are element factory functions,
referred to throughout this documentation as `elementCreator`s, functions
of type `ElementCreator`. So `elements.div` is a function that returns a `<div>` 
element, `elements.foo` creates <foo> elements, and elements.fooBar creates
`<foo-bar>` elements.

The arguments of `elementCreator`s can be strings, numbers, other
elements, or property-maps, which are converted into attributes or properties
(or bindings).

E.g.

```js
const { elements, tosi } = tosijs

const { elementCreatorDemo } = tosi({
  elementCreatorDemo: {
    isChecked: true,
    someString: 'hello elementCreator',
    someColor: 'blue',
    clicks: 0
  }
})

const { div, button, label, input } = elements

preview.append(
  div('I am a div'),
  div(
    {
      style: { color: 'blue' }
    },
    elementCreatorDemo.someString
  ),
  label(
    'Edit someString',
    input({bindValue: elementCreatorDemo.someString})
  ),
  div(
    button(
      'Click me',
      {
        onClick() {
          elementCreatorDemo.clicks += 1
        }
      }
    ),
    div(elementCreatorDemo.clicks, ' clicks so far'),
  ),
  label(
    'isChecked?',
    input({type: 'checkbox', bindValue: elementCreatorDemo.isChecked})
  )
)
```

## camelCase conversion

Attributes in camelCase, e.g. `dataInfo`, will be converted to kebab-case,
so:

    span({dataInfo: 'foo'})        // produces <span data-info="foo"></span>

## style properties

`style` properties can be objects, and these are used to modify the
element's `style` object (while a string property will just change the
element's `style` attribute, eliminating previous changes).

    span({style: 'border: 1px solid red'}, {style: 'font-size: 15px'})

…produces `<span style="font-size: 15px"></span>`, which is probably
not what was wanted.

    span({style: {border: '1px solid red'}, {style: {fontSize: '15px'}}})

…produces `<span style="border: 1px solid red; fon-size: 15px></span>`
which is probably what was wanted.

## event handlers

Properties starting with `on` (followed by an uppercase letter)
will be converted into event-handlers, so `onMouseup` will be
turned into a `mouseup` listener.

## binding

You can [bind](/?bind.ts) an element to state using [bindings](/?bindings.ts)
using convenient properties, e.g.

    import { elements } from 'xinjs'
    const {div} = elements
    div({ bindValue: 'app.title' })

…is syntax sugar for:

    import { elements, bind, bindings } from 'xinjs'
    const { div } = elements
    bind( div(), 'app.title', bindings.value )

If you want to use your own bindings, you can use `apply`:

    const visibleBinding = {
      toDOM(element, value) {
        element.classList.toggle('hidden', !value)
      }
    }

    div({ apply(elt){
      bind(elt, 'app.prefs.isVisible', visibleBinding})
    } })

## event-handlers

You can attach event handlers to elements using `on<EventType>`
as syntax sugar, e.g.

    import { elements } from 'xinjs'
    const { button } = elements
    document.body.append(
      button('click me', {onClick() {
        alert('clicked!')
      }})
    )

…is syntax sugar for:

    import { elements, on } from 'xinjs'
    const { button } = elements
    const aButton = button('click me')
    on(aButton, 'click', () => {
      alert('clicked!')
    })
    document.body.append(
      aButton
    )

There are some subtle but important differences between `on()` and
`addEventListener` which are discussed in detail in the section on
[bind](/?bind.ts).

## apply

A property named `apply` is assumed to be a function that will be called
on the element.

    span({
      apply(element){ element.textContent = 'foobar'}
    })

…produces `<span>foobar</span>`.

## fragment

`elements.fragment` is produces `DocumentFragment`s, but is otherwise
just like other element factory functions.

## svgElements

`svgElements` is a proxy just like `elements` but it produces **SVG** elements in
the appropriate namespace.

## mathML

`mathML` is a proxy just like `elements` but it products **MathML** elements in
the appropriate namespace.

> ### Caution
>
> Both `svgElements` and `mathML` are experimental and do not have anything like  the
> degree of testing behind them as `elements`. In particular, the properties of
> SVG elements (and possible MathML elements) are quite different from ordinary
> elements, so the underlying `ElementCreator` will never try to set properties
> directly and will always use `setAttribute(...)`.
>
> E.g. `svgElements.svg({viewBox: '0 0 100 100'})` will call `setAttribute()` and
> not set the property directly, because the `viewBox` property is… weird, but
> setting the attribute works.
>
> Again, use with caution!
*/

import { bind, on } from './bind'
import { bindings } from './bindings'
import {
  ElementPart,
  ElementProps,
  ElementCreator,
  StringMap,
  XinBinding,
  EventType,
} from './xin-types'
import { camelToKabob } from './string-case'
import { processProp } from './css'
import { xinPath } from './metadata'

const MATH = 'http://www.w3.org/1998/Math/MathML'
const SVG = 'http://www.w3.org/2000/svg'
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

const templates: { [key: string]: Element } = {}

const elementStyle = (elt: HTMLElement, prop: string, value: any) => {
  const processed = processProp(camelToKabob(prop), value)
  if (processed.prop.startsWith('--')) {
    elt.style.setProperty(processed.prop, processed.value)
  } else {
    ;(elt.style as unknown as { [key: string]: string })[prop] = processed.value
  }
}

const elementStyleBinding = (prop: string): XinBinding => {
  return {
    toDOM(element, value) {
      elementStyle(element as HTMLElement, prop, value)
    },
  }
}

const elementProp = (elt: HTMLElement, key: string, value: any) => {
  if (key === 'style') {
    if (typeof value === 'object') {
      for (const prop of Object.keys(value)) {
        if (xinPath(value[prop])) {
          bind(elt, value[prop], elementStyleBinding(prop))
        } else {
          elementStyle(elt, prop, value[prop])
        }
      }
    } else {
      elt.setAttribute('style', value)
    }
  } else if ((elt as { [key: string]: any })[key] !== undefined) {
    // MathML is only supported on 91% of browsers, and not on the Raspberry Pi Chromium
    const { MathMLElement } = globalThis
    if (
      elt instanceof SVGElement ||
      (MathMLElement !== undefined && elt instanceof MathMLElement)
    ) {
      elt.setAttribute(key, value)
    } else {
      ;(elt as { [key: string]: any })[key] = value
    }
  } else {
    const attr = camelToKabob(key)

    if (attr === 'class') {
      value.split(' ').forEach((className: string) => {
        elt.classList.add(className)
      })
    } else if ((elt as { [key: string]: any })[attr] !== undefined) {
      ;(elt as StringMap)[attr] = value
    } else if (typeof value === 'boolean') {
      value ? elt.setAttribute(attr, '') : elt.removeAttribute(attr)
    } else {
      elt.setAttribute(attr, value)
    }
  }
}

const elementPropBinding = (key: string): XinBinding => {
  return {
    toDOM(element, value) {
      elementProp(element as HTMLElement, key, value)
    },
  }
}

const elementSet = (elt: HTMLElement, key: string, value: any) => {
  if (key === 'apply') {
    value(elt)
  } else if (key.match(/^on[A-Z]/) != null) {
    const eventType = key.substring(2).toLowerCase()
    on(elt, eventType as EventType, value)
  } else if (key === 'bind') {
    const binding =
      typeof value.binding === 'string'
        ? bindings[value.binding]
        : value.binding
    if (binding !== undefined && value.value !== undefined) {
      bind(
        elt,
        value.value,
        value.binding instanceof Function
          ? { toDOM: value.binding }
          : value.binding
      )
    } else {
      throw new Error(`bad binding`)
    }
  } else if (key.match(/^bind[A-Z]/) != null) {
    const bindingType = key.substring(4, 5).toLowerCase() + key.substring(5)
    const binding = bindings[bindingType]
    if (binding !== undefined) {
      bind(elt, value, binding)
    } else {
      throw new Error(
        `${key} is not allowed, bindings.${bindingType} is not defined`
      )
    }
  } else if (xinPath(value)) {
    bind(elt, value, elementPropBinding(key))
  } else {
    elementProp(elt, key, value)
  }
}

const create = (tagType: string, ...contents: ElementPart[]): HTMLElement => {
  if (templates[tagType] === undefined) {
    const [tag, namespace] = tagType.split('|')
    if (namespace === undefined) {
      templates[tagType] = globalThis.document.createElement(tag)
    } else {
      templates[tagType] = globalThis.document.createElementNS(namespace, tag)
    }
  }
  const elt = templates[tagType].cloneNode() as HTMLElement
  const elementProps: ElementProps = {}
  for (const item of contents) {
    if (
      item instanceof Element ||
      item instanceof DocumentFragment ||
      typeof item === 'string' ||
      typeof item === 'number'
    ) {
      if (elt instanceof HTMLTemplateElement) {
        elt.content.append(item as Node)
      } else {
        elt.append(item as Node)
      }
    } else if (item.xinPath) {
      elt.append(elements.span({ bindText: item }))
    } else {
      Object.assign(elementProps, item)
    }
  }
  for (const key of Object.keys(elementProps)) {
    const value: any = elementProps[key]
    elementSet(elt, key, value)
  }
  return elt
}

const fragment = (...contents: ElementPart[]): DocumentFragment => {
  const frag = globalThis.document.createDocumentFragment()
  for (const item of contents) {
    frag.append(item as Node)
  }
  return frag
}

/**
 * elements is a proxy that produces ElementCreators, e.g.
 * elements.div() creates <div> elements and
 * elements.myElement() creates <my-element> elements.
 */
export const elements = new Proxy(
  { fragment },
  {
    get(target, tagName: string) {
      tagName = tagName.replace(/[A-Z]/g, (c) => `-${c.toLocaleLowerCase()}`)
      if ((target as StringMap)[tagName] === undefined) {
        ;(target as StringMap)[tagName] = (...contents: ElementPart[]) =>
          create(tagName, ...contents)
      }
      return (target as StringMap)[tagName]
    },
    set() {
      throw new Error('You may not add new properties to elements')
    },
  }
) as unknown as ElementsProxy

interface SVGElementsProxy {
  [key: string]: ElementCreator<SVGElement>
}

export const svgElements = new Proxy(
  { fragment },
  {
    get(target, tagName: string) {
      if ((target as StringMap)[tagName] === undefined) {
        ;(target as StringMap)[tagName] = (...contents: ElementPart[]) =>
          create(`${tagName}|${SVG}`, ...contents)
      }
      return (target as StringMap)[tagName]
    },
    set() {
      throw new Error('You may not add new properties to elements')
    },
  }
) as unknown as SVGElementsProxy

interface MathMLElementsProxy {
  [key: string]: ElementCreator<MathMLElement>
}

export const mathML = new Proxy(
  { fragment },
  {
    get(target, tagName: string) {
      if ((target as StringMap)[tagName] === undefined) {
        ;(target as StringMap)[tagName] = (...contents: ElementPart[]) =>
          create(`${tagName}|${MATH}`, ...contents)
      }
      return (target as StringMap)[tagName]
    },
    set() {
      throw new Error('You may not add new properties to elements')
    },
  }
) as unknown as MathMLElementsProxy
