import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: './test/setup.js',
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**', 'WPlace-AutoBOT/src/js/core/**'],
      exclude: [
        'node_modules',
        'dist',
        'build',
        'coverage',
        'tests',
        'scripts',
        '**/*.d.ts',

        '*.config.*',
        '*.config.mjs',
        'prettier.config.*',
        'stylelint.config.*',
        'eslint.config.*',
        'vite.config.*',

        'WPlace-AutoBOT/',
        'WPlace-AutoBOT/**',
        'WPlace-AutoBOT/*/',

        'WPlace-AutoBOT/Auto-Image.js',
        'WPlace-AutoBOT/meta.js',
        'WPlace-AutoBOT/AccountSwapper',
        'WPlace-AutoBOT/AccountSwapper/**',

        'WPlace-AutoBOT/src/js/startup/**',
        'WPlace-AutoBOT/src/js/overlay/**',
        'WPlace-AutoBOT/src/js/security/**',
        'WPlace-AutoBOT/src/js/handlers/**',
        'WPlace-AutoBOT/src/js/utils/**',
      ],
    },
  },
});
