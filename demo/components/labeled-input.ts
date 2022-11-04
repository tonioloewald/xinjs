import {elements, makeWebComponent} from '../../src/index'
const {label, slot, input} = elements

export const labeledInput = makeWebComponent('labeled-input', {
  style: {
    ':host > label': {
      display: 'inline-flex',
      gap: 'calc(0.5 * var(--item-spacing))',
      lineHeight: 'var(--line-height)',
      alignItems: 'center',
    },
    ':host *': {
      fontSize: 'var(--font-size)',
      whiteSpace: 'nowrap'
    },
    ':host input': {
      border: 'none',
      padding: '0 var(--spacing)',
      lineHeight: 'var(--lineHeight)',
      borderRadius: 'calc(0.5 * var(--rounded-radius))',
      width: 'var(--input-width)'
    },
    ':host input[type="number"]': {
      paddingRight: 'calc(var(--spacing) * 0.5)'
    }
  },
  attributes: {
    type: '',
    placeholder: ''
  },
  props: {
    value: ''
  },
  content: label({dataRef: 'label'}, slot(), input({dataRef: 'field'})),
  connectedCallback() {
    const self = this
    const {field} = self.elementRefs
    field.addEventListener('input', () => {
      self.value = this.type !== 'checkbox' ? field.value : field.checked
    })
  },
  render() {
    const {field, label} = this.elementRefs
    if (this.type) {
      field.setAttribute('type', this.type)
    } else {
      field.removeAttribute('type')
    }
    label.style.flexDirection = ['radio', 'checkbox'].includes(this.type) ? 'row-reverse' : ''
    if (this.placeholder) {
      field.setAttribute('placeholder', this.placeholder)
    } else {
      field.removeAttribute('placeholder')
    }
    if (field.value !== `${this.value}`) {
      if (this.type === 'checkbox') {
        field.checked = this.value
      } else {
        field.value = this.value 
      }
    }
  }
})