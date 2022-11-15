import {elements, makeWebComponent} from '../../src/index'
import * as BABYLON from 'babylonjs'
import * as GUI from 'babylonjs-gui'
import { GLTFFileLoader } from 'babylonjs-loaders'
import { MeshAssetTask } from 'babylonjs'

BABYLON.SceneLoader.RegisterPlugin(new GLTFFileLoader())

const makeColor = (rgb: BABYLON.Color3 | BABYLON.Color4 | number[]): BABYLON.Color3 | BABYLON.Color4 => {
  if (Array.isArray(rgb)) {
    return rgb.length === 3 ? new BABYLON.Color3(...rgb) : new BABYLON.Color4(...rgb)
  }
  return rgb
}

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
    meshes: [] as BABYLON.Mesh[]
  },
  connectedCallback() {
    this.owner = this.closest('b-3d')
    if (this.owner != null) {
      const {scene} = this.owner
      const {name, url} = this
      const existingMeshes = [...scene.meshes]
      BABYLON.SceneLoader.Append(url, undefined, scene, (loaded) => {
        for(const mesh of loaded.meshes) {
          if (!existingMeshes.includes(mesh)) {
            this.meshes.push(mesh)
          }
        }
      })
    }
  },
  disconnectedCallback() {
    if (this.meshes != null) {
      for(const mesh of this.meshes) {
        mesh.dispose()
      }
      this.meshes.splice(0)
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

export const bLight = makeWebComponent('b-light', {
  attributes: {
    name: 'light',
    x: 0,
    y: 1,
    z: 0,
    intensity: 1,
  },
  props: {
    owner: null,
    light: null,
    diffuse: new BABYLON.Color3(1, 1, 1),
    specular: new BABYLON.Color3(0.5, 0.5, 0.5)
  },
  connectedCallback() {
    this.owner = this.closest('b-3d')
    if (this.owner != null) {
      this.light = new BABYLON.HemisphericLight(this.name, new BABYLON.Vector3(this.x, this.y, this.z), this.owner.scene)
    }
  },
  disconnectedCallback() {
    if (this.light) {
      this.light.dispose()
      this.owner = null
      this.light = null
    }
  },
  render () {
    if (this.light != null) {
      this.light.direction.x = this.x
      this.light.direction.y = this.y
      this.light.direction.z = this.z
      this.light.intensity = this.intensity
      this.light.diffuse = makeColor(this.diffuse)
      this.light.specular = makeColor(this.specular)
    }
  }
})

export const bSun = makeWebComponent('b-sun', {
  attributes: {
    name: 'sun',
    bias: 0.001,
    normalBias: 0.01,
    shadowMaxZ: 10,
    shadowMinZ: 0.01,
    shadowDarkness: 0.1,
    x: 0,
    y: -1,
    z: -0.5,
  },
  props: {
    owner: null,
    sun: null,
    shadowGenerator: null
  },
  methods: {
    addMeshes() {
      if (this.owner != null && this.sun !== null) {
        for(const mesh of this.owner.scene.meshes) {
          this.shadowGenerator.addShadowCaster(mesh);
          mesh.receiveShadows = true;
        }
      }
    },
  },
  connectedCallback() {
    this.owner = this.closest('b-3d')
    if (this.owner) {
      const sun = new BABYLON.DirectionalLight(this.name, new BABYLON.Vector3(this.x, this.y, this.z), this.owner.scene)
      const shadowGenerator = new BABYLON.ShadowGenerator(1024, sun)
      shadowGenerator.bias = this.bias
      shadowGenerator.normalBias = this.normalBias
      sun.shadowMaxZ = this.shadowMaxZ
      sun.shadowMinZ = this.shadowMinZ
      shadowGenerator.useContactHardeningShadow = true
      shadowGenerator.contactHardeningLightSizeUVRatio = 0.05
      shadowGenerator.setDarkness(this.shadowDarkness)
      this.sun = sun
      this.shadowGenerator = shadowGenerator
      this.addMeshes()
      setInterval(() => this.addMeshes(), 500)
    }
  },
  disconnectedCallback() {
    if (this.sun != null) {
      this.sun.dispose()
      this.shadowGenerator.dispose()
      this.sun = null
      this.shadowGenerator = null
    }
  },
  render () {
    if (this.sun != null) {
      this.sun.direction.x = this.x
      this.sun.direction.y = this.y
      this.sun.direction.z = this.z
    }
  }
})