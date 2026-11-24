// Desenha no chão, na linha do gol, as zonas de gol (verde) e de trave (vermelho).
// Só aparece no modo debug (?debug=1).
// Uso: <a-entity id="gol" ... goal-zones> (filho do gol: z = 0 é a linha do gol).
import { CONFIG } from '../config.js';
import { DEBUG } from '../debug.js';
import { limitesDoGol } from '../logic/goal.js';

const COR_GOL = '#34c759';
const COR_TRAVE = '#ff3b30';
const PROFUNDIDADE = 0.12; // largura da faixa no chão (m)
const ALTURA = 0.006;

AFRAME.registerComponent('goal-zones', {
  init() {
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
