export const EVENTS = Object.freeze({
  STATE_CHANGE: 'state-change',

  BLINDFOLD_ON: 'blindfold-on',
  FIELD_ENTERED: 'field-entered',
  CONTINUE: 'continue',

  AREA_EXIT: 'area-exit',
  AREA_ENTER: 'area-enter',

  BALL_SPAWNED: 'ball-spawned',
  BALL_REACHED: 'ball-reached',
  BALL_LEFT: 'ball-left',
  BALL_STOPPED: 'ball-stopped',

  KICK_READY: 'kick-ready',
  KICK_CANCEL: 'kick-cancel',
  KICK: 'kick',
  GOAL: 'goal',
  POST_HIT: 'post-hit',
  MISS: 'miss',

  ATTEMPT_END: 'attempt-end',
  PHASE_END: 'phase-end',
});

export const TODOS_EVENTOS = Object.freeze(Object.values(EVENTS));
