import { Component, vars, XinStyleSheet } from '../../src/'

class ToolBar extends Component {
  static styleSpec = {
    ':host': {
      display: 'flex',
      gap: vars.itemSpacing50,
      alignItems: 'center',
      background: vars.panelBg,
      padding: `${vars.itemSpacing50} ${vars.spacing} !important`,
      margin: 0,
      minHeight: vars.toolbarHeight,
      flex: `0 0 auto`,
      flexWrap: 'wrap',
      overflow: 'hidden',
    },
    ':host > *': {
      whiteSpace: 'nowrap',
      lineHeight: vars.lineHeight,
    },
    ':host > * + *': {
      marginLeft: vars.itemSpacing50,
    },
  } as XinStyleSheet
}

export const toolBar = ToolBar.elementCreator({ tag: 'tool-bar' })
