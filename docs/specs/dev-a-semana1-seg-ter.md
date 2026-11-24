# Spec: Dev A, segunda (23/11) e terça (24/11)

> Status: **aprovada, em implementação**
> Responsável: Laura (Dev A: jogabilidade e dados)
> Referências: [PRD](../PRD.md) e o plano diário da dupla

Esta spec descreve o que será construído nas tarefas de Dev A de segunda e terça, como cada parte funciona e como saberemos que está pronta. Depois de aprovada, ela é o contrato: o código segue a spec, e qualquer mudança de rumo é feita primeiro aqui.

> **Regra de git:** o Claude só desenvolve e roda testes. **Ele não faz commit, push, PR nem merge.** Todos os commits e envios ao GitHub são feitos **manualmente pela Laura**, com a conta **LauraRodrigues31**, para o Claude não aparecer como contribuidor. Ver [CLAUDE.md](../../CLAUDE.md) e a [seção 14](#14-ordem-de-implementação-testes-e-commits).

---

## 1. Escopo

### Dentro (Dev A)

| Dia | Tarefa | Seção |
|---|---|---|
| Seg | Publicação com HTTPS (GitHub Pages) | [4](#4-publicação-com-https) |
| Seg | Cena A-Frame de teste abrindo no Quest 3 pelo link | [5](#5-cena-base) |
| Seg | Arquivo de configuração | [6](#6-arquivo-de-configuração) |
| Seg | Contrato de eventos (para fechar com a Dev B) | [7](#7-contrato-de-eventos) |
| Seg | Máquina de estados com eventos | [8](#8-máquina-de-estados-game-state) |
| Ter | Mapeamento da área física para o campo virtual | [9](#9-área-de-jogo-e-mapeamento-físico--virtual) |
| Ter | Jogador anda fisicamente dentro da área (req. 2) | [10](#10-andar-dentro-da-área) |
| Ter | Bola com detecção de proximidade (`ball-reached`) | [11](#11-bola-e-detecção-de-proximidade) |
| Ter | Teste no Quest: andar até a bola | [13](#13-roteiro-de-teste-no-quest) |

Extra (ferramenta de Dev A para conseguir testar com a tela escura): **modo debug** com painel de informações dentro do VR ([12](#12-modo-debug)).

### Fora (fica com a Dev B ou com outro dia)

- Sons (guizo, ambiente, torcida), efeito da venda, visual do vestiário e do campo, ondas, balões e textos são da **Dev B**. Esta spec só deixa os **pontos de encaixe** (ids de entidades e eventos) para ela conectar.
- Chute, física da bola, gol e trave: **quarta**.
- Ciclo de 3 tentativas e registro de tentativas: **quinta**.

---

## 2. Decisões que preciso que você aprove

Cada decisão tem uma recomendação. Se concordar com todas, basta aprovar a spec.

| # | Decisão | Recomendação | Alternativa |
|---|---|---|---|
| D1 | **Escala física → virtual** | **1:1.** Andar 1 m de verdade = 1 m no jogo. A área de 3 × 3 m é um pedaço do campo em tamanho real, na frente do gol. | Escalar (ex.: 3 m físicos = 20 m virtuais). Mais "campo", mas o corpo e o som espacial deixam de bater com a distância real, o que confunde e pode causar enjoo. |
| D2 | **Hospedagem** | **GitHub Pages**, publicando direto da branch `main` (raiz). O repo já é público e no GitHub, sem nova conta nem build. | Vercel: previews por branch, mas exige conta e configuração. |
| D3 | **Ferramentas** | **Sem bundler e sem npm no site.** A-Frame **1.8.0** por CDN e o nosso código em módulos ES (`<script type="module">`). Node só para rodar os testes (`node --test`), sem dependências. | Vite/npm: mais estrutura, mais coisa para dar errado em 2 semanas. |
| D4 | **Fluxo de git** | **Decidido:** todo o trabalho de Dev A na branch **`devA-Laura`**, com commits pequenos **feitos pela Laura** (o Claude não commita nem dá push). O GitHub Pages publica a `main`, então, para testar no Quest, um bloco pronto (testes passando) entra na `main` por **pull request** da `devA-Laura`, aberto e aceito pela Laura. Antes de abrir o PR, trazer a `main` para a branch (`git merge origin/main`) para resolver conflitos com a Dev B do nosso lado. | — |
| D5 | **Origem do mundo** | O centro da área no chão é a origem `(0, 0, 0)`. A pessoa **começa sobre a marca no chão, olhando para o gol**. O gol fica no sentido `-z` (à frente). | — |
| D6 | **Distância até a bola** | Medida no **plano do chão (x, z)**, entre a **cabeça** projetada no chão e a bola. Não rastreamos o pé (já previsto no PRD). | — |
| D7 | **Nomes** | Eventos em inglês (como no plano: `ball-reached`, `kick`...). Estados, configuração e comentários em português. | Tudo em português. |

---

## 3. Estrutura de arquivos

```
index.html                  cena A-Frame e entidades com ids fixos
.nojekyll                   impede o GitHub Pages de processar com Jekyll
package.json                só para rodar os testes (npm test); sem dependências
CLAUDE.md                   regras para o Claude neste repo (ex.: não commitar)
src/
  main.js                   importa e registra todos os componentes
  config.js                 configuração central (seção 6)
  events.js                 nomes dos eventos como constantes (seção 7)
  debug.js                  liga o modo debug (?debug=1), versão e log de eventos
  head.js                   posição da cabeça do jogador no mundo
  logic/                    lógica pura, sem A-Frame, testável no Node
    state-machine.js        tabela de transições e validação
    area.js                 limites da área, mapeamento físico → virtual
    proximity.js            distância no chão e histerese (perto/longe)
  systems/
    game-state.js           system A-Frame que usa logic/state-machine.js
  components/
    field-placeholder.js    chão do campo e gol provisórios, montados pelo config
    play-area.js            monitora se a cabeça está dentro da área
    ball.js                 bola e detecção de proximidade
    debug-hud.js            painel de debug dentro do VR
tests/
  state-machine.test.js
  area.test.js
  proximity.test.js
docs/
  EVENTOS.md                contrato de eventos para a Dev B (seção 7)
  specs/                    esta spec
```

**Regra de separação:** tudo o que é regra (transições, limites, distância) fica em `src/logic/` como funções puras. Os componentes A-Frame só leem posições, chamam essa lógica e emitem eventos. Assim os testes rodam sem o óculos.

---

## 4. Publicação com HTTPS

**Por quê:** o Quest só libera WebXR e áudio em páginas seguras (HTTPS).

**O que será feito:**

1. Criar `.nojekyll` na raiz.
2. Ativar o GitHub Pages em *Source: Deploy from a branch → `main` / `(root)`*, pela API (`gh api`) ou por *Settings → Pages*.
3. Link final: **https://laurarodrigues31.github.io/eletiva-futebol-de-cegos/**
4. Adicionar o link ao README.

**Teste local (sem óculos):** `npx serve .` ou `python -m http.server` e abrir `http://localhost:...` no computador. `localhost` conta como seguro, então a cena funciona no desktop com mouse e WASD.

**Pronto quando:**
- [ ] O link abre a cena por HTTPS no computador.
- [ ] Um merge na `main` (feito pela Laura) aparece no link em poucos minutos.

> Situação: o GitHub Pages **já está ativado** (24/11), publicando a `main`. Até o primeiro merge do código, o link mostra só o README.

---

## 5. Cena base

`index.html` com:

- A-Frame 1.8.0 por CDN, com a versão fixada na URL.
- `<a-scene>` com `webxr="referenceSpaceType: local-floor"` (o chão real fica em `y = 0`) e `renderer="colorManagement: true"`.
- **Rig do jogador** (`#rig`) na origem, com a câmera (`#camera`) dentro dele e altura de 1,6 m no desktop. No VR, a altura e a posição vêm do próprio óculos.
- Controles do Quest (`#mao-esquerda` e `#mao-direita` com `meta-touch-controls`). Vão ser usados na quarta para o chute.
- **Placeholders visuais simples**, só para orientação e debug (a Dev B substitui pelo visual final): chão do campo, contorno da área de jogo e gol de 3,66 × 2,14 m (tamanho oficial atual da IBSA; a regra antiga usava 3 × 2, de futsal).
- **Ids fixos** que a Dev B pode usar: `#vestiario`, `#campo`, `#bola`, `#gol`, `#camera`, `#rig`.
- No desktop, `wasd-controls` na câmera, para simular o andar.

**Pronto quando:**
- [ ] No computador, a cena aparece e dá para andar com WASD.
- [ ] No Quest 3, o link abre, o botão "Enter VR" entra no modo imersivo e o chão virtual fica na altura do chão real.

---

## 6. Arquivo de configuração

`src/config.js` exporta um objeto `CONFIG`. **Todo número ajustável mora aqui**: nenhum componente tem número mágico. Valores iniciais:

```js
export const CONFIG = {
  // Área física livre onde a pessoa anda (metros). Centro = origem.
  area: {
    largura: 3,          // eixo x
    profundidade: 3,     // eixo z
    margemAviso: 0.3,    // a partir de quantos metros da borda avisar
  },

  // Escala física → virtual (D1). 1 = tamanho real.
  escala: 1,

  // Gol (medidas oficiais atuais da IBSA: 3,66 m × 2,14 m).
  gol: {
    largura: 3.66,
    altura: 2.14,
    distanciaDaArea: 3,  // da borda frontal da área até a linha do gol
  },

  bola: {
    raio: 0.1,                      // bola de futsal adaptada, ~62 cm de circunferência
    raioAlcance: 0.5,               // "alcançou" a menos de 0,5 m (PRD)
    raioSaida: 0.7,                 // só volta a "longe" acima de 0,7 m (histerese)
    posicaoTutorial: { x: 0, z: -1 },
    velocidadeFase3: 0.3,           // m/s (usado na terça 01/12)
  },

  tentativas: {
    tutorial: 3,
    fase2: 3,
    fase3: 3,
  },

  debug: false,  // também pode ser ligado com ?debug=1 na URL
};
```

Com `distanciaDaArea: 3`, a linha do gol fica em `z = -(1,5 + 3) = -4,5`. Uma bola no centro da área fica a 4,5 m do gol, e uma bola na borda frontal fica a 3 m.

**Pronto quando:**
- [ ] Mudar um valor no `config.js` muda o comportamento sem tocar nos componentes. Exemplo: mudar `area.largura` muda o contorno da área e o aviso de saída.

---

## 7. Contrato de eventos

**Regras:**
- Todo evento é emitido **na cena** (`sceneEl.emit(nome, detalhe)`). Qualquer componente pode ouvir com `sceneEl.addEventListener`.
- Os nomes ficam em `src/events.js` como constantes (`EVENTS.BALL_REACHED`), para evitar erro de digitação.
- O `detail` de cada evento segue a tabela abaixo. Mudar o payload exige combinar com a outra dev e atualizar `docs/EVENTOS.md`.

| Evento | Quem emite | Quem ouve | `detail` | Quando é implementado |
|---|---|---|---|---|
| `state-change` | game-state (A) | todos | `{ from, to, phase, attempt }` | **seg** |
| `blindfold-on` | venda (B) | game-state | `{}` | B, seg |
| `field-entered` | transição de campo (B) | game-state | `{}` | B, ter |
| `continue` | telas e textos (B) | game-state | `{}` | B, quando houver telas |
| `area-exit` | play-area (A) | B (aviso sonoro), debug | `{ position }` | **ter** |
| `area-enter` | play-area (A) | B, debug | `{ position }` | **ter** |
| `ball-spawned` | ball (A) | B (guizo, ondas, balão) | `{ position }` | **ter** |
| `ball-reached` | ball (A) | game-state, B (some o balão) | `{ distance, timeMs }` | **ter** |
| `ball-left` | ball (A) | B, debug | `{ distance }` | **ter** |
| `kick` | kicker (A) | ball, gravador (B) | `{ direction, power, position }` | qua |
| `goal` | goal (A) | game-state, torcida (B) | `{ position }` | qua |
| `post-hit` | goal (A) | B (onda na trave) | `{ side: 'left' \| 'right' }` | qua |
| `miss` | goal (A) | game-state, B | `{}` | qua |
| `attempt-end` | game-state (A) | B (tela de resultado) | `{ phase, attempt, result }` | qui |
| `phase-end` | game-state (A) | B (texto de transição) | `{ phase }` | qui |

**Posições** são sempre `{ x, y, z }` em metros, no sistema do mundo. **Tempos** são em milissegundos.

Entregável: `docs/EVENTOS.md` com essa tabela e um exemplo de uso, para a Dev B revisar. **Ação sua:** mandar para a Anna e combinar se ela precisa de algum evento a mais.

---

## 8. Máquina de estados (`game-state`)

Um **system** do A-Frame (existe uma vez por cena), acessível por `sceneEl.systems['game-state']`.

### Estados e transições

```
vestiario ──blindfold-on──▶ entrada-campo ──field-entered──▶ tutorial
                                                               │
                                                   (fim das 3 tentativas)
                                                               ▼
resultado ◀──fim── fase3 ◀──fim── fase2 ◀──continue── fim-tutorial
    │
    └──continue──▶ vestiario   (reinicia para a próxima pessoa)
```

| De | Para | Gatilho |
|---|---|---|
| `vestiario` | `entrada-campo` | evento `blindfold-on` |
| `entrada-campo` | `tutorial` | evento `field-entered` |
| `tutorial` | `fim-tutorial` | fim das tentativas do tutorial (lógica de quinta; até lá, pelo debug) |
| `fim-tutorial` | `fase2` | evento `continue` |
| `fase2` | `fase3` | fim das tentativas da fase 2 |
| `fase3` | `resultado` | fim das tentativas da fase 3 |
| `resultado` | `vestiario` | evento `continue` (reinício) |

Os estados `entrada-campo` e `fim-tutorial` vêm do PRD (req. 2 e req. 7) e completam a lista do plano diário.

### Dados guardados pelo system

```js
{
  estado: 'vestiario',
  tentativa: 0,      // tentativa atual dentro da fase (0 fora das fases)
  inicioEstado: 0,   // timestamp de entrada no estado atual
}
```

### API

- `estadoAtual()` devolve o estado atual.
- `ir(proximo)` valida a transição pela tabela. Se for válida, troca o estado e emite `state-change`. Se não for, **não muda nada** e mostra um `console.warn`. Uma transição inválida nunca quebra o jogo.
- `podeIr(proximo)` diz se a transição é válida, sem executar.

### Comportamento

- Ao entrar em `tutorial`, `fase2` e `fase3`, `tentativa` passa a 1. O avanço das tentativas é a tarefa de quinta.
- Eventos que chegam no estado errado são ignorados (ex.: `blindfold-on` durante a `fase2`).
- Todo componente que depende de fase (bola, sons, balões) reage a `state-change`, e não a variáveis globais.

**Pronto quando:**
- [ ] Testes em `tests/state-machine.test.js` cobrem: todas as transições válidas, rejeição de transições inválidas, o reinício e o `state-change` com `from` e `to` corretos.
- [ ] No modo debug, dá para percorrer todos os estados (seção 12) e ver o nome do estado no painel.

---

## 9. Área de jogo e mapeamento físico → virtual

### Sistema de coordenadas (D5)

```
            gol (z = -4,5)
         ┌───────────────┐
                 ▲ -z (frente)
         ┌───────────────┐  z = -1,5
         │               │
         │   •  origem   │  área física 3 × 3 m
         │  (marca no    │  x de -1,5 a 1,5
         │    chão)      │
         └───────────────┘  z = +1,5
```

- O A-Frame com `local-floor` coloca a origem onde o óculos estava quando a sessão VR começou, no nível do chão. **Por isso a pessoa precisa entrar no VR em pé sobre a marca, olhando para a frente.** Isso vai para o roteiro de operação.
- Com `escala: 1` (D1), posição física = posição virtual. O "mapeamento" é a função que converte e verifica, e deixa a porta aberta para outra escala sem reescrever os componentes.

### `src/logic/area.js` (funções puras)

- `limitesArea(config)` devolve `{ minX, maxX, minZ, maxZ }`.
- `dentroDaArea(pos, config, margem = 0)` devolve `true` se `(x, z)` estiver dentro, com margem opcional.
- `fisicoParaVirtual(pos, config)` e `virtualParaFisico(pos, config)` aplicam a escala.
- `posicaoGol(config)` devolve o centro da linha do gol em coordenadas virtuais.

**Pronto quando:**
- [ ] `tests/area.test.js` cobre: limites para áreas de tamanhos diferentes, pontos dentro, fora e na borda, margem, ida e volta da conversão de escala e posição do gol.
- [ ] O contorno da área e a posição do gol na cena vêm dessas funções.

---

## 10. Andar dentro da área

No VR, **andar já funciona sozinho**: o Quest rastreia a cabeça e o A-Frame move a câmera. A tarefa é garantir que isso funcione bem e com segurança:

1. **Sem locomoção artificial** no VR (nada de andar pelo controle). O `wasd-controls` só tem efeito no teclado do desktop.
2. Componente **`play-area`** (na cena):
   - A cada ~100 ms, lê a posição da cabeça no plano do chão.
   - Ao sair da área (contando a `margemAviso`), emite `area-exit` **uma vez**. Ao voltar, emite `area-enter` **uma vez**. Não dispara a cada quadro.
   - O aviso em si (som ou voz) é da Dev B. No modo debug, o contorno da área fica vermelho enquanto a pessoa está fora.
3. **Segurança** (vai para o roteiro de operação, não é código): o limite de segurança (Guardian) do Quest deve ser configurado maior que a área e com o espaço livre, e sempre deve haver uma pessoa acompanhando.

**Pronto quando:**
- [ ] No desktop, andar com WASD para fora do contorno emite `area-exit` uma única vez (visto no console e no painel de debug), e voltar emite `area-enter`.
- [ ] No Quest, andar fisicamente move a visão 1:1 e sair da área aparece no painel de debug.

---

## 11. Bola e detecção de proximidade

Componente **`ball`** na entidade `#bola`.

### Responsabilidades

- Ter a forma da bola (esfera com `raio` do config) apoiada no chão (`y = raio`).
- `colocarEm({ x, z })` posiciona a bola e emite `ball-spawned`. Em `tutorial`, a bola usa `bola.posicaoTutorial`. O sorteio de posição da fase 2 fica para a segunda, 30/11.
- **Detectar a proximidade** com a cabeça do jogador e emitir `ball-reached` e `ball-left`.
- **Não toca em som.** A Dev B coloca o guizo (`sound` posicional) na mesma entidade `#bola`, então ele acompanha a bola automaticamente.

### Regra de proximidade (`src/logic/proximity.js`)

- `distanciaNoChao(a, b)` = `√((ax − bx)² + (az − bz)²)` (ignora a altura, D6).
- **Histerese**, para o evento não ficar piscando quando a pessoa está bem no limite:
  - estado `longe` → `perto` quando a distância for **< `raioAlcance` (0,5 m)**: emite `ball-reached`;
  - estado `perto` → `longe` quando a distância for **> `raioSaida` (0,7 m)**: emite `ball-left`;
  - entre 0,5 e 0,7 m, mantém o estado atual.
- `atualizarProximidade(estadoAtual, distancia, config)` devolve `{ estado, evento }` (`evento` é `'reached'`, `'left'` ou `null`).

### Payload

- `ball-reached`: `{ distance, timeMs }`, em que `timeMs` é o tempo desde o último `ball-spawned`. Essa é a métrica **"tempo até a bola"** da ficha técnica (02/12) já nascendo aqui.
- `ball-left`: `{ distance }`.

### Quando a bola está ativa

- Fica visível e checando proximidade só em `tutorial`, `fase2` e `fase3` (reage a `state-change`).
- Em `vestiario`, `entrada-campo`, `fim-tutorial` e `resultado`, fica escondida e sem checagem.
- Visibilidade não é o mesmo que "aparecer na tela": na quinta e depois, a Dev B decide o que fica visível com a venda. Aqui "escondida" significa só "fora do jogo".

**Pronto quando:**
- [ ] `tests/proximity.test.js` cobre: distância ignorando a altura, entrada abaixo de 0,5, ficar perto entre 0,5 e 0,7, saída acima de 0,7 e nenhum evento repetido.
- [ ] No desktop, andar até a bola emite `ball-reached` uma vez com `timeMs` coerente, e se afastar emite `ball-left`.

---

## 12. Modo debug

Ligado com `?debug=1` na URL ou `debug: true` no config. É a ferramenta para testar no Quest quando a tela estiver escura por causa da venda.

- **Painel no VR** (`debug-hud`), preso à câmera e no canto da visão, mostrando: estado, tentativa, posição da cabeça (x, z), distância até a bola, perto/longe e dentro/fora da área. Atualiza a cada ~200 ms.
- **Avançar de estado:** tecla `N` no desktop e botão **B** do controle direito no Quest. Avança para o próximo estado da tabela, para dar para percorrer tudo antes das partes da Dev B existirem.
- **Pular para um estado:** `?estado=fase2` na URL.
- Contorno da área e gol sempre visíveis no debug, mesmo com a venda.
- Log no console de todos os eventos do contrato.

**Pronto quando:**
- [ ] Sem `?debug=1`, nada disso aparece.
- [ ] Com `?debug=1`, no Quest, o painel é legível e o botão B avança os estados.

---

## 13. Roteiro de teste no Quest

Feito pela Laura, com o óculos, depois do merge na `main`. O Claude deixa o roteiro pronto e corrige o que aparecer.

1. Preparar um espaço livre de pelo menos 3 × 3 m, com uma marca no centro e o Guardian configurado.
2. Em pé sobre a marca, olhando para a frente, abrir o link com `?debug=1` e clicar em **Enter VR**.
3. Conferir: chão na altura certa e gol à frente.
4. Apertar **B** até chegar em `tutorial`. A bola aparece a 1 m à frente.
5. Andar até a bola. O painel deve mostrar `ball-reached` e o tempo.
6. Recuar. O painel deve mostrar `ball-left`.
7. Andar até a borda da área. O contorno fica vermelho e o painel mostra "fora".
8. Apertar **B** até `resultado` e depois de novo: volta para `vestiario`.

Anotar: altura do chão ok?, sensação de escala 1:1 ok?, o raio de 0,5 m parece certo?, algum enjoo?

---

## 14. Ordem de implementação, testes e commits

> **Regra de git:** o Claude **não faz commit, push, PR nem merge**. Ele só escreve código e roda testes. **Quem commita e envia é a Laura, manualmente**, com a conta **LauraRodrigues31**, para que o Claude não apareça como contribuidor no GitHub. Detalhes em [CLAUDE.md](../../CLAUDE.md).

O Claude implementa os passos em sequência, na branch local **`devA-Laura`**, e roda os testes automáticos (T1) a cada passo. Quando termina tudo, avisa a Laura, que então faz os testes manuais (T2 e T3) e os commits, usando a tabela da seção 14.2 como roteiro.

Existem três tipos de teste. A seção 14.1 explica como fazer cada um, e a tabela da 14.2 diz qual deles roda depois de cada passo e sugere o commit correspondente.

### 14.1 Como testar

#### T1. Testes automáticos (o Claude roda a cada passo; você pode rodar também)

Testam a lógica pura de `src/logic/` (transições, limites da área, distância e histerese) sem navegador e sem óculos.

1. No terminal, na pasta do projeto, rode:
   ```
   node --test
   ```
   (Ele encontra sozinho os arquivos `tests/*.test.js`. O mesmo comando existe como `npm test`.)
2. Leia o resumo no final. Tem que aparecer `fail 0`. Se algum teste falhar, o nome do teste e o valor esperado × recebido aparecem logo acima.

**Regra:** um passo só é dado como pronto com `fail 0`. **Não commite com teste falhando.**

#### T2. Teste no computador (você faz)

Mostra a cena de verdade no navegador, com mouse e teclado no lugar do óculos.

1. No terminal, na pasta do projeto, rode `npx serve .` (na primeira vez ele pede para instalar o `serve`: responda `y`). Ele mostra um endereço como `http://localhost:3000`.
2. Abra o endereço no Chrome **com `?debug=1` no final**, por exemplo `http://localhost:3000/?debug=1`.
3. Abra o console do navegador com **F12 → aba Console**. Com o debug ligado, todo evento do contrato aparece ali (ex.: `[evento] ball-reached { distance: 0.48, timeMs: 3120 }`).
4. Controles no computador:
   - **Clique e arraste** para olhar em volta;
   - **W A S D** para andar;
   - **N** para avançar para o próximo estado.
5. Depois de mudar o código, recarregue com **Ctrl + Shift + R**, para o navegador não usar a versão antiga em cache.
6. Para parar o servidor, volte ao terminal e aperte **Ctrl + C**.

#### T3. Teste no Quest 3 (você faz)

O único teste que mostra escala real, altura do chão e o andar de verdade. Só funciona depois que o código chegou na `main`, porque o óculos abre o link do GitHub Pages.

1. Depois do merge na `main`, espere de 1 a 2 minutos. O status da publicação aparece na aba **Actions** do repositório no GitHub (precisa estar verde).
2. Prepare o espaço: área livre de pelo menos 3 × 3 m, uma marca no centro e o Guardian do Quest configurado em volta. Tenha alguém por perto.
3. Em pé sobre a marca, olhando na direção em que o gol deve ficar, abra no navegador do Quest o link `https://laurarodrigues31.github.io/eletiva-futebol-de-cegos/?debug=1`.
4. Se a página parecer antiga, recarregue. A versão aparece no painel de debug.
5. Clique em **Enter VR**. O painel de debug aparece no canto da visão.
6. Use o **botão B** do controle direito para avançar os estados.
7. Anote o que deu certo e o que não deu e conte ao Claude, que corrige a partir disso.

(Opcional e avançado: dá para ver o console do Quest no computador ligando o óculos por cabo USB, ativando o modo desenvolvedor e abrindo `chrome://inspect` no Chrome. O painel de debug existe justamente para isso não ser necessário.)

### 14.2 Passos, testes e commits

O Claude faz a coluna "O que é feito" e roda o T1. As colunas "Teste" e "Commit" são suas, depois que o Claude avisar que terminou. Você pode juntar commits se preferir; os sugeridos abaixo deixam o histórico fácil de ler.

| Passo | O que é feito (Claude) | Teste (você) | O que conferir | Commit sugerido (você) |
|---|---|---|---|---|
| 0 | Branch local `devA-Laura` criada a partir da `main` | — | `git branch` mostra `* devA-Laura`. | — |
| 1 | `.nojekyll`, `index.html` com a cena base, `src/main.js` e placeholders do campo e do gol | **T2** | A cena abre no `localhost`, o gol aparece à frente e WASD anda. | `feat: cena base A-Frame com rig, controles do Quest e placeholders` |
| 2 | `src/config.js`, `src/logic/area.js`, `package.json` e testes | **T1** | `fail 0`. Os testes de limites, margem, histerese, escala e posição do gol passam. | `feat: configuracao central e logica da area de jogo` |
| 3 | `src/events.js` e `docs/EVENTOS.md` | Leitura | Você lê o `EVENTOS.md` e manda para a Anna. | `feat: contrato de eventos` |
| 4 | `src/logic/state-machine.js`, `src/systems/game-state.js` e testes | **T1** | `fail 0`. Transições válidas, inválidas ignoradas e reinício. | `feat: maquina de estados do jogo` |
| 5 | `src/debug.js`, `src/components/debug-hud.js` e navegação de debug (tecla N, botão B, `?estado=`) | **T2** | Com `?debug=1`: o painel mostra o estado; **N** percorre `vestiario → entrada-campo → tutorial → fim-tutorial → fase2 → fase3 → resultado → vestiario`; cada troca aparece no console como `state-change`; `?estado=fase2` abre direto na fase 2; **sem** `?debug=1`, nada disso aparece. | `feat: modo debug com painel no VR` |
| 6 | `src/components/play-area.js` e contorno da área | **T2** | Andando com WASD para fora do contorno: ele fica vermelho e aparece **um** `area-exit` no console. Ao voltar, aparece **um** `area-enter`. Ficar parado na borda não gera eventos repetidos. | `feat: monitoramento da area de jogo` |
| 7 | `src/logic/proximity.js`, `src/components/ball.js` e testes | **T1** + **T2** | T1: `fail 0`. T2: no estado `tutorial`, a bola aparece 1 m à frente e `ball-spawned` aparece no console. Andar até a bola gera **um** `ball-reached` com `timeMs` coerente, e se afastar gera **um** `ball-left`. Nos outros estados, a bola some. | `feat: bola com deteccao de proximidade` |
| 8 | README com o link e o roteiro de teste; revisão final | **T1** + **T2** completo | Você percorre o roteiro da seção 13 no computador (com WASD no lugar de andar). | `docs: link do jogo e roteiro de teste no README` |
| 9 | — | — | **Você:** `git push -u origin devA-Laura`, abre o PR para a `main` e faz o merge (ou a Anna revisa, se vocês combinarem). | — |
| 10 | — | **T3** completo (seção 13) | Roteiro completo no Quest. Você conta o resultado ao Claude, que corrige o que for preciso. | Commits das correções, também feitos por você. |

**Como commitar um passo** (exemplo do passo 2):

```
git add src/config.js src/logic/area.js package.json tests/area.test.js
git commit -m "feat: configuracao central e logica da area de jogo"
```

Antes de cada commit, confira com `git config user.email` que a identidade é a da conta pessoal (`...LauraRodrigues31@users.noreply.github.com`).

---

## 15. Riscos

| Risco | Mitigação |
|---|---|
| A Dev B mexer no `index.html` ao mesmo tempo e dar conflito | Cada uma no seu bloco do `index.html`, marcado por comentário (`<!-- DEV B: vestiário -->`); componentes em arquivos separados; trabalho na `devA-Laura` com `git merge origin/main` antes de cada PR. |
| Testar no Quest exige PR e merge na `main` (o Pages só publica uma branch) | PRs pequenos e frequentes, um por bloco testável, abertos pela Laura. Se isso travar os testes no óculos, avaliar Vercel (preview por branch) na quarta. |
| A origem do `local-floor` depende de onde a pessoa estava ao entrar no VR | Roteiro de operação: entrar no VR sobre a marca, olhando para a frente. Se der problema, adicionar um "recentralizar" (botão) na quarta. |
| Cache do navegador do Quest mostrar uma versão antiga | Adicionar `?v=<número>` no link ou recarregar à força. Mostrar a versão no painel de debug. |
| O raio de 0,5 m pode parecer grande ou pequeno demais | Está no config. Ajustar depois do teste do Quest. |
