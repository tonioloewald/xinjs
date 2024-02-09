/*!
# blueprint example

A `XinBlueprint` is a function that tells `xinjs`'s `makeComponent(tag, blueprint)`
`XinFactory` how to build out a packaged component. The difference between this and
exporting a `Component` subclass and/or its `elementCreator` is that this is done
by the importing app not by you, which means your component is lighter weight and
can be loaded on-the-fly by any app using a compatible version of `xinjs`.
*/

import { XinBlueprint, PartsMap } from '../../src'

interface BlueprintParts extends PartsMap {
  heading: HTMLElement
  captionField: HTMLInputElement
}

const blueprintExample: XinBlueprint = (
  tag,
  { Component, elements, vars, varDefault, Color }
) => {
  const { h3, p, slot, label, input } = elements
  class BpExample extends Component {
    value = {
      caption: 'Blueprint Example',
    }

    static styleSpec = {
      ':host': {
        color: vars.blueprintColor,
        background: varDefault.blueprintBg(
          'radial-gradient(circle, rgba(0,105,198,1) 0%, rgba(2,67,131,1) 100%)'
        ),
        padding: varDefault.blueprintPadding('16px'),
      },
      input: {
        background: varDefault.blueprintInputBackground('#0002'),
        borderRadius: varDefault.blueprintInputBorderRadius('4px'),
        font: varDefault.blueprintInputFont('Roboto 16px'),
        color: vars.blueprintColor,
        border: 0,
        marginLeft: '10px',
        padding: varDefault.blueprintInputPadding('8px'),
      },
      '::slotted(*)': {
        boxShadow: `inset 0 0 0 2px ${vars.blueprintColor}`,
        borderRadius: varDefault.blueprintInsetBorderRadius('4px'),
        font: varDefault.blueprintInputFont('Roboto 16px'),
        padding: varDefault.blueprintPadding('16px'),
      },
    }

    constructor() {
      super()
    }

    content = () => [
      h3({ part: 'heading', style: { marginTop: 0 } }),
      p('This was made from a blueprint!'),
      label('Edit the caption', input({ part: 'captionField' })),
      slot(),
    ]

    connectedCallback() {
      super.connectedCallback()

      const { captionField } = this.parts as BlueprintParts
      captionField.addEventListener('input', () => {
        this.value.caption = captionField.value
        this.queueRender(true)
      })
    }

    render() {
      super.render()

      const { heading, captionField } = this.parts as BlueprintParts
      heading.textContent = this.value.caption
      if (captionField.value !== this.value.caption)
        captionField.value = this.value.caption
    }
  }

  return {
    type: BpExample,
    styleSpec: {
      ':root': {
        _blueprintColor: new Color(200, 220, 240),
      },
    },
  }
}

export default blueprintExample
