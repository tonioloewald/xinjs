/**
# faux-slots example

This demonstrates the use of `<xin-slot>` to replicate the composition behavior
of `<slot>` elements when creating a web-component with no shadowDOM by
subclassing `xinjs`'s `Component` base class.
*/

import { Component, elements } from '../src'

const { fragment, h1, div, slot, xinSlot, button, span } = elements

class FauxSlots extends Component {
  clicks = 0
  isSlotted = true
  content = fragment(
    // this will automatically be converted to a `<xin-slot>` on hydration
    h1(slot({ name: 'heading' })),
    // in order to style this slot, we will explicitly create a `<xin-slot>`.
    div(
      xinSlot({
        style: {
          display: 'flex',
          gap: '10px',
          flexDirection: 'column',
          alignItems: 'flex-start',
        },
      })
    ),
    button({ part: 'clicker' }, 'I belong to the component'),
    span({ part: 'clickCount', style: { padding: '10px' } })
  )

  constructor() {
    super()
    this.initAttributes('clicks')
  }

  // note that if this function were declared inline then it would
  // get bound as an event handler multiple times, and in particular if
  // nested inside another web-component it is likely to be connected
  // multiple times.
  countClicks = () => {
    this.clicks += 1
    console.log(this.clicks)
  }

  connectedCallback() {
    super.connectedCallback()

    const { clicker } = this.parts
    clicker.addEventListener('click', this.countClicks)
  }

  render(): void {
    super.render()

    const { clickCount } = this.parts

    if (this.clicks > 0) {
      clickCount.textContent = `I have been clicked ${this.clicks} times`
    }
  }
}

export const fauxSlots = FauxSlots.elementCreator({ tag: 'faux-slots' })
