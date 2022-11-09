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
3. [types](type-by-example.md) — dynamic type-checking using pure JavaScript
4. [filter](filter.md) — filtering objects using types
5. [paths](by-path.md) - querying objects by path
6. [bind](bind.md) — binding state to the DOM
7. [elements](elements.md) — conveniently creating DOM elements
8. [web-components](web-components.md) — creating web-components (a.k.a. "custom-elements")
9. [react integration](useXin.md) — powering pure components via xin hooks
