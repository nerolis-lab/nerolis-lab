import { globSync } from 'glob';
import { existsSync } from 'node:fs';
import { GUIDE_EMOJI_FILES_GLOB } from './guide-emoji-constants';
import { parseGuideEmojiRelativeFilePath } from './guide-emoji-path-parse';

export interface GuideEmojiEntry {
  name: string;
  relativeFilePath: string; // e.g. berries/belue.png
  category: string;
}

export function loadGuideEmojisByName(emojisRootDir: string): ReadonlyMap<string, GuideEmojiEntry> {
  if (!existsSync(emojisRootDir)) {
    return new Map();
  }

  const paths = globSync(GUIDE_EMOJI_FILES_GLOB, {
    cwd: emojisRootDir,
    nodir: true,
    posix: true
  }).sort((a, b) => a.localeCompare(b));

  const byName = new Map<string, GuideEmojiEntry>();
  const collisions = new Set<string>();

  for (const posixPath of paths) {
    const parsed = parseGuideEmojiRelativeFilePath(posixPath);
    if (!parsed) {
      continue;
    }
    const entry: GuideEmojiEntry = {
      name: parsed.name,
      relativeFilePath: parsed.relativeFilePath,
      category: parsed.category
    };
    if (byName.has(parsed.name)) {
      collisions.add(parsed.name);
    }
    byName.set(parsed.name, entry);
  }

  if (collisions.size > 0) {
    throw new Error(`Duplicate guide emoji basename(s): ${[...collisions].sort().join(', ')}`);
  }

  return byName;
}

export function quoteRegexToken(s: string): string {
  return s.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&');
}

export function buildGuideEmojiReplacerRegex(names: Iterable<string>): RegExp {
  const sorted = [...names].sort((a, b) => b.length - a.length);
  if (sorted.length === 0) {
    return /$^/;
  }
  const inner = sorted.map(quoteRegexToken).join('|');
  return new RegExp(`:(${inner}):`, 'g');
}
