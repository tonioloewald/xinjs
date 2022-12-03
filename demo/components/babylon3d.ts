import {elements, makeWebComponent, Color} from '../../src/index'
import * as BABYLON from 'babylonjs'
import * as GUI from 'babylonjs-gui'
import { SkyMaterial, WaterMaterial } from 'babylonjs-materials'
import { GLTFFileLoader } from 'babylonjs-loaders'
import waterbump from '../assets/waterbump.png'

type MeshHandler = (...meshes: BABYLON.Mesh[]) => void

BABYLON.SceneLoader.RegisterPlugin(new GLTFFileLoader())
BABYLON.SceneLoaderFlags.ShowLoadingScreen = false

const {canvas, slot} = elements

type AsyncVoidFunction = () => Promise<void>

type XRParams = {
  cameraName?: string
  mode?: XRSessionMode
}

type XRStuff = {
  camera: BABYLON.FreeCamera
  xrHelper: BABYLON.WebXRExperienceHelper
  sessionManager: BABYLON.WebXRSessionManager
  exitXR: AsyncVoidFunction
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
    frameRate: 30,
  },
  props: {
    engine: null,
    scene: null,
    camera: null,
    gui: null,
    renderInterval: null,
    lastRender: Date.now(),
    addMeshListeners: [] as MeshHandler[],
    xrActive: false
  },
  content: [
    canvas({dataRef: 'canvas'}),
    slot()
  ],
  methods: {
    onAddMesh(callback: MeshHandler) {
      this.addMeshListeners.push(callback)
      callback(...this.scene.meshes.filter(mesh => mesh.geometry != null))
    },
    offAddMesh(callback: MeshHandler) {
      const idx = this.addMeshListeners.indexOf(callback)
      if (idx > -1) {
        this.addMeshListeners.splice(idx, 1)
      }
    },
    addMesh(...meshes: BABYLON.Mesh[]) {
      for(const callback of this.addMeshListeners) {
        callback(...meshes.filter(mesh => mesh.geometry != null))
      }
    },
    setActiveCamera(camera: BABYLON.Camera, cameraOptions) {
      const {attach, preventDefault} = Object.assign({attach: true, preventDefault: false}, cameraOptions)
      const {canvas} = this.elementRefs
      if (this.camera != null) {
        this.camera.dispose()
      }
      this.camera = camera
      this.scene.activeCamera = camera
      if (attach) {
        camera.attachControl(canvas, preventDefault)
      }
    },
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
    this.setActiveCamera(new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(5, 1.5, 5), this.scene))
    this.gui = new GUI.GUI3DManager(this.scene);
    this.camera.setTarget(BABYLON.Vector3.Zero())
    this.camera.attachControl(canvas, false)
    
    this.engine.runRenderLoop(() => {
      if (this.scene != null && !this.hidden) {
        const now = Date.now()
        if (this.xrActive || (now - this.lastRender >= 1000/this.frameRate)) {
          this.lastRender = now
          this.scene.render()
        }
      }
    })
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
      this.owner.addMesh(this.mesh)
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
    z: 0,
  },
  props: {
    owner: null,
    mesh: null,
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
      this.owner.addMesh(this.mesh)
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

export const bReflections = makeWebComponent('b-reflections', {
  props: {
    owner: null,
    probes: [],
    refreshRate: 4
  },
  methods: {
    makeReflectiveCallback(...meshes: BABYLON.Mesh[]) {
      for(const mesh of meshes) {
        if (mesh.name.includes('mirror')) {
          const material = mesh.material as BABYLON.StandardMaterial
          if (material != null) {
            const probe = new BABYLON.ReflectionProbe("main", 512, this.owner.scene)
            probe.name = mesh.name.replace(/mirror/g, 'probe')
            probe.refreshRate = this.refreshRate
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
              console.error(`Failed to make "${mesh.name}" reflective:`, e)
            }
          } else {
            console.error(`Cannot make mesh "${mesh.name}" reflective: mesh has no material`)
          }
        } else {
          for(const probe of this.probes) {
            try {
              if (probe.addToRenderList != null && !probe.renderList.includes(mesh)) {
                probe.addToRenderList(mesh)
              }
            } catch(e) {
              console.error(`Cannot add mesh ${mesh.name} to reflection probe ${probe.name}, "${e}`, {probe, mesh})
            }
          }
        }
      }
    }
  },
  connectedCallback() {
    this.owner = this.closest('b-3d')
    if (this.owner != null) {
      this._callback = this.makeReflectiveCallback.bind(this)
      this.owner.onAddMesh(this._callback)
    }
  },
  disconnectedCallback() {
    if (this.owner != null) {
      this.owner.offAddMesh(this._callback)
      for(const probe of this.probes) {
        probe.dispose()
      }
      this.probes.splice(0)
      this.owner = null
    }
  }
})

