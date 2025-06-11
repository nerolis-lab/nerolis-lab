import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import { configDefaults, defineConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

export default mergeConfig(
  viteConfig({ command: 'serve', mode: 'test' }),
  defineConfig({
    test: {
      environment: 'jsdom',
      pool: 'forks', // uses child processes instead of worker threads, works better with CI teardown
      exclude: [...configDefaults.exclude, 'e2e/*', '**/main.ts'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        include: ['**/src/**'],
        exclude: ['**/node_modules/**', '**/test/**', '**/main.ts', '**/index.ts'],
        reporter: ['text-summary', 'json', 'lcov']
      },
      setupFiles: ['./src/vitest/setup.ts'],
      teardownTimeout: 10000, // Give more time for cleanup
      testTimeout: 30000 // Increase test timeout
    }
  })
)
