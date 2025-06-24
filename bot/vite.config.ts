import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
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
    sourcemap: true
  }
});
