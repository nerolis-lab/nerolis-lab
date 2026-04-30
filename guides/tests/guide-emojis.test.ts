import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  emojisRootRelativeFromResolvedPath,
  parseGuideEmojiRelativeFilePath
} from '../.vitepress/lib/guide-emoji-path-parse';
import { buildGuideEmojiReplacerRegex, loadGuideEmojisByName, quoteRegexToken } from '../.vitepress/lib/guide-emojis';

function writePng(root: string, relativePath: string): void {
  const full = join(root, relativePath);
  mkdirSync(join(full, '..'), { recursive: true });
  writeFileSync(full, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
}

describe('parseGuideEmojiRelativeFilePath', () => {
  it('parses category/file under the emojis root', () => {
    expect(parseGuideEmojiRelativeFilePath('berries/belue.png')).toEqual({
      category: 'berries',
      file: 'belue.png',
      name: 'belue',
      relativeFilePath: 'berries/belue.png'
    });
  });

  it('returns undefined for files directly under the emojis root', () => {
    expect(parseGuideEmojiRelativeFilePath('belue.png')).toBeUndefined();
  });

  it('uses the parent folder of the file as category when nested', () => {
    expect(parseGuideEmojiRelativeFilePath('berries/nested/belue.png')).toEqual({
      category: 'nested',
      file: 'belue.png',
      name: 'belue',
      relativeFilePath: 'berries/nested/belue.png'
    });
  });
});

describe('emojisRootRelativeFromResolvedPath', () => {
  it('strips the prefix before images/emojis/', () => {
    expect(emojisRootRelativeFromResolvedPath('/repo/guides/images/emojis/berries/x.png')).toBe('berries/x.png');
  });

  it('handles Windows separators after normalization', () => {
    expect(emojisRootRelativeFromResolvedPath('C:\\repo\\guides\\images\\emojis\\emotes\\sad.png')).toBe(
      'emotes/sad.png'
    );
  });
});

describe('loadGuideEmojisByName', () => {
  it('returns empty map when the emojis directory is missing', () => {
    const root = join(tmpdir(), `guide-emoji-missing-${Date.now()}`);
    const byName = loadGuideEmojisByName(root);
    expect(byName.size).toBe(0);
  });

  it('maps basenames to POSIX paths and detects duplicates', () => {
    const root = join(tmpdir(), `guide-emoji-${Date.now()}`);
    mkdirSync(join(root, 'berries'), { recursive: true });
    mkdirSync(join(root, 'emotes'), { recursive: true });
    writePng(root, join('berries', 'belue.png'));
    writePng(root, join('emotes', 'sad.png'));

    const byName = loadGuideEmojisByName(root);
    expect(byName.size).toBe(2);
    expect(byName.get('belue')?.relativeFilePath).toBe('berries/belue.png');
    expect(byName.get('sad')?.relativeFilePath).toBe('emotes/sad.png');
  });

  it('throws when two files share the same basename', () => {
    const root = join(tmpdir(), `guide-emoji-dup-${Date.now()}`);
    writePng(root, join('a', 'x.png'));
    writePng(root, join('b', 'x.png'));
    expect(() => loadGuideEmojisByName(root)).toThrow(/Duplicate guide emoji basename/);
  });
});

describe('buildGuideEmojiReplacerRegex', () => {
  it('never matches when there are no names', () => {
    const re = buildGuideEmojiReplacerRegex([]);
    expect(re.test(':foo:')).toBe(false);
  });

  it('replaces longest matching name first', () => {
    const re = buildGuideEmojiReplacerRegex(new Set(['a', 'ab']));
    expect(':ab:'.replace(re, (_, name) => name)).toBe('ab');
    expect(':a: then :ab:'.replace(re, (_, name) => `«${name}»`)).toBe('«a» then «ab»');
  });

  it('escapes regex metacharacters in names', () => {
    const name = 'foo-bar';
    const re = buildGuideEmojiReplacerRegex([name]);
    const m = re.exec(`:${name}:`);
    expect(m?.[1]).toBe(name);
  });
});

describe('quoteRegexToken', () => {
  it('escapes dots and other pattern syntax', () => {
    expect(quoteRegexToken('a.b')).toBe('a\\.b');
  });
});
