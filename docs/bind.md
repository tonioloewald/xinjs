# Binding Data to the User Interface

## An Aside on Reactive Programming vs. the Observer Model

A good deal of user-facing code deals with keeping the application's
state synchronized with the user-interface. One approach to this problem
is [Reactive Programming](https://en.wikipedia.org/wiki/Reactive_programming) 
as exemplified by [React](https://reactjs.org) and its many imitators.

`xinjs` works very well with React via the [useXin](./useXin.md) React "hook".
But `xinjs` is not designed for "reactive programming" and in fact "hooks" aren't
"reactive" at all, so much as an example of the "observer" or "pub/sub" pattern.

`xinjs` is a "path-observer" in that it's an implementation of the 
[Observer Pattern](https://en.wikipedia.org/wiki/Observer_pattern)
where **path strings** serve as a level of *indirection* to the things observed. 
This allows data to be "observed" before it exists, which in particular *decouples* the setup
of the user interface from the initialization of data and allows user interfaces
built with `xinjs` to be *deeply asynchronous*.

## `bind`

The `bind` function is a simple way of tying an `HTMLElement`'s properties to
state via `path` using [bindings](bindings.md)

    import {bind, bindings, xin, elements, updates} from 'xinjs'
    const {div, input} = elements

    const divElt = div()
    bind(divElt, 'app.title', bindings.text)
    document.body.append(divElt)

    const inputElt = input()
    bind(inputElt, 'app.title', bindings.value)

    xin.app = {title: 'hello world'}
    await updates()

What's happening is essentially the same as:

    divElt.textContent = xin.app.title
    observe('app.title', () => divElt.textContent = xin.app.title)

    inputElt.value = xin.app.title
    observe('app.title', () => inputElt.value = xin.app.title)
    inputElt.addEventListener('change', () => { xin.app.title = inputElt.value })

Except:

1. this code is harder to write
2. it will fail if xin.app hasn't been initialized (which it hasn't!)
3. inputElt will also trigger *debounced* updates on `input` events

After this. `div.textContent` and `inputElt.value` are 'hello world'.
If the user edits the value of `inputElt` then `xin.app.title` will
be updated, and `app.title` will be listed as a changed path, and
an update will be fired via `setTimout`. When that update fires,
anything observer of the paths `app.text` and `app` will be fired.

A `binding` looks like this:

    interface XinBinding {
      toDOM?: (element: HTMLElement, value: any, options?: XinObject) => void
      fromDOM?: (element: HTMLElement) => any
    }

Simply put the `toDOM` method updates the DOM based on changes in state
while `fromDOM` updates state based on data in the DOM. Most bindings
will have a `toDOM` method but no `fromDOM` method since `bindings.value`
(which has both) covers most of the use-cases for `fromDOM`.

It's easy to write your own `bindings` if those in `bindings` don't meet your 
need, e.g. here's a custom binding that toggles the visibility of an element 
based on whether the bound value is neither "falsy" nor an empty `Array`.

    const visibility = {
      toDOM(element, value) {
        if (element.dataset.origDisplay === undefined && element.style.display !== 'none') {
          element.dataset.origDisplay = element.style.display
        }
        element.style.display = (value != null && element.length > 0) ? element.dataset.origDisplay : 'none'
      }
    }
    bind(listElement, 'app.bigList', visibility)

