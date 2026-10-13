# Metadata

## `tosiAccessor(x: any): TosiAccessor | undefined`

`tosiAccessor` returns the collision-free accessor object from any boxed proxy,
using the `TOSI_ACCESSOR` symbol internally. Returns `undefined` for non-proxy values.

This is the guaranteed escape hatch — it works even if your data has a property
named `tosi` that would shadow the `.tosi` convenience accessor.

```
import { tosiAccessor, TOSI_ACCESSOR } from 'tosijs'

const { app } = tosi({ app: { tosi: 'shadowed!', name: 'test' } })

// .tosi is always intercepted by the proxy (not shadowed in practice)
app.tosi.path === 'app'

// tosiAccessor() and TOSI_ACCESSOR are guaranteed collision-free
const acc = tosiAccessor(app)
acc.path === 'app'
acc.value  // { tosi: 'shadowed!', name: 'test' }

// TOSI_ACCESSOR symbol works directly
app[TOSI_ACCESSOR].path === 'app'

// returns undefined for non-proxy values
tosiAccessor('hello') === undefined
tosiAccessor({ foo: 1 }) === undefined
```

## `xinValue(x: any): any` (deprecated)

`xinValue` strips the `xin` or `boxed` proxy off of a value.
Passes through non-proxy values unchanged. Prefer `.value` or `.tosi.value`.

```
import { boxed } from 'tosijs'

const foo = { bar: 'hello', baz: 17 }
boxed.foo = foo

boxed.foo.bar === foo.bar               // false, boxed.foo.bar is a proxy
boxed.foo === foo                       // false, boxed.foo is a proxy
boxed.foo.baz === 17                    // false, boxed.foo.baz is a proxy
boxed.foo.bar.value === 'hello'         // true (preferred)
xinValue(boxed.foo.bar) === 'hello'     // true
boxed.foo.baz.value === 17              // true
xinValue(boxed.foo) === xinValue(foo)   // true
foo.xinValue                            // undefined! foo isn't a proxy
```

## `xinPath(x: any): string | undefined` (deprecated)

`xinPath` returns the path of a `xin` or `boxed` proxy. Returns `undefined`
for non-proxy values. Prefer `.path` or `.tosi.path`.
