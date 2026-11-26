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
   | Olhar em volta (e mirar o chute) | clicar uma vez para travar e esconder o mouse, depois só mover (Esc solta) |
   | Pegar a venda no vestiário | pôr a mira (anel no centro da tela) na venda e clicar |
   | Andar | W A S D (~3,5 m/s no vestiário e no campo; um toque anda ~0,4 m) |
   | Andar devagar (para parar no raio da bola) | segurar **Shift** junto com W A S D (~1,2 m/s) |
   | Preparar o chute (bola perto e parada) | E |
   | Mirar (depois de preparar) | a mira amarela aparece no centro da tela; a bola vai exatamente onde ela aponta, inclusive na altura (rasteiro, alto, travessão, por cima) |
   | Chutar (depois de preparar) | clique esquerdo com o mouse travado, ou barra de espaço |
   | Avançar o estado do jogo (só com debug) | N |
   | Ligar e desligar a visão (camada preta da venda, só com debug) | V |
   | Recolocar a bola no lugar (com ou sem debug) | R |

   Ao sair do vestiário (e ao voltar para ele), a câmera volta ao centro da área, de frente para o gol.

5. Depois de mudar o código, recarregue com **Ctrl + Shift + R** (sem cache).
6. Para parar o servidor: **Ctrl + C** no terminal.

**Atalhos de URL** (só com `?debug=1`):
- `?debug=1&estado=fase2` abre direto em um estado (`vestiario`, `entrada-campo`, `tutorial`, `fim-tutorial`, `fase2`, `fase3`, `resultado`).
- `?debug=1&visao=0` abre vendado (camada preta) e `?debug=1&visao=1` abre com a visão livre. Sem `visao`, vale `CONFIG.venda.visaoLivre`.

### T3. Teste no Quest 3

1. Depois do merge na `main`, espere de 1 a 2 minutos. A publicação aparece na aba **Actions** do GitHub (precisa estar verde).
2. **Segurança:** espaço livre de pelo menos 3 × 3 m, uma marca no chão no centro, Guardian do Quest configurado em volta e **sempre uma pessoa acompanhando**.
3. Em pé sobre a marca, olhando para onde o gol deve ficar, abra no navegador do Quest:
   `https://laurarodrigues31.github.io/eletiva-futebol-de-cegos/?debug=1`
4. Se parecer uma versão antiga, recarregue. A versão aparece no painel de debug (`v0.1.0` …).
5. Clique em **Enter VR**. O painel de debug aparece no canto da visão.

| Ação no Quest | Botão |
|---|---|
| Preparar o chute (bola perto e parada) | **grip** (botão lateral) de qualquer controle; vibra fraco |
| Chutar (depois de preparar) | **gatilho** de qualquer controle. A bola vai para onde o controle aponta, inclusive na altura. No Quest não há mira na tela |
| Avançar o estado do jogo (só com debug) | **B** (controle direito) |
| Ligar e desligar a visão (só com debug) | **Y** (controle esquerdo) |
| Recolocar a bola no lugar (com ou sem debug) | **A** (controle direito) |

Com `?debug=1`, depois de preparar o chute, uma **linha azul** vai da bola até o ponto mirado (na linha do gol, com a altura), e o chão na linha do gol mostra as **zonas**: verde = gol, vermelho = trave.

(Opcional: para ver o console do Quest no computador, ligue o óculos por cabo USB, ative o modo desenvolvedor e abra `chrome://inspect` no Chrome.)

---

## 2. Testes automáticos (T1)

Situação em 26/11: **146 testes, todos passando.**

