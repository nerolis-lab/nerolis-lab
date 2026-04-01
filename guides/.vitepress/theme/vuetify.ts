import type { ThemeDefinition } from 'vuetify';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';

/**
 * Match `frontend/src/assets/theme.ts` darkTheme so drawers, lists, and surfaces
 * align with the main app.
 */
const guidesDarkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#191224',
    primary: '#E63946',
    secondary: '#5E5A7F',
    surface: '#403D58',
    accent: '#9A95C3',
    'on-background': '#ffffff',
    'on-surface': '#ffffff',
    'on-primary': '#ffffff',
    'on-secondary': '#ffffff'
  }
};

/**
 * Vuetify for guides (navigation drawer, icons, lists), aligned with frontend setup.
 */
export default createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: guidesDarkTheme
    }
  }
});
