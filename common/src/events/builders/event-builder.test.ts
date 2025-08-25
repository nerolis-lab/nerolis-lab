import { describe, expect, it } from 'vitest';
import type { ExpertModeSettings } from '../../types';
import { MAGO, ORAN, SITRUS } from '../../types/berry/berries';
import { PathReference } from '../../types/modifier/path-reference';
import { EventBuilder } from './event-builder';

describe('EventBuilder', () => {
  it('should create an event', () => {
    const event = EventBuilder().name('Test Event').description('A test event').build();
    expect(event).toBeDefined();
  });

  it('should create an event with a modifier', () => {
    const event = EventBuilder()
      .name('Test Event')
      .description('A test event')
      .addModifier({ type: 'PokemonInstance', leftValue: 'pokemon.frequency', operation: '*', rightValue: 0.9 })
      .build();
    expect(event).toBeDefined();
  });

  it('should create an event with a modifier with a condition', () => {
    const event = EventBuilder()
      .name('Test Event')
      .description('A test event')
      .addModifier({
        type: 'PokemonInstance',
        leftValue: 'pokemon.frequency',
        operation: '*',
        rightValue: 0.9,
        conditions: [{ leftValue: 'pokemon.specialty', operation: '=', rightValue: 'berry' }]
      })
      .build();
    expect(event).toBeDefined();
  });

  it('should have proper type safety for modifiers', () => {
    const event = EventBuilder()
      .name('Test Event')
      .description('A test event')
      .addModifier({ type: 'PokemonInstance', leftValue: 'pokemon.frequency', operation: '*', rightValue: 0.9 })
      .addModifier({ type: 'PokemonInstance', leftValue: 'pokemon.frequency', operation: '*', rightValue: 0.9 })
      // @ts-expect-error - rightValue should be a number
      .addModifier({ type: 'PokemonInstance', leftValue: 'pokemon.frequency', operation: '*', rightValue: '0.9' })
      // @ts-expect-error - invalid leftValue
      .addModifier({ type: 'PokemonInstance', leftValue: 'pokemon.slkfjklsd', operation: '*', rightValue: 0.9 })
      .addModifier({
        type: 'PokemonInstance',
        leftValue: 'pokemon.frequency',
        operation: '*',
        rightValue: 0.9,
        conditions: [{ leftValue: 'pokemon.berry.name', operation: '=', rightValue: 'MAGO' }]
      })
      .addModifier({
        type: 'PokemonInstance',
        leftValue: 'pokemon.frequency',
        operation: '*',
        rightValue: 0.9,
        conditions: [{ leftValue: 'pokemon.berry.name', operation: '=', rightValue: 'INVALID' }]
      })
      .build();
    expect(event).toBeDefined();
    expect(event.modifiers).toHaveLength(6);
    expect(event.modifiers[0].type).toBe('PokemonInstance');
    expect(event.modifiers[1].type).toBe('PokemonInstance');

    expect(event).toMatchSnapshot();
  });

  it('should create realistic Greengrass Island expert mode identifier', () => {
    const expertModeEvent = EventBuilder<ExpertModeSettings>()
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
        rightValue: 1,
        conditions: [
          {
            leftValue: 'pokemon.berry.name',
            operation: '=',
            rightValue: input.mainFavoriteBerry.name
          },
          {
            leftValue: 'pokemon.skillLevel',
            operation: '<',
            rightValue: PathReference.to('pokemon.skill.maxLevel')
          }
        ]
      }))
      // random site effect
      .addModifier((input) => ({
        type: 'PokemonInstance',
        leftValue: 'pokemon.skillPercentage',
        operation: '*',
        rightValue: 1.25,
        conditions: [
          {
            leftValue: 'pokemon.berry.name',
            operation: 'in',
            rightValue: [input.mainFavoriteBerry.name, ...input.subFavoriteBerries.map((b) => b.name)]
          }
        ]
      }))
      .build();

    const settings: ExpertModeSettings = {
      mainFavoriteBerry: MAGO,
      subFavoriteBerries: [ORAN, SITRUS],
      randomBonus: 'skill'
    };

    const event = expertModeEvent(settings);

    expect(event.name).toBe('Expert Mode Event');
    expect(event.modifiers).toHaveLength(3);

    // Test main berry frequency modifier
    expect(event.modifiers[0].type).toBe('PokemonInstance');
    expect(event.modifiers[0].leftValue).toBe('pokemon.frequency');
    expect(event.modifiers[0].rightValue).toBe(0.9);
    expect(event.modifiers[0].conditions?.[0].rightValue).toBe(settings.mainFavoriteBerry.name);

    // Test skill percentage boost (since randomBonus is 'skill')
    expect(event.modifiers[2].leftValue).toBe('pokemon.skillPercentage');
    expect(event.modifiers[2].rightValue).toBe(1.25);
  });

  it('should support mixed static and dynamic modifiers', () => {
    const mixedEventBuilder = EventBuilder<{ multiplier: number }>()
      .name('Mixed Event')
      .description('Combines static and dynamic modifiers')

      // Static modifier
      .addModifier({
        type: 'PokemonInstance',
        leftValue: 'pokemon.skillPercentage',
        operation: '*',
        rightValue: 1.1
      })

      // Dynamic modifier factory
      .addModifier((input) => ({
        type: 'PokemonInstance',
        leftValue: 'pokemon.frequency',
        operation: '*',
        rightValue: input.multiplier
      }));

    const event1 = mixedEventBuilder.build({ multiplier: 0.8 });
    expect(event1.modifiers).toHaveLength(2);
    expect(event1.modifiers[0].rightValue).toBe(1.1); // Static value
    expect(event1.modifiers[1].rightValue).toBe(0.8); // Dynamic value from input

    const mixedEventFunction = mixedEventBuilder.build();
    const event2 = mixedEventFunction({ multiplier: 0.9 });
    expect(event2.modifiers).toHaveLength(2);
    expect(event2.modifiers[0].rightValue).toBe(1.1); // Static value
    expect(event2.modifiers[1].rightValue).toBe(0.9); // Dynamic value from input
  });
});
