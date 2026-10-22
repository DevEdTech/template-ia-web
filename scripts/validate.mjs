#!/usr/bin/env node
// Orquestrador do `npm run validate`.
//
// Antes era uma corrente de `&&` no package.json: tudo ou nada, sempre tudo
// bloqueante, sem jeito de rodar um pedaço. Agora as suítes vêm do catálogo em
// `lib/project-config.mjs`, o perfil do projeto decide o que bloqueia e as
// flags decidem o que roda.
//
//   npm run validate                      tudo que o perfil manda
//   npm run validate -- --list            o que existe, o que bloqueia e por quê
//   npm run validate -- --quick           só as suítes rápidas
//   npm run validate -- --only=lint,test  só estas
//   npm run validate -- --skip=build      tudo menos estas
//   npm run validate -- --changed         só o que os arquivos alterados afetam
//   npm run validate -- --changed=main    idem, comparando com outra ref
//   npm run validate -- --files=src/features/notes
//   npm run validate -- --strict          aviso passa a falhar
//   npm run validate -- --no-bail         roda tudo antes de falhar
//
// Em `--changed` e `--files`, o alvo é o fechamento transitivo: os arquivos
// alterados mais todos que dependem deles, e os testes que cobrem esse
// conjunto. Cobertura global não é aplicada numa execução parcial — ela mede o
// projeto inteiro, e um subconjunto nunca atingiria o limite.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { parseArgs } from 'node:util';
import {
  EXTERNAL_SUITES,
  PROJECT_ROOT,
  SUITES,
  readProjectConfig,
  resolveSuites,
} from './lib/project-config.mjs';
import { affectedFiles, buildDependencyGraph, testFilesIn } from './lib/dep-graph.mjs';

const CONFIG_FILES = new Set([
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'tsconfig.e2e.json',
  'vite.config.ts',
  'vitest.config.ts',
  'eslint.config.js',
  'prettier.config.mjs',
  'playwright.config.ts',
  '.nvmrc',
  '.npmrc',
  '.template-state.json',
]);

const DOC_FILES = new Set(['README.md', 'AGENTS.md', 'CLAUDE.md', 'CONTRIBUTING.md']);

function normalized(path) {
  return path.split(sep).join('/');
}

/** Caminho do executável local, sem pagar o custo do `npx` a cada suíte. */
function binary(name) {
  const suffix = process.platform === 'win32' ? '.cmd' : '';
  const local = join(PROJECT_ROOT, 'node_modules', '.bin', `${name}${suffix}`);
  return existsSync(local) ? local : name;
}

function resolveCommand(command) {
  if (command[0] !== 'npx') return command;
  return [binary(command[1]), ...command.slice(2)];
}

