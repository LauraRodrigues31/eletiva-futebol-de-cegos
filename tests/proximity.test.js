import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distanciaNoChao, atualizarProximidade } from '../src/logic/proximity.js';
import { CONFIG } from '../src/config.js';

test('distância no chão ignora a altura', () => {
  const cabeca = { x: 0, y: 1.6, z: 0 };
  const bola = { x: 0.3, y: 0.1, z: -0.4 };
  assert.equal(distanciaNoChao(cabeca, bola), 0.5);
});

test('longe → perto abaixo de 0,5 m, com evento reached', () => {
  assert.deepEqual(atualizarProximidade('longe', 0.49, CONFIG), { estado: 'perto', evento: 'reached' });
});

test('exatamente 0,5 m ainda não alcança', () => {
  assert.deepEqual(atualizarProximidade('longe', 0.5, CONFIG), { estado: 'longe', evento: null });
});

test('entre 0,5 e 0,7 m mantém o estado (histerese)', () => {
  assert.deepEqual(atualizarProximidade('perto', 0.6, CONFIG), { estado: 'perto', evento: null });
  assert.deepEqual(atualizarProximidade('longe', 0.6, CONFIG), { estado: 'longe', evento: null });
});

test('perto → longe acima de 0,7 m, com evento left', () => {
  assert.deepEqual(atualizarProximidade('perto', 0.71, CONFIG), { estado: 'longe', evento: 'left' });
});

test('nenhum evento repetido: uma aproximação = um reached, um afastamento = um left', () => {
  const distancias = [2, 1.2, 0.8, 0.45, 0.3, 0.55, 0.45, 0.65, 0.9, 1.5, 0.4];
  let estado = 'longe';
  const eventos = [];
  for (const d of distancias) {
    const r = atualizarProximidade(estado, d, CONFIG);
    estado = r.estado;
    if (r.evento) eventos.push(r.evento);
  }
  assert.deepEqual(eventos, ['reached', 'left', 'reached']);
});
