# Atualização de todas as dependências

- **Data**: 2026-10-22
- **Branch**: `chore/atualiza-dependencias`
- **Plano de origem**: pedido na conversa ("atualize todas dependências")

## Objetivo

Levar as dependências diretas do template para a versão mais nova publicada,
com a auditoria do CI voltando a passar.

## Funcionalidades entregues

- **Dependências em dia** — todas as dependências diretas na versão mais nova,
  exceto o TypeScript (ver limitações). Duas mudam de versão principal:
  `vitest` e `@vitest/coverage-v8` (4 para 5).
- **Auditoria limpa** — `npm audit` sem vulnerabilidades; antes acusava 3
  moderadas no `vitest`, `@vitest/mocker` e `@vitest/coverage-v8`.
- **Matchers do jest-dom no Vitest 5** — o setup dos testes importa
  `@testing-library/jest-dom/vitest`, a entrada própria do Vitest. A importação
  genérica deixou de tipar `toBeInTheDocument` e os demais matchers no Vitest 5.

## Critérios de aceite

- [x] `npm outdated` só lista o TypeScript.
- [x] `npm run validate` verde.
- [x] `npm run test:e2e` verde, sem trocar a imagem de referência.
- [x] `npm audit --audit-level=high` verde.

## Arquivos alterados

| Arquivo                             | Mudança                                       |
| ----------------------------------- | --------------------------------------------- |
| `package.json`, `package-lock.json` | Versões novas e pisos das faixas atualizados. |
| `src/test/setup.ts`                 | Importa `@testing-library/jest-dom/vitest`.   |

Versões principais: `react` e `react-dom` 19.3.1, `react-router` 8.5.0,
`lucide-react` 1.61.0, `vite` 8.3.5, `vitest` e `@vitest/coverage-v8` 5.0.5,
`@playwright/test` 1.64.1, `eslint` 10.13.0, `typescript-eslint` 8.72.0,
`prettier` 3.9.10, `jsdom` 30.1.3.

## Testes

Nenhum comportamento da aplicação mudou; a suíte existente foi executada.

Saída da suíte de unidade (dentro de `npm run validate`):

```text
 RUN  v5.0.5 /Users/gaabrielrd/Dev/vitru/project-template-deps
      Coverage enabled with v8

 Test Files  6 passed (6)
      Tests  39 passed (39)
```

Saída da suíte de navegador (`npm run test:e2e`):

```text
  ✓  1 [chromium] › e2e/app.spec.ts:6:1 › executa o fluxo de notas e preserva os dados ao recarregar (706ms)
  ✓  2 [chromium] › e2e/app.spec.ts:22:1 › preserva a rota de fallback (237ms)
  ✓  3 [chromium] › e2e/app.spec.ts:27:1 › orienta o início e mantém a navegação do guia no celular (777ms)
  ✓  4 [chromium] › e2e/styleguide.spec.ts:19:1 › mantém o contrato de estilo do tema (525ms)
  ✓  5 [chromium] › e2e/styleguide.spec.ts:58:1 › mantém a aparência da página do styleguide (2.3s)
  5 passed (9.8s)
```

## Validações executadas

| Comando                        | Resultado                 |
| ------------------------------ | ------------------------- |
| `npm run validate`             | Verde                     |
| `npm run test:e2e`             | Verde                     |
| `npm audit --audit-level=high` | Verde, 0 vulnerabilidades |

```text
Verificacao de skills OK: 11 skill(s) validada(s) e sincronizada(s).
Verificação arquitetural OK.
Validação da documentação OK.
Verificação do styleguide OK.
 Test Files  6 passed (6)
      Tests  39 passed (39)
✓ built in 496ms
Smoke test do bundle OK.
found 0 vulnerabilities
```

## Fora do escopo

- TypeScript 7.

## Limitações e pendências conhecidas

- O TypeScript fica na 6.0.3: o `typescript-eslint` 8.72, o mais novo, aceita
  só TypeScript abaixo da 6.1, e a 7 deixaria o lint sem funcionar. Dá para
  subir quando o `typescript-eslint` aceitar a 7.

## Como verificar manualmente

1. `npm ci` e `npm outdated`: só o TypeScript aparece.
2. `npm run validate` e `npm run test:e2e` passam.
