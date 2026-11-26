# Contrato de eventos

Os componentes do jogo conversam por **eventos emitidos na cena**. Assim a Laura (jogabilidade e dados) e a Anna (áudio, visual e UX) trabalham em arquivos separados, e uma não precisa conhecer o código da outra.

> Para mudar o nome ou o `detail` de um evento, combine com a outra dev e atualize este arquivo **e** o [`src/events.js`](../src/events.js) no mesmo commit.

## Regras

1. Todo evento é emitido **na cena**: `sceneEl.emit(nome, detalhe)`.
2. Qualquer componente pode ouvir: `sceneEl.addEventListener(nome, (e) => { e.detail ... })`.
3. Use as constantes de `src/events.js` (`EVENTS.BALL_REACHED`) em vez do texto solto.
4. **Posições** são `{ x, y, z }` em metros, no sistema do mundo. **Tempos** são em milissegundos.
5. Origem `(0, 0, 0)` = marca no chão, no centro da área. O gol fica à frente, em `-z`.
6. **Escala:** no campo, 1 m andado de verdade = `CONFIG.escala` m no mundo (hoje 2). Todas as posições dos eventos estão no mundo. A área de 3 × 3 m reais aparece com 6 × 6 m, mas `area-exit` / `area-enter` usam metros reais, por segurança. No vestiário a escala é 1.

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
| `ball-stopped` | ball (Laura) | game-state, Anna | `{ position }` | qua 25/11 |
| `kick-ready` | kicker | Anna (som de "pronto para chutar") | `{ hand }` | qua 25/11 |
| `kick-cancel` | kicker | Anna | `{ reason }` | qua 25/11 |
| `kick` | kicker (Laura) | ball, gravador (Anna) | `{ direction, power, position, hand, target, velocity }` | qua 25/11 |
| `goal` | ball (Laura) | game-state, torcida (Anna) | `{ position }` | qua 25/11 |
| `post-hit` | ball (Laura) | Anna (onda na trave) | `{ side: 'left' \| 'right' \| 'top', position }` | qua 25/11 |
| `miss` | ball (Laura) | game-state, Anna | `{ reason }` | qua 25/11 |
| `attempt-end` | game-state (Laura) | Anna (tela de resultado) | `{ phase, attempt, result }` | qui 26/11 |
| `phase-end` | game-state (Laura) | Anna (texto de transição) | `{ phase }` | qui 26/11 |

### Detalhes

- **`state-change`**: `from` e `to` são nomes de estado (abaixo). `from` é `null` na primeira emissão, quando a cena carrega. `phase` é igual a `to`. `attempt` é a tentativa atual (1 ao entrar em `tutorial`, `fase2` ou `fase3`; 0 nos outros estados).
- **`ball-reached`**: disparado **uma vez** quando a cabeça fica a menos de 0,5 m da bola (medido no chão, ignorando a altura). `timeMs` é o tempo desde o último `ball-spawned`. Só dispara de novo depois de um `ball-left`.
- **`ball-left`**: disparado **uma vez** quando a cabeça se afasta mais de 0,7 m.
- **`area-exit` / `area-enter`**: `area-exit` dispara quando a cabeça chega a menos de 0,3 m da borda da área; `area-enter` quando volta a mais de 0,4 m. Um evento por travessia, sem repetição.
- **Chute em duas etapas:** perto da bola, a pessoa primeiro **prepara** o chute e depois **chuta**. No Quest, prepara com o **grip** (botão lateral, de qualquer mão), mira com o controle e chuta com o **gatilho**. No computador, prepara com **E**, mira com o mouse (a direção é a da cabeça) e chuta com o **clique esquerdo** (com o mouse travado) ou com a **barra de espaço**. Gatilho, clique ou espaço sem preparar são ignorados.
- **`kick-ready`**: o chute foi preparado. Só acontece numa fase jogável, com a bola parada no lugar e perto. `hand` é `'right'`, `'left'` ou `'keyboard'`. No Quest, o controle dá um pulso fraco de vibração. Preparar de novo enquanto já está preparado não faz nada.
- **`kick-cancel`**: o preparo foi desfeito sem chute. `reason` é `'bola longe'` (veio um `ball-left`), `'bola recolocada'` (veio um `ball-spawned`) ou `'mudou o estado'` (veio um `state-change`). Um `kick` também desfaz o preparo, mas sem `kick-cancel`.
- **`kick`**: o chute só vale com o chute preparado, a bola parada no lugar, perto (depois de um `ball-reached`) e numa fase jogável. `direction` é `{ x, y: 0, z }` com comprimento 1 (no chão). `power` é sempre `1` por enquanto (força fixa). `position` é onde a bola estava. `hand` é a mão que apertou o gatilho (`'right'` ou `'left'`) ou `'keyboard'` (clique ou espaço no computador). Pode ser uma mão diferente da que preparou.
- **Chute em 3D (onde a pessoa mira):** o raio da mira (câmera no computador, controle no Quest) vai até a linha do gol, ou até o chão se bater nele antes. A bola é lançada para passar **exatamente** nesse ponto, com gravidade. Mirando o chão, ela sai rolando (`chute.velocidade`, 6 m/s). Mirando no ar, voa a cerca de `chute.velocidadeAerea` (14 m/s). Depois disso, quica e rola. No computador, aparece uma mira amarela no centro da tela enquanto o chute está preparado. No Quest, nenhuma mira aparece.
- **`kick`** (campos novos): `target` é o ponto mirado `{ x, y, z }` (na linha do gol, no chão ou a 6 m, se a pessoa estiver de costas para o gol), ou `null` mirando reto para cima. `velocity` é a velocidade de saída `{ x, y, z }` em m/s, que é o que o `ball` usa. `direction` continua sendo só a direção no chão.
- **`goal`**: `position` é onde a bola cruzou a linha do gol, **com a altura** (`y`).
- **`post-hit`**: `side` é `'left'` ou `'right'` (trave da esquerda ou da direita, do ponto de vista de quem chuta) ou `'top'` (travessão). `position` inclui a altura. Sempre vem seguido de um `miss` com `reason: 'trave'` (bater na trave ou no travessão conta como erro).
- **`miss`**: `reason` é `'fora'` (passou ao lado do gol), `'alto'` (passou por cima do travessão), `'trave'` (bateu na trave), `'curta'` (parou antes do gol ou passou do tempo máximo, inclusive parando depois de rebater numa banda lateral) ou `'saiu'` (passou da linha de fundo de trás, em `z = 32`). Mirando no ar, a bola voa e quica antes de rolar. Pelas laterais a bola não sai: ela rebate nas bandas e continua rolando.
- **`ball-stopped`**: a bola parou depois de um chute. Depois dele, a bola espera ser recolocada (pelo ciclo de tentativas ou pelo modo debug), o que gera um novo `ball-spawned`.

