# Evolução de segurança, arquitetura e confiabilidade do template

## Contexto

O template já possui uma base saudável: fronteiras entre features, setup com
rollback, documentação, hooks, CI, testes, cobertura e smoke test do bundle. Em
8 de agosto de 2026, `npm run validate` passou com 55 testes, 91,37% de
statements, 81,91% de branches e 100% de funções cobertas.

O diagnóstico também encontrou oportunidades para tornar as garantias do
template mais coerentes com as regras documentadas e mais seguras para quem o
reutiliza. A mais urgente é o comportamento de `--remove-example`, que remove
todas as pastas de `src/features`, inclusive features que não pertencem à
demonstração.

## Objetivo

Evoluir o template em incrementos independentes para proteger dados do projeto,
automatizar regras arquiteturais, melhorar o exemplo canônico, tornar
atualizações previsíveis e ampliar a validação em navegador, sem aumentar a
complexidade inicial além do necessário.

## Requisitos

- O setup deve remover apenas artefatos que o template reconhece como exemplos.
- Reexecutar o setup não pode apagar features criadas pelo usuário.
- Opções de CLI documentadas e aceitas devem ter comportamento implementado e
  testado; opções obsoletas devem ser removidas.
- Regras arquiteturais objetivamente verificáveis devem falhar cedo no
  `npm run check:architecture`.
- O exemplo de notas deve preservar todo o comportamento observável atual.
- A interface do exemplo deve ter nome acessível explícito para o campo e
  associação entre campo e mensagem de erro.
- Projetos derivados devem conseguir identificar a versão do template de que
  partiram e quais migrações são aplicáveis.
- Documentação, hooks e comandos devem descrever o mesmo processo.
- Deve existir ao menos um teste que execute o fluxo principal em navegador
  real no CI.
- A versão do npm declarada deve ser a versão efetivamente usada no CI.
- Cada incremento deve manter `npm run validate` verde e atualizar testes e
  documentação afetados.

## Suposições

- `notes` é a única demonstração removível nesta versão do template.
- Features desconhecidas em `src/features` pertencem ao usuário e devem ser
  preservadas.
- A API pública atual da feature `notes` deve permanecer compatível.
- O verificador arquitetural continuará usando a AST do TypeScript e as
  dependências já instaladas.
- O teste em navegador poderá adicionar `@playwright/test`; a dependência se
  justifica por validar o bundle em um navegador real e deverá ser registrada em
  ADR.
- A atualização do template será incremental e explícita. O primeiro ciclo não
  fará merge automático de remotes nem resolverá conflitos de código do usuário.
- Os incrementos serão implementados em PRs separados, na ordem proposta.

## Não escopo

- Adicionar backend, autenticação, banco de dados ou gerenciador global de estado.
- Criar uma plataforma remota de distribuição do template.
- Migrar automaticamente alterações arbitrárias feitas por usuários.
- Cobrir todos os navegadores ou criar uma suíte E2E extensa.
- Redesenhar visualmente a aplicação demonstrativa.
- Trocar Vite, Vitest, React Router, ESLint ou o gerenciador de pacotes.
- Aumentar ou reduzir limites de cobertura apenas para acomodar a implementação.

## Proposta de solução

Executar sete incrementos, cada um entregável e reversível:

1. tornar o setup não destrutivo;
2. ampliar as regras arquiteturais executáveis;
3. simplificar o exemplo de notas e cobrir seus ramos críticos;
4. introduzir versionamento e migrações explícitas do template;
5. alinhar documentação e hooks;
6. adicionar um smoke E2E em navegador real;
7. aplicar de fato a versão declarada do npm no CI.

Os incrementos 1 a 3 reduzem os riscos mais próximos do código. O incremento 4
estabelece a base para evoluções futuras. Os incrementos 5 a 7 consolidam a
experiência operacional e a reprodutibilidade.

## Módulos envolvidos

- Setup e scaffolding: `scripts/setup.mjs`, `scripts/setup.test.mjs` e
  `.template-state.json`.
- Fronteiras arquiteturais: `scripts/check-architecture.mjs` e seus testes.
- Exemplo canônico: `src/features/notes` e testes colocalizados.
- Atualização do template: novo script em `scripts/`, testes black-box e
  `docs/updating.md`.
- Processo: `README.md`, `docs/development-process.md`, ADRs e hooks Husky.
- Teste em navegador: configuração E2E, scripts npm e workflow de CI.
- Toolchain: `package.json`, lockfile e `.github/workflows/ci.yml`.

## Tarefas sequenciais

### Incremento 1 — Proteger o setup

- [ ] Escrever um teste de regressão que crie `src/features/custom-feature`,
      execute o setup com `--remove-example` e verifique que somente `notes` foi
      removida.
- [ ] Substituir a remoção genérica de diretórios por uma lista explícita de
      exemplos pertencentes ao template.
- [ ] Garantir que a remoção continue idempotente quando o exemplo já não
      existir.
