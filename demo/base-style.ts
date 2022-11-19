import {elements} from '../src/index'

const {style} = elements 

const css = `/* base-style */

:root {
  --font-size: 15px;
  --line-height: 25px;
  --spacing: 10px;
  --item-spacing: calc(var(--spacing) * 0.5);
  --text-color: #222;
  --background: #eee;
  --panel-bg: #ddd;
  --input-bg: #fff;
  --hover-bg: #eef;
  --active-bg: #dde;
  --selected-bg: #ddf;
  --input-border: 1px solid #0004;
  --light-border: 1px solid #fff2;
  --dark-border: 1px solid #0002;
  --rounded-radius: calc(var(--line-height) * 0.25);
}

h1, h2, h3 {
  margin: calc(var(--spacing) * 2) 0 var(--spacing);
}

p, h4, h5, h6, pre, blockquote {
  margin: 0 0 var(--spacing);
}

ul, ol {
  margin: 0 calc(var(--spacing) * 2) var(--spacing) 0;
}

li {
  margin: 0 0 calc(var(--spacing) * 0.5);
}

body {
  background: var(--background);
  color: var(--text-color);
  margin: 0;
}

labeled-input,
labeled-value {
  display: block;
}

label, input, button {
  font-size: var(--font-size);
  padding: 0 var(--spacing);
  line-height: var(--line-height);
}

input, button {
  background: var(--input-bg);
  border: var(--input-border);
}

button:not(:disabled):hover {
  background: var(--hover-bg);
}

button:not(:disabled):active {
  background: var(--active-bg);
}

button {
  border-radius: var(--rounded-radius);
}

input {
  border-radius: calc(0.5 * var(--rounded-radius));
}

[hidden] {
  display: none !important;
}

code, pre {
  font-family: Menlo, monaco, monospace;
}

pre {
  background: var(--code-bg, #333);
  color: var(--code-color, #eee);
  borderRadius: 5px;
}
`

document.head.append(style(css)) 