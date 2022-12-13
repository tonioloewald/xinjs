import {elements, Component, Color} from '../../src/index'
import * as BABYLON from 'babylonjs'
import * as GUI from 'babylonjs-gui'
import { GLTFFileLoader } from 'babylonjs-loaders'
import { SkyMaterial, WaterMaterial } from 'babylonjs-materials'
import waterbump from '../assets/waterbump.png'

export const RADIANS_TO_DEGREES = 180 / Math.PI
export const DEGREES_TO_RADIANS = Math.PI / 180
export type SceneAdditionHandler = (additions: SceneAdditions) => void

export type SceneAdditions = {
  meshes?: BABYLON.AbstractMesh[]
  lights?: BABYLON.Light[]
}

BABYLON.SceneLoader.RegisterPlugin(new GLTFFileLoader())
BABYLON.SceneLoaderFlags.ShowLoadingScreen = false

const {canvas, slot} = elements

export type AsyncVoidFunction = () => Promise<void>

export type XRParams = {
  cameraName?: string
  mode?: XRSessionMode
}

export type XRStuff = {
  camera: BABYLON.FreeCamera
  xrHelper: BABYLON.WebXRExperienceHelper
  sessionManager: BABYLON.WebXRSessionManager
  exitXR: AsyncVoidFunction
}

export function actualMeshes(meshes: BABYLON.AbstractMesh[]): BABYLON.Mesh[] {
  return meshes.filter(mesh => (mesh as BABYLON.Mesh).geometry != null) as BABYLON.Mesh[]
}

export async function enterXR(scene: BABYLON.Scene, options: XRParams = {}): Promise<XRStuff> {
  const {cameraName, mode} = Object.assign({cameraName: 'xr-camera', mode: 'immersive-vr'}, options)
  if (navigator.xr == null) {
    throw new Error('xr is not available')
  }
  if (!navigator.xr.isSessionSupported(mode)) {
    throw new Error(`navigator.xr does not support requested mode "${mode}"`)
  }
  const xrHelper = await BABYLON.WebXRExperienceHelper.CreateAsync(scene)
  const {camera} = xrHelper
  camera.name = cameraName
  xrHelper.onStateChangedObservable.add((state) => {
    switch(state) {
      case BABYLON.WebXRState.ENTERING_XR:
        console.log(`entering XR ${mode}`)
        break
      case BABYLON.WebXRState.IN_XR:
        console.log(`XR w${mode} active`)
        break
      case BABYLON.WebXRState.EXITING_XR:
        console.log(`leaving XR ${mode}`)
        break
      case BABYLON.WebXRState.NOT_IN_XR:
      default:
        console.log(`XR ${mode} inactive`)
    }
  })
  const sessionManager = await xrHelper.enterXRAsync(mode, 'local-floor')
  return {
    camera,
    xrHelper,
    sessionManager,
    async exitXR () {
      await xrHelper.exitXRAsync()
    }
  }
}

class B3d extends Component {
  styleNode = Component.StyleNode({
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
  })
  glowLayerIntensity = 0
  frameRate = 30

  engine: BABYLON.Engine
  scene: BABYLON.Scene
  camera?: BABYLON.Camera
  gui?: GUI.GUI3DManager
  renderInterval: number = 0
  lastRender: number
  sceneListeners: SceneAdditionHandler[] = []
  xrActive = false
  content = [ canvas(), slot() ]
  constructor() {
    super()
    this.initAttributes('glowLayerIntensity', 'frameRate', 'defaultCamera')
    this.lastRender = Date.now()
  }
  onSceneAddition(callback: SceneAdditionHandler): void {
    this.sceneListeners.push(callback)
    callback(this.scene)
  }
  offSceneAddition(callback: SceneAdditionHandler): void {
    const idx = this.sceneListeners.indexOf(callback)
    if (idx > -1) {
      this.sceneListeners.splice(idx, 1)
    }
  }
  register(sceneAdditions: SceneAdditions): void {
    const {meshes, lights} = sceneAdditions
    for(const callback of this.sceneListeners) {
      callback(sceneAdditions)
    }
  }
  setActiveCamera(camera: BABYLON.Camera, cameraOptions = {}): void {
    const {attach, preventDefault} = Object.assign({attach: true, preventDefault: false}, cameraOptions)
    const {canvas} = this.refs
    if (this.camera != null) {
      this.camera.dispose()
    }
    this.camera = camera
    this.scene.activeCamera = camera
    if (attach) {
      camera.attachControl(canvas, preventDefault)
    }
  }
  onResize() {
    this.engine.resize()
  }
  connectedCallback() {
    super.connectedCallback()
    const canvas = this.refs.canvas as HTMLCanvasElement
    this.engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true})
    this.scene = new BABYLON.Scene(this.engine)
    const camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(5, 1.5, 5), this.scene)
    camera.setTarget(BABYLON.Vector3.Zero())
    camera.attachControl(canvas, false)
    this.setActiveCamera(camera)

    this.gui = new GUI.GUI3DManager(this.scene)
    
    this.engine.runRenderLoop(() => {
      if (this.scene != null && !this.hidden) {
        const now = Date.now()
        if (this.xrActive || (now - this.lastRender >= 1000/this.frameRate)) {
          this.lastRender = now
          this.scene.render()
        }
      }
    })
  }
  render() {
    super.render()
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
}

