import {
  Component as WebComponent,
  elements,
  xinProxy,
  vars,
  touch,
} from '../../src'

import { icons, postNotification, xinSelect, XinSelect } from 'xinjs-ui'
import words from '../words'

const ALPHABET = [...'qwertyuiopasdfghjklzxcvbnm']

type ClueInfo = 'correct' | 'used' | 'wrong' | 'none'

interface CluePart {
  char: string
  info: ClueInfo
}
type Clue = CluePart[]

const { wordGame } = xinProxy(
  {
    wordGame: {
      length: 6,
      word: '',
      allowed: [] as string[],
      words: [] as string[],
      possibles: [] as string[],
      alphabet: [] as Clue,
      clues: [] as Clue[],
      currentGuess: '',
      gameOver: false,
      init(length?: number) {
        if (!length) {
          length = wordGame.length
        } else if (Number(wordGame.length) !== length) {
          wordGame.length = length
          wordGame.words = []
        }
        wordGame.gameOver = false
        wordGame.clues = []
        wordGame.possibles = []
        if (wordGame.words.length == 0) {
          wordGame.allowed = words.filter((w) => w.length == length)
          const shorter = words.filter((w) => w.length === length! - 1)

          wordGame.words = wordGame.allowed.filter(
            (w) =>
              w.slice(-1) !== 's' || !shorter.includes(w.slice(0, length! - 1))
          )
        }
        wordGame.word =
          wordGame.words[Math.floor(Math.random() * wordGame.words.length)]
        wordGame.currentGuess = ''
        wordGame.alphabet = ALPHABET.map((char) => ({
          char,
          info: 'none' as ClueInfo,
        }))
      },
      noInfoChars(): string[] {
        return wordGame.alphabet
          .filter((clue) => clue.info === 'none')
          .map((clue) => clue.char)
      },
      negativeClue() {
        const noInfoChars = wordGame
          .noInfoChars()
          .filter((c) => !wordGame.word.includes(c))
        if (noInfoChars.length === 0) {
          postNotification({
            message: 'All unused characters have been eliminated',
            duration: 2,
          })
          return
        }
        const test = new RegExp(`[${wordGame.word}]`)
        const words = wordGame.words.filter((w) => {
          return !wordGame.possibles.includes(w) && !w.match(test)
        })
        wordGame.currentGuess = words[Math.floor(Math.random() * words.length)]
        wordGame.guess()
      },
      positiveClue() {
        const noInfoChars = wordGame
          .noInfoChars()
          .filter((c) => wordGame.word.includes(c))
        if (noInfoChars.length === 0) {
          postNotification({
            message: 'All characters have been revealed',
            duration: 2,
          })
          return
        }
        const words = wordGame.words.filter((w) => {
          return (
            !wordGame.possibles.includes(w) &&
            noInfoChars.filter((c) => w.includes(c)).length === 1
          )
        })
        wordGame.currentGuess = words[Math.floor(Math.random() * words.length)]
        wordGame.guess()
      },
      guess() {
        const currentGuess = wordGame.currentGuess.toLocaleLowerCase()
        wordGame.currentGuess = ''
        const word = [...wordGame.word]
        wordGame.gameOver = true
        const clue = [...currentGuess].map((char, idx) => {
          const info =
            word[idx] === char
              ? 'correct'
              : word.includes(char)
              ? 'used'
              : ('wrong' as ClueInfo)
          if (info !== 'correct') {
            wordGame.gameOver = false
          }
          const letter = wordGame.alphabet.find(
            (letter) => letter.char == char
          ) as CluePart
          console.log(letter)
          if (info === 'correct' && letter.info != 'correct') {
            letter.info = 'correct'
          } else if (info === 'used' && letter.info == 'none') {
            letter.info = 'used'
          } else if (info === 'wrong' && letter.info == 'none') {
            letter.info = 'wrong'
          }
          return {
            char,
            info,
          }
        })
        touch(wordGame.alphabet)

        wordGame.possibles = (
          wordGame.possibles.length > 0 ? wordGame.possibles : wordGame.words
        ).filter(
          (word) =>
            !clue.find((part, index) => {
              switch (part.info) {
                case 'correct':
                  return word[index] !== part.char
                case 'used':
                  return !word.includes(part.char) || word[index] === part.char
                case 'wrong':
                  return word.includes(part.char)
              }
            })
        )
        wordGame.clues.push(clue)
      },
    },
  },
  true
)

wordGame.init()

const { h1, p, div, span, button, input } = elements

export class GuessWord extends WebComponent {
  renderClue = (clueInfo: CluePart) =>
    span(
      {
        class: clueInfo.info,
      },
      clueInfo.char
    )
  renderClues = (element: HTMLElement, clues: Clue[]) => {
    element.textContent = ''
    element.append(...clues.map((clue) => div(...clue.map(this.renderClue))))
  }

  renderKey = (clueInfo: CluePart) => {
    const key = this.renderClue(clueInfo)
    if (['p', 'l'].includes(clueInfo.char)) {
      return elements.fragment(key, elements.br())
    }
    return key
  }

