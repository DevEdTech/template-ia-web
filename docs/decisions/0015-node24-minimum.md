# ADR 0015 — Node 24 como versão mínima

- **Status**: Aceito
- **Data**: 2026-10-22

## Contexto

O projeto declarava Node 22 como mínimo e validava as linhas 22 e 24 no CI.
A orientação atual é manter o template em Node 24 LTS ou versões superiores.

## Decisão

- Declarar `engines.node` como `>=24`, também no pacote raiz do lockfile.
- Fixar `.nvmrc` em `24` para desenvolvimento, auditoria, E2E e deploy.
- Manter `engine-strict=true`, recusando instalação em versões anteriores.
- Executar o CI nas linhas 24 e 26; o relatório de cobertura vem do job 24.
- Preservar o npm 10.6.0 declarado em `packageManager`.
- Atualizar onboarding, instruções dos agentes e o modelo de README.

Esta decisão substitui a matriz de Node dos ADRs 0006 e 0010. Seus registros
originais e as evidências antigas descrevem o ambiente da época.

## Consequências

Node 22 deixa de ser suportado. Pessoas usando nvm devem executar `nvm install`
e `nvm use` na pasta do projeto. Os workflows que usam `.nvmrc` passam a Node 24
sem versões duplicadas na configuração. Declarações de engines de dependências
no lockfile continuam sendo metadados dos respectivos pacotes.
