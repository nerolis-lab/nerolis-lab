import type { Plugin } from 'vite';

/**
 * Patches VitePress default-theme VPLocalSearchBox at build time so detailed local-search
 * results can show excerpts for LOCAL_SEARCH_PREAMBLE_ANCHOR (see local-search-preamble-constants).
 *
 * Prefer this over vendoring the full ~800-line component: the diff is a single call plus import,
 * but it depends on exact source text in node_modules (see needle / replacement). When upgrading
 * VitePress, if transform returns null or tests fail, open VPLocalSearchBox.vue and re-align
 * the strings with the watchDebounced block that builds the heading excerpt map.
 */
export function vitepressLocalSearchPreamblePlugin(): Plugin {
  const marker = 'fillLocalSearchPreambleMapFromPageRoot';

  // Multi-line slice of upstream script: ends where MiniSearch results get post-processed,
  // so the injected call runs after map is filled from headings but before the Vue app is torn down.
  const needle = [
    '        })',
    '        app.unmount()',
    '      }',
    '      if (canceled) return',
    '    }',
    '',
    '    const terms = new Set<string>()'
  ].join('\n');

  const replacement = [
    '        })',
    '        fillLocalSearchPreambleMapFromPageRoot(div, map)',
    '        app.unmount()',
    '      }',
    '      if (canceled) return',
    '    }',
    '',
    '    const terms = new Set<string>()'
  ].join('\n');

  return {
    name: 'guides:vitepress-local-search-preamble',
    // Run before @vitejs/plugin-vue so we edit the raw SFC script.
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (!normalized.includes('vitepress/dist/client/theme-default/components/VPLocalSearchBox.vue')) {
        return null;
      }
      // marker present => already patched or unrelated edit; map!.set is the stock excerpt hook.
      if (!code.includes('map!.set(anchor, html)') || code.includes(marker)) {
        return null;
      }

      let out = code.replace(
        '<script lang="ts" setup>',
        `<script lang="ts" setup>
import { fillLocalSearchPreambleMapFromPageRoot } from '@guides/vitepress-local-search-preamble'`
      );

      if (!out.includes(needle)) {
        return null;
      }

      // Single replace: needle must stay unique in the file.
      out = out.replace(needle, replacement);

      return out;
    }
  };
}
