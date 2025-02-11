import {
  Component as WebComponent,
  ElementCreator,
  elements,
  vars,
  boxedProxy,
  XinTouchableType,
} from '../src'
import { bodymovinPlayer, BodymovinPlayer, makeSorter, icons } from 'xinjs-ui'
import wordList from './words'

const { h1, div, template, button } = elements

interface Word {
  word: string
  found: boolean
}

function shuffle<T>(deck: Array<T>, random = Math.random): Array<T> {
  const shuffled = [] as Array<T>
  for (const c in deck) {
    shuffled.splice(Math.floor(random() * (1 + shuffled.length)), 0, deck[c])
  }
  return shuffled
}

function gridPos(index: number): { row: number; col: number } {
  return {
    row: Math.floor(index / 4),
    col: index % 4,
  }
}

function padLeft(s: any, minLength: number, padding = ' ') {
  s = String(s)
  return s.length >= minLength ? s : padding.repeat(minLength - s.length) + s
}

function formatSeconds(s: number): string {
  return Math.floor(s / 60) + ':' + padLeft(s % 60, 2, '0')
}

const wordSorter = makeSorter((w: Word): [string] => [w.word])

const DICE = [
  ['R', 'I', 'F', 'O', 'B', 'X'],
  ['I', 'F', 'E', 'H', 'E', 'Y'],
  ['D', 'E', 'N', 'O', 'W', 'S'],
  ['U', 'T', 'O', 'K', 'N', 'D'],
  ['H', 'M', 'S', 'R', 'A', 'O'],
  ['L', 'U', 'P', 'E', 'T', 'S'],
  ['A', 'C', 'I', 'T', 'O', 'A'],
  ['Y', 'L', 'G', 'K', 'U', 'E'],
  ['Qu', 'B', 'M', 'J', 'O', 'A'],
  ['E', 'H', 'I', 'S', 'P', 'N'],
  ['V', 'E', 'T', 'I', 'G', 'N'],
  ['B', 'A', 'L', 'I', 'Y', 'T'],
  ['E', 'Z', 'A', 'V', 'N', 'D'],
  ['R', 'A', 'L', 'E', 'S', 'C'],
  ['U', 'W', 'I', 'L', 'R', 'G'],
  ['P', 'A', 'C', 'E', 'M', 'D'],
]
class GriddleGame extends WebComponent {
  game = {
    dice: ' '.repeat(16).split(''),
    wordInProgress: [] as string[],
    words: [] as Array<Word>,
    timeRemaining: 0,
    displayTime: ' ',
    boardRotation: 0,
  }

  private interval?: number

  update = () => {
    this.game.timeRemaining -= 1
    this.game.displayTime = formatSeconds(this.game.timeRemaining)
    console.log(this.game.displayTime)
    if (this.game.timeRemaining <= 0) {
      this.game.displayTime = 'Time’s Up!'
      this.parts.board.toggleAttribute('disabled', true)
      this.parts.addWord.toggleAttribute('disabled', true)
      this.parts.cancelWord.toggleAttribute('disabled', true)
      ;(this.parts.timer as BodymovinPlayer).animation.stop()
      clearInterval(this.interval)
    }
  }

  init = () => {
    if (this.interval) {
      clearInterval(this.interval)
    }
    const { timer } = this.parts as { timer: BodymovinPlayer }
    this.game.dice = shuffle(
      DICE.map((die) => die[Math.floor(Math.random() * 6)])
    )
    this.game.words = []
    this.game.wordInProgress = []
    if (timer.animation) {
      timer.animation.setSpeed(0.5)
      timer.animation.play()
    }
    this.parts.board.toggleAttribute('disabled', false)
    this.game.timeRemaining = 180
    this.interval = setInterval(this.update, 1000) as unknown as number
  }

  constructor() {
    super()

    this.game = boxedProxy({ griddle: this.game }).griddle
  }

  content = null

