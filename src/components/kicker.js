import { CONFIG } from '../config.js';
import { EVENTS } from '../events.js';
import { DEBUG } from '../debug.js';
import { direcaoHorizontal, podePreparar, podeChutar, maoPermitida } from '../logic/kick.js';
import { alvoDaMira, velocidadeDeLancamento } from '../logic/mira.js';

const QUAT = new THREE.Quaternion();
const FRENTE = new THREE.Vector3();
const POSICAO = new THREE.Vector3();
const BOTAO_ESQUERDO = 0;
const DISTANCIA_MIRA = 0.5;
const COR_MIRA = '#ffd21f';

function raioDoObjeto(objeto3D) {
  objeto3D.getWorldPosition(POSICAO);
  objeto3D.getWorldQuaternion(QUAT);
  FRENTE.set(0, 0, -1).applyQuaternion(QUAT);
  return {
    origem: { x: POSICAO.x, y: POSICAO.y, z: POSICAO.z },
    direcao: { x: FRENTE.x, y: FRENTE.y, z: FRENTE.z },
  };
}

function criarMiraNaTela() {
  const material = new THREE.MeshBasicMaterial({
    color: COR_MIRA,
    transparent: true,
    opacity: 0.95,
    depthTest: false,
  });
  const grupo = new THREE.Group();
  const anel = new THREE.Mesh(new THREE.RingGeometry(0.011, 0.014, 32), material);
  const ponto = new THREE.Mesh(new THREE.CircleGeometry(0.0025, 12), material);
  grupo.add(anel, ponto);
  for (const [x, y, w, h] of [
    [0.022, 0, 0.012, 0.002],
    [-0.022, 0, 0.012, 0.002],
    [0, 0.022, 0.002, 0.012],
    [0, -0.022, 0.002, 0.012],
  ]) {
    const traco = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    traco.position.set(x, y, 0);
    grupo.add(traco);
  }
  grupo.traverse((o) => (o.renderOrder = 1005));
  grupo.position.z = -DISTANCIA_MIRA;
  grupo.visible = false;
  return grupo;
}