| Arquivo | O que cobre | Testes |
|---|---|---|
| [`tests/brilho.test.js`](../tests/brilho.test.js) | Contorno = duas traves + travessão; caminho sobe a trave esquerda, atravessa o travessão e desce a direita; distâncias fora presas nas pontas; sem trecho fora da passagem; recomeça a cada intervalo; no meio de uma barra o trecho fica só nela, com o comprimento configurado; no canto se divide entre trave e travessão sem perder comprimento; entra pela base da trave esquerda e sai pela base da direita; por padrão só o `tutorial` tem brilho | 9 |
| [`tests/ondas.test.js`](../tests/ondas.test.js) | Um item por arco; raio sempre entre o inicial e o final; primeiro arco nasce apagado no raio inicial; loop a cada período; arcos igualmente espaçados; acende no começo e apaga no fim do ciclo; por padrão só o `tutorial` tem ondas; cada fase define se tem ondas e a opacidade (limitada entre 0 e 1) | 8 |
| [`tests/visao.test.js`](../tests/visao.test.js) | `?visao=1` abre com a visão livre e `?visao=0` vendado; sem o parâmetro ou com valor inválido vale o config | 2 |
| [`tests/mira.test.js`](../tests/mira.test.js) | Ponto mirado na linha do gol, no chão ou à distância padrão; altura limitada; sem alvo mirando para cima; **a bola simulada passo a passo cruza a linha do gol a menos de 2 cm do ponto mirado** (meio, canto alto, rasteiro, travessão, por cima, trave, fora); mirando o chão sai rolando; alvo atrás da bola chuta para a frente | 15 |
| [`tests/tutorial.test.js`](../tests/tutorial.test.js) | Dicas do tutorial seguem o chute (andar, preparar, mirar, somem no chute); voltam para "andar" ao se afastar; eventos sem dica devolvem null; todo texto tem a versão do computador | 4 |
| [`tests/kick.test.js`](../tests/kick.test.js) | Direção do chute no chão (normalizada); controle quase vertical usa a cabeça; pode preparar só em fase jogável com a bola esperando e perto; pode chutar só com o chute preparado e as mesmas condições; mão permitida pela configuração | 9 |
| [`tests/physics.test.js`](../tests/physics.test.js) | Atrito reduz a velocidade sem mudar a direção; a bola para abaixo da velocidade mínima e não anda para trás; passo de tempo limitado; distância percorrida = v² / (2a); chute padrão anda 15 m; rebote nas bandas laterais (face interna a 9,9 m, espelhado dos dois lados, perde velocidade lateral, chute na diagonal nunca entra na banda); voo em 3D (no chão igual ao rasteiro, gravidade sem atrito no ar, altura y0 + vy·t − g·t²/2, quique mais baixo e mais lento, quique fraco vira rolagem, bola lançada acaba parada no chão, banda preserva a altura) | 18 |
| [`tests/goal.test.js`](../tests/goal.test.js) | Limites do gol (1,69 m) e da trave (1,97 m), com trave de 8 cm; lados da trave; limites mudam com a configuração; cruzamento interpolado (bola rápida não "pula" a trave); sem cruzamento indo para trás; rebote; limites do campo; gol em 3D (rede, travessão, por cima, fora); cruzamento interpola x e y; rebote no travessão | 12 |
| [`tests/area.test.js`](../tests/area.test.js) | Limites da área para tamanhos diferentes; pontos dentro, fora e na borda; margem; saída e volta com histerese (sem evento repetido); conversão físico ↔ virtual com escala 1 e 2; escala padrão ≥ 2 (área 6 × 6 no campo); deslocamento do rig = (escala − 1) × cabeça; bola 0,5 m real dentro da borda da frente; gol a 6 m da marca | 12 |
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
| L-CENA-04 | T3 | Olhar para a frente ao entrar | A bola está na marca do pênalti, 2 m à frente (1 m real), e o gol a uns 8 m | ⏳ |

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
| L-AREA-05 | T3 | Andar 1 m de verdade no campo | A visão anda 2 m (escala 2); no vestiário anda 1 m; anotar se dá enjoo | ⏳ |

### 3.4 Bola e proximidade (ter 24/11)

