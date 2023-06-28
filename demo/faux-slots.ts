/**
# faux-slots example

This demonstrates the use of `<xin-slot>` to replicate the composition behavior
of `<slot>` elements when creating a web-component with no shadowDOM by
subclassing `xinjs`'s `Component` base class.
*/

import { Component, elements } from '../src'

const { fragment, h1, div, slot, xinSlot } = elements

class FauxSlots extends Component {
  isSlotted = true
  content = fragment(
    // this will automatically be converted to a `<xin-slot>` on hydration
    h1(slot({name: 'heading'})),
    // in order to style this slot, we will explicitly create a `<xin-slot>`.
    div(xinSlot({style: { display: 'flex', flexDirection: 'column' }}))
  )
}

export const fauxSlots = FauxSlots.elementCreator({ tag: 'faux-slots' })