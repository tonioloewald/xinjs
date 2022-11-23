import {xin, elements, touch, getListItem, makeComponent, XinProxyObject, vars} from '../../src/index'

const {h1, ul, template, li, form, label, span, input, button} = elements

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

export const todo = makeComponent(
  {
    style: {
      padding: `${vars.spacing} ${vars.spacing200}`
    }
  },
  h1('To Do'),
  ul(template(
    li(
      span({ bindText: '^.reminder' }),
      button(span('✕'), {title: 'delete', onClick(event){
        const item = getListItem(event.target as HTMLElement)
        // @ts-ignore-error
        xin.todoApp.deleteItem(item)
        touch(xin.todoApp)
      }})
    )),
    { bindList: {value: xin.todoApp.list, idPath: 'id'} }
  ),
  form(
    {
      onSubmit(event){
        // @ts-ignore-error
        xin.todoApp.addItem()
        touch('todoApp')
        event.preventDefault()
      }
    },
    label(
      span('Reminder'),
      input({ bindValue: 'todoApp.newItem.reminder' })
    ),
    button('Add Item', { bindEnabled: 'todoApp.newItem.reminder' })
  )
)