# Entry Points
<!--{ "order": 6.5, "description": "Which tosijs import to use: the full library, the slim tosijs/core, the DOM-free tosijs/state, the agent surface, or a script tag. An overview with links to the detail." }-->

`tosijs` is one library with several doors. Most projects only need the first.

| import | use it when |
| --- | --- |
| `tosijs` | Always, unless you have a reason. Bundlers remove what you do not import. |
| [`tosijs/core`](/index-core/) | You want the smallest bundle with the DOM features and do not use blueprints, `share`/`sync`, `hotReload` or the agent surface. |
| [`tosijs/state`](/index-state/) | You want only the state layer, with no DOM: Node, workers, server rendering, tests. |
| [`tosijs/agent`](/index-agent/) | You want the agent surface with a narrower set of types. It is the same file as `tosijs`. |
| `<script src=…>` | You want to load components from markup with `<tosi-blueprint>` and no build step. It sets no global. |

The size of each, measured by the build, is in the
[README's entry points table](/#entry-points), along with why `tosijs/agent`
shares a file with `tosijs` and why `tosijs/core` is something you opt in to.

To use the API in a page with no build step, import the module from a CDN:

    <script type="module">
      import { tosi, elements } from 'https://cdn.jsdelivr.net/npm/tosijs/dist/module.js'
    </script>

<!-- toc -->
- [tosijs/core (slim entry)](/index-core/)
- [tosijs/state (DOM-free)](/index-state/)
<!-- /toc -->
