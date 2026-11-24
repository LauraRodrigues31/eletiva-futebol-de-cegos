// Zonas de gol e de trave. Lógica pura.
//
//          trave esq.                          trave dir.
//   fora   |<-0,3 m->|        gol (2,7 m)        |<-0,3 m->|   fora
// ---------+---------+---------------------------+---------+---------  linha do gol
//        -1,65     -1,35                        1,35      1,65    (x, valores padrão)
import { posicaoGol, limitesArea } from './area.js';

/** Limites em x (a partir do centro do gol) usados para classificar o cruzamento. */
export function limitesDoGol(config) {
  const meia = config.gol.largura / 2;
  const folga = config.gol.raioTrave + config.bola.raio;
  return { limiteGol: meia - folga, limiteTrave: meia + folga };
}

/**
 * Classifica onde a bola cruzou a linha do gol.
 * `x` é a posição da bola no cruzamento, relativa ao centro do gol.
 * Devolve 'gol', 'trave-esquerda', 'trave-direita' ou 'fora'.
 * Esquerda/direita do ponto de vista de quem chuta (olhando para -z): esquerda = x negativo.
 */
export function classificarCruzamento(x, config) {
  const { limiteGol, limiteTrave } = limitesDoGol(config);
  const distancia = Math.abs(x);
  if (distancia <= limiteGol) return 'gol';
  if (distancia <= limiteTrave) return x < 0 ? 'trave-esquerda' : 'trave-direita';
  return 'fora';
}

/**
 * Se a bola cruzou a linha z = zLinha indo em direção ao gol (z diminuindo)
 * entre `anterior` e `atual`, devolve o x do cruzamento (interpolado). Senão, null.
 */
export function cruzamentoDaLinha(anterior, atual, zLinha) {
  if (!(anterior.z >= zLinha && atual.z < zLinha)) return null;
  const t = (anterior.z - zLinha) / (anterior.z - atual.z);
  return anterior.x + (atual.x - anterior.x) * t;
}

/** Velocidade depois de bater na trave: inverte z e perde parte da velocidade. */
export function rebaterNaTrave(vel, config) {
  const e = config.fisica.restituicaoTrave;
  return { x: vel.x * e, z: -vel.z * e };
}

/**
 * Limites do campo para a bola, em coordenadas do mundo.
 * Atrás do gol, a bola vai até o fundo da rede; para os lados, até a lateral;
 * para trás do jogador, até o fim do campo.
 */
export function limitesDoCampo(config) {
  const zGol = posicaoGol(config).z;
  const meiaLargura = config.campo.largura / 2;
  return {
    minX: -meiaLargura,
    maxX: meiaLargura,
    minZ: zGol - config.gol.profundidadeRede,
    maxZ: Math.max(zGol + config.campo.comprimento, limitesArea(config).maxZ),
  };
}

/** Diz se a posição está fora dos limites do campo. */
export function foraDoCampo(pos, config) {
  const { minX, maxX, minZ, maxZ } = limitesDoCampo(config);
  return pos.x < minX || pos.x > maxX || pos.z < minZ || pos.z > maxZ;
}
