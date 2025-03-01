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

/*
  tag is the consumer's choice of tag for the custom-element
  factory is {
    Color,        // the Color class
    Component,    // the Component base class
    elements,     // elements.div() creates an HTMLDivElement
    svgElements,  // svgElements.path() creates an SVGPathElement
    mathML,       // mathML.msqrt() creates an `<msqrt>` MathMLElement
    varDefault,   // varDefault.fooBar('10px') produces `var(--foo-bar, 10px)`
    vars,         // vars.fooBar produces `var(--foo-bar)`, vars.fooBar50 produces `calc(var(--foo-bar) * 0.5)`
    xinProxy,     // produces xin proxies, see https://github.com/tonioloewald/xinjs/blob/main/docs/xin.md
  }
*/
const blueprintExample: XinBlueprint = (tag, factory) => {
  const { Component, elements, vars, varDefault, Color } = factory
  const { h3, p, slot, label, input } = elements

  class BpExample extends Component<BlueprintParts> {
    value = {
      caption: 'Blueprint Example',
    }

    // this determines the style inside the shadowDOM. If omitted,
    // the component won't use a shadowDOM
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

      // if the component doesn't use the shadowDOM, <xin-slot> elements
      // will be used instead of <slot> elements, and these provide the same
      // composability as <slot> elements provide, including supporting named slots.
      slot(),
    ]

    connectedCallback() {
      super.connectedCallback()

      const { captionField } = this.parts
      captionField.addEventListener('input', () => {
        this.value.caption = captionField.value
        this.queueRender(true)
      })
    }

    // disconnectedCallback is also supported

    render() {
      super.render()

      const { heading, captionField } = this.parts
      heading.textContent = this.value.caption
      if (captionField.value !== this.value.caption)
        captionField.value = this.value.caption
    }
  }

  return {
    // you must return the subclass!
    type: BpExample as typeof Component,
    // if a stylespec is returned, it will create a global helper stylesheet
    // for the custom element. Any occurrence of ':host' in the selectors will
    // be replaced with the element's tag
    styleSpec: {
      ':root': {
        _blueprintColor: new Color(200, 220, 240),
      },
    },
  }
}

export default blueprintExample
