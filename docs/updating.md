# Atualizando seu Projeto

Como este projeto foi criado a partir de um template, o template pode receber atualizações (novas configurações, regras de lint, integrações de CI/CD).

Para trazer essas atualizações para o seu projeto sem perder suas modificações:

1. Adicione o repositório do template como um _remote_:
   `git remote add template https://github.com/DevEdTech/template-ia-web.git`
2. Baixe as atualizações:
   `git fetch template`
3. Faça o merge das alterações na sua branch atual (permitindo históricos diferentes na primeira vez):
   `git merge template/master --allow-unrelated-histories`
4. Resolva possíveis conflitos (geralmente no `README.md` ou `package.json`).
5. Faça um commit com a resolução.

Depois de configurar o remote `template` na primeira vez, os passos 2, 3 e 4 bastarão para as próximas atualizações.
