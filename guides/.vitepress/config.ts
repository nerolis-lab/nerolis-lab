import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type DefaultTheme } from 'vitepress';

const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const frontendSrcPath = resolve(repoRoot, 'frontend/src');

export default defineConfig({
  base: '/guides/',
  title: "Neroli's Lab Guides",
  description: 'Guides for understanding Pokémon Sleep mechanics',

  ignoreDeadLinks: [/^http:\/\/localhost/, /^https:\/\/localhost/],

  themeConfig: {
    sidebar: false,
    search: {
      provider: 'local'
    }
  } satisfies DefaultTheme.Config,

  markdown: {
    lineNumbers: true
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
          // keep parity with frontend/vite.config.ts so shared Vue SFCs (e.g. NavBar) resolve $primary, $desktop, etc.
          additionalData: `@use "@/assets/main" as *;`
        }
      }
    },
    resolve: {
      alias: {
        '@': frontendSrcPath
      }
    },
    server: {
      fs: {
        allow: [repoRoot]
      }
    }
  }
});
