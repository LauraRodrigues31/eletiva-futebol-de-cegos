import { Animador } from '../logic/animador.js';

const DURACAO_FADE = 300;

AFRAME.registerComponent('instrucoes', {
  schema: {
    posicao: { type: 'vec3', default: { x: 0, y: -0.3, z: -1.1 } },
    largura: { type: 'number', default: 1.0 },
    altura: { type: 'number', default: 0.26 },
  },

  init() {
    this.animador = new Animador();
    this.opacidade = 0;

    this.painel = document.createElement('a-entity');
    this.painel.setAttribute('position', this.data.posicao);
    this.painel.setAttribute('painel-texto', {
      texto: '',
      largura: this.data.largura,
      altura: this.data.altura,
      tamanhoFonte: 52,
      fundo: '#0d1b2a',
      opacidadeFundo: 0.8,
      opacidade: 0,
      sobreTudo: true,
      ordem: 1002,
    });
    document.querySelector('#camera').appendChild(this.painel);
  },

  mostrar(texto) {
    if (texto === this.textoAtual && this.opacidade === 1) return;
    this.textoAtual = texto;
    this.painel.setAttribute('painel-texto', 'texto', texto);
    this.fadePara(1);
  },

  esconder() {
    this.textoAtual = null;
    this.fadePara(0);
  },

  fadePara(alvo) {
    this.animador.parar();
    this.animador.animar({
      duracao: DURACAO_FADE,
      de: this.opacidade,
      para: alvo,
      easing: 'saida',
      aoAtualizar: (v) => {
        this.opacidade = v;
        this.painel.setAttribute('painel-texto', 'opacidade', v);
      },
    });
  },

  tick(tempo) {
    this.animador.atualizar(tempo);
  },

  remove() {
    this.painel.remove();
  },
});
