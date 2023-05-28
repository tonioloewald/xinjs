# About `xinjs`

Copyright ©2016-2022 Tonio Loewald

<div style="text-align: center">
  <a href="https://xinjs.net">
    <img style="width: 256px; max-width: 80%" alt="xinjs logo" src="https://xinjs.net/xinjs-logo.svg">
  </a>
</div>

`xinjs` is a collection of small modules designed to make writing javascript
code more productive and simpler. The core component is `xin` itself, a
"path-based observer" that allows you to observe changes to "paths" representing
state within arbitrary objects.

A lot of low-level code in `xinjs` is borrowed from [b8rjs](https://b8rjs.com).

## Contents

1. [overview](../README.md) — "read me" overview of xinjs
2. [xin](xin.md) — path-based observer
3. [paths](by-path.md) - querying objects by path
4. [bind](bind.md) — binding state to the DOM
5. [bindings](bindings.md) — the standard bindings provided out-of-the-box, and how to add your own
6. [elements](elements.md) — conveniently creating DOM elements
7. [css](css.md) — utilities for working with css
8. [web-components](web-components.md) — creating web-components (a.k.a. "custom-elements")
9. [throttle and debounce](throttle.md) — useful function wrappers

### Related Libraries
- [react-xinjs](https://www.npmjs.com/package/react-xinjs) allows you to manage state within
  React applications, allowing clean separation of logic and presentation.
- [type-by-example](https://www.npmjs.com/package/type-by-example) supports runtime type
  checking using serializable types, and creation of **typeSafe** functions that detect
  type errors.
- [filter-shapes](https://www.npmjs.com/package/filter-shapes) allows you to filter and 
  pare down objects to save bandwidth and catch errors.
