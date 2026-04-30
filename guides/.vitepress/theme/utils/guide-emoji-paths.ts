import { emojisRootRelativeFromResolvedPath, parseGuideEmojiRelativeFilePath } from '../../lib/guide-emoji-path-parse';

// import.meta.glob must use a string literal; keep extensions aligned with guide-emoji-constants.ts
const resolvedImageUrlByGlobKey = import.meta.glob<string>('../../../images/emojis/**/*.{png,gif,webp}', {
  eager: true,
  import: 'default',
  query: '?url'
});

function tryBuildEmojiCatalogEntry(globModuleKey: string): { name: string; category: string; url: string } | undefined {
  const normalized = globModuleKey.replace(/\\/g, '/');
  const relativeUnderRoot = emojisRootRelativeFromResolvedPath(normalized);
  if (relativeUnderRoot === undefined) {
    return undefined;
  }
  const parsed = parseGuideEmojiRelativeFilePath(relativeUnderRoot);
  if (parsed === undefined) {
    return undefined;
  }
  const url = resolvedImageUrlByGlobKey[globModuleKey];
  if (url === undefined) {
    return undefined;
  }
  return { name: parsed.name, category: parsed.category, url };
}

const sortedEmojiCatalogEntries = Object.keys(resolvedImageUrlByGlobKey)
  .map(tryBuildEmojiCatalogEntry)
  .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined)
  .sort((a, b) => `${a.category}/${a.name}`.localeCompare(`${b.category}/${b.name}`));

const resolvedUrlByShortcodeName: ReadonlyMap<string, string> = new Map(
  sortedEmojiCatalogEntries.map((entry) => [entry.name, entry.url])
);

export function resolveGuideEmojiUrl(shortcodeName: string): string | undefined {
  return resolvedUrlByShortcodeName.get(shortcodeName);
}

export interface GuideEmojiCatalogItem {
  name: string;
  url: string;
}

export function getGuideEmojiCatalogByCategory(): { category: string; items: GuideEmojiCatalogItem[] }[] {
  const grouped = new Map<string, GuideEmojiCatalogItem[]>();
  for (const entry of sortedEmojiCatalogEntries) {
    const list = grouped.get(entry.category) ?? [];
    list.push({ name: entry.name, url: entry.url });
    grouped.set(entry.category, list);
  }
  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, items]) => ({ category, items }));
}
