import {elements, makeWebComponent} from '../../src/index'

export const toolBar = makeWebComponent('tool-bar', {
  style: {
    ':host': {
      display: 'flex',
      gap: 'var(--item-spacing)',
      alignItems: 'center',
      background: 'var(--panel-bg)',
      borderTop: 'var(--light-border)',
      borderBottom: 'var(--dark-border)',
      padding: '0 var(--spacing) !important',
      margin: 0,
      height: 'calc(var(--line-height) + var(--spacing))',
      overflow: 'hidden'
    },
    ':host > *': {
      whiteSpace: 'nowrap',
      lineHeight: 'var(--line-height)',
    }
  }
})