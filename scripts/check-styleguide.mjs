#!/usr/bin/env node
// Verifica se o styleguide do template continua sendo respeitado.
//
// Executado dentro de `npm run validate`, que decide pelo perfil do projeto se
// o achado bloqueia ou só avisa. Aqui a saída é sempre fiel: diferente de zero
// quando há achado. Use `--warn-only` para o relatório sem derrubar o comando,
// e desligue a capacidade `styleguide` em `.template-state.json` quando o
// projeto não usar o kit da Vitru.
//
// Regras verificadas:
//  0. O projeto declara a capacidade `styleguide` (senão a verificação é
//     dispensada por completo, sem aviso).
//  1. O pacote `@vitru/styleguide` está instalado e expõe os tokens do
//     contrato (REQUIRED_THEME_TOKENS). Tokens de produto específico ficam em
//     OPTIONAL_THEME_TOKENS e a ausência deles não é achado.
//  2. `main.tsx` importa o CSS público e `index.html` declara o tema.
//  3. Nenhum CSS fora de `tokens.css` usa cor literal (hex, rgb, hsl ou nome
//     de cor CSS): componentes consomem `var(--token)`.
//  4. A única biblioteca de ícones é `lucide-react`, declarada em
//     `dependencies`.
//  5. O pacote continua expondo o kit base esperado pelo template.
//
// Compatível com macOS, Linux e Windows: apenas APIs nativas do Node.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hasCapability } from './lib/project-config.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const defaultRoot = resolve(scriptDir, '..');

export const STYLEGUIDE_PACKAGE = '@vitru/styleguide';
export const TOKENS_FILE = 'node_modules/@vitru/styleguide/dist/tokens.css';
export const ICON_LIBRARY = 'lucide-react';
const LOCAL_DEPENDENCY_PROTOCOL = /^(?:file|link|workspace):/;

/**
 * Contrato de tema: o conjunto mínimo que o kit do template realmente consome.
 * Renomear qualquer um destes quebra os componentes, então a ausência é erro.
 */
export const REQUIRED_THEME_TOKENS = [
  '--ink',
  '--ink-soft',
  '--paper',
  '--paper-2',
  '--line',
  '--accent',
  '--on-accent',
  '--danger',
  '--danger-line',
  '--danger-bg',
  '--success',
  '--field-bg',
  '--field-border',
  '--shadow',
  '--backdrop',
];

/**
 * Tokens que alguns produtos usam e outros não (agenda, navegação, realces).
 * Não pertencem ao contrato do template: a ausência é informação, não falha.
 * Um projeto que precise deles declara em `.template-state.json`.
 */
export const OPTIONAL_THEME_TOKENS = [
  '--navy',
  '--navy-strong',
  '--danger-bg-hover',
  '--bar-edge',
  '--week-today-bg',
  '--week-today-fill',
  '--event-ferias-bg',
  '--event-ferias-ink',
  '--event-viagem-bg',
  '--event-viagem-ink',
  '--event-evento-bg',
  '--event-evento-ink',
];

/** Escalas compartilhadas por qualquer tema. */
export const REQUIRED_SCALE_TOKENS = [
  '--font-display',
  '--font-sans',
  '--font-mono',
  '--text-md',
  '--space-4',
  '--radius-md',
  '--transition-base',
  '--icon-size',
];

/** Kit base esperado no contrato público do pacote. */
export const REQUIRED_COMPONENTS = [
  'Alert',
  'Badge',
  'Button',
  'Card',
  'Dialog',
  'EmptyState',
  'ErrorBoundary',
  'ErrorState',
  'Input',
  'LoadingState',
  'PageHeader',
  'Select',
  'Table',
  'Textarea',
];

/** Bibliotecas de ícones que competem com a padrão. */
const FORBIDDEN_ICON_PACKAGES = [
  'react-icons',
  '@heroicons/react',
  '@mui/icons-material',
  '@fortawesome/react-fontawesome',
  '@phosphor-icons/react',
  'phosphor-react',
  'react-feather',
  'feather-icons',
  '@tabler/icons-react',
  'bootstrap-icons',
];

// Cores literais em CSS. Nomes de cor cobrem só os mais comuns: a intenção é
// pegar o descuido, não policiar o dicionário inteiro do CSS.
const COLOR_PATTERNS = [
  /#[0-9a-fA-F]{3,8}\b/,
  /\brgba?\(/,
  /\bhsla?\(/,
  /\b(?:oklch|oklab|lab|lch|color)\(/,
  /:\s*(?:white|black|red|blue|green|yellow|orange|purple|pink|gray|grey|silver|navy|teal|olive|maroon|lime|aqua|fuchsia)\b/,
];

function listFiles(directory, extensions) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(path, extensions));
    if (entry.isFile() && extensions.has(extname(entry.name))) files.push(path);
  }
  return files;
}

function normalized(path) {
  return path.split(sep).join('/');
}

