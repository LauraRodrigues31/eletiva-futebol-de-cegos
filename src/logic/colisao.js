function limitar(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function penetracaoCaixa(pos, raio, c) {
  const px = limitar(pos.x, c.minX, c.maxX);
  const pz = limitar(pos.z, c.minZ, c.maxZ);
  const dx = pos.x - px;
  const dz = pos.z - pz;
  const d = Math.sqrt(dx * dx + dz * dz);
  if (d > 0) {
    if (d >= raio) return null;
    return { profundidade: raio - d, nx: dx / d, nz: dz / d };
  }
  const lados = [
    { dist: pos.x - c.minX, nx: -1, nz: 0 },
    { dist: c.maxX - pos.x, nx: 1, nz: 0 },
    { dist: pos.z - c.minZ, nx: 0, nz: -1 },
    { dist: c.maxZ - pos.z, nx: 0, nz: 1 },
  ];
  const menor = lados.reduce((a, b) => (b.dist < a.dist ? b : a));
  return { profundidade: menor.dist + raio, nx: menor.nx, nz: menor.nz };
}

function penetracaoLimites(pos, raio, l) {
  const saidas = [
    { profundidade: l.minX + raio - pos.x, nx: 1, nz: 0 },
    { profundidade: pos.x - (l.maxX - raio), nx: -1, nz: 0 },
    { profundidade: l.minZ + raio - pos.z, nx: 0, nz: 1 },
    { profundidade: pos.z - (l.maxZ - raio), nx: 0, nz: -1 },
  ];
  return saidas.filter((s) => s.profundidade > 0);
}

function todasPenetracoes(pos, raio, { caixas = [], limites = null }) {
  const lista = [];
  for (const c of caixas) {
    const p = penetracaoCaixa(pos, raio, c);
    if (p) lista.push(p);
  }
  if (limites) lista.push(...penetracaoLimites(pos, raio, limites));
  return lista;
}

export function resolverColisao(pos, raio, colisores, iteracoes = 4) {
  let x = pos.x;
  let z = pos.z;
  let colidiu = false;
  for (let i = 0; i < iteracoes; i++) {
    const lista = todasPenetracoes({ x, z }, raio, colisores);
    if (lista.length === 0) break;
    colidiu = true;
    for (const p of lista) {
      x += p.nx * p.profundidade;
      z += p.nz * p.profundidade;
    }
  }
  return { x, z, colidiu };
}

export function penetracaoMaxima(pos, raio, colisores) {
  return todasPenetracoes(pos, raio, colisores).reduce((m, p) => Math.max(m, p.profundidade), 0);
}
