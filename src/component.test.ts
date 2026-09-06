import {
  expect,
  test,
  describe,
  beforeAll,
  beforeEach,
  afterEach,
} from 'bun:test'
import type { ElementCreator } from './xin-types'
import { Component, tosiSlot, withAttributes } from './component'
import { elements } from './elements'
import { dispatch } from './dom'
import { _resetDeprecationWarnings } from './metadata'
import { tosi } from './xin-proxy'
import { updates } from './path-listener'

// Simple test component
class TestComponent extends Component {
  static preferredTagName = 'test-component'
  testProp = 'initial'
  counter = 0

  constructor() {
    super()
    this.initAttributes('testProp')
  }

  content = ({ div, span }: typeof elements) => [
    div({ part: 'container' }, span({ part: 'label' }, 'Test')),
  ]

  render() {
    super.render()
    this.counter++
  }
}

// Component with static shadowStyleSpec
class StyledComponent extends Component {
  static preferredTagName = 'styled-component'
  static shadowStyleSpec = {
    ':host': {
      display: 'block',
      padding: '10px',
    },
  }

  content = ({ div }: typeof elements) => div('Styled content')
}

// Component with value
class ValueComponent extends Component {
  static preferredTagName = 'value-component'
  value = ''

  content = ({ input }: typeof elements) =>
    input({ part: 'input', type: 'text' })

  connectedCallback() {
    super.connectedCallback()
    const { input } = this.parts as { input: HTMLInputElement }
    input.addEventListener('input', () => {
      this.value = input.value
    })
  }

  render() {
    super.render()
    const { input } = this.parts as { input: HTMLInputElement }
    if (input.value !== this.value) {
      input.value = this.value
    }
  }
}

// Component with handleResize (the current resize hook)
class ResizableComponent extends Component {
  static preferredTagName = 'resizable-component'
  resizeCount = 0

  content = ({ div }: typeof elements) => div({ part: 'box' }, 'Resizable')

  handleResize() {
    this.resizeCount++
  }
}

// Component with slots
class SlottedComponent extends Component {
  static preferredTagName = 'slotted-component'
  content = ({ div, slot }: typeof elements) => [
    div({ part: 'header' }, slot({ name: 'header' })),
    div({ part: 'main' }, slot()),
    div({ part: 'footer' }, slot({ name: 'footer' })),
  ]
}

// Component with null content
class EmptyComponent extends Component {
  static preferredTagName = 'empty-component'
  content = null
}

// Component with function content that uses props
class DynamicComponent extends Component {
  static preferredTagName = 'dynamic-component'
  greeting = 'Hello'

  constructor() {
    super()
    this.initAttributes('greeting')
  }

  content = ({ div }: typeof elements) =>
    div({ part: 'message' }, this.greeting)
}

// Shadow-DOM component with a part — for hydration / parts-poisoning coverage
class ShadowPartComponent extends Component {
  static preferredTagName = 'shadow-part-component'
  static shadowStyleSpec = {
    ':host': { display: 'block' },
  }
  content = ({ div }: typeof elements) => div({ part: 'box' }, 'boxed')
}

let testComponent: ElementCreator<TestComponent>
let styledComponent: ElementCreator<StyledComponent>
let valueComponent: ElementCreator<ValueComponent>
let resizableComponent: ElementCreator<ResizableComponent>
let slottedComponent: ElementCreator<SlottedComponent>
let emptyComponent: ElementCreator<EmptyComponent>
let dynamicComponent: ElementCreator<DynamicComponent>

beforeAll(() => {
  testComponent = TestComponent.elementCreator()
  styledComponent = StyledComponent.elementCreator()
  valueComponent = ValueComponent.elementCreator()
  resizableComponent = ResizableComponent.elementCreator()
  slottedComponent = SlottedComponent.elementCreator()
  emptyComponent = EmptyComponent.elementCreator()
  dynamicComponent = DynamicComponent.elementCreator()
})

describe('Component', () => {
  describe('elementCreator', () => {
    test('creates element with specified tag', () => {
      const el = testComponent()
      expect(el.tagName.toLowerCase()).toBe('test-component')
    })

    test('creates unique tag if not specified', () => {
      class AnonComponent extends Component {}
      const creator = AnonComponent.elementCreator()
      const el = creator()
      expect(el.tagName.toLowerCase()).toMatch(/^(anon-component|custom-elt)/)
    })

    test('static tagName is set after elementCreator', () => {
      expect(TestComponent.tagName).toBe('test-component')
    })

    test('returns same creator on subsequent calls', () => {
      const creator1 = TestComponent.elementCreator()
      const creator2 = TestComponent.elementCreator()
      expect(creator1).toBe(creator2)
    })
  })

  describe('lifecycle', () => {
    test('constructor sets instanceId', () => {
      const el = testComponent()
      expect(el.instanceId).toMatch(/^test-component-\d+$/)
    })

    test('connectedCallback hydrates content', () => {
      const el = testComponent()
      document.body.appendChild(el)
      expect(el.querySelector('[part="container"]')).not.toBeNull()
      expect(el.querySelector('[part="label"]')).not.toBeNull()
      el.remove()
    })

    test('render is called after connection', async () => {
      const el = testComponent()
      expect(el.counter).toBe(0)
      document.body.appendChild(el)
      // Wait for requestAnimationFrame
      await new Promise((resolve) => requestAnimationFrame(resolve))
      expect(el.counter).toBeGreaterThan(0)
      el.remove()
    })

    test('disconnectedCallback cleans up', () => {
      const el = resizableComponent()
      document.body.appendChild(el)
      el.remove()
      // No error means cleanup worked
      expect(true).toBe(true)
    })
  })

  describe('initAttributes', () => {
    test('initializes attribute from property default', () => {
      const el = testComponent()
      expect(el.testProp).toBe('initial')
    })

    test('reads attribute from DOM', () => {
      const el = testComponent({ testProp: 'from-attr' })
      document.body.appendChild(el)
      expect(el.testProp).toBe('from-attr')
      el.remove()
    })

    test('setting property updates attribute', () => {
      const el = testComponent()
      document.body.appendChild(el)
      el.testProp = 'updated'
      expect(el.getAttribute('test-prop')).toBe('updated')
      el.remove()
    })

    test('boolean attributes work correctly', () => {
      const el = testComponent()
      document.body.appendChild(el)
      el.hidden = true
      expect(el.hasAttribute('hidden')).toBe(true)
      el.hidden = false
      expect(el.hasAttribute('hidden')).toBe(false)
      el.remove()
    })
  })

  describe('parts', () => {
    test('provides access to elements by part attribute', () => {
      const el = testComponent()
      document.body.appendChild(el)
      const container = el.parts.container
      expect(container).toBeInstanceOf(HTMLDivElement)
      el.remove()
    })

    test('provides access to elements by CSS selector', () => {
      const el = testComponent()
      document.body.appendChild(el)
      const span = el.parts.span
      expect(span).toBeInstanceOf(HTMLSpanElement)
      el.remove()
    })

    test('throws error for non-existent ref', () => {
      const el = testComponent()
      document.body.appendChild(el)
      expect(() => el.parts.nonexistent).toThrow()
      el.remove()
    })

    test('memoizes part lookups', () => {
      const el = testComponent()
      document.body.appendChild(el)
      const container1 = el.parts.container
      const container2 = el.parts.container
      expect(container1).toBe(container2)
      el.remove()
    })

    test('an early parts read does not poison the proxy after hydration', () => {
      const el = ShadowPartComponent.elementCreator()()
      // Pre-hydration there is no shadow root and no content, so this read
      // finds nothing and throws — but it must not permanently bind the proxy
      // to the light DOM (the bug in tosijs#13).
      expect(el.shadowRoot).toBeNull()
      expect(() => el.parts.box).toThrow()
      document.body.appendChild(el)
      // Hydration attaches the shadow root; the part now resolves from it.
      expect(el.shadowRoot).not.toBeNull()
      expect(el.parts.box).toBeInstanceOf(HTMLDivElement)
      el.remove()
    })
  })

  describe('hydration', () => {
    test('hydrated flips false -> true on connect', () => {
      const el = ShadowPartComponent.elementCreator()()
      expect(el.hydrated).toBe(false)
      document.body.appendChild(el)
      expect(el.hydrated).toBe(true)
      el.remove()
    })

    test('whenHydrated resolves once connected', async () => {
      const el = ShadowPartComponent.elementCreator()()
      let resolved = false
      const pending = el.whenHydrated.then(() => {
        resolved = true
      })
      expect(resolved).toBe(false)
      document.body.appendChild(el)
      await pending
      expect(resolved).toBe(true)
      el.remove()
    })

    test('whenHydrated resolves immediately when already hydrated', async () => {
      const el = ShadowPartComponent.elementCreator()()
      document.body.appendChild(el)
      expect(el.hydrated).toBe(true)
      // Must not hang — an already-hydrated element resolves at once.
      await el.whenHydrated
      el.remove()
    })
  })

  describe('queueRender', () => {
    test('queues render via requestAnimationFrame', async () => {
      const el = testComponent()
      document.body.appendChild(el)
      await new Promise((resolve) => requestAnimationFrame(resolve))
      const initialCount = el.counter
      el.queueRender()
      await new Promise((resolve) => requestAnimationFrame(resolve))
      expect(el.counter).toBe(initialCount + 1)
      el.remove()
    })

    test('triggers change event when requested', async () => {
      const el = testComponent()
      document.body.appendChild(el)
      await new Promise((resolve) => requestAnimationFrame(resolve))
      let changeTriggered = false
      el.addEventListener('change', () => {
        changeTriggered = true
      })
      el.queueRender(true)
      await new Promise((resolve) => requestAnimationFrame(resolve))
      expect(changeTriggered).toBe(true)
      el.remove()
    })

    test('batches multiple queueRender calls', async () => {
      const el = testComponent()
      document.body.appendChild(el)
      await new Promise((resolve) => requestAnimationFrame(resolve))
      const initialCount = el.counter
      el.queueRender()
      el.queueRender()
      el.queueRender()
      await new Promise((resolve) => requestAnimationFrame(resolve))
      expect(el.counter).toBe(initialCount + 1)
      el.remove()
    })
  })

  describe('value property', () => {
    test('initializes value from property', () => {
      const el = valueComponent()
      expect(el.value).toBe('')
    })

    test('setting value triggers change event', async () => {
      const el = valueComponent()
      document.body.appendChild(el)
      await new Promise((resolve) => requestAnimationFrame(resolve))
      let changeTriggered = false
      el.addEventListener('change', () => {
        changeTriggered = true
      })
      el.value = 'new value'
      await new Promise((resolve) => requestAnimationFrame(resolve))
      expect(changeTriggered).toBe(true)
      el.remove()
    })
  })

  describe('content', () => {
    test('null content creates empty component', () => {
      const el = emptyComponent()
      document.body.appendChild(el)
      expect(el.children.length).toBe(0)
      el.remove()
    })

    test('function content is evaluated', () => {
      const el = dynamicComponent({ greeting: 'Hi there' })
      document.body.appendChild(el)
      const message = el.querySelector('[part="message"]')
      expect(message?.textContent).toBe('Hi there')
      el.remove()
    })
  })

  describe('slots (tosi-slot)', () => {
    test('creates tosi-slot elements', () => {
      const el = slottedComponent()
      document.body.appendChild(el)
      const slots = el.querySelectorAll('tosi-slot')
      expect(slots.length).toBe(3)
      el.remove()
    })

    test('named slots receive slotted content', () => {
      const { div } = elements
      const el = slottedComponent(
        div({ slot: 'header' }, 'Header Content'),
        div('Main Content'),
        div({ slot: 'footer' }, 'Footer Content')
      )
      document.body.appendChild(el)

      const headerSlot = el.querySelector('tosi-slot[name="header"]')
      const footerSlot = el.querySelector('tosi-slot[name="footer"]')

      expect(headerSlot?.textContent).toContain('Header Content')
      expect(footerSlot?.textContent).toContain('Footer Content')
      el.remove()
    })

    test('default slot receives unslotted content', () => {
      const { div } = elements
      const el = slottedComponent(div('Default Content'))
      document.body.appendChild(el)

      const defaultSlot = el.querySelector('tosi-slot:not([name])')
      expect(defaultSlot?.textContent).toContain('Default Content')
      el.remove()
    })
  })

  describe('shadowStyleSpec', () => {
    test('static shadowStyleSpec creates shadow DOM', () => {
      const el = styledComponent()
      document.body.appendChild(el)
      expect(el.shadowRoot).not.toBeNull()
      el.remove()
    })

    test('shadow DOM contains style element', () => {
      const el = styledComponent()
      document.body.appendChild(el)
      const style = el.shadowRoot?.querySelector('style')
      expect(style).not.toBeNull()
      expect(style?.textContent).toContain('display')
      el.remove()
    })
  })

  describe('Component.elements', () => {
    test('provides access to elements proxy', () => {
      expect(Component.elements).toBe(elements)
      expect(typeof Component.elements.div).toBe('function')
    })
  })
})

