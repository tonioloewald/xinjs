import { Component as WebComponent, ElementCreator, elements, vars, xinProxy, XinTouchableType } from '../src/'
import { bodymovinPlayer, BodymovinPlayer } from 'xinjs-ui'
import wordList from './words'

const {h1, div, template, button} = elements

function shuffle<T>(deck: Array<T>, random = Math.random): Array<T> {
  const shuffled = [] as Array<T>;
  for (var c in deck) {
    shuffled.splice(Math.floor(random() * (1 + shuffled.length)), 0, deck[c]);
  }
  return shuffled
}

function gridPos(index: number): {row: number, col: number} {
  return {
    row: Math.floor(index / 4),
    col: index % 4
  }
}

const DICE = [
  ["R","I","F","O","B","X"],
  ["I","F","E","H","E","Y"],
  ["D","E","N","O","W","S"],
  ["U","T","O","K","N","D"],
  ["H","M","S","R","A","O"],
  ["L","U","P","E","T","S"],
  ["A","C","I","T","O","A"],
  ["Y","L","G","K","U","E"],
  ["Qu","B","M","J","O","A"],
  ["E","H","I","S","P","N"],
  ["V","E","T","I","G","N"],
  ["B","A","L","I","Y","T"],
  ["E","Z","A","V","N","D"],
  ["R","A","L","E","S","C"],
  ["U","W","I","L","R","G"],
  ["P","A","C","E","M","D"]
]
class BoggleGame extends WebComponent {
  game = {
    dice: [] as string[],
    wordInProgress: [] as string[],
    words: [] as string[],
  }

  init = () => {
    const { timer } = this.parts as { timer: BodymovinPlayer}
    this.game.dice = shuffle(DICE.map(die => die[Math.floor(Math.random() * 6)]))
    this.game.words = []
    this.game.wordInProgress = []
    if (timer.animation) {
      timer.animation.setSpeed(timer.getDuration()/180)
      timer.animation.play()
    }
  }

  constructor() {
    super()

    this.game = xinProxy({[this.instanceId]: this.game}, true)[this.instanceId]
  }

  content = null

  addLetter = (event: Event) => {
    const chars = (event.target as HTMLElement).textContent as string
    this.game.wordInProgress.push(chars)
    const dice = [...this.parts.board.querySelectorAll('.die')]
    const index = dice.indexOf(event.target as HTMLElement) as number
    const { row, col } = gridPos(index)
    for(let die in dice) {
      const pos = gridPos(Number(die))
      dice[die].toggleAttribute('disabled', index === Number(die) || Math.abs(pos.row - row) > 1 || Math.abs(pos.col - col) > 1)
    }
  }

  cancelWord = () => {
    this.game.wordInProgress = []
    for(const die of [...this.parts.board.querySelectorAll('.die')]) {
      die.removeAttribute('disabled')
    }
  }

  addWord = () => {
    const word = this.parts.word.textContent
    if (word) {
      if (this.game.words.includes(word)) {
        alert(`You already found ${word}`)
      } else if (wordList.includes(word.toLocaleLowerCase())) {
        this.game.words.push(this.parts.word.textContent as string)
        this.game.words.sort()
      } else {
        alert(`Sorry ${word} is not in my dictionary`)
      }
    }
    this.cancelWord()
  }

  connectedCallback() {
    super.connectedCallback()

    this.textContent = ''
    this.append(
      h1('boggle'), 
      bodymovinPlayer({
        part: 'timer',
        src: '/assets/hourglass.json',
        config: {
          autoplay: false,
          loop: false,
        }
      }),
      button('New Game', {part: 'init', onClick: this.init}),
      div(
        { 
          part: 'board',
          bindList: {
            value: this.game.dice
          }
        },
        template(
          div({ 
            class: `die`, 
            bindText: '^', 
            onClick: this.addLetter,
            bind: {
              value: '^', 
              binding(element, value) {
                element.style.transform = `rotateZ(${Math.floor(Math.random() * 4) * 88 + Math.random() * 4}deg`
              },
            } 
          })
        )
      ),
      div(
        {
          part: 'wordInProgress',
        },
        div(
          {
            part: 'word',
            bindList: {
              value: this.game.wordInProgress
            }
          },
          template(
            div({ 
              class: `die`, bindText: '^', bind: {
                value: '^', 
                binding(element, value) {
                  element.style.transform = `rotateZ(${Math.random() * 4 - 2}deg`
                }
              }
            })
          )
        ),
        div({style: {flex: '1'}}),
        button('x', {
          onClick: this.cancelWord,
          bind: {
            value: this.game.wordInProgress as unknown as XinTouchableType,
            binding: {
              toDOM(element, value) {
                element.toggleAttribute('disabled', value.length === 0)
              }
            }
          }
        }),
        button('Add Word', {
          onClick: this.addWord,
          bind: {
            value: this.game.wordInProgress as unknown as XinTouchableType,
            binding: {
              toDOM(element, value) {
                element.toggleAttribute('disabled', value.length === 0)
              }
            }
          }
        })
      ),
      div(
        {
          part: 'words',
          bindList: {
            value: this.game.words
          }
        },
        template(
          div(
            {bindText: '^'}
          )
        )
      )
    )

    this.init()
  }
}

export const boggleGame = BoggleGame.elementCreator(
  {
    tag: 'boggle-game',
    styleSpec: {
      ':host': {
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        alignItems: 'center',
        padding: vars.spacing
      },
      ':host h1': {
        textAlign: 'center'
      },
      ':host [part="board"]': {
        display: 'grid',
        gridTemplateColumns: '64px 64px 64px 64px',
        gap: '4px'
      },
      ':host [part="board"] > :first-child': {
        position: 'absolute'
      },
      ':host [part="wordInProgress"]': {
        width: '100%',
        display: 'flex',
        height: 48,
        padding: vars.spacing,
      },
      ':host [part="word"]': {
        display: 'flex',
      },
      ':host [part="init"]': {
        position: 'absolute',
        top: 4,
        right: 4,
      },
      ':host [part="timer"]': {
        position: 'absolute',
        top: 4,
        left: 4,
        height: 128,
        width: 128
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
        borderRadius: '4px',
        position: 'relative',
      },
      ':host [part="wordInProgress"] .die': {
        lineHeight: '48px',
        fontSize: '24px',
        height: '48px',
        width: '48px',
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
        pointerEvents: 'none'
      }
    }
  }
) as ElementCreator<BoggleGame>