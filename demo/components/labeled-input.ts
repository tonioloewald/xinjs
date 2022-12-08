import {elements, Component, vars} from '../../src/index'
const {label, slot, input} = elements

class LabeledInput extends Component {
  styleNode = Component.StyleNode({
    ':host > label': {
      display: 'inline-flex',
      flexDirection: 'var(--flex-direction, row)',
      gap: vars.spacing50,
      lineHeight: vars.lineHeight,
      alignItems: 'center',
    },
    ':host *': {
      fontSize: vars.fontSize,
      whiteSpace: 'nowrap'
    },
    ':host input': {
      border: 0,
      padding: `0 ${vars.spacing75}`,
      background: vars.inputBg,
      color: vars.textColor,
      lineHeight: vars.lineHeight,
      borderRadius: vars.roundedRadius50,
      width: vars.inputWidth
    },
    ':host input[type="number"]': {
      paddingRight: vars.spacing50
    }
  })
  content = label({dataRef: 'label'}, slot(), input({dataRef: 'field'}))
  type = ''
  placeholder = ''
  input = false
  value: string | boolean = ''
  constructor() {
    super()
    this.initAttributes('type', 'placeholder', 'input')
  }
  connectedCallback() {
    super.connectedCallback()
    const self = this
    const {field} = self.refs
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
  }
  render() {
    super.render()
    const {field, label} = this.refs
    if (this.type !== '') {
      field.setAttribute('type', this.type)
    } else {
      field.removeAttribute('type')
    }
    label.style.flexDirection = ['radio', 'checkbox'].includes(this.type) ? 'row-reverse' : ''
    if (this.placeholder !== '') {
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
}

export const labeledInput = LabeledInput.elementCreator()