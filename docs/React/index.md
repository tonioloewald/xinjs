# React and tosijs

<!--{ "pin": "bottom", "order": 300, "description": "Use tosijs state in React with the useTosi hook (useState-shaped, works outside React), render web components via reactWebComponents, and treat React as an off-ramp." }-->

A lot of developers are using React — and `tosijs` is very much relevant to them. The
tiny [react-tosijs](https://react.tosijs.net) library is **insanely simple state
management for React — and an off-ramp from React.**

If you just want the state management, `useTosi` has `useState`'s shape and works better:
state isn't trapped in component lifecycles, closures, or hook rules, and you can change
it from _outside_ React — a timer, a socket handler, the browser console — and views just
follow. No reducers, no providers, no prop-drilling. If you want the off-ramp, your state
lives in [tosijs](/) as plain observable objects with no framework attached, and React
becomes just one way of looking at it.

## `useTosi` — a `useState`-shaped hook

Put any object in a `tosi` proxy, then read it like `useState` via its path. It's built
on `useSyncExternalStore`, so it's concurrent-rendering safe.

```jsx
import { tosi } from 'tosijs'
import { useTosi } from 'react-tosijs'

const { clock } = tosi({
  clock: { time: new Date().toLocaleTimeString() },
})

setInterval(() => {
  clock.time = new Date().toLocaleTimeString()
}, 1000)

const Clock = () => {
  const [time] = useTosi('clock.time')
  return <div>{time}</div>
}
```

`useTosi` returns `[value, setValue]` just like `useState`, but the state is updated
_outside_ React and it just works. One difference: `setValue` takes the next **value**,
not an updater function — `setCount(c => c + 1)` would store the function itself (tosijs
state legitimately holds functions, so they are never auto-invoked).

Because the state is a plain observable object, your logic is testable without rendering
anything, the console can poke it directly, and swapping a React view for a web component
later doesn't touch it at all. That's the off-ramp.

## `reactWebComponents` — web components as React components

`reactWebComponents.fooBar` gives you a React component that renders a `<foo-bar>` custom
element, so web components (e.g. from [tosijs-ui](https://ui.tosijs.net)) drop into React
with no wrappers — bound to the same state as your React views.

```jsx
import 'tosijs-ui'
import { reactWebComponents } from 'react-tosijs'

const Markdown = reactWebComponents.tosiMd

const Doc = () => <Markdown class="doc" src="/README.md" />
```

On React 18 pass `class` (not `className`) to custom elements — React 18 sets props on
them as attributes verbatim; React 19 handles `className` on custom elements natively.

## Typed paths, persistence, DevTools

All framework-free — they work whether a path is rendered by React, a web component, or
nothing at all:

```typescript
import { typedTosi, persist, connectDevTools } from 'react-tosijs'

type AppState = {
  app: { count: number; todos: { id: string; text: string }[] }
}
const { useTosi } = typedTosi<AppState>()
const [text] = useTosi('app.todos[0].text') // string
const [oops] = useTosi('app.cuont') // compile error

persist('app.todos') // localStorage, coalesced writes
connectDevTools({ roots: ['app'] }) // Redux DevTools tap
```

## Observant, not reactive

React answers _"did it change?"_ at the subscription source and re-renders from there;
`tosijs` does change detection at the DOM-update seam — an unchanged bound value is a
no-op at write time. `react-tosijs`'s internal machinery exists to pay React's toll on
React's behalf. Delete React and the toll goes with it — which is what makes it a genuine
off-ramp, not just another React-state library that deepens the commitment.

`react-tosijs` needs **React `^18.2` or `^19`** (the hook is built on
`useSyncExternalStore`). See [react.tosijs.net](https://react.tosijs.net) for the full
guide — and [angular.tosijs.net](https://angular.tosijs.net) runs the same app in React
_and_ Angular side by side, bound to one shared state, neither framework aware of the other.