  addLetter = (event: Event) => {
    const chars = (event.target as HTMLElement).textContent as string
    this.game.wordInProgress.push(chars)
    const dice = [...this.parts.board.querySelectorAll('.die')]
    const index = dice.indexOf(event.target as HTMLElement) as number
    const { row, col } = gridPos(index)
    for (const die in dice) {
      const pos = gridPos(Number(die))
      dice[die].toggleAttribute(
        'disabled',
        index === Number(die) ||
          Math.abs(pos.row - row) > 1 ||
          Math.abs(pos.col - col) > 1
      )
    }
  }

  cancelWord = () => {
    this.game.wordInProgress = []
    for (const die of [...this.parts.board.querySelectorAll('.die')]) {
      die.removeAttribute('disabled')
    }
  }

  addWord = () => {
    const word = this.parts.word.textContent
    if (word) {
      if (this.game.words.find((w) => w.word === word)) {
        console.log(`You already found ${word}`)
      } else {
        const found = wordList.includes(word.toLocaleLowerCase())
        this.game.words.push({ word, found })
        this.game.words.sort(wordSorter)
      }
    }
    this.cancelWord()
  }

  rotate = (event: Event) => {
    const button = event.target as HTMLButtonElement
    if (button.getAttribute('part') === 'rotateLeft') {
      this.game.boardRotation -= 90
    } else {
      this.game.boardRotation += 90
    }
    console.log(this.game.boardRotation)
  }

  connectedCallback() {
    super.connectedCallback()

    this.textContent = ''
    this.append(
      div(
        {
          style: {
            width: '100%',
            display: 'flex',
          },
        },
        bodymovinPlayer({
          part: 'timer',
          src: '/assets/hourglass.json',
          config: {
            autoplay: false,
            loop: true,
          },
        }),
        h1(
          { style: { flex: '1', padding: 0, margin: 0, textAlign: 'center' } },
          'griddle'
        ),
        button(icons.play(), {
          title: 'play',
          part: 'init',
          onClick: this.init,
        })
      ),
      div(
        {
          style: {
            position: 'relative',
          },
        },
        button(icons.undo(), {
          part: 'rotateLeft',
          onClick: this.rotate,
        }),
        div(
          {
            part: 'board',
            disabled: true,
            bindList: {
              value: this.game.dice,
            },
            bind: {
              value: this.game.boardRotation as unknown as XinTouchableType,
              binding: {
                toDOM(element, value) {
                  element.style.transform = `rotate(${value}deg)`
                },
              },
            },
          },
          template(
            div({
              class: `die`,
              bindText: '^',
              onClick: this.addLetter,
              bind: {
                value: '^',
                binding(element) {
                  element.style.transform = `rotateZ(${
                    Math.floor(Math.random() * 4) * 88 + Math.random() * 4
                  }deg`
                },
              },
            })
          )
        ),
        button(icons.redo(), {
          part: 'rotateRight',
          onClick: this.rotate,
        })
      ),
      div({
        part: 'clock',
        bindText: this.game.displayTime as unknown as XinTouchableType,
      }),
      div(
        {
          part: 'wordInProgress',
        },
        div(
          {
            part: 'word',
            bindList: {
              value: this.game.wordInProgress,
            },
          },
          template(
            div({
              class: `die`,
              bindText: '^',
              bind: {
                value: '^',
                binding(element) {
                  element.style.transform = `rotateZ(${
                    Math.random() * 4 - 2
                  }deg`
                },
              },
            })
          )
        ),
        div({ style: { flex: '1' } }),
        button(icons.x(), {
          part: 'cancelWord',
          onClick: this.cancelWord,
          bind: {
            value: this.game.wordInProgress as unknown as XinTouchableType,
            binding: {
              toDOM(element, value) {
                element.toggleAttribute('disabled', value.length === 0)
              },
            },
          },
        }),
        button(icons.check(), {
          part: 'addWord',
          onClick: this.addWord,
          bind: {
            value: this.game.wordInProgress as unknown as XinTouchableType,
            binding: {
              toDOM(element, value) {
                element.toggleAttribute('disabled', value.length === 0)
              },
            },
          },
        })
      ),
      div(
        {
          part: 'words',
          bindList: {
            idPath: 'word',
            value: this.game.words,
          },
        },
        template(
          div({
            class: 'word',
            bindText: '^.word',
            bind: {
              value: '^.found',
              binding: {
                toDOM(element, value) {
                  element.classList.toggle('not-found', !value)
                },
              },
            },
          })
        )
      )
    )
  }
}

