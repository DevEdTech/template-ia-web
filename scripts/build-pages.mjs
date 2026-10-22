#!/usr/bin/env node

import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { preparePages } from './prepare-pages.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// configure-pages fornece base_path sem barra final. Normalizamos também
// para os consumidores de import.meta.env.BASE_URL que montam URLs de assets.
// Sem variável, mantém o build compatível com sites na raiz ou domínio próprio.
const basePath = process.env.PAGES_BASE_PATH || '/';
const base = `${basePath.replace(/\/+$/, '')}/`;
await build({ root, base });
preparePages(join(root, 'dist'));
console.log(`Build do GitHub Pages pronto em dist/ (base: ${base}).`);
