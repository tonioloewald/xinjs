import { bind } from '../src'
import { StyleSheet, vars, invertLuminance } from '../src/css'
import { Color } from '../src/color'

const brandColor = Color.fromCss('rgb(8, 131, 88)')

bind(document.body, 'app.darkmode', {
  toDOM(elt, value) {
    switch (value) {
      case 'dark':
        elt.classList.add('darkmode')
        break
      case 'light':
        elt.classList.remove('darkmode')
        break
      default: {
        const autoSetting = getComputedStyle(document.body).getPropertyValue(
          '--darkmode'
        )
        elt.classList.toggle('darkmode', autoSetting === 'true')
      }
    }
  },
})

const cssVars = {
  _font: "'Aleo', Sans-serif",
  _codeFont: "'Spline Sans Mono', monospace",
  _fontSize: 16,
  _codeFontSize: 16,
  _lineHeight: 24,
  _touchSize: 48,
  _spacing: 16,
  _textColor: '#222',
  _itemSpacing: vars.spacing50,
  _background: '#e8e8e8',
  _panelBg: '#ddd',
  _inputBg: '#fff',
  _buttonBg: '#fff8',
  _currentBg: brandColor.opacity(0.125),
  _hoverBg: brandColor.opacity(0.25),
  _activeBg: brandColor.opacity(0.5),
  _primaryColor: '#ccf8',
  _selectedBg: '#ddf',
  _borderColor: '#0002',
  _darkBorderColor: '#0004',
  _lightBorderColor: '#fff4',
  _inputBorder: '1px solid var(--border-color)',
  _lightBorder: '1px solid var(--light-border-color)',
  _darkBorder: '1px solid var(--dark-border-color)',
  _roundedRadius: vars.lineHeight25,
  _borderShadow: 'inset 0 0 0 1px var(--dark-border-color)',
  _inputBorderShadow: 'inset 0 0 0 1px var(--border-color)',
  _toolbarHeight: `calc(${vars.lineHeight} + ${vars.spacing})`,
  _placeHolderOpacity: 0.5,
  _vh: '100vh',
}

const brandColors = {
  _brandColor: brandColor,
  _brandTextColor: '#ECF3DD',
  _textHeadingColor: vars.brandColor,
}

const darkBrandColors = {
  _textHeadingColor: vars.brandTextColor,
}

const codeVars = {
  _codeColor: vars.textColor,
  _codeBg: brandColor.brighten(0.25).saturate(1).opacity(0.1),
}

