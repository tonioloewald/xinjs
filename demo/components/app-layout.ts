import { elements, Component } from 'xinjs'
const { fragment, slot, div } = elements

class AppLayout extends Component {
  static styleSpec = {
    ':host': {
      display: 'flex',
      flexDirection: 'column',
    },
    ':host .body': {
      display: 'flex',
      flex: '1 1 auto',
      width: '100%',
    },
    '::slotted(:not([slot]))': {
      flex: '1 1 auto',
    },
  }

  content = fragment(
    slot({ name: 'header' }),
    div(
      { class: 'body' },
      slot({ name: 'left' }),
      slot(),
      slot({ name: 'right' })
    ),
    slot({ name: 'footer' })
  )
}

export const appLayout = AppLayout.elementCreator({ tag: 'app-layout' })
