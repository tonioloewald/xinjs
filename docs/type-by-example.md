# type by example

The goal of this module is to provide simple, effective type-checking "by example" -- i.e. in
common cases an example of a type can function as a type.

Certain specialized types — enumerations in particular — are supported in a way that still allows types
to be encoded as JSON. These types are specified using a string starting with a '#'. (It follows that
you shouldn't use strings starting with '#' as examples of strings.)

> Ultimately, the goal of this module is to provide a single source of truth for types
> during static analysis, runtime, for mocks, and for filters.

As a side-benefit, it is also capable of driving mock-data and optimistic rendering.
Annotations in example data can provide hints as to how to generate mock data for
testing purposes and for rendering user interfaces before live data is available.

General usage is:

    matchType(example, subject) // returns empty list if subject has same type as example
      // returns a list of problems discovered otherwise
E.g.

    matchType(0, 17) // [] -- no errors
    matchType('foo', 17) // ["was number, expected string"]

This is most useful when comparing objects, e.g.

    matchType({foo: 17, bar: 'hello'}, {foo: 0, bar: 'world'}) // [] -- no errors
    matchType({foo: 17, bar: 'hello'}, {bar: 'world'}) // [".foo was undefined, expected number"]
    matchType({foo: 17, bar: 'hello'}, {foo: 0, bar: 17}) // [".bar was number, expected string"]

If the example includes arrays, the elements in the array are assumed to be the valid examples
for items in the array, e.g.

    matchType([{x: 0, y: 0}, {long: 0, lat: 0, alt: 0}], []) // [] -- no errors
    matchType([{x: 0, y: 0}, {long: 0, lat: 0, alt: 0}], [{x: 10, y: 10}, {x: -1, y: -1}]) // []
    matchType([{x: 0, y: 0}, {long: 0, lat: 0, alt: 0}], [{lat: -20, long: 40, alt: 100}]) // []
    matchType([{x: 0, y: 0}, {long: 0, lat: 0, alt: 0}], [{x: 5, y: -5}, {long: 20}])
      // ["[1] had no matching type"]
    matchType([{x: 0, y: 0}, {long: 0, lat: 0, alt: 0}], [{x: 5}, {long: 20}])
      // ["[0] had no matching type", "[1] had no matching type"]

For efficiency, put the most common example elements in example arrays first (since checks are
performed in order) and do not include unnecessary elements in example arrays.

## Specific Types

Some specific types can be defined using strings that start with '#'. (It follows that you should not
use strings starting with '#' as type examples.)

`specficTypeMatch` is the function that evaluates values against specific types. (Typically you
won't use it directly, but use matchType instead.)

    specificTypeMatch('#int [0,10]', 5) === true   // 0 ≤ 5 ≤ 10
    specificTypeMatch('#int [0', -5)    === false  // -5 is less than 0
    specificTypeMatch('#int', Math.PI)  === false  // Math.PI is not a whole number

### #enum

    specificTypeMatch('#enum true|null|false', null)                      === true
    specificTypeMatch('#enum true|null|false', 0)                         === false
    specificTypeMatch('#enum "get"|"post"|"put"|"delete"|"head"', 'head') === true
    specificTypeMatch('#enum "get"|"post"|"put"|"delete"|"head"', 'save') === false

You can specify an enum type simply using a bar-delimited sequence of JSON strings
(if you're transmitting a type as JSON you'll need to escape the '"' characters).

### #int and #number

    specificTypeMatch('#int [0,10]', 5)          === true   // 0 ≤ 5 ≤ 10
    specificTypeMatch('#int [0,\u221E]', -5)          === false  // -5 is less than 0
    specificTypeMatch('#int [0', -5)             === false  // -5 is less than 0
    specificTypeMatch('#int', Math.PI)           === false  // Math.PI is not a whole number
    specificTypeMatch('#number (0,4)', Math.PI)  === true   // 0 < Math.PI < 4

You can specify whole number types using '#int', and you can restrict #int and #number values
to **ranges** using, for example, '#int [0,10]' to specify any integer from 0 to 10 (inclusive).

Use parens to indicate exclusive bounds, so '#number [0,1)' indicates a number ≥ 0 and < 1.
(In case you're wondering, this is standard Mathematical notation.)

You can specify just a lower bound or just an upper bound, e.g. '#number (0' specifies a positive
number.

### #union

    specificTypeMatch('#union string||int', 0)                            === true
    specificTypeMatch('#union string||int', 'hello')                      === true
    specificTypeMatch('#union string||int', true)                         === false

You can specify a union type using #union followed by a '||'-delimited list of allowed
types. (Why '||'? '|' is quite common in regular expressions and you might want to use
a regex specified string type as an option.)

### #forbidden

This type can be used for forbidding the presence of a property within an object
(it's not the same as `undefined`, e.g. `Object.assign({foo: 'bar'}, {foo: undefined})`
is not the same as `Object.assign({foo: 'bar'}, {})`. If nothing else, it can trap
mistyped property names.

It's particularly useful in conjunction with wildcard property specifiers, e.g. pointType
specifies an object with numerical properties `x` and `y` *and nothing else*.

    pointType = {
      x: 1.5,
      y: 2.2,
      '#.*': '#forbidden'
    }

You can also enforce naming conventions, this type only allows properties that are
legal javascript variable names, but excludes those starting with underscore or
containing a '$' sign.

    someType = {
      '#(_.*|.*$.*)': '#forbidden',
      '#': '#any',
      '#.*': #forbidden'
    }

### #any

You can specify any (non-null, non-undefined) value via '#any'.

### #instance — built-in types

You can specify a built-in type, e.g. `HTMLElement` value via '#instance ConstructorName', in
this example '#instance HTMLElement'.

    matchType('#instance HTMLElement', document.body) // returns [] (no errors)

### #?... — optional types

You can denote an optional type using '#?<type>'. Both `null` and `undefined` are acceptable.

Inside objects, which applies to most type declarations, you can use the more convenient
and intuitive option of adding a `?` to the key, so:

    const mightHaveFooType = {
      foo: '#?number'
    }

And:

    const mightHaveFooType = {
      'foo?': 17
    }

ÔøΩare equivalent.

But, I hear you cry, what if I actually want a property named 'foo?' Well, I pity you,
but it's possible to do this using the syntax for declaring maps:

    const definitelyHasFooQueryType = {
      '#foo\\?': 17
    }

> #### More Types and Custom Types
>
> This mechanism will likely add new types as the need arises, and similarly may afford a
> convenient mechanism for defining custom types that require test functions to verify.

### #regexp — string tests

You can specify a regular expression test for a string value by providing the string you'd use
to create a `RegExp` instance. E.g. '#regexp ^\\d{5,5}$' for a simple zipcode type.

    matchType('#regexp ^\\d{5,5}$', '90210') // returns [] (no errors)
    matchType('#regexp ^\\d{5,5}$', '2350') // returns ["was "2350", expected #regexp \d{5,5}"]

## `describe`

A simple and useful wrapper for `typeof` is provided in the form of `describe` which
gives the typeof the value passed unless it's an `Array` (in which case it returns
'array') or `null` (in which case it returns 'null')

    describe([]) // 'array'
    describe(null) // 'null'
    describe(NaN) // 'NaN'
    describe(-Infinity) // 'number'

## Notes on Performance

I've done some rough performance testing of `typeSafe` and added a simple
optimization. The test code simply performed an add operation 1,000,000
times inline, wrapped in a function, wrapped in a trivial wrapper function, and
using a `typeSafe` function.

In essence, the overhead for typeSafe functions (on my recent, pretty fast,
Windows laptop) is about 350ms/million calls checked by typeSafe.

Note that many frameworks end up wrapping all your functions several times
for various reasons, doing non-trivial work in the wrapper. In any event,
if even _this_ much of an overhead is abhorrent, simply don't use typeSafe
in performance critical situations, or call it outside a loop rather than inside.

(E.g. if you're iterating across a lot of data in an array, typecheck a function
that takes the array, not a function that processes all the elements -- matchType
does not check every element of a large array.)

The obvious place to use typeSafe functions is when communicating with services,
and here any overhead is insignificant compared with network or I/O.

## Object Keys

**Important Note**: key properties are evaluated in the order they
appear in the object. This is very important for regex keys.

It's frequently necessary to declare objects which might have any
number of properties. You can declare an object as `{}` and it
will be allowed to have any number of crazy properties, or you
can use strings prefixed by `#` as the key to denote restrictions
on possible keys.

(And, of course, you can declare a property name that *actually* starts
with a '#' symbol by putting it in the regex, so '##foo' defines a
property named '#foo'. You can even require a property named '#//'
if you want to.)

As a bonus, we can use the same method for embedding comments in
serialized types! A property named '#//' is ignored by matchType
(and can be treated as a comment -- you could even put an array of
string in it for a long comment)

E.g.

    const mapType = {
      '#//': 'This is an example (and this is a comment)',
      '#': 'whatevs'
    }

This declares an object which can have any properties that would be
allowed as javascript variable names, as long as the values are strings.

If you want to allow absolutely anything to be used as a key you could
declare:

    const mapType = {
      '#.*': '#?any'
    }

(This is pretty much the same as just declaring `mapType = {}`.)

If the type has anything after the '#' besides '//' (which denotes a comment)
then that will be treated as the body of a `RegExp` with `^` at the start and
`$` at the end, so '#.*' allows any key that matches `/^.*$/` (which is anything,
including an empty string).

(Yeah, it doesn't allow for pathological cases, like `undefined` and `null` as keys,
but our goal isn't to support programmers who want to declare types that appear as WTF
examples of bad Javascript.)

It follows that the key '#' is equivalent to:

    '#[a-zA-Z_$][a-zA-Z_$0-9]*'

So you could declare an object like this:

    const namingConventionType = {
      '#is\w+': true,
      '#_': '#forbidden'
    }

Or hell, enforce some variant of *Hungarian Notation*:

    const hungarianObject = {
      '#bool[A-Z]\\w+': true,
      '#txt[A-Z]\\w+': 'whatevs',
      '#int[A-Z]\\w+': '#int',
      '#float[A-Z]\\w+': 3.14,
      ...
    }

## Strongly Typed Functions

`typeSafe` adds run-time type-checking to functions, verifying the type of both
their inputs and outputs:

    import {typeSafe} from 'xinjs'
    const safeFunc = typeSafe(func, paramTypes, resultType, name)

- `func` is the function you're trying to type-check.
- `paramTypes` is an array of types.
- `resultType` is the type the function is expected to return (it's optional).
- `name` is optional (defaults to func.name || 'anonymous')

For example:

    const safeAdd = typeSafe((a, b) => a + b, [1, 2], 3, 'add')

A typeSafe function that is passed an incorrect set of parameters, whose original
function returns an incorrect set of paramters will return an instance of `TypeError`.

`TypeError` is a simple class to wrap the information associated with a type-check failure.
Its instances five properties and one method:
- `functionName` is the name of the function (or 'anonymous' if none was provided)
- `isParamFailure` is true if the failure was in the inputs to a function,
- `expected` is what was expected,
- `found` is what was found,
- `errors` is the array of type errors.
- `toString()` renders the `TypeError` as a string

A typeSafe function that is passed or more `TypeError` instances in its parameters will return
the first error it sees without calling the wrapped function.

typeSafe functions are self-documenting. They have two read-only properties `paramTypes` and
`resultType`.

typeSafe functions are intended to operate like
[monads](https://en.wikipedia.org/wiki/Monad_(functional_programming)),
so if you call `safe_f(safe_g(...))` and `safe_g` fails, `safe_f` will _short-circuit_ execution and
return the error directly -- which should help with debugging and prevent code executing
on data known to be bad.