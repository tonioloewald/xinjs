import { labeledInput, toolBar } from './components'
import { xin, elements, touch, bind, bindings } from '../src'
import { debounce } from '../src/throttle'
import {WordList} from './WordList'
import words from './words'

const {b, span, div, a, fragment} = elements

xin.words = new WordList(words)
console.log(xin.words.wordCount, 'words loaded')

export const wordSearch = () => fragment(
  toolBar(
    b('Word Search'),
    span({style: {flex: '1 1 auto'}}),
    labeledInput('letters', {
      placeholder: 'letters to use',
      style: {
        '--input-width': '160px'
      },
      apply(element){
        bind(element, 'words.letters', bindings.value)
      }
    }),
    labeledInput('must contain', {
      placeholder: 'required substring',
      style: {
        '--input-width': '60px'
      },
      apply(element){
        bind(element, 'words.mustContain', bindings.value)
      }
    }),
    labeledInput('min length', {
      type: 'number',
      style: {
        '--input-width': '60px'
      },
      apply(element){
        bind(element, 'words.minLength', bindings.value)
      }
    }),
    labeledInput('reuse letters', {
      type: 'checkbox',
      apply(element) {
        bind(element, 'words.reuseLetters', bindings.value)
      }
    }),
    {
      onInput: debounce(() => {
        if (xin.words) {
          touch('words.list')
          touch('words.filterCount')
        }
      })
    },
    span(
      { style: { flex: '0 0 100px', textAlign: 'right' } },
      span({ bindText: 'words.filterCount' }),
      ' words'
    )
  ),
  bind(
    div(
      a({
        style: {
          display: 'inline-block',
          padding: '2px 10px',
          margin: '2px',
          borderRadius: '99px',
          background: '#00f2',
          fontFamily: 'Helvetica Neue, Helvetica, Arial, Sans-serif',
          textDecoration: 'none',
          color: 'var(--text-color)'
        }
      })
    ),
    'words.list',
    bindings.list, 
    {
      initInstance(element, word) {
        element.textContent = word
        element.setAttribute('href', `https://thefreedictionary.com/${word}`)
        element.setAttribute('target', `definition`)
      }
    }
  )
)
