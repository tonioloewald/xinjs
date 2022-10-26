import {xin} from '../src/index'
import {bind, bindings} from '../src/bind'
import {hotReload} from '../src/hot-reload'

/* global document */

xin.app = {
  title: 'hello, world -- it works'
}

hotReload()

const div = document.createElement('div')
const input = document.createElement('input')

document.body.append(input)
document.body.append(div)

bind(div, 'app.title', bindings.text)
bind(input, 'app.title', bindings.value)