  renderAlphabet = (element: HTMLElement, alphabet: Clue) => {
    element.textContent = ''
    element.append(...alphabet.map(this.renderKey))
  }

  addLetter = (event: Event) => {
    const keySpan = event.srcElement as HTMLElement
    if (keySpan?.tagName === 'SPAN') {
      wordGame.currentGuess += keySpan.textContent
    }
  }

  backspace = () => {
    wordGame.currentGuess = wordGame.currentGuess.slice(0, -1)
  }

  setLength = (event: Event) => {
    const select = event.target as XinSelect
    wordGame.init(Number(select.value))
  }

  content = () => [
    h1('Guess Word'),
    button(
      {
        onClick() {
          wordGame.init()
        },
      },
      'New Game'
    ),
    p(
      'Find the ',
      xinSelect({
        style: {
          _fieldWidth: '60px',
        },
        value: wordGame.length.valueOf() + '-letter',
        options: [4, 5, 6, 7, 8].map((n) => ({
          caption: `${n}-letter`,
          value: String(n),
        })),
        onChange: this.setLength,
      }),
      'word, given the clues'
    ),
    div({
      part: 'clues',
      bind: {
        binding: this.renderClues,
        value: wordGame.clues as any,
      },
    }),
    div({
      bind: {
        binding(element, value) {
          element.style.display =
            wordGame.gameOver == true || value.length === 0 ? 'none' : ''
          element.textContent =
            value.length === 1
              ? 'one possibility remains'
              : `${value.length} possibilities remain`
        },
        value: wordGame.possibles as any,
      },
    }),
    div(
      {
        part: 'guess',
        bind: {
          binding(element, value) {
            element.style.display = value ? 'none' : ''
          },
          value: wordGame.gameOver as any,
        },
      },
      input({
        bindValue: wordGame.currentGuess,
        type: 'search',
      }),
      div({
        part: 'alphabet',
        bind: { binding: this.renderAlphabet, value: wordGame.alphabet as any },
        onClick: this.addLetter,
      }),
      div(
        {
          style: {
            display: 'flex',
          },
        },
        // guess a word containing a letter the player doesn't have
        button('Give me a letter!', {
          onClick: wordGame.positiveClue,
        }),
        // guess a word containing only letters that contain no letters
        // in common with the word and including at least one letter
        // the player has no information on that is not in the word
        button('Hide letters!', {
          onClick: wordGame.negativeClue,
        }),
        span({ style: { flex: 1 } }),
        button(
          {
            style: {
              padding: 0,
              height: vars.touchSize,
              lineHeight: vars.touchSize,
              width: vars.touchSize,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            onClick: this.backspace,
          },
          icons.chevronLeft()
        ),
        button(
          {
            bind: {
              binding(button: HTMLElement, guess: string) {
                guess = guess.toLocaleLowerCase()
                ;(button as HTMLButtonElement).disabled =
                  guess?.length - wordGame.length !== 0 ||
                  !wordGame.allowed.includes(guess)
              },
              value: wordGame.currentGuess,
            },
            onClick: wordGame.guess,
          },
          'Guess'
        )
      )
    ),
  ]
}

export const guessWord = GuessWord.elementCreator({
  tag: 'guess-word',
  styleSpec: {
    ':host': {
      display: 'flex',
      flexDirection: 'column',
      gap: vars.spacing,
      position: 'relative',
      alignItems: 'center',
      padding: vars.spacing,
      _buttonSize: '48px',
      _baseFontSize: '16px',
    },
    ':host button:disabled': {
      opacity: 0.6,
    },
    ':host h1': {
      textAlign: 'center',
    },
    ':host [part="clues"]': {
      display: 'flex',
      gap: 4,
      flexDirection: 'column',
      '-webkit-user-select': 'none',
      userSelect: 'none',
    },
    ':host [part="alphabet"]': {
      display: 'block',
      textAlign: 'center',
      '-webkit-user-select': 'none',
      userSelect: 'none',
    },
    ':host [part="clues"] div': {
      display: 'flex',
      gap: 4,
    },
    '@media (max-width: 540px)': {
      ':host': {
        _buttonSize: '32px',
        _baseFontSize: '12px',
      },
    },
    ':host [part="clues"] span, :host [part="alphabet"] span': {
      display: 'inline-block',
      width: vars.buttonSize,
      height: vars.buttonSize,
      padding: 0,
      lineHeight: vars.buttonSize,
      fontSize: vars.baseFontSize150,
      textTransform: 'uppercase',
      textAlign: 'center',
      boxShadow: `inset 0 0 0 2px ${vars.textColor}`,
      borderRadius: 4,
    },
    ':host [part="alphabet"] span': {
      margin: 2,
      cursor: 'default',
    },
    ':host .wrong': {
      background: '#0004',
    },
    ':host .correct': {
      background: 'green',
      color: 'white',
    },
    ':host .used': {
      background: 'yellow',
    },
    ':host [part="guess"]': {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    },
    ':host [part="alphabet"] span:hover': {
      boxShadow: `0 0 0 2px ${vars.textColor}, inset 0 0 0 2px ${vars.textColor}`,
    },
  },
})
