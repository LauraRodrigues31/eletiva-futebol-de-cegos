import { CONFIG } from '../config.js';
import { EVENTS } from '../events.js';
import { ESTADOS } from '../logic/state-machine.js';
import {
  limitesCampo,
  marcacoesCampo,
  bandasLaterais,
  linhasDeFundo,
  linhasDosTercos,
  posicoesPessoas,
  bancosEMesa,
  degrausArquibancada,
  assentosTorcida,
  posicoesTorres,
} from '../logic/estadio.js';
import { texturaCampo, texturaBanda, texturaRede, texturaCeu } from '../visual/canvas.js';
import { criarKitPessoas, TONS_PELE } from '../visual/pessoa.js';

const CAMISAS_TORCIDA = [
  '#f2c230', '#f2c230', '#f2c230', '#1f6b3a', '#1f6b3a', '#ffffff',
  '#2a5bb0', '#d62828', '#111111', '#e8e8e8', '#7a3fb0', '#ff7a00',
];
const CELULA_REDE = 0.12;
const CELULA_ALAMBRADO = 0.3;
const COMPRIMENTO_PAINEL = 8;
const TEXTO_BANDA = 'FUTEBOL DE CEGOS  ·  PENEIRA';
const RAIO_CEU = 250;

AFRAME.registerComponent('estadio', {
  init() {
    this.cena = this.el.sceneEl;
    this.limites = limitesCampo(CONFIG);
    this.kit = criarKitPessoas();
    this.lambert = new Map();
    this.decor = new THREE.Group();

    this.montarAmbiente();
    this.montarGramado();
    this.montarBandas();
    this.montarGols();
    this.montarAlambrados();
    this.montarArquibancadas();
    this.montarTorcida();
    this.montarBancos();
    this.montarPessoas();
    this.montarTorres();

    this.el.setObject3D('estadio', this.decor);
    this.el.setAttribute('visible', false);

    this.aoMudarEstado = (e) => this.el.setAttribute('visible', e.detail.to !== ESTADOS.VESTIARIO);
    this.cena.addEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);
  },

  remove() {
    this.cena.removeEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);
    const vistos = new Set();
    this.decor.traverse((o) => {
      for (const recurso of [o.geometry, ...[].concat(o.material ?? [])]) {
        if (!recurso || vistos.has(recurso)) continue;
        vistos.add(recurso);
        recurso.map?.dispose();
        recurso.dispose();
      }
    });
    this.kit.descartar();
    this.el.removeObject3D('estadio');
  },

  material(cor) {
    if (!this.lambert.has(cor)) this.lambert.set(cor, new THREE.MeshLambertMaterial({ color: cor }));
    return this.lambert.get(cor);
  },

  caixa(pai, material, [w, h, d], [x, y, z]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    m.position.set(x, y, z);
    pai.add(m);
    return m;
  },

  plano(pai, material, [w, h], [x, y, z], [rx = 0, ry = 0, rz = 0] = []) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    pai.add(m);
    return m;
  },

  cilindro(pai, material, raio, altura, [x, y, z], [rx = 0, ry = 0, rz = 0] = []) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(raio, raio, altura, 12), material);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    pai.add(m);
    return m;
  },

  montarAmbiente() {
    const c = this.limites;
    const { cores, entorno } = CONFIG.estadio;
    const meio = Math.PI / 2;

    const ceu = new THREE.Mesh(
      new THREE.SphereGeometry(RAIO_CEU, 32, 16),
      new THREE.MeshBasicMaterial({ map: texturaCeu(), side: THREE.BackSide, depthWrite: false, fog: false }),
    );
    ceu.position.set(0, 0, c.centroZ);
    ceu.renderOrder = -1;
    this.decor.add(ceu);

    this.plano(this.decor, this.material(cores.chao), [RAIO_CEU * 2, RAIO_CEU * 2], [0, -0.1, c.centroZ], [-meio]);
    const largura = c.maxX - c.minX + entorno.lateral * 2;
    const comprimento = c.maxZ - c.minZ + entorno.fundo * 2;
    this.plano(this.decor, this.material(cores.entorno), [largura, comprimento], [0, -0.05, c.centroZ], [-meio]);

    const ceuLuz = new THREE.HemisphereLight('#c9d6ff', '#20301f', 0.55);
    ceuLuz.position.set(0, 30, c.centroZ);
    this.decor.add(ceuLuz);
    const refletor = new THREE.DirectionalLight('#fff4dc', 0.5);
    refletor.position.set(12, 30, c.centroZ - 10);
    refletor.target.position.set(0, 0, c.centroZ);
    this.decor.add(refletor, refletor.target);
  },

  montarGramado() {
    const marcacoes = marcacoesCampo(CONFIG);
    const { linhas, marcas, cores } = CONFIG.estadio;
    const c = this.limites;
    const material = new THREE.MeshLambertMaterial({
      map: texturaCampo(marcacoes, {
        espessura: linhas.espessura,
        raioMarca: marcas.raio,
        faixa: linhas.faixaGrama,
        cores,
      }),
    });
    this.plano(this.decor, material, [c.maxX - c.minX, c.maxZ - c.minZ], [0, 0, c.centroZ], [-Math.PI / 2]);
  },

  montarBandas() {
    const { banda, cores } = CONFIG.estadio;
    const tercos = linhasDosTercos(CONFIG);
    const comprimento = this.limites.maxZ - this.limites.minZ;
    const painel = new THREE.MeshLambertMaterial({
      map: texturaBanda({
        texto: TEXTO_BANDA,
        cor: cores.banda,
        corDetalhe: cores.bandaDetalhe,
        repetir: { x: comprimento / COMPRIMENTO_PAINEL, y: 1 },
      }),
    });
    const liso = this.material(cores.banda);
    const faces = [painel, painel, liso, liso, liso, liso];
    const detalhe = this.material(cores.bandaDetalhe);
    const topo = this.material('#0f1f45');

    for (const b of bandasLaterais(CONFIG)) {
      const g = new THREE.Group();
      g.position.set(b.x, 0, (b.minZ + b.maxZ) / 2);
      g.rotation.z = -b.lado * banda.inclinacao;
      this.caixa(g, faces, [banda.espessura, b.altura, b.maxZ - b.minZ], [0, b.altura / 2, 0]);
      this.caixa(g, topo, [banda.espessura + 0.04, 0.04, b.maxZ - b.minZ], [0, b.altura, 0]);
      for (const z of tercos) {
        this.caixa(g, detalhe, [banda.espessura + 0.01, b.altura, 0.12], [0, b.altura / 2, z - g.position.z]);
      }
      this.decor.add(g);
    }
  },

  materialRede(celula) {
    return new THREE.MeshBasicMaterial({
      map: texturaRede({ repetir: { x: 1 / celula, y: 1 / celula } }),
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  },

  planoRede(pai, material, [w, h], posicao, rotacao) {
    const m = this.plano(pai, material, [w, h], posicao, rotacao);
    const uv = m.geometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * h);
    uv.needsUpdate = true;
    return m;
  },

  montarGols() {
    const { largura, altura, raioTrave, profundidadeRede: p } = CONFIG.gol;
    const malha = this.materialRede(CELULA_REDE);
    const branco = this.material(CONFIG.estadio.cores.trave);
    const meio = Math.PI / 2;

    for (const { z: linha, sentido } of linhasDeFundo(CONFIG)) {
      const g = new THREE.Group();
      g.position.set(0, 0, linha);
      const fora = -sentido;

      for (const lado of [-1, 1]) {
        this.cilindro(g, branco, raioTrave, altura, [(lado * largura) / 2, altura / 2, 0]);
      }
      this.cilindro(g, branco, raioTrave, largura + raioTrave * 2, [0, altura, 0], [0, 0, meio]);

      this.planoRede(g, malha, [largura, altura], [0, altura / 2, fora * p]);
      this.planoRede(g, malha, [largura, p], [0, altura, (fora * p) / 2], [meio]);
      for (const lado of [-1, 1]) {
        this.planoRede(g, malha, [p, altura], [(lado * largura) / 2, altura / 2, (fora * p) / 2], [0, meio]);
        this.cilindro(g, branco, 0.015, p, [(lado * largura) / 2, 0.015, (fora * p) / 2], [meio]);
        this.cilindro(g, branco, 0.015, altura, [(lado * largura) / 2, altura / 2, fora * p]);
      }
      this.cilindro(g, branco, 0.015, largura, [0, 0.015, fora * p], [0, 0, meio]);
      this.decor.add(g);
    }
  },

  montarAlambrados() {
    const { alambrado, entorno } = CONFIG.estadio;
    const c = this.limites;
    const largura = c.maxX - c.minX + entorno.lateral * 2;
    const malha = this.materialRede(CELULA_ALAMBRADO);
    const poste = this.material('#3a3f47');
    for (const { z: linha, sentido } of linhasDeFundo(CONFIG)) {
      const z = linha - sentido * alambrado.distancia;
      this.planoRede(this.decor, malha, [largura, alambrado.altura], [0, alambrado.altura / 2, z]);
      for (let x = -largura / 2; x <= largura / 2 + 1e-6; x += largura / 6) {
        this.cilindro(this.decor, poste, 0.04, alambrado.altura, [x, alambrado.altura / 2, z]);
      }
    }
  },

  montarArquibancadas() {
    const { cores } = CONFIG.estadio;
    const concreto = this.material(cores.concreto);
    const assento = this.material(cores.assento);
    for (const d of degrausArquibancada(CONFIG)) {
      this.caixa(this.decor, concreto, [d.tamanho.x, d.tamanho.y, d.tamanho.z], [d.centro.x, d.centro.y, d.centro.z]);
      const ao = d.tamanho.x > d.tamanho.z;
      const tira = ao ? [d.tamanho.x, 0.05, d.tamanho.z * 0.45] : [d.tamanho.x * 0.45, 0.05, d.tamanho.z];
      this.caixa(this.decor, assento, tira, [d.centro.x, d.topo + 0.025, d.centro.z]);
    }
  },

  montarTorcida() {
    const assentos = assentosTorcida(CONFIG);
    const corpos = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.42, 0.55, 0.3),
      new THREE.MeshLambertMaterial({ color: '#ffffff' }),
      assentos.length,
    );
    const cabecas = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.11, 8, 6),
      new THREE.MeshLambertMaterial({ color: '#ffffff' }),
      assentos.length,
    );
    const molde = new THREE.Object3D();
    const cor = new THREE.Color();
    assentos.forEach((a, i) => {
      molde.rotation.set(0, a.rotY, 0);
      molde.scale.setScalar(a.escala);
      molde.position.set(a.x, a.y + 0.3 * a.escala, a.z);
      molde.updateMatrix();
      corpos.setMatrixAt(i, molde.matrix);
      corpos.setColorAt(i, cor.set(CAMISAS_TORCIDA[Math.floor(a.tom * CAMISAS_TORCIDA.length)]));
      molde.position.set(a.x, a.y + 0.72 * a.escala, a.z);
      molde.updateMatrix();
      cabecas.setMatrixAt(i, molde.matrix);
      cabecas.setColorAt(i, cor.set(TONS_PELE[Math.floor(a.pele * TONS_PELE.length)]));
    });
    for (const m of [corpos, cabecas]) {
      m.instanceMatrix.needsUpdate = true;
      m.instanceColor.needsUpdate = true;
      m.frustumCulled = false;
      this.decor.add(m);
    }
  },

  montarBancos() {
    const madeira = this.material('#8a5a35');
    const metal = this.material('#b8bcc2');
    const mesa = this.material('#e6e8eb');
    for (const b of bancosEMesa(CONFIG)) {
      if (b.tipo === 'mesa') {
        this.caixa(this.decor, mesa, [0.6, 0.04, b.comprimento], [b.x + 0.5, 0.74, b.z]);
        this.caixa(this.decor, metal, [0.5, 0.72, 0.04], [b.x + 0.5, 0.36, b.z]);
        this.caixa(this.decor, metal, [0.4, 0.45, 0.4], [b.x - 0.05, 0.225, b.z]);
        continue;
      }
      this.caixa(this.decor, madeira, [0.4, 0.05, b.comprimento], [b.x, 0.45, b.z]);
      this.caixa(this.decor, madeira, [0.05, 0.45, b.comprimento], [b.x - 0.22, 0.7, b.z]);
      for (const lado of [-1, 1]) {
        this.caixa(this.decor, metal, [0.35, 0.43, 0.05], [b.x, 0.215, b.z + (lado * (b.comprimento - 0.2)) / 2]);
      }
    }
  },

  montarPessoas() {
    const { cores } = CONFIG.estadio;
    const camisaDoTime = (time) => (time === 'casa' ? cores.timeCasa : cores.timeVisitante);
    const pele = (i) => TONS_PELE[(i * 7 + 2) % TONS_PELE.length];
    const visuais = {
      chamador: (p) => ({ camisa: camisaDoTime(p.time), colete: cores.colete, textoColete: 'GUIA' }),
      goleiro: (p) => ({
        camisa: p.time === 'casa' ? cores.goleiroCasa : cores.goleiroVisitante,
        luvas: '#f4f4f4',
      }),
      tecnico: (p) => ({ camisa: p.time === 'casa' ? cores.tecnico : '#3b3f46' }),
      reserva: (p) => ({ camisa: camisaDoTime(p.time), venda: true, protetor: true }),
      arbitro: () => ({ camisa: cores.arbitro, calca: '#0b0b0b' }),
      mesario: () => ({ camisa: '#5b6470' }),
    };

    posicoesPessoas(CONFIG).forEach((p, i) => {
      const figura = this.kit.criar({
        calca: cores.calca,
        pele: pele(i),
        pose: p.pose,
        ...visuais[p.papel](p),
      });
      figura.position.set(p.x, 0, p.z);
      figura.rotation.y = p.rotY;
      this.decor.add(figura);
    });
  },

  montarTorres() {
    const { torres } = CONFIG.estadio;
    const estrutura = this.material('#4a4f55');
    const luz = new THREE.MeshBasicMaterial({ color: '#fffbe8' });
    for (const t of posicoesTorres(CONFIG)) {
      this.cilindro(this.decor, estrutura, 0.25, torres.altura, [t.x, torres.altura / 2, t.z]);
      const cabeca = new THREE.Group();
      cabeca.position.set(t.x, torres.altura, t.z);
      cabeca.rotation.set(0, t.rotY, 0);
      this.caixa(cabeca, estrutura, [3.2, 2.2, 0.3], [0, 0, -0.1]);
      for (const x of [-1, 0, 1]) {
        for (const y of [-0.5, 0.5]) this.caixa(cabeca, luz, [0.85, 0.85, 0.05], [x * 1, y * 1, 0.08]);
      }
      cabeca.rotateX(0.35);
      this.decor.add(cabeca);
    }
  },
});
