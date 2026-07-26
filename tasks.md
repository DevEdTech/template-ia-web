# Progresso — Construção do repositório-template

Baseado em `analytics/treinamento-ia/planejamento-repositorio-template.md`.
Alvo: `project-template/` (nome interno do pacote: `web-project-template`).

## Legenda

- [ ] pendente · [~] em andamento · [x] concluído

## Fases

### Bloco A — Base + arquitetura (código) ✅

- [x] A1. Config base: `package.json`, `tsconfig*.json`, `vite.config.ts`, `vitest.config.ts`, `eslint.config.js`, `prettier.config.mjs`, `index.html`, `.editorconfig`, `.env.example`, `.gitignore`, `.nvmrc`
- [x] A2. Estrutura `src/`: `app/`, `features/example/`, `shared/`, `test/`, `main.tsx`
- [x] A3. Exemplo mínimo funcional + 3 testes (RTL)

### Bloco B — Documentação ✅

- [x] B1. `README.md`
- [x] B2. `CONTRIBUTING.md`
- [x] B3. `docs/architecture.md`
- [x] B4. `docs/development-process.md`
- [x] B5. `docs/testing.md`
- [x] B6. `docs/agents.md`
- [x] B7. `docs/integrations.md`
- [x] B8. `docs/decisions/0001-initial-architecture.md`
- [x] B9. `docs/tasks/README.md`

### Bloco C — Instruções de agentes + skills ✅

- [x] C1. `AGENTS.md`
- [x] C2. `CLAUDE.md`
- [x] C3. Skill `plan-feature`
- [x] C4. Skill `implement-feature`
- [x] C5. Skill `review-changes`
- [x] C6. Skill `generate-tests`
- [x] C7. Skill `update-documentation`
- [x] C8. Skill `prepare-pull-request`

### Bloco D — Scripts + GitHub ✅

- [x] D1. `scripts/sync-skills.mjs`
- [x] D2. `scripts/check-skills.mjs`
- [x] D3. `scripts/setup.mjs`
- [x] D4. `.github/ISSUE_TEMPLATE/feature.yml`, `bug.yml`, `technical-task.yml`
- [x] D5. `.github/pull_request_template.md`
- [x] D6. `.claude/settings.example.json`

### Adições extras de arquivos prometidos ✅

- [x] `.nvmrc`
- [x] `.editorconfig`
- [x] `.env.example`
- [x] `.prettierignore`

### Bloco E — Integração e validação (feito pelo orquestrador) ✅

- [x] E1. `npm install` (0 vulnerabilidades)
- [x] E2. `npm run sync:skills` gera `.claude/skills` e `.agents/skills` (6 skills)
- [x] E3. `npm run validate` passa com EXIT=0 (check:skills, format:check, lint, typecheck, test 3/3, build)
- [x] E4. Consistência verificada: árvore bate com o plano; `check:skills` detecta divergência (exit 1) e volta a passar após re-sync; `setup.mjs` sai com 0 sem TTY

## Ajustes feitos na integração

- `typecheck` corrigido de `tsc --noEmit` (no-op com `files: []` no root) para `tsc -b --noEmit` (checagem real de tipos).
- Criado `.prettierignore` para ignorar artefatos gerados (`dist`, `coverage`, cópias `.claude/skills` e `.agents/skills`, `package-lock.json`).

## Status: PRONTO

Todos os blocos concluídos. Fora de escopo desta entrega (conforme decidido): workshop TaskWeather (Tarefa 12), validação multiplataforma Windows real (Tarefa 11 — scripts foram escritos com APIs portáveis, mas não testados em Windows nesta máquina), branch/tags de treinamento.

## Notas

- Fase de workshop TaskWeather (Tarefa 12 do plano) fica FORA deste escopo inicial — só a base genérica.
- Skills canônicas ficam em `/skills`; `.claude/skills` e `.agents/skills` são geradas por script.
