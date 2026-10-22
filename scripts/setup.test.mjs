import assert from 'node:assert/strict';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

function copyFixture() {
  const root = mkdtempSync(join(tmpdir(), 'web-setup-'));
  for (const path of ['package.json', 'index.html', 'README.md', 'tasks.md']) {
    cpSync(join(projectRoot, path), join(root, path));
  }
  // Arquivos que as capacidades reescrevem; podem nao existir num projeto
  // derivado que ja removeu a capacidade correspondente.
  for (const path of ['AGENTS.md', 'CLAUDE.md', '.env.example']) {
    const source = join(projectRoot, path);
    if (existsSync(source)) cpSync(source, join(root, path));
  }
  for (const path of ['docs', 'src', 'e2e', 'scripts/setup.mjs', 'scripts/lib']) {
    const source = join(projectRoot, path);
    if (!existsSync(source)) continue;
    const destination = join(root, path);
    mkdirSync(dirname(destination), { recursive: true });
    cpSync(source, destination, { recursive: true });
  }
  // Estado de partida explicito, nao herdado: estes testes exercitam o setup,
  // e um projeto derivado que ja desligou uma capacidade faria o guard de
  // religamento disparar em testes que nada tem a ver com isso.
  writeFileSync(
    join(root, '.template-state.json'),
    `${JSON.stringify(
      {
        technicalName: 'web-project-template',
        displayName: 'Web Project Template',
        templateVersion: readTemplateVersion(),
        profile: 'padrao',
        capabilities: { styleguide: true, auth: true, e2e: true, visualRegression: false },
      },
      null,
      2,
    )}\n`,
  );
  return root;
}

/**
 * Estes testes exercitam a *remocao* de uma capacidade. Num projeto derivado
 * que ja a removeu nao existe mais o que remover, e o teste deixa de ter
 * objeto: ele e pulado com a razao, nao falha.
 */
function semCapacidade(nome) {
  const marcos = {
    styleguide: 'src/app/routes/index.tsx',
    auth: 'src/features/auth',
  };
  if (!existsSync(join(projectRoot, marcos[nome]))) {
    return `projeto sem a capacidade "${nome}"`;
  }
  const state = JSON.parse(readFileSync(join(projectRoot, '.template-state.json'), 'utf8'));
  return state.capabilities?.[nome] === false ? `projeto sem a capacidade "${nome}"` : false;
}

function readTemplateVersion() {
  return JSON.parse(readFileSync(join(projectRoot, '.template-state.json'), 'utf8'))
    .templateVersion;
}

