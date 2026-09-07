# tosijs

<!--{ "pin": "top", "order": 1, "description": "tosijs is a path-based state-management library for web apps. Small enough to read in an afternoon, with a DOM-free state layer. Proxy-based observers, no JSX, no virtual DOM, no build magic." }-->

[tosijs.net](https://tosijs.net) | [tosijs-ui](https://ui.tosijs.net) | [github](https://github.com/tonioloewald/tosijs) | [npm](https://www.npmjs.com/package/tosijs) | [cdn](https://www.jsdelivr.com/package/npm/tosijs) | [react-tosijs](https://react.tosijs.net) | [discord](https://discord.gg/ramJ9rgky5)

<!-- lazy: third-party badge servers must not block the page load event
     (badge.fury.io latency was intermittently timing out the browser-lane
     tests — and any visitor's load — via the rendered home page) -->

<a href="https://www.npmjs.com/package/tosijs"><img loading="lazy" alt="tosijs is on NPM" src="https://badge.fury.io/js/tosijs.svg"></a>
<a href="https://bundlejs.com/?q=tosijs&badge="><img loading="lazy" alt="tosijs bundle size" src="https://deno.bundlejs.com/?q=tosijs&badge="></a>
<a href="https://www.jsdelivr.com/package/npm/tosijs"><img loading="lazy" alt="tosijs on jsdelivr" src="https://data.jsdelivr.com/v1/package/npm/tosijs/badge"></a>

<div style="text-align: center; margin: 20px">
  <tosi-lottie style="display: inline-block; width: 280px; height: 280px; background: #da1167; border-radius: 40px" src="/tosi.json">
    <img style="width: 280px" alt="tosijs logo" src="https://tosijs.net/favicon.svg">
  </tosi-lottie>
</div>

## Entry points

| import                  | what you get                                                                                                             | gz                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| `tosijs`                | everything, agent surface included — bundlers shake what you don't import                                                | <!--gz:module.js-->~43 kB<!--/gz--> |
| `tosijs/agent`          | the agent surface, schematic renderer, audit and contract harnesses (**same file**, narrower types) — **EXPERIMENTAL**   | —                                   |
| `tosijs/core`           | no blueprint loader, no `share`/`sync`/`hotReload`, no agent surface                                                     | <!--gz:core.js-->~26 kB<!--/gz-->   |
| `tosijs/state`          | the **DOM-free** state layer: `tosi`, `xin`, `observe`, paths                                                            | <!--gz:state.js-->~16 kB<!--/gz-->  |
| `<script src=…>` (IIFE) | the library **without** the agent surface — a script tag cannot tree-shake, so it doesn't pay for what it didn't ask for | <!--gz:index.js-->~29 kB<!--/gz-->  |

`tosijs/agent` resolves to the same file as `tosijs` **on purpose**: a
separately-bundled agent surface would carry its own copy of the state
registry and describe an empty app. One runtime copy, always.

`tosijs/core` is opt-in rather than automatic because blueprints hydrate
from _markup_, so no import statement protects them — shaking the
registration would fail silently. Slim core is present, so it can speak: in
dev it warns if the page contains blueprint elements it cannot hydrate.

## Scaffolding

```
bunx tosijs create app my-app              # a runnable app (bun index.html)
bunx tosijs create component my-widget     # a component — blueprint form (default)
bunx tosijs create component my-widget --bare  # …plain class form
bunx tosijs create blueprint my-widget     # a publishable blueprint package
```

Everything scaffolded is **agent-ready**: components are born with a
`contract` (description, value schema, parts map, and a declared test), so
they self-describe on the agent surface and pass `exerciseComponent()` from
their first minute. The blueprint form is the default because blueprints
are consumable **directly from markup** — no build step on the consumer's
side:

```
<tosi-blueprint tag="my-widget" src="https://cdn.jsdelivr.net/npm/my-widget/dist/index.js"></tosi-blueprint>
<my-widget></my-widget>
```

## Better apps with less code

Less code to **write, read, run, debug, and maintain** — which, as a bonus in the
age of AI assistants, also means **fewer tokens** to generate and reason about.
`tosijs` gets there by leaning _into_ the browser instead of re-implementing it:

- **Your knowledge of the browser _is_ the API.** HTML, the DOM, CSS, real events,
  standard `<input>`s with their native accessibility — not a framework-shaped
  replacement you have to learn (and re-learn every major version).
- **Learn how the browser works, not how some framework works.** The skills are
  durable and transferable; they don't evaporate with the next migration guide.
- **O(1) DOM updates, even for big lists.** A state change surgically updates exactly
  the bound nodes — no virtual DOM, no diffing, no re-render-the-world. And because
  virtual list bindings are built in, a 100,000-row list only ever renders (and
  updates) the handful of rows actually on screen.
- **No JSX, no transpilation, no build step required.** Pure JS/TS in, native DOM
  nodes out — works in plain JavaScript or TypeScript.
- **No lock-in.** State is a plain observable object graph, not a framework you
  marry; bind it to vanilla DOM, web-components, React, or Angular.
- **Zero runtime dependencies.**
  <!-- sizes:start --><!-- generated by `bun run build` — do not hand-edit -->
  ~29 kB gzipped from a script tag, ~26 kB for `tosijs/core`, ~16 kB for the
  DOM-free `tosijs/state`; the full ESM entry is ~43 kB.
  <!-- sizes:end -->
  The agent surface is opt-in and shakes away if you never import it: it is
  <!--agentgz-->~17.3 kB<!--/agentgz--> of the full ESM entry — exactly what
  `tosijs` carries over `tosijs/core`, measured by the build, including the
  schematic renderer, the accessibility audit and the contract harnesses.
  <!-- as-of: 2026-08-08 | the +13.7% consumer-app comparison against 1.7.9, which needs the two-app harness to re-measure -->
  It does not, however, shake back to 1.7.x: when 1.8.0 shipped, an identical
  consumer app that never touched the agent surface measured **+2.9 kB gzipped
  (+13.7%) against 1.7.9**, because the contract seam, the path-segment guard
  and the binding bookkeeping sit on the ordinary path. That figure is a
  1.8.0-era measurement and has not been re-taken. If size matters more to you
  than the features, `tosijs/core` is the smaller door.

On top of that you get the conveniences you'd actually want: most binding code
eliminated, web-components you can build in pure JS more compactly than JSX, and
CSS handled with variables and real `Color` math.

```js
import { elements, tosi, touch, deleteListItem } from 'tosijs'

const todo = {
  list: [],
  addItem(reminder) {
    if (reminder.trim()) {
      todo.list.push({ id: Math.random(), reminder })
    }
  },
}

todo.addItem('wash the cat')
todo.addItem('buy milk')

const { readmeTodoDemo } = tosi({ readmeTodoDemo: todo })

const { h4, ul, label, input } = elements
preview.append(
  h4('To Do List'),
  ul(
    ...readmeTodoDemo.list.listBinding(
      ({ li, button }, item) =>
        li(
          item.reminder,
          button('Done!', {
            style: {
              marginLeft: 10,
            },
            onClick(event) {
              // deleteListItem resolves the row from any child node — pass the
              // button and it walks up to find its list item automatically
              deleteListItem(event.target)
            },
          })
        ),
      { idPath: 'id' }
    )
  ),
  label(
    'Reminder',
    input({
      placeholder: 'enter a reminder',
      onKeydown(event) {
        if (event.key === 'Enter') {
          event.preventDefault()
          readmeTodoDemo.addItem(event.target.value)
          event.target.value = ''
          touch(readmeTodoDemo)
        }
      },
    })
  )
)
```

In general, `tosijs` is able to accomplish the same or better compactness, expressiveness,
and simplicity as you get with highly-refined React-centric toolchains, but without transpilation,
domain-specific-languages, or other tricks that provide "convenience" at the cost of becoming locked-in
to React, a specific state-management system (which permeates your business logic), and usually a specific UI framework.

`tosijs` lets you work with pure HTML and web-components as cleanly—more cleanly—and efficiently than
React toolchains let you work with JSX.

    export default function App() {
      return (
        <div className="App">
          <h1>Hello React</h1>
          <h2>Start editing to see some magic happen!</h2>
        </div>
      );
    }

Becomes:

    const { div, h1, h2 } = elements // exported from tosijs
    export const App = () => div(
      { class: 'App' },
      h1('Hello tosijs'),
      h2('Start editing to see some magic happen!')
    )

Except this reusable component outputs native DOM nodes. No transpilation, spooky magic at a distance,
or virtual DOM required. And it all works just as well with web-components. This is what you get when
you run App() in the console:

    ▼ <div class="App">
        <h1>Hello tosijs</h1>
        <h2>Start editing to see some magic happen!</h2>
      </div>

The ▼ is there to show that's **DOM nodes**, not HTML.

`tosijs` lets you lean into web-standards and native browser functionality while writing less code that's
easier to run, debug, deploy, and maintain. Bind data direct to standard input elements—without having
to fight their basic behavior—and now you're using _native_ functionality with _deep accessibility_ support
as opposed to whatever the folks who wrote the library you're using have gotten around to implementing.

> **Aside**: `tosijs` will also probably work perfectly well with `Angular`, `Vue`, et al, but I haven't
> bothered digging into it and don't want to deal with `ngZone` stuff unless someone is paying
> me.

If you want to build your own `web-components` versus use something off-the-rack like
[Shoelace](https://shoelace.style), `tosijs` offers a `Component` base class that, along with
its `elements` and `css` libraries allows you to implement component views in pure Javascript
more compactly than with `jsx` (and without a virtual DOM).

    import { Component, elements, css } from 'tosijs'

    const { h1, slot } = elements
    export class MyComponent extends Component {
      static shadowStyleSpec = css({
        h1: {
          color: 'blue'
        }
      })
      content = [ h1('hello world'), slot() ]
    }

The difference is that `web-components` are drop-in replacements for standard HTML elements
and interoperate happily with one-another and other libraries, load asynchronously,
and are natively supported by all modern browsers.

## An ecosystem with `tosijs` at its heart

`tosijs` is the observable core a whole family of tools is built on. Each is useful
on its own; together they let you build almost anything without leaving web
standards behind.

| Project                                                            | What it is                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **tosijs**                                                         | This library — the path-based _observant_ state core everything else is built on.                                                                                                                                                                                                                                                      |
| **[tosijs-ui](https://ui.tosijs.net)**                             | _Just enough_ extra web-components to build any interface — it complements the native elements that already work rather than replacing them. Also ships the documentation-site system that renders these very docs: literate programming with live, editable examples pulled straight from Markdown and source comments.               |
| **[tjs-lang](https://tjs-platform.web.app)**                       | TypeScript that _really_ transpiles in the browser (no server, no "just strip the types" fake) — and a better JavaScript: types that survive to runtime as contracts, safety boundaries, inline tests, and a gas-metered VM for genuinely **safe `eval`** (ship the logic, not a container to run it in).                              |
| **[react-tosijs](https://react.tosijs.net)**                       | Dramatically simplify state management in React apps, integrate React with other frameworks or web-components, or give yourself an off-ramp from React.                                                                                                                                                                                |
| **[ngx-tosijs](https://angular.tosijs.net)**                       | The same for Angular (signals, zoneless-first).                                                                                                                                                                                                                                                                                        |
| **[tosijs-schema](https://github.com/tonioloewald/tosijs-schema)** | Foundational, slightly bleeding-edge plumbing: a _type-by-example_ JSON-Schema engine with arguably the strongest performance / flexibility / architecture story of any JSON-Schema implementation — and increasingly so as it grows computed predicates. Most people won't need to think about it; the rest of the stack leans on it. |
| **[tosijs-product](https://product.tosijs.net)**                   | Cinematic, scroll-linked product pages (Lottie, video, 3D, maps) authored in plain HTML.                                                                                                                                                                                                                                               |
| **[tosijs-3d](https://3d.tosijs.net)**                             | Declarative 3D / VR / XR as web components, built on Babylon.js (WIP).                                                                                                                                                                                                                                                                 |

## What `tosijs` does

### Observe Object State

`tosijs` tracks the state of objects you assign to it using `paths` allowing economical
and direct updates to application state.

    import { tosi, observe } from 'tosijs'

    const { app } = tosi({
      app: {
        prefs: {
          darkmode: false
        },
        docs: [
          {
            id: 1234,
            title: 'title',
            body: 'markdown goes here'
          }
        ]
      }
    })

    observe('app.prefs.darkmode', () => {
      document.body.classList.toggle('dark-mode', app.prefs.darkmode.value)
    })

    observe('app.docs', () => {
      // render docs
    })

> #### What does `tosi` do, and what is a `BoxedProxy`?
>
> `tosi` registers your object into `tosijs`'s central state tree and hands it
> back to you as a `BoxedProxy`.
>
> A `BoxedProxy` is an [ES Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
> wrapped around an `object` (which in Javascript means anything
> that has a `constructor` which in particular includes `Array`s, `class` instances, `function`s
> and so on, but not "scalars" like `number`s, `string`s, `boolean`s, `null`, and `undefined`)
>
> All you need to know about a `BoxedProxy` is that it's a Proxy wrapped around your original
> object that allows you to interact with the object normally, but which allows `tosijs` to
> **observe** changes made to the wrapped object and tell interested parties about the changes.
>
> If you want the original object back you can use `.value` on any proxy to unwrap it.

### No Tax, No Packaging

`tosijs` does not modify the stuff you hand over to it… it just wraps objects
with a `Proxy`, and when you make changes through the returned proxy, `tosijs`
notifies any interested observers.

    import { tosi, observe } from 'tosijs'
    const { foo } = tosi({
      foo: {
        bar: 17
      }
    })

    observe('foo.bar', (path) => {
      console.log('foo.bar was changed to', foo.bar.value)
    })

    foo.bar = 17        // does not trigger the observer
    foo.bar = Math.PI   // triggers the observer

### Paths are like JavaScript

A proxy behaves just like the JavaScript `Object` it wraps — `tosijs` doesn't
copy or replace your object, so what you put in is what you get out (call
`.value` to unwrap a scalar):

    import { tosi } from 'tosijs'

    const original = { bar: 'baz' }
    const { foo } = tosi({ foo: original })

    // read through the proxy; .value unwraps the scalar
    foo.bar.value === 'baz'

    // really, it's just the original object
    foo.bar = 'lurman'
    original.bar === 'lurman' // true

    // seriously, it's just the original object
    original.bar = 'luhrman'
    foo.bar.value === 'luhrman' // true

### …but better!

It's very common to deal with arrays of objects that have unique id values,
so `tosijs` supports the idea of id-paths

    import { tosi, boxed } from 'tosijs'

    const { app } = tosi({
      app: {
        list: [
          {
            id: '1234abcd',
            text: 'hello world'
          },
          {
            id: '5678efgh',
            text: 'so long, redux'
          }
        ]
      }
    })

    console.log(app.list[0].text.value)                     // hello world
    console.log(app.list['id=5678efgh'].text.value)         // so long, redux
    console.log(boxed['app.list[id=1234abcd]'].text.value)  // hello world

### Telling `tosijs` about changes using `touch()`

Sometimes you will modify an object behind `tosijs`'s back (e.g. for efficiency).
When you want to trigger updates, simply touch the path.

    import { tosi, boxed, observe, touch } from 'tosijs'

    const raw = { bar: 17 }
    const { foo } = tosi({ foo: raw })
    observe('foo.bar', (path) => console.log(path, '->', boxed[path].value))
    foo.bar = -2                  // console will show: foo.bar -> -2

    raw.bar = 100                 // nothing happens (changed behind tosijs's back)
    touch('foo.bar')              // console will show: foo.bar -> 100

Every `BoxedProxy` also has a `.touch()` method:

    app.user.name.touch()     // force update for a scalar
    app.items[2].touch()      // force update for a list item

For list items with `idPath`, `.touch()` automatically synthesizes the
equivalent id-path touch, so DOM bindings update correctly.

### List Operations

Proxied arrays have `listFind`, `listUpdate`, and `listRemove` methods
for common list operations:

    // Find — returns proxied item (mutations trigger observers)
    const item = app.items.listFind((item) => item.id, 'abc')

    // Find by DOM element (in click handlers)
    const item = app.items.listFind(clickedElement)

    // Upsert — update in place or push if not found
    app.items.listUpdate((item) => item.id, { id: 'abc', name: 'New' })

    // Remove — returns true if found
    app.items.listRemove((item) => item.id, 'abc')

`listUpdate` preserves object identity — it mutates the existing object
property by property, so only changed properties fire observers and DOM
elements are reused (no teardown/recreation).

### CSS

`tosijs` includes utilities for working with css.

    import { css, vars } from 'tosijs'

The `vars` proxy converts camelCase properties into css variable references:

    vars.fooBar // emits 'var(--foo-bar)'
    `calc(${vars.width} + 2 * ${vars.spacing})` // emits 'calc(var(--width) + 2 * var(--spacing))'

`css()` processes an object, rendering it as CSS:

    css({
      '.container': {
        position: 'relative'
      }
    }) // emits .container { position: relative; }

CSS variables can be declared using `_` and `__` prefixes in `css()` objects:

    css({
      ':root': {
        _textFont: 'sans-serif',   // emits --text-font: sans-serif
        _color: '#111',            // emits --color: #111
      }
    })

## Color

`tosijs` includes a powerful `Color` class for manipulating colors.

    import { Color } from 'tosijs'
    const translucentBlue = new Color(0, 0, 255, 0.5) // r, g, b, a parameters
    const postItBackground = Color.fromCss('#e7e79d')
    const darkGrey = Color.fromHsl(0, 0, 0.2)

The color objects have computed properties for rendering the color in different ways,
making adjustments, blending colors, and so forth.

Use `invertLuminance()` to generate dark-mode equivalents of color values.

## Hot Reload

One of the nice things about working with the React toolchain is hot reloading.
`tosijs` supports hot reloading (and not just in development!) via the `hotReload()`
function:

    import { tosi, hotReload } from 'tosijs'

    tosi({
      app: {
        // ...your initial state
      }
    })

    hotReload()

`hotReload` stores serializable state managed by `tosijs` in localStorage and restores
it (by overlay) on reload. Because any functions (for example) won't be persisted,
simply call `hotReload` after initializing your app state and you're good to go.

`hotReload` accepts a test function (path => boolean) as a parameter.
Only top-level properties in your state that pass the test will be persisted.

To completely reset the app, run `localStorage.clear()` in the console.

## Development Notes

You'll need to install [bun](https://bun.sh/) and then run `bun install`.

    bun start                  # dev server with hot reload (https://localhost:8018)
    bun test                   # run all tests
    bun run build              # production build (runs tests, then bundles + docs)
    bun run format             # lint and format (ESLint + Prettier)
    bun pack                   # create local package tarball

## License

[Apache-2.0](./LICENSE) as of 1.8.0 (BSD-3-Clause through 1.7.x) — the
change adds an explicit patent grant and a patent-retaliation clause. If you
**redistribute** a build containing tosijs, Apache-2.0 §4(d) asks you to carry
the [`NOTICE`](./NOTICE) text in your attribution notices; BSD-3 had no such
requirement. Hosting an app you built with it is unaffected.

## History & credits

`tosijs` descends from **b8rjs → xinjs → tosijs** — see [tosijs history](/history/)
for the full lineage. **Upgrading?** See [Migration](/Migration/) — 1.8.0
removes the deprecations that named it, keeps the rest working with warnings,
and relicenses to Apache-2.0. Developed with [bun](https://bun.sh/); logo animation by
[@anicoremotion](https://pro.fiverr.com/freelancers/anicoremotion).
