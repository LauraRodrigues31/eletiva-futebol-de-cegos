import { EVENTS } from '../events.js';
import { DEBUG } from '../debug.js';
import { ESTADOS } from '../logic/state-machine.js';
import { Animador } from '../logic/animador.js';

const TEXTO = 'Entrada em campo\n(cena em construção)\n\nVisão liberada para teste.';
const DICA_DEBUG = '\n\nDebug: tecla N ou botão B avança.';
const TEMPO_NA_TELA = 1200;
const DURACAO_FADE = 400;

AFRAME.registerComponent('entrada-campo', {
  init() {
    this.cena = this.el.sceneEl;
    this.animador = new Animador();

    this.painel = document.createElement('a-entity');
    this.painel.setAttribute('position', '0 0 -1.4');
    this.painel.setAttribute('painel-texto', {
      texto: TEXTO + (DEBUG ? DICA_DEBUG : ''),
      largura: 1.1,
      altura: 0.6,
      tamanhoFonte: 52,
      cor: '#f2f2f2',
      fundo: '#000000',
      opacidadeFundo: 0.6,
      opacidade: 0,
      sobreTudo: true,
      ordem: 1003,
    });
    document.querySelector('#camera').appendChild(this.painel);

    this.aoMudarEstado = (e) => {
      if (e.detail.to === ESTADOS.ENTRADA_CAMPO) this.mostrarPorUmTempo();
      else this.fadePara(0, DURACAO_FADE);
    };
    this.cena.addEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);
  },

  async mostrarPorUmTempo() {
    if (!(await this.fadePara(1, DURACAO_FADE))) return;
    if (!(await this.animador.esperar(TEMPO_NA_TELA))) return;
    this.cena.emit(EVENTS.FIELD_ENTERED);
  },

  fadePara(alvo, duracao) {
    const painel = this.painel.components['painel-texto'];
    const atual = painel ? painel.data.opacidade : 0;
    this.animador.parar();
    return this.animador.animar({
      duracao,
      de: atual,
      para: alvo,
      easing: 'saida',
      aoAtualizar: (v) => this.painel.setAttribute('painel-texto', 'opacidade', v),
    });
  },

  tick(tempo) {
    this.animador.atualizar(tempo);
  },

  remove() {
    this.cena.removeEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);
    this.painel.remove();
  },
});
