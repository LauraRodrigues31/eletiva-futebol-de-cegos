// Placeholders visuais de orientação: chão do campo e gol.
// Tudo é calculado a partir do config.js. A Anna pode trocar o visual final
// mantendo os ids #campo e #gol.
import { CONFIG } from '../config.js';
import { posicaoGol } from '../logic/area.js';

const COR_CAMPO = '#2f5d3a';
const COR_TRAVE = '#f2f2f2';

function criar(pai, tag, atributos) {
  const el = document.createElement(tag);
  for (const [nome, valor] of Object.entries(atributos)) el.setAttribute(nome, valor);
  pai.appendChild(el);
  return el;
}

AFRAME.registerComponent('field-placeholder', {
  schema: { parte: { type: 'string', oneOf: ['campo', 'gol'] } },

  init() {
    const gol = posicaoGol(CONFIG);
    if (this.data.parte === 'campo') this.montarCampo(gol);
    else this.montarGol(gol);
  },

  // O campo começa na linha do gol e se estende para trás (+z).
  montarCampo(gol) {
    const { comprimento, largura } = CONFIG.campo;
    criar(this.el, 'a-plane', {
      rotation: '-90 0 0',
      width: largura,
      height: comprimento,
      position: `0 0 ${gol.z + comprimento / 2}`,
      color: COR_CAMPO,
    });
  },

  // Duas traves e o travessão, com a linha do gol em z = gol.z.
  montarGol(gol) {
    const { largura, altura, raioTrave } = CONFIG.gol;
    this.el.object3D.position.set(gol.x, 0, gol.z);
    for (const lado of [-1, 1]) {
      criar(this.el, 'a-cylinder', {
        position: `${(lado * largura) / 2} ${altura / 2} 0`,
        radius: raioTrave,
        height: altura,
        color: COR_TRAVE,
      });
    }
    criar(this.el, 'a-cylinder', {
      position: `0 ${altura} 0`,
      rotation: '0 0 90',
      radius: raioTrave,
      height: largura + raioTrave * 2,
      color: COR_TRAVE,
    });
  },
});
