import { EVENTS } from '../events.js';
import { ESTADOS } from '../logic/state-machine.js';
import { EVENTOS_DAS_DICAS, etapaDaDica, textoDica } from '../logic/tutorial.js';

AFRAME.registerComponent('dicas-tutorial', {
  init() {
    this.cena = this.el.sceneEl;
    this.ouvintes = EVENTOS_DAS_DICAS.map((evento) => {
      const f = () => this.aoEvento(evento);
      this.cena.addEventListener(evento, f);
      return [evento, f];
    });
    this.aoMudarEstado = (e) => {
      if (e.detail.to === ESTADOS.TUTORIAL) this.instrucoes()?.mostrar(textoDica('andar'));
      else if (e.detail.from === ESTADOS.TUTORIAL) this.instrucoes()?.esconder();
    };
    this.cena.addEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);
  },

  remove() {
    for (const [evento, f] of this.ouvintes) this.cena.removeEventListener(evento, f);
    this.cena.removeEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);
  },

  instrucoes() {
    return this.el.components.instrucoes;
  },

  noTutorial() {
    return this.cena.systems['game-state']?.estadoAtual() === ESTADOS.TUTORIAL;
  },

  aoEvento(evento) {
    if (!this.noTutorial()) return;
    const etapa = etapaDaDica(evento);
    if (etapa === 'esconder') this.instrucoes()?.esconder();
    else if (etapa) this.instrucoes()?.mostrar(textoDica(etapa));
  },
});
