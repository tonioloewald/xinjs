# Start Here

<!--{ "pin": "top", "order": 1.5, "description": "A ten-minute tutorial on the two foundations of tosijs: the observer proxy that tosi() returns, and the element creators in elements. One small example, then what each line of it does." }-->

Two things in `tosijs` carry everything else: the **observer proxy** you get from
`tosi()`, and the **element creators** you get from `elements`. This page is one small
example that uses both, followed by what each part does. It takes about ten minutes, and
every example on it is live: edit the code and it re-runs.

## The whole thing

```js {"view": "code"}
import { tosi, elements } from 'tosijs'

const { myApp } = tosi({
  myApp: {
    greeting: 'hello world',
    action() {
      alert(myApp.greeting)
    },
  },
})

const { input, button } = elements

// input and button are element creators: functions that return real DOM elements
preview.append(
  input({
    // a live two-way binding: the field shows the state, typing changes it
    bindValue: myApp.greeting,
  }),
  button('Do something', {
    // the handler is looked up in the state when the click happens
    onClick: myApp.action,
  })
)

// so you can also reach it from your browser's own console
window.myApp = myApp
```
```test
import { boxed, updates } from 'tosijs'

// a test does not share the example's variables; `boxed` reaches any registered state
const { myApp } = boxed

test('the field shows the state, and follows it', async () => {
  const field = preview.querySelector('input')
  await updates()
  expect(field.value).toBe(myApp.greeting.value)
  const before = myApp.greeting.value
  myApp.greeting = 'changed by the test'
  await updates()
  expect(field.value).toBe('changed by the test')
  myApp.greeting = before
})
```

Type in the field, then click the button: the alert shows what you typed. Nothing in the
code above copies the text from the field to the state, or listens for a change. The
binding did that.

`preview` is the only thing here that belongs to this page: it is the box each live
example renders into. In your own page it would be `document.body`, or any element you
like. To run this yourself, `npm install tosijs` and use it from your bundler, or paste it
into a `<script type="module">` and import from
`https://cdn.jsdelivr.net/npm/tosijs/dist/module.js`.

## Poke at it

Open the example's **Console** tab. It evaluates what you type inside the example, so
`myApp` is there. (The last line of the example also put it on `window`, so your browser's
own console works too.) Try these, one at a time:

```
myApp.greeting
typeof myApp.greeting
```

It prints like the string, but `typeof` says `object`. What you have is the observer
proxy: every property you reach through `myApp` is wrapped, so `tosijs` can see what you
do with it. Your browser's console shows it for what it is, a `Proxy`.

```
myApp.greeting.value
myApp.greeting.path
```

`.value` is the plain string, and `.path` is `'myApp.greeting'`: the name `tosijs` knows
this piece of state by. Paths are how state is wired to the page.

```
myApp.greeting = 'I changed'
```

Look at the field: it changed. You wrote to the state and the bound element was updated.
(`myApp.greeting.value = 'I changed'` does exactly the same thing, and is the spelling
TypeScript accepts.)

```
myApp.action = () => alert('hijacked!')
```

Click the button again. It now runs the new function, although the button was built
before the function existed. `onClick: myApp.action` did not hand the button a function;
it handed it the path `myApp.action`, and the click looks up whatever is there now.

## What `tosi()` gave you

`tosi({ myApp: {...} })` does two things. It **registers** your object as state, under the
name `myApp`, and it **returns an observer proxy** for it. From then on:

- **Reading through the proxy gives you more proxies.** `myApp.greeting` is a proxy that
  knows its own path. It behaves like the string in most places (`myApp.greeting + '!'`,
  `` `${myApp.greeting}` `` and `myApp.greeting.length` all work), but it is an object,
  so `myApp.greeting === 'hello world'` is `false`. When you need the value itself,
  compare or pass `myApp.greeting.value`.
- **Writing through the proxy tells everyone who cares.** Every element bound to
  `myApp.greeting` is updated, and nothing else on the page is touched. There is no
  re-render and nothing is compared: the update goes straight to the bound elements.
- **Your object is still your object.** There are no setters to call and no actions to
  dispatch. `action()` is an ordinary method, and it can read and write the state the
  same way you just did in the console.

Updates are batched: after a write, bound elements catch up a moment later, not on the
same line. In a test, or anywhere you need to wait for the page, `await updates()`.

## What `elements` gave you

`elements` is a collection of **element creators**, one for every HTML tag:
`elements.div`, `elements.input`, `elements.button`, and so on. Each is a function that
returns a real DOM element, which is why the example can hand its results straight to
`preview.append()`. There is no template language and nothing to compile.

A creator takes any number of arguments, in any order:

- **A string or a number** becomes text inside the element.
- **Another element** becomes a child.
- **A plain object** sets things on the element: attributes and properties
  (`{ type: 'checkbox', title: 'hello' }`), styles (`{ style: { color: 'red' } }`),
  event handlers (`{ onClick: fn }`), and bindings (`{ bindValue: myApp.greeting }`).
- **A proxy** becomes text that stays up to date.

That last one is the shortest binding there is:

```js {"view": "code"}
import { tosi, elements } from 'tosijs'

const { startHere } = tosi({
  startHere: { name: 'world', hide: false },
})

const { div, h3, label, input } = elements

preview.append(
  // startHere.name as a child: live text
  h3('Hello, ', startHere.name, '!', {
    // a proxy as a property value: a live property
    hidden: startHere.hide,
  }),
  div(
    label('Name ', input({ bindValue: startHere.name })),
    label(
      input({ type: 'checkbox', bindValue: startHere.hide }),
      ' hide the heading'
    )
  )
)
```
```test
import { boxed, updates } from 'tosijs'

const { startHere } = boxed

test('a proxy child is live text, a proxy property is a live property', async () => {
  const heading = preview.querySelector('h3')
  await updates()
  expect(heading.textContent).toBe(`Hello, ${startHere.name.value}!`)
  startHere.hide = true
  await updates()
  expect(heading.hidden).toBe(true)
  startHere.hide = false
  await updates()
  expect(heading.hidden).toBe(false)
})
```

The heading is three children: the text `Hello, `, a piece of text bound to
`startHere.name`, and `!`. Typing in the field writes to `startHere.name`, which updates
that one piece of text. The checkbox writes a boolean to `startHere.hide`, which sets
the heading's `hidden` property.

## The model, in one paragraph

State lives in plain objects that you register with `tosi()`. You build the page once,
out of real DOM elements, and say which pieces of state each element cares about. When
state changes, `tosijs` updates the elements bound to it. The page is not a function of
state that gets run again; it is a set of elements **wired** to paths. That is why there
is so little code: once the wiring is declared, there is nothing left to write.

## Where next

**Next: lists.** Almost every app has one, and [binding arrays](/list-binding/) is where
`tosijs` differs most from what you may be used to: a list is bound once, and rows are
added, removed and updated individually, including in lists of 100,000 rows.

Then:

- [Building Apps](/Building-Apps/) is the full guide: how to think about state, lists,
  components and styling, and the patterns that keep an app small.
- [The tosi proxy](/xin/) covers the proxy in depth: paths, arrays, and observing changes
  from code that is not a DOM element.
- [Creating Elements](/elements/) covers everything a creator accepts.
- [Binding](/bind/) covers what `bindValue` was shorthand for.
- [Web-Components](/component/) is for when a piece of your page deserves its own tag.
