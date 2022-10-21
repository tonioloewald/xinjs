# by-path
## object queryies using string paths

Copyright ©2016-2022 Tonio Loewald

> Note that these are low-level methods that `b8r` does not expose.
> `b8r.getByPath` and `b8r.setByPath` are deprecated (use `b8r.set` and `b8r.get` instead).
> See the [Data Registry](?source=source/b8r.registry.js) documentation for more useful information.

    getByPath(obj, 'path.to.value')

Obtains a value inside an object by a path, e.g.
getByPath(obj, "foo.bar") is the equivalent of obj.foo.bar
if path is not set or is set to '/' then obj is returned.

    setByPath(obj, 'path.to.value', new_value)

sets a value inside an object by a path,
e.g. setByPath(obj, "foo.bar", 17) is the equivalent of obj.foo.bar = 17.

    deleteByPath(obj, 'path.to.value');

if a value exists at the stipulated path it will be deleted. If not, nothing will happen.

## Examples

Given:

    const obj = {
      foo: 17,
      bar: [1,2,3],
      baz: [
        {id: 17, name: "fred"},
        {id: 42, name: "bloggs"},
        {id: 99, name: "feldon", deeper: {and_deeper: 4}}
      ]
    }

The following paths work:

    foo → 17
    [=foo] → 17
    bar[1] → 2
    baz[1].id → 42
    [=baz][1][=id] → 42
    baz[id=17].name → "fred"
    baz[deeper.and_deeper=4].name → "fred"

The last two examples are examples of **id paths**…

## id paths

Arrays of objects, including heterogenous objects, are a common pattern
in web applications. E.g. you might have an array of messages and the messages
may have different types.

Using id paths, it is possible to reference elements by an id path and
corresponding value rather than simple indices. This allows efficient updating
of lists, e.g.

```
<p>Inspect the DOM to see what's going on!</p>
<ul>
  <li
    data-list="_component_.list:id"
    data-bind="text=.name"
  ></li>
</ul>
<input data-bind="value=_component_.list[id=12].name">
<script>
  list = [
    {id: 5, name: "Tom"},
    {id: 75, name: 'Dick'},
    {id: 12, name: 'Harry'}
  ];
  set({list});
</script>
```

## Type Matching

setByPath tries to match the type of values that are replaced, e.g.

    const obj = {foo: 17};
    setByPath(obj, 'foo', '2'); // '2' will be converted to a Number

This can be tricky when dealing with nullable objects, in particular:

    const obj = {foo: false};
    setByPath(obj, {bar: 17}); // {bar: 17} will be converted to Boolean true

In this case, you want the absence of an object to be either undefined
(or a missing value) or `null`:

    const obj = {foo: null};
    setByPath(obj, {bar: 17}); // {bar: 17} will not be converted