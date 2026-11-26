import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  limitesDoGol,
  classificarCruzamento,
  cruzamentoDaLinha,
  rebaterNaTrave,
  rebaterNoTravessao,
  classificarNoGol,
  pontoDeCruzamento,
  limitesDoCampo,
  foraDoCampo,
} from '../src/logic/goal.js';
import { CONFIG } from '../src/config.js';

const quase = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
const cfg = (gol = {}) => ({ ...CONFIG, gol: { ...CONFIG.gol, ...gol } });

test('limites padrão (trave de 8 cm): gol até 1,69 m e trave até 1,97 m do centro', () => {
  const { limiteGol, limiteTrave } = limitesDoGol(CONFIG);
  quase(limiteGol, 1.69);
  quase(limiteTrave, 1.97);
});

test('classificação nos limites exatos', () => {
  assert.equal(classificarCruzamento(0, CONFIG), 'gol');
  assert.equal(classificarCruzamento(1.69, CONFIG), 'gol');
  assert.equal(classificarCruzamento(-1.69, CONFIG), 'gol');
  assert.equal(classificarCruzamento(1.7, CONFIG), 'trave-direita');
  assert.equal(classificarCruzamento(1.97, CONFIG), 'trave-direita');
  assert.equal(classificarCruzamento(1.98, CONFIG), 'fora');
});

test('lado da trave: esquerda é x negativo (visão de quem chuta)', () => {
  assert.equal(classificarCruzamento(-1.8, CONFIG), 'trave-esquerda');
  assert.equal(classificarCruzamento(1.8, CONFIG), 'trave-direita');
  assert.equal(classificarCruzamento(-2.1, CONFIG), 'fora');
});

test('os limites acompanham a configuração', () => {
  const largo = cfg({ largura: 4 });
  assert.equal(classificarCruzamento(1.6, largo), 'gol');
  assert.equal(classificarCruzamento(2.0, largo), 'trave-direita');
});

test('cruzamento interpolado entre dois quadros', () => {
  quase(cruzamentoDaLinha({ x: 0, z: -4 }, { x: 1, z: -5 }, -4.5), 0.5);
});

test('bola rápida que "pularia" a trave é detectada pela interpolação', () => {
  const x = cruzamentoDaLinha({ x: 1.8, z: -4.3 }, { x: 2.1, z: -4.7 }, -4.5);
  quase(x, 1.95);
  assert.equal(classificarCruzamento(x, CONFIG), 'trave-direita');
});

test('sem cruzamento: antes da linha, depois da linha ou voltando', () => {
  assert.equal(cruzamentoDaLinha({ x: 0, z: -3 }, { x: 0, z: -4 }, -4.5), null);
  assert.equal(cruzamentoDaLinha({ x: 0, z: -4.6 }, { x: 0, z: -4.8 }, -4.5), null);
  assert.equal(cruzamentoDaLinha({ x: 0, z: -4.6 }, { x: 0, z: -4.4 }, -4.5), null, 'indo para trás');
});

test('rebote na trave inverte z e perde metade da velocidade', () => {
  assert.deepEqual(rebaterNaTrave({ x: 1, z: -4 }, CONFIG), { x: 0.5, z: 2 });
});

test('limites do campo e bola fora deles', () => {
  const l = limitesDoCampo(CONFIG);
  assert.deepEqual(l, { minX: -10, maxX: 10, minZ: -9, maxZ: 32 });
  assert.equal(foraDoCampo({ x: 0, z: 0 }, CONFIG), false);
  assert.equal(foraDoCampo({ x: 10.1, z: 0 }, CONFIG), true);
  assert.equal(foraDoCampo({ x: 0, z: -9.1 }, CONFIG), true, 'passou do fundo da rede');
  assert.equal(foraDoCampo({ x: 0, z: 32.5 }, CONFIG), true);
});

test('no gol em 3D: rede, travessão, por cima e fora', () => {
  const alto = CONFIG.gol.altura;
  assert.equal(classificarNoGol({ x: 0, y: 1 }, CONFIG), 'gol');
  assert.equal(classificarNoGol({ x: 1.6, y: 0.1 }, CONFIG), 'gol');
  assert.equal(classificarNoGol({ x: 0, y: alto - 0.15 }, CONFIG), 'gol');
  assert.equal(classificarNoGol({ x: 0, y: alto - 0.13 }, CONFIG), 'travessao');
  assert.equal(classificarNoGol({ x: 0, y: alto + 0.14 }, CONFIG), 'travessao');
  assert.equal(classificarNoGol({ x: 0, y: alto + 0.15 }, CONFIG), 'alto');
  assert.equal(classificarNoGol({ x: 1.8, y: 1 }, CONFIG), 'trave-direita');
  assert.equal(classificarNoGol({ x: -1.8, y: 1 }, CONFIG), 'trave-esquerda');
  assert.equal(classificarNoGol({ x: 2.5, y: 1 }, CONFIG), 'fora');
  assert.equal(classificarNoGol({ x: 2.5, y: 4 }, CONFIG), 'fora');
});

test('ponto de cruzamento interpola x e y', () => {
  const c = pontoDeCruzamento({ x: 0, y: 1, z: -6 }, { x: 1, y: 2, z: -8 }, -7);
  quase(c.x, 0.5);
  quase(c.y, 1.5);
  assert.equal(pontoDeCruzamento({ x: 0, y: 1, z: -5 }, { x: 0, y: 1, z: -6 }, -7), null);
});

test('travessão devolve a bola para trás e inverte a vertical', () => {
  const v = rebaterNoTravessao({ x: 1, y: 2, z: -10 }, CONFIG);
  assert.deepEqual(v, { x: 0.5, y: -1, z: 5 });
});
