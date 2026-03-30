import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

const GUIDES_DIR = process.cwd();

describe('Guides content structure', () => {
  it('has starter pages', () => {
    expect(existsSync(join(GUIDES_DIR, 'index.md'))).toBe(true);
    expect(existsSync(join(GUIDES_DIR, 'sleep-basics.md'))).toBe(true);
  });

  it('has links between starter pages', () => {
    const indexContent = readFileSync(join(GUIDES_DIR, 'index.md'), 'utf-8');
    const basicsContent = readFileSync(join(GUIDES_DIR, 'sleep-basics.md'), 'utf-8');

    expect(indexContent).toContain('./sleep-basics.md');
    expect(basicsContent).toContain('./index.md');
  });
});
