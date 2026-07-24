# Processo de desenvolvimento

Fluxo recomendado para levar uma ideia até o código, de forma organizada e verificável.

## Fluxo

1. **Demanda**: descreva o que se quer resolver e para quem.
2. **Especificação**: detalhe o comportamento esperado, entradas e saídas.
3. **Critérios de aceite**: liste, de forma objetiva, o que precisa ser verdade para a demanda estar pronta.
4. **Planejamento**: quebre em passos. Você pode pedir ao agente: "Use a skill plan-feature...".
5. **Branch**: crie uma branch para o trabalho (`git checkout -b feat/descricao`).
6. **Implementação**: escreva o código seguindo a [arquitetura](architecture.md).
7. **Validação local**: rode `npm run validate` até ficar tudo verde.
8. **Commit**: registre as mudanças com mensagem clara.
9. **Pull Request**: abra o PR descrevendo o que mudou e por quê.
10. **Revisão**: ajuste conforme os comentários antes de integrar.

## Mensagens de commit

Use um prefixo de tipo:

```
feat: adiciona filtro de busca na lista de clientes
fix: corrige data exibida no formato errado
docs: documenta como configurar variáveis de ambiente
```

Outros prefixos úteis: `test:`, `refactor:`, `chore:`.

## Definição de concluído

Uma tarefa está concluída quando:

- Os critérios de aceite foram atendidos
- Funciona localmente
- Os testes passam
- Não há erro de lint, typecheck ou build (`npm run validate` verde)
- A documentação foi atualizada quando necessário
- As alterações estão registradas no Git
