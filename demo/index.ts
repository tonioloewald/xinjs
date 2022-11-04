import {xin, touch, elements, makeWebComponent, hotReload, settings, bind, bindings, matchType} from '../src/index'
import {debounce} from '../src/throttle'
import {toolBar, labeledInput, labeledValue, appLayout} from './components/index'
import {WordList} from './WordList'
import './base-style'
import words from './words'
import logo from '../xinjs-logo.svg'

/* global window, document */

console.time('total')

settings.perf = true

const {fragment, img, h1, a, b, div, input, template, button, span, label, slot, style} = elements

const randomColor = () => `hsl(${Math.floor(Math.random() * 360)} ${Math.floor(Math.random() * 4 + 1) * 25}% 50%)`

async function getEmoji() {
  const request = await fetch('https://raw.githubusercontent.com/tonioloewald/emoji-metadata/master/emoji-metadata.json')
  xin.emoji = await request.json()
  console.log(xin.emoji.length, 'emoji loaded')
}

getEmoji()

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
  title: 'xinjs documentation',
  itemsToCreate: INITIAL_ITEMS,
  items: makeItems(INITIAL_ITEMS),
}

xin.words = new WordList(words)
console.log(xin.words.wordCount, 'words loaded')

hotReload(path => {
  if (path.startsWith('words') || path.startsWith('emoji')) {
    return false
  }
  return true
})

Object.assign(window, {
  xin,
  matchType,
  touch
})

const colorConversionSpan = span()

const matchColors = (a, b) => {
  colorConversionSpan.style.color = a
  colorConversionSpan.style.backgroundColor = b
  return colorConversionSpan.style.color === colorConversionSpan.style.backgroundColor
}

document.head.append(style('body { font-family: Sans-serif }'))

document.body.append(fragment(
  h1(
    img({
      alt: 'xinjs logo',
      style: {
        width: '44px',
        height: '44px',
        margin: '-8px 10px -8px 0'
      },
      src: logo
    }),
    span({bindText: 'app.title'})
  ),
  labeledInput('title', {
    placeholder: 'enter title',
    bindValue: 'app.title'
  }),
  toolBar(
    labeledValue('item count', {
      bindValue: 'app.items.length' 
    }),
    button('reset', {
      onClick() {
        const items = makeItems(xin.app.itemsToCreate)
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
  ),
  toolBar(
    b('Word Search'),
    span({style: {flex: '1 1 auto'}}),
    labeledInput('letters', {
      placeholder: 'letters to use',
      style: {
        '--input-width': '160px'
      },
      apply(element){
        bind(element, 'words.letters', bindings.value)
      }
    }),
    labeledInput('must contain', {
      placeholder: 'required substring',
      style: {
        '--input-width': '60px'
      },
      apply(element){
        bind(element, 'words.mustContain', bindings.value)
      }
    }),
    labeledInput('min length', {
      type: 'number',
      style: {
        '--input-width': '60px'
      },
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
    span(
      { style: { flex: '0 0 100px', textAlign: 'right' } },
      span({ bindText: 'words.filterCount' }),
      ' words'
    )
  ),
  bind(
    div(
      a({
          style: {
            display: 'inline-block',
            padding: '2px 10px',
            margin: '2px',
            borderRadius: '99px',
            background: '#00f2',
            fontFamily: 'Helvetica Neue, Helvetica, Arial, Sans-serif',
            textDecoration: 'none',
            color: 'var(--text-color)'
          }
      })
    ), 'words.list', bindings.list, {
      initInstance(element, word) {
        element.textContent = word
        element.setAttribute('href', `https://thefreedictionary.com/${word}`)
        element.setAttribute('target', `definition`)
      }
  }),
))

console.timeEnd('total')