import {makeWebComponent, vars} from '../../src/index'

export const toolBar = makeWebComponent('tool-bar', {
  style: {
    ':host': {
      display: 'flex',
      gap: vars.itemSpacing,
      alignItems: 'center',
      background: vars.panelBg,
      borderTop: vars.lightBorder,
      borderBottom: vars.darkBorder,
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
  }
})