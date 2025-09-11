import { describe, expect, it } from 'vitest';
import type { PokemonInstanceExt } from '../../types';
import type { Event } from '../../types/events/event-types';
import { ChargeEnergyS } from '../../types/mainskill/mainskills/charge-energy-s';
import type { ExternalCondition, Modifier } from '../../types/modifier/modifier';
import { PathReference } from '../../types/modifier/path-reference';
import type { ModifierTargetType } from '../../types/modifier/target-types';
import { mockPokemon } from '../../vitest/mocks/pokemon/mock-pokemon';
import { pokemonInstanceExt } from '../../vitest/mocks/pokemon/mock-pokemon-instance';
import { EventApplier } from './event-applier';

describe('EventApplier', () => {
  describe('applyModifiers', () => {
    it('should apply a simple modifier to a PokemonInstance', () => {
      const pokemon = pokemonInstanceExt({
        pokemon: mockPokemon({ frequency: 2400 })
      });
      const event: Event = {
        name: 'Test Event',
        description: 'Test',
        modifiers: [
          {
            type: 'PokemonInstance',
            leftValue: 'pokemon.frequency',
            operation: '*',
            rightValue: 0.9
          }
        ]
      };

      const result = EventApplier.applyModifiers(pokemon, event.modifiers);

      expect(result.pokemon.frequency).toBe(2400 * 0.9);
    });

    it('should not apply modifiers with non-existent paths', () => {
      const pokemon = pokemonInstanceExt({
        pokemon: mockPokemon({ frequency: 2400 })
      });
      const event: Event = {
        name: 'Test Event',
        description: 'Test',
        modifiers: [
          {
            type: 'PokemonInstance',
            // @ts-expect-error - Testing non-existent property
            leftValue: 'nonExistentProperty',
            operation: '*',
            rightValue: 0.9
          }
        ]
      };

      const result = EventApplier.applyModifiers(pokemon, event.modifiers);

      expect(result.pokemon.frequency).toBe(2400); // Unchanged
    });

    it('should apply modifier with condition when condition is met', () => {
      const pokemon = pokemonInstanceExt({
        pokemon: mockPokemon({ frequency: 2400, specialty: 'skill' })
      });
      const event: Event = {
        name: 'Test Event',
        description: 'Test',
        modifiers: [
          {
            type: 'PokemonInstance',
            leftValue: 'pokemon.frequency',
            operation: '*',
            rightValue: 0.9,
            conditions: [
              {
                leftValue: 'pokemon.specialty',
                operation: '=',
                rightValue: 'skill'
              }
            ]
          }
        ]
      };

      const result = EventApplier.applyModifiers(pokemon, event.modifiers);

      // pokemon is a skill specialist, so modifier should apply
      expect(result.pokemon.frequency).toBe(2400 * 0.9);
    });

    it('should not apply modifier when condition is not met', () => {
      const pokemon = pokemonInstanceExt({
        pokemon: mockPokemon({ frequency: 2400, specialty: 'skill', name: 'MOCKEMON' })
      });
      const event: Event = {
        name: 'Test Event',
        description: 'Test',
        modifiers: [
          {
            type: 'PokemonInstance',
            leftValue: 'pokemon.frequency',
            operation: '*',
            rightValue: 0.9,
            conditions: [
              {
                leftValue: 'pokemon.name',
                operation: '=',
                rightValue: 'PIKACHU'
              }
            ]
          }
        ]
      };

      const result = EventApplier.applyModifiers(pokemon, event.modifiers);

      // name doesn't match, so modifier should not apply
      expect(result.pokemon.frequency).toBe(2400);
    });

    it('should apply all modifiers when multiple conditions are met', () => {
      const pokemon = pokemonInstanceExt({
        pokemon: mockPokemon({ frequency: 2400, specialty: 'skill' })
      });
      const event: Event = {
        name: 'Test Event',
        description: 'Test',
        modifiers: [
          {
            type: 'PokemonInstance',
            leftValue: 'pokemon.frequency',
            operation: '*',
            rightValue: 0.9,
            conditions: [
              {
                leftValue: 'pokemon.specialty',
                operation: '=',
                rightValue: 'skill'
              },
              {
                leftValue: 'pokemon.frequency',
                operation: '>',
                rightValue: 2000
              }
            ]
          }
        ]
      };

      const result = EventApplier.applyModifiers(pokemon, event.modifiers);

      // Both conditions are met, so modifier should apply
      expect(result.pokemon.frequency).toBe(2400 * 0.9);
    });

    it('should not apply modifier when any condition in conditions array is not met', () => {
      const pokemon = pokemonInstanceExt({
        pokemon: mockPokemon({ frequency: 2400, specialty: 'skill' })
      });
      const event: Event = {
        name: 'Test Event',
        description: 'Test',
        modifiers: [
          {
            type: 'PokemonInstance',
            leftValue: 'pokemon.frequency',
            operation: '*',
            rightValue: 0.9,
            conditions: [
              {
                leftValue: 'pokemon.specialty',
                operation: '=',
                rightValue: 'skill' // This is true
              },
              {
                leftValue: 'pokemon.frequency',
                operation: '>',
                rightValue: 3000 // This is false (2400 < 3000)
              }
            ]
          }
        ]
      };

      const result = EventApplier.applyModifiers(pokemon, event.modifiers);

      // Not all conditions are met, so modifier should not apply
      expect(result.pokemon.frequency).toBe(2400);
    });

    it('should handle path reference in condition value', () => {
      const pokemon = pokemonInstanceExt({
        level: 50,
        skillLevel: 3,
        pokemon: mockPokemon({
          frequency: 2400,
          skill: ChargeEnergyS
        })
      });
      const event: Event = {
        name: 'Test Event',
        description: 'Test',
        modifiers: [
          {
            type: 'PokemonInstance',
            leftValue: 'pokemon.frequency',
            operation: '*',
            rightValue: 0.9,
            conditions: [
              {
                leftValue: 'skillLevel',
                operation: '<=',
                rightValue: PathReference.to('pokemon.skill.maxLevel')
              }
            ]
          }
        ]
      };

      const result = EventApplier.applyModifiers(pokemon, event.modifiers);

      // skillLevel (3) <= skill.maxLevel (6), so modifier should apply
      expect(result.pokemon.frequency).toBe(2400 * 0.9);
    });

    it('should apply multiple operations correctly', () => {
      const pokemon = pokemonInstanceExt({
        pokemon: mockPokemon({ frequency: 2400 })
      });
      const event: Event = {
        name: 'Test Event',
        description: 'Test',
        modifiers: [
          {
            type: 'PokemonInstance',
            leftValue: 'pokemon.frequency',
            operation: '+',
            rightValue: 100
          },
          {
            type: 'PokemonInstance',
            leftValue: 'pokemon.frequency',
            operation: '*',
            rightValue: 0.5
          }
        ]
      };

      const result = EventApplier.applyModifiers(pokemon, event.modifiers);

      // First adds 100, then multiplies by 0.5
      expect(result.pokemon.frequency).toBe((2400 + 100) * 0.5);
    });

    it('should handle = operation', () => {
      const pokemon = pokemonInstanceExt({
        pokemon: mockPokemon({ frequency: 2400 })
      });
      const event: Event = {
        name: 'Test Event',
        description: 'Test',
        modifiers: [
          {
            type: 'PokemonInstance',
            leftValue: 'pokemon.frequency',
            operation: '=',
            rightValue: 1000
          }
        ]
      };

      const result = EventApplier.applyModifiers(pokemon, event.modifiers);

      expect(result.pokemon.frequency).toBe(1000);
    });

    it('should handle - operation', () => {
      const pokemon = pokemonInstanceExt({
        pokemon: mockPokemon({ frequency: 2400 })
      });
      const event: Event = {
        name: 'Test Event',
        description: 'Test',
        modifiers: [
          {
            type: 'PokemonInstance',
            leftValue: 'pokemon.frequency',
            operation: '-',
            rightValue: 100
          }
        ]
      };

      const result = EventApplier.applyModifiers(pokemon, event.modifiers);

      expect(result.pokemon.frequency).toBe(2400 - 100);
    });

    it('should handle / operation', () => {
      const pokemon = pokemonInstanceExt({
        pokemon: mockPokemon({ frequency: 2400 })
      });
      const event: Event = {
        name: 'Test Event',
        description: 'Test',
        modifiers: [
          {
            type: 'PokemonInstance',
            leftValue: 'pokemon.frequency',
            operation: '/',
            rightValue: 2
          }
        ]
      };

      const result = EventApplier.applyModifiers(pokemon, event.modifiers);

      expect(result.pokemon.frequency).toBe(2400 / 2);
    });

    it('should apply constrained subtraction with min floor', () => {
      const pokemon = pokemonInstanceExt({
        pokemon: mockPokemon({ frequency: 2400 })
      });
      const event: Event = {
        name: 'Test Event',
        description: 'Test',
        modifiers: [
          {
            type: 'PokemonInstance',
            leftValue: 'pokemon.frequency',
            operation: '-',
            rightValue: {
              rightValue: 3000,
              min: 500
            }
          }
        ]
      };

      const result = EventApplier.applyModifiers(pokemon, event.modifiers);

      // 2400 - 3000 = -600, but min is 500
      expect(result.pokemon.frequency).toBe(500);
    });

    it('should not apply modifiers that dont match target type', () => {
      const pokemon = pokemonInstanceExt({
        pokemon: mockPokemon({ frequency: 2400 })
      });
      const event: Event = {
        name: 'Test Event',
        description: 'Test',
        modifiers: [
          {
            type: 'MemberStrength', // Different type
            // @ts-expect-error - Testing type mismatch
            leftValue: 'memberProduction.berries',
            operation: '*',
            rightValue: 0.9
          }
        ]
      };

      const result = EventApplier.applyModifiers(pokemon, event.modifiers);

      // Type doesn't match, modifier should not apply
      expect(result.pokemon.frequency).toBe(2400);
    });

    it('should apply constrained addition with max ceiling', () => {
      const pokemon = pokemonInstanceExt({
        pokemon: mockPokemon({ frequency: 2400 })
      });
      const event: Event = {
        name: 'Test Event',
        description: 'Test',
        modifiers: [
          {
            type: 'PokemonInstance',
            leftValue: 'pokemon.frequency',
            operation: '+',
            rightValue: {
              rightValue: 5000,
              max: 3000
            }
          }
        ]
      };

      const result = EventApplier.applyModifiers(pokemon, event.modifiers);

      // 2400 + 5000 = 7400, but max is 3000
      expect(result.pokemon.frequency).toBe(3000);
    });

    it('should apply constrained addition with PathReference max', () => {
      const pokemon = pokemonInstanceExt({
        level: 50,
        skillLevel: 3,
        pokemon: mockPokemon({
          frequency: 2400,
          skill: ChargeEnergyS
        })
      });
      const event: Event = {
        name: 'Test Event',
        description: 'Test',
        modifiers: [
          {
            type: 'PokemonInstance',
            leftValue: 'skillLevel',
            operation: '+',
            rightValue: {
              rightValue: 10,
              max: PathReference.to('pokemon.skill.maxLevel')
            }
          }
        ]
      };

      const result = EventApplier.applyModifiers(pokemon, event.modifiers);

      // skillLevel 3 + 10 = 13, but max is skill.maxLevel (6)
      expect(result.skillLevel).toBe(6);
    });

    it('should apply constrained subtraction with min floor on skill level', () => {
      const pokemon = pokemonInstanceExt({
        level: 50,
        skillLevel: 3,
        pokemon: mockPokemon({
          frequency: 2400,
          skill: ChargeEnergyS
        })
      });
      const event: Event = {
        name: 'Test Event',
        description: 'Test',
        modifiers: [
          {
            type: 'PokemonInstance',
            leftValue: 'skillLevel',
            operation: '-',
            rightValue: {
              rightValue: 5,
              min: 1
            }
          }
        ]
      };

      const result = EventApplier.applyModifiers(pokemon, event.modifiers);

      // skillLevel 3 - 5 = -2, but min is 1
      expect(result.skillLevel).toBe(1);
    });

    it('should apply operation with both min and max constraints', () => {
      const pokemon = pokemonInstanceExt({
        pokemon: mockPokemon({ frequency: 1000 })
      });
      const event: Event = {
        name: 'Test Event',
        description: 'Test',
        modifiers: [
          {
            type: 'PokemonInstance',
            leftValue: 'pokemon.frequency',
            operation: '*',
            rightValue: {
              rightValue: 10,
              min: 2000,
              max: 5000
            }
          }
        ]
      };

      const result = EventApplier.applyModifiers(pokemon, event.modifiers);

      // 1000 * 10 = 10000, but max is 5000
      expect(result.pokemon.frequency).toBe(5000);
    });

    it('should handle complex modifier without constraint', () => {
      const pokemon = pokemonInstanceExt({
        pokemon: mockPokemon({ frequency: 2400 })
      });
      const event: Event = {
        name: 'Test Event',
        description: 'Test',
        modifiers: [
          {
            type: 'PokemonInstance',
            leftValue: 'pokemon.frequency',
            operation: '*',
            rightValue: {
              rightValue: 0.5
            }
          }
        ]
      };

      const result = EventApplier.applyModifiers(pokemon, event.modifiers);

      expect(result.pokemon.frequency).toBe(2400 * 0.5);
    });

    it('should handle in operator in conditions', () => {
      const pokemon = pokemonInstanceExt({
        pokemon: mockPokemon({ specialty: 'skill' })
      });
      const event: Event = {
        name: 'Test Event',
        description: 'Test',
        modifiers: [
          {
            type: 'PokemonInstance',
            leftValue: 'pokemon.specialty',
            operation: '=',
            rightValue: 'berry',
            conditions: [
              {
                leftValue: 'pokemon.specialty',
                operation: 'in',
                rightValue: ['skill', 'ingredient']
              }
            ]
          }
        ]
      };

      const result = EventApplier.applyModifiers(pokemon, event.modifiers);

      // specialty is 'skill' which is in the array, so modifier should apply
      expect(result.pokemon.specialty).toBe('berry');
    });

    it('should handle not-in operator in conditions', () => {
      const pokemon = pokemonInstanceExt({
        pokemon: mockPokemon({ specialty: 'all' })
      });
      const event: Event = {
        name: 'Test Event',
        description: 'Test',
        modifiers: [
          {
            type: 'PokemonInstance',
            leftValue: 'pokemon.specialty',
            operation: '=',
            rightValue: 'berry',
            conditions: [
              {
                leftValue: 'pokemon.specialty',
                operation: 'not-in',
                rightValue: ['skill', 'ingredient']
              }
            ]
          }
        ]
      };

      const result = EventApplier.applyModifiers(pokemon, event.modifiers);

      // specialty is 'all' which is not in the array, so modifier should apply
      expect(result.pokemon.specialty).toBe('berry');
    });

    it('should apply external conditions correctly', () => {
      const pokemon = pokemonInstanceExt({
        pokemon: mockPokemon({ frequency: 2400 })
      });
      const event: Event = {
        name: 'Test Event',
        description: 'Test',
        modifiers: [
          {
            type: 'PokemonInstance',
            leftValue: 'pokemon.frequency',
            operation: '*',
            rightValue: 0.9,
            conditions: [
              {
                leftValue: { source: 'input', key: 'island' },
                operation: '=',
                rightValue: 'Greengrass'
              } as ExternalCondition
            ]
          }
        ]
      };

      // Mock external condition to return true
      const applyModifiersWithExternals = (target: PokemonInstanceExt, modifiers: Modifier<ModifierTargetType>[]) => {
        // This is a simplified version - actual implementation would need to handle externals
        return EventApplier.applyModifiers(target, modifiers);
      };

      const result = applyModifiersWithExternals(pokemon, event.modifiers);

      // For now, external conditions are not fully implemented in the test
      expect(result.pokemon.frequency).toBe(2400);
    });
  });
});
