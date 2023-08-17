import { elements, vars } from '../src'

const { form, dialog, h2, span, button, label, input, select, option } =
  elements

export const settingsDialog = () =>
  dialog(
    {
      class: 'settings',
      style: {
        background: vars.background,
        color: vars.textColor,
        border: 0,
        borderRadius: vars.roundedRadius200,
        boxShadow: '0 10px 20px #0008',
        padding: vars.spacing200,
        zIndex: 1, // Safari rendering bug
      },
    },
    h2('Settings', {
      style: {
        textAlign: 'center',
        padding: vars.spacing,
        margin: vars.spacing_200,
        borderBottom: vars.brandColor_50b,
        marginBottom: vars.spacing200,
        background: vars.brandColor_15b,
        color: vars.brandTextColor,
      },
    }),
    form(
      button(
        {
          style: {
            position: 'absolute',
            top: vars.spacing50,
            right: vars.spacing50,
            width: '32px',
            height: '32px',
            lineHeight: '32px',
            border: 0,
            textAlign: 'center',
            fontSize: '18px',
            padding: 0,
          },
        },
        '⨉'
      ),
      label(span('App Title'), input({ bindValue: 'app.title' })),
      label(
        span('Theme'),
        select(
          { bindValue: 'app.darkmode' },
          option('Light', { value: 'light' }),
          option('Dark', { value: 'dark' }),
          option('Auto', { value: 'auto' })
        )
      ),
      label(
        span('Local Storage'),
        button('Clear and Reload', {
          onClick() {
            localStorage.clear()
            window.location.reload()
          },
        })
      ),
      span(
        {
          style: {
            marginTop: vars.spacing,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          },
        },
        span(' ', { style: { flex: '1 1 auto' } }),
        button('OK', { class: 'primary' })
      ),
      {
        onSubmit(evt: Event) {
          evt.preventDefault()
          // @ts-expect-error Typescript is wrong
          evt.target.closest('dialog').close()
        },
      }
    )
  )
