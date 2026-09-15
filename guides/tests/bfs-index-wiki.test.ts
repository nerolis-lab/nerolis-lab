import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COMPLETE_POKEDEX } from 'sleepapi-common';
import { buildSidebar } from '../.vitepress/lib/sidebar';
import { bfsPokemonPortrait } from '../.vitepress/theme/utils/bfs-index-portraits';

describe('BFS index wiki integration', () => {
  it('excludes shiny portraits from the asset import', () => {
    expect(bfsPokemonPortrait('SCEPTILE')).toBeTruthy();
    expect(bfsPokemonPortrait('SCEPTILE_shiny')).toBeUndefined();
  });

  it('lists the page in the automatically generated Tier Lists category', () => {
    const sidebar = buildSidebar(resolve(import.meta.dirname, '../content'));
    const tierLists = sidebar[0].items?.find((item) => item.text === 'Tier Lists');
    expect(tierLists?.items).toContainEqual({
      text: 'Raptor Berry Finding S Index',
      link: '/tier-lists/raptor-bfs-index'
    });
  });

  it('bundles a portrait for every eligible Pokémon, including unevolved and all specialists', () => {
    for (const pokemon of COMPLETE_POKEDEX.filter((pokemon) => pokemon.specialty !== 'berry')) {
      expect(bfsPokemonPortrait(pokemon.name), pokemon.name).toBeTruthy();
    }
  });
});
