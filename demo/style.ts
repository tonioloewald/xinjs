/*
FIXME component-tize the doc system in xinjs-ui
copied from xinjs-ui demo/src/style.ts
*/

import { XinStyleSheet, vars, Color, invertLuminance } from 'tosijs'
import { icons, svg2DataUrl } from 'tosijs-ui'

const brandColor = Color.fromCss('#EE257B')

const colors = {
  _textColor: '#222',
  _brandColor: brandColor,
  _background: '#fafafa',
  _inputBg: '#fdfdfd',
  _backgroundShaded: '#f5f5f5',
  _navBg: brandColor.rotate(30).desaturate(0.5).brighten(0.9),
  _barColor: brandColor.opacity(0.4),
  _focusColor: brandColor.opacity(0.7),
  _brandTextColor: brandColor.rotate(30).brighten(0.9),
  _insetBg: brandColor.rotate(45).brighten(0.8),
  _codeBg: brandColor.rotate(-15).desaturate(0.5).brighten(0.9),
  _linkColor: brandColor.rotate(-30).darken(0.5),
  _shadowColor: '#0004',
  _menuBg: '#fafafa',
  _menuItemActiveColor: '#000',
  _menuItemIconActiveColor: '#000',
  _menuItemActiveBg: '#aaa',
  _menuItemHoverBg: '#eee',
  _menuItemColor: '#222',
  _menuSeparatorColor: '#2224',
  _scrollThumbColor: '#0006',
  _scrollBarColor: '#0001',
}

