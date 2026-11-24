// Contrato de eventos entre componentes (spec, seção 7; detalhes em docs/EVENTOS.md).
// Todo evento é emitido NA CENA: sceneEl.emit(EVENTS.X, detalhe).
// Use sempre estas constantes, nunca o texto solto, para evitar erro de digitação.

export const EVENTS = Object.freeze({
  // Máquina de estados (Laura)
  STATE_CHANGE: 'state-change', // { from, to, phase, attempt }

  // Gatilhos vindos da Anna
  BLINDFOLD_ON: 'blindfold-on', // {}
  FIELD_ENTERED: 'field-entered', // {}
  CONTINUE: 'continue', // {}

  // Área de jogo (Laura)
  AREA_EXIT: 'area-exit', // { position }
  AREA_ENTER: 'area-enter', // { position }

  // Bola (Laura)
  BALL_SPAWNED: 'ball-spawned', // { position }
  BALL_REACHED: 'ball-reached', // { distance, timeMs }
  BALL_LEFT: 'ball-left', // { distance }

  // Chute e gol (Laura, quarta 25/11)
  KICK: 'kick', // { direction, power, position }
  GOAL: 'goal', // { position }
  POST_HIT: 'post-hit', // { side: 'left' | 'right' }
  MISS: 'miss', // {}

  // Tentativas e fases (Laura, quinta 26/11)
  ATTEMPT_END: 'attempt-end', // { phase, attempt, result }
  PHASE_END: 'phase-end', // { phase }
});

/** Lista com o nome de todos os eventos (usada pelo log do modo debug). */
export const TODOS_EVENTOS = Object.freeze(Object.values(EVENTS));
