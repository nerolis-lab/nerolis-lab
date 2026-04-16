// Convert an author display name to an avatar filename
export function authorNameToAvatarSlug(displayName: string): string {
  return displayName
    .trim()
    .toLowerCase()
    .normalize('NFD') // Normalize the string to decompose accented characters into base + diacritic
    .replace(/\p{M}/gu, '') // Remove all unicode diacritical marks (accents) for consistency in avatar slugs
    .replace(/[^a-z0-9]+/g, '-') // Replace sequences of non-alphanumeric chars with a single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading or trailing hyphens from the slug
}

// find all available avatar pngs
const avatarPngModules = import.meta.glob<string>('../../../images/avatars/*.png', {
  eager: true,
  import: 'default',
  query: '?url'
});

// URL for `images/avatars/{slug}.png` matching this author name, or undefined if missing
export function getAvatarUrlForAuthorName(displayName: string): string | undefined {
  const normalizedAuthorSlug = authorNameToAvatarSlug(displayName);
  for (const [path, url] of Object.entries(avatarPngModules)) {
    const file = path.split('/').pop() ?? '';
    const slug = authorNameToAvatarSlug(file.replace(/\.png$/i, '')); // normalize the filename just in case
    if (slug === normalizedAuthorSlug) {
      return url;
    }
  }
  return undefined;
}

// Format a list of strings into prose ("a", "a and b", "a, b, and c")
export function formatList(vals: string[]): string {
  if (vals.length === 0) {
    return '';
  }
  if (vals.length === 1) {
    return vals[0];
  }
  if (vals.length === 2) {
    return `${vals[0]} and ${vals[1]}`;
  }
  return `${vals.slice(0, -1).join(', ')}, and ${vals[vals.length - 1]}`;
}
