// Chute: lê o gatilho dos controles (Quest) e a barra de espaço (computador),
// decide se o chute vale e para onde vai, e emite `kick`. Quem move a bola é o componente `ball`.
// Uso: <a-entity id="rig" kicker> (com #mao-direita, #mao-esquerda e a câmera dentro).
import { CONFIG } from '../config.js';
import { EVENTS } from '../events.js';
import { DEBUG } from '../debug.js';
import { direcaoHorizontal, podeChutar, maoPermitida } from '../logic/kick.js';

const QUAT = new THREE.Quaternion();
const FRENTE = new THREE.Vector3();

/** Frente (-z) de um objeto no mundo, como { x, y, z }. */
function frenteNoMundo(objeto3D) {
  objeto3D.getWorldQuaternion(QUAT);
  FRENTE.set(0, 0, -1).applyQuaternion(QUAT);
  return { x: FRENTE.x, y: FRENTE.y, z: FRENTE.z };
}

AFRAME.registerComponent('kicker', {
  init() {
    this.cena = this.el.sceneEl;
    this.maos = {
      right: document.querySelector('#mao-direita'),
      left: document.querySelector('#mao-esquerda'),
    };

    this.ouvintes = [];
    for (const [mao, el] of Object.entries(this.maos)) {
      if (!el) continue;
      const f = () => this.tentarChutar(mao);
      el.addEventListener('triggerdown', f);
      this.ouvintes.push([el, f]);
    }

    this.aoTeclar = (e) => {
      if (e.code !== 'Space' || e.repeat) return;
      e.preventDefault(); // não rolar a página
      this.tentarChutar('keyboard');
    };
    window.addEventListener('keydown', this.aoTeclar);
  },

  remove() {
    for (const [el, f] of this.ouvintes) el.removeEventListener('triggerdown', f);
    window.removeEventListener('keydown', this.aoTeclar);
  },

  bola() {
    return document.querySelector('#bola')?.components?.ball ?? null;
  },

  /** Controle conectado e rastreado (no computador, nenhum está). */
  conectado(mao) {
    return Boolean(this.maos[mao]?.components?.['tracked-controls']?.controller);
  },

  /**
   * Direção em que o chute iria agora, no chão.
   * `mao`: 'right' | 'left' | 'keyboard'. Teclado ou `direcaoPor: 'cabeca'` usam a cabeça.
   */
  direcaoDoChute(mao) {
    const camera = this.cena.camera;
    const cabeca = camera ? frenteNoMundo(camera) : { x: 0, y: 0, z: -1 };
    const usarCabeca =
      mao === 'keyboard' || CONFIG.chute.direcaoPor === 'cabeca' || !this.conectado(mao);
    if (usarCabeca) return direcaoHorizontal(cabeca, 0);
    const controle = frenteNoMundo(this.maos[mao].object3D);
    return direcaoHorizontal(controle, CONFIG.chute.minimoHorizontal, cabeca);
  },

  /** Mão usada para a linha de mira do modo debug: direita, esquerda ou teclado. */
  maoDaMira() {
    if (this.conectado('right') && maoPermitida('right', CONFIG.chute.maos)) return 'right';
    if (this.conectado('left') && maoPermitida('left', CONFIG.chute.maos)) return 'left';
    return 'keyboard';
  },

  tentarChutar(mao) {
    if (mao !== 'keyboard' && !maoPermitida(mao, CONFIG.chute.maos)) return;
    const bola = this.bola();
    const jogo = this.cena.systems['game-state'];
    if (!bola || !jogo) return;

    const r = podeChutar(jogo.estadoAtual(), bola.estadoBola, bola.estadoProximidade);
    if (!r.ok) {
      if (DEBUG) console.log(`[chute] ignorado: ${r.motivo}`);
      return;
    }

    const p = bola.el.object3D.position;
    this.cena.emit(EVENTS.KICK, {
      direction: this.direcaoDoChute(mao),
      power: 1, // força fixa por enquanto
      position: { x: p.x, y: p.y, z: p.z },
      hand: mao,
    });
    if (mao !== 'keyboard') this.vibrar(mao);
  },

  // Pulso curto no controle que chutou. Se não houver suporte, não faz nada.
  vibrar(mao) {
    try {
      const gamepad = this.maos[mao]?.components?.['tracked-controls']?.controller?.gamepad;
      const atuador = gamepad?.hapticActuators?.[0];
      const { intensidade, duracaoMs } = CONFIG.chute.vibracao;
      atuador?.pulse?.(intensidade, duracaoMs);
    } catch {
      // Vibração é opcional.
    }
  },
});
