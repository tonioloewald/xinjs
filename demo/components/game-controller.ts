import { makeWebComponent } from "../../src"

const keycode = evt => evt.code.replace(/Key|Digit/, '')

const CONTROL_DEFAULTS = Object.freeze({
  attack: 5,
  decay: 10,
  buttons: [],
  keys: []
})

export const gameController = makeWebComponent('game-controller', {
  attributes: {
    updateIntervalMs: 33
  },
  props: {
    controls: [
      {
        name: 'forward',
        keys: ['W', 'ArrowUp'],
        attack: 2,
        decay: 5,
      },
      {
        name: 'backward',
        keys: ['S', 'ArrowDown']
      },
      {
        name: 'left',
        keys: ['A', 'ArrowLeft']
      },
      {
        name: 'right',
        keys: ['D', 'ArrowRight']
      },
      {
        name: 'jump',
        keys: ['Space']
      },
      {
        name: 'shoot',
        buttons: [0]
      },
      {
        name: 'sneak',
        keys: ['Tab'],
        buttons: [1],
        type: 'toggle'
      },
      {
        name: 'sprint',
        keys: ['ShiftLeft']
      }
    ],
    state: {},
    pressedKeys: null,
    pressedButtons: null,
    interval: 0,
    lastUpdate: 0
  },
  methods: {
    handleKeyDown(event: KeyboardEvent) {
      this.pressedKeys.add(keycode(event))
      this.updateToggles()
    },
    handleKeyUp(event: KeyboardEvent) {
      this.pressedKeys.delete(keycode(event))
      this.updateToggles()
    },
    handleMouseDown(event: MouseEvent) {
      this.pressedButtons.add(event.button)
      this.updateToggles()
    },
    handleMouseUp(event: MouseEvent) {
      this.pressedButtons.delete(event.button)
      this.updateToggles()
    },
    updateToggles() {
      for(const control of this.controls.filter(control => control.type === 'toggle')) {
        if (control.keys.find(key => this.pressedKeys.has(key)) || control.buttons.find(button => this.pressedButtons.has(button))) {
          this.state[control.name] = 1 - this.state[control.name]
        }
      }
    },
    updateAxes() {
      const interval = (Date.now() - this.lastUpdate) * 0.001
      for(const control of this.controls.filter(control => control.type !== 'toggle')) {
        if (control.keys.find(key => this.pressedKeys.has(key)) || control.buttons.find(button => this.pressedButtons.has(button))) {
          this.state[control.name] = Math.min(1, this.state[control.name] + control.attack * interval)
        } else {
          this.state[control.name] = Math.max(0, this.state[control.name] - control.decay * interval)
        }
      }
      this.lastUpdate = Date.now()
      console.log(Object.keys(this.state).map(key => `${key}: ${this.state[key]}`).join(', '))
    }
  },
  connectedCallback() {
    this.pressedKeys = new Set()
    this.pressedButtons = new Set()
    this.controls.forEach(control => {
      Object.assign(control, {...CONTROL_DEFAULTS, ...control})
      this.state[control.name] = 0
    })
    this.lastUpdate = Date.now()
    this.interval = setInterval(this.updateAxes.bind(this), this.updateIntervalMs)
    document.body.addEventListener('keydown', this.handleKeyDown.bind(this))
    document.body.addEventListener('keyup', this.handleKeyUp.bind(this))
    document.body.addEventListener('mousedown', this.handleMouseDown.bind(this))
    document.body.addEventListener('mouseup', this.handleMouseUp.bind(this))
  },
  disconnectedCallback() {
    clearInterval(this.interval)
    this.interval = 0
  }
})
