# Contrato de eventos

Os componentes do jogo conversam por **eventos emitidos na cena**. Assim a Laura (jogabilidade e dados) e a Anna (áudio, visual e UX) trabalham em arquivos separados, e uma não precisa conhecer o código da outra.

> Para mudar o nome ou o `detail` de um evento, combine com a outra dev e atualize este arquivo **e** o [`src/events.js`](../src/events.js) no mesmo commit.

## Regras

1. Todo evento é emitido **na cena**: `sceneEl.emit(nome, detalhe)`.
2. Qualquer componente pode ouvir: `sceneEl.addEventListener(nome, (e) => { e.detail ... })`.
3. Use as constantes de `src/events.js` (`EVENTS.BALL_REACHED`) em vez do texto solto.
4. **Posições** são `{ x, y, z }` em metros, no sistema do mundo. **Tempos** são em milissegundos.
5. Origem `(0, 0, 0)` = marca no chão, no centro da área. O gol fica à frente, em `-z`.

## Eventos

| Evento | Quem emite | Quem ouve | `detail` | Quando fica pronto |
|---|---|---|---|---|
| `state-change` | game-state (Laura) | todos | `{ from, to, phase, attempt }` | ter 24/11 |
| `blindfold-on` | venda (Anna) | game-state | `{}` | Anna |
| `field-entered` | transição para o campo (Anna) | game-state | `{}` | Anna |
| `continue` | telas e textos (Anna) | game-state | `{}` | Anna |
| `area-exit` | play-area (Laura) | Anna (aviso sonoro) | `{ position }` | ter 24/11 |
| `area-enter` | play-area (Laura) | Anna | `{ position }` | ter 24/11 |
| `ball-spawned` | ball (Laura) | Anna (guizo, ondas, balão) | `{ position }` | ter 24/11 |
| `ball-reached` | ball (Laura) | game-state, Anna (some o balão) | `{ distance, timeMs }` | ter 24/11 |
| `ball-left` | ball (Laura) | Anna | `{ distance }` | ter 24/11 |
| `kick` | kicker (Laura) | ball, gravador (Anna) | `{ direction, power, position }` | qua 25/11 |
| `goal` | goal (Laura) | game-state, torcida (Anna) | `{ position }` | qua 25/11 |
| `post-hit` | goal (Laura) | Anna (onda na trave) | `{ side: 'left' \| 'right' }` | qua 25/11 |
| `miss` | goal (Laura) | game-state, Anna | `{}` | qua 25/11 |
| `attempt-end` | game-state (Laura) | Anna (tela de resultado) | `{ phase, attempt, result }` | qui 26/11 |
| `phase-end` | game-state (Laura) | Anna (texto de transição) | `{ phase }` | qui 26/11 |

### Detalhes

- **`state-change`**: `from` e `to` são nomes de estado (abaixo). `from` é `null` na primeira emissão, quando a cena carrega. `phase` é igual a `to`. `attempt` é a tentativa atual (1 ao entrar em `tutorial`, `fase2` ou `fase3`; 0 nos outros estados).
- **`ball-reached`**: disparado **uma vez** quando a cabeça fica a menos de 0,5 m da bola (medido no chão, ignorando a altura). `timeMs` é o tempo desde o último `ball-spawned`. Só dispara de novo depois de um `ball-left`.
- **`ball-left`**: disparado **uma vez** quando a cabeça se afasta mais de 0,7 m.
- **`area-exit` / `area-enter`**: `area-exit` dispara quando a cabeça chega a menos de 0,3 m da borda da área; `area-enter` quando volta a mais de 0,4 m. Um evento por travessia, sem repetição.

## Estados do jogo

```
vestiario → entrada-campo → tutorial → fim-tutorial → fase2 → fase3 → resultado → vestiario
```

| Estado | Entra quando | O que acontece |
|---|---|---|
| `vestiario` | início (e reinício) | Pessoa coloca a venda (Anna). |
| `entrada-campo` | `blindfold-on` | Transição e som do estádio (Anna). |
| `tutorial` | `field-entered` | 3 tentativas com pistas visuais. |
| `fim-tutorial` | fim das tentativas do tutorial | Tela "agora vale pontos" (Anna). |
| `fase2` | `continue` | Bola em posição aleatória, sem pistas. |
| `fase3` | fim das tentativas da fase 2 | Bola em movimento. |
| `resultado` | fim das tentativas da fase 3 | Ficha técnica e replay. |
| `vestiario` | `continue` no `resultado` | Reinicia para a próxima pessoa. |

O estado atual pode ser lido a qualquer momento:

```js
const estado = sceneEl.systems['game-state'].estadoAtual(); // 'tutorial'
```

## Entidades com id fixo

| Id | O que é | Observação para a Anna |
|---|---|---|
| `#rig` | Jogador (origem) | — |
| `#camera` | Cabeça do jogador | Para efeitos presos à visão (venda) |
| `#mao-esquerda`, `#mao-direita` | Controles do Quest | Botões e gatilho |
| `#bola` | Bola | **Coloque o guizo aqui** (`sound` posicional): ele acompanha a bola sozinho. O componente `ball` não mexe em som. |
| `#gol` | Gol | Para as ondas nas traves |
| `#campo` | Chão do campo | Pode trocar o visual |
| `#vestiario` | Vestiário | Livre para a Anna |

## Exemplo (Anna)

```js
import { EVENTS } from '../events.js';

AFRAME.registerComponent('balao-bola', {
  init() {
    const cena = this.el.sceneEl;
    cena.addEventListener(EVENTS.BALL_SPAWNED, () => this.el.setAttribute('visible', true));
    cena.addEventListener(EVENTS.BALL_REACHED, () => this.el.setAttribute('visible', false));
  },
});
```

Para avisar o jogo que a venda foi colocada:

```js
this.el.sceneEl.emit(EVENTS.BLINDFOLD_ON);
```
