# Correção da auditoria de dependências

- **Data**: 2026-10-13
- **Branch**: `fix/ci-security-lockfile`
- **Plano de origem**: plano autorizado na conversa

## Objetivo

Restaurar o gate de auditoria com atualizações compatíveis das dependências
transitivas vulneráveis, sem reduzir testes, cobertura ou auditorias.

## Alterações e critérios de aceite

- [x] Atualizar somente quatro entradas do package-lock.json: brace-expansion
      5.0.9 para 5.0.12 e 1.1.18 para 1.1.21, source-map-js 1.2.1 para 1.2.2,
      undici 8.10.0 para 8.11.2.
- [x] Preservar package.json, workflows e os intervalos das dependências diretas.
- [x] Confirmar instalação reproduzível, auditoria e validação completa.
- [ ] Confirmar E2E e CI remoto no SHA final antes do merge.

## Testes e validações

Nenhum comportamento da aplicação mudou; a suíte existente foi executada.
Ambiente local: Windows, Node 24.21.0 e npm 10.6.0. O checkout foi normalizado
para LF e as cópias locais das skills foram sincronizadas, sem alteração
funcional desses arquivos.

| Comando            | Resultado observado                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `npm ci`           | Instalou o lockfile corrigido; found 0 vulnerabilities                                     |
| `npm run validate` | Passou: skills, arquitetura, docs, styleguide, formato, lint, testes, tipos, build e smoke |

```text
Tests 33 passed (33)
Statements: 92.44%; Branches: 85.55%; Functions: 97.67%; Lines: 93.71%
tests 47
pass 47
fail 0
Smoke test do bundle OK.
```

## Limitações

Node 22 e E2E no Linux precisam ser confirmados no CI. Os PRs do Dependabot
são revisados separadamente. TypeScript 7 não deve ser forçado: o PR existente
falha em npm ci porque typescript-eslint exige TypeScript menor que 6.1.0.
