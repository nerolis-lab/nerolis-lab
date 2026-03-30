import DefaultTheme from 'vitepress/theme';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createRouter, createWebHistory } from 'vue-router';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { darkTheme } from '@/assets/theme';
import Layout from './Layout.vue';
import './style.scss';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    const pinia = createPinia();
    pinia.use(piniaPluginPersistedstate);

    const router = createRouter({
      history: createWebHistory('/'),
      routes: [{ path: '/:pathMatch(.*)*', name: 'Guides', component: { template: '<div />' } }]
    });

    app.use(
      createVuetify({
        theme: {
          defaultTheme: 'darkTheme',
          themes: {
            darkTheme
          }
        },
        components,
        directives
      })
    );
    app.use(pinia);
    app.use(router);
  }
};
