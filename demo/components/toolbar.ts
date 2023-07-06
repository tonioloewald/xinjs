import {Component, vars} from '../../src/index'

class ToolBar extends Component {
  styleNode = Component.StyleNode({
    ':host': {
      display: 'flex',
      gap: vars.itemSpacing50,
      alignItems: 'center',
      background: vars.panelBg,
      padding: `${vars.itemSpacing50} ${vars.spacing} !important`,
      margin: 0,
      minHeight: vars.toolbarHeight,
      flex: `0 0 ${vars.toolbarHeight}`,
      flexWrap: 'wrap',
      overflow: 'hidden',
      overflowX: 'scroll'
    },
    ':host > *': {
      whiteSpace: 'nowrap',
      lineHeight: vars.lineHeight
    },
    ':Host > * + *': {
      marginLeft: vars.itemSpacing50
    }
  })
}

export const toolBar = ToolBar.elementCreator()