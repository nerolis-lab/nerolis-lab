import { GUIDE_EMOJI_STEM_PATTERN } from './guide-emoji-constants';

export interface ParsedGuideEmojiRelativePath {
  category: string;
  file: string; // e.g. belue.png
  name: string; // basename without extension (shortcode key)
  relativeFilePath: string; // same as input when valid: category/file
}

// Parses a path relative to guides/images/emojis/ (e.g. berries/belue.png)
// Requires one subfolder + a file with a guide-emoji extension
export function parseGuideEmojiRelativeFilePath(
  posixRelativeUnderRoot: string
): ParsedGuideEmojiRelativePath | undefined {
  const normalized = posixRelativeUnderRoot.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized) {
    return undefined;
  }
  const segments = normalized.split('/');
  if (segments.length < 2) {
    return undefined;
  }
  const file = segments[segments.length - 1];
  if (!GUIDE_EMOJI_STEM_PATTERN.test(file)) {
    return undefined;
  }
  const category = segments[segments.length - 2];
  const name = file.replace(GUIDE_EMOJI_STEM_PATTERN, '');
  if (!name) {
    return undefined;
  }
  return {
    category,
    file,
    name,
    relativeFilePath: normalized
  };
}

// From a resolved module path (POSIX or Windows), returns category/file.ext when the path contains images/emojis/
export function emojisRootRelativeFromResolvedPath(resolvedPath: string): string | undefined {
  const normalized = resolvedPath.replace(/\\/g, '/');
  const m = normalized.match(/\/images\/emojis\/(.+)$/i);
  return m ? m[1] : undefined;
}
