import { atualizarProximidade } from './proximity.js';

export function layoutCabines(config) {
  const { sala, cabines, banco } = config.vestiario;
  const { quantidade, espacamento, numeros, doJogador, nomeJogador } = cabines;
  const inicio = -((quantidade - 1) * espacamento) / 2;

  return Array.from({ length: quantidade }, (_, indice) => {
    const x = arredondar(inicio + indice * espacamento);
    const ehDoJogador = indice === doJogador;
    return {
      indice,
      x,
      z: sala.minZ,
      numero: numeros[indice % numeros.length],
      nome: ehDoJogador ? nomeJogador : '',
      ehDoJogador,
      posVenda: { x, y: banco.altura, z: banco.z },
    };
  });
}

export function cabineDoJogador(config) {
  return layoutCabines(config).find((c) => c.ehDoJogador);
}

export function comprimentoBanco(config) {
  const { quantidade, espacamento } = config.vestiario.cabines;
  return (quantidade - 1) * espacamento + 0.8;
}

export function colisoresVestiario(config) {
  const { sala, cabines, banco } = config.vestiario;
  const caixas = layoutCabines(config).map((c) => ({
    minX: c.x - cabines.largura / 2,
    maxX: c.x + cabines.largura / 2,
    minZ: c.z,
    maxZ: c.z + cabines.profundidade,
    baixo: false,
  }));
  const meioBanco = comprimentoBanco(config) / 2;
  caixas.push({
    minX: -meioBanco,
    maxX: meioBanco,
    minZ: banco.z - banco.profundidade / 2,
    maxZ: banco.z + banco.profundidade / 2,
    baixo: true,
  });
  caixas.push({ minX: sala.maxX - 0.09, maxX: sala.maxX, minZ: 0.1, maxZ: 1.1, baixo: false });
  caixas.push({ minX: sala.minX, maxX: sala.minX + 0.03, minZ: -0.75, maxZ: 1.15, baixo: false });
  const limites = { minX: sala.minX, maxX: sala.maxX, minZ: sala.minZ, maxZ: sala.maxZ };
  return {
    andar: { caixas, limites },
    cabeca: { caixas: caixas.filter((c) => !c.baixo), limites },
  };
}

export function atualizarAlcanceVenda(estadoAtual, distancia, config) {
  const { entrar, sair } = config.vestiario.alcance;
  return atualizarProximidade(estadoAtual, distancia, {
    bola: { raioAlcance: entrar, raioSaida: sair },
  });
}

export const INSTRUCOES = Object.freeze({
  ir: 'Este é o vestiário.\nVá até a sua venda, marcada pela luz amarela.',
  clicar: 'Aponte para a venda e aperte o gatilho.\n(No computador: ponha a mira nela e clique.)',
  longe: 'Chegue mais perto da venda para pegá-la.',
  colocando: 'Colocando a venda…',
});

export function textoInstrucao(etapa) {
  return INSTRUCOES[etapa] ?? '';
}

function arredondar(n) {
  return Math.round(n * 1000) / 1000;
}
