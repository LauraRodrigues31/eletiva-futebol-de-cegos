import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  limitesCampo,
  larguraAreaGoleiro,
  marcacoesCampo,
  bandasLaterais,
  linhasDosTercos,
  posicoesPessoas,
  bancosEMesa,
  degrausArquibancada,
  assentosTorcida,
  criarSorteio,
  olharPara,
} from '../src/logic/estadio.js';
import { posicaoGol, dentroDaArea } from '../src/logic/area.js';
import { CONFIG } from '../src/config.js';

const perto = (a, b) => Math.abs(a - b) < 1e-6;

test('gol com a medida oficial da IBSA', () => {
  assert.equal(CONFIG.gol.largura, 3.66);
  assert.equal(CONFIG.gol.altura, 2.14);
});

test('campo de 40 × 20 começando na linha do gol da frente', () => {
  const c = limitesCampo(CONFIG);
  assert.equal(c.minZ, posicaoGol(CONFIG).z);
  assert.ok(perto(c.maxZ - c.minZ, 40));
  assert.ok(perto(c.maxX - c.minX, 20));
  assert.ok(perto(c.centroZ, (c.minZ + c.maxZ) / 2));
});

test('área do goleiro: 1 m além de cada trave, 5,82 m de largura', () => {
  assert.equal(larguraAreaGoleiro(CONFIG), 5.82);
});

test('marcas do pênalti a 6 m e a 8 m de cada linha do gol', () => {
  const { pontos, limites } = marcacoesCampo(CONFIG);
  const distancias = (tipo) =>
    pontos
      .filter((p) => p.tipo === tipo)
      .map((p) => Math.min(Math.abs(p.z - limites.minZ), Math.abs(p.z - limites.maxZ)));
  assert.deepEqual(distancias('penalti'), [6, 6]);
  assert.deepEqual(distancias('segundoPenalti'), [8, 8]);
  assert.equal(pontos.filter((p) => p.tipo === 'centro').length, 1);
});

test('área de pênalti: quartos de círculo de 6 m centrados nas traves, voltados para o campo', () => {
  const { arcos, limites } = marcacoesCampo(CONFIG);
  const quartos = arcos.filter((a) => a.raio === CONFIG.estadio.areaPenalti.raio);
  assert.equal(quartos.length, 4);
  for (const a of quartos) {
    assert.ok(perto(Math.abs(a.centro.x), CONFIG.gol.largura / 2));
    assert.ok(perto(a.fim - a.inicio, Math.PI / 2));
    const meio = (a.inicio + a.fim) / 2;
    const px = a.centro.x + Math.cos(meio) * a.raio;
    const pz = a.centro.z + Math.sin(meio) * a.raio;
    assert.ok(pz > limites.minZ && pz < limites.maxZ, 'arco aponta para dentro do campo');
    assert.ok(Math.sign(px) === Math.sign(a.centro.x), 'arco abre para o lado da trave');
  }
});

test('todas as marcações ficam dentro do campo', () => {
  const { segmentos, pontos, limites: c } = marcacoesCampo(CONFIG);
  const dentro = (p) => p.x >= c.minX - 1e-9 && p.x <= c.maxX + 1e-9 && p.z >= c.minZ - 1e-9 && p.z <= c.maxZ + 1e-9;
  for (const s of segmentos) assert.ok(dentro(s.a) && dentro(s.b));
  for (const p of pontos) assert.ok(dentro(p));
});

test('terços de 12 / 16 / 12 m', () => {
  const c = limitesCampo(CONFIG);
  const [a, b] = linhasDosTercos(CONFIG);
  assert.ok(perto(a - c.minZ, 12));
  assert.ok(perto(b - a, 16));
  assert.ok(perto(c.maxZ - b, 12));
});

test('bandas cobrem as duas laterais inteiras, do lado de fora do campo', () => {
  const c = limitesCampo(CONFIG);
  const bandas = bandasLaterais(CONFIG);
  assert.equal(bandas.length, 2);
  for (const b of bandas) {
    assert.equal(b.minZ, c.minZ);
    assert.equal(b.maxZ, c.maxZ);
    assert.ok(Math.abs(b.x) > c.maxX);
    assert.equal(b.altura, 1);
  }
});

