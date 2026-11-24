import { CONFIG } from '../config.js';
import { Animador } from '../logic/animador.js';
import { distanciaNoChao } from '../logic/proximity.js';
import { atualizarAlcanceVenda, textoInstrucao } from '../logic/vestiario.js';
import { posicaoCabeca } from '../head.js';

const DISTANCIA_FRENTE = 0.32;
const DURACAO_VESTIR = 350;
const DURACAO_AVISO = 2500;
const ESCALA_HOVER = 1.15;
const BRILHO_HOVER = '#3a3a10';
const MEIA_VOLTA = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
const DE_PE = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);

AFRAME.registerComponent('venda-interativa', {
  schema: {
    inicio: { type: 'vec3' },
  },

  init() {
    this.cena = this.el.sceneEl;
    this.animador = new Animador();
    this.cabeca = new THREE.Vector3();
    this.quatCabeca = new THREE.Quaternion();
    this.alvo = new THREE.Vector3();
    this.ativa = false;
    this.pegando = false;
    this.alcance = 'longe';
    this.avisoAte = 0;
    this.cursores = new Set();

    this.el.classList.add('clicavel');

    const caixa = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.16, 0.28),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    caixa.position.y = 0.05;
    this.el.setObject3D('alvo-clique', caixa);

    this.aoEntrarCursor = (e) => {
      this.cursores.add(e.detail?.cursorEl ?? e.target);
      this.destacar(true);
    };
    this.aoSairCursor = (e) => {
      this.cursores.delete(e.detail?.cursorEl ?? e.target);
      if (this.cursores.size === 0) this.destacar(false);
    };
    this.aoClicar = () => this.clicar();
    this.el.addEventListener('mouseenter', this.aoEntrarCursor);
    this.el.addEventListener('mouseleave', this.aoSairCursor);
    this.el.addEventListener('click', this.aoClicar);

    this.checarAlcanceLimitado = AFRAME.utils.throttleTick(
      this.checarAlcance,
      CONFIG.vestiario.intervaloAlcance,
      this,
    );
  },

  remove() {
    this.el.removeEventListener('mouseenter', this.aoEntrarCursor);
    this.el.removeEventListener('mouseleave', this.aoSairCursor);
    this.el.removeEventListener('click', this.aoClicar);
    this.el.removeObject3D('alvo-clique');
  },

  get instrucoes() {
    return document.querySelector('#instrucoes')?.components.instrucoes;
  },

  ativar() {
    this.animador.parar();
    const o = this.el.object3D;
    o.position.copy(this.data.inicio);
    o.quaternion.identity();
    o.scale.setScalar(1);
    o.visible = true;
    this.cursores.clear();
    this.destacar(false);
    this.alcance = 'longe';
    this.avisoAte = 0;
    this.pegando = false;
    this.ativa = true;
  },

  desativar() {
    this.ativa = false;
    this.animador.parar();
    this.cursores.clear();
    this.destacar(false);
  },

  destacar(ligado) {
    if (this.pegando) ligado = false;
    this.el.object3D.scale.setScalar(ligado ? ESCALA_HOVER : 1);
    this.el.getObject3D('mesh')?.traverse((m) => {
      if (m.material?.emissive) m.material.emissive.set(ligado ? BRILHO_HOVER : '#000000');
    });
  },

  distanciaAteCabeca() {
    posicaoCabeca(this.cena, this.cabeca);
    return distanciaNoChao(this.cabeca, this.data.inicio);
  },

  checarAlcance() {
    if (!this.ativa || this.pegando) return;
    const { estado, evento } = atualizarAlcanceVenda(this.alcance, this.distanciaAteCabeca(), CONFIG);
    this.alcance = estado;
    if (evento) this.avisoAte = 0;
    if (performance.now() < this.avisoAte) return;
    this.instrucoes?.mostrar(textoInstrucao(estado === 'perto' ? 'clicar' : 'ir'));
  },

  clicar() {
    if (!this.ativa || this.pegando) return;
    const { estado } = atualizarAlcanceVenda(this.alcance, this.distanciaAteCabeca(), CONFIG);
    this.alcance = estado;
    if (estado !== 'perto') {
      this.instrucoes?.mostrar(textoInstrucao('longe'));
      this.avisoAte = performance.now() + DURACAO_AVISO;
      return;
    }
    this.pegar();
  },

  async pegar() {
    this.pegando = true;
    this.destacar(false);
    this.el.emit('venda-pegando');
    this.instrucoes?.mostrar(textoInstrucao('colocando'));

    const o = this.el.object3D;
    const posInicial = o.position.clone();
    const quatInicial = o.quaternion.clone();
    const quatDeitada = new THREE.Quaternion();
    const quatDePe = new THREE.Quaternion();
    const frente = new THREE.Vector3();

    const ok = await this.animador.animar({
      duracao: CONFIG.venda.duracaoAproximar,
      easing: 'suave',
      aoAtualizar: (t) => {
        this.poseDaCabeca(quatDeitada);
        quatDePe.copy(quatDeitada).multiply(DE_PE);
        frente.set(0, 0, -DISTANCIA_FRENTE).applyQuaternion(this.quatCabeca).add(this.cabeca);
        o.position.lerpVectors(posInicial, frente, t);
        o.quaternion.slerpQuaternions(quatInicial, quatDePe, t);
      },
    });
    if (!ok) return;

    const blindfold = document.querySelector('#venda-efeito')?.components.blindfold;
    const colocacao = blindfold ? blindfold.colocar() : Promise.resolve(false);
    const posFrente = o.position.clone();
    const vestiu = await this.animador.animar({
      duracao: DURACAO_VESTIR,
      easing: 'entrada',
      aoAtualizar: (t) => {
        this.poseDaCabeca(quatDeitada);
        quatDePe.copy(quatDeitada).multiply(DE_PE);
        o.position.lerpVectors(posFrente, this.cabeca, t);
        o.quaternion.slerpQuaternions(quatDePe, quatDeitada, t);
      },
    });
    if (vestiu) o.visible = false;
    await colocacao;
  },

  poseDaCabeca(quatVenda) {
    posicaoCabeca(this.cena, this.cabeca);
    this.cena.camera.getWorldQuaternion(this.quatCabeca);
    quatVenda.copy(this.quatCabeca).multiply(MEIA_VOLTA);
  },

  tick(tempo, delta) {
    this.animador.atualizar(tempo);
    this.checarAlcanceLimitado(tempo, delta);
  },
});