describe('tosiSlot', () => {
  test('creates tosi-slot element', () => {
    const slot = tosiSlot()
    expect(slot.tagName.toLowerCase()).toBe('tosi-slot')
  })

  test('accepts name attribute', () => {
    const slot = tosiSlot({ name: 'test-slot' })
    document.body.appendChild(slot)
    expect(slot.getAttribute('name')).toBe('test-slot')
    slot.remove()
  })
})

describe('xinSlot (deprecated, removed in 2.0)', () => {
  test('it still works, warns, and creates a tosi-slot', async () => {
    const api = (await import('./index')) as Record<string, any>
    expect(typeof api.xinSlot).toBe('function')
    const { _resetDeprecationWarnings } = await import('./metadata')
    _resetDeprecationWarnings()
    const warnings: string[] = []
    const original = console.warn
    console.warn = (...args: any[]) => warnings.push(args.map(String).join(' '))
    let slot: any
    try {
      slot = api.xinSlot({ name: 'top' })
    } finally {
      console.warn = original
    }
    expect(slot.tagName.toLowerCase()).toBe('tosi-slot')
    document.body.append(slot) // attrs drain on connect
    expect(slot.getAttribute('name')).toBe('top')
    slot.remove()
    expect(warnings.some((w) => w.includes('REMOVED IN 2.0'))).toBe(true)
    // the legacy TAG is registered as a TOMBSTONE. Leaving it unregistered
    // while hydrate still queried for it was the worst of both worlds: an
    // unupgraded <xin-slot> had no `.name`, filed under slotMap[undefined],
    // and dropped its children onto the host — silently (round-3 review).
    expect(customElements.get('xin-slot')).toBeDefined()
  })
})

// Tests for static initAttributes
describe('static initAttributes', () => {
  class StaticAttrsComponent extends Component {
    static preferredTagName = 'static-attrs-component'
    static initAttributes = {
      caption: 'default',
      count: 42,
      disabled: false,
    }

    content = ({ div }: typeof elements) => div({ part: 'content' })
  }

  let staticAttrsComponent: ReturnType<
    typeof StaticAttrsComponent.elementCreator
  >

  beforeAll(() => {
    staticAttrsComponent = StaticAttrsComponent.elementCreator()
  })

  test('observedAttributes is auto-generated from initAttributes', () => {
    const observed = StaticAttrsComponent.observedAttributes
    expect(observed).toContain('hidden')
    expect(observed).toContain('caption')
    expect(observed).toContain('count')
    expect(observed).toContain('disabled')
  })

  test('string attribute has correct default', () => {
    const el = staticAttrsComponent()
    document.body.appendChild(el)
    expect(el.caption).toBe('default')
    el.remove()
  })

  test('string attribute syncs with DOM', () => {
    const el = staticAttrsComponent({ caption: 'from-attr' })
    document.body.appendChild(el)
    expect(el.caption).toBe('from-attr')
    expect(el.getAttribute('caption')).toBe('from-attr')
    el.remove()
  })

  test('string attribute can be set via property', () => {
    const el = staticAttrsComponent()
    document.body.appendChild(el)
    el.caption = 'updated'
    expect(el.getAttribute('caption')).toBe('updated')
    el.remove()
  })

  test('number attribute has correct default', () => {
    const el = staticAttrsComponent()
    document.body.appendChild(el)
    expect(el.count).toBe(42)
    el.remove()
  })

  test('number attribute is parsed from DOM', () => {
    const el = staticAttrsComponent()
    document.body.appendChild(el)
    el.setAttribute('count', '100')
    expect(el.count).toBe(100)
    el.remove()
  })

  test('boolean attribute defaults to false', () => {
    const el = staticAttrsComponent()
    document.body.appendChild(el)
    expect(el.disabled).toBe(false)
    el.remove()
  })

  test('boolean attribute true when present', () => {
    const el = staticAttrsComponent({ disabled: true })
    document.body.appendChild(el)
    expect(el.disabled).toBe(true)
    expect(el.hasAttribute('disabled')).toBe(true)
    el.remove()
  })

  test('boolean attribute toggled via property', () => {
    const el = staticAttrsComponent()
    document.body.appendChild(el)
    el.disabled = true
    expect(el.hasAttribute('disabled')).toBe(true)
    el.disabled = false
    expect(el.hasAttribute('disabled')).toBe(false)
    el.remove()
  })

  test('warns when value is used in initAttributes', () => {
    const warnings: string[] = []
    const originalWarn = console.warn
    console.warn = (msg: string) => warnings.push(msg)

    class BadValueComponent extends Component {
      static preferredTagName = 'bad-value-component'
      static initAttributes = { value: 'bad' }
    }
    BadValueComponent.elementCreator()()

    console.warn = originalWarn
    expect(
      warnings.some(
        (w) => w.includes('value') && w.includes('cannot be an attribute')
      )
    ).toBe(true)
  })

  test('boolean attribute defaulting to true throws with an explanation', () => {
    // HTML boolean attributes are false-by-default; a true default silently
    // becomes false, so declaring one is a hard error.
    class BoolTrueComponent extends Component {
      static preferredTagName = 'bool-true-component'
      static initAttributes = { open: true }
    }
    const create = BoolTrueComponent.elementCreator()
    expect(() => create()).toThrow(/boolean attribute to true/)
    try {
      create()
    } catch (e) {
      // the message should explain the HTML semantics and point at the fix
      expect((e as Error).message).toContain('false-by-default')
      expect((e as Error).message).toContain('{ open: false }')
    }
  })

  test('boolean attribute defaulting to false is fine', () => {
    class BoolFalseComponent extends Component {
      static preferredTagName = 'bool-false-component'
      static initAttributes = { open: false }
    }
    const el = BoolFalseComponent.elementCreator()() as any
    document.body.appendChild(el)
    expect(el.open).toBe(false)
    el.remove()
  })
})

// Tests for light DOM :host selector rewriting
describe('light DOM :host rewriting', () => {
  class HostRewriteComponent extends Component {
    static preferredTagName = 'host-rewrite-test'
    static lightStyleSpec = {
      ':host': { display: 'block' },
    }
    content = ({ div }: typeof elements) => div('host rewrite test')
  }

  test(':host is replaced with tagName', () => {
    const creator = HostRewriteComponent.elementCreator()
    const el = creator()
    document.body.appendChild(el)
    const style = document.getElementById('host-rewrite-test-component')
    expect(style).not.toBeNull()
    expect(style?.textContent).toContain('host-rewrite-test')
    expect(style?.textContent).not.toContain(':host')
    el.remove()
  })

  class HostParenComponent extends Component {
    static preferredTagName = 'host-paren-test'
    static lightStyleSpec = {
      ':host(.active)': { color: 'red' },
      ':host(.active) > span': { fontWeight: 'bold' },
    }
    content = ({ div }: typeof elements) => div('host paren test')
  }

  test(':host(.foo) is replaced with tagName.foo', () => {
    const creator = HostParenComponent.elementCreator()
    const el = creator()
    document.body.appendChild(el)
    const style = document.getElementById('host-paren-test-component')
    expect(style).not.toBeNull()
    expect(style?.textContent).toContain('host-paren-test.active')
    expect(style?.textContent).not.toContain(':host')
    expect(style?.textContent).toContain('host-paren-test.active > span')
    el.remove()
  })
})

