# Styleguide

A base visual deste template vem do pacote `@vitru/styleguide`. A referência
viva continua disponível em `/styleguide` e é renderizada pelo subpath
`@vitru/styleguide/showcase`.

## Instalação e imports

O pacote está em `dependencies`. O CSS público é importado uma única vez por
`src/main.tsx`:

```tsx
import '@vitru/styleguide/styles.css';
```

Componentes são importados pelo entrypoint público:

```tsx
import { Button, Card, Input, PageHeader } from '@vitru/styleguide';
```

O template instala a versão publicada no registro público do npm. Atualize a
faixa semver em `package.json` e o lockfile para receber novas versões do kit;
não use `file:`, `link:` ou `workspace:` no template distribuído.

## Regras

1. Cor, espaçamento, tipografia, raio, sombra e transição vêm dos tokens
   expostos por `@vitru/styleguide/tokens.css`.
2. CSS de componentes não declara cor literal.
3. A biblioteca de ícones é `lucide-react`.
4. Estilo de feature permanece em CSS Module próprio.
5. Campos usam `Input`, `Textarea` ou `Select` do pacote.
6. Toda tela com dados cobre carregando, vazio, erro e sucesso.
7. Evoluções do kit acontecem no repositório `styleguide-vitru`, com teste e
   atualização da referência visual.

## Tema e tokens

O tema padrão é `vitru`, aplicado por `data-theme="vitru"` no `<html>`. O pacote
também fornece a paleta para `:root` sem atributo. Desde a 0.2, o pacote traz os
temas `light` (o mesmo `vitru`) e `dark`, trocados por `data-theme`, e o
`ThemeSwitch`/`useTheme` para oferecer a troca. O template segue no `vitru`: o
seletor da página `/styleguide` vale só para ela e não muda o tema do app.

Principais grupos:

- cores: `--paper`, `--ink`, `--accent`, `--danger`, `--success` e superfícies;
- tipografia: `--font-display`, `--font-sans`, tamanhos, pesos e entrelinhas;
- espaçamento: `--space-1` a `--space-8`;
- formas: raios, borda e elevações;
- movimento, foco, ícones e largura de layout.

Consulte `/styleguide` ou o arquivo distribuído por
`@vitru/styleguide/tokens.css` para o catálogo atual.

## Fontes

Archivo e sua licença OFL são distribuídas pelo pacote. TheMix é comercial: o
pacote contém apenas o nome da família e fallbacks adequados para títulos, nunca
os seus binários.

Este template mantém os arquivos licenciados em `public/fonts` e as declarações
locais em `src/styles/themix.css`. Em outro consumidor, copie os WOFF2 para
`public`, `src/assets` ou diretório equivalente e execute:

```bash
npx vitru-install-themix
```

O comando encontra o CSS principal e adiciona um bloco `@font-face` idempotente.
Use `--css=src/caminho.css` para indicar outro arquivo. Sem TheMix, os títulos
caem para `Arial Narrow`, `Aptos Display`, `Roboto Condensed` e fontes do
sistema.

## Kit público

O contrato atual inclui `PageHeader`, `Card`, `Button`, `Input`, `Textarea`,
`Select`, `Table`, `Alert`, `Badge`, `Dialog`, `ConfirmDialog`, `LoadingState`,
`EmptyState`, `ErrorState` e `ErrorBoundary`; para painéis e listas,
`SectionHeading`, `IconBadge`, `Meta`/`MetaLine`, `ListCard` e `ProgressRing`;
para barras de filtro, `SearchInput` e `FilterChip`; e ainda `Tooltip`,
`ShortcutLabel`, `ThinkingAnimation`, `ThemeSwitch`, `VitruLogo` e `VitruMark`.

Desde a 0.2, o `Button` tem 32px por padrão (`size="sm"`), com `xs` (28px) e
`md` (40px). O `Select` usa lista própria, com busca opcional (`searchable`), e o
`onChange` recebe o valor escolhido, não o evento. A página `/styleguide` mostra
cada um em uso.

Uma ação primária por tela; ações destrutivas pedem confirmação. Alertas e
etiquetas precisam transmitir significado por texto, não apenas por cor.

## Acessibilidade

- contraste mínimo AA;
- foco visível preservado;
- movimento reduzido respeitado;
- ícones decorativos com `aria-hidden="true"`;
- ícone sem texto exige nome acessível no controle.

## Verificação

```bash
npm run check:styleguide
npm run validate
npm run test:e2e
```

`check:styleguide` confirma a dependência e os exports do pacote, o import do
CSS, os tokens obrigatórios, a biblioteca de ícones e a ausência de cores
literais no código consumidor. O E2E protege o contrato computado e a regressão
visual de `/styleguide`.