| Código | Tipo | Como fazer | Resultado esperado | Status |
|---|---|---|---|---|
| L-BOLA-01 | T2 | Ir ao estado `tutorial` | A bola aparece 2 m à frente (1 m real) e `ball-spawned` aparece no console | ✅ (Claude, headless) |
| L-BOLA-02 | T2 | Andar até a bola | **Um** `ball-reached`, com `timeMs` coerente | ✅ (Claude, headless) |
| L-BOLA-03 | T2 | Ficar parado perto da bola | Nenhum `ball-reached` repetido | ✅ (Claude, headless) |
| L-BOLA-04 | T2 | Recuar | **Um** `ball-left` | ✅ (Claude, headless) |
| L-BOLA-05 | T2 | Ir a `fim-tutorial` ou `resultado` | A bola some | ✅ (Claude, headless) |
| L-BOLA-06 | T3 | Andar fisicamente até a bola | O painel mostra a distância caindo e `perto` abaixo de 0,5 m | ⏳ |
| L-BOLA-07 | T3 | Avaliar o raio de 0,5 m | Parece natural "chegar na bola"? Anotar se precisa ajustar `bola.raioAlcance` no config | ⏳ |

### 3.5 Chute, física e gol (qua 25/11)

Ordem de eventos esperada em todo chute: `ball-reached → kick-ready → kick → (post-hit)? → goal | miss → ball-stopped`.

O chute tem duas etapas: preparar (E / grip) e chutar (clique ou espaço / gatilho). Os casos marcados com ✅ abaixo foram testados antes do preparo existir. Refaça-os com o passo de preparar.