// Tests for formAssociated / ElementInternals
describe('formAssociated', () => {
  class FormComponent extends Component {
    static preferredTagName = 'form-component'
    static formAssociated = true
    value = '' // value is a property, not an attribute

    content = ({ input }: typeof elements) => input({ part: 'input' })
  }

  let formComponent: ElementCreator<FormComponent>

  beforeAll(() => {
    formComponent = FormComponent.elementCreator()
  })

  test('has internals when formAssociated is true (if supported)', () => {
    const el = formComponent()
    document.body.appendChild(el)
    // Happy DOM doesn't support attachInternals, so internals may be undefined
    if (typeof HTMLElement.prototype.attachInternals === 'function') {
      expect(el.internals).toBeDefined()
    } else {
      expect(el.internals).toBeUndefined()
    }
    el.remove()
  })

  test('formAssociated component is focusable by default', () => {
    const el = formComponent()
    document.body.appendChild(el)
    expect(el.getAttribute('tabindex')).toBe('0')
    el.remove()
  })

  test('formAssociated component respects explicit tabindex', () => {
    const el = formComponent({ tabindex: '-1' })
    document.body.appendChild(el)
    expect(el.getAttribute('tabindex')).toBe('-1')
    el.remove()
  })

  test('component works even without internals support', () => {
    const el = formComponent()
    document.body.appendChild(el)
    // Should not throw, value should work
    el.value = 'test'
    expect(el.value).toBe('test')
    el.remove()
  })

  test('form element survives being moved between forms', () => {
    const { form } = elements
    const form1 = form({ id: 'form1' })
    const form2 = form({ id: 'form2' })
    document.body.appendChild(form1)
    document.body.appendChild(form2)

    const el = formComponent()
    form1.appendChild(el)
    el.value = 'initial'
    expect(el.value).toBe('initial')

    // Move to second form
    form2.appendChild(el)
    expect(el.value).toBe('initial') // Value should persist
    el.value = 'updated'
    expect(el.value).toBe('updated')

    // Move back to first form
    form1.appendChild(el)
    expect(el.value).toBe('updated')

    // Clean up
    form1.remove()
    form2.remove()
  })

  test('form element survives removal and re-insertion', () => {
    const { form } = elements
    const form1 = form({ id: 'form-reinsert' })
    document.body.appendChild(form1)

    const el = formComponent()
    form1.appendChild(el)
    el.value = 'before-remove'

    // Remove from DOM
    el.remove()
    expect(el.value).toBe('before-remove')

    // Re-insert
    form1.appendChild(el)
    expect(el.value).toBe('before-remove')
    el.value = 'after-reinsert'
    expect(el.value).toBe('after-reinsert')

    form1.remove()
  })

  test('_valueChanged flag is set when value changes', () => {
    const el = formComponent()
    document.body.appendChild(el)
    expect((el as any)._valueChanged).toBe(false)
    el.value = 'new value'
    expect((el as any)._valueChanged).toBe(true)
    el.remove()
  })

  test('_valueChanged flag is cleared after render', async () => {
    const el = formComponent()
    document.body.appendChild(el)
    el.value = 'trigger render'
    expect((el as any)._valueChanged).toBe(true)
    // Wait for rAF to fire
    await new Promise((r) => requestAnimationFrame(r))
    expect((el as any)._valueChanged).toBe(false)
    el.remove()
  })

  test('_valueChanged flag not set on attribute-only changes', () => {
    const el = formComponent()
    document.body.appendChild(el)
    expect((el as any)._valueChanged).toBe(false)
    el.setAttribute('data-test', 'foo')
    expect((el as any)._valueChanged).toBe(false)
    el.remove()
  })
})

// Tests for new static properties
describe('static preferredTagName', () => {
  test('uses preferredTagName for registration', () => {
    class PreferredTagComponent extends Component {
      static preferredTagName = 'preferred-tag-test'
      content = null
    }
    const creator = PreferredTagComponent.elementCreator()
    const el = creator()
    expect(el.tagName.toLowerCase()).toBe('preferred-tag-test')
  })

  test('falls back to anon tag when no preferredTagName and anonymous class', () => {
    const AnonClass = class extends Component {
      content = null
    }
    // Force anonymous by clearing name
    Object.defineProperty(AnonClass, 'name', { value: '' })
    const creator = AnonClass.elementCreator()
    const el = creator()
    expect(el.tagName.toLowerCase()).toMatch(/^custom-elt/)
  })
})

describe('static shadowStyleSpec', () => {
  test('creates shadow DOM with style', () => {
    class ShadowStyleComponent extends Component {
      static preferredTagName = 'shadow-style-test'
      static shadowStyleSpec = {
        ':host': { display: 'flex' },
      }
      content = ({ div }: typeof elements) => div('shadow styled')
    }
    const creator = ShadowStyleComponent.elementCreator()
    const el = creator()
    document.body.appendChild(el)
    expect(el.shadowRoot).not.toBeNull()
    const style = el.shadowRoot?.querySelector('style')
    expect(style).not.toBeNull()
    expect(style?.textContent).toContain('display')
    el.remove()
  })
})

describe('static lightStyleSpec', () => {
  test('creates global style in head', () => {
    class LightStyleComponent extends Component {
      static preferredTagName = 'light-style-test'
      static lightStyleSpec = {
        ':host': { display: 'grid' },
      }
      content = ({ div }: typeof elements) => div('light styled')
    }
    const creator = LightStyleComponent.elementCreator()
    const el = creator()
    document.body.appendChild(el)
    const style = document.getElementById('light-style-test-component')
    expect(style).not.toBeNull()
    expect(style?.textContent).toContain('light-style-test')
    expect(style?.textContent).toContain('display')
    expect(style?.textContent).not.toContain(':host')
    el.remove()
  })
})

describe('deprecated elementCreator options', () => {
  test('tag option still works with deprecation warning', () => {
    class LegacyTagComponent extends Component {
      content = null
    }
    const warnings: string[] = []
    const originalWarn = console.warn
    // warnings fire once per PROCESS — if any earlier test file (order is
    // not deterministic across machines: this passed locally, failed in CI)
    // triggered this deprecation, the spy would see nothing
    _resetDeprecationWarnings()
    console.warn = (msg: string) => warnings.push(String(msg))
    const creator = LegacyTagComponent.elementCreator({
      tag: 'legacy-tag-test',
    })
    console.warn = originalWarn
    const el = creator()
    expect(el.tagName.toLowerCase()).toBe('legacy-tag-test')
    expect(
      warnings.some((w) => w.includes('deprecated') && w.includes('tag'))
    ).toBe(true)
  })

  test('styleSpec option still works with deprecation warning', () => {
    class LegacyStyleComponent extends Component {
      content = ({ div }: typeof elements) => div('legacy styled')
    }
    const warnings: string[] = []
    const originalWarn = console.warn
    _resetDeprecationWarnings() // once-per-process — see the tag test above
    console.warn = (msg: string) => warnings.push(String(msg))
    const creator = LegacyStyleComponent.elementCreator({
      tag: 'legacy-style-test',
      styleSpec: { ':host': { display: 'block' } },
    })
    console.warn = originalWarn
    const el = creator()
    document.body.appendChild(el)
    const style = document.getElementById('legacy-style-test-component')
    expect(style).not.toBeNull()
    expect(
      warnings.some((w) => w.includes('deprecated') && w.includes('styleSpec'))
    ).toBe(true)
    el.remove()
  })
})

describe('content array with ElementProps on host', () => {
  test('event handler on host via content array', () => {
    let clicked = false
    class ClickHostComponent extends Component {
      static preferredTagName = 'click-host-test'
      content = ({ div }: typeof elements) => [
        {
          onClick: () => {
            clicked = true
          },
        },
        div('child'),
      ]
    }
    const creator = ClickHostComponent.elementCreator()
    const el = creator()
    document.body.appendChild(el)
    dispatch(el, 'click')
    expect(clicked).toBe(true)
    el.remove()
  })

  test('style applied to host via content array', () => {
    class StyleHostComponent extends Component {
      static preferredTagName = 'style-host-test'
      content = ({ div }: typeof elements) => [
        { style: { display: 'flex', gap: '10px' } },
        div('child'),
      ]
    }
    const creator = StyleHostComponent.elementCreator()
    const el = creator()
    document.body.appendChild(el)
    expect(el.style.display).toBe('flex')
    expect(el.style.gap).toBe('10px')
    el.remove()
  })

  test('multiple ElementProps objects are merged', () => {
    let count = 0
    class MergePropsComponent extends Component {
      static preferredTagName = 'merge-props-test'
      content = ({ div }: typeof elements) => [
        {
          class: 'first',
          onClick: () => {
            count++
          },
        },
        div('child'),
        { class: 'second' },
      ]
    }
    const creator = MergePropsComponent.elementCreator()
    const el = creator()
    document.body.appendChild(el)
    // Later props override earlier ones
    expect(el.className).toContain('second')
    // But event handler from first props still works
    dispatch(el, 'click')
    expect(count).toBe(1)
    el.remove()
  })

  test('children are still appended correctly', () => {
    class MixedContentComponent extends Component {
      static preferredTagName = 'mixed-content-test'
      content = ({ div, span }: typeof elements) => [
        { style: { display: 'grid' } },
        div({ part: 'a' }, 'first'),
        span({ part: 'b' }, 'second'),
      ]
    }
    const creator = MixedContentComponent.elementCreator()
    const el = creator()
    document.body.appendChild(el)
    expect(el.querySelector('[part="a"]')).not.toBeNull()
    expect(el.querySelector('[part="b"]')).not.toBeNull()
    expect(el.children.length).toBe(2)
    el.remove()
  })

  test('content array with no ElementProps works as before', () => {
    class PlainArrayComponent extends Component {
      static preferredTagName = 'plain-array-test'
      content = ({ div, span }: typeof elements) => [div('one'), span('two')]
    }
    const creator = PlainArrayComponent.elementCreator()
    const el = creator()
    document.body.appendChild(el)
    expect(el.children.length).toBe(2)
    el.remove()
  })
})

