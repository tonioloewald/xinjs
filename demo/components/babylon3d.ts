import {elements, makeWebComponent} from '../../src/index'
import * as BABYLON from 'babylonjs'

const {canvas, slot} = elements

export const babylon3d = makeWebComponent('b-3d', {
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
    this.camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), this.scene)
    this.camera.setTarget(BABYLON.Vector3.Zero())
    this.camera.attachControl(canvas, false)
    
    const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this.scene);
    const sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, this.scene, false, BABYLON.Mesh.FRONTSIDE);
    sphere.position.y = 1;
    const ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, this.scene, false);
    
    this.engine.runRenderLoop(() => {
      this.scene.render()
    })    
  }
})