# Angular and tosijs

<!--{ "pin": "bottom", "order": 310, "description": "Use tosijs state in Angular with tosiSignal — a real, writable Angular signal bound to a path, zoneless-first, no NgRx/RxJS boilerplate — and treat Angular as an off-ramp." }-->

`tosijs` is just as relevant to Angular developers. The tiny
[ngx-tosijs](https://angular.tosijs.net) library is **insanely simple state management
for Angular — and an off-ramp from Angular.**

`tosiSignal` gives you a real, writable Angular **signal** bound to a tosijs path — no
zones, no `NgZone.run`, no RxJS plumbing, no NgRx boilerplate — and you can talk to state
from _outside_ the Angular tree: a timer, a socket handler, the browser console, code
that's never heard of Angular. If you want the off-ramp, your state and logic live in
[tosijs](/) as plain observable objects, and Angular becomes just one way of viewing them.

## `tosiSignal` — a real Angular signal bound to a path

```typescript
import { Component } from '@angular/core'
import { tosi } from 'tosijs'
import { tosiSignal } from 'ngx-tosijs'

const { clock } = tosi({
  clock: { time: new Date().toLocaleTimeString() },
})

setInterval(() => {
  clock.time = new Date().toLocaleTimeString()
}, 1000)

@Component({
  selector: 'app-clock',
  standalone: true,
  template: `<div>{{ time() }}</div>`,
})
export class ClockComponent {
  time = tosiSignal<string>('clock.time')
}
```

The interval updates state _outside_ Angular — no zone, no `markForCheck`, no
`ChangeDetectorRef` — and the view follows, because `tosiSignal` **is** a real Angular
signal (`isSignal()` is true): read it in templates, `computed()`, or `effect()`, and
call `.set()` / `.update()` to write through to the shared state. Cleanup is automatic
via `DestroyRef` (or pass `{ injector }`, or `{ manualCleanup: true }` and call
`.destroy()` yourself).

It works **zoneless** (recommended — signals notify Angular's scheduler directly) and in
Zone.js apps alike.

## Zone.js apps: `provideTosi()`

For zoned apps that read tosijs proxies _directly_ in templates (dirty checking re-reads
them every pass), `provideTosi()` bridges tosijs flushes into the zone so outside-Angular
mutations trigger change detection — coalesced to one zone entry per flush. It's
unnecessary (and harmless) in zoneless apps using `tosiSignal`.

```typescript
import { bootstrapApplication } from '@angular/platform-browser'
import { provideTosi } from 'ngx-tosijs'

bootstrapApplication(AppComponent, {
  providers: [provideTosi()],
})
```

## Web components in Angular templates

Angular hosts custom elements natively — add `CUSTOM_ELEMENTS_SCHEMA` and drop in web
components ([tosijs-ui](https://ui.tosijs.net), or your own via tosijs `Component`), no
wrappers. They bind to the same paths as your Angular views, and both stay in sync
automatically because neither owns the state.

## Typed paths, persistence, DevTools

Framework-free — identical to react-tosijs:

```typescript
import { typedTosi, persist, connectDevTools } from 'ngx-tosijs'

type AppState = {
  app: { count: number; todos: { id: string; text: string }[] }
}
const { tosiSignal } = typedTosi<AppState>()
const text = tosiSignal('app.todos[0].text') // TosiSignal<string | undefined>
const oops = tosiSignal('app.cuont') // compile error

persist('app.todos') // localStorage, coalesced writes
connectDevTools({ roots: ['app'] }) // Redux DevTools tap
```

## The off-ramp, step by step

Because your state lives in tosijs, moving off Angular is incremental, never a big-bang
rewrite:

1. **Move state and logic** into a tosijs proxy — works inside any Angular ≥ 16, zoned or
   zoneless, no rewrite.
2. **Components become thin views** via `tosiSignal`; stores, dispatch, effects-classes,
   and `async`-pipe plumbing stop being necessary.
3. **Build new UI as web components** hosted directly in Angular templates — bound to the
   same paths, always in sync.
4. **Replace remaining Angular views at your own pace.** When the last one goes, delete
   `@angular/*` — your state, logic, and components never depended on Angular.

`ngx-tosijs` supports **Angular `>=16 <23`** (signals + `DestroyRef`). See
[angular.tosijs.net](https://angular.tosijs.net) for the full guide — the demo runs the
same Reminders app in Angular _and_ React ([react-tosijs](https://react.tosijs.net)) side
by side, bound to the same state, neither framework aware of the other.
