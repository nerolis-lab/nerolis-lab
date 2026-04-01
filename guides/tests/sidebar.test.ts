import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildSidebar } from '../.vitepress/sidebar';

describe('buildSidebar', () => {
  it('includes index and nested pages with titles from frontmatter', () => {
    const dir = join(tmpdir(), `guides-sidebar-test-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.md'), ['---', 'title: Overview', '---', '', '# Hi'].join('\n'));
    writeFileSync(join(dir, 'sleep-basics.md'), ['---', 'title: Sleep basics', '---', '', '# Sleep'].join('\n'));

    try {
      const sidebar = buildSidebar(dir);
      expect(sidebar).toHaveLength(1);
      const group = sidebar[0];
      expect(group.text).toBe('Guides');
      expect(group.items).toBeDefined();
      const items = group.items ?? [];
      const links = items.map((i) => ('link' in i ? i.link : '')).filter(Boolean);
      expect(links).toContain('/');
      expect(links).toContain('/sleep-basics');
      const titles = items.map((i) => ('text' in i ? i.text : ''));
      expect(titles.some((t) => t.includes('Overview'))).toBe(true);
      expect(titles.some((t) => t.includes('Sleep basics'))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
