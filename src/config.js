// Configuração central do jogo.
// Todo número ajustável mora aqui: nenhum componente deve ter número mágico.
// Unidades: metros, segundos (m/s) e milissegundos.

export const CONFIG = {
  // Área física livre onde a pessoa anda. O centro é a origem (0, 0, 0).
  area: {
    largura: 3, // eixo x
    profundidade: 3, // eixo z
    margemAviso: 0.3, // avisa quando a cabeça chega a menos disso da borda
    histerese: 0.1, // só volta a "dentro" depois de entrar mais isso (evita pisca-pisca)
  },

  // Escala física → virtual. 1 = tamanho real.
  escala: 1,

  // Gol (medidas oficiais do futebol de 5: 3 m × 2 m).
  gol: {
    largura: 3,
    altura: 2,
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
    raio: 0.1, // ~62 cm de circunferência
    raioAlcance: 0.5, // "alcançou" a menos de 0,5 m (PRD)
    raioSaida: 0.7, // só volta a "longe" acima de 0,7 m (histerese)
    posicaoTutorial: { x: 0, z: -1 },
    velocidadeFase3: 0.3, // m/s (usado em 01/12)
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

  // Intervalos de checagem (ms).
  intervalos: {
    proximidade: 50,
    area: 100,
    debugHud: 200,
    mira: 100,
  },

  debug: false, // também pode ser ligado com ?debug=1 na URL
};
