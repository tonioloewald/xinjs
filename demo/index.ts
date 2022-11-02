import {xin, touch, elements, makeWebComponent, hotReload, settings} from '../src/index'
import {bind} from '../src/bind'
import {bindings} from '../src/bindings'
import {debounce} from '../src/throttle'
import {toolBar, labeledInput, labeledValue} from './custom-elements'
import {WordList} from './WordList'

/* global window, document */

console.time('total')

settings.perf = true

const {fragment, h1, b, div, input, template, button, span, label, slot, style} = elements

const randomColor = () => `hsl(${Math.floor(Math.random() * 360)} ${Math.floor(Math.random() * 4 + 1) * 25}% 50%)`

async function getEmoji() {
  const request = await fetch('https://raw.githubusercontent.com/tonioloewald/emoji-metadata/master/emoji-metadata.json')
  xin.emoji = await request.json()
  console.log(xin.emoji.length, 'emoji loaded')
}

getEmoji()

async function getWords () {
  const request = await fetch('https://cdn.jsdelivr.net/npm/words-dictionary@1.0.3/words/en.txt')
  const words = (await request.text()).split('\n').filter(x => !!x.trim())
  xin.words = new WordList(words)
  console.log(xin.words.wordCount, 'words loaded')
}

getWords()

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

xin.app = {
  title: 'xinjs binding test',
  itemsToCreate: INITIAL_ITEMS,
  items: makeItems(INITIAL_ITEMS),
}

hotReload(path => {
  if (path.startsWith('words') || path.startsWith('emoji')) {
    return false
  }
  return true
})

Object.assign(window, {
  xin
})

const colorConversionSpan = span()

const matchColors = (a, b) => {
  colorConversionSpan.style.color = a
  colorConversionSpan.style.backgroundColor = b
  return colorConversionSpan.style.color === colorConversionSpan.style.backgroundColor
}

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
        if (!matchColors(element.style.color, obj.color)) {
          element.style.border = `1px solid ${obj.color}`
          element.style.color = obj.color
          element.textContent = `${obj.id} ${obj.color}`
        }
      }
    }
  ),
  toolBar(
    b('Word Search'),
    span({style: {flex: '1 1 auto'}}),
    labeledInput('letters', {
      placeholder: 'letters to use',
      apply(element){
        bind(element, 'words.letters', bindings.value)
      }
    }),
    labeledInput('must contain', {
      placeholder: 'required substring',
      apply(element){
        bind(element, 'words.mustContain', bindings.value)
      }
    }),
    labeledInput('min length', {
      type: 'number',
      apply(element){
        bind(element, 'words.minLength', bindings.value)
      }
    }),
    labeledInput('reuse letters', {
      type: 'checkbox',
      apply(element) {
        bind(element, 'words.reuseLetters', bindings.value)
      }
    }),
    {
      onInput: debounce(() => {
        if (xin.words) {
          touch('words.list')
          touch('words.filterCount')
        }
      })
    },
    span({style: {flex: '1 1 auto'}}),
    span({apply(element){
      bind(element, 'words.filterCount', {toDOM(element, value){
        console.log('word count', value)
        element.textContent = value !== undefined ? `${value} words` : ''
      }})
    }})
  ),
  bind(div(span({style: {
    display: 'inline-block',
    padding: '5px 10px',
    fontFamily: 'Helvetica Neue, Helvetica, Arial, Sans-serif',
  }})), 'words.list', bindings.list, {
    bindInstance(element, word) {
      element.textContent = word
    }
  }),
))

console.timeEnd('total')