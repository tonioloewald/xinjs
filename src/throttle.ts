type VoidFunc = (...args: any[]) => void

export const debounce = (origFn: VoidFunc, minInterval = 250) => {
  let debounceId: number
  return (...args: any[]) => {
    if (debounceId) clearTimeout(debounceId)
    debounceId = setTimeout(() => {
      origFn(...args)
    }, minInterval)
  }
}

export const throttle = (origFn: VoidFunc, minInterval = 250) => {
  let debounceId: number
  let previousCall = Date.now() - minInterval
  let inFlight = false
  return (...args: any[]) => {
    clearTimeout(debounceId)
    debounceId = setTimeout(async () => {
      console.log('calling with delay')
      origFn(...args)
      previousCall = Date.now()
    }, minInterval)
    if (!inFlight && Date.now() - previousCall >= minInterval) {
      inFlight = true
      try {
        console.log('calling delayed')
        origFn(...args)
        previousCall = Date.now()
      } finally {
        inFlight = false
      }
    }
  }
}