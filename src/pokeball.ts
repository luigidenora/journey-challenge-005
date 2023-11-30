import { Asset, Tween, Utils } from '@three.ez/main';
import {
  AnimationAction,
  AnimationMixer,
  BufferGeometry,
  Camera,
  FrontSide,
  Group,
  LinearSRGBColorSpace,
  MeshStandardMaterial,
  QuadraticBezierCurve3,
  RepeatWrapping,
  SRGBColorSpace,
  SRGBToLinear,
  SkinnedMesh,
  TextureLoader,
  Vector2,
  Vector3,
} from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';

Asset.preload(GLTFLoader, 'pokeball.glb');

export class Pokeball extends Group {
  private _mixer = new AnimationMixer(this);
  private _action: AnimationAction;
  private _forceDir = new Vector3();
  private _force: number;
  private _thrown = false;
  private _curve: QuadraticBezierCurve3;
  private _origin: Vector3;

  constructor(camera: Camera) {
    super();
    const gltf = Asset.get<GLTF>('pokeball.glb');
    this.scale.setScalar(0);
    this.translateZ(0);
    this.rotateY(-1.5);
    this.add(...clone(gltf.scene).children);
    this._action = this._mixer.clipAction(gltf.animations[0]);
    this._action.repetitions = 1;

    this.tween()
      .to(2000, { scale: 1 / 20 }, { easing: 'easeOutBack' })
      .start();

    Utils.computeBoundingSphereChildren(this); // to make raycast works properly
    Utils.setChildrenDragTarget(this, this);

    this._origin = this.position.clone();

    this.on('animate', e => {
      if (this._thrown) {
        this._mixer.update(e.delta);
        // debugger;
        this._force = Math.min(1, this._force + e.delta);
        console.log(this._force);
        this.position.copy(this._curve.getPointAt(this._force));
        // if (this._force === 1) {
        //   this.removeFromParent();
        // }
      } else {
        // console.log(this._force);
      }
    });

    this.on('dragend', () => {
      this._thrown = true;
      this.interceptByRaycaster = false;

      this._force = 0;

      const endPosition = this.position.clone().add(this.position.clone().sub(camera.position).setY(0).setLength(10));
      const controlPoint = this._origin.clone().lerp(endPosition, 0.5).setY(this._forceDir.y * 3);

      this._curve = new QuadraticBezierCurve3(this.position, controlPoint, endPosition);
    });

    this.on('dragcancel', e => {
      e.preventDefault();
    });

    this.on('drag', e => {
      this._forceDir.sub(this.position).add(e.position);
    });
  }
}
