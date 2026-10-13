# tosijs history
<!--{ "pin": "bottom", "order": 900, "description": "The lineage behind tosijs — b8rjs → xinjs → tosijs: what changed, why, and how to migrate." }-->

<div style="text-align: center; margin: 20px">
  <tosi-lottie style="display: inline-block; width: 280px; height: 280px; background: #da1167; border-radius: 40px" src="/tosi.json">
    <img style="width: 280px" alt="tosijs logo" src="https://tosijs.net/favicon.svg">
  </tosi-lottie>
</div>

`tosijs` has a lineage: **[b8rjs](https://github.com/tonioloewald/b8r) → xinjs → tosijs.**

Each step kept the core idea — bind application state to the DOM through a central,
path-addressable registry and let observers do the updating — while shedding
whatever the platform had since made unnecessary.

But even before this idea was used for web development, its core ideas had been
proven out in multiple contexts:

- separate presentation from logic (e.g. Mac Resource Manager, DITLs, 1984)
- declare simple bindings as metadata (originally HyperCard projects could give UI elements "names" and the names could be used to declare or attach bindings)
- store data in dictionaries (e.g. before JavaScript objects, NewtonScript had "soups")
- propagate events using a simple, consistent approach (HyperCard)

## bindomatic.js (2013)

Originally developed for the [USPTO](https://www.uspto.gov/) but, despite assurances,
never open-sourced. This was based on jQuery before browsers adopted the best
bits of the jQuery API natively.

## b8rjs (2015)

The first open-source incarnation. `b8rjs` established the "bind to the registry"
model: application state lives in one place, the DOM is wired to it by path, and
changes propagate without hand-written glue.

b8rjs also implemented literate programming concepts in its development/demo site
and provided a powerful serializable type system (similar to JSON-Schema).

## xinjs (2021)

A ground-up successor to `b8rjs`, rebuilt around modern ES `Proxy` objects — this
is where the boxed-proxy / path-observer design `tosijs` uses today took shape.
Its chief changes:

- **Virtual-list bindings became first-class.** `b8rjs` needed specific components
  to virtualize a list; in `xinjs` any list binding could be virtual.
- **TypeScript-native**, to meet Google's code standards.
- **Binding declarations left the DOM.** `b8rjs` wrote bindings into DOM
  attributes; `xinjs` kept them off the DOM entirely (in the observer registry),
  to meet Google's information-security standards.
- **Web-components became a first-class citizen**, not an afterthought — they
  weren't usable at all when `b8rjs` was written.
- **No hand-written HTML or CSS.** The `elements` and `css` proxies express markup
  and styles as fully-typed TypeScript, so the code-quality tooling that checks
  your logic checks your UI too — and it comes out _more_ compact and expressive
  than HTML/JSX or CSS/Tailwind. Compare `vars.padding50` with
  `calc(var(--padding) * 0.5)`, or `customElement()` with
  `<custom-element></custom-element>`.

## tosijs (2023)

The current name — `xinjs` renamed, with the API stable across the rename. Taken
as a whole, the line since `b8rjs` is a highly incompatible evolution: removing
cruft, supporting more use-cases, and eliminating functionality made redundant by
improvements to the JavaScript language and DOM APIs. It is also the heart of a
broader ecosystem — see the [home page](/) for the full family (tosijs-ui,
tjs-lang, the React and Angular bridges, and more).

> ### Migrating from xinjs
>
> `tosijs` was formerly published as `xinjs`. The rename is complete, though some
> older links and articles still say "xinjs". The API is stable across the rename —
> most old names continue to work with one-time deprecation warnings (1.8.0
> removed the few whose warnings named it — see [Migration](/Migration/)).
> If you're coming
> from `xinjs`, see the [migration guide](/Migration/).

## Credits

`tosijs` is developed with [bun](https://bun.sh/) — crazy fast (WebKit's
JavaScriptCore engine, not V8), does a lot natively, and runs TypeScript directly.

Logo animation by [@anicoremotion](https://pro.fiverr.com/freelancers/anicoremotion).
