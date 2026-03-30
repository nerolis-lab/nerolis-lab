import { defineConfig, type DefaultTheme } from 'vitepress';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const frontendSharedPath = resolve(repoRoot, 'frontend/src/shared');

export default defineConfig({
  base: '/guides/',
  title: "Neroli's Lab Guides",
  description: 'Guides for understanding Pokémon Sleep mechanics',

  ignoreDeadLinks: [/^http:\/\/localhost/, /^https:\/\/localhost/],

  themeConfig: {
    sidebar: [
      {
        text: 'Pokémon Sleep Guides',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Sleep Basics', link: '/sleep-basics' }
        ]
      }
    ] satisfies DefaultTheme.SidebarItem[],
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
        '@frontend-shared': frontendSharedPath
      }
    },
    server: {
      fs: {
        allow: [repoRoot]
      }
    }
  }
});
