import { CONFIG } from '../config.js';
import { EVENTS } from '../events.js';
import { ehFaseJogavel } from '../logic/state-machine.js';
import { distanciaNoChao, atualizarProximidade } from '../logic/proximity.js';
import { passoBola, rebaterNasBandas, noAr } from '../logic/physics.js';
import {
  classificarNoGol,
  pontoDeCruzamento,
  rebaterNaTrave,
  rebaterNoTravessao,
  limitesDoCampo,
  foraDoCampo,
} from '../logic/goal.js';
import { posicaoGol, posicaoMarcaPenalti } from '../logic/area.js';
import { posicaoCabeca } from '../head.js';

const EIXO = new THREE.Vector3();
const GIRO = new THREE.Quaternion();
const arredondar = (n) => Math.round(n * 1000) / 1000;

AFRAME.registerComponent('ball', {
  init() {
    this.cena = this.el.sceneEl;
    this.cabeca = new THREE.Vector3();
    this.ativa = false;
    this.estadoBola = 'esperando';
    this.estadoProximidade = 'longe';
    this.distancia = Infinity;
    this.momentoSpawn = 0;
    this.posicaoSaida = posicaoMarcaPenalti(CONFIG);
    this.vel = { x: 0, y: 0, z: 0 };
    this.tempoRolando = 0;
    this.ultimoResultado = null;
    this.acumuladoProximidade = 0;
    this.gol = posicaoGol(CONFIG);

    this.el.setAttribute('geometry', {
      primitive: 'sphere',
      radius: CONFIG.bola.raio,
      segmentsWidth: 24,
      segmentsHeight: 16,
    });
    this.el.setAttribute('material', { color: '#f5c518', roughness: 0.6 });
    this.criarFaixas();
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

  reagirAoEstado(estado) {
    if (ehFaseJogavel(estado)) {
      this.ativa = true;
      this.el.setAttribute('visible', true);
      this.posicaoSaida = posicaoMarcaPenalti(CONFIG);
      this.colocarEm(this.posicaoSaida);
    } else {
      this.ativa = false;
      this.el.setAttribute('visible', false);
      this.estadoBola = 'esperando';
      this.estadoProximidade = 'longe';
      this.distancia = Infinity;
      this.vel = { x: 0, y: 0, z: 0 };
    }
  },

  colocarEm({ x, z }) {
    this.el.object3D.position.set(x, CONFIG.bola.raio, z);
    this.vel = { x: 0, y: 0, z: 0 };
    this.estadoBola = 'esperando';
    this.estadoProximidade = 'longe';
    this.distancia = Infinity;
    this.acumuladoProximidade = 0;
    this.momentoSpawn = performance.now();
    this.cena.emit(EVENTS.BALL_SPAWNED, { position: { x, y: CONFIG.bola.raio, z } });
  },

  recolocar() {
    if (!this.ativa) return;
    this.ultimoResultado = null;
    this.colocarEm(this.posicaoSaida);
  },

  velocidade() {
    return Math.hypot(this.vel.x, this.vel.y, this.vel.z);
  },

  iniciarRolagem({ direction, power, velocity }) {
    if (!this.ativa || this.estadoBola !== 'esperando') return;
    if (velocity) {
      this.vel = { x: velocity.x, y: velocity.y ?? 0, z: velocity.z };
    } else {
      const v = CONFIG.chute.velocidade * (power ?? 1);
      this.vel = { x: direction.x * v, y: 0, z: direction.z * v };
    }
    this.tempoRolando = 0;
    this.saiuDoCampo = false;
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

  parada(pos) {
    return !noAr(pos, this.vel, CONFIG) && Math.hypot(this.vel.x, this.vel.z) <= CONFIG.fisica.velocidadeParada;
  },

  passoDaRolagem(dt) {
    const p = this.el.object3D.position;
    const anterior = { x: p.x, y: p.y, z: p.z };
    const r = passoBola(anterior, this.vel, dt, CONFIG);
    let pos = r.pos;
    let parou = r.parou;
    this.vel = r.vel;
    this.tempoRolando += Math.min(dt, CONFIG.fisica.dtMaximo);

    if (this.estadoBola === 'rolando') {
      const c = pontoDeCruzamento(anterior, pos, this.gol.z);
      if (c !== null) {
        const tipo = classificarNoGol({ x: c.x - this.gol.x, y: c.y }, CONFIG);
        const naLinha = { x: arredondar(c.x), y: arredondar(c.y), z: this.gol.z };
        if (tipo === 'gol') {
          this.decidir('gol', () => this.cena.emit(EVENTS.GOAL, { position: naLinha }));
        } else if (tipo === 'fora' || tipo === 'alto') {
          this.decidir(`miss (${tipo})`, () => this.cena.emit(EVENTS.MISS, { reason: tipo }));
        } else {
          const side = { 'trave-esquerda': 'left', 'trave-direita': 'right', travessao: 'top' }[tipo];
          pos = { x: c.x, y: Math.max(c.y, CONFIG.bola.raio), z: this.gol.z + 0.001 };
          const antes = r.parou ? { x: 0, y: 0, z: 0 } : this.vel;
          this.vel = tipo === 'travessao' ? rebaterNoTravessao(antes, CONFIG) : rebaterNaTrave(antes, CONFIG);
          parou = this.parada(pos);
          this.cena.emit(EVENTS.POST_HIT, { side, position: naLinha });
          this.decidir('miss (trave)', () => this.cena.emit(EVENTS.MISS, { reason: 'trave' }));
        }
      }
    }

    const banda = rebaterNasBandas(pos, this.vel, CONFIG);
    if (banda.bateu) {
      pos = banda.pos;
      this.vel = banda.vel;
      parou = parou || this.parada(pos);
    }

    if (foraDoCampo(pos, CONFIG)) {
      const l = limitesDoCampo(CONFIG);
      pos = {
        x: Math.min(Math.max(pos.x, l.minX), l.maxX),
        y: pos.y,
        z: Math.min(Math.max(pos.z, l.minZ), l.maxZ),
      };
      this.vel = { x: 0, y: this.vel.y, z: 0 };
      this.saiuDoCampo = true;
      parou = this.parada(pos);
    }

    if (this.tempoRolando >= CONFIG.fisica.tempoMaximo) {
      pos = { ...pos, y: CONFIG.bola.raio };
      parou = true;
    }

    this.girar(anterior, pos);
    p.set(pos.x, pos.y, pos.z);

    if (parou) {
      this.vel = { x: 0, y: 0, z: 0 };
      p.y = CONFIG.bola.raio;
      if (this.estadoBola === 'rolando') {
        const reason = this.saiuDoCampo ? 'saiu' : 'curta';
        this.decidir(`miss (${reason})`, () => this.cena.emit(EVENTS.MISS, { reason }));
      }
      this.estadoBola = 'parada';
      this.cena.emit(EVENTS.BALL_STOPPED, {
        position: { x: arredondar(pos.x), y: CONFIG.bola.raio, z: arredondar(pos.z) },
      });
    }
  },

  decidir(rotulo, emitir) {
    if (this.estadoBola !== 'rolando') return;
    this.estadoBola = 'decidida';
    this.ultimoResultado = rotulo;
    emitir();
  },

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
