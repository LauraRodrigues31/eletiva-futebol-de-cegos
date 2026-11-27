import { EVENTS } from '../events.js';
import { ehFaseJogavel } from './state-machine.js';

const arredondar = (n) => Math.round(n * 1000) / 1000;

function arredondarPonto(p) {
  if (!p) return null;
  const r = {};
  for (const [chave, valor] of Object.entries(p)) r[chave] = typeof valor === 'number' ? arredondar(valor) : valor;
  return r;
}

export function totalDeTentativas(fase, config) {
  if (!ehFaseJogavel(fase)) return 0;
  return config.tentativas[fase] ?? 0;
}

export function ehUltima(fase, tentativa, config) {
  return tentativa >= totalDeTentativas(fase, config);
}

export function proximoPasso(fase, tentativa, config) {
  return ehUltima(fase, tentativa, config) ? 'fim-da-fase' : 'proxima';
}

export function resultadoDoEvento(evento, detail) {
  if (evento === EVENTS.GOAL) return { result: 'goal', reason: null };
  if (evento === EVENTS.MISS) return { result: 'miss', reason: detail?.reason ?? null };
  return null;
}

export function novoRegistro(fase, tentativa, agora, posicaoBola) {
  return {
    phase: fase,
    attempt: tentativa,
    result: null,
    reason: null,
    postHit: null,
    ballStart: arredondarPonto(posicaoBola),
    ballEnd: null,
    goalPosition: null,
    timeToBallMs: null,
    reachedCount: 0,
    kickReadyCount: 0,
    kick: null,
    durationMs: null,
    startedAt: agora,
  };
}

export function anotarEvento(registro, evento, detail, agora) {
  const r = { ...registro };
  switch (evento) {
    case EVENTS.BALL_REACHED:
      r.reachedCount += 1;
      if (r.timeToBallMs === null) r.timeToBallMs = detail?.timeMs ?? Math.round(agora - r.startedAt);
      break;
    case EVENTS.KICK_READY:
      r.kickReadyCount += 1;
      break;
    case EVENTS.KICK:
      r.kick = {
        hand: detail.hand,
        direction: arredondarPonto(detail.direction),
        target: arredondarPonto(detail.target),
        velocity: arredondarPonto(detail.velocity),
        position: arredondarPonto(detail.position),
        atMs: Math.round(agora - r.startedAt),
      };
      break;
    case EVENTS.POST_HIT:
      r.postHit = detail.side;
      break;
    case EVENTS.GOAL:
      Object.assign(r, resultadoDoEvento(evento, detail));
      r.goalPosition = arredondarPonto(detail.position);
      break;
    case EVENTS.MISS:
      Object.assign(r, resultadoDoEvento(evento, detail));
      break;
    case EVENTS.BALL_STOPPED:
      r.ballEnd = arredondarPonto(detail.position);
      break;
    default:
      return registro;
  }
  return r;
}

export const EVENTOS_DO_REGISTRO = Object.freeze([
  EVENTS.BALL_REACHED,
  EVENTS.KICK_READY,
  EVENTS.KICK,
  EVENTS.POST_HIT,
  EVENTS.GOAL,
  EVENTS.MISS,
]);

export function fecharRegistro(registro, agora) {
  return { ...registro, durationMs: Math.round(agora - registro.startedAt) };
}

export function detalheAttemptEnd(registro, config) {
  return {
    phase: registro.phase,
    attempt: registro.attempt,
    total: totalDeTentativas(registro.phase, config),
    result: registro.result,
    reason: registro.reason,
  };
}

export function detalhePhaseEnd(fase, registros) {
  return {
    phase: fase,
    attempts: registros
      .filter((r) => r.phase === fase)
      .map(({ attempt, result, reason }) => ({ attempt, result, reason })),
  };
}

export function placarDaFase(fase, registros) {
  const daFase = registros.filter((r) => r.phase === fase);
  return { gols: daFase.filter((r) => r.result === 'goal').length, tentativas: daFase.length };
}
