import {xinProxy, elements, touch, getListItem, makeComponent, XinProxyObject, vars, XinProxyArray} from '../../src/index'

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

const { todoApp } = xinProxy({todoApp: new Todo()})

const flex = { display: 'flex', gap: vars.spacing50, flexDirection: 'row' }
const stack = { ...flex, flexDirection: 'column' }
const elastic = { flex: '1 1 auto' }
const padded = { padding: `${vars.spacing} ${vars.spacing200}` }

export const todo = makeComponent(
    {
      style: {...padded, ...stack},
      // TODO figure out how to make this automatic
      apply() {
        touch('todoApp')
      }
    },
    h1('To Do'),
    div(
      { style: stack },
      template(div(
        { style: {...flex }},
        span({ bindText: '^.reminder', style: elastic }),
        button(span('✕'), {title: 'delete', onClick(event){
          const item = getListItem(event.target as HTMLElement)
          todoApp.deleteItem(item)
          // @ts-ignore-error
          touch(todoApp)
        }})
      )),
      { bindList: {value: todoApp.list as unknown as XinProxyArray, idPath: 'id'} }
    ),
    form(
      { style: flex },
      {
        onSubmit(event){
          todoApp.addItem()
          // @ts-ignore-error
          touch(todoApp)
          event.preventDefault()
        }
      },
      input({ style: elastic, placeholder: 'reminder', bindValue: 'todoApp.newItem.reminder' }),
      button('Add Item', { bindEnabled: 'todoApp.newItem.reminder' })
    )
  )