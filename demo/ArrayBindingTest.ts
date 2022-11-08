import {xin, elements, bind, bindings, touch, makeWebComponent} from '../src/index'
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

xin.colors = {
  itemsToCreate: INITIAL_ITEMS,
  items: makeItems(INITIAL_ITEMS),
  reset() {
    xin.colors.items = makeItems(xin.colors.itemsToCreate)
  }
}

const {fragment, button, template, div, span, label, input} = elements

const colorSwatch = makeWebComponent('color-swatch', {
  style: {
    ':host': {
      display: 'inline-flex',
      padding: '10px',
      margin: '5px',
      gap: '10px',
      width: '240px',
      background: 'var(--input-bg)',
      '--input-width': '140px'
    },
    ':host > span': {
      display: 'inline-block',
      flex: '0 0 30px',
      textAlign: 'right',
      lineHeight: '27px'
    }
  },
  value: {
    id: 0,
    color: 'red'
  },
  content: [
    span({dataRef: 'idSpan'}),
    labeledInput(span('color'), { dataRef: 'colorInput' })
  ],
  bindValue(path: string) {
    const self = this
    const {colorInput} = self.elementRefs
    colorInput.addEventListener('change', () => {
      if (self.value.color !== colorInput.value) {
        self.value = {
          ...self.value,
          color: colorInput.value
        }
      }
    })
  },
  render() {
    const {idSpan, colorInput} = this.elementRefs
    idSpan.textContent = this.value.id
    colorInput.value = this.value.color
    this.style.border = `2px solid ${this.value.color}`
  }
})

export const arrayBindingTest = () => fragment(
  toolBar(
    labeledValue('item count', {
      bindValue: 'colors.items.length' 
    }),
    button('reset', {
      onClick() {
        console.log('reset')
        xin.colors.reset()
      }
    }),
    labeledInput('items to create', {
      placeholder: 'items to create', 
      type: 'number',
      style: {
        '--input-width': '80px'
      },
      bindValue: 'colors.itemsToCreate'
    }),
    span({style: {flex: '1 1 auto'}}),
    button('scramble', {
      onClick() {
        console.log('scramble')
        xin.colors.items.sort(() => Math.random() - 0.5)
      }
    }),
    button('swap [4] and [7]', {
      onClick(){
        console.log('swap')
        let item4 = xin.colors.items[4]
        xin.colors.items[4] = xin.colors.items[7]
        xin.colors.items[7] = item4
        touch(xin.colors.items)
      }
    }),
    button('modify ~10%', {
      onClick() {
        console.log('modify')
        for(const item of xin.colors.items._xinValue) {
          if(Math.random() < 0.1) {
            item.color = randomColor() 
          }
        }
        touch(xin.colors.items)
      }
    }),
    button('modify & scramble', {
      onClick() {
        console.log('scramble and modify')
        for(const item of xin.colors.items._xinValue) {
          if(Math.random() < 0.1) {
            item.color = randomColor() 
          }
        }
        xin.colors.items.sort(() => Math.random() - 0.5)
      }
    })
  ),

  bind(
    div(template(
      colorSwatch()
    )), xin.colors.items, bindings.list, {
      idPath: 'id',
    }
  )
)
