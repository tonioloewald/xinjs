import { Component } from './component'
import {
  makeComponent,
  XinBlueprint,
  XinPackagedComponent,
} from './make-component'

const loadedBlueprints: { [key: string]: Promise<XinPackagedComponent> } = {}

export class Blueprint extends Component {
  tag = 'anon-elt'
  src = ''
  property = 'default'
  loaded?: XinPackagedComponent
  onload = () => {}

  async packaged(): Promise<XinPackagedComponent> {
    const { tag, src, property } = this
    const signature = `${tag}.${property}:${src}`
    if (!this.loaded) {
      if (loadedBlueprints[signature] === undefined) {
        const imported = await eval(`import('${src}')`)
        const blueprint = imported[property] as XinBlueprint
        loadedBlueprints[signature] = makeComponent(tag, blueprint)
      } else {
        console.log(`using cached ${tag}`)
      }
      this.loaded = await loadedBlueprints[signature]
      this.onload()
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
  onload = () => {}

  constructor() {
    super()
  }

  private async load() {
    const blueprintElements = (
      Array.from(
        this.querySelectorAll(Blueprint.tagName as string)
      ) as Blueprint[]
    ).filter((elt) => elt.src)
    const promises = blueprintElements.map((elt) => elt.packaged())
    await Promise.all(promises)
    this.onload()
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
