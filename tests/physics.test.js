import { test } from 'node:test';
import assert from 'node:assert/strict';
import { passoFisica, distanciaDeParada } from '../src/logic/physics.js';
import { CONFIG } from '../src/config.js';

const quase = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b} (±${tol})`);

test('a velocidade cai com o atrito, sem mudar de direção', () => {
  const r = passoFisica({ x: 0, z: 0 }, { x: 0, z: -6 }, 0.05, CONFIG);
  quase(r.vel.z, -6 + 1.2 * 0.05, 1e-9);
  assert.equal(r.vel.x, 0);
  assert.ok(r.pos.z < 0, 'andou para a frente (-z)');
  assert.equal(r.parou, false);
});

test('abaixo da velocidade mínima, a bola para', () => {
  const r = passoFisica({ x: 1, z: 1 }, { x: 0.03, z: 0 }, 0.016, CONFIG);
  assert.deepEqual(r, { pos: { x: 1, z: 1 }, vel: { x: 0, z: 0 }, parou: true });
});

test('a bola nunca anda para trás ao frear', () => {
  // Passo grande o bastante para zerar a velocidade.
  const r = passoFisica({ x: 0, z: 0 }, { x: 0, z: -0.06 }, 0.05, CONFIG);
  assert.ok(r.pos.z <= 0);
  assert.equal(r.parou, true);
});

test('o passo de tempo é limitado (navegador travado não teleporta a bola)', () => {
  const normal = passoFisica({ x: 0, z: 0 }, { x: 0, z: -6 }, CONFIG.fisica.dtMaximo, CONFIG);
  const travado = passoFisica({ x: 0, z: 0 }, { x: 0, z: -6 }, 2, CONFIG);
  assert.deepEqual(travado, normal);
});

test('a distância percorrida bate com v² / (2a)', () => {
  let pos = { x: 0, z: 0 };
  let vel = { x: 0.6, z: -4.8 }; // 4,84 m/s numa diagonal
  const v0 = Math.hypot(vel.x, vel.z);
  for (let i = 0; i < 2000; i++) {
    const r = passoFisica(pos, vel, 1 / 72, CONFIG);
    pos = r.pos;
    vel = r.vel;
    if (r.parou) break;
  }
  assert.deepEqual(vel, { x: 0, z: 0 });
  quase(Math.hypot(pos.x, pos.z), distanciaDeParada(v0, CONFIG), 0.01);
});

test('com os valores padrão, o chute anda uns 15 m', () => {
  quase(distanciaDeParada(CONFIG.chute.velocidade, CONFIG), 15, 1e-9);
});
