// Área de jogo e mapeamento físico → virtual.
// Funções puras: recebem a configuração e não dependem do A-Frame.
//
// Sistema de coordenadas: origem no centro da área, no chão.
// x = lados, z = frente/trás, e o gol fica em -z (à frente de quem começa na marca).

/** Limites da área física, em metros. */
export function limitesArea(config) {
  const meiaLargura = config.area.largura / 2;
  const meiaProfundidade = config.area.profundidade / 2;
  return {
    minX: -meiaLargura,
    maxX: meiaLargura,
    minZ: -meiaProfundidade,
    maxZ: meiaProfundidade,
  };
}

/**
 * Diz se (x, z) está dentro da área.
 * `margem` positiva encolhe a área (ex.: 0,3 = precisa estar a 0,3 m da borda).
 * A borda conta como dentro.
 */
export function dentroDaArea(pos, config, margem = 0) {
  const { minX, maxX, minZ, maxZ } = limitesArea(config);
  return (
    pos.x >= minX + margem &&
    pos.x <= maxX - margem &&
    pos.z >= minZ + margem &&
    pos.z <= maxZ - margem
  );
}

/**
 * Atualiza o estado "dentro"/"fora" com histerese.
 * - dentro → fora quando sai da área encolhida pela margem de aviso;
 * - fora → dentro só quando entra mais `histerese` metros.
 * Devolve { estado, evento }, com evento 'exit', 'enter' ou null.
 */
export function atualizarArea(estadoAtual, pos, config) {
  const { margemAviso, histerese } = config.area;
  if (estadoAtual === 'dentro') {
    return dentroDaArea(pos, config, margemAviso)
      ? { estado: 'dentro', evento: null }
      : { estado: 'fora', evento: 'exit' };
  }
  return dentroDaArea(pos, config, margemAviso + histerese)
    ? { estado: 'dentro', evento: 'enter' }
    : { estado: 'fora', evento: null };
}

/** Converte uma posição física (metros reais) para o mundo virtual. */
export function fisicoParaVirtual(pos, config) {
  const e = config.escala;
  return { x: pos.x * e, y: pos.y ?? 0, z: pos.z * e };
}

/** Converte uma posição do mundo virtual para metros reais. */
export function virtualParaFisico(pos, config) {
  const e = config.escala;
  return { x: pos.x / e, y: pos.y ?? 0, z: pos.z / e };
}

/** Centro da linha do gol, em coordenadas virtuais. */
export function posicaoGol(config) {
  const { minZ } = limitesArea(config);
  const fisico = { x: 0, y: 0, z: minZ - config.gol.distanciaDaArea };
  return fisicoParaVirtual(fisico, config);
}
