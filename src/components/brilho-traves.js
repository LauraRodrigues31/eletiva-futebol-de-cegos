import { CONFIG } from '../config.js';
import { EVENTS } from '../events.js';
import { BARRAS, brilhoDaFase, trechosNoTempo } from '../logic/brilho.js';

AFRAME.registerComponent('brilho-traves', {
  init() {
    const c = CONFIG.brilhoTraves;
    this.cena = this.el.sceneEl;
    this.fase = brilhoDaFase(null, CONFIG);
    this.inicio = null;

    this.geometria = new THREE.CylinderGeometry(c.raio, c.raio, 1, 16);
    this.material = new THREE.MeshBasicMaterial({
      color: CONFIG.ondas.cor,
      transparent: true,
      opacity: 1,
      depthTest: false,
      depthWrite: false,
    });
    this.grupo = new THREE.Group();
    this.grupo.visible = false;
    this.barras = {};
    for (const barra of BARRAS) {
      const m = new THREE.Mesh(this.geometria, this.material);
      m.renderOrder = c.ordem;
      m.frustumCulled = false;
      if (barra === 'travessao') m.rotation.z = Math.PI / 2;
      this.grupo.add(m);
      this.barras[barra] = m;
    }
    this.el.object3D.add(this.grupo);

    this.aoMudarEstado = (e) => {
      this.fase = brilhoDaFase(e.detail.to, CONFIG);
      this.inicio = null;
    };
    this.cena.addEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);
  },

  tick(t) {
    if (!this.fase.ativa || !this.el.object3D.visible) {
      this.grupo.visible = false;
      return;
    }
    if (this.inicio === null) this.inicio = t;
    this.grupo.visible = true;
    this.material.opacity = this.fase.opacidade;

    for (const m of Object.values(this.barras)) m.visible = false;
    for (const { barra, de, ate } of trechosNoTempo(t - this.inicio, CONFIG.brilhoTraves, CONFIG.gol)) {
      const m = this.barras[barra];
      m.visible = true;
      m.position.set((de.x + ate.x) / 2, (de.y + ate.y) / 2, 0);
      m.scale.y = Math.hypot(ate.x - de.x, ate.y - de.y);
    }
  },

  remove() {
    this.cena.removeEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);
    this.grupo.removeFromParent();
    this.geometria.dispose();
    this.material.dispose();
  },
});
