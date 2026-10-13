# Path Listener (path-listener)

`path-listener` implements the `tosijs` observer model. Although these events
are exported from `tosijs` they shouldn't need to be used very often. Mostly
they're used to manage state.

## `touch(path: string)` and `.touch()`

This is used to say that a value at a path has changed. Remember that the
observer proxy simply wraps an object, and if you change the object directly,
the proxy won't know about it.

The two most common uses for `touch()` are:

1. You want to make lots of changes to a large data structure, possibly
   over a period of time (e.g. update hundreds of thousands of values
   in a table that involve service calls or heavy computation) and don't
   want to thrash the UI so you just change the object directly.
2. You want to change the content of an object but need a something that
   is bound to the "outer" object to be refreshed.

Every `BoxedProxy` also has a `.touch()` method, so you can call it directly
on any proxied value:

    app.user.name.touch()   // force update for this scalar
    app.user.touch()        // force update for the whole object
    app.items[2].touch()    // force update for a list item

### Id-path synthesis

When you touch a path that contains an array index (e.g. `items[2]` or
`items[2].name`), `touch()` automatically synthesizes the equivalent id-path
touches (e.g. `items[id=abc]` or `items[id=abc].name`). This means that
`.touch()` on list items correctly updates DOM elements bound via `idPath`,
even when you've mutated the underlying data behind the proxy's back.

## `observe()` and `unobserve()`

    const listener = observe(
      path: string | RegExp | (path: string) => boolean,
      (changedPath: string) => {
        ...
      }
    )

    // and later, when you're done
    unobserve(listener);

`observe(…)` lets you call a function whenever a specified path changes. You'll
be passed the path that changed and you can do whatever you like. It returns
a reference to the listener to allow you to dispose of it later.

`unobserve(listener)` removes the listener.

### If the callback updates the DOM, you almost certainly want `bind` instead

This is the single commonest way to write more code than you need in tosijs,
and the cost is not the extra lines — it is that **the element becomes
invisible to the agent surface.**

Two divs, both driven by state:

```
// hand-rolled: observe, then write the DOM yourself
const rolled = div({})
observe('app.name', () => { rolled.textContent = app.name.value })

// bound
const bound = div({ bindText: app.name })
```

Both update correctly. But `describe()` returns **one record, not two** — the
agent map is built from bound elements, and an element becomes *wired* by being
bound and by nothing else. The hand-rolled div is absent from the map, so an
agent cannot see what it shows or what drives it.

`bind` also brings what you would otherwise write yourself: the initial value
applied on setup, surgical list updates via `idPath`, the async-batched touch,
and bindings that accumulate on one element rather than clobbering each other.

**`observe` is right when the reaction is not a DOM update** — persisting to
storage, sending an analytics event, kicking off a fetch, driving a canvas or a
WebGL scene. Reach for it there, and for anything the DOM is not the output of.

If you are calling `touch()` often, that is usually the same signal from the
other end: bindings would be doing that work.

### Which path does the callback receive?

**The path that was TOUCHED — as specific as the write was — not the path you
observed.** An observer on a root therefore sees different spellings depending
on what happened, and that is the rule rather than an inconsistency:

    observe('app', cb)

    app.rows[id=a].f.k = 2   // cb('app.rows[id=a].f.k')  — a leaf write
    app.value = nextDoc      // cb('app')                 — the root replaced
    touch('app')             // cb('app')                 — an explicit touch

So a callback that *parses* the path must handle the root case explicitly.
Rounding "the field this path names" silently does nothing when the path IS
the root, and code that then falls through to a full re-render will destroy the
widget under the user's pointer — reported that way in tosijs#35. If you only
care that *something* under a path changed, ignore the argument and re-read
what you need.

Note also that `tosi()` schedules a touch on the root as it registers, so an
observer installed immediately afterwards sees that root touch first. `await
updates()` between registering state and observing it drains that, and is
usually what you want in tests.

> This is how binding works. When you bind a path to an interface element, an
> observer is created that knows when to update the interface element. (If the
> binding is "two-way" (i.e. provides a `fromDOM` callback) then an `input` or
> `change` event that hits that element will update the value at the bound
> path.

## `async updates()`

You can `await updates()` or use `updates().then(…)` to execute code
after any changes have been rendered to the DOM. Typically, you shouldn't
have to mess with this, but sometimes—for example—you might need to know
how large a rendered UI element is to adjust something else.

It's also used a lot in unit tests. After you perform some logic, does
it appear correctly in the UI?

### ⚠️ Drain after `tosi()` before you observe

Registering state **queues a touch on the root path**, and `touch()` is
async-batched — so if you observe immediately after `tosi()`, that pending
notification is still in flight and lands on your callback:

```
tosi({ app: { a: 0, b: 0 } })
observe('app.a', (path) => console.log(path))   // registration touch pending
app.a.value = 1
await updates()                                 // logs 'app', not 'app.a'
```

Because a root touch notifies every descendant, an observer on `app.b` fires
too — so it reads convincingly as *"writing `a` woke every sibling"*. It isn't.
Add `await updates()` after `tosi()` and before installing observers:

```
tosi({ app: { a: 0, b: 0 } })
await updates()                                 // <- drain the registration
observe('app.a', (path) => console.log(path))
app.a.value = 1
await updates()                                 // logs 'app.a', and only that
```

Writes are surgical: every form (`app.a.value = 1`, `app.a = 1`, and the
string-path form `boxed['app.a'] = 1`) touches exactly `app.a`. If a probe
suggests otherwise, check for an undrained registration first — the symptom is
specific and stable enough to look like a real finding.
