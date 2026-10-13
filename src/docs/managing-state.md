# Managing State
<!--{ "order": 3, "description": "How tosijs handles application state: plain objects registered with tosi(), addressed by path through the observer proxy, with observers for everything that is not a DOM element. An overview with links to the detail." }-->

State is why an app exists. In `tosijs` it lives in plain JavaScript objects; you
register them once, and from then on you read and write them through the
**observer proxy**, which tells everything that cares when something changes.

> The goal is to make updating the user interface essentially an O(~1) operation,
> and to reframe keeping state in sync with the UI as a matter of *wiring* data
> *paths* to interested *elements* (and, where needed, *observers*). This is how
> the Mac and NeXT UIs worked, rather than the "reactive" idea of UI = f(State).

This page is the overview. Each part links to the page with the detail.

## Register it, then just use it

    import { tosi } from 'tosijs'

    const { app } = tosi({
      app: {
        user: { name: 'Ada' },
        todos: [],
      },
    })

    app.user.name = 'Grace'        // everything bound to app.user.name updates

There are no setters to call and no actions to dispatch, and the object is still
your object: it can have methods, and your business logic does not need to know
`tosijs` exists. [The observer proxy](/xin/) covers what you get back, including
`.value` and `.path`, arrays, and transforms with `.tosi.as()`.

## Everything has a path

`app.user.name` is the string `'app.user.name'` as far as `tosijs` is concerned.
Paths are the level of indirection that makes the rest work: an element can be
wired to a path before the data exists, and a change to a path reaches exactly
the things wired to it. Array items can be addressed by id
(`app.todos[id=17].done`), which is what makes list updates surgical.

## Showing state on the page

You do not write code for this. You bind elements to paths and the page follows
the state; see [Binding to the DOM](/binding-to-the-dom/).

## Reacting to state in code

For everything that is *not* a DOM element (saving, logging, talking to a
server), use `observe()`; and when you change something the proxy could not see,
`touch()` it. Both are in [path-listener](/path-listener/). If you are about to
write an observer that updates the DOM, read
[Why `bind`, and when to use `observe`](/bind-vs-observe/) first.

## Keeping state around, and sharing it

- [Hot Reload](/hot-reload/) lets chosen parts of state survive a page refresh. It is a
  debugging aid, not intended for production.
- [share](/share/) keeps it in sync across tabs and windows.
- [sync](/sync/) keeps it in sync over a network.

## Without a DOM

The state layer has no dependency on the browser. [`tosijs/state`](/index-state/)
is the same thing as its own entry point, for Node, workers and tests.

<!-- toc -->
- [The Observer Proxy](/xin/)
- [Path Listener](/path-listener/)
- [Metadata](/metadata/)
- [Hot Reload](/hot-reload/)
- [Cross-Tab State](/share/)
- [Network Sync](/sync/)
<!-- /toc -->
