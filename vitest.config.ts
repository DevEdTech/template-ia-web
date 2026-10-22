import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';
// Os limites de cobertura seguem o perfil declarado em `.template-state.json`:
// protótipo não mede, padrão protege contra regressão, rigoroso é o portão de
// produção. A tabela fica em scripts/lib/project-config.mjs.
import { readProjectConfig } from './scripts/lib/project-config.mjs';

const { coverage } = readProjectConfig();

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      // Mantém o Web Storage dos testes sob controle do jsdom em Node 24+.
      execArgv: ['--no-experimental-webstorage'],
      globals: true,
      setupFiles: './src/test/setup.ts',
      exclude: [...configDefaults.exclude, 'scripts/**/*.test.mjs', 'e2e/**'],
      css: true,
      typecheck: {
        tsconfig: './tsconfig.app.json',
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/test/**', 'src/main.tsx', 'src/vite-env.d.ts'],
        // Aplicados de fato: `npm run test` roda `test:coverage`, entao uma
        // queda abaixo destes limites falha o `validate` e o CI. O perfil
        // `prototipo` nao impoe limite nenhum.
        ...(coverage ? { thresholds: coverage } : {}),
      },
    },
  }),
);
