#!/usr/bin/env node

import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { preparePages } from './prepare-pages.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// configure-pages fornece base_path sem barra final; o Vite normaliza a base.
// Sem variável, mantém o build compatível com sites na raiz ou domínio próprio.
const base = process.env.PAGES_BASE_PATH || '/';
await build({ root, base });
preparePages(join(root, 'dist'));
console.log(`Build do GitHub Pages pronto em dist/ (base: ${base}).`);
