export const ESTADOS = Object.freeze({
  VESTIARIO: 'vestiario',
  ENTRADA_CAMPO: 'entrada-campo',
  TUTORIAL: 'tutorial',
  FIM_TUTORIAL: 'fim-tutorial',
  FASE2: 'fase2',
  FASE3: 'fase3',
  RESULTADO: 'resultado',
});

export const SEQUENCIA = Object.freeze([
  ESTADOS.VESTIARIO,
  ESTADOS.ENTRADA_CAMPO,
  ESTADOS.TUTORIAL,
  ESTADOS.FIM_TUTORIAL,
  ESTADOS.FASE2,
  ESTADOS.FASE3,
  ESTADOS.RESULTADO,
]);

export const TRANSICOES = Object.freeze({
  [ESTADOS.VESTIARIO]: [ESTADOS.ENTRADA_CAMPO],
  [ESTADOS.ENTRADA_CAMPO]: [ESTADOS.TUTORIAL],
  [ESTADOS.TUTORIAL]: [ESTADOS.FIM_TUTORIAL],
  [ESTADOS.FIM_TUTORIAL]: [ESTADOS.FASE2],
  [ESTADOS.FASE2]: [ESTADOS.FASE3],
  [ESTADOS.FASE3]: [ESTADOS.RESULTADO],
  [ESTADOS.RESULTADO]: [ESTADOS.VESTIARIO],
});

export const GATILHOS = Object.freeze({
  'blindfold-on': { [ESTADOS.VESTIARIO]: ESTADOS.ENTRADA_CAMPO },
  'field-entered': { [ESTADOS.ENTRADA_CAMPO]: ESTADOS.TUTORIAL },
  continue: {
    [ESTADOS.FIM_TUTORIAL]: ESTADOS.FASE2,
    [ESTADOS.RESULTADO]: ESTADOS.VESTIARIO,
  },
  'phase-end': {
    [ESTADOS.TUTORIAL]: ESTADOS.FIM_TUTORIAL,
    [ESTADOS.FASE2]: ESTADOS.FASE3,
    [ESTADOS.FASE3]: ESTADOS.RESULTADO,
  },
});

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

export function entrarEm(estado) {
  return { estado, tentativa: ehFaseJogavel(estado) ? 1 : 0 };
}

export function transicionar(dados, para) {
  if (!podeIr(dados.estado, para)) return { ok: false, dados };
  return { ok: true, dados: entrarEm(para) };
}

export function avancarTentativa(dados) {
  if (!ehFaseJogavel(dados.estado)) return dados;
  return { ...dados, tentativa: dados.tentativa + 1 };
}

export function destinoPorEvento(estado, evento) {
  return GATILHOS[evento]?.[estado] ?? null;
}

export function detalheStateChange(from, dados) {
  return {
    from,
    to: dados.estado,
    phase: dados.estado,
    attempt: dados.tentativa,
  };
}

export function proximoNaSequencia(estado) {
  const i = SEQUENCIA.indexOf(estado);
  if (i === -1) return null;
  return SEQUENCIA[(i + 1) % SEQUENCIA.length];
}
