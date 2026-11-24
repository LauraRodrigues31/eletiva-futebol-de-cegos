# Testes

Este documento diz **o que** é testado no projeto e **como** testar. Ele é vivo: cresce conforme a Laura e a Anna vão implementando as tarefas.

> **Regra:** quem implementa uma funcionalidade adiciona aqui, no mesmo PR, as checagens dela (seção 3 ou 4) e, se tiver lógica pura, os testes automáticos em `tests/`. Uma funcionalidade só está pronta quando as checagens dela passam.

## Sumário

1. [Tipos de teste](#1-tipos-de-teste)
2. [Testes automáticos (T1)](#2-testes-automáticos-t1)
3. [Checagens da Laura (jogabilidade e dados)](#3-checagens-da-laura-jogabilidade-e-dados)
4. [Checagens da Anna (áudio, visual e UX)](#4-checagens-da-anna-áudio-visual-e-ux)
5. [Roteiro completo no Quest](#5-roteiro-completo-no-quest)
6. [Testes com pessoas de fora](#6-testes-com-pessoas-de-fora)
7. [Lacunas conhecidas](#7-lacunas-conhecidas)
8. [Histórico de execuções](#8-histórico-de-execuções)
9. [Como adicionar uma checagem](#9-como-adicionar-uma-checagem)

---

## 1. Tipos de teste

| Tipo | O que mostra | Onde | Quem roda | Quando |
|---|---|---|---|---|
| **T1. Automático** | Regras do jogo (lógica pura em `src/logic/`) | Terminal | Todo mundo, e o Claude a cada mudança | Antes de **todo** commit |
| **T2. Computador** | A cena de verdade, com mouse e teclado no lugar do óculos | Chrome no `localhost` | Quem implementou | Antes de abrir o PR |
| **T3. Quest 3** | Escala real, altura do chão, andar de verdade, som espacial | Navegador do Quest, pelo link | A dupla | Depois do merge na `main` |

### T1. Testes automáticos

1. No terminal, na pasta do projeto:
   ```
   node --test
   ```
   (Ele encontra sozinho os arquivos `tests/*.test.js`. O mesmo comando existe como `npm test`.)
2. No resumo final tem que aparecer `fail 0`. Se algum teste falhar, o nome dele e o valor esperado × recebido aparecem logo acima.

**Não commite com teste falhando.**

### T2. Teste no computador

1. No terminal, na pasta do projeto, rode `npx serve .` (na primeira vez, responda `y` para instalar). Ele mostra um endereço como `http://localhost:3000`.
2. Abra no Chrome **com `?debug=1`**: `http://localhost:3000/?debug=1`.
3. Abra o console: **F12 → aba Console**. Com o debug ligado, todo evento do contrato aparece ali, por exemplo:
   `[evento] ball-reached { distance: 0.3, timeMs: 3120 }`
4. Controles:

   | Ação | Tecla |
   |---|---|
   | Olhar em volta (e mirar o chute) | clicar e arrastar |
   | Andar | W A S D |
   | Chutar (bola perto e parada) | barra de espaço |
   | Avançar o estado do jogo | N |
   | Recolocar a bola no lugar | R |

5. Depois de mudar o código, recarregue com **Ctrl + Shift + R** (sem cache).
6. Para parar o servidor: **Ctrl + C** no terminal.

**Atalhos de URL** (só com `?debug=1`):
- `?debug=1&estado=fase2` abre direto em um estado (`vestiario`, `entrada-campo`, `tutorial`, `fim-tutorial`, `fase2`, `fase3`, `resultado`).

### T3. Teste no Quest 3

1. Depois do merge na `main`, espere de 1 a 2 minutos. A publicação aparece na aba **Actions** do GitHub (precisa estar verde).
2. **Segurança:** espaço livre de pelo menos 3 × 3 m, uma marca no chão no centro, Guardian do Quest configurado em volta e **sempre uma pessoa acompanhando**.
3. Em pé sobre a marca, olhando para onde o gol deve ficar, abra no navegador do Quest:
   `https://laurarodrigues31.github.io/eletiva-futebol-de-cegos/?debug=1`
4. Se parecer uma versão antiga, recarregue. A versão aparece no painel de debug (`v0.1.0` …).
5. Clique em **Enter VR**. O painel de debug aparece no canto da visão.

| Ação no Quest | Botão |
|---|---|
| Chutar (bola perto e parada) | **gatilho** de qualquer controle (a direção é para onde o controle aponta) |
| Avançar o estado do jogo | **B** (controle direito) |
| Recolocar a bola no lugar | **A** (controle direito) |

Com `?debug=1`, uma **linha azul** sai da bola mostrando para onde o chute iria, e o chão na linha do gol mostra as **zonas**: verde = gol, vermelho = trave.

(Opcional: para ver o console do Quest no computador, ligue o óculos por cabo USB, ative o modo desenvolvedor e abra `chrome://inspect` no Chrome.)

---

## 2. Testes automáticos (T1)

Situação em 24/11: **46 testes, todos passando.**

| Arquivo | O que cobre | Testes |
|---|---|---|
| [`tests/kick.test.js`](../tests/kick.test.js) | Direção do chute no chão (normalizada); controle quase vertical usa a cabeça; pode chutar só em fase jogável com a bola esperando e perto; mão permitida pela configuração | 6 |
| [`tests/physics.test.js`](../tests/physics.test.js) | Atrito reduz a velocidade sem mudar a direção; a bola para abaixo da velocidade mínima e não anda para trás; passo de tempo limitado; distância percorrida = v² / (2a); chute padrão anda 15 m | 6 |
| [`tests/goal.test.js`](../tests/goal.test.js) | Limites do gol (1,35 m) e da trave (1,65 m); lados da trave; limites mudam com a configuração; cruzamento interpolado (bola rápida não "pula" a trave); sem cruzamento indo para trás; rebote; limites do campo | 9 |
| [`tests/area.test.js`](../tests/area.test.js) | Limites da área para tamanhos diferentes; pontos dentro, fora e na borda; margem; saída e volta com histerese (sem evento repetido); conversão físico ↔ virtual com escala 1 e 2; posição do gol | 8 |
| [`tests/state-machine.test.js`](../tests/state-machine.test.js) | Estado inicial; todas as transições válidas e o reinício; transições inválidas rejeitadas sem mudar nada; tentativa 1 nas fases jogáveis; percorrer o jogo inteiro; eventos só valem no estado certo; próximo na sequência; `detail` do `state-change` (`from: null` na primeira emissão, `phase` = `to`, `attempt`) | 11 |
| [`tests/proximity.test.js`](../tests/proximity.test.js) | Distância no chão ignorando a altura; alcançar abaixo de 0,5 m; exatamente 0,5 m não alcança; histerese entre 0,5 e 0,7 m; afastar acima de 0,7 m; uma aproximação gera um único evento | 6 |

Ao adicionar um arquivo de teste, inclua uma linha nesta tabela.

---

## 3. Checagens da Laura (jogabilidade e dados)

Cada checagem tem um código para ser citada no histórico (seção 8). ✅ = passou, ❌ = falhou, ⏳ = ainda não feita.

### 3.1 Cena base e publicação (seg 23/11)

| Código | Tipo | Como fazer | Resultado esperado | Status |
|---|---|---|---|---|
| L-CENA-01 | T2 | Abrir `localhost` | A cena aparece, o gol fica à frente e WASD anda | ✅ (Claude, headless) |
| L-CENA-02 | T3 | Abrir o link no Quest e clicar em Enter VR | Entra no modo imersivo sem erro | ⏳ |
| L-CENA-03 | T3 | Olhar para baixo dentro do VR | O chão virtual está na altura do chão real | ⏳ |
| L-CENA-04 | T3 | Olhar para a frente ao entrar | O gol está à frente, a uns 4,5 m | ⏳ |

### 3.2 Máquina de estados e modo debug (seg 23/11)

| Código | Tipo | Como fazer | Resultado esperado | Status |
|---|---|---|---|---|
| L-ESTADO-01 | T2 | Abrir com `?debug=1` | O painel mostra `estado: vestiario` | ✅ (Claude, headless) |
| L-ESTADO-02 | T2 | Apertar **N** várias vezes | Passa por `vestiario → entrada-campo → tutorial → fim-tutorial → fase2 → fase3 → resultado → vestiario`, e cada troca aparece no console como `state-change` | ✅ (Claude, headless) |
| L-ESTADO-03 | T2 | Abrir com `?debug=1&estado=fase2` | Começa direto na `fase2`, com `tentativa: 1` | ✅ (Claude, headless) |
| L-ESTADO-04 | T2 | Abrir **sem** `?debug=1` e apertar N | Sem painel; N não faz nada | ✅ (Claude, headless) |
| L-ESTADO-05 | T2 | Abrir com `?debug=1&estado=xyz` | Aviso no console e o jogo começa no `vestiario` | ✅ (Claude, headless) |
| L-ESTADO-06 | T3 | Apertar **B** no controle direito | Avança o estado como a tecla N | ⏳ |
| L-ESTADO-07 | T3 | Ler o painel dentro do VR | Texto legível, sem atrapalhar a visão | ⏳ |

### 3.3 Área de jogo (ter 24/11)

| Código | Tipo | Como fazer | Resultado esperado | Status |
|---|---|---|---|---|
| L-AREA-01 | T2 | Andar com WASD até passar do contorno | O contorno fica vermelho e aparece **um** `area-exit` | ✅ (Claude, headless) |
| L-AREA-02 | T2 | Ficar parado perto da borda | Nenhum evento repetido | ✅ (Claude, headless) |
| L-AREA-03 | T2 | Voltar para o centro | O contorno volta a branco e aparece **um** `area-enter` | ✅ (Claude, headless) |
| L-AREA-04 | T3 | Andar fisicamente até a borda | O painel mostra `area: fora` e o contorno fica vermelho | ⏳ |
| L-AREA-05 | T3 | Andar 1 m de verdade | A visão anda 1 m (escala 1:1); sem enjoo | ⏳ |

### 3.4 Bola e proximidade (ter 24/11)

| Código | Tipo | Como fazer | Resultado esperado | Status |
|---|---|---|---|---|
| L-BOLA-01 | T2 | Ir ao estado `tutorial` | A bola aparece 1 m à frente e `ball-spawned` aparece no console | ✅ (Claude, headless) |
| L-BOLA-02 | T2 | Andar até a bola | **Um** `ball-reached`, com `timeMs` coerente | ✅ (Claude, headless) |
| L-BOLA-03 | T2 | Ficar parado perto da bola | Nenhum `ball-reached` repetido | ✅ (Claude, headless) |
| L-BOLA-04 | T2 | Recuar | **Um** `ball-left` | ✅ (Claude, headless) |
| L-BOLA-05 | T2 | Ir a `fim-tutorial` ou `resultado` | A bola some | ✅ (Claude, headless) |
| L-BOLA-06 | T3 | Andar fisicamente até a bola | O painel mostra a distância caindo e `perto` abaixo de 0,5 m | ⏳ |
| L-BOLA-07 | T3 | Avaliar o raio de 0,5 m | Parece natural "chegar na bola"? Anotar se precisa ajustar `bola.raioAlcance` no config | ⏳ |

### 3.5 Chute, física e gol (qua 25/11)

Ordem de eventos esperada em todo chute: `kick → (post-hit)? → goal | miss → ball-stopped`.

| Código | Tipo | Como fazer | Resultado esperado | Status |
|---|---|---|---|---|
| L-CHUTE-01 | T2 | No `vestiario`, apertar espaço | Nada acontece; console: `[chute] ignorado: fora de uma fase jogável` | ✅ (Claude, headless) |
| L-CHUTE-02 | T2 | No `tutorial`, longe da bola, apertar espaço | Nada acontece; console: `[chute] ignorado: bola longe` | ✅ (Claude, headless) |
| L-CHUTE-03 | T2 | Perto da bola | A linha azul de mira aparece saindo da bola | ✅ (Claude, headless) |
| L-CHUTE-04 | T2 | Perto da bola, olhando para o gol, apertar espaço | **Um** `kick` com `hand: 'keyboard'` e a bola rola | ✅ (Claude, headless) |
| L-CHUTE-05 | T2 | Apertar espaço com a bola já chutada | Ignorado: `bola rolando` ou `bola parada` | ✅ (Claude, headless) |
| L-CHUTE-06 | T3 | Perto da bola, apontar o controle para o gol e apertar o gatilho | A linha azul acompanha o controle e o chute vai para onde ele aponta | ⏳ |
| L-CHUTE-07 | T3 | Chutar com a mão esquerda | Também chuta (as duas mãos valem) | ⏳ |
| L-CHUTE-08 | T3 | Sentir o controle ao chutar | Vibra um pulso curto | ⏳ |
| L-CHUTE-09 | T3 | Apontar o controle reto para o chão e chutar | Usa a direção da cabeça (não chuta para um lado aleatório) | ⏳ |
| L-FISICA-01 | T2 | Chutar e observar | A bola rola, desacelera, gira e para; **um** `ball-stopped` | ✅ (Claude, headless) |
| L-FISICA-02 | T2 | Ficar de costas para o gol e chutar | A bola anda ~15 m, para e sai `miss` com `reason: 'curta'` | ✅ (Claude, headless) |
| L-FISICA-03 | T2 | Depois do chute, olhar o painel | `dist: pausada` (proximidade pausada até recolocar) | ✅ (Claude, headless) |
| L-FISICA-04 | T2 | Apertar R | A bola volta ao lugar, `ball-spawned`, estado `esperando` | ✅ (Claude, headless) |
| L-FISICA-05 | T3 | Chutar no Quest | A velocidade (6 m/s) parece natural? Anotar se precisa ajustar `chute.velocidade` | ⏳ |
| L-GOL-01 | T2 | Chutar reto no gol | `goal`; a bola para no fundo da rede; painel `ultimo: gol` | ✅ (Claude, headless) |
| L-GOL-02 | T2 | Mirar ~23° para a direita e chutar | `post-hit` (`side: 'right'`), `miss` (`trave`); a bola volta | ✅ (Claude, headless) |
| L-GOL-03 | T2 | Mirar ~40° para a esquerda e chutar | `miss` (`fora`) | ✅ (Claude, headless) |
| L-GOL-04 | T2 | Com `?debug=1`, olhar a linha do gol | Faixa verde no gol e vermelhas nas traves | ✅ (Claude, headless) |
| L-GOL-05 | T2 | Sem `?debug=1` | Sem faixas, sem linha de mira | ✅ (Claude, headless) |
| L-GOL-06 | T3 | Chutar na trave no Quest | Faixa vermelha coincide com a trave desenhada | ⏳ |

---

## 4. Checagens da Anna (áudio, visual e UX)

> Seção para a Anna preencher conforme implementar. As linhas abaixo são **sugestões** a partir do plano diário. Ajuste, apague ou adicione o que fizer sentido.

### 4.1 Sons e licenças (seg 23/11)

| Código | Tipo | Como fazer | Resultado esperado | Status |
|---|---|---|---|---|
| A-SOM-01 | Leitura | Conferir a lista de sons | Cada som tem fonte e licença anotadas | ⏳ |

### 4.2 Vestiário e venda (seg 23/11)

| Código | Tipo | Como fazer | Resultado esperado | Status |
|---|---|---|---|---|
| A-VENDA-01 | T2 | No `vestiario`, apertar o botão da venda | A tela escurece e `blindfold-on` aparece no console | ⏳ |
| A-VENDA-02 | T2 | Depois da venda | O jogo vai para `entrada-campo` | ⏳ |
| A-VENDA-03 | T3 | Colocar a venda no Quest | O escuro ocupa toda a visão; o painel de debug continua visível | ⏳ |

### 4.3 Entrada em campo e guizo (ter 24/11)

| Código | Tipo | Como fazer | Resultado esperado | Status |
|---|---|---|---|---|
| A-CAMPO-01 | T2 | Depois da venda | Toca o som do estádio e `field-entered` leva ao `tutorial` | ⏳ |
| A-GUIZO-01 | T2 | No `tutorial`, com fone | O guizo toca em loop, vindo da bola | ⏳ |
| A-GUIZO-02 | T3 | Girar a cabeça com a bola parada | O som muda de lado conforme a cabeça gira | ⏳ |
| A-GUIZO-03 | T3 | De olhos fechados, apontar para a bola | A pessoa acerta a direção só pelo som | ⏳ |
| A-GUIZO-04 | T3 | Comparar o volume do guizo com o ambiente | O guizo é ouvido com o estádio tocando | ⏳ |

---

## 5. Roteiro completo no Quest

Feito pela dupla depois de cada merge na `main` que mude o jogo. Atualize os passos quando entrarem novas fases.

1. Preparar o espaço (seção 1, T3, item 2).
2. Em pé sobre a marca, olhando para a frente, abrir o link com `?debug=1` e clicar em **Enter VR**.
3. Conferir o chão na altura certa e o gol à frente (L-CENA-03, L-CENA-04).
4. Apertar **B** até `tutorial`. A bola aparece a 1 m à frente (L-BOLA-01).
5. Andar até a bola. O painel mostra `perto` (L-BOLA-06).
6. Recuar. O painel mostra `longe`.
7. Andar até a borda da área. O contorno fica vermelho e o painel mostra `area: fora` (L-AREA-04).
8. Voltar até a bola. Apontar o controle para o gol: a linha azul acompanha (L-CHUTE-06).
9. Apertar o **gatilho**: o controle vibra e a bola rola até o gol (L-CHUTE-08, L-GOL-01).
10. Apertar **A** para recolocar a bola. Chutar com a outra mão, mirando na trave (L-CHUTE-07, L-GOL-06).
11. Apertar **A**, apontar o controle para o chão e chutar olhando para o gol (L-CHUTE-09).
12. Apertar **B** até `resultado` e de novo: volta ao `vestiario` (L-ESTADO-06).

**Anotar sempre:** altura do chão, sensação de escala, se o raio da bola parece certo, se a direção do chute bate com o controle, se a velocidade da bola parece natural, legibilidade do painel e qualquer enjoo. Registrar na seção 8.

---

## 6. Testes com pessoas de fora

Previstos para a semana 2 (03/12): 3 a 5 pessoas que não conhecem o projeto, jogando até o fim **sem instrução** (critério de pronto da POC no [PRD](PRD.md)).

Para cada pessoa, anotar: chegou até o fim? onde travou? quanto tempo levou? sentiu enjoo ou insegurança? o que disse ao sair (respeito × pena)? Os registros entram na seção 8.

---

## 7. Lacunas conhecidas

O que ainda **não** é testado, e por quê:

| Lacuna | Por quê | Plano |
|---|---|---|
| Posição da cabeça no VR (rastreamento real) | Só o Quest fornece | Checagens T3 (L-AREA-05, L-BOLA-06) |
| Botões A e B e o gatilho dos controles | Só o Quest fornece | L-ESTADO-06, L-CHUTE-06 e 07 |
| Direção do chute pelo controle (frente do controle no mundo) | No computador o chute usa a câmera; só o Quest tem controle rastreado | L-CHUTE-06 e 09 |
| Vibração | Só o Quest fornece | L-CHUTE-08 |
| Componentes A-Frame (`ball`, `kicker`) não têm teste automático | Precisam do navegador; a lógica deles está em `src/logic/` e é testada | Checagens T2 desta lista |
| Os T2 marcados "Claude, headless" | Foram feitos pelo Claude num Chrome sem tela, movendo a câmera por código, e não por uma pessoa com WASD | Repetir à mão antes de dar a funcionalidade como pronta |

---

## 8. Histórico de execuções

Uma linha por sessão de teste, a mais recente no topo.

| Data | Quem | Tipo | Versão / commit | Resultado | Observações |
|---|---|---|---|---|---|
| 24/11 | Claude | T2 (Chrome headless) | `v0.2.0` | ✅ L-CHUTE-01 a 05, L-FISICA-01 a 04, L-GOL-01 a 05 | Mira do chute girando a câmera por código; trave a 23° e fora a 40° |
| 24/11 | Claude | T1 | `v0.2.0` | ✅ 46/46 | Novos: `kick`, `physics`, `goal` e `detail` do `state-change` |
| 24/11 | Claude | T2 (Chrome headless) | `v0.1.0` | ✅ L-CENA-01, L-ESTADO-01 a 05, L-AREA-01 a 03, L-BOLA-01 a 05 | Câmera movida por código para simular o andar |
| 24/11 | Claude | T1 | `v0.1.0` | ✅ 22/22 | — |

---

## 9. Como adicionar uma checagem

1. Escolha a seção da dona da funcionalidade (3 para a Laura, 4 para a Anna) e a subseção do dia.
2. Crie um código: `L-` ou `A-`, o nome curto da funcionalidade e um número (`L-CHUTE-01`).
3. Preencha: tipo (T1, T2, T3 ou Leitura), como fazer, resultado esperado e status ⏳.
4. Se a funcionalidade tiver lógica pura, adicione os testes em `tests/` e uma linha na tabela da seção 2.
5. Se ela mudar o fluxo do jogo no óculos, atualize o roteiro da seção 5.
6. Depois de testar, atualize o status e registre na seção 8.
