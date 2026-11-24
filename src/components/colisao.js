import { CONFIG } from '../config.js';
import { EVENTS } from '../events.js';
import { ESTADOS } from '../logic/state-machine.js';
import { resolverColisao, penetracaoMaxima } from '../logic/colisao.js';
import { colisoresVestiario } from '../logic/vestiario.js';
import { posicaoCabeca } from '../head.js';

const ORDEM = 999;

AFRAME.registerComponent('colisao', {
  init() {
    this.cena = this.el.sceneEl;
    this.cameraEl = document.querySelector('#camera');
    this.pos = new THREE.Vector3();
    this.colisores = null;

    this.escuro = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 12),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false,
      }),
    );
    this.escuro.renderOrder = ORDEM;
    this.escuro.frustumCulled = false;
    this.escuro.visible = false;
    this.cameraEl.object3D.add(this.escuro);

    this.aoMudarEstado = (e) => {
      this.colisores = e.detail.to === ESTADOS.VESTIARIO ? colisoresVestiario(CONFIG) : null;
      if (!this.colisores) this.escurecer(0);
    };
    this.cena.addEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);
  },

  remove() {
    this.cena.removeEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);
    this.escuro.removeFromParent();
    this.escuro.geometry.dispose();
    this.escuro.material.dispose();
  },

  tick() {
    if (!this.colisores) return;
    const { raioCabeca, distanciaEscurecer } = CONFIG.vestiario.colisao;
    posicaoCabeca(this.cena, this.pos);

    if (this.cena.is('vr-mode')) {
      const p = penetracaoMaxima(this.pos, raioCabeca, this.colisores.cabeca);
      this.escurecer(Math.min(1, p / distanciaEscurecer));
      return;
    }

    const r = resolverColisao(this.pos, raioCabeca, this.colisores.andar);
    if (!r.colidiu) return;
    const camera = this.cameraEl.object3D.position;
    camera.x += r.x - this.pos.x;
    camera.z += r.z - this.pos.z;
  },

  escurecer(opacidade) {
    this.escuro.material.opacity = opacidade;
    this.escuro.visible = opacidade > 0.01;
  },
});
