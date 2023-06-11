import { xinProxy, elements, touch, vars, XinStyleSheet, css, getListItem, bindings } from "../../src"

const { div, span, h1, h2, input, template, style, button } = elements

bindings.selected = {
  toDOM(element, value) {
    if (value[SELECTED]) {
      element.setAttribute('data-selected', '') 
    } else {
      element.removeAttribute('data-selected')
    }
  }
}

const styles: XinStyleSheet = {
  '.emoji-table': {
    maxHeight: '300px',
    overflowY: 'scroll',
    flex: '1 0 340px',
    cursor: 'default',
  },

  '.emoji-table .t-row[data-selected]': {
    background: vars.brandColor,
    color: vars.background,
  },

  '.emoji-table .t-row': {
    display: 'grid',
    gridTemplateColumns: '40px 300px 200px 200px',
    whiteSpace: 'nowrap',
    lineHeight: '30px',
    height: '30px'
  },

  '.emoji-detail:not(.xin-empty-list)': {
    flex: `1 1 100%`,
    position: 'relative',
    borderRadius: vars.roundedRadius,
    boxShadow: `0 0 0 2px ${vars.brandColor}`
  },

  '.close-detail': {
    position: 'absolute',
    top: vars.spacing50,
    right: vars.spacing50,
  },

  '.graphic': {
    fontSize: '24px',
    textAlign: 'center'
  },

  '.no-overflow': {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },

  'input[type="search"]': {
    padding: `${vars.spacing75} ${vars.spacing125}`
  }
}

document.head.append(style(
  { id: 'list-filfter' },
  css(styles)
))

const HIDDEN = Symbol('hidden')
const SELECTED = Symbol('selected')

const { emoji } = xinProxy({
  emoji: {
    list: [] as any[],
    _needle: '',
    get needle () {
      return emoji._needle
    },
    set needle (newValue: string) {
      newValue = newValue.trim().toLocaleLowerCase()
      if (newValue !== emoji._needle) {
        console.log('filter changed')
        emoji._needle = newValue
        if (newValue === '') {
          emoji.list.forEach(item => { delete item[HIDDEN]})
        } else {
          emoji.list.forEach(item => {
            item[HIDDEN] = !item.name.toLocaleLowerCase().includes(emoji._needle)
          })
        }
        touch('emoji.list')
      }
    },
    deselect () {
      const selected = emoji.list.find(item => item[SELECTED])
      delete selected[SELECTED]
      touch('emoji.list')
    },
    select(event) {
      console.log(event)
      if (event.type !== 'click' && event.code !== 'Space') {
        return
      }
      if (event.type === 'keydown') {
        event.preventDefault()
      }
      const selectedItem = getListItem(event.target)
      emoji.list.forEach(item => {
        if (item === selectedItem && !item[SELECTED]) {
          item[SELECTED] = true
          touch('emoji.list')
        } else {
          delete item[SELECTED]
        }
      })
    },
  }
})

async function getEmoji() {
  const request = await fetch('https://raw.githubusercontent.com/tonioloewald/emoji-metadata/master/emoji-metadata.json')
  emoji.list = await request.json() as any[]
  console.log(emoji.list.length, 'emoji loaded')
}

getEmoji()

export const listFilterDemo = () => div(
  h1('Filtered Lists'),
  div(
    { style: {
      marginBottom: vars.spacing
    } },
    input({
      type: 'search',
      bindValue: 'emoji.needle',
      placeholder: 'filter emoji by name',
      style: {
        width: '300px',
        borderRadius: '99px'
      }
    })
  ),
  div(
    {
      style: {
        display: 'flex'
      }
    },
    div(
      { 
        class: 'emoji-table',
        bindList: {
          value: emoji.list,
          idPath: 'name',
          hiddenProp: HIDDEN,
          virtual: {
            height: 30
          },
        },
      },
      template(
        div(
          { 
            class: 't-row',
            onClick: emoji.select,
            onKeydown: emoji.select,
            bindSelected: '^',
            tabindex: 0
          },
          span({ bindText: '^.chars', class: 'graphic' } ),
          span({ bindText: '^.name', class: 'no-overflow' }),
          span({ bindText: '^.category', class: 'no-overflow' }),
          span({ bindText: '^.subcategory', class: 'no-overflow' }),
        )
      )
    ),
    div(
      { 
        class: 'emoji-detail',
        bindList: {
          value: emoji.list,
          idPath: 'name',
          visibleProp: SELECTED,
        }
      },
      template(
        div(
          { style: { 
            textAlign: 'center', 
            padding: vars.spacing, 
          } },
          div({ bindText: '^.chars', style: {
            fontSize: '120px',
            lineHeight: '140px',
          } } ),
          h2({ bindText: '^.name', class: 'no-overflow' }),
          div({ bindText: '^.category', class: 'no-overflow' }),
          div({ bindText: '^.subcategory', class: 'no-overflow' }),
          button('✕', { class: 'close-detail', onClick: emoji.deselect })
        )
      )
    )
  ),
)