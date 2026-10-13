/*{"parent": "component", "description": "Form validation for tosijs form-associated custom elements via ElementInternals: validity, validation messages, and constraint helpers."}*/
/*#
# Form Validation

Form validation for custom elements using `ElementInternals`.

## Overview

When building form-associated custom elements, you want them to behave like native
`<input>` elements - participating in form submission, validation, and lifecycle events.

With `static formAssociated = true` and a `value` property, your Component subclass
automatically gets:

- Form submission (value appears in FormData)
- Validation API (`checkValidity()`, `reportValidity()`, `setCustomValidity()`)
- Automatic validation for `required`, `minlength`, `maxlength`, `pattern` attributes
- Form lifecycle callbacks (reset, disabled state, browser restore)
- Focusability for validation UI

## Quick Start

Here's a minimal form-associated component:

```js
import { Component, elements } from 'tosijs'

class SimpleInput extends Component {
  static preferredTagName = 'simple-input'
  static formAssociated = true
  value = ''

  content = ({input}) => input({part: 'input', style: 'padding: 8px'})

  connectedCallback() {
    super.connectedCallback()
    this.parts.input.addEventListener('input', (e) => {
      this.value = e.target.value
    })
  }

  render() {
    super.render()
    if (this.parts.input.value !== this.value) {
      this.parts.input.value = this.value
    }
  }
}

const simpleInput = SimpleInput.elementCreator()
const { form, button, div } = elements

const output = div()
const myForm = form(
  simpleInput({name: 'username', required: true}),
  button({type: 'submit'}, 'Submit')
)
myForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const fd = new FormData(e.target)
  output.textContent = 'FormData: ' + [...fd.entries()].map(([k,v]) => `${k}=${v}`).join(', ')
})

preview.append(myForm, output)
```
```css
.preview form { display: flex; gap: 8px; align-items: center; }
.preview simple-input { display: inline-block; }
```

## Validation API

Form-associated components expose the standard validation API:

### Properties

- `validity: ValidityState` - Current validity state (readonly)
- `validationMessage: string` - Current validation message (readonly)
- `willValidate: boolean` - Whether element will be validated (readonly)

### Methods

- `checkValidity()` - Returns `true` if valid; fires `invalid` event if not
- `reportValidity()` - Like `checkValidity()` but shows browser validation UI
- `setCustomValidity(message)` - Set custom error (empty string clears)
- `setValidity(flags, message?, anchor?)` - Low-level validity control
- `setFormValue(value, state?)` - Explicitly set form value
- `validateValue()` - Run constraint validation (called automatically)

### ValidityStateFlags

When calling `setValidity()`, you can set these flags:
- `valueMissing` - required but empty
- `typeMismatch` - wrong type (email, url, etc.)
- `patternMismatch` - doesn't match pattern attribute
- `tooLong` - exceeds maxlength
- `tooShort` - below minlength
- `rangeUnderflow` / `rangeOverflow` - outside min/max range
- `stepMismatch` - doesn't match step
- `badInput` - browser can't parse input
- `customError` - custom error via setCustomValidity

## Automatic Validation

Component automatically validates against standard HTML constraint attributes
when `value` changes:

- `required` - value cannot be empty
- `minlength` - minimum string length
- `maxlength` - maximum string length
- `pattern` - regex pattern (anchored to full string)

```js
import { Component, elements } from 'tosijs'

class ValidatedInput extends Component {
  static preferredTagName = 'validated-input'
  static formAssociated = true
  value = ''

  content = ({input}) => input({part: 'input', style: 'padding: 8px'})

  connectedCallback() {
    super.connectedCallback()
    this.parts.input.addEventListener('input', (e) => {
      this.value = e.target.value
    })
  }

  render() {
    super.render()
    if (this.parts.input.value !== this.value) {
      this.parts.input.value = this.value
    }
  }
}

const validatedInput = ValidatedInput.elementCreator()
const { form, button, div } = elements

const output = div()
const myForm = form(
  validatedInput({
    name: 'code',
    required: true,
    minlength: '3',
    maxlength: '10',
    pattern: '[a-z]+'
  }),
  button({type: 'submit'}, 'Submit')
)
myForm.addEventListener('submit', (e) => {
  e.preventDefault()
  output.textContent = 'Valid! Value: ' + e.target.elements.code.value
})

preview.append(div('Enter 3-10 lowercase letters:'), myForm, output)
```
```css
.preview form { display: flex; gap: 8px; align-items: center; margin-top: 8px; }
.preview validated-input { display: inline-block; }
```

### Custom Validation

Override `validateValue()` for custom logic. Call `super.validateValue()` first
to include standard constraint validation:

    validateValue() {
      super.validateValue() // check required, minlength, etc.

      // Add custom validation
      if (this.value && !/^[a-z][a-z0-9_]*$/.test(this.value)) {
        this.setValidity(
          { patternMismatch: true },
          'Must start with letter, only lowercase letters/numbers/underscores',
          this
        )
      }
    }

## Form Lifecycle Callbacks

Component provides default implementations for form lifecycle callbacks:

### formResetCallback()

Called when the containing `<form>` is reset. Default resets `value` to
`defaultValue` or empty string.

### formDisabledCallback(disabled: boolean)

Called when the form or a parent `<fieldset>` is disabled/enabled.
Default syncs the `disabled` attribute.

### formStateRestoreCallback(state)

Called when browser restores form state (back/forward navigation).
Default restores string values.

## Custom States

Use `this.internals.states` to expose component state to CSS via `:state()`:

```js
import { Component, elements } from 'tosijs'

class StatefulInput extends Component {
  static preferredTagName = 'stateful-input'
  static formAssociated = true
  value = ''

  content = ({input}) => input({part: 'input', style: 'padding: 8px; border: 2px solid #ccc; border-radius: 4px;'})

  connectedCallback() {
    super.connectedCallback()
    const input = this.parts.input

    input.addEventListener('input', () => {
      this.value = input.value
    })

    input.addEventListener('focus', () => {
      this.internals.states.add('focused')
    })

    input.addEventListener('blur', () => {
      this.internals.states.delete('focused')
      // Show validation state on blur
      if (this.validity && !this.validity.valid) {
        this.internals.states.add('invalid')
      } else {
        this.internals.states.delete('invalid')
      }
    })
  }

  render() {
    super.render()
    if (this.parts.input.value !== this.value) {
      this.parts.input.value = this.value
    }
  }
}

const statefulInput = StatefulInput.elementCreator()
const { div } = elements

preview.append(
  div('Required, min 3 chars. Focus shows blue border, invalid on blur shows red:'),
  statefulInput({required: true, minlength: '3'})
)
```
```css
.preview stateful-input { display: block; margin-top: 8px; }
.preview stateful-input:state(focused) input { border-color: #007bff !important; outline: none; }
.preview stateful-input:state(invalid) input { border-color: #dc3545 !important; }
```

## Browser Support

`ElementInternals` is supported in all modern browsers:
- Chrome 77+, Firefox 93+, Safari 16.4+, Edge 79+

For older browsers, form-associated features gracefully degrade - the component
still works but won't participate in form submission or validation.

## See Also

- [web-components](/component/) - Component class documentation
- [MDN: ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals)
- [MDN: Form-associated custom elements](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/attachInternals)
*/

