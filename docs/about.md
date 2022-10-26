# About `xinjs`

Copyright ©2016-2022 Tonio Loewald

<div style="text-align: center">
  <a href="https://xinjs.net">
    <img style="width: 256px; max-width: 80%" alt="xinjs logo" src="https://xinjs.net/xinjs-logo.svg">
  </a>
</div>

> Much of this code is derived from [bindinator](https://b8rjs.com).

`xinjs` is a collection of small modules designed to make writing javascript
code more productive and simpler. The core component is `xin` itself, an 
object that observes the state of any objects passed to it without changing
those objects in any way.

## Contents

1. [xin](xin.md) — path-based observer
2. [types](type-by-example.md) — dynamic type-checking using pure JavaScript
3. [filter](filter.md) — filtering objects using types
4. [react integration](useXin.md) — powering pure components via xin hooks
5. [paths](by-path.md) - querying objects by path