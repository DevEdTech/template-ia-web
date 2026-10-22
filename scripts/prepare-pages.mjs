import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** Entradas reais para as rotas públicas; o Pages não oferece rewrite de SPA. */
export function preparePages(dist) {
  mkdirSync(join(dist, 'styleguide'), { recursive: true });
  copyFileSync(join(dist, 'index.html'), join(dist, 'styleguide', 'index.html'));
  // Endereços desconhecidos continuam mostrando a tela de fallback do app,
  // com o status HTTP 404 correto devolvido pelo GitHub Pages.
  copyFileSync(join(dist, 'index.html'), join(dist, '404.html'));
  writeFileSync(join(dist, '.nojekyll'), '');
}
