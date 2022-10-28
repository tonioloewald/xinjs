import {xin, touch} from '../src/index'
import {bind, bindings} from '../src/bind'
import {hotReload} from '../src/hot-reload'

/* global window, document */

console.time('total')

const randomColor = () => `hsl(${Math.floor(Math.random() * 360)} ${Math.floor(Math.random() * 4 + 1) * 25}% 50%)`

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

const INITIAL_ITEMS = 1000

xin.app = {
  title: 'hello, world -- it works',
  itemsToCreate: INITIAL_ITEMS,
  items: makeItems(INITIAL_ITEMS)
}

hotReload()

Object.assign(window, {
  xin
})

const div = document.createElement('div')
const input = document.createElement('input')
const template = document.createElement('template')
const span = document.createElement('span')

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
const reset = document.createElement('button')

reset.textContent = 'reset'
reset.addEventListener('click', () => {
  const items = makeItems(xin.app.itemsToCreate)
  console.time('reset')
  xin.app.items = items
  console.timeEnd('reset')
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

document.body.append(input)
document.body.append(div)
document.body.append(counter)
document.body.append(reset)
document.body.append(scramble)
document.body.append(modify)
document.body.append(scrambleAndModify)
document.body.append(template)

console.time('binding')

bind(div, 'app.title', bindings.text)
bind(input, 'app.title', bindings.value)
bind(counter, 'app.items.length', bindings.text)
bind(template, 'app.items', bindings.list, {bindInstance(element, obj){
  if (element.style.color !== obj.color) {
    element.style.border = `1px solid ${obj.color}`
    element.style.color = obj.color
    element.textContent = `${obj.id} ${obj.color}`
  }
}})

console.timeEnd('binding')

console.timeEnd('total')