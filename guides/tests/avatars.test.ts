import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// enforce max on-disk size for author avatars
const AUTHOR_AVATAR_MAX_FILE_BYTES = 256 * 1024;

const avatarsDir = fileURLToPath(new URL('../images/avatars', import.meta.url));

function formatKiB(n: number): string {
  return `${(n / 1024).toFixed(1)} KiB`;
}

describe('avatar images', () => {
  it('each PNG under images/author-avatars is at most AUTHOR_AVATAR_MAX_FILE_BYTES', () => {
    const names = readdirSync(avatarsDir).filter((name) => /\.png$/i.test(name));
    const over: { file: string; bytes: number }[] = [];

    for (const name of names) {
      const bytes = statSync(join(avatarsDir, name)).size;
      if (bytes > AUTHOR_AVATAR_MAX_FILE_BYTES) {
        over.push({ file: name, bytes });
      }
    }

    expect(
      over,
      over.length > 0
        ? `Avatar file(s) exceed ${formatKiB(AUTHOR_AVATAR_MAX_FILE_BYTES)} (recompress or resize): ${over.map((o) => `${o.file} (${formatKiB(o.bytes)})`).join(', ')}`
        : ''
    ).toEqual([]);
  });
});
