import { posicaoGol } from './area.js';

const VOLTA = Math.PI * 2;
const QUARTO = Math.PI / 2;

export function limitesCampo(config) {
  const gol = posicaoGol(config);
  const { comprimento, largura } = config.campo;
  return {
    minX: -largura / 2,
    maxX: largura / 2,
    minZ: gol.z,
    maxZ: arredondar(gol.z + comprimento),
    centroZ: arredondar(gol.z + comprimento / 2),
  };
}

export function larguraAreaGoleiro(config) {
  const { largura, raioTrave } = config.gol;
  return arredondar(largura + 4 * raioTrave + 2 * config.estadio.areaGoleiro.alemDaTrave);
}

export function linhasDeFundo(config) {
  const c = limitesCampo(config);
  return [
    { z: c.minZ, sentido: 1 },
    { z: c.maxZ, sentido: -1 },
  ];
}

export function linhasDosTercos(config) {
  return linhasDeFundo(config).map(({ z, sentido }) => arredondar(z + sentido * config.estadio.terco));
}

export function marcacoesCampo(config) {
  const c = limitesCampo(config);
  const e = config.estadio;
  const meioGol = config.gol.largura / 2;
  const meiaAreaGoleiro = larguraAreaGoleiro(config) / 2;
  const segmentos = [];
  const arcos = [];
  const pontos = [];
  const seg = (x1, z1, x2, z2) =>
    segmentos.push({ a: { x: x1, z: arredondar(z1) }, b: { x: x2, z: arredondar(z2) } });

  seg(c.minX, c.minZ, c.maxX, c.minZ);
  seg(c.minX, c.maxZ, c.maxX, c.maxZ);
  seg(c.minX, c.minZ, c.minX, c.maxZ);
  seg(c.maxX, c.minZ, c.maxX, c.maxZ);
  seg(c.minX, c.centroZ, c.maxX, c.centroZ);
  arcos.push({ centro: { x: 0, z: c.centroZ }, raio: e.circuloCentral, inicio: 0, fim: VOLTA });
  pontos.push({ x: 0, z: c.centroZ, tipo: 'centro' });

  for (const { z: linha, sentido } of linhasDeFundo(config)) {
    const fundoGoleiro = linha + sentido * e.areaGoleiro.profundidade;
    seg(-meiaAreaGoleiro, linha, -meiaAreaGoleiro, fundoGoleiro);
    seg(meiaAreaGoleiro, linha, meiaAreaGoleiro, fundoGoleiro);
    seg(-meiaAreaGoleiro, fundoGoleiro, meiaAreaGoleiro, fundoGoleiro);

    const raio = e.areaPenalti.raio;
    seg(-meioGol, linha + sentido * raio, meioGol, linha + sentido * raio);
    const [esquerda, direita] = sentido > 0 ? [[QUARTO, Math.PI], [0, QUARTO]] : [[Math.PI, 3 * QUARTO], [3 * QUARTO, VOLTA]];
    arcos.push({ centro: { x: -meioGol, z: linha }, raio, inicio: esquerda[0], fim: esquerda[1] });
    arcos.push({ centro: { x: meioGol, z: linha }, raio, inicio: direita[0], fim: direita[1] });

    pontos.push({ x: 0, z: arredondar(linha + sentido * e.marcas.penalti), tipo: 'penalti' });
    pontos.push({ x: 0, z: arredondar(linha + sentido * e.marcas.segundoPenalti), tipo: 'segundoPenalti' });
  }

  for (const z of linhasDosTercos(config)) {
    seg(c.minX, z, c.minX + e.linhas.marcaTerco, z);
    seg(c.maxX - e.linhas.marcaTerco, z, c.maxX, z);
  }

  return { limites: c, segmentos, arcos, pontos };
}

export function bandasLaterais(config) {
  const c = limitesCampo(config);
  const { altura, espessura } = config.estadio.banda;
  return [-1, 1].map((lado) => ({
    lado,
    x: arredondar(lado * (c.maxX + espessura / 2)),
    minZ: c.minZ,
    maxZ: c.maxZ,
    altura,
  }));
}

export function olharPara(de, alvo) {
  return Math.atan2(alvo.x - de.x, alvo.z - de.z);
}

export function bancosEMesa(config) {
  const c = limitesCampo(config);
  const { pessoas: p, terco } = config.estadio;
  const x = c.minX - p.afastamentoBanco;
  const comprimento = p.reservasPorBanco * p.espacamentoBanco + p.espacamentoBanco;
  return [
    { tipo: 'banco', time: 'casa', x, z: arredondar(c.minZ + terco + p.avancoTecnico), comprimento },
    { tipo: 'banco', time: 'visitante', x, z: arredondar(c.maxZ - terco - p.avancoTecnico), comprimento },
    { tipo: 'mesa', x, z: c.centroZ, comprimento },
  ];
}

