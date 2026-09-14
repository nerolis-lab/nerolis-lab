import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ingredient } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

function pngNames(dir: string): string[] {
  return readdirSync(dir).filter((name) => name.toLowerCase().endsWith('.png'));
}

describe('pokemon emoji sync', () => {
  // mirrors the non-shiny filter in guides/scripts/sync-pokemon-emojis-from-frontend.mjs
  const FRONTEND_PORTRAITS_DIR = fileURLToPath(
    new URL('../../frontend/public/images/avatar/portrait', import.meta.url)
  );
  const GUIDES_POKEMON_EMOJIS_DIR = fileURLToPath(new URL('../images/emojis/pokemon', import.meta.url));

  it('has a guide emoji for every non-shiny Pokemon portrait in frontend, and no stale ones', () => {
    const source = new Set(pngNames(FRONTEND_PORTRAITS_DIR).filter((name) => !name.endsWith('_shiny.png')));
    const dest = new Set(pngNames(GUIDES_POKEMON_EMOJIS_DIR));

    const missing = [...source].filter((name) => !dest.has(name)).sort();
    const stale = [...dest].filter((name) => !source.has(name)).sort();

    expect(
      { missing, stale },
      missing.length > 0 || stale.length > 0
        ? 'guides/images/emojis/pokemon is out of sync with frontend portraits - run `npm run sync-pokemon-emojis`'
        : ''
    ).toEqual({ missing: [], stale: [] });
  });
});

describe('mainskill emoji coverage', () => {
  const FRONTEND_MAINSKILL_DIR = fileURLToPath(new URL('../../frontend/public/images/mainskill', import.meta.url));
  const GUIDES_MAINSKILL_EMOJIS_DIR = fileURLToPath(new URL('../images/emojis/mainskill', import.meta.url));

  // checking number only for this one because names intentionally differ for convenience for guides contributors
  it('has the same number of guide emojis as frontend mainskill icons', () => {
    const frontendCount = pngNames(FRONTEND_MAINSKILL_DIR).length;
    const guidesCount = pngNames(GUIDES_MAINSKILL_EMOJIS_DIR).length;

    expect(
      guidesCount,
      guidesCount !== frontendCount
        ? `guides/images/emojis/mainskill has ${guidesCount} icon(s) but frontend/public/images/mainskill has ${frontendCount} - copy the missing icon over`
        : ''
    ).toBe(frontendCount);
  });
});

describe('ingredient emoji coverage', () => {
  const GUIDES_INGREDIENT_EMOJIS_DIR = fileURLToPath(new URL('../images/emojis/ingredients', import.meta.url));

  it('has a guide emoji for every ingredient in sleepapi-common', () => {
    const existing = new Set(pngNames(GUIDES_INGREDIENT_EMOJIS_DIR));

    const missing = ingredient.INGREDIENTS.map((ing) => `${ing.name.toLowerCase()}.png`)
      .filter((name) => !existing.has(name))
      .sort();

    expect(
      missing,
      missing.length > 0
        ? 'guides/images/emojis/ingredients is missing emoji(s) for these sleepapi-common ingredients'
        : ''
    ).toEqual([]);
  });
});
