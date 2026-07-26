import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { generateFeature } from './generate-feature.mjs';

test('planeja e cria uma feature completa sem sobrescrever arquivos', () => {
  const root = mkdtempSync(join(tmpdir(), 'web-feature-'));
  try {
    const planned = generateFeature(root, 'Relatórios Mensais', true);
    assert.equal(planned.length, 5);
    assert.equal(existsSync(join(root, 'src/features/relatorios-mensais')), false);

    generateFeature(root, 'Relatórios Mensais');
    assert.equal(existsSync(join(root, 'src/features/relatorios-mensais/index.ts')), true);
    assert.throws(() => generateFeature(root, 'Relatórios Mensais'), /já existe/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
