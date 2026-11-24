// Proximidade entre a cabeça e a bola. Lógica pura.

/** Distância no plano do chão (x, z), ignorando a altura. */
export function distanciaNoChao(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

/**
 * Atualiza o estado 'longe'/'perto' com histerese:
 * - longe → perto quando a distância fica abaixo de raioAlcance (evento 'reached');
 * - perto → longe quando passa de raioSaida (evento 'left');
 * - entre os dois raios, mantém o estado.
 * Devolve { estado, evento }, com evento 'reached', 'left' ou null.
 */
export function atualizarProximidade(estadoAtual, distancia, config) {
  const { raioAlcance, raioSaida } = config.bola;
  if (estadoAtual === 'longe' && distancia < raioAlcance) {
    return { estado: 'perto', evento: 'reached' };
  }
  if (estadoAtual === 'perto' && distancia > raioSaida) {
    return { estado: 'longe', evento: 'left' };
  }
  return { estado: estadoAtual, evento: null };
}
