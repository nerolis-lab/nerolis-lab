import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vuetify from 'vite-plugin-vuetify';
import { defineConfig, type DefaultTheme } from 'vitepress';
import { buildSidebar } from './sidebar';

const __dirname = dirname(fileURLToPath(import.meta.url));
const guidesRoot = resolve(__dirname, '..');
const guidesContentRoot = resolve(guidesRoot, 'content');
const sharedVueRoot = resolve(guidesRoot, '../frontend/src/shared');

// Importers under frontend/src/shared are outside the guides package tree. Node would
// resolve `vue` by walking up from that path, so CI (guides-only install) fails unless
// we pin `vue` to this package's node_modules.
const requireFromGuides = createRequire(resolve(guidesRoot, 'package.json'));
const vuePackageRoot = dirname(requireFromGuides.resolve('vue/package.json'));

export default defineConfig({
  srcDir: 'content',
  base: '/guides/',
  title: "Neroli's Lab Guides",
  description: 'Guides for understanding Pokémon Sleep mechanics',

  head: [
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600&family=Roboto:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap'
      }
    ]
  ],

  ignoreDeadLinks: [/^http:\/\/localhost/, /^https:\/\/localhost/],

  themeConfig: {
    search: {
      provider: 'local'
    },
    outline: {
      level: [2, 3]
    },
    sidebar: buildSidebar(guidesContentRoot) as DefaultTheme.Config['sidebar'],
    editLink: {
      pattern: 'https://github.com/nerolis-lab/nerolis-lab/edit/main/guides/:path',
      text: 'Edit this page on GitHub'
    },
    docFooter: {
      prev: 'Previous',
      next: 'Next'
    }
  },

  markdown: {
    lineNumbers: true
  },

  vite: {
    resolve: {
      alias: {
        '@shared': sharedVueRoot,
        vue: vuePackageRoot
      },
      dedupe: ['vue']
    },
    server: {
      port: 5173,
      strictPort: true
    },
    ssr: {
      noExternal: ['vuetify']
    },
    plugins: [vuetify({ autoImport: true })]
  }
});
