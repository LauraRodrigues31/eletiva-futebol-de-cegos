import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alvoDaMira, velocidadeDeLancamento } from '../src/logic/mira.js';
import { passoBola } from '../src/logic/physics.js';
import { pontoDeCruzamento, classificarNoGol } from '../src/logic/goal.js';
import { posicaoGol } from '../src/logic/area.js';
import { CONFIG } from '../src/config.js';

const quase = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b} (±${tol})`);
const normalizar = (v) => {
  const n = Math.hypot(v.x, v.y, v.z);
  return { x: v.x / n, y: v.y / n, z: v.z / n };
};
const olho = { x: 0, y: 1.6, z: -0.6 };
const bola = { x: 0, y: CONFIG.bola.raio, z: -1 };
const zGol = posicaoGol(CONFIG).z;
const mirarEm = (ponto) => normalizar({ x: ponto.x - olho.x, y: ponto.y - olho.y, z: ponto.z - olho.z });

function voar(vel) {
  let pos = { ...bola };
  let v = { ...vel };
  for (let i = 0; i < 2000; i++) {
    const r = passoBola(pos, v, 1 / 72, CONFIG);
    const c = pontoDeCruzamento(pos, r.pos, zGol);
    if (c) return c;
    pos = r.pos;
    v = r.vel;
    if (r.parou) return null;
  }
  return null;
}

test('mirando dentro do gol, o alvo é o ponto mirado na linha do gol', () => {
  const alvo = alvoDaMira(olho, mirarEm({ x: 1, y: 1.2, z: zGol }), CONFIG);
  assert.equal(alvo.tipo, 'ar');
  quase(alvo.ponto.x, 1, 1e-9);
  quase(alvo.ponto.y, 1.2, 1e-9);
  quase(alvo.ponto.z, zGol, 1e-9);
});

test('mirando o gramado antes do gol, o alvo é o chão', () => {
  const alvo = alvoDaMira(olho, mirarEm({ x: 0.5, y: 0, z: -3 }), CONFIG);
  assert.equal(alvo.tipo, 'chao');
  quase(alvo.ponto.y, CONFIG.bola.raio, 1e-9);
});

test('mirando o céu, a altura do alvo é limitada', () => {
  const alvo = alvoDaMira(olho, normalizar({ x: 0, y: 3, z: -1 }), CONFIG);
  assert.equal(alvo.tipo, 'ar');
  assert.equal(alvo.ponto.y, CONFIG.chute.mira.alturaMaxima);
});

test('de costas para o gol, o alvo fica à distância padrão', () => {
  const alvo = alvoDaMira(olho, { x: 0, y: 0, z: 1 }, CONFIG);
  assert.equal(alvo.tipo, 'ar');
  quase(alvo.ponto.z - olho.z, CONFIG.chute.mira.distanciaSemGol, 1e-9);
});

test('mirando reto para cima, não há alvo', () => {
  assert.equal(alvoDaMira(olho, { x: 0, y: 1, z: 0 }, CONFIG), null);
});

for (const [nome, ponto, esperado] of [
  ['meio do gol', { x: 0, y: 1, z: zGol }, 'gol'],
  ['canto alto', { x: -1.4, y: 1.8, z: zGol }, 'gol'],
  ['rasteiro no canto', { x: 1.5, y: 0.15, z: zGol }, 'gol'],
  ['travessão', { x: 0.5, y: CONFIG.gol.altura, z: zGol }, 'travessao'],
  ['por cima', { x: 0, y: 3, z: zGol }, 'alto'],
  ['trave direita', { x: 1.83, y: 1, z: zGol }, 'trave-direita'],
  ['fora', { x: -3, y: 1, z: zGol }, 'fora'],
]) {
  test(`a bola chega onde a mira aponta: ${nome}`, () => {
    const alvo = alvoDaMira(olho, mirarEm(ponto), CONFIG);
    const vel = velocidadeDeLancamento(bola, alvo, mirarEm(ponto), CONFIG);
    const c = voar(vel);
    assert.ok(c, 'cruzou a linha do gol');
    quase(c.x, ponto.x, 0.02);
    quase(c.y, ponto.y, 0.02);
    assert.equal(classificarNoGol(c, CONFIG), esperado);
  });
}

test('mirando o chão, a bola sai rolando com a velocidade do chute rasteiro', () => {
  const dir = mirarEm({ x: 0, y: 0, z: -3 });
  const vel = velocidadeDeLancamento(bola, alvoDaMira(olho, dir, CONFIG), dir, CONFIG);
  assert.equal(vel.y, 0);
  quase(Math.hypot(vel.x, vel.z), CONFIG.chute.velocidade, 1e-9);
});

test('alvo atrás da bola (olhando para baixo, entre os pés) chuta para a frente da mira', () => {
  const dir = mirarEm({ x: 0, y: 0, z: -0.8 });
  const alvo = alvoDaMira(olho, dir, CONFIG);
  const vel = velocidadeDeLancamento(bola, alvo, dir, CONFIG);
  assert.ok(vel.z < 0, 'vai em direção ao gol');
  assert.equal(vel.y, 0);
});

test('sem alvo (mira para cima), rola na direção da mira ou reto para o gol', () => {
  const vel = velocidadeDeLancamento(bola, null, { x: 0, y: 1, z: 0 }, CONFIG);
  assert.deepEqual(vel, { x: 0, y: 0, z: -CONFIG.chute.velocidade });
});
