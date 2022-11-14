import {elements, makeWebComponent} from '../../src/index'
import * as BABYLON from 'babylonjs'
import * as GUI from 'babylonjs-gui'
import { GLTFFileLoader } from 'babylonjs-loaders'

BABYLON.SceneLoader.RegisterPlugin(new GLTFFileLoader())

const {canvas, slot} = elements

export const b3d = makeWebComponent('b-3d', {
  style: {
    ':host': {
      display: 'block',
      position: 'relative',
      height: '100%',
      width: '100%'
    },
    ':host canvas': {
      width: '100%',
      height: '100%'
    }
  },
  props: {
    BABYLON,
    engine: null,
    scene: null,
    camera: null,
    gui: null,
  },
  content: [
    canvas({dataRef: 'canvas'}),
    slot()
  ],
  eventHandlers: {
    resize() {
      this.engine.resize()
    }
  },
  connectedCallback() {
    const {canvas} = this.elementRefs
    this.engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true})
    this.scene = new BABYLON.Scene(this.engine)
    this.camera = new BABYLON.ArcRotateCamera('camera1', 0, 0.8, 10, new BABYLON.Vector3(-1.5, 1, -1.5), this.scene)
    this.gui = new GUI.GUI3DManager(this.scene);
    this.camera.setTarget(BABYLON.Vector3.Zero())
    this.camera.attachControl(canvas, false)
    
    const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this.scene);
    
    this.engine.runRenderLoop(() => {
      this.scene.render()
    })    
  }
})

export const bSphere = makeWebComponent('b-sphere', {
  attributes: {
    name: 'sphere',
    segments: 16,
    diameter: 1,
    updateable: false,
    x: 0,
    y: 0,
    z: 0,
  },
  props: {
    owner: null,
    mesh: null,
  },
  connectedCallback () {
    this.owner = this.closest('b-3d')
    if (this.owner != null) {
      const {name, segments, diameter, updatable} = this
      this.mesh = BABYLON.CreateSphere(name, {
        segments,
        diameter,
        updatable
      }, this.owner.scene);
    }
  },
  disconnectedCallback () {
    this.mesh.dispose()
    this.mesh = null
    this.owner = null
  },
  render () {
    if (this.mesh?.position) {
      this.mesh.position.x = this.x
      this.mesh.position.y = this.y
      this.mesh.position.z = this.z
    }
  }
})

export const bGround = makeWebComponent('b-ground', {
  attributes: {
    name: 'ground',
    width: 4,
    height: 4,
    updatable: false,
    x: 0,
    y: 0,
    z: 0
  },
  props: {
    owner: null,
    mesh: null
  },
  connectedCallback () {
    this.owner = this.closest('b-3d')
    if (this.owner != null) {
      const {name, width, height, updatable} = this
      this.mesh = BABYLON.CreateGround(name, {
        width,
        height,
        updatable
      }, this.owner.scene);
    }
  },
  disconnectedCallback () {
    if (this.mesh != null) {
      this.mesh.dispose()
      this.mesh = null
      this.owner = null
    }
  },
  render () {
    if (this.mesh?.position) {
      this.mesh.position.x = this.x
      this.mesh.position.y = this.y
      this.mesh.position.z = this.z
    }
  }
})

export const bLoader = makeWebComponent('b-loader', {
  attributes: {
    name: 'mesh',
    url: 'https://b8rjs.com/test/omnidude.glb',
    updatable: false,
    scale: 1,
  },
  props: {
    owner: null,
    meshes: null
  },
  connectedCallback() {
    this.owner = this.closest('b-3d')
    if (this.owner != null) {
      const {scene} = this.owner
      const {name, url} = this
      BABYLON.SceneLoader.Append(url, undefined, scene);
    }
  },
  disconnectedCallback() {
    if (this.meshes != null) {
      for(const mesh of this.meshes) {
        mesh.dispose()
      }
      this.meshes = null
      this.owner = null
    }
  }
})

export const bButton = makeWebComponent('b-button', {
  attributes: {
    name: 'button',
    caption: 'click me',
    textColor: "#fff",
    fontSize: 40,
    x: 0,
    y: 0,
    z: 0
  },
  props: {
    gui: null,
    button: null,
    action: null
  },
  connectedCallback() {
    this.owner = this.closest('b-3d')
    if (this.owner != null) {
      const {gui} = this.owner
      const button = new GUI.Button3D(this.name)

      const caption = new GUI.TextBlock();
      caption.text = this.caption
      caption.color = this.textColor
      caption.fontSize = this.fontSize
      button.content = caption

      gui.addControl(button)
      this.gui = gui
      this.button = button

      button.onPointerUpObservable.add((eventData, eventState) => {
        if (this.action != null) {
          this.action(eventData, eventState)
        } else {
          console.warn('bButton clicked but has no assigned action')
        }
      })
    }
  },
  disconnectedCallback() {
    if(this.button) {
      this.gui.removeControl(this.button)
      this.gui = null
      this.button = null
    }
  },
  render () {
    if (this.button?.position) {
      this.button.position.x = this.x
      this.button.position.y = this.y
      this.button.position.z = this.z
    }
  }
})