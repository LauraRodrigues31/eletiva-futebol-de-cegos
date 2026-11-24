import { texturaTexto, desenharTexto } from '../visual/canvas.js';

const PX_POR_METRO = 1024;
const PX_MAXIMO = 2048;

AFRAME.registerComponent('painel-texto', {
  schema: {
    texto: { type: 'string', default: '' },
    largura: { type: 'number', default: 0.8 },
    altura: { type: 'number', default: 0.2 },
    tamanhoFonte: { type: 'number', default: 48 },
    cor: { type: 'color', default: '#ffffff' },
    fundo: { type: 'string', default: '#000000' },
    opacidadeFundo: { type: 'number', default: 0.7 },
    opacidade: { type: 'number', default: 1 },
    sobreTudo: { type: 'boolean', default: false },
    ordem: { type: 'int', default: 1001 },
  },

  update(antigo) {
    const d = this.data;
    const soOpacidade =
      this.malha && Object.keys(d).every((k) => k === 'opacidade' || d[k] === antigo[k]);

    if (!soOpacidade) this.redesenhar(antigo);
    this.malha.material.opacity = d.opacidade;
    this.malha.visible = d.opacidade > 0.001;
  },

  redesenhar(antigo) {
    const d = this.data;
    const pxL = Math.min(PX_MAXIMO, Math.round(d.largura * PX_POR_METRO));
    const pxA = Math.min(PX_MAXIMO, Math.round(d.altura * PX_POR_METRO));
    const opcoes = {
      texto: d.texto,
      tamanhoFonte: d.tamanhoFonte,
      cor: d.cor,
      fundo: d.fundo && d.fundo !== 'nenhum' ? d.fundo : null,
      opacidadeFundo: d.opacidadeFundo,
    };

    const mudouTamanho = !this.malha || d.largura !== antigo.largura || d.altura !== antigo.altura;
    if (mudouTamanho) {
      this.descartar();
      this.info = texturaTexto(pxL, pxA, opcoes);
      const material = new THREE.MeshBasicMaterial({
        map: this.info.textura,
        transparent: true,
        depthWrite: false,
        depthTest: !d.sobreTudo,
      });
      this.malha = new THREE.Mesh(new THREE.PlaneGeometry(d.largura, d.altura), material);
      this.el.setObject3D('mesh', this.malha);
    } else {
      desenharTexto(this.info, opcoes);
      this.info.textura.needsUpdate = true;
      this.malha.material.depthTest = !d.sobreTudo;
    }
    this.malha.renderOrder = d.sobreTudo ? d.ordem : 0;
  },

  descartar() {
    if (!this.malha) return;
    this.el.removeObject3D('mesh');
    this.malha.geometry.dispose();
    this.malha.material.dispose();
    this.info.textura.dispose();
    this.malha = null;
  },

  remove() {
    this.descartar();
  },
});
