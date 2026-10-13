import * as tosijs from './index'
import * as agent from './index-agent'
import * as tosijsuiCore from 'tosijs-ui'
// The doc system is NOT in tosijs-ui's root barrel (since 1.14.0, tosijs-ui#133),
// so the bundle built for the doc site imports it by subpath. Without these four
// the build stays green and every page serves, but `<tosi-doc-system>` and
// `<tosi-example>` are never defined: no live examples, and no inline doc tests.
// `strict: true` in tosijs-site.config.ts does not see this bundle (it inspects
// `bundleEntry`, which we do not use), so `tests/doc-tests.pw.ts` is the gate ("no inline doc tests ran").
import * as codeEditor from 'tosijs-ui/code-editor'
import * as highlightBlock from 'tosijs-ui/highlight-block'
import * as docBrowser from 'tosijs-ui/doc-browser'
import * as liveExample from 'tosijs-ui/live-example'

const tosijsui = {
  ...tosijsuiCore,
  ...codeEditor,
  ...highlightBlock,
  ...docBrowser,
  ...liveExample,
}

// The DOC bundle merges the agent subpath into the `tosijs` global so live
// examples can exercise it. Doc fences still IMPORT from 'tosijs/agent' —
// the live-example rewriter destructures from this global by specifier, and
// what a reader copies must be the real path.
const merged = { ...tosijs, ...agent }
Object.assign(globalThis, {
  tosijs: merged,
  'tosijs/agent': agent,
  tosijsui,
  xinjs: merged,
  xinjsui: tosijsui,
})
