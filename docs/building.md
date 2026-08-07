# Build & Deploy

O processo de build do template web é projetado para garantir que a aplicação possa ser entregue com confiabilidade, empacotando os assets de forma otimizada para produção.

## Comandos Principais

- `npm run build`: Roda o ciclo de build completo, incluindo verificação de tipos, build com Vite e smoke test.
- `npm run build:bundle`: Gera o bundle final via Vite (`vite build`).
- `npm run smoke:build`: Inicia um servidor efêmero e valida se os artefatos em `dist/` renderizam adequadamente no navegador.

## Variáveis de Ambiente

O Vite utiliza variáveis de ambiente com o prefixo `VITE_` (ex: `VITE_API_URL`).

- Durante o desenvolvimento, o Vite lê de arquivos `.env`, `.env.local`, etc.
- No CI/CD, as variáveis devem ser passadas no momento do build (ex: `VITE_API_URL=https://api.exemplo.com npm run build`), para serem injetadas estaticamente na aplicação pelo Vite.

Variáveis ausentes ou malformadas falham no boot da aplicação, com mensagem nomeando a variável — a validação fica em `src/shared/config/env.ts`. Isso vale também para o bundle de produção.

## Integração contínua

O workflow `.github/workflows/ci.yml` roda `npm ci` e `npm run validate` em Node 22 e 24 a cada Pull Request, e audita as dependências com `npm audit --audit-level=high` em um job separado. Configure a branch principal para exigir o check **Validate** antes do merge.

## Smoke Test

O script `scripts/smoke-build.mjs` serve como um sanity check após o build. Ele sobe o bundle resultante (`dist/`) localmente, faz uma requisição para a raiz e verifica se o conteúdo base (como as tags do React ou conteúdo estático esperado) estão presentes. Se o smoke test falhar, a pipeline quebra, impedindo o deploy de um pacote com erro fatal.
