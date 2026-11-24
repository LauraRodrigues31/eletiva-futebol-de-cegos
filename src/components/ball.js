// Bola: forma, posição, proximidade com a cabeça, física do chute e resultado (gol, trave, fora).
// Uso: <a-entity id="bola" ball></a-entity>
// Não mexe em som: a Anna coloca o guizo (sound posicional) nesta mesma entidade.
//
// Estados da bola:
//   esperando → (kick) → rolando → (goal/miss) → decidida → (parou) → parada
//   rolando → (parou ou saiu do campo sem chegar ao gol: miss) → parada
//   qualquer um → recolocar() → esperando
//
// Ordem dos eventos em cada chute: kick → (post-hit)? → goal | miss → ball-stopped
import { CONFIG } from '../config.js';
import { EVENTS } from '../events.js';
import { ehFaseJogavel } from '../logic/state-machine.js';
import { distanciaNoChao, atualizarProximidade } from '../logic/proximity.js';
import { passoFisica } from '../logic/physics.js';
import {
  classificarCruzamento,
  cruzamentoDaLinha,
  rebaterNaTrave,
  limitesDoCampo,
  foraDoCampo,
} from '../logic/goal.js';
import { posicaoGol } from '../logic/area.js';
import { posicaoCabeca } from '../head.js';

const EIXO = new THREE.Vector3();
const GIRO = new THREE.Quaternion();
const arredondar = (n) => Math.round(n * 1000) / 1000; // milímetros bastam

