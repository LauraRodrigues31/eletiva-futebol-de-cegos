const SEM_ONDAS = Object.freeze({ ativa: false, opacidade: 0 });

export function efeitoDaFase(fases, estado) {
  const fase = fases?.[estado];
  if (!fase || !fase.ativa) return SEM_ONDAS;
  const opacidade = Math.min(1, Math.max(0, fase.opacidade ?? 1));
  return { ativa: true, opacidade };
}

export function ondasDaFase(estado, config) {
  return efeitoDaFase(config.ondas?.fases, estado);
}

export function arcosNoTempo(tempoMs, { periodo, arcos, raioInicial, raioFinal, entrada }) {
  const base = tempoMs / periodo;
  const lista = [];
  for (let i = 0; i < arcos; i++) {
    const bruta = (base + i / arcos) % 1;
    const fase = bruta < 0 ? bruta + 1 : bruta;
    const acender = entrada > 0 ? Math.min(1, fase / entrada) : 1;
    lista.push({
      raio: raioInicial + (raioFinal - raioInicial) * fase,
      opacidade: acender * (1 - fase),
    });
  }
  return lista;
}
