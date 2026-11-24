// Física simples da bola: rola no chão com atrito constante. Lógica pura.

/**
 * Um passo da física.
 * - pos: { x, z } posição no chão
 * - vel: { x, z } velocidade (m/s)
 * - dt: segundos desde o último passo (limitado a fisica.dtMaximo)
 * Devolve { pos, vel, parou } (novos objetos; não altera os de entrada).
 *
 * A desaceleração é constante (atrito de rolagem): a velocidade cai
 * `desaceleracao × dt` por passo, na direção contrária ao movimento,
 * sem nunca inverter o sentido.
 */
export function passoFisica(pos, vel, dt, config) {
  const { desaceleracao, velocidadeParada, dtMaximo } = config.fisica;
  const passo = Math.min(Math.max(dt, 0), dtMaximo);
  const velocidade = Math.hypot(vel.x, vel.z);

  if (velocidade <= velocidadeParada) {
    return { pos: { ...pos }, vel: { x: 0, z: 0 }, parou: true };
  }

  const novaVelocidade = Math.max(velocidade - desaceleracao * passo, 0);
  // Posição pela velocidade média do passo (mais preciso que usar só a inicial).
  const media = (velocidade + novaVelocidade) / 2;
  const dirX = vel.x / velocidade;
  const dirZ = vel.z / velocidade;

  const novaPos = { x: pos.x + dirX * media * passo, z: pos.z + dirZ * media * passo };
  if (novaVelocidade <= velocidadeParada) {
    return { pos: novaPos, vel: { x: 0, z: 0 }, parou: true };
  }
  return {
    pos: novaPos,
    vel: { x: dirX * novaVelocidade, z: dirZ * novaVelocidade },
    parou: false,
  };
}

/** Distância até parar, partindo de `velocidade` (m/s): v² / (2a). */
export function distanciaDeParada(velocidade, config) {
  return (velocidade * velocidade) / (2 * config.fisica.desaceleracao);
}
