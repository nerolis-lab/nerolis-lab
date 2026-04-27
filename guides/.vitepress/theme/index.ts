import '@mdi/font/css/materialdesignicons.css';
import type { EnhanceAppContext } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import AboutAuthor from './components/AboutAuthor.vue';
import GuideDemoComponent from './components/GuideDemoComponent.vue';
import SubjectiveInfoBanner from './components/SubjectiveInfoBanner.vue';
import Layout from './Layout.vue';
import './style.scss';
import vuetify from './vuetify';

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }: EnhanceAppContext) {
    app.use(vuetify);
    app.component('GuideDemoComponent', GuideDemoComponent);
    app.component('SubjectiveInfoBanner', SubjectiveInfoBanner);
    app.component('AboutAuthor', AboutAuthor);
  }
};
