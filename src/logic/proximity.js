export function distanciaNoChao(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

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
