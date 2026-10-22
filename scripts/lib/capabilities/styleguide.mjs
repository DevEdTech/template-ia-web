// Desliga a capacidade `styleguide`: troca o kit da Vitru por uma base visual
// local e mínima, e remove a rota, os testes, as regras e a documentação que
// existiam só por causa do pacote.
//
// Por que gerar uma base local em vez de simplesmente apagar: sem tokens e sem
// primitivos, as telas de exemplo deixam de compilar e o projeto nasce com
// cor literal espalhada. A base gerada é pequena de propósito — o que o kit
// removido realmente fornecia ao template — e pertence ao projeto, que pode
// trocá-la por qualquer outra sem mexer em regra de arquitetura.

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { replaceExact, replaceSection } from '../markdown-sections.mjs';

const PACKAGE = '@vitru/styleguide';

function write(root, file, content) {
  const path = join(root, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function edit(root, file, mutate) {
  const path = join(root, file);
  if (!existsSync(path)) return false;
  writeFileSync(path, mutate(readFileSync(path, 'utf8'), file));
  return true;
}

/** Tokens de contrato com valores neutros: o projeto ajusta à vontade. */
const TOKENS_CSS = `/* Base visual do projeto.
 *
 * Mesmo contrato de nomes que o template usa nos componentes, com valores
 * neutros. Trocar a identidade visual é trocar estes valores — não os
 * componentes. Cor literal em CSS de componente continua sendo erro.
 */
:root {
  /* Cores */
  --ink: #1a1c1e;
  --ink-soft: #5a6169;
  --paper: #ffffff;
  --paper-2: #f5f6f8;
  --line: #dfe3e8;
  --accent: #1f6feb;
  --on-accent: #ffffff;
  --danger: #b3261e;
  --danger-line: #f0c2bf;
  --danger-bg: #fdf3f2;
  --success: #1a7f4b;
  --field-bg: #ffffff;
  --field-border: #c4cad1;
  --shadow: 0 1px 2px rgb(26 28 30 / 8%), 0 4px 12px rgb(26 28 30 / 6%);
  --backdrop: rgb(26 28 30 / 45%);

  /* Tipografia */
  --font-display: system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-sans: system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-mono: ui-monospace, 'SFMono-Regular', 'Cascadia Mono', monospace;
  --text-sm: 0.875rem;
  --text-md: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.75rem;
  --leading-tight: 1.25;
  --leading-normal: 1.5;

  /* Espaçamento */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 3rem;
  --space-8: 4rem;

  /* Formas e movimento */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --border-width: 1px;
  --transition-base: 150ms ease;
  --focus-ring: 2px solid var(--accent);
  --icon-size: 1.25rem;
  --icon-size-sm: 1rem;
  --layout-width: 72rem;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: var(--text-md);
  line-height: var(--leading-normal);
}

:focus-visible {
  outline: var(--focus-ring);
  outline-offset: 2px;
}

.icon {
  width: var(--icon-size);
  height: var(--icon-size);
  flex: none;
}

.icon-sm {
  width: var(--icon-size-sm);
  height: var(--icon-size-sm);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 1ms !important;
    animation-duration: 1ms !important;
  }
}
`;

const BUTTON_TSX = `import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

/** Botão da base local. Uma ação primária por tela. */
export function Button({ variant = 'secondary', className, children, ...rest }: ButtonProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ');
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
`;

const BUTTON_CSS = `.button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: var(--border-width) solid var(--line);
  border-radius: var(--radius-md);
  background: var(--paper);
  color: var(--ink);
  font: inherit;
  cursor: pointer;
  transition: background var(--transition-base);
}

.button:hover:not(:disabled) {
  background: var(--paper-2);
}

.button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.primary {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--on-accent);
}

.primary:hover:not(:disabled) {
  filter: brightness(0.94);
  background: var(--accent);
}

.danger {
  border-color: var(--danger-line);
  background: var(--danger-bg);
  color: var(--danger);
}
`;

const PAGE_HEADER_TSX = `import type { ComponentType, ReactNode, SVGProps } from 'react';
import styles from './PageHeader.module.css';

/** Assinatura dos icones do lucide-react, sem acoplar ao pacote. */
type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  icon?: IconComponent;
};

/** Cabeçalho de página: título, apoio opcional e ações. */
export function PageHeader({ title, description, actions, icon: Icon }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>
          {Icon ? <Icon className="icon" aria-hidden="true" /> : null}
          {title}
        </h1>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}

type SectionHeadingProps = {
  title: string;
  description?: ReactNode;
  icon?: IconComponent;
};

/** Título de bloco dentro de uma página. */
export function SectionHeading({ title, description, icon: Icon }: SectionHeadingProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>
        {Icon ? <Icon className="icon" aria-hidden="true" /> : null}
        {title}
      </h2>
      {description ? <p className={styles.description}>{description}</p> : null}
    </div>
  );
}
`;

const PAGE_HEADER_CSS = `.header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-5);
}

.title,
.sectionTitle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  font-family: var(--font-display);
  line-height: var(--leading-tight);
}

.title {
  font-size: var(--text-xl);
}

.section {
  margin-bottom: var(--space-4);
}

.sectionTitle {
  font-size: var(--text-lg);
}

.description {
  margin: var(--space-2) 0 0;
  color: var(--ink-soft);
}

.actions {
  display: flex;
  gap: var(--space-2);
}
`;

const UI_INDEX = `// Base visual do projeto: o contrato que as features consomem.
//
// Começou como substituto mínimo do kit compartilhado. Cresça por necessidade
// demonstrada e mantenha o estilo de cada componente no seu CSS Module.
export { Button } from './Button';
export { PageHeader, SectionHeading } from './PageHeader';
`;

const AGENTS_SECTION = `## Estilo e interface

- A base visual é local: tokens em \`src/styles/tokens.css\` e primitivos em
  \`src/shared/ui\`. Este projeto não usa o kit \`@vitru/styleguide\`.
- Cor, espaçamento, tipografia, raio e transição vêm dos tokens. Não escreva
  cor literal em CSS de componente.
- Ícones somente de \`lucide-react\`, com a classe \`icon\`; acrescente
  \`icon-sm\` para o tamanho menor.
- Estilo de componente fica no CSS Module do próprio componente.
- Reutilize os primitivos de \`src/shared/ui\` antes de criar componente novo;
  quando criar, deixe-o lá se mais de uma feature for usá-lo.
- Campo de formulário tem \`label\` associado e mensagem de erro programática.
- Toda tela que busca dados cobre carregando, vazio, erro e sucesso.
- Para mudar a identidade visual, altere os tokens, não os componentes.`;

const STYLEGUIDE_DOC = `# Base visual

Este projeto **não usa** o kit \`@vitru/styleguide\`. A base visual é local e
pertence ao projeto.

## Onde cada coisa está

- **Tokens** (cor, tipografia, espaçamento, forma, movimento):
  \`src/styles/tokens.css\`
- **Primitivos reutilizáveis**: \`src/shared/ui\`
- **Estilo de um componente**: CSS Module ao lado do próprio componente

## Regras

1. Cor, espaçamento, tipografia, raio, sombra e transição vêm dos tokens.
2. CSS de componente não declara cor literal.
3. A biblioteca de ícones é \`lucide-react\`.
4. Estilo de feature permanece em CSS Module próprio.
5. Toda tela com dados cobre carregando, vazio, erro e sucesso.
6. Trocar a identidade visual é trocar os valores dos tokens, não os
   componentes.

## Acessibilidade

- contraste mínimo AA;
- foco visível preservado;
- movimento reduzido respeitado;
- ícones decorativos com \`aria-hidden="true"\`;
- ícone sem texto exige nome acessível no controle.

## Verificação

A capacidade \`styleguide\` está desligada em \`.template-state.json\`, então
\`npm run check:styleguide\` não roda neste projeto. O que continua valendo é o
lint, o typecheck e os testes:

\`\`\`bash
npm run validate
\`\`\`

Se um dia o projeto adotar um kit compartilhado, ligue a capacidade de volta e
a verificação volta com ela.
`;

const ARCHITECTURE_SECTION = `## Estilo e identidade visual

Estilização por CSS Modules ([ADR 0005](decisions/0005-css-modules.md)), com os
valores vindos de \`src/styles/tokens.css\`. Cor, tipografia, espaçamento,
raio, sombra e movimento vêm de tokens; nenhum CSS de componente declara cor
literal.

Os primitivos reutilizáveis ficam em \`src/shared/ui\` e são a base das telas.
\`shared/ui\` é neutro em relação ao domínio, como o resto de \`shared\`: ele
não conhece nenhuma feature. As regras completas estão em
[styleguide.md](styleguide.md).`;

const TESTING_SECTION = `## Identidade visual

Este projeto usa base visual local, sem pacote compartilhado e sem página de
referência, então não há contrato de estilo nem regressão visual a proteger. O
que cobre a aparência é o teste de comportamento dos componentes: nome
acessível, estado visível e os quatro estados de tela (carregando, vazio, erro
e sucesso).

Se o projeto adotar um kit compartilhado, ligue a capacidade \`styleguide\` em
\`.template-state.json\` e traga de volta o gate correspondente.`;

/**
 * Remove o kit compartilhado e instala a base visual local.
 * @param {string} root raiz do repositório.
 * @param {(message: string) => void} log
 */
export function removeStyleguide(root, log = () => {}) {
  // 1. Base visual local, antes de qualquer remoção: nada fica sem referência.
  write(root, 'src/styles/tokens.css', TOKENS_CSS);
  write(root, 'src/shared/ui/index.ts', UI_INDEX);
  write(root, 'src/shared/ui/Button.tsx', BUTTON_TSX);
  write(root, 'src/shared/ui/Button.module.css', BUTTON_CSS);
  write(root, 'src/shared/ui/PageHeader.tsx', PAGE_HEADER_TSX);
  write(root, 'src/shared/ui/PageHeader.module.css', PAGE_HEADER_CSS);
  log('Base visual local criada: src/styles/tokens.css e src/shared/ui');

  // 2. Dependência.
  edit(root, 'package.json', (source) => {
    const pkg = JSON.parse(source);
    delete pkg.dependencies?.[PACKAGE];
    return `${JSON.stringify(pkg, null, 2)}\n`;
  });

  // 3. Entrypoint: o CSS do pacote dá lugar aos tokens locais.
  edit(root, 'src/main.tsx', (source, file) =>
    replaceExact(source, `import '${PACKAGE}/styles.css';`, "import './styles/tokens.css';", file),
  );

  // 4. Rota `/styleguide`.
  edit(root, 'src/app/routes/index.tsx', (source, file) => {
    let next = replaceExact(
      source,
      `import { StyleguidePage } from '${PACKAGE}/showcase';\n`,
      '',
      file,
    );
    next = replaceExact(
      next,
      `      {
        // Referência viva fornecida pelo pacote compartilhado.
        path: 'styleguide',
        element: <StyleguidePage />,
      },
`,
      '',
      file,
    );
    return next;
  });

  // 5. Shell: o link de navegação e o tratamento de largura da referência.
  edit(root, 'src/app/App.tsx', (source, file) => {
    let next = replaceExact(
      source,
      `// proprio header. Para isolar um widget arriscado dentro de uma pagina, use
// o \`ErrorBoundary\` de \`${PACKAGE}\`.`,
      `// proprio header.`,
      file,
    );
    next = replaceExact(
      next,
      "import { Home, Palette } from 'lucide-react';",
      "import { Home } from 'lucide-react';",
      file,
    );
    next = replaceExact(
      next,
      "import { NavLink, Outlet, useMatch } from 'react-router';",
      "import { NavLink, Outlet } from 'react-router';",
      file,
    );
    next = replaceExact(next, "  const isStyleguide = useMatch('/styleguide');\n\n", '', file);
    // Âncora exata, com a indentação do arquivo: regex folgada deixa linha em
    // branco solta e o Prettier reprova o resultado.
    next = replaceExact(
      next,
      `          <NavLink to="/styleguide">
            <Palette className="icon icon-sm" aria-hidden="true" />
            Styleguide
          </NavLink>
`,
      '',
      file,
    );
    // A tag inteira, já na forma que o Prettier produz sem o atributo longo:
    // trocar só a expressão deixaria os atributos quebrados em várias linhas
    // sem necessidade, e o `format:check` reprovaria o projeto recém-criado.
    next = replaceExact(
      next,
      `      <main
        id="conteudo"
        className={\`\${styles.content} \${isStyleguide ? styles.fullWidth : ''}\`}
        tabIndex={-1}
      >`,
      '      <main id="conteudo" className={styles.content} tabIndex={-1}>',
      file,
    );
    return next;
  });

  // 6. Imports do kit nas features de exemplo.
  for (const file of [
    'src/features/home/components/CopyBlock.tsx',
    'src/features/home/components/HomePage.tsx',
    'src/features/notes/components/NoteList.tsx',
  ]) {
    edit(root, file, (source, label) =>
      replaceExact(source, `from '${PACKAGE}'`, "from '@/shared/ui'", label),
    );
  }

  // 6b. Onboarding: a etapa que manda abrir a referência viva.
  edit(root, 'src/features/home/components/HomePage.tsx', (source, file) => {
    let next = replaceExact(
      source,
      `                  <Link to="/styleguide">
                    <Palette className="icon icon-sm" aria-hidden="true" />
                    Abrir o styleguide
                  </Link>
`,
      '',
      file,
    );
    next = replaceExact(
      next,
      `                <p className={styles.hint}>
                  Em <code>/styleguide</code> você encontra os componentes, as cores e a tipografia
                  que deve usar no projeto.
                </p>
`,
      `                <p className={styles.hint}>
                  Os tokens ficam em <code>src/styles/tokens.css</code> e os primitivos em{' '}
                  <code>src/shared/ui</code>.
                </p>
`,
      file,
    );
    next = replaceExact(
      next,
      `                <p>Veja como os componentes se comportam antes de construir sua primeira tela.</p>`,
      `                <p>Conheça a base visual antes de construir sua primeira tela.</p>`,
      file,
    );
    next = replaceExact(
      next,
      "import { ArrowRight, BookOpen, NotebookPen, Palette, Terminal } from 'lucide-react';",
      "import { ArrowRight, BookOpen, NotebookPen, Terminal } from 'lucide-react';",
      file,
    );
    // O único `<Link>` da página era o do styleguide.
    next = replaceExact(next, "import { Link } from 'react-router';\n", '', file);
    return next;
  });

  // 6c. Testes de unidade que afirmam a existência da referência viva.
  edit(root, 'src/app/tests/App.test.tsx', (source, file) =>
    replaceExact(
      source,
      `    expect(screen.getByRole('link', { name: 'Styleguide' })).toHaveAttribute(
      'href',
      '/template-ia-web/styleguide',
    );
`,
      `    expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute(
      'href',
      '/template-ia-web/',
    );
`,
      file,
    ),
  );
  edit(root, 'src/features/home/tests/HomePage.test.tsx', (source, file) => {
    let next = replaceExact(
      source,
      "  it('mantém a orientação e o styleguide quando a demonstração foi removida', async () => {",
      "  it('mantém a orientação quando a demonstração foi removida', async () => {",
      file,
    );
    next = replaceExact(
      next,
      `    expect(screen.getByRole('link', { name: 'Abrir o styleguide' })).toHaveAttribute(
      'href',
      '/styleguide',
    );
`,
      '',
      file,
    );
    return next;
  });

  // 7. E2E: a referência viva não existe mais.
  for (const path of ['e2e/styleguide.spec.ts', 'e2e/__screenshots__']) {
    const target = join(root, path);
    if (existsSync(target)) {
      rmSync(target, { recursive: true, force: true });
      log(`Removido: ${path}`);
    }
  }
  // Remoção por âncora, não por linha: filtrar linhas que mencionam o
  // styleguide quebraria uma expressão de várias linhas no meio.
  edit(root, 'e2e/app.spec.ts', (source, file) =>
    replaceExact(
      source,
      `  await page.getByRole('link', { name: 'Abrir o styleguide' }).click();
  await expect(page).toHaveURL(/\\/styleguide$/);
  await expect(page.getByRole('link', { name: 'Styleguide', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
`,
      '',
      file,
    ),
  );

  // 8. Regras e documentação.
  edit(root, 'AGENTS.md', (source) => replaceSection(source, 'Estilo e interface', AGENTS_SECTION));
  edit(root, 'CLAUDE.md', (source, file) =>
    replaceExact(
      source,
      `Em interface: use os tokens de \`${PACKAGE}/tokens.css\` (nunca cor
literal), ícones de \`lucide-react\` e o kit de \`${PACKAGE}\`. O
styleguide continua valendo depois da inicialização do repositório.`,
      `Em interface: use os tokens de \`src/styles/tokens.css\` (nunca cor
literal), ícones de \`lucide-react\` e os primitivos de \`src/shared/ui\`.
Este projeto não usa o kit \`${PACKAGE}\`.`,
      file,
    ),
  );
  write(root, 'docs/styleguide.md', STYLEGUIDE_DOC);
  edit(root, 'docs/architecture.md', (source) =>
    replaceSection(source, 'Estilo e identidade visual', ARCHITECTURE_SECTION),
  );
  edit(root, 'docs/testing.md', (source) =>
    replaceSection(source, 'Identidade visual', TESTING_SECTION),
  );
  log('Regras e documentação realinhadas: AGENTS.md, CLAUDE.md, docs/');
}
