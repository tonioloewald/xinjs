import { defineSiteConfig } from 'tosijs-ui/site'

const PROJECT = 'tosijs'

// Preview host — `bun run deploy` (dry run) / `bun run deploy --go` pushes the
// built site; `bun run tunnel` (tosijs-tunnel bin) exposes THIS machine's dev
// server (magic-link -> session; requireToken defaults true) for remote
// editing. Both deploy AND tunnel self-register their Caddy fragments on the
// box (rc.1) — no shared-config hand-edits. Hostname convention:
//   <project>.dev.<domain>       read-only static preview (shareable)
//   <project>.edit.dev.<domain>  live workspace (session, always)
// (the local loopback listener self-allocates as PORT + 1 since rc.2)
//
// The values live in `.env` (gitignored, auto-loaded by bun), NOT here: this
// file is public, and a root SSH target plus a tunnel port is a free recon
// step for anyone reading the repo. See `.env.example` for the names; the
// remotePort registry is hand-picked per box (tosijs-ui#29), so it belongs
// with the box, not with the project. With TOSIJS_PREVIEW_HOST unset the
// preview block is omitted entirely and deploy/tunnel refuse to run — which
// is the loud failure we want, not a deploy to somewhere unexpected.
const previewHost = process.env.TOSIJS_PREVIEW_HOST
const preview = previewHost
  ? {
      preview: {
        host: previewHost,
        url: process.env.TOSIJS_PREVIEW_URL,
        tunnel: {
          remotePort: Number(process.env.TOSIJS_TUNNEL_PORT) || undefined,
          url: process.env.TOSIJS_TUNNEL_URL,
        },
      },
    }
  : {}

export default defineSiteConfig({
  name: PROJECT,
  description:
    'Path-based state management for web apps — proxy-based observers, no JSX, no virtual DOM, zero dependencies. Sizes per entry point are in the README.',
  baseUrl: 'https://tosijs.net',

  projectLinks: {
    github: `https://github.com/tonioloewald/${PROJECT}`,
  },
  navbarLinks: [
    { href: 'https://ui.tosijs.net', label: 'tosijs-ui', icon: 'tosi' },
    {
      href: 'https://discord.com/invite/ramJ9rgky5',
      label: 'discord',
      icon: 'discord',
    },
    { href: 'https://loewald.com', label: 'blog', icon: 'blog' },
    {
      href: `https://github.com/tonioloewald/${PROJECT}`,
      label: 'github',
      icon: 'github',
    },
    {
      href: `https://www.npmjs.com/package/${PROJECT}`,
      label: 'npmjs',
      icon: 'npm',
    },
  ],

  favicon: '/favicon.svg',

  libraryTsconfig: './tsconfig.build.json',
  docPaths: [
    'src',
    'README.md',
    'Building-Apps.md',
    'Migration.md',
    'React.md',
    'Angular.md',
    'one-user-interface.md',
    'derived-surface.md',
    'agent-surface.md',
    'trust-and-transports.md',
    'headless-embodiment.md',
    'plan-and-prior-art.md',
  ],
  staticDirs: ['demo/static'],

  // NO `watchPaths` HERE ON PURPOSE. It used to duplicate every root-markdown
  // entry of `docPaths` above, because the dev watcher covered only
  // README.md/src/demo/icons and a root doc edit therefore never rebuilt.
  // tosijs-ui 1.12.0's `resolveWatchPaths()` folds `docPaths` in and dedupes by
  // resolved path (tosijs-ui#49), so the duplicate list is now redundant — and a
  // redundant list is worse than none: it is a second place to forget when a doc
  // is added. `watchPaths` remains the additive override for anything NOT in
  // `docPaths`.
  // dev-only: let the in-browser "edit page source" / live-example "Save to
  // source" read+write the actual repo files via /__docstore/source. Off by
  // default, which makes edit-source fall back to GitHub raw (the last COMMITTED
  // version) — so local, uncommitted edits show stale until this is enabled.
  //
  // Opt-in per session (`TOSI_EDIT=1 bun start`) rather than always-on: the
  // write endpoint authorizes on the peer address alone, so while `bun start`
  // runs, ANY page you visit can POST to it cross-origin (no preflight — the
  // handler JSON-parses a text/plain body), and the confinement-to-repo-root
  // includes `.git/hooks/*`. Firefox does not block it. Upstream fix filed:
  // see UPSTREAM.md § tosijs-ui.
  editableSources: process.env.TOSI_EDIT === '1',

  // pop (or reuse) a browser tab on interactive dev-server start — self-skips
  // for CI, test mode, and non-TTY launches (e.g. agent-driven background runs)
  openBrowser: true,

  ...preview,

  // Inject the haltija dev-channel so a coding agent can drive the live dev
  // page via `hj` (dev-only, serve-time inject, never in built output) —
  // e.g. `hj map` with source tosi-agent against the agent-surface pages
  haltijaDev: true,

  host: 'github-pages',
  // honor PORT so the Playwright e2e lane can run its own dev server on a
  // dedicated port (see playwright.config.ts webServer) without colliding
  // with a `bun start` you have open on 8018
  port: Number(process.env.PORT) || 8018,
  epub: { author: 'Tonio Loewald' },
})
