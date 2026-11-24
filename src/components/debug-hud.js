// Painel de debug preso à visão e atalhos para avançar estados.
// Uso: <a-entity id="camera" camera ... debug-hud>. Só faz algo com ?debug=1.
import { CONFIG } from '../config.js';
import { DEBUG, VERSAO } from '../debug.js';
import { posicaoCabeca } from '../head.js';

AFRAME.registerComponent('debug-hud', {
  init() {
    if (!DEBUG) return;
    this.cena = this.el.sceneEl;
    this.pos = new THREE.Vector3();

    // Painel: fundo escuro + texto, no canto superior esquerdo da visão.
    this.painel = document.createElement('a-entity');
    this.painel.setAttribute('position', '-0.22 0.12 -0.6');
    this.painel.setAttribute('geometry', 'primitive: plane; width: 0.36; height: 0.2');
    this.painel.setAttribute('material', 'color: #000; opacity: 0.6; transparent: true; shader: flat');
    this.texto = document.createElement('a-entity');
    this.texto.setAttribute('position', '-0.17 0.09 0.001');
    this.texto.setAttribute('text', {
      value: '',
      color: '#7CFC9A',
      width: 0.34,
      wrapCount: 30,
      anchor: 'left',
      baseline: 'top',
    });
    this.painel.appendChild(this.texto);
    this.el.appendChild(this.painel);

    // Desktop: tecla N avança o estado.
    this.aoTeclar = (e) => {
      if (e.code === 'KeyN' && !e.repeat) this.avancar();
    };
    window.addEventListener('keydown', this.aoTeclar);

    // Quest: botão B do controle direito avança o estado.
    this.maoDireita = document.querySelector('#mao-direita');
    this.aoBotaoB = () => this.avancar();
    this.maoDireita?.addEventListener('bbuttondown', this.aoBotaoB);

    this.tick = AFRAME.utils.throttleTick(this.atualizar, CONFIG.intervalos.debugHud, this);
    console.log(`[debug] modo debug ligado, versão ${VERSAO}. Tecla N (ou botão B) avança o estado.`);
  },

  avancar() {
    this.cena.systems['game-state'].avancarDebug();
  },

  atualizar() {
    const jogo = this.cena.systems['game-state'];
    const bola = document.querySelector('#bola')?.components?.ball;
    const area = this.cena.querySelector('[play-area]')?.components?.['play-area'];
    posicaoCabeca(this.cena, this.pos);

    const linhas = [
      `v${VERSAO}  estado: ${jogo.estadoAtual()}`,
      `tentativa: ${jogo.tentativaAtual()}`,
      `cabeca x:${this.pos.x.toFixed(2)} z:${this.pos.z.toFixed(2)}`,
      `area: ${area ? area.estado : '-'}`,
      bola && bola.ativa
        ? `bola: ${bola.distancia.toFixed(2)} m (${bola.estadoProximidade})`
        : 'bola: inativa',
    ];
    this.texto.setAttribute('text', 'value', linhas.join('\n'));
  },

  remove() {
    if (!DEBUG) return;
    window.removeEventListener('keydown', this.aoTeclar);
    this.maoDireita?.removeEventListener('bbuttondown', this.aoBotaoB);
    this.painel.remove();
  },
});
