import { xinProxy, touch, Component, elements, vars, initVars} from '../src/index'
import { xinValue } from '../src/metadata'
import {toolBar, labeledValue, labeledInput} from './components/index'
import {randomColor} from './random-color'

const INITIAL_ITEMS = 25

type ColorRec = {id: number, color: string}

const makeItems = (howMany: number) => {
  const items: ColorRec[] = []
  for(let id = 1; id <= howMany; id++) {
    items.push({
      id,
      color: randomColor(),
    })
  }
  return items
}

const {colors} = xinProxy({
  colors: {
    itemsToCreate: INITIAL_ITEMS,
    items: makeItems(INITIAL_ITEMS),
    reset() {
      colors.items = makeItems(colors.itemsToCreate)
    }
  }
})

const {button, template, div, span} = elements

class ColorSwatch extends Component {
  styleNode = Component.StyleNode({
    ':host': {
      display: 'inline-flex',
      padding: '10px',
      margin: '5px',
      gap: '10px',
      width: '260px',
      background: vars.inputBg,
      ...initVars({ inputWith: '140px'}),
      alignItems: 'center',
      overflow: 'hidden',
    },
    ':host > span': {
      display: 'inline-block',
      flex: '0 0 30px',
      textAlign: 'right',
      lineHeight: '27px'
    }
  })
  value = {
    id: 0,
    color: 'red'
  }
  content = [
    span({dataRef: 'idSpan'}),
    labeledInput(span('color'), { dataRef: 'colorInput' })
  ]
  connectedCallback() {
    super.connectedCallback()
    const self = this
    const colorInput = self.refs.colorInput
    colorInput.addEventListener('change', () => {
      if (self.value.color !== colorInput.value) {
        self.value = {
          ...self.value,
          color: colorInput.value
        }
      }
    })
  }
  render() {
    super.render()
    const {idSpan, colorInput} = this.refs
    if (this.value != null) {
      idSpan.textContent = String(this.value.id)
      colorInput.value = this.value.color
      this.style.border = `2px solid ${this.value.color}`
    }
  }
}

const colorSwatch = ColorSwatch.elementCreator()

export const arrayBindingTest = (...args) => div(
  ...args,
  {
    style: {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%',
    }
  },
  toolBar(
    { style: { flex: '1 0 auto' } },
    button('create', {
      onClick() {
        console.log('create')
        colors.reset()
      }
    }),
    labeledInput('items', {
      placeholder: 'items to create',
      reversed: true,
      type: 'number',
      style: initVars({
        flexDirection: 'row-reverse',
        inputWidth: 60
      }),
      bindValue: 'colors.itemsToCreate'
    }),
    span({style: {flex: '1 1 auto'}}),
    labeledValue('items', {
      style: initVars({
        flexDirection: 'row-reverse'
      }),
      bindValue: 'colors.items.length' 
    }),
    button('scramble', {
      onClick() {
        console.log('scramble')
        colors.items.sort(() => Math.random() - 0.5)
      }
    }),
    button('swap [4] and [7]', {
      onClick(){
        console.log('swap')
        let item4 = colors.items[4]
        colors.items[4] = colors.items[7]
        colors.items[7] = item4
        touch(colors.items)
      }
    }),
    button('modify ~10%', {
      onClick() {
        console.log('modify')
        for(const item of xinValue(colors.items)) {
          if(Math.random() < 0.1) {
            item.color = randomColor() 
          }
        }
        touch(colors.items)
      }
    }),
    button('modify & scramble', {
      onClick() {
        console.log('scramble and modify')
        for(const item of xinValue(colors.items)) {
          if(Math.random() < 0.1) {
            item.color = randomColor() 
          }
        }
        colors.items.sort(() => Math.random() - 0.5)
      }
    })
  ),
  div(
    {
      style: {
        flex: '1 1 auto',
        overflowY: 'scroll',
        padding: '5px',
      }
    },
    template( colorSwatch({bindValue: '^'})), 
    { 
      bindList: {
        value: colors.items, 
        idPath: 'id',
        virtual: { width: 284, height: 61 }
      }
    }
  )
)