| Código | Tipo | Como fazer | Resultado esperado | Status |
|---|---|---|---|---|
| L-CHUTE-01 | T2 | No `vestiario`, apertar espaço | Nada acontece; console: `[chute] ignorado: fora de uma fase jogável` | ✅ (Claude, headless) |
| L-CHUTE-02 | T2 | No `tutorial`, longe da bola, apertar espaço | Nada acontece; console: `[chute] ignorado: bola longe` | ✅ (Claude, headless) |
| L-CHUTE-03 | T2 | Perto da bola, apertar E | Um `kick-ready` com `hand: 'keyboard'`; o painel mostra `chute: preparado` e a linha azul de mira aparece saindo da bola | ⏳ |
| L-CHUTE-04 | T2 | Perto da bola, apertar E, olhar para o gol e clicar (mouse travado) ou apertar espaço | **Um** `kick` com `hand: 'keyboard'` e a bola rola | ⏳ |
| L-CHUTE-05 | T2 | Apertar espaço com a bola já chutada | Ignorado: `bola rolando` ou `bola parada` | ✅ (Claude, headless) |
| L-CHUTE-06 | T3 | Perto da bola, apertar o grip, apontar o controle para o gol e apertar o gatilho | A linha azul acompanha o controle e o chute vai para onde ele aponta | ⏳ |
| L-CHUTE-07 | T3 | Chutar com a mão esquerda | Também chuta (as duas mãos valem) | ⏳ |
| L-CHUTE-08 | T3 | Sentir o controle ao chutar | Vibra um pulso curto | ⏳ |
| L-CHUTE-09 | T3 | Apontar o controle reto para o chão e chutar | Usa a direção da cabeça (não chuta para um lado aleatório) | ⏳ |
| L-CHUTE-10 | T2 | Perto da bola, sem apertar E, clicar ou apertar espaço | Nada acontece; console: `[chute] ignorado: chute não preparado` | ⏳ |
| L-CHUTE-11 | T2 | Longe da bola, apertar E | Nada acontece; console: `[chute] preparo ignorado: bola longe` | ⏳ |
| L-CHUTE-12 | T2 | Preparar e se afastar da bola (ou apertar R) | Um `kick-cancel` com `reason: 'bola longe'` (ou `'bola recolocada'`); o painel volta a `chute: -` e a linha azul some | ⏳ |
| L-CHUTE-13 | T3 | Perto da bola, apertar o grip | O controle vibra fraco (mais fraco que o chute) e aparece `kick-ready` | ⏳ |
| L-CHUTE-14 | T3 | Perto da bola, apertar o gatilho sem o grip | Nada acontece | ⏳ |
| L-FISICA-01 | T2 | Chutar e observar | A bola rola, desacelera, gira e para; **um** `ball-stopped` | ✅ (Claude, headless) |
| L-FISICA-02 | T2 | Ficar de costas para o gol e chutar | A bola anda ~15 m, para e sai `miss` com `reason: 'curta'` | ✅ (Claude, headless) |
| L-FISICA-03 | T2 | Depois do chute, olhar o painel | `dist: pausada` (proximidade pausada até recolocar) | ✅ (Claude, headless) |
| L-FISICA-04 | T2 | Apertar R | A bola volta ao lugar, `ball-spawned`, estado `esperando` | ✅ (Claude, headless) |
| L-FISICA-05 | T3 | Chutar no Quest | A velocidade (6 m/s) parece natural? Anotar se precisa ajustar `chute.velocidade` | ⏳ |
| L-FISICA-06 | T2 | Virar 90° para um lado (de frente para a banda) e chutar | A bola bate na banda a ~3,5 m/s, volta para dentro sem entrar nela, rola ~1,8 m e para perto de `x = ±8`; termina com `miss` (`curta`), nunca `saiu` | ⏳ |
| L-GOL-01 | T2 | Chutar reto no gol | `goal`; a bola para no fundo da rede; painel `ultimo: gol` | ✅ (Claude, headless) |
| L-GOL-02 | T2 | Mirar ~27° para a direita e chutar | `post-hit` (`side: 'right'`), `miss` (`trave`); a bola volta | ⏳ (refazer: com o gol de 3,66 m e a trave de 8 cm, a trave fica entre 26° e 29°) |
| L-GOL-03 | T2 | Mirar ~40° para a esquerda e chutar | `miss` (`fora`) | ✅ (Claude, headless) |
| L-GOL-04 | T2 | Com `?debug=1`, olhar a linha do gol | Faixa verde no gol e vermelhas nas traves | ✅ (Claude, headless) |
| L-GOL-05 | T2 | Sem `?debug=1` | Sem faixas, sem linha de mira | ✅ (Claude, headless) |
| L-GOL-06 | T3 | Chutar na trave no Quest | Faixa vermelha coincide com a trave desenhada pelo estádio | ⏳ |

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
| A-VENDA-03 | T3 | Colocar a venda no Quest com `visaoLivre: false` (ou `?visao=0`) | O escuro ocupa toda a visão; apertar **Y** tira a camada e mostra o painel de debug | ⏳ |

### 4.3 Entrada em campo e guizo (ter 24/11)

| Código | Tipo | Como fazer | Resultado esperado | Status |
|---|---|---|---|---|
| A-CAMPO-01 | T2 | Depois da venda | Toca o som do estádio e `field-entered` leva ao `tutorial` | ⏳ |
| A-GUIZO-01 | T2 | No `tutorial`, com fone | O guizo toca em loop, vindo da bola | ⏳ |
| A-GUIZO-02 | T3 | Girar a cabeça com a bola parada | O som muda de lado conforme a cabeça gira | ⏳ |
| A-GUIZO-03 | T3 | De olhos fechados, apontar para a bola | A pessoa acerta a direção só pelo som | ⏳ |
| A-GUIZO-04 | T3 | Comparar o volume do guizo com o ambiente | O guizo é ouvido com o estádio tocando | ⏳ |

### 4.4 Ondas da bola e liga/desliga da visão (qui 26/11)

