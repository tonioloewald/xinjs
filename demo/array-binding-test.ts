import {xin, elements, bind, bindings, touch} from '../src/index'
import {toolBar, labeledValue, labeledInput} from './components/index'

const {fragment, button, template, div, span} = elements

const colorConversionSpan = span()

const matchColors = (a, b) => {
  colorConversionSpan.style.color = a
  colorConversionSpan.style.backgroundColor = b
  return colorConversionSpan.style.color === colorConversionSpan.style.backgroundColor
}

export const arrayBindingTest = fragment(
  toolBar(
    labeledValue('item count', {
      bindValue: 'app.items.length' 
    }),
    button('reset', {
      onClick() {
        xin.app.makeItems(xin.app.itemsToCreate)
        console.log('reset')
        xin.app.items = items
      }
    }),
    labeledInput('items to create', {
      placeholder: 'items to create', 
      type: 'number',
      style: {
        '--input-width': '80px'
      },
      bindValue: 'app.itemsToCreate'
    }),
    span({style: {flex: '1 1 auto'}}),
    button('scramble', {
      onClick() {
        console.log('scramble')
        xin.app.items.sort(() => Math.random() - 0.5)
      }
    }),
    button('swap 4<->7', {
      onClick(){
        console.log('swap')
        let item4 = xin.app.items[4]
        xin.app.items[4] = xin.app.items[7]
        xin.app.items[7] = item4
        touch(xin.app.items)
      }
    }),
    button('modify ~10%', {
      onClick() {
        console.log('modify')
        for(const item of xin.app.items._xinValue) {
          if(Math.random() < 0.1) {
            item.color = randomColor() 
          }
        }
        touch(xin.app.items)
      }
    }),
    button('modify & scramble', {
      onClick() {
        console.log('scramble and modify')
        for(const item of xin.app.items._xinValue) {
          if(Math.random() < 0.1) {
            item.color = randomColor() 
          }
        }
        xin.app.items.sort(() => Math.random() - 0.5)
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
    }}))), xin.app.items, bindings.list, {
      idPath: 'id',
      updateInstance(element, path) {
        const obj = xin[path]
        if (!matchColors(element.style.color, obj.color)) {
          element.style.border = `1px solid ${obj.color}`
          element.style.color = obj.color
          element.textContent = `${obj.id} ${obj.color}`
        }
      }
    }
  )
)
