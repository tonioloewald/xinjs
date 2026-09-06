import { test, expect, describe, beforeEach, afterEach } from 'bun:test'
import { tosi } from './xin-proxy'
import { elements, svgElements, mathML } from './elements'
import { updates } from './path-listener'
import { xin, boxed } from './xin'

test('element creation works', () => {
  const { div, input } = elements
  expect(div().tagName).toBe('DIV')
  expect(input({ value: 17 }).value).toBe('17')
})

test('element attributes work', () => {
  const { div } = elements
  expect(div({ dataFoo: 'bar' }).dataset.foo).toBe('bar')
  expect(div({ id: 'whatevs' }).id).toBe('whatevs')
})

test('data binding works', async () => {
  const { test } = tosi({
    test: {
      value: 'hello world',
    },
  })

  expect(test.value.valueOf()).toBe('hello world')

  const div = elements.div({ bindText: test.value })
  document.body.append(div)

  await updates()
  expect(div.textContent).toBe('hello world')
})

test('event binding works', async () => {
  const { test } = tosi({
    test: {
      count: 0,
      handler() {
        // @ts-expect-error tsc is stupid
        test.count += 1
      },
    },
  })

  test.handler()
  expect(test.count.valueOf()).toBe(1)

  const button = elements.button({ onClick: test.handler })
  document.body.append(button)
  button.click()
  expect(test.count.valueOf()).toBe(2)

  button.remove()
})

test('style binding works', async () => {
  const div = elements.div({
    style: {
      _fooBar: '17px',
      __barBaz: 'green',
      textAlign: 'center',
    },
  })

  expect(div.style.textAlign).toBe('center')
  expect(div.style.getPropertyValue('--foo-bar')).toBe('17px')
  expect(div.style.getPropertyValue('--bar-baz')).toBe(
    'var(--bar-baz-default, green)'
  )
})

test('svgElements creates SVG elements', () => {
  const { circle, rect, svg } = svgElements
  const svgEl = svg()
  const circleEl = circle({ cx: '50', cy: '50', r: '40' })
  const rectEl = rect({ width: '100', height: '100' })

  expect(svgEl.namespaceURI).toBe('http://www.w3.org/2000/svg')
  expect(circleEl.namespaceURI).toBe('http://www.w3.org/2000/svg')
  expect(rectEl.namespaceURI).toBe('http://www.w3.org/2000/svg')
  expect(circleEl.getAttribute('cx')).toBe('50')
})

test('mathML creates MathML elements', () => {
  const { math, mi, mn } = mathML
  const mathEl = math()
  const miEl = mi('x')
  const mnEl = mn('2')

  expect(mathEl.namespaceURI).toBe('http://www.w3.org/1998/Math/MathML')
  expect(miEl.namespaceURI).toBe('http://www.w3.org/1998/Math/MathML')
  expect(mnEl.namespaceURI).toBe('http://www.w3.org/1998/Math/MathML')
})

test('class attribute handles space-separated classes', () => {
  const div = elements.div({ class: 'foo bar baz' })
  expect(div.classList.contains('foo')).toBe(true)
  expect(div.classList.contains('bar')).toBe(true)
  expect(div.classList.contains('baz')).toBe(true)
})

test('class attribute tolerates extra whitespace without crashing', () => {
  const div = elements.div({ class: '  foo   bar ' })
  expect(div.classList.contains('foo')).toBe(true)
  expect(div.classList.contains('bar')).toBe(true)
  expect(div.classList.length).toBe(2)
})

test('class attribute accepts an array of classes', () => {
  const div = elements.div({ class: ['foo', 'bar baz'] })
  expect(div.classList.contains('foo')).toBe(true)
  expect(div.classList.contains('bar')).toBe(true)
  expect(div.classList.contains('baz')).toBe(true)
})

test('class attribute accepts a boolean map', () => {
  const div = elements.div({ class: { foo: true, bar: false, baz: 1 } })
  expect(div.classList.contains('foo')).toBe(true)
  expect(div.classList.contains('bar')).toBe(false)
  expect(div.classList.contains('baz')).toBe(true)
  expect(div.classList.length).toBe(2)
})

