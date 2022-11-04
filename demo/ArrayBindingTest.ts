import {xin, elements, bind, bindings, touch} from '../src/index'
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

const {fragment, button, template, div, span} = elements

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
    button('swap 4<->7', {
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
    div(template(span({style: {
      display: 'inline-block',
      padding: '10px',
      margin: '5px',
      fontFamily: 'monospace',
      width: '200px',
      background: 'var(--input-bg)'
    }}))), xin.colors.items, bindings.list, {
      idPath: 'id',
      updateInstance(element, obj) {
        if (obj.color !== element.dataset.color) {
          element.dataset.color = obj.color
          element.style.border = `1px solid ${obj.color}`
          element.style.color = obj.color
          element.textContent = `${obj.id} ${obj.color}`
        }
      }
    }
  )
)
