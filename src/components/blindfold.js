import { CONFIG } from '../config.js';
import { EVENTS } from '../events.js';
import { DEBUG, VISAO_DA_URL } from '../debug.js';
import { ESTADOS } from '../logic/state-machine.js';
import { Animador } from '../logic/animador.js';
import { visaoInicial } from '../logic/visao.js';
import { texturaFaixa } from '../visual/canvas.js';

const RAIO_ESFERA = 0.4;
const DISTANCIA_FAIXA = 0.3;
const FAIXA_Y_INICIO = 1.0;
const FAIXA_Y_FIM = -0.15;
const ORDEM = 1000;

const SEM_VENDA = [ESTADOS.VESTIARIO, ESTADOS.RESULTADO];

AFRAME.registerComponent('blindfold', {
  init() {
    this.cena = this.el.sceneEl;
    this.animador = new Animador();
    this.estado = 'tirada';
    this.visaoLivre = visaoInicial(VISAO_DA_URL, CONFIG.venda.visaoLivre);

    this.grupo = new THREE.Group();
    this.grupo.visible = false;

    this.esfera = new THREE.Mesh(
      new THREE.SphereGeometry(RAIO_ESFERA, 24, 16),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false,
      }),
    );
    this.esfera.renderOrder = ORDEM;
    this.esfera.frustumCulled = false;

    this.faixa = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.2),
      new THREE.MeshBasicMaterial({
        map: texturaFaixa(),
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    );
    this.faixa.renderOrder = ORDEM + 1;
    this.faixa.frustumCulled = false;
    this.faixa.position.set(0, FAIXA_Y_INICIO, -DISTANCIA_FAIXA);

    this.grupo.add(this.esfera, this.faixa);
    document.querySelector('#camera').object3D.add(this.grupo);

    this.aoMudarEstado = (e) => {
      if (SEM_VENDA.includes(e.detail.to)) this.desligar();
      else this.ligar();
    };
    this.cena.addEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);

    if (DEBUG) {
      this.aoTeclar = (e) => {
        if (e.code === 'KeyV' && !e.repeat) this.alternarVisao();
      };
      this.aoBotaoY = () => this.alternarVisao();
      this.maoEsquerda = document.querySelector('#mao-esquerda');
      window.addEventListener('keydown', this.aoTeclar);
      this.maoEsquerda?.addEventListener('ybuttondown', this.aoBotaoY);
    }
  },

  alternarVisao() {
    this.visaoLivre = !this.visaoLivre;
    console.log(`[debug] visão ${this.visaoLivre ? 'livre' : 'vendada'}`);
    if (this.estado === 'posta') this.aplicarVisao();
  },

  aplicarVisao() {
    this.grupo.visible = !this.visaoLivre;
    this.esfera.material.opacity = this.visaoLivre ? 0 : 1;
  },

  async colocar() {
    if (this.estado !== 'tirada') return false;
    const { duracaoFaixa, duracaoFade, pausaNoEscuro } = CONFIG.venda;
    this.estado = 'colocando';
    this.grupo.visible = true;
    this.faixa.visible = true;
    this.faixa.position.y = FAIXA_Y_INICIO;
    this.esfera.material.opacity = 0;

    const resultados = await Promise.all([
      this.animador.animar({
        duracao: duracaoFaixa,
        de: FAIXA_Y_INICIO,
        para: FAIXA_Y_FIM,
        easing: 'suave',
        aoAtualizar: (y) => (this.faixa.position.y = y),
      }),
      this.animador.animar({
        duracao: duracaoFade,
        easing: 'entrada',
        aoAtualizar: (o) => (this.esfera.material.opacity = o),
      }),
    ]);
    if (!resultados.every(Boolean)) return false;

    this.faixa.visible = false;
    if (!(await this.animador.esperar(pausaNoEscuro))) return false;

    this.estado = 'posta';
    this.cena.emit(EVENTS.BLINDFOLD_ON);
    return true;
  },

  ligar() {
    this.animador.parar();
    this.estado = 'posta';
    this.faixa.visible = false;
    this.aplicarVisao();
  },

  desligar() {
    this.animador.parar();
    this.estado = 'tirada';
    this.grupo.visible = false;
    this.esfera.material.opacity = 0;
    this.faixa.visible = true;
    this.faixa.position.y = FAIXA_Y_INICIO;
  },

  tick(tempo) {
    this.animador.atualizar(tempo);
  },

  remove() {
    this.cena.removeEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);
    if (DEBUG) {
      window.removeEventListener('keydown', this.aoTeclar);
      this.maoEsquerda?.removeEventListener('ybuttondown', this.aoBotaoY);
    }
    this.grupo.removeFromParent();
    for (const m of [this.esfera, this.faixa]) {
      m.geometry.dispose();
      m.material.map?.dispose();
      m.material.dispose();
    }
  },
});
