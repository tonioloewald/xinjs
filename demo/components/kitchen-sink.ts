import {xin, touch, elements, makeComponent, Component, vars} from '../../src'
import { markdownViewer } from './markdown-viewer'

const {div, span, form, button, label, input, select, option, datalist, h4, template} = elements

const wordsToCamelCase = string => string.split(/\s+/)
  .map((word, idx) => idx > 0 ? word[0].toLocaleUpperCase() + word.substring(1): word)
  .join('')

const fleet = {
  name: 'Starfleet',
  vessels: [
    {id: 'ncc-1701', name: 'Enterprise'},
    {id: 'ncc-1031', name: 'Discovery'},
    {id: 'ncc-74656', name: 'Voyager'},
  ]
}

class SimpleComponent extends Component {
  styleNode = Component.StyleNode({
    ':host': {
      display: 'block',
      border: `2px solid ${vars.brandColor}`,
      padding: vars.spacing
    }
  })
}

const simpleComponent = SimpleComponent.elementCreator({tag: 'simple-component'})

xin.formTest = {
  string: 'hello xin',
  number: 3,
  date: new Date().toISOString(),
  check1: false,
  check2: true,
  pickOne: 'that',
  pickAny: {theOther: true, andThat: true},
  phone: '+1 (666) 555-4321',
  email: 'anne.example@foobar.baz',
  autocomplete: 'this',
  fleet,
}

const options = [
  'this', 'that', 'the other', 'also this', 'and that', 'and this one last thing'
]

const codeblock = `
import {elements} from 'xinjs'

const {h1, p, fragment} = elements

document.body.append(fragment(
  h1('heading'),
  p('here is some text')
))
`

export const kitchenSink = makeComponent(
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
      }
    },
    label(span('name'), input({bindValue: 'formTest.string'})),
    div(
      h4({bindText: 'formTest.fleet.name'}),
      div(
        {
          bindList: { value: 'formTest.fleet.vessels', idPath: 'id' }
        },
        template(
          div({ bindText: '^.name'})
        )
      )
    ),
    simpleComponent(
      h4('this is a simple component'),
      div({class: 'field readonly', bindText: 'formTest.string'}),
      div(
        h4({bindText: 'formTest.fleet.name'}),
        div(
          {
            bindList: { value: 'formTest.fleet.vessels', idPath: 'id' }
          },
          template(
            div({ bindText: '^.name'})
          )
        )
      )
    ),
    label(span('number'), input({type: "number", bindValue: 'formTest.number'})),
    label(span('range input'), input({type: "range", value: 0, min: -5, max: 5, bindValue: 'formTest.number'})),
    label(span('date input'), input({type: "date", bindValue: 'formTest.date'})),
    label(span('phone number'), input({type: 'tel', bindValue: 'formTest.phone'})),
    label(span('email'), input({type: 'email', bindValue: 'formTest.email'})),
    label(
      span('select an option'),
      ...options.map(item => label(
        {style: {flexDirection: 'row'}},
        input({type: 'radio', name: 'radio-options', value:item, bindValue: 'formTest.pickOne'}),
        span(item)
      ))
    ),
    label(span('select an option'), select(
      { bindValue: 'formTest.pickOne' },
      ...options.map(item => option(item))
    )),
    label(
      span('select all that apply (avoid using these!)'), 
      select(
        { multiple: true, bindValue: 'formTest.pickAny' },
        ...options.map(item => option(item, {value: wordsToCamelCase(item)}))
      )
    ),
    label(
      { style: {flexDirection: 'row'}},
      input({type: 'checkbox', bindValue: 'formTest.check1'}),
      span('checkbox 1')
    ),
    label(
      { style: {flexDirection: 'row'}},
      input({type: 'checkbox', bindValue: 'formTest.check2'}),
      span('checkbox 2')
    ),
    label(
      span('check all that apply'),
      ...options.map(item => label(
        {
          style: {
            flexDirection: 'row'
          },
          onChange() {
            // this is to sync the multi-select
            touch('formTest.pickAny')
          }
        },
        input({type: 'checkbox', bindValue: `formTest.pickAny.${wordsToCamelCase(item)}`}),
        span(item)
      ))
    ),
    label(
      span('autocomplete'),
      input(
        {
          apply(element){
            element.setAttribute('list', 'test-options')
          },
          bindValue: 'formTest.autocomplete'
        }
      )
    ),
    datalist(
      { id: 'test-options' },
      ...options.map(item => option({value: item}))
    ),
    div(
      { style: { display: 'flex', marginTop: vars.spacing, gap: vars.spacing50 } },
      span({style: {flex: '1 1 auto'}}),
      button('Reset'),
      button('Submit', {class: 'primary'})
    )
  )
)