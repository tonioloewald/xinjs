# Development
<!--{ "pin": "bottom", "order": 890, "description": "Working on tosijs itself: installing, the dev server, tests, the build, and where tasks and conventions live." }-->

This page is for working on `tosijs` itself. To *use* it, start at
[Start Here](/start-here/).

You'll need [bun](https://bun.sh/) (the version in `.bun-version`), then `bun install`.

    bun start                  # dev server with hot reload (https://localhost:8018)
    bun test                   # run the unit tests
    bun run test:browser       # run the real-browser tests (Chromium and Firefox)
    bun run build              # production build (runs tests, then bundles + docs)
    bun run format             # lint and format (ESLint + Prettier)
    bun pack                   # create a local package tarball

The dev server uses HTTPS and needs local certificates: run `bun run tls` once.

Two switches for the dev server:

- `HALTIJA=0 bun start` runs without the agent dev channel, which otherwise
  replaces `alert()`, `confirm()` and `prompt()` with silent recorders.
- `TOSI_EDIT=1 bun start` lets the site's "edit page source" read and write the
  files in your checkout.

The documentation you are reading is built from this repository: the markdown
files at the top level and in `src/docs/`, and the `/*# … */` comment blocks in
the source files. Code fences tagged `js`, `html`, `css` or `test` in those are
live examples and run in the page.

- Tasks are tracked on the [virta board](https://virta.tosijs.net/host/#?virta.scope=tosijs).
- Conventions shared across the tosijs projects are in
  [tosijs-coding-practices](https://github.com/tonioloewald/tosijs-coding-practices).
- [`CHANGELOG.md`](https://github.com/tonioloewald/tosijs/blob/main/CHANGELOG.md) records every release.
