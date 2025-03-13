import { Component } from 'xinjs'
const { label, slot, span } = Component.elements

class LabeledValue extends Component {
  static styleSpec = {
    ':host > label': {
      display: 'inline-flex',
      gap: 'calc(0.5 * var(--item-spacing))',
      lineHeight: 'var(--line-height)',
      flexDirection: 'var(--flex-direction, row)',
    },
    ':host *': {
      fontSize: 'var(--font-size)',
    },
  }
  content = label(slot(), span({ part: 'field' }))
  value = ''
  render() {
    super.render()
    const { field } = this.parts
    field.textContent = this.value
  }
}

export const labeledValue = LabeledValue.elementCreator({
  tag: 'labeled-value',
})
