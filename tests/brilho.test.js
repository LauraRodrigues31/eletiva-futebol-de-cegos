import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/config.js';
import { brilhoDaFase, comprimentoContorno, pontoNoContorno, trechosNoTempo } from '../src/logic/brilho.js';

const B = CONFIG.brilhoTraves;
const GOL = CONFIG.gol;
const TOTAL = comprimentoContorno(GOL);
const perto = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
const igualPonto = (p, x, y) => assert.ok(perto(p.x, x) && perto(p.y, y), `(${p.x}, ${p.y}) ≠ (${x}, ${y})`);
const tempoDaFrente = (d) => (d / (TOTAL + B.comprimento)) * B.duracao;
const tamanho = ({ de, ate }) => Math.hypot(ate.x - de.x, ate.y - de.y);

test('o contorno tem as duas traves e o travessão', () => {
  assert.ok(perto(TOTAL, 2 * GOL.altura + GOL.largura));
});

test('o caminho sobe a trave esquerda, atravessa o travessão e desce a direita', () => {
  const meia = GOL.largura / 2;
  const { altura, largura } = GOL;
  igualPonto(pontoNoContorno(0, GOL), -meia, 0);
  igualPonto(pontoNoContorno(altura / 2, GOL), -meia, altura / 2);
  igualPonto(pontoNoContorno(altura, GOL), -meia, altura);
  igualPonto(pontoNoContorno(altura + largura / 2, GOL), 0, altura);
  igualPonto(pontoNoContorno(altura + largura, GOL), meia, altura);
  igualPonto(pontoNoContorno(TOTAL, GOL), meia, 0);
});

test('distâncias fora do contorno ficam presas nas pontas', () => {
  igualPonto(pontoNoContorno(-5, GOL), -GOL.largura / 2, 0);
  igualPonto(pontoNoContorno(999, GOL), GOL.largura / 2, 0);
});

test('fora da passagem não há trecho até o próximo ciclo', () => {
  for (const t of [B.duracao, (B.duracao + B.intervalo) / 2, B.intervalo - 1]) {
    assert.deepEqual(trechosNoTempo(t, B, GOL), [], `t=${t}`);
  }
});

test('a passagem recomeça a cada intervalo', () => {
  for (const t of [50, 300, 600]) {
    assert.deepEqual(trechosNoTempo(t, B, GOL), trechosNoTempo(t + B.intervalo * 3, B, GOL));
  }
});

test('no meio de uma barra, o trecho fica só nela e tem o comprimento configurado', () => {
  const t = tempoDaFrente(GOL.altura + GOL.largura / 2 + B.comprimento / 2);
  const trechos = trechosNoTempo(t, B, GOL);
  assert.equal(trechos.length, 1);
  assert.equal(trechos[0].barra, 'travessao');
  assert.ok(perto(tamanho(trechos[0]), B.comprimento, 1e-6));
  assert.ok(trechos[0].ate.x > trechos[0].de.x);
});

test('no canto, o trecho se divide entre a trave e o travessão sem perder comprimento', () => {
  const t = tempoDaFrente(GOL.altura + B.comprimento / 2);
  const trechos = trechosNoTempo(t, B, GOL);
  assert.deepEqual(trechos.map((x) => x.barra), ['esquerda', 'travessao']);
  const soma = trechos.reduce((s, x) => s + tamanho(x), 0);
  assert.ok(perto(soma, B.comprimento, 1e-6));
});

test('o trecho entra pela base da trave esquerda e sai pela base da direita', () => {
  const comeco = trechosNoTempo(tempoDaFrente(0.2), B, GOL);
  assert.equal(comeco[0].barra, 'esquerda');
  igualPonto(comeco[0].de, -GOL.largura / 2, 0);

  const saindo = trechosNoTempo(tempoDaFrente(TOTAL + 0.2), B, GOL);
  assert.equal(saindo.length, 1);
  assert.equal(saindo[0].barra, 'direita');
  igualPonto(saindo[0].ate, GOL.largura / 2, 0);
});

test('por padrão só o tutorial tem brilho, e cada fase define a opacidade', () => {
  assert.deepEqual(brilhoDaFase('tutorial', CONFIG), { ativa: true, opacidade: B.fases.tutorial.opacidade });
  assert.equal(brilhoDaFase('fase2', CONFIG).ativa, false);
  assert.equal(brilhoDaFase('resultado', CONFIG).ativa, false);
  const config = { brilhoTraves: { fases: { fase3: { ativa: true, opacidade: 0.4 } } } };
  assert.deepEqual(brilhoDaFase('fase3', config), { ativa: true, opacidade: 0.4 });
});
