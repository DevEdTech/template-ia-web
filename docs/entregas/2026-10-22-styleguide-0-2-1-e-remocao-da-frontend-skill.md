# Styleguide 0.2.1 e remoção da frontend-skill

- **Data**: 2026-10-22
- **Branch**: `master`
- **Plano de origem**: plano aprovado na conversa

## Objetivo

Levar o template para a versão 0.2.1 de `@vitru/styleguide`, que traz os
componentes, os temas e a escala do Gerador de Temas, e tirar do template a
skill `frontend-skill`.

## Funcionalidades entregues

- **Styleguide 0.2.1** — o kit ganha componentes de painel e de filtro,
  `Select` com busca, temas claro e escuro, logo da Vitru e a escala de
  fonte, raio e densidade do Gerador. A rota `/styleguide` mostra a página
  nova, compacta dentro da coluna do template.
- **Tema do app preservado** — trocar o tema na página do styleguide vale só
  para ela: o `<html>` continua com `data-theme="vitru"` e as outras rotas
  não mudam.
- **Sem a frontend-skill** — a skill saiu de `skills/` e das cópias em
  `.claude/skills` e `.agents/skills`.

## Critérios de aceite

- [x] `@vitru/styleguide` em `^0.2.1` no `package.json` e no lockfile.
- [x] `skills/frontend-skill` removida e as cópias ressincronizadas.
- [x] `npm run validate` verde.
- [x] Testes de navegador verdes, com a imagem de referência do
      `/styleguide` gerada de novo.

## Arquivos alterados

| Arquivo                                     | Mudança                                        |
| ------------------------------------------- | ---------------------------------------------- |
| `package.json`, `package-lock.json`         | `@vitru/styleguide` de `^0.1.0` para `^0.2.1`. |
| `skills/frontend-skill/`                    | Removida.                                      |
| `e2e/__screenshots__/darwin/styleguide.png` | Referência visual da página nova.              |
| `docs/styleguide.md`                        | Temas da 0.2, kit atual, `Button` e `Select`.  |

## Testes

| Teste                                | Tipo      | O que cobre                                         |
| ------------------------------------ | --------- | --------------------------------------------------- |
| `e2e/styleguide.spec.ts` (contrato)  | navegador | Tema `vitru` no `<html>`, tokens e fontes oficiais. |
| `e2e/styleguide.spec.ts` (aparência) | navegador | Página do styleguide pixel a pixel (macOS).         |
| `e2e/app.spec.ts`                    | navegador | Fluxo principal e rota de fallback.                 |

Saída da suíte de navegador (`npm run test:e2e`):

```text
Running 3 tests using 1 worker

  ✓  1 [chromium] › e2e/app.spec.ts:3:1 › executa o fluxo principal e preserva a rota de fallback (434ms)
  ✓  2 [chromium] › e2e/styleguide.spec.ts:19:1 › mantém o contrato de estilo do tema (218ms)
  ✓  3 [chromium] › e2e/styleguide.spec.ts:58:1 › mantém a aparência da página do styleguide (1.5s)

  3 passed (5.7s)
```

## Validações executadas

| Comando                        | Resultado                  |
| ------------------------------ | -------------------------- |
| `npm run validate`             | Verde                      |
| `npm run test:e2e:update`      | Verde (gerou a referência) |
| `npm run test:e2e`             | Verde                      |
| `npm audit --audit-level=high` | 1 alta, 3 moderadas        |

```text
Verificacao de skills OK: 11 skill(s) validada(s) e sincronizada(s).
Verificação arquitetural OK.
Validação da documentação OK.
Verificação do styleguide OK.
All matched files use Prettier code style!
 Test Files  5 passed (5)
      Tests  33 passed (33)
✓ built in 307ms
Smoke test do bundle OK.
```

## Fora do escopo

- Adotar o seletor de tema no app: o template continua no tema `vitru`.
- Trocar o campo da lista de notas pelo `Input` do kit.

## Limitações e pendências conhecidas

- `npm audit` acusa 1 vulnerabilidade alta (`vite`) e 3 moderadas (`vitest`,
  `@vitest/mocker`, `@vitest/coverage-v8`) em dependências de desenvolvimento.
  Já existem na `master` antes desta entrega, que só mudou o
  `@vitru/styleguide` no lockfile; o passo de auditoria do CI as acusa.
- A referência visual existe só para macOS; nas outras plataformas o teste
  de aparência é pulado com instrução.

## Como verificar manualmente

1. `npm run dev` e abra `/styleguide`: a página nova aparece compacta, com a
   navegação em faixa.
2. Troque para o tema escuro no seletor da página e volte para `/`: o app
   continua no tema claro.
