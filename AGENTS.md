# Instruções do projeto

## Perfil deste projeto

O perfil e as capacidades ficam em `.template-state.json` e decidem o que vale
aqui. Veja o estado atual com:

```bash
npm run validate -- --list
```

- **Perfil** (`prototipo` | `padrao` | `rigoroso`): define o que bloqueia e o
  que apenas avisa. Em `prototipo`, só tipos, lint e testes bloqueiam.
- **Capacidades**: o que o projeto usa. Uma capacidade desligada não é
  verificada e suas regras não se aplicam — `styleguide: false` significa que
  as regras do kit da Vitru não valem neste repositório.

Uma regra abaixo que mencione capacidade desligada não se aplica. Na dúvida,
`--list` é a fonte da verdade, não este texto.

## Leia primeiro

1. README.md
2. docs/architecture.md
3. docs/development-process.md
4. docs/testing.md
5. docs/styleguide.md (antes de qualquer trabalho de interface)

## Processo

Sempre, qualquer que seja o tamanho da mudança:

1. Entenda a solicitação e os critérios de aceite.
2. Inspecione os arquivos relevantes e os testes existentes.
3. Mantenha as alterações dentro do escopo solicitado.
4. Adicione ou atualize testes para mudanças de comportamento.
5. Execute `npm run validate` (ou `-- --changed` durante o trabalho).
6. Revise o diff final.

Para mudança que afeta vários arquivos, cria funcionalidade, altera
arquitetura ou integra serviço externo, acrescente:

7. Apresente um plano antes de escrever código (`plan-feature`).
8. Atualize a documentação afetada.
9. Registre a evidência da entrega em `docs/entregas`.

Correção pontual, ajuste de texto e mudança de uma linha param no passo 6:
plano, documentação e registro de entrega existem para trabalho que muda o
entendimento do projeto, não para toda edição.

## Arquitetura

- Organize as capacidades do produto em `src/features`.
- Não importe arquivos internos de outra feature.
- Use as exportações públicas das features (index.ts).
- Mantenha APIs externas e armazenamento do navegador atrás de serviços.
- Mantenha `shared` neutro em relação ao domínio.
- Não adicione abstrações sem necessidade demonstrada.

## Estilo e interface

Aplicável quando a capacidade `styleguide` está ligada.

- Siga `docs/styleguide.md`.
- Cor, espaçamento, tipografia, raio e transição vêm dos tokens de
  `@vitru/styleguide/tokens.css`. Não escreva cor literal em CSS de componente.
- Ícones somente de `lucide-react`, com a classe `icon`; acrescente
  `icon-sm` para o tamanho menor.
- Fontes oficiais: TheMix nos títulos (`--font-display`, só peso 700) e
  Archivo no texto (`--font-sans`). Não adicione fonte nem use CDN.
- Estilo de componente fica no CSS Module do próprio componente.
- Monte as telas com o kit de `@vitru/styleguide` (`PageHeader`, `Card`,
  `Input`, `Table`, `Alert`, `Dialog`, `LoadingState`, `EmptyState`,
  `ErrorState`...). Só crie componente novo se nenhum deles resolver.
- Campo de formulário sempre pelo `Input`/`Textarea`/`Select`.
- Toda tela que busca dados cobre carregando, vazio, erro e sucesso.
- Para mudar a identidade visual, altere os tokens, não os componentes.
- Mantenha a rota `/styleguide` funcionando e atualizada.

## Autenticação

Aplicável quando a capacidade `auth` está ligada. Regras completas na
[ADR 0015](docs/decisions/0015-authentication.md).

- O fluxo é Authorization Code + PKCE contra um provedor OIDC existente.
- Token de acesso vive **em memória**. Nunca grave token em `localStorage` nem
  em `sessionStorage`.
- Nunca coloque `client_secret` no projeto: o cliente é público e tudo que vai
  ao browser é legível.
- HTTP com o provedor fica em `features/auth/services`; regra pura em
  `features/auth/model`.
- Área protegida é embrulhada em `RequireAuth`, que já cobre descobrindo,
  redirecionando, autenticada, sem permissão e erro.
- Chamada autenticada a API usa `authorizationHeader(session)` dentro do
  serviço da feature que consome a API, nunca no componente.
- Manter base própria de usuários com senha continua fora de escopo: exige
  servidor, que este template não inclui.

## Escopo

- Não expanda o escopo além do solicitado.
- Uma funcionalidade por vez.

## Runtime

- Node.js mínimo 24; use a linha 24 LTS de `.nvmrc` como padrão local e de deploy.
- Não reintroduza suporte ou jobs de CI para Node 22.
- Mantenha `engines.node`, `.nvmrc`, lockfile, CI e documentação coerentes.

## Dependências

- Não adicione dependências sem explicar a necessidade.
- Prefira APIs da plataforma e dependências existentes.

## Segurança

- Nunca faça commit de segredos.

## Armazenamento e APIs

- Chamadas HTTP em serviços/clientes.
- Acesso a localStorage em adaptadores/repositórios.
- Leitura de `import.meta.env` só em `shared/config/env.ts`.

## Rotas

- Importe de `react-router`, nunca de `react-router-dom`.
- Acrescente rotas em `app/routes`, mantendo a curinga `'*'` por último.
- Não envolva o `<Outlet />` em `ErrorBoundary`: o `errorElement` já cobre.

## Commits

- Primeira linha no formato `tipo: descrição`, até 72 caracteres, sem ponto final.
- Não use `--no-verify` para contornar os hooks.

## Testes

- Toda mudança de comportamento deve considerar testes.
- Teste o resultado observável.
- Os limites de cobertura vêm do perfil (`npm run validate -- --list`); não os
  reduza para fazer passar, e não escreva teste de caso impossível para subir
  o número.
- Durante o trabalho, `npm run validate -- --changed` roda só os testes que
  cobrem o que você mexeu e o que depende disso.

## Documentação

- Toda decisão relevante atualiza a documentação ou uma ADR.
- Toda entrega implementada gera um registro em `docs/entregas`, com
  funcionalidades, testes e o resultado real das validações.
- Mudança que cria ou revoga uma regra atualiza este `AGENTS.md`.

## Conclusão

Uma tarefa só está concluída quando todos os itens da definição de
concluído estiverem satisfeitos. A lista fica em
`docs/development-process.md` e é a única fonte da verdade.
