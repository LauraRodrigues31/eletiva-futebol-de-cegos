import { CONFIG } from '../config.js';
import { EVENTS } from '../events.js';
import { DEBUG } from '../debug.js';
import { limitesAreaVirtual, atualizarArea } from '../logic/area.js';
import { posicaoCabeca } from '../head.js';

const COR_NORMAL = '#ffffff';
const COR_FORA = '#ff3b30';
const ESPESSURA = 0.04;
const ALTURA_FAIXA = 0.005;

AFRAME.registerComponent('play-area', {
  init() {
    this.cena = this.el.sceneEl;
    this.pos = new THREE.Vector3();
    this.cameraEl = document.querySelector('#camera');
    this.estado = 'dentro';
    this.faixas = this.desenharContorno();
    this.tick = AFRAME.utils.throttleTick(this.checar, CONFIG.intervalos.area, this);
  },

  desenharContorno() {
    const { minX, maxX, minZ, maxZ } = limitesAreaVirtual(CONFIG);
    const largura = maxX - minX;
    const profundidade = maxZ - minZ;
    const faixas = [
      [0, minZ, largura + ESPESSURA, ESPESSURA],
      [0, maxZ, largura + ESPESSURA, ESPESSURA],
      [minX, 0, ESPESSURA, profundidade],
      [maxX, 0, ESPESSURA, profundidade],
    ];
    return faixas.map(([x, z, w, d]) => {
      const faixa = document.createElement('a-entity');
      faixa.setAttribute('geometry', { primitive: 'box', width: w, height: 0.002, depth: d });
      faixa.setAttribute('material', { color: COR_NORMAL, shader: 'flat' });
      faixa.setAttribute('position', { x, y: ALTURA_FAIXA, z });
      this.el.appendChild(faixa);
      return faixa;
    });
  },

  checar() {
    posicaoCabeca(this.cena, this.pos);
    const fisica = this.cameraEl.object3D.position;
    const { estado, evento } = atualizarArea(this.estado, fisica, CONFIG);
    this.estado = estado;
    if (!evento) return;

    const position = { x: this.pos.x, y: this.pos.y, z: this.pos.z };
    this.cena.emit(evento === 'exit' ? EVENTS.AREA_EXIT : EVENTS.AREA_ENTER, { position });
    if (DEBUG) {
      const cor = estado === 'fora' ? COR_FORA : COR_NORMAL;
      for (const faixa of this.faixas) faixa.setAttribute('material', 'color', cor);
    }
  },
});
