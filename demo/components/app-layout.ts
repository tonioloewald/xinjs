import {elements, makeWebComponent} from '../../src/index'
const {slot, div} = elements

export const appLayout = makeWebComponent('app-layout', {
  style: {
    ':host': {
      display: 'flex',
      flexDirection: 'column'
    },
    ':host .body': {
      display: 'flex',
      flex: '1 1 auto',
      width: '100%'
    },
    '::slotted(:not([slot]))': {
      flex: '1 1 auto'
    }
  },
  content: [
    slot({name: 'header'}),
    div(
      { class: 'body' },
      slot({name: 'left'}),
      slot(),
      slot({name: 'right'})
    ),
    slot({name: 'footer'})
  ]
})