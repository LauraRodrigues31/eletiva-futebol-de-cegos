import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  limitesArea,
  dentroDaArea,
  atualizarArea,
  fisicoParaVirtual,
  virtualParaFisico,
  posicaoGol,
  posicaoMarcaPenalti,
  limitesAreaVirtual,
  deslocamentoDoRig,
} from '../src/logic/area.js';
import { CONFIG } from '../src/config.js';

const quase = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);

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
  r = atualizarArea('dentro', { x: 1.25, z: 0 }, c);
  assert.deepEqual(r, { estado: 'fora', evento: 'exit' });
  r = atualizarArea('fora', { x: 1.25, z: 0 }, c);
  assert.deepEqual(r, { estado: 'fora', evento: null }, 'não repete o evento');
});

test('atualizarArea: histerese na volta', () => {
  const c = cfg();
  assert.deepEqual(atualizarArea('fora', { x: 1.15, z: 0 }, c), { estado: 'fora', evento: null });
  assert.deepEqual(atualizarArea('fora', { x: 1.05, z: 0 }, c), { estado: 'dentro', evento: 'enter' });
});

test('conversão físico ↔ virtual com escala 1 e escala 2', () => {
  const p = { x: 1, y: 0.5, z: -1.2 };
  assert.deepEqual(fisicoParaVirtual(p, cfg({ escala: 1 })), p);
  const c2 = cfg({ escala: 2 });
  assert.deepEqual(fisicoParaVirtual(p, c2), { x: 2, y: 0.5, z: -2.4 });
  assert.deepEqual(virtualParaFisico(fisicoParaVirtual(p, c2), c2), p);
});

test('escala padrão é pelo menos 2: a área 3 × 3 vira 6 × 6 no campo', () => {
  assert.ok(CONFIG.escala >= 2);
  assert.deepEqual(limitesAreaVirtual(cfg({ escala: 2 })), { minX: -3, maxX: 3, minZ: -3, maxZ: 3 });
  assert.deepEqual(limitesAreaVirtual(cfg({ escala: 1 })), limitesArea(cfg()));
});

test('o rig se desloca (escala − 1) × a cabeça física, e a cabeça no mundo anda escala ×', () => {
  const cabeca = { x: 0.4, z: -1.1 };
  const d = deslocamentoDoRig(cabeca, 2);
  assert.deepEqual(d, { x: 0.4, z: -1.1 });
  quase(cabeca.x + d.x, 0.8);
  quase(cabeca.z + d.z, -2.2);
  const parado = deslocamentoDoRig(cabeca, 1);
  quase(parado.x, 0);
  quase(parado.z, 0);
});

test('bola do tutorial: 0,5 m físico dentro da borda da frente, escalada para o campo', () => {
  const c = cfg({ escala: 2 });
  const marca = posicaoMarcaPenalti(c);
  assert.deepEqual(marca, { x: 0, y: 0, z: -2 });
  const fisica = virtualParaFisico(marca, c);
  assert.ok(dentroDaArea(fisica, c, CONFIG.area.margemAviso));
  assert.ok(marca.z < 0);
});

test('linha do gol fica a 6 m (virtuais) da marca do pênalti, do lado oposto à área', () => {
  const c = cfg({ escala: 2 });
  assert.deepEqual(posicaoGol(c), { x: 0, y: 0, z: -8 });
  assert.ok(posicaoGol(c).z < limitesAreaVirtual(c).minZ);
  assert.deepEqual(posicaoGol(cfg({ escala: 1 })), { x: 0, y: 0, z: -7 });
  const c2 = cfg({ escala: 2, bola: { ...CONFIG.bola, posicaoTutorial: { x: 0, z: -0.5 } } });
  assert.deepEqual(posicaoGol(c2), { x: 0, y: 0, z: -7 });
});
