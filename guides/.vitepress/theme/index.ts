import '@mdi/font/css/materialdesignicons.css';
import type { EnhanceAppContext } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import GuideDemoBanner from './components/GuideDemoBanner.vue';
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
