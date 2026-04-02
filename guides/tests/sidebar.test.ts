import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import type { DefaultTheme } from 'vitepress';
import { describe, expect, it } from 'vitest';
import { buildSidebar } from '../.vitepress/sidebar';

type SidebarItem = DefaultTheme.SidebarItem;

// YAML front matter plus markdown body. Use `'empty'` for `---` / `---` with no keys.
function md(front: { title?: string; order?: number } | 'empty', body = '# x'): string {
  if (front === 'empty') {
    return ['---', '---', '', body].join('\n');
  }
  const lines = ['---'];
  if (front.title !== undefined) {
    lines.push(`title: ${front.title}`);
  }
  if (front.order !== undefined) {
    lines.push(`order: ${front.order}`);
  }
  lines.push('---', '', body);
  return lines.join('\n');
}

function writeGuide(root: string, relativePath: string, content: string | Buffer): void {
  const full = join(root, relativePath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
}

function guidesRootItems(sidebar: ReturnType<typeof buildSidebar>): SidebarItem[] {
  return sidebar[0].items ?? [];
}

function sidebarForDir(dir: string): SidebarItem[] {
  return guidesRootItems(buildSidebar(dir));
}

function sidebarTexts(items: SidebarItem[]): string[] {
  return items.map((item) => item.text ?? '');
}

function itemLink(item: SidebarItem | undefined): string | undefined {
  return item && 'link' in item && typeof item.link === 'string' ? item.link : undefined;
}

function findGroup(items: SidebarItem[], text: string): SidebarItem | undefined {
  return items.find((i) => i.text === text && 'items' in i && Array.isArray(i.items));
}

function findByText(items: SidebarItem[], text: string): SidebarItem | undefined {
  return items.find((i) => i.text === text);
}

// sidebar group with children; fails the test if missing or not a group
function groupChildren(items: SidebarItem[], groupText: string): SidebarItem[] {
  const group = findGroup(items, groupText);
  expect(group, `sidebar group "${groupText}"`).toBeDefined();
  if (!group || !('items' in group) || !group.items) {
    throw new Error(`expected group with items: "${groupText}"`);
  }
  return group.items;
}

// assert each label exists in `texts` and appears in the given left-to-right order
function expectLabelsInOrder(texts: string[], labels: string[]): void {
  for (const label of labels) {
    expect(texts, `sidebar should include "${label}"`).toContain(label);
  }
  for (let i = 0; i < labels.length - 1; i++) {
    expect(texts.indexOf(labels[i]), `order "${labels[i]}" before "${labels[i + 1]}"`).toBeLessThan(
      texts.indexOf(labels[i + 1])
    );
  }
}

function withTempDir(name: string, fn: (dir: string) => void): void {
  const dir = join(tmpdir(), `${name}-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  try {
    fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('buildSidebar', () => {
  it('includes root index and sibling pages with titles and links from front matter', () => {
    withTempDir('guides-sidebar-flat', (dir) => {
      writeGuide(dir, 'index.md', md({ title: 'Overview' }));
      writeGuide(dir, 'sleep-basics.md', md({ title: 'Sleep basics' }, '# Sleep'));

      const byLink = new Map(sidebarForDir(dir).map((i) => [itemLink(i) ?? '', i] as const));

      expect(byLink.get('/')?.text).toBe('Overview');
      expect(byLink.get('/sleep-basics')?.text).toBe('Sleep basics');
    });
  });

  it('nests directories: group uses index title and link; child pages appear under items', () => {
    withTempDir('guides-sidebar-nested', (dir) => {
      writeGuide(dir, 'index.md', md({ title: 'Home' }));
      writeGuide(dir, 'sleep-basics/index.md', md({ title: 'Sleep basics' }, '# Landing'));
      writeGuide(dir, 'sleep-basics/detail.md', md({ title: 'Detail page' }, '# D'));

      const items = sidebarForDir(dir);
      expect(itemLink(findByText(items, 'Sleep basics'))).toBe('/sleep-basics/');

      const children = groupChildren(items, 'Sleep basics');
      expect(children.map((c) => itemLink(c))).toContain('/sleep-basics/detail');
      expect(itemLink(children.find((c) => c.text === 'Detail page'))).toBe('/sleep-basics/detail');
    });
  });

  it('uses title-cased folder name when a folder has no index.md', () => {
    withTempDir('guides-sidebar-no-index', (dir) => {
      writeGuide(dir, 'index.md', md({ title: 'Home' }));
      writeGuide(dir, 'orphan-section/only.md', md({ title: 'Only child' }, '# O'));

      const items = sidebarForDir(dir);
      expect(itemLink(findGroup(items, 'Orphan Section'))).toBeUndefined();

      const [only] = groupChildren(items, 'Orphan Section');
      expect(only.text).toBe('Only child');
      expect(itemLink(only)).toBe('/orphan-section/only');
    });
  });

  it('sorts root pages by order, then by link when order ties', () => {
    withTempDir('guides-sidebar-order', (dir) => {
      writeGuide(dir, 'index.md', md({ title: 'Home' }));
      writeGuide(dir, 'z-page.md', md({ title: 'Z last tie', order: 1 }, '# Z'));
      writeGuide(dir, 'a-page.md', md({ title: 'A first tie', order: 1 }, '# A'));
      writeGuide(dir, 'mid.md', md({ title: 'Middle', order: 5 }, '# M'));

      expectLabelsInOrder(sidebarTexts(sidebarForDir(dir)), ['A first tie', 'Z last tie', 'Middle']);
    });
  });

  it('sorts nested folder pages by order inside the group', () => {
    withTempDir('guides-sidebar-nested-order', (dir) => {
      writeGuide(dir, 'index.md', md({ title: 'Home' }));
      writeGuide(dir, 'topic/index.md', md({ title: 'Topic' }, '# T'));
      writeGuide(dir, 'topic/b.md', md({ title: 'B', order: 20 }, '# B'));
      writeGuide(dir, 'topic/a.md', md({ title: 'A', order: 10 }, '# A'));

      expectLabelsInOrder(sidebarTexts(groupChildren(sidebarForDir(dir), 'Topic')), ['A', 'B']);
    });
  });

  it('sorts sibling groups by index order, then by segment name when orders tie', () => {
    withTempDir('guides-sidebar-group-order', (dir) => {
      writeGuide(dir, 'index.md', md({ title: 'Home' }));
      writeGuide(dir, 'zebra/index.md', md({ title: 'Zebra', order: 2 }, '# Z'));
      writeGuide(dir, 'alpha/index.md', md({ title: 'Alpha', order: 2 }, '# A'));

      expectLabelsInOrder(sidebarTexts(sidebarForDir(dir)), ['Alpha', 'Zebra']);
    });
  });

  it('uses min order from child pages when folder has no index (group sort key)', () => {
    withTempDir('guides-sidebar-min-order', (dir) => {
      writeGuide(dir, 'index.md', md({ title: 'Home' }));
      writeGuide(dir, 'late-group/x.md', md({ title: 'Late', order: 50 }, '# L'));
      writeGuide(dir, 'early-group/y.md', md({ title: 'Early', order: 5 }, '# E'));

      expectLabelsInOrder(sidebarTexts(sidebarForDir(dir)), ['Early Group', 'Late Group']);
    });
  });

  it('strips UTF-8 BOM so title in front matter is still read', () => {
    withTempDir('guides-sidebar-bom', (dir) => {
      writeGuide(dir, 'index.md', md({ title: 'Home' }));
      const body = md({ title: 'Bom page' }, '# B');
      const bom = Buffer.from([0xef, 0xbb, 0xbf]);
      writeGuide(dir, 'bom.md', Buffer.concat([bom, Buffer.from(body, 'utf8')]));

      const bomEntry = findByText(sidebarForDir(dir), 'Bom page');
      expect(itemLink(bomEntry)).toBe('/bom');
    });
  });

  it('falls back to title-cased folder slug when subfolder index has no title line', () => {
    withTempDir('guides-sidebar-index-fallback', (dir) => {
      writeGuide(dir, 'index.md', md({ title: 'Home' }));
      writeGuide(dir, 'sleep-basics/index.md', md('empty', '# No title key'));

      const entry = findByText(sidebarForDir(dir), 'Sleep Basics');
      expect(entry).toBeDefined();
      expect(itemLink(entry)).toBe('/sleep-basics/');
    });
  });

  it('title-cases file basename when a page has no front matter', () => {
    withTempDir('guides-sidebar-basename', (dir) => {
      writeGuide(dir, 'index.md', md({ title: 'Home' }));
      writeGuide(dir, 'my-long-page.md', '# No yaml\n');

      const page = sidebarForDir(dir).find((i) => itemLink(i) === '/my-long-page');
      expect(page?.text).toBe('My Long Page');
    });
  });
});
