export const CONFIG = {
  area: {
    largura: 3, 
    profundidade: 3, 
    margemAviso: 0.3, 
    histerese: 0.1, 
  },

  escala: 1,

  gol: {
    largura: 3,
    altura: 2,
    distanciaDaArea: 3, 
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

  tentativas: {
    tutorial: 3,
    fase2: 3,
    fase3: 3,
  },

  intervalos: {
    proximidade: 50,
    area: 100,
    debugHud: 200,
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
  },
};
