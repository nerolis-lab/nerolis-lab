import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  server: {
    fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] }
  },
  test: {
    globals: true,
    server: {
      deps: { inline: ['vuetify'] }
    }
  }
});
