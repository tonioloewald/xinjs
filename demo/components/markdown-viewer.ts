import { Component } from "../../src";
import { marked } from 'marked'

class MarkdownViewer extends Component {
  src = ''
  value = ''
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
    } else {
      this.value = this.textContent != null ? this.textContent : ''
    }
  }
  render() {
    super.render()
    this.innerHTML = marked(this.value)
  }
}

export const markdownViewer = MarkdownViewer.elementCreator()
