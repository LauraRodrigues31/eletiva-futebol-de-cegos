// Configuração central do jogo.
// Todo número ajustável mora aqui: nenhum componente deve ter número mágico.
// Unidades: metros, segundos (m/s) e milissegundos.

export const CONFIG = {
  area: {
    largura: 3, 
    profundidade: 3, 
    margemAviso: 0.3, 
    histerese: 0.1, 
  },

  // Escala física → virtual. 1 = tamanho real.
  escala: 1,

  gol: {
    largura: 3.66,
    altura: 2.14,
    distanciaDaArea: 3, // da borda frontal da área até a linha do gol
    raioTrave: 0.05,
    profundidadeRede: 1, // até onde a bola vai depois do gol
  },

  // Campo inteiro (futebol de 5: 40 m × 20 m). A bola para ao sair dele.
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
    maos: 'ambas', // 'direita' | 'esquerda' | 'ambas'
    direcaoPor: 'controle', // 'controle' | 'cabeca'
    velocidade: 6, // m/s; força fixa por enquanto
    minimoHorizontal: 0.3, // se o controle aponta quase reto para cima/baixo, usa a cabeça
    vibracao: { intensidade: 0.8, duracaoMs: 80 },
  },

  fisica: {
    desaceleracao: 1.2, // m/s², atrito de rolagem
    velocidadeParada: 0.05, // m/s; abaixo disso, a bola para
    dtMaximo: 0.05, // s; passo máximo por quadro (evita "teleporte" se o navegador travar)
    tempoMaximo: 8, // s; depois disso, a jogada termina
    restituicaoTrave: 0.5, // fração da velocidade que sobra ao bater na trave
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
      numeros: [7, 3, 10, 9, 5], 
      doJogador: 3, 
      nomeJogador: 'VOCÊ',
    },
    banco: {
      z: -1.45, 
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
    opacidadeDebug: 0.5,
    visaoLivre: true,
  },

  estadio: {
    linhas: { espessura: 0.08, faixaGrama: 4, marcaTerco: 0.5 },
    circuloCentral: 3,
    areaPenalti: { raio: 6 },
    marcas: { penalti: 6, segundoPenalti: 8, raio: 0.1 },
    areaGoleiro: { alemDaTrave: 1, profundidade: 2 },
    terco: 12,
    trave: { espessura: 0.08 },
    rede: { profundidade: 1 },
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
