import { PathTestFunction, ObserverCallbackFunction, XinTouchableType, xinPath } from './xin-types'
import { settings } from './settings'

export const observerShouldBeRemoved = Symbol('observer should be removed')
export const listeners: Listener[] = [] // { path_string_or_test, callback }
const touchedPaths: string[] = []
let updateTriggered: number | boolean = false
let updatePromise: Promise<undefined>
let resolveUpdate: Function

const getPath = (what: string | XinTouchableType): string => {
  return typeof what === 'object' ? what[xinPath] : what
}
export class Listener {
  description: string
  test: PathTestFunction
  callback: ObserverCallbackFunction

  constructor (test: string | RegExp | PathTestFunction, callback: string | ObserverCallbackFunction) {
    const callbackDescription = typeof callback === 'string' ? `"${callback}"` : `function ${callback.name}`
    let testDescription
    if (typeof test === 'string') {
      this.test = t => typeof t === 'string' && t !== '' && (test.startsWith(t) || t.startsWith(test))
      testDescription = `test = "${test}"`
    } else if (test instanceof RegExp) {
      this.test = test.test.bind(test)
      testDescription = `test = "${test.toString()}"`
    } else if (test instanceof Function) {
      this.test = test
      testDescription = `test = function ${test.name}`
    } else {
      throw new Error(
        'expect listener test to be a string, RegExp, or test function'
      )
    }
    this.description = `${testDescription}, ${callbackDescription}`
    if (typeof callback === 'function') {
      this.callback = callback
    } else {
      throw new Error('expect callback to be a path or function')
    }
    listeners.push(this)
  }
}

export const updates = async (): Promise<void> => {
  if (updatePromise === undefined) {
    return
  }
  await updatePromise
}

const update = (): void => {
  if (settings.perf) {
    console.time('xin async update')
  }
  const paths = [...touchedPaths]

  for (const path of paths) {
    listeners
      .filter(listener => {
        let heard
        try {
          heard = listener.test(path)
        } catch (e) {
          throw new Error(`Listener ${listener.description} threw "${e as string}" at "${path}"`)
        }
        if (heard === observerShouldBeRemoved) {
          unobserve(listener)
          return false
        }
        return heard as boolean
      })
      .forEach(listener => {
        let outcome
        try {
          outcome = listener.callback(path)
        } catch (e) {
          console.error(`Listener ${listener.description} threw "${e as string}" handling "${path}"`)
        }
        if (outcome === observerShouldBeRemoved) {
          unobserve(listener)
        }
      })
  }

  touchedPaths.splice(0)
  updateTriggered = false
  if (typeof resolveUpdate === 'function') {
    resolveUpdate()
  }
  if (settings.perf) {
    console.timeEnd('xin async update')
  }
}

export const touch = (what: XinTouchableType): void => {
  const path = getPath(what)

  if (updateTriggered === false) {
    updatePromise = new Promise(resolve => {
      resolveUpdate = resolve
    })
    updateTriggered = setTimeout(update)
  }

  if (touchedPaths.find(touchedPath => path.startsWith(touchedPath)) == null) {
    touchedPaths.push(path)
  }
}

export const observe = (test: string | RegExp | PathTestFunction, callback: ObserverCallbackFunction): Listener => {
  return new Listener(test, callback)
}

export const unobserve = (listener: Listener): void => {
  const index = listeners.indexOf(listener)
  if (index > -1) {
    listeners.splice(index, 1)
  } else {
    throw new Error('unobserve failed, listener not found')
  }
}