test('empty class attribute adds no class', () => {
  const div = elements.div({ class: '' })
  expect(div.classList.length).toBe(0)
})

test('falsy class values add no class (idiomatic conditionals)', () => {
  // `cond ? 'active' : undefined`, `cond && 'active'` (-> false), explicit null.
  // These must NOT become literal "undefined"/"false"/"null" classes.
  // eslint-disable-next-line no-constant-binary-expression -- the constant conditional IS the fixture
  for (const value of [undefined, null, false, 1 > 2 && 'active']) {
    const div = elements.div({ class: value as any })
    expect(div.classList.length).toBe(0)
    expect(div.className).toBe('')
  }
})

test('class array skips falsy entries', () => {
  const div = elements.div({
    class: ['foo', null, false, undefined, 'bar'] as any,
  })
  expect([...div.classList].sort()).toEqual(['bar', 'foo'])
})

test('boolean attributes work correctly', () => {
  const { input } = elements
  const disabledInput = input({ disabled: true })
  const enabledInput = input({ disabled: false })
  const checkedInput = input({ type: 'checkbox', checked: true })

  expect(disabledInput.hasAttribute('disabled')).toBe(true)
  expect(enabledInput.hasAttribute('disabled')).toBe(false)
  expect(checkedInput.checked).toBe(true)
})

test('elements proxy throws on set', () => {
  expect(() => {
    // @ts-expect-error testing runtime error
    elements.custom = () => {}
  }).toThrow('You may not add new properties to elements')
})

test('svgElements proxy throws on set', () => {
  expect(() => {
    // @ts-expect-error testing runtime error
    svgElements.custom = () => {}
  }).toThrow('You may not add new properties to elements')
})

test('mathML proxy throws on set', () => {
  expect(() => {
    // @ts-expect-error testing runtime error
    mathML.custom = () => {}
  }).toThrow('You may not add new properties to elements')
})

test('style as string attribute works', () => {
  const div = elements.div({ style: 'color: red; font-size: 12px' })
  expect(div.getAttribute('style')).toBe('color: red; font-size: 12px')
})

test('template element appends to content', () => {
  const { template, div } = elements
  const tmpl = template(div('inside template'))

  expect(tmpl.content.children.length).toBe(1)
  expect(tmpl.content.children[0].tagName).toBe('DIV')
})

test('fragment creates DocumentFragment', () => {
  const { fragment, div, span } = elements
  const frag = fragment(div('first'), span('second'))

  expect(frag).toBeInstanceOf(DocumentFragment)
  expect(frag.children.length).toBe(2)
})

test('camelCase tag names convert to kebab-case', () => {
  const { myCustomElement } = elements
  const el = myCustomElement()
  expect(el.tagName.toLowerCase()).toBe('my-custom-element')
})

// Test for observedAttributes handling (third-party web component compatibility)
test('respects observedAttributes for web components with undefined properties', () => {
  // Pathological web component: declares observedAttributes but property is undefined
  class PathologicalComponent extends HTMLElement {
    static observedAttributes = ['my-attr', 'another-attr']

    // Properties start undefined (bad practice, but common in the wild)
    myAttr: string | undefined
    anotherAttr: string | undefined

    attributeChangedCallback(name: string, _old: string, value: string) {
      if (name === 'my-attr') this.myAttr = value
      if (name === 'another-attr') this.anotherAttr = value
    }
  }

  customElements.define('pathological-component', PathologicalComponent)

  const { pathologicalComponent } = elements
  const el = pathologicalComponent({
    myAttr: 'test-value',
    anotherAttr: 'another-value',
  }) as PathologicalComponent

  // Should have set attributes, not tried to set undefined properties
  expect(el.getAttribute('my-attr')).toBe('test-value')
  expect(el.getAttribute('another-attr')).toBe('another-value')
})