AFRAME.registerComponent('kicker', {
  init() {
    this.cena = this.el.sceneEl;
    this.preparado = null;
    this.maos = {
      right: document.querySelector('#mao-direita'),
      left: document.querySelector('#mao-esquerda'),
    };
    this.cameraEl = document.querySelector('#camera');
    this.miraNaTela = criarMiraNaTela();
    this.cameraEl.object3D.add(this.miraNaTela);

    this.ouvintes = [];
    const ouvir = (alvo, evento, f) => {
      alvo.addEventListener(evento, f);
      this.ouvintes.push([alvo, evento, f]);
    };

    for (const [mao, el] of Object.entries(this.maos)) {
      if (!el) continue;
      ouvir(el, 'gripdown', () => this.preparar(mao));
      ouvir(el, 'triggerdown', () => this.tentarChutar(mao));
    }

    ouvir(window, 'keydown', (e) => {
      if (e.repeat) return;
      if (e.code === 'KeyE') this.preparar('keyboard');
      if (e.code === 'Space') {
        e.preventDefault();
        this.tentarChutar('keyboard');
      }
    });
    ouvir(window, 'mousedown', (e) => {
      if (e.button !== BOTAO_ESQUERDO || !document.pointerLockElement) return;
      this.tentarChutar('keyboard');
    });

    ouvir(this.cena, EVENTS.BALL_LEFT, () => this.cancelar('bola longe'));
    ouvir(this.cena, EVENTS.BALL_SPAWNED, () => this.cancelar('bola recolocada'));
    ouvir(this.cena, EVENTS.STATE_CHANGE, () => this.cancelar('mudou o estado'));
    ouvir(this.cena, 'enter-vr', () => this.atualizarMiraNaTela());
    ouvir(this.cena, 'exit-vr', () => this.atualizarMiraNaTela());
  },

  remove() {
    for (const [alvo, evento, f] of this.ouvintes) alvo.removeEventListener(evento, f);
    this.cameraEl.object3D.remove(this.miraNaTela);
  },

  bola() {
    return document.querySelector('#bola')?.components?.ball ?? null;
  },

  conectado(mao) {
    return Boolean(this.maos[mao]?.components?.['tracked-controls']?.controller);
  },

  raioDaMira(mao) {
    const camera = this.cena.camera;
    const cabeca = camera
      ? raioDoObjeto(camera)
      : { origem: { x: 0, y: 1.6, z: 0 }, direcao: { x: 0, y: 0, z: -1 } };
    const usarCabeca =
      mao === 'keyboard' || CONFIG.chute.direcaoPor === 'cabeca' || !this.conectado(mao);
    if (usarCabeca) return cabeca;
    const controle = raioDoObjeto(this.maos[mao].object3D);
    const horizontal = Math.hypot(controle.direcao.x, controle.direcao.z);
    return horizontal < CONFIG.chute.minimoHorizontal ? cabeca : controle;
  },

  alvoDoChute(mao) {
    const { origem, direcao } = this.raioDaMira(mao);
    return alvoDaMira(origem, direcao, CONFIG);
  },

  lancamento(mao) {
    const { origem, direcao } = this.raioDaMira(mao);
    const alvo = alvoDaMira(origem, direcao, CONFIG);
    const p = this.bola().el.object3D.position;
    const velocity = velocidadeDeLancamento({ x: p.x, y: p.y, z: p.z }, alvo, direcao, CONFIG);
    return { alvo, velocity };
  },

  direcaoDoChute(mao) {
    return direcaoHorizontal(this.lancamento(mao).velocity, 0);
  },

  maoDaMira() {
    if (this.preparado && this.preparado !== 'keyboard' && this.conectado(this.preparado)) {
      return this.preparado;
    }
    if (this.conectado('right') && maoPermitida('right', CONFIG.chute.maos)) return 'right';
    if (this.conectado('left') && maoPermitida('left', CONFIG.chute.maos)) return 'left';
    return 'keyboard';
  },

  situacao() {
    const bola = this.bola();
    const jogo = this.cena.systems['game-state'];
    if (!bola || !jogo) return null;
    return { bola, estado: jogo.estadoAtual() };
  },

  atualizarMiraNaTela() {
    this.miraNaTela.visible = Boolean(this.preparado) && !this.cena.is('vr-mode');
  },

  preparar(mao) {
    if (this.preparado) return;
    if (mao !== 'keyboard' && !maoPermitida(mao, CONFIG.chute.maos)) return;
    const s = this.situacao();
    if (!s) return;

    const r = podePreparar(s.estado, s.bola.estadoBola, s.bola.estadoProximidade);
    if (!r.ok) {
      if (DEBUG) console.log(`[chute] preparo ignorado: ${r.motivo}`);
      return;
    }

    this.preparado = mao;
    this.atualizarMiraNaTela();
    this.cena.emit(EVENTS.KICK_READY, { hand: mao });
    if (mao !== 'keyboard') this.vibrar(mao, CONFIG.chute.vibracaoPreparo);
  },

  cancelar(reason) {
    if (!this.preparado) return;
    this.preparado = null;
    this.atualizarMiraNaTela();
    this.cena.emit(EVENTS.KICK_CANCEL, { reason });
  },

  tentarChutar(mao) {
    if (mao !== 'keyboard' && !maoPermitida(mao, CONFIG.chute.maos)) return;
    const s = this.situacao();
    if (!s) return;

    const r = podeChutar(s.estado, s.bola.estadoBola, s.bola.estadoProximidade, Boolean(this.preparado));
    if (!r.ok) {
      if (DEBUG) console.log(`[chute] ignorado: ${r.motivo}`);
      return;
    }

    const { alvo, velocity } = this.lancamento(mao);
    this.preparado = null;
    this.atualizarMiraNaTela();
    const p = s.bola.el.object3D.position;
    this.cena.emit(EVENTS.KICK, {
      direction: direcaoHorizontal(velocity, 0),
      power: 1,
      position: { x: p.x, y: p.y, z: p.z },
      hand: mao,
      target: alvo ? { ...alvo.ponto } : null,
      velocity,
    });
    if (mao !== 'keyboard') this.vibrar(mao, CONFIG.chute.vibracao);
  },

  vibrar(mao, { intensidade, duracaoMs }) {
    try {
      const gamepad = this.maos[mao]?.components?.['tracked-controls']?.controller?.gamepad;
      gamepad?.hapticActuators?.[0]?.pulse?.(intensidade, duracaoMs);
    } catch {
    }
  },
});
