import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { preparePages } from './prepare-pages.mjs';

test('gera entradas para acesso direto ao styleguide e fallback sem mudar a base dos assets', () => {
  const dist = mkdtempSync(join(tmpdir(), 'web-pages-'));
  try {
    const html = '<script src="/meu-repo/assets/app.js"></script>';
    writeFileSync(join(dist, 'index.html'), html);
    preparePages(dist);
    assert.equal(readFileSync(join(dist, 'styleguide/index.html'), 'utf8'), html);
    assert.equal(readFileSync(join(dist, '404.html'), 'utf8'), html);
    assert.equal(existsSync(join(dist, '.nojekyll')), true);
    preparePages(dist);
    assert.equal(readFileSync(join(dist, 'styleguide/index.html'), 'utf8'), html);
  } finally {
    rmSync(dist, { recursive: true, force: true });
  }
});

test('falha se o build não gerou index.html', () => {
  const dist = mkdtempSync(join(tmpdir(), 'web-pages-'));
  try {
    assert.throws(() => preparePages(dist), /ENOENT/);
  } finally {
    rmSync(dist, { recursive: true, force: true });
  }
});
