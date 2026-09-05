import { test, expect, describe, beforeAll } from 'bun:test'
import type { ElementCreator } from './xin-types'
import { validateAgainstConstraints } from './form-validation'
import { Component } from './component'

// Mock ElementInternals — tracks setValidity calls for assertions
function mockInternals() {
  const calls: { flags: ValidityStateFlags; message?: string; anchor?: any }[] =
    []
  let currentFlags: ValidityStateFlags = {}
  let currentMessage = ''

  return {
    calls,
    get validity() {
      // Build a ValidityState-like object from current flags
      return {
        valueMissing: !!currentFlags.valueMissing,
        typeMismatch: !!currentFlags.typeMismatch,
        patternMismatch: !!currentFlags.patternMismatch,
        tooLong: !!currentFlags.tooLong,
        tooShort: !!currentFlags.tooShort,
        rangeUnderflow: !!currentFlags.rangeUnderflow,
        rangeOverflow: !!currentFlags.rangeOverflow,
        stepMismatch: !!currentFlags.stepMismatch,
        badInput: !!currentFlags.badInput,
        customError: !!currentFlags.customError,
        get valid() {
          return !Object.values(currentFlags).some(Boolean)
        },
      } as ValidityState
    },
    get validationMessage() {
      return currentMessage
    },
    willValidate: true,
    setValidity(flags: ValidityStateFlags, message?: string, anchor?: any) {
      currentFlags = flags
      currentMessage = message ?? ''
      calls.push({ flags, message, anchor })
    },
    setFormValue() {},
    checkValidity() {
      const valid = !Object.values(currentFlags).some(Boolean)
      return valid
    },
    reportValidity() {
      return this.checkValidity()
    },
    states: new Set<string>(),
  }
}

// Helper: create an element with mock internals and optional attributes
function makeElement(
  attrs: Record<string, string> = {}
): HTMLElement & { internals: ReturnType<typeof mockInternals> } {
  const el = document.createElement('div') as any
  el.internals = mockInternals()
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v)
  }
  return el
}

