# Identidade visual opcional no setup

- **Data**: 2026-11-25
- **Branch**: `master`
- **Plano de origem**: plano aprovado na conversa; decisão em
  [ADR 0017](../decisions/0017-optional-styleguide-identity.md)

## Objetivo

Deixar de tratar o styleguide da Vitru como imposição: quem inicializa o
projeto escolhe entre o kit e uma identidade própria, e as regras só valem para
o que foi escolhido.

## Funcionalidades entregues

- **Flag `--identity=vitru|propria`** — escolhe a identidade no setup.
  `--styleguide` e `--no-styleguide` continuam como atalhos; valores
  desconhecidos e flags conflitantes são recusados sem alterar arquivos.
- **Pergunta explícita** — o modo interativo oferece "1) Styleguide da Vitru" e
  "2) Identidade própria" e repete a pergunta se a resposta for inválida.
- **Aviso sem flag** — com flags e sem escolha de identidade o kit é mantido,
  como antes, e o setup avisa que a opção existe. A mensagem de uso e o
  `CLAUDE.md`/`AGENTS.md` instruem o agente a perguntar ao usuário antes.
- **Regras condicionais** — `CLAUDE.md`, `AGENTS.md`, `README.md`,
  `docs/onboarding.md`, `docs/styleguide.md` e as skills `implement-feature` e
  `review-changes` deixam de apresentar o kit como obrigatório.

## Critérios de aceite

- [x] O setup oferece as duas identidades de forma explícita.
- [x] `--identity=propria` produz o mesmo resultado de `--no-styleguide`.
- [x] `--identity=vitru` mantém o kit e a rota `/styleguide`.
- [x] Nenhuma regra do kit aparece como obrigatória com `styleguide: false`.
- [x] `npm run validate` passa.

## Arquivos alterados

| Arquivo                                                               | Mudança                                                  |
| --------------------------------------------------------------------- | -------------------------------------------------------- |
| `scripts/setup.mjs`                                                   | Flag `--identity`, pergunta nomeada, aviso e plano.      |
| `scripts/setup.test.mjs`                                              | Três testes novos para a escolha de identidade.          |
| `scripts/lib/capabilities/styleguide.mjs`                             | Âncora do `CLAUDE.md` acompanha o novo texto.            |
| `CLAUDE.md`, `AGENTS.md`                                              | Styleguide opcional e instrução de perguntar ao usuário. |
| `README.md`, `docs/onboarding.md`, `docs/styleguide.md`               | Documentam a escolha e a flag.                           |
| `skills/implement-feature/SKILL.md`, `skills/review-changes/SKILL.md` | Regra visual condicional à capacidade.                   |
| `docs/decisions/0017-optional-styleguide-identity.md`                 | ADR da decisão.                                          |

## Testes

| Teste                                                | Tipo  | O que cobre                                      |
| ---------------------------------------------------- | ----- | ------------------------------------------------ |
| `--identity=propria` equivale a `--no-styleguide`... | setup | As duas identidades, estado gravado e mensagens. |
| avisa que a identidade visual é uma escolha...       | setup | Aviso quando nenhuma flag define a identidade.   |
| rejeita identidade desconhecida e flags conflitantes | setup | Erro e nenhuma alteração em disco.               |

## Validações executadas

| Comando                              | Resultado         |
| ------------------------------------ | ----------------- |
| `node --test scripts/setup.test.mjs` | Verde (16 testes) |
| `npm run validate`                   | Verde             |

## Fora do escopo

- Modo híbrido (kit instalado com tokens próprios por cima).
- Coleta de cor e fonte da marca no setup.
- Religar o styleguide depois de removido.

## Limitações e pendências conhecidas

- A pergunta interativa foi coberta por leitura de código, não por teste
  automatizado: os testes de setup rodam sem TTY.
- O `README.md` continua citando `/styleguide` em partes descritivas do
  template; a skill `update-readme` o reescreve para o projeto derivado.

## Como verificar manualmente

1. Copie o template para uma pasta temporária e rode `npm run setup`.
2. Na pergunta de identidade visual, escolha 2.
3. Confirme `styleguide: false` em `.template-state.json` e a existência de
   `src/styles/tokens.css`.
