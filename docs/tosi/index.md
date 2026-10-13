# Managing State
<!--{ "order": 4, "description": "The tosi observer proxy: wraps your application state and surgically updates bound DOM elements when you change properties through it." }-->

The core value add of `tosijs` is the `tosi` observer proxy. It wraps around vanilla javascript object, observes changes passed through it and updates bound UI elements surgically.

To see how `tosi` syncs state to the UI, you should also look at [bind](/bind/).

> The goal of `tosi` is to make updating the user interface essentially an O(1) operation. (A key part of this is built-in support for virtual array bindings.) It also reframes keeping state in sync with the UI as a matter of *wiring* state from data *paths* to interested *elements* (and, where needed, *observers*). This is how the Mac and NeXT UIs worked, rather than the "reactive" idea of UI = f(State), which is fundamentally flawed.

<!-- toc -->
- [The tosi proxy](/xin/)
- [metadata](/metadata/)
- [path-listener](/path-listener/)
- [tosi, xin, and xinProxy](/xin-proxy/)
<!-- /toc -->