test('respects observedAttributes with camelCase conversion', () => {
  class CamelCaseAttrsComponent extends HTMLElement {
    static observedAttributes = ['data-value', 'is-disabled']

    dataValue: string | undefined
    isDisabled: boolean | undefined

    attributeChangedCallback(name: string, _old: string, value: string | null) {
      if (name === 'data-value') this.dataValue = value ?? undefined
      if (name === 'is-disabled') this.isDisabled = value !== null
    }
  }

  customElements.define('camel-attrs-component', CamelCaseAttrsComponent)

  const { camelAttrsComponent } = elements
  const el = camelAttrsComponent({
    dataValue: 'foo',
    isDisabled: true,
  }) as CamelCaseAttrsComponent

  expect(el.getAttribute('data-value')).toBe('foo')
  expect(el.hasAttribute('is-disabled')).toBe(true)
})

test('bare proxy property creates live binding', async () => {
  const { propTest } = tosi({
    propTest: { name: 'Alice' },
  })

  const div = elements.div({ textContent: propTest.name })
  document.body.append(div)

  await updates()
  expect(div.textContent).toBe('Alice')

  propTest.name.value = 'Bob'
  await updates()
  expect(div.textContent).toBe('Bob')

  div.remove()
})

test('bare proxy bindings on different elements are independent', async () => {
  const { indepTest } = tosi({
    indepTest: { a: 'first', b: 'second' },
  })

  const div1 = elements.div({ textContent: indepTest.a })
  const div2 = elements.div({ textContent: indepTest.b })
  document.body.append(div1, div2)

  await updates()
  expect(div1.textContent).toBe('first')
  expect(div2.textContent).toBe('second')

  // Changing one doesn't affect the other
  indepTest.a.value = 'updated'
  await updates()
  expect(div1.textContent).toBe('updated')
  expect(div2.textContent).toBe('second')

  div1.remove()
  div2.remove()
})

test('same bare property binding on multiple elements updates independently', async () => {
  const { sharedTest } = tosi({
    sharedTest: { x: 'hello', y: 'world' },
  })

  // Both use textContent binding (same cached binding object)
  const div1 = elements.div({ textContent: sharedTest.x })
  const div2 = elements.div({ textContent: sharedTest.y })
  document.body.append(div1, div2)

  await updates()
  expect(div1.textContent).toBe('hello')
  expect(div2.textContent).toBe('world')

  // Update both — each should track its own path
  sharedTest.x.value = 'foo'
  sharedTest.y.value = 'bar'
  await updates()
  expect(div1.textContent).toBe('foo')
  expect(div2.textContent).toBe('bar')

  div1.remove()
  div2.remove()
})

test('bare proxy hidden binding works', async () => {
  const { hiddenTest } = tosi({
    hiddenTest: { visible: false },
  })

  const div = elements.div({ hidden: hiddenTest.visible })
  document.body.append(div)

  await updates()
  expect(div.hidden).toBe(false)

  hiddenTest.visible.value = true
  await updates()
  expect(div.hidden).toBe(true)

  div.remove()
})

test('boolean observedAttributes handled correctly', () => {
  class BooleanAttrComponent extends HTMLElement {
    static observedAttributes = ['disabled', 'hidden']
  }

  customElements.define('boolean-attr-component', BooleanAttrComponent)

  const { booleanAttrComponent } = elements

  const elTrue = booleanAttrComponent({ disabled: true })
  expect(elTrue.hasAttribute('disabled')).toBe(true)

  const elFalse = booleanAttrComponent({ disabled: false })
  expect(elFalse.hasAttribute('disabled')).toBe(false)
})

