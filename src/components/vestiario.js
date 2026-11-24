import { CONFIG } from '../config.js';
import { EVENTS } from '../events.js';
import { ESTADOS } from '../logic/state-machine.js';
import { layoutCabines, textoInstrucao, comprimentoBanco } from '../logic/vestiario.js';
import {
  texturaCamisa,
  texturaLadrilho,
  texturaTexto,
  texturaQuadroTatico,
} from '../visual/canvas.js';

const CORES_CHUTEIRA = ['#d62828', '#1d3557', '#111111', '#111111', '#2a9d8f'];

const RAIO_PADRAO = {
  left: {
    origin: { x: 0.0065, y: -0.0186, z: -0.05 },
    direction: { x: 0.12394785839500175, y: -0.5944043672340157, z: -0.7945567170519814 },
  },
  right: {
    origin: { x: -0.0065, y: -0.0186, z: -0.05 },
    direction: { x: -0.12394785839500175, y: -0.5944043672340157, z: -0.7945567170519814 },
  },
};

const MAOS = [
  { seletor: '#mao-esquerda', lado: 'left' },
  { seletor: '#mao-direita', lado: 'right' },
];

export function criarMalhaVenda(cor) {
  const material = new THREE.MeshLambertMaterial({ color: cor });
  const grupo = new THREE.Group();
  const laco = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.011, 8, 32), material);
  laco.scale.set(1.25, 1, 1);
  laco.rotation.x = -Math.PI / 2;
  laco.position.y = 0.011;
  const tapaOlho = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.016, 0.05), material);
  tapaOlho.position.set(0, 0.012, 0.085);
  grupo.add(laco, tapaOlho);
  return grupo;
}

