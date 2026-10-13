# Contract Validation

Contracts (a component's `static contract`, an element's inline `contract`)
are enforced by one gate, shared by every declaration site. The gate is two
layers:

1. the **built-in structural subset** — `type`, `enum`, `const`. Zero
   dependencies, always on, covers the common case.
2. an optional **full schema engine** you register. Everything else a schema
   can say (`required`, `minimum`, `pattern`, `items`, …) is inert until you
   plug one in — tosijs warns once per unenforceable keyword set so a
   contract never quietly means less than it says.

    import { setContractValidator, getContractValidator } from 'tosijs'
    import { validate } from 'tosijs-schema'

    setContractValidator((value, schema) =>
      validate(value, schema) ? true : new Error('schema violation')
    )

A validator returns `true` or an `Error` whose `message` becomes the
violation reason.

## The plug is a security boundary

It is process-global: whoever calls it last decides what "valid" means for
the whole app — including code you did not write but did bundle. So:

- **Replacing an installed validator warns**, loudly, naming what was
  swapped for what. Removing one (`setContractValidator(null)`) warns too:
  uninstalling enforcement is the same event wearing a different hat.
- **`getContractValidator()`** reads back what is actually installed, so an
  app, a test, or an audit can assert on it rather than assume.
- **`setContractValidator(validate, { final: true })`** locks it: any later
  attempt to replace or remove it **throws** instead of warning. Lock in
  your own startup path and no dependency can downgrade you afterwards.

Re-registering the *same* function is a no-op (a module evaluated twice, or
hot reload, must not trip the lock).

> The built-in subset keeps running whatever happens here, so the worst a
> hostile replacement can do is a downgrade, not a bypass.
