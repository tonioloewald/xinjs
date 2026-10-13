/*{"parent": "component", "description": "Dynamically load tosijs components as zero-dependency blueprints from CDN URLs, letting consumers choose tag names and avoid name collisions."}*/
/*#
# Blueprints

One issue with standard web-components built with tosijs is that building them
"sucks in" the version of `tosijs` you're working with. This isn't a huge problem
with monolithic code-bases, but it does prevent components from being loaded
"on-the-fly" from CDNs and composed on the spot and it does make it hard to
"tree shake" component libraries.

```js
import { elements, tosiLoader, tosiBlueprint } from 'tosijs'

preview.append(
  tosiLoader(
    tosiBlueprint({
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

To address these issues, `tosijs` provides a `<tosi-loader>` loader component and
a function `makeComponent` that can define a component given a blueprint
function.

## `<tosi-loader>`—the blueprint loader

`<tosi-loader>` is a simple custom-element provided by `tosijs` for the dynamic loading
of component **blueprints**. It will load its `<tosi-blueprint>`s in parallel.

```
<tosi-loader>
  <tosi-blueprint tag="swiss-clock" src="https://loewald.com/lib/swiss-clock"></tosi-blueprint>
</tosi-loader>
<swiss-clock>
  <code style="color: var(--brand-color)">tosijs</code> rules!
</swiss-clock>
```

> The legacy names `<xin-blueprint>` and `<xin-loader>` were removed in 1.8.0 —
> use `<tosi-blueprint>` and `<tosi-loader>`.

### ⚠️ These tags execute code

`<tosi-blueprint src="…">` **runs the module it names**. That is the whole
feature — but it means the tag is an arbitrary-script-execution sink, and a
custom element can arrive through `innerHTML` like any other markup. So:

- **Strip `<tosi-blueprint>` and `<tosi-loader>` from any HTML you did not
  write.** A sanitizer that passes unknown custom elements through (a denylist
  sanitizer, or `DOMPurify` configured with `CUSTOM_ELEMENT_HANDLING`) will
  hand an injected `src` straight to `import()`. Allowlist sanitizers —
  DOMPurify and `sanitize-html` in their default configurations — already drop
  these tags.
- `javascript:`, `data:` and `vbscript:` URLs are **refused unconditionally**;
  no honest blueprint uses one.
- Everything else loads by default, because loading a blueprint from a CDN is
  the point. If your app doesn't need that, narrow it with
  `settings.blueprintSrcCheck` — return `false` and the load is refused with a
  `console.error` naming the URL:

```
import { settings } from 'tosijs'

settings.blueprintSrcCheck = (src, el) =>
  new URL(src, location.href).origin === location.origin
```

> The default may become same-origin in 2.0. Setting the hook now is
> forward-compatible either way.

### `<tosi-blueprint>` Attributes

- `src` is the url of the `blueprint` javascript module (required)
- `tag` is the tagName you wish to use. This defaults to the name of the source file if suitable.
- `property` allows you to load a named exported property from a blueprint module
  (allowing one blueprint to export multiple blueprints). By default, it's `default`.
- `loaded` is the `TosiPackagedComponent` after loading

#### `<tosi-blueprint>` Properties

- `blueprintLoaded(package: TosiPackagedComponent)` `<tosi-blueprint>` when its blueprint is loaded.

#### `<tosi-loader>` Properties

- `allLoaded()` is called when all the blueprints have loaded.

## `makeComponent(tag: string, blueprint: TosiBlueprint): Promise<TosiPackagedComponent>`

`makeComponent` is what hydrates a blueprint: `<tosi-blueprint>` and
`<tosi-loader>` call it for you, and you will rarely need to call it yourself.
It takes a `tag` of your choice and a `blueprint` and generates
the custom-element's `class` and `elementCreator` as its `type` and `creator`
properties. A crucial benefit of blueprints is that the **consumer** of the
blueprint gets to choose the `tagName` of the custom-element.

The relevant interfaces:

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


So, instead of:

    import {myThing} from './path/to/my-thing'

    document.body.append(myThing())

You could write:

    import { makeComponent } from 'tosijs'
    import myThingBlueprint from './path/to/my-thing-blueprint'

    makeComponent('different-tag', myThingBlueprint).then((packaged) => {
      document.body.append(packaged.creator())
    })

This is a more complex example that loads two components and only generates
the test component once everything is ready:

```js
import { tosiLoader, tosiBlueprint } from 'tosijs'

let clockType = null

preview.append(
  tosiLoader(
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
    tosiBlueprint({
      tag: 'swiss-clock',
      src: 'https://tonioloewald.github.io/xin-clock/dist/blueprint.js?1234',
      blueprintLoaded({type, creator}) {
        clockType = type
        preview.append(creator())
      },
    }),
    tosiBlueprint({
      tag: 'xin-test',
      src: 'https://tonioloewald.github.io/xin-test/dist/blueprint.js',
    })
  )
)
```

## `TosiBlueprint`

    export interface TosiFactory {
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
      boxedProxy: typeof boxedProxy // deprecated
      tosi: typeof tosi
      makeComponent: typeof makeComponent
      bind: typeof bind
      on: typeof on
      version: string
    }

    export interface TosiPackagedComponent {
      type: typeof Component
      creator: ElementCreator
    }

    export type TosiBlueprint = (
      tag: string,
      module: TosiFactory
    ) => TosiPackagedComponent

`TosiBlueprint` lets you provide a component "blueprint", in the form of a function,
that can be loaded and turned into an actual component. The beauty of this is that
unlike an actual component, the blueprint has no special dependencies.

So instead of defining a component like this:

    import { Component, elements, vars, varDefault } from 'tosijs'

    const { h2, slot } = elements

    export class MyThing extends Component {
      static preferredTagName = 'my-thing'
      static shadowStyleSpec = {
        ':host': {
          color: varDefault.textColor('#222'),
          background: vars.bgColor,
        },
      }
      static lightStyleSpec = {
        _bgColor: '#f00'
      }

      content = () => [
        h2('my thing'),
        slot()
      ]
    }

    export const myThing = MyThing.elementCreator()

You can define a "blueprint" like this:

    import { TosiBlueprint } from 'tosijs'

    const blueprint: TosiBlueprint = (
      tag,
      { Component, elements, vars, varDefault }
    ) => {
      const {h2, slot} = elements

      class MyThing extends Component {
        static shadowStyleSpec = {
          ':host': {
            color: varDefault.textColor('#222'),
            background: vars.bgColor,
          },
        }

        content = () => [
          h2('my thing'),
          slot()
        ]
      }

      return {
        type: MyThing,
        lightStyleSpec: {
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
import { warnDeprecated } from './metadata'
import { settings } from './settings'
import {
  makeComponent,
  TosiBlueprint,
  TosiPackagedComponent,
} from './make-component'

const HIDDEN_STYLE = { ':host': { display: 'none' } }

const loadedBlueprints: { [key: string]: Promise<TosiPackagedComponent> } = {}

let loadModule = (src: string): Promise<any> => import(src)

// A blueprint EXECUTES the module its `src` names, and <tosi-blueprint> can
// arrive through innerHTML — so HTML injection reaches this sink on any page
// that doesn't strip the tag. These schemes are refused unconditionally
// because none of them can be an honest module URL, so refusing them breaks
// nobody. Everything else is allowed by default: CDN-hosted blueprints are the
// documented use case, and `settings.blueprintSrcCheck` is how an app that
// doesn't want them says so. (2.0 candidate: flip the default to same-origin —
// tracked on the tosijs task board.)
const REFUSED_SCHEMES = ['javascript', 'data', 'vbscript']

// Browsers ignore ASCII whitespace and control characters inside a scheme, so
// `java\tscript:x` and `\n javascript:x` both execute — strip them before
// matching or the refusal is one tab away from being bypassed.
function schemeOf(src: string): string {
  // the control characters ARE the bypass, not an accident: a \s-only strip
  // still lets 'java\x00script:' through.
  // eslint-disable-next-line no-control-regex
  const stripped = src.replace(/[\u0000-\u0020]/g, '')
  const match = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(stripped)
  return match ? match[1].toLowerCase() : ''
}

/**
 * Why a blueprint `src` was refused, or `null` if it's allowed. Exported for
 * testing and for apps that want to pre-flight a URL through the same rules.
 */