AFRAME.registerComponent('vestiario', {
  init() {
    this.cena = this.el.sceneEl;
    this.ativo = false;
    this.raios = { ...RAIO_PADRAO };
    this.cabines = layoutCabines(CONFIG);

    this.materiais = this.criarMateriais();
    this.decor = new THREE.Group();
    this.montarSala();
    for (const cabine of this.cabines) this.montarCabine(cabine);
    this.montarBanco();
    this.montarDecoracao();
    this.marcador = this.montarMarcador();
    this.el.setObject3D('decor', this.decor);

    this.vendas = this.cabines.map((c) => this.criarVenda(c));
    this.vendaDoJogador = this.vendas[CONFIG.vestiario.cabines.doJogador];

    for (const { seletor, lado } of MAOS) {
      document.querySelector(seletor)?.addEventListener('controllermodelready', (e) => {
        if (e.detail?.rayOrigin) this.raios[lado] = e.detail.rayOrigin;
        if (this.ativo && this.cena.is('vr-mode')) this.ligarMaos();
      });
    }

    this.el.setAttribute('visible', false);

    this.aoMudarEstado = (e) => this.reagirAoEstado(e.detail.to);
    this.aoPegarVenda = () => {
      this.marcador.visible = false;
      setTimeout(() => this.desligarApontadores(), 0);
    };
    this.aoEntrarVR = () => this.ativo && this.ligarMaos();
    this.aoSairVR = () => this.desligarMaos();
    this.cena.addEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);
    this.el.addEventListener('venda-pegando', this.aoPegarVenda);
    this.cena.addEventListener('enter-vr', this.aoEntrarVR);
    this.cena.addEventListener('exit-vr', this.aoSairVR);
  },

  remove() {
    this.cena.removeEventListener(EVENTS.STATE_CHANGE, this.aoMudarEstado);
    this.el.removeEventListener('venda-pegando', this.aoPegarVenda);
    this.cena.removeEventListener('enter-vr', this.aoEntrarVR);
    this.cena.removeEventListener('exit-vr', this.aoSairVR);
    this.desligarApontadores();
    this.el.removeObject3D('decor');
  },

  reagirAoEstado(estado) {
    const entrou = estado === ESTADOS.VESTIARIO;
    this.ativo = entrou;
    this.el.setAttribute('visible', entrou);
    for (const id of ['#campo', '#gol', '#area']) {
      document.querySelector(id)?.setAttribute('visible', !entrou);
    }

    const instrucoes = document.querySelector('#instrucoes')?.components.instrucoes;
    if (entrou) {
      this.marcador.visible = true;
      for (const v of this.vendas) v.setAttribute('visible', true);
      this.comVendaDoJogador((venda) => venda.ativar());
      instrucoes?.mostrar(textoInstrucao('ir'));
      this.ligarApontadores();
    } else {
      this.comVendaDoJogador((venda) => venda.desativar());
      instrucoes?.esconder();
      this.desligarApontadores();
    }
  },

  comVendaDoJogador(fn) {
    const el = this.vendaDoJogador;
    const comp = el.components['venda-interativa'];
    if (comp) fn(comp);
    else el.addEventListener('loaded', () => fn(el.components['venda-interativa']), { once: true });
  },

  ligarApontadores() {
    this.cena.setAttribute('raycaster', { objects: '.clicavel', far: 30 });
    this.cena.setAttribute('cursor', { rayOrigin: 'mouse', fuse: false });
    if (this.cena.is('vr-mode')) this.ligarMaos();
  },

  ligarMaos() {
    for (const { seletor, lado } of MAOS) {
      const mao = document.querySelector(seletor);
      if (!mao) continue;
      const raio = this.raios[lado];
      mao.setAttribute('raycaster', {
        objects: '.clicavel',
        far: 5,
        showLine: true,
        lineColor: CONFIG.vestiario.cores.destaque,
        lineOpacity: 0.9,
        origin: raio.origin,
        direction: raio.direction,
      });
      mao.setAttribute('cursor', {
        rayOrigin: 'entity',
        fuse: false,
        downEvents: ['triggerdown'],
        upEvents: ['triggerup'],
      });
    }
  },

  desligarMaos() {
    for (const { seletor } of MAOS) {
      const mao = document.querySelector(seletor);
      if (!mao) continue;
      mao.removeAttribute('cursor');
      mao.removeAttribute('raycaster');
      mao.removeAttribute('line');
    }
  },

  desligarApontadores() {
    this.cena.removeAttribute('cursor');
    this.cena.removeAttribute('raycaster');
    this.desligarMaos();
  },

  criarMateriais() {
    const c = CONFIG.vestiario.cores;
    const { sala } = CONFIG.vestiario;
    const lambert = (color) => new THREE.MeshLambertMaterial({ color });
    return {
      chao: new THREE.MeshLambertMaterial({
        map: texturaLadrilho({
          cor: c.chao,
          repetir: { x: (sala.maxX - sala.minX) / 0.6, y: (sala.maxZ - sala.minZ) / 0.6 },
        }),
      }),
      parede: lambert(c.parede),
      teto: lambert(c.teto),
      rodape: lambert('#4a4f55'),
      madeira: lambert(c.madeira),
      madeiraEscura: lambert('#5e3b22'),
      metal: lambert('#b8bcc2'),
      branco: lambert('#f4f4f4'),
      luz: new THREE.MeshBasicMaterial({ color: '#fffbe8' }),
      destaque: new THREE.MeshBasicMaterial({ color: c.destaque, transparent: true }),
    };
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

  montarSala() {
    const { minX, maxX, minZ, maxZ, altura } = CONFIG.vestiario.sala;
    const M = this.materiais;
    const largura = maxX - minX;
    const prof = maxZ - minZ;
    const cx = (minX + maxX) / 2;
    const cz = (minZ + maxZ) / 2;
    const meio = Math.PI / 2;

    this.plano(this.decor, M.chao, [largura, prof], [cx, 0, cz], [-meio]);
    this.plano(this.decor, M.teto, [largura, prof], [cx, altura, cz], [meio]);
    this.plano(this.decor, M.parede, [largura, altura], [cx, altura / 2, minZ]);
    this.plano(this.decor, M.parede, [largura, altura], [cx, altura / 2, maxZ], [0, Math.PI]);
    this.plano(this.decor, M.parede, [prof, altura], [minX, altura / 2, cz], [0, meio]);
    this.plano(this.decor, M.parede, [prof, altura], [maxX, altura / 2, cz], [0, -meio]);

    const r = 0.1;
    this.caixa(this.decor, M.rodape, [largura, r, 0.02], [cx, r / 2, maxZ - 0.01]);
    this.caixa(this.decor, M.rodape, [0.02, r, prof], [minX + 0.01, r / 2, cz]);
    this.caixa(this.decor, M.rodape, [0.02, r, prof], [maxX - 0.01, r / 2, cz]);

    for (const z of [-1.2, 1.2]) {
      this.caixa(this.decor, M.luz, [1.8, 0.03, 0.22], [cx, altura - 0.02, z]);
    }

    const luz = new THREE.HemisphereLight('#fff8ec', '#5a5f66', 0.9);
    luz.position.set(0, altura, 0);
    this.decor.add(luz);
  },

  montarCabine(cabine) {
    const { largura: w, altura: h, profundidade: d } = CONFIG.vestiario.cabines;
    const cores = CONFIG.vestiario.cores;
    const M = this.materiais;
    const g = new THREE.Group();
    g.position.set(cabine.x, 0, cabine.z);

    this.caixa(g, M.madeiraEscura, [w, h, 0.02], [0, h / 2, 0.01]);
    for (const lado of [-1, 1]) {
      this.caixa(g, M.madeira, [0.03, h, d], [(lado * w) / 2, h / 2, d / 2]);
    }
    this.caixa(g, M.madeira, [w, 0.03, d], [0, h, d / 2]);
    this.caixa(g, M.madeira, [w, 0.1, d], [0, 0.05, d / 2]);
    this.caixa(g, M.madeira, [w, 0.025, d], [0, h - 0.22, d / 2]);

    const yBarra = h - 0.32;
    const zCabide = d * 0.45;
    const barra = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, w - 0.04, 8), M.metal);
    barra.position.set(0, yBarra, zCabide);
    barra.rotation.z = Math.PI / 2;
    g.add(barra);
    this.caixa(g, M.metal, [0.008, 0.08, 0.008], [0, yBarra - 0.04, zCabide]);
    this.caixa(g, M.metal, [0.38, 0.012, 0.012], [0, yBarra - 0.09, zCabide]);

    const camisa = new THREE.MeshLambertMaterial({
      map: texturaCamisa({
        numero: cabine.numero,
        nome: cabine.nome,
        cor: cores.camisa,
        corNumero: cores.numeroCamisa,
      }),
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    });
    this.plano(g, camisa, [0.58, 0.58], [0, yBarra - 0.09 - 0.27, zCabide + 0.01]);

    const textoPlaca = cabine.ehDoJogador ? `${cabine.numero} · ${cabine.nome}` : String(cabine.numero);
    const placa = texturaTexto(512, 128, {
      texto: textoPlaca,
      tamanhoFonte: 76,
      peso: 800,
      cor: cabine.ehDoJogador ? '#111111' : '#f4f4f4',
      fundo: cabine.ehDoJogador ? cores.destaque : '#2b2f35',
      opacidadeFundo: 1,
    });
    this.plano(g, new THREE.MeshBasicMaterial({ map: placa.textura, transparent: true }), [0.4, 0.1], [0, h - 0.08, d + 0.003]);

    const cor = cabine.ehDoJogador ? '#111111' : CORES_CHUTEIRA[cabine.indice % CORES_CHUTEIRA.length];
    for (const lado of [-1, 1]) {
      const chuteira = this.criarChuteira(cor, cabine.ehDoJogador ? cores.destaque : '#f4f4f4');
      chuteira.position.set(lado * 0.075, 0.1, d - 0.17);
      chuteira.rotation.y = lado * -0.12;
      g.add(chuteira);
    }

    if (cabine.ehDoJogador) {
      this.ledJogador = this.caixa(g, M.destaque, [w - 0.06, 0.02, 0.02], [0, h - 0.16, d - 0.01]);
    }

    this.decor.add(g);
  },

  criarChuteira(cor, corDetalhe) {
    const M = this.materiais;
    const corpo = new THREE.MeshLambertMaterial({ color: cor });
    const detalhe = new THREE.MeshLambertMaterial({ color: corDetalhe });
    const g = new THREE.Group();
    this.caixa(g, M.branco, [0.09, 0.025, 0.27], [0, 0.0125, 0]);
    this.caixa(g, corpo, [0.085, 0.07, 0.17], [0, 0.06, -0.045]);
    this.caixa(g, corpo, [0.08, 0.045, 0.1], [0, 0.047, 0.085]);
    this.caixa(g, detalhe, [0.087, 0.012, 0.1], [0, 0.07, -0.03]);
    this.caixa(g, M.branco, [0.04, 0.006, 0.07], [0, 0.098, 0.0]);
    return g;
  },

  montarBanco() {
    const { banco } = CONFIG.vestiario;
    const M = this.materiais;
    const comprimento = comprimentoBanco(CONFIG);
    this.caixa(this.decor, M.madeira, [comprimento, 0.05, banco.profundidade], [0, banco.altura - 0.025, banco.z]);
    const alturaPe = banco.altura - 0.05;
    for (const x of [-comprimento / 2 + 0.12, 0, comprimento / 2 - 0.12]) {
      this.caixa(this.decor, M.metal, [0.05, alturaPe, banco.profundidade - 0.08], [x, alturaPe / 2, banco.z]);
    }
  },

  montarDecoracao() {
    const { minX, maxX } = CONFIG.vestiario.sala;
    const M = this.materiais;
    const meio = Math.PI / 2;

    this.caixa(this.decor, M.metal, [0.03, 1.0, 1.9], [minX + 0.015, 1.55, 0.2]);
    this.plano(
      this.decor,
      new THREE.MeshLambertMaterial({ map: texturaQuadroTatico() }),
      [1.8, 0.9],
      [minX + 0.032, 1.55, 0.2],
      [0, meio],
    );

    this.caixa(this.decor, M.madeiraEscura, [0.05, 2.1, 1.0], [maxX - 0.025, 1.05, 0.6]);
    this.caixa(this.decor, M.metal, [0.04, 0.03, 0.14], [maxX - 0.07, 1.0, 0.25]);
    const placa = texturaTexto(512, 128, {
      texto: 'CAMPO →',
      tamanhoFonte: 72,
      peso: 800,
      cor: '#ffffff',
      fundo: '#1f6b3a',
      opacidadeFundo: 1,
    });
    this.plano(
      this.decor,
      new THREE.MeshBasicMaterial({ map: placa.textura, transparent: true }),
      [0.5, 0.125],
      [maxX - 0.055, 2.3, 0.6],
      [0, -meio],
    );
  },

  montarMarcador() {
    const { posVenda } = this.cabines[CONFIG.vestiario.cabines.doJogador];
    const cor = CONFIG.vestiario.cores.destaque;
    const g = new THREE.Group();
    g.position.set(posVenda.x, posVenda.y, posVenda.z);

    this.anel = new THREE.Mesh(
      new THREE.RingGeometry(0.15, 0.19, 48),
      new THREE.MeshBasicMaterial({ color: cor, transparent: true, depthWrite: false }),
    );
    this.anel.rotation.x = -Math.PI / 2;
    this.anel.position.y = 0.004;

    this.seta = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.1, 16), new THREE.MeshBasicMaterial({ color: cor }));
    this.seta.rotation.x = Math.PI;

    const textura = texturaTexto(512, 128, {
      texto: 'SUA VENDA',
      tamanhoFonte: 70,
      peso: 800,
      cor: '#111111',
      fundo: cor,
      opacidadeFundo: 1,
    }).textura;
    const placa = new THREE.Mesh(
      new THREE.PlaneGeometry(0.32, 0.08),
      new THREE.MeshBasicMaterial({ map: textura, transparent: true }),
    );
    placa.position.y = 0.52;

    g.add(this.anel, this.seta, placa);
    this.decor.add(g);
    return g;
  },

  criarVenda(cabine) {
    const el = document.createElement('a-entity');
    el.setAttribute('position', cabine.posVenda);
    el.setObject3D('mesh', criarMalhaVenda(CONFIG.vestiario.cores.venda));
    if (cabine.ehDoJogador) el.setAttribute('venda-interativa', { inicio: cabine.posVenda });
    this.el.appendChild(el);
    return el;
  },

  tick(tempo) {
    if (!this.ativo) return;
    const pulso = 0.5 + 0.5 * Math.sin(tempo / 300);
    this.anel.material.opacity = 0.35 + 0.55 * pulso;
    this.anel.scale.setScalar(1 + 0.12 * pulso);
    this.seta.position.y = 0.32 + 0.04 * Math.sin(tempo / 400);
    if (this.ledJogador) this.ledJogador.material.opacity = 0.5 + 0.5 * pulso;
  },
});
