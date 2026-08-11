# Styleguide

Este documento define a base visual do projeto. Ele vale desde o primeiro
commit e **continua valendo depois do `npm run setup`**: o setup renomeia o
projeto, mas não remove os tokens, a página do styleguide nem estas regras.

Referência viva: rode `npm run dev` e abra [`/styleguide`](../src/features/styleguide/index.ts).
Verificação automática: `npm run check:styleguide` (roda dentro do `npm run validate`).

## Regras que não mudam

1. Cor, espaçamento, tipografia, raio, sombra e transição vêm de tokens.
   Nenhum arquivo CSS além de `src/shared/styles/tokens.css` declara valor
   literal de cor.
2. A biblioteca de ícones é `lucide-react`. Não adicione outra.
3. Estilo de componente fica no CSS Module do próprio componente
   ([ADR 0005](decisions/0005-css-modules.md)); `global.css` cuida apenas de
   elementos nativos.
4. Foco visível é obrigatório: o anel padrão vem do `:focus-visible` global.
5. Componentes neutros de domínio (botão, campo, etc.) ficam em
   `src/shared/components` e são reutilizados pelas features.
6. Ao evoluir a identidade visual, altere os tokens — não os componentes.

## Tokens

Fonte de verdade: [`src/shared/styles/tokens.css`](../src/shared/styles/tokens.css).
Importado uma única vez por `global.css`, que entra pelo `main.tsx`.

### Tema

O tema padrão é `vitru`, declarado em `:root[data-theme='vitru']` e aplicado
pelo atributo `data-theme="vitru"` no `<html>` do `index.html`. O mesmo bloco
também responde por `:root` puro, então a aplicação nunca renderiza sem paleta.

| Token               | Uso                                           |
| ------------------- | --------------------------------------------- |
| `--paper`           | Fundo padrão da aplicação                     |
| `--paper-2`         | Fundo de blocos, listas e áreas destacadas    |
| `--ink`             | Texto principal                               |
| `--ink-soft`        | Texto secundário, legendas e metadados        |
| `--line`            | Bordas e divisores                            |
| `--accent`          | Ação primária, links e anel de foco           |
| `--navy`            | Títulos e áreas de marca                      |
| `--navy-strong`     | Hover da ação primária                        |
| `--on-accent`       | Texto sobre a cor de ação                     |
| `--success`         | Confirmação e status positivo                 |
| `--danger`          | Erro e ação destrutiva                        |
| `--danger-line`     | Borda de área com erro                        |
| `--danger-bg`       | Fundo de área com erro                        |
| `--danger-bg-hover` | Hover da área com erro                        |
| `--field-bg`        | Fundo de campo de formulário                  |
| `--field-border`    | Borda de campo de formulário                  |
| `--week-today-bg`   | Marcação de destaque (ex.: hoje)              |
| `--week-today-fill` | Preenchimento suave do destaque               |
| `--shadow`          | Cor das sombras                               |
| `--backdrop`        | Fundo de modal e overlay                      |
| `--bar-edge`        | Borda sutil sobre superfícies coloridas       |
| `--event-*-bg/-ink` | Categorias de evento (férias, viagem, evento) |

### Escala

Independente de tema, também em `tokens.css`:

- Tipografia: `--font-sans`, `--font-mono`, `--text-xs` a `--text-2xl`,
  `--leading-tight`/`--leading-normal`, `--weight-regular` a `--weight-bold`.
- Espaçamento (base 4px): `--space-1` (4px) a `--space-8` (48px).
- Formas: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`,
  `--border-width`, `--elevation-1`, `--elevation-2`.
- Movimento: `--transition-fast`, `--transition-base` (zerados
  automaticamente com `prefers-reduced-motion`).
- Ícones: `--icon-size`, `--icon-size-sm`, `--icon-stroke`.
- Layout: `--layout-max`.

### Uso

```css
.card {
  padding: var(--space-4);
  background-color: var(--paper-2);
  border: var(--border-width) solid var(--line);
  border-radius: var(--radius-md);
  color: var(--ink);
}
```

## Ícones

Biblioteca padrão: [`lucide-react`](https://lucide.dev/icons/). Está em
`dependencies`; nenhuma outra biblioteca de ícones deve ser adicionada.

```tsx
import { Trash2 } from 'lucide-react';

<button aria-label={`Remover ${item.nome}`}>
  <Trash2 className="icon icon-sm" aria-hidden="true" />
  Remover
</button>;
```

- Use a classe `icon` (20px) ou `icon-sm` (16px); o tamanho vem dos tokens.
- Ícone decorativo leva `aria-hidden="true"`; o significado fica no texto.
- Ícone sem texto ao lado exige `aria-label` no elemento interativo.
- A cor segue `currentColor`: defina a cor no elemento pai, não no ícone.
- `icon` e `icon-sm` são classes globais (`global.css`). Para estilizá-las de
  dentro de um CSS Module, use `:global(.icon)` — sem isso o nome é hasheado e
  a regra nunca casa.

## Componentes base

- `Button` (`src/shared/components/Button.tsx`) com as variantes `primary`,
  `secondary` e `danger`. Use `primary` para a ação principal da tela (uma por
  tela), `secondary` para ações de apoio e `danger` para ações destrutivas.
- Campos de formulário seguem o padrão demonstrado no styleguide: rótulo
  visível associado por `htmlFor`, `aria-invalid` em erro e mensagem
  descrita por `aria-describedby`.
- Estados de tela obrigatórios: carregando, vazio, sucesso e erro
  ([architecture.md](architecture.md)).

## Acessibilidade

- Contraste mínimo AA para texto sobre qualquer superfície.
- Nunca remova o `outline` de foco sem oferecer substituto equivalente.
- Movimento reduzido é respeitado pelos tokens de transição.
- `npm run lint` inclui `eslint-plugin-jsx-a11y`.

## Como mudar a identidade visual

1. Edite os valores em `tokens.css` (ou acrescente um bloco
   `:root[data-theme='outro-tema']` e troque o `data-theme` do `index.html`).
2. Rode `npm run dev` e confira `/styleguide`.
3. Rode `npm run validate`.
4. Registre a decisão em `docs/decisions/` se a mudança for estrutural.

Não adicione framework de CSS nem biblioteca de componentes sem ADR: a decisão
atual é CSS Modules + tokens ([ADR 0005](decisions/0005-css-modules.md),
[ADR 0011](decisions/0011-design-tokens-and-styleguide.md)).

## Verificação

`npm run check:styleguide` avisa quando:

- falta um token obrigatório em `tokens.css`;
- `global.css` não importa os tokens ou o `<html>` não declara o tema;
- algum CSS fora de `tokens.css` usa cor literal (hex, `rgb()`, `hsl()` ou
  nome de cor);
- aparece outra biblioteca de ícones, ou `lucide-react` sai das dependências.

Por padrão o comando apenas avisa e não interrompe o `npm run validate`. Para
transformar os avisos em falha (por exemplo, no CI de um projeto que queira
essa rigidez), use:

```bash
npm run check:styleguide -- --strict
```
