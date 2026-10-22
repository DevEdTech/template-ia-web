# Publicação do template no GitHub Pages

- **Data**: 2026-10-22
- **Branch de implementação**: `feat/onboarding-template`
- **Origem**: solicitação de configurar Pages, fazer commit e push e integrar
  todas as melhorias na `master`.

## Objetivo

Publicar a página de onboarding e o styleguide do template no GitHub Pages,
com acesso direto às rotas e publicação automática após integração na master.

## Funcionalidades entregues

- Workflow `GitHub Pages`, com validação antes do build e job de deploy
  separado, usando permissões de Pages e OIDC.
- Base pública fornecida por `actions/configure-pages`, sem nome de
  repositório fixo no código.
- Router e favicon usando a base centralizada em `shared/config/env.ts`.
- Build `build:pages` com entradas estáticas para início, styleguide e 404.
- Configuração administrativa do Pages ativada como `workflow` via GitHub CLI.
- Documentação de publicação e link para o site no README.

## Critérios de aceite

- [x] Build padrão e desenvolvimento continuam funcionando na raiz.
- [x] Build do Pages funciona em `/template-ia-web/`.
- [x] Abrir e recarregar o início e o styleguide retorna HTTP 200.
- [x] Links, favicon e fontes carregam sob o prefixo do repositório.
- [x] Workflow publica apenas a master e não usa token pessoal em segredo.

## Arquivos alterados

- `.github/workflows/pages.yml`: validação, build e deploy automático.
- `scripts/build-pages.mjs`, `scripts/prepare-pages.mjs` e seus testes:
  build com base variável e entradas estáticas.
- `package.json`: comando `build:pages`.
- `src/shared/config/env.ts` e seus testes: base pública.
- `src/app/App.tsx`, rotas e testes: assets e navegação em subdiretório.
- `README.md`, `docs/deployment.md` e `docs/architecture.md`: publicação.

## Validações locais executadas

| Comando ou cenário                                      | Resultado                                                                                                       |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `npm run validate`                                      | Passou: 39 testes Vitest, 51 testes de scripts, verificações, tipos, build e smoke HTTP.                        |
| `npm run test:e2e`                                      | 5 testes Chromium passaram, incluindo referência visual do styleguide.                                          |
| `PAGES_BASE_PATH=/template-ia-web/ npm run build:pages` | Build concluído e entradas estáticas geradas.                                                                   |
| Chromium em servidor estático sob `/template-ia-web/`   | Início e styleguide HTTP 200; recarga, navegação, favicon e fontes OK; nenhum erro JavaScript ou asset ausente. |

Os checks remotos e a publicação ficam registrados no histórico de Actions do
repositório e no pull request de integração.

## Limitações

- Novas rotas públicas com acesso direto precisam de entradas em
  `scripts/prepare-pages.mjs`.
- Endereços desconhecidos recebem HTTP 404, com a tela de fallback do app.
- A demonstração de notas continua usando apenas armazenamento do navegador.

## Como verificar

1. Abra `https://devedtech.github.io/template-ia-web/`.
2. Navegue para o styleguide e recarregue a página.
3. Abra diretamente `https://devedtech.github.io/template-ia-web/styleguide/`.
4. Confira o workflow `GitHub Pages` após um push na master.

## Auditoria antes da integração

O check remoto de auditoria identificou uma vulnerabilidade alta preexistente
no Vite. O lockfile foi atualizado para Vite 8.3.5, dentro da faixa semver já
permitida. Após a atualização, `npm run validate`, os 5 E2E e o build do Pages
passaram novamente. `npm audit --audit-level=high` passou; permaneceram três
avisos moderados da cadeia Vitest, abaixo do limite definido pelo projeto.
