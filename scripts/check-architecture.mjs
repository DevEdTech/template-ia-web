#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const defaultRoot = resolve(scriptDir, '..');
const sourceExtensions = new Set(['.ts', '.tsx']);

function listSourceFiles(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listSourceFiles(path));
    if (entry.isFile() && sourceExtensions.has(extname(entry.name))) files.push(path);
  }
  return files;
}

function normalized(path) {
  return path.split(sep).join('/');
}

function featureFromPath(path) {
  const match = normalized(path).match(/(?:^|\/)features\/([^/]+)(?:\/|$)/);
  return match?.[1] ?? null;
}

function targetFromSpecifier(sourceFile, specifier, sourceRoot) {
  if (specifier.startsWith('@/')) return resolve(sourceRoot, specifier.slice(2));
  if (specifier.startsWith('.')) return resolve(dirname(sourceFile), specifier);
  return null;
}

function isPublicFeatureImport(specifier, targetPath) {
  if (/^@\/features\/[^/]+$/.test(specifier)) return true;
  const target = normalized(targetPath);
  return /\/features\/[^/]+(?:\/index)?$/.test(target);
}

function moduleSpecifiers(sourceFile, content) {
  const scriptKind = extname(sourceFile) === '.tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(sourceFile, content, ts.ScriptTarget.Latest, true, scriptKind);
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

export function checkArchitecture(root = defaultRoot) {
  const sourceRoot = join(root, 'src');
  const errors = [];

  for (const sourceFile of listSourceFiles(sourceRoot)) {
    const sourceRelative = normalized(relative(sourceRoot, sourceFile));
    const sourceFeature = featureFromPath(sourceRelative);
    const sourceIsShared = sourceRelative.startsWith('shared/');
    const content = readFileSync(sourceFile, 'utf8');

    for (const specifier of moduleSpecifiers(sourceFile, content)) {
      const targetPath = targetFromSpecifier(sourceFile, specifier, sourceRoot);
      if (!targetPath) continue;
      const targetRelative = normalized(relative(sourceRoot, targetPath));
      const targetFeature = featureFromPath(targetRelative);

      if (sourceIsShared && targetFeature) {
        errors.push(`${sourceRelative}: shared não pode importar a feature "${targetFeature}".`);
        continue;
      }

      if (
        targetFeature &&
        targetFeature !== sourceFeature &&
        !isPublicFeatureImport(specifier, targetPath)
      ) {
        errors.push(
          `${sourceRelative}: importe a feature "${targetFeature}" apenas por sua interface pública.`,
        );
      }
    }
  }

  return errors;
}

function main() {
  const rootFlag = process.argv.indexOf('--root');
  const root = rootFlag >= 0 ? resolve(process.argv[rootFlag + 1]) : defaultRoot;
  const errors = checkArchitecture(root);
  if (errors.length > 0) {
    console.error('Verificação arquitetural FALHOU:\n');
    for (const error of errors) console.error(`  - ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log('Verificação arquitetural OK.');
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) main();
