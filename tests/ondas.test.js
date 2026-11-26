import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/config.js';
import { ondasDaFase, arcosNoTempo } from '../src/logic/ondas.js';

const O = CONFIG.ondas;
const perto = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;

test('há um item por arco configurado', () => {
  assert.equal(arcosNoTempo(0, O).length, O.arcos);
  assert.equal(arcosNoTempo(0, { ...O, arcos: 5 }).length, 5);
});

test('o raio fica sempre entre o inicial e o final', () => {
  for (let t = 0; t < O.periodo * 3; t += 37) {
    for (const { raio } of arcosNoTempo(t, O)) {
      assert.ok(raio >= O.raioInicial - 1e-9 && raio < O.raioFinal + 1e-9, `t=${t} raio=${raio}`);
    }
  }
});

test('em t = 0 o primeiro arco nasce no raio inicial, apagado', () => {
  const [primeiro] = arcosNoTempo(0, O);
  assert.ok(perto(primeiro.raio, O.raioInicial));
  assert.ok(perto(primeiro.opacidade, 0));
});

test('o desenho se repete a cada período (loop)', () => {
  for (const t of [0, 123, 800, 1599]) {
    const a = arcosNoTempo(t, O);
    const b = arcosNoTempo(t + O.periodo * 4, O);
    a.forEach((arco, i) => {
      assert.ok(perto(arco.raio, b[i].raio, 1e-6));
      assert.ok(perto(arco.opacidade, b[i].opacidade, 1e-6));
    });
  }
});

test('os arcos ficam igualmente espaçados no ciclo', () => {
  const passo = (O.raioFinal - O.raioInicial) / O.arcos;
  const raios = arcosNoTempo(0, O).map((a) => a.raio);
  for (let i = 1; i < raios.length; i++) assert.ok(perto(raios[i] - raios[i - 1], passo));
});

test('o arco acende no começo e apaga no fim do ciclo', () => {
  const um = { ...O, arcos: 1 };
  const opacidade = (fase) => arcosNoTempo(fase * O.periodo, um)[0].opacidade;
  assert.ok(perto(opacidade(0), 0));
  assert.ok(opacidade(O.entrada) > 0.8);
  assert.ok(opacidade(0.999) < 0.01);
  assert.ok(opacidade(O.entrada / 2) < opacidade(O.entrada));
});

test('por padrão só o tutorial tem ondas', () => {
  assert.deepEqual(ondasDaFase('tutorial', CONFIG), { ativa: true, opacidade: O.fases.tutorial.opacidade });
  assert.equal(ondasDaFase('fase2', CONFIG).ativa, false);
  assert.equal(ondasDaFase('fase3', CONFIG).ativa, false);
  assert.deepEqual(ondasDaFase('vestiario', CONFIG), { ativa: false, opacidade: 0 });
  assert.deepEqual(ondasDaFase('inexistente', CONFIG), { ativa: false, opacidade: 0 });
});

test('cada fase define se tem ondas e a opacidade, limitada entre 0 e 1', () => {
  const config = {
    ondas: {
      fases: {
        fase2: { ativa: true, opacidade: 0.3 },
        fase3: { ativa: true, opacidade: 4 },
        tutorial: { ativa: true, opacidade: -1 },
      },
    },
  };
  assert.deepEqual(ondasDaFase('fase2', config), { ativa: true, opacidade: 0.3 });
  assert.equal(ondasDaFase('fase3', config).opacidade, 1);
  assert.equal(ondasDaFase('tutorial', config).opacidade, 0);
  assert.equal(ondasDaFase('fase2', {}).ativa, false);
});