describe('validateAgainstConstraints', () => {
  test('valid value with no constraints — clears validity', () => {
    const el = makeElement()
    validateAgainstConstraints(el, 'hello')
    expect(el.internals.calls.length).toBe(1)
    expect(el.internals.calls[0].flags).toEqual({})
  })

  test('empty value with no required — valid', () => {
    const el = makeElement()
    validateAgainstConstraints(el, '')
    expect(el.internals.calls[0].flags).toEqual({})
  })

  test('required — empty value triggers valueMissing', () => {
    const el = makeElement({ required: '' })
    validateAgainstConstraints(el, '')
    expect(el.internals.calls[0].flags.valueMissing).toBe(true)
    expect(el.internals.calls[0].message).toBe('Please fill out this field.')
  })

  test('required — non-empty value is valid', () => {
    const el = makeElement({ required: '' })
    validateAgainstConstraints(el, 'hello')
    expect(el.internals.calls[0].flags).toEqual({})
  })

  test('minlength — too short triggers tooShort', () => {
    const el = makeElement({ minlength: '5' })
    validateAgainstConstraints(el, 'abc')
    expect(el.internals.calls[0].flags.tooShort).toBe(true)
    expect(el.internals.calls[0].message).toBe(
      'Please use at least 5 characters.'
    )
  })

  test('minlength — exact length is valid', () => {
    const el = makeElement({ minlength: '3' })
    validateAgainstConstraints(el, 'abc')
    expect(el.internals.calls[0].flags).toEqual({})
  })

  test('minlength — longer than min is valid', () => {
    const el = makeElement({ minlength: '3' })
    validateAgainstConstraints(el, 'abcdef')
    expect(el.internals.calls[0].flags).toEqual({})
  })

  test('maxlength — too long triggers tooLong', () => {
    const el = makeElement({ maxlength: '5' })
    validateAgainstConstraints(el, 'abcdefgh')
    expect(el.internals.calls[0].flags.tooLong).toBe(true)
    expect(el.internals.calls[0].message).toBe(
      'Please use no more than 5 characters.'
    )
  })

  test('maxlength — exact length is valid', () => {
    const el = makeElement({ maxlength: '5' })
    validateAgainstConstraints(el, 'abcde')
    expect(el.internals.calls[0].flags).toEqual({})
  })

  test('pattern — mismatch triggers patternMismatch', () => {
    const el = makeElement({ pattern: '[a-z]+' })
    validateAgainstConstraints(el, 'ABC123')
    expect(el.internals.calls[0].flags.patternMismatch).toBe(true)
    expect(el.internals.calls[0].message).toBe(
      'Please match the requested format.'
    )
  })

  test('pattern — match is valid', () => {
    const el = makeElement({ pattern: '[a-z]+' })
    validateAgainstConstraints(el, 'hello')
    expect(el.internals.calls[0].flags).toEqual({})
  })

  test('pattern — empty value skips pattern check', () => {
    const el = makeElement({ pattern: '[a-z]+' })
    validateAgainstConstraints(el, '')
    expect(el.internals.calls[0].flags).toEqual({})
  })

  test('pattern — anchored to full string (partial match fails)', () => {
    const el = makeElement({ pattern: '[a-z]+' })
    validateAgainstConstraints(el, 'hello123')
    expect(el.internals.calls[0].flags.patternMismatch).toBe(true)
  })

  test('invalid regex pattern is silently skipped', () => {
    const el = makeElement({ pattern: '[invalid(' })
    validateAgainstConstraints(el, 'anything')
    // No patternMismatch since the regex is invalid
    expect(el.internals.calls[0].flags).toEqual({})
  })

  test('multiple constraints — first failing message wins', () => {
    const el = makeElement({ required: '', minlength: '5' })
    validateAgainstConstraints(el, '')
    // Both valueMissing and tooShort fire (empty string is < 5)
    expect(el.internals.calls[0].flags.valueMissing).toBe(true)
    expect(el.internals.calls[0].flags.tooShort).toBe(true)
  })

  test('minlength + pattern — both can fail', () => {
    const el = makeElement({ minlength: '3', pattern: '[a-z]+' })
    validateAgainstConstraints(el, 'A')
    expect(el.internals.calls[0].flags.tooShort).toBe(true)
    expect(el.internals.calls[0].flags.patternMismatch).toBe(true)
  })

  test('no internals — early return, no crash', () => {
    const el = document.createElement('div') as any
    // no internals property at all
    validateAgainstConstraints(el, 'test')
    // Just verifying no error is thrown
  })

  test('clears validity when value becomes valid', () => {
    const el = makeElement({ required: '' })
    validateAgainstConstraints(el, '')
    expect(el.internals.calls[0].flags.valueMissing).toBe(true)

    validateAgainstConstraints(el, 'now valid')
    expect(el.internals.calls[1].flags).toEqual({})
  })

  test('anchor element is passed to setValidity on error', () => {
    const el = makeElement({ required: '' })
    validateAgainstConstraints(el, '')
    expect(el.internals.calls[0].anchor).toBe(el)
  })

  test('anchor is not passed when valid (empty flags)', () => {
    const el = makeElement()
    validateAgainstConstraints(el, 'valid')
    expect(el.internals.calls[0].anchor).toBeUndefined()
  })
})

