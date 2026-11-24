import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  layoutCabines,
  cabineDoJogador,
  atualizarAlcanceVenda,
  textoInstrucao,
  INSTRUCOES,
} from '../src/logic/vestiario.js';
import { dentroDaArea } from '../src/logic/area.js';
import { CONFIG } from '../src/config.js';

test('uma cabine por item da configuração, centralizadas em x = 0', () => {
  const cabines = layoutCabines(CONFIG);
  assert.equal(cabines.length, CONFIG.vestiario.cabines.quantidade);
  assert.deepEqual(
    cabines.map((c) => c.x),
    [-1.8, -0.9, 0, 0.9, 1.8],
  );
  const soma = cabines.reduce((s, c) => s + c.x, 0);
  assert.ok(Math.abs(soma) < 1e-9);
});

test('cabines encostadas na parede da frente e vendas sobre o banco', () => {
  for (const c of layoutCabines(CONFIG)) {
    assert.equal(c.z, CONFIG.vestiario.sala.minZ);
    assert.deepEqual(c.posVenda, {
      x: c.x,
      y: CONFIG.vestiario.banco.altura,
      z: CONFIG.vestiario.banco.z,
    });
  }
});

test('só uma cabine é do jogador, e ela leva o nome do jogador', () => {
  const doJogador = layoutCabines(CONFIG).filter((c) => c.ehDoJogador);
  assert.equal(doJogador.length, 1);
  assert.equal(doJogador[0].indice, CONFIG.vestiario.cabines.doJogador);
  assert.equal(doJogador[0].nome, CONFIG.vestiario.cabines.nomeJogador);
  assert.deepEqual(cabineDoJogador(CONFIG), doJogador[0]);
});

test('a venda do jogador fica dentro da área física (dá para alcançar andando)', () => {
  assert.ok(dentroDaArea(cabineDoJogador(CONFIG).posVenda, CONFIG));
});

test('números das camisas vêm da configuração', () => {
  assert.deepEqual(
    layoutCabines(CONFIG).map((c) => c.numero),
    CONFIG.vestiario.cabines.numeros,
  );
});

test('alcance da venda com histerese (0,9 m para entrar, 1,1 m para sair)', () => {
  assert.deepEqual(atualizarAlcanceVenda('longe', 0.89, CONFIG), { estado: 'perto', evento: 'reached' });
  assert.deepEqual(atualizarAlcanceVenda('longe', 1.0, CONFIG), { estado: 'longe', evento: null });
  assert.deepEqual(atualizarAlcanceVenda('perto', 1.0, CONFIG), { estado: 'perto', evento: null });
  assert.deepEqual(atualizarAlcanceVenda('perto', 1.11, CONFIG), { estado: 'longe', evento: 'left' });
});

test('toda etapa tem texto, e etapa desconhecida devolve vazio', () => {
  for (const etapa of Object.keys(INSTRUCOES)) assert.ok(textoInstrucao(etapa).length > 0);
  assert.equal(textoInstrucao('inexistente'), '');
});
