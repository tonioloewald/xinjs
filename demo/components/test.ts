import { Component } from '../../src/component'
import { elements, ElementPart } from '../../src'

const {div} = elements

class TeSt extends Component {
  prop = 17
  content = div('test')
}

export const teSt = TeSt.elementCreator() as (...parts: ElementPart[]) => TeSt

const test = teSt()