export function blueprintSrcRefusal(src: string, el?: Element): string | null {
  const scheme = schemeOf(src)
  if (REFUSED_SCHEMES.includes(scheme)) {
    return `${scheme}: is never an honest blueprint module`
  }
  const check = settings.blueprintSrcCheck
  if (typeof check === 'function' && check(src, el as Element) === false) {
    return 'settings.blueprintSrcCheck returned false'
  }
  return null
}

/**
 * Replace the module loader (mainly for testing failure/retry paths — the
 * default uses dynamic `import()`, which tests cannot intercept).
 */
export function setModuleLoader(loader: (src: string) => Promise<any>): void {
  loadModule = loader
}

// Load every blueprint under `host` that has a src, in parallel. allSettled,
// not all: one blueprint that fails to load must not reject the batch and leave
// allLoaded() unfired (nor surface as an unhandled rejection — load() is called
// fire-and-forget). Failures are reported; completion still fires for the rest.
async function settleBlueprints(
  host: Element,
  selector: string,
  loaderTag: string
): Promise<void> {
  const blueprintElements = (
    Array.from(host.querySelectorAll(selector)) as Blueprint[]
  ).filter((elt) => elt.src)
  const results = await Promise.allSettled(
    blueprintElements.map((elt) => elt.packaged())
  )
  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    if (result.status === 'rejected') {
      console.error(
        `<${loaderTag}> failed to load blueprint from "${blueprintElements[i].src}":`,
        result.reason
      )
    }
  }
}

