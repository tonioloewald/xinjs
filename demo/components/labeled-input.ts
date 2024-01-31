import { elements, Component, vars } from '../../src/index'
const { label, slot, input } = elements

class LabeledInput extends Component {
  static styleSpec = {
    ':host > label': {
      display: 'inline-flex',
      flexDirection: 'var(--flex-direction, row)',
      gap: vars.spacing50,
      lineHeight: vars.lineHeight,
      alignItems: 'center',
      color: vars.textColor,
    },
    ':host *': {
      fontSize: vars.fontSize,
      whiteSpace: 'nowrap',
    },
    ':host input': {
      border: 0,
      padding: `0 ${vars.spacing75}`,
      background: vars.inputBg,
      color: vars.textColor,
      lineHeight: vars.lineHeight,
      borderRadius: vars.roundedRadius50,
      width: vars.inputWidth,
    },
    '::placeholder': {
      opacity: vars.placeHolderOpacity,
    },
    ':host input[type="number"]': {
      paddingRight: vars.spacing50,
    },
  }
  content = label({ part: 'label' }, slot(), input({ part: 'field' }))
  type = ''
  placeholder = ''
  input = false
  value: string | boolean = ''
  constructor() {
    super()
    this.initAttributes('type', 'placeholder', 'input')
  }

  handleUpdate = () => {
    const { field } = this.parts as { [key: string]: HTMLInputElement }
    this.value = this.type !== 'checkbox' ? field.value : field.checked
  }

  handleKeydown = (evt: KeyboardEvent) => {
    if (evt.code === 'Enter') {
      const form = this.closest('form')
      if (form) {
        form.dispatchEvent(new Event('submit'))
      }
    }
  }

  connectedCallback() {
    super.connectedCallback()
    const { field } = this.parts
    field.addEventListener(this.input ? 'input' : 'change', this.handleUpdate)
    field.addEventListener('keydown', this.handleKeydown)
  }
  render() {
    super.render()
    const { field, label } = this.parts
    if (this.type !== '') {
      field.setAttribute('type', this.type)
    } else {
      field.removeAttribute('type')
    }
    label.style.flexDirection = ['radio', 'checkbox'].includes(this.type)
      ? 'row-reverse'
      : ''
    if (this.placeholder !== '') {
      field.setAttribute('placeholder', this.placeholder)
    } else {
      field.removeAttribute('placeholder')
    }
    if (this.type === 'checkbox') {
      if (field.checked !== this.value) {
        field.checked = this.value as boolean
      }
    } else {
      if (field.value !== this.value) {
        field.value = this.value as string
      }
    }
  }
}

export const labeledInput = LabeledInput.elementCreator()
