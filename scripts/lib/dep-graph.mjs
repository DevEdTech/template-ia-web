// Grafo de dependências do código-fonte, para rodar só o que a mudança afeta.
//
// `validate --changed` precisa responder: mudei este arquivo, quais testes
// cobrem o que depende dele? A resposta é o fechamento transitivo das arestas
// invertidas (quem importa quem).
//
// Usa a AST do TypeScript, como `check-architecture.mjs`, para não errar em
// reexport, import dinâmico ou import de tipo.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import ts from 'typescript';

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts'];
const RESOLVABLE = [...SOURCE_EXTENSIONS, '.css', '.json'];
const SCANNED_EXTENSIONS = new Set([...SOURCE_EXTENSIONS, '.css']);

function normalized(path) {
  return path.split(sep).join('/');
}

function listFiles(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(path));
    else if (entry.isFile() && SCANNED_EXTENSIONS.has(extname(entry.name))) files.push(path);
  }
  return files;
}

/** Resolve um especificador para um arquivo real, como o bundler faria. */
function resolveSpecifier(fromFile, specifier, sourceRoot) {
  let base;
  if (specifier.startsWith('@/')) base = resolve(sourceRoot, specifier.slice(2));
  else if (specifier.startsWith('.')) base = resolve(dirname(fromFile), specifier);
  else return null; // pacote externo: não entra no grafo

  if (existsSync(base) && statSync(base).isFile()) return base;
  for (const extension of RESOLVABLE) {
    const candidate = `${base}${extension}`;
    if (existsSync(candidate)) return candidate;
  }
  for (const extension of SOURCE_EXTENSIONS) {
    const candidate = join(base, `index${extension}`);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function moduleSpecifiers(file, content) {
  const scriptKind = extname(file) === '.tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, scriptKind);
  const specifiers = [];

  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    }
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
  return specifiers;
}

/** `@import`/`composes` de CSS Modules: a mudança de um token alcança quem o usa. */
function cssSpecifiers(content) {
  const specifiers = [];
  for (const match of content.matchAll(/@import\s+(?:url\()?['"]([^'"]+)['"]/g)) {
    specifiers.push(match[1]);
  }
  for (const match of content.matchAll(/composes:\s*[^;]*?from\s+['"]([^'"]+)['"]/g)) {
    specifiers.push(match[1]);
  }
  return specifiers;
}

/**
 * Monta o grafo de dependências das pastas indicadas.
 * @param {string} root raiz do repositório.
 * @param {string[]} [directories] pastas a varrer, relativas à raiz.
 * @returns {{ dependents: Map<string, Set<string>>, files: string[] }}
 *   `dependents` mapeia arquivo -> quem o importa (arestas invertidas).
 */
export function buildDependencyGraph(root, directories = ['src', 'e2e']) {
  const sourceRoot = join(root, 'src');
  const files = directories.flatMap((directory) => listFiles(join(root, directory)));
  /** @type {Map<string, Set<string>>} */
  const dependents = new Map();

  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    const specifiers =
      extname(file) === '.css' ? cssSpecifiers(content) : moduleSpecifiers(file, content);
    for (const specifier of specifiers) {
      const target = resolveSpecifier(file, specifier, sourceRoot);
      if (!target) continue;
      const key = normalized(relative(root, target));
      if (!dependents.has(key)) dependents.set(key, new Set());
      dependents.get(key).add(normalized(relative(root, file)));
    }
  }

  return { dependents, files: files.map((file) => normalized(relative(root, file))) };
}

/**
 * Fechamento transitivo: os arquivos alterados mais todos que dependem deles.
 * @param {string[]} changed caminhos relativos à raiz.
 * @param {Map<string, Set<string>>} dependents arestas invertidas.
 * @returns {Set<string>}
 */
export function affectedFiles(changed, dependents) {
  const affected = new Set(changed.map(normalized));
  const queue = [...affected];
  while (queue.length > 0) {
    const current = queue.pop();
    for (const dependent of dependents.get(current) ?? []) {
      if (affected.has(dependent)) continue;
      affected.add(dependent);
      queue.push(dependent);
    }
  }
  return affected;
}

/** Os arquivos de teste dentro de um conjunto afetado. */
export function testFilesIn(files) {
  return [...files]
    .filter((file) => /\.test\.[cm]?[jt]sx?$/.test(file) || /(?:^|\/)tests?\//.test(file))
    .filter((file) => !file.startsWith('e2e/'))
    .sort();
}
