#!/usr/bin/env node

// bin/cli.ts
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// src/version.ts
var version = "1.11.0";

// bin/cli.ts
var [command, kind, rawName, ...flags] = process.argv.slice(2);
function fail(message) {
  console.error(`tosijs: ${message}`);
  console.error("try: bunx tosijs help");
  process.exit(1);
}
function help() {
  console.log(`tosijs ${version} — scaffolder

  bunx tosijs create app <name>              app project (bun index.html to run)
  bunx tosijs create component <tag>         component, blueprint form (default)
  bunx tosijs create component <tag> --bare  component, plain class form
  bunx tosijs create blueprint <tag>         publishable blueprint package

Component/blueprint tags need a dash (custom-element rule): my-thing, not thing.
Everything scaffolded carries a contract — agent-ready, self-verifying.`);
}
var kebab = (name) => /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name);
var className = (tag) => tag.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
var camel = (tag) => {
  const cls = className(tag);
  return cls[0].toLowerCase() + cls.slice(1);
};
function write(path, content) {
  writeFileSync(path, content);
  console.log(`  ${path}`);
}
function contractSource(tag) {
  return `export const contract = {
  description: '${tag}: counts button presses — replace with what YOURS does',
  value: { type: 'integer', examples: [0, 3] },
  parts: { readout: 'span', increment: 'button' },
  tests: [
    {
      name: 'pressing increments and renders',
      steps: [
        { set: { value: 2 } },
        { click: 'increment' },
        { expect: { value: 3, text: { readout: '3' } } },
      ],
    },
  ],
} as const satisfies ComponentMap`;
}
function componentBody(elementsType = "any") {
  return `    value = 0

    content = ({ span, button }: ${elementsType}) => [
      span({ part: 'readout' }),
      button(
        {
          part: 'increment',
          onClick: () => {
            this.value = Number(this.value) + 1
          },
        },
        '+1'
      ),
    ]

    render() {
      this.parts.readout.textContent = String(this.value)
    }`;
}
function blueprintFormSource(tag) {
  const cls = className(tag);
  return `/**
 * ${tag} — scaffolded by \`tosijs create component\` (blueprint form).
 *
 * Consume WITHOUT a build step, straight from markup:
 *
 *     <tosi-loader>
 *       <tosi-blueprint tag="${tag}" src="./path/to/${tag}.js"></tosi-blueprint>
 *     </tosi-loader>
 *     <${tag}></${tag}>
 *
 * …or in code: \`makeComponent('${tag}', blueprint)\`. The type-only tosijs
 * import erases at build time — a bundled blueprint has ZERO dependencies
 * (everything arrives via the factory argument at hydration).
 *
 * The contract makes it agent-ready and self-verifying:
 * \`exerciseComponent(element)\` runs the declared test wherever it mounts.
 */
import type { TosiBlueprint, ComponentMap } from 'tosijs'

${contractSource(tag)}

const blueprint: TosiBlueprint = (tag, { Component }) => {
  class ${cls} extends (Component as any) {
    static contract = contract

${componentBody()}
  }
  return { type: ${cls} as any, contract }
}

export default blueprint
`;
}
function bareFormSource(tag) {
  const cls = className(tag);
  return `/**
 * ${tag} — scaffolded by \`tosijs create component --bare\` (plain class form).
 *
 *     import { ${camel(tag)} } from './${tag}'
 *     document.body.append(${camel(tag)}())
 *
 * The contract makes it agent-ready and self-verifying:
 * \`exerciseComponent(element)\` runs the declared test wherever it mounts.
 * (Prefer the blueprint form unless you have a reason: blueprints are
 * consumable directly from markup with no build step on the consumer side.)
 */
import { Component, type ComponentMap, type ElementsProxy } from 'tosijs'

${contractSource(tag)}

export class ${cls} extends Component<typeof contract> {
  static preferredTagName = '${tag}'
  static contract = contract

${componentBody("ElementsProxy")}
}

export const ${camel(tag)} = ${cls}.elementCreator()
`;
}
function createComponent(tag, bare) {
  if (!tag)
    fail("component needs a tag: bunx tosijs create component my-thing");
  if (!kebab(tag) || !tag.includes("-")) {
    fail(`"${tag}" is not a valid custom-element tag (kebab-case with a dash) — try "tosi-${tag}"`);
  }
  const file = `${tag}.ts`;
  if (existsSync(file))
    fail(`${file} already exists`);
  console.log(`component ${tag} (${bare ? "bare class" : "blueprint"} form):`);
  write(file, bare ? bareFormSource(tag) : blueprintFormSource(tag));
  console.log(bare ? `
import { ${camel(tag)} } from './${tag}' and append ${camel(tag)}()` : `
consume from markup:
  <tosi-loader>
    <tosi-blueprint tag="${tag}" src="./${file.replace(/\.ts$/, ".js")}"></tosi-blueprint>
  </tosi-loader>
  <${tag}></${tag}>
or in code: makeComponent('${tag}', blueprint)`);
}
function createBlueprint(tag) {
  if (!tag)
    fail("blueprint needs a tag: bunx tosijs create blueprint my-thing");
  if (!kebab(tag) || !tag.includes("-")) {
    fail(`"${tag}" is not a valid custom-element tag (kebab-case with a dash) — try "tosi-${tag}"`);
  }
  if (existsSync(tag))
    fail(`directory ${tag}/ already exists`);
  mkdirSync(join(tag, "src"), { recursive: true });
  console.log(`blueprint package ${tag}/:`);
  write(join(tag, "package.json"), JSON.stringify({
    name: tag,
    version: "0.1.0",
    description: `${tag} — a tosijs blueprint (consumable directly from markup)`,
    type: "module",
    module: "dist/index.js",
    files: ["dist"],
    scripts: {
      build: "bun build src/index.ts --outdir dist --format esm",
      start: "bun run build && bun index.html",
      prepublishOnly: "bun run build"
    },
    devDependencies: { tosijs: `^${version}` }
  }, null, 2) + `
`);
  write(join(tag, "src", "index.ts"), blueprintFormSource(tag));
  write(join(tag, "index.html"), `<!DOCTYPE html>
<title>${tag}</title>
<script type="module">
  // registers <tosi-blueprint>/<tosi-loader> (and still hydrates pre-rename
  // xinjs blueprints). The <tosi-loader> WRAPPER IS REQUIRED: hydration is
  // driven by the loader's connectedCallback, so a bare <tosi-blueprint>
  // renders nothing, silently — which is what this scaffold used to emit.
  import 'https://cdn.jsdelivr.net/npm/tosijs@${version}/dist/module.js'
</script>
<h1>${tag}</h1>
<tosi-loader>
  <tosi-blueprint tag="${tag}" src="./dist/index.js"></tosi-blueprint>
</tosi-loader>
<${tag}></${tag}>
`);
  write(join(tag, "README.md"), `# ${tag}

A [tosijs](https://tosijs.net) blueprint: a component consumers load
**directly from markup** — no build step, no framework install on their side:

    <script type="module">
      import 'https://cdn.jsdelivr.net/npm/tosijs@${version}/dist/module.js'
    </script>
    <tosi-loader>
      <tosi-blueprint tag="${tag}" src="https://cdn.jsdelivr.net/npm/${tag}@0.1.0/dist/index.js"></tosi-blueprint>
    </tosi-loader>
    <${tag}></${tag}>

The bundle has zero dependencies (tosijs arrives via the hydration factory),
and the component carries a **contract** — it self-describes on the agent
surface and self-verifies via \`exerciseComponent()\`.

## develop

    bun start          # build + demo page

## publish

    npm publish        # prepublishOnly builds dist/
`);
  console.log(`
cd ${tag} && bun start`);
}
function createApp(name) {
  if (!name)
    fail("app needs a name: bunx tosijs create app my-app");
  if (!kebab(name))
    fail(`"${name}" is not kebab-case`);
  if (existsSync(name))
    fail(`directory ${name}/ already exists`);
  const tag = name.includes("-") ? name : `${name}-counter`;
  mkdirSync(join(name, "src", "components"), { recursive: true });
  console.log(`app ${name}/:`);
  write(join(name, "package.json"), JSON.stringify({
    name,
    version: "0.0.1",
    private: true,
    type: "module",
    scripts: { start: "bun index.html" },
    dependencies: { tosijs: `^${version}` }
  }, null, 2) + `
`);
  write(join(name, "index.html"), `<!DOCTYPE html>
<title>${name}</title>
<main id="app"></main>
<script type="module" src="./src/app.ts"></script>
`);
  write(join(name, "src", "components", `${tag}.ts`), blueprintFormSource(tag));
  write(join(name, "src", "app.ts"), `import { tosi, elements, makeComponent, enableAgentInterface } from 'tosijs'
import counterBlueprint from './components/${tag}'

const { app } = tosi({
  app: {
    greeting: 'Hello from ${name}',
  },
})

const { creator: ${camel(tag)} } = await makeComponent('${tag}', counterBlueprint)

const { h1, p } = elements
document.querySelector('#app')!.append(
  h1({ textContent: app.greeting }),
  p('This component was born with a contract — open the console and explore:'),
  ${camel(tag)}()
)

// The agent surface: your app describes itself to agents, test harnesses
// and the console (\`tosiAgent\` in devtools), and registers WebMCP tools
// where the browser provides a host.
//
// This is the PRODUCTION shape — an allowlist. Nothing outside it can be
// read, written or called, and a manifest scopes SIGHT only: add
// \`write: true\` when you want an agent to be able to change this state.
enableAgentInterface({
  expose: {
    roots: ['app'],
    actions: [],
  },
})
// While developing, widen it deliberately (everything readable, writable
// and callable through globalThis.tosiAgent — including by any third-party
// script on the page):
//   enableAgentInterface({ expose: 'all' })
`);
  write(join(name, "README.md"), `# ${name}

Scaffolded by \`bunx tosijs create app\`.

    bun install
    bun start          # bun serves index.html and prints the URL (plain http)

Open the console: \`tosiAgent.describe()\` is your app's live map — state,
wiring, actions. The scaffolded component carries a contract, so it
self-describes there and self-verifies via \`exerciseComponent()\`.

## the agent surface is an allowlist

\`src/app.ts\` enables it in the production shape: only what you name under
\`expose.roots\` / \`expose.actions\` can be read or called, and a manifest
scopes SIGHT — add \`write: true\` to let an agent change that state. Widen it
while developing with \`enableAgentInterface({ expose: 'all' })\` — every
state root readable, writable and callable — so it is a development
affordance, not a default. Omitting \`expose\` entirely exposes **nothing** —
\`describe()\` reports an empty app and every verb refuses, so declaring a
manifest is how the surface becomes useful at all.

Two things to know either way. The surface installs itself as
\`globalThis.tosiAgent\` unless you pass \`global: false\`; that global is a
convenience, not a boundary — any script already running on your origin can
reach your state with or without it — but it is worth turning off in a page
that hosts third-party script. And \`expose\` scopes the MAP as well as the
state: an element reaches \`describe()\` by being declared — bound to an
in-scope path, or carrying an in-scope handler — never by merely existing in
the DOM. \`describe({ scope })\` narrows to a subtree on top of that. In a
freshly scaffolded app \`roots: ['app']\` is the entire state tree, so the
narrowing starts out nil — it becomes real as your state grows past what an
agent needs.
`);
  console.log(`
cd ${name} && bun install && bun start`);
}
if (command === "help" || command === "--help" || command === "-h" || command == null) {
  help();
} else if (command === "version" || command === "--version" || command === "-v") {
  console.log(version);
} else if (command === "create") {
  const bare = flags.includes("--bare") || rawName === "--bare";
  const name = rawName === "--bare" ? flags.find((f) => f !== "--bare") ?? "" : rawName;
  if (kind === "app")
    createApp(name);
  else if (kind === "component")
    createComponent(name, bare);
  else if (kind === "blueprint")
    createBlueprint(name);
  else
    fail(`unknown kind "${kind}" — app, component, or blueprint`);
} else {
  fail(`unknown command "${command}"`);
}
