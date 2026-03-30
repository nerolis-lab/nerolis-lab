import { defineConfig, type DefaultTheme } from 'vitepress';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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
