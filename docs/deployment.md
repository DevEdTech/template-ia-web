# Publicação no GitHub Pages

O Pages hospeda os arquivos estáticos gerados pelo Vite. A publicação inclui
a página inicial e o styleguide, sem backend. O exemplo de notas continua
salvando dados apenas no navegador.

## Publicação automática

1. No repositório, abra **Settings → Pages**.
2. Em **Build and deployment**, selecione **GitHub Actions** como Source.
3. Integre as alterações na `master`.
4. Acompanhe o workflow **GitHub Pages** em **Actions**.

O workflow valida o projeto antes de gerar o site e publica o artefato em um
job com permissão para Pages e OIDC. Apenas a `master` pode publicar, inclusive
em execução manual. Não há token pessoal nem segredo adicional no workflow.
O caminho público vem de `actions/configure-pages`: funciona tanto sob o nome
do repositório quanto na raiz de um domínio personalizado.

Neste repositório, a página inicial fica em
[https://devedtech.github.io/template-ia-web/](https://devedtech.github.io/template-ia-web/)
e o styleguide em
[https://devedtech.github.io/template-ia-web/styleguide/](https://devedtech.github.io/template-ia-web/styleguide/).

## Como o roteamento funciona

O build usa a mesma base para assets, favicon e `basename` do React Router.
A leitura de `BASE_URL` fica centralizada em `src/shared/config/env.ts`.
As fontes declaradas no CSS são reescritas pelo Vite para a base do build.

O GitHub Pages não oferece rewrite de SPA. Por isso `npm run build:pages`
gera uma cópia da entrada em `dist/styleguide/index.html`, permitindo abrir
e recarregar essa rota diretamente com HTTP 200. A cópia em `dist/404.html`
mostra a tela de não encontrado do app para endereços desconhecidos, mantendo
o status HTTP 404. As âncoras de seção do styleguide continuam disponíveis.

Ao adicionar uma nova rota pública que precisa de acesso direto, acrescente
sua entrada em `scripts/prepare-pages.mjs`. Rotas com parâmetros podem exigir
outra estratégia de hospedagem ou geração estática.

## Build local para o Pages

Em um terminal POSIX, execute:

```bash
PAGES_BASE_PATH=/template-ia-web/ npm run build:pages
```

`PAGES_BASE_PATH` é uma variável de build, não uma credencial. Sem ela, o
comando gera um site na raiz (`/`). O build normal e o servidor de
desenvolvimento continuam usando a raiz.

Para conferir o artefato, sirva `dist/` sob o mesmo prefixo, sem fallback de
SPA, e abra a página inicial e `/template-ia-web/styleguide/` diretamente.
Verifique também o favicon, as fontes e a navegação entre as páginas.

## Referências

- [Vite: GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages)
- [GitHub: configurar a origem da publicação](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
