# Atualizando seu projeto

Projetos derivados registram a versão de origem em
`.template-state.json`. Atualizações compatíveis são distribuídas como migrações
locais, sequenciais e transacionais no próprio repositório.

## Conferir uma atualização

Antes de alterar arquivos, liste as migrações aplicáveis:

```bash
npm run update:template -- --dry-run
```

O comando mostra cada transição de versão e não escreve no projeto.

## Aplicar uma atualização

Depois de revisar o plano:

```bash
npm run update:template
npm run validate
```

Migrações concluídas atualizam `templateVersion`. Repetir o comando não reaplica
etapas já executadas. Se qualquer etapa falhar, todos os arquivos declarados
pela migração são restaurados ao estado anterior.

## Obter novas migrações

O atualizador executa apenas migrações que já existem no checkout. Trazer uma
nova versão do template continua sendo uma operação explícita de Git: consulte o
changelog ou release correspondente, copie ou integre os arquivos do template em
uma branch dedicada e então rode o dry-run.

Não use `--allow-unrelated-histories` como fluxo padrão. Projetos derivados
podem ter mudanças incompatíveis, e conflitos devem ser resolvidos de forma
consciente antes de executar as migrações.

## Projetos criados antes do styleguide

O styleguide (tokens, tema `vitru`, `lucide-react` e a rota `/styleguide`) não é
distribuído por migração: ele adiciona arquivos, e migrações não sobrescrevem
código do usuário. Para adotá-lo em um projeto já existente, traga do template,
em uma branch dedicada:

1. `src/shared/styles/tokens.css` e a base de `src/shared/styles/global.css`;
2. o atributo `data-theme` no `<html>` do `index.html`;
3. `src/features/styleguide/` e a rota `/styleguide` em `src/app/routes`;
4. `scripts/check-styleguide.mjs`, seu teste e o script npm `check:styleguide`;
5. `docs/styleguide.md` e a [ADR 0011](decisions/0011-design-tokens-and-styleguide.md);
6. `npm install lucide-react`.

Depois rode `npm run check:styleguide` para listar o que ainda usa cor literal e
substitua por tokens aos poucos.

## Limites

- O comando não baixa versões, não faz merge e não resolve conflitos.
- Uma versão desconhecida falha com mensagem clara, sem alterar arquivos.
- Migrações não podem sobrescrever código do usuário sem declarar o arquivo como
  alvo e documentar a decisão.
- Faça a atualização em uma branch e revise o diff antes do merge.
