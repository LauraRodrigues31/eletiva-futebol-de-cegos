import { test } from 'node:test';
import assert from 'node:assert/strict';
import { direcaoHorizontal, podeChutar, maoPermitida } from '../src/logic/kick.js';

const quase = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);

test('direção horizontal zera a altura e normaliza', () => {
  const d = direcaoHorizontal({ x: 3, y: -2, z: -4 }, 0.3);
  assert.equal(d.y, 0);
  quase(d.x, 0.6);
  quase(d.z, -0.8);
  quase(Math.hypot(d.x, d.z), 1);
});

test('controle apontando quase reto para baixo usa a direção reserva (cabeça)', () => {
  const controle = { x: 0.05, y: -1, z: -0.05 };
  const cabeca = { x: -1, y: 0.1, z: 0 };
  assert.deepEqual(direcaoHorizontal(controle, 0.3, cabeca), { x: -1, y: 0, z: 0 });
});

test('sem reserva e vetor vertical, chuta reto para o gol (-z)', () => {
  assert.deepEqual(direcaoHorizontal({ x: 0, y: 1, z: 0 }, 0.3), { x: 0, y: 0, z: -1 });
});

test('pode chutar: fase jogável, bola esperando e perto', () => {
  assert.deepEqual(podeChutar('tutorial', 'esperando', 'perto'), { ok: true });
  assert.deepEqual(podeChutar('fase3', 'esperando', 'perto'), { ok: true });
});

test('não pode chutar: fora de fase, bola longe ou já chutada', () => {
  assert.equal(podeChutar('vestiario', 'esperando', 'perto').ok, false);
  assert.equal(podeChutar('fim-tutorial', 'esperando', 'perto').ok, false);
  assert.deepEqual(podeChutar('tutorial', 'esperando', 'longe'), { ok: false, motivo: 'bola longe' });
  assert.deepEqual(podeChutar('tutorial', 'rolando', 'perto'), { ok: false, motivo: 'bola rolando' });
  assert.equal(podeChutar('tutorial', 'parada', 'perto').ok, false);
});

test('mão permitida conforme a configuração', () => {
  assert.equal(maoPermitida('left', 'ambas'), true);
  assert.equal(maoPermitida('right', 'ambas'), true);
  assert.equal(maoPermitida('right', 'direita'), true);
  assert.equal(maoPermitida('left', 'direita'), false);
  assert.equal(maoPermitida('left', 'esquerda'), true);
  assert.equal(maoPermitida('right', 'esquerda'), false);
});
