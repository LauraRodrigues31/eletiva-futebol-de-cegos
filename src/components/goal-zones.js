import { CONFIG } from '../config.js';
import { DEBUG } from '../debug.js';
import { posicaoGol } from '../logic/area.js';
import { limitesDoGol } from '../logic/goal.js';

const COR_GOL = '#34c759';
const COR_TRAVE = '#ff3b30';
const PROFUNDIDADE = 0.12;
const ALTURA = 0.006;

AFRAME.registerComponent('goal-zones', {
  init() {
    const gol = posicaoGol(CONFIG);
    this.el.object3D.position.set(gol.x, 0, gol.z);
    if (!DEBUG) return;

    const { limiteGol, limiteTrave } = limitesDoGol(CONFIG);
    const larguraTrave = limiteTrave - limiteGol;
    this.faixa(0, limiteGol * 2, COR_GOL);
    for (const lado of [-1, 1]) {
      this.faixa(lado * (limiteGol + larguraTrave / 2), larguraTrave, COR_TRAVE);
    }
  },

  faixa(x, largura, cor) {
    const el = document.createElement('a-entity');
    el.setAttribute('geometry', { primitive: 'box', width: largura, height: 0.002, depth: PROFUNDIDADE });
    el.setAttribute('material', { color: cor, shader: 'flat', opacity: 0.8, transparent: true });
    el.setAttribute('position', { x, y: ALTURA, z: 0 });
    this.el.appendChild(el);
  },
});
