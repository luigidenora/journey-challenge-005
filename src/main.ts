import { Asset, Main, PerspectiveCameraAuto } from '@three.ez/main';
import { AmbientLight, DirectionalLight, Scene, Vector3 } from 'three';
import { openDialog } from './dialog';
import { Pikachu } from './pikachu';
import { Pokeball } from './pokeball';

openDialog();
const main = new Main({ disableContextMenu: false, showStats: false });
await Asset.preloadAllPending({
  onProgress: e => console.log(e * 100 + '%'),
}).then(() => {
  document.getElementById('loading').remove();
});

window.addEventListener('fetchData', ((customEvent: CustomEvent) => {
  const names = customEvent.detail;
  const camera = new PerspectiveCameraAuto(50).translateZ(1).translateY(0.5);
  camera.lookAt(new Vector3());
  const scene = new Scene().add(
    new DirectionalLight('white', 2).translateZ(1),
    new AmbientLight('white', 1),
    ...names.map((n: string, i: number) => new Pikachu(n).translateX(3 * Math.random())),
    ...names.map((n: string, i: number) => new Pikachu(n).translateX(-3 * Math.random())),
    new Pokeball(camera),
  );

  main.createView({ scene, camera: camera, backgroundAlpha: 0 });
}) as EventListener);
