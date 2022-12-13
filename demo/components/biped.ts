import * as BABYLON from 'babylonjs'
import { GLTFFileLoader } from 'babylonjs-loaders'
import { GameController } from './game-controller'
import { AbstractMesh, XRStuff, enterXR } from './babylon3d'

BABYLON.SceneLoader.RegisterPlugin(new GLTFFileLoader())

export type AnimStateSpec = {
  animation: string
  name?: string
  loop?: boolean
  additive?: boolean
  backwards?: boolean
}

export class AnimState {
  animation: string
  name: string
  loop: boolean
  additive: boolean
  backwards: boolean

  constructor(spec: AnimStateSpec) {
    this.animation = spec.animation
    this.name = spec.name || spec.animation
    this.loop = spec.loop || false
    this.additive = spec.additive || false
    this.backwards = spec.backwards || false
  }

  static buildList(...specs: AnimStateSpec[]): AnimState[] {
    return specs.map(spec => new AnimState(spec))
  }
}

class BBiped extends AbstractMesh {
  url = ''
  player = false
  cameraType = 'none' // 'follow' | 'xr'
  xrStuff?: XRStuff
  initialState = 'idle'
  turnSpeed = 180 // degreesPerSecond
  forwardSpeed = 2
  runSpeed = 5
  backwardSpeed = 1
  cameraTargetOffset = [0, 1.5, 0]
  constructor(name = 'biped') {
    super(name)
    this.initAttributes('url', 'player', 'cameraType', 'xrStuff', 'initialState', 'turnSpeed', 'forwardSpeed', 'runSpeed', 'backwardSpeed')
  }
  lastUpdate = 0
  entries: BABYLON.InstantiatedEntries
  camera?: BABYLON.Camera
  animationState?: AnimState
  animationGroup?: BABYLON.AnimationGroup
  gameController?: GameController
  animationStates = AnimState.buildList(
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
  )
  setAnimationState(name: string, speed = 1) {
    if (name == null) {
      throw new Error (`setAnimationState failed, no animation name specified.`)
    }
    if (this.animationState?.name === name || this.animationState?.animation === name) {
      this.animationGroup!.speedRatio = speed
      return
    }
    if (this.entries == null) {
      return
    }
    this.animationState = this.animationStates.find(state => (state.name || state.animation) === name)
    if (this.animationState != null) {
      const idx = this.entries.animationGroups.findIndex(g => g.name.endsWith(this.animationState!.animation))
      if (idx > -1) {
        const loop = Boolean(this.animationState.loop)
        const additive = Boolean(this.animationState.additive)
        if (loop) {
          for(const animationGroup of this.entries.animationGroups) {
            animationGroup.stop()
          }
        }
        const animationGroup: BABYLON.AnimationGroup = this.entries.animationGroups[idx]
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
  }
  #update: VoidFunction
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
      for(const node of this.entries.rootNodes as BABYLON.Mesh[]) {
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
  }
  registerUpdate() {
    this.lastUpdate = Date.now()
    this.#update = this.update.bind(this)
    this.owner!.scene.registerBeforeRender(this.#update)
  }
  async setupXRCamera() {
    console.log('setting up xr')
    this.xrStuff = await enterXR(this.owner!.scene, {cameraName: this.cameraType})
    const {camera, sessionManager} = this.xrStuff
    this.camera = camera
    this.owner!.xrActive = true
    sessionManager.onXRFrameObservable.add(() => {
      const {x, y, z} = this.entries.rootNodes[0].position
      camera.position.x = x
      camera.position.y = y + 0.7
      camera.position.z = z
    })
  }
  async setupFollowCamera() {
    if (this.xrStuff) {
      await this.xrStuff.exitXR()
      this.owner!.xrActive = false
      this.xrStuff = undefined
    }
    console.log('setting up follow')
    const followCamera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(...this.cameraTargetOffset), this.owner!.scene)
    followCamera.radius = 5
    followCamera.heightOffset = 2
    followCamera.rotationOffset = 180
    followCamera.lockedTarget = this.entries.rootNodes[0] as BABYLON.Mesh
    this.camera = followCamera
    this.owner!.setActiveCamera(followCamera, {attach: false})
  }
  connectedCallback() {
    super.connectedCallback()
    this.gameController = this.player ? this.closest('game-controller') || undefined : undefined
    if (this.owner != null && this.url !== '') {
      BABYLON.SceneLoader.LoadAssetContainer(this.url, undefined, this.owner.scene, (container) => {
        this.entries = container.instantiateModelsToScene(undefined, false, {doNotInstantiate: true})
        if (this.entries.rootNodes.length !== 1) {
          throw new Error('<b-biped> expects a container with exactly one root node')
        }
        const meshes = this.entries.rootNodes.map(node => node.getChildMeshes()).flat()
        this.mesh = this.entries.rootNodes[0] as BABYLON.Mesh
        this.owner!.register({meshes})
        this.setAnimationState(this.initialState)
        this.registerUpdate()
        this.queueRender()
      })
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback()
    if (this.owner != null) {
      if (this.entries) {
        for(const node of this.entries.rootNodes) {
          node.dispose()
        }
        for(const skeleton of this.entries.skeletons) {
          skeleton.dispose()
        }
        for(const ag of this.entries.animationGroups) {
          ag.dispose()
        }
      }
    }
  }
  render() {
    super.render()
    if (this.entries == null) {
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
            if (this.owner!.camera === this.camera) {
              this.owner!.camera = undefined
            }
            this.camera.dispose()
            this.camera = undefined
          }
      }
    }
  }
}

export const bBiped = BBiped.elementCreator()