import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { LOCAL_SEARCH_PREAMBLE_ANCHOR } from '../.vitepress/lib/local-search-preamble-constants';
import { splitIntoSectionsForLocalSearch } from '../.vitepress/lib/local-search-sections';

// Preamble expectations use LOCAL_SEARCH_PREAMBLE_ANCHOR so they track fill-local-search-preamble-map / constants.

/**
 * VitePress-style heading: visible text before `<a href="#id">` (required for the heading regex
 * to capture a non-empty title). `id` must match the fragment in `href`.
 */
function h(level: 1 | 2 | 3 | 4 | 5 | 6, id: string, visibleTitle: string): string {
  return `<h${level} id="${id}" tabindex="-1">${visibleTitle} <a class="header-anchor" href="#${id}" aria-hidden="true">#</a></h${level}>`;
}

function collect(file: string, html: string): { anchor: string; titles: string[]; text: string }[] {
  return [...splitIntoSectionsForLocalSearch(file, html)];
}

describe('splitIntoSectionsForLocalSearch', () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const d of dirs.splice(0)) {
      rmSync(d, { recursive: true, force: true });
    }
  });

  function writeMd(name: string, content: string): string {
    const dir = mkdtempSync(join(tmpdir(), 'guides-local-search-'));
    dirs.push(dir);
    const file = join(dir, name);
    writeFileSync(file, content, 'utf-8');
    return file;
  }

  it('yields a preamble section when body text appears before the first heading', () => {
    const file = writeMd(
      'page.md',
      `---
title: Sleep basics
---

x
`
    );
    const html = `<p>Replace this intro.</p>${h(2, 'see-also', 'See also')}<p>After heading</p>`;
    const sections = collect(file, html);

    expect(sections[0]).toEqual({
      anchor: LOCAL_SEARCH_PREAMBLE_ANCHOR,
      titles: ['Sleep basics'],
      text: 'Replace this intro.'
    });
    expect(sections[1]).toMatchObject({
      anchor: 'see-also',
      text: 'After heading'
    });
    expect(sections[1]?.titles).toEqual(['See also']);
  });

  it('does not yield a preamble when the first element is a heading', () => {
    const file = writeMd('page.md', '---\ntitle: Only\n---\n');
    const html = `${h(2, 'first', 'First')}<p>Only under heading</p>`;
    const sections = collect(file, html);

    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject({
      anchor: 'first',
      text: 'Only under heading'
    });
  });

  it('prefers title over fullTitle in frontmatter', () => {
    const file = writeMd(
      'page.md',
      `---
title: Short nav title
fullTitle: Long page heading for readers
---

x
`
    );
    const html = '<p>Preamble only.</p>';
    const sections = collect(file, html);

    expect(sections[0]?.titles).toEqual(['Short nav title']);
  });

  it('uses fullTitle when title is absent', () => {
    const file = writeMd(
      'page.md',
      `---
fullTitle: From fullTitle only
---

x
`
    );
    const html = '<p>Preamble.</p>';
    const sections = collect(file, html);

    expect(sections[0]?.titles).toEqual(['From fullTitle only']);
  });

  it('yields preamble with empty titles when frontmatter has no title or fullTitle', () => {
    const file = writeMd('page.md', '---\n---\n\nBody\n');
    const html = '<p>Orphan intro without title in fm.</p>';
    const sections = collect(file, html);

    expect(sections[0]).toEqual({
      anchor: LOCAL_SEARCH_PREAMBLE_ANCHOR,
      titles: [],
      text: 'Orphan intro without title in fm.'
    });
  });

  it('strips quoted title values from frontmatter', () => {
    const file = writeMd(
      'page.md',
      `---
title: 'Quoted Title'
---

x
`
    );
    const html = '<p>Hi</p>';
    const sections = collect(file, html);

    expect(sections[0]?.titles).toEqual(['Quoted Title']);
  });

  it('indexes multiple heading sections after the preamble', () => {
    const file = writeMd('page.md', '---\ntitle: T\n---\n');
    const html = `<p>Intro</p>${h(2, 'a', 'Alpha')}<p>Alpha body</p>${h(2, 'b', 'Beta')}<p>Last</p>`;
    const sections = collect(file, html);

    expect(sections).toHaveLength(3);
    expect(sections[0]?.text).toBe('Intro');
    expect(sections[1]).toMatchObject({ anchor: 'a', text: 'Alpha body' });
    expect(sections[2]).toMatchObject({ anchor: 'b', text: 'Last' });
  });

  it('yields only a preamble when html has no headings', () => {
    const file = writeMd('page.md', '---\ntitle: Home\n---\n');
    const html = '<p>Intro with no headings.</p>';
    const sections = collect(file, html);

    expect(sections).toEqual([
      {
        anchor: LOCAL_SEARCH_PREAMBLE_ANCHOR,
        titles: ['Home'],
        text: 'Intro with no headings.'
      }
    ]);
  });

  it('uses empty preamble titles when the markdown file path does not exist', () => {
    const ghost = join(tmpdir(), `missing-local-search-${Date.now()}-${Math.random().toString(36).slice(2)}.md`);
    const sections = collect(ghost, '<p>Preamble only.</p>');

    expect(sections[0]).toEqual({
      anchor: LOCAL_SEARCH_PREAMBLE_ANCHOR,
      titles: [],
      text: 'Preamble only.'
    });
  });

  it('parses an h1 section', () => {
    const file = writeMd('page.md', '---\ntitle: Doc\n---\n');
    const html = `${h(1, 'page-top', 'Page title')}<p>Under h1</p>`;
    const sections = collect(file, html);

    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject({
      anchor: 'page-top',
      text: 'Under h1',
      titles: ['Page title']
    });
  });

  it('builds breadcrumb titles for nested h2 then h3', () => {
    const file = writeMd('page.md', '---\ntitle: T\n---\n');
    const html = `<p>I</p>${h(2, 'sec', 'Section')}<p>mid</p>${h(3, 'sub', 'Sub')}<p>deep</p>`;
    const sections = collect(file, html);

    expect(sections).toHaveLength(3);
    expect(sections[0]?.text).toBe('I');
    expect(sections[1]).toMatchObject({ anchor: 'sec', titles: ['Section'], text: 'mid' });
    expect(sections[2]).toMatchObject({
      anchor: 'sub',
      titles: ['Section', 'Sub'],
      text: 'deep'
    });
  });
});
