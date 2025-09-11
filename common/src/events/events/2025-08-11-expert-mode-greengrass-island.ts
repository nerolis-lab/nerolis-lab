import { PathReference, type ExpertModeSettings } from '../../types';
import { EventBuilder } from '../builders';

function favoredBerries(input: ExpertModeSettings) {
  return [input.mainFavoriteBerry, ...input.subFavoriteBerries].map((b) => b.name);
}

export const event = EventBuilder<ExpertModeSettings>()
  .name('Expert Mode Event')
  .description('Dynamic event based on input parameters')

  // Main berry gets frequency buff - using modifier factory
  .addModifier((input) => ({
    type: 'PokemonInstance',
    leftValue: 'pokemon.frequency',
    operation: '*',
    rightValue: 0.9,
    conditions: [
      {
        leftValue: 'pokemon.berry.name',
        operation: '=',
        rightValue: input.mainFavoriteBerry.name
      }
    ]
  }))
  .addModifier((input) => ({
    type: 'PokemonInstance',
    leftValue: 'skillLevel',
    operation: '+',
    rightValue: {
      rightValue: 1,
      max: PathReference.to('pokemon.skill.maxLevel')
    },
    conditions: [
      {
        leftValue: 'pokemon.berry.name',
        operation: '=',
        rightValue: input.mainFavoriteBerry.name
      }
    ]
  }))
  // random site effect - only apply if randomBonus is 'skill'
  .addModifier((input) => ({
    type: 'PokemonInstance',
    leftValue: 'pokemon.skillPercentage',
    operation: '*',
    rightValue: 1.25,
    conditions: [
      {
        leftValue: 'pokemon.berry.name',
        operation: 'in',
        rightValue: favoredBerries(input)
      },
      {
        leftValue: input.randomBonus,
        operation: '=',
        rightValue: 'skill'
      }
    ]
  }))
  .addModifier((input) => ({
    type: 'MemberStrength',
    leftValue: 'berries.breakdown.favored',
    operation: '*',
    rightValue: 2.4,
    conditions: [
      {
        leftValue: input.randomBonus,
        operation: '=',
        rightValue: 'berries'
      }
    ]
  }))

  .build();
