// Painel de debug preso à visão, linha de mira do chute e atalhos.
// Uso: <a-entity id="camera" camera ... debug-hud>. Só faz algo com ?debug=1.
//
// Atalhos:
//   N (teclado) / B (controle direito): avança o estado do jogo
//   R (teclado) / A (controle direito): recoloca a bola no lugar de saída
import { CONFIG } from '../config.js';
import { DEBUG, VERSAO } from '../debug.js';
import { posicaoCabeca } from '../head.js';

const COMPRIMENTO_MIRA = 5; // m

AFRAME.registerComponent('debug-hud', {
  init() {
    if (!DEBUG) return;
    this.cena = this.el.sceneEl;
    this.pos = new THREE.Vector3();

    // Painel: fundo escuro + texto, no canto superior esquerdo da visão.
    this.painel = document.createElement('a-entity');
    this.painel.setAttribute('position', '-0.22 0.1 -0.6');
    this.painel.setAttribute('geometry', 'primitive: plane; width: 0.36; height: 0.3');
    this.painel.setAttribute('material', 'color: #000; opacity: 0.6; transparent: true; shader: flat');
    this.texto = document.createElement('a-entity');
    this.texto.setAttribute('position', '-0.17 0.14 0.001');
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

    // Linha de mira: sai da bola na direção em que o chute iria (no mundo, não presa à visão).
    this.mira = document.createElement('a-entity');
    this.mira.setAttribute('line', { start: '0 0 0', end: '0 0 0', color: '#00e5ff', opacity: 0.9 });
    this.mira.setAttribute('visible', false);
    this.cena.appendChild(this.mira);

    // Teclado.
    this.aoTeclar = (e) => {
      if (e.repeat) return;
      if (e.code === 'KeyN') this.avancar();
      if (e.code === 'KeyR') this.recolocarBola();
    };
    window.addEventListener('keydown', this.aoTeclar);

    // Quest: B avança o estado, A recoloca a bola (controle direito).
    this.maoDireita = document.querySelector('#mao-direita');
    this.aoBotaoB = () => this.avancar();
    this.aoBotaoA = () => this.recolocarBola();
    this.maoDireita?.addEventListener('bbuttondown', this.aoBotaoB);
    this.maoDireita?.addEventListener('abuttondown', this.aoBotaoA);

    this.ultimoPainel = 0;
    this.ultimaMira = 0;
    console.log(
      `[debug] modo debug ligado, versão ${VERSAO}. ` +
        'N/B avança o estado, R/A recoloca a bola, espaço/gatilho chuta.'
    );
  },

  tick(t) {
    if (!DEBUG) return;
    if (t - this.ultimoPainel >= CONFIG.intervalos.debugHud) {
      this.ultimoPainel = t;
      this.atualizarPainel();
    }
    if (t - this.ultimaMira >= CONFIG.intervalos.mira) {
      this.ultimaMira = t;
      this.atualizarMira();
    }
  },

  bola() {
    return document.querySelector('#bola')?.components?.ball ?? null;
  },

  avancar() {
    this.cena.systems['game-state'].avancarDebug();
  },

  recolocarBola() {
    this.bola()?.recolocar();
  },

  atualizarPainel() {
    const jogo = this.cena.systems['game-state'];
    const bola = this.bola();
    const area = this.cena.querySelector('[play-area]')?.components?.['play-area'];
    posicaoCabeca(this.cena, this.pos);

    const linhas = [
      `v${VERSAO}  estado: ${jogo.estadoAtual()}`,
      `tentativa: ${jogo.tentativaAtual()}`,
      `cabeca x:${this.pos.x.toFixed(2)} z:${this.pos.z.toFixed(2)}`,
      `area: ${area ? area.estado : '-'}`,
    ];
    if (bola && bola.ativa) {
      // Depois do chute a proximidade fica pausada até a bola ser recolocada.
      const proximidade =
        bola.estadoBola !== 'esperando'
          ? 'pausada'
          : `${Number.isFinite(bola.distancia) ? bola.distancia.toFixed(2) : '-'} m (${bola.estadoProximidade})`;
      linhas.push(
        `bola: ${bola.estadoBola}`,
        `  dist: ${proximidade}`,
        `  vel: ${bola.velocidade().toFixed(1)} m/s`,
        `ultimo: ${bola.ultimoResultado ?? '-'}`
      );
    } else {
      linhas.push('bola: inativa');
    }
    this.texto.setAttribute('text', 'value', linhas.join('\n'));
  },

  // Mostra a mira só quando o chute valeria: bola esperando e perto.
  atualizarMira() {
    const bola = this.bola();
    const kicker = this.cena.querySelector('[kicker]')?.components?.kicker;
    const mostrar =
      bola && kicker && bola.ativa && bola.estadoBola === 'esperando' && bola.estadoProximidade === 'perto';
    this.mira.setAttribute('visible', Boolean(mostrar));
    if (!mostrar) return;

    const p = bola.el.object3D.position;
    const d = kicker.direcaoDoChute(kicker.maoDaMira());
    const y = 0.02;
    this.mira.setAttribute('line', {
      start: { x: p.x, y, z: p.z },
      end: { x: p.x + d.x * COMPRIMENTO_MIRA, y, z: p.z + d.z * COMPRIMENTO_MIRA },
    });
  },

  remove() {
    if (!DEBUG) return;
    window.removeEventListener('keydown', this.aoTeclar);
    this.maoDireita?.removeEventListener('bbuttondown', this.aoBotaoB);
    this.maoDireita?.removeEventListener('abuttondown', this.aoBotaoA);
    this.painel.remove();
    this.mira.remove();
  },
});
