// Perfil e capacidades do projeto: a única fonte da verdade sobre o que este
// repositório usa e quais portões bloqueiam.
//
// O template nasce completo, mas um projeto derivado não precisa de tudo. Em
// vez de espalhar `if` pelos scripts e pela documentação, o estado fica em
// `.template-state.json` e todo mundo lê daqui.
//
//   profile       prototipo | padrao | rigoroso
//   capabilities  o que o projeto usa (styleguide, auth, e2e...)
//
// `profile` decide o que é bloqueante; `capabilities` decide o que existe.
// Uma capacidade desligada não vira aviso: ela simplesmente não é verificada.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = resolve(scriptDir, '..', '..');

export const PROFILES = ['prototipo', 'padrao', 'rigoroso'];
export const DEFAULT_PROFILE = 'padrao';

/** Capacidades reconhecidas e o valor que o template entrega por padrão. */
export const DEFAULT_CAPABILITIES = {
  /** Kit, tokens e rota `/styleguide` de `@vitru/styleguide`. */
  styleguide: true,
  /**
   * Feature de autenticação contra um provedor de identidade externo. O
   * template a entrega pronta; `npm run setup -- --no-auth` a remove. O padrão
   * descreve o que existe no disco, não o que a maioria dos projetos quer.
   */
  auth: true,
  /** Fluxo crítico no Chromium (gate separado de `validate`). */
  e2e: true,
  /** Regressão visual pixel a pixel da página `/styleguide`. */
  visualRegression: false,
};

/**
 * Limites de cobertura por perfil. O protótipo não mede; o padrão protege
 * contra regressão sem virar meta; o rigoroso é o portão de produção.
 * @type {Record<string, { statements: number, lines: number, branches: number, functions: number } | null>}
 */
export const COVERAGE_THRESHOLDS = {
  prototipo: null,
  padrao: { statements: 80, lines: 80, branches: 70, functions: 80 },
  rigoroso: { statements: 85, lines: 85, branches: 75, functions: 90 },
};

/**
 * Catálogo de suítes do `validate`.
 *
 * - `tier`: por perfil, `blocking` (falha o validate), `advisory` (avisa e
 *   segue) ou `off` (não roda).
 * - `requires`: capacidade necessária; sem ela a suíte nem aparece.
 * - `quick`: entra no `--quick`.
 * - `triggers`: caminhos que, ao mudar, acionam a suíte em `--changed`.
 *   `src` significa "qualquer fonte afetada"; os demais são prefixos.
 */
export const SUITES = {
  'check:toolchain': {
    label: 'Toolchain',
    command: ['node', 'scripts/check-toolchain.mjs'],
    tier: { prototipo: 'advisory', padrao: 'blocking', rigoroso: 'blocking' },
    triggers: ['config'],
  },
  'check:skills': {
    label: 'Skills',
    command: ['node', 'scripts/check-skills.mjs'],
    tier: { prototipo: 'advisory', padrao: 'blocking', rigoroso: 'blocking' },
    triggers: ['skills'],
  },
  'check:architecture': {
    label: 'Arquitetura',
    command: ['node', 'scripts/check-architecture.mjs'],
    tier: { prototipo: 'blocking', padrao: 'blocking', rigoroso: 'blocking' },
    quick: true,
    triggers: ['src'],
  },
  'check:docs': {
    label: 'Documentação',
    command: ['node', 'scripts/check-docs.mjs'],
    tier: { prototipo: 'advisory', padrao: 'blocking', rigoroso: 'blocking' },
    triggers: ['docs'],
  },
  'check:styleguide': {
    label: 'Styleguide',
    command: ['node', 'scripts/check-styleguide.mjs'],
    requires: 'styleguide',
    // Invertido de propósito: é barato, acionável e aponta a linha. O portão
    // caro e frágil (regressão visual) é que fica opcional, no E2E.
    tier: { prototipo: 'advisory', padrao: 'blocking', rigoroso: 'blocking' },

    quick: true,
    triggers: ['styles', 'src'],
  },
  'format:check': {
    label: 'Formatação',
    command: ['npx', 'prettier', '--check', '.'],
    tier: { prototipo: 'advisory', padrao: 'blocking', rigoroso: 'blocking' },
    triggers: ['any'],
    acceptsPaths: true,
  },
  lint: {
    label: 'Lint',
    command: ['npx', 'eslint', '.'],
    tier: { prototipo: 'blocking', padrao: 'blocking', rigoroso: 'blocking' },
    quick: true,
    triggers: ['src', 'scripts'],
    acceptsPaths: true,
    // O ESLint reclama de caminho que nenhuma config cobre (CSS, Markdown).
    pathPattern: /\.(?:[cm]?[jt]sx?)$/,
  },
  typecheck: {
    label: 'Tipos',
    command: ['npx', 'tsc', '-b'],
    tier: { prototipo: 'blocking', padrao: 'blocking', rigoroso: 'blocking' },
    quick: true,
    triggers: ['src', 'scripts', 'config'],
  },
  test: {
    label: 'Testes',
    // O comando real é montado em validate.mjs: cobertura, filtro por arquivo
    // afetado e `test:setup` dependem do perfil e das flags.
    command: null,
    tier: { prototipo: 'blocking', padrao: 'blocking', rigoroso: 'blocking' },
    quick: true,
    triggers: ['src', 'scripts'],
  },
  build: {
    label: 'Build',
    command: ['npm', 'run', 'build'],
    tier: { prototipo: 'advisory', padrao: 'blocking', rigoroso: 'blocking' },
    triggers: ['src', 'config'],
  },
};

