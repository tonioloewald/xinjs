import { xin, observe } from './xin'
import { xinValue } from './metadata'
import {
  XinObject,
  PathTestFunction,
  ObserverCallbackFunction,
} from './xin-types'
import { debounce } from './throttle'

// TODO reimplement using IndexedDB

export const hotReload = (test: PathTestFunction = () => true): void => {
  const savedState = localStorage.getItem('xin-state')
  if (savedState != null) {
    const state = JSON.parse(savedState)
    for (const key of Object.keys(state).filter(test)) {
      if (xin[key] !== undefined) {
        Object.assign(xin[key], state[key])
      } else {
        xin[key] = state[key]
      }
    }
  }

  const saveState = debounce(() => {
    const obj: XinObject = {}
    const state = xinValue(xin)
    for (const key of Object.keys(state).filter(test)) {
      obj[key] = state[key]
    }
    localStorage.setItem('xin-state', JSON.stringify(obj))
    console.log('xin state saved to localStorage')
  }, 500)

  observe(test, saveState as ObserverCallbackFunction)
}
