import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import { configDefaults, defineConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

export default mergeConfig(
  viteConfig({ command: 'serve', mode: 'test' }),
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/*', '**/main.ts'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        include: ['**/src/**'],
        exclude: ['**/node_modules/**', '**/test/**', '**/main.ts', '**/index.ts'],
        reporter: ['text-summary', 'json', 'lcov']
      },
      server: {
        deps: {
          inline: ['vuetify']
        }
      },
      setupFiles: ['./src/vitest/setup.ts']
    }
  })
)