export function posicoesPessoas(config) {
  const c = limitesCampo(config);
  const { pessoas: p, areaGoleiro } = config.estadio;
  const meioGol = config.gol.largura / 2;
  const meiaAreaGoleiro = larguraAreaGoleiro(config) / 2;
  const origem = { x: 0, z: 0 };
  const centro = { x: 0, z: c.centroZ };
  const lista = [];
  const add = (papel, time, x, z, alvo, extra = {}) =>
    lista.push({ papel, time, x: arredondar(x), z: arredondar(z), rotY: olharPara({ x, z }, alvo), pose: 'em-pe', ...extra });

  add('chamador', 'casa', 0, c.minZ - p.distanciaChamador, origem);
  add('chamador', 'visitante', 0, c.maxZ + p.distanciaChamador, centro);
  add('goleiro', 'visitante', (meioGol + meiaAreaGoleiro) / 2, c.minZ + areaGoleiro.profundidade / 2, origem, { pose: 'goleiro' });
  add('goleiro', 'casa', 0, c.maxZ - areaGoleiro.profundidade / 4, centro, { pose: 'goleiro' });

  for (const banco of bancosEMesa(config)) {
    const alvoFrente = { x: 0, z: banco.z };
    if (banco.tipo === 'mesa') {
      add('mesario', null, banco.x, banco.z, alvoFrente, { pose: 'sentado' });
      continue;
    }
    add('tecnico', banco.time, c.minX - p.afastamentoTecnico, banco.z, alvoFrente);
    const inicio = -((p.reservasPorBanco - 1) * p.espacamentoBanco) / 2;
    for (let i = 0; i < p.reservasPorBanco; i++) {
      add('reserva', banco.time, banco.x, banco.z + inicio + i * p.espacamentoBanco, alvoFrente, {
        pose: 'sentado',
        venda: true,
      });
    }
  }

  const [tercoFrente, tercoFundo] = linhasDosTercos(config);
  add('arbitro', null, c.maxX - p.recuoArbitro, tercoFrente + p.avancoArbitro, centro);
  add('arbitro', null, c.minX + p.recuoArbitro, tercoFundo - p.avancoArbitro, centro);
  return lista;
}

export function setoresArquibancada(config) {
  const c = limitesCampo(config);
  const { entorno, arquibancada: a } = config.estadio;
  const zIni = c.minZ - entorno.fundo;
  const zFim = c.maxZ + entorno.fundo;
  const xIni = c.minX - entorno.lateral;
  const xFim = c.maxX + entorno.lateral;
  return [
    { nome: 'direita', eixo: 'z', inicio: c.maxX + entorno.lateral, sentido: 1, de: zIni, ate: zFim, fileiras: a.fileirasLaterais, rotY: -QUARTO },
    { nome: 'esquerda', eixo: 'z', inicio: c.minX - entorno.lateral, sentido: -1, de: zIni, ate: zFim, fileiras: a.fileirasLaterais, rotY: QUARTO },
    { nome: 'frente', eixo: 'x', inicio: zIni, sentido: -1, de: xIni, ate: xFim, fileiras: a.fileirasFundo, rotY: 0 },
    { nome: 'fundo', eixo: 'x', inicio: zFim, sentido: 1, de: xIni, ate: xFim, fileiras: a.fileirasFundo, rotY: Math.PI },
  ];
}

export function degrausArquibancada(config) {
  const { alturaDegrau: h, profundidadeDegrau: d } = config.estadio.arquibancada;
  const degraus = [];
  for (const s of setoresArquibancada(config)) {
    const comprimento = s.ate - s.de;
    const meio = (s.de + s.ate) / 2;
    for (let r = 0; r < s.fileiras; r++) {
      const profundo = s.inicio + s.sentido * (r * d + d / 2);
      const topo = arredondar((r + 1) * h);
      const [x, z, tx, tz] = s.eixo === 'z' ? [profundo, meio, d, comprimento] : [meio, profundo, comprimento, d];
      degraus.push({
        setor: s.nome,
        fileira: r,
        centro: { x: arredondar(x), y: topo / 2, z: arredondar(z) },
        tamanho: { x: tx, y: topo, z: tz },
        topo,
      });
    }
  }
  return degraus;
}

export function criarSorteio(semente) {
  let s = semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function assentosTorcida(config, semente = config.estadio.arquibancada.semente) {
  const { alturaDegrau: h, profundidadeDegrau: d, espacamento, ocupacao } = config.estadio.arquibancada;
  const sortear = criarSorteio(semente);
  const assentos = [];
  for (const s of setoresArquibancada(config)) {
    const quantidade = Math.floor((s.ate - s.de) / espacamento);
    for (let r = 0; r < s.fileiras; r++) {
      const profundo = s.inicio + s.sentido * (r * d + d / 2);
      for (let i = 0; i < quantidade; i++) {
        if (sortear() >= ocupacao) continue;
        const ao = s.de + (i + 0.5) * espacamento + (sortear() - 0.5) * espacamento * 0.3;
        const fundo = profundo + (sortear() - 0.5) * d * 0.2;
        const [x, z] = s.eixo === 'z' ? [fundo, ao] : [ao, fundo];
        assentos.push({
          x: arredondar(x),
          y: arredondar((r + 1) * h),
          z: arredondar(z),
          rotY: s.rotY + (sortear() - 0.5) * 0.5,
          tom: sortear(),
          pele: sortear(),
          escala: 0.9 + sortear() * 0.2,
        });
      }
    }
  }
  return assentos;
}

export function posicoesTorres(config) {
  const c = limitesCampo(config);
  const { entorno, arquibancada: a } = config.estadio;
  const x = c.maxX + entorno.lateral + a.fileirasLaterais * a.profundidadeDegrau + 1;
  const zFrente = c.minZ - entorno.fundo - a.fileirasFundo * a.profundidadeDegrau - 1;
  const zFundo = c.maxZ + entorno.fundo + a.fileirasFundo * a.profundidadeDegrau + 1;
  const centro = { x: 0, z: c.centroZ };
  return [
    [-x, zFrente],
    [x, zFrente],
    [-x, zFundo],
    [x, zFundo],
  ].map(([tx, tz]) => ({ x: arredondar(tx), z: arredondar(tz), rotY: olharPara({ x: tx, z: tz }, centro) }));
}

function arredondar(n) {
  return Math.round(n * 1000) / 1000;
}
