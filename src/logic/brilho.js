import { efeitoDaFase } from './ondas.js';

export const BARRAS = Object.freeze(['esquerda', 'travessao', 'direita']);

export function brilhoDaFase(estado, config) {
  return efeitoDaFase(config.brilhoTraves?.fases, estado);
}

export function comprimentoContorno({ largura, altura }) {
  return 2 * altura + largura;
}

export function pontoNoContorno(distancia, { largura, altura }) {
  const total = comprimentoContorno({ largura, altura });
  const d = Math.min(total, Math.max(0, distancia));
  const meia = largura / 2;
  if (d <= altura) return { x: -meia, y: d };
  if (d <= altura + largura) return { x: -meia + (d - altura), y: altura };
  return { x: meia, y: altura - (d - altura - largura) };
}

export function trechosNoTempo(tempoMs, { intervalo, duracao, comprimento }, gol) {
  const total = comprimentoContorno(gol);
  const ciclo = ((tempoMs % intervalo) + intervalo) % intervalo;
  if (ciclo >= duracao) return [];

  const frente = (ciclo / duracao) * (total + comprimento);
  const inicio = Math.max(0, frente - comprimento);
  const fim = Math.min(total, frente);
  const limites = [0, gol.altura, gol.altura + gol.largura, total];

  const trechos = [];
  BARRAS.forEach((barra, i) => {
    const de = Math.max(inicio, limites[i]);
    const ate = Math.min(fim, limites[i + 1]);
    if (ate - de > 1e-9) {
      trechos.push({ barra, de: pontoNoContorno(de, gol), ate: pontoNoContorno(ate, gol) });
    }
  });
  return trechos;
}
