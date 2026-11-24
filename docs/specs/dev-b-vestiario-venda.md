# Spec: Dev B, vestiário e venda

> Status: **aprovada, em implementação**
> Responsável: Anna (Dev B: áudio, visual e UX)
> Referências: [PRD](../PRD.md) (req. 1), [contrato de eventos](../EVENTOS.md)

## 1. Escopo

| Parte | O que é |
|---|---|
| Vestiário | Sala com 5 cabines. Cada cabine tem uma camisa pendurada e um par de chuteiras, e há uma venda preta no banco, na frente de cada cabine. |
| Interação | Só a venda do jogador pode ser usada. É preciso **ir até ela** e **clicar**. |
| Instruções | Texto preso à visão que diz o que fazer agora. |
| Venda | Animação: a venda voa até o rosto, uma faixa preta desce e a tela escurece. Em seguida emite `blindfold-on`. |
| Cena provisória | Em `entrada-campo`: tela preta (a pessoa está vendada) com um texto de "em construção". Ainda **não** emite `field-entered`. |

Fica para depois: o som do tecido e da porta, a entrada em campo de verdade (com o som do estádio e `field-entered`) e o quadro tático decorativo.

## 2. Decisões

| # | Decisão | Motivo |
|---|---|---|
| B1 | **Texto em canvas.** Todo texto da Dev B é desenhado num `<canvas>` e usado como textura de um plano (`src/visual/canvas.js` e o componente `painel-texto`). | As fontes padrão do A-Frame não mostram "ç", "ã" nem "ê". O canvas não precisa de dependência nova. |
| B2 | **Apontadores só no vestiário.** No computador, `cursor="rayOrigin: mouse"` na cena. No Quest, `laser-controls` nas mãos, com o gatilho fazendo o clique. Tudo é ligado e desligado por JS quando o estado entra e sai de `vestiario`. | O bloco da Dev A no HTML fica intacto e o laser não atrapalha o chute. |
| B3 | **Alcance.** O clique só vale com a cabeça a menos de `vestiario.alcance.entrar` (0,9 m) da venda, medido no chão. A pessoa só volta a "longe" acima de `alcance.sair` (1,1 m). | Faz a pessoa **ir até** a venda, e a histerese impede que a instrução fique piscando. |
| B4 | **A venda fica posta.** A camada preta fica ligada em todos os estados depois do vestiário, menos em `resultado`. Com `?debug=1`, ela cai para `venda.opacidadeDebug` (0,5). | É o que o PRD pede ("a tela escurece"). A Dev A ainda consegue ler o painel de debug. |
| B5 | **Campo escondido no vestiário.** Enquanto o estado for `vestiario`, `#campo`, `#gol` e o contorno da área (`#area`) ficam com `visible: false`. | Os dois chãos ficam no mesmo lugar e piscariam um sobre o outro, e o contorno branco não faz parte do vestiário. Só a visibilidade muda; o código da Dev A não é tocado. O `play-area` continua checando a área e emitindo os eventos. |
| B6 | **Colisão no vestiário** (`colisao`, `src/logic/colisao.js`). A cabeça é um círculo de `colisao.raioCabeca` (0,2 m) no chão. **No computador (WASD)**, a câmera é empurrada para fora das paredes, das cabines, do banco, da porta e do quadro, e desliza ao longo deles. **No VR**, o corpo anda de verdade e não dá para impedir: a visão escurece conforme a cabeça entra numa parede ou numa cabine (fica toda preta a `distanciaEscurecer`, 0,15 m). O banco não conta no VR, porque é baixo e a pessoa se inclina sobre ele para pegar a venda. | Empurrar o `#rig` no VR quebraria a escala 1:1 e deixaria a área de segurança (`play-area`) no lugar errado. Escurecer é o padrão de "cabeça na parede" em VR. |

## 3. Layout (origem = marca no chão, frente = -z)

```
 z = -2,4  ┌──[c0]──[c1]──[c2]──[c3*]──[c4]──┐  cabines (x = -1,8 … 1,8)
 z = -1,45 │  ════════ banco + vendas ══════ │  * = cabine do jogador (índice 3)
           │            ┌───────┐            │
           │            │   •   │  área 3×3  │
           │            └───────┘            │
 z = 2,6   └─────────────────────────────────┘
```

Todas as medidas ficam em `CONFIG.vestiario` ([src/config.js](../../src/config.js)). A venda do jogador fica dentro da área física.

## 4. Sequência

1. `state-change → vestiario`: o vestiário aparece, a venda volta ao banco, os apontadores ligam e aparece a instrução de ir até a venda.
2. Perto da venda: a instrução muda para "aponte e aperte o gatilho (no computador: clique)".
3. Clique de longe: aparece "chegue mais perto" e nada acontece.
4. Clique perto:
   - os apontadores desligam e aparece "colocando a venda…";
   - a venda voa até o rosto;
   - a faixa desce e a tela escurece;
   - a tela fica preta por um instante;
   - `blindfold-on` é emitido.
5. `state-change → entrada-campo`: o vestiário some e aparece o texto provisório por cima da camada preta.
6. Ao voltar para `vestiario` (reinício ou debug), tudo é restaurado. Abrir com `?estado=entrada-campo` já começa vendado, sem animação.

## 5. Arquivos

```
src/logic/vestiario.js            layout das cabines, alcance com histerese, textos (lógica pura)
src/visual/canvas.js              texturas de canvas (texto, camisa, ladrilho, faixa)
src/components/painel-texto.js    plano com texto de canvas (reaproveitável)
src/components/instrucoes.js      instrução presa à visão
src/components/vestiario.js       monta a sala, reage ao estado, liga e desliga os apontadores
src/components/venda-interativa.js  hover, alcance e clique na venda do jogador
src/components/blindfold.js       camada preta presa à câmera e animação de colocar
src/components/cena-provisoria.js texto de entrada-campo (provisório)
tests/vestiario.test.js
```

## 6. Pronto quando

- [ ] `node --test` termina com `fail 0`.
- [ ] No computador: só a venda marcada reage ao mouse; clicar de longe mostra "chegue mais perto"; clicar perto roda a animação e o console mostra `blindfold-on` e depois `state-change → entrada-campo`.
- [ ] A tecla N volta ao `vestiario` com tudo restaurado.
- [ ] No Quest: o laser aparece só no vestiário, o gatilho funciona, o texto é legível e a camada cobre todo o campo de visão.
