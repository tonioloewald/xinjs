import {elements, camelToKabob} from '../src/elements'
import {initVars, css, vars} from '../src/css'
const {style} = elements

const rules = {
  ':root': initVars({
    font: 'Helvetica Neue, Helvertica, Arial, Sans-serif',
    codeFont: 'Menlo, Monaco, monospace',
    fontSize: 15,
    lineHeight: 25,
    spacing: 10,
    textColor: '#222',
    codeColor: '#eee',
    itemSpacing: vars.spacing50,
    background: '#eee',
    codeBg: '#333',
    panelBg: '#ddd',
    inputBg: '#fff',
    hoverBg: '#eef',
    activeBg: '#dde',
    selegedBg: '#ddf',
    inputBorder: '1px solid #0004',
    lightBorder: '1px solid #fff4',
    darkBorder: '1px solid #0002',
    roundedRadius: vars.lineHeight25
  }),
  body: {
    fontFamily: vars.font,
    background: vars.background,
    color: vars.textColor,
    margin: 0,
    fontSize: vars.fontSize
  },
  'h1, h2, h3': {
    margin: `${vars.spacing200} 0 ${vars.spacing}`
  },
  'p, h4, h5, h6, pre, blockquote': {
    margin: `0 0 ${vars.spacing}`
  },
  'ul, ol': {
    margin: `0 ${vars.spacing200} ${vars.spacing} 0`
  },
  li: {
    margin: `0 0 ${vars.spacing50}`
  },
  'labeled-input, labeled-value': {
    display: 'block'
  },
  'label, input, button, textarea': {
    fontSize: vars.fontSize,
    padding: `0 ${vars.spacing}`,
    lineHeight: vars.lineHeight
  },
  'input, button': {
    background: vars.inputBg,
    border: vars.inputBorder
  },
  button: {
    borderRadius: vars.roundedRadius
  },
  'input, textarea': {
    borderRadius: vars.roundedRadius50
  },
  'button:not(:disabled):hover': {
    background: vars.hoverBg
  },
  'button:not(:disabled):active': {
    background: vars.activeBg
  },
  '[hidden]': {
    display: 'none !important'
  },
  'code, pre': {
    fontFamily: vars.codeFont
  },
  pre: {
    background: vars.codeBg,
    color: vars.codeColor,
    borderRadius: vars.roundedRadius50
  }
}

document.head.append(style({id: 'base-style'}, css(rules))) 