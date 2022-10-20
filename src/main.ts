import {xin, get, observe, unobserve, observerShouldBeRemoved} from './xin.ts'

xin.test = {
  message: 'hello xin',
  value: 17,
  people: ['tomasina', 'juanita', 'harriet'],
  things: [
    {id: 1701, name: 'Enterprise'},
    {id: 666, name: 'The Beast'},
    {id: 1, name: 'The Best'}
  ]
}

console.log(xin.test.message)
console.log(xin.test.people[0])
console.log(xin.test.things['id=1701'].name)
xin.test.things['id=1701'].name = 'formerly known as Enterprise'
console.log(xin.test.things['id=1701'].name)
console.log(xin.test.value)
xin.test.value++
console.log(xin.test.value)
xin.test.value = Math.PI
console.log(xin.test.value)

const listener = observe('test', (path) => {
  console.log(path, 'changed to', xin[path])
})

xin.test.message = 'foo bar baz'
xin.test.message = 'kiss me kate'
xin.test.people[2] = 'harry'
xin.test.people.push('stanton')
xin.test.people.sort()
xin.test.value = Math.random()
xin.test.people.splice(2,1)

unobserve(listener)
xin.test.value = 0
console.log(xin.test['value'], 'was not reported by the listener')
