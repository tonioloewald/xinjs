import { labeledInput, toolBar } from './components'
import {
  xinProxy,
  elements,
  touch,
  bind,
  bindings,
  ElementPart,
  vars,
} from 'xinjs'
import { debounce } from 'xinjs'
import { WordList } from './WordList'
import wordList from './words'

const { b, span, div, a, template } = elements

const { words } = xinProxy({
  words: new WordList(wordList),
})
console.log(words.wordCount, 'words loaded')

export const wordSearch = (...args: ElementPart[]) =>
  div(
    ...args,
    toolBar(
      b('Word Search'),
      span({ style: { flex: '1 1 auto' } }),
      labeledInput('letters', {
        placeholder: 'letters to use',
        style: {
          '--input-width': '160px',
        },
        input: true,
        apply(element) {
          bind(element, 'words.letters', bindings.value)
        },
      }),
      labeledInput('reuse', {
        type: 'checkbox',
        input: true,
        apply(element) {
          bind(element, 'words.reuseLetters', bindings.value)
        },
      }),
      labeledInput('must contain', {
        placeholder: 'required',
        style: {
          '--input-width': '60px',
        },
        input: true,
        apply(element) {
          bind(element, 'words.mustContain', bindings.value)
        },
      }),
      labeledInput('min length', {
        type: 'number',
        style: {
          '--input-width': '60px',
        },
        input: true,
        apply(element) {
          bind(element, 'words.minLength', bindings.value)
        },
      }),
      {
        onInput: debounce(() => {
          if (words) {
            touch('words.list')
            touch('words.filterCount')
          }
        }),
      },
      span(
        { style: { flex: '0 0 100px', textAlign: 'right' } },
        span({ bindText: 'words.filterCount' }),
        ' words'
      )
    ),
    div(
      {
        bindList: {
          value: 'words.list',
        },
      },
      template(
        a({
          style: {
            display: 'inline-block',
            padding: '2px 10px',
            margin: '2px',
            borderRadius: '99px',
            background: vars.panelBg,
            fontFamily: 'Helvetica Neue, Helvetica, Arial, Sans-serif',
            textDecoration: 'none',
            color: 'var(--text-color)',
          },
          target: '_blank',
          bindText: '^',
          bind: {
            value: '^',
            binding: {
              toDOM(element, word) {
                element.setAttribute(
                  'href',
                  `https://thefreedictionary.com/${word}`
                )
              },
            },
          },
        })
      )
    ),
    div(
      {
        class: 'show-after-empty',
        style: {
          lineHeight: '200px',
          height: '200px',
          textAlign: 'center',
          opacity: 0.5,
        },
      },
      'enter criteria to find anagrams'
    )
  )
