# Hot Reload (hotReload)

`hotReload()` persists any root-level paths in state that its test function evaluates as true
to [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). It restores them (by overlay) on the
next load, so call it after registering your initial state. Functions are not
persisted. To reset, run `localStorage.clear()` in the console.

```
hotReload(test: PathTestFunction = () => true): void
```
