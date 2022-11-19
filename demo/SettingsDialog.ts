import {elements} from '../src'
import {labeledInput} from './components'

const {form, dialog, h2, span, button, label } = elements

export const settingsDialog = () => dialog(
    {
      class: 'settings',
      style: {
        border: 0,
        borderRadius: 'calc(var(--rounded-radius) * 2)',
        boxShadow: '0 10px 20px #0008',
        padding: 'calc(var(--spacing) * 2)',
        zIndex: 1 // Safari rendering bug
      }
    },
    h2(
      'Settings',
      {
        style: {
          textAlign: 'center',
          padding: 'var(--spacing)',
          margin: 'calc(var(--spacing) * -2)',
          borderBottom: 'var(--dark-border)',
          marginBottom: 'calc(var(--spacing) * 2)'
        }
      }
    ),
    form(
      button(
        { 
          style: {
            position: 'absolute',
            top: 'calc(var(--spacing) * 0.5)',
            right: 'calc(var(--spacing) * 0.5)',
            width: '32px',
            height: '32px',
            lineHeight: '32px',
            border: 0,
            textAlign: 'center',
            fontSize: '18px',
            padding: 0
          }
        },
        '⨉'
      ),
      labeledInput('App Title', {
        placeholder: 'enter title',
        bindValue: 'app.title'
      }),
      span(
        {
          style: {
            marginTop: 'calc(var(--spacing) * 0.5)',
            display: 'flex',
            justifyContent: 'flex-end'
          }
        },
        span('Local Storage'),
        span(' ', { style: {flex: '1 1 auto'}}),
        button('Clear and Reload', {
          onClick() {
            localStorage.clear()
            window.location.reload()
          }
        })
      ),
      span(
        {
          style: {
            marginTop: 'calc(var(--spacing) * 2)',
            display: 'flex',
            justifyContent: 'flex-end'
          }
        },
        span(' ', { style: {flex: '1 1 auto'}}),
        button('OK')
      ),
      {
        onSubmit(evt: Event){
          evt.target.closest('dialog').close()
          evt.preventDefault()
        }
      }
    )
  )