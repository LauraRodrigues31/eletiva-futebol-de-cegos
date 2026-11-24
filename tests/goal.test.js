import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  limitesDoGol,
  classificarCruzamento,
  cruzamentoDaLinha,
  rebaterNaTrave,
  limitesDoCampo,
  foraDoCampo,
} from '../src/logic/goal.js';
import { CONFIG } from '../src/config.js';

const quase = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
const cfg = (gol = {}) => ({ ...CONFIG, gol: { ...CONFIG.gol, ...gol } });

test('limites padrão: gol até 1,68 m e trave até 1,98 m do centro', () => {
  const { limiteGol, limiteTrave } = limitesDoGol(CONFIG);
  quase(limiteGol, 1.68);
  quase(limiteTrave, 1.98);
});

test('classificação nos limites exatos', () => {
  assert.equal(classificarCruzamento(0, CONFIG), 'gol');
  assert.equal(classificarCruzamento(1.68, CONFIG), 'gol');
  assert.equal(classificarCruzamento(-1.68, CONFIG), 'gol');
  assert.equal(classificarCruzamento(1.69, CONFIG), 'trave-direita');
  assert.equal(classificarCruzamento(1.98, CONFIG), 'trave-direita');
  assert.equal(classificarCruzamento(1.99, CONFIG), 'fora');
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
  // De (0, -4) para (1, -5): cruza z = -4,5 na metade, em x = 0,5.
  quase(cruzamentoDaLinha({ x: 0, z: -4 }, { x: 1, z: -5 }, -4.5), 0.5);
});

test('bola rápida que "pularia" a trave é detectada pela interpolação', () => {
  // Antes da linha em x = 1,8 (na trave), depois em x = 2,1 (fora): cruzou em 1,95, na trave.
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
  assert.deepEqual(l, { minX: -10, maxX: 10, minZ: -5.5, maxZ: 35.5 });
  assert.equal(foraDoCampo({ x: 0, z: 0 }, CONFIG), false);
  assert.equal(foraDoCampo({ x: 10.1, z: 0 }, CONFIG), true);
  assert.equal(foraDoCampo({ x: 0, z: -5.6 }, CONFIG), true, 'passou do fundo da rede');
  assert.equal(foraDoCampo({ x: 0, z: 36 }, CONFIG), true);
});
