import DefaultTheme from 'vitepress/theme';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import Layout from './Layout.vue';
import './style.scss';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.use(
      createVuetify({
        components,
        directives
      })
    );
  }
};
