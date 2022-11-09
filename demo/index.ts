import { xin, touch, elements, hotReload, settings, matchType, bind } from '../src/index'
import { settingsDialog } from './SettingsDialog'
import { arrayBindingTest } from './ArrayBindingTest'
import { markdownViewer } from './components/markdown-viewer'
import { wordSearch } from './WordSearch'
import './base-style'
import logo from '../xinjs-logo.svg'
import readmeMd from '../readme.md'

/* global window, document */

xin.app = {
  title: 'xinjs docs & tests',
}

console.time('total')

settings.perf = true

const {img, h1, div, span, style, button} = elements

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

const routes = ['read-me', 'array-binding', 'word-search']

function showRoute () {
  const route = location.search.substring(1).split('&').shift()
  const routedElements = [...document.querySelectorAll('[data-route]')] as HTMLElement[]
  for(const element of routedElements) {
    element.toggleAttribute('hidden', element.dataset?.route !== route)
  }
}

window.addEventListener('popstate', showRoute)

const appBar = () => span(
  {
    style: {
      display: 'flex',
      height: '44px',
      padding: '0 8px',
      alignItems: 'center',
      flex: '0 0 60px',
      borderBottom: 'var(--dark-border)'
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
)

document.head.append(style('body { font-family: Sans-serif }'))

document.body.append(div(
  {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden'
    }
  },
  appBar(),
  div(
    { style: { display: 'flex', flex: '1 1 auto', overflow: 'hidden' } },
    div(
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          flex: '0 0 180px',
          borderRight: 'var(--dark-border)'
        }
      },
      ...routes.map(route => button(
        route.replace(/\-/g, ' '),
        {
          onClick() {
            const newUrl = window.location.href.split('?')[0] + '?' + route
            window.history.pushState({}, route, newUrl)
            showRoute()
          }
        }
      ))
    ),
    div(
      { 
        id: 'main',
        style: {
          overflowY: 'overlay',
          flex: '1 1 auto',
          background: 'var(--input-bg)'
        }
      },
      markdownViewer({src: readmeMd, style: { padding: '20px 40px'}, dataRoute: 'read-me'}),
      arrayBindingTest({dataRoute: 'array-binding', hidden: true}),
      wordSearch({dataRoute: 'word-search', hidden: true})
    )
  ),
  settingsDialog(),
))

console.timeEnd('total')