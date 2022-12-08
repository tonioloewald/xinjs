import {xin, elements, touch, getListItem, makeComponent, XinProxyObject, vars, XinProps} from '../../src/index'

const {h1, div, template, form, span, input, button} = elements

type Reminder = {
  id: number
  reminder: string
}

class Todo {
  name = 'Todo List Example'
  list: Reminder[]
  newItem: Reminder = {
    id: 1,
    reminder: ''
  }
  constructor(list: Reminder[] = []) {
    this.list = list
  }
  addItem() {
    const {newItem, list} = this
    if (!Boolean(newItem.reminder)) {
      return
    }
    list.push({...newItem})
    newItem.id++
    newItem.reminder = ''
  }
  deleteItem(item: Reminder) {
    const {list} = this
    const idx = list.indexOf(item)
    if (idx > -1) {
      list.splice(idx, 1)
    }
  }
}

xin.todoApp = new Todo() as unknown as XinProxyObject

const flex = { display: 'flex', gap: vars.spacing50 }
const stack = { ...flex, flexDirection: 'column' }
const elastic = { flex: '1 1 auto' }
const padded = { padding: `${vars.spacing} ${vars.spacing200}`  }
const rounded = { borderRadius: vars.roundedRadius }

export const todo = makeComponent(
  {
    style: { ...padded, ...stack }
  },
  h1('To Do'),
  div(
    { style: {...stack} },
    template(div(
      { style: {...flex }},
      span({ bindText: '^.reminder', style: elastic }),
      button(span('✕'), {title: 'delete', onClick(event){
        const item = getListItem(event.target as HTMLElement)
        // @ts-ignore-error
        xin.todoApp.deleteItem(item)
        touch(xin.todoApp as XinProps)
      }})
    )),
    { bindList: {value: xin.todoApp.list, idPath: 'id'} }
  ),
  form(
    { style: flex },
    {
      onSubmit(event){
        // @ts-ignore-error
        xin.todoApp.addItem()
        touch('todoApp')
        event.preventDefault()
      }
    },
    input({ style: elastic, placeholder: 'reminder', bindValue: 'todoApp.newItem.reminder' }),
    button('Add Item', { bindEnabled: 'todoApp.newItem.reminder' })
  )
)