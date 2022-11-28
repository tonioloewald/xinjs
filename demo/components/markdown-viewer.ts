import { makeWebComponent, vars } from "../../src";
import { marked } from 'marked'

export const markdownViewer = makeWebComponent('markdown-viewer', {
  style: {
    ':host': {
      display: 'block',
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