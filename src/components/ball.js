// Bola: forma, posição e detecção de proximidade com a cabeça.
// Uso: <a-entity id="bola" ball></a-entity>
// Não mexe em som: a Anna coloca o guizo (sound posicional) nesta mesma entidade.
import { CONFIG } from '../config.js';
import { EVENTS } from '../events.js';
import { ehFaseJogavel } from '../logic/state-machine.js';
import { distanciaNoChao, atualizarProximidade } from '../logic/proximity.js';
import { posicaoCabeca } from '../head.js';

AFRAME.registerComponent('ball', {
  init() {
    this.cena = this.el.sceneEl;
    this.cabeca = new THREE.Vector3();
    this.ativa = false;
    this.estadoProximidade = 'longe';
    this.distancia = Infinity;
    this.momentoSpawn = 0;

    this.el.setAttribute('geometry', {
      primitive: 'sphere',
      radius: CONFIG.bola.raio,
      segmentsWidth: 24,
      segmentsHeight: 16,
    });
    this.el.setAttribute('material', { color: '#f5c518', roughness: 0.6 });
    this.el.setAttribute('visible', false);

    this.aoMudarEstado = (e) => this.reagirAoEstado(e.detail.to);
    this.cena.addEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);

    this.tick = AFRAME.utils.throttleTick(this.checar, CONFIG.intervalos.proximidade, this);
  },

  remove() {
    this.cena.removeEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);
  },

  // A bola só está em jogo nas fases jogáveis (tutorial, fase2, fase3).
  reagirAoEstado(estado) {
    if (ehFaseJogavel(estado)) {
      this.ativa = true;
      this.el.setAttribute('visible', true);
      // Por enquanto todas as fases usam a posição do tutorial.
      // Sorteio da fase 2: 30/11. Movimento da fase 3: 01/12.
      this.colocarEm(CONFIG.bola.posicaoTutorial);
    } else {
      this.ativa = false;
      this.el.setAttribute('visible', false);
      this.estadoProximidade = 'longe';
      this.distancia = Infinity;
    }
  },

  /** Coloca a bola apoiada no chão em (x, z) e emite ball-spawned. */
  colocarEm({ x, z }) {
    this.el.object3D.position.set(x, CONFIG.bola.raio, z);
    this.estadoProximidade = 'longe';
    this.momentoSpawn = performance.now();
    this.cena.emit(EVENTS.BALL_SPAWNED, { position: { x, y: CONFIG.bola.raio, z } });
  },

  checar() {
    if (!this.ativa) return;
    posicaoCabeca(this.cena, this.cabeca);
    this.distancia = distanciaNoChao(this.cabeca, this.el.object3D.position);
    const { estado, evento } = atualizarProximidade(this.estadoProximidade, this.distancia, CONFIG);
    this.estadoProximidade = estado;

    const distance = Math.round(this.distancia * 1000) / 1000; // milímetros bastam
    if (evento === 'reached') {
      this.cena.emit(EVENTS.BALL_REACHED, {
        distance,
        timeMs: Math.round(performance.now() - this.momentoSpawn),
      });
    } else if (evento === 'left') {
      this.cena.emit(EVENTS.BALL_LEFT, { distance });
    }
  },
});
