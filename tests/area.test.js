import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  limitesArea,
  dentroDaArea,
  atualizarArea,
  fisicoParaVirtual,
  virtualParaFisico,
  posicaoGol,
} from '../src/logic/area.js';
import { CONFIG } from '../src/config.js';

const cfg = (sobrescrever = {}) => ({
  ...CONFIG,
  ...sobrescrever,
  area: { ...CONFIG.area, ...(sobrescrever.area ?? {}) },
  gol: { ...CONFIG.gol, ...(sobrescrever.gol ?? {}) },
});

test('limites da área 3 × 3 centrada na origem', () => {
  assert.deepEqual(limitesArea(cfg()), { minX: -1.5, maxX: 1.5, minZ: -1.5, maxZ: 1.5 });
});

test('limites acompanham áreas de outros tamanhos', () => {
  assert.deepEqual(limitesArea(cfg({ area: { largura: 4, profundidade: 2 } })), {
    minX: -2,
    maxX: 2,
    minZ: -1,
    maxZ: 1,
  });
});

test('pontos dentro, fora e na borda', () => {
  const c = cfg();
  assert.equal(dentroDaArea({ x: 0, z: 0 }, c), true);
  assert.equal(dentroDaArea({ x: 1.5, z: -1.5 }, c), true, 'a borda conta como dentro');
  assert.equal(dentroDaArea({ x: 1.51, z: 0 }, c), false);
  assert.equal(dentroDaArea({ x: 0, z: -1.6 }, c), false);
});

test('margem encolhe a área', () => {
  const c = cfg();
  assert.equal(dentroDaArea({ x: 1.3, z: 0 }, c, 0.3), false);
  assert.equal(dentroDaArea({ x: 1.2, z: 0 }, c, 0.3), true);
});

test('atualizarArea: sai ao passar da margem de aviso, uma vez só', () => {
  const c = cfg();
  let r = atualizarArea('dentro', { x: 1.0, z: 0 }, c);
  assert.deepEqual(r, { estado: 'dentro', evento: null });
  r = atualizarArea('dentro', { x: 1.25, z: 0 }, c); // 1,25 > 1,5 - 0,3
  assert.deepEqual(r, { estado: 'fora', evento: 'exit' });
  r = atualizarArea('fora', { x: 1.25, z: 0 }, c);
  assert.deepEqual(r, { estado: 'fora', evento: null }, 'não repete o evento');
});

test('atualizarArea: histerese na volta', () => {
  const c = cfg();
  // Entre 1,1 e 1,2 continua "fora" (precisa entrar 0,1 m além da margem).
  assert.deepEqual(atualizarArea('fora', { x: 1.15, z: 0 }, c), { estado: 'fora', evento: null });
  assert.deepEqual(atualizarArea('fora', { x: 1.05, z: 0 }, c), { estado: 'dentro', evento: 'enter' });
});

test('conversão físico ↔ virtual com escala 1 e escala 2', () => {
  const p = { x: 1, y: 0.5, z: -1.2 };
  assert.deepEqual(fisicoParaVirtual(p, cfg()), p);
  const c2 = cfg({ escala: 2 });
  assert.deepEqual(fisicoParaVirtual(p, c2), { x: 2, y: 0.5, z: -2.4 });
  assert.deepEqual(virtualParaFisico(fisicoParaVirtual(p, c2), c2), p);
});

test('posição do gol: borda frontal da área + distância configurada', () => {
  assert.deepEqual(posicaoGol(cfg()), { x: 0, y: 0, z: -4.5 });
  assert.deepEqual(posicaoGol(cfg({ gol: { distanciaDaArea: 5 } })), { x: 0, y: 0, z: -6.5 });
});
