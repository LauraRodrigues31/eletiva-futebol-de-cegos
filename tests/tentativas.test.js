import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/config.js';
import {
  totalDeTentativas,
  ehUltima,
  proximoPasso,
  resultadoDoEvento,
  novoRegistro,
  anotarEvento,
  fecharRegistro,
  detalheAttemptEnd,
  detalhePhaseEnd,
  placarDaFase,
} from '../src/logic/tentativas.js';

const comTentativas = (n) => ({ ...CONFIG, tentativas: { tutorial: n, fase2: n, fase3: n, pausaMs: 4000 } });

function registroCompleto(resultado = 'goal') {
  let r = novoRegistro('tutorial', 1, 1000, { x: 0, y: 0.1, z: -2 });
  r = anotarEvento(r, 'ball-reached', { distance: 0.4, timeMs: 3000 }, 4000);
  r = anotarEvento(r, 'kick-ready', { hand: 'right' }, 4500);
  r = anotarEvento(
    r,
    'kick',
    {
      hand: 'right',
      direction: { x: 0, y: 0, z: -1 },
      target: { x: 0.12345, y: 0.5, z: -8 },
      velocity: { x: 0, y: 1, z: -6 },
      position: { x: 0, y: 0.1, z: -2 },
    },
    5000
  );
  if (resultado === 'goal') r = anotarEvento(r, 'goal', { position: { x: 0.1, y: 0.4, z: -8 } }, 6000);
  else {
    r = anotarEvento(r, 'post-hit', { side: 'right', position: { x: 1.8, y: 0.3, z: -8 } }, 6000);
    r = anotarEvento(r, 'miss', { reason: 'trave' }, 6000);
  }
  r = anotarEvento(r, 'ball-stopped', { position: { x: 0.2, y: 0.1, z: -8.5 } }, 9000);
  return fecharRegistro(r, 9000);
}

test('3 tentativas por fase jogável e 0 fora delas', () => {
  assert.equal(totalDeTentativas('tutorial', CONFIG), 3);
  assert.equal(totalDeTentativas('fase2', CONFIG), 3);
  assert.equal(totalDeTentativas('fase3', CONFIG), 3);
  assert.equal(totalDeTentativas('fim-tutorial', CONFIG), 0);
  assert.equal(totalDeTentativas('pausaMs', CONFIG), 0);
});

test('só a última tentativa é a última', () => {
  assert.equal(ehUltima('tutorial', 1, CONFIG), false);
  assert.equal(ehUltima('tutorial', 2, CONFIG), false);
  assert.equal(ehUltima('tutorial', 3, CONFIG), true);
});

test('próximo passo: próxima tentativa até a última, depois fim da fase', () => {
  assert.equal(proximoPasso('tutorial', 1, CONFIG), 'proxima');
  assert.equal(proximoPasso('tutorial', 2, CONFIG), 'proxima');
  assert.equal(proximoPasso('tutorial', 3, CONFIG), 'fim-da-fase');
});

test('o número de tentativas muda com o config', () => {
  const cinco = comTentativas(5);
  assert.equal(totalDeTentativas('fase2', cinco), 5);
  assert.equal(proximoPasso('fase2', 3, cinco), 'proxima');
  assert.equal(proximoPasso('fase2', 5, cinco), 'fim-da-fase');
});

test('resultado do evento: gol, cada motivo do miss e evento qualquer', () => {
  assert.deepEqual(resultadoDoEvento('goal', { position: {} }), { result: 'goal', reason: null });
  for (const reason of ['fora', 'alto', 'trave', 'curta', 'saiu']) {
    assert.deepEqual(resultadoDoEvento('miss', { reason }), { result: 'miss', reason });
  }
  assert.equal(resultadoDoEvento('kick', {}), null);
});

test('registro novo começa vazio com a posição da bola', () => {
  const r = novoRegistro('fase2', 2, 500, { x: 1.23456, y: 0.1, z: -2 });
  assert.equal(r.phase, 'fase2');
  assert.equal(r.attempt, 2);
  assert.equal(r.result, null);
  assert.deepEqual(r.ballStart, { x: 1.235, y: 0.1, z: -2 });
  assert.equal(r.startedAt, 500);
  assert.equal(r.reachedCount, 0);
  assert.equal(r.kick, null);
});

