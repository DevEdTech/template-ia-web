# Capacidades opcionais e validate com flags

- **Data**: 2026-10-26
- **Branch**: `master` (commits `66f6390` e `8215ebb`)
- **Plano de origem**: revisão crítica dos três templates, aprovada na conversa
- **Jira**: PD-909, PD-910, PD-913, PD-914

## Objetivo

Permitir conduzir um projeto **com autenticação e sem o styleguide** sem brigar
com o template, e deixar de pagar o portão inteiro de validação em cada
iteração.

## Funcionalidades entregues

- **Perfil de rigor** — o projeto declara em `.template-state.json` se é
  `prototipo`, `padrao` ou `rigoroso`, e isso decide o que bloqueia o
  `validate` e quais limites de cobertura valem. Antes, protótipo e produção
  pagavam o mesmo preço.
- **Capacidades desligáveis** — `npm run setup -- --no-styleguide` entrega um
  projeto com base visual própria (tokens em `src/styles/tokens.css`,
  primitivos em `src/shared/ui`), sem o kit da Vitru, sem a rota
  `/styleguide`, e com `AGENTS.md`, `CLAUDE.md` e `docs/` já realinhados.
  `--no-auth` remove a feature de autenticação. Antes era preciso editar onze
  pontos à mão, e a remoção quebrava `check:docs` e `test:e2e`.
- **Autenticação pronta** — `src/features/auth` autentica contra um provedor
  OIDC que já existe, com Authorization Code + PKCE, token apenas em memória,
  renovação antes de expirar e `state` conferido na volta. Uma área protegida
  é embrulhada em `RequireAuth`, que cobre descobrindo, redirecionando,
  autenticada, sem permissão e erro.
- **Validação sob medida** — `npm run validate -- --changed` roda só o que a
  mudança afeta, incluindo os testes das features que dependem do arquivo
  tocado. `--quick`, `--only`, `--skip`, `--files`, `--strict`, `--no-bail` e
  `--list` completam o conjunto.
- **Gates externos visíveis** — `--list` nomeia o que o CI cobra e o
  `validate` não roda (E2E e auditoria), para que verde local não seja
  confundido com verde no CI.

## Critérios de aceite

- [x] Um projeto criado com `--no-styleguide --no-auth` passa `validate`
      completo, sem referência pendente ao pacote removido.
- [x] Religar uma capacidade já removida é recusado com mensagem clara.
- [x] Os limites de cobertura vêm do perfil, não de número fixo.
- [x] `--changed` inclui os arquivos que dependem do alterado e os testes que
      cobrem o conjunto.
- [x] Execução parcial não aplica cobertura global.
- [x] Mudança de configuração cancela a seleção e roda todas as suítes.
- [x] `check:docs` passou a cobrir `AGENTS.md` e `CLAUDE.md`.
- [x] A documentação não exige mais o styleguide quando a capacidade está
      desligada.

## Arquivos alterados

| Arquivo                                   | Mudança                                                         |
| ----------------------------------------- | --------------------------------------------------------------- |
| `scripts/lib/project-config.mjs`          | Catálogo de suítes, perfis, capacidades e cobertura.            |
| `scripts/lib/dep-graph.mjs`               | Grafo de imports via AST e fechamento transitivo.               |
| `scripts/lib/markdown-sections.mjs`       | Edição de documentação por seção, com âncora obrigatória.       |
| `scripts/lib/capabilities/styleguide.mjs` | Remove o kit e instala a base visual local.                     |
| `scripts/lib/capabilities/auth.mjs`       | Remove a feature de autenticação e o que a referencia.          |
| `scripts/validate.mjs`                    | Orquestrador do `validate`, com as flags.                       |
| `scripts/setup.mjs`                       | Flags `--profile`, `--no-styleguide`, `--no-auth`.              |
| `scripts/check-styleguide.mjs`            | Respeita a capacidade; contrato separado dos tokens de produto. |
| `scripts/check-docs.mjs`                  | Cobre `AGENTS.md` e `CLAUDE.md`; catálogo renomeado.            |
| `src/features/auth/**`                    | Feature de autenticação (model, services, componentes).         |
| `src/app/components/AuthGate.tsx`         | Composição do provedor e da rota de retorno.                    |
| `src/shared/config/env.ts`                | Configuração do provedor, validada no boot.                     |
| `e2e/styleguide.spec.ts`                  | Regressão visual passa a opt-in pela capacidade.                |
| `vitest.config.ts`                        | Limites de cobertura vindos do perfil.                          |
| `AGENTS.md`, `CLAUDE.md`, `README.md`     | Perfil, capacidades e fronteira honesta de autenticação.        |
| `docs/decisions/0015-authentication.md`   | ADR da autenticação.                                            |
| `docs/decisions/0016-toolchain-pins.md`   | ADR das versões fixadas da toolchain.                           |
| `docs/agents.md` → `docs/skills-guide.md` | Nome que não se confunde com o `AGENTS.md`.                     |

