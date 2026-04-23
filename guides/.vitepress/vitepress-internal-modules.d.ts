declare module 'vitepress/dist/client/theme-default/support/docsearch.js' {
  import type { DefaultTheme } from 'vitepress/theme';

  export function resolveOptionsForLanguage(
    options: DefaultTheme.LocalSearchOptions | DefaultTheme.AlgoliaSearchOptions | Record<string, unknown>,
    localeIndex: string,
    lang: string
  ): DefaultTheme.AlgoliaSearchOptions;
}
