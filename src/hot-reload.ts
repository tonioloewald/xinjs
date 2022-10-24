import { xin, observe } from './xin'
import { XinObject, PathTestFunction} from './xin-types'

export const hotReload = (test: PathTestFunction = () => true) => {
  const savedState = localStorage.getItem('xin-state')
  if(savedState) {
    const state = JSON.parse(savedState)
    for(const key of Object.keys(state).filter(test)) {
      Object.assign(xin[key], state[key])
    }
  }

  let deferredSave: number = 0

  const saveState = () => {
    const obj: XinObject = {}
    const state = xin._xinValue
    for(const key of Object.keys(state).filter(test)) {
      obj[key] = state[key]
    }
    localStorage.setItem('xin-state', JSON.stringify(xin._xinValue))
    console.log('xin state saved to localStorage')
  }

  observe(test, () => {
    clearTimeout(deferredSave)
    deferredSave = setTimeout(saveState, 250)
  })
}


