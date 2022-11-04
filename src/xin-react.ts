import { useState, useEffect } from 'react'
import { xin, observe, unobserve } from './xin'

type HookType = [
  value: any,
  setValue: (newValue: any) => void
]

// TODO declare type the way it's declated for useState so that TypeScript
// passes through type of initialValue to the right thing

export const useXin = (path: string, initialValue: any = ''): HookType => {
  const [value, update] = useState(xin[path] !== undefined ? xin[path] : initialValue)
  useEffect(() => {
    const observer = (): void => {
      update(xin[path])
    }
    const listener = observe(path, observer)
    return () => {
      unobserve(listener)
    }
  })
  const setValue = (value: any): void => {
    xin[path] = value
  }
  return [value, setValue]
}
