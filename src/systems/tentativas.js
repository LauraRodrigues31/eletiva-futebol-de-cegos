import { CONFIG } from '../config.js';
import { EVENTS } from '../events.js';
import { DEBUG } from '../debug.js';
import { ESTADOS, ehFaseJogavel } from '../logic/state-machine.js';
import { Animador } from '../logic/animador.js';
import {
  EVENTOS_DO_REGISTRO,
  totalDeTentativas,
  proximoPasso,
  novoRegistro,
  anotarEvento,
  fecharRegistro,
  detalheAttemptEnd,
  detalhePhaseEnd,
  placarDaFase,
} from '../logic/tentativas.js';

AFRAME.registerSystem('tentativas', {
  init() {
    this.cena = this.el;
    this.animador = new Animador();
    this.ciclo = 'inativo';
    this.fase = null;
    this.aberto = null;
    this.registro = [];
    this.agora = 0;
    this.inicioPausa = 0;

    this.ouvintes = [
      [EVENTS.STATE_CHANGE, (e) => this.aoMudarEstado(e.detail)],
      [EVENTS.BALL_SPAWNED, (e) => this.aoSpawn(e.detail)],
      [EVENTS.BALL_STOPPED, (e) => this.aoParar(e.detail)],
      ...EVENTOS_DO_REGISTRO.map((evento) => [evento, (e) => this.anotar(evento, e.detail)]),
    ];
    for (const [evento, f] of this.ouvintes) this.cena.addEventListener(evento, f);
  },

  remove() {
    for (const [evento, f] of this.ouvintes) this.cena.removeEventListener(evento, f);
    this.animador.parar();
  },

  tick(t) {
    this.agora = t;
    this.animador.atualizar(t);
  },

  jogo() {
    return this.cena.systems['game-state'];
  },

  registros() {
    return this.registro.map((r) => ({ ...r }));
  },

  total() {
    return totalDeTentativas(this.fase, CONFIG);
  },

  restantePausaMs() {
    if (this.ciclo !== 'pausa') return 0;
    return Math.max(0, CONFIG.tentativas.pausaMs - (this.agora - this.inicioPausa));
  },

  placar() {
    return placarDaFase(this.fase, this.registro);
  },

  aoMudarEstado({ to }) {
    this.animador.parar();
    this.aberto = null;
    if (to === ESTADOS.VESTIARIO) this.registro = [];
    if (ehFaseJogavel(to)) {
      this.fase = to;
      this.ciclo = 'jogando';
    } else {
      this.fase = null;
      this.ciclo = 'inativo';
    }
  },

  aoSpawn(detail) {
    if (this.ciclo === 'inativo') return;
    if (this.ciclo === 'pausa') {
      const fase = this.fase;
      this.animador.parar();
      this.fimDaPausa(false);
      if (this.ciclo !== 'jogando' || this.fase !== fase) return;
    }
    this.aberto = novoRegistro(this.fase, this.jogo().tentativaAtual(), performance.now(), detail.position);
  },

  anotar(evento, detail) {
    if (this.ciclo !== 'jogando' || !this.aberto) return;
    this.aberto = anotarEvento(this.aberto, evento, detail, performance.now());
  },

  aoParar(detail) {
    if (this.ciclo !== 'jogando' || !this.aberto) return;
    const agora = performance.now();
    const fechado = fecharRegistro(anotarEvento(this.aberto, EVENTS.BALL_STOPPED, detail, agora), agora);
    this.aberto = null;
    this.registro.push(fechado);

    this.ciclo = 'pausa';
    this.inicioPausa = this.agora;
    queueMicrotask(() => this.encerrarTentativa(fechado));
  },

  encerrarTentativa(fechado) {
    if (this.ciclo !== 'pausa' || this.registro.at(-1) !== fechado) return;
    const fim = detalheAttemptEnd(fechado, CONFIG);
    if (DEBUG) {
      const motivo = fim.reason ? ` (${fim.reason})` : '';
      console.log(`[tentativa] ${fim.phase} ${fim.attempt}/${fim.total}: ${fim.result}${motivo}`);
    }
    this.cena.emit(EVENTS.ATTEMPT_END, fim);
    this.esperarPausa();
  },

  async esperarPausa() {
    if (!(await this.animador.esperar(CONFIG.tentativas.pausaMs))) return;
    this.fimDaPausa(true);
  },

  fimDaPausa(recolocar) {
    if (this.ciclo !== 'pausa') return;
    const fase = this.fase;
    if (proximoPasso(fase, this.jogo().tentativaAtual(), CONFIG) === 'proxima') {
      this.jogo().avancarTentativa();
      this.ciclo = 'jogando';
      if (recolocar) document.querySelector('#bola')?.components?.ball?.recolocar();
      return;
    }
    this.ciclo = 'inativo';
    const fim = detalhePhaseEnd(fase, this.registro);
    if (DEBUG) {
      console.log(`[tentativa] fim da fase ${fase}`);
      console.table(this.registro.filter((r) => r.phase === fase));
    }
    this.cena.emit(EVENTS.PHASE_END, fim);
  },
});
