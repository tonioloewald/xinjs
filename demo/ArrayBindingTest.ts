import { xinProxy, touch, Component, elements, vars } from '../src/index'
import { xinValue } from '../src/metadata'
import { toolBar, labeledValue, labeledInput } from './components/index'
import { randomColor } from './random-color'

const INITIAL_ITEMS = 25

type ColorRec = { id: number; color: string }

const makeItems = (howMany: number) => {
  const items: ColorRec[] = []
  for (let id = 1; id <= howMany; id++) {
    items.push({
      id,
      color: randomColor(),
    })
  }
  return items
}

const { colors } = xinProxy({
  colors: {
    itemsToCreate: INITIAL_ITEMS,
    items: makeItems(INITIAL_ITEMS),
    reset() {
      colors.items = makeItems(colors.itemsToCreate)
    },
  },
})

const { button, template, div, span } = elements

class ColorSwatch extends Component {
  value = {
    id: 0,
    color: 'red',
  }
  content = [
    span({ part: 'idSpan' }),
    labeledInput(span('color'), { part: 'colorInput' }),
  ]

  changed = () => {
    const { colorInput } = this.parts as { [key: string]: HTMLInputElement }
    if (this.value.color !== colorInput.value) {
      this.value = {
        ...this.value,
        color: colorInput.value,
      }
    }
  }

  connectedCallback() {
    super.connectedCallback()
    const { colorInput } = this.parts as { [key: string]: HTMLInputElement }
    colorInput.addEventListener('change', this.changed)
  }
  render() {
    super.render()
    const { idSpan, colorInput } = this.parts
    if (this.value != null) {
      idSpan.textContent = String(this.value.id)
      ;(colorInput as HTMLInputElement).value = this.value.color
      this.style.border = `2px solid ${this.value.color}`
    }
  }
}

const colorSwatch = ColorSwatch.elementCreator({
  tag: 'color-swatch',
  styleSpec: {
    'color-swatch': {
      display: 'inline-flex',
      padding: '10px',
      margin: '5px',
      gap: '10px',
      width: '260px',
      background: vars.inputBg,
      alignItems: 'center',
      overflow: 'hidden',
    },
    'color-swatch > span': {
      display: 'inline-block',
      flex: '0 0 30px',
      textAlign: 'right',
      lineHeight: '27px',
    },
  },
})

export const arrayBindingTest = (...args) =>
  div(
    ...args,
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
      },
    },
    toolBar(
      button('create', {
        onClick() {
          console.log('create')
          colors.reset()
        },
      }),
      labeledInput('items', {
        placeholder: 'items to create',
        reversed: true,
        type: 'number',
        style: {
          _flexDirection: 'row-reverse',
          _inputWidth: 60,
        },
        bindValue: 'colors.itemsToCreate',
      }),
      span({ style: { flex: '1 1 auto' } }),
      labeledValue('items', {
        style: {
          _flexDirection: 'row-reverse',
        },
        bindValue: 'colors.items.length',
      }),
      button('scramble', {
        onClick() {
          console.log('scramble')
          colors.items.sort(() => Math.random() - 0.5)
        },
      }),
      button('swap [4] and [7]', {
        onClick() {
          console.log('swap')
          const item4 = colors.items[4]
          colors.items[4] = colors.items[7]
          colors.items[7] = item4
          touch(colors.items)
        },
      }),
      button('modify ~10%', {
        onClick() {
          console.log('modify')
          for (const item of xinValue(colors.items)) {
            if (Math.random() < 0.1) {
              item.color = randomColor()
            }
          }
          touch(colors.items)
        },
      }),
      button('modify & scramble', {
        onClick() {
          console.log('scramble and modify')
          for (const item of xinValue(colors.items)) {
            if (Math.random() < 0.1) {
              item.color = randomColor()
            }
          }
          colors.items.sort(() => Math.random() - 0.5)
        },
      })
    ),
    div(
      {
        style: {
          flex: '1 1 auto',
          overflowY: 'scroll',
          padding: '5px',
        },
      },
      template(colorSwatch({ bindValue: '^' })),
      {
        bindList: {
          value: colors.items,
          idPath: 'id',
          virtual: { width: 284, height: 61 },
        },
      }
    )
  )
