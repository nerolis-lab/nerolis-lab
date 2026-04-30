// Single place for emoji asset extensions and globs so Node-side scan and stem parsing stay aligned.
// Vite `import.meta.glob` only accepts a string literal, so the theme glob in
// `theme/utils/guide-emoji-paths.ts` must be updated manually if this changes.

// glob with `cwd` = emojis root directory
export const GUIDE_EMOJI_FILES_GLOB = `**/*.{png,gif,webp}`;

// Strip extension for shortcode basename (matches glob extensions).
export const GUIDE_EMOJI_STEM_PATTERN = /\.(png|gif|webp)$/i;
