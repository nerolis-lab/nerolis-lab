import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { MarkdownIt as MarkdownItInstance } from 'markdown-it';
import * as vitepressNode from 'vitepress';
import { beforeAll, describe, expect, it } from 'vitest';
import { loadGuideEmojisByName } from '../.vitepress/lib/guide-emojis';
import { markdownItGuideEmojis } from '../.vitepress/lib/markdown-it-guide-emojis';

// vitepress build's own dead-link check strips the #anchor before validating, so a renamed/removed heading still "passes" there; this test catches that gap.

// createMarkdownRenderer is a real runtime export missing from vitepress's public .d.ts, hence the local type instead of `any`.
interface MarkdownRenderer {
  renderAsync(src: string, env: Record<string, unknown>): Promise<string>;
}
type CreateMarkdownRenderer = (
  srcDir: string,
  options?: Record<string, unknown>,
  base?: string
) => Promise<MarkdownRenderer>;
const createMarkdownRenderer = (vitepressNode as unknown as { createMarkdownRenderer: CreateMarkdownRenderer })
  .createMarkdownRenderer;

const guidesDir = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const contentDir = join(guidesDir, 'content');
const emojisDir = join(guidesDir, 'images/emojis');

function listMarkdownFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listMarkdownFiles(full));
    } else if (entry.name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

interface AnchorLink {
  sourceFile: string;
  line: number;
  rawTarget: string;
}

// Only targets with `#` are in scope; plain links are already covered by vitepress's own dead-link check.
const ANCHOR_LINK_RE = /]\(([^)\s]+#[^)\s]+)\)/g;

// Any URI scheme (http:, mailto:, etc.) - external links are out of scope here.
const EXTERNAL_LINK_RE = /^[a-z][a-z0-9+.-]*:/i;

function findAnchorLinks(file: string): AnchorLink[] {
  const lines = readFileSync(file, 'utf-8').split('\n');
  const links: AnchorLink[] = [];
  lines.forEach((lineText, i) => {
    for (const match of lineText.matchAll(ANCHOR_LINK_RE)) {
      const rawTarget = match[1] ?? '';
      if (!EXTERNAL_LINK_RE.test(rawTarget)) {
        links.push({ sourceFile: file, line: i + 1, rawTarget });
      }
    }
  });
  return links;
}

/** Resolves the path portion of a link (before `#`) to an absolute .md file, or undefined. */
function resolveTargetFile(sourceFile: string, pathPart: string): string | undefined {
  if (pathPart === '') {
    return sourceFile;
  }

  let target = pathPart.replace(/\.(md|html)$/, '');
  if (target.endsWith('/')) {
    target += 'index';
  }

  const base = target.startsWith('/') ? join(contentDir, target.slice(1)) : resolve(dirname(sourceFile), target);
  const candidate = `${base}.md`;
  try {
    return statSync(candidate).isFile() ? candidate : undefined;
  } catch {
    return undefined;
  }
}

describe('cross-guide anchor links', () => {
  let md: MarkdownRenderer;
  const headingIdsByFile = new Map<string, Set<string>>();

  beforeAll(async () => {
    const guideEmojisByName = loadGuideEmojisByName(emojisDir);
    md = await createMarkdownRenderer(
      contentDir,
      { config: (mdInstance: MarkdownItInstance) => markdownItGuideEmojis(mdInstance, { emojis: guideEmojisByName }) },
      '/guides/'
    );
  });

  async function headingIdsFor(file: string): Promise<Set<string>> {
    const cached = headingIdsByFile.get(file);
    if (cached) {
      return cached;
    }
    const src = readFileSync(file, 'utf-8');
    const html = await md.renderAsync(src, {
      path: file,
      relativePath: relative(contentDir, file),
      cleanUrls: false
    });
    const ids = new Set([...html.matchAll(/<h[1-6][^>]*\sid="([^"]+)"/g)].map((m) => m[1] ?? ''));
    headingIdsByFile.set(file, ids);
    return ids;
  }

  const allLinks = listMarkdownFiles(contentDir).flatMap(findAnchorLinks);

  it('found at least one anchor link to check (sanity check that scanning still works)', () => {
    expect(allLinks.length).toBeGreaterThan(0);
  });

  it.each(allLinks)(
    '$sourceFile:$line -> "$rawTarget" points at a real heading',
    async ({ sourceFile, line, rawTarget }) => {
      const hashIndex = rawTarget.indexOf('#');
      const pathPart = rawTarget.slice(0, hashIndex);
      const anchor = rawTarget.slice(hashIndex + 1);

      const targetFile = resolveTargetFile(sourceFile, pathPart);
      expect(
        targetFile,
        `${sourceFile}:${line} links to "${rawTarget}", but "${pathPart || '(same page)'}" does not resolve to an existing guide`
      ).toBeDefined();

      const ids = await headingIdsFor(targetFile as string);
      expect(
        ids.has(anchor),
        `${sourceFile}:${line} links to #${anchor} in ${targetFile}, but no heading with that id exists there anymore (ids: ${[...ids].join(', ')})`
      ).toBe(true);
    }
  );
});
