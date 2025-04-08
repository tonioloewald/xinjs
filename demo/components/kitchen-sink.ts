import {
  boxedProxy,
  XinProxyObject,
  touch,
  elements,
  Component,
  vars,
  css,
  makeComponent,
  blueprint,
  blueprintLoader,
  updates,
} from 'xinjs'
import { markdownViewer } from './markdown-viewer'
import blueprintExample from './blueprint-example'

makeComponent('bp-example', blueprintExample)

async function delayMS(duration: number) {
  return new Promise((resolve) => {
    if (duration) {
      setTimeout(resolve, duration)
    } else {
      requestAnimationFrame(resolve)
    }
  })
}

const {
  strong,
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
  xinTest,
  bpExample,
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

  static styleSpec = {
    ':host': {
      display: 'flex',
      flexDirection: 'column',
      border: `2px solid ${vars.brandColor}`,
      padding: vars.spacing,
      gap: vars.spacing50,
      borderRadius: vars.roundedRadius,
    },
  }
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
  static styleSpec = {
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
  }

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

class ShadowRed extends Component {
  static styleSpec = {
    ':host': { color: 'red' },
  }

  content = div(
    "this text should be red — it is styled by a styleNode in the component's shadowDOM"
  )
}

const shadowRed = ShadowRed.elementCreator({ tag: 'shadow-red' })

class LightBlue extends Component {
  content = div(
    'this text should be white on blue — it is styled using a global helper stylesheet'
  )
}

const lightBlue = LightBlue.elementCreator({
  tag: 'shadow-red',
  styleSpec: {
    ':host': {
      color: 'white',
      background: 'blue',
    },
  },
})
console.warn('^^^ this is intentional')

const { formTest } = boxedProxy({
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
    setTest: 'try editing this',
    blueprintTest: {
      caption: 'This one is bound',
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

const xinBound = span()
formTest.string.xinBind(xinBound, {
  toDOM(element, value) {
    console.log({ element, value })
    element.textContent = value
  },
})

const container = div(
  blueprintLoader(
    blueprint({
      tag: 'xin-test',
      src: 'https://tonioloewald.github.io/xin-test/dist/blueprint.js',
      onload() {
        container.append(
          markdownViewer(`# Kitchen Sink

This is an in-browser test of key functionality including:
- binding (both ways)
- elements
- components
- syntax sugar
- css
- blueprints`),
          form(
            {
              onSubmit(event: Event) {
                event.preventDefault()
              },
            },
            label(
              span('name (bindValue)'),
              input({ class: 'direct-binding', bindValue: formTest.string })
            ),
            label(
              span('name (custom binding)'),
              input({
                class: 'custom-binding',
                bindValue: formTest.string,
                bind: {
                  value: formTest.color,
                  binding: {
                    toDOM(element, value) {
                      element.style.color = value
                    },
                    fromDOM(element) {
                      return element.style.color
                    },
                  },
                },
              })
            ),
            xinTest('custom toDOM binding should work', {
              expect: '"violet"',
              async test() {
                const customBound = document.querySelector('.custom-binding')
                formTest.color = 'violet'
                await updates()

                return customBound.style.color
              },
            }),
            xinTest('custom fromDOM binding should work', {
              delay: 100,
              expect: '"red"',
              async test() {
                const customBound = document.querySelector('.custom-binding')
                customBound.style.color = 'red'
                customBound.dispatchEvent(new Event('change'))
                await updates()

                return formTest.color.valueOf()
              },
            }),
            xinTest('boxed binding should work', {
              test() {
                return (
                  (
                    document.querySelector(
                      'input.direct-binding'
                    ) as HTMLInputElement
                  ).value === formTest.string.valueOf()
                )
              },
            }),
            div(strong('Bound using xinBind: '), xinBound),
            xinTest('formTest.string.xinBind should work', {
              test() {
                return xinBound.textContent === formTest.string.valueOf()
              },
            }),
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
              test() {
                return (
                  (document.querySelector('p.inline-bound') as HTMLElement)
                    .style.color === 'red'
                )
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
            div(
              h4('set vs value bindings'),
              p('Both of these fields are bound to formTest.setTest'),
              label(
                'value bound',
                input({ id: 'bindSetValue', bindValue: 'formTest.setTest' })
              ),
              label(
                'set bound',
                input({ id: 'bindSetSet', bindSet: 'formTest.setTest' })
              ),
              xinTest('editing value bound input updates set bound input', {
                delay: 500,
                expect: '"editing this field updates both fields"',
                async test() {
                  const input = document.querySelector(
                    '#bindSetValue'
                  ) as HTMLInputElement
                  input.value = 'editing this field updates both fields'
                  input.dispatchEvent(new Event('change'))
                  await delayMS(100)
                  return (
                    document.querySelector('#bindSetSet') as HTMLInputElement
                  ).value
                },
              }),
              xinTest(
                'editing set bound input does not update value bound input',
                {
                  delay: 1000,
                  expect: '"editing this field updates both fields"',
                  async test() {
                    const input = document.querySelector(
                      '#bindSetSet'
                    ) as HTMLInputElement
                    input.value = "editing this field won't trigger an update"
                    input.dispatchEvent(new Event('change'))
                    await delayMS(100)
                    return (
                      document.querySelector(
                        '#bindSetValue'
                      ) as HTMLInputElement
                    ).value
                  },
                }
              )
            ),
            simpleComponent(
              {
                exampleProp: () => ({ word: 'success' }),
              },
              h4('<simple-component> has a shadowDOM'),
              p(
                'Its contents are in the "light" DOM and can be bound normally.'
              ),
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
                  { class: 'row' },
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
              { class: 'row' },
              input({ type: 'checkbox', bindValue: 'formTest.check1' }),
              span('checkbox 1')
            ),
            label(
              { class: 'row' },
              input({ type: 'checkbox', bindValue: 'formTest.check2' }),
              span('checkbox 2')
            ),
            label(
              span('check all that apply'),
              ...options.map((item) =>
                label(
                  {
                    class: 'row',
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
            bpExample(
              {
                bindValue: formTest.blueprintTest as unknown as XinProxyObject,
              },
              p('This is inside a blueprint component!')
            ),
            label(
              span('Below is the (bound) caption of the previous blueprint'),
              input({ bindValue: formTest.blueprintTest.caption })
            ),
            markdownViewer(
              `You may notice that editing the caption in the \`<input>\` above does not update the
                  component. This is because \`formTest.blueprint\` is bound to the
                  value of the blueprint (and does not change). The binding of elements inside the
                  blueprint component to \`value.caption\` is "out of \`xinjs\`'s sight".`
            ),
            bpExample(
              p('This is inside a second instance of the blueprint component!')
            ),
            shadowRed(),
            lightBlue(),
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
      },
    })
  )
)

export const kitchenSink = () => container
