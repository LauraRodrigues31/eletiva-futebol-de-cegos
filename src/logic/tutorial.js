import { EVENTS } from '../events.js';

export const DICAS_TUTORIAL = Object.freeze({
  andar: 'Esta é a bola. Ande até ela.\n(No computador: W A S D.)',
  preparar: 'Você está na bola. Aperte o grip para preparar.\n(No computador: tecla E.)',
  mirar: 'Aponte o controle para o gol e aperte o gatilho.\n(No computador: mire com o mouse e clique.)',
});

const ETAPA_POR_EVENTO = Object.freeze({
  [EVENTS.BALL_SPAWNED]: 'andar',
  [EVENTS.BALL_LEFT]: 'andar',
  [EVENTS.BALL_REACHED]: 'preparar',
  [EVENTS.KICK_READY]: 'mirar',
  [EVENTS.KICK]: 'esconder',
});

export const EVENTOS_DAS_DICAS = Object.freeze(Object.keys(ETAPA_POR_EVENTO));

export function etapaDaDica(evento) {
  return ETAPA_POR_EVENTO[evento] ?? null;
}

export function textoDica(etapa) {
  return DICAS_TUTORIAL[etapa] ?? '';
}