// The custom-elements spec forbids constructors from "gaining attributes."
// Property setters generated by `static initAttributes` reflect to attributes
// via setAttribute, so any property assignment during construction (class
// field initializer or constructor body) used to violate the spec.
describe('constructor must not gain attributes', () => {
  // Spy on HTMLElement.prototype.setAttribute for the duration of a sync block,
  // capturing only calls made against instances of `match`.
  function captureProtoSetAttribute<T>(
    match: (el: HTMLElement) => boolean,
    fn: () => T
  ): { result: T; calls: Array<[string, string]> } {
    const calls: Array<[string, string]> = []
    const orig = HTMLElement.prototype.setAttribute
    HTMLElement.prototype.setAttribute = function (
      name: string,
      value: string
    ) {
      if (match(this)) calls.push([name, String(value)])
      return orig.call(this, name, value)
    }
    try {
      return { result: fn(), calls }
    } finally {
      HTMLElement.prototype.setAttribute = orig
    }
  }

  test('property assignment during constructor does not call setAttribute synchronously', () => {
    class CtorAssignComponent extends Component {
      static preferredTagName = 'ctor-assign-test'
      static initAttributes = { foo: 'default-foo', count: 0 }
      constructor() {
        super()
        // simulates user code in subclass constructor / class-field initializer
        ;(this as any).foo = 'set-during-construction'
        ;(this as any).count = 42
      }
    }
    CtorAssignComponent.elementCreator()

    const { result: el, calls } = captureProtoSetAttribute(
      (e) => e instanceof CtorAssignComponent,
      () => new CtorAssignComponent()
    )

    expect(calls).toEqual([])
    // sanity: the JS-side values are observable via the property getters even
    // before the deferred reflection runs
    expect((el as any).foo).toBe('set-during-construction')
    expect((el as any).count).toBe(42)
  })

  test('attribute reflection is deferred during construction and applied after', async () => {
    class DrainComponent extends Component {
      static preferredTagName = 'drain-test'
      static initAttributes = { foo: 'default-foo' }
      constructor() {
        super()
        ;(this as any).foo = 'queued-value'
      }
    }
    DrainComponent.elementCreator()

    const el = new DrainComponent()
    // Pre-fix: the setter already ran setAttribute synchronously, so the
    // DOM attribute is present immediately. Post-fix: deferred until drain.
    expect(el.hasAttribute('foo')).toBe(false)
    // Microtask drain flushes the queue.
    await Promise.resolve()
    expect(el.getAttribute('foo')).toBe('queued-value')
  })

  test('drain skips attributes already present (parser-wins policy)', async () => {
    // Happy DOM does not actually re-prototype existing markup elements when
    // customElements.define runs, so we cannot exercise the real parser
    // upgrade path here. Instead simulate the resulting state: a constructor
    // queues a default reflection, but the attribute is already set by the
    // time the drain runs (as the parser would have done). The drain's
    // hasAttribute guard must skip rather than clobber.
    class ParserWinsComponent extends Component {
      static preferredTagName = 'parser-wins-policy'
      static initAttributes = { foo: 'default-foo' }
      constructor() {
        super()
        ;(this as any).foo = 'queued-default'
      }
    }
    ParserWinsComponent.elementCreator()

    const el = new ParserWinsComponent()
    // Bypass any per-instance mask the fix installs and write directly to
    // the DOM, the way the parser would have done before upgrade.
    HTMLElement.prototype.setAttribute.call(el, 'foo', 'parser-value')
    await Promise.resolve()
    expect(el.getAttribute('foo')).toBe('parser-value')
  })

  // Regression (1.6.x): an attribute set via its property between createElement
  // and a *synchronous* append was queued (masked) but not yet reflected to the
  // DOM when the subclass's connectedCallback ran — so early lifecycle work in
  // the subclass (asset loading, `sceneReady`) that read the attribute saw the
  // empty default and never retried. The drain must happen before the subclass
  // connectedCallback body, regardless of when it calls super.
  test('subclass connectedCallback sees attribute set before synchronous append', () => {
    class NpcBiped extends Component {
      static preferredTagName = 'npc-biped'
      static initAttributes = { url: '' }
      urlViaGetAttribute?: string
      urlViaProperty?: string
      connectedCallback() {
        // Subclass reads the attribute BEFORE calling super — the regression
        // surface. Both the DOM attribute and the property must be populated.
        this.urlViaGetAttribute = this.getAttribute('url') ?? ''
        this.urlViaProperty = (this as any).url
        super.connectedCallback()
      }
    }
    NpcBiped.elementCreator()

    const el = document.createElement('npc-biped') as NpcBiped
    // Queued during the masked window (mask not drained until connect/microtask)
    ;(el as any).url = '/omnidude.glb'
    expect(el.hasAttribute('url')).toBe(false) // still queued pre-connect
    document.body.append(el) // synchronous connect

    expect(el.urlViaGetAttribute).toBe('/omnidude.glb')
    expect(el.urlViaProperty).toBe('/omnidude.glb')
    expect(el.getAttribute('url')).toBe('/omnidude.glb')
    el.remove()
  })

  // Even a subclass that does its work before (or without) calling super must
  // see drained attributes — the wrap drains ahead of the subclass body.
  test('drain precedes subclass connectedCallback even when super is not called first', () => {
    const seen: string[] = []
    class EarlyReader extends Component {
      static preferredTagName = 'early-reader'
      static initAttributes = { label: 'default-label' }
      connectedCallback() {
        seen.push(this.getAttribute('label') ?? '<null>')
        super.connectedCallback()
      }
    }
    EarlyReader.elementCreator()

    const el = document.createElement('early-reader')
    ;(el as any).label = 'set-before-append'
    document.body.append(el)

    expect(seen).toEqual(['set-before-append'])
    el.remove()
  })

  // The wrap must not defeat the deferral: assigning during construction still
  // does NOT reflect to the DOM synchronously (no Chrome "gained attributes"
  // warning). Guards against a regression where the wrap drained too eagerly.
  test('wrap does not cause constructor-time reflection', () => {
    class StillDeferred extends Component {
      static preferredTagName = 'still-deferred'
      static initAttributes = { foo: 'default-foo' }
      constructor() {
        super()
        ;(this as any).foo = 'ctor-value'
      }
    }
    StillDeferred.elementCreator()

    const { result: el, calls } = captureProtoSetAttribute(
      (e) => e instanceof StillDeferred,
      () => new StillDeferred()
    )
    expect(calls).toEqual([]) // nothing reflected during construction
    expect((el as any).foo).toBe('ctor-value') // but readable via property
  })
})

describe('on<Event> member collision warning', () => {
  async function captureWarnings(fn: () => void): Promise<string[]> {
    const warnings: string[] = []
    const orig = console.warn
    console.warn = (m: string) => warnings.push(m)
    try {
      fn()
      await Promise.resolve() // let the deferred (microtask) scan run
    } finally {
      console.warn = orig
    }
    return warnings
  }

  test('warns when a component defines on<Event> members (shadowed by event sugar)', async () => {
    class HandlerCollisionComponent extends Component {
      static preferredTagName = 'handler-collision-component'
      onClick = (): void => {} // arrow field
      onMousedown(): void {} // prototype method
    }
    const warnings = await captureWarnings(() =>
      HandlerCollisionComponent.elementCreator()()
    )
    const w = warnings.find((m) => m.includes('event-handler sugar'))
    expect(w).toBeDefined()
    expect(w).toContain("'onClick'")
    expect(w).toContain("'onMousedown'")
    // suggests both conventions, by intent: handler function vs listener-adder
    expect(w).toContain('handle<Event>')
    expect(w).toContain('add<Event>Listener')
  })

  test('does not warn for handleResize (current resize hook), and wires it', async () => {
    let resized = 0
    class HandleResizeComponent extends Component {
      static preferredTagName = 'handle-resize-component'
      handleResize(): void {
        resized++
      }
    }
    const create = HandleResizeComponent.elementCreator()
    const warnings = await captureWarnings(() => create())
    expect(warnings.some((m) => m.includes('event-handler sugar'))).toBe(false)
    expect(warnings.some((m) => m.includes('deprecated'))).toBe(false)
    // wired: a resize event invokes the handler
    const el = create()
    document.body.appendChild(el)
    el.dispatchEvent(new Event('resize'))
    expect(resized).toBeGreaterThan(0)
    el.remove()
  })

  test('onResize is deprecated (warns) but still wired', async () => {
    let resized = 0
    class LegacyResizeComponent extends Component {
      static preferredTagName = 'legacy-resize-component'
      onResize(): void {
        resized++
      }
    }
    const create = LegacyResizeComponent.elementCreator()
    const warnings = await captureWarnings(() => create())
    const w = warnings.find((m) => m.includes('deprecated'))
    expect(w).toBeDefined()
    expect(w).toContain("'onResize'")
    expect(w).toContain('handleResize')
    // legacy hook still works
    const el = create()
    document.body.appendChild(el)
    el.dispatchEvent(new Event('resize'))
    expect(resized).toBeGreaterThan(0)
    el.remove()
  })

  test('does not warn for a component with no on<Event> members', async () => {
    class CleanComponent extends Component {
      static preferredTagName = 'clean-component'
      handleClick(): void {}
    }
    const warnings = await captureWarnings(() =>
      CleanComponent.elementCreator()()
    )
    expect(warnings.some((m) => m.includes('event-handler sugar'))).toBe(false)
  })
})

describe('shadow-DOM binding boundary warning', () => {
  test('bind/on sugar in shadow content warns once per class at hydrate', async () => {
    class ShadowBoundComponent extends Component {
      static preferredTagName = 'shadow-bound-warn'
      static shadowStyleSpec = { ':host': { display: 'block' } }
      content = ({ div }: typeof elements) =>
        div({ bindText: 'shadowWarnTest.label' })
    }
    const warnings: string[] = []
    const origWarn = console.warn
    console.warn = (...args: any[]) => {
      warnings.push(args.map(String).join(' '))
    }
    try {
      const create = ShadowBoundComponent.elementCreator()
      const el = create()
      document.body.append(el)
      const el2 = create()
      document.body.append(el2)
      el.remove()
      el2.remove()
    } finally {
      console.warn = origWarn
    }
    const boundaryWarnings = warnings.filter((w) =>
      w.includes('shadow-DOM content, where bindings do not operate')
    )
    expect(boundaryWarnings.length).toBe(1) // once per class, not per instance
    expect(boundaryWarnings[0]).toContain('shadow-bound-warn')
  })

  test('light-DOM binding sugar does not warn', async () => {
    class LightBoundComponent extends Component {
      static preferredTagName = 'light-bound-nowarn'
      content = ({ div }: typeof elements) =>
        div({ bindText: 'lightNoWarnTest.label' })
    }
    const warnings: string[] = []
    const origWarn = console.warn
    console.warn = (...args: any[]) => {
      warnings.push(args.map(String).join(' '))
    }
    try {
      const el = LightBoundComponent.elementCreator()()
      document.body.append(el)
      el.remove()
    } finally {
      console.warn = origWarn
    }
    expect(
      warnings.some((w) => w.includes('where bindings do not operate'))
    ).toBe(false)
  })
})

describe('pending-attribute drain is last-write-wins (H-2)', () => {
  test('two pre-connect property writes: the second wins', () => {
    class DrainOrderTest extends Component {
      static preferredTagName = 'drain-order-test'
      static initAttributes = { caption: 'default' }
    }
    const el = DrainOrderTest.elementCreator()() as any
    el.caption = 'first'
    el.caption = 'second' // was silently dropped: first landed, guard blocked this
    document.body.append(el)
    expect(el.getAttribute('caption')).toBe('second')
    expect(el.caption).toBe('second')
    el.remove()
  })

  test('pre-connect remove-then-set lands the set', () => {
    class DrainRemoveSetTest extends Component {
      static preferredTagName = 'drain-remove-set-test'
      static initAttributes = { caption: 'default' }
    }
    const el = DrainRemoveSetTest.elementCreator()() as any
    el.setAttribute('caption', 'a')
    el.removeAttribute('caption')
    el.setAttribute('caption', 'b')
    document.body.append(el)
    expect(el.getAttribute('caption')).toBe('b')
    el.remove()
  })
})

