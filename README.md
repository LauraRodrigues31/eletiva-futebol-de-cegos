# Futebol de Cegos

Projeto da eletiva **Experiências Imersivas**.

## Equipe

- Laura Rodrigues
- Anna Riciopo

## Como jogar e testar

- **Link (Quest 3):** https://laurarodrigues31.github.io/eletiva-futebol-de-cegos/
- **Modo debug:** adicione `?debug=1` ao link. Aparece um painel com o estado do jogo, e o botão **B** do controle direito (ou a tecla **N** no computador) avança os estados. `?debug=1&estado=fase2` abre direto em uma fase.
- **No computador:** rode `npx serve .` na pasta do projeto e abra o endereço mostrado com `?debug=1`. Clique e arraste para olhar em volta, use **WASD** para andar e a **barra de espaço** para chutar.
- **Chute:** perto da bola, aponte o controle para o gol e aperte o **gatilho** (qualquer mão). No modo debug, o botão **A** (ou a tecla **R**) recoloca a bola.
- **Testes automáticos:** `node --test` (ou `npm test`).
- **Antes de entrar no VR:** fique em pé sobre a marca no centro da área livre (3 × 3 m), olhando para onde o gol deve ficar, com o Guardian configurado e alguém acompanhando.

Documentação técnica: [PRD](docs/PRD.md), [contrato de eventos](docs/EVENTOS.md) e [testes](docs/TESTES.md).

## Macrotema

Uma experiência imersiva sobre **futebol de cegos**, com foco em **inclusão** e em mudar a forma como as pessoas enxergam a modalidade, pois:

- A seleção brasileira de futebol de cegos tem **5 medalhas de ouro paralímpicas** e, mesmo assim, a modalidade é pouco conhecida e pouco valorizada pelo público.
- Ainda existe a percepção de que o esporte paralímpico não é de **alto rendimento**. A modalidade costuma ser vista pela lente da "superação" ou da pena, e não pela técnica, pela tática e pela preparação dos atletas.
- O futebol de cegos é um esporte guiado pelo **som**: bola com guizo, chamador, o grito de "voy" e silêncio da torcida. Isso abre um campo criativo interessante para uma experiência imersiva, que normalmente é muito visual.

## Direções a investigar

- Estigmas em torno da modalidade: capacitismo, infantilização, invisibilidade na mídia e desigualdade de gênero no futebol de cegas.
- Regras e dinâmica real do jogo.
- Formas de representar o som e a ausência de visão na experiência.
- Como tornar a experiência acessível também para pessoas cegas.
- Conversas com atletas, técnicos e instituições da modalidade.

---

## Proposta: Peneira

**Peneira** é uma experiência em realidade virtual no Meta Quest em que a pessoa tenta uma vaga na **seleção brasileira de futebol de cegos**. Ela coloca a venda, perde a visão aos poucos e passa por testes guiados só pelo som. No fim, recebe uma ficha técnica com as notas dela e descobre se passou na peneira.

video ilustrativo para imaginação inicial da proposta: https://drive.google.com/file/d/1hIyOzje_Sr3W1rRpfTdUE-lknRyhm6Ay/view?usp=sharing 

| | |
|---|---|
| **Papel da pessoa** | Candidata a uma vaga na seleção |
| **Tom** | Desafio esportivo, competitivo e bem-humorado |
| **Duração** | 5 a 7 minutos, uma pessoa por vez |

**Escolha de narrativa:** a escuridão aparece como **equipamento**, e não como perda. Todos os atletas jogam vendados para garantir igualdade entre quem tem cegueira total e quem tem resíduo visual. Assim, a experiência explica uma regra real e evita a narrativa de tragédia.

### Como funciona

Uma técnica, por voz, conduz a peneira como um treino. Cada teste tem uma tentativa de treino antes das que valem pontos.

1. **Vestiário:** a pessoa pega a venda e coloca nos olhos. A imagem perde cor, foco e luz, e os sons passam a aparecer como ondas visuais.
2. **Localização:** a bola rola e para em pontos diferentes da quadra. A pessoa se vira para o guizo e confirma onde acha que a bola está. As ondas vão sumindo até sobrar só o som.
3. **Silêncio e voy:** a torcida barulhenta cobre o guizo até a pessoa pedir silêncio. Depois, a bola vem na direção dela e ela precisa dizer "voy" na hora certa.
4. **Pênalti:** escuridão total. Guiada pela voz do chamador atrás do gol, a pessoa mira e chuta com o próprio pé contra um goleiro que enxerga.
5. **Ficha técnica:** a imagem volta e a pessoa vê suas notas de orientação, reação, precisão e potência, e o veredito da peneira. Se fez o gol, a torcida explode.

