import { Component } from './component'
import { elements } from './elements'

const { span, slot } = elements

type TestExpression = () => Promise<boolean> | boolean

export class XinTest extends Component {
  test: TestExpression = () => true
  delay = 0
  statis = ''
  expect = true

  static delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  static styleSpec = {
    ':host': {
      display: 'flex',
      gap: '5px',
      alignItems: 'center',
    },
    ':host [part="outcome"]': {
      display: 'inline-block',
      borderRadius: '99px',
      padding: '0 12px',
      fontSize: '80%',
    },
    ':host .waiting': {
      background: '#ff04',
    },
    ':host .running': {
      background: '#f804',
    },
    ':host .success': {
      background: '#0f04',
    },
    ':host .failed': {
      background: '#f004',
    },
    ':host .exception': {
      color: 'white',
      background: 'red',
    },
  }

  private timeout?: number

  content = [span({ part: 'description' }, slot()), span({ part: 'outcome' })]

  constructor() {
    super()
    this.initAttributes('description', 'delay', 'status')
  }

  run = () => {
    clearTimeout(this.timeout)
    this.status = 'waiting'
    this.timeout = setTimeout(async () => {
      this.status = 'running'
      try {
        const outcome = JSON.stringify(await this.test())
        if (outcome === JSON.stringify(this.expect)) {
          this.status = 'success'
        } else {
          this.status = `failed: got ${outcome}, expected ${this.expect}`
        }
      } catch (err) {
        this.status = `exception: ${err}`
      }
    }, this.delay)
  }

  connectedCallback() {
    super.connectedCallback()
    this.run()
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    this.class
    clearTimeout(this.timeout)
  }

  render(): void {
    super.render()
    const { outcome } = this.parts
    outcome.textContent = this.status
    outcome.setAttribute('class', this.status.match(/\w+/)[0])
  }
}

export const xinTest = XinTest.elementCreator({ tag: 'xin-test' })