// --- Canonical classes (tosi-*) ---

export class Blueprint extends Component {
  static preferredTagName = 'tosi-blueprint'
  static lightStyleSpec = HIDDEN_STYLE
  static initAttributes = { tag: 'anon-elt', src: '', property: 'default' }
  /*
   * WHAT `initAttributes` INSTALLS (tosijs#36). Those keys become instance
   * properties at hydration, which no static can tell the type system about.
   *
   * Consumers get this in ONE line via the exported `ComponentAttrs<T>`:
   *
   *     export interface Blueprint
   *       extends ComponentAttrs<typeof Blueprint.initAttributes> {}
   *
   * tosijs itself CANNOT use its own recommendation here: every file in `src/`
   * goes through `tjs convert` for the debug/safe bundles, and that rejects
   * class/interface declaration merging ("Identifier 'Blueprint' has already
   * been declared"). So the library writes the members out by hand and the
   * docs recommend the one-liner. Filed upstream; when tjs-lang supports
   * merging, this becomes one line too.
   */
  declare tag: string
  declare src: string
  declare property: string
  loaded?: TosiPackagedComponent
  blueprintLoaded = (_pkg: TosiPackagedComponent) => {}

  async packaged(): Promise<TosiPackagedComponent> {
    const { tag, src, property } = this
    const signature = `${tag}.${property}:${src}`
    if (!this.loaded) {
      // checked BEFORE the cache is consulted or written, so a refused src
      // never occupies a signature slot
      const refusal = blueprintSrcRefusal(src, this)
      if (refusal !== null) {
        const why =
          `<tosi-blueprint> refused "${src}" — ${refusal}. These tags EXECUTE ` +
          `the module they name: strip them from user-supplied HTML, or set ` +
          `settings.blueprintSrcCheck to allow this source.`
        console.error(why)
        throw new Error(why)
      }
      if (loadedBlueprints[signature] === undefined) {
        loadedBlueprints[signature] = loadModule(src).then((imported) => {
          const bp = imported[property] as TosiBlueprint
          return makeComponent(tag, bp)
        })
      } else {
        if (settings.debug) {
          console.log(`using cached ${tag} with signature ${signature}`)
        }
      }
      try {
        this.loaded = await loadedBlueprints[signature]
      } catch (e) {
        // Do NOT leave a rejected promise in the cache: it would make every
        // future <tosi-blueprint> with this signature fail instantly with no
        // retry. Evict so a later attempt can re-import (the src may have
        // 404'd transiently, or been fixed).
        delete loadedBlueprints[signature]
        throw e
      }
      this.blueprintLoaded(this.loaded)
    }
    return this.loaded!
  }
}

