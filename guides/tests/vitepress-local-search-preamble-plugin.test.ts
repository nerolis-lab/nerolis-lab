/**
 * Regression tests for the Vite transform that patches VPLocalSearchBox.
 *
 * Failure usually means VitePress changed the local-search modal implementation: update
 * vitepress-local-search-preamble-plugin.ts (needle / replacement) to match the new source.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { vitepressLocalSearchPreamblePlugin } from '../.vitepress/lib/vitepress-local-search-preamble-plugin';

const guidesDir = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const vpLocalSearchBox = join(
  guidesDir,
  'node_modules/vitepress/dist/client/theme-default/components/VPLocalSearchBox.vue'
);

function runTransform(code: string, id: string): string | undefined | null {
  const plugin = vitepressLocalSearchPreamblePlugin();
  const transform = plugin.transform;
  if (typeof transform !== 'function') {
    throw new Error('expected plugin.transform');
  }
  // Vite passes a TransformPluginContext as `this`; this hook does not use it.
  const run = transform as (this: void, code: string, id: string) => string | undefined | null;
  return run(code, id);
}

describe('vitepressLocalSearchPreamblePlugin', () => {
  it('upstream VPLocalSearchBox still contains the excerpt-map hook we patch', () => {
    const raw = readFileSync(vpLocalSearchBox, 'utf-8');
    expect(raw).toContain("querySelectorAll('h1, h2, h3, h4, h5, h6')");
    expect(raw).toContain('headings.forEach((el) => {');
    expect(raw).toContain('map!.set(anchor, html)');
    expect(raw).toContain('app.unmount()');
  });

  it('injects fillLocalSearchPreambleMapFromPageRoot before app.unmount in VPLocalSearchBox.vue', () => {
    const raw = readFileSync(vpLocalSearchBox, 'utf-8');
    const out = runTransform(raw, vpLocalSearchBox);

    expect(typeof out).toBe('string');
    const transformed = out as string;

    expect(transformed).not.toBe(raw);
    expect(transformed.length).toBeGreaterThan(raw.length);

    const fillCalls = [...transformed.matchAll(/fillLocalSearchPreambleMapFromPageRoot\(div, map\)/g)];
    expect(fillCalls.length).toBe(1);

    expect(
      transformed.includes(
        "import { fillLocalSearchPreambleMapFromPageRoot } from '@guides/vitepress-local-search-preamble'"
      )
    ).toBe(true);

    // Ensures the call sits in the excerpt loop (after forEach close, before teardown), not elsewhere.
    expect(
      /\}\)\s*\n\s*fillLocalSearchPreambleMapFromPageRoot\(div, map\)\s*\n\s*app\.unmount\(\)/.test(transformed)
    ).toBe(true);
  });

  it('does not double-inject when run again on already patched source', () => {
    const raw = readFileSync(vpLocalSearchBox, 'utf-8');
    const once = runTransform(raw, vpLocalSearchBox) as string;
    const twice = runTransform(once, vpLocalSearchBox);
    expect(twice).toBeNull();
    expect([...once.matchAll(/fillLocalSearchPreambleMapFromPageRoot\(div, map\)/g)].length).toBe(1);
  });
});
