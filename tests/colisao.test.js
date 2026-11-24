import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolverColisao, penetracaoMaxima } from '../src/logic/colisao.js';
import { colisoresVestiario, cabineDoJogador } from '../src/logic/vestiario.js';
import { distanciaNoChao } from '../src/logic/proximity.js';
import { CONFIG } from '../src/config.js';

const caixa = { minX: -1, maxX: 1, minZ: -1, maxZ: 1 };
const perto = (a, b) => Math.abs(a - b) < 1e-9;

test('longe de tudo: posição não muda', () => {
  const r = resolverColisao({ x: 3, z: 0 }, 0.2, { caixas: [caixa] });
  assert.deepEqual(r, { x: 3, z: 0, colidiu: false });
});

test('encostando na lateral: empurra para fora até o raio', () => {
  const r = resolverColisao({ x: 1.1, z: 0 }, 0.2, { caixas: [caixa] });
  assert.ok(r.colidiu);
  assert.ok(perto(r.x, 1.2));
  assert.ok(perto(r.z, 0));
});

test('na quina: empurra na diagonal', () => {
  const r = resolverColisao({ x: 1.1, z: 1.1 }, 0.2, { caixas: [caixa] });
  assert.ok(perto(Math.hypot(r.x - 1, r.z - 1), 0.2));
});

test('centro dentro da caixa: sai pelo lado mais próximo', () => {
  const r = resolverColisao({ x: 0.9, z: 0 }, 0.2, { caixas: [caixa] });
  assert.ok(perto(r.x, 1.2));
});

test('paredes da sala: fica dentro, a um raio da parede', () => {
  const limites = { minX: -3, maxX: 3, minZ: -2, maxZ: 2 };
  const r = resolverColisao({ x: 3.5, z: -2.5 }, 0.2, { limites });
  assert.ok(perto(r.x, 2.8));
  assert.ok(perto(r.z, -1.8));
});

test('penetração máxima: zero fora, profundidade dentro', () => {
  assert.equal(penetracaoMaxima({ x: 3, z: 0 }, 0.2, { caixas: [caixa] }), 0);
  assert.ok(perto(penetracaoMaxima({ x: 1.1, z: 0 }, 0.2, { caixas: [caixa] }), 0.1));
});

test('vestiário: a marca do chão (origem) está livre', () => {
  const { andar, cabeca } = colisoresVestiario(CONFIG);
  const raio = CONFIG.vestiario.colisao.raioCabeca;
  assert.equal(resolverColisao({ x: 0, z: 0 }, raio, andar).colidiu, false);
  assert.equal(penetracaoMaxima({ x: 0, z: 0 }, raio, cabeca), 0);
});

test('vestiário: o banco bloqueia o andar, mas não a cabeça', () => {
  const { andar, cabeca } = colisoresVestiario(CONFIG);
  const raio = CONFIG.vestiario.colisao.raioCabeca;
  const sobreOBanco = { x: 0, z: CONFIG.vestiario.banco.z };
  assert.ok(resolverColisao(sobreOBanco, raio, andar).colidiu);
  assert.equal(penetracaoMaxima(sobreOBanco, raio, cabeca), 0);
});

test('vestiário: a cabeça não entra nas cabines', () => {
  const { cabeca } = colisoresVestiario(CONFIG);
  const raio = CONFIG.vestiario.colisao.raioCabeca;
  const dentroDaCabine = { x: 0, z: CONFIG.vestiario.sala.minZ + 0.2 };
  assert.ok(penetracaoMaxima(dentroDaCabine, raio, cabeca) > 0);
});

test('vestiário: com o banco bloqueando, a venda do jogador ainda é alcançável', () => {
  const { andar } = colisoresVestiario(CONFIG);
  const raio = CONFIG.vestiario.colisao.raioCabeca;
  const { posVenda } = cabineDoJogador(CONFIG);
  const maisPerto = resolverColisao(posVenda, raio, andar);
  assert.ok(distanciaNoChao(maisPerto, posVenda) < CONFIG.vestiario.alcance.entrar);
});
