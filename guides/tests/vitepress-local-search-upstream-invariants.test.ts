import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const guidesDir = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));

function readVitepressNodeChunkPaths(): string[] {
  const nodeDir = join(guidesDir, 'node_modules/vitepress/dist/node');
  return readdirSync(nodeDir)
    .filter((f) => f.endsWith('.js'))
    .map((f) => join(nodeDir, f));
}

function vitepressNodeBundleIncludes(substring: string): boolean {
  return readVitepressNodeChunkPaths().some((path) => readFileSync(path, 'utf-8').includes(substring));
}

/**
 * Cheap guards that the installed VitePress still implements local search the way we forked.
 * Chunk file names are hashed; scanning all dist/node *.js avoids brittle single-file paths.
 */
describe('VitePress local search upstream (node bundle)', () => {
  it('still defines splitPageIntoSections in dist/node', () => {
    expect(vitepressNodeBundleIncludes('splitPageIntoSections')).toBe(true);
  });

  it('still wires _splitIntoSections for custom section splitters', () => {
    expect(vitepressNodeBundleIncludes('_splitIntoSections')).toBe(true);
  });
});
