import {xin} from '../src/index'
import {bind, bindings} from '../src/bind'
import {hotReload} from '../src/hot-reload'

/* global window, document */

console.time('total')

const items = []
for(let id = 1; id <= 10000; id++) {
  items.push({
    id,
    color: `hsl(${Math.floor(Math.random() * 360)} ${Math.floor(Math.random() * 4 + 1) * 25}% 50%)`,
  })
}

xin.app = {
  title: 'hello, world -- it works',
  items
}

hotReload()

Object.assign(window, {
  xin
})

const div = document.createElement('div')
const input = document.createElement('input')
const template = document.createElement('template')
const span = document.createElement('span')
const counter = document.createElement('div')
span.textContent = 'x'

template.content.append(span)
document.body.append(input)
document.body.append(div)
document.body.append(counter)
document.body.append(template)

console.time('binding')

bind(div, 'app.title', bindings.text)
bind(input, 'app.title', bindings.value)
bind(counter, 'app.items.length', bindings.text)
bind(template, 'app.items', bindings.list, {bindInstance(element, obj){
  element.style.display = 'inline-block'
  element.style.padding = '10px'
  element.style.margin = '5px'
  element.style.border = `1px solid ${obj.color}`
  element.style.color = obj.color
  element.textContent = obj.color
}})

console.timeEnd('binding')

console.timeEnd('total')