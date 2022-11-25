import {xin, elements, touch, makeWebComponent, XinProxyObject, XinArray, xinValue} from '../src/index'
import {toolBar, labeledValue, labeledInput} from './components/index'
import {randomColor} from './random-color'

const INITIAL_ITEMS = 25

type ColorRec = {id: number, color: string}

const makeItems = (howMany: number): XinArray => {
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
    // @ts-expect-error
    xin.colors.items = makeItems(xin.colors.itemsToCreate)
  }
} as unknown as XinProxyObject

const {button, template, div, span} = elements

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
  connectedCallback() {
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

export const arrayBindingTest = (...args) => div(
  ...args,
  toolBar(
    button('create', {
      onClick() {
        console.log('create')
        // @ts-expect-error
        xin.colors.reset()
      }
    }),
    labeledInput('items', {
      placeholder: 'items to create',
      reversed: true,
      type: 'number',
      style: {
        '--flex-direction': 'row-reverse',
        '--input-width': '60px'
      },
      bindValue: 'colors.itemsToCreate'
    }),
    span({style: {flex: '1 1 auto'}}),
    labeledValue('items', {
      style: {
        '--flex-direction': 'row-reverse'
      },
      bindValue: 'colors.items.length' 
    }),
    button('scramble', {
      onClick() {
        console.log('scramble')
        // @ts-expect-error
        xin.colors.items.sort(() => Math.random() - 0.5)
      }
    }),
    button('swap [4] and [7]', {
      onClick(){
        console.log('swap')
        // @ts-expect-error
        let item4 = xin.colors.items[4]
        // @ts-expect-error
        xin.colors.items[4] = xin.colors.items[7]
        // @ts-expect-error
        xin.colors.items[7] = item4
        // @ts-expect-error
        touch(xin.colors.items)
      }
    }),
    button('modify ~10%', {
      onClick() {
        console.log('modify')
        // @ts-expect-error
        for(const item of xin.colors.items[xinValue]) {
          if(Math.random() < 0.1) {
            item.color = randomColor() 
          }
        }
        // @ts-expect-error
        touch(xin.colors.items)
      }
    }),
    button('modify & scramble', {
      onClick() {
        console.log('scramble and modify')
        // @ts-expect-error
        for(const item of xin.colors.items[xinValue]) {
          if(Math.random() < 0.1) {
            item.color = randomColor() 
          }
        }
        // @ts-expect-error
        xin.colors.items.sort(() => Math.random() - 0.5)
      }
    })
  ),
  div(
    template( colorSwatch({bindValue: '^'})), 
    { 
      bindList: {
        // @ts-ignore-error
        value: xin.colors.items, 
        idPath: 'id'
      }
    }
  )
)
