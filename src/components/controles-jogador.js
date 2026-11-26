import { CONFIG } from '../config.js';
import { EVENTS } from '../events.js';
import { ESTADOS } from '../logic/state-machine.js';
import { deslocamentoDoRig } from '../logic/area.js';

const RECOMECAM_NO_CENTRO = [ESTADOS.VESTIARIO, ESTADOS.ENTRADA_CAMPO];

AFRAME.registerComponent('controles-jogador', {
  init() {
    this.cena = this.el.sceneEl;
    this.cameraEl = document.querySelector('#camera');
    this.maoDireita = document.querySelector('#mao-direita');
    this.escala = 1;
    this.noVestiario = true;
    this.devagar = false;

    this.aoMudarEstado = (e) => this.reagirAoEstado(e.detail);
    this.aoTeclar = (e) => {
      if (e.code === 'KeyR' && !e.repeat) this.recolocarBola();
      if (e.key === 'Shift') this.andarDevagar(true);
    };
    this.aoSoltar = (e) => {
      if (e.key === 'Shift') this.andarDevagar(false);
    };
    this.aoPerderFoco = () => this.andarDevagar(false);
    this.aoBotaoA = () => this.recolocarBola();

    this.cena.addEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);
    window.addEventListener('keydown', this.aoTeclar);
    window.addEventListener('keyup', this.aoSoltar);
    window.addEventListener('blur', this.aoPerderFoco);
    this.maoDireita?.addEventListener('abuttondown', this.aoBotaoA);
    this.aplicarVelocidade();
  },

  remove() {
    this.cena.removeEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);
    window.removeEventListener('keydown', this.aoTeclar);
    window.removeEventListener('keyup', this.aoSoltar);
    window.removeEventListener('blur', this.aoPerderFoco);
    this.maoDireita?.removeEventListener('abuttondown', this.aoBotaoA);
    this.el.object3D.position.set(0, 0, 0);
  },

  reagirAoEstado({ from, to }) {
    this.noVestiario = to === ESTADOS.VESTIARIO;
    this.escala = this.noVestiario ? 1 : CONFIG.escala;
    this.aplicarVelocidade();
    if (from !== null && RECOMECAM_NO_CENTRO.includes(to)) this.voltarAoCentro();
  },

  andarDevagar(ligado) {
    if (this.devagar === ligado) return;
    this.devagar = ligado;
    this.aplicarVelocidade();
  },

  aplicarVelocidade() {
    const { aceleracaoAndar, aceleracaoVestiario, aceleracaoDevagar } = CONFIG.computador;
    const normal = this.noVestiario ? aceleracaoVestiario : aceleracaoAndar;
    this.cameraEl.setAttribute('wasd-controls', 'acceleration', this.devagar ? aceleracaoDevagar : normal);
  },

  tick() {
    const d = deslocamentoDoRig(this.cameraEl.object3D.position, this.escala);
    this.el.object3D.position.set(d.x, 0, d.z);
  },

  voltarAoCentro() {
    if (this.cena.is('vr-mode')) return;
    const camera = this.cameraEl.object3D;
    camera.position.x = 0;
    camera.position.z = 0;
    this.cameraEl.components['wasd-controls']?.velocity.set(0, 0, 0);
    const olhar = this.cameraEl.components['look-controls'];
    if (olhar) {
      olhar.yawObject.rotation.y = 0;
      olhar.pitchObject.rotation.x = 0;
    }
    camera.rotation.set(0, 0, 0);
  },

  recolocarBola() {
    document.querySelector('#bola')?.components?.ball?.recolocar();
  },
});