StyleSheet('base-style', {
  '@import':
    'https://fonts.googleapis.com/css2?family=Aleo:ital,wght@0,100..900;1,100..900&famiSpline+Sans+Mono:ital,wght@0,300..700;1,300..700&display=swap',
  body: {
    ...cssVars,
    ...brandColors,
    ...codeVars,
    fontFamily: vars.font,
    background: vars.background,
    color: vars.textColor,
    margin: 0,
    fontSize: vars.fontSize,
    lineHeight: vars.lineHeight,
    accentColor: vars.brandColor,
  },
  '@media (prefers-color-scheme: dark)': {
    body: {
      _darkmode: 'true',
    },
  },
  '.darkmode': { ...invertLuminance(cssVars), ...darkBrandColors },
  'h1, h2, h3': {
    margin: `${vars.spacing200} 0 ${vars.spacing}`,
    color: vars.textHeadingColor,
  },
  'p, h4, h5, h6, pre, blockquote': {
    margin: `0 0 ${vars.spacing}`,
  },
  blockquote: {
    paddingLeft: `${vars.spacing}`,
    paddingRight: `${vars.spacing}`,
    fontSize: '90%',
  },
  h1: {
    lineHeight: vars.lineHeight200,
  },
  h2: {
    lineHeight: vars.lineHeight150,
  },
  h3: {
    lineHeight: vars.lineHeight125,
  },
  pre: {
    fontSize: vars.codeFontSize,
    background: vars.codeBg,
    color: vars.codeColor,
    borderRadius: vars.roundedRadius50,
    padding: vars.spacing,
  },
  'ul, ol': {
    margin: `0 ${vars.spacing200} ${vars.spacing} 0`,
  },
  li: {
    margin: `0 0 ${vars.spacing25}`,
  },
  'labeled-input, labeled-value': {
    display: 'block',
  },
  'label, .row': {
    display: 'flex',
    gap: vars.spacing50,
  },
  label: {
    flexDirection: 'column',
    marginTop: vars.spacing,
  },
  '.row': {
    flexDirection: 'row',
    alignItems: 'center',
  },
  select: {
    appearance: 'none',
  },
  'label label': {
    marginTop: 0,
  },
  'label, input, button, textarea, select, .field': {
    fontFamily: vars.font,
    fontSize: vars.fontSize,
    lineHeight: vars.lineHeight,
    color: vars.textColor,
    border: 0,
  },
  'input, button, textarea, select, .field': {
    padding: `${vars.spacing75} ${vars.spacing}`,
  },
  button: {
    borderRadius: vars.roundedRadius,
    background: vars.buttonBg,
  },
  table: {
    borderCollapse: 'collapse',
    borderBottom: `1px solid ${brandColor.opacity(0.2)}`,
  },
  a: {
    color: vars.textHeadingColor,
    textDecoration: 'none',
    borderRadius: vars.roundedRadius50,
    padding: `${vars.spacing25} ${vars.spacing50}`,
    margin: `${vars.spacing_25} ${vars.spacing_50}`,
  },
  'nav a': {
    padding: `${vars.spacing25} ${vars.spacing}`,
    margin: 0,
  },
  '.current-route': {
    background: vars.currentBg,
    zIndex: 1,
    pointerEvents: 'none',
  },
  th: {
    background: brandColor.opacity(0.2),
  },
  'td, th': {
    padding: `${vars.spacing25} ${vars.spacing75}`,
  },
  'tr:nth-child(2n+2)': {
    background: brandColor.opacity(0.05),
  },
  'input, textarea, select, .field': {
    background: vars.inputBg,
  },
  'input, textarea, select, button, .field': {
    boxShadow: vars.inputBorderShadow,
  },
  'input, textarea, .field': {
    borderRadius: vars.roundedRadius50,
  },
  'select, button': {
    borderRadius: vars.roundedRadius,
  },
  'select[multiple]': {
    padding: `${vars.spacing50} 0`,
  },
  'select[multiple] option': {
    padding: `${vars.spacing50} ${vars.spacing}`,
  },
  'input[type="range"], input[type="checkbox"], input[type="radio"]': {
    boxShadow: 'none',
  },
  'input:disabled, .field.readonly': {
    opacity: 0.75,
  },
  'button:not(:disabled):hover, a:not(:disabled):hover': {
    background: vars.hoverBg,
  },
  'button:not(:disabled):active, a:not(:disabled):active': {
    background: vars.activeBg,
  },
  'a:not(:disabled):visited': {
    opacity: 0.8,
  },
  '[hidden]': {
    display: 'none !important',
  },
  'code, pre': {
    fontFamily: vars.codeFont,
  },
  '.icon-button': {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: vars.fontSize200,
    background: 'transparent',
    lineHeight: vars.touchSize,
    borderRadius: 1000,
    padding: 0,
    minWidth: vars.touchSize,
    minHeight: vars.touchSize,
    boxShadow: 'none',
  },
  'dialog::backdrop': {
    backgroundColor: '#0004',
    backdropFilter: 'blur(2px)',
  },
  form: {
    minWidth: '300px',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: vars.spacing,
  },
  'form *': {
    margin: 0,
  },
  '.primary': {
    backgroundColor: vars.primaryColor,
  },
  '.page-padded': {
    padding: `${vars.spacing} ${vars.spacing200}`,
  },
  'option:checked': {
    background: vars.brandColor,
    color: vars.brandTextColor,
  },
  'tool-bar button': {
    background: 'transparent',
    padding: `${vars.spacing25} ${vars.spacing50}`,
    boxShadow: 'none',
    color: vars.brandColor,
  },
  '::placeholder': {
    opacity: vars.placeholderOpacity,
  },
  ':focus-visible': {
    outline: 'none',
    boxShadow: `inset 0 0 0 2px ${brandColor.opacity(0.5)}`,
  },
  '.show-after-empty:not(.-xin-empty-list+*)': {
    display: 'none',
  },
  '::selection': {
    background: vars.brandColor,
    color: vars.brandTextColor,
  },
  '*::-webkit-scrollbar': {
    background: '#fff6',
    width: vars.spacing50,
    height: vars.spacing50,
  },
  '*::-webkit-scrollbar-thumb': {
    background: brandColor.opacity(0.5),
    borderRadius: vars.spacing25,
  },
  '*::-webkit-scrollbar-thumb:hover': {
    background: vars.brandColor,
    borderRadius: vars.spacing25,
  },
  'color-swatch::part(idSpan)': {
    fontSize: vars.fontSize80,
    opacity: 0.5,
  },
  // icons
  'svg[class*="icon-"]': {
    width: 24,
    height: 24,
    fill: vars.textColor,
    pointerEvents: 'none',
  },
})

// adapted from https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
const setTrueHeight = () => {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`)
}
setTrueHeight()
window.addEventListener('resize', setTrueHeight)
