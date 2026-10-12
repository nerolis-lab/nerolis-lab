import type { TeamScheduleShift } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';
import { advanceIngredientSchedule } from './ingredient-schedule.js';

const shifts: TeamScheduleShift[] = [
  {
    slotIndex: 0,
    externalId: 'first',
    startTime: '06:00',
    type: 'ingredients',
    ingredientThresholds: [
      { name: 'a', minimum: 10, maximum: 20 },
      { name: 'b', minimum: 5, maximum: 15 }
    ]
  },
  {
    slotIndex: 0,
    externalId: 'second',
    startTime: '06:05',
    type: 'ingredients',
    ingredientThresholds: [{ name: 'c', minimum: 10, maximum: 30 }]
  },
  { slotIndex: 0, externalId: 'alternate', startTime: '06:10', type: 'ingredients' }
];

describe('ingredient rotation priority', () => {
  it.each([
    { bag: { a: 0, b: 0, c: 0 }, expected: 0 },
    { bag: { a: 10, b: 5, c: 0 }, expected: 1 },
    { bag: { a: 10, b: 4, c: 0 }, expected: 0 },
    { bag: { a: 10, b: 5, c: 10 }, expected: 0 },
    { bag: { a: 20, b: 14, c: 10 }, expected: 0 },
    { bag: { a: 20, b: 15, c: 10 }, expected: 1 },
    { bag: { a: 20, b: 15, c: 30 }, expected: 2 },
    { bag: { a: 20, b: 15, c: 9 }, expected: 1 }
  ])('selects member $expected for $bag', ({ bag, expected }) => {
    expect(advanceIngredientSchedule(shifts, (name) => bag[name as keyof typeof bag])).toBe(expected);
  });

  it('falls back to the first member when no explicit alternate exists', () => {
    expect(advanceIngredientSchedule(shifts.slice(0, 2), () => 100)).toBe(0);
  });

  it('rechecks minimums after cooking even while a higher-priority member is topping up', () => {
    const bag: Record<string, number> = { a: 12, b: 8, c: 11 };
    expect(advanceIngredientSchedule(shifts, (name) => bag[name])).toBe(0);
    bag.c = 9;
    expect(advanceIngredientSchedule(shifts, (name) => bag[name])).toBe(1);
    bag.c = 10;
    expect(advanceIngredientSchedule(shifts, (name) => bag[name])).toBe(0);
  });
});
