import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import {
  REQUIRED_SCALE_TOKENS,
  REQUIRED_THEME_TOKENS,
  checkStyleguide,
} from './check-styleguide.mjs';

function write(root, file, content) {
  const path = join(root, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function project() {
  const root = mkdtempSync(join(tmpdir(), 'web-styleguide-'));
  const declarations = [...REQUIRED_THEME_TOKENS, ...REQUIRED_SCALE_TOKENS]
    .map((token) => `  ${token}: initial;`)
    .join('\n');
  write(root, 'src/shared/styles/tokens.css', `:root {\n${declarations}\n}\n`);
  write(root, 'src/shared/styles/global.css', "@import './tokens.css';\n");
  write(root, 'index.html', '<html lang="pt-BR" data-theme="vitru"></html>\n');
  write(root, 'package.json', JSON.stringify({ dependencies: { 'lucide-react': '^1.0.0' } }));
  return root;
}

test('aceita um projeto que segue o styleguide', () => {
  const root = project();
  try {
    write(root, 'src/app/App.module.css', '.app {\n  color: var(--ink);\n}\n');
    write(root, 'src/app/App.tsx', "import { Home } from 'lucide-react';\n");
    assert.deepEqual(checkStyleguide(root), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('avisa sobre cor literal fora de tokens.css', () => {
  const root = project();
  try {
    write(root, 'src/app/App.module.css', '.app {\n  color: #ff0000;\n  background: white;\n}\n');
    const warnings = checkStyleguide(root);
    assert.equal(warnings.length, 2);
    assert.match(warnings.join('\n'), /App\.module\.css:2: cor literal/);
    assert.match(warnings.join('\n'), /App\.module\.css:3: cor literal/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('ignora cor citada em comentário', () => {
  const root = project();
  try {
    write(
      root,
      'src/app/App.module.css',
      '/* antes era #ff0000 */\n.app {\n  color: var(--ink);\n}\n',
    );
    assert.deepEqual(checkStyleguide(root), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('avisa quando falta um token obrigatório', () => {
  const root = project();
  try {
    write(root, 'src/shared/styles/tokens.css', ':root {\n  --ink: initial;\n}\n');
    const warnings = checkStyleguide(root);
    assert.match(warnings.join('\n'), /token obrigatório "--accent"/);
    assert.doesNotMatch(warnings.join('\n'), /token obrigatório "--ink"/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('avisa sobre outra biblioteca de ícones e sobre a ausência da padrão', () => {
  const root = project();
  try {
    write(root, 'package.json', JSON.stringify({ dependencies: { 'react-icons': '^5.0.0' } }));
    write(root, 'src/app/App.tsx', "import { FaHome } from 'react-icons/fa';\n");
    const warnings = checkStyleguide(root).join('\n');
    assert.match(warnings, /"lucide-react" deve estar em dependencies/);
    assert.match(warnings, /"react-icons" concorre/);
    assert.match(warnings, /App\.tsx: importe ícones de "lucide-react"/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('avisa quando tokens.css some, quando global.css não importa e quando o tema não é declarado', () => {
  const root = project();
  try {
    rmSync(join(root, 'src/shared/styles/tokens.css'));
    write(root, 'src/shared/styles/global.css', 'body {\n  margin: 0;\n}\n');
    write(root, 'index.html', '<html lang="pt-BR"></html>\n');
    const warnings = checkStyleguide(root).join('\n');
    assert.match(warnings, /arquivo de tokens ausente/);
    assert.match(warnings, /importe "\.\/tokens\.css"/);
    assert.match(warnings, /declare o tema no <html>/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