| Código | Tipo | Como fazer | Resultado esperado | Status |
|---|---|---|---|---|
| A-ONDA-01 | T2 | Abrir `?debug=1&estado=tutorial` e andar em volta da bola | Arcos `( ● )` dos dois lados da bola, crescendo e sumindo em loop, sempre dos lados na tela | ⏳ |
| A-ONDA-02 | T2 | No `tutorial`, apertar **V** | A tela fica toda preta e só os arcos aparecem; o console mostra `[debug] visão vendada`. V de novo volta a visão | ⏳ |
| A-ONDA-03 | T2 | Chutar a bola no `tutorial` | Os arcos acompanham a bola rolando, sem girar junto com ela | ⏳ |
| A-ONDA-04 | T2 | Apertar **N** até `fase2`, `fase3` e `resultado` | Sem arcos | ⏳ |
| A-ONDA-05 | T2 | Pôr `CONFIG.ondas.fases.fase2` com `ativa: true` e `opacidade: 0.3` | Arcos fracos na `fase2` | ⏳ |
| A-ONDA-06 | T2 | Abrir `?debug=1&estado=tutorial&visao=0`; depois abrir sem `?debug=1` e apertar V | Já abre vendado, com o painel mostrando `visao: vendada`; sem debug, V não faz nada | ⏳ |
| A-ONDA-07 | T3 | No Quest, no `tutorial`, apertar **Y** | Os arcos são legíveis no escuro e Y liga e desliga a visão | ⏳ |

### 4.5 Brilho nas traves (qui 26/11)

| Código | Tipo | Como fazer | Resultado esperado | Status |
|---|---|---|---|---|
| A-BRILHO-01 | T2 | Abrir `?debug=1&estado=tutorial` e olhar para o gol | A cada 5 s, um trecho azul sólido (mesma cor das ondas, sem degradê) sobe a trave esquerda, atravessa o travessão e desce a trave direita | ✅ (Claude, headless: subindo a trave esquerda) |
| A-BRILHO-02 | T2 | No `tutorial`, apertar **V** | O trecho aparece sobre o preto e mostra onde está o gol | ✅ (Claude, headless: no travessão) |
| A-BRILHO-03 | T2 | Apertar **N** até `fase2`, `fase3` e `resultado` | Sem brilho | ⏳ |
| A-BRILHO-04 | T3 | No Quest, da marca do pênalti, vendado | O brilho é visível e dá para apontar para o gol | ⏳ |

---

## 5. Roteiro completo no Quest

Feito pela dupla depois de cada merge na `main` que mude o jogo. Atualize os passos quando entrarem novas fases.

1. Preparar o espaço (seção 1, T3, item 2).
2. Em pé sobre a marca, olhando para a frente, abrir o link com `?debug=1` e clicar em **Enter VR**.
3. Conferir o chão na altura certa e o gol à frente (L-CENA-03, L-CENA-04).
4. Apertar **B** até `tutorial`. A bola aparece 1 m à frente, em passos de verdade (L-BOLA-01).
5. Andar até a bola. O painel mostra `perto` (L-BOLA-06).
6. Recuar. O painel mostra `longe`.
7. Andar até a borda da área. O contorno fica vermelho e o painel mostra `area: fora` (L-AREA-04).
8. Voltar até a bola. Apertar o **gatilho** sem preparar: nada acontece (L-CHUTE-14).
9. Apertar o **grip**: vibra fraco (L-CHUTE-13). Apontar o controle para o gol: a linha azul acompanha (L-CHUTE-06).
10. Apertar o **gatilho**: o controle vibra e a bola rola até o gol (L-CHUTE-08, L-GOL-01).
11. Apertar **A** para recolocar a bola. Preparar e chutar com a outra mão, mirando na trave (L-CHUTE-07, L-GOL-06).
12. Apertar **A**, preparar, apontar o controle para o chão e chutar olhando para o gol (L-CHUTE-09).
13. Apertar **B** até `resultado` e de novo: volta ao `vestiario` (L-ESTADO-06).

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
| 24/11 | Claude | T1 | campo integrado | ✅ 90/90 | Trave de 8 cm em `CONFIG.gol`, rebote nas bandas, sem `field-placeholder` e código sem comentários |
| 24/11 | Claude | T1 | pós-conflito da `main` | ✅ 85/85 | Medidas oficiais da IBSA alinhadas no conflito da configuração |
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
