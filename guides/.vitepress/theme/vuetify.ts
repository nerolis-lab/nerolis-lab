import type { ThemeDefinition } from 'vuetify';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';

// match `frontend/src/assets/theme.ts` darkTheme so drawers, lists, and surfaces align with the main app
const guidesDarkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#191224', //neutral 900
    primary: '#e63946', //primary 500
    secondary: '#ffb81f', //secondary 500
    surface: '#403D58', //neutral 700
    'on-background': '#ffffff',
    'on-surface': '#ffffff',
    'on-primary': '#ffffff',
    'on-secondary': '#ffffff'
  }
};

// Vuetify for guides (navigation drawer, icons, lists), aligned with frontend setup
export default createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: guidesDarkTheme
    }
  }
});
