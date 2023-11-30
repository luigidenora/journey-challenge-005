import {
  Scene,
  Mesh,
  BoxGeometry,
  MeshNormalMaterial,
  DirectionalLight,
  AmbientLight,
} from 'three';
import { Asset, Main, PerspectiveCameraAuto } from '@three.ez/main';
import { Pikachu } from './pikachu';
const main = new Main();

await Asset.preloadAllPending({
  onProgress: (e) => console.log(e * 100 + '%'),
});

const scene = new Scene().add(
  new Pikachu(),
  new DirectionalLight('white', 2).translateZ(1),
  new AmbientLight('white', 1)
);

main.createView({ scene, camera: new PerspectiveCameraAuto(70).translateZ(0.5) });
