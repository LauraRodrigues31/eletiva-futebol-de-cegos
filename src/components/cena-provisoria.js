import { EVENTS } from '../events.js';
import { DEBUG } from '../debug.js';
import { ESTADOS } from '../logic/state-machine.js';
import { Animador } from '../logic/animador.js';

const TEXTO =
  'Você está vendado.\n\n' +
  'Próxima etapa: entrada em campo.\n' +
  '(cena em construção)';
const DICA_DEBUG = '\n\nDebug: tecla N ou botão B avança.';

AFRAME.registerComponent('cena-provisoria', {
  init() {
    this.cena = this.el.sceneEl;
    this.animador = new Animador();

    this.painel = document.createElement('a-entity');
    this.painel.setAttribute('position', '0 0 -1.4');
    this.painel.setAttribute('painel-texto', {
      texto: TEXTO + (DEBUG ? DICA_DEBUG : ''),
      largura: 1.1,
      altura: 0.6,
      tamanhoFonte: 56,
      cor: '#f2f2f2',
      fundo: 'nenhum',
      opacidade: 0,
      sobreTudo: true,
      ordem: 1003,
    });
    document.querySelector('#camera').appendChild(this.painel);

    this.aoMudarEstado = (e) => {
      if (e.detail.to === ESTADOS.ENTRADA_CAMPO) this.fadePara(1, 1200);
      else this.fadePara(0, 200);
    };
    this.cena.addEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);
  },

  fadePara(alvo, duracao) {
    const painel = this.painel.components['painel-texto'];
    const atual = painel ? painel.data.opacidade : 0;
    this.animador.parar();
    this.animador.animar({
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
