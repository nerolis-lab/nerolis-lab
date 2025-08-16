/**
 * Copyright 2025 Neroli's Lab Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { ModifierEngine } from '../engine/modifier-engine.js';
import { EventBuilder } from '../builders/event-builder.js';
import { getActiveEvents } from '../events/predefined-events.js';
import { eventRunner } from '@src/services/simulation-service/events/event-runner.js';
import { preprocessTeamWithEvents } from '@src/services/simulation-service/events/simulation-integration.js';
import type { Event, EventContext } from 'sleepapi-common';

/**
 * Comprehensive examples showing how to use the event system
 * These tests serve as both documentation and validation
 */

describe('Event System Usage Examples', () => {
  let engine: ModifierEngine;

  beforeEach(() => {
    engine = new ModifierEngine({ debug: false });
  });

  describe('Creating Custom Events', () => {
    it('should create a simple stat boost event', async () => {
      // Example: Create an event that increases all Pokemon carry size by 2
      const carryBoostEvent = new EventBuilder(
        'carry-boost-event',
        'Carry Capacity Boost',
        'All Pokemon get +2 carry capacity'
      )
        .addPokemonModifier('carrySize', '+', 2)
        .withMetadata({
          category: 'special',
          rarity: 'common',
          tags: ['carry', 'boost']
        })
        .build();

      // Test the event
      const mockPokemon = {
        name: 'Pikachu',
        carrySize: 5,
        specialty: 'berry'
      };

      const context: EventContext = {
        pokemon: mockPokemon,
        timestamp: new Date()
      };

      const result = await engine.applyEvent(context, carryBoostEvent);

      expect(result.success).toBe(true);
      expect(result.appliedModifiers).toBe(1);
      expect(result.context.pokemon?.carrySize).toBe(7); // 5 + 2
    });

    it('should create a conditional event for specific Pokemon specialties', async () => {
      // Example: Event that only affects berry specialists
      const berrySpecialistEvent = new EventBuilder(
        'berry-specialist-bonus',
        'Berry Specialist Bonus',
        'Berry specialists get 15% frequency boost'
      )
        .addPokemonModifier('frequency', '*', 0.85, {
          conditions: [
            {
              type: 'equals',
              field: 'specialty',
              value: 'berry'
            }
          ]
        })
        .withMetadata({
          category: 'weekly',
          rarity: 'uncommon',
          tags: ['berry', 'specialist', 'frequency']
        })
        .build();

      // Test with berry specialist (should apply)
      const berryPokemon = {
        name: 'Charmander',
        specialty: 'berry',
        frequency: 2400
      };

      const berryContext: EventContext = {
        pokemon: berryPokemon,
        timestamp: new Date()
      };

      const berryResult = await engine.applyEvent(berryContext, berrySpecialistEvent);

      expect(berryResult.success).toBe(true);
      expect(berryResult.appliedModifiers).toBe(1);
      expect(berryResult.context.pokemon?.frequency).toBe(2040); // 2400 * 0.85

      // Test with non-berry specialist (should skip)
      const skillPokemon = {
        name: 'Alakazam',
        specialty: 'skill',
        frequency: 2400
      };

      const skillContext: EventContext = {
        pokemon: skillPokemon,
        timestamp: new Date()
      };

      const skillResult = await engine.applyEvent(skillContext, berrySpecialistEvent);

      expect(skillResult.success).toBe(true);
      expect(skillResult.appliedModifiers).toBe(0);
      expect(skillResult.skippedModifiers).toBe(1);
      expect(skillResult.context.pokemon?.frequency).toBe(2400); // Unchanged
    });

    it('should create a probability-based event', async () => {
      // Example: Event with 50% chance to apply
      const luckyEvent = new EventBuilder('lucky-bonus', 'Lucky Bonus', '50% chance for +3 carry size')
        .addPokemonModifier('carrySize', '+', 3, {
          probability: 0.5
        })
        .withMetadata({
          category: 'daily',
          rarity: 'rare',
          tags: ['luck', 'random']
        })
        .build();

      const mockPokemon = {
        name: 'Eevee',
        carrySize: 4
      };

      // Test with guaranteed success (random = 0.3 < 0.5)
      const successContext: EventContext = {
        pokemon: { ...mockPokemon },
        random: () => 0.3,
        timestamp: new Date()
      };

      const successResult = await engine.applyEvent(successContext, luckyEvent);

      expect(successResult.success).toBe(true);
      expect(successResult.appliedModifiers).toBe(1);
      expect(successResult.context.pokemon?.carrySize).toBe(7); // 4 + 3

      // Test with guaranteed failure (random = 0.7 > 0.5)
      const failContext: EventContext = {
        pokemon: { ...mockPokemon },
        random: () => 0.7,
        timestamp: new Date()
      };

      const failResult = await engine.applyEvent(failContext, luckyEvent);

      expect(failResult.success).toBe(true);
      expect(failResult.appliedModifiers).toBe(0);
      expect(failResult.skippedModifiers).toBe(1);
      expect(failResult.context.pokemon?.carrySize).toBe(4); // Unchanged
    });

    it('should create an event affecting ingredient amounts', async () => {
      // Example: Event that boosts ingredient production
      const ingredientHarvestEvent = new EventBuilder(
        'ingredient-harvest',
        'Bountiful Harvest',
        'All Pokemon get +1 ingredient amount at each level'
      )
        .addPokemonModifier('ingredient0.*.amount', '+', 1)
        .addPokemonModifier('ingredient30.*.amount', '+', 1)
        .addPokemonModifier('ingredient60.*.amount', '+', 1)
        .withMetadata({
          category: 'seasonal',
          rarity: 'epic',
          tags: ['ingredient', 'harvest', 'production']
        })
        .build();

      const mockPokemon = {
        name: 'Bulbasaur',
        specialty: 'ingredient',
        ingredient0: [{ ingredient: { name: 'Apple' }, amount: 2 }],
        ingredient30: [{ ingredient: { name: 'Apple' }, amount: 3 }],
        ingredient60: [{ ingredient: { name: 'Apple' }, amount: 4 }]
      };

      const context: EventContext = {
        pokemon: mockPokemon,
        timestamp: new Date()
      };

      const result = await engine.applyEvent(context, ingredientHarvestEvent);

      expect(result.success).toBe(true);
      expect(result.appliedModifiers).toBe(3); // One for each ingredient level
      expect(result.context.pokemon?.ingredient0[0].amount).toBe(3); // 2 + 1
      expect(result.context.pokemon?.ingredient30[0].amount).toBe(4); // 3 + 1
      expect(result.context.pokemon?.ingredient60[0].amount).toBe(5); // 4 + 1
    });

    it('should create a multi-condition event', async () => {
      // Example: Event for evolved Pokemon above level 25
      const evolutionMasteryEvent = new EventBuilder(
        'evolution-mastery',
        'Evolution Mastery',
        'Evolved Pokemon level 25+ get skill boost'
      )
        .addPokemonModifier('skillPercentage', '+', 10, {
          conditions: [
            {
              type: 'greater',
              field: 'previousEvolutions',
              value: 0
            },
            {
              type: 'greaterOrEqual',
              field: 'level',
              value: 25
            }
          ]
        })
        .withMetadata({
          category: 'special',
          rarity: 'legendary',
          tags: ['evolution', 'skill', 'level']
        })
        .build();

      // Test with evolved, high-level Pokemon (should apply)
      const evolvedPokemon = {
        name: 'Charizard',
        previousEvolutions: 2,
        level: 30,
        skillPercentage: 15
      };

      const evolvedContext: EventContext = {
        pokemon: evolvedPokemon,
        timestamp: new Date()
      };

      const evolvedResult = await engine.applyEvent(evolvedContext, evolutionMasteryEvent);

      expect(evolvedResult.success).toBe(true);
      expect(evolvedResult.appliedModifiers).toBe(1);
      expect(evolvedResult.context.pokemon?.skillPercentage).toBe(25); // 15 + 10

      // Test with unevolved Pokemon (should skip)
      const basePokemon = {
        name: 'Charmander',
        previousEvolutions: 0,
        level: 30,
        skillPercentage: 15
      };

      const baseContext: EventContext = {
        pokemon: basePokemon,
        timestamp: new Date()
      };

      const baseResult = await engine.applyEvent(baseContext, evolutionMasteryEvent);

      expect(baseResult.success).toBe(true);
      expect(baseResult.appliedModifiers).toBe(0);
      expect(baseResult.skippedModifiers).toBe(1);

      // Test with evolved but low-level Pokemon (should skip)
      const lowLevelPokemon = {
        name: 'Wartortle',
        previousEvolutions: 1,
        level: 20,
        skillPercentage: 15
      };

      const lowLevelContext: EventContext = {
        pokemon: lowLevelPokemon,
        timestamp: new Date()
      };

      const lowLevelResult = await engine.applyEvent(lowLevelContext, evolutionMasteryEvent);

      expect(lowLevelResult.success).toBe(true);
      expect(lowLevelResult.appliedModifiers).toBe(0);
      expect(lowLevelResult.skippedModifiers).toBe(1);
    });
  });

  describe('Working with Predefined Events', () => {
    it('should get currently active events', () => {
      // Example: Get events active on a specific date
      const januaryEvents = getActiveEvents(new Date('2025-01-15'));

      expect(Array.isArray(januaryEvents)).toBe(true);

      // Should include general events but not date-restricted ones
      const eventIds = januaryEvents.map((e: any) => e.id);
      expect(eventIds).toContain('ingredient-boost-2024');
      expect(eventIds).toContain('evolution-advantage');
      expect(eventIds).not.toContain('berry-frenzy-december'); // December only

      // Weekend events should only appear on weekends
      const sundayEvents = getActiveEvents(new Date('2025-01-12')); // Sunday
      const sundayEventIds = sundayEvents.map((e: any) => e.id);
      expect(sundayEventIds).toContain('weekend-boost');

      const wednesdayEvents = getActiveEvents(new Date('2025-01-15')); // Wednesday
      const wednesdayEventIds = wednesdayEvents.map((e: any) => e.id);
      expect(wednesdayEventIds).not.toContain('weekend-boost');
    });

    it('should apply predefined events to Pokemon', async () => {
      // Example: Apply ingredient specialist event
      const events = getActiveEvents();
      const ingredientEvent = events.find((e: any) => e.id === 'ingredient-boost-2024');

      expect(ingredientEvent).toBeDefined();

      const ingredientSpecialist = {
        name: 'Snorlax',
        specialty: 'ingredient',
        ingredient0: [{ ingredient: { name: 'Berry' }, amount: 2 }],
        ingredient30: [{ ingredient: { name: 'Berry' }, amount: 3 }],
        ingredient60: [{ ingredient: { name: 'Berry' }, amount: 4 }]
      };

      const context: EventContext = {
        pokemon: ingredientSpecialist,
        random: () => 0.3, // Guarantee 50% probability events trigger
        timestamp: new Date()
      };

      const result = await engine.applyEvent(context, ingredientEvent!);

      expect(result.success).toBe(true);
      expect(result.appliedModifiers).toBeGreaterThan(3); // Base +1 for all + specialist bonuses

      // All ingredient amounts should be increased
      expect(result.context.pokemon?.ingredient0[0].amount).toBeGreaterThan(2);
      expect(result.context.pokemon?.ingredient30[0].amount).toBeGreaterThan(3);
      expect(result.context.pokemon?.ingredient60[0].amount).toBeGreaterThan(4);
    });
  });

  describe('Team Integration Examples', () => {
    it('should apply events to a team using event runner', async () => {
      // Example: Create a mock team
      const mockTeam = [
        {
          pokemonWithIngredients: {
            pokemon: {
              name: 'Pikachu',
              specialty: 'berry',
              frequency: 2400,
              carrySize: 5,
              skillPercentage: 15
            },
            ingredientList: []
          },
          settings: {
            level: 25,
            ribbon: 0,
            carrySize: 5,
            skillLevel: 1,
            nature: { name: 'Adamant' },
            subskills: new Set(['Speed M']),
            externalId: 'pikachu-1'
          }
        },
        {
          pokemonWithIngredients: {
            pokemon: {
              name: 'Bulbasaur',
              specialty: 'ingredient',
              frequency: 3000,
              carrySize: 6,
              skillPercentage: 10
            },
            ingredientList: []
          },
          settings: {
            level: 30,
            ribbon: 1,
            carrySize: 6,
            skillLevel: 2,
            nature: { name: 'Modest' },
            subskills: new Set(['Ingredient M']),
            externalId: 'bulbasaur-1'
          }
        }
      ];

      const mockSettings = {
        wakeup: { hour: 6, minute: 0, second: 0 },
        bedtime: { hour: 21, minute: 30, second: 0 }
      };

      // Apply events to the team
      const { modifiedMembers, eventResults } = await eventRunner.applyEventsToTeam(
        mockTeam as any,
        mockSettings as any
      );

      expect(modifiedMembers).toHaveLength(2);
      expect(eventResults.length).toBeGreaterThan(0);

      // Check that some events were applied
      const totalAppliedModifiers = eventResults.reduce((sum: any, result: any) => sum + result.appliedModifiers, 0);
      expect(totalAppliedModifiers).toBeGreaterThan(0);

      // Original team should be unchanged
      expect(mockTeam[0].pokemonWithIngredients.pokemon.carrySize).toBe(5);

      // Modified team should potentially have changes
      const modifiedPikachu = modifiedMembers[0];
      expect(modifiedPikachu).toBeDefined();
    });

    it('should use simulation integration for preprocessing', async () => {
      // Example: Preprocess team with events before simulation
      const mockTeam = [
        {
          pokemonWithIngredients: {
            pokemon: {
              name: 'Charizard',
              specialty: 'berry',
              frequency: 2200,
              carrySize: 7,
              skillPercentage: 20,
              previousEvolutions: 2,
              remainingEvolutions: 0
            },
            ingredientList: []
          },
          settings: {
            level: 35,
            ribbon: 2,
            carrySize: 7,
            skillLevel: 3,
            nature: { name: 'Jolly' },
            subskills: new Set(['Berry S', 'Speed M']),
            externalId: 'charizard-1'
          }
        }
      ];

      const mockSettings = {
        wakeup: { hour: 6, minute: 0, second: 0 },
        bedtime: { hour: 22, minute: 0, second: 0 },
        camp: true
      };

      const result = await preprocessTeamWithEvents(mockTeam as any, mockSettings as any, {
        applyEvents: true,
        debug: false,
        eventTimestamp: new Date()
      });

      expect(result.eventsApplied).toBe(true);
      expect(result.processedMembers).toHaveLength(1);
      expect(result.eventsSummary.length).toBeGreaterThan(0);

      // Should have summary of applied events
      const successfulEvents = result.eventsSummary.filter((summary: any) => summary.success);
      expect(successfulEvents.length).toBeGreaterThan(0);
    });
  });

  describe('Event Scheduling and Recurrence', () => {
    it('should respect event date ranges', async () => {
      // Example: Create a time-limited event
      const holidayEvent = new EventBuilder('holiday-special', 'Holiday Special', 'Special holiday bonuses')
        .addPokemonModifier('carrySize', '+', 3)
        .addPokemonModifier('skillPercentage', '+', 5)
        .withSchedule(new Date('2024-12-20'), new Date('2025-01-05'))
        .withMetadata({
          category: 'seasonal',
          rarity: 'legendary',
          tags: ['holiday', 'special', 'limited']
        })
        .build();

      const mockPokemon = {
        name: 'Delibird',
        carrySize: 4,
        skillPercentage: 12
      };

      // Test during active period
      const activeContext: EventContext = {
        pokemon: { ...mockPokemon },
        timestamp: new Date('2024-12-25') // Christmas
      };

      const activeResult = await engine.applyEvent(activeContext, holidayEvent);

      expect(activeResult.success).toBe(true);
      expect(activeResult.appliedModifiers).toBe(2);
      expect(activeResult.context.pokemon?.carrySize).toBe(7); // 4 + 3
      expect(activeResult.context.pokemon?.skillPercentage).toBe(17); // 12 + 5

      // Test outside active period
      const inactiveContext: EventContext = {
        pokemon: { ...mockPokemon },
        timestamp: new Date('2025-02-01') // After event ends
      };

      const inactiveResult = await engine.applyEvent(inactiveContext, holidayEvent);

      expect(inactiveResult.success).toBe(true);
      expect(inactiveResult.appliedModifiers).toBe(0);
      expect(inactiveResult.warnings.length).toBeGreaterThan(0);
      expect(inactiveResult.warnings[0]).toContain('not active');
    });

    it('should handle recurring events', async () => {
      // Example: Create a daily event
      const dailyBonusEvent = new EventBuilder('daily-bonus', 'Daily Login Bonus', 'Daily rewards for active players')
        .addPokemonModifier('carrySize', '+', 1)
        .withRecurrence({
          type: 'daily',
          interval: 1
        })
        .withMetadata({
          category: 'daily',
          rarity: 'common',
          tags: ['daily', 'login', 'recurring']
        })
        .build();

      // This event should always be active (no date restrictions)
      const context: EventContext = {
        pokemon: { name: 'Pichu', carrySize: 3 },
        timestamp: new Date()
      };

      const result = await engine.applyEvent(context, dailyBonusEvent);

      expect(result.success).toBe(true);
      expect(result.appliedModifiers).toBe(1);
      expect(result.context.pokemon?.carrySize).toBe(4);
    });
  });

  describe('Advanced Event Scenarios', () => {
    it('should handle multiple events in sequence', async () => {
      // Example: Apply multiple events that stack
      const frequencyEvent = new EventBuilder('speed-boost', 'Speed Boost', '10% frequency improvement')
        .addPokemonModifier('frequency', '*', 0.9)
        .build();

      const carryEvent = new EventBuilder('capacity-boost', 'Capacity Boost', '+2 carry capacity')
        .addPokemonModifier('carrySize', '+', 2)
        .build();

      const skillEvent = new EventBuilder('skill-boost', 'Skill Boost', '+8% skill chance')
        .addPokemonModifier('skillPercentage', '+', 8)
        .build();

      const mockPokemon = {
        name: 'Lucario',
        frequency: 2000,
        carrySize: 6,
        skillPercentage: 18
      };

      const context: EventContext = {
        pokemon: mockPokemon,
        timestamp: new Date()
      };

      const events = [frequencyEvent, carryEvent, skillEvent];
      const results = await engine.applyEvents(context, events);

      expect(results).toHaveLength(3);
      expect(results.every((r: any) => r.success)).toBe(true);

      // Get the final context from the last result
      const finalContext = results[results.length - 1].context;

      expect(finalContext.pokemon?.frequency).toBe(1800); // 2000 * 0.9
      expect(finalContext.pokemon?.carrySize).toBe(8); // 6 + 2
      expect(finalContext.pokemon?.skillPercentage).toBe(26); // 18 + 8
    });

    it('should handle event conflicts and priorities', async () => {
      // Example: Events that modify the same property
      const smallBoostEvent = new EventBuilder('small-boost', 'Small Skill Boost', '+5 skill percentage')
        .addPokemonModifier('skillPercentage', '+', 5)
        .withMetadata({ priority: 1 })
        .build();

      const largeBoostEvent = new EventBuilder('large-boost', 'Large Skill Boost', '+15 skill percentage')
        .addPokemonModifier('skillPercentage', '+', 15)
        .withMetadata({ priority: 2 })
        .build();

      const context: EventContext = {
        pokemon: { name: 'Alakazam', skillPercentage: 20 },
        timestamp: new Date()
      };

      // Apply both events
      const results = await engine.applyEvents(context, [smallBoostEvent, largeBoostEvent]);

      expect(results).toHaveLength(2);
      expect(results.every((r: any) => r.success)).toBe(true);

      // Both should stack
      const finalContext = results[results.length - 1].context;
      expect(finalContext.pokemon?.skillPercentage).toBe(40); // 20 + 5 + 15
    });

    it('should demonstrate error handling and debugging', async () => {
      // Example: Event with invalid path
      const invalidEvent: Event = {
        id: 'invalid-event',
        name: 'Invalid Event',
        description: 'Event with invalid modifier path',
        modifiers: [
          {
            targetType: 'Pokemon',
            path: 'nonexistent.deeply.nested.property',
            operation: '+',
            value: 10
          }
        ],
        enabled: true
      };

      const context: EventContext = {
        pokemon: { name: 'Missingno' },
        timestamp: new Date()
      };

      // Create engine with debug mode for better error information
      const debugEngine = new ModifierEngine({ debug: true, strict: false });
      const result = await debugEngine.applyEvent(context, invalidEvent);

      expect(result.success).toBe(true); // Engine doesn't fail, just logs errors
      expect(result.appliedModifiers).toBe(0);
      expect(result.failedModifiers).toBe(1);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
