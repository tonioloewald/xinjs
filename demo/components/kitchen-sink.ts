import {
  xinProxy,
  touch,
  elements,
  Component,
  vars,
  css,
  xinTest,
  XinTest,
} from '../../src'
import { markdownViewer } from './markdown-viewer'

const {
  div,
  span,
  form,
  button,
  label,
  input,
  select,
  option,
  datalist,
  h4,
  p,
  template,
  fragment,
  style,
  slot,
  xinSlot,
} = elements

const wordsToCamelCase = (s: string) =>
  s
    .split(/\s+/)
    .map((word, idx) =>
      idx > 0 ? word[0].toLocaleUpperCase() + word.substring(1) : word
    )
    .join('')

class SimpleComponent extends Component {
  exampleProp: (() => { word: string }) | null = null
  undefinedProp: string | undefined

  styleNode = Component.StyleNode({
    ':host': {
      display: 'flex',
      flexDirection: 'column',
      border: `2px solid ${vars.brandColor}`,
      padding: vars.spacing,
      gap: vars.spacing50,
      borderRadius: vars.roundedRadius,
    },
  })
}

class LightComponent extends Component {
  content = [
    h4('<light-component> has no styleNode and thus no shadowDOM', {
      style: { marginBotton: vars.spacing50 },
    }),
    label(
      '...and its content elements can be bound normally: ',
      input({ bindValue: 'formTest.string' })
    ),
    div(
      {
        style: {
          textAlign: 'right',
          margin: `${vars.spacing50} 0`,
        },
      },
      button('reset formTest.string', { onClick: 'formTest.reset' })
    ),
    div(
      {
        style: {
          marginTop: vars.spacing50,
          background: vars.panelBg,
          padding: vars.spacing,
        },
      },
      xinSlot({ part: 'first', name: 'first' }),
      xinSlot(),
      xinSlot({ part: 'last', name: 'last' })
    ),
  ]
}

class ShadowComponent extends Component {
  styleNode = Component.StyleNode({
    ':host': {
      display: 'flex',
      flexDirection: 'column',
      padding: vars.spacing,
      gap: vars.spacing50,
      background: vars.panelBg,
    },
    '::slotted(div)': {
      textAlign: 'center',
    },
    '[part="border"]': {
      content: ' ',
      background: vars.textColor,
      height: '1px',
      width: '100%',
      opacity: 0.5,
    },
  })
  content = [
    slot({ part: 'first', name: 'first' }),
    div({ part: 'border' }),
    slot(),
    slot({ part: 'last', name: 'last' }),
  ]
}

const lightComponent = LightComponent.elementCreator({ tag: 'light-component' })

const simpleComponent = SimpleComponent.elementCreator({
  tag: 'simple-component',
})

const shadowComponent = ShadowComponent.elementCreator({
  tag: 'shadow-component',
})

const { formTest } = xinProxy({
  formTest: {
    string: 'hello xin',
    number: 3,
    color: 'red',
    date: new Date().toISOString(),
    check1: false,
    check2: true,
    pickOne: 'that',
    pickAny: { theOther: true, andThat: true },
    phone: '+1 (666) 555-4321',
    email: 'anne.example@foobar.baz',
    autocomplete: 'this',
    fleet: {
      name: 'Starfleet',
      vessels: [
        { id: 'ncc-1701', name: 'Enterprise' },
        { id: 'ncc-1031', name: 'Discovery' },
        { id: 'ncc-74656', name: 'Voyager' },
      ],
    },
    reset() {
      formTest.string = 'hello xin'
    },
  },
})

const options = [
  'this',
  'that',
  'the other',
  'also this',
  'and that',
  'and this one last thing',
]

