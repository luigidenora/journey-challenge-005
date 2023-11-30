import { PlaneGeometry, Vector3, DoubleSide, MeshBasicMaterial } from 'three';
import { InstancedMesh2, InstancedMeshEntity } from '@three.ez/main';

const zAxis = new Vector3(0, 0, -1);

class Coriander extends InstancedMeshEntity {
  constructor(parent: InstancedMesh2, index: number) {
    super(parent, index);
    const rotationAxis = new Vector3().randomDirection();
    const direction = new Vector3().randomDirection();

    this.position.set(Math.random() * 0.1 - 0.05, Math.random() * 0.1, Math.random() * 0.1 - 0.05);
    this.scale.setScalar(Math.random() + 1);
    this.rotateOnWorldAxis(rotationAxis, Math.random() * Math.PI * 2 - Math.PI);

    this.on('animate', e => {
      this.position.sub(direction.setLength(e.delta || 10 ** -6));
      this.rotateOnWorldAxis(rotationAxis, e.delta);
      this.updateMatrix();
    });
  }
}

export class Confetti extends InstancedMesh2 {
  declare material: MeshBasicMaterial;
  private _time = 0;
  private _duration = 1;

  constructor() {
    super(
      new PlaneGeometry(0.01, 0.01),
      new MeshBasicMaterial({ side: DoubleSide, transparent: true }),
      200,
      Coriander,
      true,
    );
    this.interceptByRaycaster = false;

    this.on('animate', e => {
      this.needsRender = true; // fix su pacchetto

      this._time += e.delta;
      this.material.opacity = 1 - this._time / this._duration;
      if (this._time >= this._duration) {
        this.removeFromParent();
      }
    });
  }
}