export const styleSpec: XinStyleSheet = {
  '@import':
    'https://fonts.googleapis.com/css2?family=Aleo:ital,wght@0,100..900;1,100..900&famiSpline+Sans+Mono:ital,wght@0,300..700;1,300..700&display=swap',
  ':root': {
    _fontFamily: "'Aleo', sans-serif",
    _codeFontFamily: "'Spline Sans Mono', monospace",
    _fontSize: '16px',
    _codeFontSize: '14px',
    ...colors,
    _spacing: '10px',
    _lineHeight: vars.fontSize160,
    _h1Scale: '2',
    _h2Scale: '1.5',
    _h3Scale: '1.25',
    _touchSize: '32px',
    _headerHeight: `calc(${vars.lineHeight} * ${vars.h2Scale} + ${vars.spacing200})`,
  },
  '@media (prefers-color-scheme: dark)': {
    body: {
      _darkmode: 'true',
    },
  },
  '.darkmode': {
    ...invertLuminance(colors),
    _menuShadow: '0 0 0 2px #a0f3d680',
    _menuSeparatorColor: '#a0f3d640',
  },
  '.high-contrast': {
    filter: 'contrast(2)',
  },
  '.monochrome': {
    filter: 'grayscale(1)',
  },
  '.high-contrast.monochrome': {
    filter: 'contrast(2) grayscale(1)',
  },
  '*': {
    boxSizing: 'border-box',
    scrollbarColor: `${vars.scrollThumbColor} ${vars.scrollBarColor}`,
    scrollbarWidth: 'thin',
  },
  body: {
    fontFamily: vars.fontFamily,
    fontSize: vars.fontSize,
    margin: '0',
    lineHeight: vars.lineHeight,
    background: vars.background,
    _linkColor: vars.brandColor,
    _xinTabsSelectedColor: vars.brandColor,
    _xinTabsBarColor: vars.brandTextColor,
    _menuItemIconColor: vars.brandColor,
    color: vars.textColor,
  },
  'input, button, select, textarea': {
    fontFamily: vars.fontFamily,
    fontSize: vars.fontSize,
    color: 'currentColor',
    background: vars.inputBg,
  },
  select: {
    WebkitAppearance: 'none',
    appearance: 'none',
  },
  header: {
    background: vars.brandColor,
    color: vars.brandTextColor,
    _textColor: vars.brandTextColor,
    _linkColor: vars.transTextColor,
    display: 'flex',
    alignItems: 'center',
    padding: '0 var(--spacing)',
    lineHeight: 'calc(var(--line-height) * var(--h1-scale))',
    height: vars.headerHeight,
    whiteSpace: 'nowrap',
  },
  h1: {
    color: vars.brandColor,
    fontSize: 'calc(var(--font-size) * var(--h1-scale))',
    lineHeight: 'calc(var(--line-height) * var(--h1-scale))',
    fontWeight: '400',
    borderBottom: `4px solid ${vars.barColor}`,
    margin: `${vars.spacing} 0 ${vars.spacing200}`,
    padding: 0,
  },
  'header h2': {
    color: vars.brandTextColor,
    whiteSpace: 'nowrap',
  },
  h2: {
    color: vars.brandColor,
    fontSize: 'calc(var(--font-size) * var(--h2-scale))',
    lineHeight: 'calc(var(--line-height) * var(--h2-scale))',
    margin: 'calc(var(--spacing) * var(--h2-scale)) 0',
  },
  h3: {
    fontSize: 'calc(var(--font-size) * var(--h3-scale))',
    lineHeight: 'calc(var(--line-height) * var(--h3-scale))',
    margin: 'calc(var(--spacing) * var(--h3-scale)) 0',
  },
  main: {
    alignItems: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '100vw',
    height: '100vh',
    overflow: 'hidden',
  },
  'main > xin-sidenav': {
    height: 'calc(100vh - var(--header-height))',
  },
  'main > xin-sidenav::part(nav)': {
    background: vars.navBg,
  },
  'input[type=search]': {
    borderRadius: 99,
  },
  blockquote: {
    background: vars.insetBg,
    margin: '0',
    padding: 'var(--spacing) calc(var(--spacing) * 2)',
  },
  'blockquote > :first-child': {
    marginTop: '0',
  },
  'blockquote > :last-child': {
    position: 'relative',
    width: '100%',
    paddingBottom: 48,
    marginBottom: '0',
  },
  'blockquote > :last-child::after': {
    content: '" "',
    width: 48,
    height: 48,
    display: 'block',
    bottom: 0,
    right: 0,
    position: 'absolute',
    background: svg2DataUrl(icons.tosi()),
  },
  '.bar': {
    display: 'flex',
    gap: vars.spacing,
    justifyContent: 'center',
    alignItems: 'center',
    padding: vars.spacing,
    flexWrap: 'wrap',
    _textColor: vars.brandColor,
    background: vars.barColor,
  },
  a: {
    textDecoration: 'none',
    color: vars.linkColor,
    opacity: '0.9',
    borderBottom: '1px solid var(--brand-color)',
  },
  'button, select, .clickable': {
    transition: 'ease-out 0.2s',
    background: vars.brandTextColor,
    _textColor: vars.brandColor,
    display: 'inline-block',
    textDecoration: 'none',
    padding: '0 calc(var(--spacing) * 1.25)',
    border: 'none',
    borderRadius: 'calc(var(--spacing) * 0.5)',
  },
  'button, select, clickable, input': {
    lineHeight: 'calc(var(--line-height) + var(--spacing))',
  },
  'select:has(+ .icon-chevron-down)': {
    paddingRight: 'calc(var(--spacing) * 2.7)',
  },
  'select + .icon-chevron-down': {
    marginLeft: 'calc(var(--spacing) * -2.7)',
    width: 'calc(var(--spacing) * 2.7)',
    alignSelf: 'center',
    pointerEvents: 'none',
    objectPosition: 'left center',
    _textColor: vars.brandColor,
  },
  'label > select + .icon-chevron-down': {
    marginLeft: 'calc(var(--spacing) * -3.5)',
  },
  'input, textarea': {
    border: 'none',
    outline: 'none',
    borderRadius: 'calc(var(--spacing) * 0.5)',
  },
  input: {
    padding: '0 calc(var(--spacing) * 1.5)',
  },
  textarea: {
    padding: 'var(--spacing) calc(var(--spacing) * 1.25)',
    lineHeight: vars.lineHeight,
    minHeight: 'calc(var(--spacing) + var(--line-height) * 4)',
  },
  "input[type='number']": {
    paddingRight: 0,
    width: '6em',
    textAlign: 'right',
  },
  'input[type=number]::-webkit-inner-spin-button': {
    margin: '1px 3px 1px 0.5em',
    opacity: 1,
    inset: 1,
  },
  "input[type='checkbox'], input[type='radio']": {
    maxWidth: vars.lineHeight,
  },
  '::placeholder': {
    color: vars.focusColor,
  },
  img: {
    verticalAlign: 'middle',
  },
  'button:hover, button:hover, .clickable:hover': {
    boxShadow: 'inset 0 0 0 2px var(--brand-color)',
  },
  'button:active, button:active, .clickable:active': {
    background: vars.brandColor,
    color: vars.brandTextColor,
  },
  label: {
    display: 'inline-flex',
    gap: 'calc(var(--spacing) * 0.5)',
    alignItems: 'center',
  },
  '.elastic': {
    flex: '1 1 auto',
    overflow: 'hidden',
    position: 'relative',
  },
  'svg text': {
    pointerEvents: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    fill: '#000',
    stroke: '#fff8',
    strokeWidth: '0.5',
    opacity: '0',
  },
  'svg text.hover': {
    opacity: '1',
  },
  '.thead': {
    background: vars.brandColor,
    color: vars.brandTextColor,
  },
  '.th + .th': {
    border: '1px solid #fff4',
    borderWidth: '0 1px',
  },
  '.th, .td': {
    padding: '0 var(--spacing)',
  },
  '.tr:not([aria-selected]):hover': {
    background: '#08835810',
  },
  '[aria-selected]': {
    background: '#08835820',
  },
  ':disabled': {
    opacity: '0.5',
    filter: 'saturate(0)',
    pointerEvents: 'none',
  },
  pre: {
    background: vars.codeBg,
    padding: vars.spacing,
    borderRadius: 'calc(var(--spacing) * 0.25)',
    overflow: 'auto',
    fontSize: vars.codeFontSize,
    lineHeight: 'calc(var(--font-size) * 1.2)',
  },
  'pre, code': {
    fontFamily: vars.codeFontFamily,
    _textColor: vars.brandColor,
    fontSize: '90%',
  },
  '.-xin-sidenav-visible .close-content': {
    display: 'none',
  },
  '.transparent, .iconic': {
    background: 'none',
  },
  '.iconic': {
    padding: '0',
    fontSize: '150%',
    lineHeight: 'calc(var(--line-height) + var(--spacing))',
    width: 'calc(var(--line-height) + var(--spacing))',
    textAlign: 'center',
  },
  '.transparent:hover, .iconic:hover': {
    background: '#0002',
    boxShadow: 'none',
    color: vars.textColor,
  },
  '.transparent:active, .iconic:active': {
    background: '#0004',
    boxShadow: 'none',
    color: vars.textColor,
  },
  'xin-sidenav:not([compact]) .show-within-compact': {
    display: 'none',
  },
  '.on.on': {
    background: vars.brandColor,
    _textColor: vars.brandTextColor,
  },
  '.current': {
    background: vars.background,
  },
  '.doc-link': {
    cursor: 'pointer',
    borderBottom: 'none',
    transition: '0.15s ease-out',
    marginLeft: '20px',
    padding: 'calc(var(--spacing) * 0.5) calc(var(--spacing) * 1.5)',
  },
  '.doc-link:not(.current):hover': {
    background: vars.background,
  },
  '.doc-link:not(.current)': {
    opacity: '0.8',
    marginLeft: 0,
  },
  'xin-example': {
    margin: 'var(--spacing) 0',
  },
  'xin-example .preview.preview': {
    padding: 10,
  },
  'xin-example [part=editors]': {
    background: vars.insetBg,
  },
  "[class*='icon-'], xin-icon": {
    color: 'currentcolor',
    height: vars.fontSize,
    pointerEvents: 'none',
  },
  "[class*='icon-']": {
    verticalAlign: 'middle',
  },
  '.icon-plus': {
    content: "'+'",
  },
  table: {
    borderCollapse: 'collapse',
  },
  thead: {
    background: vars.brandColor,
    color: vars.brandTextColor,
  },
  tbody: {
    background: vars.background,
  },
  'tr:nth-child(2n)': {
    background: vars.backgroundShaded,
  },
  'th, td': {
    padding: 'calc(var(--spacing) * 0.5) var(--spacing)',
  },
  'header xin-locale-picker xin-select button': {
    color: 'currentcolor',
    background: 'transparent',
    gap: '2px',
  },
  svg: {
    fill: 'currentcolor',
  },
  'img.logo, xin-icon.logo': {
    animation: '2s ease-in-out 0s infinite alternate logo-swing',
  },
  '@keyframes logo-swing': {
    '0%': {
      transform: 'perspective(1000px) rotateY(15deg)',
    },
    '100%': {
      transform: 'perspective(1000px) rotateY(-15deg)',
    },
  },
}
