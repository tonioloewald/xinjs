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
      height: `calc(${vars.lineHeight} + ${vars.spacing})`,
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