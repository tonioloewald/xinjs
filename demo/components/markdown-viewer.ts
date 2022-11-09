import { makeWebComponent } from "../../src";
import { marked } from 'marked'

export const markdownViewer = makeWebComponent('markdown-viewer', {
  style: {
    ':host': {
      '--doc-bg': 'white',
      display: 'block',
      background: 'var(--doc-bg)',
    },
    '::slotted(a)': {
      background: 'red'
    },
    '::slotted(code), ::slotted(pre)': {
      background: 'var(--code-bg, #222)',
      color: 'var(--code-color, #eee)',
      borderRadius: '5px',
      fontFamily: 'Menlo, monaco, monospace'
    },
    '::slotted(blockquote), ::slotted(pre)': {
      padding: 'var(--spacing, 20px)'
    }
  },
  attributes: {
    src: ''
  },
  value: '# markdown viewer\n\nI render my value (in markdown) as HTML.',
  connectedCallback() {
    if(this.src !== '') {
      const load = async () => {
        const request = await fetch(this.src)
        this.value = await request.text()
      }
      load()
    }
  },
  render() {
    this.innerHTML = marked(this.value)
  }
})