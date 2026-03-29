import { defineConfig } from 'vitepress';

export default defineConfig({
  title: "Neroli's Lab Guides",
  description: 'Pokémon Sleep guides and references',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quickstart', link: '/getting-started/quickstart' }
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [{ text: 'Quickstart', link: '/getting-started/quickstart' }]
      }
    ]
  }
});
