import { texturaTexto } from './canvas.js';

export const TONS_PELE = ['#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#5c3a1e'];
const CABELO = '#1b1410';
const SAPATO = '#151515';

const ALTURA_PERNA = 0.85;
const ALTURA_TRONCO = 0.6;
const ALTURA_ASSENTO = 0.47;

export function criarKitPessoas() {
  const geometrias = new Map();
  const materiais = new Map();
  const texturas = [];

  const cache = (mapa, chave, criar) => {
    if (!mapa.has(chave)) mapa.set(chave, criar());
    return mapa.get(chave);
  };
  const caixa = (w, h, d) => cache(geometrias, `c${w}|${h}|${d}`, () => new THREE.BoxGeometry(w, h, d));
  const esfera = (r) => cache(geometrias, `e${r}`, () => new THREE.SphereGeometry(r, 12, 8));
  const material = (cor) => cache(materiais, cor, () => new THREE.MeshLambertMaterial({ color: cor }));

  const parte = (pai, tamanho, cor, [x, y, z]) => {
    const m = new THREE.Mesh(caixa(...tamanho), material(cor));
    m.position.set(x, y, z);
    pai.add(m);
    return m;
  };

  function rotulo(texto, cor) {
    return cache(materiais, `rotulo|${texto}|${cor}`, () => {
      const { textura } = texturaTexto(256, 128, {
        texto,
        tamanhoFonte: 72,
        peso: 900,
        cor: '#111111',
        fundo: cor,
        opacidadeFundo: 1,
      });
      texturas.push(textura);
      return new THREE.MeshBasicMaterial({ map: textura });
    });
  }

  function braco(pai, lado, y, abertura, cor, corMao) {
    const ombro = new THREE.Group();
    ombro.position.set(lado * 0.27, y, 0);
    ombro.rotation.z = lado * abertura;
    parte(ombro, [0.11, 0.56, 0.12], cor, [0, -0.28, 0]);
    parte(ombro, [0.1, 0.1, 0.1], corMao, [0, -0.6, 0]);
    pai.add(ombro);
  }

  function criar({
    camisa,
    calca,
    pele,
    pose = 'em-pe',
    venda = false,
    protetor = false,
    colete = null,
    textoColete = '',
    luvas = null,
  }) {
    const g = new THREE.Group();
    const sentado = pose === 'sentado';
    const base = sentado ? ALTURA_ASSENTO : ALTURA_PERNA;
    const abertura = pose === 'goleiro' ? 0.55 : 0.06;
    const afastamento = pose === 'goleiro' ? 0.13 : 0.09;

    for (const lado of [-1, 1]) {
      const x = lado * afastamento;
      if (sentado) {
        parte(g, [0.15, 0.15, 0.46], calca, [x, base, 0.2]);
        parte(g, [0.14, base, 0.14], calca, [x, base / 2, 0.42]);
        parte(g, [0.13, 0.06, 0.24], SAPATO, [x, 0.03, 0.48]);
      } else {
        parte(g, [0.15, ALTURA_PERNA, 0.16], calca, [x, ALTURA_PERNA / 2, 0]);
        parte(g, [0.13, 0.06, 0.24], SAPATO, [x, 0.03, 0.04]);
      }
    }

    const yTronco = base + ALTURA_TRONCO / 2;
    parte(g, [0.42, ALTURA_TRONCO, 0.24], camisa, [0, yTronco, 0]);
    if (colete) {
      parte(g, [0.44, 0.5, 0.26], colete, [0, yTronco + 0.02, 0]);
      if (textoColete) {
        const placa = rotulo(textoColete, colete);
        for (const sentido of [1, -1]) {
          const p = new THREE.Mesh(caixa(0.3, 0.15, 0.002), placa);
          p.position.set(0, yTronco + 0.06, sentido * 0.132);
          if (sentido < 0) p.rotation.y = Math.PI;
          g.add(p);
        }
      }
    }

    const yOmbro = base + ALTURA_TRONCO - 0.04;
    for (const lado of [-1, 1]) braco(g, lado, yOmbro, sentado ? 0.02 : abertura, camisa, luvas ?? pele);

    const yCabeca = base + ALTURA_TRONCO + 0.17;
    parte(g, [0.1, 0.06, 0.1], pele, [0, base + ALTURA_TRONCO + 0.03, 0]);
    const cabeca = new THREE.Mesh(esfera(0.12), material(pele));
    cabeca.position.set(0, yCabeca, 0);
    g.add(cabeca);
    const cabelo = new THREE.Mesh(esfera(0.125), material(CABELO));
    cabelo.position.set(0, yCabeca + 0.04, -0.015);
    cabelo.scale.set(1, 0.7, 1);
    g.add(cabelo);

    if (venda) parte(g, [0.255, 0.055, 0.255], '#0b0b0b', [0, yCabeca + 0.01, 0]);
    if (protetor) parte(g, [0.26, 0.05, 0.26], '#3a3f47', [0, yCabeca + 0.08, 0]);

    return g;
  }

  function descartar() {
    for (const geo of geometrias.values()) geo.dispose();
    for (const mat of materiais.values()) mat.dispose();
    for (const t of texturas) t.dispose();
    geometrias.clear();
    materiais.clear();
    texturas.length = 0;
  }

  return { criar, descartar };
}
