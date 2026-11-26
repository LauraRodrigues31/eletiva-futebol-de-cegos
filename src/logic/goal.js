import { posicaoGol, limitesAreaVirtual } from './area.js';

export function limitesDoGol(config) {
  const meia = config.gol.largura / 2;
  const folga = config.gol.raioTrave + config.bola.raio;
  return { limiteGol: meia - folga, limiteTrave: meia + folga };
}

export function classificarCruzamento(x, config) {
  const { limiteGol, limiteTrave } = limitesDoGol(config);
  const distancia = Math.abs(x);
  if (distancia <= limiteGol) return 'gol';
  if (distancia <= limiteTrave) return x < 0 ? 'trave-esquerda' : 'trave-direita';
  return 'fora';
}

export function cruzamentoDaLinha(anterior, atual, zLinha) {
  if (!(anterior.z >= zLinha && atual.z < zLinha)) return null;
  const t = (anterior.z - zLinha) / (anterior.z - atual.z);
  return anterior.x + (atual.x - anterior.x) * t;
}

export function classificarNoGol({ x, y }, config) {
  const lateral = classificarCruzamento(x, config);
  if (lateral === 'fora') return 'fora';
  const folga = config.gol.raioTrave + config.bola.raio;
  const travessao = config.gol.altura;
  if (y > travessao + folga) return 'alto';
  if (y >= travessao - folga) return 'travessao';
  return lateral;
}

export function pontoDeCruzamento(anterior, atual, zLinha) {
  if (!(anterior.z >= zLinha && atual.z < zLinha)) return null;
  const t = (anterior.z - zLinha) / (anterior.z - atual.z);
  const y0 = anterior.y ?? 0;
  const y1 = atual.y ?? 0;
  return { x: anterior.x + (atual.x - anterior.x) * t, y: y0 + (y1 - y0) * t };
}

export function rebaterNaTrave(vel, config) {
  const e = config.fisica.restituicaoTrave;
  const r = { x: vel.x * e, z: -vel.z * e };
  if (vel.y !== undefined) r.y = vel.y * e;
  return r;
}

export function rebaterNoTravessao(vel, config) {
  const e = config.fisica.restituicaoTrave;
  return { x: vel.x * e, y: -(vel.y ?? 0) * e, z: -vel.z * e };
}

export function limitesDoCampo(config) {
  const zGol = posicaoGol(config).z;
  const meiaLargura = config.campo.largura / 2;
  return {
    minX: -meiaLargura,
    maxX: meiaLargura,
    minZ: zGol - config.gol.profundidadeRede,
    maxZ: Math.max(zGol + config.campo.comprimento, limitesAreaVirtual(config).maxZ),
  };
}

export function foraDoCampo(pos, config) {
  const { minX, maxX, minZ, maxZ } = limitesDoCampo(config);
  return pos.x < minX || pos.x > maxX || pos.z < minZ || pos.z > maxZ;
}
