import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    testTimeout: 30000, // Longer timeout for network requests when checking links
    root: fileURLToPath(new URL('./', import.meta.url))
  }
});
