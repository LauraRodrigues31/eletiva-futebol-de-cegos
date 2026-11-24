// Modo debug (spec, seção 12): ligado com ?debug=1 na URL ou CONFIG.debug.
import { CONFIG } from './config.js';
import { TODOS_EVENTOS } from './events.js';

/** Versão do jogo, mostrada no painel de debug. Aumente a cada entrega na main. */
export const VERSAO = '0.1.0';

const params = new URLSearchParams(window.location.search);

export const DEBUG = CONFIG.debug || params.get('debug') === '1';

/** Estado pedido na URL (?estado=fase2). Só vale com o debug ligado. */
export const ESTADO_DA_URL = DEBUG ? params.get('estado') : null;

/** Mostra no console todos os eventos do contrato emitidos na cena. */
export function registrarLogDeEventos(sceneEl) {
  for (const nome of TODOS_EVENTOS) {
    sceneEl.addEventListener(nome, (e) => console.log(`[evento] ${nome}`, e.detail ?? {}));
  }
}
