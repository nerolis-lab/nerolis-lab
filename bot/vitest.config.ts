import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, 'src')
    }
  },
  test: {
    globals: true,
    coverage: {
      reporter: ['text-summary', 'json', 'lcov'],
      exclude: ['**/index.ts', 'app.ts', '**/mocks/**', '**/node_modules/**', '**/dist/**', '**/coverage/**']
    }
  }
});