describe('reactive class binding replaces (does not accumulate)', () => {
  test('binding class to a scalar swaps classes instead of accumulating', async () => {
    tosi({ clsTest: { c: 'red' } })
    const { div } = elements
    const el = div({ class: (boxed as any).clsTest.c })
    document.body.append(el)
    await updates()
    expect(el.classList.contains('red')).toBe(true)
    ;(xin as any)['clsTest.c'] = 'blue'
    await updates()
    expect(el.classList.contains('blue')).toBe(true)
    expect(el.classList.contains('red')).toBe(false) // replaced, not accumulated
    el.remove()
  })

  test('boolean-map class binding removes keys dropped from a later map', async () => {
    tosi({ clsMap: { m: { a: true, b: true } } })
    const { div } = elements
    const el = div({ class: (boxed as any).clsMap.m })
    document.body.append(el)
    await updates()
    expect(el.classList.contains('a')).toBe(true)
    expect(el.classList.contains('b')).toBe(true)
    ;(xin as any)['clsMap.m'] = { a: true }
    await updates()
    expect(el.classList.contains('a')).toBe(true)
    expect(el.classList.contains('b')).toBe(false) // dropped key removed
    el.remove()
  })

  test('reactive class updates do not strip marker classes added elsewhere', async () => {
    // -tosi-data is added by bind() via classList.add (not through the class
    // prop), so it is not in appliedClasses and must survive class updates
    tosi({ clsMarker: { c: 'red' } })
    const { div } = elements
    const { bind, bindings } = await import('./bind').then(async (m) => ({
      bind: m.bind,
      bindings: (await import('./bindings')).bindings,
    }))
    const el = div({ class: (boxed as any).clsMarker.c })
    bind(el, 'clsMarker.other', bindings.text) // adds the -tosi-data marker class
    document.body.append(el)
    await updates()
    expect(el.classList.contains('-tosi-data')).toBe(true)
    ;(xin as any)['clsMarker.c'] = 'blue'
    await updates()
    expect(el.classList.contains('blue')).toBe(true)
    expect(el.classList.contains('-tosi-data')).toBe(true) // marker survives
    el.remove()
  })
})

test('bind spec with string binding name renders (not a silent no-op)', async () => {
  tosi({ strBindName: { label: 'hello' } })
  const { div } = elements
  const el = div({ bind: { value: 'strBindName.label', binding: 'text' } })
  document.body.append(el)
  await updates()
  expect(el.textContent).toBe('hello') // 'text' binding must resolve and render
  el.remove()
})

describe('observed attributes on THIRD-PARTY elements (tosijs#24 regression guard)', () => {
  test('a null-initialised observed property still reflects to the attribute', () => {
    class NullInit extends HTMLElement {
      static observedAttributes = ['count', 'label']
      count: any = null // typeof null === 'object' — must not look "declared"
      label: any = null
      changes: string[] = []
      attributeChangedCallback(name: string, _old: string, value: string) {
        this.changes.push(`${name}=${value}`)
      }
    }
    if (!customElements.get('null-init-widget')) {
      customElements.define('null-init-widget', NullInit)
    }
    const el = (elements as any).nullInitWidget({ count: 5, label: 'x' }) as any
    document.body.append(el)
    // the attribute is what a third-party widget renders from
    expect(el.getAttribute('count')).toBe('5')
    expect(el.changes).toContain('count=5')
    expect(el.getAttribute('label')).toBe('x')
    el.remove()
  })

  test('reactive updates keep reflecting (the elementPropBinding path)', async () => {
    class Reflecting extends HTMLElement {
      static observedAttributes = ['level']
      level: any = null
    }
    if (!customElements.get('reflecting-widget')) {
      customElements.define('reflecting-widget', Reflecting)
    }
    const { m1App } = tosi({ m1App: { level: 1 } })
    const el = (elements as any).reflectingWidget({ level: m1App.level }) as any
    document.body.append(el)
    await updates()
    expect(el.getAttribute('level')).toBe('1')
    // every later reactive update must keep going to the attribute
    ;(m1App as any).level = 9
    await updates()
    expect(el.getAttribute('level')).toBe('9')
    el.remove()
  })

  test('boolean attributes still toggle on third-party elements', () => {
    class Toggling extends HTMLElement {
      static observedAttributes = ['open']
      open: any = null
    }
    if (!customElements.get('toggling-widget')) {
      customElements.define('toggling-widget', Toggling)
    }
    const el = (elements as any).togglingWidget({ open: true }) as any
    document.body.append(el)
    expect(el.hasAttribute('open')).toBe(true)
    const off = (elements as any).togglingWidget({ open: false }) as any
    document.body.append(off)
    expect(off.hasAttribute('open')).toBe(false) // removal must still work
    el.remove()
    off.remove()
  })

  test('a tosijs Component still gets the declared-type routing (tosijs#24)', async () => {
    const { Component } = await import('./component')
    const errors: string[] = []
    const original = console.error
    console.error = (...args: any[]) => errors.push(args.map(String).join(' '))
    let el: any
    try {
      class Declared extends Component {
        static preferredTagName = 'declared-onoff'
        static initAttributes = { pointerEvents: 'on' }
        content = null
      }
      el = Declared.elementCreator()({ pointerEvents: false }) as any
      document.body.append(el)
    } finally {
      console.error = original
    }
    // declared string attr + boolean write = reported, not silently dropped
    expect(el.pointerEvents).not.toBe('on')
    expect(errors.some((e) => e.includes('tosijs#24'))).toBe(true)
    el.remove()
  })
})