---

## Ficha do projeto

### 1. Domínio: onde a experiência acontece

- **Virtual:** o vestiário e a quadra de futebol de cegos, com gol, bola com guizo, goleiro, chamador e torcida.
- **Físico:** um espaço livre de obstáculos onde a pessoa fica em pé e chuta. *[Medidas a definir.]*
- **Dispositivo:** Meta Quest 3, com a experiência rodando no navegador do óculos (A-Frame / WebXR).

### 2. Sentir: o que é e para quê

- **O que é:** viver uma peneira da seleção. A pessoa coloca a venda, a visão some aos poucos e o jogo continua, guiado só pelo som.
- **Para quê:** mostrar o futebol de cegos como **alto rendimento**. A pessoa sente na prática a precisão e a percepção que o esporte exige, e sai com respeito pelos atletas, não com pena.

### 3. Teste da tela: por que não numa tela

Se funcionasse igual num vídeo, não precisaria ser imersivo. A experiência depende de três coisas que uma tela não entrega:

| | Numa tela | Na experiência imersiva |
|---|---|---|
| **Escuridão** | Uma imagem preta; o ambiente continua claro em volta | Ocupa todo o campo de visão |
| **Som** | Vem de um alto-falante parado | É espacial: virar a cabeça muda de onde vem o guizo e a voz do chamador |
| **Corpo** | Fica sentado, assistindo | Coloca a venda com as mãos, se vira para achar a bola e chuta com o pé de verdade |

### 4. Moldura: o que fica dentro, e se ela se mostra

**O que fica dentro:** uma peneira da seleção brasileira de futebol de cegos. A quadra virtual está no lugar da quadra real, o jogador está no lugar de uma candidato. A moldura imita **o esporte**, não **a cegueira**: o que fica dentro é o teste de uma atleta, e não a vida de uma pessoa cega.

**Se ela se mostra:** a moldura aparece nas bordas e se esconde no meio.

- **Na entrada, ela se mostra:** no vestiário, a pessoa coloca a venda com as próprias mãos. A venda é a moldura em forma de objeto: marca o momento em que o jogo começa, e é uma regra real que os atletas também seguem.
- **Durante, ela aparece nos detalhes:** as ondas visuais do som são assumidamente um desenho nosso, não "o que uma pessoa cega vê".
- **No pênalti, ela se esconde:** escuridão total, som espacial e chute com o pé. Aqui a imitação rompe a moldura e vira presença, e é isso que faz a pessoa sentir no corpo a precisão que o esporte exige.
- **Na saída, ela volta a se mostrar:** a imagem retorna e a ficha técnica, com notas e veredito, deixa claro que tudo foi um teste. A pessoa tira a venda e sai com uma nota, não com a ideia de que "sabe como é ser cega".

**Por que assim:** a moldura escondida é perigosa, porque quem não a percebe toma a imitação pelo real. No nosso caso, o perigo é a empatia de turista. Por isso a ilusão só é total no pênalti, o momento que mais precisa de presença, e a moldura aparece na entrada e na saída. Saber que é imitação é o que permite o prazer do desafio.

### 5. Corpo: onde fica e o que pode fazer

- **Onde fica:** em pé, sobre uma marca no chão, no lugar de uma candidata à seleção. O corpo real é o corpo da atleta.
- **O que pode fazer:**
  - **Mãos:** pegar a venda e confirmar ações com o controle;
  - **Cabeça e corpo:** se virar para localizar o guizo e mirar na voz do chamador;
  - **Voz:** pedir silêncio e gritar "voy", captados pelo microfone do Quest;
  - **Pé:** chutar o pênalti. *[Ideia a testar: um controle preso na canela para medir o chute.]*
- **O que não faz:** correr ou se deslocar pelo espaço. Como a pessoa chuta sem enxergar, a segurança vem antes do realismo.

### 6. Risco: como serviria para enganar

| Risco | Como evitar |
|---|---|
| **Empatia de turista:** alguns minutos no escuro fazem a pessoa achar que "sabe como é ser cego" ou sair com pena | O papel é de candidata e a venda é equipamento esportivo; o fim celebra o desempenho dos atletas, não a limitação |
| **Metáfora vira fato:** as ondas visuais do som são uma interpretação nossa, não como pessoas cegas percebem o jogo | Deixar claro que é uma representação artística |
| **Números inventados:** a ficha técnica pode comparar a pessoa com dados de atleta que não existem | Usar dados da CBDV e do CPB, ou medir com atletas; nunca inventar números |
| **Reforçar o estigma:** o roteiro pode cair na narrativa de superação | Validar o roteiro com atletas e pessoas cegas |
