import {elements, makeWebComponent, Color} from '../../src/index'
import * as BABYLON from 'babylonjs'
import * as GUI from 'babylonjs-gui'
import { SkyMaterial } from 'babylonjs-materials'
import { GLTFFileLoader } from 'babylonjs-loaders'

BABYLON.SceneLoader.RegisterPlugin(new GLTFFileLoader())
BABYLON.SceneLoaderFlags.ShowLoadingScreen = false

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
  attributes: {
    glowLayerIntensity: 0,
    frameRate: 90
  },
  props: {
    BABYLON,
    engine: null,
    scene: null,
    camera: null,
    gui: null,
    shadowGenerators: [],
    renderInterval: null
  },
  content: [
    canvas({dataRef: 'canvas'}),
    slot()
  ],
  methods: {
    async addShadowGenerator(generator: BABYLON.ShadowGenerator) {
      if (!this.shadowGenerators.includes(generator)) {
        this.shadowGenerators.push(generator)
        this.processMeshes(...this.scene.meshes)
      }
    },
    async removeShadowGenerator(generator: BABYLON.ShadowGenerator) {
      const idx = this.shadowGenerators.findIndex(generator)
      if (idx > -1) {
        this.shadowGenerators.splice(idx, 1)
      }
    },
    async processMeshes(...meshes: BABYLON.Mesh[]) {
      for (const mesh of meshes) {
        for(const generator of this.shadowGenerators) {
          generator.addShadowCaster(mesh)
        }
      }
    },
    renderFrame() {
      if(this.scene) {
        if (!this.hidden) {
          this.scene.render()
        }
        setTimeout(() => this.renderFrame(), 1000 / this.frameRate)
      }
    }
  },
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
    
    this.renderFrame()  
  },
  render() {
    if (this.glowLayerIntensity > 0) {
      if (!this.glowLayer) {
        this.glowLayer = new BABYLON.GlowLayer("glow", this.scene)
      }
      this.glowLayer.intensity = this.glowLayerIntensity
    } else if (this.glowLayer) {
      this.glowLayer.dispose()
      this.glowLayer = null
    }
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
    receiveShadows: true
  },
  connectedCallback () {
    this.owner = this.closest('b-3d')
    if (this.owner != null) {
      const {name, segments, diameter, updatable} = this
      this.mesh = BABYLON.CreateSphere(name, {
        segments,
        diameter,
        updatable
      }, this.owner.scene)
      this.owner.processMeshes(this.mesh)
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
      this.mesh.receiveShadows = this.receiveShadows
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
    mesh: null,
    receiveShadows: true,
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
      this.owner.processMeshes(this.mesh)
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
      this.mesh.receiveShadows = this.receiveShadows
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
    meshes: [] as BABYLON.Mesh[],
    reflective: [],
    probes: [],
    receiveShadows: true
  },
  methods: {
    makeReflective(mesh: BABYLON.Mesh) {
      const material = mesh.material as BABYLON.StandardMaterial
      if (material != null) {
        const probe = new BABYLON.ReflectionProbe("main", 512, this.owner.scene)
        try {
          probe.attachToMesh(mesh)
          for(const reflected of this.owner.scene.meshes) {
            if (reflected !== mesh) {
              probe.renderList?.push(reflected)
            }
          }
          material.reflectionTexture = probe.cubeTexture
          material.reflectionFresnelParameters = new BABYLON.FresnelParameters()
          material.reflectionFresnelParameters.bias = 0.02
          this.probes.push(probe)
        } catch (e) {
          console.log(e)
        }
      }
    }
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
            mesh.receiveShadows = this.receiveShadows
            if (this.reflective.includes(mesh.name)) {
              this.makeReflective(mesh)
            }
          }
        }
        this.owner.processMeshes(...this.meshes)
      })
    }
  },
  disconnectedCallback() {
    if (this.meshes != null) {
      for(const mesh of this.meshes) {
        mesh.dispose()
      }
      for(const probe of this.probes) {
        probe.dispose()
      }
      this.meshes.splice(0)
      this.probes.splice(0)
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
      this.light = null
    }
    this.owner = null
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
    shadowTextureSize: 1024,
    x: 0,
    y: -1,
    z: -0.5,
  },
  props: {
    owner: null,
    sun: null,
    shadowGenerator: null
  },
  connectedCallback() {
    this.owner = this.closest('b-3d')
    if (this.owner) {
      const sun = new BABYLON.DirectionalLight(this.name, new BABYLON.Vector3(this.x, this.y, this.z), this.owner.scene)
      const shadowGenerator = new BABYLON.ShadowGenerator(this.shadowTextureSize, sun)
      this.sun = sun
      this.shadowGenerator = shadowGenerator
      this.owner.addShadowGenerator(this.shadowGenerator)
    }
  },
  disconnectedCallback() {
    if (this.sun != null) {
      this.sun.dispose()
      this.owner.removeShadowGenerator(this.shadowGenerator)
      this.sun = null
      this.shadowGenerator = null
    }
    this.owner = null
  },
  render () {
    if (this.sun != null) {
      const {sun, shadowGenerator} = this
      sun.direction.x = this.x
      sun.direction.y = this.y
      sun.direction.z = this.z
      shadowGenerator.bias = this.bias
      shadowGenerator.normalBias = this.normalBias
      sun.shadowMaxZ = this.shadowMaxZ
      sun.shadowMinZ = this.shadowMinZ
      shadowGenerator.useContactHardeningShadow = true
      shadowGenerator.contactHardeningLightSizeUVRatio = 0.05
      shadowGenerator.setDarkness(this.shadowDarkness)
    }
  }
})

