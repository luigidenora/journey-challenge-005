import THREE, { AnimationAction, AnimationMixer, BufferGeometry, Group, MeshBasicMaterial, MeshStandardMaterial, SkinnedMesh, Texture, TextureLoader, Vector2 } from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Main, PerspectiveCameraAuto, Asset, Utils, Tween } from '@three.ez/main';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';

const GLTF_PICACHU_URL = 'assets/pikachuFrame.glb';

Asset.preload(GLTFLoader, GLTF_PICACHU_URL);

export class Pikachu extends Group {
  private _mixer = new AnimationMixer(this);
  private _idleAction: AnimationAction;
  private _runAction: AnimationAction;

  constructor(username: string) {
    super();
    const texture = new THREE.TextureLoader().load(`https://avatars.githubusercontent.com/${username ?? '%23'}`);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 4, 4 );
    const gltf = Asset.get<GLTF>(GLTF_PICACHU_URL);
    this.scale.divideScalar(5);
    console.log(this);
    this.add(...clone(gltf.scene).children);
    this._idleAction = this._mixer.clipAction(gltf.animations[0]).play();

    Utils.computeBoundingSphereChildren(this); // to make raycast works properly

    (this.getObjectByName('PikachuF_6') as SkinnedMesh<BufferGeometry,MeshStandardMaterial>).material.map = texture

    const map = ((this.getObjectByName('PikachuF_4') as SkinnedMesh).material as MeshStandardMaterial).map;

    const neutral = new Vector2(0, 0);
    const opened2 = new Vector2(0, 0.25);
    const opened3 = new Vector2(0, 0.5);
    const closed = new Vector2(0, 0.75);
    const opened4 = new Vector2(0.5, 0);
    const opened5 = new Vector2(0.5, 0.25);
    const closed2 = new Vector2(0.5, 0.5);

    const tween = new Tween(map).set({ offset: neutral }).delay(2000).set({ offset: opened2 }).delay(50).set({ offset: opened3 }).delay(100);
    const tween2 = new Tween(map).then(tween).repeatForever().start();

    this.on('animate', (e) => {
      this._mixer.update(e.delta);
      console.log(map.offset);
    });

    this.on('pointerenter', (e) => {});
  }
}
