import { describe, expect, it } from 'vitest';
import { commonMocks as mocks } from '../../vitest';
import type { Event } from './event-types';

describe('Event types', () => {
  it('should create a valid event with all properties', () => {
    const event = mocks.event();

    expect(event).toBeDefined();
    expect(event.name).toBe('Test Event');
    expect(event.description).toBe('Test event description');
    expect(event.modifiers).toHaveLength(1);
    expect(event.startDate).toBeInstanceOf(Date);
    expect(event.endDate).toBeInstanceOf(Date);
    expect(event.createdBy).toBe('test-user-123');
    expect(event.createdAt).toBeInstanceOf(Date);
    expect(event.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a minimal event without optional properties', () => {
    const event: Event = {
      name: 'Minimal Event',
      description: 'Minimal description',
      modifiers: []
    };

    expect(event.name).toBe('Minimal Event');
    expect(event.description).toBe('Minimal description');
    expect(event.modifiers).toEqual([]);
    expect(event.startDate).toBeUndefined();
    expect(event.endDate).toBeUndefined();
    expect(event.createdBy).toBeUndefined();
    expect(event.createdAt).toBeUndefined();
    expect(event.updatedAt).toBeUndefined();
  });

  it('should override default properties with custom attributes', () => {
    const customDate = new Date('2024-01-01');
    const event = mocks.event({
      name: 'Custom Event',
      description: 'Custom description',
      startDate: customDate,
      endDate: customDate,
      createdBy: 'custom-user'
    });

    expect(event.name).toBe('Custom Event');
    expect(event.description).toBe('Custom description');
    expect(event.startDate).toEqual(customDate);
    expect(event.endDate).toEqual(customDate);
    expect(event.createdBy).toBe('custom-user');
  });

  it('should handle multiple modifiers', () => {
    const modifiers = [
      mocks.serializableModifier({ path: 'frequency', value: 0.9 }),
      mocks.serializableModifier({ path: 'skillChance', value: 1.2 }),
      mocks.serializableModifier({ path: 'ingredientChance', value: 0.8 })
    ];

    const event = mocks.event({ modifiers });

    expect(event.modifiers).toHaveLength(3);
    expect(event.modifiers[0].path).toBe('frequency');
    expect(event.modifiers[1].path).toBe('skillChance');
    expect(event.modifiers[2].path).toBe('ingredientChance');
  });

  it('should handle events with no modifiers', () => {
    const event = mocks.event({ modifiers: [] });

    expect(event.modifiers).toEqual([]);
    expect(event.modifiers).toHaveLength(0);
  });

  it('should validate date ordering when both dates are provided', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');

    const event = mocks.event({
      startDate,
      endDate
    });

    expect(event.startDate!.getTime()).toBeLessThan(event.endDate!.getTime());
  });

  it('should handle events with only start date', () => {
    const startDate = new Date('2024-01-01');

    const event = mocks.event({
      startDate,
      endDate: undefined
    });

    expect(event.startDate).toEqual(startDate);
    expect(event.endDate).toBeUndefined();
  });

  it('should handle events with only end date', () => {
    const endDate = new Date('2024-12-31');

    const event = mocks.event({
      startDate: undefined,
      endDate
    });

    expect(event.startDate).toBeUndefined();
    expect(event.endDate).toEqual(endDate);
  });

  it('should handle different modifier operations', () => {
    const modifiers = [
      mocks.serializableModifier({ operation: '+', value: 10 }),
      mocks.serializableModifier({ operation: '-', value: 5 }),
      mocks.serializableModifier({ operation: '*', value: 1.5 }),
      mocks.serializableModifier({ operation: '/', value: 2 }),
      mocks.serializableModifier({ operation: '=', value: 100 })
    ];

    const event = mocks.event({ modifiers });

    expect(event.modifiers[0].operation).toBe('+');
    expect(event.modifiers[1].operation).toBe('-');
    expect(event.modifiers[2].operation).toBe('*');
    expect(event.modifiers[3].operation).toBe('/');
    expect(event.modifiers[4].operation).toBe('=');
  });

  it('should handle modifiers with different paths', () => {
    const modifier = mocks.serializableModifier({
      path: 'berry.power',
      operation: '+',
      value: 10
    });

    const event = mocks.event({ modifiers: [modifier] });

    expect(event.modifiers[0].path).toBe('berry.power');
    expect(event.modifiers[0].operation).toBe('+');
    expect(event.modifiers[0].value).toBe(10);
  });

  it('should handle modifiers for different attributes', () => {
    const modifiers = [
      mocks.serializableModifier({ path: 'frequency', value: 0.9 }),
      mocks.serializableModifier({ path: 'level', value: 5 })
    ];

    const event = mocks.event({ modifiers });

    expect(event.modifiers[0].path).toBe('frequency');
    expect(event.modifiers[1].path).toBe('level');
  });

  it('should handle events with metadata timestamps', () => {
    const createdAt = new Date('2024-01-01T10:00:00Z');
    const updatedAt = new Date('2024-01-02T15:30:00Z');

    const event = mocks.event({
      createdAt,
      updatedAt
    });

    expect(event.createdAt).toEqual(createdAt);
    expect(event.updatedAt).toEqual(updatedAt);
    expect(event.updatedAt!.getTime()).toBeGreaterThan(event.createdAt!.getTime());
  });

  describe('Modifier value types in events', () => {
    it('should handle different value types for modifiers', () => {
      const modifiers = [
        mocks.serializableModifier({ path: 'frequency', value: 2400 }), // number
        mocks.serializableModifier({ path: 'displayName', value: 'Pikachu' }), // string
        mocks.serializableModifier({ path: 'specialty', value: 'berry' }), // union type
        mocks.serializableModifier({ path: 'berry.power', value: 30 }), // nested number
        mocks.serializableModifier({ path: 'berry.name', value: 'Oran Berry' }), // nested string
        mocks.serializableModifier({ path: 'ingredient0.*.amount', value: 3 }) // array wildcard
      ];

      const event = mocks.event({ modifiers });

      expect(event.modifiers).toHaveLength(6);
      expect(event.modifiers[0].value).toBe(2400);
      expect(event.modifiers[1].value).toBe('Pikachu');
      expect(event.modifiers[2].value).toBe('berry');
      expect(event.modifiers[3].value).toBe(30);
      expect(event.modifiers[4].value).toBe('Oran Berry');
      expect(event.modifiers[5].value).toBe(3);
    });

    it('should handle modifiers with conditions and different value types', () => {
      const modifierWithCondition = mocks.mockModifierWithCondition({
        path: 'berry.power',
        value: 35, // number
        condition: {
          path: 'specialty',
          operation: '=',
          value: 'berry' // string
        }
      });

      const event = mocks.event({ modifiers: [modifierWithCondition] });

      expect(event.modifiers[0].value).toBe(35);
      expect(event.modifiers[0].condition?.value).toBe('berry');
    });

    it('should handle array values in conditions', () => {
      const modifierWithArrayCondition = mocks.mockModifierWithCondition({
        path: 'frequency',
        value: 0.9,
        condition: {
          path: 'specialty',
          operation: 'in',
          value: ['berry', 'skill'] // array of strings
        }
      });

      const event = mocks.event({ modifiers: [modifierWithArrayCondition] });

      expect(event.modifiers[0].value).toBe(0.9);
      expect(event.modifiers[0].condition?.value).toEqual(['berry', 'skill']);
    });

    it('should handle numeric array conditions', () => {
      const modifierWithNumericArray = mocks.mockModifierWithCondition({
        path: 'skillPercentage',
        value: 0.15,
        condition: {
          path: 'carrySize',
          operation: 'in',
          value: [15, 20, 25] // array of numbers
        }
      });

      const event = mocks.event({ modifiers: [modifierWithNumericArray] });

      expect(event.modifiers[0].value).toBe(0.15);
      expect(event.modifiers[0].condition?.value).toEqual([15, 20, 25]);
    });

    it('should handle PokemonInstance modifiers in events', () => {
      const instanceModifiers = [
        mocks.serializableModifier({ path: 'level', value: 50 }),
        mocks.serializableModifier({ path: 'ribbon', value: 2 }),
        mocks.serializableModifier({ path: 'skillLevel', value: 6 }),
        mocks.serializableModifier({ path: 'pokemon', value: 'pikachu' }),
        mocks.serializableModifier({ path: 'ingredients.0.amount', value: 4 })
      ];

      const event = mocks.event({ modifiers: instanceModifiers });

      expect(event.modifiers[0].value).toBe(50);
      expect(event.modifiers[1].value).toBe(2);
      expect(event.modifiers[2].value).toBe(6);
      expect(event.modifiers[3].value).toBe('pikachu');
      expect(event.modifiers[4].value).toBe(4);
    });
  });
});
