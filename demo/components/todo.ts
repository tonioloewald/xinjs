import {
  boxedProxy,
  elements,
  touch,
  getListItem,
  ElementPart,
  vars,
} from 'xinjs'

const { h1, div, template, form, span, input, button } = elements

type Reminder = {
  id: number
  reminder: string
}

class Todo {
  name = 'Todo List Example'
  list: Reminder[]
  newItem: Reminder = {
    id: 1,
    reminder: '',
  }
  constructor(list: Reminder[] = []) {
    this.list = list
  }
  addItem() {
    const { newItem, list } = this
    if (!newItem.reminder) {
      return
    }
    list.push({ ...newItem })
    newItem.id++
    newItem.reminder = ''
  }
  deleteItem(item: Reminder) {
    const { list } = this
    const idx = list.indexOf(item)
    if (idx > -1) {
      list.splice(idx, 1)
    }
  }
}

const { todoApp } = boxedProxy({
  todoApp: new Todo([{ id: 0, reminder: 'a gentle reminder' }]),
})

const flex = { display: 'flex', gap: vars.spacing50, flexDirection: 'row' }
const row = { ...flex, alignItems: 'center' }
const stack = {
  ...flex,
  flexDirection: 'column',
  gap: vars.spacing25,
  paddingLeft: vars.spacing,
}
const elastic = { flex: '1 1 auto' }
const padded = { padding: `${vars.spacing} ${vars.spacing200}` }

export const todo = (...args: ElementPart[]) =>
  div(
    ...args,
    {
      style: { ...padded, ...stack },
    },
    h1('To Do'),
    div(
      { style: stack },
      template(
        div(
          { style: row },
          span({ bindText: '^.reminder', style: elastic }),
          button(span('✕'), {
            title: 'delete',
            onClick(event) {
              const item = getListItem(event.target as HTMLElement)
              todoApp.deleteItem(item)
              touch(todoApp)
            },
          })
        )
      ),
      { bindList: { value: todoApp.list, idPath: 'id' } }
    ),
    form(
      { style: row },
      {
        onSubmit(event) {
          todoApp.addItem()
          touch(todoApp)
          event.preventDefault()
        },
      },
      input({
        style: elastic,
        placeholder: 'enter a reminder',
        bindValue: todoApp.newItem.reminder,
      }),
      button('Add Item', { bindEnabled: todoApp.newItem.reminder })
    )
  )
