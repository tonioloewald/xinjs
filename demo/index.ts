import {xin, touch, elements, hotReload, settings, bind, bindings, matchType} from '../src/index'
import {toolBar, labeledInput, labeledValue} from './components'
import {randomColor} from './random-color'
import {arrayBindingTest} from './ArrayBindingTest'
import {wordSearch} from './WordSearch'
import './base-style'
import logo from '../xinjs-logo.svg'

/* global window, document */

xin.app = {
  title: 'xinjs docs & tests'
}

console.time('total')

settings.perf = true

const {fragment, img, h1, span, style} = elements

async function getEmoji() {
  const request = await fetch('https://raw.githubusercontent.com/tonioloewald/emoji-metadata/master/emoji-metadata.json')
  xin.emoji = await request.json()
  console.log(xin.emoji.length, 'emoji loaded')
}

getEmoji()

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
  arrayBindingTest(),
  wordSearch()
))

console.timeEnd('total')