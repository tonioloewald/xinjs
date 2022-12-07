import { Component } from "../../src";
import { marked } from 'marked'

class MarkdownViewer extends Component {
  styleNode = Component.StyleNode({
    ':host': {
      display: 'block',
    },
    '::slotted(blockquote), ::slotted(pre)': {
      padding: 'var(--spacing, 20px)'
    }
  })
  src = ''
  value = '# markdown viewer\n\nI render my value (in markdown) as HTML.'
  constructor() {
    super()
    this.initAttributes('src')
  }
  connectedCallback(): void {
    super.connectedCallback()
    if (this.src !== '') {
      (async () => {
        const request = await fetch(this.src)
        this.value = await request.text()
      })()
    }
  }
  render() {
    super.render()
    this.innerHTML = marked(this.value)
  }
}

export const markdownViewer = MarkdownViewer.elementCreator()