- [ ] Decidir entre implementar `--init-docs` ou removê-lo do parser. Preferir a
      remoção se não houver comportamento documentado que o exija.
- [ ] Testar rollback quando uma falha acontece depois da remoção do exemplo.
- [ ] Atualizar README e ADR do setup com a garantia de preservação das features
      do usuário.
- [ ] Executar `npm run validate` e revisar o diff.

#### Critérios de aceite do incremento 1

- [ ] `--remove-example` remove `src/features/notes` e nenhuma feature
      desconhecida.
- [ ] Repetir o comando produz o mesmo estado final sem erro.
- [ ] Uma falha intermediária restaura exemplos e arquivos alterados.
- [ ] Não existe opção de CLI aceita silenciosamente sem efeito.

### Incremento 2 — Automatizar as regras arquiteturais

- [ ] Adicionar fixtures negativas antes de mudar o verificador para os casos:
      `fetch` em componente, `localStorage` fora de `services`/adaptadores e
      `import.meta.env` fora de `shared/config/env.ts`.
- [ ] Definir na documentação quais caminhos são permitidos para clientes HTTP,
      repositórios e configuração de ambiente.
- [ ] Estender a travessia AST para identificar essas APIs sem falsos positivos
      em comentários, strings, testes ou scripts Node.
- [ ] Preservar as verificações atuais de imports estáticos, reexports e imports
      dinâmicos entre features.
- [ ] Adicionar mensagens de erro que indiquem arquivo, regra violada e destino
      esperado.
- [ ] Avaliar uma regra objetiva para impedir dependências de domínio em `app`;
      implementar somente se houver critério sintático confiável.
- [ ] Atualizar `docs/architecture.md`, `docs/integrations.md` e o ADR de
      fronteiras.
- [ ] Executar `npm run validate` e revisar o diff.

#### Critérios de aceite do incremento 2

- [ ] Cada violação suportada possui ao menos um teste que falha sem a regra.
- [ ] O código atual e os arquivos gerados por `generate:feature` continuam
      aprovados.
- [ ] Comentários, strings e testes não causam falsos positivos.
- [ ] As regras documentadas correspondem exatamente ao que o script verifica.

### Incremento 3 — Melhorar o exemplo canônico de notas

- [ ] Acrescentar testes observáveis para conflito de revisão, falha durante
      sincronização entre abas, tentativa de remover nota inexistente e limpeza do
      erro após correção do título.
- [ ] Extrair estado, persistência e sincronização de `NoteList` para um hook
      interno da feature, sem expô-lo pela API pública.
- [ ] Manter `NoteList` como componente de apresentação e composição do fluxo.
- [ ] Adicionar um `label` explícito ao campo de título e ligar a mensagem de
      validação usando `aria-describedby`.
- [ ] Preservar mensagens, ordem das notas, sincronização entre abas, migração,
      backup e conflito de revisão.
- [ ] Confirmar que a complexidade do componente diminuiu e que a cobertura dos
      ramos críticos aumentou sem testes de detalhes internos.
- [ ] Atualizar a descrição da feature em `docs/architecture.md`, se a nova
      separação de responsabilidades precisar ser registrada.
- [ ] Executar `npm run validate` e revisar o diff.

#### Critérios de aceite do incremento 3

- [ ] Todos os fluxos existentes continuam observavelmente iguais.
- [ ] Falhas de leitura, escrita, conflito e sincronização aparecem na interface.
- [ ] O campo possui nome acessível e a mensagem de erro está associada a ele.
- [ ] `NoteList` não acessa diretamente `localStorage` nem contém a orquestração
      completa da persistência.

### Incremento 4 — Versionar e migrar o template

- [ ] Registrar `templateVersion` em `.template-state.json` e definir a primeira
      versão de referência.
- [ ] Fazer o setup preservar e atualizar esse metadado de forma idempotente.
- [ ] Criar um comando de atualização que leia a versão atual, liste migrações
      disponíveis e ofereça `--dry-run`.
- [ ] Modelar migrações locais, sequenciais e testáveis, com falha para versões
      desconhecidas ou caminhos incompletos.
- [ ] Reutilizar a estratégia transacional do setup para restaurar arquivos se
      uma migração falhar.
- [ ] Criar testes black-box para projeto atualizado, projeto já atualizado,
      dry-run e rollback.
- [ ] Substituir em `docs/updating.md` o merge com históricos não relacionados
      pelo fluxo versionado e documentar como atualizações manuais excepcionais são
      tratadas.
- [ ] Registrar a decisão em novo ADR.
- [ ] Executar `npm run validate` e revisar o diff.

#### Critérios de aceite do incremento 4

- [ ] Um projeto informa de qual versão do template partiu.
- [ ] O comando mostra antecipadamente arquivos e migrações que serão aplicados.
- [ ] Reexecução não repete migrações concluídas.
- [ ] Falhas não deixam o projeto em estado parcialmente migrado.
- [ ] O processo não sobrescreve código do usuário sem uma migração explícita.