function run(command, { dryRun }) {
  const [executable, ...args] = resolveCommand(command);
  const printable = [executable, ...args]
    .map((part) => normalized(part.startsWith(PROJECT_ROOT) ? relative(PROJECT_ROOT, part) : part))
    .join(' ');
  console.log(`\n$ ${printable}`);
  if (dryRun) return 0;
  const result = spawnSync(executable, args, {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.error) {
    console.error(result.error.message);
    return 1;
  }
  return result.status ?? 1;
}

/** Arquivos alterados: índice, working tree e, com base, o diff da branch. */
function changedPaths(base) {
  const commands = [
    ['diff', '--name-only', '--diff-filter=ACMR', 'HEAD'],
    ['ls-files', '--others', '--exclude-standard'],
  ];
  if (base) commands.unshift(['diff', '--name-only', '--diff-filter=ACMR', `${base}...HEAD`]);

  const paths = new Set();
  for (const args of commands) {
    const result = spawnSync('git', args, { cwd: PROJECT_ROOT, encoding: 'utf8' });
    if (result.status !== 0) continue;
    for (const line of result.stdout.split('\n')) {
      const path = line.trim();
      if (path) paths.add(normalized(path));
    }
  }
  return [...paths];
}

/** Expande pastas em arquivos, para `--files=src/features/notes`. */
function expandPaths(paths, knownFiles) {
  const expanded = new Set();
  for (const raw of paths) {
    const path = normalized(relative(PROJECT_ROOT, resolve(PROJECT_ROOT, raw)));
    if (knownFiles.includes(path)) {
      expanded.add(path);
      continue;
    }
    const prefix = path.endsWith('/') ? path : `${path}/`;
    const matches = knownFiles.filter((file) => file.startsWith(prefix));
    if (matches.length > 0) matches.forEach((file) => expanded.add(file));
    else expanded.add(path);
  }
  return [...expanded];
}

/** Classifica os caminhos nos gatilhos declarados pelo catálogo de suítes. */
function triggersFor(paths) {
  const triggers = new Set();
  if (paths.length > 0) triggers.add('any');
  for (const path of paths) {
    if (CONFIG_FILES.has(path)) triggers.add('config');
    if (path.startsWith('skills/') || /^\.(?:claude|agents)\/skills\//.test(path)) {
      triggers.add('skills');
    }
    if (path.startsWith('docs/') || DOC_FILES.has(path)) triggers.add('docs');
    if (path.endsWith('.css')) triggers.add('styles');
    if (path.startsWith('src/')) triggers.add('src');
    if (path.startsWith('scripts/')) triggers.add('scripts');
    if (path.startsWith('e2e/')) triggers.add('e2e');
  }
  return triggers;
}

/** Monta o comando de teste conforme o perfil e o escopo da execução. */
function testCommands({ config, affectedTests, scoped, includeSetup, quick }) {
  const commands = [];
  if (scoped) {
    // Sem cobertura: o limite é global e um subconjunto nunca o alcança.
    if (affectedTests.length > 0) commands.push(['npx', 'vitest', 'run', ...affectedTests]);
  } else if (quick || !config.coverage) {
    // `--quick` existe para dar resposta rápida; cobertura é do gate completo.
    commands.push(['npx', 'vitest', 'run']);
  } else {
    commands.push(['npx', 'vitest', 'run', '--coverage']);
  }
  if (includeSetup && !quick) commands.push(['node', '--test', 'scripts/*.test.mjs']);
  return commands;
}

function printList(config, suites) {
  const width = Math.max(...suites.map((suite) => suite.name.length));
  console.log(`\nPerfil: ${config.profile}`);
  const active = Object.entries(config.capabilities)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name);
  console.log(`Capacidades: ${active.join(', ') || 'nenhuma'}`);
  console.log(
    config.coverage
      ? `Cobertura: ${config.coverage.statements}% instruções, ${config.coverage.lines}% linhas, ${config.coverage.branches}% ramos, ${config.coverage.functions}% funções`
      : 'Cobertura: não aplicada neste perfil',
  );
  console.log('\nSuítes do validate:');
  for (const suite of suites) {
    const mark = { blocking: 'bloqueia', advisory: 'avisa', off: 'desligada' }[suite.tier];
    const reason = suite.reason ? ` (${suite.reason})` : '';
    console.log(`  ${suite.name.padEnd(width)}  ${mark}${reason}`);
  }
  const external = Object.entries(EXTERNAL_SUITES).filter(
    ([, suite]) => !suite.requires || config.capabilities[suite.requires],
  );
  if (external.length > 0) {
    console.log('\nFora do validate (gate próprio):');
    for (const [name, suite] of external) console.log(`  ${name}  ${suite.label}`);
  }
}

