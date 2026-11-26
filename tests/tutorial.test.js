import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../src/events.js';
import { DICAS_TUTORIAL, EVENTOS_DAS_DICAS, etapaDaDica, textoDica } from '../src/logic/tutorial.js';

test('dicas seguem o chute: andar, preparar, mirar e somem no chute', () => {
  assert.equal(etapaDaDica(EVENTS.BALL_SPAWNED), 'andar');
  assert.equal(etapaDaDica(EVENTS.BALL_REACHED), 'preparar');
  assert.equal(etapaDaDica(EVENTS.KICK_READY), 'mirar');
  assert.equal(etapaDaDica(EVENTS.KICK), 'esconder');
});

test('ao se afastar da bola, a dica volta para andar', () => {
  assert.equal(etapaDaDica(EVENTS.BALL_LEFT), 'andar');
});

test('eventos que não mudam a dica devolvem null', () => {
  assert.equal(etapaDaDica(EVENTS.GOAL), null);
  assert.equal(etapaDaDica(EVENTS.KICK_CANCEL), null);
});

test('toda etapa mostrada tem texto, com a versão do computador', () => {
  for (const evento of EVENTOS_DAS_DICAS) {
    const etapa = etapaDaDica(evento);
    if (etapa === 'esconder') continue;
    assert.ok(textoDica(etapa).includes('No computador'), etapa);
  }
  assert.equal(textoDica('inexistente'), '');
  assert.equal(Object.keys(DICAS_TUTORIAL).length, 3);
});