/**
 * Suítes que o `validate` não roda, mas que o CI cobra.
 *
 * Elas ficam de fora por dependerem de rede ou de binário de navegador: o
 * gate local não deve baixar nada implicitamente. Aparecem em `--list` porque
 * `validate` verde e CI vermelho é a pior combinação possível — quem lê a
 * lista precisa saber o que ainda falta.
 */
export const EXTERNAL_SUITES = {
  'test:e2e': {
    label: 'E2E (Chromium) — baixa o navegador; `npx playwright install chromium`',
    requires: 'e2e',
  },
  audit: {
    label: 'npm audit --audit-level=high — depende de rede',
  },
};

function readState(root) {
  const file = join(root, '.template-state.json');
  if (!existsSync(file)) return {};
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(
      `.template-state.json inválido: ${error instanceof Error ? error.message : error}`,
      { cause: error },
    );
  }
}

/**
 * Lê perfil e capacidades efetivos do projeto.
 * @param {string} [root] raiz do repositório.
 */
export function readProjectConfig(root = PROJECT_ROOT) {
  const state = readState(root);
  const profile = PROFILES.includes(state.profile) ? state.profile : DEFAULT_PROFILE;
  const capabilities = { ...DEFAULT_CAPABILITIES, ...(state.capabilities ?? {}) };
  return {
    profile,
    capabilities,
    coverage: COVERAGE_THRESHOLDS[profile],
    technicalName: state.technicalName ?? '',
    displayName: state.displayName ?? '',
    templateVersion: state.templateVersion ?? '',
  };
}

/**
 * @param {string} name nome da capacidade.
 * @param {string} [root] raiz do repositório.
 * @returns {boolean} se o projeto usa essa capacidade.
 */
export function hasCapability(name, root = PROJECT_ROOT) {
  return readProjectConfig(root).capabilities[name] === true;
}

/**
 * Resolve o estado de cada suíte para o perfil e as capacidades atuais.
 * @param {{ profile: string, capabilities: Record<string, boolean> }} config
 * @returns {Array<{ name: string, label: string, tier: string, reason?: string }>}
 */
export function resolveSuites(config) {
  return Object.entries(SUITES).map(([name, suite]) => {
    if (suite.requires && config.capabilities[suite.requires] !== true) {
      return {
        name,
        label: suite.label,
        tier: 'off',
        reason: `capacidade "${suite.requires}" desligada`,
      };
    }
    return { name, label: suite.label, tier: suite.tier[config.profile] ?? 'blocking' };
  });
}
