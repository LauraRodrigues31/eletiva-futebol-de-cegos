import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ESTADOS,
  SEQUENCIA,
  estadoInicial,
  estadoValido,
  podeIr,
  transicionar,
  destinoPorEvento,
  proximoNaSequencia,
  entrarEm,
  detalheStateChange,
} from '../src/logic/state-machine.js';

test('começa no vestiário, sem tentativa', () => {
  assert.deepEqual(estadoInicial(), { estado: 'vestiario', tentativa: 0 });
});

test('todas as transições da sequência são válidas, inclusive o reinício', () => {
  for (let i = 0; i < SEQUENCIA.length; i++) {
    const de = SEQUENCIA[i];
    const para = SEQUENCIA[(i + 1) % SEQUENCIA.length];
    assert.equal(podeIr(de, para), true, `${de} → ${para}`);
  }
});

test('transições fora da sequência são rejeitadas sem mudar nada', () => {
  const dados = estadoInicial();
  const r = transicionar(dados, ESTADOS.FASE2);
  assert.equal(r.ok, false);
  assert.equal(r.dados, dados);
  assert.equal(podeIr(ESTADOS.TUTORIAL, ESTADOS.VESTIARIO), false);
  assert.equal(podeIr(ESTADOS.FASE3, ESTADOS.FASE2), false, 'não volta de fase');
  assert.equal(podeIr(ESTADOS.TUTORIAL, ESTADOS.TUTORIAL), false, 'não repete o mesmo estado');
  assert.equal(podeIr('inexistente', ESTADOS.TUTORIAL), false);
});

test('fases jogáveis começam na tentativa 1; os outros estados, em 0', () => {
  assert.equal(entrarEm(ESTADOS.TUTORIAL).tentativa, 1);
  assert.equal(entrarEm(ESTADOS.FASE2).tentativa, 1);
  assert.equal(entrarEm(ESTADOS.FASE3).tentativa, 1);
  assert.equal(entrarEm(ESTADOS.FIM_TUTORIAL).tentativa, 0);
  assert.equal(entrarEm(ESTADOS.RESULTADO).tentativa, 0);
});

test('percorrer o jogo inteiro e reiniciar', () => {
  let dados = estadoInicial();
  for (const proximo of [...SEQUENCIA.slice(1), ESTADOS.VESTIARIO]) {
    const r = transicionar(dados, proximo);
    assert.equal(r.ok, true, `${dados.estado} → ${proximo}`);
    dados = r.dados;
  }
  assert.deepEqual(dados, estadoInicial());
});

test('eventos só provocam transição no estado certo', () => {
  assert.equal(destinoPorEvento(ESTADOS.VESTIARIO, 'blindfold-on'), ESTADOS.ENTRADA_CAMPO);
  assert.equal(destinoPorEvento(ESTADOS.FASE2, 'blindfold-on'), null);
  assert.equal(destinoPorEvento(ESTADOS.ENTRADA_CAMPO, 'field-entered'), ESTADOS.TUTORIAL);
  assert.equal(destinoPorEvento(ESTADOS.FIM_TUTORIAL, 'continue'), ESTADOS.FASE2);
  assert.equal(destinoPorEvento(ESTADOS.RESULTADO, 'continue'), ESTADOS.VESTIARIO);
  assert.equal(destinoPorEvento(ESTADOS.TUTORIAL, 'continue'), null);
  assert.equal(destinoPorEvento(ESTADOS.TUTORIAL, 'evento-desconhecido'), null);
});

test('próximo na sequência dá a volta e rejeita estado inválido', () => {
  assert.equal(proximoNaSequencia(ESTADOS.VESTIARIO), ESTADOS.ENTRADA_CAMPO);
  assert.equal(proximoNaSequencia(ESTADOS.RESULTADO), ESTADOS.VESTIARIO);
  assert.equal(proximoNaSequencia('xyz'), null);
});

test('detail do state-change na primeira emissão: from null', () => {
  assert.deepEqual(detalheStateChange(null, estadoInicial()), {
    from: null,
    to: 'vestiario',
    phase: 'vestiario',
    attempt: 0,
  });
});

test('detail do state-change ao entrar numa fase jogável', () => {
  const r = transicionar({ estado: ESTADOS.ENTRADA_CAMPO, tentativa: 0 }, ESTADOS.TUTORIAL);
  assert.deepEqual(detalheStateChange(ESTADOS.ENTRADA_CAMPO, r.dados), {
    from: 'entrada-campo',
    to: 'tutorial',
    phase: 'tutorial',
    attempt: 1,
  });
});

test('detail do state-change: phase sempre igual a to', () => {
  for (const estado of SEQUENCIA) {
    const d = detalheStateChange('x', entrarEm(estado));
    assert.equal(d.phase, d.to);
  }
});

test('estadoValido', () => {
  assert.equal(estadoValido('fase2'), true);
  assert.equal(estadoValido('fase4'), false);
});
