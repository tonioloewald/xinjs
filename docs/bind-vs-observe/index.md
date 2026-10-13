# Why `bind`, and when to use `observe`
<!--{ "parent": "bind", "order": 1, "description": "Why bind — and when observe is the right tool. The rule: observe for reactions that touch no DOM; bind for everything else." }-->

There is one rule, and it decides almost every case:

> **Using `observe` to persist a value is entirely legitimate. If you `observe`
> and then shove something into the DOM, you are almost certainly adding code
> and bugs for no good reason.**

`observe` is for reactions that touch **no DOM**. Everything else is `bind`.

## The mistake, and why it does not look like one

```
// DON'T — this works, which is the problem
app.user.name.observe(() => {
  nameField.value = app.user.name.value
})
nameField.addEventListener('input', () => {
  app.user.name.value = nameField.value
})
```

```
// DO
input({ bindValue: app.user.name })
```

The first version runs. The page updates. Nothing throws. It is also a second
implementation of two-way binding, and you now own it.

## What you gave up

**The element becomes invisible to your own app.** An element is *wired* by
being bound and by nothing else, so `describe()` — the agent surface, the
accessibility audit, the schematic — cannot see it. Two divs both driven by
state, one `bindText` and one `observe` + `textContent`: `describe()` returns
**one**. Your app describes itself as smaller than it is.

**You have to prime it yourself.** `bind` applies on setup; `observe` does not.
That is why hand-rolled versions always carry a `syncFromTheme()` or `show()`
call next to the observer — and if you forget it, the UI is stale until the
first change.

**You have to tear it down yourself.** `bind`'s dispatcher scans the live
document at dispatch time, so **removing the element IS the teardown** — it
holds no strong reference to your element. An observer runs until something
retires it. Detach the element without retiring it and the callback keeps
firing, writing into a node nobody can see, holding it in memory. Nothing warns
you.

**You forfeit the machinery.** Surgical list updates via `idPath`,
accumulate-don't-clobber when several bindings share an element,
`take()` memoisation, shadow-boundary handling, per-element error isolation so
one failure cannot strand the rest of the page.

## The real argument

The list above is not the point, because a determined author can reimplement
any of it. The point is that they would have to:

> **`bind` is one implementation, battle-tested over ten years across many
> complex environments. Every hand-rolled observer is a new implementation,
> whose edge-case coverage is whatever its author happened to think of — and
> the author cannot know what is missing, because the missing cases are
> silent.**

And fixes do not propagate. Fix a shadow-DOM edge case in `bind` and every
binding in every app gets it. Fix it in your observer and you have fixed one
observer.

## When `observe` is right

When the reaction touches no DOM at all:

| | |
| --- | --- |
| **persist** | write to localStorage, IndexedDB, a server |
| **sync** | replicate to another realm — another tab, the network, the URL |
| **telemetry** | analytics, logging, an audit trail |
| **process** | start or stop something — a timer, a worker, a poll |
| **derived state** | compute *other state* — though [`take`](/xin/#take--reactive-binding-transforms) is usually better |

```
// legitimate: nothing here touches the DOM
app.preferences.observe(() => {
  localStorage.setItem('prefs', JSON.stringify(app.preferences.value))
})
```

## "But `bind` can't do what I need"

It probably can, because `toDOM` is an arbitrary function and **the side effect
does not have to land on the element you bind to**:

```
// a global effect — bind the element that owns it
bind(document.documentElement, 'theme.accent', {
  toDOM: (el, value) => el.style.setProperty('--accent', value),
})

// a structural rebuild
bind(myComponent, 'app.locale', { toDOM: () => myComponent.queueRender() })

// handing state to a library that owns its own DOM
bind(canvas, 'scene.time', { toDOM: (el, t) => renderFrame(el, t) })
```

All three keep the element in the map, apply on setup, and stop when the
element goes away. The canvas one also stops redrawing when the value has not
changed — see below.

## Two things worth knowing either way

**An unchanged scalar notifies nobody.** `touch()` is only called when the new
value `!==` the existing one — so assigning a value **equal** to the current one
does nothing at all: no binding runs, no observer fires, and the DOM is never
written. This is why binding an `<input>` does not
disturb its selection. It is identity, not deep equality: assigning a
deep-equal *object* does notify. It applies to every `toDOM`, so an expensive
custom redraw is skipped for free.

**Observers can retire themselves — three ways.** Keep the unsubscribe, keep
the listener, or say so from inside the callback:

```
// 1. the unsubscribe returned by .observe()
const stop = app.thing.observe(() => { /* … */ })
stop()

// 2. keep the listener and unobserve it
const listener = observe('app.thing', () => { /* … */ })
unobserve(listener)

// 3. from INSIDE the callback — the natural form for "stop when my
//    element is gone", and the only one that needs no bookkeeping
observe('app.thing', () => {
  if (!el.isConnected) return OBSERVER_SHOULD_BE_REMOVED
  el.textContent = app.thing.value
})
```

Form 3 is pull-based: it costs one more call to notice it should go.

None of this is required with `bind`, which is the point of the section above —
detaching the element *is* the teardown.

---

*The proposal to make `observe` state its reason is
[tosijs#44](https://github.com/tonioloewald/tosijs/issues/44); comment there.
The behaviours described here are pinned by `tests/bind-lifecycle.pw.ts`, which
runs in real Chromium and Firefox because attach/detach semantics are not
trustworthy in a DOM shim.*
