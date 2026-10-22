# ADR 0016 — Versões fixadas da toolchain

- Status: aceita
- Data: 2026-10-22

## Contexto

Duas dependências não podem simplesmente seguir o `latest`, e a razão precisa
ficar escrita: sem isso, cada atualização automática repete a mesma tentativa
e o mesmo rollback.

## Decisão

### TypeScript permanece na linha 6

`typescript-eslint` ainda não suporta TypeScript 7.0. Com TS 7 instalado, o
ESLint não executa:

```
typescript-eslint does not support TS 7.0.
```

Acompanhamento em
<https://github.com/typescript-eslint/typescript-eslint/issues/10940>.
Enquanto o `lint` for portão bloqueante, TS 7 derruba o `validate` inteiro —
trocar o lint de lugar para subir a versão do compilador seria inverter a
prioridade. Suba para a linha 7 **somente** quando `typescript-eslint`
anunciar suporte, e no mesmo commit.

### npm fixado em 11.16.0

`packageManager` declara a versão exata, e `npm run check:toolchain` reprova
divergência. O motivo é a interpretação do lockfile: duas versões de npm podem
resolver a mesma árvore de formas diferentes, e o CI roda em Node 24 e 26. A
versão escolhida é a que acompanha o Node 24 LTS.

Ao atualizar, mude em conjunto: `packageManager`, `.nvmrc`, `engines`, a
matriz do CI e o `package-lock.json`.

## Consequências

- Dependabot vai propor TypeScript 7; a proposta deve ser recusada com link
  para esta ADR até o suporte existir.
- `npm run check:toolchain` falha em máquina com npm diferente. É intencional:
  o erro nomeia a versão esperada.
