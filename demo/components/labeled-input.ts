import {elements, makeWebComponent} from '../../src/index'
const {label, slot, input} = elements

export const labeledInput = makeWebComponent('labeled-input', {
  style: {
    ':host > label': {
      display: 'inline-flex',
      flexDirection: 'var(--flex-direction, row)',
      gap: 'calc(0.5 * var(--item-spacing))',
      lineHeight: 'var(--line-height)',
      alignItems: 'center',
    },
    ':host *': {
      fontSize: 'var(--font-size)',
      whiteSpace: 'nowrap'
    },
    ':host input': {
      border: 'var(--input-border)',
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
    placeholder: '',
    input: false
  },
  value: '',
  content: label({dataRef: 'label'}, slot(), input({dataRef: 'field'})),
  connectedCallback() {
    const self = this
    const {field} = self.elementRefs
    field.addEventListener(this.input ? 'input' : 'change', () => {
      self.value = this.type !== 'checkbox' ? field.value : field.checked
    })
    field.addEventListener('keydown', (evt) => {
      if(evt.code === 'Enter') {
        const form = this.closest('form')
        if (form) {
          form.dispatchEvent(new Event('submit'))
        }
      }
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
    if (this.type === 'checkbox') {
      if(field.checked !== this.value) {
        field.checked = this.value
      }
    } else {
      if (field.value !== this.value) {
        field.value = this.value 
      }
    }
  }
})