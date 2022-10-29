import {xin, touch} from '../src/index'
import {bind} from '../src/bind'
import {bindings} from '../src/bindings'
import {hotReload} from '../src/hot-reload'

/* global window, document */

console.time('total')

const randomColor = () => `hsl(${Math.floor(Math.random() * 360)} ${Math.floor(Math.random() * 4 + 1) * 25}% 50%)`

async function getWords () {
  const {words} = await import('https://cdn.jsdelivr.net/npm/popular-english-words@1.0.2/words.js')
  window.words = words
  console.log(window.words.length, 'words loaded')
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
  title: 'hello, world -- it works',
  itemsToCreate: INITIAL_ITEMS,
  items: makeItems(INITIAL_ITEMS),
  titleStyle: {
    fontFamily: 'sans-serif',
    fontSize: '24px'
  }
}

hotReload()

Object.assign(window, {
  xin
})

const div = document.createElement('div')
const titleInput = document.createElement('input')
const template = document.createElement('template')
const span = document.createElement('span')

titleInput.title = 'title'
titleInput.placeholder = 'enter title'

span.style.display = 'inline-block'
span.style.padding = '10px'
span.style.margin = '5px'
span.style.fontFamily = 'monospace'
span.style.width = '200px'
template.content.append(span)

const counter = document.createElement('div')
const scramble = document.createElement('button')
const modify = document.createElement('button')
const scrambleAndModify = document.createElement('button')
const swap = document.createElement('button')
const reset = document.createElement('button')
const itemsInput = document.createElement('input')

const wordTemplate = document.createElement('template')
wordTemplate.content.append(span.cloneNode(true))

reset.textContent = 'reset'
reset.addEventListener('click', () => {
  const items = makeItems(xin.app.itemsToCreate)
  console.time('reset')
  xin.app.items = items
  console.timeEnd('reset')
})

itemsInput.title = 'number of items to create'
itemsInput.placeholder = 'items to create'

swap.textContent = 'swap [4] with [7]'
swap.addEventListener('click', () => {
  console.time('swap')
  let item4 = xin.app.items._xinValue[4]
  xin.app.items._xinValue[4] = xin.app.items._xinValue[7]
  xin.app.items._xinValue[7] = item4
  touch(xin.app.items)
  console.timeEnd('swap')
})

scramble.textContent = 'scramble'
scramble.addEventListener('click', () => {
  console.time('scramble')
  xin.app.items.sort(() => Math.random() - 0.5)
  console.timeEnd('scramble')
})

modify.textContent = 'modify 10%'
modify.addEventListener('click', () => {
  console.time('modify')
  for(const item of xin.app.items._xinValue) {
    if(Math.random() < 0.1) {
      item.color = randomColor() 
    }
  }
  touch(xin.app.items)
  console.timeEnd('modify')
})

scrambleAndModify.textContent = 'scramble and modify'
scrambleAndModify.addEventListener('click', () => {
  console.time('scramble and modify')
  for(const item of xin.app.items._xinValue) {
    if(Math.random() < 0.1) {
      item.color = randomColor() 
    }
  }
  xin.app.items.sort(() => Math.random() - 0.5)
  console.timeEnd('scramble and modify')
})

document.body.append(div)
document.body.append(titleInput)
document.body.append(counter)
document.body.append(reset)
document.body.append(itemsInput)
document.body.append(swap)
document.body.append(scramble)
document.body.append(modify)
document.body.append(scrambleAndModify)
document.body.append(template)
document.body.append(wordTemplate)

console.time('binding')

const colorConversionSpan = document.createElement('span')

bind(div, 'app.title', bindings.text)
bind(div, 'app.titleStyle', bindings.style)
bind(titleInput, 'app.title', bindings.value)
bind(itemsInput, 'app.itemsToCreate', bindings.value)
bind(counter, 'app.items.length', bindings.text)
bind(template, xin.app.items, bindings.list, {
  bindInstance(element, obj) {
    colorConversionSpan.style.color = obj.color
    const color = colorConversionSpan.style.color
    if (element.style.color !== color) {
      element.style.border = `1px solid ${color}`
      element.style.color = color
      element.textContent = `${obj.id} ${obj.color}`
    }
  }
})

bind(wordTemplate, 'words', bindings.list, {
  bindInstance(element, word) {
    element.textContent = word
  }
})

console.timeEnd('binding')

console.timeEnd('total')