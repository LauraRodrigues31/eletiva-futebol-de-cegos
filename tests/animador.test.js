import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Animador, EASINGS } from '../src/logic/animador.js';

test('anima de "de" até "para" e resolve com true', async () => {
  const anim = new Animador();
  const valores = [];
  const fim = anim.animar({ duracao: 100, de: 0, para: 10, aoAtualizar: (v) => valores.push(v) });
  anim.atualizar(1000);
  anim.atualizar(1050);
  anim.atualizar(1200);
  assert.deepEqual(valores, [0, 5, 10]);
  assert.equal(await fim, true);
  assert.equal(anim.ocupado, false);
});

test('parar cancela sem aplicar o final e resolve com false', async () => {
  const anim = new Animador();
  let ultimo = null;
  const fim = anim.animar({ duracao: 100, de: 0, para: 1, aoAtualizar: (v) => (ultimo = v) });
  anim.atualizar(0);
  anim.atualizar(30);
  anim.parar();
  anim.atualizar(500);
  assert.equal(ultimo, 0.3);
  assert.equal(await fim, false);
});

test('esperar resolve depois da duração', async () => {
  const anim = new Animador();
  let pronto = false;
  anim.esperar(200).then(() => (pronto = true));
  anim.atualizar(0);
  anim.atualizar(199);
  await Promise.resolve();
  assert.equal(pronto, false);
  anim.atualizar(200);
  await Promise.resolve();
  assert.equal(pronto, true);
});

test('easings começam em 0 e terminam em 1', () => {
  for (const [nome, f] of Object.entries(EASINGS)) {
    assert.equal(f(0), 0, nome);
    assert.equal(f(1), 1, nome);
  }
});
