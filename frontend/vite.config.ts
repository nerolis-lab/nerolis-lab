/* eslint-disable SleepAPILogger/no-console */
import vue from '@vitejs/plugin-vue'
import fs from 'fs-extra'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'
import { defineConfig } from 'vite'
import type { ManifestOptions } from 'vite-plugin-pwa'
import { VitePWA } from 'vite-plugin-pwa'
import VueDevTools from 'vite-plugin-vue-devtools'
import vuetify from 'vite-plugin-vuetify'
import { name, version } from '../package.json'

const manifest: Partial<ManifestOptions> = {
  name: "Neroli's Lab",
  short_name: "Neroli's Lab",
  display: 'fullscreen',
  description: 'Run your own calculations with our Sleep API-powered simulations.',
  theme_color: '#191224',
  background_color: '#191224',
  icons: [
    {
      src: `pwa-192x192.png`,
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable'
    },
    {
      src: `pwa-512x512.png`,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable'
    }
  ]
}

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        additionalData: `@use "@/assets/main" as *;`
      }
    }
  },
  plugins: [
    vue(),
    vuetify(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest,
      strategies: 'generateSW',
      injectRegister: 'auto',
      mode: command === 'serve' ? 'development' : 'production',
      workbox: {
        globPatterns: ['**/*.{js,css,ico,png,svg}'],
        navigateFallback: null,
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: /^\/index\.html$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 0 // Ensures no caching of index.html
              },
              cacheableResponse: {
                statuses: [200]
              }
            }
          },
          {
            urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 31536000 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        mode: 'production',
        disableDevLogs: true
      },
      includeAssets: ['apple-touch-icon.png', 'favicon.ico']
    }),
    VueDevTools(),
    // Temporarily disable CSP plugin for debugging
    // csp({
    //   dev: {
    //     run: true,
    //     outlierSupport: ['vue', 'less', 'scss']
    //   },
    //   policy: {
    //     'connect-src': ["'self'", 'https://stats.nerolislab.com', 'https://gc.zgo.at'],
    //     'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
    //     'script-src': ["'self'", "'unsafe-inline'", "'strict-dynamic'", 'https:', 'https://gc.zgo.at/count.js'],
    //     'script-src-elem': ["'self'", 'https://accounts.google.com/gsi/client', 'https://gc.zgo.at/count.js'],
    //     'style-src': ["'self'"],
    //     'style-src-elem': ['https://fonts.googleapis.com', 'https://accounts.google.com/gsi/style', "'unsafe-inline'"]
    //   },
    //   build: {
    //     sri: false
    //   }
    // }),
    {
      name: 'generate-avatars-json',
      buildStart: () => {
        const avatarDir = path.resolve(__dirname, 'public/images/avatar')
        const outputJson = path.resolve(__dirname, 'public/images/avatar/avatars.json')

        function getAllFiles(dirPath: string, filesObject: Record<string, string> = {}): Record<string, string> {
          const files = fs.readdirSync(dirPath)

          files.forEach((file) => {
            const fullPath = path.join(dirPath, file)
            if (fs.statSync(fullPath).isDirectory()) {
              getAllFiles(fullPath, filesObject)
            } else if (/\.(png|jpg|jpeg)$/i.test(file)) {
              const baseName = path.parse(file).name
              filesObject[baseName] = path.relative(avatarDir, fullPath)
            }
          })

          return filesObject
        }

        if (fs.existsSync(avatarDir)) {
          const filesObject = getAllFiles(avatarDir)

          fs.writeFileSync(outputJson, JSON.stringify(filesObject, null, 2))
          console.log(`Generated avatars.json with ${Object.keys(filesObject).length} entries.`)
        } else {
          console.warn('Avatar directory does not exist.')
        }
      }
    }
  ],
  server: {
    host: true,
    port: 8001,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    server: {
      deps: {
        inline: ['vuetify']
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          faker: ['@faker-js/faker']
        }
      }
    }
  },
  define: {
    APP_NAME: JSON.stringify(name),
    APP_VERSION: JSON.stringify(version),
    __INTLIFY_JIT_COMPILATION__: true
  }
}))
