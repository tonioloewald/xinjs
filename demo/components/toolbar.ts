import {Component, vars} from '../../src/index'

class ToolBar extends Component {
  styleNode = Component.StyleNode({
    ':host': {
      display: 'flex',
      gap: vars.itemSpacing,
      alignItems: 'center',
      background: vars.panelBg,
      padding: `0 ${vars.spacing} !important`,
      margin: 0,
      height: vars.toolbarHeight,
      flex: `0 0 ${vars.toolbarHeight}`,
      overflow: 'hidden',
      overflowX: 'overlay'
    },
    ':host > *': {
      whiteSpace: 'nowrap',
      lineHeight: vars.lineHeight
    }
  })
}

export const toolBar = ToolBar.elementCreator()