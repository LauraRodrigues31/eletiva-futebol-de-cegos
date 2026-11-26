import { test } from 'node:test';
import assert from 'node:assert/strict';
import { visaoInicial } from '../src/logic/visao.js';

test('?visao=1 abre com a visão livre e ?visao=0 abre vendado', () => {
  assert.equal(visaoInicial('1', false), true);
  assert.equal(visaoInicial('0', true), false);
});

test('sem ?visao ou com valor inválido vale o config', () => {
  assert.equal(visaoInicial(null, true), true);
  assert.equal(visaoInicial(null, false), false);
  assert.equal(visaoInicial('sim', false), false);
  assert.equal(visaoInicial('', true), true);
});
