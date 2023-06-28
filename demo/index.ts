import './style'
import { xin, touch, xinProxy, elements, hotReload, settings, vars, ContentType } from '../src/'
import { getElementBindings } from '../src/metadata'
import { settingsDialog } from './SettingsDialog'
import { arrayBindingTest } from './ArrayBindingTest'
import { markdownViewer } from './components/markdown-viewer'
import { todo } from './components/todo'
import { kitchenSink } from './components/kitchen-sink'
import { wordSearch } from './WordSearch'
import { listFilterDemo } from './components'
import { fauxSlots } from './faux-slots'
import { Color } from '../src/color'
const logo = './assets/xinjs-logo.svg'
const readmeMd = './assets/readme.md'

xin.app = {
  title: 'docs & tests',
  darkmode: 'auto'
}

console.time('total')

settings.perf = true

const {img, h1, div, nav, span, button, a, main} = elements

hotReload(path => {
  if (path.startsWith('words') || path.startsWith('emoji')) {
    return false
  }
  return true
})

Object.assign(globalThis, {
  xin,
  elements,
  vars,
  xinProxy,
  touch,
  Color,
  getElementBindings
})

type Route = {
  path: string,
  content: () => ContentType
}
const routes: Route[] = [
  {
    path: 'read-me',
    content: () => div({class: 'page-padded'}, markdownViewer({src: readmeMd})),
  },
  {
    path: 'todo',
    content: todo,
  },
  {
    path: 'array-binding', 
    content: arrayBindingTest,
  },
  {
    path: 'word-search',
    content: wordSearch,
  },
  {
    path: 'faux-slots',
    content: () => fauxSlots(
      { style: { padding: '20px', display: 'block'} },
      span({slot: 'heading'}, 'this will go in the heading'),
      div('these will go in the body'),
      button('Click me?')
    ),
  },
  {
    path: 'list-filters',
    content: () => div({class: 'page-padded'}, listFilterDemo()),
  },
  {
    path: 'kitchen-sink',
    content: () => div({class: 'page-padded'}, kitchenSink()),
  },
]

function showRoute () {
  const main = document.querySelector('main')
  const path = location.search.substring(1).split('&').shift()
  let route = routes.find(route => route.path === path)
  if (route == null) {
    route = routes[0]
  }
  [...document.querySelectorAll('a')].forEach((a) => {
    a.classList.toggle('current-route', a.dataset.route === path)
  })
  main!.textContent = ''
  main!.append(route.content() as Node)
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
      background: vars.brandColor,
      '--text-color': vars.brandTextColor,
      '--text-heading-color': vars.brandTextColor,
    }
  },
  button('▸', {
    title: 'toggle menu',
    class: 'icon-button',
    style: {
      fontSize: vars.fontSize150,
      marginRight: vars.spacing50,
      transition: '0.25s ease-out',
      transform: 'rotateZ(180deg)'
    },
    onClick(event) {
      const leftSideNav = document.querySelector('.left-side-nav') as HTMLElement
      if (leftSideNav.style.marginLeft) {
        leftSideNav.style.marginLeft = ''
        event.target.style.transform = 'rotateZ(180deg)'
      } else {
        leftSideNav.style.marginLeft = '-180px'
        event.target.style.transform = ''
      }
    }
  }),
  span({style: {flex: '1 1 auto'}}),
  h1(
    {
      style: {
        lineHeight: '44px',
        fontSize: '24px',
        fontWeight: '200',
        padding: 0,
        margin: 0,
        display: 'flex'
      }
    },
    img({
      alt: 'xinjs',
      style: {
        width: '44px',
        height: '44px',
        marginRight: '10px'
      },
      src: logo
    }),
    span({bindText: 'app.title'})
  ),
  span({style: {flex: '1 1 auto'}}),
  button('⚙', {
    title: 'settings',
    class: 'icon-button',
    onClick() {
      (document.querySelector('.settings') as HTMLDialogElement).showModal()
    }
  })
)

document.body.append(div(
  {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: vars.vh,
      overflow: 'hidden'
    }
  },
  appBar(),
  div(
    { style: { display: 'flex', flex: '1 1 auto', overflow: 'hidden' } },
    nav(
      {
        class: 'left-side-nav',
        style: {
          display: 'flex',
          flexDirection: 'column',
          flex: '0 0 180px',
          transition: 'margin-left 0.25s ease-out',
          padding: '10px 0',
        }
      },
      ...routes.map(route => a(
        route.path.replace(/\-/g, ' '),
        {
          dataRoute: route.path,
          href: `?${route.path}`,
          onClick(event: Event) {
            event.preventDefault()
            const newUrl = window.location.href.split('?')[0] + '?' + route.path
            window.history.pushState({}, route.path, newUrl)
            showRoute()
          }
        }
      ))
    ),
    main(
      {
        style: {
          overflowY: 'auto',
          flex: '1 1 auto',
          background: 'var(--input-bg)',
          position: 'relative'
        }
      }
    )
  ),
  settingsDialog(),
))

showRoute()

console.timeEnd('total')