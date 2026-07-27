// Canonical registry of locale codes the app recognizes. Lives here (not in
// frontend) because it's not just about UI text: common/src/locales/en/pokemonNames.ts
// is a separate, backend-shared dictionary that will need its own per-locale
// siblings (e.g. common/src/locales/ja/pokemonNames.ts) as more languages are
// added, and both that and the frontend's vue-i18n setup should agree on the
// same set of locale codes rather than each maintaining their own list.
export type SupportedLocale = 'en' | 'ja';
export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'ja'];
