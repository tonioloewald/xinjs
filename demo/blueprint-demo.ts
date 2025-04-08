import { elements, blueprintLoader, blueprint } from 'xinjs'

const { div, swissClock, xinTest } = elements

export const blueprintDemo = () =>
  div(
    { class: 'blueprint-demo', style: { padding: '1em' } },
    blueprintLoader(
      {
        onload() {
          document.querySelector('.blueprint-demo')?.append(
            xinTest({
              description: 'swiss-clock registered',
              test() {
                return (
                  document.querySelector('swiss-clock')?.constructor !==
                  HTMLElement
                )
              },
            })
          )
        },
      },
      blueprint({
        tag: 'swiss-clock',
        src: 'https://tonioloewald.github.io/xin-clock/dist/blueprint.js?1234',
        onload() {
          document.querySelector('.blueprint-demo')?.append(swissClock())
        },
      }),
      blueprint({
        tag: 'xin-test',
        src: 'https://tonioloewald.github.io/xin-test/dist/blueprint.js',
      })
    )
  )