### Ordem dos eventos em cada chute

```
ball-reached → kick-ready → kick → (post-hit)? → goal | miss → ball-stopped
```

- Todo chute termina com **exatamente um** `goal` **ou** um `miss`.
- Depois do `kick`, a bola **para de emitir** `ball-reached` e `ball-left` até o próximo `ball-spawned` (assim o balão não reaparece com a bola rolando).

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
| `#rig` | Jogador (origem) | Componentes `kicker` (chute) e `controles-jogador` (R / botão A recoloca a bola; no computador, volta a câmera ao centro ao entrar em campo) |
| `#camera` | Cabeça do jogador | Para efeitos presos à visão (venda) |
| `#mao-esquerda`, `#mao-direita` | Controles do Quest | Botões e gatilho |
| `#bola` | Bola | **Coloque o guizo aqui** (`sound` posicional): ele acompanha a bola sozinho. O componente `ball` não mexe em som. |
| `#gol` | Referência do gol | Fica na linha do gol (posicionado pelo `goal-zones`), com `z = 0` na linha. Não desenha as traves: quem desenha é o `#estadio`. Com `?debug=1`, mostra as zonas de gol e de trave. Para as ondas nas traves |
| `#vestiario` | Vestiário | Livre para a Dev B. No estado `vestiario`, esconde `#gol` e o contorno `#area` |
| `#instrucoes` | Instrução presa à visão (Dev B) | `components.instrucoes.mostrar(texto)` / `esconder()`. O componente `dicas-tutorial`, na mesma entidade, mostra o próximo passo do chute só no `tutorial`: andar (`ball-spawned`, `ball-left`), preparar (`ball-reached`), mirar (`kick-ready`) e some no `kick` |
| `#venda-efeito` | Camada preta da venda (Dev B) | Ligada em todos os estados, menos `vestiario` e `resultado`. Com `?debug=1`, fica a 50% depois de posta. **Provisório:** com `CONFIG.venda.visaoLivre: true`, fica invisível |
| `#colisao` | Colisão do jogador (Dev B) | Só no `vestiario`. No computador, empurra `#camera` para fora dos objetos. No VR, só escurece a visão (não mexe no `#rig`) |
| `#entrada-campo` | Texto provisório de `entrada-campo` (Dev B) | Componente `entrada-campo`. Mostra o texto (0,4 s para aparecer + 1,2 s na tela) e emite `field-entered`, que leva ao `tutorial`. O texto some enquanto a bola aparece |
| `#estadio` | Estádio (Dev B) | Visível em todos os estados, menos `vestiario`. É o único chão do campo (gramado com as linhas) e desenha os dois gols completos. Traves e rede usam `CONFIG.gol.raioTrave` (0,04 m, trave de 8 cm) e `CONFIG.gol.profundidadeRede`, os mesmos valores da física |

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
