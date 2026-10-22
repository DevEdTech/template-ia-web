# Primeiros passos

Este guia acompanha quem acabou de criar um projeto a partir do template.
O objetivo é sair da base instalada para a primeira funcionalidade planejada.

## 1. Instale e abra o projeto

Crie seu repositório com **Use this template** no GitHub e abra a pasta no
terminal. Ative o Node 24 LTS com `nvm use`, caso use nvm. Use npm 10.6.0, a versão
declarada em `package.json`.

```bash
npm install --global npm@10.6.0
npm install
npm run setup
npm run dev
```

O setup pergunta o nome exibido, o identificador técnico e a descrição. Para
explorar a base antes de começar, mantenha as demonstrações. Abra o endereço
que o Vite mostrar no terminal; ele pode usar outra porta se a padrão estiver ocupada.
Não é necessário configurar uma API nem criar `.env.local` para o exemplo funcionar.

## 2. Explore a página inicial

A página de boas-vindas organiza o trabalho em três etapas expansíveis:
personalizar, explorar e planejar. Os comandos devem ser executados no terminal
da pasta do projeto; o prompt deve ser colado no agente de código. Copiar um
comando não o executa. Se o navegador bloquear a área de transferência,
selecione o texto e copie manualmente.

No exemplo de notas, adicione um título e recarregue a página. A nota permanece
no mesmo navegador. Não há conta, backend ou sincronização entre dispositivos.
A rota `/styleguide` mostra os componentes e os tokens da Vitru.

## 3. Passe da ideia para a primeira funcionalidade

Copie o prompt da terceira etapa, descreva sua ideia e quem vai usar o produto.
A skill `plan-app` conduz a descoberta e aguarda aprovação antes de implementar.
Se já existe um produto definido em `docs/prd.md`, use `plan-feature` para
planejar a próxima funcionalidade e `implement-feature` após aprovar o plano.
Veja [agents.md](agents.md) e [development-process.md](development-process.md).

Substitua o conteúdo de `src/features/home` pela página inicial do seu produto.
A composição de páginas e exemplos fica em `src/app/routes/index.tsx`.

## 4. Remova a demonstração quando estiver pronto

Substitua os nomes abaixo pelos do seu projeto. Primeiro, confira o plano:

```bash
npm run setup -- --name="meu-app" --display-name="Meu App" --remove-example --keep-tasks --dry-run
```

Depois, repita sem `--dry-run`. A opção `--keep-tasks` preserva seu backlog;
sem ela o setup reinicia `tasks.md`. A remoção apaga a feature `notes` e sua
composição na rota, preserva outras features e mantém o guia inicial e o
styleguide. Ela não apaga dados já gravados no navegador.

Se você personalizou a composição das notas na rota, remova suas referências
antes de repetir o comando. O setup interrompe e restaura os arquivos quando
não consegue remover a composição com segurança.

## 5. Valide antes de entregar

```bash
npm run validate
```

Esse comando verifica as regras, a documentação, os estilos, os tipos, os testes
e o build. A validação local não substitui os E2E nem os checks do CI.
O fluxo de entrega está em [development-process.md](development-process.md).

## Quando algo não funcionar

| Situação                                 | O que fazer                                                                             |
| ---------------------------------------- | --------------------------------------------------------------------------------------- |
| npm informa versão incompatível          | Confira `node --version` e `npm --version`; ative Node 24 LTS e npm 10.6.0.             |
| O setup só mostra um comando de uso      | Em um agente sem terminal interativo, passe `--name` e `--display-name` explicitamente. |
| A página não abre                        | Use o endereço exato que aparece após `npm run dev` e mantenha o terminal aberto.       |
| O botão Copiar falha                     | Selecione o texto visível e copie manualmente.                                          |
| As notas não aparecem em outro navegador | O exemplo usa armazenamento local; cada navegador mantém seus próprios dados.           |
| A validação falha                        | Leia a primeira falha e peça ao agente para corrigir a causa; depois execute novamente. |
