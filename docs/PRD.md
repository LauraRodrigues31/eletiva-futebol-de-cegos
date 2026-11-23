# Futebol de Cegos em VR

Experiência imersiva em realidade virtual para o **Meta Quest 3**, desenvolvida em **A-Frame (WebXR)**, que coloca o jogador na pele de um atleta de futebol de cegos (futebol de 5) para mostrar, na prática, que o esporte **não é tão fácil quanto parece**, e assim quebrar estigmas sobre a prática esportiva por pessoas cegas.

> Status: em desenvolvimento. Projeto de 5 semanas, com início em 23/11/2026. A primeira entrega é uma **POC** ao fim das duas primeiras semanas (04/12/2026).

---

## Sumário

- [Objetivo](#objetivo)
- [Conceito da experiência](#conceito-da-experiência)
- [Contexto do esporte usado na experiência](#contexto-do-esporte-usado-na-experiência)
- [Fases da experiência](#fases-da-experiência)
- [Requisitos funcionais](#requisitos-funcionais)
- [Requisitos não funcionais](#requisitos-não-funcionais)
- [Ficha técnica de desempenho](#ficha-técnica-de-desempenho)
- [Decisões de design (hipóteses de partida)](#decisões-de-design-hipóteses-de-partida)
- [Arquitetura sugerida](#arquitetura-sugerida)
- [Plano das 5 semanas](#plano-das-5-semanas)
- [Entrega da POC (semanas 1 e 2)](#entrega-da-poc-semanas-1-e-2)
- [Riscos e cuidados](#riscos-e-cuidados)
- [Critério de pronto da POC](#critério-de-pronto-da-poc)
- [Ideias em avaliação para depois da POC](#ideias-em-avaliação-para-depois-da-poc)

---

## Objetivo

Criar uma experiência curta e jogável em que o usuário:

1. sinta, de olhos vendados, a dificuldade real de localizar a bola, se orientar e finalizar usando apenas o som;
2. perceba, pelo desempenho e pelo replay, a distância entre o que ele consegue fazer e a habilidade de um atleta;
3. saia da experiência com **respeito pela habilidade** dos atletas, e não com pena.

### Enquadramento

A mensagem central é *"isso é difícil, e eles fazem em alto nível"*. A experiência **não** deve apresentar a cegueira como mera escuridão ou limitação, nem usar linguagem de "superação" ou "coitado". O foco é o esporte, a técnica e o treino.

## Conceito da experiência

O jogador começa no vestiário, coloca a venda e entra em campo. A partir daí, tudo é guiado pelo **som**: o guizo da bola, a ambiência do estádio e, em alguns momentos, ondas sonoras desenhadas na tela para ensinar o que ele está ouvindo.

A experiência começa com um **tutorial guiado** (com pistas visuais e balões explicativos) e depois passa para fases **valendo pontos**, em que as pistas visuais somem e só o guizo orienta. Ao final, o jogador vê uma **ficha técnica** do próprio desempenho e um **replay em terceira pessoa** dos lances.

## Contexto do esporte usado na experiência

Elementos reais do futebol de cegos que a experiência aproveita:

- A bola tem **guizo**, e os jogadores se orientam pelo som.
- Os jogadores de linha jogam vendados.
- Há um **chamador** atrás do gol adversário, que orienta o ataque com a voz.
- A **torcida precisa ficar em silêncio durante a jogada**, para os atletas ouvirem a bola, e só pode comemorar no gol.

## Fases da experiência

### 1. Vestiário e venda

O jogador aparece no vestiário e coloca a venda (a tela escurece).

### 2. Entrada em campo

Entrada em campo com experiência sonora (ambiente de estádio).

### 3. Tutorial: encontrar a bola

A bola aparece com **ondas sonoras desenhadas** e o som do guizo. Um balão explicativo mostra o que é aquilo (a bola) e o que fazer (andar até ela).

### 4. Tutorial: chutar

Instruções de como chutar. Ondas sonoras nas traves (como se alguém batesse nelas) indicam onde está o gol.

### 5. Resultado da tentativa

A torcida reage (ou não) ao resultado:

- **Gol:** a torcida grita e a tela explica que ela só pode fazer barulho na comemoração dos gols.
- **Sem gol:** a torcida fica em silêncio e aparece uma tela de nova tentativa.

O ciclo das etapas 3 a 5 se repete **3 vezes**.

### 6. Fim do teste

Tela que explica o que aconteceu no tutorial e como será daqui em diante: agora **valendo pontos**.

### 7. Fase 2: bola em posição aleatória

A bola aparece em um ponto aleatório dentro de uma área delimitada no código (evitando a necessidade de espaços grandes). A partir daqui **a bola não é mais indicada na tela**. O jogador se guia apenas pelo guizo, vai até a bola, tenta achar o gol (mira) e chuta. Essa sequência é **obrigatória 3 vezes**, para medir constância.

### 8. Fase 3: bola em movimento

A bola se movimenta devagar pela área selecionada, dificultando a localização. O jogador tem **3 chutes** ao gol tentando acertar a bola em movimento.

### 9. Ficha técnica e replay

Ao final, o jogador vê a **ficha técnica de desempenho** e o **replay dos lances em terceira pessoa**.

## Requisitos funcionais

| # | Requisito |
|---|---|
| 1 | O jogador aparece no vestiário e coloca a venda. |
| 2 | O jogador entra em campo, com experiência sonora. |
| 3 | A bola aparece com ondas sonoras desenhadas e som de guizo, com balão explicando o que é a bola e o que fazer (andar até ela). |
| 4 | Instruções de como chutar, com ondas sonoras das traves sendo atingidas. |
| 5 | A torcida grita (ou não) conforme o resultado. |
| 5.1 | Se foi gol, explicar que a torcida só pode fazer barulho na comemoração dos gols. |
| 5.2 | Se não foi gol, exibir a tela de mais uma tentativa. |
| 6 | O ciclo de tutorial se repete 3 vezes. |
| 7 | Ao fim, uma tela explica o que aconteceu no teste e como será a partir de agora (valendo pontos). |
| 8 | A bola aparece em local aleatório do campo, dentro de um espaço delimitado no código. |
| 9 | O jogador vai até a bola guiado apenas pelo guizo (sem indicação na tela), mira no gol e chuta. |
| 10 | Os dois passos anteriores acontecem obrigatoriamente 3 vezes. |
| 11 | Na fase seguinte, a bola se movimenta devagar pela área selecionada. |
| 12 | O jogador tem 3 chutes ao gol tentando acertar a bola em movimento. |
| 13 | Exibir uma ficha técnica de desempenho e o replay dos lances em terceira pessoa. |

## Requisitos não funcionais

- **Plataforma:** Meta Quest 3, rodando no navegador do headset (WebXR).
- **Tecnologia:** A-Frame (JavaScript).
- **Publicação:** acessível por link em **HTTPS** (necessário para WebXR e áudio). Opções consideradas: Firebase Hosting (plano gratuito), GitHub Pages ou Vercel.
- **Espaço físico:** área de jogo pequena e configurável (hipótese de partida: 3 × 3 m), com o campo virtual escalado para ela.
- **Áudio:** espacial (3D), com o guizo como principal guia do jogador.
- **Segurança:** o jogador anda vendado em um espaço real. Prever aviso inicial, espaço livre, uma pessoa acompanhando e uso do limite de segurança (Guardian) do Quest.
- **Desempenho:** manter poucos elementos visuais ativos (por exemplo, número limitado de anéis de onda ao mesmo tempo).
- **Licenças:** todos os sons e assets devem ter licença livre, com fonte e licença anotadas.

## Ficha técnica de desempenho

Métricas previstas por rodada e no total:

- tempo até alcançar a bola;
- erro de mira (ângulo entre a direção do chute e a direção do gol);
- distância percorrida;
- gol ou não;
- pontuação total.

> A pontuação exata será definida durante o desenvolvimento, a partir de testes.

## Decisões de design (hipóteses de partida)

Pontos a confirmar no início do desenvolvimento. Ajustar este documento caso mudem.

1. **Chute:** gatilho do controle quando a bola está a menos de ~0,5 m, com a direção dada pela frente do controle. Não é preciso rastrear o pé.
2. **Espaço:** área física pequena (3 × 3 m), configurada em um arquivo de configuração.
3. **Tutorial:** 3 tentativas fixas. Se o jogador erra, aparece "tente de novo" e a rodada segue.
4. **Fases 2 e 3:** sem ondas e sem balões, só o guizo.
5. **Replay:** vista elevada dentro do próprio VR, com avatar simples.

## Arquitetura sugerida

Um componente A-Frame por responsabilidade:

| Componente | Responsabilidade |
|---|---|
| `game-state` | Máquina de estados das fases e das tentativas |
| `ball` | Posição, movimento e guizo da bola |
| `kicker` | Detecção e direção do chute |
| `goal` | Zonas de gol e de trave |
| `sound-waves` | Ondas sonoras desenhadas |
| `blindfold` | Efeito da venda (fade para escuro) |
| `hint-balloon` | Balões explicativos |
| `recorder` | Gravação de trajetórias e eventos |
| `replay` | Reprodução em terceira pessoa |
| `scorecard` | Ficha técnica |

Além disso:

- um **arquivo de configuração central** com a área de jogo, o número de tentativas, as velocidades e a posição do gol;
- um **contrato de eventos** entre componentes (por exemplo `ball-reached`, `kick`, `goal`, `post-hit`, `phase-end`).

## Plano das 5 semanas

| Semana | Foco |
|---|---|
| 1 | Tutorial completo jogável no Quest (requisitos 1 a 7) |
| 2 | Fases valendo pontos, ficha técnica e replay (requisitos 8 a 13). **Entrega da POC** |
| 3 a 5 | A definir após a POC (ver [ideias em avaliação](#ideias-em-avaliação-para-depois-da-poc)) |

## Entrega da POC (semanas 1 e 2)

A POC será entregue no fim da semana 2 (04/12/2026).

### Semana 1: tutorial completo (23/11 a 27/11)

- Base técnica: repositório, publicação por link em HTTPS e teste da cena no Quest 3.
- Estrutura do jogo: máquina de estados, arquivo de configuração e contrato de eventos.
- Vestiário e venda, entrada em campo e som ambiente.
- Bola com guizo posicional, ondas sonoras desenhadas e balão explicativo.
- Chute, gol e trave, com ondas nas traves e instruções de chute.
- Torcida (silêncio durante a jogada e grito no gol) e textos explicativos.
- Ciclo de 3 tentativas e tela de fim do teste ("agora vale pontos").
- Integração e teste do tutorial de ponta a ponta no Quest.

**Resultado esperado:** tutorial completo jogável no Quest (requisitos 1 a 7).

### Semana 2: fases valendo, ficha e replay (30/11 a 04/12)

- Fase 2: bola em posição aleatória dentro da área, com 3 rodadas obrigatórias e sem pistas visuais.
- Fase 3: bola em movimento lento, com 3 chutes.
- Revisão do áudio (volume, distância, equilíbrio entre guizo e ambiente).
- Gravação de trajetórias e eventos, e cálculo das métricas e da pontuação.
- Ficha técnica de desempenho em VR.
- Replay em terceira pessoa.
- Testes com 3 a 5 pessoas de fora, ajustes de dificuldade e de textos.
- Congelamento da versão, build final publicada no link e roteiro de demonstração.

**Resultado esperado:** todas as fases funcionando, com ficha técnica e replay (requisitos 8 a 13), e a POC publicada e pronta para demonstração.

## Riscos e cuidados

- **Segurança:** o jogador anda vendado. Manter área pequena, espaço livre e acompanhamento.
- **Áudio no navegador:** o som só é liberado após um gesto do usuário. O botão de entrar em VR cumpre esse papel. Testar em ambiente silencioso.
- **Sons:** confirmar a licença de cada arquivo e anotar a fonte.
- **Replay:** é o item mais incerto do plano.
- **Desempenho:** limitar o número de anéis de onda ativos ao mesmo tempo.

### Cortes previstos se o prazo apertar (em ordem)

1. Replay com trajeto desenhado em vista de cima, em vez de avatar animado.
2. Um único som de torcida, em vez de variações.
3. Pontuação simples, só com gols e tempo.

## Critério de pronto da POC

- [ ] Roda no Quest 3 direto pelo link.
- [ ] O fluxo completo funciona sem ajuda de quem desenvolveu.
- [ ] 3 pessoas de fora jogaram até o fim sem instrução.
- [ ] A ficha técnica e o replay aparecem ao final.

## Ideias em avaliação para depois da POC

Ainda **não decididas**. Servem como lista de opções para as semanas 3 a 5:

- Comparação com o desempenho de um atleta real, jogando a mesma build, como "fantasma" no replay.
- Atleta como narrador da experiência, com áudio gravado por ele.
- "Mitos e verdades" antes e depois da experiência, para medir mudança de percepção.
- Mecânica do "voy" (aviso de aproximação) com detecção de voz pelo microfone.
- Papel do chamador e do goleiro como experiências adicionais.
- Visualização do áudio (ondas) em um modo de replay explicativo.
- Tela espelhada para a plateia em eventos.
- QR code final com agenda de jogos e clubes da região.
- Testes com pessoas cegas e com baixa visão, e audiodescrição nos menus.
- Sala de conquistas com dados pesquisados e conferidos sobre a história do esporte.
