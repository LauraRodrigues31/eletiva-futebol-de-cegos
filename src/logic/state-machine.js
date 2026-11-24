// Máquina de estados do jogo (spec, seção 8). Lógica pura, sem A-Frame.

export const ESTADOS = Object.freeze({
  VESTIARIO: 'vestiario',
  ENTRADA_CAMPO: 'entrada-campo',
  TUTORIAL: 'tutorial',
  FIM_TUTORIAL: 'fim-tutorial',
  FASE2: 'fase2',
  FASE3: 'fase3',
  RESULTADO: 'resultado',
});

/** Ordem do jogo. O último volta para o primeiro (reinício). */
export const SEQUENCIA = Object.freeze([
  ESTADOS.VESTIARIO,
  ESTADOS.ENTRADA_CAMPO,
  ESTADOS.TUTORIAL,
  ESTADOS.FIM_TUTORIAL,
  ESTADOS.FASE2,
  ESTADOS.FASE3,
  ESTADOS.RESULTADO,
]);

/** Transições permitidas: estado → lista de destinos. */
export const TRANSICOES = Object.freeze({
  [ESTADOS.VESTIARIO]: [ESTADOS.ENTRADA_CAMPO],
  [ESTADOS.ENTRADA_CAMPO]: [ESTADOS.TUTORIAL],
  [ESTADOS.TUTORIAL]: [ESTADOS.FIM_TUTORIAL],
  [ESTADOS.FIM_TUTORIAL]: [ESTADOS.FASE2],
  [ESTADOS.FASE2]: [ESTADOS.FASE3],
  [ESTADOS.FASE3]: [ESTADOS.RESULTADO],
  [ESTADOS.RESULTADO]: [ESTADOS.VESTIARIO],
});

/**
 * Eventos que provocam transição: evento → { estado de origem: destino }.
 * O fim das tentativas (tutorial → fim-tutorial, fase2 → fase3, fase3 → resultado)
 * é decidido pelo ciclo de tentativas (quinta 26/11), não por evento externo.
 */
export const GATILHOS = Object.freeze({
  'blindfold-on': { [ESTADOS.VESTIARIO]: ESTADOS.ENTRADA_CAMPO },
  'field-entered': { [ESTADOS.ENTRADA_CAMPO]: ESTADOS.TUTORIAL },
  continue: {
    [ESTADOS.FIM_TUTORIAL]: ESTADOS.FASE2,
    [ESTADOS.RESULTADO]: ESTADOS.VESTIARIO,
  },
});

/** Estados em que a pessoa joga (tem bola e tentativas). */
export const FASES_JOGAVEIS = Object.freeze([ESTADOS.TUTORIAL, ESTADOS.FASE2, ESTADOS.FASE3]);

export function estadoValido(nome) {
  return SEQUENCIA.includes(nome);
}

export function ehFaseJogavel(nome) {
  return FASES_JOGAVEIS.includes(nome);
}

export function estadoInicial() {
  return { estado: ESTADOS.VESTIARIO, tentativa: 0 };
}

export function podeIr(de, para) {
  return (TRANSICOES[de] ?? []).includes(para);
}

/** Dados ao entrar em um estado: tentativa 1 nas fases jogáveis, 0 nas outras. */
export function entrarEm(estado) {
  return { estado, tentativa: ehFaseJogavel(estado) ? 1 : 0 };
}

/**
 * Tenta ir de `dados.estado` para `para`.
 * Devolve { ok: true, dados: novosDados } ou { ok: false, dados } (sem mudança).
 */
export function transicionar(dados, para) {
  if (!podeIr(dados.estado, para)) return { ok: false, dados };
  return { ok: true, dados: entrarEm(para) };
}

/** Destino que um evento provoca a partir do estado atual, ou null se o evento não vale agora. */
export function destinoPorEvento(estado, evento) {
  return GATILHOS[evento]?.[estado] ?? null;
}

/** Próximo estado na sequência (usado pelo modo debug para avançar). */
export function proximoNaSequencia(estado) {
  const i = SEQUENCIA.indexOf(estado);
  if (i === -1) return null;
  return SEQUENCIA[(i + 1) % SEQUENCIA.length];
}
