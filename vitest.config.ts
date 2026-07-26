import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.ts',
      exclude: [...configDefaults.exclude, 'scripts/**/*.test.mjs'],
      css: true,
      typecheck: {
        tsconfig: './tsconfig.app.json',
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/test/**', 'src/main.tsx', 'src/vite-env.d.ts'],
      },
    },
  }),
);