Volume: 49 arquivos no commit da feature (4366 inserções, 698 remoções) e 3 no
commit da correção.

## Testes

| Teste                                           | Tipo       | O que cobre                                                                     |
| ----------------------------------------------- | ---------- | ------------------------------------------------------------------------------- |
| `src/features/auth/tests/session.test.ts`       | unidade    | Expiração, margem de renovação, escopos, token nascido vencido.                 |
| `src/features/auth/tests/authClient.test.ts`    | unidade    | PKCE S256, `state` divergente, erro do provedor, formato inesperado, rede.      |
| `src/features/auth/tests/AuthProvider.test.tsx` | componente | Renovação compartilhada, recusa de renovação, logout, sessão sem refresh.       |
| `src/features/auth/tests/CallbackPage.test.tsx` | componente | Troca do código, retorno ao destino, recusa por `state`, falta de configuração. |
| `src/features/auth/tests/RequireAuth.test.tsx`  | componente | Conteúdo protegido, redirecionamento, negação por escopo sem laço.              |
| `src/shared/config/tests/env.test.ts`           | unidade    | Configuração de auth tudo-ou-nada e emissor inválido.                           |
| `scripts/validate.test.mjs`                     | contrato   | Grafo (reexport, indireto, CSS Module), níveis por perfil, cada flag.           |
| `scripts/setup.test.mjs`                        | contrato   | Remoção de cada capacidade, recusa de religar, perfil inválido.                 |

Saída da suíte:

```text
 Test Files  11 passed (11)
      Tests  86 passed (86)

=============================== Coverage summary ===============================
Statements   : 94.36% ( 352/373 )
Branches     : 85.92% ( 177/206 )
Functions    : 95.5% ( 85/89 )
Lines        : 95.65% ( 330/345 )
================================================================================
```

```text
$ node --test scripts/setup.test.mjs scripts/validate.test.mjs
ℹ tests 25
ℹ pass 25
ℹ fail 0
```

## Validações executadas

| Comando                      | Resultado |
| ---------------------------- | --------- |
| `npm run validate`           | Verde     |
| `npm run audit`              | Verde     |
| `npm run test:e2e`           | Verde     |
| CI (Validate Node 24 e 26)   | Verde     |
| CI (E2E Chromium, Auditoria) | Verde     |

```text
$ npm run validate
Perfil padrao: 10 suíte(s) — check:toolchain, check:skills, check:architecture,
check:docs, check:styleguide, format:check, lint, typecheck, test, build
Verificação arquitetural OK.
Validação da documentação OK.
Verificação do styleguide OK.
Smoke test do bundle OK.
Validação concluída.

$ npm run audit
found 0 vulnerabilities

$ npx playwright test
  1 skipped
  4 passed (3.0s)
```

Verificação adicional, fora da árvore: uma cópia do repositório recebeu
`npm run setup -- --no-styleguide --no-auth` e passou `validate` completo
(typecheck, lint, 39 testes, build e smoke), sem referência pendente ao pacote
removido.

## Fora do escopo

- Manter base própria de usuários e senhas: exige servidor, que o template não
  inclui. A fronteira está escrita no README e na ADR 0015.
- `refresh_token` em cookie `httpOnly` com rotação: aceito o token no browser
  por simplicidade; a troca está indicada na ADR 0015.
- TypeScript 7: `typescript-eslint` não o suporta e o lint deixa de executar.
  Motivo e acompanhamento na ADR 0016.

## Limitações e pendências conhecidas

- A base visual local gerada por `--no-styleguide` é mínima de propósito
  (`Button`, `PageHeader`, `SectionHeading`): cobre o que o kit removido
  fornecia ao template, não um kit completo.
- A remoção de capacidade usa âncoras exatas no código do template. Se um
  trecho ancorado mudar, o setup falha alto e a transação restaura tudo — é o
  comportamento desejado, mas exige atualizar a âncora junto com o trecho.
- A regressão visual continua existindo e depende de imagem por plataforma;
  está desligada por padrão (`visualRegression`).

## Como verificar manualmente

1. `npm run validate -- --list` — mostra o perfil, as capacidades e o que
   bloqueia.
2. `npm run validate -- --files=src/features/notes --dry-run` — mostra os
   arquivos afetados por dependência e os testes que cobrem o conjunto, sem
   executar nada.
3. Em uma cópia do repositório, `npm run setup -- --name=teste --no-styleguide
--no-auth` e depois `npm run validate`: o projeto fica verde sem o kit e sem
   a feature de autenticação.
4. `npm run setup -- --no-sync-skills` na mesma cópia: o setup recusa religar
   as capacidades removidas, nomeando qual.
