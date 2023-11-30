import { Asset, Utils } from '@three.ez/main';
import {
  AnimationAction,
  AnimationMixer,
  Box3,
  Camera,
  CircleGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  QuadraticBezierCurve3,
  SkinnedMesh,
  Vector3,
} from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';
import { Pikachu, pikaGeoBBox } from './pikachu';
import { Confetti } from './confetti';

Asset.preload(GLTFLoader, 'pokeball.glb');

let bboxGeo: Box3;

export class Pokeball extends Group {
  private _mixer = new AnimationMixer(this);
  private _action: AnimationAction;
  private _elapsed = 0;
  private _thrown = false;
  private _curve: QuadraticBezierCurve3;
  private _target: Mesh;
  private _catched = false;

  constructor(camera: Camera) {
    super();
    const gltf = Asset.get<GLTF>('pokeball.glb');
    this.add(...clone(gltf.scene).children);
    this.children[0].rotation.z = -Math.PI / 2;
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

    this.children[0].tween().to(500, { scale: 5 }, { easing: 'easeOutBack' }).start();

    Utils.computeBoundingSphereChildren(this); // to make raycast works properly
    Utils.setChildrenDragTarget(this.children[0], this.children[0]);

    if (bboxGeo === undefined) {
      bboxGeo = new Box3();
      this.children[0].traverse(obj => {
        if ((obj as SkinnedMesh).geometry) {
          (obj as SkinnedMesh).geometry.computeBoundingBox();
          bboxGeo.union((obj as SkinnedMesh).geometry.boundingBox);
        }
      });
    }

    this.on('animate', e => {
      if (this._thrown) {
        if (this._elapsed > 1.5) {
          this.catch();
          return;
        }

        this._mixer.update(e.delta);

        if (this._catched) {
          if (this._action.time === 1.0833333730697632) {
            this.catch();
          }
          return;
        }
        this._elapsed += e.delta * 1.2;
        this.children[0].position.copy(this._curve.getPointAt(Math.min(1, this._elapsed)));

        const bbox = bboxGeo.clone().applyMatrix4(this.children[0].children[0].matrixWorld);
        const array = this.scene.userData.pika as Pikachu[];
        for (let i = 0; i < array.length; i++) {
          const pikachu = array[i];
          const pikaBBox = pikaGeoBBox.clone().applyMatrix4(pikachu.matrix);
          if (bbox.intersectsBox(pikaBBox)) {
            array.splice(i, 1);
            this._catched = true;
            (pikachu as Pikachu).catch();
            this._action.setEffectiveTimeScale(2).play();
            const confetti = new Confetti();
            confetti.position.copy(pikachu.position);
            this.scene.add(confetti);
            return;
          }
        }
      }
    });

    this.on('drag', e => {
      // if (e.position.y > 0) {
      //   e.preventDefault();
      //   return;
      // }
      const quatCam = camera.quaternion.clone().invert();
      const test = this.children[0].getWorldPosition(new Vector3());
      test.x *= -1;
      test.y *= 5;
      const dir = test.clone().sub(camera.position).applyQuaternion(quatCam);
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
      this.scene.add(new Pokeball(camera));
    });

    this.on('dragcancel', e => {
      e.preventDefault();
    });
  }

  public catch(): void {
    this.children[0]
      .tween()
      .to(150, { scale: 0 }, { easing: 'linear' })
      .call(() => this.removeFromParent())
      .start();
  }
}
