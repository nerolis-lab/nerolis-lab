import type { ExpertModeSettings, TeamMemberExt } from '../../types';
import { EventBuilder } from '../builders/event-builder';

function isMainBerry(input: ExpertModeSettings, member: TeamMemberExt) {
  return input.mainFavoriteBerry.name === member.pokemonWithIngredients.pokemon.berry.name;
}

function isFavoredBerry(input: ExpertModeSettings, member: TeamMemberExt) {
  const berryName = member.pokemonWithIngredients.pokemon.berry.name;
  return input.mainFavoriteBerry.name === berryName || input.subFavoriteBerries.some((b) => b.name === berryName);
}

export const event = EventBuilder.create<ExpertModeSettings>()
  .name('Expert Mode Event')
  .description('Dynamic event based on input parameters')

  .forTeam((input, member) => ({
    'pokemonWithIngredients.pokemon.frequency': (freq) => {
      if (isMainBerry(input, member)) {
        return freq * 0.9;
      }
      if (isFavoredBerry(input, member)) {
        return freq;
      }
      return freq * 1.15;
    },

    'settings.skillLevel': (level) => {
      if (member.pokemonWithIngredients.pokemon.berry.name === input.mainFavoriteBerry.name) {
        const maxLevel = member.pokemonWithIngredients.pokemon.skill.maxLevel;
        return Math.min(level + 1, maxLevel);
      }
      return level;
    },

    'pokemonWithIngredients.pokemon.skillPercentage': (percentage) => {
      if (isFavoredBerry(input, member) && input.randomBonus === 'skill') {
        return percentage * 1.25;
      }
      return percentage;
    }
  }))

  // Berry bonus: increase favored-berry multiplier from 2x to 2.4x. Since
  // `breakdown.favored` holds only the +1x bonus above base for favored berries,
  // multiplying it by 1.4 raises the total from base+base (=2x) to base+base*1.4 (=2.4x).
  .forStrength((input) => ({
    'berries.breakdown.favored': (value) => {
      if (input.randomBonus === 'berry') {
        return value * 1.4;
      }
      return value;
    }
  }))

  .build();
