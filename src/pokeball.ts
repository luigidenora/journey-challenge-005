import { Asset, Tween, Utils } from '@three.ez/main';
import {
  AnimationAction,
  AnimationMixer,
  Camera,
  Group,
  QuadraticBezierCurve3,
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
  private _test: number;
  private _thrown = false;
  private _curve: QuadraticBezierCurve3;
  private _duration: number;

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

    this.on('animate', e => {
      if (this._thrown) {
        this._mixer.update(e.delta);
        this._test = Math.max(0, this._test - (e.delta / this._duration) * this._force);
        // console.log(this._test);
        this.position.copy(this._curve.getPointAt(1 - this._test / this._force));
      } else {
        // console.log(this._force);
      }
    });

    this.on('dragend', () => {
      this._thrown = true;
      this.interceptByRaycaster = false;

      this._force = this._forceDir.length() * 20;
      console.log(this._force);
      this._duration = this._force / 10;
      this._test = this._force;
      const dir = this.position.clone().sub(camera.position);
      const endPosition = this.position.clone().add(dir).setY(0).setLength(this._force);
      const controlPoint = this.position
        .clone()
        .lerp(endPosition, 0.1)
        .setY(this.position.y * 2);

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