function runSetup(root, ...args) {
  const result = spawnSync(process.execPath, [join(root, 'scripts', 'setup.mjs'), ...args], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

test('personaliza identificadores, nome visível e organização', () => {
  const root = copyFixture();
  try {
    runSetup(
      root,
      '--name=Meu Aplicativo',
      '--display-name=Meu Aplicativo',
      '--organization=Equipe Exemplo',
      '--no-sync-skills',
    );
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    assert.equal(pkg.name, 'meu-aplicativo');
    assert.equal(pkg.author, 'Equipe Exemplo');
    assert.match(readFileSync(join(root, 'src/app/App.tsx'), 'utf8'), /Meu Aplicativo/);
    assert.match(readFileSync(join(root, 'docs/architecture.md'), 'utf8'), /Meu Aplicativo/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('remove a demonstração e deixa uma composição sem imports quebrados', () => {
  const root = copyFixture();
  try {
    const customFeature = join(root, 'src/features/custom-feature/index.ts');
    mkdirSync(dirname(customFeature), { recursive: true });
    writeFileSync(customFeature, 'export const customFeature = true;\n');

    runSetup(root, '--name=clean-app', '--remove-example', '--reset-tasks', '--no-sync-skills');
    const app = readFileSync(join(root, 'src/app/App.tsx'), 'utf8');
    assert.doesNotMatch(app, /features\//);
    assert.equal(existsSync(join(root, 'src/features/notes')), false);
    assert.equal(readFileSync(customFeature, 'utf8'), 'export const customFeature = true;\n');
    const routes = readFileSync(join(root, 'src/app/routes/index.tsx'), 'utf8');
    const home = readFileSync(join(root, 'src/features/home/components/HomePage.tsx'), 'utf8');
    assert.doesNotMatch(routes, /NoteList|features\/notes/);
    assert.doesNotMatch(home, /import.*features\/notes/);
    assert.match(routes, /<HomePage\s*\/>/);
    assert.match(app, /NavLink/);
    assert.match(readFileSync(join(root, 'tasks.md'), 'utf8'), /## A fazer/);

    runSetup(root, '--name=clean-app', '--remove-example', '--no-sync-skills');
    assert.equal(existsSync(join(root, 'src/features/notes')), false);
    assert.equal(readFileSync(customFeature, 'utf8'), 'export const customFeature = true;\n');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('reinicia tasks.md por padrão e preserva com --keep-tasks', () => {
  const root = copyFixture();
  try {
    writeFileSync(join(root, 'tasks.md'), '# Backlog do template\n\n- [x] item herdado\n');
    runSetup(root, '--name=reset-app', '--no-sync-skills');
    const reset = readFileSync(join(root, 'tasks.md'), 'utf8');
    assert.match(reset, /## A fazer/);
    assert.doesNotMatch(reset, /item herdado/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }

  const kept = copyFixture();
  try {
    writeFileSync(join(kept, 'tasks.md'), '# Backlog do template\n\n- [x] item herdado\n');
    runSetup(kept, '--name=keep-app', '--keep-tasks', '--no-sync-skills');
    assert.match(readFileSync(join(kept, 'tasks.md'), 'utf8'), /item herdado/);
  } finally {
    rmSync(kept, { recursive: true, force: true });
  }
});

test('dry-run e repetição com os mesmos valores são idempotentes', () => {
  const root = copyFixture();
  try {
    const before = readFileSync(join(root, 'package.json'), 'utf8');
    runSetup(root, '--name=dry-app', '--dry-run', '--no-sync-skills');
    assert.equal(readFileSync(join(root, 'package.json'), 'utf8'), before);

    const args = ['--name=stable-app', '--display-name=Stable App', '--no-sync-skills'];
    runSetup(root, ...args);
    const first = [
      readFileSync(join(root, 'package.json'), 'utf8'),
      readFileSync(join(root, 'src/app/App.tsx'), 'utf8'),
      readFileSync(join(root, '.template-state.json'), 'utf8'),
    ];
    runSetup(root, ...args);
    assert.deepEqual(
      [
        readFileSync(join(root, 'package.json'), 'utf8'),
        readFileSync(join(root, 'src/app/App.tsx'), 'utf8'),
        readFileSync(join(root, '.template-state.json'), 'utf8'),
      ],
      first,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('não marca um estado legado como atualizado durante o setup', () => {
  const root = copyFixture();
  try {
    writeFileSync(
      join(root, '.template-state.json'),
      `${JSON.stringify({ technicalName: 'legacy-app', displayName: 'Legacy App' }, null, 2)}\n`,
    );

    runSetup(root, '--name=legacy-app', '--no-sync-skills');

    const state = JSON.parse(readFileSync(join(root, '.template-state.json'), 'utf8'));
    assert.equal(state.templateVersion, '0.0.0');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('restaura arquivos quando uma etapa intermediária falha', () => {
  const root = copyFixture();
  try {
    const packageFile = join(root, 'package.json');
    const before = readFileSync(packageFile, 'utf8');
    const appFile = join(root, 'src/app/App.tsx');
    const brokenApp = 'export function App() { return null; }\n';
    writeFileSync(appFile, brokenApp);

    const result = spawnSync(
      process.execPath,
      [join(root, 'scripts', 'setup.mjs'), '--name=broken-app', '--no-sync-skills'],
      { cwd: root, encoding: 'utf8' },
    );
    assert.notEqual(result.status, 0);
    assert.equal(readFileSync(packageFile, 'utf8'), before);
    assert.equal(readFileSync(appFile, 'utf8'), brokenApp);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('restaura a demonstração quando uma etapa posterior falha', () => {
  const root = copyFixture();
  try {
    const notes = join(root, 'src/features/notes');
    const customFeature = join(root, 'src/features/custom-feature/index.ts');
    mkdirSync(dirname(customFeature), { recursive: true });
    writeFileSync(customFeature, 'export const customFeature = true;\n');

    const result = spawnSync(
      process.execPath,
      [join(root, 'scripts', 'setup.mjs'), '--name=rollback-app', '--remove-example'],
      { cwd: root, encoding: 'utf8' },
    );

    assert.notEqual(result.status, 0);
    assert.equal(existsSync(notes), true);
    assert.equal(readFileSync(customFeature, 'utf8'), 'export const customFeature = true;\n');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('restaura as rotas quando uma etapa após remover as notas falha', () => {
  const root = copyFixture();
  try {
    const routesFile = join(root, 'src/app/routes/index.tsx');
    const before = readFileSync(routesFile, 'utf8');
    const result = spawnSync(
      process.execPath,
      [join(root, 'scripts/setup.mjs'), '--name=rollback-app', '--remove-example'],
      { cwd: root, encoding: 'utf8' },
    );
    assert.notEqual(result.status, 0);
    assert.equal(readFileSync(routesFile, 'utf8'), before);
    assert.equal(existsSync(join(root, 'src/features/notes')), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('preserva composições personalizadas e explica como remover suas referências', () => {
  const root = copyFixture();
  try {
    const routesFile = join(root, 'src/app/routes/index.tsx');
    const before = readFileSync(routesFile, 'utf8').replace(
      '<NoteList />',
      '<NoteList key="custom" />',
    );
    writeFileSync(routesFile, before);
    const result = spawnSync(
      process.execPath,
      [
        join(root, 'scripts/setup.mjs'),
        '--name=custom-app',
        '--remove-example',
        '--no-sync-skills',
      ],
      { cwd: root, encoding: 'utf8' },
    );
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /composição das notas foi personalizada/);
    assert.equal(readFileSync(routesFile, 'utf8'), before);
    assert.equal(existsSync(join(root, 'src/features/notes')), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test(
  'remove o styleguide e deixa uma base visual local sem referência ao pacote',
  { skip: semCapacidade('styleguide') },
  () => {
    const root = copyFixture();
    try {
      runSetup(root, '--name=sem-styleguide', '--no-styleguide', '--no-sync-skills');

      // A base local substitui o que o pacote fornecia.
      assert.ok(existsSync(join(root, 'src/styles/tokens.css')));
      assert.ok(existsSync(join(root, 'src/shared/ui/index.ts')));

      const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
      assert.equal(pkg.dependencies['@vitru/styleguide'], undefined);
      assert.match(readFileSync(join(root, 'src/main.tsx'), 'utf8'), /\.\/styles\/tokens\.css/);

      // Nenhuma referência pendente ao pacote removido.
      for (const file of [
        'src/app/routes/index.tsx',
        'src/app/App.tsx',
        'src/features/notes/components/NoteList.tsx',
        'src/features/home/components/HomePage.tsx',
      ]) {
        assert.doesNotMatch(readFileSync(join(root, file), 'utf8'), /@vitru\/styleguide/, file);
      }
      assert.ok(!existsSync(join(root, 'e2e/styleguide.spec.ts')));

      // As regras deixam de exigir o kit.
      assert.doesNotMatch(
        readFileSync(join(root, 'AGENTS.md'), 'utf8'),
        /kit de `@vitru\/styleguide`/,
      );
      assert.match(readFileSync(join(root, 'docs/styleguide.md'), 'utf8'), /não usa/);

      const state = JSON.parse(readFileSync(join(root, '.template-state.json'), 'utf8'));
      assert.equal(state.capabilities.styleguide, false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  },
);

test(
  'remove a autenticação sem deixar rota nem variável de ambiente órfã',
  { skip: semCapacidade('auth') },
  () => {
    const root = copyFixture();
    try {
      runSetup(root, '--name=sem-auth', '--no-auth', '--no-sync-skills');

      assert.ok(!existsSync(join(root, 'src/features/auth')));
      assert.ok(!existsSync(join(root, 'src/app/components/AuthGate.tsx')));

      const routes = readFileSync(join(root, 'src/app/routes/index.tsx'), 'utf8');
      assert.doesNotMatch(routes, /AuthGate|auth\/callback/);
      assert.match(routes, /element: <App \/>/);

      assert.doesNotMatch(readFileSync(join(root, 'src/vite-env.d.ts'), 'utf8'), /VITE_AUTH_/);
      assert.doesNotMatch(readFileSync(join(root, 'src/shared/config/env.ts'), 'utf8'), /AuthEnv/);
      assert.doesNotMatch(readFileSync(join(root, '.env.example'), 'utf8'), /VITE_AUTH_/);
      assert.doesNotMatch(readFileSync(join(root, 'AGENTS.md'), 'utf8'), /## Autenticação/);

      const state = JSON.parse(readFileSync(join(root, '.template-state.json'), 'utf8'));
      assert.equal(state.capabilities.auth, false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  },
);

test(
  'recusa religar uma capacidade já removida em vez de fingir que a restaura',
  { skip: semCapacidade('styleguide') },
  () => {
    const root = copyFixture();
    try {
      runSetup(root, '--name=sem-styleguide', '--no-styleguide', '--no-sync-skills');

      const result = spawnSync(
        process.execPath,
        [join(root, 'scripts', 'setup.mjs'), '--name=sem-styleguide', '--no-sync-skills'],
        {
          cwd: root,
          encoding: 'utf8',
        },
      );

      assert.equal(result.status, 1);
      assert.match(result.stderr, /já foi removida/);
      // O estado continua coerente com o disco.
      const state = JSON.parse(readFileSync(join(root, '.template-state.json'), 'utf8'));
      assert.equal(state.capabilities.styleguide, false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  },
);

test('grava o perfil escolhido e rejeita perfil desconhecido', () => {
  const root = copyFixture();
  try {
    runSetup(root, '--name=app', '--profile=rigoroso', '--no-sync-skills');
    assert.equal(
      JSON.parse(readFileSync(join(root, '.template-state.json'), 'utf8')).profile,
      'rigoroso',
    );

    const result = spawnSync(
      process.execPath,
      [join(root, 'scripts', 'setup.mjs'), '--name=app', '--profile=turbo', '--no-sync-skills'],
      {
        cwd: root,
        encoding: 'utf8',
      },
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Perfil desconhecido/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
