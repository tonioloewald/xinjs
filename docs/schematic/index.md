# schematic (EXPERIMENTAL)

`schematicSVG(description)` renders `agent.describe()` output as an SVG
string — one rectangle per visible wired element at its **actual position and
size** (`bounds` rides in the map), captioned from the map, optionally wearing
the app's computed colors (`describe({ styles: true })`).

    import { enableAgentInterface, schematicSVG } from 'tosijs'

    const agent = enableAgentInterface()
    const svg = schematicSVG(agent.describe({ styles: true }))

It is a **pure function over plain data** — no DOM, no layout engine, no
screenshots — so it runs anywhere the description can travel: in the page, in
a headless embodiment, or on the far side of a wire from an app nobody is
viewing.

Division of labor per consumer: **JSON for text reasoning**, **rasterized
PNG for vision encoders** (rasterize the SVG at 2× so labels OCR cleanly —
canvas in a browser, `@resvg/resvg-js` under bun), **SVG for humans and
tools** (deterministic, diffable, and each `<g>` carries `data-record="<i>"`
linking it back to `description.wiring[i]` — the image as index).

> **EXPERIMENTAL.** Ships alongside the agent surface; shapes may change.