/** Remove comentários para não acusar cor citada em explicação. */
function withoutComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function checkTokens(root, warnings) {
  const tokensPath = join(root, TOKENS_FILE);
  if (!existsSync(tokensPath)) {
    warnings.push(`${TOKENS_FILE}: tokens do pacote ausentes; instale "${STYLEGUIDE_PACKAGE}".`);
  } else {
    const tokens = withoutComments(readFileSync(tokensPath, 'utf8'));
    for (const token of [...REQUIRED_THEME_TOKENS, ...REQUIRED_SCALE_TOKENS]) {
      if (!new RegExp(`(?:^|[^-\\w])${token}\\s*:`, 'm').test(tokens)) {
        warnings.push(`${TOKENS_FILE}: token obrigatório "${token}" não está declarado.`);
      }
    }
  }

  const mainPath = join(root, 'src/main.tsx');
  if (
    !existsSync(mainPath) ||
    !readFileSync(mainPath, 'utf8').includes('@vitru/styleguide/styles.css')
  ) {
    warnings.push('src/main.tsx: importe "@vitru/styleguide/styles.css" uma única vez.');
  }

  const indexPath = join(root, 'index.html');
  if (existsSync(indexPath) && !/<html[^>]*\sdata-theme=/.test(readFileSync(indexPath, 'utf8'))) {
    warnings.push('index.html: declare o tema no <html> (ex.: data-theme="vitru").');
  }
}

function checkCssLiterals(root, warnings) {
  const sourceRoot = join(root, 'src');
  for (const file of listFiles(sourceRoot, new Set(['.css']))) {
    const label = normalized(relative(root, file));
    if (label === TOKENS_FILE) continue;
    const lines = withoutComments(readFileSync(file, 'utf8')).split('\n');
    lines.forEach((line, index) => {
      if (COLOR_PATTERNS.some((pattern) => pattern.test(line))) {
        warnings.push(
          `${label}:${index + 1}: cor literal fora de tokens.css; use var(--token). -> ${line.trim()}`,
        );
      }
    });
  }
}

function checkIcons(root, warnings) {
  const packagePath = join(root, 'package.json');
  if (existsSync(packagePath)) {
    const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
    const dependencies = pkg.dependencies ?? {};
    const styleguideVersion = dependencies[STYLEGUIDE_PACKAGE];
    if (!styleguideVersion) {
      warnings.push(`package.json: "${STYLEGUIDE_PACKAGE}" deve estar em dependencies.`);
    } else if (LOCAL_DEPENDENCY_PROTOCOL.test(styleguideVersion)) {
      warnings.push(
        `package.json: "${STYLEGUIDE_PACKAGE}" deve usar uma versão publicada no npm, não "${styleguideVersion}".`,
      );
    }
    if (!dependencies[ICON_LIBRARY]) {
      warnings.push(`package.json: "${ICON_LIBRARY}" deve estar em dependencies.`);
    }
    for (const forbidden of FORBIDDEN_ICON_PACKAGES) {
      if (dependencies[forbidden] || (pkg.devDependencies ?? {})[forbidden]) {
        warnings.push(
          `package.json: "${forbidden}" concorre com a biblioteca padrão "${ICON_LIBRARY}".`,
        );
      }
    }
  }

  const sourceRoot = join(root, 'src');
  for (const file of listFiles(sourceRoot, new Set(['.ts', '.tsx']))) {
    const label = normalized(relative(root, file));
    const content = readFileSync(file, 'utf8');
    for (const forbidden of FORBIDDEN_ICON_PACKAGES) {
      if (new RegExp(`from\\s+['"]${forbidden.replace(/[/@]/g, '\\$&')}`).test(content)) {
        warnings.push(`${label}: importe ícones de "${ICON_LIBRARY}", não de "${forbidden}".`);
      }
    }
  }
}

function checkKit(root, warnings) {
  const indexPath = join(root, 'node_modules/@vitru/styleguide/dist/index.d.ts');
  if (!existsSync(indexPath)) {
    warnings.push(`${indexPath}: declarações públicas do kit ausentes.`);
    return;
  }
  const index = readFileSync(indexPath, 'utf8');
  for (const component of REQUIRED_COMPONENTS) {
    if (!new RegExp(`\\b${component}\\b`).test(index)) {
      warnings.push(
        `${STYLEGUIDE_PACKAGE}: o kit base perdeu "${component}" (docs/styleguide.md).`,
      );
    }
  }
}

export function checkStyleguide(root = defaultRoot) {
  const warnings = [];
  checkTokens(root, warnings);
  checkCssLiterals(root, warnings);
  checkIcons(root, warnings);
  checkKit(root, warnings);
  return warnings;
}

function main() {
  const rootFlag = process.argv.indexOf('--root');
  const root = rootFlag >= 0 ? resolve(process.argv[rootFlag + 1]) : defaultRoot;
  // `--warn-only` serve a quem está no meio de uma refatoração visual e quer o
  // relatório sem derrubar o comando.
  const warnOnly = process.argv.includes('--warn-only');

  if (!hasCapability('styleguide', root)) {
    console.log('Projeto sem a capacidade "styleguide": verificação dispensada.');
    return;
  }

  const findings = checkStyleguide(root);
  if (findings.length === 0) {
    console.log('Verificação do styleguide OK.');
    return;
  }

  // Quem decide se isto bloqueia é o perfil, em scripts/validate.mjs. Aqui a
  // responsabilidade é só relatar com fidelidade e sair diferente de zero.
  const channel = warnOnly ? 'warn' : 'error';
  console[channel](`${warnOnly ? 'Avisos do styleguide' : 'Verificação do styleguide FALHOU'}:\n`);
  for (const finding of findings) console[channel](`  - ${finding}`);
  console[channel](`\n${findings.length} achado(s). Regras em docs/styleguide.md.`);
  if (!warnOnly) process.exitCode = 1;
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) main();
