import {elements, makeWebComponent} from '../src/index'
const {label, slot, input, div, span} = elements

export const appLayout = makeWebComponent('app-layout', {
  style: {
    ':host': {
      display: 'flex',
      flexDirection: 'column'
    },
    ':host .body': {
      display: 'flex',
      flex: '1 1 auto',
      width: '100%'
    },
    '::slotted(:not([slot]))': {
      flex: '1 1 auto'
    }
  },
  content: [
    slot({name: 'header'}),
    div(
      { class: 'body' },
      slot({name: 'left'}),
      slot(),
      slot({name: 'right'})
    ),
    slot({name: 'footer'})
  ]
})

export const toolBar = makeWebComponent('tool-bar', {
  style: {
    ':host': {
      display: 'flex',
      gap: 'var(--item-spacing)',
    },
    ':host > *': {
      lineHeight: 'var(--line-height)',
    }
  }
})

export const labeledValue = makeWebComponent('labeled-value', {
  style: {
    ':host > label': {
      display: 'inline-flex',
      gap: 'calc(0.5 * var(--item-spacing))',
      lineHeight: 'var(--line-height)',
    },
    ':host *': {
      fontSize: 'var(--font-size)'
    }
  },
  props: {
    value: ''
  },
  content: label(slot(), span({dataRef: 'field'})),
  render() {
    const {field} = this.elementRefs
    field.textContent = this.value
  }
})

export const labeledInput = makeWebComponent('labeled-input', {
  style: {
    ':host > label': {
      display: 'inline-flex',
      gap: 'calc(0.5 * var(--item-spacing))',
      lineHeight: 'var(--line-height)',
    },
    ':host *': {
      fontSize: 'var(--font-size)'
    },
    ':host input[type="number"]': {
      width: 'var(--input-number-width, 60px)'
    }
  },
  attributes: {
    type: '',
    placeholder: ''
  },
  props: {
    value: ''
  },
  content: label(slot(), input({dataRef: 'field'})),
  connectedCallback() {
    const self = this
    const {field} = self.elementRefs
    field.addEventListener('input', () => {
      self.value = this.type !== 'checkbox' ? field.value : field.checked
    })
  },
  render() {
    const {field} = this.elementRefs
    if (this.type) {
      field.setAttribute('type', this.type)
    } else {
      field.removeAttribute('type')
    }
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