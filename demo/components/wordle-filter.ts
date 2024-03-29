import {
  Component as WebComponent,
  ElementCreator,
  elements,
  xinProxy,
  vars,
} from 'xinjs'
import words from '../words'

const { wordle } = xinProxy(
  {
    wordle: {
      info: '',
      words: words.filter((w) => w.length === 5),
      found: [] as string[],
      updateFilter(event: Event) {
        const source = (event.target as HTMLTextAreaElement).value

        const clues = source.match(/(\w[-?!]){5}/g)

        if (!clues) {
          wordle.found = []
          return
        }
        let found = wordle.words

        for (const clue of clues) {
          for (let i = 0; i < 5; i++) {
            const char = clue[i * 2]
            const condition = clue[i * 2 + 1]
            switch (condition) {
              case '-':
                found = found.filter((w) => !w.includes(char))
                break
              case '?':
                found = found.filter((w) => w[i] !== char && w.includes(char))
                break
              case '!':
                found = found.filter((w) => w[i] === char)
                break
            }
          }
        }

        wordle.found = found
      },
    },
  },
  true
)

console.log(`wordle filter has ${wordle.words.length} words`)

const { h4, div, label, textarea, template, span } = elements

class WordleFilter extends WebComponent {
  content = () => [
    label(
      h4('Clues'),
      div('- wrong, ? in wrong place, ! correct'),
      textarea({
        placeholder: 'c-r-a?n-e! m-o-l-d?-y-',
        onInput: wordle.updateFilter,
      })
    ),
    h4(
      'Matching Words — ',
      span({ bindText: wordle.found.length as unknown as string })
    ),
    div(
      {
        class: 'found-words',
        bindList: {
          value: wordle.found,
        },
      },
      template(span({ class: 'found-word', bindText: '^' }))
    ),
  ]
}

export const wordleFilter = WordleFilter.elementCreator({
  tag: 'wordle-filter',
  styleSpec: {
    ':host': {
      display: 'flex',
      flexDirection: 'column',
      gap: vars.spacing,
      padding: vars.spacing,
    },
    ':host .found-words': {
      display: 'flex',
      flexWrap: 'wrap',
      gap: vars.spacing50,
    },
    ':host .found-word': {
      display: 'inline-block',
      background: vars.brandColor,
      color: vars.brandTextColor,
      padding: '5px 10px',
      borderRadius: 4,
    },
  },
}) as ElementCreator<WordleFilter>
