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
      padding: '0 var(--spacing)',
      margin: '0 calc(-1 * var(--spacing))',
      height: 'calc(var(--line-height) + var(--spacing))'
    },
    ':host > *': {
      whiteSpace: 'nowrap',
      lineHeight: 'var(--line-height)',
    }
  }
})