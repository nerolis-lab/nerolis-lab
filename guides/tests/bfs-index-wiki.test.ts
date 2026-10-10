import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildSidebar } from '../.vitepress/lib/sidebar';

describe('guide navigation', () => {
  it('excludes the standalone BFS infographic', () => {
    const sidebar = buildSidebar(resolve(import.meta.dirname, '../content'));
    expect(JSON.stringify(sidebar)).not.toContain('/tier-lists/raptor-bfs-index');
  });
});