describe('initAttributes vs class fields under [[Define]] semantics (H-3)', () => {
  // A natively-evaluated class guarantees [[Define]] field semantics
  // regardless of how the test file itself is transpiled.
  const makeFieldShadowClass = new Function(
    'Component',
    `return class FieldShadowTest extends Component {
      static preferredTagName = 'field-shadow-test'
      static initAttributes = { label: 'default' }
      label = 'from-field'
    }`
  )

  test('leftover field: no TypeError, value adopted, accessor restored, warns once per class', () => {
    const FieldShadowTest = makeFieldShadowClass(Component) as any
    const warnings: string[] = []
    const origWarn = console.warn
    console.warn = (...args: any[]) => {
      warnings.push(args.map(String).join(' '))
    }
    let el: any
    let el2: any
    try {
      // before the fix this line threw:
      // "TypeError: Attempting to change configurable attribute of unconfigurable property"
      el = FieldShadowTest.elementCreator()()
      document.body.append(el)
      el2 = FieldShadowTest.elementCreator()()
      document.body.append(el2)
    } finally {
      console.warn = origWarn
    }
    // the field's value was adopted and reflected
    expect(el.label).toBe('from-field')
    expect(el.getAttribute('label')).toBe('from-field')
    // the accessor is live again: writes reflect to the attribute
    el.label = 'changed'
    expect(el.getAttribute('label')).toBe('changed')
    // and attribute changes are readable through the property
    el.setAttribute('label', 'external')
    expect(el.label).toBe('external')
    const shadowWarnings = warnings.filter((w) =>
      w.includes('shadow static initAttributes')
    )
    expect(shadowWarnings.length).toBe(1) // once per class, not per instance
    el.remove()
    el2.remove()
  })

  test('components without shadowing fields are untouched', () => {
    class NoFieldTest extends Component {
      static preferredTagName = 'no-field-shadow-test'
      static initAttributes = { caption: 'plain' }
    }
    const el = NoFieldTest.elementCreator()() as any
    document.body.append(el)
    expect(el.caption).toBe('plain')
    el.caption = 'set'
    expect(el.getAttribute('caption')).toBe('set')
    el.remove()
  })
})

test('isSlotted is false for a light-DOM component with no slot (medium backlog)', () => {
  class NoSlotComp extends Component {
    static preferredTagName = 'no-slot-comp'
    content = ({ div }: typeof elements) => div('no slot here')
  }
  const el = NoSlotComp.elementCreator()() as any
  document.body.append(el)
  expect(el.isSlotted).toBe(false) // was always true (querySelector null !== undefined)
  el.remove()
})

test('isSlotted is true when the component has a slot', () => {
  class SlottedComp extends Component {
    static preferredTagName = 'yes-slot-comp'
    content = ({ div, slot }: typeof elements) => div(slot())
  }
  const el = SlottedComp.elementCreator()() as any
  document.body.append(el)
  expect(el.isSlotted).toBe(true)
  el.remove()
})

test('external removeAttribute is not masked by the in-memory fallback (medium backlog)', () => {
  class AttrMaskComp extends Component {
    static preferredTagName = 'attr-mask-comp'
    static initAttributes = { label: 'default' }
  }
  const el = AttrMaskComp.elementCreator()() as any
  document.body.append(el)
  el.label = 'custom'
  expect(el.label).toBe('custom')
  el.removeAttribute('label')
  expect(el.label).toBe('default') // was stuck on 'custom' (stale fallback)
  el.remove()
})

test('<slot> fallback children survive the tosi-slot rewrite (medium backlog)', () => {
  class SlotFallbackComp extends Component {
    static preferredTagName = 'slot-fallback-comp'
    content = ({ slot }: typeof elements) => slot('fallback text')
  }
  const el = SlotFallbackComp.elementCreator()() as any
  document.body.append(el)
  expect(el.textContent).toContain('fallback text') // was dropped
  el.remove()
})

describe('component change event bubbles (bound like a native input)', () => {
  test('an ancestor bubble-phase change listener hears a component value change', async () => {
    const raf = () => new Promise((r) => requestAnimationFrame(r))
    class BubbleWidget extends Component {
      static preferredTagName = 'bubble-widget'
      static shadowStyleSpec = { ':host': { display: 'block' } }
      value = 0
    }
    BubbleWidget.elementCreator()
    const container = document.createElement('div')
    document.body.append(container)
    const el = (elements as any).bubbleWidget() as any
    container.append(el)

    let heardOnAncestor = 0
    // bubble phase (capture=false) — only fires if the change event bubbles,
    // which native input change events do (and the delegated binding uses
    // capture, so this is specifically the ancestor-listener semantics)
    container.addEventListener('change', () => {
      heardOnAncestor++
    })
    el.value = 7 // queues a change on the next frame
    await raf()
    expect(heardOnAncestor).toBe(1) // was 0 — change did not bubble
    container.remove()
  })

  test('value binding round-trips through a component (works via capture too)', async () => {
    const { bind } = await import('./bind')
    const { bindings } = await import('./bindings')
    const { xin, updates } = await import('./xin')
    const { tosi } = await import('./xin-proxy')
    const raf = () => new Promise((r) => requestAnimationFrame(r))

    class ValueWidget extends Component {
      static preferredTagName = 'value-widget-rt'
      static shadowStyleSpec = { ':host': { display: 'block' } }
      value = 0
      content = ({ button }: any) => button({ part: 'inc' }, '+')
      connectedCallback() {
        super.connectedCallback()
        ;(this.shadowRoot as any)
          .querySelector('[part=inc]')
          .addEventListener('click', () => {
            this.value = Number(this.value) + 1
          })
      }
    }
    ValueWidget.elementCreator()
    tosi({ vwRt: { n: 5 } })
    const el = (elements as any).valueWidgetRt() as any
    bind(el, 'vwRt.n', bindings.value)
    document.body.append(el)
    await updates()
    await raf()
    expect(Number(el.value)).toBe(5)
    ;(el.shadowRoot as any).querySelector('[part=inc]').click()
    await raf()
    await updates()
    expect(Number(el.value)).toBe(6)
    expect((xin as any)['vwRt.n']).toBe(6)
    el.remove()
  })
})

test('data-ref is REMOVED in 1.8.0 — part="…" is the only ref attribute', () => {
  class DataRefComp extends Component {
    static preferredTagName = 'data-ref-comp'
    content = ({ div, span }: typeof elements) => [
      div({ dataRef: 'byRef' }, 'ref target'),
      span({ part: 'byPart' }, 'part target'),
    ]
  }
  const el = DataRefComp.elementCreator()() as any
  document.body.append(el)
  expect(el.parts.byPart.textContent).toBe('part target')
  // the deprecation promised removal in 1.8.0 and 1.8.0 keeps it: a
  // data-ref-only element no longer resolves as a part (it throws, the
  // same as any ref that never resolved)
  expect(() => el.parts.byRef).toThrow()
  el.remove()
})

describe('parts proxy — pre-hydration ownership capture', () => {
  // a light-DOM sub-component that SLOTS its children (the counter-example that
  // broke every structural approach): an own part placed inside it lands in a
  // tosi-slot after hydration, but capture grabbed it as ours beforehand
  class CapSlotWrap extends Component {
    static preferredTagName = 'cap-slotwrap'
    static initAttributes = { role: 'group' }
    content = ({ slot }: typeof elements) => [slot()]
  }
  const capSlotWrap = CapSlotWrap.elementCreator()

  test('own part inside a light-DOM slotting sub-component is still resolved', () => {
    class OuterA extends Component {
      static preferredTagName = 'cap-outer-a'
      static initAttributes = { role: 'group' }
      content = ({ div }: typeof elements) => [
        capSlotWrap(div({ part: 'inner' }, 'OWN')),
      ]
    }
    OuterA.elementCreator()
    const el = new OuterA()
    document.body.append(el)
    // after hydration cap-slotwrap slotted the div into its tosi-slot; capture
    // still resolves it (this is the case the slot/custom-element rules got wrong)
    expect((el.parts as any).inner.textContent).toBe('OWN')
    el.remove()
  })

  test('own declared part wins over a nested instance sharing the name (even un-slotted)', () => {
    class NodeC extends Component {
      static preferredTagName = 'cap-node'
      static initAttributes = { role: 'group' }
      content = ({ div }: typeof elements) => [
        div({ part: 'x' }, 'OWN'),
        div({ part: 'body' }),
      ]
    }
    NodeC.elementCreator()
    const outer = new NodeC()
    document.body.append(outer)
    const nested = new NodeC()
    ;(outer.parts as any).body.append(nested) // nested in a plain div — NOT slotted
    ;(nested.parts as any).x.textContent = 'NESTED'
    expect((outer.parts as any).x.textContent).toBe('OWN') // captured own, not nested
    expect((nested.parts as any).x.textContent).toBe('NESTED')
    outer.remove()
  })

  test('lazily-added part (not in content) falls back to querySelector', () => {
    class LazyC extends Component {
      static preferredTagName = 'cap-lazy'
      static initAttributes = { role: 'group' }
      content = ({ div }: typeof elements) => [div({ part: 'shell' })]
    }
    LazyC.elementCreator()
    const el = new LazyC()
    document.body.append(el)
    const late = document.createElement('div')
    late.setAttribute('part', 'late')
    late.textContent = 'LATE'
    ;(el.parts as any).shell.append(late)
    expect((el.parts as any).late.textContent).toBe('LATE')
    el.remove()
  })

  test('static (cloned) content falls back to querySelector', () => {
    const { div } = elements
    class StaticC extends Component {
      static preferredTagName = 'cap-static'
      static initAttributes = { role: 'group' }
      content = [div({ part: 'foo' }, 'STATIC')] // static array — cloned on append
    }
    StaticC.elementCreator()
    const el = new StaticC()
    document.body.append(el)
    expect((el.parts as any).foo.textContent).toBe('STATIC')
    el.remove()
  })

  test('a captured part replaced before first read falls back to the replacement', () => {
    class ReplaceC extends Component {
      static preferredTagName = 'cap-replace'
      static initAttributes = { role: 'group' }
      content = ({ div }: typeof elements) => [div({ part: 'thing' }, 'ORIG')]
    }
    ReplaceC.elementCreator()
    const el = new ReplaceC()
    document.body.append(el)
    const captured = el.querySelector('[part="thing"]')!
    const replacement = document.createElement('div')
    replacement.setAttribute('part', 'thing')
    replacement.textContent = 'NEW'
    captured.replaceWith(replacement) // simulate a render() swap before any parts read
    expect((el.parts as any).thing.textContent).toBe('NEW')
    el.remove()
  })

  test('a bare CSS-selector ref still resolves (data-ref is gone; selectors stay)', () => {
    class RefC extends Component {
      static preferredTagName = 'cap-ref'
      static initAttributes = { role: 'group' }
      content = () => {
        const d = document.createElement('div')
        d.setAttribute('data-ref', 'legacy') // now inert metadata
        d.className = 'legacy-target'
        d.textContent = 'REF'
        return [d]
      }
    }
    RefC.elementCreator()
    const el = new RefC()
    document.body.append(el)
    // data-ref no longer resolves…
    expect(() => (el.parts as any).legacy).toThrow()
    // …but the bare-selector fallback is untouched
    expect((el.parts as any)['.legacy-target'].textContent).toBe('REF')
    el.remove()
  })
})

describe('parts capture — lazy hydration', () => {
  test('a captured part that is a lazily-hydrating component stays valid (identity + hydration)', () => {
    class CapInnerW extends Component {
      static preferredTagName = 'cap-inner-w'
      static shadowStyleSpec = { ':host': { display: 'block' } }
      content = ({ div }: typeof elements) => div({ part: 'label' }, 'hydrated')
    }
    const capInnerW = CapInnerW.elementCreator()
    class CapHostW extends Component {
      static preferredTagName = 'cap-host-w'
      static initAttributes = { role: 'group' }
      content = () => [capInnerW({ part: 'widget' })]
    }
    CapHostW.elementCreator()
    const host = new CapHostW()
    document.body.append(host)
    const w = (host.parts as any).widget
    expect(w.tagName).toBe('CAP-INNER-W')
    expect(w.isConnected).toBe(true)
    // its own (lazy) hydration ran, and the captured ref points at the hydrated node
    expect(w.shadowRoot?.querySelector('[part="label"]')?.textContent).toBe(
      'hydrated'
    )
    expect((host.parts as any).widget).toBe(w) // identity stable across reads
    host.remove()
  })
})