AFRAME.registerComponent('ball', {
  init() {
    this.cena = this.el.sceneEl;
    this.cabeca = new THREE.Vector3();
    this.ativa = false;
    this.estadoBola = 'esperando';
    this.estadoProximidade = 'longe';
    this.distancia = Infinity;
    this.momentoSpawn = 0;
    this.posicaoSaida = { ...CONFIG.bola.posicaoTutorial };
    this.vel = { x: 0, z: 0 };
    this.tempoRolando = 0;
    this.ultimoResultado = null; // 'gol' | 'miss (fora)' ... (para o painel de debug)
    this.acumuladoProximidade = 0;
    this.gol = posicaoGol(CONFIG);

    this.el.setAttribute('geometry', {
      primitive: 'sphere',
      radius: CONFIG.bola.raio,
      segmentsWidth: 24,
      segmentsHeight: 16,
    });
    this.el.setAttribute('material', { color: '#f5c518', roughness: 0.6 });
    this.criarFaixas(); // faixa escura para o giro ficar visível
    this.el.setAttribute('visible', false);

    this.aoMudarEstado = (e) => this.reagirAoEstado(e.detail.to);
    this.aoChutar = (e) => this.iniciarRolagem(e.detail);
    this.cena.addEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);
    this.cena.addEventListener(EVENTS.KICK, this.aoChutar);
  },

  remove() {
    this.cena.removeEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);
    this.cena.removeEventListener(EVENTS.KICK, this.aoChutar);
  },

  criarFaixas() {
    const faixa = document.createElement('a-entity');
    faixa.setAttribute('geometry', {
      primitive: 'torus',
      radius: CONFIG.bola.raio * 1.001,
      radiusTubular: CONFIG.bola.raio * 0.08,
      segmentsTubular: 24,
    });
    faixa.setAttribute('material', { color: '#3a2f00' });
    this.el.appendChild(faixa);
  },

  // A bola só está em jogo nas fases jogáveis (tutorial, fase2, fase3).
  reagirAoEstado(estado) {
    if (ehFaseJogavel(estado)) {
      this.ativa = true;
      this.el.setAttribute('visible', true);
      // Por enquanto todas as fases usam a posição do tutorial.
      // Sorteio da fase 2: 30/11. Movimento da fase 3: 01/12.
      this.posicaoSaida = { ...CONFIG.bola.posicaoTutorial };
      this.colocarEm(this.posicaoSaida);
    } else {
      this.ativa = false;
      this.el.setAttribute('visible', false);
      this.estadoBola = 'esperando';
      this.estadoProximidade = 'longe';
      this.distancia = Infinity;
      this.vel = { x: 0, z: 0 };
    }
  },

  /** Coloca a bola parada no chão em (x, z), pronta para ser chutada, e emite ball-spawned. */
  colocarEm({ x, z }) {
    this.el.object3D.position.set(x, CONFIG.bola.raio, z);
    this.vel = { x: 0, z: 0 };
    this.estadoBola = 'esperando';
    this.estadoProximidade = 'longe';
    this.distancia = Infinity;
    this.acumuladoProximidade = 0;
    this.momentoSpawn = performance.now();
    this.cena.emit(EVENTS.BALL_SPAWNED, { position: { x, y: CONFIG.bola.raio, z } });
  },

  /** Volta a bola para o lugar de saída (modo debug agora; ciclo de tentativas na quinta). */
  recolocar() {
    if (!this.ativa) return;
    this.ultimoResultado = null;
    this.colocarEm(this.posicaoSaida);
  },

  /** Velocidade atual em m/s (para o painel de debug). */
  velocidade() {
    return Math.hypot(this.vel.x, this.vel.z);
  },

  // O kicker já validou o chute; aqui só conferimos de novo o estado da bola.
  iniciarRolagem({ direction, power }) {
    if (!this.ativa || this.estadoBola !== 'esperando') return;
    const v = CONFIG.chute.velocidade * (power ?? 1);
    this.vel = { x: direction.x * v, z: direction.z * v };
    this.tempoRolando = 0;
    this.ultimoResultado = null;
    this.estadoBola = 'rolando';
  },

  tick(_t, dtMs) {
    if (!this.ativa || !dtMs) return;

    if (this.estadoBola === 'esperando') {
      this.acumuladoProximidade += dtMs;
      if (this.acumuladoProximidade >= CONFIG.intervalos.proximidade) {
        this.acumuladoProximidade = 0;
        this.checarProximidade();
      }
    } else if (this.estadoBola === 'rolando' || this.estadoBola === 'decidida') {
      this.passoDaRolagem(dtMs / 1000);
    }
  },

  checarProximidade() {
    posicaoCabeca(this.cena, this.cabeca);
    this.distancia = distanciaNoChao(this.cabeca, this.el.object3D.position);
    const { estado, evento } = atualizarProximidade(this.estadoProximidade, this.distancia, CONFIG);
    this.estadoProximidade = estado;

    const distance = arredondar(this.distancia);
    if (evento === 'reached') {
      this.cena.emit(EVENTS.BALL_REACHED, {
        distance,
        timeMs: Math.round(performance.now() - this.momentoSpawn),
      });
    } else if (evento === 'left') {
      this.cena.emit(EVENTS.BALL_LEFT, { distance });
    }
  },

  passoDaRolagem(dt) {
    const p = this.el.object3D.position;
    const anterior = { x: p.x, z: p.z };
    const r = passoFisica(anterior, this.vel, dt, CONFIG);
    let pos = r.pos;
    let parou = r.parou;
    this.vel = r.vel;
    this.tempoRolando += Math.min(dt, CONFIG.fisica.dtMaximo);

    // 1. Chegou na linha do gol?
    if (this.estadoBola === 'rolando') {
      const x = cruzamentoDaLinha(anterior, pos, this.gol.z);
      if (x !== null) {
        const tipo = classificarCruzamento(x - this.gol.x, CONFIG);
        const naLinha = { x: arredondar(x), y: CONFIG.bola.raio, z: this.gol.z };
        if (tipo === 'gol') {
          this.decidir('gol', () => this.cena.emit(EVENTS.GOAL, { position: naLinha }));
        } else if (tipo === 'fora') {
          this.decidir('miss (fora)', () => this.cena.emit(EVENTS.MISS, { reason: 'fora' }));
        } else {
          // Trave: volta para a frente da linha e quica para trás.
          const side = tipo === 'trave-esquerda' ? 'left' : 'right';
          pos = { x, z: this.gol.z + 0.001 };
          this.vel = rebaterNaTrave(r.parou ? { x: 0, z: 0 } : this.vel, CONFIG);
          parou = Math.hypot(this.vel.x, this.vel.z) <= CONFIG.fisica.velocidadeParada;
          this.cena.emit(EVENTS.POST_HIT, { side, position: naLinha });
          this.decidir('miss (trave)', () => this.cena.emit(EVENTS.MISS, { reason: 'trave' }));
        }
      }
    }

    // 2. Saiu do campo? Para no limite.
    let saiu = false;
    if (foraDoCampo(pos, CONFIG)) {
      const l = limitesDoCampo(CONFIG);
      pos = {
        x: Math.min(Math.max(pos.x, l.minX), l.maxX),
        z: Math.min(Math.max(pos.z, l.minZ), l.maxZ),
      };
      saiu = true;
      parou = true;
    }

    // 3. Passou do tempo máximo?
    if (this.tempoRolando >= CONFIG.fisica.tempoMaximo) parou = true;

    this.girar(anterior, pos);
    p.set(pos.x, CONFIG.bola.raio, pos.z);

    if (parou) {
      this.vel = { x: 0, z: 0 };
      if (this.estadoBola === 'rolando') {
        const reason = saiu ? 'saiu' : 'curta';
        this.decidir(`miss (${reason})`, () => this.cena.emit(EVENTS.MISS, { reason }));
      }
      this.estadoBola = 'parada';
      this.cena.emit(EVENTS.BALL_STOPPED, {
        position: { x: arredondar(pos.x), y: CONFIG.bola.raio, z: arredondar(pos.z) },
      });
    }
  },

  // Garante um único resultado por chute.
  decidir(rotulo, emitir) {
    if (this.estadoBola !== 'rolando') return;
    this.estadoBola = 'decidida';
    this.ultimoResultado = rotulo;
    emitir();
  },

  // Giro visual: rola em torno do eixo perpendicular ao movimento.
  girar(de, para) {
    const dx = para.x - de.x;
    const dz = para.z - de.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 1e-6) return;
    EIXO.set(dz / dist, 0, -dx / dist);
    GIRO.setFromAxisAngle(EIXO, dist / CONFIG.bola.raio);
    this.el.object3D.quaternion.premultiply(GIRO);
  },
});
