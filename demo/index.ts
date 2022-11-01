import {xin, touch} from '../src/index'
import {settings} from '../src/xin'
import {bind} from '../src/bind'
import {bindings} from '../src/bindings'
import {hotReload} from '../src/hot-reload'
import {elements} from '../src/elements'
import {makeWebComponent} from '../src/components'

/* global window, document */

console.time('total')

settings.perf = true

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

const labeledValue = makeWebComponent('labeled-value', {
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

const labeledInput = makeWebComponent('labeled-input', {
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
    field.addEventListener('input', () => self.value = field.value)
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
      field.value = this.value 
    }
  }
})

const toolBar = makeWebComponent('tool-bar', {
  style: {
    ':host': {
      display: 'flex',
      gap: 'var(--item-spacing)',
    },
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
  style(`
    :root {
      --font-size: 15px;
      --line-height: 25px;
      --item-spacing: 10px;
    }

    labeled-input,
    labeled-value {
      display: block
    }

    label, input, button {
      font-size: var(--font-size)
    }
`),
  bind(h1(), 'app.title', bindings.text ),
  labeledInput('title', {
    placeholder: 'enter title',
    apply(element) {
      bind(element, 'app.title', bindings.value)
    }
  }),
  labeledValue('current array size', {
    apply(element) {
      bind(element, 'app.items.length', bindings.value)
    }
  }),
  toolBar(
    button('reset', {onClick() {
      const items = makeItems(xin.app.itemsToCreate)
      console.log('reset')
      xin.app.items = items
    }}),
    labeledInput('items to create', {
      placeholder: 'items to create', 
      type: 'number', 
      apply(element) {
        bind(element, 'app.itemsToCreate', bindings.value)
      }
    }),
    span({style: {flex: '1 1 auto'}}),
    button('scramble', {onClick() {
      console.log('scramble')
      xin.app.items.sort(() => Math.random() - 0.5)
    }}),
    button('swap 4<->7', {onClick(){
      console.log('swap')
      let item4 = xin.app.items[4]
      xin.app.items[4] = xin.app.items[7]
      xin.app.items[7] = item4
      touch(xin.app.items)
    }}),
    button('modify ~10%', {onClick() {
      console.log('modify')
      for(const item of xin.app.items._xinValue) {
        if(Math.random() < 0.1) {
          item.color = randomColor() 
        }
      }
      touch(xin.app.items)
    }}),
    button('modify & scramble', {onClick() {
      console.log('scramble and modify')
      for(const item of xin.app.items._xinValue) {
        if(Math.random() < 0.1) {
          item.color = randomColor() 
        }
      }
      xin.app.items.sort(() => Math.random() - 0.5)
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