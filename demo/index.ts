import {xin, touch} from '../src/index'
import {bind} from '../src/bind'
import {bindings} from '../src/bindings'
import {hotReload} from '../src/hot-reload'
import {elements} from '../src/elements'
import {makeWebComponent} from '../src/components'

/* global window, document */

console.time('total')

const {fragment, h1, div, input, template, button, span, label, slot, style} = elements

const randomColor = () => `hsl(${Math.floor(Math.random() * 360)} ${Math.floor(Math.random() * 4 + 1) * 25}% 50%)`

/*
async function getWords () {
  const {words} = await import('https://cdn.jsdelivr.net/npm/popular-english-words@1.0.2/words.js')
  window.words = words
  console.log(window.words.length, 'words loaded')
}

getWords()
*/

const INITIAL_ITEMS = 25

const makeItems = (howMany) => {
  const items = []
  for(let id = 1; id <= howMany; id++) {
    items.push({
      id,
      color: randomColor(),
    })
  } 
  return items
}

const testComponent = makeWebComponent('test-component', {
  content: [
    elements.h3('top'),
    elements.slot(),
    elements.div('bottom', {dataRef: 'foo'})
  ],
  methods: {
    render() {
      console.log(this.elementRefs.foo.textContent)
    } 
  }
})

const appLayout = makeWebComponent('app-layout', {
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

xin.app = {
  title: 'xinjs binding test',
  itemsToCreate: INITIAL_ITEMS,
  items: makeItems(INITIAL_ITEMS),
}

hotReload()

Object.assign(window, {
  xin
})

const colorConversionSpan = document.createElement('span')

document.head.append(style('body { font-family: Sans-serif }'))

document.body.append(fragment(
  bind(h1(), 'app.title', bindings.text ),
  label(
    span('title'),
    bind(input({title: 'title', placeholder: 'enter title'}), 'app.title', bindings.value)
  ),
  label(
    span('array size'),
    bind(span(), 'app.items.length', bindings.text)
  ),
  div(
    {
      style: {
        display: 'flex',
        gap: '5px'
      }
    },
    button('reset', {onClick() {
      const items = makeItems(xin.app.itemsToCreate)
      console.time('reset')
      xin.app.items = items
      console.timeEnd('reset')
    }}),
    input({title: 'items to create', placeholder: 'items to create', apply(element) {
      bind(element, 'app.itemsToCreate', bindings.value)
    }}),
    button('scramble', {onClick() {
      console.time('scramble')
      xin.app.items.sort(() => Math.random() - 0.5)
      console.timeEnd('scramble')
    }}),
    button('swap 4<->7', {onClick(){
      console.time('swap')
      let item4 = xin.app.items._xinValue[4]
      xin.app.items._xinValue[4] = xin.app.items._xinValue[7]
      xin.app.items._xinValue[7] = item4
      touch(xin.app.items)
      console.timeEnd('swap')
    }}),
    button('modify ~10%', {onClick() {
      console.time('modify')
      for(const item of xin.app.items._xinValue) {
        if(Math.random() < 0.1) {
          item.color = randomColor() 
        }
      }
      touch(xin.app.items)
      console.timeEnd('modify')
    }}),
    button('modify & scramble', {onClick() {
      console.time('scramble and modify')
      for(const item of xin.app.items._xinValue) {
        if(Math.random() < 0.1) {
          item.color = randomColor() 
        }
      }
      xin.app.items.sort(() => Math.random() - 0.5)
      console.timeEnd('scramble and modify')
    }})
  ),
  bind(
    div(template(span({style: {
      display: 'inline-block',
      padding: '10px',
      margin: '5px',
      fontFamily: 'monospace',
      width: '200px'
    }}))), xin.app.items, bindings.list, {
      bindInstance(element, obj) {
        colorConversionSpan.style.color = obj.color
        const color = colorConversionSpan.style.color
        if (element.style.color !== color) {
          element.style.border = `1px solid ${color}`
          element.style.color = color
          element.textContent = `${obj.id} ${obj.color}`
        }
      }
    }
  ),
  bind(div(span({style: {
    display: 'inline-block',
    padding: '10px',
    margin: '5px',
    fontFamily: 'monospace',
    width: '200px'
  }})), 'words', bindings.list, {
    bindInstance(element, word) {
      element.textContent = word
    }
  }),
))

console.timeEnd('total')