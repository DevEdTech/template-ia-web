// Testes do orquestrador de validação e do grafo de dependências.
//
// O `--dry-run` imprime o plano sem executar nada: é assim que se verifica a
// seleção de suítes sem pagar o custo de rodar build e testes de verdade.

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { affectedFiles, buildDependencyGraph, testFilesIn } from './lib/dep-graph.mjs';
import { COVERAGE_THRESHOLDS, resolveSuites } from './lib/project-config.mjs';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

function runValidate(...args) {
  return spawnSync(process.execPath, [join(projectRoot, 'scripts', 'validate.mjs'), ...args], {
    cwd: projectRoot,
    encoding: 'utf8',
  });
}

function graphFixture() {
  const root = mkdtempSync(join(tmpdir(), 'web-graph-'));
  const write = (file, content) => {
    const path = join(root, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  };

  write('src/shared/lib/format.ts', 'export const format = (v: string) => v.trim();\n');
  write(
    'src/features/pedidos/model/pedido.ts',
    "import { format } from '@/shared/lib/format';\nexport const nome = (v: string) => format(v);\n",
  );
  write('src/features/pedidos/index.ts', "export { nome } from './model/pedido';\n");
  write(
    'src/features/pedidos/components/Lista.tsx',
    "import { nome } from '../model/pedido';\nimport styles from './Lista.module.css';\nexport const Lista = () => <p className={styles.p}>{nome('a')}</p>;\n",
  );
  write('src/features/pedidos/components/Lista.module.css', '.p {\n  color: var(--ink);\n}\n');
  write(
    'src/features/pedidos/tests/pedido.test.ts',
    "import { nome } from '../model/pedido';\ntest('x', () => expect(nome(' a ')).toBe('a'));\n",
  );
  write('src/features/outra/index.ts', 'export const naoRelacionado = () => 1;\n');
  return root;
}

test('o grafo liga quem importa a quem é importado, inclusive por reexport', () => {
  const root = graphFixture();
  try {
    const { dependents } = buildDependencyGraph(root, ['src']);

    const deFormat = dependents.get('src/shared/lib/format.ts');
    assert.ok(deFormat?.has('src/features/pedidos/model/pedido.ts'));

    const doModelo = dependents.get('src/features/pedidos/model/pedido.ts');
    assert.ok(doModelo?.has('src/features/pedidos/index.ts'), 'reexport conta como dependência');
    assert.ok(doModelo?.has('src/features/pedidos/components/Lista.tsx'));
    assert.ok(doModelo?.has('src/features/pedidos/tests/pedido.test.ts'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('o fechamento transitivo alcança quem depende indiretamente', () => {
  const root = graphFixture();
  try {
    const { dependents } = buildDependencyGraph(root, ['src']);
    const afetados = affectedFiles(['src/shared/lib/format.ts'], dependents);

    assert.ok(afetados.has('src/features/pedidos/model/pedido.ts'), 'direto');
    assert.ok(afetados.has('src/features/pedidos/components/Lista.tsx'), 'indireto');
    assert.ok(afetados.has('src/features/pedidos/tests/pedido.test.ts'));
    // Uma feature que não participa da cadeia fica de fora.
    assert.ok(!afetados.has('src/features/outra/index.ts'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('mudança de CSS Module alcança o componente que o importa', () => {
  const root = graphFixture();
  try {
    const { dependents } = buildDependencyGraph(root, ['src']);
    const afetados = affectedFiles(
      ['src/features/pedidos/components/Lista.module.css'],
      dependents,
    );
    assert.ok(afetados.has('src/features/pedidos/components/Lista.tsx'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('testFilesIn separa apenas os testes do conjunto afetado', () => {
  const afetados = new Set([
    'src/features/pedidos/model/pedido.ts',
    'src/features/pedidos/tests/pedido.test.ts',
    'e2e/app.spec.ts',
  ]);
  // E2E fica fora: é um gate próprio, não roda dentro do validate.
  assert.deepEqual(testFilesIn(afetados), ['src/features/pedidos/tests/pedido.test.ts']);
});

test('cada perfil decide o que bloqueia e o que apenas avisa', () => {
  const capabilities = { styleguide: true, auth: true, e2e: true };
  const tier = (profile, name) =>
    resolveSuites({ profile, capabilities }).find((suite) => suite.name === name)?.tier;

  assert.equal(tier('prototipo', 'build'), 'advisory');
  assert.equal(tier('padrao', 'build'), 'blocking');
  assert.equal(tier('prototipo', 'typecheck'), 'blocking', 'tipos bloqueiam em todo perfil');
  assert.equal(tier('prototipo', 'check:docs'), 'advisory');
  assert.equal(tier('rigoroso', 'check:docs'), 'blocking');
});

test('capacidade desligada desliga a suíte, em vez de virar aviso', () => {
  const suites = resolveSuites({
    profile: 'rigoroso',
    capabilities: { styleguide: false, auth: false, e2e: false },
  });
  const styleguide = suites.find((suite) => suite.name === 'check:styleguide');

  assert.equal(styleguide?.tier, 'off');
  assert.match(styleguide?.reason ?? '', /styleguide/);
});

test('o perfil protótipo não impõe limite de cobertura', () => {
  assert.equal(COVERAGE_THRESHOLDS.prototipo, null);
  assert.ok(COVERAGE_THRESHOLDS.padrao.functions < COVERAGE_THRESHOLDS.rigoroso.functions);
});

test('--list descreve perfil, capacidades e portões sem executar nada', () => {
  const result = runValidate('--list');

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Perfil: /);
  assert.match(result.stdout, /Capacidades: /);
  assert.match(result.stdout, /check:architecture\s+bloqueia/);
});

test('--quick seleciona apenas as suítes rápidas e sem cobertura', () => {
  const result = runValidate('--quick', '--dry-run');

  assert.equal(result.status, 0);
  assert.match(result.stdout, /vitest run$/m, 'sem --coverage no caminho rápido');
  assert.doesNotMatch(result.stdout, /npm run build/, 'build não é rápido');
});

test('--only roda apenas a suíte pedida e --skip a exclui', () => {
  const only = runValidate('--only=lint', '--dry-run');
  assert.equal(only.status, 0);
  assert.match(only.stdout, /1 suíte\(s\) — lint/);

  const skip = runValidate('--skip=build', '--dry-run');
  assert.equal(skip.status, 0);
  assert.doesNotMatch(skip.stdout, /npm run build/);
});

test('suíte desconhecida falha dizendo como descobrir as válidas', () => {
  const result = runValidate('--only=inexistente');

  assert.equal(result.status, 2);
  assert.match(result.stderr, /Suíte desconhecida/);
  assert.match(result.stderr, /--list/);
});

test('--files deriva o alvo do grafo e roda só os testes que cobrem o conjunto', () => {
  const result = runValidate('--files=src/features/notes', '--dry-run');

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Afetados por dependência/);
  // O smoke da composição depende das notas e precisa entrar.
  assert.match(result.stdout, /src\/app\/tests\/App\.test\.tsx/);
  // Execução parcial não aplica cobertura global.
  assert.doesNotMatch(result.stdout, /vitest run --coverage/);
});
