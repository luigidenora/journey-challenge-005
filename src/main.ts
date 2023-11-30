import { Scene, Mesh, BoxGeometry, MeshNormalMaterial, DirectionalLight, AmbientLight } from 'three';
import { Asset, Main, PerspectiveCameraAuto } from '@three.ez/main';
import { Pikachu } from './pikachu';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { openDialog } from './dialog';

openDialog();
// const main = new Main();
// await Asset.preloadAllPending({
//   onProgress: (e) => console.log(e * 100 + '%'),
// });

window.addEventListener('fetchData', (event) => {
  // const scene = new Scene().add(new DirectionalLight('white', 2).translateZ(1), new AmbientLight('white', 1));
  // const camera = new PerspectiveCameraAuto(70).translateZ(0.5);
  // const controls = new OrbitControls(camera, main.renderer.domElement);
  // main.createView({ scene, camera: camera, backgroundColor: 'blue' });

  console.log(event);
  // for (const name of names) {

  // }
  //    new Pikachu('luigidenora'),
});
