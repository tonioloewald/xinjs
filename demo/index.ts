import { xin, touch, elements, hotReload, settings, matchType } from '../src/index'
import { settingsDialog } from './SettingsDialog'
import { arrayBindingTest } from './ArrayBindingTest'
import { markdownViewer } from './components/markdown-viewer'
import { todo } from './components/todo'
import { b3d, bSphere, bLoader, bButton, bLight, bSun } from './components/babylon3d'
import { wordSearch } from './WordSearch'
import './base-style'
import logo from '../xinjs-logo.svg'
import readmeMd from '../readme.md'
import scene from './b-frame-test.glb'

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

const routes = ['read-me', 'todo', 'array-binding', 'word-search', 'babylon-3d']

function showRoute () {
  const route = location.search.substring(1).split('&').shift() || routes[0]
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
          background: 'var(--input-bg)',
          position: 'relative'
        }
      },
      markdownViewer({src: readmeMd, style: { padding: '20px 40px'}, dataRoute: 'read-me'}),
      todo({dataRoute: 'todo', hidden: true}),
      arrayBindingTest({dataRoute: 'array-binding', hidden: true}),
      wordSearch({dataRoute: 'word-search', hidden: true}),
      b3d(
        {dataRoute: 'babylon-3d', hidden: true, glowLayerIntensity: 1},
        bSphere({name: 'tiny-sphere', diameter: 0.25, y: 0.125, x: 2}), 
        bSphere({name: 'little-sphere', diameter: 0.5, y: 0.25, x: 1.5}),
        bLoader({url: scene, scale: 0.5, reflective: ['Cube.001']}),
        bButton({caption: 'xinjs rules', x: -2, y: 1.5, action: () => {
          alert('yes it does!')
        }}),
        bLight({y: 1, z: 0.5, intensity: 0.05, diffuse: [0.5,0.5,1]}),
        bSun({shadowMinZ: 0.1, shadowMaxZ: 100, bias: 0.003, normalBias: 0.005, shadowTextureSize: 2048})
      )
    )
  ),
  settingsDialog(),
))

showRoute()

console.timeEnd('total')