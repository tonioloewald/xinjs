import {xin, touch, elements, hotReload, settings, matchType} from '../src/index'
import {settingsDialog} from './SettingsDialog'
import {arrayBindingTest} from './ArrayBindingTest'
import { markdownViewer } from './components/markdown-viewer'
import {wordSearch} from './WordSearch'
import './base-style'
import logo from '../xinjs-logo.svg'
import readmeMd from '../readme.md'

/* global window, document */

xin.app = {
  title: 'xinjs docs & tests'
}

console.time('total')

settings.perf = true

const {fragment, img, h1, span, style, button} = elements

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
  span(
    {
      style: {
        display: 'flex',
        height: '44px',
        padding: '8px',
        alignItems: 'center',
        marginTop: 'calc(var(--spacing) * -1)'
      }
    },
    img({
      alt: 'xinjs logo',
      style: {
        width: '44px',
        height: '44px',
        marginRight: '10px'
      },
      src: logo
    }),
    h1({
      style: {
        lineHeight: '44px',
        fontSize: '24px',
        fontWeight: '200',
        padding: 0,
        margin: 0,
      },
      bindText: 'app.title'
    }),
    span({style: {flex: '1 1 auto'}}),
    button('settings', {
      onClick() {
        document.querySelector('.settings').showModal()
      }
    })
  ),
  markdownViewer({src: readmeMd, style: { margin: '0 calc(var(--spacing) * -1)'}}),
  settingsDialog(),
  arrayBindingTest(),
  wordSearch(),
))

console.timeEnd('total')