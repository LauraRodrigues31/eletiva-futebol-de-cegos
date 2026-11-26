export function passoFisica(pos, vel, dt, config) {
  const { desaceleracao, velocidadeParada, dtMaximo } = config.fisica;
  const passo = Math.min(Math.max(dt, 0), dtMaximo);
  const velocidade = Math.hypot(vel.x, vel.z);

  if (velocidade <= velocidadeParada) {
    return { pos: { ...pos }, vel: { x: 0, z: 0 }, parou: true };
  }

  const novaVelocidade = Math.max(velocidade - desaceleracao * passo, 0);
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

export function noAr(pos, vel, config) {
  return pos.y > config.bola.raio + 1e-6 || vel.y > 1e-6;
}

export function passoBola(pos, vel, dt, config) {
  const { raio } = config.bola;
  const { gravidade, restituicaoChao, retencaoQuique, quiqueMinimo, dtMaximo } = config.fisica;
  const p = { x: pos.x, y: pos.y ?? raio, z: pos.z };
  const v = { x: vel.x, y: vel.y ?? 0, z: vel.z };

  if (!noAr(p, v, config)) {
    const r = passoFisica(p, v, dt, config);
    return {
      pos: { x: r.pos.x, y: raio, z: r.pos.z },
      vel: { x: r.vel.x, y: 0, z: r.vel.z },
      parou: r.parou,
      quicou: false,
    };
  }

  const passo = Math.min(Math.max(dt, 0), dtMaximo);
  const vy = v.y - gravidade * passo;
  const novaPos = {
    x: p.x + v.x * passo,
    y: p.y + ((v.y + vy) / 2) * passo,
    z: p.z + v.z * passo,
  };
  if (novaPos.y > raio) {
    return { pos: novaPos, vel: { x: v.x, y: vy, z: v.z }, parou: false, quicou: false };
  }

  const subida = -vy * restituicaoChao;
  const vx = v.x * retencaoQuique;
  const vz = v.z * retencaoQuique;
  return {
    pos: { ...novaPos, y: raio },
    vel: { x: vx, y: subida >= quiqueMinimo ? subida : 0, z: vz },
    parou: false,
    quicou: true,
  };
}

export function distanciaDeParada(velocidade, config) {
  return (velocidade * velocidade) / (2 * config.fisica.desaceleracao);
}

export function limiteDasBandas(config) {
  return config.campo.largura / 2 - config.bola.raio;
}

export function rebaterNasBandas(pos, vel, config) {
  const limite = limiteDasBandas(config);
  const excesso = Math.abs(pos.x) - limite;
  if (excesso <= 0) return { pos: { ...pos }, vel: { ...vel }, bateu: false };

  const lado = Math.sign(pos.x);
  const e = config.fisica.restituicaoBanda;
  const x = lado * Math.max(limite - excesso * e, -limite);
  const velX = Math.abs(vel.x) * e * -lado;
  return { pos: { ...pos, x }, vel: { ...vel, x: velX }, bateu: true };
}
