import { CONFIG } from '../config.js';
import { EVENTS } from '../events.js';
import { ondasDaFase, arcosNoTempo } from '../logic/ondas.js';

const POSICAO = new THREE.Vector3();
const ROTACAO = new THREE.Quaternion();

function geometriaDoArco(centroDoArco, { espessura, abertura }) {
  const meia = THREE.MathUtils.degToRad(abertura) / 2;
  return new THREE.RingGeometry(1 - espessura, 1, 24, 1, centroDoArco - meia, meia * 2);
}

AFRAME.registerComponent('ondas-sonoras', {
  init() {
    this.cena = this.el.sceneEl;
    this.cameraEl = document.querySelector('#camera');
    this.fase = ondasDaFase(null, CONFIG);

    this.grupo = new THREE.Group();
    this.grupo.visible = false;
    this.geometrias = [geometriaDoArco(0, CONFIG.ondas), geometriaDoArco(Math.PI, CONFIG.ondas)];
    this.arcos = [];
    for (let i = 0; i < CONFIG.ondas.arcos; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: CONFIG.ondas.cor,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false,
      });
      const malhas = this.geometrias.map((g) => {
        const m = new THREE.Mesh(g, material);
        m.renderOrder = CONFIG.ondas.ordem;
        m.frustumCulled = false;
        this.grupo.add(m);
        return m;
      });
      this.arcos.push({ material, malhas });
    }
    this.cena.object3D.add(this.grupo);

    this.aoMudarEstado = (e) => (this.fase = ondasDaFase(e.detail.to, CONFIG));
    this.cena.addEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);
  },

  tick(t) {
    if (!this.fase.ativa || !this.el.object3D.visible) {
      this.grupo.visible = false;
      return;
    }
    this.grupo.visible = true;
    this.el.object3D.getWorldPosition(POSICAO);
    this.grupo.position.copy(POSICAO);
    this.cameraEl.object3D.getWorldQuaternion(ROTACAO);
    this.grupo.quaternion.copy(ROTACAO);

    arcosNoTempo(t, CONFIG.ondas).forEach(({ raio, opacidade }, i) => {
      const arco = this.arcos[i];
      arco.material.opacity = opacidade * this.fase.opacidade;
      for (const m of arco.malhas) m.scale.setScalar(raio);
    });
  },

  remove() {
    this.cena.removeEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);
    this.grupo.removeFromParent();
    for (const g of this.geometrias) g.dispose();
    for (const { material } of this.arcos) material.dispose();
  },
});