function main() {
  const { values } = parseArgs({
    options: {
      list: { type: 'boolean' },
      quick: { type: 'boolean' },
      only: { type: 'string' },
      skip: { type: 'string' },
      changed: { type: 'string' },
      files: { type: 'string' },
      strict: { type: 'boolean' },
      'no-bail': { type: 'boolean' },
      'dry-run': { type: 'boolean' },
    },
    allowPositionals: false,
    strict: false,
  });

  const config = readProjectConfig();
  const effective = values.strict ? { ...config, profile: 'rigoroso' } : config;
  const suites = resolveSuites(effective);

  if (values.list) {
    printList(effective, suites);
    return 0;
  }

  const list = (value) =>
    (value ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  const only = new Set(list(values.only));
  const skip = new Set(list(values.skip));
  for (const name of [...only, ...skip]) {
    if (!(name in SUITES)) {
      console.error(`Suíte desconhecida: "${name}". Use --list para ver as disponíveis.`);
      return 2;
    }
  }

  const scoped = values.changed !== undefined || values.files !== undefined;
  let targetPaths = [];
  let affectedTests = [];
  let triggers = null;

  if (scoped) {
    const graph = buildDependencyGraph(PROJECT_ROOT);
    const requested =
      values.files !== undefined
        ? expandPaths(list(values.files), graph.files)
        : changedPaths(values.changed || undefined);
    if (requested.length === 0) {
      console.log('Nenhum arquivo alterado; nada a validar.');
      return 0;
    }
    const affected = affectedFiles(requested, graph.dependents);
    targetPaths = [...affected].sort();
    affectedTests = testFilesIn(affected);
    triggers = triggersFor(targetPaths);

    console.log(`\nArquivos alterados (${requested.length}):`);
    for (const path of requested.sort()) console.log(`  ${path}`);
    const extra = targetPaths.filter((path) => !requested.includes(path));
    if (extra.length > 0) {
      console.log(`\nAfetados por dependência (${extra.length}):`);
      for (const path of extra) console.log(`  ${path}`);
    }
    console.log(
      affectedTests.length > 0
        ? `\nTestes que cobrem o conjunto (${affectedTests.length}):\n${affectedTests.map((path) => `  ${path}`).join('\n')}`
        : '\nNenhum teste cobre os arquivos afetados — considere `generate-tests`.',
    );
    // Mudança de configuração altera a interpretação de tudo: não há como
    // derivar um subconjunto confiável.
    if (triggers.has('config')) {
      console.log('\nMudança de configuração detectada: todas as suítes entram.');
      triggers = null;
    }
  }

  const planned = [];
  for (const suite of suites) {
    const definition = SUITES[suite.name];
    if (suite.tier === 'off') continue;
    if (only.size > 0 && !only.has(suite.name)) continue;
    if (skip.has(suite.name)) continue;
    if (values.quick && !definition.quick && only.size === 0) continue;
    if (triggers && only.size === 0) {
      const matched = (definition.triggers ?? []).some((trigger) => triggers.has(trigger));
      if (!matched) continue;
    }
    planned.push(suite);
  }

  if (planned.length === 0) {
    console.log('Nenhuma suíte selecionada.');
    return 0;
  }

  console.log(
    `\nPerfil ${effective.profile}: ${planned.length} suíte(s) — ${planned
      .map((suite) => suite.name)
      .join(', ')}`,
  );

  const failures = [];
  const warnings = [];

  for (const suite of planned) {
    const definition = SUITES[suite.name];
    let commands;
    if (suite.name === 'test') {
      commands = testCommands({
        config: effective,
        affectedTests,
        scoped: scoped && triggers !== null,
        includeSetup: !scoped || (triggers?.has('scripts') ?? true),
        quick: values.quick ?? false,
      });
    } else {
      let command = [...definition.command];
      if (definition.acceptsPaths && scoped && targetPaths.length > 0) {
        const existing = targetPaths
          .filter((path) => existsSync(join(PROJECT_ROOT, path)))
          .filter((path) => !definition.pathPattern || definition.pathPattern.test(path));
        // Sem caminho que a ferramenta entenda, não há o que verificar aqui.
        if (existing.length === 0) continue;
        command = [...command.slice(0, -1), ...existing];
      }
      commands = [command];
    }

    let status = 0;
    for (const command of commands) {
      status = run(command, { dryRun: values['dry-run'] ?? false });
      if (status !== 0) break;
    }

    if (status === 0) continue;
    if (suite.tier === 'blocking') {
      failures.push(suite);
      if (!values['no-bail']) break;
    } else {
      warnings.push(suite);
    }
  }

  console.log('');
  for (const suite of warnings) {
    console.warn(`aviso: ${suite.name} falhou, mas é consultivo no perfil ${effective.profile}.`);
  }
  if (failures.length > 0) {
    for (const suite of failures) console.error(`falha: ${suite.name} (bloqueante).`);
    return 1;
  }
  console.log(
    warnings.length > 0
      ? `Validação concluída com ${warnings.length} aviso(s).`
      : 'Validação concluída.',
  );
  return 0;
}

process.exitCode = main();
