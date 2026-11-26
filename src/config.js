export const CONFIG = {
  area: {
    largura: 3,
    profundidade: 3,
    margemAviso: 0.3,
    histerese: 0.1,
  },

  escala: 2,

  computador: {
    aceleracaoAndar: 8,
    aceleracaoVestiario: 16,
    aceleracaoDevagar: 3,
  },

  gol: {
    largura: 3.66,
    altura: 2.14,
    raioTrave: 0.04,
    profundidadeRede: 1,
  },

  campo: {
    comprimento: 40,
    largura: 20,
  },

  bola: {
    raio: 0.1,
    raioAlcance: 0.5,
    raioSaida: 0.7,
    posicaoTutorial: { x: 0, z: -1 },
    velocidadeFase3: 0.3,
  },

  chute: {
    maos: 'ambas',
    direcaoPor: 'controle',
    velocidade: 6,
    velocidadeAerea: 14,
    minimoHorizontal: 0.3,
    mira: { alturaMaxima: 6, distanciaSemGol: 6, distanciaMaxima: 30 },
    vibracao: { intensidade: 0.8, duracaoMs: 80 },
    vibracaoPreparo: { intensidade: 0.3, duracaoMs: 40 },
  },

  fisica: {
    desaceleracao: 1.2,
    velocidadeParada: 0.05,
    dtMaximo: 0.05,
    tempoMaximo: 8,
    restituicaoTrave: 0.5,
    restituicaoBanda: 0.6,
    gravidade: 9.81,
    restituicaoChao: 0.45,
    retencaoQuique: 0.8,
    quiqueMinimo: 0.6,
  },

  tentativas: {
    tutorial: 3,
    fase2: 3,
    fase3: 3,
  },

  intervalos: {
    proximidade: 50,
    area: 100,
    debugHud: 200,
    mira: 100,
  },

  debug: false,
  vestiario: {
    sala: {
      minX: -3,
      maxX: 3,
      minZ: -2.4,
      maxZ: 2.6,
      altura: 3,
    },
    cabines: {
      quantidade: 5,
      espacamento: 0.9,
      largura: 0.82,
      altura: 2.1,
      profundidade: 0.5,
      numeros: [7, 3, 9, 10, 5],
      doJogador: 2,
      nomeJogador: 'VOCÊ',
    },
    banco: {
      z: -0.8,
      altura: 0.45,
      profundidade: 0.36,
    },
    alcance: {
      entrar: 0.9,
      sair: 1.1,
    },
    cores: {
      parede: '#c9ced4',
      chao: '#8d949c',
      teto: '#e6e8eb',
      madeira: '#8a5a35',
      camisa: '#f2c230',
      numeroCamisa: '#1f6b3a',
      destaque: '#ffd21f',
      venda: '#0b0b0b',
    },
    intervaloAlcance: 100,
    colisao: {
      raioCabeca: 0.2,
      distanciaEscurecer: 0.15,
    },
  },

  venda: {
    duracaoAproximar: 600,
    duracaoFaixa: 900,
    duracaoFade: 1200,
    pausaNoEscuro: 800,
    visaoLivre: true,
  },

  ondas: {
    periodo: 1600,
    arcos: 3,
    raioInicial: 0.15,
    raioFinal: 0.6,
    abertura: 70,
    espessura: 0.08,
    entrada: 0.15,
    cor: '#7fd8ff',
    ordem: 1002,
    fases: {
      tutorial: { ativa: true, opacidade: 0.9 },
      fase2: { ativa: false, opacidade: 0.9 },
      fase3: { ativa: false, opacidade: 0.9 },
    },
  },

  brilhoTraves: {
    intervalo: 5000,
    duracao: 900,
    comprimento: 1,
    raio: 0.06,
    ordem: 1003,
    fases: {
      tutorial: { ativa: true, opacidade: 1 },
      fase2: { ativa: false, opacidade: 1 },
      fase3: { ativa: false, opacidade: 1 },
    },
  },

  estadio: {
    linhas: { espessura: 0.08, faixaGrama: 4, marcaTerco: 0.5 },
    circuloCentral: 3,
    areaPenalti: { raio: 6 },
    marcas: { penalti: 6, segundoPenalti: 8, raio: 0.1 },
    areaGoleiro: { alemDaTrave: 1, profundidade: 2 },
    terco: 12,
    banda: { altura: 1, espessura: 0.06, inclinacao: 0.08 },
    entorno: { lateral: 5, fundo: 5 },
    alambrado: { distancia: 3.5, altura: 4 },
    arquibancada: {
      fileirasLaterais: 8,
      fileirasFundo: 6,
      alturaDegrau: 0.42,
      profundidadeDegrau: 0.8,
      espacamento: 0.6,
      ocupacao: 0.75,
      semente: 2026,
    },
    pessoas: {
      distanciaChamador: 2,
      afastamentoTecnico: 1.2,
      afastamentoBanco: 2.6,
      reservasPorBanco: 3,
      espacamentoBanco: 0.6,
      avancoTecnico: 4,
      recuoArbitro: 1.5,
      avancoArbitro: 2,
    },
    torres: { altura: 20 },
    cores: {
      gramaClara: '#3f8a4a',
      gramaEscura: '#357a40',
      linha: '#f4f4f4',
      entorno: '#2c4a33',
      chao: '#15201a',
      banda: '#1d3f8f',
      bandaDetalhe: '#ffd21f',
      concreto: '#80868e',
      assento: '#2a5bb0',
      trave: '#f2f2f2',
      timeCasa: '#f2c230',
      timeVisitante: '#d8dde3',
      goleiroCasa: '#e8542e',
      goleiroVisitante: '#7a3fb0',
      tecnico: '#1f6b3a',
      arbitro: '#111111',
      colete: '#ff7a00',
      calca: '#1d2733',
    },
  },
};