export const bSkybox = makeWebComponent('b-skybox', {
  attributes: {
    turbidity: 10,
    luminance: 1,
    timeOfDay: 10.5, // 24h clock time
    latitude: 40, // -90 south pole to 0 equator to 90 north pole
    realtimeScale: 100, // rate at which to automatically advance timeOfDay
    sunColor: '#eef',
    duskColor: '#ff0',
    moonColor: '#88f'
  },
  props: {
    owner: null,
    skybox: null,
    material: null,
    raleigh: 2,
    mieDirectionalG: 0.8,
    mieCoefficient: 0.005,
    size: 1000,
    interval: null,
  },
  methods: {
    update() {
      if (this.skybox?.material) {
        const { material } = this.skybox
        const latitude = this.latitude * Math.PI / 180
        const sunVector = new BABYLON.Vector3(0, 100, 0)
        const axis = new BABYLON.Vector3(Math.sin(latitude), 0, Math.cos(latitude))
        const rotTime = BABYLON.Quaternion.RotationAxis(axis, (this.timeOfDay + 12) * Math.PI / 12)
        sunVector.rotateByQuaternionToRef(rotTime, sunVector)
        material.sunPosition = sunVector
        material.luminance = this.luminance
        material.inclination = this.inclination
        material.azimuth = this.azimuth
        material.mieDirectionalG = this.mieDirectionalG
        material.mieCoefficient = this.mieCoefficient
        if (this.owner != null) {
          const sun = this.owner.querySelector('b-sun')
          if (sun != null) {
            if (this.timeOfDay > 6 && this.timeOfDay < 18) {
              sun.intensity = this.timeOfDay < 7 ? this.timeOfDay -6 : this.timeOfDay > 17 ? -(this.timeOfDay - 18) : 1
              const color = Color.fromCss(this.sunColor).blend(Color.fromCss(this.duskColor), 1 - sun.intensity)
              sun.sun.diffuse = new BABYLON.Color3(color.r/255, color.g/255, color.b/255)
              sun.sun.direction.x = -sunVector.x
              sun.sun.direction.y = -sunVector.y
              sun.sun.direction.z = -sunVector.z
            } else {
              const color = Color.fromCss(this.moonColor)
              sun.intensity = (6 - (this.timeOfDay + 6) % 12) / 24
              sun.sun.diffuse = new BABYLON.Color3(color.r/255, color.g/255, color.b/255)
              sun.sun.direction.x = sunVector.x
              sun.sun.direction.y = sunVector.y
              sun.sun.direction.z = sunVector.z
            }
          }
        }
      }
    }
  },
  connectedCallback() {
    this.interval = setInterval(() => {
      this.timeOfDay = (this.timeOfDay + this.realtimeScale / 14400) / 24 % 1 * 24
    }, 100)
    this.owner = this.closest('b-3d')
    if (this.owner) {
      const {size} = this
      const material = new SkyMaterial('skybox', this.owner.scene)
      material.backFaceCulling = false
      material.useSunPosition = true
      this.update()
      this.skybox = BABYLON.CreateBox('skybox', { size, sideOrientation: BABYLON.Mesh.BACKSIDE }, this.owner.scene)
      this.skybox.material = material
    }
  },
  disconnectedCallback() {
    if (this.skybox != null) {
      this.skybox.dispose()
      this.skybox = null
    }
    clearInterval(this.interval)
    this.owner = null
  },
  render() {
    this.update()
  }
})

export const bWater = makeWebComponent('b-water', {
  attributes: {
    spherical: false,
    subdivisions: 16,
  },
})