#!/usr/bin/env node
// Personaliza um novo projeto criado a partir deste template.
//
// Uso: `npm run setup` (ou `node scripts/setup.mjs`).
//
// O script é interativo (perguntas via node:readline/promises). Em ambiente
// sem TTY (CI, pipes) ele apenas explica o uso e sai com código 0, sem falhar.
//
// É seguro rodar mais de uma vez, com uma ressalva: a substituição do nome no
// README procura o placeholder original ("web-project-template"). Após a
// primeira execução esse placeholder já terá sido trocado, então em execuções
// seguintes o README apenas será avisado (não falha).
//
// Compatível com macOS, Linux e Windows: apenas APIs nativas do Node.

import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { parseArgs } from 'node:util';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, '..');

const PLACEHOLDER_NAME = 'web-project-template';

function log(msg) {
  console.log(msg);
}

/**
 * Atualiza `name` e `description` do package.json preservando indentação de
 * 2 espaços. Usa JSON.parse/stringify para não quebrar o arquivo.
 */
function updatePackageJson(name, description) {
  const file = join(projectRoot, 'package.json');
  if (!existsSync(file)) {
    log('Aviso: package.json nao encontrado; pulando.');
    return;
  }
  const raw = readFileSync(file, 'utf8');
  const pkg = JSON.parse(raw);
  if (name) {
    pkg.name = name;
  }
  if (description) {
    pkg.description = description;
  }
  const trailingNewline = raw.endsWith('\n') ? '\n' : '';
  writeFileSync(file, `${JSON.stringify(pkg, null, 2)}${trailingNewline}`);
  log(`package.json atualizado (name="${pkg.name}").`);
}

/** Atualiza o <title> do index.html para o nome do projeto. */
function updateIndexHtml(title) {
  const file = join(projectRoot, 'index.html');
  if (!existsSync(file)) {
    log('Aviso: index.html nao encontrado; pulando.');
    return;
  }
  const html = readFileSync(file, 'utf8');
  const updated = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  if (updated === html) {
    log('Aviso: tag <title> nao encontrada em index.html; nada alterado.');
    return;
  }
  writeFileSync(file, updated);
  log(`index.html atualizado (<title>${title}</title>).`);
}

/**
 * Substitui o placeholder de nome no README de forma conservadora.
 * Se o placeholder não for encontrado, apenas avisa (não falha).
 */
function updateReadme(name) {
  const file = join(projectRoot, 'README.md');
  if (!existsSync(file)) {
    log('Aviso: README.md nao encontrado; pulando.');
    return;
  }
  const content = readFileSync(file, 'utf8');
  if (!content.includes(PLACEHOLDER_NAME)) {
    log(
      `Aviso: placeholder "${PLACEHOLDER_NAME}" nao encontrado no README.md. ` +
        'Ajuste o titulo manualmente se necessario.',
    );
    return;
  }
  const updated = content.split(PLACEHOLDER_NAME).join(name);
  writeFileSync(file, updated);
  log(`README.md atualizado (nome do projeto = "${name}").`);
}

/** Remove a feature de exemplo, se solicitado. */
function removeExampleFeature() {
  const dir = join(projectRoot, 'src', 'features', 'example');
  if (!existsSync(dir)) {
    log('Feature de exemplo nao encontrada (talvez ja removida); pulando.');
    return;
  }
  rmSync(dir, { recursive: true, force: true });
  log('Feature de exemplo removida: src/features/example');

  const notesDir = join(projectRoot, 'src', 'features', 'notes');
  if (existsSync(notesDir)) {
    rmSync(notesDir, { recursive: true, force: true });
    log('Feature de notas removida: src/features/notes');
  }
  log('Atencao: imports que referenciavam essa feature podem precisar de ajuste.');
}

/** Reseta o tasks.md para um estado limpo (documentação inicial). */
function initDocs() {
  const file = join(projectRoot, 'tasks.md');
  const template = `# Tarefas

Registre aqui as tarefas do projeto.

## A fazer

## Em andamento

## Concluido
`;
  writeFileSync(file, template);
  log('tasks.md reiniciado para um estado limpo.');
}