export const griddleGame = GriddleGame.elementCreator({
  tag: 'griddle-game',
  styleSpec: {
    ':host': {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      alignItems: 'center',
      padding: vars.spacing,
      __errorColor: 'crimson',
    },
    ':host svg': {
      fill: vars.textColor,
      width: 24,
      height: 24,
      pointerEvents: 'none',
    },
    ':host h1': {
      textAlign: 'center',
    },
    ':host [part="board"]': {
      display: 'grid',
      gridTemplateColumns: '64px 64px 64px 64px',
      gap: '4px',
      transformOrigin: '50% 50%',
      transition: '0.25s ease-out',
    },
    ':host [part="board"] > :first-child': {
      position: 'absolute',
    },
    ':host [part*="rotate"]': {
      position: 'absolute',
      top: '50%',
      borderRadius: '99px',
    },
    ':host [part="rotateLeft"]': {
      left: vars.spacing_50,
      transform: 'translateX(-100%) translateY(-50%)',
    },
    ':host [part="rotateRight"]': {
      right: vars.spacing_50,
      transform: 'translateX(100%) translateY(-50%)',
    },
    ':host [part="wordInProgress"]': {
      width: '100%',
      display: 'flex',
      height: 48,
      padding: vars.spacing,
    },
    ':host [part="word"]': {
      display: 'flex',
      flexWrap: 'wrap',
    },
    ':host [part="timer"]': {
      height: 48,
      width: 48,
    },
    ':host [part="clock"]': {
      padding: vars.spacing,
      fontSize: 24,
    },
    ':host .die': {
      transformOrigin: '50% 50%',
      display: 'block',
      lineHeight: '64px',
      textAlign: 'center',
      fontSize: '32px',
      height: '64px',
      width: '64px',
      color: vars.brandTextColor,
      background: vars.brandColor,
      borderRadius: '8px',
      position: 'relative',
      transition: '0.2s ease-out',
    },
    ':host .die:active': {
      boxShadow: `0 0 2px 2px ${vars.brandColor}`,
    },
    ':host [part="wordInProgress"] .die': {
      lineHeight: '48px',
      fontSize: '24px',
      height: '48px',
      width: '48px',
    },
    ':host [part="wordInProgress"] button': {
      marginLeft: '4px',
      flex: '0 0 48px',
    },
    ':host .die::after': {
      display: 'block',
      content: '" "',
      position: 'absolute',
      inset: '2px',
      borderRadius: 32,
      background: '#fff2',
    },
    ':host [disabled]': {
      opacity: 0.6,
      pointerEvents: 'none',
    },
    ':host button': {
      display: 'flex',
      width: 48,
      height: 48,
      lineHeight: 48,
      padding: 0,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'none',
      background: vars.brandColor,
      _textColor: vars.brandTextColor,
    },
    ':host button:not(:disabled):hover': {
      background: vars.brandColor,
      _textColor: vars.brandTextColor,
    },
    ':host button:not(:disabled):active': {
      background: vars.brandColor,
      _textColor: vars.brandTextColor,
      boxShadow: `0 0 2px 2px ${vars.brandColor}`,
    },
    ':host [part="cancelWord"]': {
      background: vars.errorColor,
    },
    ':host .not-found.not-found': {
      textDecoration: 'line-through',
      opacity: 0.6,
      background: vars.errorColor,
    },
    ':host [part="words"]': {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
    },
    ':host .word': {
      background: vars.brandColor,
      color: vars.brandTextColor,
      padding: '4px 8px',
      borderRadius: 4,
    },
  },
}) as ElementCreator<GriddleGame>