export const bLoader = makeWebComponent('b-loader', {
  attributes: {
    url: 'https://b8rjs.com/test/omnidude.glb',
  },
  props: {
    owner: null,
    assetContainer: null,
    meshes: null,
    particleSystems: null,
    skeletons: null,
    animationGroups: null,
  },
  connectedCallback() {
    this.owner = this.closest('b-3d')
    if (this.owner != null) {
      const {scene} = this.owner
      const {url} = this
      BABYLON.SceneLoader.ImportMesh('', url, undefined, scene, (meshes, particleSystems, skeletons, animationGroups) => {
        Object.assign(this, {meshes, particleSystems, skeletons, animationGroups})
        this.owner.addMesh(...meshes)
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
  },
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
    diffuse: '#ffffff',
    specular: '#888888'
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
      this.light.diffuse = BABYLON.Color3.FromHexString(this.diffuse)
      this.light.specular = BABYLON.Color3.FromHexString(this.specular)
    }
  }
})

export const bSun = makeWebComponent('b-sun', {
  attributes: {
    name: 'sun',
    bias: 0.001,
    normalBias: 0.01,
    shadowMaxZ: 50,
    shadowMinZ: 0.01,
    shadowDarkness: 0.1,
    shadowTextureSize: 1024,
    activeDistance: 10,
    frustumEdgeFalloff: 0,
    forceBackFacesOnly: true,
    x: 0,
    y: -1,
    z: -0.5,
    updateIntervalMs: 100,
  },
  props: {
    owner: null,
    light: null,
    shadowGenerator: null,
    shadowCasters: [],
    activeShadowCasters: [],
    interval: 0,
  },
  methods: {
    shadowCallback(...meshes: BABYLON.Mesh[]) {
      for(const mesh of meshes.filter(mesh => mesh.geometry != null)) {
        if (!mesh.name.includes('nocast') && !this.shadowCasters.includes(mesh)) {
          this.shadowCasters.push(mesh)
        }
        mesh.receiveShadows = !mesh.name.includes('noshadow')
      }
    },
    update() {
      if (this.light != null && this.owner.camera != null) {
        this.light.position.x = this.owner.camera.target.x
        this.light.position.y = this.owner.camera.target.y + 10
        this.light.position.z = this.owner.camera.target.z
      }
      for(const mesh of this.shadowCasters) {
        const distance = mesh.getAbsolutePosition().subtract(this.owner.scene.activeCamera.target).length()
        if (distance < this.activeDistance) {
          if (!this.activeShadowCasters.includes(mesh)) {
            this.activeShadowCasters.push(mesh)
            this.shadowGenerator.addShadowCaster(mesh)
          }
        } else {
          const idx = this.activeShadowCasters.indexOf(mesh)
          if (idx > -1) {
            this.activeShadowCasters.splice(idx, 1)
            this.shadowGenerator.removeShadowCaster(mesh)
          }
        }
      }
    },
  },
  connectedCallback() {
    this.owner = this.closest('b-3d')
    if (this.owner) {
      this._update = this.update.bind(this)
      this.interval = setInterval(this._update, this.updateIntervalMs)
      const light = new BABYLON.DirectionalLight(this.name, new BABYLON.Vector3(this.x, this.y, this.z), this.owner.scene)
      const shadowGenerator = new BABYLON.ShadowGenerator(this.shadowTextureSize, light)
      /*
      shadowGenerator.useExponentialShadowMap = true
      shadowGenerator.usePoissonSampling = true
      */
      this.light = light
      this.shadowGenerator = shadowGenerator
      this._callback = this.shadowCallback.bind(this)
      this.owner.onAddMesh(this._callback)
    }
  },
  disconnectedCallback() {
    if (this.light != null) {
      this.clearInterval(this.interval)
      this.interval = 0
      this.light.dispose()
      this.owner.removeShadowGenerator(this._callback)
      this.light = null
      this.shadowGenerator = null
      this.potentialShadowCasters.splice(0)
    }
    this.owner = null
  },
  render () {
    if (this.light != null) {
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
})

export const bSkybox = makeWebComponent('b-skybox', {
  attributes: {
    turbidity: 10,
    luminance: 1,
    latitude: 40, // -90 south pole to 0 equator to 90 north pole
    realtimeScale: 10, // rate at which to automatically advance timeOfDay
    sunColor: '#eef',
    duskColor: '#fa2',
    moonColor: '#224',
    moonIntensity: 0.02,
    timeOfDay: 6.5, // 24h clock time
    rayleigh: 2,
    mieDirectionalG: 0.8,
    mieCoefficient: 0.005,
    size: 1000,
  },
  props: {
    owner: null,
    skybox: null,
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
        material.luminance = this.luminance
        material.azimuth = this.azimuth
        material.mieDirectionalG = this.mieDirectionalG
        material.mieCoefficient = this.mieCoefficient
        if (this.owner != null) {
          const sun = this.owner.querySelector('b-sun')
          if (sun != null) {
            const intensity = Math.min(Math.abs(this.timeOfDay - 6), Math.abs(this.timeOfDay - 18), 1)
            if (this.timeOfDay > 6 && this.timeOfDay < 18) {
              const color = Color.fromCss(this.duskColor).blend(Color.fromCss(this.sunColor), intensity)
              const {light} = sun
              material.sunPosition = sunVector
              light.diffuse = new BABYLON.Color3(color.r/255, color.g/255, color.b/255)
              light.intensity = intensity
              light.direction = sunVector.scale(-1)
              material.rayleigh = this.rayleigh
              material.turbidity = this.turbidity
            } else {
              const color = Color.fromCss(this.moonColor)
              const {light} = sun
              material.sunPosition = sunVector.scale(-1)
              light.diffuse = new BABYLON.Color3(color.r/255, color.g/255, color.b/255)
              light.intensity = intensity * this.moonIntensity
              light.direction = sunVector
              material.rayleigh = this.rayleigh * this.moonIntensity
              material.turbidity = this.turbidity * this.moonIntensity
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
    if (this.owner != null) {
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
    size: 128,
    subdivisions: 32,
    textureSize: 1024,
    x: 0,
    y: 0,
    z: 0,
    twoSided: false,
    normalMap: waterbump,
    windForce: -5,
    waveHeight: 0,
    bumpHeight: 0.1,
    waveLength: 0.1,
    waterColor: '#06c',
    colorBlendFactor: 0.1,
  },
  props: {
    owner: null,
    mesh: null,
    material: null,
    windDirection: {x: 0.6, y: 0.8}
  },
  methods: {
    waterCallback(...meshes: BABYLON.Mesh[]) {
      for (const mesh of meshes) {
        if (!mesh.name.includes('water')) {
          this.material.addToRenderList(mesh)
        }
      }
    },
    update() {
      if (this.material != null) {
        const {twoSided, normalMap, windForce, windDirection, waveHeight, bumpHeight, waveLength, waterColor, colorBlendFactor, x, y, z} = this
        this.material.backFaceCulling = !twoSided
        this.material.bumpTexture = new BABYLON.Texture(normalMap, this.owner.scene)
        this.material.windForce = windForce
        this.material.windDirection = new BABYLON.Vector2(windDirection.x, windDirection.y)
        this.material.waveHeight = waveHeight
        this.material.waveLength = waveLength
        this.material.bumpHeight = bumpHeight
        if (colorBlendFactor > 0) {
          const color = Color.fromCss(waterColor)
          this.material.waterColor = new BABYLON.Color3(color.r/255, color.g/255, color.b/255)
        }
        this.material.colorBlendFactor = colorBlendFactor
        this.mesh.position.x = x
        this.mesh.position.y = y
        this.mesh.position.z = z
      }
    },
  },
  connectedCallback() {
    this.owner = this.closest('b-3d')
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
      this._callback = this.waterCallback.bind(this)
      this.owner.onAddMesh(this._callback)
    }
  },
  disconnectedCallback() {
    if (this.mesh != null) {
      this.mesh.dispose()
      this.mesh = null
      this.material = null
      this.owner.offAddMesh(this._callback)
    }
    this.owner = null
  },
  render() {
    this.update()
  }
})

export const bTerrain = makeWebComponent('b-terrain', {
  attributes: {
    spherical: false,
    polygonCount: 2048, // 32 x 32 x 2
  }
})

export const bBiped = makeWebComponent('b-biped', {
  attributes: {
    url: '',
    player: false,
    cameraType: 'none', // 'follow' | 'xr'
    xrStuff: null,
    x: 0,
    y: 0,
    z: 0,
    initialState: 'idle',
    turnSpeed: 180, // degreesPerSecond
    forwardSpeed: 2,
    runSpeed: 5,
    backwardSpeed: 1,
    lastUpdate: 0,
  },
  props: {
    container: null,
    owner: null,
    camera: null,
    animationState: null,
    animationGroup: null,
    gameController: null,
    animationStates: [
      {
        animation: 'idle',
        loop: true,
      },
      {
        animation: 'walk',
        loop: true,
      },
      {
        animation: 'sneak',
        loop: true,
      },
      {
        animation: 'run',
        loop: true,
      },
      {
        animation: 'climb',
        loop: true,
      },
      {
        name: 'walkBackwards',
        animation: 'walk',
        backwards: true,
        loop: true,
      },
      {
        animation: 'jump',
        loop: false,
      },
      {
        animation: 'running-jump',
        loop: false,
      },
      {
        animation: 'salute',
        loop: false,
      },
      {
        animation: 'wave',
        loop: false,
        additive: true,
      },
      {
        animation: 'tread-water',
        loop: true,
      },
      {
        animation: 'swim',
        loop: true,
      },
      {
        animation: 'talk',
        loop: true,
      },
      {
        animation: 'look',
        loop: true,
      },
      {
        animation: 'dance',
        loop: true,
      },
      {
        animation: 'pickup',
        loop: false,
      },
      {
        animation: 'pilot',
        loop: true,
      },
    ]
  },
  methods: {
    setAnimationState(name: string, speed = 1) {
      if (name == null) {
        throw new Error (`setAnimationState failed, no animation name specified.`)
      }
      if (this.animationState?.name === name || this.animationState?.animation === name) {
        this.animationGroup.speedRatio = speed
        return
      }
      if (this.container == null) {
        return
      }
      this.animationState = this.animationStates.find(state => (state.name || state.animation) === name)
      if (this.animationState != null) {
        const idx = this.container.animationGroups.findIndex(g => g.name.endsWith(this.animationState.animation))
        if (idx > -1) {
          const loop = Boolean(this.animationState.loop)
          const additive = Boolean(this.animationState.additive)
          if (loop) {
            for(const animationGroup of this.container.animationGroups) {
              animationGroup.stop()
            }
          }
          const animationGroup: BABYLON.AnimationGroup = this.container.animationGroups[idx]
          if (this.animationState.backwards) {
            animationGroup.start(loop, speed, animationGroup.from, animationGroup.to, additive)
          } else {
            animationGroup.start(loop, speed, animationGroup.to, animationGroup.from, additive)
          }
          this.animationGroup = animationGroup
        } else {
          console.error(`<b-biped>.setAnimationState failed for animationState "${this.animationState.name}": could not find animationGroup named "${this.animationState.animation}"`)
        }
      } else {
        console.error(`<b-biped>.setAnimationState failed, no animationState named ${name} found.`)
      }
    },
    registerUpdate() {
      this.lastUpdate = Date.now()
      this._update = this.update.bind(this)
      this.owner.scene.registerBeforeRender(this._update)
    },
    update() {
      if (this.player && this.gameController != null) {
        const now = Date.now()
        const timeElapsed = (now - this.lastUpdate) * 0.001
        this.lastUpdate = now
        const rotation = (this.gameController.state.right - this.gameController.state.left)
        const speed = (this.gameController.state.forward - this.gameController.state.backward)
        const sprint = this.gameController.state.sprint
        const sprintSpeed = speed * sprint
        const totalSpeed = speed * this.forwardSpeed + sprintSpeed * (this.runSpeed - this.forwardSpeed)
        for(const node of this.container.rootNodes) {
          if (speed > 0) {
            node.moveWithCollisions(node.forward.scaleInPlace(totalSpeed * timeElapsed))
          } else {
            node.moveWithCollisions(node.forward.scaleInPlace(speed * timeElapsed * this.backwardSpeed))
          }
          node.rotate(BABYLON.Vector3.Up(), rotation * timeElapsed * this.turnSpeed * Math.PI / 180)
          if (speed > 0.1) {
            if (sprintSpeed > 0.25) {
              this.setAnimationState('run', sprintSpeed + 0.25)
            } else {
              this.setAnimationState('walk', speed + 0.25)
            }
          } else if (speed < -0.1) {
            this.setAnimationState('walkBackwards', speed + 0.25)
          } else if (Math.abs(rotation) > 0.1) {
            this.setAnimationState('walk', Math.abs(rotation * 0.5) + 0.25)
          } else {
            this.setAnimationState('idle')
          }
        }
      }
    },
    async setupXRCamera() {
      console.log('setting up xr')
      this.xrStuff = await enterXR(this.owner.scene, {cameraName: this.cameraType})
      const {camera, sessionManager} = this.xrStuff
      this.camera = camera
      this.owner.xrActive = true
      sessionManager.onXRFrameObservable.add(() => {
        const {x, y, z} = this.container.rootNodes[0].position
        camera.position.x = x
        camera.position.y = y + 0.7
        camera.position.z = z
      })
      /*
      this.camera = camera
      this.owner.xrActive = true
      this.owner.camera.dispose()
      this.owner.camera = camera
      camera.ignoreParentScaling = true
      console.log(camera.parent)
      camera.parent = this.container.rootNodes[0]
      camera.rotation = this.container.rootNodes[0].rotation.clone()
      camera.position.y = 0.7
      camera.position.z = -2
      */
    },
    async setupFollowCamera() {
      if (this.xrStuff) {
        await this.xrStuff.exitXR()
        this.owner.xrActive = false
        this.xrStuff = null
      }
      console.log('setting up follow')
      this.camera = new BABYLON.ArcRotateCamera(this.cameraType, 0.5, 0.5, 5, this.container.rootNodes[0], this.owner.scene)
      this.owner.setActiveCamera(this.camera, true)
    }
  },
  connectedCallback() {
    this.owner = this.closest('b-3d')
    this.gameController = this.player ? this.closest('game-controller') : null
    if (this.owner != null && this.url !== '') {
      BABYLON.SceneLoader.LoadAssetContainer(this.url, undefined, this.owner.scene, (container) => {
        this.container = container.instantiateModelsToScene(undefined, false, {doNotInstantiate: true})
        const meshes = this.container.rootNodes.map(node => node.getChildMeshes()).flat()
        this.owner.addMesh(...meshes)
        for(const node of this.container.rootNodes) {
          node.position.x += this.x
          node.position.y += this.y
          node.position.z += this.z
        }
        this.setAnimationState(this.initialState)
        this.registerUpdate()
      })
    }
  },
  disconnectedCallback() {
    if (this.owner != null) {
      if (this.container) {
        for(const node of this.container.rootNodes) {
          node.dispose()
        }
        for(const skeleton of this.container.skeletons) {
          skeleton.dispose()
        }
        for(const ag of this.container.animationGroups) {
          ag.dispose()
        }
      }
    }
  },
  render() {
    if (this.container == null) {
      return
    }
    if (this.camera == null || this.camera?.name !== this.cameraType) {
      switch(this.cameraType) {
        case 'xr':
          this.setupXRCamera()
          break;
        case 'follow':
          this.setupFollowCamera()
          break;
        default:
          if (this.camera != null) {
            if (this.owner.camera === this.camera) {
              this.owner.camera = null
            }
            this.camera.dispose()
            this.camera = null
          }
      }
    }
  }
})