export const b3d = B3d.elementCreator({tag: 'b-3d'})

export class AbstractMesh extends Component {
  name: string
  x = 0
  y = 0
  z = 0
  rx = 0
  ry = 0
  rz = 0
  owner?: B3d
  mesh?: BABYLON.Mesh
  constructor(name = 'mesh') {
    super()
    this.name = name
    this.initAttributes('x', 'y', 'z', 'rx', 'ry', 'rz')
  }
  connectedCallback() {
    super.connectedCallback()
    this.owner = this.closest('b-3d') as B3d
  }
  disconnectedCallback(): void {
    super.disconnectedCallback()
    if (this.mesh != null) {
      this.mesh.dispose()
      this.mesh = undefined
    }
    this.owner = undefined
  }
  get roll() {
    return this.rz
  }
  set roll(rz: number) {
    this.rz = rz
  }
  get pitch() {
    return this.rx
  }
  set pitch(rx: number) {
    this.rx = rx
  }
  get yaw() {
    return this.ry
  }
  set yaw(ry: number) {
    this.ry = ry
  }
  render () {
    super.render()
    if (this.mesh?.position) {
      this.mesh.position.x = this.x
      this.mesh.position.y = this.y
      this.mesh.position.z = this.z
      this.mesh.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(this.yaw * DEGREES_TO_RADIANS, this.pitch * DEGREES_TO_RADIANS, this.roll * DEGREES_TO_RADIANS);
    }
  }
}

class BSphere extends AbstractMesh {
  segments = 16
  diameter = 1
  updatable = false
  color = '#ff0000'
  material: BABYLON.StandardMaterial
  constructor(name = 'sphere') {
    super(name)
    this.initAttributes('segments', 'diameter', 'updateable')
  }
  connectedCallback(): void {
    super.connectedCallback()
    if (this.owner != null) {
      const {name, segments, diameter, updatable} = this
      const mesh = BABYLON.CreateSphere(name, {
        segments,
        diameter,
        updatable
      }, this.owner.scene)
      const material = new BABYLON.StandardMaterial(this.name + '-mat', this.owner.scene)
      material.diffuseColor = new BABYLON.Color3(...Color.fromCss(this.color).RGBA)
      mesh.material = material
      this.mesh = mesh
      this.owner.register({meshes: [this.mesh]})
    }
  }
}

export const bSphere = BSphere.elementCreator()

class BGround extends AbstractMesh {
  width = 4
  height = 4
  updatable = false
  constructor(name = 'ground') {
    super(name)
    this.initAttributes('width', 'height', 'updateable')
  }
  connectedCallback () {
    if (this.owner != null) {
      const {name, width, height, updatable} = this
      this.mesh = BABYLON.CreateGround(name, {
        width,
        height,
        updatable
      }, this.owner.scene);
      this.owner.register({meshes: this.mesh})
    }
  }
}

export const bGround = BGround.elementCreator()

