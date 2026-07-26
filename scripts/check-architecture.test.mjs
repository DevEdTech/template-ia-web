import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { checkArchitecture } from './check-architecture.mjs';

function withProject(files, assertion) {
  const root = mkdtempSync(join(tmpdir(), 'web-architecture-'));
  try {
    for (const [path, content] of Object.entries(files)) {
      const file = join(root, 'src', path);
      mkdirSync(join(file, '..'), { recursive: true });
      writeFileSync(file, content);
    }
    assertion(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('aceita consumo pela interface pública da feature', () => {
  withProject(
    { 'app/App.tsx': "import { Notes } from '@/features/notes';", 'features/notes/index.ts': '' },
    (root) => assert.deepEqual(checkArchitecture(root), []),
  );
});

test('rejeita import interno entre features', () => {
  withProject(
    { 'features/search/index.ts': "export { parse } from '@/features/notes/model/note';" },
    (root) => assert.equal(checkArchitecture(root).length, 1),
  );
});

test('rejeita dependência de domínio dentro de shared', () => {
  withProject({ 'shared/lib/format.ts': "import type { Note } from '@/features/notes';" }, (root) =>
    assert.equal(checkArchitecture(root).length, 1),
  );
});

test('rejeita import dinâmico de arquivo interno de outra feature', () => {
  withProject(
    {
      'features/search/index.ts': "const notes = import('@/features/notes/services/noteStorage');",
    },
    (root) => assert.equal(checkArchitecture(root).length, 1),
  );
});
