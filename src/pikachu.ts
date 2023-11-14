import {
  AnimationAction,
  AnimationMixer,
  Group,
  MeshStandardMaterial,
  SkinnedMesh,
  Vector2,
} from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Main, PerspectiveCameraAuto, Asset, Utils } from '@three.ez/main';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';

const GLTF_PICACHU_URL = 'assets/pikachuF.glb';

Asset.preload(GLTFLoader, GLTF_PICACHU_URL);

export class Pikachu extends Group {
  private _mixer = new AnimationMixer(this);
  private _idleAction: AnimationAction;
  private _runAction: AnimationAction;

  constructor() {
    super();
    const gltf = Asset.get<GLTF>(GLTF_PICACHU_URL);
    this.scale.divideScalar(5);
    this.add(...clone(gltf.scene).children);
    this._idleAction = this._mixer.clipAction(gltf.animations[0]).play();

    Utils.computeBoundingSphereChildren(this); // to make raycast works properly

    (
      (this.getObjectByName('PikachuF_4') as SkinnedMesh)
        .material as MeshStandardMaterial
    ).map.offset.y = 0.25;

    this.on('animate', (e) => {
      this._mixer.update(e.delta);
      (
        (this.getObjectByName('PikachuF_4') as SkinnedMesh)
          .material as MeshStandardMaterial
      ).map.offset.y += e.delta % 1;
    });

    this.on('pointerenter', (e) => {});
  }
}