describe('deprecation advice must be typeable and true (review M2, M3)', () => {
  /*
   * Nothing pinned these messages — `grep "is deprecated. Use {"` across the
   * test suite was empty — and two of the four told users to write props keys
   * that do not exist. Following the `bindEnabled` one literally produced
   * `<button disabled="">`: a non-empty string is truthy, so the advice
   * shipped a permanently DEAD CONTROL.
   */
  const capture = async (fn: () => void): Promise<string[]> => {
    const { _resetDeprecationWarnings } = await import('./metadata')
    _resetDeprecationWarnings()
    const seen: string[] = []
    const original = console.warn
    console.warn = (msg: any) => void seen.push(String(msg))
    try {
      fn()
    } finally {
      console.warn = original
    }
    return seen.filter((m) => m.includes('deprecated'))
  }

  test('NO bind* shortcut warns, in either form (1.9.1)', async () => {
    /*
     * The deprecation is gone, not narrowed.
     *
     * It warned for bindText/bindEnabled/bindDisabled on the rule "deprecated
     * iff a plain prop expresses it exactly" — which is sound, but made
     * deprecation-ness depend on the VALUE. TypeScript cannot express that, so
     * the typings carried no `@deprecated` while the runtime still warned:
     * a typings/runtime mismatch introduced while fixing the previous one, and
     * reported by tosijs-ui against the published 1.9.0.
     *
     * The nudge was worth little (`bindText` is barely more writing than
     * `textContent`) and the shortcut is the ONLY form that binds a path
     * string — so it was console spam in someone else's build for a stylistic
     * preference. It lives in the docs now.
     */
    const { advice } = tosi({ advice: { flag: true, items: ['a'], txt: 'hi' } })
    for (const props of [
      { bindText: 'advice.txt' },
      { bindText: advice.txt },
      { bindEnabled: 'advice.flag' },
      { bindEnabled: advice.flag },
      { bindDisabled: 'advice.flag' },
      { bindDisabled: advice.flag },
      { bindValue: advice.txt },
      { bindList: advice.items },
    ] as any[]) {
      expect(await capture(() => elements.div(props))).toEqual([])
    }
    // …and the REASON the string form could never have been deprecated is
    // still true: the naive plain-prop form really does kill the control
    const dead = elements.button('go', { disabled: 'advice.flag' }) as any
    expect(dead.disabled).toBe(true)
  })

  test('bindList does NOT warn — it is the primitive, not a deprecated shortcut', async () => {
    /*
     * `.tosi.listBinding()` is SUGAR that emits `{ bindList: … }`, so
     * deprecating `bindList` made the recommended API warn its own callers
     * from inside itself. The message could not even be written as a props
     * key ("Use { .tosi.listBinding(): ... }") because the suggested
     * replacement is a SPREAD, not a prop — a category error surfacing as
     * nonsense text.
     *
     * Routing around it, rather than questioning it, is what produced a
     * silent list-destroying `bind` collision at two addresses and a breaking
     * change to a documented public return shape. The other shortcuts have
     * real prop equivalents; this one does not.
     */
    tosi({ advice3: { items: ['a'] } })
    const msgs = await capture(() =>
      elements.div({ bindList: 'advice3.items' })
    )
    expect(msgs).toEqual([])
  })

  test('listBinding() emits bindList and warns about nothing', async () => {
    const { advice5 } = tosi({ advice5: { items: ['a', 'b'] } })
    const msgs = await capture(() => {
      const [props] = advice5.items.tosi.listBinding(
        ({ span }: any, item: any) => span({ textContent: item })
      )
      expect((props as any).bindList).toBeDefined()
    })
    expect(msgs).toEqual([])
  })

  test('a bare proxy child does not warn — create() is the most-used site', async () => {
    const { advice4 } = tosi({ advice4: { name: 'Ada' } })
    const msgs = await capture(() => {
      const el = elements.div(advice4.name)
      document.body.append(el)
    })
    expect(msgs).toEqual([])
  })
})

