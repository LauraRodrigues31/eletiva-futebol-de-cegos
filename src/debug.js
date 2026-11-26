import { CONFIG } from './config.js';
import { TODOS_EVENTOS } from './events.js';

export const VERSAO = '0.2.0';

const params = new URLSearchParams(window.location.search);

export const DEBUG = CONFIG.debug || params.get('debug') === '1';

export const ESTADO_DA_URL = DEBUG ? params.get('estado') : null;

export function registrarLogDeEventos(sceneEl) {
  for (const nome of TODOS_EVENTOS) {
    sceneEl.addEventListener(nome, (e) => console.log(`[evento] ${nome}`, e.detail ?? {}));
  }
}
