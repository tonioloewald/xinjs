import { Component } from '../../src/components'
const {label, slot, span} = Component.elements

class LabeledValue extends Component {
  styleNode = Component.StyleNode({
    ':host > label': {
      display: 'inline-flex',
      gap: 'calc(0.5 * var(--item-spacing))',
      lineHeight: 'var(--line-height)',
      flexDirection: 'var(--flex-direction, row)'
    },
    ':host *': {
      fontSize: 'var(--font-size)'
    }
  })
  content = label(slot(), span({dataRef: 'field'}))
  value = ''
  render() {
    super.render()
    const {field} = this.refs
    field.textContent = this.value
  }
}

export const labeledValue = LabeledValue.elementCreator()