/**
 * Interface for form validation functionality.
 * This is the public API that form-associated components expose.
 */
export interface FormValidation {
  /** The ElementInternals object for form participation */
  internals?: ElementInternals

  /** The ValidityState of the element */
  readonly validity: ValidityState | undefined

  /** The validation message */
  readonly validationMessage: string

  /** Whether the element will be validated */
  readonly willValidate: boolean

  /** Returns true if valid, fires 'invalid' event if not */
  checkValidity(): boolean

  /** Like checkValidity() but also shows validation UI */
  reportValidity(): boolean

  /** Set a custom error message (empty string clears) */
  setCustomValidity(message: string): void

  /** Set validation state with optional focus anchor */
  setValidity(
    flags: ValidityStateFlags,
    message?: string,
    anchor?: HTMLElement
  ): void

  /** Update the form value */
  setFormValue(
    value: File | string | FormData | null,
    state?: File | string | FormData | null
  ): void

  /** Validate against required/minlength/maxlength/pattern attributes */
  validateValue(): void
}

/**
 * Validates a value against standard HTML constraint attributes.
 * Used by Component.validateValue() - extracted here for clarity.
 */
export function validateAgainstConstraints(
  element: HTMLElement & { internals?: ElementInternals; value?: any },
  value: string
): void {
  if (!element.internals) return

  const flags: ValidityStateFlags = {}
  let message = ''

  // required
  if (element.hasAttribute('required') && value === '') {
    flags.valueMissing = true
    message = 'Please fill out this field.'
  }

  // minlength
  const minlength = element.getAttribute('minlength')
  if (minlength && value.length < parseInt(minlength, 10)) {
    flags.tooShort = true
    message = `Please use at least ${minlength} characters.`
  }

  // maxlength
  const maxlength = element.getAttribute('maxlength')
  if (maxlength && value.length > parseInt(maxlength, 10)) {
    flags.tooLong = true
    message = `Please use no more than ${maxlength} characters.`
  }

  // pattern
  const pattern = element.getAttribute('pattern')
  if (pattern && value !== '') {
    try {
      const regex = new RegExp(`^(?:${pattern})$`)
      if (!regex.test(value)) {
        flags.patternMismatch = true
        message = 'Please match the requested format.'
      }
    } catch {
      // Invalid pattern, skip validation
    }
  }

  if (Object.keys(flags).length > 0) {
    element.internals.setValidity(flags, message, element)
  } else {
    element.internals.setValidity({})
  }
}