export const tosiBlueprint = Blueprint.elementCreator()

export class BlueprintLoader extends Component {
  static preferredTagName = 'tosi-loader'
  static lightStyleSpec = HIDDEN_STYLE
  allLoaded = () => {}

  private async load() {
    await settleBlueprints(this, 'tosi-blueprint', 'tosi-loader')
    this.allLoaded()
  }

  connectedCallback() {
    super.connectedCallback()
    this.load()
  }
}

export const tosiLoader = BlueprintLoader.elementCreator()

// The xin-* markup names were deprecated through 1.7 and their CREATORS
// (`blueprint`, `blueprintLoader`) are gone from the public API in 1.8.0 —
// those break loudly at import, which is the point.
//
// The MARKUP path cannot break loudly by itself: an unregistered custom
// element is simply inert — no hydration, no console output, no exception —
// and a page using `<xin-blueprint src=…>` has no import statement to fail.
// The 1.8.0 pre-release review found exactly that silent path. So the tags
// stay registered for one more cycle as TOMBSTONES: they render nothing and
// say precisely what to rename, once per tag. They go for real in 2.0.
class TombstoneElement extends Component {
  static lightStyleSpec = HIDDEN_STYLE
  content = null

  connectedCallback(): void {
    super.connectedCallback()
    const tag = this.tagName.toLowerCase()
    const replacement = tag.replace('xin-', 'tosi-')
    warnDeprecated(
      tag,
      `<${tag}> was removed in tosijs 1.8.0 and does NOTHING — this element ` +
        `will not hydrate. Rename it to <${replacement}> (same attributes, ` +
        `same behaviour). Deprecated since 1.7; the tag is registered only ` +
        `so this message can exist, and goes away in 2.0.`
    )
  }
}

class RemovedBlueprint extends TombstoneElement {
  static preferredTagName = 'xin-blueprint'
}
RemovedBlueprint.elementCreator()

class RemovedLoader extends TombstoneElement {
  static preferredTagName = 'xin-loader'
}
RemovedLoader.elementCreator()

/**
 * @deprecated Use `tosiBlueprint()`. 1.7's warning never named a removal
 * version, so this stays through 1.x; it now creates a `<tosi-blueprint>`,
 * which is the element that actually hydrates. Removed in 2.0.
 */
export const blueprint: typeof tosiBlueprint = (...args) => {
  warnDeprecated(
    'blueprint',
    'blueprint() is deprecated and will be REMOVED IN 2.0 — use ' +
      'tosiBlueprint(). It now creates a <tosi-blueprint>, the element that ' +
      'hydrates; <xin-blueprint> is an inert tombstone.'
  )
  return tosiBlueprint(...args)
}

/**
 * @deprecated Use `tosiLoader()`. Same reasoning as `blueprint` above.
 */
export const blueprintLoader: typeof tosiLoader = (...args) => {
  warnDeprecated(
    'blueprintLoader',
    'blueprintLoader() is deprecated and will be REMOVED IN 2.0 — use ' +
      'tosiLoader(). It now creates a <tosi-loader>.'
  )
  return tosiLoader(...args)
}
