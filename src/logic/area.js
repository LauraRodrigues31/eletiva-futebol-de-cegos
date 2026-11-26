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

export function dentroDaArea(pos, config, margem = 0) {
  const { minX, maxX, minZ, maxZ } = limitesArea(config);
  return (
    pos.x >= minX + margem &&
    pos.x <= maxX - margem &&
    pos.z >= minZ + margem &&
    pos.z <= maxZ - margem
  );
}

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

export function fisicoParaVirtual(pos, config) {
  const e = config.escala;
  return { x: pos.x * e, y: pos.y ?? 0, z: pos.z * e };
}

export function virtualParaFisico(pos, config) {
  const e = config.escala;
  return { x: pos.x / e, y: pos.y ?? 0, z: pos.z / e };
}

export function limitesAreaVirtual(config) {
  const { minX, maxX, minZ, maxZ } = limitesArea(config);
  const e = config.escala;
  return { minX: minX * e, maxX: maxX * e, minZ: minZ * e, maxZ: maxZ * e };
}

export function deslocamentoDoRig(cabecaFisica, escala) {
  return { x: (escala - 1) * cabecaFisica.x, z: (escala - 1) * cabecaFisica.z };
}

export function posicaoMarcaPenalti(config) {
  const { x, z } = config.bola.posicaoTutorial;
  return fisicoParaVirtual({ x, y: 0, z }, config);
}

export function posicaoGol(config) {
  const marca = posicaoMarcaPenalti(config);
  return { x: 0, y: 0, z: marca.z - config.estadio.marcas.penalti };
}