describe('positional arguments: values render, props apply, mistakes complain', () => {
  /*
   * The contents loop used to be "Element | Fragment | string | number is a
   * child; ANYTHING ELSE is a props bag". The props merge is Object.assign-
   * shaped, so handed something with no enumerable own properties it iterated
   * nothing, SUCCEEDED, and dropped the argument. `div(new Date())`,
   * `div(10n)` and `div(false)` all rendered empty with no warning, and
   * `div(items.map(…))` with the spread forgotten turned array INDICES into
   * attributes: <div 0="<span>a</span>">.
   *
   * That is silent failure, not "garbage being accepted" — the API dispatches
   * on what it is handed, and it was dispatching wrongly and saying nothing.
   */
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

  test('values with a text form render as text children', () => {
    const { div } = elements
    expect((div('hello') as any).textContent).toBe('hello')
    expect((div(42) as any).textContent).toBe('42')
    expect((div(10n as any) as any).textContent).toBe('10')
    // the owner's expectation: <div>false</div>, not an empty div. The
    // `cond && child` form is a React idiom and is not used here, so nothing
    // depends on booleans vanishing.
    expect((div(false as any) as any).textContent).toBe('false')
    expect((div(true as any) as any).textContent).toBe('true')
    expect((div(/re/ as any) as any).textContent).toBe('/re/')
    expect(
      (div(new Date('2026-01-02T03:04:05Z') as any) as any).textContent
    ).toContain('2026')
    expect(warnings).toEqual([])
  })

  test('null and undefined stay the nothing-signal', () => {
    const { div } = elements
    // conditional children are ternaries here, so these must remain silent
    expect(
      (div('a', null as any, 'b', undefined as any) as any).textContent
    ).toBe('ab')
    expect(warnings).toEqual([])
  })

  test('a Map is a props bag, allowed but never required', () => {
    const el = elements.div(
      new Map([
        ['title', 'from a map'],
        ['dataX', '1'],
      ]) as any
    ) as any
    expect(el.getAttribute('title')).toBe('from a map')
    expect(el.getAttribute('data-x')).toBe('1')
    expect(warnings).toEqual([])
  })

  test('an array complains instead of becoming indexed attributes', () => {
    const { div, span } = elements
    const el = div([span('a'), span('b')] as any) as any
    expect(el.getAttribute('0')).toBe(null) // was <div 0="<span>a</span>">
    expect(warnings.join(' ')).toContain('did you mean to spread it')
  })

  test('something that is neither a child nor props says so', () => {
    const el = elements.div(new WeakMap() as any) as any
    expect(el.outerHTML).toBe('<div></div>')
    expect(warnings.join(' ')).toContain('neither a child nor a props object')
  })

  test('a class instance carrying fields is still applied as props', () => {
    // preserved behaviour: config objects that are not plain objects
    const el = elements.div(
      new (class {
        title = 'kept'
      })() as any
    ) as any
    expect(el.getAttribute('title')).toBe('kept')
    expect(warnings).toEqual([])
  })
})