describe('parts proxy — missing parts are not cached', () => {
  test('accessing a missing part throws but does not poison it; a later access resolves', () => {
    class CapMia extends Component {
      static preferredTagName = 'cap-mia'
      static initAttributes = { role: 'group' }
      content = ({ div }: typeof elements) => [div({ part: 'shell' })]
    }
    CapMia.elementCreator()
    const el = new CapMia()
    document.body.append(el)
    // not present yet → throws, and must NOT be cached
    expect(() => (el.parts as any).later).toThrow()
    const late = document.createElement('div')
    late.setAttribute('part', 'later')
    late.textContent = 'ARRIVED'
    ;(el.parts as any).shell.append(late)
    // retry resolves now that it exists
    expect((el.parts as any).later.textContent).toBe('ARRIVED')
    el.remove()
  })
})

describe('parts proxy — self-heals on replacement', () => {
  test('a cached part replaced after first read re-resolves on next access', () => {
    class CapSelfHeal extends Component {
      static preferredTagName = 'cap-selfheal'
      static initAttributes = { role: 'group' }
      content = ({ div }: typeof elements) => [div({ part: 'thing' }, 'A')]
    }
    CapSelfHeal.elementCreator()
    const el = new CapSelfHeal()
    document.body.append(el)
    expect((el.parts as any).thing.textContent).toBe('A') // first read caches
    const replacement = document.createElement('div')
    replacement.setAttribute('part', 'thing')
    replacement.textContent = 'B'
    el.querySelector('[part="thing"]')!.replaceWith(replacement)
    // next access sees the cached node is disconnected and re-resolves
    expect((el.parts as any).thing.textContent).toBe('B')
    el.remove()
  })
})

describe('parts proxy — detached part with no replacement (tosijs#21)', () => {
  // the <tosi-segmented> pattern: `custom` starts inside `options`; a structural
  // rebuild does options.textContent = '' (detaching it) and only conditionally
  // re-appends it. A change handler then destructures { options, custom } — on
  // 1.7.7 the isConnected eviction made that destructure THROW (no replacement
  // exists), killing the handler before it committed this.value.
  test('a cached part detached by a rebuild is still returned (not a throw)', () => {
    class DetachedPartC extends Component {
      static preferredTagName = 'detached-part-c'
      static shadowStyleSpec = { ':host': { display: 'block' } }
      value = 'yes'
      content = ({ div, input }: typeof elements) =>
        div({ part: 'options' }, input({ part: 'custom', hidden: true }))
    }
    DetachedPartC.elementCreator()
    const el = new DetachedPartC()
    document.body.append(el)

    // first render-ish pass: cache both parts while attached, then rebuild
    const { options, custom } = el.parts as any
    expect(custom).toBeInstanceOf(HTMLInputElement)
    options.textContent = '' // structural rebuild detaches custom
    expect(custom.isConnected).toBe(false)

    // the change-handler destructure must NOT throw — and must return the node
    let resolved: any
    expect(() => {
      resolved = (el.parts as any).custom
    }).not.toThrow()
    expect(resolved).toBe(custom) // the held (detached) part, still usable

    // and if a REPLACEMENT appears, self-healing takes over
    const replacement = document.createElement('input')
    replacement.setAttribute('part', 'custom')
    options.append(replacement)
    expect((el.parts as any).custom).toBe(replacement)
    el.remove()
  })

  test('the full #21 round-trip: handler commits this.value despite a detached part', () => {
    class Seg21 extends Component {
      static preferredTagName = 'seg21-c'
      static shadowStyleSpec = { ':host': { display: 'block' } }
      value = 'yes'
      content = ({ div, label, input }: typeof elements) =>
        div(
          { part: 'options' },
          input({ part: 'custom', hidden: true }),
          label(input({ type: 'radio', name: 's21', value: 'yes' }), 'yes'),
          label(input({ type: 'radio', name: 's21', value: 'no' }), 'no')
        )
      handleChange = () => {
        // unconditional destructure, exactly like tosi-segmented
        const { options, custom } = this.parts as any
        void custom
        const checked = options.querySelector(
          'input[type="radio"]:checked'
        ) as HTMLInputElement | null
        if (checked) this.value = checked.value
      }
      connectedCallback() {
        super.connectedCallback()
        ;(this.parts as any).options.addEventListener(
          'change',
          this.handleChange
        )
      }
    }
    Seg21.elementCreator()
    const el = new Seg21()
    document.body.append(el)
    const parts = el.parts as any
    void parts.custom // cache it (as segmented's first render does)
    // structural rebuild detaches custom (keep the radios)
    parts.custom.remove()
    // user picks "no"
    const no = el.shadowRoot!.querySelector(
      'input[value="no"]'
    ) as HTMLInputElement
    no.checked = true
    no.dispatchEvent(new Event('change', { bubbles: true }))
    expect(el.value).toBe('no') // the commit must stick — was stale on 1.7.7
    el.remove()
  })
})

describe('papercuts fixed in 1.8.0 (tosijs#22, #24)', () => {
  test('#24: a type-contradicting attribute write is applied AND reported, never silently dropped', () => {
    class OnOffComp extends Component {
      static preferredTagName = 'on-off-comp'
      static initAttributes = { pointerEvents: 'on' }
      content = null
    }
    const creator = OnOffComp.elementCreator()
    const errors: string[] = []
    const original = console.error
    console.error = (...args: any[]) => errors.push(args.map(String).join(' '))
    let el: any
    try {
      // the tosijs-3d call site: a legacy boolean written to a string attr.
      // Before 1.8.0 this REMOVED the attribute and the default read back —
      // the feature the author turned off stayed on, silently.
      el = creator({ pointerEvents: false })
      document.body.append(el)
    } finally {
      console.error = original
    }
    expect(el.pointerEvents).not.toBe('on') // the write was NOT discarded
    expect(errors.some((e) => e.includes('pointerEvents'))).toBe(true)
    expect(errors.some((e) => e.includes('tosijs#24'))).toBe(true)

    // AND IT READS BACK AS WRITTEN. This is the half that stayed broken
    // through 1.8.0-rc.1: the setter reflected `false` to the attribute as
    // the string "false" and the getter preferred the attribute, so
    // `if (el.pointerEvents)` was still truthy — the very bug the error
    // message says it does not have ("applied as given — nothing is
    // coerced"). The message and the behaviour now agree.
    expect(el.pointerEvents).toBe(false)
    expect(typeof el.pointerEvents).toBe('boolean')
    el.remove()
  })

  test('#24: an EXTERNAL setAttribute still wins over the typed value', () => {
    class OnOffExternal extends Component {
      static preferredTagName = 'on-off-external'
      static initAttributes = { pointerEvents: 'on' }
      content = null
    }
    const creator = OnOffExternal.elementCreator()
    const original = console.error
    console.error = () => {}
    let el: any
    try {
      el = creator({ pointerEvents: false })
      document.body.append(el)
    } finally {
      console.error = original
    }
    expect(el.pointerEvents).toBe(false)
    // outside writes must remain observable — that is why the getter prefers
    // the attribute in the first place
    el.setAttribute('pointer-events', 'off')
    expect(el.pointerEvents).toBe('off')
    // and a correctly-typed property write clears the override for good
    el.pointerEvents = 'on'
    expect(el.pointerEvents).toBe('on')
    el.remove()
  })

  test('#24: a correctly-typed write is silent and works', () => {
    class OnOffOk extends Component {
      static preferredTagName = 'on-off-ok'
      static initAttributes = { pointerEvents: 'on' }
      content = null
    }
    const creator = OnOffOk.elementCreator()
    const errors: string[] = []
    const original = console.error
    console.error = (...args: any[]) => errors.push(args.map(String).join(' '))
    let el: any
    try {
      el = creator({ pointerEvents: 'off' })
      document.body.append(el)
    } finally {
      console.error = original
    }
    expect(el.pointerEvents).toBe('off')
    expect(errors).toEqual([])
    el.remove()
  })

  test('#22: a component METHOD named on<Event> is assigned, not hijacked as event sugar', () => {
    let methodCalls = 0
    let assigned: any = null
    class SceneComp extends Component {
      static preferredTagName = 'scene-comp'
      content = null
      onSceneAddition(): void {
        methodCalls++
      }
    }
    const creator = SceneComp.elementCreator()
    const replacement = () => {
      assigned = 'mine'
    }
    const el = creator({ onSceneAddition: replacement }) as any
    document.body.append(el)
    // the method was REPLACED (what an OO author means), not turned into a
    // 'sceneaddition' event listener
    expect(el.onSceneAddition).toBe(replacement)
    el.onSceneAddition()
    expect(assigned).toBe('mine')
    expect(methodCalls).toBe(0)
    el.remove()
  })

  test('#22: ordinary event sugar on plain elements is untouched', () => {
    let clicks = 0
    const button = elements.button('go', { onClick: () => clicks++ })
    document.body.append(button)
    button.click()
    expect(clicks).toBe(1)
    button.remove()
  })
})

// Round-4 M3: rc.2 wired the tosijs#24 typed override into the STRING branch
// only, while the error message and the CHANGELOG claimed the fix unscoped —
// and the warning is warn-once per tag+attr, so instances 2..N got the wrong
// value silently. The boolean case is the nastiest: 'off' is a reasonable
// thing to write and it inverted the meaning.
describe('#24 covers every declared attribute type, not just string', () => {
  test('a number-declared attribute written a boolean reads back the boolean', () => {
    class NumAttr extends Component {
      static preferredTagName = 'num-attr-24'
      static initAttributes = { count: 0 }
      content = null
    }
    const creator = NumAttr.elementCreator()
    const original = console.error
    console.error = () => {}
    let el: any
    try {
      el = creator({ count: false })
      document.body.append(el)
    } finally {
      console.error = original
    }
    expect(el.count).toBe(false) // was NaN/null
    el.count = 7 // a correctly-typed write clears the override
    expect(el.count).toBe(7)
    el.remove()
  })

  test('a boolean-declared attribute written a string reads back the string', () => {
    class BoolAttr extends Component {
      static preferredTagName = 'bool-attr-24'
      static initAttributes = { flag: false }
      content = null
    }
    const creator = BoolAttr.elementCreator()
    const original = console.error
    console.error = () => {}
    let el: any
    try {
      el = creator({ flag: 'off' })
      document.body.append(el)
    } finally {
      console.error = original
    }
    // 'off' used to read back as `true` — a value that inverts its own meaning
    expect(el.flag).toBe('off')
    el.flag = true
    expect(el.flag).toBe(true)
    el.remove()
  })
})