class BReflections extends Component {
  refreshRate = 5
  constructor() {
    super()
    this.initAttributes('refreshRateMs')
  }
  owner?: B3d
  probes: BABYLON.ReflectionProbe[] = []
  #callback: SceneAdditionHandler
  makeReflectiveCallback(additions: SceneAdditions): void {
    if (this.owner == null) {
      return
    }
    const { meshes } = additions
    if ( meshes == null ) {
      return
    }
    for(const mesh of meshes) {
      if (mesh.name.includes('mirror')) {
        const material = mesh.material as BABYLON.StandardMaterial
        if (material != null) {
          const probe = new BABYLON.ReflectionProbe("main", 512, this.owner.scene)
          probe.name = mesh.name.replace(/mirror/g, 'probe')
          try {
            probe.attachToMesh(mesh)
            probe.refreshRate = this.refreshRate
            material.backFaceCulling = true
            material.reflectionTexture = probe.cubeTexture
            material.reflectionFresnelParameters = new BABYLON.FresnelParameters()
            material.reflectionFresnelParameters.bias = 0.02
            this.probes.push(probe)
          } catch (e) {
            console.error(`Failed to make "${mesh.name}" reflective:`, e)
          }
        } else {
          console.error(`Cannot make mesh "${mesh.name}" reflective: mesh has no material`)
        }
      } else {
        for(const probe of this.probes) {
          try {
            if (probe.renderList != null && !probe.renderList.includes(mesh)) {
              console.log(mesh.name, 'is being reflected')
              probe.renderList.push(mesh)
            }
          } catch(e) {
            console.error(`Cannot add mesh ${mesh.name} to reflection probe ${probe.name}, "${e}`, {probe, mesh})
          }
        }
      }
    }
  }
  connectedCallback() {
    super.connectedCallback()
    this.owner = this.closest('b-3d') as B3d
    if (this.owner != null) {
      this.#callback = this.makeReflectiveCallback.bind(this)
      this.owner.onSceneAddition(this.#callback)
    }
  }
  disconnectedCallback() {
    if (this.owner != null) {
      this.owner.offAddMesh(this.#callback)
      for(const probe of this.probes) {
        probe.dispose()
      }
      this.probes.splice(0)
      this.owner = undefined
    }
    super.disconnectedCallback()
  }
}

export const bReflections = BReflections.elementCreator()

class BLoader extends Component {
  url = ''
  constructor() {
    super()
    this.initAttributes('url')
  }
  owner?: B3d
  meshes?: BABYLON.AbstractMesh[]
  particleSystems?: BABYLON.ParticleSystem[]
  skeletons?: BABYLON.Skeleton[]
  animationGroups?: BABYLON.AnimationGroup[]
  lights?: BABYLON.Light[]
  lightIntensityScale = 0.05
  connectedCallback() {
    super.connectedCallback()
    this.owner = this.closest('b-3d') as B3d
    if (this.owner != null) {
      const {scene} = this.owner
      const {url} = this
      BABYLON.SceneLoader.ImportMeshAsync('', url, undefined, scene).then((result) => {
        const {meshes, particleSystems, skeletons, animationGroups, lights, transformNodes} = result
        Object.assign(this, {meshes, particleSystems, skeletons, animationGroups, lights})
        for(const mesh of meshes) {
          if (mesh.name.includes('-ignore')) {
            mesh.dispose()
          }
        }
        for (const node of transformNodes) {
          if (node.name.includes('-ignore')) {
            node.dispose()
          }
        }
        for(const light of lights) {
          if (light.name.includes('-ignore')) {
            light.dispose()
          } else if (light instanceof BABYLON.PointLight || light instanceof BABYLON.SpotLight) {
            light.intensity *= this.lightIntensityScale
          }
        }
        this.owner!.register({lights, meshes})
      })
    }
  }
  disconnectedCallback() {
    if (this.meshes != null) {
      for(const mesh of this.meshes) {
        mesh.dispose()
      }
      this.meshes = undefined
      this.owner = undefined
      super.disconnectedCallback()
    }
  }
}

export const bLoader = BLoader.elementCreator()

class BButton extends Component {
  caption = 'click me'
  textColor = '#ffffff'
  fontSize = 40
  x = 0
  y = 0
  z = 0
  constructor() {
    super()
    this.initAttributes('caption', 'textColor', 'fontSize', 'x', 'y', 'z')
  }
  owner?: B3d
  gui?: GUI.GUI3DManager
  action = (data: GUI.Vector3WithInfo, state: BABYLON.EventState) => {
    console.warn('<b-button> clicked but has no assigned action', data, state)
  }
  button?: GUI.Button3D
  connectedCallback(): void {
    super.connectedCallback()
    this.owner = this.closest('b-3d') as B3d
    const self = this
    if (this.owner != null && this.owner.gui != null) {
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
        self.action(eventData, eventState)
      })
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback()
    if(this.button != null && this.gui != null) {
      this.gui.removeControl(this.button)
      this.gui = undefined
      this.button = undefined
    }
    this.owner = undefined
  }
  render () {
    super.render()
    if (this.button?.position) {
      this.button.position.x = this.x
      this.button.position.y = this.y
      this.button.position.z = this.z
    }
  }
}

export const bButton = BButton.elementCreator()

class BLight extends Component {
  name: string = 'light'
  position = BABYLON.Vector3.Zero()
  direction = BABYLON.Vector3.Down()
  intensity = 1
  owner?: B3d
  light?: BABYLON.Light
  diffuse = '#ffffff'
  specular = '#808080'
  constructor(name = 'light') {
    super()
    this.name = name
    this.initAttributes('intensity')
  }
  connectedCallback() {
    super.connectedCallback()
    this.owner = this.closest('b-3d') as B3d
    if (this.owner != null) {
      this.light = new BABYLON.HemisphericLight(this.name, new BABYLON.Vector3(this.x, this.y, this.z), this.owner.scene)
    }
  }
  disconnectedCallback() {
    if (this.light != null) {
      this.light.dispose()
      this.light = undefined
    }
    this.owner = undefined
    super.disconnectedCallback()
  }
  render () {
    super.render()
    if (this.light != null) {
      (this.light as BABYLON.DirectionalLight).direction = this.direction
      this.light.intensity = this.intensity
      this.light.diffuse = BABYLON.Color3.FromHexString(this.diffuse)
      this.light.specular = BABYLON.Color3.FromHexString(this.specular)
    }
  }
}

export const bLight = BLight.elementCreator()

class BSun extends Component {
  name: string
  bias = 0.001
  normalBias = 0.01
  shadowMaxZ = 50
  shadowMinZ = 0.01
  shadowDarkness = 0.1
  shadowTextureSize = 1024
  activeDistance = 10
  frustumEdgeFalloff = 0
  forceBackFacesOnly = true
  x = 0
  y = -1
  z = -0.5
  updateIntervalMs = 1000
  constructor(name = 'sun') {
    super()
    this.name = name
    this.initAttributes('bias', 'normalBias', 'shadowMaxZ', 'shadowMinZ', 'shadowDarkness', 'shadowTextureSize', 'activeDistance', 'frustrumEdgeFalloff', 'forceBackFacesOnly')
  }
  owner?: B3d
  light?: BABYLON.DirectionalLight
  shadowGenerator?: BABYLON.ShadowGenerator
  shadowCasters:BABYLON.Mesh[] = []
  activeShadowCasters: BABYLON.Mesh[] = []
  interval = 0
  #callback: SceneAdditionHandler
  shadowCallback(additions: SceneAdditions): void {
    const {meshes} = additions
    if (meshes == null) {
      return
    }
    for(const mesh of actualMeshes(meshes)) {
      if (!mesh.name.includes('nocast') && !this.shadowCasters.includes(mesh)) {
        this.shadowCasters.push(mesh)
      }
      mesh.receiveShadows = !mesh.name.includes('noshadow')
    }
  }
  #update: VoidFunction
  update() {
    if (this.light == null || this.owner!.camera == null) {
      return
    }
    const camera = this.owner!.camera as BABYLON.UniversalCamera
    const target: BABYLON.Vector3 = camera.target != null ? camera.target : camera.position
    this.light.position.x = target.x
    this.light.position.y = target.y + 10
    this.light.position.z = target.z
    for(const mesh of this.shadowCasters) {
      const distance = mesh.getAbsolutePosition().subtract(target).length()
      if (distance < this.activeDistance) {
        if (!this.activeShadowCasters.includes(mesh)) {
          this.activeShadowCasters.push(mesh)
          this.shadowGenerator!.addShadowCaster(mesh)
        }
      } else {
        const idx = this.activeShadowCasters.indexOf(mesh)
        if (idx > -1) {
          this.activeShadowCasters.splice(idx, 1)
          this.shadowGenerator!.removeShadowCaster(mesh)
        }
      }
    }
  }
  connectedCallback() {
    super.connectedCallback()
    this.owner = this.closest('b-3d') as B3d
    if (this.owner != null) {
      this.#update = this.update.bind(this)
      this.interval = setInterval(this.#update, this.updateIntervalMs)
      const light = new BABYLON.DirectionalLight(this.name, new BABYLON.Vector3(this.x, this.y, this.z), this.owner.scene)
      const shadowGenerator = new BABYLON.ShadowGenerator(this.shadowTextureSize, light)
      /*
      shadowGenerator.useExponentialShadowMap = true
      shadowGenerator.usePoissonSampling = true
      */
      this.light = light
      this.shadowGenerator = shadowGenerator
      this.#callback = this.shadowCallback.bind(this)
      this.owner.onSceneAddition(this.#callback)
    }
  }
  disconnectedCallback() {
    if (this.light != null) {
      this.clearInterval(this.interval)
      this.interval = 0
      this.light.dispose()
      this.light = undefined
      this.shadowGenerator = undefined
      this.potentialShadowCasters.splice(0)
    }
    this.owner = undefined
    super.disconnectedCallback()
  }
  render () {
    super.render()
    if (this.light != null && this.shadowGenerator != null) {
      const {light, shadowGenerator} = this
      light.direction.x = this.x
      light.direction.y = this.y
      light.direction.z = this.z
      shadowGenerator.bias = this.bias
      shadowGenerator.normalBias = this.normalBias
      light.shadowMaxZ = this.shadowMaxZ
      light.shadowMinZ = this.shadowMinZ
      shadowGenerator.useContactHardeningShadow = true
      shadowGenerator.contactHardeningLightSizeUVRatio = 0.05
      shadowGenerator.frustumEdgeFalloff = this.frustumEdgeFalloff
      shadowGenerator.forceBackFacesOnly = this.forceBackFacesOnly
      shadowGenerator.setDarkness(this.shadowDarkness)
    }
  }
}

export const bSun = BSun.elementCreator()

class BSkybox extends AbstractMesh {
  turbidity = 10
  luminance = 1
  azimuth = 0
  latitude = 40 // -90 south pole to 0 equator to 90 north pole
  realtimeScale = 10 // rate at which to automatically advance timeOfDay
  updateFrequencyMs = 250
  sunColor = '#eef'
  duskColor = '#fa2'
  moonColor = '#88f'
  moonIntensity = 0.05
  timeOfDay = 6.5 // 24h clock time
  rayleigh = 2
  mieDirectionalG = 0.8
  mieCoefficient = 0.005
  size = 1000
  constructor(name = 'skybox') {
    super(name)
    this.initAttributes('turbidity', 'luminance', 'latitude', 'realtimeScale', 'sunColor', 'duskColor', 'moonColor', 'moonIntensity', 'timeOfDay', 'rayleigh', 'mieDirectionalG', 'mieCoefficient', 'size')
  }
  interval = 0
  update() {
    if (this.mesh?.material) {
      const material = this.mesh.material as SkyMaterial
      const latitude = this.latitude * DEGREES_TO_RADIANS
      const sunVector = new BABYLON.Vector3(0, 100, 0)
      const axis = new BABYLON.Vector3(Math.sin(latitude), 0, Math.cos(latitude))
      const t =  ((this.timeOfDay + 30) % 12 / 12) * 1.04 - 0.52 // -0.52..0.52 so the sun overshoots the horizon
      const rotTime = BABYLON.Quaternion.RotationAxis(axis, t * Math.PI)
      const isDay = this.timeOfDay > 6 && this.timeOfDay < 18
      sunVector.rotateByQuaternionToRef(rotTime, sunVector)
      material.luminance = this.luminance
      material.azimuth = this.azimuth
      material.mieDirectionalG = this.mieDirectionalG
      material.mieCoefficient = this.mieCoefficient
      if (this.owner != null) {
        const sun = this.owner.querySelector('b-sun') as BSun
        if (sun?.light != null) {
          const {light} = sun
          material.sunPosition = sunVector
          light.direction = sunVector.scale(-1)
          const intensity = Math.min(Math.abs((t + 0.52) * 10), Math.abs((t - 0.52) * 10), 1)
          if (isDay) {
            const color = Color.fromCss(this.duskColor).blend(Color.fromCss(this.sunColor), intensity)
            light.diffuse = new BABYLON.Color3(...color.RGBA)
            light.intensity = intensity
            material.rayleigh = this.rayleigh
            material.turbidity = this.turbidity
          } else {
            const color = Color.fromCss(this.moonColor)
            light.diffuse = new BABYLON.Color3(...color.RGBA)
            light.intensity = intensity * this.moonIntensity
            material.rayleigh = this.rayleigh * this.moonIntensity
            material.turbidity = this.turbidity * this.moonIntensity
          }
        }
      }
    }
  }
  connectedCallback() {
    super.connectedCallback()
    this.lastUpdate = Date.now()
    if (this.owner != null) {
      this.interval = setInterval(() => {
        this.timeOfDay = (this.timeOfDay + this.realtimeScale * this.updateFrequencyMs * 1e-6
          ) / 24 % 1 * 24
      }, this.updateFrequencyMs)
      const {size} = this
      const material = new SkyMaterial('skybox', this.owner.scene)
      material.backFaceCulling = false
      material.useSunPosition = true
      this.update()
      this.mesh = BABYLON.CreateBox('skybox', { size, sideOrientation: BABYLON.Mesh.BACKSIDE }, this.owner.scene)
      this.mesh.material = material
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback()
    clearInterval(this.interval)
  }
  render() {
    super.render()
    this.update()
  }
}

export const bSkybox = BSkybox.elementCreator()

class BWater extends AbstractMesh {
  spherical = false
  size = 128
  subdivisions = 32
  textureSize = 1024
  twoSided = false
  normalMap = waterbump
  windForce = -5
  waveHeight = 0
  bumpHeight = 0.1
  waveLength = 0.1
  waterColor = '#06c'
  colorBlendFactor = 0.1
  constructor(name = 'water') {
    super(name)
    this.initAttributes('spherical', 'size', 'subdivisions', 'textureSize', 'twoSided', 'normalMap', 'windForce', 'waveHeight', 'bumpHeight', 'waveLength', 'waterColor', 'colorBlendFactor')
  }

  material?: WaterMaterial
  windDirection = {x: 0.6, y: 0.8}
  #callback: SceneAdditionHandler
  waterCallback(additions: SceneAdditions) {
    const {meshes} = additions
    if (meshes == null) {
      return
    }
    for (const mesh of meshes) {
      if (!mesh.name.includes('water')) {
        this.material!.addToRenderList(mesh)
      }
    }
  }
  update() {
    if (this.material != null) {
      const {twoSided, normalMap, windForce, windDirection, waveHeight, bumpHeight, waveLength, waterColor, colorBlendFactor, x, y, z} = this
      this.material.backFaceCulling = !twoSided
      this.material.bumpTexture = new BABYLON.Texture(normalMap, this.owner!.scene)
      this.material.windForce = windForce
      this.material.windDirection = new BABYLON.Vector2(windDirection.x, windDirection.y)
      this.material.waveHeight = waveHeight
      this.material.waveLength = waveLength
      this.material.bumpHeight = bumpHeight
      if (colorBlendFactor > 0) {
        const color = Color.fromCss(waterColor)
        this.material.waterColor = new BABYLON.Color3(...color.RGBA)
      }
      this.material.colorBlendFactor = colorBlendFactor
    }
  }
  connectedCallback(): void {
    super.connectedCallback()
    if (this.owner != null) {
      const {size, subdivisions, textureSize, spherical} = this
      if (spherical) {
        this.mesh = BABYLON.CreateSphere('water-nocast', {segments: this.subdivisions, diameter: this.size}, this.owner.scene)
      } else {
        this.mesh = BABYLON.CreateGround('water-nocast', {width: size, height: size, subdivisions}, this.owner.scene)
      }
      this.material = new WaterMaterial('water', this.owner.scene, new BABYLON.Vector2(textureSize, textureSize))
      this.update()
      this.mesh.material = this.material
      this.#callback = this.waterCallback.bind(this)
      this.owner.onSceneAddition(this.#callback)
    }
  }
  disconnectedCallback(): void {
    if (this.owner) {
      this.owner.offAddMesh(this.#callback)
    }
    this.material = undefined
    super.disconnectedCallback()
  }
  render() {
    super.render()
    this.update()
  }
}

export const bWater = BWater.elementCreator()
