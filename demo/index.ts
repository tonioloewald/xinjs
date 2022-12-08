import { xin, touch, elements, hotReload, settings, matchType, vars } from '../src/index'
import { getElementBindings } from '../src/metadata'
import { settingsDialog } from './SettingsDialog'
import { arrayBindingTest } from './ArrayBindingTest'
import { markdownViewer } from './components/markdown-viewer'
import { todo } from './components/todo'
import { b3d, bSphere, bLoader, bButton, bLight, bSun, bSkybox, bWater, bBiped, bReflections } from './components/babylon3d'
import { gameController } from './components/game-controller'
import { wordSearch } from './WordSearch'
import { Color } from '../src/color'
import './style'
import logo from '../xinjs-logo.svg'
import readmeMd from '../readme.md'
import scene from './assets/b-frame-test.glb'
import omnidude from './assets/omnidude.glb'

/* global window, document */

xin.app = {
  title: 'xinjs docs & tests',
}

console.time('total')

settings.perf = true

const {img, h1, div, span, style, button, a} = elements

async function getEmoji() {
  const request = await fetch('https://raw.githubusercontent.com/tonioloewald/emoji-metadata/master/emoji-metadata.json')
  xin.emoji = await request.json() as any[]
  console.log(xin.emoji.length, 'emoji loaded')
}

getEmoji()

hotReload(path => {
  if (path.startsWith('words') || path.startsWith('emoji')) {
    return false
  }
  return true
})

Object.assign(globalThis, {
  xin,
  matchType,
  touch,
  Color,
  vars,
  getElementBindings
})

const routes = ['read-me', 'todo', 'array-binding', 'word-search', 'babylon-3d']

function showRoute () {
  const route = location.search.substring(1).split('&').shift() || routes[0]
  const routedElements = [...document.querySelectorAll('[data-route]')] as HTMLElement[]
  for(const element of routedElements) {
    element.toggleAttribute('hidden', element.dataset?.route !== route)
  }
  [...document.querySelectorAll('a')].forEach((a) => {
    a.classList.toggle('current-route', a.href === window.location.href)
  })
}

window.addEventListener('popstate', showRoute)

const appBar = () => span(
  {
    style: {
      display: 'flex',
      height: '44px',
      padding: '0 8px',
      alignItems: 'center',
      flex: '0 0 60px'
    }
  },
  button('☰', {
    title: 'toggle menu',
    class: 'icon-button',
    style: {
      fontSize: vars.fontSize150,
      marginRight: vars.spacing50,
    },
    onClick() {
      const leftSideNav = document.querySelector('.left-side-nav') as HTMLElement
      if (leftSideNav.style.marginLeft) {
        leftSideNav.style.marginLeft = ''
      } else {
        leftSideNav.style.marginLeft = '-180px'
      }
    }
  }),
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
  button('⚙', {
    title: 'settings',
    class: 'icon-button',
    onClick() {
      (document.querySelector('.settings') as HTMLDialogElement).showModal()
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
        class: 'left-side-nav',
        style: {
          display: 'flex',
          flexDirection: 'column',
          flex: '0 0 180px',
          transition: 'margin-left 0.25s ease-out',
        }
      },
      ...routes.map(route => a(
        route.replace(/\-/g, ' '),
        {
          href: `?${route}`,
          onClick(event: Event) {
            event.preventDefault()
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
      // todo({dataRoute: 'todo', hidden: true}), // TODO track down bug when same component (with list binding is inserted)
      todo({dataRoute: 'todo', hidden: true}),
      arrayBindingTest({dataRoute: 'array-binding', hidden: true}),
      wordSearch({dataRoute: 'word-search', hidden: true}),
      b3d(
        {dataRoute: 'babylon-3d', hidden: true, glowLayerIntensity: 1},
        bSun({shadowTextureSize: 2048, activeDistance: 20}),
        bSkybox({timeOfDay: 8.5}),
        bSphere({name: 'tiny-sphere', diameter: 0.25, y: 0.125, x: 2}), 
        bSphere({name: 'little-sphere', diameter: 0.5, y: 0.25, x: 1.5}),
        bLoader({url: scene}),
        gameController(bBiped({url: omnidude, player: true, cameraType: 'follow', initialState: 'look'})),
        bBiped({url: omnidude, x: 3, initialState: 'dance'}),
        bButton({caption: 'Toggle XR', x: -2, y: 1.5, action: () => {
          const biped = document.querySelector('b-biped[player]')
          // @ts-ignore-error
          if (biped.cameraType !== 'xr') {
            // @ts-ignore-error
            biped.cameraType = 'xr'
          } else {
            window.location.reload()
          }
        }}),
        bLight({y: 1, z: 0.5, intensity: 0.05, diffuse: '#8080ff'}),
        bWater({y: -0.2, twoSided: true}),
        bReflections(),
      )
    )
  ),
  settingsDialog(),
))

showRoute()

console.timeEnd('total')