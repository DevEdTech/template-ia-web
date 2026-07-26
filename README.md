# web-project-template

Template de projeto front-end em React + TypeScript + Vite, pensado para pessoas que constroem interfaces com a ajuda de agentes de código. Vem com organização de pastas, padrões de qualidade e instruções para agentes já prontos.

## Objetivo

Dar um ponto de partida seguro e organizado para criar aplicações web simples. Você descreve o que quer, o agente implementa seguindo as regras deste template, e você valida com um único comando.

## Quando usar

Indicado para:

- Ferramentas internas simples
- Dashboards leves
- Formulários
- Protótipos
- Páginas de consulta
- CRUD com dados locais (no navegador)
- Demonstrações

## Quando NÃO usar (versão 1)

- Aplicativos móveis ou desktop nativos
- Backends complexos
- Microsserviços
- Sistemas financeiros ou com dados sensíveis
- Autenticação real de usuários
- Infraestrutura de produção crítica
- Qualquer sistema de alta criticidade

## Pré-requisitos

- Node.js 22 (o arquivo `.nvmrc` já indica a versão; com `nvm`, rode `nvm use`)
- npm (vem junto com o Node)
- git
- Um agente de código (ex.: Claude Code)

## Criar um novo projeto a partir do template

1. Crie o repositório a partir deste template (botão "Use this template" no GitHub) ou copie a pasta.
2. Entre na pasta do projeto.
3. Rode a instalação e o setup:

```bash
npm install
npm run setup
```

O `npm run setup` personaliza nome, descrição e organização do projeto, remove a feature de exemplo e sincroniza as skills dos agentes.

## Prompts Iniciais Recomendados (Copie e Cole)

Para ter o melhor fluxo de trabalho com seu agente de IA, utilize estes prompts iniciais em ordem:

**1. Inicialização do Projeto:**
```text
Rode o comando `npm install` seguido de `npm run setup`. Preencha as informações do novo projeto respondendo às perguntas interativas, se houver, ou me pergunte o que colocar.
```

**2. Concepção do Produto (se a ideia for nova):**
```text
Use a skill `plan-app` para conduzir uma entrevista curta comigo e definirmos o escopo deste produto. Ao final, gere o PRD e atualize as decisões de arquitetura.
```

**3. Planejamento de Funcionalidade:**
```text
Use a skill `plan-feature` para planejar a funcionalidade: [Descreva a funcionalidade aqui]. Quero revisar o plano antes da implementação.
```

**4. Implementação e Validação:**
```text
Use a skill `implement-feature` para executar o plano aprovado. Lembre-se de manter a Clean Architecture e garantir que o `npm run validate` passe limpo ao concluir.
```

## Instalação

```bash
npm install
```

## Execução

```bash
npm run dev
```

O Vite mostra no terminal o endereço local (algo como `http://localhost:5173`).

## Validação

Antes de considerar qualquer alteração pronta, rode:

```bash
npm run validate
```

Esse comando executa, em sequência: verificação das skills, checagem de formatação, lint, checagem de tipos, testes e build. Se todos passarem, a alteração está saudável.

## Comandos

| Comando                | O que faz                                                                |
| ---------------------- | ------------------------------------------------------------------------ |
| `npm run dev`          | Sobe o servidor de desenvolvimento com recarga automática                |
| `npm run build`        | Gera a versão de produção                                                |
| `npm run lint`         | Verifica problemas de código com ESLint                                  |
| `npm run format`       | Formata os arquivos com Prettier                                         |
| `npm run format:check` | Confere se os arquivos estão formatados                                  |
| `npm run typecheck`    | Verifica os tipos do TypeScript                                          |
| `npm run test`         | Roda os testes uma vez                                                   |
| `npm run test:watch`   | Roda os testes em modo contínuo                                          |
| `npm run setup`        | Personaliza o projeto (nome, descrição, organização) e sincroniza skills |
| `npm run sync:skills`  | Gera as cópias das skills em `.claude/skills` e `.agents/skills`         |
| `npm run check:skills` | Verifica se as cópias das skills estão sincronizadas                     |
| `npm run validate`     | Roda tudo: check:skills, format:check, lint, typecheck, test e build     |

## Estrutura resumida

```
src/
├── app/          # composição geral (providers, rotas, layout) — sem regra de negócio
├── features/     # cada capacidade do produto em sua pasta
│   └── example/  # exemplo mínimo; removido/renomeado no setup
├── shared/       # reutilizável e neutro (components, hooks, lib, styles, types)
├── test/         # setup.ts e render.tsx
└── main.tsx
docs/             # esta documentação
```

Detalhes em [docs/architecture.md](docs/architecture.md).

## Como usar agentes

As regras que os agentes devem seguir ficam em dois arquivos na raiz:

- `AGENTS.md` — regras gerais válidas para qualquer agente
- `CLAUDE.md` — instruções específicas para o Claude Code

Além disso, há skills que guiam tarefas comuns. Veja [docs/agents.md](docs/agents.md) para a lista e para exemplos de como acioná-las.

## Como criar uma feature

Se a ideia do aplicativo ainda não tem escopo fechado, comece com: "Use a skill plan-app para me ajudar a definir este produto". A skill conduz a conversa em linguagem simples, cria `docs/prd.md` após sua aprovação e registra as decisões em `docs/architecture.md`.

Depois que o produto estiver definido:

1. Peça ao agente um plano: "Use a skill plan-feature para planejar..."
2. Revise o plano.
3. Peça a implementação: "Use a skill implement-feature...".
4. Crie a pasta da feature em `src/features/<nome>` com `components`, `model`, `services`, `tests` e um `index.ts` que expõe a interface pública.
5. Rode `npm run validate`.

Regras de arquitetura em [docs/architecture.md](docs/architecture.md).

## Como registrar uma decisão

Decisões relevantes de arquitetura ou tecnologia viram um ADR (Architecture Decision Record) em `docs/decisions/`. Use o formato do primeiro registro, [0001-initial-architecture.md](docs/decisions/0001-initial-architecture.md), como modelo.

## Limitações conhecidas

- Sem backend: os dados vivem no navegador ou vêm de APIs externas.
- Sem autenticação real nem armazenamento seguro de segredos — tudo no front-end é público.
- Sem gerenciador global de estado por padrão.
- Voltado a aplicações simples; não substitui projetos de alta criticidade.
