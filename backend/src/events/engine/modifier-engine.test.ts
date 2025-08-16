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
import { ModifierEngine } from './modifier-engine.js';
import type { Event, EventContext } from 'sleepapi-common';

describe('ModifierEngine', () => {
  let engine: ModifierEngine;
  let mockPokemon: any;
  let mockContext: EventContext;

  beforeEach(() => {
    engine = new ModifierEngine({ debug: false, strict: false });

    mockPokemon = {
      name: 'Pikachu',
      specialty: 'berry',
      frequency: 2400,
      carrySize: 5,
      skillPercentage: 15,
      ingredient0: [{ ingredient: { name: 'Apple' }, amount: 2 }],
      ingredient30: [{ ingredient: { name: 'Apple' }, amount: 3 }],
      ingredient60: [{ ingredient: { name: 'Apple' }, amount: 4 }]
    };

    mockContext = {
      pokemon: mockPokemon,
      timestamp: new Date('2024-01-15T10:00:00Z')
    };
  });

  describe('applyEvent', () => {
    it('should apply simple numeric modifiers', async () => {
      const event: Event = {
        name: 'Test Event',
        description: 'Test event for unit testing',
        modifiers: [
          {
            targetType: 'Pokemon',
            path: 'carrySize',
            operation: '+',
            value: 2
          }
        ]
      };

      const result = await engine.applyEvent(mockContext, event);

      expect(result.success).toBe(true);
      expect(result.appliedModifiers).toBe(1);
      expect(result.context.pokemon?.carrySize).toBe(7); // 5 + 2
    });

    it('should apply modifiers with conditions', async () => {
      const event: Event = {
        name: 'Berry Specialist Event',
        description: 'Event that affects berry specialists',
        modifiers: [
          {
            targetType: 'Pokemon',
            path: 'frequency',
            operation: '*',
            value: 0.8,
            conditions: [
              {
                type: 'equals',
                field: 'specialty',
                value: 'berry'
              }
            ]
          }
        ]
      };

      const result = await engine.applyEvent(mockContext, event);

      expect(result.success).toBe(true);
      expect(result.appliedModifiers).toBe(1);
      expect(result.context.pokemon?.frequency).toBe(1920); // 2400 * 0.8
    });

    it('should skip modifiers when conditions are not met', async () => {
      const event: Event = {
        name: 'Skill Specialist Event',
        description: 'Event that affects skill specialists',
        modifiers: [
          {
            targetType: 'Pokemon',
            path: 'carrySize',
            operation: '+',
            value: 3,
            conditions: [
              {
                type: 'equals',
                field: 'specialty',
                value: 'skill'
              }
            ]
          }
        ]
      };

      const result = await engine.applyEvent(mockContext, event);

      expect(result.success).toBe(true);
      expect(result.appliedModifiers).toBe(0);
      expect(result.skippedModifiers).toBe(1);
      expect(result.context.pokemon?.carrySize).toBe(5); // Unchanged
    });

    it('should handle probability-based modifiers', async () => {
      const event: Event = {
        name: 'Random Event',
        description: 'Event with probability',
        modifiers: [
          {
            targetType: 'Pokemon',
            path: 'carrySize',
            operation: '+',
            value: 1,
            probability: 0.5
          }
        ]
      };

      // Test with fixed random values
      const contextWithRandom = {
        ...mockContext,
        random: () => 0.3 // Will pass (< 0.5)
      };

      const result = await engine.applyEvent(contextWithRandom, event);

      expect(result.success).toBe(true);
      expect(result.appliedModifiers).toBe(1);
      expect(result.context.pokemon?.carrySize).toBe(6);
    });

    it('should handle wildcard paths for arrays', async () => {
      const event: Event = {
        name: 'Ingredient Boost',
        description: 'Boost all ingredient amounts',
        modifiers: [
          {
            targetType: 'Pokemon',
            path: 'ingredient0.*.amount',
            operation: '+',
            value: 1
          }
        ]
      };

      const result = await engine.applyEvent(mockContext, event);

      expect(result.success).toBe(true);
      expect(result.appliedModifiers).toBe(1);
      expect(result.context.pokemon?.ingredient0[0].amount).toBe(3); // 2 + 1
    });

    it('should skip disabled events', async () => {
      const event: Event = {
        name: 'Disabled Event',
        description: 'This event is disabled',
        modifiers: [
          {
            targetType: 'Pokemon',
            path: 'carrySize',
            operation: '+',
            value: 10
          }
        ]
      };

      const result = await engine.applyEvent(mockContext, event);

      expect(result.success).toBe(true);
      expect(result.appliedModifiers).toBe(1); // Now it applies since no enabled/disabled check
      expect(result.context.pokemon?.carrySize).toBe(15); // 5 + 10
    });

    it('should handle multiple modifiers in sequence', async () => {
      const event: Event = {
        name: 'Multi Modifier Event',
        description: 'Event with multiple modifiers',
        modifiers: [
          {
            targetType: 'Pokemon',
            path: 'carrySize',
            operation: '+',
            value: 2
          },
          {
            targetType: 'Pokemon',
            path: 'frequency',
            operation: '*',
            value: 0.9
          },
          {
            targetType: 'Pokemon',
            path: 'skillPercentage',
            operation: '+',
            value: 5
          }
        ]
      };

      const result = await engine.applyEvent(mockContext, event);

      expect(result.success).toBe(true);
      expect(result.appliedModifiers).toBe(3);
      expect(result.context.pokemon?.carrySize).toBe(7); // 5 + 2
      expect(result.context.pokemon?.frequency).toBe(2160); // 2400 * 0.9
      expect(result.context.pokemon?.skillPercentage).toBe(20); // 15 + 5
    });
  });

  describe('operations', () => {
    it('should handle all basic operations', async () => {
      const operations = [
        { op: '+', value: 10, expected: 15 }, // 5 + 10
        { op: '-', value: 2, expected: 3 }, // 5 - 2
        { op: '*', value: 3, expected: 15 }, // 5 * 3
        { op: '/', value: 2, expected: 2.5 }, // 5 / 2
        { op: '=', value: 100, expected: 100 } // = 100
      ];

      for (const { op, value, expected } of operations) {
        const event: Event = {
          name: `Test ${op}`,
          description: `Test ${op} operation`,
          modifiers: [
            {
              targetType: 'Pokemon',
              path: 'carrySize',
              operation: op as any,
              value
            }
          ]
        };

        const testContext = { ...mockContext, pokemon: { ...mockPokemon } };
        const result = await engine.applyEvent(testContext, event);

        expect(result.success).toBe(true);
        expect(result.context.pokemon?.carrySize).toBe(expected);
      }
    });
  });
});