test('nenhuma pessoa dentro da área de jogo 3 × 3', () => {
  for (const p of posicoesPessoas(CONFIG)) {
    assert.ok(!dentroDaArea(p, CONFIG, -0.5), `${p.papel} em (${p.x}, ${p.z})`);
  }
});

test('goleiro da frente fica na área do goleiro, mas fora do vão do gol', () => {
  const c = limitesCampo(CONFIG);
  const goleiro = posicoesPessoas(CONFIG).find((p) => p.papel === 'goleiro' && Math.abs(p.z - c.minZ) < 3);
  assert.ok(goleiro);
  assert.ok(Math.abs(goleiro.x) > CONFIG.gol.largura / 2 + 2 * CONFIG.gol.raioTrave);
  assert.ok(Math.abs(goleiro.x) <= larguraAreaGoleiro(CONFIG) / 2);
  assert.ok(goleiro.z > c.minZ && goleiro.z <= c.minZ + CONFIG.estadio.areaGoleiro.profundidade);
});

test('um chamador atrás de cada gol, fora do campo', () => {
  const c = limitesCampo(CONFIG);
  const chamadores = posicoesPessoas(CONFIG).filter((p) => p.papel === 'chamador');
  assert.equal(chamadores.length, 2);
  assert.ok(chamadores.some((p) => p.z < c.minZ));
  assert.ok(chamadores.some((p) => p.z > c.maxZ));
  for (const p of chamadores) assert.equal(p.x, 0);
});

test('técnicos fora da banda, no terço do meio', () => {
  const c = limitesCampo(CONFIG);
  const [a, b] = linhasDosTercos(CONFIG);
  const tecnicos = posicoesPessoas(CONFIG).filter((p) => p.papel === 'tecnico');
  assert.equal(tecnicos.length, 2);
  for (const t of tecnicos) {
    assert.ok(t.x < c.minX);
    assert.ok(t.z > a && t.z < b);
  }
});

test('reservas sentados e vendados, um grupo por banco', () => {
  const reservas = posicoesPessoas(CONFIG).filter((p) => p.papel === 'reserva');
  assert.equal(reservas.length, 2 * CONFIG.estadio.pessoas.reservasPorBanco);
  for (const r of reservas) {
    assert.equal(r.pose, 'sentado');
    assert.equal(r.venda, true);
  }
  assert.equal(bancosEMesa(CONFIG).filter((b) => b.tipo === 'banco').length, 2);
});

test('olharPara: rotação em y que aponta o +z local para o alvo', () => {
  const rot = olharPara({ x: 0, z: 0 }, { x: 1, z: 0 });
  assert.ok(perto(Math.sin(rot), 1) && perto(Math.cos(rot), 0));
});

test('arquibancada em degraus que sobem para longe do campo', () => {
  const degraus = degrausArquibancada(CONFIG);
  const direita = degraus.filter((d) => d.setor === 'direita').sort((a, b) => a.fileira - b.fileira);
  assert.equal(direita.length, CONFIG.estadio.arquibancada.fileirasLaterais);
  for (let i = 1; i < direita.length; i++) {
    assert.ok(direita[i].topo > direita[i - 1].topo);
    assert.ok(direita[i].centro.x > direita[i - 1].centro.x);
  }
});

test('torcida fora do campo, do entorno e da faixa dos bancos', () => {
  const c = limitesCampo(CONFIG);
  const { lateral, fundo } = CONFIG.estadio.entorno;
  const assentos = assentosTorcida(CONFIG);
  assert.ok(assentos.length > 800, `só ${assentos.length} torcedores`);
  for (const a of assentos) {
    const foraLateral = a.x <= c.minX - lateral || a.x >= c.maxX + lateral;
    const foraFundo = a.z <= c.minZ - fundo || a.z >= c.maxZ + fundo;
    assert.ok(foraLateral || foraFundo, `assento em (${a.x}, ${a.z})`);
    assert.ok(a.y > 0);
  }
});

test('mesma semente, mesma torcida; semente diferente, torcida diferente', () => {
  assert.deepEqual(assentosTorcida(CONFIG, 7), assentosTorcida(CONFIG, 7));
  assert.notDeepEqual(assentosTorcida(CONFIG, 7), assentosTorcida(CONFIG, 8));
});

test('sorteio fica entre 0 e 1', () => {
  const sortear = criarSorteio(1);
  for (let i = 0; i < 1000; i++) {
    const v = sortear();
    assert.ok(v >= 0 && v < 1);
  }
});
