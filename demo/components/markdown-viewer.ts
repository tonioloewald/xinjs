import { makeWebComponent } from "../../src";
import { marked } from 'marked'

export const markdownViewer = makeWebComponent('markdown-viewer', {
  style: {
    ':host': {
      '--doc-bg': 'white',
      '--doc-padding': '40px',
      display: 'block',
      background: 'var(--doc-bg)',
      padding: 'var(--doc-padding)',
    },
    ':host code, :host pre': {
      fontFamily: 'Menlo, monaco, monospace'
    }
  },
  attributes: {
    src: ''
  },
  value: '# test\n\nhello, world',
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