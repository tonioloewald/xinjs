# filter

Filter lets you filter an object using a filter object, the filter object
being exactly the same as a type object from type-by-example

    const orig = {
      foo: 'bar',
      baz: 17
    }

    const desired = {
      foo: 'test'
    }

    filter(desired, orig) // returns { foo: 'bar' }

Filter will filter arrays based on the elements in the
filter array, e.g.

    const orig = [true, false, 'hello', 17]

    filter([true], orig) // returns [true, false]

    filter([0], orig) // returns [17]

    filter(['test', false], orig) // returns [true, false, 'hello']

    filter([], orig) // returns [...orig]

If the provided object simply doesn't match the type of the
filter then nothing will pass through.

    filter({x: 0, y: 0}, {x: 100, y: 120, z: 17}) // returns {x: 100, y: 120}
    filter({x: 0, y: 0, z: 0}, {x: 100, y: 120})  // returns undefined