/** Executa scripts/sync-skills.mjs via o mesmo Node em execução. */
function runSyncSkills() {
  const syncScript = join(scriptDir, 'sync-skills.mjs');
  const result = spawnSync(process.execPath, [syncScript], {
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    log('Aviso: a sincronizacao de skills terminou com erro.');
  }
}

/** Interpreta uma resposta sim/nao. */
function isYes(answer, defaultYes) {
  const normalized = answer.trim().toLowerCase();
  if (normalized === '') {
    return defaultYes;
  }
  return normalized === 's' || normalized === 'sim' || normalized === 'y' || normalized === 'yes';
}

function explainUsageAndExit() {
  log('Setup do template (modo nao interativo detectado).');
  log('');
  log('Este script personaliza um novo projeto e precisa de um terminal');
  log('interativo (TTY) para as perguntas. Rode em um terminal:');
  log('');
  log('  npm run setup');
  log('');
  log('Ou forneca argumentos via linha de comando para rodar automaticamente:');
  log('  npm run setup -- --name="meu-app" --description="Meu app" --remove-example');
  log('');
  log('Para apenas sincronizar as skills sem o setup completo:');
  log('');
  log('  npm run sync:skills');
  process.exit(0);
}

function applyChanges(
  projectName,
  description,
  organization,
  removeExample,
  doInitDocs,
  doSyncSkills,
) {
  log('\nAplicando alteracoes...\n');

  updatePackageJson(projectName, description);
  updateIndexHtml(projectName);
  updateReadme(projectName);

  if (organization) {
    log(`Organizacao informada: "${organization}".`);
    log(
      'Observacao: registre a organizacao no README/LICENSE conforme necessario (nao alterado automaticamente).',
    );
  }

  if (removeExample) {
    removeExampleFeature();
  }
  if (doInitDocs) {
    initDocs();
  }
  if (doSyncSkills) {
    log('\nSincronizando skills...');
    runSyncSkills();
  }

  log('\nSetup concluido. Proximos passos:');
  log('  1. Se ainda nao instalou as dependencias: npm install');
  log('  2. Valide o projeto: npm run validate');
  log('  3. Suba o ambiente de desenvolvimento: npm run dev');
  log('');
  log('Este script pode ser executado novamente, mas a troca do nome no README');
  log(`so acontece enquanto o placeholder "${PLACEHOLDER_NAME}" existir no arquivo.`);
}

async function main() {
  const args = parseArgs({
    options: {
      name: { type: 'string' },
      description: { type: 'string' },
      organization: { type: 'string' },
      'remove-example': { type: 'boolean' },
      'init-docs': { type: 'boolean' },
      'no-sync-skills': { type: 'boolean' },
    },
    strict: false,
  });

  const { values } = args;
  const hasArgs = Object.keys(values).length > 0;

  if (hasArgs) {
    log('Configuracao via argumentos de linha de comando detectada.');
    applyChanges(
      values.name || PLACEHOLDER_NAME,
      values.description || '',
      values.organization || '',
      values['remove-example'] || false,
      values['init-docs'] || false,
      !values['no-sync-skills'],
    );
    return;
  }

  // Ambiente não interativo: explica e sai sem falhar.
  if (!stdin.isTTY) {
    explainUsageAndExit();
    return;
  }

  const rl = createInterface({ input: stdin, output: stdout });

  try {
    log('Configuracao do novo projeto a partir do template.\n');

    const nameRaw = (await rl.question('Nome do projeto: ')).trim();
    const projectName = nameRaw || PLACEHOLDER_NAME;

    const description = (await rl.question('Descricao do projeto: ')).trim();
    const organization = (await rl.question('Nome da organizacao: ')).trim();

    const removeExample = isYes(await rl.question('Remover feature de exemplo? (s/N): '), false);
    const doInitDocs = isYes(
      await rl.question('Inicializar documentacao (limpar tasks.md)? (s/N): '),
      false,
    );
    const doSyncSkills = isYes(await rl.question('Sincronizar skills? (S/n): '), true);

    applyChanges(projectName, description, organization, removeExample, doInitDocs, doSyncSkills);
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error('Erro durante o setup:', err);
  process.exit(1);
});
