import { EVENTS } from '../events.js';
import { DEBUG, ESTADO_DA_URL, registrarLogDeEventos } from '../debug.js';
import {
  estadoInicial,
  estadoValido,
  entrarEm,
  transicionar,
  podeIr,
  destinoPorEvento,
  proximoNaSequencia,
  detalheStateChange,
  GATILHOS,
} from '../logic/state-machine.js';

AFRAME.registerSystem('game-state', {
  init() {
    this.dados = estadoInicial();
    this.inicioEstado = performance.now();

    if (DEBUG) registrarLogDeEventos(this.el);

    for (const evento of Object.keys(GATILHOS)) {
      this.el.addEventListener(evento, () => this.aoEvento(evento));
    }

    const iniciar = () => {
      const inicial = ESTADO_DA_URL && estadoValido(ESTADO_DA_URL) ? ESTADO_DA_URL : this.dados.estado;
      if (ESTADO_DA_URL && !estadoValido(ESTADO_DA_URL)) {
        console.warn(`[game-state] estado da URL inválido: "${ESTADO_DA_URL}"`);
      }
      this.aplicar(entrarEm(inicial), null);
    };
    if (this.el.hasLoaded) iniciar();
    else this.el.addEventListener('loaded', iniciar, { once: true });
  },

  estadoAtual() {
    return this.dados.estado;
  },

  tentativaAtual() {
    return this.dados.tentativa;
  },

  tempoNoEstado() {
    return performance.now() - this.inicioEstado;
  },

  podeIr(proximo) {
    return podeIr(this.dados.estado, proximo);
  },

  ir(proximo) {
    const r = transicionar(this.dados, proximo);
    if (!r.ok) {
      console.warn(`[game-state] transição inválida ignorada: ${this.dados.estado} → ${proximo}`);
      return false;
    }
    this.aplicar(r.dados, this.dados.estado);
    return true;
  },

  avancarDebug() {
    const proximo = proximoNaSequencia(this.dados.estado);
    if (proximo) this.ir(proximo);
  },

  aoEvento(evento) {
    const destino = destinoPorEvento(this.dados.estado, evento);
    if (destino) this.ir(destino);
  },

  aplicar(novosDados, from) {
    this.dados = novosDados;
    this.inicioEstado = performance.now();
    this.el.emit(EVENTS.STATE_CHANGE, detalheStateChange(from, novosDados));
  },
});
