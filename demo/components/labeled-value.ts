import {elements, makeWebComponent} from '../../src/index'
const {label, slot, span} = elements

export const labeledValue = makeWebComponent('labeled-value', {
  style: {
    ':host > label': {
      display: 'inline-flex',
      gap: 'calc(0.5 * var(--item-spacing))',
      lineHeight: 'var(--line-height)',
      flexDirection: 'var(--flex-direction, row)'
    },
    ':host *': {
      fontSize: 'var(--font-size)'
    }
  },
  value: '',
  content: label(slot(), span({dataRef: 'field'})),
  render() {
    const {field} = this.elementRefs
    field.textContent = this.value
  }
})