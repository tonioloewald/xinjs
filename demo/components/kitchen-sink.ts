import { xinProxy, touch, elements, Component, vars, css } from '../../src'
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
      xinSlot({ name: 'first' }),
      xinSlot(),
      xinSlot({ name: 'last' })
    ),
  ]
}

const lightComponent = LightComponent.elementCreator({ tag: 'light-component' })

const simpleComponent = SimpleComponent.elementCreator({
  tag: 'simple-component',
})

type TestExpression = () => Promise<boolean> | boolean

async function test(
  container: HTMLElement,
  description: string,
  expr: TestExpression
): Promise<void> {
  const testOutcome = div({ class: 'test pending' }, description)
  const testStart = Date.now()
  const testInterval = setInterval(() => {
    testOutcome.dataset.elapsed = ((Date.now() - testStart) * 0.001).toFixed(1)
  }, 100)
  container.append(testOutcome)
  let result: boolean
  try {
    result = await expr()
  } catch (err) {
    result = false
  }
  clearInterval(testInterval)
  testOutcome.classList.remove('pending')
  testOutcome.classList.add(result ? 'pass' : 'fail')
}

function delay(ms: number = 100): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const runTests = async (container: HTMLElement): Promise<void> => {
  await delay()
  const simple = document.querySelector('simple-component') as SimpleComponent
  test(container, 'test should be success', () => true)
  test(container, 'test should be failure', () => false)
  test(container, 'test should succeed after 5s', async () => {
    await delay(5000)
    return true
  })
  test(container, 'test should fail after 10s', async () => {
    await delay(10000)
    return false
  })
  test(
    container,
    'custom element camelCase prop is set',
    () => simple.exampleProp !== null && simple.exampleProp().word === 'success'
  )
}

const { formTest } = xinProxy({
  formTest: {
    string: 'hello xin',
    number: 3,
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
            '.pending': {
              background: '#ff8',
            },
            '.fail': {
              background: '#f88',
            },
            '.pass': {
              background: '#8f8',
            },
            '.test[data-elapsed]::after': {
              fontSize: '75%',
              background: '#0008',
              color: '#fff',
              lineHeight: vars.lineHeight75,
              padding: `0 ${vars.spacing25}`,
              borderRadius: vars.roundedRadius50,
              display: 'inline-block',
              content: '"[" attr(data-elapsed)"s elapsed]"',
              marginLeft: vars.spacing50,
            },
          })
        ),
        h4('Test Results'),
        div({
          class: 'test-container',
          apply: runTests,
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
