---
name: implement-feature
description: Use para implementar uma tarefa já planejada, mantendo as alterações dentro do escopo e validando o resultado.
---

# Implementar funcionalidade

## Finalidade

Implementar uma tarefa já planejada, com alterações mínimas e
verificadas.

## Quando usar

- Após o planejamento (plan-feature), quando o escopo está claro.
- Para executar uma tarefa específica dentro do escopo aprovado.

## Processo

1. Confirme os critérios de aceite da tarefa.
2. Declare os arquivos que serão alterados antes de começar.
3. Limite as alterações ao escopo da tarefa.
4. Não expanda o escopo nem antecipe trabalho futuro.
5. Reutilize os padrões e módulos já existentes.
6. Mantenha APIs externas e armazenamento atrás de serviços.
7. Adicione ou atualize os testes de comportamento afetados.
8. Execute `npm run validate`.
9. Revise o diff final.

## Resultado esperado

- Lista de arquivos alterados.
- Resumo das mudanças.
- Resultado das validações (`npm run validate`).
- Limitações ou pendências conhecidas.
