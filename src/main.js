import { Scene, DirectionalLight, AmbientLight, } from 'three';
import { Asset, Main, PerspectiveCameraAuto } from '@three.ez/main';
import { Pikachu } from './pikachu';
const main = new Main();
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
await Asset.preloadAllPending({
    onProgress: (e) => console.log(e * 100 + '%'),
});
const scene = new Scene().add(new Pikachu('luigidenora'), new Pikachu('brunosimon').translateX(0.3), new DirectionalLight('white', 2).translateZ(1), new AmbientLight('white', 1));
const camera = new PerspectiveCameraAuto(70).translateZ(0.5);
const controls = new OrbitControls(camera, main.renderer.domElement);
main.createView({ scene, camera: camera, backgroundColor: 'blue' });
