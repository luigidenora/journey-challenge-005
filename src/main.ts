import { Asset, Main, PerspectiveCameraAuto } from '@three.ez/main';
import { AmbientLight, DirectionalLight, Scene, Vector3, AudioListener } from 'three';
import { openDialog } from './dialog';
import { Pikachu } from './pikachu';
import { Pokeball } from './pokeball';
import { showMedals } from './medals';

openDialog();
await Asset.preloadAllPending({
  onProgress: e => console.log(e * 100 + '%'),
}).then(() => {
  document.getElementById('loading').remove();
});

window.addEventListener('fetchData', ((customEvent: CustomEvent) => {
  const main = new Main({ disableContextMenu: false, showStats: false });
  const names = customEvent.detail;
  showMedals(names); // TODO: medals for only catched?
  const camera = new PerspectiveCameraAuto(50).translateZ(1).translateY(0.25);
  camera.lookAt(new Vector3());

  const pika: Pikachu[] = names.map((n: string, i: number) =>
    new Pikachu(n).translateX(6 * Math.random() - 3),
  );

  const audioListener = new AudioListener();
  const scene = new Scene().add(
    new DirectionalLight('white', 2).translateZ(1),
    new AmbientLight('white', 1),
    ...pika,
    new Pokeball(camera),
  );

  scene.userData.pika = pika;
  scene.userData.audioListener = audioListener;

  main.createView({ scene, camera: camera, backgroundAlpha: 0 });

  // window.main = main;
}) as EventListener);
