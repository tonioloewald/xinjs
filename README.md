# xinjs

- state management for modern web and node applications
- written in TypeScript
- incredibly lightweight
- works anywhere (browsers, node, bun, electron etc.)

`xinjs` takes the most valuable part of `b8r`, i.e. the `registry`,
ports it to Typescript (mostly for autocomplete), and implements it 
with no browser dependencies so it can work just as well on the server as the client.

In particular, this means that you can do your state management *anywhere*,
including on either side of the "browser" divide in Electron / nwjs and
similar applications. You can also write stateful-stateless servers by
sending mutations to complex state to the server.

## Development

I'm using [bun](https://bun.sh/) to develop xinjs. It's insanely fast but
also kind of bleeding edge. It runs typescript directly. If you want to work
on xinjs you'll probably want to install the latest version of bun (in addition
to [nodejs](https://nodejs.org)).