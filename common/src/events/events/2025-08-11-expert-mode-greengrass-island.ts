import type { ExpertModeSettings } from '../../types';
import { EventBuilder } from '../builders/event-builder';

function favoredBerries(input: ExpertModeSettings) {
  return [input.mainFavoriteBerry, ...input.subFavoriteBerries].map((b) => b.name);
}

export const event = EventBuilder.create<ExpertModeSettings>()
  .name('Expert Mode Event')
  .description('Dynamic event based on input parameters')

  .forTeam((input, member) => ({
    // Main berry gets frequency buff
    'pokemonWithIngredients.pokemon.frequency': (freq) => {
      if (member.pokemonWithIngredients.pokemon.berry.name === input.mainFavoriteBerry.name) {
        return freq * 0.9;
      }
      return freq;
    },

    // Skill level boost with max constraint
    'settings.skillLevel': (level) => {
      if (member.pokemonWithIngredients.pokemon.berry.name === input.mainFavoriteBerry.name) {
        const maxLevel = member.pokemonWithIngredients.pokemon.skill.maxLevel;
        return Math.min(level + 1, maxLevel);
      }
      return level;
    },

    // Skill percentage boost based on random bonus
    'pokemonWithIngredients.pokemon.skillPercentage': (percentage) => {
      const isFavoredBerry = favoredBerries(input).includes(member.pokemonWithIngredients.pokemon.berry.name);

      if (isFavoredBerry && input.randomBonus === 'skill') {
        return percentage * 1.25;
      }
      return percentage;
    }
  }))

  .forStrength((input) => ({
    'berries.breakdown.favored': (value) => {
      if (input.randomBonus === 'berry') {
        return value * 2.4;
      }
      return value;
    }
  }))

  .build();
