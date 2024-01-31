import {
  xinProxy,
  elements,
  touch,
  vars,
  getListItem,
  bindings,
  Component,
} from '../../src'
import { markdownViewer } from './markdown-viewer'

const { div, span, h1, h2, input, template, button, label, textarea } = elements

bindings.selected = {
  toDOM(element, value) {
    if (value[SELECTED]) {
      element.setAttribute('data-selected', '')
    } else {
      element.removeAttribute('data-selected')
    }
  },
}

const HIDDEN = Symbol('hidden')
const SELECTED = Symbol('selected')

const { emoji } = xinProxy({
  emoji: {
    list: [] as any[],
    _needle: '',
    get needle() {
      return emoji._needle
    },
    set needle(newValue: string) {
      newValue = newValue.trim().toLocaleLowerCase()
      if (newValue !== emoji._needle) {
        emoji._needle = newValue
        if (newValue === '') {
          emoji.list.forEach((item) => {
            delete item[HIDDEN]
          })
        } else {
          emoji.list.forEach((item) => {
            item[HIDDEN] = !item.name
              .toLocaleLowerCase()
              .includes(emoji._needle)
          })
        }
        touch('emoji.list')
      }
    },
    deselect() {
      const selected = emoji.list.find((item) => item[SELECTED])
      delete selected[SELECTED]
      touch('emoji.list')
    },
    select(event: Event) {
      if (event.type !== 'click' && (event as KeyboardEvent).code !== 'Space') {
        return
      }
      if (event.type === 'keydown') {
        event.preventDefault()
      }
      const selectedItem = getListItem(event.target as HTMLElement)
      emoji.list.forEach((item) => {
        if (item === selectedItem) {
          if (!item[SELECTED]) {
            item[SELECTED] = true
            touch('emoji.list')
          }
        } else {
          delete item[SELECTED]
        }
      })
    },
  },
})

async function getEmoji() {
  const request = await fetch(
    'https://raw.githubusercontent.com/tonioloewald/emoji-metadata/master/emoji-metadata.json'
  )
  emoji.list = ((await request.json()) as any[]).map((e) => {
    e.notes = ''
    return e
  })
  console.log(emoji.list.length, 'emoji loaded')
}

getEmoji()

class ListFilterDemo extends Component {
  content = () =>
    div(
      h1({ style: { marginTop: 0 } }, 'Filtered Lists'),
      markdownViewer(`\
In this example, the **list** and **detail** views are both *filtered* list-bindings bound to the
same array, and thus the views have a *single source of truth*.

The **list** view uses \`hiddenProp\` to remove non-matches from the list, while the detail view uses \`selectedProp\` to
specify which item appears in the **detail** view. In both cases the property used is a \`symbol\`, but a string could
be used to leverage an existing object property.

The only reason notes aren't persisted on refresh is that the array is kind of large and so it's excluded
from hot-reload.`),
      div(
        {
          style: {
            marginBottom: vars.spacing,
          },
        },
        input({
          type: 'search',
          bindValue: 'emoji.needle',
          placeholder: 'filter emoji by name',
          style: {
            width: '300px',
            borderRadius: '99px',
          },
        })
      ),
      div(
        {
          style: {
            display: 'flex',
            overflow: 'hidden',
            boxShadow: vars.inputBorderShadow,
            borderRadius: vars.roundedRadius,
            position: 'relative',
          },
        },
        div(
          {
            class: 'emoji-table',
            bindList: {
              value: emoji.list,
              idPath: 'name',
              hiddenProp: HIDDEN,
              virtual: {
                height: 30,
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
                tabindex: 0,
              },
              span({ bindText: '^.chars', class: 'graphic' }),
              span({ bindText: '^.name', class: 'no-overflow' }),
              span({ bindText: '^.category', class: 'no-overflow' }),
              span({ bindText: '^.subcategory', class: 'no-overflow' })
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
            },
          },
          template(
            div(
              {
                style: {
                  textAlign: 'center',
                  padding: vars.spacing,
                },
              },
              div({
                bindText: '^.chars',
                style: {
                  fontSize: '120px',
                  lineHeight: '120px',
                },
              }),
              h2({
                bindText: '^.name',
                class: 'no-overflow',
                style: { marginTop: vars.spacing },
              }),
              div({ bindText: '^.category', class: 'no-overflow' }),
              div({ bindText: '^.subcategory', class: 'no-overflow' }),
              label(
                span('Notes'),
                textarea({
                  placeholder: 'enter your notes here',
                  bindValue: '^.notes',
                  style: { resize: 'none' },
                })
              ),
              button('✕', { class: 'close-detail', onClick: emoji.deselect })
            )
          )
        )
      )
    )
}

export const listFilterDemo = ListFilterDemo.elementCreator({
  tag: 'list-filter-demo',
  styleSpec: {
    '.emoji-table': {
      height: '380px',
      overflowX: 'hidden',
      overflowY: 'scroll',
      flex: '1 0 350px',
      cursor: 'default',
    },

    '.emoji-table .t-row[data-selected]': {
      background: vars.brandColor,
      color: vars.brandTextColor,
    },

    '.emoji-table .t-row:hover:not([data-selected])': {
      background: vars.brandColor10o,
    },

    '.emoji-table .t-row': {
      display: 'grid',
      gridTemplateColumns: '50px 300px 200px 200px',
      whiteSpace: 'nowrap',
      lineHeight: '30px',
      height: '30px',
    },

    '.emoji-detail:not(.-xin-empty-list)': {
      flex: '1 1 auto',
      width: 'calc(100% - 350px)',
      position: 'absolute',
      background: vars.inputBg75o,
      backdropFilter: 'blur(4px)',
      pointerEvents: 'none',
      top: 0,
      bottom: 0,
      right: 0,
      borderRadius: `0 ${vars.roundedRadius} ${vars.roundedRadius} 0`,
      boxShadow: vars.inputBorderShadow,
    },

    '.emoji-detail:not(.-xin-empty-list) textarea, .emoji-detail:not(.-xin-empty-list) button':
      {
        pointerEvents: 'all',
      },

    '.close-detail': {
      position: 'absolute',
      top: vars.spacing50,
      right: vars.spacing50,
      boxShadow: 'none',
      background: 'transparent',
    },

    '.graphic': {
      fontSize: '24px',
      textAlign: 'center',
    },

    '.no-overflow': {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },

    'input[type="search"]': {
      padding: `${vars.spacing75} ${vars.spacing125}`,
    },
  },
})
