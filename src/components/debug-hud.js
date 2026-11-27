import { CONFIG } from '../config.js';
import { DEBUG, VERSAO } from '../debug.js';
import { posicaoCabeca } from '../head.js';

const COMPRIMENTO_MIRA = 5;

AFRAME.registerComponent('debug-hud', {
  init() {
    if (!DEBUG) return;
    this.cena = this.el.sceneEl;
    this.pos = new THREE.Vector3();

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

    this.mira = document.createElement('a-entity');
    this.mira.setAttribute('line', { start: '0 0 0', end: '0 0 0', color: '#00e5ff', opacity: 0.9 });
    this.mira.setAttribute('visible', false);
    this.cena.appendChild(this.mira);

    this.aoTeclar = (e) => {
      if (e.repeat) return;
      if (e.code === 'KeyN') this.avancar();
    };
    window.addEventListener('keydown', this.aoTeclar);

    this.maoDireita = document.querySelector('#mao-direita');
    this.aoBotaoB = () => this.avancar();
    this.maoDireita?.addEventListener('bbuttondown', this.aoBotaoB);

    this.ultimoPainel = 0;
    this.ultimaMira = 0;
    console.log(
      `[debug] modo debug ligado, versão ${VERSAO}. ` +
        'N/B avança o estado, V/Y liga e desliga a visão. Sempre: R/A recoloca a bola (na pausa, pula para a próxima tentativa); perto da bola, E/grip prepara e clique/espaço/gatilho chuta.'
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

  atualizarPainel() {
    const jogo = this.cena.systems['game-state'];
    const bola = this.bola();
    const area = this.cena.querySelector('[play-area]')?.components?.['play-area'];
    posicaoCabeca(this.cena, this.pos);

    const linhas = [
      `v${VERSAO}  estado: ${jogo.estadoAtual()}`,
      `tentativa: ${this.textoTentativa()}`,
      `placar: ${this.textoPlacar()}`,
      `cabeca x:${this.pos.x.toFixed(2)} z:${this.pos.z.toFixed(2)}`,
      `area: ${area ? area.estado : '-'}`,
      `visao: ${this.textoVisao()}`,
    ];
    if (bola && bola.ativa) {
      const proximidade =
        bola.estadoBola !== 'esperando'
          ? 'pausada'
          : `${Number.isFinite(bola.distancia) ? bola.distancia.toFixed(2) : '-'} m (${bola.estadoProximidade})`;
      linhas.push(
        `bola: ${bola.estadoBola}`,
        `  dist: ${proximidade}`,
        `  vel: ${bola.velocidade().toFixed(1)} m/s`,
        `chute: ${this.textoPreparo()}`,
        `ultimo: ${bola.ultimoResultado ?? '-'}`
      );
    } else {
      linhas.push('bola: inativa');
    }
    this.texto.setAttribute('text', 'value', linhas.join('\n'));
  },

  textoTentativa() {
    const tentativa = this.cena.systems['game-state'].tentativaAtual();
    const ciclo = this.cena.systems.tentativas;
    if (!ciclo || ciclo.ciclo === 'inativo') return String(tentativa);
    const pausa = ciclo.ciclo === 'pausa' ? ` ${(ciclo.restantePausaMs() / 1000).toFixed(1).replace('.', ',')} s` : '';
    return `${tentativa}/${ciclo.total()} (${ciclo.ciclo}${pausa})`;
  },

  textoPlacar() {
    const ciclo = this.cena.systems.tentativas;
    if (!ciclo?.fase) return '-';
    const { gols, tentativas } = ciclo.placar();
    return `${gols} ${gols === 1 ? 'gol' : 'gols'} em ${tentativas}`;
  },

  textoVisao() {
    const venda = document.querySelector('#venda-efeito')?.components?.blindfold;
    if (!venda) return '-';
    return venda.visaoLivre ? 'livre' : 'vendada';
  },

  textoPreparo() {
    const preparado = this.cena.querySelector('[kicker]')?.components?.kicker?.preparado;
    return preparado ? `preparado (${preparado})` : '-';
  },

  atualizarMira() {
    const bola = this.bola();
    const kicker = this.cena.querySelector('[kicker]')?.components?.kicker;
    const mostrar =
      bola &&
      kicker?.preparado &&
      bola.ativa &&
      bola.estadoBola === 'esperando' &&
      bola.estadoProximidade === 'perto';
    this.mira.setAttribute('visible', Boolean(mostrar));
    if (!mostrar) return;

    const p = bola.el.object3D.position;
    const mao = kicker.maoDaMira();
    const alvo = kicker.alvoDoChute(mao);
    const d = kicker.direcaoDoChute(mao);
    const fim = alvo
      ? { ...alvo.ponto, y: Math.max(alvo.ponto.y, 0.02) }
      : { x: p.x + d.x * COMPRIMENTO_MIRA, y: 0.02, z: p.z + d.z * COMPRIMENTO_MIRA };
    this.mira.setAttribute('line', {
      start: { x: p.x, y: p.y, z: p.z },
      end: fim,
    });
  },

  remove() {
    if (!DEBUG) return;
    window.removeEventListener('keydown', this.aoTeclar);
    this.maoDireita?.removeEventListener('bbuttondown', this.aoBotaoB);
    this.painel.remove();
    this.mira.remove();
  },
});
