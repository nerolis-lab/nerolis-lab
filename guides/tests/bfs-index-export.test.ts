import { describe, expect, it } from 'vitest';
import { bfsExportFilename, bfsExportLayout, bfsExportParameters } from '../.vitepress/theme/utils/bfs-index-export';
import { buildBfsIndexRows } from '../.vitepress/lib/bfs-index-service';

describe('BFS PNG layout', () => {
  it.each([
    [1, 10],
    [10, 10],
    [15, 15],
    [20, 20],
    [21, 20],
    [300, 20]
  ])('sizes a longest row of %s Pokémon to %s columns', (count, columns) => {
    const [row] = buildBfsIndexRows();
    const rows = [
      { ...row, entries: Array(count).fill(row.entries[0]) },
      { min: 0, max: 0.5, entries: [] }
    ];
    const layout = bfsExportLayout(rows);
    expect(layout.columns).toBe(columns);
    expect(layout.width).toBe(160 + columns * 80);
    expect(layout.height).toBe(layout.headerHeight + 60 + (Math.ceil(count / columns) + 1) * 100);
  });

  it('omits default settings and collapses their header space', () => {
    const defaults = { rows: [], includeUnevolved: false, ingredientFinderM: true, search: '  ' };
    expect(bfsExportParameters(defaults)).toEqual([]);
    expect(bfsExportParameters({ ...defaults, includeUnevolved: true })).toEqual(['Unevolved Pokémon: included']);
    expect(bfsExportParameters({ ...defaults, ingredientFinderM: false })).toEqual(['Ingredient Finder M: off']);
    const lines = bfsExportParameters({
      ...defaults,
      includeUnevolved: true,
      ingredientFinderM: false,
      search: ' mew '
    });
    expect(lines).toEqual(['Unevolved Pokémon: included · Ingredient Finder M: off', 'Search: mew']);
    expect(bfsExportLayout([], lines.length).height - bfsExportLayout([]).height).toBe(52);
  });
});

describe('BFS PNG filename', () => {
  const defaults = { rows: [], includeUnevolved: false, ingredientFinderM: true, search: '' };

  it('omits default parameters', () => {
    expect(bfsExportFilename(defaults)).toBe('raptor-berry-finding-s-index.png');
    expect(bfsExportFilename({ ...defaults, search: '   ' })).toBe('raptor-berry-finding-s-index.png');
  });

  it('joins non-default parameters with single underscores', () => {
    expect(
      bfsExportFilename({ ...defaults, includeUnevolved: true, ingredientFinderM: false, search: ' Pikachu ' })
    ).toBe('raptor-berry-finding-s-index_include-unevolved_ignore-ifm_search-pikachu.png');
    expect(bfsExportFilename({ ...defaults, ingredientFinderM: false })).toBe(
      'raptor-berry-finding-s-index_ignore-ifm.png'
    );
  });

  it('sanitizes search terms and limits filename length', () => {
    expect(bfsExportFilename({ ...defaults, search: ' Flabébé / Mr. Mime? ' })).toBe(
      'raptor-berry-finding-s-index_search-flabebe-mr-mime.png'
    );
    expect(bfsExportFilename({ ...defaults, search: '../?*' })).toBe(
      'raptor-berry-finding-s-index_search-filtered.png'
    );
    expect(bfsExportFilename({ ...defaults, search: 'a'.repeat(300) }).length).toBeLessThan(150);
  });
});