describe('Component validation methods with mocked internals', () => {
  class ValidatedComponent extends Component {
    static preferredTagName = 'validated-component'
    static formAssociated = true
    value = ''
    content = null
  }

  let validatedComponent: ElementCreator<ValidatedComponent>

  beforeAll(() => {
    validatedComponent = ValidatedComponent.elementCreator()
  })

  test('checkValidity delegates to internals', () => {
    const el = validatedComponent()
    document.body.appendChild(el)

    const internals = mockInternals()
    ;(el as any).internals = internals

    expect(el.checkValidity()).toBe(true)

    // Make it invalid
    internals.setValidity({ valueMissing: true }, 'required')
    expect(el.checkValidity()).toBe(false)

    el.remove()
  })

  test('reportValidity delegates to internals', () => {
    const el = validatedComponent()
    document.body.appendChild(el)
    ;(el as any).internals = mockInternals()

    expect(el.reportValidity()).toBe(true)
    el.remove()
  })

  test('validity getter returns internals.validity', () => {
    const el = validatedComponent()
    document.body.appendChild(el)

    const internals = mockInternals()
    ;(el as any).internals = internals

    expect(el.validity).toBeDefined()
    expect(el.validity!.valid).toBe(true)

    internals.setValidity({ tooShort: true }, 'too short')
    expect(el.validity!.tooShort).toBe(true)
    expect(el.validity!.valid).toBe(false)

    el.remove()
  })

  test('validationMessage getter returns internals.validationMessage', () => {
    const el = validatedComponent()
    document.body.appendChild(el)

    const internals = mockInternals()
    ;(el as any).internals = internals

    expect(el.validationMessage).toBe('')

    internals.setValidity({ customError: true }, 'custom error')
    expect(el.validationMessage).toBe('custom error')

    el.remove()
  })

  test('willValidate getter returns internals.willValidate', () => {
    const el = validatedComponent()
    document.body.appendChild(el)

    const internals = mockInternals()
    ;(el as any).internals = internals

    expect(el.willValidate).toBe(true)
    el.remove()
  })

  test('setCustomValidity sets customError flag', () => {
    const el = validatedComponent()
    document.body.appendChild(el)

    const internals = mockInternals()
    ;(el as any).internals = internals

    el.setCustomValidity('This is wrong')
    expect(internals.calls.length).toBe(1)
    expect(internals.calls[0].flags.customError).toBe(true)
    expect(internals.calls[0].message).toBe('This is wrong')

    el.remove()
  })

  test('setCustomValidity with empty string clears validity', () => {
    const el = validatedComponent()
    document.body.appendChild(el)

    const internals = mockInternals()
    ;(el as any).internals = internals

    el.setCustomValidity('error')
    el.setCustomValidity('')
    expect(internals.calls[1].flags).toEqual({})

    el.remove()
  })

  test('setValidity delegates to internals', () => {
    const el = validatedComponent()
    document.body.appendChild(el)

    const internals = mockInternals()
    ;(el as any).internals = internals

    el.setValidity({ rangeOverflow: true }, 'too high', el)
    expect(internals.calls[0].flags.rangeOverflow).toBe(true)
    expect(internals.calls[0].message).toBe('too high')
    expect(internals.calls[0].anchor).toBe(el)

    el.remove()
  })

  test('setFormValue delegates to internals', () => {
    const el = validatedComponent()
    document.body.appendChild(el)

    const internals = mockInternals()
    let formValue: any
    internals.setFormValue = (v: any) => {
      formValue = v
    }
    ;(el as any).internals = internals

    el.setFormValue('test-value')
    expect(formValue).toBe('test-value')

    el.remove()
  })

  test('validateValue runs constraint validation', () => {
    const el = validatedComponent({ required: '' })
    document.body.appendChild(el)

    const internals = mockInternals()
    ;(el as any).internals = internals

    el.value = ''
    el.validateValue()
    expect(internals.calls[0].flags.valueMissing).toBe(true)

    el.value = 'filled'
    el.validateValue()
    expect(internals.calls[1].flags).toEqual({})

    el.remove()
  })

  test('validateValue with minlength constraint', () => {
    const el = validatedComponent({ minlength: '3' })
    document.body.appendChild(el)

    const internals = mockInternals()
    ;(el as any).internals = internals

    el.value = 'ab'
    el.validateValue()
    expect(internals.calls[0].flags.tooShort).toBe(true)

    el.value = 'abc'
    el.validateValue()
    expect(internals.calls[1].flags).toEqual({})

    el.remove()
  })

  test('methods gracefully handle missing internals', () => {
    const el = validatedComponent()
    document.body.appendChild(el)
    ;(el as any).internals = undefined

    // All should return defaults without throwing
    expect(el.validity).toBeUndefined()
    expect(el.validationMessage).toBe('')
    expect(el.willValidate).toBe(false)
    expect(el.checkValidity()).toBe(true)
    expect(el.reportValidity()).toBe(true)
    el.setCustomValidity('test') // should not throw
    el.setValidity({ customError: true }, 'test') // should not throw
    el.setFormValue('test') // should not throw
    el.validateValue() // should not throw

    el.remove()
  })
})
