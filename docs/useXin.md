# useXin

Incredibly simple, powerful, and efficient state management for React…

<div style="text-align: center">
	<a href="https://twitter.com/dan_abramov/status/1191487232038883332?s=20&t=SNcVBTK1oj45NWI29RO1Dw">
		<img alt="Dan Abramov dissing Redux on Twitter" style="max-width: 80%" src="dan-redux-tweet.png">
	</a>
</div>

`useXin` allows you to use `xin` to manage state in [ReactJS](https://reactjs.org) apps.

- work with pure components everywhere (use `useXin` the way you'd use `useState`)
- cleanly separate logic from presentation
- avoid code and performance "tax" of passing complex state through DOM hierarchies
- cleanly integrate react and non-react code without writing and maintaining wrappers

## useXin in two minutes

Pass any object to `xin`, then access it exactly like you would via `useState`
except using `useXin('path.to.value')`. E.g.

```
import {xin, useXin} from 'xinjs'

xin.clock = {
	time: new Date().toLocaleTimeString()
}

setInterval(() => {
	xin.clock.time = new Date.toLocaleTimeString()
}, 1000)

const Clock = () => {
	const [time] = useXin('clock.time')
	return <div>{clock.time}</div>
}
```

Note that `useXin` returns `[value, setValue]` just as `useState` does 
(and if you wanted to write a more complex self-contained <Clock> that 
sets up and tears down setInterval then nothing is stopping you except 
wanting to write less, simpler code that runs faster), but in
this case the state is being updated *outside* of React and it *just works*.

## Todo List Example

Here's the good old [React](https://reactjs.org) "to do list" example rewritten with `xin` 
and only pure components.

- Fewer lines of code, 
- Clean separation between logic and presentation, 
- Better behavior, *and* 
- Cleaner screen redraws (thanks to pure components)

Better, faster, cheaper. You *can* have all three.

```
import {xin, useXin} from 'xin-react'

xin.app = {
  itemText: '',
  todos: [],
  addItem(event) {
    event.preventDefault() // forms reload the page by default!
    if(!xin.app.itemText) return
    xin.app.todos.push({
      id: crypto.randomUUID(),
      text: xin.app.itemText  
    })
    xin.app.itemText = ''
  }
}

const Editor = () => {
  const [itemText, setItemText] = useXin('app.itemText')
  return <form onSubmit={xin.app.addItem}>
    <input value={itemText} onInput={event => setItemText(event.target.value)} />
    <button disabled={!itemText} onClick={xin.app.addItem}>Add Item</button>
  </form>
}

const List = () => {
  const [todos] = useXin('app.todos')
  return <ul>
    {todos.map(item => <li key={item.id}>{item.text}</li>)}
  </ul>
}

export defaul TodoApp = () => <div className="TodoApp" role="main">
  <h1>To Do</h1>
  <List />
  <Editor />
</div>

root.render(<TodoTapp />)
```

