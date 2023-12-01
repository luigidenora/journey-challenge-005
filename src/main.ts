import { Asset, Main, PerspectiveCameraAuto } from '@three.ez/main';
import { AmbientLight, DirectionalLight, Scene, Vector3, AudioListener, Mesh, PlaneGeometry, MeshBasicMaterial, MeshLambertMaterial, TextureLoader, Texture, RepeatWrapping, SRGBColorSpace } from 'three';
import { openDialog } from './dialog';
import { Pikachu } from './pikachu';
import { Pokeball } from './pokeball';
import { showMedals } from './medals';

Asset.preload(TextureLoader, 'grass.jpg');

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

  const pika: Pikachu[] = names.map((n: string, i: number) => new Pikachu(n));

  const audioListener = new AudioListener();
  const texture = Asset.get<Texture>('grass.jpg');
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(612 * 10, 601 * 10);
  texture.colorSpace = SRGBColorSpace;

  const scene = new Scene().add(
    new DirectionalLight('white', 2).translateZ(1),
    new AmbientLight('white', 1),
    new Mesh(new PlaneGeometry(1000, 1000), new MeshLambertMaterial({ map: texture })).rotateX(Math.PI / -2),
    ...pika,
    new Pokeball(camera),
  );

  scene.userData.pika = pika;
  scene.userData.audioListener = audioListener;

  main.createView({ scene, camera: camera, backgroundAlpha: 0 });

  // window.main = main;
}) as EventListener);