### Incremento 5 — Alinhar processo, documentação e hooks

- [ ] Remover a recomendação de `--no-verify` do README e de
      `docs/development-process.md`, alinhando-os ao `AGENTS.md`.
- [ ] Descrever o `pre-push` como `typecheck` mais testes Vitest sem cobertura,
      refletindo os comandos reais do hook.
- [ ] Verificar se README, documentação, PR template e ADR de quality gates usam
      os mesmos nomes para validações locais e de CI.
- [ ] Ampliar `check:docs` apenas com verificações objetivas que previnam a volta
      dessas divergências.
- [ ] Atualizar testes do verificador de documentação.
- [ ] Executar `npm run validate` e revisar o diff.

#### Critérios de aceite do incremento 5

- [ ] Nenhum documento recomenda contornar hooks.
- [ ] A descrição de cada hook corresponde ao arquivo executado pelo Husky.
- [ ] Comandos e links documentados continuam validados automaticamente.

### Incremento 6 — Adicionar smoke E2E em navegador real

- [ ] Registrar em ADR a necessidade e o custo de `@playwright/test` antes de
      adicionar a dependência.
- [ ] Configurar um servidor efêmero do bundle e um projeto Chromium.
- [ ] Criar um único fluxo E2E que carregue a aplicação, adicione e remova uma
      nota e confirme a rota desconhecida.
- [ ] Usar seletores por papel e nome acessível para que o teste também pressione
      a semântica básica da interface.
- [ ] Adicionar `test:e2e` aos scripts npm e um job de CI que instale o navegador
      de forma explícita.
- [ ] Manter `npm run validate` utilizável sem download implícito de navegador;
      documentar que o CI executa `validate` e `test:e2e` como gates separados.
- [ ] Publicar trace ou screenshot somente quando o teste falhar.
- [ ] Atualizar `docs/testing.md` e `docs/building.md`.
- [ ] Executar validação local aplicável, E2E e revisar o diff.

#### Critérios de aceite do incremento 6

- [ ] O CI falha se o bundle não iniciar ou se o fluxo principal quebrar no
      Chromium.
- [ ] O teste não depende de rede externa, porta fixa ou dados preexistentes.
- [ ] Evidências de falha ficam disponíveis como artefato do CI.
- [ ] A instalação adicional e seu custo estão documentados.

### Incremento 7 — Reproduzir a versão declarada do npm

- [ ] Confirmar a política: manter uma versão exata do npm ou declarar apenas a
      faixa suportada. Preferir manter a versão exata já informada pelo template.
- [ ] Fazer o CI instalar e exibir a versão declarada antes de `npm ci`, tanto no
      job de validação quanto no de auditoria.
- [ ] Adicionar uma verificação leve que detecte divergência entre
      `packageManager` e o npm em uso nos ambientes controlados.
- [ ] Documentar como atualizar Node, npm e lockfile em conjunto.
- [ ] Confirmar a matriz Node 22/24 com a mesma versão do npm.
- [ ] Executar `npm run validate` nas versões suportadas e revisar o diff.

#### Critérios de aceite do incremento 7

- [ ] Os logs do CI mostram a mesma versão de npm declarada em `package.json`.
- [ ] `npm ci` reproduz o lockfile nas duas versões suportadas do Node.
- [ ] A documentação não promete um pin que a automação deixe de aplicar.

## Riscos e pontos de atenção

- **Setup destrutivo:** os testes devem criar features sentinela antes de alterar
  a lógica de remoção.
- **Falsos positivos arquiteturais:** regras AST precisam ser estritas e contar
  com fixtures válidas e inválidas.
- **Excesso de abstração:** o hook de notas só se justifica se reduzir a
  responsabilidade do componente sem criar uma camada genérica.
- **Migrações incompletas:** toda versão suportada precisa ter caminho contínuo
  até a versão atual.
- **Peso do E2E:** Playwright aumenta tempo e armazenamento do CI; por isso o
  escopo inicial fica limitado a Chromium e um fluxo crítico.
- **Diferença entre local e CI:** comandos que exigem navegador ou múltiplas
  versões do Node devem ser explícitos, não efeitos ocultos de `validate`.
- **Compatibilidade do npm:** a versão escolhida deve funcionar em toda a matriz
  de Node antes de ser imposta.

## Critérios de aceite globais

- [ ] Os sete incrementos foram entregues separadamente e na ordem planejada, ou
      uma mudança de ordem foi registrada com justificativa.
- [ ] Nenhum incremento altera comportamento fora da sua frente.
- [ ] Toda mudança de comportamento possui teste de resultado observável.
- [ ] `npm run validate` passa ao final de cada incremento.
- [ ] O CI passa em todas as versões suportadas do Node.
- [ ] Novas dependências têm necessidade e trade-offs registrados em ADR.
- [ ] Documentação, scripts, hooks e comportamento real permanecem alinhados.
- [ ] O diff de cada incremento é revisado antes do commit ou PR.
