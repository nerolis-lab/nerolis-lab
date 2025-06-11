import { defineConfig, type DefaultTheme } from 'vitepress';

export default defineConfig({
  title: "Neroli's Lab Docs",
  description: "Documentation for Neroli's Lab - Pokémon Sleep data analysis tool",

  // Ignore localhost links as they're expected to be dead during build
  ignoreDeadLinks: [/^http:\/\/localhost/, /^https:\/\/localhost/],

  head: [
    // Favicons
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/docs.ico' }],
    ['link', { rel: 'apple-touch-icon', href: '/docs-512x512.png' }],

    // SEO Meta Tags
    [
      'meta',
      {
        name: 'description',
        content:
          "Documentation for Neroli's Lab - Open source Pokémon Sleep data analysis tools, APIs, and development guides."
      }
    ],
    [
      'meta',
      {
        name: 'keywords',
        content: 'pokemon sleep, data analysis, api, documentation, open source, sleep tracking, ingredient calculator'
      }
    ],
    ['meta', { name: 'author', content: "Neroli's Lab" }],
    ['meta', { name: 'robots', content: 'index, follow' }],

    // Open Graph / Facebook
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: "Neroli's Lab Documentation" }],
    ['meta', { property: 'og:title', content: "Neroli's Lab Docs - Pokémon Sleep Data Analysis" }],
    [
      'meta',
      {
        property: 'og:description',
        content:
          "Documentation for Neroli's Lab - Open source Pokémon Sleep data analysis tools, APIs, and development guides."
      }
    ],
    ['meta', { property: 'og:image', content: 'https://docs.nerolislab.com/docs-512x512.png' }],
    ['meta', { property: 'og:image:width', content: '512' }],
    ['meta', { property: 'og:image:height', content: '512' }],
    ['meta', { property: 'og:image:alt', content: "Neroli's Lab Logo" }],
    ['meta', { property: 'og:url', content: 'https://docs.nerolislab.com' }],
    ['meta', { property: 'og:locale', content: 'en_US' }],

    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@nerolislab' }],
    ['meta', { name: 'twitter:creator', content: '@nerolislab' }],
    ['meta', { name: 'twitter:title', content: "Neroli's Lab Docs - Pokémon Sleep Data Analysis" }],
    [
      'meta',
      {
        name: 'twitter:description',
        content:
          "Documentation for Neroli's Lab - Open source Pokémon Sleep data analysis tools, APIs, and development guides."
      }
    ],
    ['meta', { name: 'twitter:image', content: 'https://docs.nerolislab.com/docs-512x512.png' }],
    ['meta', { name: 'twitter:image:alt', content: "Neroli's Lab Logo" }],

    // Theme and App Meta
    ['meta', { name: 'theme-color', content: '#9771e0' }],
    ['meta', { name: 'msapplication-TileColor', content: '#9771e0' }],
    ['meta', { name: 'application-name', content: "Neroli's Lab Docs" }],

    // Canonical URL
    ['link', { rel: 'canonical', href: 'https://docs.nerolislab.com' }]
  ],

  themeConfig: {
    logo: '/docs-512x512.png',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started/contributing' },
      { text: 'Website', link: 'https://nerolislab.com' }
    ] satisfies DefaultTheme.NavItem[],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Contributing', link: '/getting-started/contributing' },
          { text: 'Development Setup', link: '/getting-started/development-setup' },
          { text: 'Linear History', link: '/getting-started/linear-history' }
        ]
      },
      {
        text: 'Components',
        items: [
          { text: 'Overview', link: '/components/' },
          { text: 'Frontend', link: '/components/frontend' },
          { text: 'Backend', link: '/components/backend' },
          { text: 'Common', link: '/components/common' }
        ]
      },
      {
        text: 'External Documentation',
        items: [
          { text: 'Vuetify', link: 'https://vuetifyjs.com/en/' },
          { text: 'Vue', link: 'https://vuejs.org/' },
          { text: 'Vite', link: 'https://vite.dev/' },
          { text: 'Vitest', link: 'https://vitest.dev/' },
          { text: 'Pinia', link: 'https://pinia.vuejs.org/' },
          { text: 'Pinia peristed state plugin', link: 'https://prazdevs.github.io/pinia-plugin-persistedstate/' },
          { text: 'TypeScript', link: 'https://www.typescriptlang.org/' }
        ]
      }
    ] satisfies DefaultTheme.SidebarItem[],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/nerolis-lab/nerolis-lab' },
      { icon: 'discord', link: 'https://discord.gg/SP9Ms69ueD' }
    ] satisfies DefaultTheme.SocialLink[],

    footer: {
      message: 'Released under the Apache 2.0 License.',
      copyright: "Copyright © 2025 Neroli's Lab"
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/nerolis-lab/nerolis-lab/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  } satisfies DefaultTheme.Config,

  markdown: {
    lineNumbers: true
  }
});
