import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

const GUIDES_DIR = process.cwd();

describe('Guides VitePress config', () => {
  it('has VitePress config with /guides base', () => {
    const configPath = join(GUIDES_DIR, '.vitepress', 'config.ts');
    expect(existsSync(configPath)).toBe(true);

    const configContent = readFileSync(configPath, 'utf-8');
    expect(configContent).toMatch(/base:\s*['"]\/guides\//);
  });

  it('has guides sidebar entries', () => {
    const configContent = readFileSync(join(GUIDES_DIR, '.vitepress', 'config.ts'), 'utf-8');
    expect(configContent).toMatch(/sidebar:\s*false/);
    expect(configContent).toMatch(/@':\s*frontendSrcPath/);
  });
});
