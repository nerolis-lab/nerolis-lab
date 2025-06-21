import type { Pokemon } from '../../../types';
import { COMPLETE_POKEDEX } from '../../../types';
import { INGREDIENTS } from '../../../types/ingredient/ingredients';
import { NATURES } from '../../../types/nature';
import type { PokemonWithTiering, Tier, TierlistSettings } from '../../../types/tierlist';

const TIERS: Tier[] = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];

export function tierlistSettings(attrs?: Partial<TierlistSettings>): TierlistSettings {
  return {
    camp: false,
    level: 50,
    ...attrs
  };
}

export function pokemonWithTiering(attrs?: Partial<PokemonWithTiering>): PokemonWithTiering {
  return {
    pokemonWithSettings: {
      pokemon: 'PIKACHU',
      ingredientList: [
        {
          amount: 1,
          name: 'FANCY_APPLE'
        }
      ],
      totalIngredients: new Float32Array([1, 0, 0]),
      critMultiplier: 1.2,
      averageWeekdayPotSize: 100,
      settings: {
        level: 50,
        nature: 'ADAMANT',
        subskills: [],
        skillLevel: 6,
        carrySize: 10,
        ribbon: 0,
        externalId: 'pikachu-1'
      }
    },
    contributions: [],
    score: 1000,
    tier: 'S',
    ...attrs
  };
}

export function multiplePokemonWithTiering(count: number = 4): PokemonWithTiering[] {
  const results: PokemonWithTiering[] = [];

  for (let i = 0; i < count; i++) {
    const pokemon: Pokemon = COMPLETE_POKEDEX[i % COMPLETE_POKEDEX.length];
    const ingredient = INGREDIENTS[i % INGREDIENTS.length];
    const nature = NATURES[i % NATURES.length];
    const tier = TIERS[Math.floor(i / 2) % TIERS.length]; // Distribute across tiers

    // Generate varied scores with some overlap for testing deduplication
    const baseScore = 1500 - i * 200 + Math.floor(i / 3) * 50;
    const level = 30 + i * 10;
    const critMultiplier = 1.1 + i * 0.1;

    results.push(
      pokemonWithTiering({
        pokemonWithSettings: {
          pokemon: pokemon.name,
          ingredientList: [
            {
              amount: 1 + Math.floor(i / 2),
              name: ingredient.name
            }
          ],
          totalIngredients: new Float32Array([1 + i, 0, 0]),
          critMultiplier,
          averageWeekdayPotSize: 80 + i * 20,
          settings: {
            level,
            nature: nature.name,
            subskills: [],
            skillLevel: 4 + Math.floor(i / 2),
            carrySize: 8 + i,
            ribbon: 0,
            externalId: `${pokemon.name.toLowerCase()}-${i + 1}`
          }
        },
        score: baseScore,
        tier
      })
    );
  }

  return results;
}
