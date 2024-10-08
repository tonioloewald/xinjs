import { Component } from './component'
import {
  makeComponent,
  XinBlueprint,
  XinPackagedComponent,
} from './make-component'

export class Blueprint extends Component {
  tag = 'anon-elt'
  src = ''
  property = 'default'
  loaded?: XinPackagedComponent

  async packaged(): Promise<XinPackagedComponent> {
    if (!this.loaded) {
      const { tag, src } = this
      const imported = await eval(`import('${src}')`)
      const blueprint = imported[this.property] as XinBlueprint
      this.loaded = makeComponent(tag, blueprint)
    }
    return this.loaded!
  }

  constructor() {
    super()

    this.initAttributes('tag', 'src', 'property')
  }
}

export const blueprint = Blueprint.elementCreator({
  tag: 'xin-blueprint',
  styleSpec: { ':host': { display: 'none' } },
})

export class BlueprintLoader extends Component {
  constructor() {
    super()
  }

  private async load() {
    const blueprintElements = (
      [...this.querySelectorAll(Blueprint.tagName as string)] as Blueprint[]
    ).filter((elt) => elt.src)
    const promises = blueprintElements.map((elt) => elt.packaged())
    await Promise.all(promises)
  }

  connectedCallback() {
    super.connectedCallback()

    this.load()
  }
}

export const blueprintLoader = BlueprintLoader.elementCreator({
  tag: 'xin-loader',
  styleSpec: { ':host': { display: 'none' } },
})
