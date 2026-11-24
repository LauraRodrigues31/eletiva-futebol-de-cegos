# Spec: Dev B, estádio (cena provisória de entrada em campo)

> Status: **aprovada, em implementação**
> Responsável: Anna (Dev B: áudio, visual e UX)
> Referências: [PRD](../PRD.md) (req. 2), [contrato de eventos](../EVENTOS.md), [spec do vestiário](dev-b-vestiario-venda.md)

## 1. Escopo

| Parte | O que é |
|---|---|
| Campo | Gramado com faixas e todas as marcações oficiais, por cima do `#campo` da Dev A. |
| Bandas laterais | As duas laterais inteiras, de uma linha de fundo à outra, com a marca dos terços. |
| Gols | Rede no `#gol` da frente e um segundo gol completo no fundo. |
| Pessoas | Chamadores, goleiros, técnicos, reservas no banco, árbitros e mesário. **Sem jogadores de linha** em campo (é uma peneira e o campo perto da área fica livre). |
| Torcida | Arquibancadas em degraus nos quatro lados, com cerca de 1.400 torcedores. |
| Ambiente | Chão externo, céu noturno, torres de refletor e luz própria. |
| Visão livre | **Provisório:** a venda não escurece no campo (`CONFIG.venda.visaoLivre`), para dar para testar o estádio. |

O estádio aparece em todos os estados **menos** `vestiario`. Fica para depois: som do estádio, `field-entered`, torcida reagindo ao gol e a venda escurecendo de novo.

## 2. Medidas (IBSA)

| Item | Medida | Onde está |
|---|---|---|
| Campo | 40 × 20 m | `CONFIG.campo` |
| Gol | 3,66 × 2,14 m (regra IBSA atual; antes era 3 × 2, de futsal) | `CONFIG.gol` |
| Trave | 8 cm | `CONFIG.estadio.trave.espessura` |
| Área do goleiro | 1 m além de cada trave e 2 m de fundo → 5,82 × 2 m | `CONFIG.estadio.areaGoleiro` |
| Área de pênalti | dois quartos de círculo de raio 6 m centrados nas traves, ligados por uma reta | `CONFIG.estadio.areaPenalti.raio` |
| Marca do pênalti | 6 m da linha do gol | `CONFIG.estadio.marcas.penalti` |
| Segunda marca | 8 m da linha do gol | `CONFIG.estadio.marcas.segundoPenalti` |
| Círculo central | raio 3 m | `CONFIG.estadio.circuloCentral` |
| Bandas | 1 m de altura, levemente inclinadas para fora, cobrindo as laterais | `CONFIG.estadio.banda` |
| Terços | 12 / 16 / 12 m: o goleiro orienta a defesa, o técnico o meio e o chamador o ataque (atrás do gol) | `CONFIG.estadio.terco` |
| Bola | raio 0,1 m (60–62 cm de circunferência) | `CONFIG.bola.raio` (sem mudança) |

Com o gol em `z = -4,5`, a linha reta da área de pênalti (6 m) cai em `z = 1,5`, que é exatamente a borda de trás da área de jogo 3 × 3. Ou seja, a pessoa joga dentro da área de pênalti.

## 3. Decisões

| # | Decisão | Motivo |
|---|---|---|
| E1 | **Gramado sobreposto.** As linhas são desenhadas num canvas de 1024 × 2048 (cerca de 2 cm por pixel) e aplicadas num plano opaco do tamanho do campo, 1 mm acima do `#campo`, com `polygonOffsetUnits: -4` (deslocamento constante, sem `factor`). O `#campo` e o `#gol` da Dev A não mudam. | Não mexe no código da Dev A. O deslocamento constante deixa o gramado por cima do `#campo` mesmo de longe, onde a precisão de profundidade é pior. De perto, ele é desprezível, então o contorno da área (`#area`, a 5 mm do chão) continua aparecendo. Com o `factor`, que escala com a inclinação, o gramado cobria o contorno. |
| E2 | **Torcida instanciada.** Todos os corpos ficam num `InstancedMesh` e todas as cabeças em outro, com cor por instância. | Cerca de 1.400 pessoas em 2 draw calls, o que cabe no Quest. |
| E3 | **Assentos sorteados com semente fixa** (`assentosTorcida`, em lógica pura). | Ocupação parcial e cores variadas, sempre iguais entre execuções e testáveis. |
| E4 | **Pessoas paradas e de baixa poligonagem**, feitas de caixas e esferas (`src/visual/pessoa.js`), com geometrias e materiais compartilhados. Os reservas usam venda e protetor de cabeça, e o chamador usa colete escrito GUIA. | É um placeholder leve, que mostra quem é quem sem modelos externos. |
| E5 | **Goleiro da frente ao lado da trave**, dentro da área do goleiro e fora do vão do gol. | Não tapa o alvo durante os testes de chute. |
| E6 | **Visão livre provisória.** Com `CONFIG.venda.visaoLivre: true`, `blindfold` entra no estado `posta`, mas a camada preta fica invisível. A animação de colocar a venda no vestiário não muda. | Pedido para testar o estádio. Para voltar ao comportamento final, basta pôr `false`. |
| E7 | **Texto provisório some sozinho.** Em `entrada-campo`, o aviso de cena em construção aparece por 5 s e some. | Não tapa o estádio. |

## 4. Layout (origem = marca no chão, frente = -z, vista de cima)

```
                 torcida (atrás do gol da frente)
            ─────────── alambrado ───────────
                        chamador
 z = -4,5   ┃━━━━━━━━━━━[ gol ]━━━━━━━━━━━━┃   gol da frente (#gol), goleiro ao lado da trave
            ┃          └─área─┘             ┃
            ┃           ( •  )  área 3×3    ┃
 torcida  T ┃ ─ terço (z = 7,5) ──────────  ┃ árbitro   torcida
 banco    T ┃            ( o )  meio campo  ┃
            ┃ ─ terço (z = 23,5) ─────────  ┃
 z = 35,5   ┃━━━━━━━━━━━[ gol ]━━━━━━━━━━━━┃   gol do fundo, goleiro no centro
                        chamador
            x = -10                      x = 10   (┃ = bandas)
```

T = técnicos, na lateral esquerda, no terço do meio. Os bancos de reservas e a mesa ficam entre a banda e a arquibancada.

## 5. Arquivos

```
src/logic/estadio.js            limites, marcações, bandas, pessoas, degraus e assentos (lógica pura)
src/visual/canvas.js            texturas do gramado, da banda, da rede e do céu
src/visual/pessoa.js            figura low-poly (em pé, sentada, goleiro, com venda ou colete)
src/components/estadio.js       monta o estádio e reage ao estado
src/components/blindfold.js     flag visaoLivre
src/components/cena-provisoria.js  texto provisório que some sozinho
tests/estadio.test.js
```

## 6. Pronto quando

- [ ] `node --test` termina com `fail 0`.
- [ ] Com `?debug=1&estado=entrada-campo`, a visão fica clara e aparecem o gol à frente com rede, o chamador atrás dele, as linhas sem piscar, as bandas, os técnicos e o banco, o gol do fundo com o goleiro e a torcida nos quatro lados.
- [ ] Do vestiário, a venda escurece a tela e, ao entrar no campo, a visão volta. A tecla N passa pelos estados com o estádio visível, e ao voltar a `vestiario` o estádio some.
- [ ] No Quest: o FPS fica estável, o gol e as bandas parecem ter o tamanho certo e o contorno da área continua visível sobre o gramado.
