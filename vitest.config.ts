import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup/deterministic.ts'],
    globalSetup: ['./tests/setup/globalSetup.ts'],
    include: [
      'tests/platform/**/*.test.ts',
      'tests/features/**/*.test.ts',
    ],
    exclude: [
      'dist/**',
      'node_modules/**',
    ],
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    passWithNoTests: true,
    fileParallelism: false,
    testTimeout: 10_000,
    hookTimeout: 10_000,
  },
});
