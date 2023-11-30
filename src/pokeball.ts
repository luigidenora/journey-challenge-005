import { Asset, Tween, Utils } from '@three.ez/main';
import {
  AnimationAction,
  AnimationMixer,
  Camera,
  CircleGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  QuadraticBezierCurve3,
  Quaternion,
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
  private _elapsed = 0;
  private _thrown = false;
  private _curve: QuadraticBezierCurve3;
  private _duration: number;
  private _origin: Vector3;
  private _target: Mesh;

  constructor(camera: Camera) {
    super();
    const gltf = Asset.get<GLTF>('pokeball.glb');
    this._origin = this.position.clone();
    this.add(...clone(gltf.scene).children);
    this.children[0].rotation.z = Math.PI / 2;
    this.children[0].scale.setScalar(0);
    this._action = this._mixer.clipAction(gltf.animations[0]);
    this._action.repetitions = 1;
    this._target = new Mesh(
      new CircleGeometry(0.25),
      new MeshBasicMaterial({ color: 'red', side: DoubleSide }),
    );
    this._target.bindProperty('visible', () => this.children[0].dragging);
    this._target.rotateX(Math.PI / 2);
    this.add(this._target);

    this.children[0].tween().to(2000, { scale: 5 }, { easing: 'easeOutBack' }).start();

    Utils.computeBoundingSphereChildren(this); // to make raycast works properly
    Utils.setChildrenDragTarget(this.children[0], this.children[0]);

    this.on('animate', e => {
      if (this._thrown) {
        this._mixer.update(e.delta);
        // // console.log(this._test);
        this._elapsed = Math.min(1, this._elapsed + e.delta);
        this.children[0].position.copy(this._curve.getPointAt(this._elapsed));
      } else {
        // console.log(this._force);
      }
    });

    this.on('drag', e => {
      const quatCam = camera.quaternion.clone().invert();
      const test = this.children[0].getWorldPosition(new Vector3());
      test.x *= -1;
      test.y *= 5;
      const dir = test.clone().sub(camera.position).applyQuaternion(quatCam);
      // if (test.y > 0) {
      //   dir.z *= -1;
      // }
      const endPosition = test
        .clone()
        .add(dir)
        .setY(0)
        .setLength(test.length() * 8);

      this._target.position.copy(endPosition);
    });

    this.on('dragend', () => {
      this._thrown = true;
      this.interceptByRaycaster = false;
      const pos = this.children[0].getWorldPosition(new Vector3());
      const controlPoint = pos
        .clone()
        .lerp(this._target.position, 0.25)
        .setY(-this._target.position.z / 5);
      this._curve = new QuadraticBezierCurve3(pos, controlPoint, this._target.position);
    });

    // this.on('dragend', () => {
    //   this._thrown = true;
    //   this.interceptByRaycaster = false;

    //   this._force = this._forceDir.length() * 20;
    //   console.log(this._force);
    //   this._duration = this._force / 10;
    //   this._test = this._force;
    //   const dir = this.position.clone().sub(camera.position);
    //   const endPosition = this.position.clone().add(dir).setY(0).setLength(this._force);
    //   const controlPoint = this.position
    //     .clone()
    //     .lerp(endPosition, 0.1)
    //     .setY(this.position.y * 2);

    //   this._curve = new QuadraticBezierCurve3(this.position, controlPoint, endPosition);
    // });

    this.on('dragcancel', e => {
      e.preventDefault();
    });

    this.on('drag', e => {
      this._forceDir.sub(this.position).add(e.position);
    });
  }
}
