import { describe, expect, it } from 'vitest';
import { authorNameToAvatarSlug, formatList } from '../.vitepress/theme/utils/format-utils';

describe('authorNameToAvatarSlug', () => {
  it('lowercases and hyphenates for avatar filenames', () => {
    expect(authorNameToAvatarSlug('Pat')).toBe('pat');
    expect(authorNameToAvatarSlug('Jane Q. Contributor')).toBe('jane-q-contributor');
    expect(authorNameToAvatarSlug('Example Author One')).toBe('example-author-one');
  });

  it('strips combining marks from accented letters', () => {
    expect(authorNameToAvatarSlug('José')).toBe('jose');
  });
});

describe('formatList', () => {
  it('returns empty string when there are no values', () => {
    expect(formatList([])).toBe('');
  });

  it('formats a single value', () => {
    expect(formatList(['Pat'])).toBe('Pat');
  });

  it('formats two values with "and"', () => {
    expect(formatList(['Pat', 'Sam'])).toBe('Pat and Sam');
  });

  it('formats three or more values with an Oxford comma', () => {
    expect(formatList(['Pat', 'Sam', 'Alex'])).toBe('Pat, Sam, and Alex');
    expect(formatList(['a', 'b', 'c', 'd'])).toBe('a, b, c, and d');
  });

  it('does not trim or split strings (caller supplies final labels)', () => {
    expect(formatList(['  Pat  ', '  Sam  '])).toBe('  Pat   and   Sam  ');
  });

  it('handles multi-word labels', () => {
    expect(formatList(['Example Author One', 'Example Author Two'])).toBe('Example Author One and Example Author Two');
  });
});
