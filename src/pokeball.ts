import { Asset, Tween, Utils } from '@three.ez/main';
import {
  AnimationAction,
  AnimationMixer,
  AudioLoader,
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
  Audio,
} from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';
import { Pikachu, pikaGeoBBox } from './pikachu';
import { Confetti } from './confetti';

Asset.preload(GLTFLoader, 'pokeball.glb');
Asset.preload(AudioLoader, 'throw.mp3', 'pokeball.mp3');

let bboxGeo: Box3;

export class Pokeball extends Group {
  private _mixer = new AnimationMixer(this);
  private _action: AnimationAction;
  private _elapsed = 0;
  private _thrown = false;
  private _curve: QuadraticBezierCurve3;
  private _target: Mesh;
  private _catched = false;
  private _rotAxis: Vector3;
  private _speed = Math.random() * 15 + 10;
  private _end = false;

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
          this.fade();
          return;
        }

        this._mixer.update(e.delta);

        if (this._catched) {
          if (!this._end) {
            new Audio(this.scene.userData.audioListener)
              .setBuffer(Asset.get('pokeball.mp3'))
              .setVolume(0.2)
              .play();
            this._end = true;
          }
          if (this._action.time === this._action.getClip().duration) {
            this.catch();
          }
          return;
        }

        this._elapsed += e.delta * 1.2;
        this.children[0].position.copy(this._curve.getPointAt(Math.min(1, this._elapsed)));

        if (this._elapsed < 1) {
          this.children[0].children[0].children[0].children[0].children[1].children[0].rotateOnWorldAxis(
            this._rotAxis,
            e.delta * this._speed,
          );
        }

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
      const quatCam = camera.quaternion.clone().invert();
      const test = this.children[0].getWorldPosition(new Vector3());
      test.x *= -1;
      test.y *= 10;
      const dir = test.clone().sub(camera.position).applyQuaternion(quatCam);
      dir.z = dir.y;
      dir.y = 0;
      this._rotAxis = dir.normalize();
      const endPosition = test
        .clone()
        .add(dir)
        .setY(0)
        .setLength(test.length() * 2.5);
      this._target.position.copy(endPosition);
    });

    this.on('dragend', () => {
      new Audio(this.scene.userData.audioListener)
        .setBuffer(Asset.get('throw.mp3'))
        .setVolume(0.2)
        .play();
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
    this.children[0].children[0].children[0].children[0].children[1].children[0].rotation.set(
      0,
      0,
      0,
    );

    new Tween(this.children[0].position).to(1000, { y: 0 }, { easing: 'easeOutBounce' }).start();

    this.children[0]
      .tween()
      .delay(1000)
      .to(300, { scale: 0 }, { easing: 'easeInBack' })
      .call(() => this.removeFromParent())
      .start();
  }

  public fade(): void {
    this.children[0]
      .tween()
      .to(300, { scale: 0 }, { easing: 'easeInBack' })
      .call(() => this.removeFromParent())
      .start();
  }
}
