import path from 'path';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'src/assets',
          dest: '.'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, 'src')
    }
  },
  build: {
    target: 'node20',
    outDir: 'dist',
    lib: {
      entry: 'src/app.ts',
      formats: ['es'],
      fileName: 'app'
    },
    rollupOptions: {
      external: ['discord.js', 'common', 'dotenv', 'express', 'morgan', 'path', 'url', 'fs', 'os']
    },
    minify: false,
    sourcemap: true,
    copyPublicDir: false
  },
  // Copy assets directory to dist
  assetsInclude: ['src/assets/**/*']
});
