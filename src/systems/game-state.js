// System da máquina de estados.
// Acesso: sceneEl.systems['game-state'].estadoAtual()
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
  GATILHOS,
} from '../logic/state-machine.js';

AFRAME.registerSystem('game-state', {
  init() {
    this.dados = estadoInicial();
    this.inicioEstado = performance.now();

    if (DEBUG) registrarLogDeEventos(this.el);

    // Eventos externos que provocam transição (blindfold-on, field-entered, continue).
    for (const evento of Object.keys(GATILHOS)) {
      this.el.addEventListener(evento, () => this.aoEvento(evento));
    }

    // A primeira emissão acontece quando a cena termina de carregar,
    // para todos os componentes já estarem ouvindo.
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

  /** Estado atual ('vestiario', 'tutorial', ...). */
  estadoAtual() {
    return this.dados.estado;
  },

  /** Tentativa atual (1, 2, 3 nas fases jogáveis; 0 nos outros estados). */
  tentativaAtual() {
    return this.dados.tentativa;
  },

  /** Milissegundos desde que entrou no estado atual. */
  tempoNoEstado() {
    return performance.now() - this.inicioEstado;
  },

  podeIr(proximo) {
    return podeIr(this.dados.estado, proximo);
  },

  /** Vai para `proximo` se a transição for válida. Devolve true se mudou. */
  ir(proximo) {
    const r = transicionar(this.dados, proximo);
    if (!r.ok) {
      console.warn(`[game-state] transição inválida ignorada: ${this.dados.estado} → ${proximo}`);
      return false;
    }
    this.aplicar(r.dados, this.dados.estado);
    return true;
  },

  /** Modo debug: avança para o próximo estado da sequência. */
  avancarDebug() {
    const proximo = proximoNaSequencia(this.dados.estado);
    if (proximo) this.ir(proximo);
  },

  aoEvento(evento) {
    const destino = destinoPorEvento(this.dados.estado, evento);
    if (destino) this.ir(destino);
    // Evento no estado errado: ignorado de propósito.
  },

  aplicar(novosDados, from) {
    this.dados = novosDados;
    this.inicioEstado = performance.now();
    this.el.emit(EVENTS.STATE_CHANGE, {
      from,
      to: novosDados.estado,
      phase: novosDados.estado,
      attempt: novosDados.tentativa,
    });
  },
});
