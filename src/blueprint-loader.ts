import { Component } from './component'
import { makeComponent } from './make-component'

export class BlueprintLoader extends Component {
  tag: string | null = null
  property = 'default'
  blueprint: string | null = null

  constructor() {
    super()
    this.initAttributes('tag', 'blueprint')
  }

  private async load() {
    if (!this.blueprint) {
      return
    }
    const tag = this.tag || this.blueprint!.split('/').pop()
    const imported = await eval(`import('${this.blueprint}')`)
    const blueprint = imported[this.property]
    const { creator } = makeComponent(tag!, blueprint)
    this.replaceWith(creator(...this.childNodes))
  }

  render() {
    super.render()
    this.load()
  }
}

export const blueprintLoader = BlueprintLoader.elementCreator({
  tag: 'xin-bp',
  styleSpec: {
    ':host': {
      display: 'none',
    },
  },
})