test('anotarEvento não altera o registro original', () => {
  const r = novoRegistro('tutorial', 1, 0, { x: 0, y: 0, z: 0 });
  const copia = structuredClone(r);
  const novo = anotarEvento(r, 'ball-reached', { timeMs: 100 }, 100);
  assert.notEqual(novo, r);
  assert.deepEqual(r, copia);
});

test('primeiro ball-reached define o tempo até a bola; os seguintes só contam', () => {
  let r = novoRegistro('tutorial', 1, 0, { x: 0, y: 0, z: 0 });
  r = anotarEvento(r, 'ball-reached', { timeMs: 3000 }, 3000);
  r = anotarEvento(r, 'ball-left', { distance: 0.8 }, 4000);
  r = anotarEvento(r, 'ball-reached', { timeMs: 5000 }, 5000);
  assert.equal(r.timeToBallMs, 3000);
  assert.equal(r.reachedCount, 2);
});

test('kick guarda mão, direção e momento desde o spawn; kick-ready conta', () => {
  const r = registroCompleto();
  assert.equal(r.kickReadyCount, 1);
  assert.equal(r.kick.hand, 'right');
  assert.deepEqual(r.kick.direction, { x: 0, y: 0, z: -1 });
  assert.deepEqual(r.kick.target, { x: 0.123, y: 0.5, z: -8 });
  assert.equal(r.kick.atMs, 4000);
});

test('gol tem goalPosition e reason null', () => {
  const r = registroCompleto('goal');
  assert.equal(r.result, 'goal');
  assert.equal(r.reason, null);
  assert.deepEqual(r.goalPosition, { x: 0.1, y: 0.4, z: -8 });
  assert.equal(r.postHit, null);
});

test('trave tem postHit e reason trave', () => {
  const r = registroCompleto('trave');
  assert.equal(r.result, 'miss');
  assert.equal(r.reason, 'trave');
  assert.equal(r.postHit, 'right');
  assert.equal(r.goalPosition, null);
});

test('fecharRegistro calcula a duração e guarda onde a bola parou', () => {
  const r = registroCompleto();
  assert.equal(r.durationMs, 8000);
  assert.deepEqual(r.ballEnd, { x: 0.2, y: 0.1, z: -8.5 });
});

test('detail do attempt-end', () => {
  assert.deepEqual(detalheAttemptEnd(registroCompleto('trave'), CONFIG), {
    phase: 'tutorial',
    attempt: 1,
    total: 3,
    result: 'miss',
    reason: 'trave',
  });
  assert.equal(detalheAttemptEnd(registroCompleto(), comTentativas(5)).total, 5);
});

test('detail do phase-end: só a fase pedida, na ordem', () => {
  const registros = [
    { phase: 'tutorial', attempt: 1, result: 'goal', reason: null, kick: {} },
    { phase: 'tutorial', attempt: 2, result: 'miss', reason: 'fora' },
    { phase: 'fase2', attempt: 1, result: 'miss', reason: 'curta' },
    { phase: 'tutorial', attempt: 3, result: 'miss', reason: 'trave' },
  ];
  assert.deepEqual(detalhePhaseEnd('tutorial', registros), {
    phase: 'tutorial',
    attempts: [
      { attempt: 1, result: 'goal', reason: null },
      { attempt: 2, result: 'miss', reason: 'fora' },
      { attempt: 3, result: 'miss', reason: 'trave' },
    ],
  });
  assert.deepEqual(detalhePhaseEnd('fase3', registros), { phase: 'fase3', attempts: [] });
});

test('placar da fase conta gols e tentativas fechadas', () => {
  const registros = [
    { phase: 'tutorial', result: 'goal' },
    { phase: 'tutorial', result: 'miss' },
    { phase: 'fase2', result: 'goal' },
  ];
  assert.deepEqual(placarDaFase('tutorial', registros), { gols: 1, tentativas: 2 });
  assert.deepEqual(placarDaFase('fase3', registros), { gols: 0, tentativas: 0 });
});