// Round-5 M3: Component.computed() shipped with ZERO tests, and every defect
// the review found was trivially reachable — a DOM-name collision that
// corrupted HTMLElement.prototype page-wide, a spurious value-commit `change`,
// and a markup path that never reached the setter. NB queueRender uses rAF, so
// `await updates()` alone does not observe a render; these settle on a timer.
describe('Component.computed() — computed attributes', () => {
  const settle = () => new Promise((r) => setTimeout(r, 40))

  const makeNameTag = (tag: string) => {
    class NameTag extends Component {
      static preferredTagName = tag
      static initAttributes = {
        fullName: Component.computed(''),
        collapsed: Component.computed(false),
      }
      first = '?'
      last = '?'
      _c = false
      renders = 0
      get fullName(): string {
        return `${this.first} ${this.last}`
      }
      set fullName(v: string) {
        const [f, ...rest] = String(v).split(' ')
        this.first = f
        this.last = rest.join(' ')
      }
      get collapsed(): any {
        return this._c
      }
      set collapsed(v: any) {
        this._c = v === '' ? true : Boolean(v)
      }
      content = null
      render(): void {
        super.render()
        this.renders++
      }
    }
    NameTag.elementCreator()
    return NameTag
  }

  test('B1: a native DOM property name throws and leaves the prototype intact', async () => {
    const before = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'title'
    )
    class Colliding extends Component {
      static preferredTagName = 'computed-collides'
      static initAttributes = { title: Component.computed('') }
      content = null
    }
    const creator = Colliding.elementCreator()
    expect(() => {
      const el = creator()
      document.body.append(el)
      ;(el as any).connectedCallback?.()
    }).toThrow(/native DOM property|get title/)
    // the platform accessor must be untouched — this corrupted every element
    // on the page for the rest of its life
    const after = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'title'
    )
    expect(after?.get).toBe(before?.get)
    const plain = document.createElement('div')
    plain.title = 'still works'
    expect(plain.title).toBe('still works')
  })

  test('M2: markup reaches the setter — string value and presence', async () => {
    makeNameTag('computed-markup')
    document.body.innerHTML =
      '<computed-markup full-name="Grace Hopper" collapsed></computed-markup>'
    const el = document.querySelector('computed-markup') as any
    await settle()
    expect(el.fullName).toBe('Grace Hopper')
    expect(el.collapsed).toBe(true)
    document.body.innerHTML = ''
  })

  test('M2: an empty attribute delivers the empty string, not undefined', async () => {
    makeNameTag('computed-empty')
    document.body.innerHTML = '<computed-empty full-name></computed-empty>'
    const el = document.querySelector('computed-empty') as any
    await settle()
    // `<el full-name>` is the case a naive split(' ') setter fumbles — it has
    // to actually reach the setter for that to be the author's problem
    expect(typeof el.fullName).toBe('string')
    document.body.innerHTML = ''
  })

  test('M2: a post-hydration setAttribute reaches the setter', async () => {
    const Cls = makeNameTag('computed-setattr')
    const el = (Cls as any)._elementCreator() as any
    document.body.append(el)
    await settle()
    el.setAttribute('full-name', 'Ada Lovelace')
    await settle()
    expect(el.fullName).toBe('Ada Lovelace')
    el.remove()
  })

  test('M1: a property write renders but fires NO change event', async () => {
    const Cls = makeNameTag('computed-nochange')
    const el = (Cls as any)._elementCreator() as any
    document.body.append(el)
    await settle()
    let changes = 0
    el.addEventListener('change', () => changes++)
    const before = el.renders
    el.fullName = 'Alan Turing'
    await settle()
    expect(el.fullName).toBe('Alan Turing')
    expect(el.renders).toBeGreaterThan(before)
    // queueRender(true) is the VALUE-COMMIT signal; an attribute is not a value
    expect(changes).toBe(0)
    el.remove()
  })

  test('M1: an unchanged repeat write does not re-render', async () => {
    const Cls = makeNameTag('computed-idempotent')
    const el = (Cls as any)._elementCreator() as any
    document.body.append(el)
    el.fullName = 'Grace Hopper'
    await settle()
    const after = el.renders
    el.fullName = 'Grace Hopper'
    await settle()
    expect(el.renders).toBe(after)
    el.remove()
  })

  test('a getter with no setter is a read-only derived attribute', async () => {
    class ReadOnly extends Component {
      static preferredTagName = 'computed-readonly'
      static initAttributes = { derived: Component.computed('') }
      n = 2
      get derived(): string {
        return `n=${this.n}`
      }
      content = null
    }
    const creator = ReadOnly.elementCreator()
    const el = creator() as any
    document.body.append(el)
    await settle()
    expect(el.derived).toBe('n=2')
    el.remove()
  })

  test('declaring computed() with no accessor at all throws', () => {
    class Ghost extends Component {
      static preferredTagName = 'computed-ghost'
      static initAttributes = { nothing: Component.computed('') }
      content = null
    }
    const creator = Ghost.elementCreator()
    expect(() => {
      const el = creator()
      document.body.append(el)
      ;(el as any).connectedCallback?.()
    }).toThrow(/Component.computed/)
  })

  test('a subclass does not double-wrap the parent setter', async () => {
    const Parent = makeNameTag('computed-parent')
    class Child extends Parent {
      static preferredTagName = 'computed-child'
    }
    Child.elementCreator()
    const el = (Child as any)._elementCreator() as any
    document.body.append(el)
    await settle()
    const before = el.renders
    el.fullName = 'Grace Hopper'
    await settle()
    // double-wrapping would queue two renders for one assignment
    expect(el.renders - before).toBeLessThanOrEqual(1)
    el.remove()
  })

  test('computed names appear in observedAttributes', () => {
    const Cls = makeNameTag('computed-observed')
    expect(Cls.observedAttributes).toContain('full-name')
    expect(Cls.observedAttributes).toContain('collapsed')
  })
})

describe('initAttributes and contract.attributes COMPOSE (tosijs#29)', () => {
  /*
   * These used to be mutually exclusive on one class — declaring both threw.
   * That was wrong twice over: the same two declarations SPLIT ACROSS a
   * prototype chain already merged cleanly (identical intent, opposite
   * outcome, decided only by placement), and "one source of truth" is a
   * property of an attribute NAME, not of a class.
   */
  test('both on one class merge, with the contract winning per key', () => {
    class Composed extends Component {
      static preferredTagName = 'compose-both'
      static initAttributes = { alpha: 'a', shared: 'from-init' }
      static contract = {
        attributes: {
          beta: { type: 'number', default: 7 },
          shared: { type: 'string', default: 'from-contract' },
        },
      }
      content = null
    }
    expect((Composed as any)._resolveInitAttributes()).toEqual({
      alpha: 'a',
      beta: 7,
      shared: 'from-contract',
    })
  })

  test('a contract entry may omit default when initAttributes declares one', () => {
    class Enriched extends Component {
      static preferredTagName = 'compose-enrich'
      static initAttributes = { mode: 'a' }
      // constrain an attribute WITHOUT restating its default — the whole
      // point of enrichment being cheap
      static contract = { attributes: { mode: { enum: ['a', 'b', 'c'] } } }
      content = null
    }
    expect((Enriched as any)._resolveInitAttributes()).toEqual({ mode: 'a' })
    // and the constraint survives into what an agent is told
    expect((Enriched as any)._describedAttributes().mode).toMatchObject({
      enum: ['a', 'b', 'c'],
    })
  })

  test('a contract attribute with no default ANYWHERE still throws', () => {
    class NoDefault extends Component {
      static preferredTagName = 'compose-nodefault'
      static contract = { attributes: { orphan: { type: 'string' } } }
      content = null
    }
    // the machinery infers an attribute's runtime type from its default, so
    // with none in either place there is nothing to infer from
    expect(() => (NoDefault as any)._resolveInitAttributes()).toThrow(/orphan/)
  })

  test('Component.computed() survives into the described type', () => {
    class Computed extends Component {
      static preferredTagName = 'compose-computed'
      static initAttributes = { fullName: Component.computed('') }
      get fullName() {
        return 'x'
      }
      set fullName(_v: string) {}
      content = null
    }
    // the marker's `shape` IS the type example — not `object`
    expect((Computed as any)._describedAttributes().fullName).toEqual({
      type: 'string',
      default: '',
    })
  })
})

describe('host props in content compose with a list binding (round-2 B1)', () => {
  /*
   * `Component.hydrate()` folded host props with a bare Object.assign, so the
   * `bind`-clobbering bug fixed in create() survived at its SECOND address.
   * One order silently destroyed the entire list. There were NO list-binding
   * tests in this file at all, which is why the first fix looked complete.
   */
  const mark = {
    toDOM(el: any, v: any) {
      el.setAttribute('data-title', String(v))
    },
  }

  const build = async (tag: string, order: 'list-first' | 'bind-first') => {
    const key = tag.replace(/-/g, '_')
    const created: any = tosi({
      [key]: { items: ['x', 'y'], title: 'hello' },
    } as any)
    const state = created[key]
    const list = () =>
      state.items.tosi.listBinding(({ span }: any, item: any) =>
        span({ textContent: item })
      )
    const props = { bind: { value: `${key}.title`, binding: mark } }
    class W extends Component {
      static preferredTagName = tag
      content =
        order === 'list-first'
          ? () => [...list(), props]
          : () => [props, ...list()]
    }
    W.elementCreator()
    const el = new (customElements.get(tag) as any)()
    document.body.append(el)
    await updates()
    return el
  }

  test('listBinding first — the list must not vanish', async () => {
    const el = await build('hp-list-first', 'list-first')
    expect(el.querySelectorAll('span').length).toBe(2)
    expect(el.getAttribute('data-title')).toBe('hello')
  })

  test("caller's bind first — both survive", async () => {
    const el = await build('hp-bind-first', 'bind-first')
    expect(el.querySelectorAll('span').length).toBe(2)
    expect(el.getAttribute('data-title')).toBe('hello')
  })
})

