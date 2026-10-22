# Onboarding guiado do template

- **Data**: 2026-10-22
- **Branch**: `feat/onboarding-template`
- **Origem**: solicitação de melhoria do onboarding e da página de exemplo.

## Objetivo

Orientar quem acabou de criar um projeto pelo template até a primeira
funcionalidade planejada, com instruções consistentes na interface e no README.

## Funcionalidades entregues

- Página inicial com três etapas expansíveis: personalizar, explorar e planejar.
- Comandos e prompt copiáveis, com alternativa manual em caso de bloqueio.
- Exemplo de notas contextualizado, com explicação da persistência e da remoção.
- Navegação com estado ativo, link para pular ao conteúdo e layout responsivo.
- README com início rápido e guia dedicado em `docs/onboarding.md`.
- Setup com próximos passos, remoção da composição das notas nas rotas e
  rollback das rotas. O layout não é mais sobrescrito ao remover o exemplo.
- E2E de notas verifica persistência ao recarregar e é pulado explicitamente
  quando a demonstração é removida; onboarding e fallback continuam cobertos.

## Critérios de aceite

- [x] A página orienta o próximo passo e diferencia comando de prompt.
- [x] A cópia apresenta feedback de sucesso ou orientação manual na falha.
- [x] O exemplo continua funcional e mantém os dados ao recarregar.
- [x] A remoção do exemplo permite compilar sem imports quebrados.
- [x] A tela funciona em desktop e em celular sem rolagem horizontal.

## Arquivos alterados

- `src/features/home`: interface, blocos de cópia, estilos e testes.
- `src/app`: landmarks, navegação e composição opcional da demonstração.
- `scripts/setup.mjs` e `scripts/setup.test.mjs`: remoção e rollback.
- `e2e/app.spec.ts`: persistência e onboarding no celular.
- `e2e/__screenshots__/darwin/styleguide.png`: referência do cabeçalho atualizado.
- `README.md`, `docs/onboarding.md`, `docs/architecture.md` e
  `docs/testing.md`: orientação e contratos atualizados.

## Testes e validações

Resultados reais observados durante a entrega:

| Verificação                                                                             | Resultado                                                                                                                                |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run validate`                                                                      | Passou: skills, arquitetura, documentação, styleguide, formato, lint, tipos, 37 testes Vitest, 49 testes de scripts, build e smoke HTTP. |
| E2E no Chromium                                                                         | 5 testes passaram, incluindo persistência ao recarregar e onboarding a 390px.                                                            |
| Cópia temporária com `--remove-example --keep-tasks --no-sync-skills` e `npm run build` | Setup e build de produção passaram sem a feature notes.                                                                                  |
| Inspeção visual                                                                         | Desktop de 1280px e celular de 390px; sem erro JavaScript nem overflow horizontal.                                                       |

A imagem de referência do styleguide foi atualizada por alteração intencional
do cabeçalho compartilhado; o contrato de tokens e fontes continua validado.

## Limitações e pendências

- Os passos são orientação; a interface não executa comandos nem infere se o
  setup foi concluído. Nenhum progresso fictício é exibido.
- Os dados das notas continuam apenas no navegador.
- O CI remoto depende da publicação da branch e não foi executado nesta entrega.

## Como verificar manualmente

1. Rode `npm run dev` e abra o endereço mostrado no terminal.
2. Explore as três etapas e copie um comando e o prompt para um editor.
3. Adicione uma nota, recarregue e remova a nota.
4. Abra o styleguide pela segunda etapa e volte pelo menu Início.
5. Em uma cópia do projeto, execute o setup com `--remove-example`, usando
   seus nomes e `--keep-tasks` se quiser preservar o backlog. Rode o build e
   confira que o guia e o styleguide permanecem disponíveis.
