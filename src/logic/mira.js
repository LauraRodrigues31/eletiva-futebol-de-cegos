import { posicaoGol } from './area.js';
import { direcaoHorizontal } from './kick.js';

const QUASE_ZERO = 1e-6;

function pontoNoRaio(origem, direcao, s) {
  return { x: origem.x + direcao.x * s, y: origem.y + direcao.y * s, z: origem.z + direcao.z * s };
}

function distanciaAteOChao(origem, direcao, raio) {
  if (direcao.y >= -QUASE_ZERO) return null;
  const s = (raio - origem.y) / direcao.y;
  return s > 0 ? s : null;
}

function distanciaAteOGol(origem, direcao, zGol) {
  if (direcao.z >= -QUASE_ZERO) return null;
  const s = (zGol - origem.z) / direcao.z;
  return s > 0 ? s : null;
}

export function alvoDaMira(origem, direcao, config) {
  const { raio } = config.bola;
  const { alturaMaxima, distanciaSemGol, distanciaMaxima } = config.chute.mira;
  const horizontal = Math.hypot(direcao.x, direcao.z);

  let s = distanciaAteOGol(origem, direcao, posicaoGol(config).z);
  if (s === null && horizontal > QUASE_ZERO) s = distanciaSemGol / horizontal;
  if (s !== null && s * horizontal > distanciaMaxima) s = distanciaMaxima / horizontal;

  const chao = distanciaAteOChao(origem, direcao, raio);
  if (chao !== null && (s === null || chao <= s)) {
    return { tipo: 'chao', ponto: pontoNoRaio(origem, direcao, chao) };
  }
  if (s === null) return null;

  const p = pontoNoRaio(origem, direcao, s);
  return { tipo: 'ar', ponto: { x: p.x, y: Math.min(Math.max(p.y, raio), alturaMaxima), z: p.z } };
}

export function velocidadeDeLancamento(bola, alvo, direcaoMira, config) {
  const { velocidade, velocidadeAerea } = config.chute;
  const g = config.fisica.gravidade;
  const mira = direcaoHorizontal(direcaoMira, 0);

  const hx = alvo ? alvo.ponto.x - bola.x : 0;
  const hz = alvo ? alvo.ponto.z - bola.z : 0;
  const d = Math.hypot(hx, hz);
  const paraFrente = d > 1e-3 && hx * mira.x + hz * mira.z > 0;
  const dir = paraFrente ? { x: hx / d, z: hz / d } : { x: mira.x, z: mira.z };

  if (!alvo || alvo.tipo === 'chao' || !paraFrente) {
    return { x: dir.x * velocidade, y: 0, z: dir.z * velocidade };
  }

  const subida = alvo.ponto.y - (bola.y ?? config.bola.raio);
  const t = Math.hypot(d, subida) / velocidadeAerea;
  const horizontal = d / t;
  return { x: dir.x * horizontal, y: (subida + (g * t * t) / 2) / t, z: dir.z * horizontal };
}
