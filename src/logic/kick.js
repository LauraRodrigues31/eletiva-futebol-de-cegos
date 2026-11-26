import { ehFaseJogavel } from './state-machine.js';

export function direcaoHorizontal(frente, minimo, reserva = null) {
  const comprimento = Math.hypot(frente.x, frente.z);
  if (comprimento < minimo) {
    if (reserva) return direcaoHorizontal(reserva, 0, null);
    return { x: 0, y: 0, z: -1 };
  }
  if (comprimento === 0) return { x: 0, y: 0, z: -1 };
  return { x: frente.x / comprimento, y: 0, z: frente.z / comprimento };
}

export function podePreparar(estadoJogo, estadoBola, proximidade) {
  if (!ehFaseJogavel(estadoJogo)) return { ok: false, motivo: 'fora de uma fase jogável' };
  if (estadoBola !== 'esperando') return { ok: false, motivo: `bola ${estadoBola}` };
  if (proximidade !== 'perto') return { ok: false, motivo: 'bola longe' };
  return { ok: true };
}

export function podeChutar(estadoJogo, estadoBola, proximidade, preparado) {
  const r = podePreparar(estadoJogo, estadoBola, proximidade);
  if (!r.ok) return r;
  if (!preparado) return { ok: false, motivo: 'chute não preparado' };
  return { ok: true };
}

export function maoPermitida(mao, maos) {
  if (maos === 'ambas') return true;
  return (maos === 'direita' && mao === 'right') || (maos === 'esquerda' && mao === 'left');
}