describe('withAttributes — attributes typed from a value (tosijs#36)', () => {
  test('installs attributes, coerces them, and keeps statics working', async () => {
    /*
     * `static initAttributes` installs INSTANCE properties, and TypeScript
     * cannot derive an instance type from a static declared in the same class
     * — which is why `Component` carried `[key: string]: any` and why every
     * component anyone wrote accepted every typo. Passing the map as a VALUE
     * lets inference do the work with no extra declaration.
     *
     * This test is the runtime half: the new form must behave EXACTLY like
     * `static initAttributes`, because it is the same mechanism underneath.
     */
    class Typed extends withAttributes({ label: 'hi', count: 0, on: false }) {
      static preferredTagName = 'wa-typed'
      content = null
    }
    const el = (Typed as any).elementCreator()() as any
    document.body.append(el)
    await updates()
    expect(el.label).toBe('hi')
    expect(el.count).toBe(0)
    expect(el.on).toBe(false)
    // the static survives the factory, and is what the machinery reads
    expect((Typed as any).initAttributes).toEqual({
      label: 'hi',
      count: 0,
      on: false,
    })
    // attribute -> property, with the declared type's coercion
    el.setAttribute('count', '7')
    await updates()
    expect(el.count).toBe(7)
    expect(typeof el.count).toBe('number')
    el.remove()
  })

  test('a blueprint can reach it through the hydration factory', async () => {
    /*
     * Blueprints are dependency-free — they receive everything as the factory
     * argument, so a helper missing from that object is unusable from a
     * blueprint no matter that it is exported. `withAttributes` was missing
     * when this was first written, which is exactly the gap this pins.
     */
    const { makeComponent } = await import('./make-component')
    const blueprint = (_tag: string, factory: any) => {
      expect(typeof factory.withAttributes).toBe('function')
      class Counter extends factory.withAttributes({ label: 'bp', count: 2 }) {
        content = null
      }
      return { type: Counter as any }
    }
    const { creator } = await makeComponent('wa-blueprint', blueprint as any)
    const el = creator() as any
    document.body.append(el)
    await updates()
    expect(el.label).toBe('bp')
    expect(el.count).toBe(2)
    el.remove()
  })
  test('computed attributes work, and their setter may queueRender()', async () => {
    /*
     * `Component.computed()` means "this class implements the property
     * itself", so `withAttributes` deliberately OMITS computed keys from the
     * type it declares (see DeclaredAttributes). Without that the marker type
     * leaks — `fullName` would type as `ComputedAttribute` while the accessor
     * returns a string, and a base-property/derived-accessor pair is TS2611.
     *
     * The runtime half: a computed SETTER calling `queueRender()` must not
     * re-enter. It does not — one render per change, not a loop.
     */
    let renders = 0
    class NameTag extends withAttributes({ fullName: Component.computed('') }) {
      static preferredTagName = 'wa-nametag'
      first = 'Ada'
      last = 'Lovelace'
      get fullName(): string {
        return `${this.first} ${this.last}`
      }
      set fullName(v: string) {
        const [f, ...rest] = String(v).split(' ')
        this.first = f
        this.last = rest.join(' ')
        this.queueRender()
      }
      content = ({ span }: any) => [span({ part: 'out' })]
      render(): void {
        renders++
        ;(this.parts as any).out.textContent = this.fullName
      }
    }
    const raf = () => new Promise((r) => requestAnimationFrame(r))
    const el = (NameTag as any).elementCreator()() as any
    document.body.append(el)
    await raf()
    expect(renders).toBe(1)
    el.setAttribute('full-name', 'Grace Hopper')
    await raf()
    expect(el.fullName).toBe('Grace Hopper')
    expect((el.parts as any).out.textContent).toBe('Grace Hopper')
    expect(renders).toBe(2) // exactly one more — the setter did not re-enter
    el.remove()
  })

  test('a component built with withAttributes can still be EXTENDED', async () => {
    /*
     * Why `static initAttributes` is NOT deprecated: `withAttributes` always
     * extends `Component`, so it cannot add attributes to an existing
     * component class. A subclass does that with `static initAttributes`, and
     * the two compose. (`withAttributes` also SETS that static — deprecating
     * it would deprecate the primitive its own sugar emits, which is the
     * `bindList` category error this project has already paid for once.)
     */
    class BaseWidget extends withAttributes({ label: 'base' }) {
      static preferredTagName = 'wa-base'
      content = null
      greet(): string {
        return `hi ${this.label}`
      }
    }
    // NO SPREAD. This test used to write
    //   static initAttributes = { ...(BaseWidget as any).initAttributes, extra: 7 }
    // which hand-merged the very thing under test and cast away the type
    // error, so it asserted neither half and passed against a broken
    // library: `_resolveInitAttributes` returned `this.initAttributes` — a
    // STATIC lookup that a subclass's own static shadows — so declaring
    // `extra` DROPPED `label` from the instance and from
    // `observedAttributes`, silently, in exactly the shape the docs
    // recommend. Declare only what the subclass adds; the merge is the
    // library's job.
    class SubWidget extends BaseWidget {
      static preferredTagName = 'wa-derived'
      static initAttributes = { extra: 7 }
      content = null
    }
    const raf = () => new Promise((r) => requestAnimationFrame(r))
    const sub = (SubWidget as any).elementCreator()() as any
    document.body.append(sub)
    await raf()
    expect(sub.label).toBe('base') // inherited attribute
    expect(sub.extra).toBe(7) // and the added one
    expect(sub.greet()).toBe('hi base') // inherited behaviour

    // reflection survives in BOTH directions for the inherited attribute —
    // it was severed both ways, and observedAttributes losing the name is
    // what made it silent
    expect(SubWidget.observedAttributes).toContain('label')
    expect(SubWidget.observedAttributes).toContain('extra')
    sub.setAttribute('label', 'reflected')
    await raf()
    expect(sub.label).toBe('reflected')
    sub.remove()
  })

  test('three levels deep: every ancestor initAttributes map survives', async () => {
    class L1 extends withAttributes({ a: 'a' }) {
      static preferredTagName = 'wa-l1'
      content = null
    }
    class L2 extends L1 {
      static preferredTagName = 'wa-l2'
      static initAttributes = { b: 'b' }
      content = null
    }
    class L3 extends L2 {
      static preferredTagName = 'wa-l3'
      static initAttributes = { c: 'c' }
      content = null
    }
    const raf = () => new Promise((r) => requestAnimationFrame(r))
    const el = (L3 as any).elementCreator()() as any
    document.body.append(el)
    await raf()
    expect([el.a, el.b, el.c]).toEqual(['a', 'b', 'c'])
    for (const name of ['a', 'b', 'c']) {
      expect(L3.observedAttributes).toContain(name)
    }
    // and a nearer declaration still wins over a further one
    expect((L2 as any)._resolveInitAttributes()).toEqual({ a: 'a', b: 'b' })
    el.remove()
  })

  test('a subclass that declares NOTHING still inherits the merged map', async () => {
    // THE CASE THE FIRST FIX MISSED, and the commonest kind of subclass. The
    // two tests above both declare something at every level, so they never
    // exercised the fall-through — which read the raw static and stopped at
    // the nearest ancestor that happened to declare one, losing everything
    // above it. One level of merging, while the docs promised the chain.
    class L1 extends withAttributes({ a: 'a' }) {
      static preferredTagName = 'wa-n1'
      content = null
    }
    class L2 extends L1 {
      static preferredTagName = 'wa-n2'
      static initAttributes = { b: 'b' }
      content = null
    }
    class L3 extends L2 {
      static preferredTagName = 'wa-n3'
      content = null // declares NOTHING
    }
    const raf = () => new Promise((r) => requestAnimationFrame(r))
    const el = (L3 as any).elementCreator()() as any
    document.body.append(el)
    await raf()
    expect([el.a, el.b]).toEqual(['a', 'b'])
    expect(L3.observedAttributes).toContain('a')
    expect(L3.observedAttributes).toContain('b')
    el.remove()
  })

  test('a subclass may OVERRIDE an inherited default, and does not leak upward', async () => {
    class Parent extends withAttributes({ label: 'parent', keep: 1 }) {
      static preferredTagName = 'wa-parent'
      content = null
    }
    class Child extends Parent {
      static preferredTagName = 'wa-child'
      static initAttributes = { label: 'child' }
      content = null
    }
    const raf = () => new Promise((r) => requestAnimationFrame(r))
    const child = (Child as any).elementCreator()() as any
    const parent = (Parent as any).elementCreator()() as any
    document.body.append(child, parent)
    await raf()
    expect(child.label).toBe('child') // nearer declaration wins
    expect(child.keep).toBe(1) // and the rest is inherited
    expect(parent.label).toBe('parent') // the base is NOT mutated
    child.remove()
    parent.remove()
  })
})

describe('hydrate() classifies content the same way create() does', () => {
  /*
   * `create()` and `hydrate()`'s content filter both classify positional
   * arguments, and `mergeElementProps` was extracted specifically to keep them
   * in step — its comment says so. That was not enough, because the
   * CLASSIFICATION stayed duplicated: the value/array/warning rules landed in
   * `create()` only, so `content = [span('a'), new Date()]` still dropped the
   * Date and a nested array still turned its INDICES into host attributes —
   * verbatim the symptom the release notes called fixed. One classifier now
   * serves both; these tests are the thing that notices if they drift again.
   */
  const raf = () => new Promise((r) => requestAnimationFrame(r))
  const warnings: string[] = []
  let originalWarn: typeof console.warn
  beforeEach(() => {
    originalWarn = console.warn
    warnings.length = 0
    console.warn = (...args: any[]) => warnings.push(String(args[0]))
  })
  afterEach(() => {
    console.warn = originalWarn
  })

  test('values in content render instead of vanishing', async () => {
    class HydrateValues extends (Component as any) {
      static preferredTagName = 'hydrate-values'
      content = [
        elements.span('a'),
        new Date('2026-01-02T03:04:05Z'),
        10n,
        false,
      ] as any
    }
    const el = (HydrateValues as any).elementCreator()() as any
    document.body.append(el)
    await raf()
    // ORDER-SENSITIVE ON PURPOSE. The first version of this test used
    // `toContain`, which passes under ANY permutation — and hydrate() was
    // filtering text out and re-appending it at the END, so `[10n, span]`
    // rendered " each10" against create()'s "10 each". The test reported
    // safety it did not have; assert the exact string.
    expect(el.textContent).toBe(`a${new Date('2026-01-02T03:04:05Z')}10false`)
    expect(warnings).toEqual([])
    el.remove()
  })

  test('a nested array warns instead of becoming host attributes', async () => {
    class HydrateNested extends (Component as any) {
      static preferredTagName = 'hydrate-nested'
      content = [
        elements.span('a'),
        [elements.span('b'), elements.span('c')],
      ] as any
    }
    const el = (HydrateNested as any).elementCreator()() as any
    document.body.append(el)
    await raf()
    expect(el.getAttribute('0')).toBe(null) // was <hydrate-nested 0="<span>b</span>">
    expect(warnings.join(' ')).toContain('did you mean to spread it')
    el.remove()
  })

  test('a Text node is legitimate content', async () => {
    // create() tested `Element | DocumentFragment` while hydrate() tested
    // `instanceof Node`; the shared classifier keeps the WIDER, correct one
    class HydrateText extends (Component as any) {
      static preferredTagName = 'hydrate-text'
      content = [document.createTextNode('bare text')] as any
    }
    const el = (HydrateText as any).elementCreator()() as any
    document.body.append(el)
    await raf()
    expect(el.textContent).toContain('bare text')
    expect(warnings).toEqual([])
    el.remove()
  })
})