export const kitchenSink = () =>
  fragment(
    markdownViewer(`# Kitchen Sink

This is an in-browser test of key functionality including:
- binding (both ways)
- elements
- syntax sugar
- css`),
    form(
      {
        onSubmit(event: Event) {
          event.preventDefault()
        },
      },
      label(span('name'), input({ bindValue: 'formTest.string' })),
      div(
        h4('inline bindings'),
        p(
          {
            class: 'inline-bound',
            bind: {
              value: 'formTest.color',
              binding: {
                toDOM(elt, value) {
                  elt.style.color = value
                },
              },
            },
          },
          'this should be red'
        )
      ),
      xinTest('inline-bound paragraph should be red', {
        expect: 'red',
        test() {
          return (document.querySelector('p.inline-bound') as HTMLElement).style
            .color
        },
      }),
      div(
        h4({ bindText: 'formTest.fleet.name' }),
        div(
          {
            bindList: { value: 'formTest.fleet.vessels', idPath: 'id' },
          },
          template(div({ bindText: '^.name' }))
        )
      ),
      div(
        style(
          css({
            '.test-container': {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: vars.spacing25,
            },
            '.test': {
              color: 'black',
              borderRadius: vars.lineHeight,
              lineHeight: vars.lineHeight,
              padding: `0 ${vars.spacing50}`,
            },
          })
        ),
        h4('Test Results'),
        xinTest('should succeed', {
          test() {
            return true
          },
        }),
        xinTest('should run for 2s the fail', {
          async test() {
            await XinTest.delay(2000)
            return false
          },
        }),
        xinTest('should succeed after 2s', {
          delay: 2000,
          test() {
            return true
          },
        }),
        xinTest('should wait 1s then fail after 3s', {
          delay: 1000,
          async test() {
            await XinTest.delay(3000)
            return false
          },
        }),
        xinTest('should wait 1s, then throw after 1s', {
          delay: 1000,
          async test() {
            await XinTest.delay(1000)
            throw new Error('drat, foiled again!')
          },
        }),
        xinTest('custom element camelCase prop is set', {
          test() {
            const simple = document.querySelector(
              'simple-component'
            ) as SimpleComponent
            return (
              simple.exampleProp !== null &&
              simple.exampleProp().word === 'success'
            )
          },
        })
      ),
      simpleComponent(
        {
          exampleProp: () => ({ word: 'success' }),
        },
        h4('<simple-component> has a shadowDOM'),
        p('Its contents are in the "light" DOM and can be bound normally.'),
        label(span('name'), input({ bindValue: 'formTest.string' })),
        label(
          span('name (read only)'),
          div({ class: 'field readonly', bindText: 'formTest.string' })
        ),
        div(
          h4({ bindText: 'formTest.fleet.name' }),
          div(
            {
              bindList: { value: 'formTest.fleet.vessels', idPath: 'id' },
            },
            template(div({ bindText: '^.name' }))
          ),
          lightComponent(
            {
              style: { display: 'block', marginTop: vars.spacing },
            },
            'this instance of <light-component> is nested and still works'
          )
        )
      ),
      style(
        css({
          '::part(first)': {
            color: 'red',
          },
          '::part(border)': {
            background: 'green',
            opacity: 1,
          },
          '::part(last)': {
            fontWeight: 'bold',
          },
        })
      ),
      shadowComponent(
        p('This should be under the heading'),
        markdownViewer(
          'Thanks to `::part()` selectors, the line below the heading should be green, the heading should be red and the footer should be bold'
        ),
        div({ slot: 'last' }, 'This should be centered and shown last'),
        h4('<shadow-component> has a shadowDOM and three slots', {
          slot: 'first',
        })
      ),
      lightComponent(
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
          },
        },
        div('this child is slotted'),
        div({ slot: 'last' }, 'this child is slotted "last"'),
        div({ slot: 'first' }, 'this child is slotted "first')
      ),
      label(
        span('number'),
        input({ type: 'number', bindValue: 'formTest.number' })
      ),
      label(
        span('range input'),
        input({
          type: 'range',
          value: 0,
          min: -5,
          max: 5,
          bindValue: 'formTest.number',
        })
      ),
      label(
        span('date input'),
        input({ type: 'date', bindValue: 'formTest.date' })
      ),
      label(
        span('phone number'),
        input({ type: 'tel', bindValue: 'formTest.phone' })
      ),
      label(
        span('email'),
        input({ type: 'email', bindValue: 'formTest.email' })
      ),
      label(
        span('select an option'),
        ...options.map((item) =>
          label(
            { style: { flexDirection: 'row' } },
            input({
              type: 'radio',
              name: 'radio-options',
              value: item,
              bindValue: 'formTest.pickOne',
            }),
            span(item)
          )
        )
      ),
      label(
        span('select an option'),
        select(
          { bindValue: 'formTest.pickOne' },
          ...options.map((item) => option(item))
        )
      ),
      label(
        span(
          'select all that apply (avoid using select multiple, users do not understand them!)'
        ),
        select(
          { multiple: true, bindValue: 'formTest.pickAny' },
          ...options.map((item) =>
            option(item, { value: wordsToCamelCase(item) })
          )
        )
      ),
      label(
        { style: { flexDirection: 'row' } },
        input({ type: 'checkbox', bindValue: 'formTest.check1' }),
        span('checkbox 1')
      ),
      label(
        { style: { flexDirection: 'row' } },
        input({ type: 'checkbox', bindValue: 'formTest.check2' }),
        span('checkbox 2')
      ),
      label(
        span('check all that apply'),
        ...options.map((item) =>
          label(
            {
              style: {
                flexDirection: 'row',
              },
              onChange() {
                // this is to sync the multi-select
                touch('formTest.pickAny')
              },
            },
            input({
              type: 'checkbox',
              bindValue: `formTest.pickAny.${wordsToCamelCase(item)}`,
            }),
            span(item)
          )
        )
      ),
      label(
        span('autocomplete'),
        input({
          apply(element) {
            element.setAttribute('list', 'test-options')
          },
          bindValue: 'formTest.autocomplete',
        })
      ),
      datalist(
        { id: 'test-options' },
        ...options.map((item) => option({ value: item }))
      ),
      div(
        {
          style: {
            display: 'flex',
            marginTop: vars.spacing,
            gap: vars.spacing50,
          },
        },
        span({ style: { flex: '1 1 auto' } }),
        button('Reset'),
        button('Submit', { class: 'primary' })
      )
    )
  )
