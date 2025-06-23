import type { IngredientSetSimple } from '../ingredient';
import type { PokemonWithIngredientsSimple } from '../pokemon/pokemon';
import type { TeamMemberSettings } from '../team';
import type { Tier } from './tier';

export interface RecipeContributionSimple {
  coverage: number;
  skillValue: number;
  score: number;
  recipe: string;
  team: PokemonWithIngredientsSimple[];
}
export interface PokemonWithRecipeContributions {
  pokemonWithSettings: {
    pokemon: string;
    ingredientList: IngredientSetSimple[];
    totalIngredients: Float32Array;
    critMultiplier: number;
    averageWeekdayPotSize: number;
    settings: TeamMemberSettings;
  };
  contributions: RecipeContributionSimple[];
}
export interface PokemonWithFinalContribution extends PokemonWithRecipeContributions {
  score: number;
}
export interface PokemonWithTiering extends PokemonWithFinalContribution {
  tier: Tier;
  diff?: number;
}
