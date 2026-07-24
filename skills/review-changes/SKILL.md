---
name: review-changes
description: Use para revisar alterações antes de concluir uma tarefa, verificando escopo, arquitetura, testes, segurança e qualidade.
---

# Revisar alterações

## Finalidade

Revisar o diff de uma tarefa antes de considerá-la concluída.

## Quando usar

- Antes de encerrar uma tarefa.
- Antes de preparar um pull request.

## Processo

1. Verifique se os critérios de aceite foram atendidos.
2. Verifique se as alterações ficaram dentro do escopo.
3. Verifique a aderência à arquitetura por features.
4. Procure duplicação e código repetido.
5. Verifique se não foram adicionadas dependências desnecessárias.
6. Procure erros de lógica e tratamento de falhas.
7. Verifique acessibilidade nos componentes de interface.
8. Verifique se há testes para o comportamento alterado.
9. Verifique se a documentação foi atualizada.
10. Confirme que não há segredos expostos.
11. Procure código não utilizado ou morto.
12. Não altere arquivos inicialmente; proponha correções mínimas.

## Resultado esperado

Achados organizados por prioridade:

- Bloqueador.
- Importante.
- Melhoria.
- Observação.
