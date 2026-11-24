# Instruções para o Claude neste repositório

## Git: o Claude não commita

- **Nunca** rode `git commit`, `git push`, `git merge`, `git rebase`, `git tag` nem crie, aceite ou feche pull requests (`gh pr ...`).
- **Nunca** apague nem crie branches no GitHub.
- O Claude **só desenvolve**: cria e edita arquivos e roda testes. Quem faz todos os commits e envios é a **Laura, manualmente**, com a conta pessoal **LauraRodrigues31**.
- Motivo: o Claude não deve aparecer como autor ou coautor (`Co-Authored-By`) de nenhum commit, nem como contribuidor do repositório no GitHub.
- Comandos de leitura (`git status`, `git diff`, `git log`, `git branch`) podem ser usados.
- Ao terminar um bloco de trabalho, informe quais arquivos mudaram e sugira a mensagem de commit para a Laura usar.

## Projeto

- Experiência em VR (Meta Quest 3) sobre futebol de cegos, em A-Frame/WebXR, sem bundler. Requisitos em [docs/PRD.md](docs/PRD.md).
- Specs de desenvolvimento em [docs/specs/](docs/specs/). O código segue a spec; mudanças de rumo são feitas primeiro na spec.
- Contrato de eventos entre Laura (jogabilidade e dados) e Anna (áudio, visual e UX) em [docs/EVENTOS.md](docs/EVENTOS.md).
- Testes: `node --test` (lógica pura em `src/logic/`).
