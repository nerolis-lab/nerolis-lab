import '@mdi/font/css/materialdesignicons.css';
import GuideDemoBanner from '@shared/components/GuideDemoBanner.vue';
import type { EnhanceAppContext } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import Layout from './Layout.vue';
import './style.scss';
import vuetify from './vuetify';

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }: EnhanceAppContext) {
    app.use(vuetify);
    app.component('GuideDemoBanner', GuideDemoBanner);
  }
};
