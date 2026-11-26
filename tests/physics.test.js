import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  passoFisica,
  passoBola,
  noAr,
  distanciaDeParada,
  limiteDasBandas,
  rebaterNasBandas,
} from '../src/logic/physics.js';
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
  let vel = { x: 0.6, z: -4.8 };
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

test('a bola rebate na face interna da banda, encostando nela pelo raio', () => {
  quase(limiteDasBandas(CONFIG), 9.9, 1e-9);
});

test('dentro do campo, a banda não faz nada', () => {
  const r = rebaterNasBandas({ x: 9.9, z: 3 }, { x: 2, z: -1 }, CONFIG);
  assert.equal(r.bateu, false);
  assert.deepEqual(r.pos, { x: 9.9, z: 3 });
  assert.deepEqual(r.vel, { x: 2, z: -1 });
});

test('na banda direita, volta para dentro e perde parte da velocidade lateral', () => {
  const r = rebaterNasBandas({ x: 10.1, z: 3 }, { x: 2, z: -1 }, CONFIG);
  assert.equal(r.bateu, true);
  quase(r.pos.x, 9.9 - 0.2 * CONFIG.fisica.restituicaoBanda, 1e-9);
  assert.equal(r.pos.z, 3);
  quase(r.vel.x, -2 * CONFIG.fisica.restituicaoBanda, 1e-9);
  assert.equal(r.vel.z, -1, 'a velocidade ao longo do campo continua');
});

test('na banda esquerda, o rebote é espelhado', () => {
  const r = rebaterNasBandas({ x: -10.1, z: 0 }, { x: -2, z: 0 }, CONFIG);
  assert.equal(r.bateu, true);
  quase(r.pos.x, -9.9 + 0.2 * CONFIG.fisica.restituicaoBanda, 1e-9);
  assert.ok(r.vel.x > 0);
});

test('chute na diagonal rola pela banda e nunca entra nela', () => {
  let pos = { x: 8, z: 0 };
  let vel = { x: 5, z: -2 };
  let bateu = false;
  for (let i = 0; i < 400; i++) {
    const passo = passoFisica(pos, vel, 0.05, CONFIG);
    const banda = rebaterNasBandas(passo.pos, passo.vel, CONFIG);
    pos = banda.pos;
    vel = banda.vel;
    bateu ||= banda.bateu;
    assert.ok(Math.abs(pos.x) <= limiteDasBandas(CONFIG) + 1e-9);
    if (passo.parou) break;
  }
  assert.ok(bateu, 'bateu na banda');
  assert.ok(pos.x < limiteDasBandas(CONFIG));
});

const R = CONFIG.bola.raio;

test('no chão, passoBola rola igual ao passoFisica e mantém a bola na altura do raio', () => {
  const r = passoBola({ x: 0, y: R, z: 0 }, { x: 0, y: 0, z: -6 }, 0.05, CONFIG);
  const plano = passoFisica({ x: 0, z: 0 }, { x: 0, z: -6 }, 0.05, CONFIG);
  assert.deepEqual(r.pos, { x: plano.pos.x, y: R, z: plano.pos.z });
  assert.deepEqual(r.vel, { x: plano.vel.x, y: 0, z: plano.vel.z });
  assert.equal(r.quicou, false);
});

test('no ar, a gravidade puxa para baixo e não há atrito na horizontal', () => {
  const r = passoBola({ x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: -10 }, 0.05, CONFIG);
  quase(r.vel.y, -CONFIG.fisica.gravidade * 0.05, 1e-9);
  assert.equal(r.vel.z, -10);
  assert.ok(r.pos.y < 1);
  assert.equal(r.parou, false);
});

test('a altura no ar segue y0 + vy·t − g·t²/2', () => {
  let pos = { x: 0, y: R, z: 0 };
  let vel = { x: 0, y: 5, z: -10 };
  for (let i = 0; i < 20; i++) ({ pos, vel } = passoBola(pos, vel, 0.025, CONFIG));
  const t = 0.5;
  quase(pos.y, R + 5 * t - (CONFIG.fisica.gravidade * t * t) / 2, 1e-9);
});

test('ao tocar o chão, quica mais baixo e perde velocidade na horizontal', () => {
  const r = passoBola({ x: 0, y: R + 0.01, z: 0 }, { x: 0, y: -5, z: -10 }, 0.05, CONFIG);
  assert.equal(r.quicou, true);
  assert.equal(r.pos.y, R);
  assert.ok(r.vel.y > 0 && r.vel.y < 5);
  quase(r.vel.z, -10 * CONFIG.fisica.retencaoQuique, 1e-9);
});

test('quique fraco demais vira rolagem', () => {
  const r = passoBola({ x: 0, y: R + 0.001, z: 0 }, { x: 0, y: -0.5, z: -3 }, 0.05, CONFIG);
  assert.equal(r.vel.y, 0);
  assert.equal(noAr(r.pos, r.vel, CONFIG), false);
});

test('a bola lançada para cima acaba parando no chão', () => {
  let pos = { x: 0, y: R, z: 0 };
  let vel = { x: 0, y: 6, z: -4 };
  let parou = false;
  for (let i = 0; i < 5000 && !parou; i++) ({ pos, vel, parou } = passoBola(pos, vel, 1 / 72, CONFIG));
  assert.ok(parou);
  assert.equal(pos.y, R);
});

test('a banda preserva a altura da bola', () => {
  const r = rebaterNasBandas({ x: 10.1, y: 0.5, z: 3 }, { x: 2, y: 1, z: -1 }, CONFIG);
  assert.equal(r.pos.y, 0.5);
  assert.equal(r.vel.y, 1);
});
