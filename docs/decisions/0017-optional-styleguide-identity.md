# ADR 0017 — Styleguide da Vitru como escolha, não imposição

- Status: aceita
- Data: 2026-11-25

## Contexto

A capacidade `styleguide` já podia ser desligada (`--no-styleguide`), mas o
template ainda se comportava como se o kit fosse obrigatório:

- executado com flags, caso típico de um agente, o setup mantinha o kit sem
  perguntar nem avisar;
- a escolha existia só como um "sim/não" com padrão "sim" e uma flag negativa;
- `CLAUDE.md`, `README.md`, `docs/onboarding.md` e as skills `implement-feature`
  e `review-changes` descreviam as regras do kit como valendo sempre.

## Decisão

1. A identidade visual é uma escolha explícita na inicialização:
   `npm run setup -- --identity=vitru|propria`. `--styleguide` e
   `--no-styleguide` continuam como atalhos; combinações conflitantes e valores
   desconhecidos são recusados antes de qualquer alteração.
2. No modo interativo, o setup pergunta entre "Styleguide da Vitru" e
   "Identidade própria". Identidade própria é a base local já existente
   (`src/styles/tokens.css` e `src/shared/ui`), sem o kit.
3. Sem a flag, o setup mantém o kit, como antes, e avisa que a escolha existe.
   Falhar quebraria os fluxos já documentados; o aviso e a instrução aos
   agentes (`CLAUDE.md`, `AGENTS.md`, mensagem de uso) para **perguntar ao
   usuário** antes de rodar o setup resolvem o silêncio sem quebrá-los.
4. Documentação e skills tratam o styleguide como regra condicional à
   capacidade `styleguide`, cuja fonte da verdade é
   `npm run validate -- --list`.

## Consequências

- Quem quer identidade própria a escolhe sem remover coisas à mão.
- Uma capacidade removida continua sem volta pelo setup: religá-la exige
  recuperar os arquivos pelo Git.
- Fica de fora um modo híbrido (kit instalado com tokens próprios por cima) e a
  coleta de cor e fonte da marca no setup; podem virar decisões futuras.
