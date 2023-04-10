import {bind} from '../src'
import {elements} from '../src/elements'
import {initVars, darkMode, css, vars} from '../src/css'
import { Color } from '../src/color'
const {style} = elements

const brandColor = Color.fromCss('rgb(8, 131, 88)')

bind(document.body, 'app.darkmode', {
  toDOM(elt, value) {
    switch(value) {
      case 'dark':
        elt.classList.add('darkmode')
        break
      case 'light':
        elt.classList.remove('darkmode')
        break
      default:
        const autoSetting = getComputedStyle(document.body).getPropertyValue('--darkmode')
        elt.classList.toggle('darkmode', autoSetting === 'true')
    }
  }
})

const cssVars = {
  font: 'Helvetica Neue, Helvertica, Arial, Sans-serif',
  codeFont: 'Menlo, Monaco, monospace',
  fontSize: 16,
  lineHeight: 24,
  spacing: 16,
  textColor: '#222',
  itemSpacing: vars.spacing50,
  background: '#f0f0f0',
  panelBg: '#ddd',
  inputBg: '#fff',
  buttonBg: '#fff8',
  hoverBg: brandColor.opacity(0.25).html,
  activeBg: brandColor.opacity(0.5).html,
  primaryColor: '#ccf8',
  selectedBg: '#ddf',
  borderColor: '#0002',
  darkBorderColor: '#0004',
  lightBorderColor: '#fff4',
  inputBorder: '1px solid var(--border-color)',
  lightBorder: '1px solid var(--light-border-color)',
  darkBorder: '1px solid var(--dark-border-color)',
  roundedRadius: vars.lineHeight25,
  borderShadow: 'inset 0 0 0 1px var(--dark-border-color)',
  inputBorderShadow: 'inset 0 0 0 1px var(--border-color)',
  toolbarHeight: `calc(${vars.lineHeight} + ${vars.spacing})`,
  vh: '100vh',
}

const brandColors = {
  brandColor: brandColor.html,
  brandTextColor: '#ECF3DD',
  textHeadingColor: vars.brandColor,
}

const darkBrandColors = {
  textHeadingColor: vars.brandTextColor,
}

const codeVars = {
  codeColor: vars.textColor,
  codeBg: brandColor.brighten(0.25).saturate(1).opacity(0.1).html,
}

const rules = {
  body: {
    ...initVars({...cssVars, ...brandColors, ...codeVars}),
    fontFamily: vars.font,
    background: vars.background,
    color: vars.textColor,
    margin: 0,
    fontSize: vars.fontSize,
    lineHeight: vars.lineHeight,
    accentColor: vars.brandColor
  },
  '@media (prefers-color-scheme: dark)': {'body': initVars({darkmode: 'true'})},
  '.darkmode': {...darkMode(cssVars), ...initVars(darkBrandColors)},
  'h1, h2, h3': {
    margin: `${vars.spacing200} 0 ${vars.spacing}`,
    color: vars.textHeadingColor
  },
  'p, h4, h5, h6, pre, blockquote': {
    margin: `0 0 ${vars.spacing}`,
  },
  pre: {
    fontSize: vars.fontSize80,
    background: vars.codeBg,
    color: vars.codeColor,
    borderRadius: vars.roundedRadius50,
    padding: vars.spacing
  },
  'ul, ol': {
    margin: `0 ${vars.spacing200} ${vars.spacing} 0`
  },
  li: {
    margin: `0 0 ${vars.spacing25}`
  },
  'labeled-input, labeled-value': {
    display: 'block'
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: vars.spacing50,
    marginTop: vars.spacing
  },
  'label label': {
    marginTop: 0,
  },
  'label, input, button, textarea, select': {
    fontSize: vars.fontSize,
    lineHeight: vars.lineHeight,
    color: vars.textColor,
    border: 0,
  },
  'input, button, textarea, select': {
    padding: `${vars.spacing75} ${vars.spacing}`,
  },
  button: {
    borderRadius: vars.roundedRadius,
    background: vars.buttonBg
  },
  table: {
    borderCollapse: 'collapse',
    borderBottom: `1px solid ${brandColor.opacity(0.2).html}`
  },
  a: {
    color: vars.textHeadingColor,
    textDecoration: 'none',
    borderRadius: vars.roundedRadius50,
    padding: `${vars.spacing25} ${vars.spacing50}`
  },
  '.current-route': {
    background: vars.inputBg,
    zIndex: 1,
    pointerEvents: 'none'
  },
  th: {
    background: brandColor.opacity(0.2).html,
  },
  'td, th': {
    padding: `${vars.spacing25} ${vars.spacing75}`,
  },
  'tr:nth-child(2n+2)': {
    background: brandColor.opacity(0.05).html,
  },
  'input, textarea, select': {
    background: vars.inputBg,
  },
  'input, textarea, select, button': {
    boxShadow: vars.inputBorderShadow
  },
  'input, textarea': {
    borderRadius: vars.roundedRadius50,
  },
  'select, button': {
    borderRadius: vars.roundedRadius
  },
  'select[multiple]': {
    padding: `${vars.spacing50} 0`
  },
  'select[multiple] option': {
    padding: `${vars.spacing50} ${vars.spacing}`
  },
  'input[type="range"], input[type="checkbox"], input[type="radio"]': {
    boxShadow: 'none'
  },
  'button:not(:disabled):hover, a:not(:disabled):hover': {
    background: vars.hoverBg
  },
  'button:not(:disabled):active, a:not(:disabled):active': {
    background: vars.activeBg
  },
  'a:not(:disabled):visited': {
    opacity: 0.8
  },
  '[hidden]': {
    display: 'none !important'
  },
  'code, pre': {
    fontFamily: vars.codeFont
  },
  '.icon-button': {
    fontSize: vars.fontSize200,
    background: 'transparent',
    lineHeight: vars.lineHeight200,
    borderRadius: 1000,
    padding: 0,
    minWidth: vars.lineHeight200,
    boxShadow: 'none'
  },
  'dialog::backdrop': {
    backgroundColor: '#0004',
    backdropFilter: 'blur(2px)'
  },
  form: {
    minWidth: '300px',
    padding: 0,
  },
  '.primary': {
    backgroundColor: vars.primaryColor,
  },
  '.page-padded': {
    padding: `${vars.spacing} ${vars.spacing200}`
  },
  'option:checked': {
    background: vars.brandColor,
    color: vars.brandTextColor
  }
}

document.head.append(style({id: 'base-style'}, css(rules))) 

// adapted from https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
const setTrueHeight = () => {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`)
}
setTrueHeight()
window.addEventListener('resize', setTrueHeight)