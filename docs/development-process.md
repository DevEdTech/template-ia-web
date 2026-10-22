# Processo de desenvolvimento

Fluxo recomendado para levar uma ideia até o código, de forma organizada e verificável.

## Fluxo

1. **Descoberta do produto**: se a ideia ainda estiver vaga, use `plan-app`. Responda às perguntas até aprovar um escopo e um não escopo completos em `prd.md`.
2. **Demanda**: escolha uma capacidade aprovada no PRD e descreva o que se quer resolver e para quem.
3. **Especificação**: detalhe o comportamento esperado, entradas e saídas.
4. **Critérios de aceite**: liste, de forma objetiva, o que precisa ser verdade para a demanda estar pronta.
5. **Planejamento**: quebre em passos. Você pode pedir ao agente: "Use a skill plan-feature...".
6. **Branch**: crie uma branch para o trabalho (`git checkout -b feat/descricao`).
7. **Implementação**: escreva o código seguindo a [arquitetura](architecture.md).
8. **Validação local**: use `npm run validate -- --changed` enquanto itera e
   `npm run validate` antes de concluir. O que bloqueia depende do perfil do
   projeto (`npm run validate -- --list`).
9. **Evidência da entrega**: registre em [entregas](entregas/README.md) o que foi entregue, os testes e o resultado das validações. Você pode pedir ao agente: "Use a skill document-delivery...".
10. **Commit**: registre as mudanças com mensagem clara.
11. **Pull Request**: abra o PR descrevendo o que mudou e por quê.
12. **Revisão**: ajuste conforme os comentários antes de integrar.

Atualizações herdadas do template usam `npm run update:template -- --dry-run`
antes da aplicação. Veja [updating.md](updating.md).

## Mensagens de commit

Use um prefixo de tipo:

```
feat: adiciona filtro de busca na lista de clientes
fix: corrige data exibida no formato errado
docs: documenta como configurar variáveis de ambiente
```

Outros prefixos úteis: `test:`, `refactor:`, `chore:`, `perf:`, `build:`, `ci:`, `style:`, `revert:`. Um escopo entre parênteses é opcional (`fix(notes): ...`), e `!` marca mudança incompatível (`feat!: ...`).

A convenção é verificada pelo hook `commit-msg` (`scripts/check-commit-message.mjs`): a primeira linha precisa seguir `tipo: descrição`, ter no máximo 72 caracteres e não terminar com ponto. Commits de merge, revert e `fixup!` são ignorados.

## Validação sob medida

`npm run validate` roda as suítes que o perfil do projeto manda. As flags
servem para não pagar o gate inteiro em cada iteração:

| Comando                                      | Para quê                                                     |
| -------------------------------------------- | ------------------------------------------------------------ |
| `npm run validate`                           | o portão completo, antes de concluir                         |
| `npm run validate -- --list`                 | ver perfil, capacidades e o que bloqueia                     |
| `npm run validate -- --quick`                | tipos, lint, arquitetura, styleguide e testes sem cobertura  |
| `npm run validate -- --changed`              | só o que os arquivos alterados afetam                        |
| `npm run validate -- --changed=main`         | idem, comparando a branch com `main`                         |
| `npm run validate -- --files=src/features/x` | derivar o alvo de um caminho específico                      |
| `npm run validate -- --only=lint,test`       | só estas suítes                                              |
| `npm run validate -- --skip=build`           | tudo menos estas                                             |
| `npm run validate -- --strict`               | tratar aviso como falha (sobe para o perfil rigoroso)        |
| `npm run validate -- --no-bail`              | rodar tudo antes de falhar, para ver o conjunto de problemas |

`--changed` e `--files` não param no arquivo tocado: o alvo é o **fechamento
transitivo** do grafo de imports — os arquivos alterados mais todos que
dependem deles — e os testes que cobrem esse conjunto. Mexer num utilitário de
`shared` traz os testes das features que o usam.

Duas ressalvas, por construção:

- **Cobertura não é aplicada em execução parcial.** O limite mede o projeto
  inteiro; um subconjunto nunca o alcançaria. O número vem do gate completo.
- **Mudança de configuração** (`package.json`, `tsconfig*`, `vite.config.ts`,
  `.template-state.json`...) cancela a seleção e roda tudo: ela altera a
  interpretação de todo o resto, e não há subconjunto confiável.

## Verificação automática

| Momento      | O que roda                                            |
| ------------ | ----------------------------------------------------- |
| `pre-commit` | `lint-staged` nos arquivos alterados                  |
| `commit-msg` | Convenção da mensagem                                 |
| `pre-push`   | `typecheck` e `test:unit` (Vitest sem cobertura)      |
| Pull Request | `validate` em Node 24/26, auditoria e E2E no Chromium |

Os hooks são atalhos para pegar o problema cedo; corrija a causa quando um deles
falhar. O CI executa os portões completos e é a fonte da verdade.

## Definição de concluído

Uma tarefa está concluída quando:

- Os critérios de aceite foram atendidos
- Funciona localmente
- Os testes passam
- Não há erro nas suítes bloqueantes do perfil (`npm run validate` verde)
- O CI está verde no Pull Request
- A documentação foi atualizada quando necessário
- A entrega está registrada em [entregas](entregas/README.md) — para mudança
  que cria funcionalidade ou altera arquitetura; correção pontual não exige
- As alterações estão registradas no Git
