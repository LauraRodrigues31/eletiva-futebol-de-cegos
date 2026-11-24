// Chute: direção no chão e regra de quando o chute vale. Lógica pura.
import { ehFaseJogavel } from './state-machine.js';

/**
 * Projeta um vetor 3D no chão (zera y) e normaliza.
 * Se o que sobra no chão for menor que `minimo` (vetor quase vertical),
 * usa `reserva` (outra direção 3D, ex.: a frente da cabeça).
 * Devolve { x, y: 0, z } com comprimento 1.
 */
export function direcaoHorizontal(frente, minimo, reserva = null) {
  const comprimento = Math.hypot(frente.x, frente.z);
  if (comprimento < minimo) {
    if (reserva) return direcaoHorizontal(reserva, 0, null);
    return { x: 0, y: 0, z: -1 }; // última opção: reto para o gol
  }
  if (comprimento === 0) return { x: 0, y: 0, z: -1 };
  return { x: frente.x / comprimento, y: 0, z: frente.z / comprimento };
}

/**
 * Diz se o chute vale agora. Devolve { ok: true } ou { ok: false, motivo }.
 * - estadoJogo: estado da máquina de estados ('tutorial', 'fase2'...)
 * - estadoBola: 'esperando' | 'rolando' | 'decidida' | 'parada'
 * - proximidade: 'perto' | 'longe'
 */
export function podeChutar(estadoJogo, estadoBola, proximidade) {
  if (!ehFaseJogavel(estadoJogo)) return { ok: false, motivo: 'fora de uma fase jogável' };
  if (estadoBola !== 'esperando') return { ok: false, motivo: `bola ${estadoBola}` };
  if (proximidade !== 'perto') return { ok: false, motivo: 'bola longe' };
  return { ok: true };
}

/** Diz se o gatilho desta mão vale, conforme chute.maos ('direita' | 'esquerda' | 'ambas'). */
export function maoPermitida(mao, maos) {
  if (maos === 'ambas') return true;
  return (maos === 'direita' && mao === 'right') || (maos === 'esquerda' && mao === 'left');
}
